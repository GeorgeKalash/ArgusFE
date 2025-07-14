import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import { Grid } from '@mui/material'
import { useContext, useEffect, useRef, useState } from 'react'
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
  DIRTYFIELD_EXTENDED_PRICE,
  MDTYPE_PCT,
  MDTYPE_AMOUNT
} from 'src/utils/ItemPriceCalculator'
import { getVatCalc } from 'src/utils/VatCalculator'
import { getDiscValues, getFooterTotals, getSubtotal } from 'src/utils/FooterCalculator'
import AddressFilterForm from 'src/components/Shared/AddressFilterForm'
import { useError } from 'src/error'
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'
import SalesTrxForm from 'src/components/Shared/SalesTrxForm'
import CustomCheckBox from 'src/components/Inputs/CustomCheckBox'
import TaxDetails from 'src/components/Shared/TaxDetails'
import { createConditionalSchema } from 'src/lib/validation'
import useResourceParams from 'src/hooks/useResourceParams'
import useSetWindow from 'src/hooks/useSetWindow'
import AddressForm from 'src/components/Shared/AddressForm'

const SalesOrderForm = ({ recordId, currency, window }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { stack: stackError } = useError()
  const { platformLabels, defaultsData, userDefaultsData } = useContext(ControlContext)
  const [cycleButtonState, setCycleButtonState] = useState({ text: '%', value: 2 })
  const [address, setAddress] = useState({})
  const filteredMeasurements = useRef([])
  const [measurements, setMeasurements] = useState([])
  const [reCal, setReCal] = useState(false)
  const [defaults, setDefaults] = useState({ userDefaultsList: {}, systemDefaultsList: {} })

  const { labels, access } = useResourceParams({
    datasetId: ResourceIds.SalesOrder,
    editMode: !!recordId
  })

  useSetWindow({ title: labels.salesOrder, window })

  const allowNoLines = defaultsData?.list?.find(({ key }) => key === 'allowSalesNoLinesTrx')?.value == 'true'

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.SalesOrder,
    access: access,
    enabled: !recordId
  })

  const initialValues = {
    recordId: recordId,
    dtId: null,
    reference: '',
    date: new Date(),
    dueDate: new Date(),
    plantId: null,
    clientId: '',
    currencyId: parseInt(currency),
    szId: '',
    spId: null,
    siteId: null,
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
    amount: 0,
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
    tdType: 2,
    tdPct: 0,
    baseAmount: 0,
    volume: '',
    weight: '',
    qty: 0,
    serializedAddress: '',
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
        mdAmountPct: null,
        priceType: 1,
        applyVat: false,
        taxId: '',
        taxDetails: null,
        notes: ''
      }
    ]
  }

  const invalidate = useInvalidate({
    endpointId: SaleRepository.SalesOrder.page
  })

  const conditions = {
    sku: row => row?.sku,
    itemName: row => row?.itemName,
    qty: row => row?.qty > 0
  }

  const { schema, requiredFields } = createConditionalSchema(conditions, allowNoLines, maxAccess, 'items')

  const { formik } = useForm({
    maxAccess,
    documentType: { key: 'dtId', value: documentType?.dtId },
    conditionSchema: ['items'],
    initialValues,
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      date: yup.string().required(),
      currencyId: yup.string().required(),
      clientId: yup.string().required(),
      items: yup.array().of(schema)
    }),
    onSubmit: async obj => {
      const copy = { ...obj }
      delete copy.items
      copy.date = formatDateToApi(copy.date)
      copy.dueDate = formatDateToApi(copy.dueDate)
      copy.miscAmount = copy.miscAmount || 0

      if (!obj.rateCalcMethod) delete copy.rateCalcMethod

      if (copy.serializedAddress) {
        const addressData = {
          clientId: copy.clientId,
          address: address
        }

        const addressRes = await postRequest({
          extension: SaleRepository.Address.set,
          record: JSON.stringify(addressData)
        })
        copy.shipToAddressId = addressRes.recordId
      }

      const updatedRows = obj.items
        .filter(row => Object.values(requiredFields)?.every(fn => fn(row)))
        ?.map((itemDetails, index) => {
          const { physicalProperty, ...rest } = itemDetails

          return {
            ...rest,
            seqNo: index + 1,
            siteId: obj.siteId,
            applyVat: obj.isVattable
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
      await refetchForm(soRes.recordId)

      invalidate()
    }
  })

  const editMode = !!formik.values.recordId
  const isClosed = formik.values.wip === 2

  async function getFilteredMU(itemId) {
    if (!itemId) return

    const currentItemId = formik.values.items?.find(item => parseInt(item.itemId) === itemId)?.msId

    const arrayMU = measurements?.filter(item => item.msId === currentItemId) || []
    filteredMeasurements.current = arrayMU
  }

  const iconKey = ({ value, data }) => {
    const mdType = value?.mdType || data?.mdType

    return mdType === MDTYPE_PCT ? '%' : '123'
  }

  function checkMinMaxAmount(amount, type, modType) {
    let currentAmount = parseFloat(amount) || 0

    if (type === modType) {
      if (currentAmount < 0 || currentAmount > 100) currentAmount = 0
    } else {
      if (currentAmount < 0) currentAmount = 0
    }

    return currentAmount
  }

  const onCondition = row => {
    if (row.itemId && row.taxId) {
      return {
        imgSrc: '/images/buttonsIcons/tax-icon.png',
        hidden: false
      }
    } else {
      return {
        imgSrc: '',
        hidden: true
      }
    }
  }

  const saTrxCondition = row => {
    return {
      disabled: !row.itemId
    }
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
          { key: 'name', value: 'Item Name' }
        ],
        displayFieldWidth: 5
      },
      async onChange({ row: { update, newRow } }) {
        if (!newRow.itemId) {

          return
        }
        const itemPhysProp = await getItemPhysProp(newRow.itemId)
        const itemInfo = await getItem(newRow.itemId)
        const ItemConvertPrice = await getItemConvertPrice(newRow.itemId, update)
        let rowTax = null
        let rowTaxDetails = null

        if (!formik.values.taxId) {
          if (itemInfo.taxId) {
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

        const filteredMeasurements = measurements?.filter(item => item.msId === itemInfo?.msId)
        getFilteredMU(newRow?.itemId)

        update({
          volume: parseFloat(itemPhysProp?.volume) || 0,
          weight: parseFloat(itemPhysProp?.weight || 0).toFixed(2),
          vatAmount: parseFloat(itemInfo?.vatPct || 0).toFixed(2),
          basePrice: parseFloat(ItemConvertPrice?.basePrice || 0).toFixed(5),
          unitPrice: parseFloat(ItemConvertPrice?.unitPrice || 0).toFixed(3),
          upo: parseFloat(ItemConvertPrice?.upo || 0).toFixed(2),
          priceType: ItemConvertPrice?.priceType || 1,
          mdAmount: formik.values.tdPct ? parseFloat(formik.values.tdPct).toFixed(2) : 0,
          qty: 0,
          msId: itemInfo?.msId,
          muRef: filteredMeasurements?.[0]?.reference,
          muId: filteredMeasurements?.[0]?.recordId,
          extendedPrice: parseFloat('0').toFixed(2),
          mdValue: 0,
          taxId: rowTax,
          taxDetails: formik.values.isVattable ? rowTaxDetails : null,
          mdType: 1,
          siteId: formik?.values?.siteId,
          siteRef: await getSiteRef(formik?.values?.siteId)
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
      component: 'resourcecombobox',
      label: labels.measurementUnit,
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
        const filteredItems = filteredMeasurements?.current.filter(item => item.recordId === newRow?.muId)
        update({
          baseQty: newRow?.qty * filteredItems?.qty
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
      async onChange({ row: { update, newRow } }) {
        const data = getItemPriceRow(newRow, DIRTYFIELD_QTY)
        update(data)
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
      updateOn: 'blur',
      props: {
        decimalScale: 5
      },
      async onChange({ row: { update, newRow } }) {
        const data = getItemPriceRow(newRow, DIRTYFIELD_BASE_PRICE)
        update(data)
      }
    },
    {
      component: 'numberfield',
      label: labels.unitPrice,
      name: 'unitPrice',
      updateOn: 'blur',
      props: {
        decimalScale: 5
      },
      async onChange({ row: { update, newRow } }) {
        const data = getItemPriceRow(newRow, DIRTYFIELD_UNIT_PRICE)
        update(data)
      }
    },
    {
      component: 'numberfield',
      label: labels.upo,
      name: 'upo',
      updateOn: 'blur',
      async onChange({ row: { update, newRow } }) {
        const data = getItemPriceRow(newRow, DIRTYFIELD_UPO)
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
        onCondition
      },
      label: labels.tax,
      onClick: (e, row) => {
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

        checkMdAmountPct(newRow, update)
      }
    },
    {
      component: 'button',
      name: 'saTrx',
      label: labels.salesTrx,
      props: {
        onCondition: saTrxCondition
      },
      onClick: (e, row, update, newRow) => {
        stack({
          Component: SalesTrxForm,
          props: {
            recordId: 0,
            functionId: SystemFunction.SalesInvoice,
            itemId: row?.itemId,
            clientId: formik?.values?.clientId
          }
        })
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
    }
  ]

  async function handleIconClick({ updateRow, value, data }) {
    const mdt = value?.mdType || data?.mdType

    let mdType = mdt === MDTYPE_PCT ? MDTYPE_AMOUNT : MDTYPE_PCT

    const currentMdAmount = checkMinMaxAmount(value?.mdAmount, mdType, MDTYPE_PCT)

    const newRow = {
      mdAmount: currentMdAmount,
      mdAmountPct: mdType,
      mdType: mdType
    }

    updateRow({ id: data.id, changes: newRow, commitOnBlur: true })
  }

  async function onClose() {
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
    await refetchForm(res.recordId)
  }

  async function onReopen() {
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
    await refetchForm(res.recordId)
  }

  async function onCancel() {
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
    await refetchForm(res.recordId)
  }

  async function toInvoice() {
    const copy = { ...formik.values }
    delete copy.items
    copy.date = formatDateToApi(copy.date)
    copy.dueDate = formatDateToApi(copy.dueDate)

    await postRequest({
      extension: SaleRepository.SalesOrder.postToInvoice,
      record: JSON.stringify(copy)
    })

    toast.success(platformLabels.Invoice)
    invalidate()
    window.close()
  }

  async function onWorkFlowClick() {
    stack({
      Component: WorkFlow,
      props: {
        functionId: SystemFunction.SalesOrder,
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
      key: 'Approval',
      condition: true,
      onClick: 'onApproval',
      disabled: !isClosed
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
      disabled: !(isClosed && (formik.values.deliveryStatus == 1 || formik.values.deliveryStatus == 5))
    },
    {
      key: 'Terminate',
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

    const modifiedList =
      soItems?.list.length != 0
        ? await Promise.all(
            soItems.list?.map(async (item, index) => {
              const taxDetailsResponse = soHeader?.record?.isVattable ? await getTaxDetails(item.taxId) : null

              return {
                ...item,
                id: index + 1,
                basePrice: parseFloat(item.basePrice).toFixed(5),
                unitPrice: parseFloat(item.unitPrice).toFixed(3),
                upo: parseFloat(item.upo).toFixed(2),
                vatAmount: parseFloat(item.vatAmount).toFixed(2),
                extendedPrice: parseFloat(item.extendedPrice).toFixed(2),
                taxDetails: taxDetailsResponse
              }
            })
          )
        : formik.initialValues.items

    formik.setValues({
      ...soHeader.record,
      currentDiscount:
        soHeader?.record?.tdType == 1 || soHeader?.record?.tdType == null
          ? soHeader?.record?.tdAmount
          : soHeader?.record?.tdPct,
      amount: parseFloat(soHeader?.record?.amount).toFixed(2),
      shipAddress: shipAdd,
      billAddress: billAdd,
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

  async function getSalesOrderItems(soId) {
    return await getRequest({
      extension: SaleRepository.SalesOrderItem.qry,
      parameters: `_params=1|${soId}`
    })
  }

  async function getAddress(addressId) {
    if (!addressId) return

    const res = await getRequest({
      extension: SystemRepository.Address.format,
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
    formik.setFieldValue('spId', res?.record?.spId || formik.values.spId)
    formik.setFieldValue('ptId', res?.record?.ptId)
    formik.setFieldValue('plId', res?.record?.plId || defaults.systemDefaultsList.plId || 0)
    formik.setFieldValue('szId', res?.record?.szId)
    formik.setFieldValue('shipToAddressId', res?.record?.shipAddressId || null)
    formik.setFieldValue('billToAddressId', res?.record?.billAddressId || null)
    const shipAdd = await getAddress(res?.record?.shipAddressId)
    const billAdd = await getAddress(res?.record?.billAddressId)

    formik.setFieldValue('shipAddress', shipAdd || '')
    formik.setFieldValue('billAddress', billAdd || '')
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

  async function getItemConvertPrice(itemId, update) {
    if (!formik.values.currencyId) {
      update({
        itemId: null,
        itemName: null,
        sku: null
      })

      stackError({
        message: labels.noCurrency
      })

      return
    }

    const res = await getRequest({
      extension: SaleRepository.ItemConvertPrice.get,
      parameters: `_itemId=${itemId}&_clientId=${formik.values.clientId}&_currencyId=${formik.values.currencyId}&_plId=${formik.values.plId}&_muId=0`
    })

    return res?.record
  }

  const handleButtonClick = () => {
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
  function getItemPriceRow(newRow, dirtyField, iconClicked) {
    !reCal && setReCal(true)

    const mdAmount = checkMinMaxAmount(newRow?.mdAmount, newRow?.mdType, MDTYPE_PCT)

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
      basePrice: itemPriceRow?.basePrice,
      qty: itemPriceRow?.qty,
      extendedPrice: parseFloat(itemPriceRow?.extendedPrice),
      baseLaborPrice: itemPriceRow?.baseLaborPrice,
      vatAmount: parseFloat(itemPriceRow?.vatAmount) || 0,
      tdPct: formik?.values?.tdPct || 0,
      taxDetails: formik.values.isVattable ? newRow.taxDetails : null
    })

    let commonData = {
      ...newRow,
      id: newRow?.id,
      qty: parseFloat(itemPriceRow?.qty).toFixed(2),
      volume: parseFloat(itemPriceRow?.volume).toFixed(2),
      weight: parseFloat(itemPriceRow?.weight).toFixed(2),
      basePrice: parseFloat(itemPriceRow?.basePrice).toFixed(5),
      unitPrice: parseFloat(itemPriceRow?.unitPrice).toFixed(3),
      extendedPrice: parseFloat(itemPriceRow?.extendedPrice).toFixed(2),
      upo: parseFloat(itemPriceRow?.upo).toFixed(2),
      mdValue: itemPriceRow?.mdValue,
      mdType: itemPriceRow?.mdType,
      mdAmount: parseFloat(itemPriceRow?.mdAmount).toFixed(2),
      vatAmount: parseFloat(vatCalcRow?.vatAmount).toFixed(2)
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
    formik.setFieldValue('tdPct', _discountObj?.hiddenTdPct)
  }

  function recalcNewVat(tdPct) {
    formik.values.items.map((item, index) => {
      const vatCalcRow = getVatCalc({
        basePrice: parseFloat(item?.basePrice),
        qty: item?.qty,
        extendedPrice: parseFloat(item?.extendedPrice),
        baseLaborPrice: parseFloat(item?.baseLaborPrice),
        vatAmount: parseFloat(item?.vatAmount),
        tdPct: tdPct,
        taxDetails: item.taxDetails
      })
      formik.setFieldValue(`items[${index}].vatAmount`, parseFloat(vatCalcRow?.vatAmount).toFixed(2))
    })
  }

  function recalcGridVat(typeChange, tdPct, tdAmount, currentDiscount) {
    checkDiscount(typeChange, tdPct, tdAmount, currentDiscount)
    recalcNewVat(tdPct)
  }

  function ShowMdValueErrorMessage(clientMaxDiscount, rowData, update) {
    if (parseFloat(rowData.mdAmount) > clientMaxDiscount) {
      formik.setFieldValue('mdAmount', clientMaxDiscount)
      rowData.mdAmount = clientMaxDiscount
      const data = getItemPriceRow(rowData, DIRTYFIELD_MDAMOUNT)
      update(data)

      stackError({
        message: labels.clientMaxPctDiscount + ' ' + clientMaxDiscount + '%'
      })
    }
  }

  function ShowMdAmountErrorMessage(actualDiscountAmount, clientMaxDiscountValue, rowData, update) {
    if (actualDiscountAmount > clientMaxDiscountValue) {
      formik.setFieldValue('mdType', 2)
      formik.setFieldValue('mdAmount', clientMaxDiscountValue)
      rowData.mdType = 2
      rowData.mdAmount = clientMaxDiscountValue
      const data = getItemPriceRow(rowData, DIRTYFIELD_MDAMOUNT)
      update(data)
      stackError({
        message: labels.clientMaxDiscount + ' ' + clientMaxDiscountValue
      })
    }
  }

  function checkMdAmountPct(rowData, update) {
    const maxClientAmountDiscount = Number(rowData.unitPrice) * (formik.values.maxDiscount / 100)
    if (!formik.values.maxDiscount) return
    if (rowData.mdType == 1) {
      if (rowData.mdAmount > formik.values.maxDiscount) {
        ShowMdValueErrorMessage(formik.values.maxDiscount, rowData, update)

        return false
      }
    } else {
      if (rowData.mdAmount > maxClientAmountDiscount) {
        ShowMdAmountErrorMessage(rowData.mdAmount, maxClientAmountDiscount, rowData, update)

        return false
      }
    }
  }

  async function refetchForm(recordId) {
    const soHeader = await getSalesOrder(recordId)
    const soItems = await getSalesOrderItems(recordId)
    await fillForm(soHeader, soItems)
  }
  function setAddressValues(obj) {
    Object.entries(obj).forEach(([key, value]) => {
      formik.setFieldValue(key, value)
    })
  }
  function openAddressFilterForm(clickShip, clickBill) {
    stack({
      Component: AddressFilterForm,
      props: {
        maxAccess,
        labels,
        shipment: clickShip,
        bill: clickBill,
        checkedAddressId: clickShip ? formik.values?.shipToAddressId : formik.values?.billToAddressId,
        form: formik.values,
        handleAddressValues: setAddressValues
      }
    })
  }
  function openAddressForm() {
    stack({
      Component: AddressForm,
      props: {
        address: address,
        setAddress: setAddress,
        isCleared: false
      }
    })
  }

  const getMeasurementUnits = async () => {
    return await getRequest({
      extension: InventoryRepository.MeasurementUnit.qry,
      parameters: `_msId=0`
    })
  }

  async function getSiteRef(siteId) {
    if (!siteId) return

    const res = await getRequest({
      extension: InventoryRepository.Site.get,
      parameters: `_recordId=${siteId}`
    })

    return res?.record?.reference
  }
  async function getDefaultData() {
    const systemKeys = ['siteId', 'salesTD', 'plId']
    const userKeys = ['plantId', 'siteId', 'spId']

    const systemObject = (defaultsData?.list || []).reduce((acc, { key, value }) => {
      if (systemKeys.includes(key)) {
        acc[key] = value === 'True' || value === 'False' ? value : value ? parseInt(value) : null
      }

      return acc
    }, {})

    const userObject = (userDefaultsData?.list || []).reduce((acc, { key, value }) => {
      if (userKeys.includes(key)) {
        acc[key] = value ? parseInt(value) : null
      }

      return acc
    }, {})
    setDefaults(prevDefaults => ({
      ...prevDefaults,
      userDefaultsList: userObject,
      systemDefaultsList: systemObject
    }))

    return { userDefaultsList: userObject, systemDefaultsList: systemObject }
  }

  async function onChangeDtId(dtId) {
    if (!dtId) return

    const res = await getRequest({
      extension: SaleRepository.DocumentTypeDefault.get,
      parameters: `_dtId=${dtId}`
    })
    formik.setFieldValue('spId', res?.record?.spId || defaults.userDefaultsList.spId || null)
    formik.setFieldValue('plantId', res?.record?.plantId || defaults.userDefaultsList.plantId || null)
  }
  useEffect(() => {
    let shipAdd = ''
    const { name, street1, street2, city, phone, phone2, email1 } = address
    if (name || street1 || street2 || city || phone || phone2 || email1) {
      shipAdd = `${name || ''}\n${street1 || ''}\n${street2 || ''}\n${city || ''}\n${phone || ''}\n${phone2 || ''}\n${
        email1 || ''
      }`
    }
    formik.setFieldValue('shipAddress', shipAdd)
    formik.setFieldValue('serializedAddress', shipAdd)
  }, [address])

  useEffect(() => {
    formik.setFieldValue('qty', parseFloat(totalQty).toFixed(2))
    formik.setFieldValue('amount', parseFloat(amount).toFixed(2))
    formik.setFieldValue('volume', parseFloat(totalVolume).toFixed(2))
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
    if (formik.values?.dtId & !recordId) onChangeDtId(formik.values?.dtId)
  }, [formik.values?.dtId])

  useEffect(() => {
    ;(async function () {
      const muList = await getMeasurementUnits()
      setMeasurements(muList?.list)
      const defaultValues = await getDefaultData()
      if (recordId) {
        const soItems = await getSalesOrderItems(recordId)
        const soHeader = await getSalesOrder(recordId)
        await fillForm(soHeader, soItems)
      } else {
        const defaultSalesTD = defaultValues.systemDefaultsList.salesTD
        if (defaultSalesTD) {
          setCycleButtonState({ text: '%', value: 2 })
          formik.setFieldValue('tdType', 2)
        } else {
          setCycleButtonState({ text: '123', value: 1 })
          formik.setFieldValue('tdType', 1)
        }
        const userDefaultSite = defaultValues.userDefaultsList.siteId
        const userDefaultSASite = defaultValues.systemDefaultsList.siteId
        const siteId = userDefaultSite ? userDefaultSite : userDefaultSASite
        const plant = defaultValues.userDefaultsList.plantId
        const salesPerson = defaultValues.userDefaultsList.spId
        formik.setFieldValue('siteId', parseInt(siteId))
        formik.setFieldValue('spId', parseInt(salesPerson))
        formik.setFieldValue('plantId', parseInt(plant))
      }
    })()
  }, [])

  async function previewBtnClicked() {
    const data = { printStatus: 2, recordId: formik.values.recordId }

    await postRequest({
      extension: SaleRepository.PrintedSA.printed,
      record: JSON.stringify(data)
    })

    invalidate()
  }

  return (
    <FormShell
      resourceId={ResourceIds.SalesOrder}
      functionId={SystemFunction.SalesOrder}
      form={formik}
      maxAccess={maxAccess}
      previewReport={editMode}
      previewBtnClicked={previewBtnClicked}
      isClosed={isClosed}
      actions={actions}
      editMode={editMode}
      disabledSubmit={isClosed && !editMode}
      disabledSavedClear={isClosed && !editMode}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={8}>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <ResourceComboBox
                    endpointId={SystemRepository.DocumentType.qry}
                    parameters={`_startAt=0&_pageSize=1000&_dgId=${SystemFunction.SalesOrder}`}
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
                    onChange={(event, newValue) => {
                      changeDT(newValue)
                      formik.setFieldValue('dtId', newValue?.recordId || null)
                    }}
                    error={formik.touched.dtId && Boolean(formik.errors.dtId)}
                  />
                </Grid>
                <Grid item xs={4}>
                  <ResourceComboBox
                    endpointId={SaleRepository.SalesPerson.qry}
                    name='spId'
                    label={labels.salesPerson}
                    columnsInDropDown={[
                      { key: 'spRef', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    readOnly={isClosed}
                    valueField='recordId'
                    displayField='name'
                    values={formik.values}
                    displayFieldWidth={1.5}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('spId', newValue ? newValue.recordId : null)
                    }}
                    error={formik.touched.spId && Boolean(formik.errors.spId)}
                  />
                </Grid>
                <Grid item xs={4}>
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
                    readOnly={isClosed}
                    values={formik.values}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('currencyId', newValue?.recordId || null)
                      formik.setFieldValue('items', [{ id: 1 }])
                    }}
                    error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
                  />
                </Grid>
                <Grid item xs={4}>
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
                <Grid item xs={4}>
                  <CustomDatePicker
                    name='date'
                    required
                    label={labels.date}
                    value={formik?.values?.date}
                    onChange={formik.setFieldValue}
                    editMode={editMode}
                    readOnly={isClosed}
                    maxAccess={maxAccess}
                    onClear={() => formik.setFieldValue('date', '')}
                    error={formik.touched.date && Boolean(formik.errors.date)}
                  />
                </Grid>
                <Grid item xs={4}>
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
            <Grid item xs={4}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <CustomTextArea
                    name='shipAddress'
                    label={labels.shipTo}
                    value={formik.values.shipAddress}
                    rows={2.5}
                    maxLength='100'
                    readOnly
                    disabled={formik.values.exWorks}
                    maxAccess={maxAccess}
                    viewDropDown={formik.values.clientId}
                    viewAdd={formik.values.clientId && !editMode}
                    onChange={e => formik.setFieldValue('shipAddress', e.target.value)}
                    onClear={() => formik.setFieldValue('shipAddress', '')}
                    onDropDown={() => openAddressFilterForm(true, false)}
                    handleAddAction={() => openAddressForm()}
                  />
                </Grid>
                <Grid item xs={6}>
                  <CustomTextArea
                    name='billAddress'
                    label={labels.billTo}
                    value={formik.values.billAddress}
                    rows={2.5}
                    maxLength='100'
                    readOnly={isClosed}
                    maxAccess={maxAccess}
                    viewDropDown={formik.values.clientId}
                    onChange={e => formik.setFieldValue('BillAddress', e.target.value)}
                    onClear={() => formik.setFieldValue('BillAddress', '')}
                    onDropDown={() => openAddressFilterForm(false, true)}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={3}>
              <ResourceLookup
                endpointId={SaleRepository.Client.snapshot}
                valueField='reference'
                displayField='name'
                secondFieldLabel={labels.name}
                name='clientId'
                label={labels.client}
                form={formik}
                required
                readOnly={isClosed}
                displayFieldWidth={6}
                valueShow='clientRef'
                secondValueShow='clientName'
                maxAccess={maxAccess}
                editMode={editMode}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' },
                  { key: 'szName', value: 'Sales Zone' }
                ]}
                onChange={async (event, newValue) => {
                  formik.setFieldValue('clientId', newValue?.recordId)
                  formik.setFieldValue('clientName', newValue?.name)
                  formik.setFieldValue('clientRef', newValue?.reference)
                  formik.setFieldValue('isVattable', newValue?.isSubjectToVAT || false)
                  formik.setFieldValue('maxDiscount', newValue?.maxDiscount)
                  formik.setFieldValue('tdPct', newValue?.tdPct)
                  formik.setFieldValue('taxId', newValue?.taxId)
                  setAddress({})
                  fillClientData(newValue?.recordId)
                }}
                errorCheck={'clientId'}
              />
            </Grid>
            <Grid item xs={1}>
              <CustomCheckBox
                name='isVattable'
                value={formik.values?.isVattable}
                onChange={event => formik.setFieldValue('isVattable', event.target.checked)}
                label={labels.VAT}
                disabled={formik.values.items[0]?.itemId}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={2}>
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
            <Grid item xs={2}>
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
            <Grid item xs={2}>
              <ResourceComboBox
                endpointId={SaleRepository.SalesZone.qry}
                parameters={`_startAt=0&_pageSize=1000&_sortField="recordId"&_filter=`}
                name='szId'
                label={labels.saleZone}
                valueField='recordId'
                displayField='name'
                readOnly={isClosed}
                values={formik.values}
                displayFieldWidth={1.5}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('szId', newValue ? newValue.recordId : null)
                }}
                error={formik.touched.szId && Boolean(formik.errors.szId)}
              />
            </Grid>
            <Grid item xs={2}>
              <CustomCheckBox
                name='exWorks'
                value={formik.values?.exWorks}
                onChange={event => {
                  const { name, checked } = event.target
                  formik.setFieldValue(name, checked)
                  if (checked) {
                    formik.setFieldValue('shipAddress', '')
                  }
                }}
                label={labels.exWorks}
                maxAccess={maxAccess}
                disabled={isClosed}
              />
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
              if (field == 'muRef') getFilteredMU(row?.itemId)
            }}
            value={formik.values.items}
            error={formik.errors.items}
            initialValues={formik?.initialValues?.items?.[0]}
            columns={columns}
            name='items'
            maxAccess={maxAccess}
            disabled={isClosed || !formik.values.clientId}
            allowDelete={!isClosed}
          />
        </Grow>
        <Fixed>
          <Grid container spacing={2} sx={{ pt: 2 }}>
            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <CustomTextArea
                    name='description'
                    label={labels.description}
                    value={formik.values.description}
                    rows={3}
                    editMode={editMode}
                    readOnly={isClosed}
                    maxAccess={maxAccess}
                    onChange={e => formik.setFieldValue('description', e.target.value)}
                    onClear={() => formik.setFieldValue('description', '')}
                    error={formik.touched.description && Boolean(formik.errors.description)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomCheckBox
                    name='overdraft'
                    value={formik.values?.overdraft}
                    onChange={event => formik.setFieldValue('overdraft', event.target.checked)}
                    readOnly
                    label={labels.overdraft}
                    maxAccess={access}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={3}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <CustomNumberField name='totalQTY' label={labels.totQty} value={totalQty} readOnly />
                </Grid>
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
                  <CustomNumberField
                    name='totalWeight'
                    maxAccess={maxAccess}
                    label={labels.totWeight}
                    value={totalWeight}
                    readOnly
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={3}>
              <Grid container spacing={3}>
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
                    readOnly={isClosed}
                    iconKey={cycleButtonState.text}
                    cycleButtonLabel={cycleButtonState.text}
                    decimalScale={2}
                    handleButtonClick={handleButtonClick}
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
                    readOnly={isClosed}
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

SalesOrderForm.width = 1300
SalesOrderForm.height = 750

export default SalesOrderForm
