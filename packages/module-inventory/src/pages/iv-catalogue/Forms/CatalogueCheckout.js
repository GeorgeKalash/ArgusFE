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

const NoteField = memo(({ itemId, initialValues, onCommit, onSpecialNote, onExpectedDeliveryDays, onClear, labels, expectedDeliveryDaysStore }) => {
  const [localNote, setLocalNote] = useState(initialValues.notes || '')
  const [localCheck, setLocalCheck] = useState(initialValues.isSpecialOrder || false)
  const [localExpectedDeliveryDays, setLocalExpectedDeliveryDays] = useState(initialValues.expectedDeliveryDays?.toString() || '')

  return (
    <Grid container spacing={2}>
      <Grid item xs={10}>
        <CustomCheckBox
          name='isSpecialOrder'
          value={localCheck}
          onChange={(e) => {
            const checked = e.target.checked
            setLocalCheck(checked)
            onSpecialNote(checked, itemId)
            if (!checked) {
              setLocalNote('')
              onCommit('', itemId)
              setLocalExpectedDeliveryDays('')
              onExpectedDeliveryDays(null, itemId)
            }
          }}
          label={labels?.isSpecialOrder}
        />
      </Grid>
      <Grid item xs={10}>
        <CustomTextArea
          name='notes'
          label={labels?.notes}
          value={localNote}
          rows={1.5}
          readOnly={!localCheck}
          maxLength='300'
          onChange={(e) => setLocalNote(e.target.value)}
          onBlur={() => onCommit(localNote, itemId)}
          onClear={() => {
            setLocalNote('')
            onClear('', itemId)
          }}
        />
      </Grid>
      <Grid item xs={10}>
        <CustomComboBox
          name='expectedDeliveryDays'
          label={labels.expectedDeliveryDays}
          store={expectedDeliveryDaysStore}
          valueField='key'
          displayField='value'
          readOnly={!localCheck}
          value={localExpectedDeliveryDays}
          onChange={(_, newValue) => {
            setLocalExpectedDeliveryDays(newValue?.key?.toString() || '')
            onExpectedDeliveryDays(newValue?.key || null, itemId)
          }}
        />
      </Grid>
    </Grid>
  )
})

