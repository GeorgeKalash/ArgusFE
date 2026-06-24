import { useContext, useState, useMemo, useCallback } from 'react'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
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
import { Grid } from '@mui/material'
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

const QtyStepper = ({ id, quantities, onInc, onDec }) => {
  const q = quantities[id] || 0
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <IconButton
        size='small'
        onClick={e => { e.stopPropagation(); onDec(id) }}
        disabled={q === 0}
        sx={{
          width: 26, height: 26,
          border: '1px solid',
          borderColor: q === 0 ? 'action.disabled' : 'divider',
          borderRadius: '50%', p: 0,
        }}
      >
        <RemoveIcon sx={{ fontSize: 14 }} />
      </IconButton>

      <Typography variant='body2' sx={{ minWidth: 22, textAlign: 'center', fontWeight: 600, fontSize: 13 }}>
        {q}
      </Typography>

      <IconButton
        size='small'
        onClick={e => { e.stopPropagation(); onInc(id) }}
        sx={{
          width: 26, height: 26,
          border: '1px solid', borderColor: 'primary.main',
          bgcolor: 'primary.main', color: '#fff',
          borderRadius: '50%', p: 0,
          '&:hover': { bgcolor: 'primary.dark' },
        }}
      >
        <AddIcon sx={{ fontSize: 14 }} />
      </IconButton>
    </Box>
  )
}

