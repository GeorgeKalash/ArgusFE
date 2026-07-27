import { useContext, useState, useMemo, useCallback, useEffect, useRef } from 'react'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import RPBGridToolbar from '@argus/shared-ui/src/components/Shared/RPBGridToolbar'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import CatalogueForm from './Forms/CatalogueForm'
import CatalogueCheckout from './Forms/CatalogueCheckout'
import { Box, IconButton, Tooltip, Typography, Button, Badge } from '@mui/material'
import ViewListIcon from '@mui/icons-material/ViewList'
import { Grid, TextField } from '@mui/material'
import GridViewIcon from '@mui/icons-material/GridView'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import FirstPageIcon from '@mui/icons-material/FirstPage'
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import LastPageIcon from '@mui/icons-material/LastPage'
import RefreshIcon from '@mui/icons-material/Refresh'
import { SaleRepository } from '@argus/repositories/src/repositories/SaleRepository'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import { formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'

const newLineId = () => `${Date.now()}-${Math.random()}`

const newLine = (qty = 1) => ({
  lineId: newLineId(),
  qty,
  isSpecialOrder: false,
  notes: '',
  expectedDeliveryDays: null,
})

const QtyStepper = ({ id, qty, onInc, onDec, onChangeQty, canAdd }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
    <IconButton size='small' onClick={e => { e.stopPropagation(); onDec(id) }} disabled={qty === 0 || !canAdd}>
      <RemoveIcon sx={{ fontSize: 14 }} />
    </IconButton>
    <TextField
      size='small'
      value={qty}
      disabled={!canAdd}
      onClick={e => e.stopPropagation()}
      onChange={e => {
        const value = parseInt(e.target.value || 0, 10)
        onChangeQty(id, isNaN(value) ? 0 : value)
      }}
      inputProps={{ min: 0, style: { textAlign: 'center', padding: '4px', width: '40px' } }}
    />
    <IconButton size='small' onClick={e => { e.stopPropagation(); onInc(id) }} disabled={!canAdd}>
      <AddIcon sx={{ fontSize: 14 }} />
    </IconButton>
  </Box>
)

const ProductCard = ({ row, cart, onInc, onDec, labels, canAdd, setQty }) => {
  const id    = row.itemId
  const entry = cart[id]
  const q     = entry ? entry.lines.reduce((s, l) => s + l.qty, 0) : 0
  const inCart = q > 0

  return (
    <Box sx={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.75,
      p: '12px 10px', borderRadius: 2, cursor: 'default',
      border: '1px solid', borderColor: inCart ? 'primary.main' : 'divider',
      boxShadow: inCart ? '0 0 0 3px rgba(25,118,210,0.08)' : 'none',
      bgcolor: 'background.paper', transition: 'border-color .15s, box-shadow .15s',
    }}>
      <Box sx={{ width: 68, height: 68, borderRadius: 1.5, overflow: 'hidden', bgcolor: 'grey.100', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {row.pictureUrl
          ? <img src={row.pictureUrl} alt={row.name || ''} style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={e => { e.currentTarget.style.display = 'none' }} />
          : <GridViewIcon sx={{ fontSize: 30, color: 'grey.400' }} />}
      </Box>

      <Typography variant='caption' sx={{ color: 'text.secondary', fontSize: 10 }}>{row.sku}</Typography>
      <Typography variant='body2' sx={{ fontWeight: 600, fontSize: 12, textAlign: 'center', lineHeight: 1.3 }}>{row.name}</Typography>
      <Typography variant='caption' sx={{ color: 'text.secondary', fontSize: 10, textAlign: 'center' }}>
        {[row.groupName, row.categoryName].filter(Boolean).join(' · ')}
      </Typography>
      <Typography variant='caption' sx={{ color: 'text.secondary', fontSize: 10 }}>{labels.onHand}: {row.onHand}</Typography>
      <Typography variant='caption' sx={{ color: 'text.secondary', fontSize: 10 }}>
        {labels.price}: {row.unitPrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {row.currencyRef}
      </Typography>

      <QtyStepper id={id} qty={q} onInc={onInc} onDec={onDec} onChangeQty={setQty} canAdd={canAdd} />
    </Box>
  )
}

const Catalogue = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)

  const [view,   setView]   = useState('grid')
  const [cart,   setCart]   = useState({})  
  const [orderDate, setOrderDate] = useState(null)
  const [values, setValues] = useState({ clientId: null, clientRef: '', clientName: '' })
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  const updateLine = useCallback((itemId, lineId, patch) => {
    setCart(c => {
      const item = c[itemId]
      if (!item) return c
      return {
        ...c,
        [itemId]: {
          ...item,
          lines: item.lines.map(l => l.lineId === lineId ? { ...l, ...patch } : l)
        }
      }
    })
  }, [])

  const removeLine = useCallback((itemId, lineId) => {
    setCart(c => {
      const item = c[itemId]
      if (!item) return c
      const lines = item.lines.filter(l => l.lineId !== lineId)
      if (lines.length === 0) {
        const copy = { ...c }; delete copy[itemId]; return copy
      }
      return { ...c, [itemId]: { ...item, lines } }
    })
  }, [])

  const addLine = useCallback(itemId => {
    setCart(c => {
      const item = c[itemId]
      if (!item) return c
      return { ...c, [itemId]: { ...item, lines: [...item.lines, newLine(1)] } }
    })
  }, [])

  const removeItem = useCallback(itemId => {
    setCart(c => { const n = { ...c }; delete n[itemId]; return n })
  }, [])

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params } = options
    let response = null

    if (view === 'grid') {
      response = await getRequest({
        extension: InventoryRepository.Catalogue.page,
        parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=${params || ''}`
      })
    }
    if (view === 'icons') {
      response = await getRequest({
        extension: InventoryRepository.CatalogueSummary.summary,
        parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=${params || ''}&_clientId=${values.clientId || 0}`
      })
    }

    if (response?.list) {
      response.list = response.list.map(item => ({
        ...item,
        onHand: parseFloat(item?.onHand).toFixed(3)
      }))
    }

    return { ...response, _startAt }
  }

  async function fetchWithFilter({ filters, pagination }) {
    if (filters?.qry) {
      return await getRequest({
        extension: view === 'grid' ? InventoryRepository.Catalogue.snapshot : InventoryRepository.CatalogueSummary.snapshot,
        parameters: view === 'grid' ? `_filter=${filters.qry}` : `_filter=${filters.qry}&_clientId=${values.clientId || 0}`
      })
    }
    return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
  }

  const {
    query: { data },
    labels,
    paginationParameters,
    refetch,
    access,
    filterBy
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: view === 'grid' ? InventoryRepository.Catalogue.page : InventoryRepository.CatalogueSummary.summary,
    datasetId: ResourceIds.Catalogue,
    filter: { filterFn: fetchWithFilter }
  })


  const rowsRef = useRef([])
  const rows = data?.list ?? [] 
  rowsRef.current = rows

  const inc = useCallback(id => {
    setCart(c => {
      const existing = c[id]
      if (existing) {
        const lines = existing.lines.map((l, i) => i === 0 ? { ...l, qty: l.qty + 1 } : l)
        return { ...c, [id]: { ...existing, lines } }
      }
      const product = rowsRef.current.find(r => r.itemId === id)
      if (!product) return c
      return { ...c, [id]: { ...product, lines: [newLine(1)] } }
    })
  }, [])

  const setQty = useCallback((id, qty) => {
    setCart(c => {
      if (qty <= 0) {
        const copy = { ...c }; delete copy[id]; return copy
      }
      const existing = c[id]
      if (existing) {
        const lines = existing.lines.map((l, i) => i === 0 ? { ...l, qty } : l)
        return { ...c, [id]: { ...existing, lines } }
      }
      const product = rowsRef.current.find(r => r.itemId === id)
      if (!product) return c
      return { ...c, [id]: { ...product, lines: [newLine(qty)] } }
    })
  }, [])

  const dec = useCallback(id => {
    setCart(c => {
      const existing = c[id]
      if (!existing) return c
      const firstLine = existing.lines[0]
      if (!firstLine) return c

      if (firstLine.qty === 1 && existing.lines.length === 1) {
        const copy = { ...c }; delete copy[id]; return copy
      }
      if (firstLine.qty === 1) {
        return { ...c, [id]: { ...existing, lines: existing.lines.slice(1) } }
      }
      const lines = existing.lines.map((l, i) => i === 0 ? { ...l, qty: l.qty - 1 } : l)
      return { ...c, [id]: { ...existing, lines } }
    })
  }, [])


  const columns = [
    { field: 'pictureUrl',   headerName: '',              type: 'image',  flex: 0.5 },
    { field: 'sku',          headerName: labels.sku,                       flex: 1   },
    { field: 'name',         headerName: labels.name,                      flex: 1   },
    { field: 'groupName',    headerName: labels.group,                     flex: 1   },
    { field: 'categoryName', headerName: labels.category,                  flex: 1   },
    { field: 'onHand',       headerName: labels.onHand,   type: 'number',  flex: 1   },
  ]

  const edit = obj => stack({
    Component: CatalogueForm,
    props: { labels, maxAccess: access, record: obj },
    width: 1000, height: 600,
    title: labels.Catalogue
  })

  const cartItems = useMemo(() => Object.values(cart), [cart])

  const flatCartLines = useMemo(() => {
    let seqNo = 0
    return cartItems.flatMap(item =>
      item.lines.map(line => ({
        itemId: item.itemId,
        sku: item.sku,
        name: item.name,
        unitPrice: item.unitPrice,
        currencyRef: item.currencyRef,
        qty: line.qty,
        isSpecialOrder: line.isSpecialOrder,
        notes: line.notes,
        expectedDeliveryDays: line.expectedDeliveryDays,
        seqNo: ++seqNo,
      }))
    )
  }, [cartItems])

  const cartCount   = flatCartLines.reduce((s, l) => s + l.qty, 0)
  const cartTotal   = flatCartLines.reduce((s, l) => s + (parseFloat(l.unitPrice) || 0) * l.qty, 0)
  const currencyRef = cartItems[0]?.currencyRef || ''

  const pageSize  = 50
  const startAt   = data?._startAt ?? 0
  const total     = data?.count    ?? 0
  const page      = Math.ceil(total ? (startAt === 0 ? 1 : (startAt + 1) / pageSize) : 1)
  const pageCount = Math.ceil(total ? total / pageSize : 1)

  const goFirst = () => paginationParameters({ _startAt: 0,                          _pageSize: pageSize })
  const goPrev  = () => paginationParameters({ _startAt: (page - 2) * pageSize,      _pageSize: pageSize })
  const goNext  = () => paginationParameters({ _startAt: page * pageSize,            _pageSize: pageSize })
  const goLast  = () => paginationParameters({ _startAt: (pageCount - 1) * pageSize, _pageSize: pageSize })

  async function handleSaveBasket() {
    await postRequest({
      extension: SaleRepository.SalesBasket.set2,
      record: JSON.stringify({
        header: { clientId: values.clientId, qty: cartCount, amount: cartTotal, date: formatDateToApi(new Date()) },
        items: flatCartLines
      })
    })
    toast.success(platformLabels.BasketUpdated)
  }

  async function handleGenerateOrder() {
    const invalidLines = flatCartLines.filter(l => l.isSpecialOrder && !l.notes?.trim())
    if (invalidLines.length > 0) {
      toast.error('Please fill notes for all special order lines')
      return
    }

    await postRequest({
      extension: SaleRepository.SalesOrder.generate,
      record: JSON.stringify({
        header: { clientId: values.clientId, qty: cartCount, amount: cartTotal, date: orderDate || formatDateToApi(new Date()) },
        items: flatCartLines
      })
    })
    toast.success(platformLabels.OrderGenerated)
    setCheckoutOpen(false)
    setCart({})
  }

  async function getClientBasket(clientId) {
    if (!clientId) return

    const response = await getRequest({
      extension: SaleRepository.SalesBasket.get2,
      parameters: `_clientId=${clientId}`
    })

    const list = response?.record?.items
    setOrderDate(response?.record?.header?.date || null)
    if (!list?.length) return

    const grouped = {}
    list.forEach(item => {
      if (!grouped[item.itemId]) {
        grouped[item.itemId] = {
          ...item,
          name: item.itemName || item.name,
          lines: []
        }
      }
      grouped[item.itemId].lines.push({
        lineId: newLineId(),
        qty: item.qty ?? 1,
        isSpecialOrder: item.isSpecialOrder || false,
        notes: item.notes || '',
        expectedDeliveryDays: item.expectedDeliveryDays || null,
      })
    })

    setCart(grouped)
  }

  useEffect(() => {
    if (view === 'icons') refetch()
  }, [values.clientId])

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar maxAccess={access} reportName={'IVIT'} filterBy={filterBy} previewReport={ResourceIds.Catalogue} />

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1, py: 0.5, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Tooltip title={labels.gridView}>
              <IconButton size='small' onClick={() => setView('grid')} sx={{ borderRadius: 1, bgcolor: view === 'grid' ? 'primary.main' : 'transparent', color: view === 'grid' ? '#fff' : 'action.active', '&:hover': { bgcolor: view === 'grid' ? 'primary.dark' : 'action.hover' } }}>
                <ViewListIcon fontSize='small' />
              </IconButton>
            </Tooltip>
            <Tooltip title={labels.iconsView}>
              <IconButton size='small' onClick={() => setView('icons')} sx={{ borderRadius: 1, bgcolor: view === 'icons' ? 'primary.main' : 'transparent', color: view === 'icons' ? '#fff' : 'action.active', '&:hover': { bgcolor: view === 'icons' ? 'primary.dark' : 'action.hover' } }}>
                <GridViewIcon fontSize='small' />
              </IconButton>
            </Tooltip>

            {view === 'icons' && (
              <Grid item xs={12}>
                <ResourceLookup
                  endpointId={SaleRepository.Client.snapshot}
                  valueField='reference'
                  displayField='name'
                  name='clientId'
                  label={labels.client}
                  secondFieldLabel={labels.clientName}
                  formObject={values}
                  displayFieldWidth={2}
                  valueShow='clientRef'
                  secondValueShow='clientName'
                  columnsInDropDown={[
                    { key: 'reference', value: 'Reference' },
                    { key: 'name', value: 'Name' }
                  ]}
                  readOnly={cartCount > 0}
                  maxAccess={access}
                  onChange={(_, newValue) => {
                    setCart({})
                    setValues({
                      clientId: newValue?.recordId || null,
                      clientRef: newValue?.reference || '',
                      clientName: newValue?.name || ''
                    })
                    getClientBasket(newValue?.recordId || null)
                  }}
                />
              </Grid>
            )}
          </Box>

          {view === 'icons' && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {cartCount > 0 ? (
                <>
                  <Typography variant='body2' sx={{ fontWeight: 600, fontSize: 13 }}>
                    {cartCount} item{cartCount !== 1 ? 's' : ''}
                    {cartTotal > 0 && ` · ${currencyRef} ${cartTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  </Typography>
                  <Button variant='contained' size='small' onClick={handleSaveBasket} startIcon={<ShoppingCartIcon sx={{ fontSize: 16 }} />} sx={{ textTransform: 'none', borderRadius: 1.5, py: 0.4, fontSize: 12 }}>
                    Save Basket
                  </Button>
                  <Button variant='contained' size='small' onClick={() => setCheckoutOpen(true)} startIcon={<ShoppingCartIcon sx={{ fontSize: 16 }} />} sx={{ textTransform: 'none', borderRadius: 1.5, py: 0.4, fontSize: 12 }}>
                    Checkout
                  </Button>
                </>
              ) : (
                <Badge badgeContent={0} color='primary'>
                  <ShoppingCartIcon fontSize='small' sx={{ color: 'action.disabled' }} />
                </Badge>
              )}
            </Box>
          )}
        </Box>
      </Fixed>

      <Grow>
        {view === 'grid' && (
          <Table
            name='table'
            columns={columns}
            gridData={data ?? { list: [] }}
            rowId={['itemId']}
            onEdit={edit}
            pageSize={pageSize}
            paginationType='api'
            maxAccess={access}
            refetch={refetch}
            paginationParameters={paginationParameters}
          />
        )}

        {view === 'icons' && (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: 1.5, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: 1.25, alignContent: 'start' }}>
              {rows.length === 0 ? (
                <Typography variant='body2' sx={{ color: 'text.secondary', gridColumn: '1/-1', textAlign: 'center', mt: 6 }}>
                  No items to display
                </Typography>
              ) : (
                rows.map(row => (
                  <ProductCard
                    key={row.itemId}
                    row={row}
                    cart={cart}
                    onInc={inc}
                    onDec={dec}
                    labels={labels}
                    canAdd={!!values.clientId}
                    setQty={setQty}
                  />
                ))
              )}
            </Box>

            <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 0.5, px: 1, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', height: 34 }}>
              <IconButton size='small' onClick={goFirst} disabled={page === 1} sx={{ p: 0, width: 22, height: 22 }}><FirstPageIcon sx={{ fontSize: 20 }} /></IconButton>
              <IconButton size='small' onClick={goPrev}  disabled={page === 1} sx={{ p: 0, width: 22, height: 22 }}><NavigateBeforeIcon sx={{ fontSize: 20 }} /></IconButton>
              <Typography variant='caption' sx={{ mx: 0.5 }}>Page {page} of {pageCount}</Typography>
              <IconButton size='small' onClick={goNext}  disabled={page === pageCount} sx={{ p: 0, width: 22, height: 22 }}><NavigateNextIcon sx={{ fontSize: 20 }} /></IconButton>
              <IconButton size='small' onClick={goLast}  disabled={page === pageCount} sx={{ p: 0, width: 22, height: 22 }}><LastPageIcon sx={{ fontSize: 20 }} /></IconButton>
              <IconButton size='small' onClick={refetch}  sx={{ p: 0, width: 22, height: 22 }}><RefreshIcon sx={{ fontSize: 18 }} /></IconButton>
              <Typography variant='caption' sx={{ ml: 0.5, color: 'text.secondary' }}>
                {startAt === 0 ? 1 : startAt + 1}–{Math.min(startAt + pageSize, total)} of {total}
              </Typography>
            </Box>
          </Box>
        )}
      </Grow>

      <CatalogueCheckout
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        cartItems={cartItems}
        onUpdateLine={updateLine}
        onRemoveLine={removeLine}
        onAddLine={addLine}
        onRemoveItem={removeItem}
        onConfirm={handleGenerateOrder}
        labels={labels}
        currencyRef={currencyRef}
      />
    </VertLayout>
  )
}

export default Catalogue
