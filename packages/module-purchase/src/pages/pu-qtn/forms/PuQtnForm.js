import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import { formatDateFromApi, formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'
import { Grid } from '@mui/material'
import { useContext, useEffect, useRef, useState } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import CustomTextArea from '@argus/shared-ui/src/components/Inputs/CustomTextArea'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import { FinancialRepository } from '@argus/repositories/src/repositories/FinancialRepository'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import WorkFlow from '@argus/shared-ui/src/components/Shared/WorkFlow'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import {
  getIPR,
  DIRTYFIELD_QTY,
  DIRTYFIELD_BASE_PRICE,
  DIRTYFIELD_UNIT_PRICE,
  DIRTYFIELD_MDAMOUNT,
  DIRTYFIELD_EXTENDED_PRICE,
  MDTYPE_AMOUNT,
  MDTYPE_PCT
} from '@argus/shared-utils/src/utils/ItemPriceCalculator'
import { getVatCalc } from '@argus/shared-utils/src/utils/VatCalculator'
import { getDiscValues, getFooterTotals, getSubtotal } from '@argus/shared-utils/src/utils/FooterCalculator'
import { useError } from '@argus/shared-providers/src/providers/error'
import { useDocumentType } from '@argus/shared-hooks/src/hooks/documentReferenceBehaviors'
import CustomCheckBox from '@argus/shared-ui/src/components/Inputs/CustomCheckBox'
import { createConditionalSchema } from '@argus/shared-domain/src/lib/validation'
import { PurchaseRepository } from '@argus/repositories/src/repositories/PurchaseRepository'
import CustomButton from '@argus/shared-ui/src/components/Inputs/CustomButton'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import TaxDetails from '@argus/shared-ui/src/components/Shared/TaxDetails'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'
import useResourceParams from '@argus/shared-hooks/src/hooks/useResourceParams'
import { DefaultsContext } from '@argus/shared-providers/src/providers/DefaultsContext'

export default function PuQtnForm({ recordId, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { stack: stackError } = useError()
  const { platformLabels } = useContext(ControlContext)
  const { systemDefaults, userDefaults } = useContext(DefaultsContext)

  const [cycleButtonState, setCycleButtonState] = useState({ text: '%', value: 2 })
  const filteredMeasurements = useRef([])
  const [measurements, setMeasurements] = useState([])
  const [reCal, setReCal] = useState(false)
  const plantId = parseInt(userDefaults?.list?.find(({ key }) => key === 'plantId')?.value)
  const currencyId = parseInt(systemDefaults?.list?.find(({ key }) => key === 'currencyId')?.value)

  const { labels, access } = useResourceParams({
    datasetId: ResourceIds.PurchaseQuotations,
    editMode: !!recordId
  })

  useSetWindow({ title: labels.quotations, window })

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.PurchaseQuotation,
    access,
    enabled: !recordId
  })

  const initialValues = {
    recordId: null,
    dtId: null,
    reference: '',
    status: 1,
    date: new Date(),
    plantId,
    vendorId: null,
    vendorRef: '',
    vendorName: '',
    deliveryMethodId: null,
    currencyId,
    vendorDocRef: null,
    subtotal: 0,
    tdPct: 0,
    tdAmount: 0,
    tdType: 2,
    paymentMethod: null,
    miscAmount: 0,
    amount: 0,
    description: '',
    isVattable: false,
    vatAmount: 0,
    qty: 0,
    mdValue: 0,
    mdPct: 0,
    deliveryDate: null,
    weight: 0,
    volume: 0,
    items: [
      {
        id: 1,
        quotationId: recordId || 0,
        itemId: null,
        sku: '',
        itemName: '',
        seqNo: 1,
        siteId: null,
        muId: null,
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
        vatAmount: 0,
        mdAmount: 0,
        upo: 0,
        extendedPrice: 0,
        mdAmountPct: null,
        priceType: 1,
        applyVat: false,
        taxId: null,
        taxDetails: null,
        notes: null
      }
    ]
  }

  const invalidate = useInvalidate({
    endpointId: PurchaseRepository.PurchaseQuotation.page
  })

  const conditions = {
    sku: row => row?.sku,
    qty: row => row?.qty > 0
  }
  const { schema, requiredFields } = createConditionalSchema(conditions, true, maxAccess, 'items')

  const { formik } = useForm({
    maxAccess,
    documentType: { key: 'dtId', value: documentType?.dtId, reference: documentType?.reference },
    conditionSchema: ['items'],
    initialValues,
    validateOnChange: true,
    validationSchema: yup.object({
      currencyId: yup.number().required(),
      vendorId: yup.number().required(),
      date: yup.date().required(),
      items: yup.array().of(schema)
    }),
    onSubmit: async obj => {
      const copy = {
        ...obj,
        date: formatDateToApi(obj.date),
        deliveryDate: obj.deliveryDate ? formatDateToApi(obj.deliveryDate) : null,
        miscAmount: obj.miscAmount || 0
      }
      delete copy.items

      const updatedRows = obj.items
        .filter(row => Object.values(requiredFields)?.every(fn => fn(row)))
        .map((itemDetails, index) => {
          return {
            ...itemDetails,
            seqNo: index + 1,
            deliveryDate: itemDetails?.deliveryDate ? formatDateToApi(itemDetails.deliveryDate) : null,
            lastPurchaseDate: itemDetails?.lastPurchaseDate ? formatDateToApi(itemDetails.lastPurchaseDate) : null,
            applyVat: obj.isVattable || false
          }
        })

      const itemsGridData = {
        header: copy,
        items: updatedRows
      }

      const qtnRes = await postRequest({
        extension: PurchaseRepository.PurchaseQuotation.set2,
        record: JSON.stringify(itemsGridData)
      })
      toast.success(obj.recordId ? platformLabels.Edited : platformLabels.Added)
      await refetchForm(qtnRes.recordId)
      invalidate()
    }
  })

  const editMode = !!formik.values.recordId
  const isRaw = formik.values.status == 1

  async function getFilteredMU(itemId, msId = null) {
    if (!itemId) return
    const currentItemId = formik.values.items?.find(item => parseInt(item.itemId) === itemId)?.msId
    const updatedMsId = !currentItemId ? msId || currentItemId : currentItemId
    const arrayMU = measurements?.filter(item => item.msId == updatedMsId) || []
    filteredMeasurements.current = arrayMU
  }

  const iconKey = ({ value, data }) => {
    const mdType = value?.mdType || data?.mdType

    return mdType === MDTYPE_PCT ? '%' : '123'
  }

  const columns = [
    {
      component: 'resourcelookup',
      label: labels.sku,
      name: 'sku',
      flex: 2,
      props: {
        endpointId: InventoryRepository.Item.snapshot,
        parameters: { _categoryId: 0, _msId: 0, _startAt: 0, _size: 1000 },
        displayField: 'sku',
        valueField: 'sku',
        mapping: [
          { from: 'recordId', to: 'itemId' },
          { from: 'sku', to: 'sku' },
          { from: 'name', to: 'itemName' }
        ],
        columnsInDropDown: [
          { key: 'sku', value: 'SKU' },
          { key: 'name', value: 'Item Name' },
          { key: 'flName', value: 'FL Name' }
        ],
        displayFieldWidth: 5,
        filter: { purchaseItem: true }
      },
      async onChange({ row: { update, newRow } }) {
        if (!newRow.itemId) {
          return
        }
        const itemPhysProp = await getItemPhysProp(newRow.itemId)
        const itemInfo = await getItem(newRow.itemId)
        let rowTax = null
        let rowTaxDetails = null

        if (!formik.values.taxId) {
          if (itemInfo?.taxId) {
            const taxDetailsResponse = await getTaxDetails(itemInfo.taxId)

            const details = taxDetailsResponse.map(item => ({
              taxId: itemInfo.taxId,
              taxCodeId: item.taxCodeId,
              taxBase: item.taxBase,
              amount: item.amount
            }))
            rowTax = itemInfo.taxId
            rowTaxDetails = details
          }
        } else {
          const taxDetailsResponse = await getTaxDetails(formik.values.taxId)

          const details = taxDetailsResponse.map(item => ({
            taxId: formik.values.taxId,
            taxCodeId: item.taxCodeId,
            taxBase: item.taxBase,
            amount: item.amount
          }))
          rowTax = formik.values.taxId
          rowTaxDetails = details
        }

        const filteredMU = measurements?.filter(item => item.msId === itemInfo?.msId)
        getFilteredMU(newRow?.itemId, itemInfo?.msId)

        const filteredItems = filteredMeasurements?.current?.filter(item => item.recordId === newRow?.muId)

        update({
          volume: parseFloat(itemPhysProp?.volume) || 0,
          weight: parseFloat(itemPhysProp?.weight || 0).toFixed(2),
          vatAmount: parseFloat(itemInfo?.vatPct || 0).toFixed(2),
          basePrice: 0,
          unitPrice: 0,
          priceType: itemInfo?.priceType || 1,
          mdAmount: 0,
          qty: 0,
          msId: itemInfo?.msId,
          muRef: filteredMU?.[0]?.reference,
          muId: filteredMU?.[0]?.recordId,
          mdValue: 0,
          taxId: rowTax,
          taxDetails: rowTaxDetails || null,
          baseQty: filteredItems?.[0]?.qty * newRow?.qty
        })
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
      component: 'resourcecombobox',
      label: labels.mu,
      name: 'muRef',
      props: {
        store: filteredMeasurements?.current,
        displayField: 'reference',
        valueField: 'recordId',
        mapping: [
          { from: 'reference', to: 'muRef' },
          { from: 'qty', to: 'muQty' },
          { from: 'recordId', to: 'muId' }
        ]
      },
      async onChange({ row: { update, newRow } }) {
        const filteredItems = filteredMeasurements?.current.filter(item => item.recordId == newRow?.muId)
        update({
          baseQty: newRow?.qty * filteredItems?.[0]?.qty
        })
      },
      propsReducer({ row, props }) {
        return { ...props, store: filteredMeasurements?.current }
      }
    },
    {
      component: 'numberfield',
      label: labels.quantity,
      name: 'qty',
      updateOn: 'blur',
      onChange({ row: { update, newRow } }) {
        const data = getItemPriceRow(newRow, DIRTYFIELD_QTY)
        getFilteredMU(newRow?.itemId, newRow?.msId)
        const filteredItems = filteredMeasurements?.current.filter(item => item.recordId === newRow?.muId)
        update({
          ...data,
          baseQty: filteredItems?.[0]?.qty * newRow?.qty
        })
      }
    },
    {
      component: 'numberfield',
      label: labels.volume,
      name: 'volume',
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.weight,
      name: 'weight',
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.baseprice,
      name: 'basePrice',
      props: {
        decimalScale: 5
      },
      updateOn: 'blur',
      async onChange({ row: { update, newRow } }) {
        const data = getItemPriceRow(newRow, DIRTYFIELD_BASE_PRICE)
        update(data)
      }
    },
    {
      component: 'textfield',
      label: labels.requestRef,
      name: 'requestRef',
      flex: 2,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.unitCost,
      name: 'unitPrice',
      props: {
        decimalScale: 5
      },
      updateOn: 'blur',
      async onChange({ row: { update, newRow } }) {
        const data = getItemPriceRow(newRow, DIRTYFIELD_UNIT_PRICE)
        update(data)
      }
    },
    {
      component: 'numberfield',
      label: labels.VAT,
      name: 'vatAmount',
      props: {
        readOnly: true
      }
    },
    {
      component: 'button',
      name: 'taxDetailsButton',
      props: {
        onCondition: row => {
          return {
            imgSrc: row.itemId && row.taxId ? require('@argus/shared-ui/src/components/images/buttonsIcons/tax-icon.png').default.src : '',
            hidden: !(row.itemId && row.taxId)
          }
        }
      },
      label: labels.tax,
      onClick: (_, row) => {
        stack({
          Component: TaxDetails,
          props: {
            taxId: row?.taxId,
            obj: row
          }
        })
      }
    },
    {
      component: 'numberfield',
      label: labels.markdown,
      name: 'mdAmount',
      updateOn: 'blur',
      flex: 2,
      props: {
        ShowDiscountIcons: true,
        iconsClicked: handleIconClick,
        type: 'numeric',
        iconKey
      },
      async onChange({ row: { update, newRow } }) {
        const data = getItemPriceRow(newRow, DIRTYFIELD_MDAMOUNT)
        update(data)
      }
    },
    {
      component: 'numberfield',
      label: labels.extendedprice,
      name: 'extendedPrice',
      updateOn: 'blur',
      async onChange({ row: { update, newRow } }) {
        const data = getItemPriceRow(newRow, DIRTYFIELD_EXTENDED_PRICE)
        update(data)
      }
    },
    {
      component: 'textfield',
      label: labels.notes,
      name: 'notes',
      flex: 2
    },
    {
      component: 'date',
      label: labels.deliveryDate,
      name: 'deliveryDate',
      flex: 2
    }
  ]

  async function handleIconClick({ updateRow, value, data }) {
    const mdt = value?.mdType || data?.mdType

    let mdType = mdt === MDTYPE_PCT ? MDTYPE_AMOUNT : MDTYPE_PCT

    const currentMdAmount = checkMinMaxAmount(value?.mdAmount, mdType)

    const newRow = {
      mdAmount: currentMdAmount,
      mdAmountPct: mdType,
      mdType: mdType
    }

    updateRow({ id: data.id, changes: newRow, commitOnBlur: true })
  }

  async function toOrder() {
    const copy = { ...formik.values }
    delete copy.items
    copy.date = formatDateToApi(copy.date)
    copy.deliveryDate = copy.deliveryDate ? formatDateToApi(copy.deliveryDate) : null

    await postRequest({
      extension: PurchaseRepository.GeneratePOPRPack.gen2,
      record: JSON.stringify(copy)
    })

    toast.success(platformLabels.Order)
    invalidate()
    window.close()
  }

  async function onWorkFlowClick() {
    stack({
      Component: WorkFlow,
      props: {
        functionId: SystemFunction.PurchaseQuotation,
        recordId: formik.values.recordId
      }
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
      key: 'WorkFlow',
      condition: true,
      onClick: onWorkFlowClick,
      disabled: !editMode
    },
    {
      key: 'Order',
      condition: true,
      onClick: toOrder,
      disabled: !(editMode && isRaw)
    },
    {
      key: 'Attachment',
      condition: true,
      onClick: 'onClickAttachment',
      disabled: !editMode
    }
  ]

  async function fillForm(qtnHeader, qtnItems) {
    qtnHeader?.record?.tdType == 1 || qtnHeader?.record?.tdType == null
      ? setCycleButtonState({ text: '123', value: 1 })
      : setCycleButtonState({ text: '%', value: 2 })

    const modifiedList =
      qtnItems?.list.length != 0
        ? await Promise.all(
            qtnItems.list?.map(async (item, index) => {
              const taxDetailsResponse = qtnHeader?.record?.isVattable ? await getTaxDetails(item.taxId) : null

              return {
                ...item,
                id: index + 1,
                basePrice: parseFloat(item.basePrice).toFixed(5),
                unitPrice: parseFloat(item.unitPrice).toFixed(3),
                upo: parseFloat(item.upo).toFixed(2),
                vatAmount: parseFloat(item.vatAmount).toFixed(2),
                extendedPrice: parseFloat(item.extendedPrice).toFixed(2),
                deliveryDate: item?.deliveryDate ? formatDateFromApi(item.deliveryDate) : null,
                lastPurchaseDate: item?.lastPurchaseDate ? formatDateFromApi(item.lastPurchaseDate) : null,
                taxDetails: taxDetailsResponse
              }
            })
          )
        : formik.values.items

    formik.setValues({
      ...qtnHeader.record,
      currentDiscount:
        qtnHeader?.record?.tdType == 1 || qtnHeader?.record?.tdType == null
          ? qtnHeader?.record?.tdAmount
          : qtnHeader?.record?.tdPct,
      amount: parseFloat(qtnHeader?.record?.amount).toFixed(2),
      items: modifiedList
    })
  }

  async function getPurchaseQuotation(qtnId) {
    const res = await getRequest({
      extension: PurchaseRepository.PurchaseQuotation.get,
      parameters: `_recordId=${qtnId}`
    })

    res.record.date = formatDateFromApi(res?.record?.date)
    res.record.deliveryDate = formatDateFromApi(res?.record?.deliveryDate)

    return res
  }

  async function getPurchaseQuotationItems(qtnId) {
    return await getRequest({
      extension: PurchaseRepository.QuotationItem.qry,
      parameters: `_quotationId=${qtnId}`
    })
  }

  async function fillVendorData(values) {
    formik.setFieldValue('isVattable', values?.isTaxable || false)
    formik.setFieldValue('tdAmount', values?.tradeDiscount || 0)
    formik.setFieldValue('currentDiscount', values?.tradeDiscount || 0)
    formik.setFieldValue('tdType', values?.tradeDiscount ? 2 : formik.values.tdType)
    formik.setFieldValue('taxId', values?.taxId || null)
    formik.setFieldValue('vendorName', values?.name || '')
    formik.setFieldValue('vendorRef', values?.reference || '')
    formik.setFieldValue('vendorId', values?.recordId || null)
  }

  async function getItemPhysProp(itemId) {
    const res = await getRequest({
      extension: InventoryRepository.ItemPhysProp.get,
      parameters: `_itemId=${itemId}`
    })

    return res?.record
  }

  async function getItem(itemId) {
    const res = await getRequest({
      extension: InventoryRepository.Item.get,
      parameters: `_recordId=${itemId}`
    })

    return res?.record
  }

  async function getTaxDetails(taxId) {
    if (!taxId) return

    const res = await getRequest({
      extension: FinancialRepository.TaxDetailPack.qry,
      parameters: `_taxId=${taxId}`
    })

    return res?.list
  }

  const handleDiscountButtonClick = () => {
    setReCal(true)
    let currentTdAmount
    let currentPctAmount
    let currentDiscountAmount
    if (cycleButtonState.value == 1) {
      currentPctAmount =
        formik.values.currentDiscount < 0 || formik.values.currentDiscount > 100 ? 0 : formik.values.currentDiscount
      currentTdAmount = (parseFloat(currentPctAmount) * parseFloat(subtotal)) / 100
      currentDiscountAmount = currentPctAmount

      formik.setFieldValue('tdAmount', currentTdAmount)
      formik.setFieldValue('tdPct', currentPctAmount)
      formik.setFieldValue('currentDiscount', currentPctAmount)
    } else {
      currentTdAmount =
        formik.values.currentDiscount < 0 || subtotal < formik.values.currentDiscount
          ? 0
          : formik.values.currentDiscount
      currentPctAmount = (parseFloat(currentTdAmount) / parseFloat(subtotal)) * 100
      currentDiscountAmount = currentTdAmount
      formik.setFieldValue('tdPct', currentPctAmount)
      formik.setFieldValue('tdAmount', currentTdAmount)
      formik.setFieldValue('currentDiscount', currentTdAmount)
    }
    setCycleButtonState(prevState => {
      const newState = prevState.text === '%' ? { text: '123', value: 1 } : { text: '%', value: 2 }
      formik.setFieldValue('tdType', newState.value)
      recalcGridVat(newState.value, currentPctAmount, currentTdAmount, currentDiscountAmount)

      return newState
    })
  }

  function checkMinMaxAmount(amount, type) {
    let currentAmount = parseFloat(amount) || 0

    if (type === MDTYPE_PCT) {
      if (currentAmount < 0 || currentAmount > 100) currentAmount = 0
    } else {
      if (currentAmount < 0) currentAmount = 0
    }

    return currentAmount
  }

  function getItemPriceRow(newRow, dirtyField, iconClicked) {
    !reCal && setReCal(true)

    const mdAmount = checkMinMaxAmount(newRow?.mdAmount, newRow?.mdType)

    const itemPriceRow = getIPR({
      priceType: newRow?.priceType || 0,
      basePrice: parseFloat(newRow?.basePrice) || 0,
      volume: parseFloat(newRow?.volume) || 0,
      weight: parseFloat(newRow?.weight),
      unitPrice: parseFloat(newRow?.unitPrice || 0),
      upo: parseFloat(newRow?.upo) ? parseFloat(newRow?.upo) : 0,
      qty: parseFloat(newRow?.qty),
      extendedPrice: parseFloat(newRow?.extendedPrice),
      mdAmount: mdAmount,
      mdType: newRow?.mdType,
      baseLaborPrice: 0,
      totalWeightPerG: 0,
      mdValue: parseFloat(newRow?.mdValue),
      tdPct: formik?.values?.tdPct || 0,
      dirtyField: dirtyField
    })

    const vatCalcRow = getVatCalc({
      priceType: itemPriceRow?.priceType,
      weight: parseFloat(itemPriceRow?.weight),
      basePrice: itemPriceRow?.basePrice,
      qty: itemPriceRow?.qty,
      extendedPrice: parseFloat(itemPriceRow?.extendedPrice),
      baseLaborPrice: itemPriceRow?.baseLaborPrice,
      vatAmount: parseFloat(itemPriceRow?.vatAmount),
      tdPct: formik?.values?.tdPct,
      taxDetails: formik.values.isVattable ? newRow.taxDetails : null
    })

    let commonData = {
      ...newRow,
      id: newRow?.id,
      qty: itemPriceRow?.qty ? parseFloat(itemPriceRow?.qty).toFixed(2) : 0,
      volume: itemPriceRow?.volume ? parseFloat(itemPriceRow.volume).toFixed(4) : 0,
      weight: parseFloat(itemPriceRow?.weight).toFixed(2),
      basePrice: itemPriceRow?.basePrice ? parseFloat(itemPriceRow.basePrice).toFixed(5) : 0,
      unitPrice: itemPriceRow?.unitPrice ? parseFloat(itemPriceRow.unitPrice).toFixed(3) : 0,
      extendedPrice: itemPriceRow?.extendedPrice ? parseFloat(itemPriceRow.extendedPrice).toFixed(2) : 0,
      upo: parseFloat(itemPriceRow?.upo).toFixed(2),
      mdValue: itemPriceRow?.mdValue,
      mdType: itemPriceRow?.mdType,
      mdAmount: itemPriceRow?.mdAmount ? parseFloat(itemPriceRow.mdAmount).toFixed(2) : 0,
      vatAmount: vatCalcRow?.vatAmount ? parseFloat(vatCalcRow.vatAmount).toFixed(2) : 0
    }

    return iconClicked ? { changes: commonData } : commonData
  }

  const parsedItemsArray = formik.values.items
    ?.filter(item => item.itemId !== undefined)
    .map(item => ({
      ...item,
      basePrice: parseFloat(item.basePrice) || 0,
      unitPrice: parseFloat(item.unitPrice) || 0,
      upo: parseFloat(item.upo) || 0,
      vatAmount: parseFloat(item.vatAmount) || 0,
      weight: parseFloat(item.weight) || 0,
      volume: parseFloat(item.volume) || 0,
      extendedPrice: parseFloat(item.extendedPrice) || 0
    }))

  const subTotal = getSubtotal(parsedItemsArray)

  const miscValue = formik.values.miscAmount == 0 ? 0 : parseFloat(formik.values.miscAmount)

  const _footerSummary = getFooterTotals(parsedItemsArray, {
    totalQty: 0,
    totalWeight: 0,
    totalVolume: 0,
    totalUpo: 0,
    sumVat: 0,
    sumExtended: parseFloat(subTotal),
    tdAmount: parseFloat(formik.values.tdAmount),
    net: 0,
    miscAmount: miscValue
  })

  const totalQty = reCal ? _footerSummary?.totalQty : formik.values?.qty || 0
  const amount = reCal ? _footerSummary?.net : formik.values?.amount || 0
  const totalVolume = reCal ? _footerSummary?.totalVolume : formik.values?.volume || 0
  const totalWeight = reCal ? _footerSummary?.totalWeight : formik.values?.weight || 0
  const subtotal = reCal ? subTotal : formik.values?.subtotal || 0
  const vatAmount = reCal ? _footerSummary?.sumVat : formik.values?.vatAmount || 0

  function checkDiscount(typeChange, tdPct, tdAmount, currentDiscount) {
    const _discountObj = getDiscValues({
      tdAmount: parseFloat(currentDiscount),
      tdPlain: typeChange == 1,
      tdPct: typeChange == 2,
      tdType: typeChange,
      subtotal: subtotal,
      currentDiscount: currentDiscount,
      hiddenTdPct: tdPct,
      hiddenTdAmount: parseFloat(tdAmount),
      typeChange: typeChange
    })

    formik.setFieldValue('tdAmount', _discountObj?.hiddenTdAmount ? _discountObj?.hiddenTdAmount?.toFixed(2) : 0)
    formik.setFieldValue('tdType', _discountObj?.tdType)
    formik.setFieldValue('currentDiscount', _discountObj?.currentDiscount || 0)
    formik.setFieldValue('tdPct', _discountObj?.hiddenTdPct || 0)
  }

  function recalcNewVat(tdPct) {
    formik.values.items.map((item, index) => {
      const vatCalcRow = getVatCalc({
        priceType: item?.priceType,
        weight: parseFloat(item?.weight),
        basePrice: parseFloat(item?.basePrice),
        qty: item?.qty,
        extendedPrice: parseFloat(item?.extendedPrice),
        baseLaborPrice: parseFloat(item?.baseLaborPrice),
        vatAmount: parseFloat(item?.vatAmount),
        tdPct,
        taxDetails: formik.values.isVattable ? item.taxDetails : null
      })
      formik.setFieldValue(`items[${index}].vatAmount`, parseFloat(vatCalcRow?.vatAmount).toFixed(2))
    })
  }

  function recalcGridVat(typeChange, tdPct, tdAmount, currentDiscount) {
    checkDiscount(typeChange, tdPct, tdAmount, currentDiscount)
    recalcNewVat(tdPct)
  }
  async function refetchForm(recordId) {
    const qtnHeader = await getPurchaseQuotation(recordId)
    const qtnItems = await getPurchaseQuotationItems(recordId)
    await fillForm(qtnHeader, qtnItems)
  }

  const getMeasurementUnits = async () => {
    return await getRequest({
      extension: InventoryRepository.MeasurementUnit.qry,
      parameters: `_msId=0`
    })
  }

  async function importPuItems() {
    const requestItems = await getRequisitionItem(formik.values?.requestId)
    if (requestItems?.list?.length == 0) {
      stackError({
        message: labels.noItemsToImport
      })

      return
    }

    const allItemsImported = requestItems?.list?.every(item =>
      formik.values.items?.some(
        existingItem => existingItem.requestId === item?.trxId && existingItem.requestSeqNo === item?.seqNo
      )
    )
    if (allItemsImported) {
      stackError({
        message: labels.allItemsImported
      })

      return
    }

    const modifiedItemsList = await Promise.all(
      requestItems?.list
        ?.filter(
          item =>
            !formik.values.items?.some(
              existingItem => existingItem.requestId === item?.trxId && existingItem.requestSeqNo === item?.seqNo
            )
        )
        .map(async ({ unitCost, ...item }) => {
          const getItem = await constructItem({
            ...item,
            deliveryDate: item?.deliveryDate ? formatDateFromApi(item.deliveryDate) : null,
            lastPurchaseDate: item?.lastPurchaseDate ? formatDateFromApi(item.lastPurchaseDate) : null,
            requestId: item?.trxId,
            requestSeqNo: item?.seqNo,
            requestRef: formik.values.requestRef,
            mdType: 1,
            qty: parseFloat(item?.qty || 0).toFixed(2),
            notes: item?.justification
          })

          const vatCalc = getVatCalc({
            priceType: getItem?.priceType,
            weight: parseFloat(getItem?.weight),
            basePrice: parseFloat(getItem?.basePrice),
            qty: getItem?.qty,
            extendedPrice: parseFloat(getItem?.extendedPrice),
            baseLaborPrice: parseFloat(getItem?.baseLaborPrice),
            vatAmount: parseFloat(getItem?.vatAmount),
            tdPct: formik.values.tdPct || 0,
            taxDetails: getItem?.taxDetails || []
          })

          return { ...getItem, vatAmount: parseFloat(vatCalc?.vatAmount || 0).toFixed(2) }
        })
    )

    const oldItems = formik.values.items || null

    const combinedItems = [...oldItems, ...modifiedItemsList]
      .filter(item => item?.itemId)
      .map((item, index) => ({
        ...item,
        id: index + 1
      }))
    formik.setFieldValue('items', combinedItems)
    setReCal(true)
  }
  async function constructItem(item) {
    const [itemInfo, itemPhysProp] = await Promise.all([getItem(item?.itemId), getItemPhysProp(item?.itemId)])
    const taxDetails = formik.values.isVattable ? await getTaxDetails(itemInfo?.taxId) : null

    return {
      ...item,
      volume: itemPhysProp?.volume || 0,
      weight: itemPhysProp?.weight || 0,
      priceType: itemPhysProp?.priceType || 1,
      vatPct: itemPhysProp?.vatpct || 0,
      basePrice: 0,
      unitPrice: 0,
      extendedPrice: 0,
      mdValue: 0,
      mdAmount: 0,
      msId: itemInfo?.msId || null,
      taxId: itemInfo?.taxId || null,
      baseQty: parseFloat(item?.baseQty || item?.qty).toFixed(2),
      taxDetails
    }
  }

  async function getRequisitionItem(requestId) {
    if (!requestId) return

    const response = await getRequest({
      extension: PurchaseRepository.RequisitionDetail.qry,
      parameters: `_trxId=${requestId}`
    })

    return response
  }
  useEffect(() => {
    formik.setFieldValue('qty', parseFloat(totalQty).toFixed(2))
    formik.setFieldValue('amount', parseFloat(amount).toFixed(2))
    formik.setFieldValue('volume', parseFloat(totalVolume).toFixed(4))
    formik.setFieldValue('weight', parseFloat(totalWeight).toFixed(2))
    formik.setFieldValue('subtotal', parseFloat(subtotal).toFixed(2))
    formik.setFieldValue('vatAmount', parseFloat(vatAmount).toFixed(2))
  }, [totalQty, amount, totalVolume, totalWeight, subtotal, vatAmount])

  useEffect(() => {
    if (reCal) {
      let currentTdAmount = (parseFloat(formik.values.tdPct) * parseFloat(subtotal)) / 100
      recalcGridVat(formik.values.tdType, formik.values.tdPct, currentTdAmount, formik.values.currentDiscount)
    }
  }, [subtotal])

  useEffect(() => {
    ;(async function () {
      const muList = await getMeasurementUnits()
      setMeasurements(muList?.list)
      if (recordId) await refetchForm(recordId)
    })()
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.PurchaseQuotations}
      functionId={SystemFunction.PurchaseQuotation}
      form={formik}
      maxAccess={maxAccess}
      previewReport={editMode}
      actions={actions}
      editMode={editMode}
      disabledSubmit={!isRaw}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid container spacing={2} xs={6} sx={{ pt: 2 }}>
              <Grid item xs={6}>
                <Grid container direction='column' spacing={2}>
                  <Grid item>
                    <ResourceComboBox
                      endpointId={SystemRepository.DocumentType.qry}
                      parameters={`_startAt=0&_pageSize=1000&_dgId=${SystemFunction.PurchaseQuotation}`}
                      name='dtId'
                      label={labels.documentType}
                      columnsInDropDown={[
                        { key: 'reference', value: 'Reference' },
                        { key: 'name', value: 'Name' }
                      ]}
                      readOnly={editMode}
                      valueField='recordId'
                      displayField={['reference', 'name']}
                      values={formik.values}
                      maxAccess={maxAccess}
                      onChange={async (event, newValue) => {
                        await changeDT(newValue)
                        formik.setFieldValue('dtId', newValue?.recordId || null)
                      }}
                      error={formik.touched.dtId && Boolean(formik.errors.dtId)}
                    />
                  </Grid>
                  <Grid item>
                    <CustomTextField
                      name='reference'
                      label={labels.reference}
                      value={formik?.values?.reference}
                      maxAccess={!editMode && maxAccess}
                      readOnly={editMode}
                      onChange={formik.handleChange}
                      onClear={() => formik.setFieldValue('reference', null)}
                      error={formik.touched.reference && Boolean(formik.errors.reference)}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={6}>
                <Grid container direction='column' spacing={2}>
                  <Grid item>
                    <CustomDatePicker
                      name='date'
                      required
                      label={labels.date}
                      value={formik?.values?.date}
                      onChange={formik.setFieldValue}
                      readOnly={!isRaw}
                      max={new Date()}
                      maxAccess={maxAccess}
                      onClear={() => formik.setFieldValue('date', null)}
                      error={formik.touched.date && Boolean(formik.errors.date)}
                    />
                  </Grid>
                  <Grid item>
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
                      readOnly={formik?.values?.items?.some(item => item.itemId)}
                      values={formik.values}
                      maxAccess={maxAccess}
                      onChange={(event, newValue) => {
                        formik.setFieldValue('items', formik.initialValues.items)
                        formik.setFieldValue('currencyId', newValue?.recordId || null)
                      }}
                      error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <ResourceLookup
                  endpointId={PurchaseRepository.Vendor.snapshot}
                  valueField='reference'
                  displayField='name'
                  secondFieldLabel={labels.name}
                  name='vendorId'
                  label={labels.vendor}
                  form={formik}
                  readOnly={formik?.values?.items?.some(item => item.itemId)}
                  displayFieldWidth={2}
                  valueShow='vendorRef'
                  secondValueShow='vendorName'
                  maxAccess={maxAccess}
                  columnsInDropDown={[
                    { key: 'reference', value: 'Reference' },
                    { key: 'name', value: 'Name' },
                    { key: 'flName', value: 'FL Name' }
                  ]}
                  onChange={(event, newValue) => {
                    fillVendorData(newValue)
                  }}
                  errorCheck={'vendorId'}
                />
              </Grid>
              <Grid item xs={6}>
                <ResourceLookup
                  endpointId={PurchaseRepository.PurchaseRequisition.snapshot}
                  filter={{ status: 4 }}
                  valueField='reference'
                  displayField='reference'
                  name='requestRef'
                  label={labels.request}
                  form={formik}
                  readOnly={!isRaw}
                  secondDisplayField={false}
                  maxAccess={maxAccess}
                  onChange={async (event, newValue) => {
                    formik.setFieldValue('requestRef', newValue?.reference)
                    formik.setFieldValue('requestId', newValue?.recordId)
                  }}
                  errorCheck={'requestId'}
                />
              </Grid>
              <Grid item xs={2}>
                <CustomButton
                  onClick={() => importPuItems()}
                  tooltipText={platformLabels.import}
                  image={'import.png'}
                  disabled={!isRaw || !formik.values.requestId || !formik.values.currencyId || !formik.values.vendorId}
                />
              </Grid>
            </Grid>
            <Grid item xs={3}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SystemRepository.Plant.qry}
                    name='plantId'
                    label={labels.plant}
                    readOnly={!isRaw}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik.values}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('plantId', newValue?.recordId || null)
                    }}
                    displayFieldWidth={2}
                    error={formik.touched.plantId && Boolean(formik.errors.plantId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    datasetId={DataSets.PAYMENT_METHOD}
                    name='paymentMethod'
                    readOnly={!isRaw}
                    label={labels.paymentMethod}
                    valueField='key'
                    displayField='value'
                    values={formik.values}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('paymentMethod', newValue?.key || null)
                    }}
                    error={formik.touched?.paymentMethod && Boolean(formik.errors?.paymentMethod)}
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={12}>
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
                      formik.setFieldValue('taxId', newValue?.recordId || null)
                    }}
                    error={formik.touched.taxId && Boolean(formik.errors.taxId)}
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='vendorDocRef'
                    label={labels.vendorDocRef}
                    value={formik?.values?.vendorDocRef}
                    maxAccess={maxAccess}
                    readOnly={!isRaw}
                    maxLength='15'
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('vendorDocRef', '')}
                    error={formik.touched.vendorDocRef && Boolean(formik.errors.vendorDocRef)}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={3}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <CustomDatePicker
                    name='deliveryDate'
                    label={labels.deliveryDate}
                    value={formik?.values?.deliveryDate}
                    onChange={formik.setFieldValue}
                    readOnly={!isRaw}
                    maxAccess={maxAccess}
                    onClear={() => formik.setFieldValue('deliveryDate', null)}
                    error={formik.touched.deliveryDate && Boolean(formik.errors.deliveryDate)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={PurchaseRepository.DeliveryMethods.qry}
                    name='deliveryMethodId'
                    label={labels.deliveryMethod}
                    readOnly={!isRaw}
                    valueField='recordId'
                    displayField='name'
                    values={formik.values}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('deliveryMethodId', newValue?.recordId || null)
                    }}
                    error={formik.touched?.deliveryMethodId && Boolean(formik.errors?.deliveryMethodId)}
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomCheckBox
                    name='isVattable'
                    value={formik.values?.isVattable}
                    onChange={event => formik.setFieldValue('isVattable', event.target.checked)}
                    label={labels.VAT}
                    disabled
                    maxAccess={maxAccess}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <DataGrid
            onChange={(value, action) => {
              formik.setFieldValue('items', value)
              action === 'delete' && setReCal(true)
            }}
            onSelectionChange={(row, update, field) => {
              if (field == 'muRef') getFilteredMU(row?.itemId, row?.msId)
            }}
            initialValues={formik?.initialValues?.items?.[0]}
            value={formik.values.items}
            error={formik.errors.items}
            columns={columns}
            name='items'
            maxAccess={maxAccess}
            disabled={!formik.values.vendorId || !formik.values.currencyId || !isRaw}
            allowDelete={isRaw}
          />
        </Grow>
        <Fixed>
          <Grid container spacing={2} sx={{ pt: 2 }}>
            <Grid item xs={6}>
              <Grid item xs={12}>
                <CustomTextArea
                  name='description'
                  label={labels.description}
                  value={formik.values.description}
                  rows={3}
                  readOnly={!isRaw}
                  maxAccess={maxAccess}
                  onChange={e => formik.setFieldValue('description', e.target.value)}
                  onClear={() => formik.setFieldValue('description', null)}
                  error={formik.touched.description && Boolean(formik.errors.description)}
                />
              </Grid>
            </Grid>
            <Grid item xs={3}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='totalVolume'
                    maxAccess={maxAccess}
                    label={labels.totVolume}
                    value={totalVolume}
                    readOnly
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField name='totalQTY' label={labels.totQty} value={totalQty} readOnly />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={3}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='subTotal'
                    maxAccess={maxAccess}
                    label={labels.subtotal}
                    value={subtotal}
                    readOnly
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='discount'
                    maxAccess={maxAccess}
                    label={labels.discount}
                    value={formik.values.currentDiscount}
                    displayCycleButton={true}
                    readOnly={!isRaw}
                    iconKey={cycleButtonState.text}
                    cycleButtonLabel={cycleButtonState.text}
                    decimalScale={2}
                    handleButtonClick={handleDiscountButtonClick}
                    ShowDiscountIcons={true}
                    onChange={e => {
                      let discount = Number(e.target.value.replace(/,/g, ''))
                      if (formik.values.tdType == 1) {
                        if (discount < 0 || subtotal < discount) {
                          discount = 0
                        }
                        formik.setFieldValue('tdAmount', discount)
                      } else {
                        if (discount < 0 || discount > 100) discount = 0
                        formik.setFieldValue('tdPct', discount)
                      }
                      formik.setFieldValue('currentDiscount', discount)
                    }}
                    onBlur={async e => {
                      setReCal(true)
                      let discountAmount = Number(e.target.value.replace(/,/g, ''))
                      let tdPct = Number(e.target.value.replace(/,/g, ''))
                      let tdAmount = Number(e.target.value.replace(/,/g, ''))
                      if (formik.values.tdType == 1) {
                        tdPct = (parseFloat(discountAmount) / parseFloat(subtotal)) * 100
                        formik.setFieldValue('tdPct', tdPct)
                      }

                      if (formik.values.tdType == 2) {
                        tdAmount = (parseFloat(discountAmount) * parseFloat(subtotal)) / 100
                        formik.setFieldValue('tdAmount', tdAmount)
                      }

                      recalcGridVat(formik.values.tdType, tdPct, tdAmount, discountAmount)
                    }}
                    onClear={() => {
                      formik.setFieldValue('tdAmount', 0)
                      formik.setFieldValue('tdPct', 0)
                      recalcGridVat(formik.values.tdType, 0, 0, 0)
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='miscAmount'
                    maxAccess={maxAccess}
                    label={labels.misc}
                    value={formik.values.miscAmount || 0}
                    decimalScale={2}
                    readOnly={!isRaw}
                    onChange={e => formik.setFieldValue('miscAmount', e.target.value)}
                    onBlur={async () => {
                      setReCal(true)
                    }}
                    onClear={() => {
                      formik.setFieldValue('miscAmount', 0)
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='vatAmount'
                    maxAccess={maxAccess}
                    label={labels.VAT}
                    value={vatAmount}
                    readOnly
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField name='amount' maxAccess={maxAccess} label={labels.net} value={amount} readOnly />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}

PuQtnForm.width = 1300
PuQtnForm.height = 730