const ProductCard = ({ row, quantities, onInc, onDec }) => {
  const id = row.itemId
  const q = quantities[id] || 0
  const inCart = q > 0
  const price = parseFloat(row.price)

  return (
    <Box
      sx={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.75,
        p: '12px 10px', borderRadius: 2, cursor: 'default',
        border: '1px solid', borderColor: inCart ? 'primary.main' : 'divider',
        boxShadow: inCart ? '0 0 0 3px rgba(25,118,210,0.08)' : 'none',
        bgcolor: 'background.paper', transition: 'border-color .15s, box-shadow .15s',
      }}
    >
      <Box sx={{ width: 68, height: 68, borderRadius: 1.5, overflow: 'hidden', bgcolor: 'grey.100', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {row.pictureUrl ? (
          <img
            src={row.pictureUrl}
            alt={row.name || ''}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            onError={e => { e.currentTarget.style.display = 'none' }}
          />
        ) : (
          <GridViewIcon sx={{ fontSize: 30, color: 'grey.400' }} />
        )}
      </Box>

      <Typography variant='caption' sx={{ color: 'text.secondary', fontSize: 10 }}>
        {row.sku}
      </Typography>

      <Typography variant='body2' sx={{ fontWeight: 600, fontSize: 12, textAlign: 'center', lineHeight: 1.3 }}>
        {row.name}
      </Typography>

      <Typography variant='caption' sx={{ color: 'text.secondary', fontSize: 10, textAlign: 'center' }}>
        {[row.groupName, row.categoryName].filter(Boolean).join(' · ')}
      </Typography>

      <Typography variant='caption' sx={{ color: 'text.secondary', fontSize: 10 }}>
        On Hand: {row.onHand}
      </Typography>

      <Typography variant='caption' sx={{ color: 'text.secondary', fontSize: 10 }}>
        Price: {row.unitPrice} {row.currencyRef}
      </Typography>

      <QtyStepper id={id} quantities={quantities} onInc={onInc} onDec={onDec} />

    </Box>
  )
}

const Catalogue = () => {
  const { getRequest } = useContext(RequestsContext)
  const { stack } = useWindow()

  const [view, setView] = useState('grid')
  const [quantities, setQuantities] = useState({})
    const [values, setValues] = useState({ clientId: null, clientRef: '', clientName: '' })

  const inc = useCallback(id => setQuantities(q => ({ ...q, [id]: (q[id] || 0) + 1 })), [])
  const dec = useCallback(id => setQuantities(q => ({ ...q, [id]: Math.max(0, (q[id] || 0) - 1) })), [])
  const remove = useCallback(id => setQuantities(q => { const n = { ...q }; delete n[id]; return n }), [])

  const [checkoutOpen, setCheckoutOpen] = useState(false)

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params } = options
    let response = null

    view === 'grid' && (
      response = await getRequest({
        extension: InventoryRepository.Catalogue.page,
        parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=${params || ''}`
      })
    )

    view === 'icons' && (
      response = await getRequest({
        extension: InventoryRepository.CatalogueSummary.summary,
        parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=${params || ''}&_clientId=${values.clientId || 0}`
      })
    )

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
        extension: InventoryRepository.Catalogue.snapshot,
        parameters: `_filter=${filters.qry}`
      })
    } else {
      return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
    }
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

  const columns = [
    { 
      field: 'pictureUrl',
      headerName: '',
      type: 'image',
      flex: 0.5
    },
    { 
      field: 'sku',
      headerName: labels.sku,
      flex: 1
    },
    {
      field: 'name',
      headerName: labels.name,
      flex: 1
    },
    {
      field: 'groupName',
      headerName: labels.group,
      flex: 1
    },
    {
      field: 'categoryName',
      headerName: labels.category,
      flex: 1
    },
    {
      field: 'onHand',
      headerName: labels.onHand,
      type: 'number',
      flex: 1
    }
  ]

  const edit = obj => openForm(obj)

  function openForm(record) {
    stack({
      Component: CatalogueForm,
      props: { labels, maxAccess: access, record },
      width: 1000, height: 600,
      title: labels.Catalogue
    })
  }

  const rows = data?.list ?? []

  const cartItems = useMemo(
    () => rows.filter(r => (quantities[r.itemId] || 0) > 0)
              .map(r => ({ ...r, qty: quantities[r.itemId] })),
    [rows, quantities]
  )
  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0)
  const cartTotal = cartItems.reduce((s, i) => s + (parseFloat(i.price) || 0) * i.qty, 0)

  const handleCheckout = () => setCheckoutOpen(true)

  const pageSize = 50
  const startAt  = data?._startAt ?? 0
  const total    = data?.count    ?? 0
  const page     = Math.ceil(total ? (startAt === 0 ? 1 : (startAt + 1) / pageSize) : 1)
  const pageCount = Math.ceil(total ? total / pageSize : 1)

  const goFirst = () => paginationParameters({ _startAt: 0,                          _pageSize: pageSize })
  const goPrev  = () => paginationParameters({ _startAt: (page - 2) * pageSize,      _pageSize: pageSize })
  const goNext  = () => paginationParameters({ _startAt: page * pageSize,            _pageSize: pageSize })
  const goLast  = () => paginationParameters({ _startAt: (pageCount - 1) * pageSize, _pageSize: pageSize })

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar
          maxAccess={access}
          reportName={'IVIT'}
          filterBy={filterBy}
          previewReport={ResourceIds.Catalogue}
        />
        <Box sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          px: 1, py: 0.5,
          borderBottom: '1px solid', borderColor: 'divider',
          bgcolor: 'background.paper',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Tooltip title='Grid view'>
              <IconButton
                size='small'
                onClick={() => setView('grid')}
                sx={{ borderRadius: 1, bgcolor: view === 'grid' ? 'primary.main' : 'transparent', color: view === 'grid' ? '#fff' : 'action.active', '&:hover': { bgcolor: view === 'grid' ? 'primary.dark' : 'action.hover' } }}
              >
                <ViewListIcon fontSize='small' />
              </IconButton>
            </Tooltip>

            <Tooltip title='Icons view'>
              <IconButton
                size='small'
                onClick={() => setView('icons')}
                sx={{ borderRadius: 1, bgcolor: view === 'icons' ? 'primary.main' : 'transparent', color: view === 'icons' ? '#fff' : 'action.active', '&:hover': { bgcolor: view === 'icons' ? 'primary.dark' : 'action.hover' } }}
              >
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
                  maxAccess={access}
                  onChange={(_, newValue) => {
                    setValues({
                      clientId: newValue?.recordId || null,
                      clientRef: newValue?.reference || '',
                      clientName: newValue?.name || ''
                    })
                  }}
                />
              </Grid>
            )}
          </Box>
          {view === 'icons' && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {cartCount > 0 && (
                <>
                  <Typography variant='body2' sx={{ fontWeight: 600, fontSize: 13 }}>
                    {cartCount} item{cartCount !== 1 ? 's' : ''}
                    {cartTotal > 0 && ` · $${cartTotal.toFixed(2)}`}
                  </Typography>
                  <Button
                    variant='contained'
                    size='small'
                    onClick={handleCheckout}
                    startIcon={<ShoppingCartIcon sx={{ fontSize: 16 }} />}
                    sx={{ textTransform: 'none', borderRadius: 1.5, py: 0.4, fontSize: 12 }}
                  >
                    Checkout
                  </Button>
                </>
              )}
              {cartCount === 0 && (
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
          <VertLayout style={{ height: '100%' }}>
            <Grow>
              <Box sx={{
                height: '100%', overflowY: 'auto', p: 1.5,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))',
                gap: 1.25,
                alignContent: 'start',
              }}>
                {rows.length === 0 ? (
                  <Typography variant='body2' sx={{ color: 'text.secondary', gridColumn: '1/-1', textAlign: 'center', mt: 6 }}>
                    No items to display
                  </Typography>
                ) : (
                  rows.map(row => (
                    <ProductCard
                      key={row.itemId}
                      row={row}
                      quantities={quantities}
                      onInc={inc}
                      onDec={dec}
                    />
                  ))
                )}
              </Box>
            </Grow>

            <Fixed>
              <Box sx={{
                display: 'flex', alignItems: 'center', gap: 0.5,
                px: 1, borderTop: '1px solid', borderColor: 'divider',
                bgcolor: 'background.paper', height: 34,
              }}>
                <IconButton size='small' onClick={goFirst} disabled={page === 1} sx={{ p: 0, width: 22, height: 22 }}>
                  <FirstPageIcon sx={{ fontSize: 20 }} />
                </IconButton>
                <IconButton size='small' onClick={goPrev} disabled={page === 1} sx={{ p: 0, width: 22, height: 22 }}>
                  <NavigateBeforeIcon sx={{ fontSize: 20 }} />
                </IconButton>

                <Typography variant='caption' sx={{ mx: 0.5 }}>Page {page} of {pageCount}</Typography>

                <IconButton size='small' onClick={goNext} disabled={page === pageCount} sx={{ p: 0, width: 22, height: 22 }}>
                  <NavigateNextIcon sx={{ fontSize: 20 }} />
                </IconButton>
                <IconButton size='small' onClick={goLast} disabled={page === pageCount} sx={{ p: 0, width: 22, height: 22 }}>
                  <LastPageIcon sx={{ fontSize: 20 }} />
                </IconButton>
                <IconButton size='small' onClick={refetch} sx={{ p: 0, width: 22, height: 22 }}>
                  <RefreshIcon sx={{ fontSize: 18 }} />
                </IconButton>

                <Typography variant='caption' sx={{ ml: 0.5, color: 'text.secondary' }}>
                  {startAt === 0 ? 1 : startAt + 1}–{Math.min(startAt + pageSize, total)} of {total}
                </Typography>
              </Box>
            </Fixed>
          </VertLayout>
        )}
      </Grow>
      <CatalogueCheckout
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        cartItems={cartItems}
        onInc={inc}
        onDec={dec}
        onRemove={remove}
        onConfirm={() => {
          setCheckoutOpen(false)
        }}
      />
    </VertLayout>
  )
}

export default Catalogue