const CatalogueCheckout = ({
  open,
  onClose,
  cartItems = [],
  onInc,
  onDec,
  onNote,
  onSpecialNote,
  onExpectedDeliveryDays,
  currencyRef,
  onRemove,
  onConfirm,
  labels
}) => {
  const { getAllKvsByDataset } = useContext(CommonContext)
  const [expectedDeliveryDaysStore, setExpectedDeliveryDaysStore] = useState([])
  const total = cartItems.reduce((s, i) => s + (parseFloat(i.unitPrice) || 0) * i.qty, 0)
  const totalQty = cartItems.reduce((s, i) => s + i.qty, 0)

  async function loadExpectedDeliveryDays() {
    const result = await new Promise((resolve, reject) => {
      getAllKvsByDataset({
        _dataset: DataSets.EXPECTED_DELIVERY_DAYS,
        callback: data => {
          if (data) resolve(data)
          else reject()
        }
      })
    })

    setExpectedDeliveryDaysStore(result)
  }

  useEffect(() => {
    loadExpectedDeliveryDays()
  }, [])

  return (
    <Drawer
      anchor='right'
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 380,
          display: 'flex',
          flexDirection: 'column',
        }
      }}
    >
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        px: 2, py: 1.5,
        borderBottom: '1px solid', borderColor: 'divider',
        flexShrink: 0,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ShoppingCartIcon fontSize='small' color='primary' />
          <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
            Cart
          </Typography>
          <Typography variant='caption' sx={{
            bgcolor: 'primary.main', color: '#fff',
            px: 0.75, py: '1px', borderRadius: 10, fontWeight: 600, fontSize: 11,
          }}>
            {totalQty}
          </Typography>
        </Box>
        <IconButton size='small' onClick={onClose}>
          <CloseIcon fontSize='small' />
        </IconButton>
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto', px: 1.5, py: 1 }}>
        {cartItems.length === 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 8, gap: 1.5 }}>
            <ShoppingCartIcon sx={{ fontSize: 48, color: 'action.disabled' }} />
            <Typography variant='body2' color='text.secondary'>{labels.cartEmpty}</Typography>
          </Box>
        ) : (
          cartItems.map((item, idx) => {
            const price = parseFloat(item.unitPrice)

            return (
              <Box key={item.itemId}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.25, px: 0.5 }}>
                  <Box sx={{ width: 52, height: 52, borderRadius: 1.5, flexShrink: 0, overflow: 'hidden', bgcolor: 'grey.100', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {item.pictureUrl ? (
                      <img src={item.pictureUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={e => { e.currentTarget.style.display = 'none' }} />
                    ) : (
                      <ShoppingCartIcon sx={{ fontSize: 22, color: 'grey.400' }} />
                    )}
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant='body2' sx={{ fontWeight: 600, fontSize: 13, lineHeight: 1.3 }} noWrap>
                      {item.name}
                    </Typography>
                    <Typography variant='caption' sx={{ color: 'text.secondary', fontSize: 11 }}>
                      {item.sku}
                    </Typography>
                    <Typography variant='caption' sx={{ display: 'block', color: 'primary.main', fontWeight: 600, fontSize: 12 }}>
                      {currencyRef} {price.toFixed(2)} × {item.qty} = {currencyRef} {(price * item.qty).toFixed(2)}
                    </Typography>

                    <NoteField
                      key={item.itemId}
                      itemId={item.itemId}
                      initialValues={item}
                      labels={labels}
                      onCommit={onNote}
                      onSpecialNote={onSpecialNote}
                      onExpectedDeliveryDays={onExpectedDeliveryDays}
                      onClear={onNote}
                      expectedDeliveryDaysStore={expectedDeliveryDaysStore}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <IconButton size='small' onClick={() => onDec(item.itemId)} sx={{ width: 24, height: 24, p: 0, border: '1px solid', borderColor: 'divider', borderRadius: '50%' }}>
                        <RemoveIcon sx={{ fontSize: 13 }} />
                      </IconButton>

                      <Typography sx={{ minWidth: 24, textAlign: 'center', fontWeight: 700, fontSize: 14 }}>
                        {item.qty}
                      </Typography>

                      <IconButton size='small' onClick={() => onInc(item.itemId)} sx={{ width: 24, height: 24, p: 0, border: '1px solid', borderColor: 'primary.main', bgcolor: 'primary.main', color: '#fff', borderRadius: '50%', '&:hover': { bgcolor: 'primary.dark' } }}>
                        <AddIcon sx={{ fontSize: 13 }} />
                      </IconButton>
                    </Box>

                    <Tooltip title='Remove'>
                      <IconButton size='small' onClick={() => onRemove(item.itemId)} sx={{ color: 'error.main', p: 0.25 }}>
                        <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                {idx < cartItems.length - 1 && <Divider />}
              </Box>
            )
          })
        )}
      </Box>

      {cartItems.length > 0 && (
        <Box sx={{ px: 2, py: 1.5, flexShrink: 0, borderTop: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant='body2' color='text.secondary'>Total</Typography>
            <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>
              {currencyRef} {total.toFixed(2)}
            </Typography>
          </Box>

          <Button variant='contained' fullWidth onClick={onConfirm} startIcon={<ShoppingCartIcon />} sx={{ textTransform: 'none', borderRadius: 1.5, fontWeight: 600 }}>
            {labels.placeOrder}
          </Button>

          <Button variant='text' fullWidth onClick={onClose} sx={{ textTransform: 'none', color: 'text.secondary', fontSize: 12 }}>
            {labels.continueShopping}
          </Button>
        </Box>
      )}
    </Drawer>
  )
}

export default CatalogueCheckout
