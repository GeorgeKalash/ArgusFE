import { Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { RequestsContext } from 'src/providers/RequestsContext'
import { formatDateForGetApI, formatDateFromApi } from 'src/lib/date-helper'
import { SaleRepository } from 'src/repositories/SaleRepository'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import { SystemRepository } from 'src/repositories/SystemRepository'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'

export default function PreviewForm({ labels, maxAccess, clientId }) {
  const { getRequest } = useContext(RequestsContext)

  const [data, setData] = useState({
    address: ''
  })

  async function getData() {
    const now = new Date()

    const res = await getRequest({
      extension: SaleRepository.Client.preview,
      parameters: `_clientId=${clientId}&_asOfDate=${formatDateForGetApI(now)}`
    })

    const resAddress = await getRequest({
      extension: SaleRepository.Address.qry,
      parameters: `_params=1|${clientId}`
    })

    const addressId = resAddress.list.find(address => address.clientId === clientId)

    if (!addressId?.addressId) return null

    const address = await getRequest({
      extension: SystemRepository.Address.format,
      parameters: `_addressId=${addressId?.addressId}`
    })

    const addressValue = address?.record?.formattedAddress.replace(/(\r\n|\r|\n)+/g, '\r\n')

    setData({
      ...res.record,
      address: addressValue,
      lastInvoiceDate: formatDateFromApi(res.record.lastInvoiceDate),
      lastReceiptDate: formatDateFromApi(res.record.lastReceiptDate)
    })
  }

  useEffect(() => {
    ;(async function () {
      await getData()
    })()
  }, [])

  return (
    <VertLayout>
      <Grow>
        <Grid container spacing={2} sx={{ p: 2 }}>
          <Grid item xs={4}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <CustomNumberField
                  name='yearOpenAmount'
                  value={data?.yearOpenAmount}
                  label={labels.yearOpenAmount}
                  readOnly
                />
              </Grid>
              <Grid item xs={12}>
                <CustomNumberField
                  name='invoicedAmount'
                  value={data?.invoicedAmount}
                  label={labels.invoicedAmount}
                  readOnly
                />
              </Grid>
              <Grid item xs={12}>
                <CustomNumberField
                  name='saleReturnAmount'
                  value={data?.saleReturnAmount}
                  label={labels.saleReturnAmount}
                  readOnly
                />
              </Grid>
              <Grid item xs={12}>
                <CustomNumberField
                  name='receivedAmount'
                  value={data?.receivedAmount}
                  label={labels.receivedAmount}
                  readOnly
                />
              </Grid>
              <Grid item xs={12}>
                <CustomNumberField name='balance' value={data?.balance} label={labels.balance} readOnly />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={4}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <CustomDatePicker
                  name='lastInvoiceDate'
                  label={labels.lastInvoiceDate}
                  value={data?.lastInvoiceDate}
                  readOnly
                  maxAccess={maxAccess}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomDatePicker
                  name='lastReceiptDate'
                  label={labels.lastReceiptDate}
                  value={data?.lastReceiptDate}
                  readOnly
                  maxAccess={maxAccess}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomNumberField
                  name='debitNoteAmount'
                  value={data?.debitNoteAmount}
                  label={labels.debitNoteAmount}
                  readOnly
                />
              </Grid>
              <Grid item xs={12}>
                <CustomNumberField
                  name='creditNoteAmount'
                  value={data?.creditNoteAmount}
                  label={labels.creditNoteAmount}
                  readOnly
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={4}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <CustomTextArea
                  name='address'
                  label={labels.address}
                  value={data.address}
                  rows={6}
                  readOnly
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grow>
    </VertLayout>
  )
}
