import { useState, memo, useContext, useEffect } from 'react'
import { Grid } from '@mui/material'
import { Box, Typography, IconButton, Button, Drawer, Divider, Tooltip } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import CloseIcon from '@mui/icons-material/Close'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import CustomTextArea from '@argus/shared-ui/src/components/Inputs/CustomTextArea'
import CustomCheckBox from '@argus/shared-ui/src/components/Inputs/CustomCheckBox'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import CustomComboBox from '@argus/shared-ui/src/components/Inputs/CustomComboBox'
import { CommonContext } from '@argus/shared-providers/src/providers/CommonContext'

const LineRow = memo(({ line, itemId, onUpdateLine, onRemoveLine, onAddLine, isLast, labels, expectedDeliveryDaysStore }) => {
  const [localNote, setLocalNote] = useState(line.notes || '')
  const [localDays, setLocalDays] = useState(line.expectedDeliveryDays?.toString() || '')

  return (
    <Box sx={{
      border: '1px solid', borderColor: 'divider', borderRadius: 1.5,
      p: 1, mb: 0.75, bgcolor: line.isSpecialOrder ? 'rgba(25,118,210,0.04)' : 'background.paper',
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <CustomCheckBox
          name='isSpecialOrder'
          value={line.isSpecialOrder || false}
          label={labels?.isSpecialOrder}
          onChange={e => {
            const checked = e.target.checked
            if (!checked) {
              setLocalNote('')
              setLocalDays('')
              onUpdateLine(itemId, line.lineId, { isSpecialOrder: false, notes: '', expectedDeliveryDays: null })
            } else {
              onUpdateLine(itemId, line.lineId, { isSpecialOrder: true })
            }
          }}
        />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
          <IconButton
            size='small'
            onClick={() => onUpdateLine(itemId, line.lineId, { qty: Math.max(1, line.qty - 1) })}
            sx={{ width: 26, height: 26, p: 0, border: '1px solid', borderColor: 'divider', borderRadius: '50%' }}
          >
            <RemoveIcon sx={{ fontSize: 13 }} />
          </IconButton>
          <Typography sx={{ minWidth: 24, textAlign: 'center', fontWeight: 700, fontSize: 14 }}>
            {line.qty}
          </Typography>
          <IconButton
            size='small'
            onClick={() => onUpdateLine(itemId, line.lineId, { qty: line.qty + 1 })}
            sx={{ width: 26, height: 26, p: 0, border: '1px solid', borderColor: 'primary.main', bgcolor: 'primary.main', color: '#fff', borderRadius: '50%', '&:hover': { bgcolor: 'primary.dark' } }}
          >
            <AddIcon sx={{ fontSize: 13 }} />
          </IconButton>
        </Box>

        <Tooltip title={labels?.removeLine}>
          <IconButton size='small' onClick={() => onRemoveLine(itemId, line.lineId)} sx={{ color: 'error.main', p: 0.25 }}>
            <DeleteOutlineIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Box>

      {line.isSpecialOrder && (
        <Box sx={{ mt: 0.75, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          <CustomTextArea
            name='notes'
            label={labels?.notes}
            value={localNote}
            rows={1.5}
            maxLength='300'
            onChange={e => setLocalNote(e.target.value)}
            onBlur={() => onUpdateLine(itemId, line.lineId, { notes: localNote })}
            onClear={() => {
              setLocalNote('')
              onUpdateLine(itemId, line.lineId, { notes: '' })
            }}
          />
          <CustomComboBox
            name='expectedDeliveryDays'
            label={labels?.expectedDeliveryDays}
            store={expectedDeliveryDaysStore}
            valueField='key'
            displayField='value'
            value={localDays}
            onChange={(_, newValue) => {
              const val = newValue?.key?.toString() || ''
              setLocalDays(val)
              onUpdateLine(itemId, line.lineId, { expectedDeliveryDays: newValue?.key || null })
            }}
          />
        </Box>
      )}

      {isLast && (
        <Button
          size='small'
          startIcon={<AddIcon sx={{ fontSize: 13 }} />}
          onClick={() => onAddLine(itemId)}
          sx={{ mt: 0.75, textTransform: 'none', fontSize: 11, p: '2px 8px' }}
        >
          {labels?.addLine || 'Add line'}
        </Button>
      )}
    </Box>
  )
})

const CheckoutItem = ({ item, onUpdateLine, onRemoveLine, onAddLine, onRemoveItem, labels, expectedDeliveryDaysStore, currencyRef }) => {
  const totalQty   = item.lines.reduce((s, l) => s + l.qty, 0)
  const price      = parseFloat(item.unitPrice) || 0
  const lineTotal  = price * totalQty

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1, px: 0.5 }}>
        <Box sx={{ width: 48, height: 48, borderRadius: 1.5, flexShrink: 0, overflow: 'hidden', bgcolor: 'grey.100', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {item.pictureUrl ? (
            <img src={item.pictureUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={e => { e.currentTarget.style.display = 'none' }} />
          ) : (
            <ShoppingCartIcon sx={{ fontSize: 20, color: 'grey.400' }} />
          )}
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant='body2' sx={{ fontWeight: 600, fontSize: 13, lineHeight: 1.3 }} noWrap>
            {item.name}
          </Typography>
          <Typography variant='caption' sx={{ color: 'text.secondary', fontSize: 11 }}>
            {item.sku}
          </Typography>
          {price > 0 && (
            <Typography variant='caption' sx={{ display: 'block', color: 'primary.main', fontWeight: 600, fontSize: 12 }}>
              {currencyRef} {price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} × {totalQty} = {currencyRef} {lineTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
          )}
        </Box>

        <Tooltip title={labels?.remove || 'Remove item'}>
          <IconButton size='small' onClick={() => onRemoveItem(item.itemId)} sx={{ color: 'error.main', p: 0.25, flexShrink: 0 }}>
            <DeleteOutlineIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ pl: 1 }}>
        {item.lines.map((line, idx) => (
          <LineRow
            key={line.lineId}
            line={line}
            itemId={item.itemId}
            onUpdateLine={onUpdateLine}
            onRemoveLine={onRemoveLine}
            onAddLine={onAddLine}
            isLast={idx === item.lines.length - 1}
            labels={labels}
            expectedDeliveryDaysStore={expectedDeliveryDaysStore}
          />
        ))}
      </Box>
    </Box>
  )
}

const CatalogueCheckout = ({
  open,
  onClose,
  cartItems = [],
  onUpdateLine,
  onRemoveLine,
  onAddLine,
  onRemoveItem,
  onConfirm,
  labels,
  currencyRef,
}) => {
  const { getAllKvsByDataset } = useContext(CommonContext)
  const [expectedDeliveryDaysStore, setExpectedDeliveryDaysStore] = useState([])

  const totalQty   = cartItems.reduce((s, i) => s + i.lines.reduce((ls, l) => ls + l.qty, 0), 0)
  const total      = cartItems.reduce((s, i) => s + (parseFloat(i.unitPrice) || 0) * i.lines.reduce((ls, l) => ls + l.qty, 0), 0)

  useEffect(() => {
    if (!open) return
    new Promise((resolve, reject) => {
      getAllKvsByDataset({
        _dataset: DataSets.EXPECTED_DELIVERY_DAYS,
        callback: data => data ? resolve(data) : reject()
      })
    }).then(setExpectedDeliveryDaysStore).catch(() => {})
  }, [open])

  return (
    <Drawer
      anchor='right'
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: 400, display: 'flex', flexDirection: 'column' } }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ShoppingCartIcon fontSize='small' color='primary' />
          <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>{labels?.cart}</Typography>
          <Typography variant='caption' sx={{ bgcolor: 'primary.main', color: '#fff', px: 0.75, py: '1px', borderRadius: 10, fontWeight: 600, fontSize: 11 }}>
            {totalQty}
          </Typography>
        </Box>
        <IconButton size='small' onClick={onClose}><CloseIcon fontSize='small' /></IconButton>
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto', px: 1.5, py: 1 }}>
        {cartItems.length === 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 8, gap: 1.5 }}>
            <ShoppingCartIcon sx={{ fontSize: 48, color: 'action.disabled' }} />
            <Typography variant='body2' color='text.secondary'>{labels?.cartEmpty}</Typography>
          </Box>
        ) : (
          cartItems.map((item, idx) => (
            <Box key={item.itemId}>
              <CheckoutItem
                item={item}
                onUpdateLine={onUpdateLine}
                onRemoveLine={onRemoveLine}
                onAddLine={onAddLine}
                onRemoveItem={onRemoveItem}
                labels={labels}
                expectedDeliveryDaysStore={expectedDeliveryDaysStore}
                currencyRef={currencyRef}
              />
              {idx < cartItems.length - 1 && <Divider sx={{ my: 0.5 }} />}
            </Box>
          ))
        )}
      </Box>

      {cartItems.length > 0 && (
        <Box sx={{ px: 2, py: 1.5, flexShrink: 0, borderTop: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column', gap: 1 }}>
          {total > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant='body2' color='text.secondary'>Total</Typography>
              <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>
                {currencyRef} {total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
            </Box>
          )}
          <Button variant='contained' fullWidth onClick={onConfirm} startIcon={<ShoppingCartIcon />} sx={{ textTransform: 'none', borderRadius: 1.5, fontWeight: 600 }}>
            {labels?.placeOrder}
          </Button>
          <Button variant='text' fullWidth onClick={onClose} sx={{ textTransform: 'none', color: 'text.secondary', fontSize: 12 }}>
            {labels?.continueShopping}
          </Button>
        </Box>
      )}
    </Drawer>
  )
}

export default CatalogueCheckout
