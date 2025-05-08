import { Grid } from '@mui/material'
import { ResourceIds } from 'src/resources/ResourceIds'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import FormShell from 'src/components/Shared/FormShell'
import { SaleRepository } from 'src/repositories/SaleRepository'
import { useForm } from 'src/hooks/form'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { SystemFunction } from 'src/resources/SystemFunction'
import { useContext, useEffect } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { DataGrid } from 'src/components/Shared/DataGrid'

export default function InvoiceForm({ form, maxAccess, labels, window }) {
  const { getRequest } = useContext(RequestsContext)

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      items: [{ id: 1, sku: '', itemName: '', qty: 0, returnedQty: 0, balanceQty: 0, returnNow: 0 }]
    }
  })
  function importAllItems() {
    const updatedList = formik?.values?.items?.map((x, index) => {
      return { ...x.item, id: index + 1, checked: true }
    })
    if (updatedList.length == 0) return
    form.setFieldValue('items', formik.values.items)
    window.close()
  }
  function importSelectedItems() {}

  const columns = [
    {
      component: 'checkbox',
      label: ' ',
      name: 'checked'
    },
    {
      component: 'textfield',
      label: labels.sku,
      name: 'sku',
      flex: 2,
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      label: labels.itemName,
      name: 'itemName',
      flex: 3,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.qty,
      name: 'qty',
      flex: 2,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.returnQty,
      name: 'returnedQty',
      flex: 2,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.balanceQty,
      name: 'balanceQty',
      flex: 2,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.returnNow,
      flex: 2,
      name: 'returnNow'
    }
  ]

  const actions = [
    {
      key: 'Import',
      condition: true,
      onClick: importSelectedItems
    },
    {
      key: 'ImportAll',
      condition: true,
      onClick: importAllItems
    }
  ]
  async function fetchGridData() {
    let items = []

    if (form?.values?.recordId) {
      const retItems = await getRequest({
        extension: SaleRepository.ReturnItem.qry,
        parameters: `_returnId=${form.values.recordId}`
      })

      items = retItems.list.map(item => ({
        ...item,
        returnNowQty: item.qty,
        componentSeqNo: item.componentSeqNo || 0
      }))
    }

    const combined = items.length > 0 ? [...items, ...form.values.items] : form.values.items

    const allLists =
      items.length > 0
        ? Array.from(
            combined
              .reduce((map, item) => {
                const key = `${item.itemId}_${item.seqNo}`
                if (!map.has(key)) {
                  map.set(key, item)
                }

                return map
              }, new Map())
              .values()
          )
        : form.values.items

    const listReq = await getRequest({
      extension: SaleRepository.ReturnItem.balance,
      parameters: `_invoiceId=${form.values.invoiceId}`
    })

    const itemsList = listReq?.list.map((x, index) => {
      const { seqNo, componentSeqNo, qty = 0, itemId } = x.item

      const indexInAllLists = allLists.findIndex(item => item.seqNo == seqNo && item.componentSeqNo == componentSeqNo)

      const existsInFormValues = form.values.items.some(item => item.seqNo == seqNo && item.itemId == itemId)

      const updatedItem = {
        ...x,
        id: index + 1,
        itemId: x.item.itemId,
        sku: x.item.sku,
        itemName: x.item.itemName,
        qty: x.item.qty || 0
      }
      const currentItem = indexInAllLists != -1 ? allLists[indexInAllLists] : null

      if (currentItem) {
        updatedItem.checked = existsInFormValues
        updatedItem.returnNow = currentItem.returnNowQty

        if (existsInFormValues) {
          updatedItem.returnedQty = (updatedItem.returnedQty || 0) - updatedItem.returnNow || 0
          updatedItem.balanceQty = (updatedItem.balanceQty || 0) + updatedItem.returnNow || 0

          if (!existsInFormValues) {
            updatedItem.returnNow = 0
          }
        } else {
          updatedItem.returnedQty = currentItem.returnedQty || 0
        }
      } else {
        updatedItem.returnNow = 0
        updatedItem.item.invoiceId = form?.values?.invoiceId ? parseInt(form.values.invoiceId) : 0
        updatedItem.item.invoiceRef = form?.values?.invoiceRef || null
      }

      updatedItem.balanceQty = qty - (updatedItem.returnedQty || 0)

      return updatedItem
    })

    formik.setFieldValue(
      'items',
      itemsList?.filter(x => x.item.qty != x.returnedQty)
    )
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
      actions={actions}
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
          <DataGrid
            onChange={value => formik.setFieldValue('items', value)}
            value={formik.values.items}
            error={formik.errors.items}
            columns={columns}
            name='items'
            maxAccess={maxAccess}
            allowDelete={false}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
