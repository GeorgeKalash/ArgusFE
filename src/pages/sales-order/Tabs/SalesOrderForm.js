import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import { Grid, FormControlLabel, Checkbox } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { SystemFunction } from 'src/resources/SystemFunction'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { SaleRepository } from 'src/repositories/SaleRepository'
import { FinancialRepository } from 'src/repositories/FinancialRepository'
import { useForm } from 'src/hooks/form'
import WorkFlow from 'src/components/Shared/WorkFlow'
import { useWindow } from 'src/windows'
import { ControlContext } from 'src/providers/ControlContext'
import {
  getIPR,
  DIRTYFIELD_QTY,
  DIRTYFIELD_BASE_PRICE,
  DIRTYFIELD_UNIT_PRICE,
  DIRTYFIELD_MDAMOUNT,
  DIRTYFIELD_UPO,
  DIRTYFIELD_EXTENDED_PRICE
} from 'src/utils/ItemPriceCalculator'
import { getVatCalc } from 'src/utils/VatCalculator'
import { getFooterTotals, getSubtotal } from 'src/utils/FooterCalculator'

export default function SalesOrderForm({ labels, access: maxAccess, siteId, recordId, defaultSalesTD, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)
  const [cycleButtonState, setCycleButtonState] = useState({ text: '%', value: 2 })

  const [initialValues, setInitialData] = useState({
    recordId: recordId || null,
    dtId: '',
    reference: '',
    date: new Date(),
    dueDate: new Date(),
    plantId: '',
    clientId: '',
    currencyId: '',
    szId: '',
    spId: '',
    siteId: parseInt(siteId),
    description: '',
    status: 1,
    releaseStatus: '',
    wip: 1,
    deliveryStatus: 1,
    printStatusName: '',
    isVattable: false,
    exWorks: false,
    taxId: '',
    shipAddress: '',
    billAddress: '',
    subtotal: '',
    miscAmount: 0,
    amount: '',
    vatAmount: '',
    tdAmount: 0,
    overdraft: false,
    plId: '',
    ptId: '',
    billToAddressId: '',
    shipToAddressId: '',
    maxDiscount: '',
    currentDiscount: '',
    exRate: 1,
    rateCalcMethod: '',
    tdType: '',
    tdPct: 0,
    baseAmount: 0,
    volume: '',
    weight: '',
    qty: 0,
    totQty: 0,
    totWeight: 0,
    totVolume: 0,
    items: [
      {
        id: 1,
        orderId: recordId || 0,
        itemId: '',
        sku: '',
        itemName: '',
        seqNo: '',
        siteId: '',
        muId: '',
        qty: 0,
        volume: 0,
        weight: 1,
        msId: 0,
        muQty: 0,
        baseQty: 0,
        mdType: 1,
        basePrice: 0,
        mdValue: 0,
        unitPrice: 0,
        unitCost: 0,
        overheadId: '',
        vatAmount: 0,
        mdAmount: 0,
        upo: 0,
        extendedPrice: 0,
        priceType: 1,
        applyVat: false, //must be equal to isVattable
        notes: ''
      }
    ]
  })

  const invalidate = useInvalidate({
    endpointId: SaleRepository.SalesOrder.qry
  })

  const { formik } = useForm({
    maxAccess,
    initialValues,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      date: yup.string().required(),
      currencyId: yup.string().required(),
      clientId: yup.string().required(),
      items: yup.array().of(
        yup.object({
          sku: yup.string().required(),
          itemName: yup.string().required(),
          qty: yup.number().required().min(1)
        })
      )
    }),
    onSubmit: async obj => {
      try {
        const copy = { ...obj }
        delete copy.items
        copy.date = formatDateToApi(copy.date)
        copy.dueDate = formatDateToApi(copy.dueDate)

        if (!obj.rateCalcMethod) delete copy.rateCalcMethod

        const updatedRows = formik.values.items.map((itemDetails, index) => {
          const { physicalProperty, ...rest } = itemDetails
          const seqNo = index + 1

          return {
            ...rest,
            seqNo: seqNo,
            siteId: obj.siteId
          }
        })

        const itemsGridData = {
          header: copy,
          items: updatedRows
        }

        const soRes = await postRequest({
          extension: SaleRepository.SalesOrder.set2,
          record: JSON.stringify(itemsGridData)
        })

        const actionMessage = editMode ? platformLabels.Edited : platformLabels.Added
        toast.success(actionMessage)
        const soHeader = await getSalesOrder(soRes.recordId)
        const soItems = await getSalesOrderItems(soRes.recordId)
        await fillForm(soHeader, soItems)
        invalidate()
      } catch (error) {}
    }
  })

  const editMode = !!formik.values.recordId
  const isClosed = formik.values.wip === 2

  const columns = [
    {
      component: 'resourcelookup',
      label: labels.sku,
      name: 'sku',
      props: {
        endpointId: InventoryRepository.Item.snapshot,
        parameters: '_categoryId=0&_msId=0&_startAt=0&_size=1000',
        displayField: 'sku',
        valueField: 'recordId',
        mapping: [
          { from: 'recordId', to: 'itemId' },
          { from: 'sku', to: 'sku' },
          { from: 'name', to: 'itemName' }
        ],
        columnsInDropDown: [
          { key: 'sku', value: 'SKU' },
          { key: 'name', value: 'Item Name' }
        ],
        displayFieldWidth: 2
      },
      async onChange({ row: { update, newRow } }) {
        if (!newRow.itemId) return
        const itemPhysProp = await getItemPhysProp(newRow.itemId)
        const itemVat = await getItemVat(newRow.itemId)
        const ItemConvertPrice = await getItemConvertPrice(newRow.itemId)

        update({
          //  volume: parseFloat(itemPhysProp?.volume) || 0,
          weight: parseFloat(itemPhysProp?.weight || 0).toFixed(2),
          vatAmount: parseFloat(itemVat?.vatPct || 0).toFixed(2),
          basePrice: parseFloat(ItemConvertPrice?.basePrice || 0).toFixed(5),
          unitPrice: parseFloat(ItemConvertPrice?.unitPrice || 0).toFixed(5),
          upo: parseFloat(ItemConvertPrice?.upo || 0).toFixed(5),
          priceType: ItemConvertPrice?.priceType || 1,
          mdAmount: 0,
          qty: 0,
          extendedPrice: 0,
          mdValue: 0
        })

        formik.setFieldValue('mdAmount', formik.values.currentDiscount ? formik.values.currentDiscount : 0)
      }
    },
    {
      component: 'textfield',
      label: labels.name,
      name: 'itemName',
      props: {
        readOnly: true
      }
    },
    {
      component: 'resourcecombobox',
      label: labels.site,
      name: 'siteRef',
      props: {
        endpointId: InventoryRepository.Site.qry,
        displayField: 'reference',
        valueField: 'recordId',
        mapping: [
          { from: 'recordId', to: 'siteId' },
          { from: 'reference', to: 'siteRef' },
          { from: 'name', to: 'siteName' }
        ],
        columnsInDropDown: [
          { key: 'reference', value: 'Reference' },
          { key: 'name', value: 'Name' }
        ],
        displayFieldWidth: 3
      }
    },
    {
      component: 'textfield',
      label: labels.measurementUnit,
      name: 'muRef'
    },
    {
      component: 'numberfield',
      label: labels.quantity,
      name: 'qty',
      updateOn: 'blur',
      onChange({ row: { update, newRow } }) {
        //const calculatedFields =
        getItemPriceRow(update, newRow, DIRTYFIELD_QTY)

        // const updatedItems = updateItemFields(calculatedFields, newRow)

        //calcTotals(updatedItems)
      }
    },
    {
      component: 'numberfield',
      label: labels.volume,
      name: 'volume'
    },
    {
      component: 'numberfield',
      label: labels.weight,
      name: 'weight'
    },
    {
      component: 'numberfield',
      label: labels.basePrice,
      name: 'basePrice',
      updateOn: 'blur',
      async onChange({ row: { update, newRow } }) {
        //const calculatedFields =
        getItemPriceRow(update, newRow, DIRTYFIELD_BASE_PRICE)

        // const updatedItems = updateItemFields(calculatedFields, newRow)
        // calcTotals(updatedItems)
      }
    },
    {
      component: 'numberfield',
      label: labels.unitPrice,
      name: 'unitPrice',
      updateOn: 'blur',
      async onChange({ row: { update, newRow } }) {
        //const calculatedFields =
        getItemPriceRow(update, newRow, DIRTYFIELD_UNIT_PRICE)

        // const updatedItems = updateItemFields(calculatedFields, newRow)
        // calcTotals(updatedItems)
      }
    },
    {
      component: 'numberfield',
      label: labels.upo,
      name: 'upo',
      updateOn: 'blur',
      async onChange({ row: { update, newRow } }) {
        //const calculatedFields =
        getItemPriceRow(update, newRow, DIRTYFIELD_UPO)

        // const updatedItems = updateItemFields(calculatedFields, newRow)
        // calcTotals(updatedItems)
      }
    },
    {
      component: 'numberfield',
      label: labels.VAT,
      name: 'vatAmount'
    },
    {
      component: 'numberfield',
      label: labels.tax,
      name: 'taxDetails'
    },
    {
      component: 'numberfield',
      label: labels.mdAmount,
      name: 'mdAmount',
      updateOn: 'blur',
      async onChange({ row: { update, newRow } }) {
        //const calculatedFields =
        getItemPriceRow(update, newRow, DIRTYFIELD_MDAMOUNT)

        // const updatedItems = updateItemFields(calculatedFields, newRow)
        checkMdAmountPct(newRow, update)

        //calcTotals(updatedItems)
      }
    },
    {
      component: 'numberfield',
      label: labels.sales,
      name: 'saTrx'
    },
    {
      component: 'numberfield',
      label: labels.extendedPrice,
      name: 'extendedPrice',
      updateOn: 'blur',
      async onChange({ row: { update, newRow } }) {
        getItemPriceRow(update, newRow, DIRTYFIELD_EXTENDED_PRICE)
      }
    },
    {
      component: 'textfield',
      label: labels.notes,
      name: 'notes'
    }
  ]

  async function onClose() {
    try {
      const copy = { ...formik.values }
      delete copy.items
      copy.date = formatDateToApi(copy.date)
      copy.dueDate = formatDateToApi(copy.dueDate)

      const res = await postRequest({
        extension: SaleRepository.SalesOrder.close,
        record: JSON.stringify(copy)
      })
      toast.success(platformLabels.Closed)
      invalidate()
      const soHeader = await getSalesOrder(res.recordId)
      const soItems = await getSalesOrderItems(res.recordId)
      fillForm(soHeader, soItems)
    } catch (error) {}
  }

  async function onReopen() {
    try {
      const copy = { ...formik.values }
      delete copy.items
      copy.date = formatDateToApi(copy.date)
      copy.dueDate = formatDateToApi(copy.dueDate)

      const res = await postRequest({
        extension: SaleRepository.SalesOrder.reopen,
        record: JSON.stringify(copy)
      })

      toast.success(platformLabels.Reopened)
      invalidate()
      const soHeader = await getSalesOrder(res.recordId)
      const soItems = await getSalesOrderItems(res.recordId)
      fillForm(soHeader, soItems)
    } catch (error) {}
  }

  async function onCancel() {
    try {
      const copy = { ...formik.values }
      delete copy.items
      copy.date = formatDateToApi(copy.date)
      copy.dueDate = formatDateToApi(copy.dueDate)

      const res = await postRequest({
        extension: SaleRepository.SalesOrder.cancel,
        record: JSON.stringify(copy)
      })

      toast.success(platformLabels.Cancel)
      invalidate()
      const soHeader = await getSalesOrder(res.recordId)
      const soItems = await getSalesOrderItems(res.recordId)
      fillForm(soHeader, soItems)
    } catch (error) {}
  }

  async function toInvoice() {
    try {
      const copy = { ...formik.values }
      delete copy.items
      copy.date = formatDateToApi(copy.date)
      copy.dueDate = formatDateToApi(copy.dueDate)

      const res = await postRequest({
        extension: SaleRepository.SalesOrder.postToInvoice,
        record: JSON.stringify(copy)
      })

      toast.success(platformLabels.Invoice)
      invalidate()
      window.close()
    } catch (error) {}
  }

  async function onWorkFlowClick() {
    stack({
      Component: WorkFlow,
      props: {
        functionId: SystemFunction.SalesOrder,
        recordId: formik.values.recordId
      },
      width: 950,
      height: 600,
      title: 'Workflow'
    })
  }

  const actions = [
    {
      key: 'RecordRemarks',
      condition: true,
      onClick: 'onRecordRemarks',
      disabled: !editMode
    },
    {
      key: 'Close',
      condition: !isClosed,
      onClick: onClose,
      disabled: isClosed || !editMode
    },
    {
      key: 'Reopen',
      condition: isClosed,
      onClick: onReopen,
      disabled: !isClosed || formik.values.status == 3 || formik.values.deliveryStatus == 4
    },
    {
      key: 'Cancel',
      condition: true,
      onClick: onCancel,
      disabled: !((formik.values.deliveryStatus == 2 || formik.values.deliveryStatus == 1) && formik.values.status == 4)
    },
    {
      key: 'WorkFlow',
      condition: true,
      onClick: onWorkFlowClick,
      disabled: !editMode
    },
    {
      key: 'Invoice',
      condition: true,
      onClick: toInvoice,
      disabled: !(formik.values.deliveryStatus === 1 && formik.values.status !== 3 && isClosed)
    }
  ]

  async function fillForm(soHeader, soItems) {
    const shipAdd = await getAddress(soHeader?.record?.shipToAddressId)
    const billAdd = await getAddress(soHeader?.record?.billToAddressId)

    soHeader?.record?.tdType == 1 || soHeader?.record?.tdType == null
      ? setCycleButtonState({ text: '123', value: 1 })
      : setCycleButtonState({ text: '%', value: 2 })

    const modifiedList = soItems.list.map((item, index) => ({
      ...item,
      id: index + 1
    }))

    formik.setValues({
      ...soHeader.record,
      shipToAddressId: soHeader?.record?.shipToAddressId,
      billToAddressId: soHeader?.record?.billToAddressId,
      tdAmount:
        soHeader?.record?.tdType == 1 || soHeader?.record?.tdType == null
          ? soHeader?.record?.tdAmount
          : soHeader?.record?.tdPct,
      shipAddress: shipAdd,
      billAddress: billAdd,
      currentDiscount: soHeader?.record?.tdAmount,
      items: modifiedList
    })
  }

  async function getSalesOrder(soId) {
    const res = await getRequest({
      extension: SaleRepository.SalesOrder.get,
      parameters: `_recordId=${soId}`
    })

    res.record.date = formatDateFromApi(res?.record?.date)

    return res
  }
  async function getSalesOrder(soId) {
    const res = await getRequest({
      extension: SaleRepository.SalesOrder.get,
      parameters: `_recordId=${soId}`
    })

    res.record.date = formatDateFromApi(res?.record?.date)

    return res
  }
  async function getSalesOrderItems(soId) {
    const res = await getRequest({
      extension: SaleRepository.SalesOrderItem.qry,
      parameters: `_params=1|${soId}`
    })

    return res
  }

  async function getAddress(addressId) {
    if (!addressId) return null

    const res = await getRequest({
      extension: SystemRepository.FormattedAddress.get,
      parameters: `_addressId=${addressId}`
    })

    return res?.record?.formattedAddress.replace(/(\r\n|\r|\n)+/g, '\r\n')
  }

  async function fillClientData(clientId) {
    if (!clientId) return

    const res = await getRequest({
      extension: SaleRepository.Client.get,
      parameters: `_recordId=${clientId}`
    })
    formik.setFieldValue('currencyId', res?.record?.currencyId)
    formik.setFieldValue('spId', res?.record?.spId)
    formik.setFieldValue('ptId', res?.record?.ptId)
    formik.setFieldValue('plId', res?.record?.plId)
    formik.setFieldValue('szId', res?.record?.szId)
    formik.setFieldValue('shipToAddressId', res?.record?.shipAddressId)
    formik.setFieldValue('billToAddressId', res?.record?.billAddressId)
    const shipAdd = await getAddress(res?.record?.shipAddressId)
    const billAdd = await getAddress(res?.record?.billAddressId)
    formik.setFieldValue('shipAddress', shipAdd)
    formik.setFieldValue('billAddress', billAdd)
  }
  async function getItemPhysProp(itemId) {
    const res = await getRequest({
      extension: InventoryRepository.ItemPhysProp.get,
      parameters: `_itemId=${itemId}`
    })

    return res?.record
  }
  async function getItemVat(itemId) {
    const res = await getRequest({
      extension: InventoryRepository.Item.get,
      parameters: `_recordId=${itemId}`
    })

    return res?.record
  }
  async function getItemConvertPrice(itemId) {
    const res = await getRequest({
      extension: SaleRepository.ItemConvertPrice.get,
      parameters: `_itemId=${itemId}&_clientId=${formik.values.clientId}&_currencyId=${formik.values.currencyId}&_plId=${formik.values.plId}`
    })

    return res?.record
  }

  const handleCycleButtonClick = () => {
    setCycleButtonState(prevState => {
      const newState = prevState.text === '%' ? { text: '123', value: 1 } : { text: '%', value: 2 }
      formik.setFieldValue('tdType', newState.value)

      return newState
    })
    formik.setFieldValue('tdAmount', 0)
    console.log('check items click')
    calcTotals(formik.values.items, 0)
  }

  function getItemPriceRow(update, newRow, dirtyField) {
    const itemPriceRow = getIPR({
      priceType: newRow?.priceType,
      basePrice: newRow?.basePrice,
      volume: newRow?.volume,
      weight: newRow?.weight,
      unitPrice: newRow?.unitPrice,
      upo: newRow?.upo,
      qty: newRow?.qty,
      extendedPrice: newRow?.extendedPrice,
      mdAmount: newRow?.mdAmount,
      mdType: newRow?.mdType,
      baseLaborPrice: 0,
      totalWeightPerG: 0,
      mdValue: newRow?.mdValue,
      tdPct: formik?.values?.tdPct,
      dirtyField: dirtyField
    })

    const vatCalcRow = getVatCalc({
      basePrice: itemPriceRow?.basePrice,
      qty: itemPriceRow?.qty,
      extendedPrice: itemPriceRow?.extendedPrice,
      baseLaborPrice: itemPriceRow?.baseLaborPrice,
      vatAmount: itemPriceRow?.vatAmount,
      tdPct: formik?.values?.tdPct,
      taxDetails: null
    })

    // const updatedFields = {
    //   id: newRow?.id,
    //   basePrice: itemPriceRow?.basePrice,
    //   unitPrice: itemPriceRow?.unitPrice,
    //   extendedPrice: itemPriceRow?.extendedPrice,
    //   upo: itemPriceRow?.upo,
    //   mdValue: itemPriceRow?.mdValue,
    //   mdType: itemPriceRow?.mdType,
    //   mdAmount: itemPriceRow?.mdAmount,
    //   vatAmount: vatCalcRow?.vatAmount
    // }

    update({
      id: newRow?.id,
      basePrice: parseFloat(itemPriceRow?.basePrice).toFixed(5),
      unitPrice: parseFloat(itemPriceRow?.unitPrice).toFixed(5),
      extendedPrice: parseFloat(itemPriceRow?.extendedPrice).toFixed(5),
      upo: parseFloat(itemPriceRow?.upo).toFixed(5),
      mdValue: itemPriceRow?.mdValue,
      mdType: itemPriceRow?.mdType,
      mdAmount: parseFloat(itemPriceRow?.mdAmount).toFixed(2),
      vatAmount: parseFloat(vatCalcRow?.vatAmount).toFixed(2)
    })

    // recalcGridVat(0)
    //return updatedFields
  }

  function calcTotals(itemsArray, tdAmount) {
    const subtotal = getSubtotal(itemsArray)
    console.log('check items ', tdAmount)
    if (tdAmount != 0) {
      tdAmount =
        formik.values.tdType == 1
          ? parseFloat(formik.values.tdAmount)
          : parseFloat(subtotal) * (parseFloat(formik.values.tdAmount) / 100)
    }

    const _footerSummary = getFooterTotals(itemsArray, {
      totalQty: 0,
      totalWeight: 0,
      totalVolume: 0,
      totalUpo: 0,
      sumVat: 0,
      sumExtended: parseFloat(subtotal),
      tdAmount: tdAmount,
      net: 0,
      miscAmount: parseFloat(formik.values.miscAmount)
    })
    formik.setFieldValue('totVolume', _footerSummary.totalVolume)
    formik.setFieldValue('totWeight', _footerSummary.totalWeight)
    formik.setFieldValue('totQty', _footerSummary.totalQty)
    formik.setFieldValue('subtotal', subtotal)
    formik.setFieldValue('amount', _footerSummary.net)
    formik.setFieldValue('vatAmount', _footerSummary.sumVat)
  }

  function updateItemFields(calculatedFields, newRow) {
    Object.keys(calculatedFields).forEach(key => {
      if (key in newRow) newRow[key] = calculatedFields[key]
    })
    const updatedItems = [...formik.values.items]
    const itemIndex = updatedItems.findIndex(item => item.id === calculatedFields.id)
    if (itemIndex !== -1) {
      updatedItems[itemIndex] = { ...updatedItems[itemIndex], ...newRow }
    }

    return updatedItems
  }

  function ShowMdAmountErrorMessage(actualDiscount, clientMaxDiscount, rowData, update) {
    if (actualDiscount > clientMaxDiscount) {
      formik.setFieldValue('mdAmount', clientMaxDiscount)
      rowData.mdAmount = clientMaxDiscount
      getItemPriceRow(update, rowData, DIRTYFIELD_MDAMOUNT)
      calcTotals(formik.values.items)
      stackError({
        message: labels.clientMaxPctDiscount + ' ' + clientMaxDiscount + '%'
      })
    }
  }

  function ShowMdValueErrorMessage(actualDiscountAmount, clientMaxDiscountValue, rowData, update) {
    if (actualDiscountAmount > clientMaxDiscountValue) {
      formik.setFieldValue('mdType', 2)
      formik.setFieldValue('mdAmount', clientMaxDiscountValue)
      rowData.mdType = 2
      rowData.mdAmount = clientMaxDiscountValue
      getItemPriceRow(update, rowData, DIRTYFIELD_MDAMOUNT)
      calcTotals(formik.values.items)
      stackError({
        message: labels.clientMaxDiscount + ' ' + clientMaxDiscountValue
      })
    }
  }

  function checkMdAmountPct(rowData, update) {
    const maxClientAmountDiscount = rowData.unitPrice * (formik.values.maxDiscount / 100)
    if (!formik.values.maxDiscount) return
    if (rowData.mdType == 1) {
      if (rowData.mdAmount > formik.values.maxDiscount) {
        ShowMdAmountErrorMessage(value, clientMax, rowData, update)

        return false
      } else {
        return true
      }
    } else {
      if (rowData.mdAmount > maxClientAmountDiscount) {
        ShowMdValueErrorMessage(value, maxClientAmountDiscount, rowData, update)

        return false
      } else {
        return true
      }
    }
  }

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const soHeader = await getSalesOrder(recordId)
        const soItems = await getSalesOrderItems(recordId)
        await fillForm(soHeader, soItems)
        calcTotals(soItems?.list)
      } else {
        if (defaultSalesTD) {
          setCycleButtonState({ text: '%', value: 2 })
          formik.setFieldValue('tdType', 2)
        } else {
          setCycleButtonState({ text: '123', value: 1 })
          formik.setFieldValue('tdType', 1)
        }
      }
    })()
  }, [])

  useEffect(() => {
    calcTotals(formik.values.items)
  }, [formik.values.items])

  return (
    <FormShell
      resourceId={ResourceIds.SalesOrder}
      form={formik}
      maxAccess={maxAccess}
      previewReport={editMode}
      onClose={onClose}
      onReopen={onReopen}
      isClosed={isClosed}
      actions={actions}
      disabledSubmit={isClosed && !editMode}
      disabledSavedClear={isClosed && !editMode}
    >
      <VertLayout>
        <Fixed>
          <Grid container xs={12}>
            <Grid
              container
              xs={8}
              direction='column'
              spacing={2}
              sx={{ overflowX: 'auto', flexWrap: 'nowrap', pt: '5px' }}
            >
              <Grid
                container
                xs={12}
                direction='row'
                spacing={2}
                sx={{ overflowX: 'auto', flexWrap: 'nowrap', pl: '8px' }}
              >
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SystemRepository.DocumentType.qry}
                    parameters={`_startAt=0&_pageSize=1000&_dgId=${SystemFunction.SalesOrder}`}
                    name='dtId'
                    label={labels.documentType}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    readOnly={isClosed}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    values={formik.values}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('dtId', newValue ? newValue.recordId : null)
                    }}
                    error={formik.touched.dtId && Boolean(formik.errors.dtId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SaleRepository.SalesPerson.qry}
                    name='spId'
                    label={labels.salesPerson}
                    columnsInDropDown={[
                      { key: 'spRef', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    valueField='recordId'
                    displayField='name'
                    values={formik.values}
                    displayFieldWidth={1.5}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('spId', newValue ? newValue.recordId : null)
                    }}
                    error={formik.touched.spId && Boolean(formik.errors.spId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SystemRepository.Currency.qry}
                    name='currencyId'
                    label={labels.currency}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    required
                    values={formik.values}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('currencyId', newValue?.recordId || null)
                      formik.setFieldValue('items', [{ id: 1 }])
                    }}
                    error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
                  />
                </Grid>
              </Grid>
              <Grid
                container
                xs={12}
                direction='row'
                spacing={2}
                sx={{ overflowX: 'auto', flexWrap: 'nowrap', pl: '8px' }}
              >
                <Grid item xs={12}>
                  <CustomTextField
                    name='reference'
                    label={labels.reference}
                    value={formik?.values?.reference}
                    maxAccess={!editMode && maxAccess}
                    readOnly={editMode}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('reference', '')}
                    error={formik.touched.reference && Boolean(formik.errors.reference)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomDatePicker
                    name='date'
                    label='date'
                    readOnly={isClosed}
                    required
                    value={formik?.values?.date}
                    onChange={formik.handleChange}
                    maxAccess={maxAccess}
                    onClear={() => formik.setFieldValue('date', '')}
                    error={formik.touched.date && Boolean(formik.errors.date)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SystemRepository.Plant.qry}
                    name='plantId'
                    label={labels.plant}
                    readOnly={isClosed}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik.values}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('plantId', newValue ? newValue.recordId : null)
                    }}
                    displayFieldWidth={2}
                    error={formik.touched.plantId && Boolean(formik.errors.plantId)}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid container xs={4} direction='column' spacing={2} sx={{ flexWrap: 'nowrap', pl: '5px' }}>
              <Grid container xs={12} direction='row' spacing={2} sx={{ flexWrap: 'nowrap' }}>
                <Grid item xs={12}>
                  <CustomTextArea
                    name='shipAddress'
                    label={labels.shipTo}
                    value={formik.values.shipAddress}
                    rows={3}
                    maxLength='100'
                    readOnly={formik.values.exWorks}
                    maxAccess={maxAccess}
                    onChange={e => formik.setFieldValue('shipAddress', e.target.value)}
                    onClear={() => formik.setFieldValue('shipAddress', '')}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextArea
                    name='BillAddress'
                    label='bill to'
                    value={formik.values.billAddress}
                    rows={3}
                    maxLength='100'
                    maxAccess={maxAccess}
                    onChange={e => formik.setFieldValue('BillAddress', e.target.value)}
                    onClear={() => formik.setFieldValue('BillAddress', '')}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid
              container
              xs={12}
              direction='row'
              spacing={2}
              sx={{ overflow: 'hidden', flexWrap: 'nowrap', pt: '5px' }}
            >
              <Grid item xs={12}>
                <ResourceLookup
                  endpointId={SaleRepository.Client.snapshot}
                  valueField='reference'
                  displayField='name'
                  name='clientId'
                  label={labels.client}
                  form={formik}
                  required
                  readOnly={isClosed}
                  displayFieldWidth={2}
                  valueShow='clientRef'
                  secondValueShow='clientName'
                  maxAccess={maxAccess}
                  editMode={editMode}
                  onChange={async (event, newValue) => {
                    formik.setFieldValue('clientId', newValue?.recordId)
                    formik.setFieldValue('clientName', newValue?.name)
                    formik.setFieldValue('clientRef', newValue?.reference)
                    formik.setFieldValue('isVattable', newValue?.IsSubjectToVat || false)
                    formik.setFieldValue('maxDiscount', newValue?.maxDiscount)
                    formik.setFieldValue('currentDiscount', newValue?.tdPct)
                    formik.setFieldValue('taxId', newValue?.taxId)
                    fillClientData(newValue?.recordId)
                  }}
                  errorCheck={'clientId'}
                />
              </Grid>
              <Grid item xs={2}>
                <FormControlLabel
                  control={
                    <Checkbox name='vat' checked={formik.values?.isVattable} readOnly onChange={formik.handleChange} />
                  }
                  label='VAT'
                />
              </Grid>
              <Grid item xs={6}>
                <ResourceComboBox
                  endpointId={FinancialRepository.TaxSchedules.qry}
                  name='taxId'
                  label={labels.tax}
                  valueField='recordId'
                  displayField={['reference', 'name']}
                  columnsInDropDown={[
                    { key: 'reference', value: 'Reference' },
                    { key: 'name', value: 'Name' }
                  ]}
                  readOnly
                  values={formik.values}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('taxId', newValue ? newValue.recordId : '')
                  }}
                  error={formik.touched.taxId && Boolean(formik.errors.taxId)}
                  maxAccess={maxAccess}
                />
              </Grid>
              <Grid item xs={6}>
                <ResourceComboBox
                  endpointId={InventoryRepository.Site.qry}
                  name='siteId'
                  readOnly={isClosed}
                  label={labels.site}
                  columnsInDropDown={[
                    { key: 'reference', value: 'Reference' },
                    { key: 'name', value: 'Name' }
                  ]}
                  values={formik.values}
                  valueField='recordId'
                  displayField={['reference', 'name']}
                  maxAccess={maxAccess}
                  displayFieldWidth={2}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('siteId', newValue ? newValue.recordId : null)
                    formik.setFieldValue('siteRef', newValue ? newValue.reference : null)
                    formik.setFieldValue('siteName', newValue ? newValue.name : null)
                  }}
                  error={formik.touched.siteId && Boolean(formik.errors.siteId)}
                />
              </Grid>
              <Grid item xs={6}>
                <ResourceComboBox
                  endpointId={SaleRepository.SalesZone.qry}
                  parameters={`_startAt=0&_pageSize=1000&_sortField="recordId"&_filter=`}
                  name='szId'
                  label={labels.saleZone}
                  columnsInDropDown={[{ key: 'name', value: 'Name' }]}
                  valueField='recordId'
                  displayField='name'
                  values={formik.values}
                  displayFieldWidth={1.5}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('szId', newValue ? newValue.recordId : null)
                  }}
                  error={formik.touched.szId && Boolean(formik.errors.szId)}
                />
              </Grid>
              <Grid item xs={4}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name='exWorks'
                      checked={formik.values?.exWorks}
                      onChange={event => {
                        const { name, checked } = event.target
                        formik.setFieldValue(name, checked)
                        if (checked) {
                          formik.setFieldValue('shipAddress', '')
                        }
                      }}
                    />
                  }
                  label={labels.exWorks}
                />
              </Grid>
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
          />
        </Grow>

        <Fixed>
          <Grid container rowGap={1} xs={12}>
            <Grid container rowGap={1} xs={6} style={{ marginTop: '10px' }}>
              <Grid item xs={12} sx={{ pr: '5px' }}>
                <CustomTextArea
                  name='description'
                  label='notes'
                  value={formik.values.description}
                  rows={3}
                  editMode={editMode}
                  maxAccess={maxAccess}
                  onChange={e => formik.setFieldValue('description', e.target.value)}
                  onClear={() => formik.setFieldValue('description', '')}
                  error={formik.touched.description && Boolean(formik.errors.description)}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Checkbox name='overdraft' checked={formik.values?.overdraft} readOnly />}
                  label={labels.overdraft}
                />
              </Grid>
            </Grid>

            <Grid
              container
              direction='row'
              xs={6}
              spacing={2}
              sx={{ overflow: 'hidden', flexWrap: 'nowrap', pt: '5px' }}
            >
              <Grid container item xs={6} direction='column' spacing={2} sx={{ px: 2, mt: 1 }}>
                <Grid item>
                  <CustomNumberField name='totalQTY' label={labels.totQty} value={formik.values.totQty} readOnly />
                </Grid>
                <Grid item>
                  <CustomNumberField
                    name='totVolume'
                    maxAccess={maxAccess}
                    label={labels.totVolume}
                    value={formik.values.totVolume}
                    readOnly
                  />
                </Grid>
                <Grid item>
                  <CustomNumberField
                    name='totWeight'
                    maxAccess={maxAccess}
                    label={labels.totWeight}
                    value={formik.values.totWeight}
                    readOnly
                  />
                </Grid>
              </Grid>

              <Grid container item xs={6} direction='column' spacing={2} sx={{ px: 2, mt: 1 }}>
                <Grid item>
                  <CustomNumberField
                    name='subTotal'
                    maxAccess={maxAccess}
                    label={labels.subtotal}
                    value={formik.values.subtotal}
                    readOnly
                  />
                </Grid>
                <Grid item>
                  <CustomNumberField
                    name='discount'
                    maxAccess={maxAccess}
                    label={labels.discount}
                    value={formik.values.tdAmount}
                    displayCycleButton={true}
                    cycleButtonLabel={cycleButtonState.text}
                    maxLength={formik.values.tdType === 2 ? 4 : 50}
                    handleCycleButtonClick={handleCycleButtonClick}
                    onChange={e => formik.setFieldValue('tdAmount', e.target.value)}
                    onBlur={async () => {
                      calcTotals(formik.values.items)
                    }}
                  />
                </Grid>
                <Grid item>
                  <CustomNumberField
                    name='miscAmount'
                    maxAccess={maxAccess}
                    label={labels.misc}
                    value={formik.values.miscAmount}
                    onChange={e => formik.setFieldValue('miscAmount', e.target.value)}
                    onBlur={async () => {
                      calcTotals(formik.values.items)
                    }}
                  />
                </Grid>
                <Grid item>
                  <CustomNumberField
                    name='vat'
                    maxAccess={maxAccess}
                    label={labels.VAT}
                    value={formik.values.vatAmount}
                    readOnly
                  />
                </Grid>
                <Grid item>
                  <CustomNumberField
                    name='net'
                    maxAccess={maxAccess}
                    label={labels.net}
                    value={formik.values.amount}
                    readOnly
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}
