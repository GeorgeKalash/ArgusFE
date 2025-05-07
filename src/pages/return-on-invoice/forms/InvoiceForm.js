import { Grid } from '@mui/material'
import { ResourceIds } from 'src/resources/ResourceIds'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import FormShell from 'src/components/Shared/FormShell'
import * as yup from 'yup'
import { SaleRepository } from 'src/repositories/SaleRepository'
import { useForm } from 'src/hooks/form'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { SystemFunction } from 'src/resources/SystemFunction'
import Table from 'src/components/Shared/Table'
import { useContext, useEffect } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'

export default function InvoiceForm({ form, maxAccess, labels }) {
  const { getRequest } = useContext(RequestsContext)

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      invoices: []
    },
    validateOnChange: true,
    validationSchema: yup.object({
      changeToId: yup.string().required()
    }),
    onSubmit: async values => {}
  })

  const columns = [
    {
      field: 'sku',
      headerName: labels.sku,
      flex: 1
    },
    {
      field: 'itemName',
      headerName: labels.itemName,
      flex: 1
    },
    {
      field: 'qty',
      headerName: labels.qty,
      flex: 1,
      type: 'number'
    },
    {
      field: 'returnedQty',
      headerName: labels.returnQty,
      flex: 1,
      type: 'number'
    },
    {
      field: 'balanceQty',
      headerName: labels.balanceQty,
      flex: 1,
      type: 'number'
    },
    {
      field: 'returnNow',
      headerName: labels.returnNow,
      flex: 1,
      type: 'number'
    }
  ]
  async function fetchGridData() {
    let items = []
    let invoices = []
    if (form?.values?.recordId) {
      const retItems = await getRequest({
        extension: SaleRepository.ReturnItem.qry,
        parameters: `_returnId=${form?.values?.recordId}`
      })
      items = retItems.list.map(item => ({
        ...item,
        returnNowQty: item.qty,
        componentSeqNo: item.componentSeqNo == null ? item.componentSeqNo : 0
      }))
    }

    const combined = [...items, ...form.values.items]

    const allLists = Array.from(
      combined
        .reduce((map, item) => {
          const key = item.itemId + '_' + item.seqNo
          if (!map.has(key)) {
            map.set(key, item)
          }

          return map
        }, new Map())
        .values()
    )

    const listReq = await getRequest({
      extension: SaleRepository.ReturnItem.balance,
      parameters: `_invoiceId=${form?.values?.invoiceId}`
    })
    listReq.list = listReq?.list.map(x => {
      let index2 = allLists.findIndex(
        item => item.seqNo === x.item.seqNo && item.componentSeqNo === x.item.componentSeqNo
      )

      if (index2 != 1) {
        x.check =
          form.values.items.FindIndex(
            item => item.seqNo == x.item.seqNo && item.componentSeqNo == x.item.componentSeqNo
          ) == -1
        x.returnNow = allLists[index2].returnNowQty
      }
    })

    // invoices = listReq?.list.map(item => {
    //   return {
    //     itemId: item.item.itemId,
    //     sku: item.item.sku,
    //     itemName: item.item.itemName,
    //     qty: item.item.qty || 0,
    //     returnedQty: item.returnedQty || 0,
    //     balanceQty: item.item.qty - item.returnedQty || 0,
    //     returnNow: 0,
    //     checked: false
    //   }
    // })
    formik.setFieldValue('invoices', allLists)
  }

  useEffect(() => {
    ;(async function () {
      fetchGridData()
    })()
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.ReturnOnInvoice}
      functionId={SystemFunction.SalesReturn}
      form={formik}
      isSavedClear={false}
      isCleared={false}
      isSaved={false}
      isInfo={false}
      maxAccess={maxAccess}
      editMode={true}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceLookup
                    endpointId={SaleRepository.Client.snapshot}
                    valueField='reference'
                    displayField='name'
                    secondFieldLabel={labels.name}
                    name='clientId'
                    label={labels.client}
                    form={form}
                    readOnly
                    valueShow='clientRef'
                    secondValueShow='clientName'
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SaleRepository.ReturnOnInvoice.balance}
                    parameters={`_clientId=${form.values.clientId}&_returnDate=${
                      form?.values?.date?.toISOString().split('T')[0] + 'T00:00:00'
                    }`}
                    name='invoiceId'
                    label={labels.invoice}
                    valueField='recordId'
                    displayField='reference'
                    readOnly
                    values={form.values}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={6}>
              <CustomDatePicker name='date' label={labels.date} value={form?.values?.date} readOnly />
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <Table
            name='table'
            columns={columns}
            gridData={{ list: formik.values.invoices }}
            rowId={['itemId', 'seqNo']}
            maxAccess={maxAccess}
            pagination={false}
            showCheckboxColumn={true}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
