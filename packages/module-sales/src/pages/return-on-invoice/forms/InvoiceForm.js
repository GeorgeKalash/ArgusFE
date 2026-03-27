import { Grid } from '@mui/material'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { SaleRepository } from '@argus/repositories/src/repositories/SaleRepository'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import { useContext, useEffect } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import { getIPR, DIRTYFIELD_QTY } from '@argus/shared-utils/src/utils/ItemPriceCalculator'
import { getVatCalc } from '@argus/shared-utils/src/utils/VatCalculator'
import { FinancialRepository } from '@argus/repositories/src/repositories/FinancialRepository'
import Form from '@argus/shared-ui/src/components/Shared/Form'
import { formatDateFromApi } from '@argus/shared-domain/src/lib/date-helper'

export default function InvoiceForm({ form, maxAccess, labels, setReCal, buildCalculatedTaxDetails, window }) {
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

  async function importItems(importAll) {
    const rawItems = formik?.values?.items || []

    const filteredItems = rawItems
      .filter(item => (!importAll ? item.checked === true && item.balanceQty > 0 : true))
      .map((item, index) => {
        const returnNow = importAll ? item.balanceQty : item.returnNow

        return {
          ...item,
          item: {
            ...item.item,
            id: index + 1,
            returnedQty: item.returnedQty,
            returnNowQty: item.returnNow,
            returnNow,
            invoiceId: form.values.header.invoiceId,
            invoiceSeqNo: item.item.seqNo,
            invoiceDate: form.values.header.invoiceDate ? formatDateFromApi(form.values.header.invoiceDate) : null,
            itemCategoryName: item?.categoryName || '',
            extendedPrice:
              item.item.extendedPrice != 0
                ? (returnNow * item.item.extendedPrice) / item.item.qty
                : item.item.extendedPrice
          }
        }
      })
    if (filteredItems.length === 0) return

    const finalList = await Promise.all(
      filteredItems.map(async (entry, index) => {
        const { item, qty, balanceQty, returnedQty } = entry

        const effectiveTaxId = !form.values.header.isVattable
          ? null
          : form.values.header.taxId
          ? item.taxId
            ? form.values.header.taxId
            : null
          : item.taxId ?? null

        const itemPriceRow = getIPR({
          priceType: item?.priceType || 0,
          basePrice: parseFloat(item?.basePrice) || 0,
          volume: parseFloat(item?.volume),
          weight: parseFloat(item?.weight),
          unitPrice: parseFloat(item?.unitPrice || 0),
          upo: item?.upo,
          qty: item?.returnNow == 0 ? parseFloat(balanceQty) : parseFloat(item?.returnNow),
          extendedPrice: parseFloat(item?.extendedPrice),
          mdAmount: parseFloat(item?.mdAmount),
          mdType: parseInt(item?.mdType),
          baseLaborPrice: 0,
          totalWeightPerG: 0,
          mdValue: parseFloat(item?.mdValue),
          tdPct: item?.values?.tdPct || 0,
          dirtyField: DIRTYFIELD_QTY
        })

        let rowTax
        let rowTaxDetails
        
        if (effectiveTaxId) {
          const taxDetailsResponse = await getTaxDetails(effectiveTaxId)
          rowTax = effectiveTaxId
          rowTaxDetails = buildCalculatedTaxDetails(item, taxDetailsResponse)
        }

        const vatCalcRow = getVatCalc({
          priceType: itemPriceRow?.priceType,
          basePrice: (form.values.header.metalPrice || 0) * (form.values.header.metalPurity || 0),
          qty: itemPriceRow?.qty,
          weight: itemPriceRow?.weight,
          extendedPrice: parseFloat(itemPriceRow.extendedPrice) || 0,
          baseLaborPrice: itemPriceRow.baseLaborPrice || 0,
          vatAmount: 0,
          tdPct: form.values.header.tdPct,
          taxDetails: form.values.header.isVattable && rowTaxDetails
            ? rowTaxDetails.map(td => ({
                ...td,
                amount: td.taxScheduleAmount
              }))
            : null
        })

        return {
          ...item,
          id: index + 1,
          taxId: rowTax,
          basePrice: itemPriceRow.basePrice,
          unitPrice: itemPriceRow.unitPrice,
          extendedPrice: itemPriceRow.extendedPrice,
          mdValue: itemPriceRow.mdValue,
          mdType: itemPriceRow.mdType,
          baseLaborPrice: itemPriceRow.baseLaborPrice,
          mdAmountPct: itemPriceRow.mdType,
          vatAmount: vatCalcRow.vatAmount,
          returnedQty,
          balanceQty,
          returnNowQty: (itemPriceRow?.qty || 0).toFixed(item?.decimals || 0),
          totalWeight: (itemPriceRow.weight || 0) * (itemPriceRow.qty || 0),
          taxDetails: form.values.header.isVattable && rowTaxDetails
            ? rowTaxDetails.map(td => ({
                ...td,
                amount: td.taxScheduleAmount
              }))
            : null,
          invoiceId: form.values.header.invoiceId,
          invoiceDate: form.values.header.invoiceDate ? formatDateFromApi(form.values.header.invoiceDate) : null,
          itemCategoryName: item.categoryName,
          baseQty: (itemPriceRow?.qty || 0).toFixed(item?.decimals || 0) * item?.muQty
        }
      })
    )
    form.setFieldValue('items', finalList)
    setReCal(true)
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
      updateOn: 'blur',
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
      onClick: () => {
        importItems(false)
      },
      disabled: formik.values.items.every(item => !item.checked)
    },
    {
      key: 'ImportAll',
      condition: true,
      onClick: () => {
        importItems(true)
      }
    }
  ]

  async function fetchGridData() {
    let items = []
    if (form?.values?.recordId) {
      const retItems = await getRequest({
        extension: SaleRepository.ReturnItem.qry,
        parameters: `_returnId=${form.values.recordId}`
      })

      items = retItems?.list?.map(item => ({
        ...item,
        returnNowQty: item.qty,
        componentSeqNo: item.componentSeqNo || 0,
        isEditMode: true
      }))
    }

    const combined = items.length > 0 ? [...items, ...form.values.items] : form.values.items

    const combinedList =
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

    const allLists = combinedList.map(x => {
      if (!x.isEditMode) x.isEditMode = false

      return x
    })

    const listReq = await getRequest({
      extension: SaleRepository.ReturnItem.balance,
      parameters: `_invoiceId=${form.values.header.invoiceId}`
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
        itemCategoryName: x.item.categoryName,
        itemName: x.item.itemName,
        qty: x.item.qty || 0
      }

      const currentItem = indexInAllLists != -1 ? allLists[indexInAllLists] : null

      if (currentItem) {
        updatedItem.checked = existsInFormValues
        updatedItem.returnNow = currentItem.returnNow || currentItem.returnNowQty

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
        updatedItem.item.invoiceId = form?.values?.header?.invoiceId ? parseInt(form.values.header?.invoiceId) : 0
        updatedItem.item.invoiceRef = form?.values?.header?.invoiceRef || null
        updatedItem.item.invoiceDate = form?.values?.header?.invoiceDate ? formatDateFromApi(form?.values?.header?.invoiceDate) : null
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
    fetchGridData()
  }, [])

  return (
    <Form isSaved={false} actions={actions} maxAccess={maxAccess} editMode={true}>
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
                    formObject={form.values.header}
                    readOnly
                    valueShow='clientRef'
                    secondValueShow='clientName'
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SaleRepository.ReturnOnInvoice.balance}
                    parameters={`_clientId=${form.values.header?.clientId}&_returnDate=${
                      form?.values?.header?.date?.toISOString().split('T')[0] + 'T00:00:00'
                    }`}
                    name='invoiceId'
                    label={labels.invoice}
                    valueField='recordId'
                    displayField='reference'
                    readOnly
                    values={form.values.header}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={6}>
              <CustomDatePicker name='date' label={labels.date} value={form?.values?.header?.date} readOnly />
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
            allowAddNewLine={false}
          />
        </Grow>
      </VertLayout>
    </Form>
  )
}
