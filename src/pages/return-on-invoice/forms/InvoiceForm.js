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
import { getIPR, DIRTYFIELD_QTY } from 'src/utils/ItemPriceCalculator'
import { getVatCalc } from 'src/utils/VatCalculator'
import { FinancialRepository } from 'src/repositories/FinancialRepository'

export default function InvoiceForm({ form, maxAccess, labels, window }) {
  const { getRequest } = useContext(RequestsContext)

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      items: [{ id: 1, sku: '', itemName: '', qty: 0, returnedQty: 0, balanceQty: 0, returnNow: 0 }]
    }
  })

  async function getTaxDetails(taxId) {
    if (!taxId) return

    const res = await getRequest({
      extension: FinancialRepository.TaxDetailPack.qry,
      parameters: `_taxId=${taxId}`
    })

    return res?.list
  }
  async function importAllItems() {
    const updatedList = formik?.values?.items?.map((x, index) => {
      const returnNow = x.balanceQty

      const item = {
        ...x.item,
        id: index + 1,
        returnedQty: x.returnedQty,
        checked: true,
        returnNowQty: returnNow,
        invoiceSeqNo: x.item.seqNo,
        extendedPrice:
          x.item.extendedPrice !== 0 ? (returnNow * x.item.extendedPrice) / x.item.qty : x.item.extendedPrice
      }

      return item
    })
    if (updatedList.length == 0) return

    const finalList = await Promise.all(
      updatedList.map(async x => {
        const itemPriceRow = getIPR({
          priceType: x?.item?.priceType || 0,
          basePrice: parseFloat(x?.item?.basePrice) || 0,
          volume: parseFloat(x?.item?.volume),
          weight: parseFloat(x?.item?.weight),
          unitPrice: parseFloat(x?.item?.unitPrice || 0),
          upo: 0,
          qty: parseFloat(x?.item?.qty),
          extendedPrice: parseFloat(x?.item?.extendedPrice),
          mdAmount: parseFloat(x?.item?.mdAmount),
          mdType: x?.item?.mdType,
          baseLaborPrice: 0,
          totalWeightPerG: 0,
          mdValue: parseFloat(x?.item?.mdValue),
          tdPct: x?.item?.values?.tdPct || 0,
          dirtyField: DIRTYFIELD_QTY
        })
        const taxDetailsResponse = await getTaxDetails(x?.taxId)

        const details = taxDetailsResponse?.map(item => ({
          taxId: x?.taxId,
          taxCodeId: item.taxCodeId,
          taxBase: item.taxBase,
          amount: item.amount
        }))

        const vatCalcRow = getVatCalc({
          basePrice: itemPriceRow?.basePrice,
          qty: x?.qty,
          extendedPrice: parseFloat(itemPriceRow?.extendedPrice) || 0,
          baseLaborPrice: itemPriceRow?.baseLaborPrice || 0,
          vatAmount: 0,
          tdPct: form.values.tdPct,
          taxDetails: form.values.isVattable ? details : null
        })

        const updatedItem = {
          ...x.item,
          basePrice: itemPriceRow.basePrice,
          unitPrice: itemPriceRow.unitPrice,
          extendedPrice: itemPriceRow.extendedPrice,
          mdValue: itemPriceRow.mdValue,
          mdType: itemPriceRow.mdType,
          baseLaborPrice: itemPriceRow.baseLaborPrice,
          mdAmountPct: itemPriceRow.mdType,
          vatAmount: vatCalcRow.vatAmount
        }

        return {
          ...x,
          item: updatedItem,
          vatAmount: vatCalcRow.vatAmount
        }
      })
    )
    form.setFieldValue('items', finalList)
    window.close()
  }
  async function importSelectedItems() {
    const updatedList = formik?.values?.items
      ?.filter(x => x.checked === true && x.balanceQty > 0)
      .map((x, index) => {
        const returnNow = x.balanceQty

        const item = {
          ...x.item,
          id: index + 1,
          returnedQty: x.returnedQty,
          returnNowQty: returnNow,
          invoiceSeqNo: x.item.seqNo,
          extendedPrice:
            x.item.extendedPrice !== 0 ? (returnNow * x.item.extendedPrice) / x.item.qty : x.item.extendedPrice
        }

        return item
      })

    if (updatedList.length == 0) return

    const finalList = await Promise.all(
      updatedList.map(async x => {
        const itemPriceRow = getIPR({
          priceType: x?.item?.priceType || 0,
          basePrice: parseFloat(x?.item?.basePrice) || 0,
          volume: parseFloat(x?.item?.volume),
          weight: parseFloat(x?.item?.weight),
          unitPrice: parseFloat(x?.item?.unitPrice || 0),
          upo: 0,
          qty: parseFloat(x?.item?.qty),
          extendedPrice: parseFloat(x?.item?.extendedPrice),
          mdAmount: parseFloat(x?.item?.mdAmount),
          mdType: x?.item?.mdType,
          baseLaborPrice: 0,
          totalWeightPerG: 0,
          mdValue: parseFloat(x?.item?.mdValue),
          tdPct: x?.item?.values?.tdPct || 0,
          dirtyField: DIRTYFIELD_QTY
        })
        const taxDetailsResponse = await getTaxDetails(x?.taxId)

        const details = taxDetailsResponse?.map(item => ({
          taxId: x?.taxId,
          taxCodeId: item.taxCodeId,
          taxBase: item.taxBase,
          amount: item.amount
        }))

        const vatCalcRow = getVatCalc({
          basePrice: itemPriceRow?.basePrice,
          qty: x?.qty,
          extendedPrice: parseFloat(itemPriceRow?.extendedPrice) || 0,
          baseLaborPrice: itemPriceRow?.baseLaborPrice || 0,
          vatAmount: 0,
          tdPct: form.values.tdPct,
          taxDetails: form.values.isVattable ? details : null
        })

        const updatedItem = {
          ...x.item,
          basePrice: itemPriceRow.basePrice,
          unitPrice: itemPriceRow.unitPrice,
          extendedPrice: itemPriceRow.extendedPrice,
          mdValue: itemPriceRow.mdValue,
          mdType: itemPriceRow.mdType,
          baseLaborPrice: itemPriceRow.baseLaborPrice,
          mdAmountPct: itemPriceRow.mdType,
          vatAmount: vatCalcRow.vatAmount
        }

        return {
          ...x,
          item: updatedItem,
          vatAmount: vatCalcRow.vatAmount
        }
      })
    )
    form.setFieldValue('items', finalList)
    window.close()
  }

  const columns = [
    {
      component: 'checkbox',
      label: ' ',
      name: 'checked',
      async onChange({ row: { update, newRow } }) {
        update({
          returnNow: newRow?.checked ? newRow?.balanceQty : 0
        })
      }
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
      name: 'returnNow',
      onChange({ row: { update, newRow } }) {
        if (!newRow.returnNow) {
          update({ returnNow: 0 })

          return
        }
        update({ returnNow: newRow.returnNow > newRow.balanceQty ? 0 : newRow.returnNow, isEditMode: false })
      }
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
        componentSeqNo: item.componentSeqNo
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

        if (currentItem.isEditMode) {
          updatedItem.returnedQty = (updatedItem.returnedQty || 0) - updatedItem.returnNow || 0
          updatedItem.balanceQty = (updatedItem.balanceQty || 0) + updatedItem.returnNow || 0

          if (!currentItem.isEditMode) {
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
