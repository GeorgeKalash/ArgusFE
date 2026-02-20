import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { formatDateFromApi, formatDateToApi, formatDateForGetApI } from 'src/lib/date-helper'
import { Grid, Stack } from '@mui/material'
import { useContext, useEffect, useRef, useState } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
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
import { PurchaseRepository } from 'src/repositories/PurchaseRepository'
import { FinancialRepository } from 'src/repositories/FinancialRepository'
import { useForm } from 'src/hooks/form'
import WorkFlow from 'src/components/Shared/WorkFlow'
import { useWindow } from 'src/windows'
import { ControlContext } from 'src/providers/ControlContext'
import {
  getIPR,
  DIRTYFIELD_QTY,
  DIRTYFIELD_BASE_PRICE,
  DIRTYFIELD_BASE_LABOR_PRICE,
  DIRTYFIELD_TWPG,
  DIRTYFIELD_UNIT_PRICE,
  DIRTYFIELD_MDAMOUNT,
  DIRTYFIELD_EXTENDED_PRICE,
  MDTYPE_PCT,
  MDTYPE_AMOUNT
} from 'src/utils/ItemPriceCalculator'
import { getVatCalc } from 'src/utils/VatCalculator'
import {
  getDiscValues,
  getFooterTotals,
  getSubtotal,
  DIRTYFIELD_TDPLAIN,
  DIRTYFIELD_TDPCT
} from 'src/utils/FooterCalculator'
import { MultiCurrencyRepository } from 'src/repositories/MultiCurrencyRepository'
import { RateDivision } from 'src/resources/RateDivision'
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'
import { DataSets } from 'src/resources/DataSets'
import ItemCostHistory from 'src/components/Shared/ItemCostHistory'
import TaxDetails from 'src/components/Shared/TaxDetails'
import { CommonContext } from 'src/providers/CommonContext'
import ItemPromotion from 'src/components/Shared/ItemPromotion'
import CustomCheckBox from 'src/components/Inputs/CustomCheckBox'
import { SerialsForm } from 'src/components/Shared/SerialsForm'
import { useError } from 'src/error'
import { DIRTYFIELD_RATE, getRate } from 'src/utils/RateCalculator'
import MultiCurrencyRateForm from 'src/components/Shared/MultiCurrencyRateForm'
import { createConditionalSchema } from 'src/lib/validation'
import CustomButton from 'src/components/Inputs/CustomButton'
import { ResourceIds } from 'src/resources/ResourceIds'
import Installments from 'src/components/Shared/Installments'
import { PUSerialsForm } from 'src/components/Shared/PUSerialsForm'
import { SystemChecks } from 'src/resources/SystemChecks'

export default function PurchaseTransactionForm({ labels, access, recordId, functionId, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { platformLabels, defaultsData, userDefaultsData, systemChecks } = useContext(ControlContext)
  const { getAllKvsByDataset } = useContext(CommonContext)
  const [measurements, setMeasurements] = useState([])
  const filteredMeasurements = useRef([])
  const [initialPromotionType, setInitialPromotionType] = useState()
  const [metalPriceVisibility, setmetalPriceVisibility] = useState(false)
  const [defaultsDataState, setDefaultsDataState] = useState(null)
  const [userDefaultsDataState, setUserDefaultsDataState] = useState(null)
  const [reCal, setReCal] = useState(false)
  const { stack: stackError } = useError()
  const jumpToNextLine = systemChecks?.find(item => item.checkId === SystemChecks.POS_JUMP_TO_NEXT_LINE)?.value

  const [cycleButtonState, setCycleButtonState] = useState({
    text: '%',
    value: 2
  })

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: functionId,
    access: access,
    enabled: !recordId,
    objectName: 'header'
  })

  const conditions = {
    sku: row => row?.sku,
    itemName: row => row?.itemName,
    qty: row => row?.qty > 0
  }

  const { schema, requiredFields } = createConditionalSchema(conditions, true, maxAccess, 'items')

  const initialValues = {
    recordId: recordId,
    disableSKULookup: false,
    header: {
      dtId: null,
      dgId: functionId,
      functionId: functionId,
      recordId: null,
      reference: '',
      date: new Date(),
      dueDate: new Date(),
      plantId: null,
      vendorId: null,
      vendorName: '',
      vendorRef: '',
      currencyId: null,
      szId: null,
      spId: null,
      siteId: null,
      description: '',
      status: 1,
      isVattable: false,
      taxId: null,
      subtotal: 0,
      miscAmount: 0,
      amount: 0,
      vatAmount: 0,
      tdAmount: 0,
      plId: null,
      ptId: null,
      maxDiscount: '',
      currentDiscount: 0,
      exRate: 1,
      rateCalcMethod: 1,
      tdType: cycleButtonState.value,
      tdPct: 0,
      baseAmount: 0,
      volume: 0,
      weight: 0,
      qty: 0,
      isVerified: false,
      contactId: null,
      commitItems: false,
      postMetalToFinancials: false,
      metalPrice: 0,
      KGmetalPrice: 0
    },
    items: [
      {
        id: 1,
        orderId: recordId || 0,
        itemId: null,
        sku: '',
        itemName: '',
        seqNo: 1,
        siteId: '',
        muId: null,
        qty: 0,
        volume: 0,
        weight: 0,
        isMetal: false,
        metalId: null,
        metalPurity: 0,
        msId: 0,
        muRef: '',
        muQty: 0,
        baseQty: 0,
        mdType: MDTYPE_PCT,
        basePrice: 0,
        baseLaborPrice: 0,
        TotPricePerG: 0,
        totalWeightPerG: 0,
        mdValue: 0,
        unitPrice: 0,
        unitCost: 0,
        overheadId: '',
        vatAmount: 0,
        mdAmount: 0,
        extendedPrice: 0,
        priceType: 0,
        applyVat: false,
        taxId: null,
        taxDetails: null,
        promotionTypeName: initialPromotionType?.value,
        promotionType: initialPromotionType?.key,
        notes: ''
      }
    ],
    serials: [],
    lots: [],
    taxCodes: []
  }

  const invalidate = useInvalidate({
    endpointId: PurchaseRepository.PurchaseInvoiceHeader.qry
  })

  const getGLResource = functionId => {
    const fn = Number(functionId)
    switch (fn) {
      case SystemFunction.PurchaseInvoice:
        return ResourceIds.GLPurchaseInvoice
      case SystemFunction.PurchaseReturn:
        return ResourceIds.GLPurchaseReturn
      default:
        return null
    }
  }

  const getEndpoint = {
    [SystemFunction.PurchaseInvoice]: {
      set: PurchaseRepository.PurchaseInvoiceHeader.set2,
      post: PurchaseRepository.PurchaseInvoiceHeader.post,
      unpost: PurchaseRepository.PurchaseInvoiceHeader.unpost
    },
    [SystemFunction.PurchaseReturn]: {
      set: PurchaseRepository.PurchaseReturnHeader.set2,
      post: PurchaseRepository.PurchaseReturnHeader.post,
      unpost: PurchaseRepository.PurchaseReturnHeader.unpost
    }
  }

  const onClick = () => {
    stack({
      Component: ItemPromotion,
      props: {
        invoiceId: formik.values.header.recordId
      }
    })
  }

  const { formik } = useForm({
    maxAccess,
    documentType: { key: 'header.dtId', value: documentType?.dtId },
    conditionSchema: ['items'],
    initialValues: initialValues,
    validationSchema: yup.object({
      header: yup.object({
        date: yup.string().required(),
        dueDate: yup.string().required(),
        currencyId: yup.string().required(),
        vendorId: yup.string().required(),
        siteId: yup
          .number()
          .transform(value => (isNaN(value) ? undefined : Number(value)))
          .nullable()
          .test('', function (value) {
            const { dtId, commitItems } = this.parent

            if (dtId == null) {
              return !!value
            }

            if (dtId && commitItems === true) {
              return !!value
            }

            return true
          })
      }),
      items: yup.array().of(schema)
    }),
    onSubmit: async obj => {
      const serialsValues = []

      const updatedRows = obj.items
        .filter(row => Object.values(requiredFields)?.every(fn => fn(row)))
        .map(({ id, isVattable, taxDetails, ...rest }) => {
          const { serials, ...restDetails } = rest
          if (serials) {
            const updatedSerials = serials.map((serialDetail, idx) => {
              return {
                ...serialDetail,
                id: idx + 1,
                seqNo: id,
                srlSeqNo: 0,
                componentSeqNo: 0,
                invoiceId: formik.values.recordId || 0,
                itemId: rest?.itemId
              }
            })
            serialsValues.push(...updatedSerials)
          }

          return {
            ...restDetails,
            seqNo: id,
            invoiceId: formik.values.recordId || 0,
            applyVat: isVattable
          }
        })

      const payload = {
        header: {
          ...obj.header,
          date: formatDateToApi(obj.header.date),
          dueDate: formatDateToApi(obj.header.dueDate)
        },
        installments: obj?.installments?.map((installment, index) => {
          return {
            ...installment,
            id: index + 1,
            seqNo: index + 1,
            reference: obj?.header?.reference,
            vendorId: obj?.header?.vendorId,
            invoiceId: formik?.values?.recordId || 0,
            currencyId: obj?.header?.currencyId
          }
        }),
        items: updatedRows,
        serials: serialsValues,
        taxCodes: [
          ...[
            ...obj.items
              .filter(({ taxDetails }) => taxDetails && taxDetails?.length > 0)
              .map(({ taxDetails, id }) => ({
                seqNo: id,
                ...taxDetails[0]
              }))
          ].filter(tax => obj.items.some(item => item.id === tax.seqNo))
        ],
        ...(({ header, items, taxCodes, serials, ...rest }) => rest)(obj)
      }

      const puTrxRes = await postRequest({
        extension: getEndpoint[functionId]?.['set'],
        record: JSON.stringify(payload)
      })
      const actionMessage = editMode ? platformLabels.Edited : platformLabels.Added

      if (puTrxRes?.recordId) {
        await refetchForm(puTrxRes.recordId)
        toast.success(actionMessage)
        invalidate()
      }
    }
  })

  const itemsUpdate = useRef(formik?.values?.items)

  const isPosted = formik.values.header.status === 3
  const editMode = !!formik.values.header.recordId

  const iconKey = ({ value, data }) => {
    const mdType = value?.mdType || data?.mdType

    return mdType === MDTYPE_PCT ? '%' : '123'
  }

  async function getPromotionTypes() {
    return new Promise((resolve, reject) => {
      getAllKvsByDataset({
        _dataset: DataSets.PROMOTION_TYPE,
        callback: result => {
          if (result) resolve(result)
          else reject()
        }
      })
    })
  }

  async function getFilteredMU(itemId) {
    if (!itemId) return

    const currentItemId = formik.values.items?.find(item => parseInt(item.itemId) === itemId)?.msId

    const arrayMU = measurements?.filter(item => item.msId === currentItemId) || []
    filteredMeasurements.current = arrayMU
  }

  async function fillSkuData(update, addRow, newRow) {
    const phycialProperty = await getItemPhysProp(newRow?.itemId)
    const itemInfo = await getItem(newRow?.itemId)

    const vendorPrice =
      newRow?.promotionType === '3' || newRow?.promotionType === '4'
        ? undefined
        : await getVendorPrice(newRow?.itemId, formik.values.header)
    await fillItemObject(update, addRow, newRow, phycialProperty, itemInfo, vendorPrice)
  }

  const columns = [
    {
      component: 'resourcecombobox',
      name: 'promotionTypeName',
      label: labels.promotionType,
      hidden: true,
      props: {
        datasetId: DataSets.PROMOTION_TYPE,
        valueField: 'key',
        displayField: 'value',
        mapping: [
          { from: 'key', to: 'promotionType' },
          { from: 'value', to: 'promotionTypeName' }
        ]
      }
    },
    {
      component: formik?.values?.disableSKULookup ? 'textfield' : 'resourcelookup',
      label: labels.sku,
      name: 'sku',
      jumpToNextLine,
      flex: 2,
      ...(formik.values.disableSKULookup && { updateOn: 'blur' }),
      props: {
        ...(!formik.values.disableSKULookup && {
          endpointId: InventoryRepository.Item.snapshot,
          parameters: { _categoryId: 0, _msId: 0, _startAt: 0, _size: 1000 },
          displayField: 'sku',
          valueField: 'sku',
          mapping: [
            { from: 'recordId', to: 'itemId' },
            { from: 'sku', to: 'sku' },
            { from: 'name', to: 'itemName' },
            { from: 'trackBy', to: 'trackBy' },
            { from: 'msId', to: 'msId' },
            { from: 'isInactive', to: 'isInactive' }
          ],
          columnsInDropDown: [
            { key: 'sku', value: 'SKU' },
            { key: 'name', value: 'Item Name' }
          ],
          displayFieldWidth: 5,
          minChars: 2
        })
      },
      async onChange({ row: { update, newRow, oldRow, addRow } }) {
        const resetRow = id =>
          update({
            ...formik.initialValues.items[0],
            id,
            enabled: false
          })

        if (!formik.values.disableSKULookup) {
          if (!newRow?.itemId) return resetRow(newRow.id)

          if (newRow.isInactive) {
            resetRow(newRow.id)
            stackError({ message: labels.inactiveItem })

            return
          }

          return fillSkuData(update, addRow, newRow)
        }

        if (!newRow?.sku) return resetRow(newRow.id)

        const skuInfo = await getRequest({
          extension: InventoryRepository.Items.get2,
          parameters: `_sku=${newRow.sku}`
        })

        const record = skuInfo?.record

        if (!record) {
          resetRow(newRow.id)
          stackError({ message: labels.invalidSKU })

          return
        }

        if (record.isInactive) {
          resetRow(newRow.id)
          stackError({ message: labels.inactiveItem })

          return
        }

        return fillSkuData(update, addRow, {
          ...newRow,
          itemId: record.recordId
        })
      },
      propsReducer({ row, props }) {
        return { ...props, imgSrc: onCondition(row) }
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
        displayFieldWidth: 5
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
        if (newRow) {
          const filteredItems = filteredMeasurements?.current.filter(item => item.recordId === newRow?.muId)
          const qtyInBase = newRow?.qty * filteredItems?.muQty

          update({
            qtyInBase,
            muQty: newRow?.muQty
          })
        }
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
      props: {
        onCondition: row => {
          return {
            decimalScale: row?.decimals,
            readOnly: !row?.itemId
          }
        }
      },
      async onChange({ row: { update, newRow } }) {
        const data = getItemPriceRow(newRow, DIRTYFIELD_QTY)
        update({
          ...data,
          totalWeight: data.weight * newRow.qty
        })
      }
    },
    {
      component: 'numberfield',
      label: labels.pcs,
      name: 'pieces',
      updateOn: 'blur'
    },
    {
      component: 'numberfield',
      label: labels.volume,
      name: 'volume',
      props: {
        decimalScale: 2,
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.weight,
      name: 'weight',
      props: {
        decimalScale: 2,
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.totalWeight,
      name: 'totalWeight',
      props: {
        readOnly: true,
        decimalScale: 3
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
      label: labels.baseLaborPrice,
      name: 'baseLaborPrice',
      updateOn: 'blur',
      async onChange({ row: { update, newRow } }) {
        const data = getItemPriceRow(newRow, DIRTYFIELD_BASE_LABOR_PRICE)
        update(data)
      }
    },
    {
      component: 'numberfield',
      label: labels.totalPPG,
      name: 'totalWeightPerG',
      updateOn: 'blur',
      async onChange({ row: { update, newRow } }) {
        const data = getItemPriceRow(newRow, DIRTYFIELD_TWPG)
        update(data)
      }
    },
    {
      component: 'numberfield',
      label: labels.unitPrice,
      name: 'unitPrice',
      updateOn: 'blur',
      props: {
        decimalScale: 3
      },
      async onChange({ row: { update, newRow } }) {
        const data = getItemPriceRow(newRow, DIRTYFIELD_UNIT_PRICE)
        update(data)
      }
    },
    {
      component: 'button',
      name: 'costHistory',
      props: {
        imgSrc: '/images/buttonsIcons/popup-black.png',
        onCondition: row => {
          return {
            disabled: !row?.itemId
          }
        }
      },
      label: labels.costHistory,
      onClick: (e, row) => {
        stack({
          Component: ItemCostHistory,
          props: {
            itemId: row?.itemId,
            obj: row
          }
        })
      }
    },
    {
      component: 'resourcecombobox',
      label: labels.taxDetails,
      name: 'taxName',
      props: {
        endpointId: FinancialRepository.TaxSchedules.qry,
        displayField: 'name',
        valueField: 'recordId',
        mapping: [
          { from: 'recordId', to: 'taxId' },
          { from: 'name', to: 'taxName' }
        ],
        columnsInDropDown: [
          { key: 'reference', value: 'Reference' },
          { key: 'name', value: 'Name' }
        ],
        displayFieldWidth: 4
      },
      async onChange({ row: { update, newRow } }) {
          setReCal(true)
          const taxDetails = newRow?.taxId ? await getTaxDetails(newRow?.taxId) : null

          const vatCalcRow = getVatCalc({
            priceType: newRow?.priceType,
            basePrice: newRow?.basePrice,
            unitPrice: newRow?.unitPrice,
            qty: newRow?.qty,
            weight: newRow?.weight,
            extendedPrice: newRow?.extendedPrice,
            baseLaborPrice: newRow?.baseLaborPrice,
            vatAmount: newRow?.vatAmount || 0,
            tdPct: formik?.values?.header?.tdPct,
            taxDetails: formik.values.header.isVattable? taxDetails : null
          })

          update({
            vatAmount: vatCalcRow?.vatAmount || 0 ,
            taxDetails
          })
      }
    },
    {
      component: 'numberfield',
      label: labels.VAT,
      name: 'vatAmount',
      props: {
        decimalScale: 2,
        readOnly: true
      }
    },
    {
      component: 'button',
      name: 'taxDetailsButton',
      props: {
        onCondition: row => {
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
        decimalScale: 2,
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
      props: {
        decimalScale: 2
      },
      async onChange({ row: { update, newRow } }) {
        const data = getItemPriceRow(newRow, DIRTYFIELD_EXTENDED_PRICE)
        update(data)
      }
    },

    {
      component: 'textfield',
      label: labels.notes,
      name: 'notes'
    }
  ]

  function checkMinMaxAmount(amount, type, modType) {
    let currentAmount = parseFloat(amount) || 0

    if (type === modType) {
      if (currentAmount < 0 || currentAmount > 100) currentAmount = 0
    } else {
      if (currentAmount < 0) currentAmount = 0
    }

    return currentAmount
  }

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

  async function onWorkFlowClick() {
    stack({
      Component: WorkFlow,
      props: {
        functionId: functionId,
        recordId: formik.values.header.recordId
      }
    })
  }

  const onPost = async () => {
    await postRequest({
      extension: getEndpoint[functionId]?.['post'],
      record: JSON.stringify(formik.values.header)
    })

    toast.success(platformLabels.Posted)
    await refetchForm(formik.values.recordId)
    invalidate()
    window.close()
  }

  const onUnpost = async () => {
    const res = await postRequest({
      extension: getEndpoint[functionId]?.['unpost'],
      record: JSON.stringify(formik.values.header)
    })

    await refetchForm(res.recordId)
    toast.success(platformLabels.Posted)
    invalidate()
  }

  const handleMetalClick = async () => {
    const metalItemsList = itemsUpdate?.current
      ?.filter(item => item.metalId)
      .map(item => ({
        qty: item.qty,
        metalRef: '',
        metalId: item.metalId,
        metalPurity: item.metalPurity,
        weight: item.weight,
        priceType: item.priceType
      }))

    return metalItemsList || []
  }

  async function verifyRecord() {
    await postRequest({
      extension: PurchaseRepository.PurchaseInvoiceHeader.verify,
      record: JSON.stringify({ ...formik.values.header, isVerified: !formik.values.header.isVerified })
    })

    toast.success(!formik.values.header.isVerified ? platformLabels.Verified : platformLabels.Unverfied)
    refetchForm(formik.values.header.recordId)
    invalidate()
  }

  async function syncRecord() {
    const { items } = formik.values

    const record = { ...formik.values, serials: items.flatMap(item => item.serials || []) }

    await postRequest({
      extension: PurchaseRepository.Serials.sync,
      record: JSON.stringify(record)
    })

    toast.success(platformLabels.syncedSuccessfully)
    refetchForm(formik.values.header.recordId)
    invalidate()
  }

  const onClickInstallments = () => {
    stack({
      Component: Installments,
      props: {
        data: {
          installments: formik.values.installments,
          reference: formik.values.header.reference,
          recordId: formik.values?.recordId,
          status: formik.values.header.status,
          vendorId: formik.values.header.vendorId,
          currencyId: formik.values.header.currencyId
        },
        onOk: ({ installments }) => {
          formik.setFieldValue('installments', installments)
        }
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
      key: 'Metals',
      condition: true,
      onClick: 'onClickMetal',
      handleMetalClick
    },
    {
      key: 'Locked',
      condition: isPosted,
      onClick: 'onUnpostConfirmation',
      onSuccess: onUnpost,
      disabled: !editMode
    },
    {
      key: 'Unlocked',
      condition: !isPosted,
      onClick: onPost,
      disabled: !editMode
    },
    {
      key: 'IV',
      condition: true,
      onClick: 'onInventoryTransaction',
      disabled: !editMode || !isPosted
    },
    {
      key: 'Aging',
      condition: true,
      onClick: 'onClickAging',
      disabled: !editMode
    },
    {
      key: 'GL',
      condition: true,
      onClick: 'onClickGL',
      valuesPath: { ...formik.values.header, notes: formik?.values?.header?.description },
      datasetId: getGLResource(functionId),
      disabled: !editMode
    },
    {
      key: 'ItemPromotion',
      condition: true,
      onClick: onClick,
      disabled: !editMode
    },
    {
      key: 'Installments',
      condition: true,
      onClick: onClickInstallments,
      disabled: !editMode
    },
    {
      key: 'Verify',
      condition: !formik.values.header.isVerified,
      onClick: verifyRecord,
      disabled: formik.values.header.isVerified || !editMode || !isPosted
    },
    {
      key: 'Unverify',
      condition: formik.values.header.isVerified,
      onClick: verifyRecord,
      disabled: !formik.values.header.isVerified
    },
    {
      key: 'Sync',
      condition: true,
      onClick: syncRecord,
      disabled: !editMode || isPosted
    },
    {
      key: 'Attachment',
      condition: true,
      onClick: 'onClickAttachment',
      disabled: !editMode
    }
  ]

  async function fillForm(puTrxPack) {
    const puTrxHeader = puTrxPack?.header
    const puTrxItems = puTrxPack?.items
    const puTrxTaxes = puTrxPack?.taxCodes
    const puTrxSerials = puTrxPack?.serials
    const puTrxInstallments = puTrxPack?.installments
    const disableLookup = await sKULookupInfo(puTrxPack?.header?.dtId)

    puTrxHeader?.tdType === 1 || puTrxHeader?.tdType == null
      ? setCycleButtonState({ text: '123', value: 1 })
      : setCycleButtonState({ text: '%', value: 2 })

    const modifiedList = puTrxItems.length
      ? await Promise.all(
          puTrxItems?.map(async (item, index) => {
            const puTrxTaxes = item?.taxId && (await getTaxDetails(item.taxId))
            const taxDetailsResponse = []

            const updatedpuTrxTaxes =
              puTrxTaxes?.map(tax => {
                const matchingTaxDetail = taxDetailsResponse?.find(responseTax => responseTax.seqNo === tax.taxSeqNo)

                return {
                  ...tax,
                  taxBase: matchingTaxDetail ? matchingTaxDetail.taxBase : tax.taxBase
                }
              }) || null

            return {
              ...item,
              id: index + 1,
              basePrice: item.basePrice ? item.basePrice : 0,
              unitPrice: item.unitPrice ? item.unitPrice : 0,
              vatAmount: item.vatAmount ? item.vatAmount : 0,
              totalWeight: item.weight * item.qty,
              extendedPrice: item.extendedPrice ? item.extendedPrice : 0,
              puTrx: true,
              serials: puTrxSerials
                ?.filter(row => row.seqNo == item.seqNo)
                ?.map((serialDetail, index) => {
                  return {
                    ...serialDetail,
                    id: index
                  }
                }),
              taxDetails: updatedpuTrxTaxes?.filter(tax => tax.seqNo === item.seqNo)
            }
          })
        )
      : formik.initialValues.items

    formik.setValues({
      ...formik.values,
      recordId: puTrxHeader.recordId || null,
      dtId: puTrxHeader.dtId || null,
      disableSKULookup: disableLookup || false,
      installments: puTrxInstallments?.map((installment, index) => {
        return {
          ...installment,
          id: index,
          dueDate: formatDateFromApi(installment.dueDate)
        }
      }),
      header: {
        ...formik.values.header,
        ...puTrxHeader,
        amount: parseFloat(puTrxHeader?.amount).toFixed(2),
        currentDiscount:
          puTrxHeader?.tdType == 1 || puTrxHeader?.tdType == null ? puTrxHeader?.tdAmount : puTrxHeader?.tdPct,
        KGmetalPrice: puTrxHeader?.metalPrice * 1000
      },
      items: modifiedList,
      taxCodes: [...puTrxTaxes]
    })

    itemsUpdate.current = modifiedList
  }
  async function getPurchaseTransactionPack(transactionId) {
    const res = await getRequest({
      extension: PurchaseRepository.PurchaseInvoiceHeader.get2,
      parameters: `_recordId=${transactionId}`
    })

    res.record.header.date = formatDateFromApi(res?.record?.header?.date)
    res.record.header.dueDate = formatDateFromApi(res?.record?.header?.dueDate)

    return res.record
  }

  const getMeasurementUnits = async () => {
    return await getRequest({
      extension: InventoryRepository.MeasurementUnit.qry,
      parameters: `_msId=0`
    })
  }

  async function fillMetalPrice(baseMetalCuId) {
    if (baseMetalCuId) {
      const res = await getRequest({
        extension: MultiCurrencyRepository.Currency.get,
        parameters: `_currencyId=${baseMetalCuId}&_date=${formatDateForGetApI(
          formik.values.header.date
        )}&_rateDivision=${RateDivision.PURCHASE}`
      })

      return res?.record?.exRate * 1000
    }
  }

  async function setMetalPriceOperations() {
    const defaultMCbaseCU = defaultsData?.list?.find(({ key }) => key === 'baseMetalCuId')
    const MCbaseCU = defaultMCbaseCU?.value ? parseInt(defaultMCbaseCU.value) : null
    if (MCbaseCU != null) {
      const kgMetalPriceValue = await fillMetalPrice(MCbaseCU)
      if (kgMetalPriceValue != null) {
        formik.setFieldValue('header.KGmetalPrice', kgMetalPriceValue)
        formik.setFieldValue('header.metalPrice', kgMetalPriceValue / 1000)
      } else {
        formik.setFieldValue('header.KGmetalPrice', 0)
        formik.setFieldValue('header.metalPrice', 0)
      }
    }
  }

  async function fillVendorData(object) {
    const currenctTdType = object?.tradeDiscount ? DIRTYFIELD_TDPCT : formik.values.header.tdType
    if (currenctTdType == DIRTYFIELD_TDPCT) setCycleButtonState({ text: '%', value: 2 })
    formik.setValues({
      ...formik.values,
      header: {
        ...formik.values.header,
        vendorId: object?.recordId,
        vendorName: object?.name,
        vendorRef: object?.reference,
        isVattable: object?.isTaxable || false,
        tdAmount: object?.tradeDiscount,
        tdPct: object?.tradeDiscount,
        currentDiscount: object?.tradeDiscount || 0,
        tdType: currenctTdType,
        taxId: object?.taxId,
        taxName: object?.taxName || '',
        paymentMethod: object?.paymentMethod
      }
    })
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
  async function getVendorPrice(itemId, form) {
    const res = await getRequest({
      extension: PurchaseRepository.VendorPrice.get,
      parameters: `_itemId=${itemId}&_vendorId=${form.vendorId}&_currencyId=${form.currencyId}&_functionId=${functionId}`
    })

    return res?.record
  }

  function isValidPrice(value) {
    return value != null && value != '' && !isNaN(value) && value != 0
  }

  async function fillItemObject(update, addRow, newRow, itemPhysProp, itemInfo, vendorPrice) {
    const weight = itemPhysProp?.weight || 0
    const metalPurity = itemPhysProp?.metalPurity ?? 0
    const isMetal = itemPhysProp?.isMetal ?? false
    const metalId = itemPhysProp?.metalId ?? null

    const postMetalToFinancials = formik?.values?.header?.postMetalToFinancials ?? false
    const metalPrice = formik?.values?.header?.KGmetalPrice ?? 0
    const basePrice = (metalPrice * metalPurity) / 1000
    const basePriceValue = postMetalToFinancials === false ? basePrice : 0

    const unitPrice = !vendorPrice ? 0 : vendorPrice.priceList
    const baseLaborPrice = !vendorPrice ? 0 : vendorPrice.baseLaborPrice
    const TotPricePerG = basePriceValue + baseLaborPrice

    let rowTax = null
    let rowTaxName = ''
    let rowTaxDetails = null

    if (!formik.values.header.taxId) {
      if (itemInfo.taxId) {
        const taxDetailsResponse = await getTaxDetails(itemInfo.taxId)

        const details = taxDetailsResponse.map(item => ({
          invoiceId: formik.values.recordId || 0,
          taxSeqNo: item.seqNo,
          taxId: itemInfo.taxId,
          taxCodeId: item.taxCodeId,
          taxBase: item.taxBase,
          amount: item.amount ?? 0
        }))
        rowTax = itemInfo.taxId
        rowTaxName = itemInfo?.taxName || ''
        rowTaxDetails = details
      }
    } else {
      const taxDetailsResponse = await getTaxDetails(formik.values.header.taxId)

      const details = taxDetailsResponse.map(item => ({
        invoiceId: formik.values.recordId || 0,
        taxSeqNo: item.seqNo,
        taxId: formik.values.header.taxId,
        taxCodeId: item.taxCodeId,
        taxBase: item.taxBase,
        amount: item.amount
      }))
      rowTax = formik.values.header.taxId
      rowTaxName = formik.values?.header?.taxName || ''
      rowTaxDetails = details
    }

    const filteredMeasurements = measurements?.filter(item => item.msId === itemInfo?.msId)
    const measurementSchedule = await getMeasurementObject(itemInfo?.msId)

    const updatedRowValues = {
      id: newRow?.id,
      decimals: measurementSchedule?.decimals,
      sku: itemInfo?.sku || '',
      itemName: itemInfo?.name || '',
      itemId: itemInfo?.recordId || null,
      isMetal: isMetal,
      metalId: metalId,
      metalPurity: metalPurity,
      volume: itemPhysProp?.volume || 0,
      weight: weight,
      basePrice: basePriceValue,
      baseLaborPrice: baseLaborPrice,
      TotPricePerG: TotPricePerG,
      unitPrice: unitPrice,
      priceType: itemInfo?.priceType || 1,
      qty: 1,
      msId: itemInfo?.msId,
      muRef: filteredMeasurements?.[0]?.reference,
      muId: filteredMeasurements?.[0]?.recordId,
      muQty: filteredMeasurements?.[0]?.qty,
      mdAmount: formik.values.header.maxDiscount ? formik.values.header.maxDiscount : 0,
      mdValue: 0,
      mdType: MDTYPE_PCT,
      extendedPrice: 0,
      mdValue: 0,
      taxId: rowTax,
      taxName: rowTaxName,
      taxDetails: rowTaxDetails
    }
    let data = getItemPriceRow(updatedRowValues, DIRTYFIELD_QTY)

    const dirtyField = isValidPrice(updatedRowValues.baseLaborPrice)
      ? DIRTYFIELD_BASE_LABOR_PRICE
      : isValidPrice(updatedRowValues.unitPrice)
      ? DIRTYFIELD_UNIT_PRICE
      : null

    if (dirtyField) data = getItemPriceRow(data, dirtyField)

    formik.setFieldValue(
      'header.mdAmount',
      formik.values.header.currentDiscount ? formik.values.header.currentDiscount : 0
    )

    if (!jumpToNextLine) {
      return update(data)
    }

    if (formik.values.disableSKULookup) {
      return addRow({
        fieldName: 'sku',
        changes: data
      })
    }

    update(data)
    addRow()
  }

  async function getTaxDetails(taxId) {
    const res = await getRequest({
      extension: FinancialRepository.TaxDetailPack.qry,
      parameters: `_taxId=${taxId}`
    })

    return res?.list
  }

  const handleButtonClick = () => {
    setReCal(true)
    let currentTdAmount
    let currentPctAmount
    let currentDiscountAmount

    if (cycleButtonState.value == 1) {
      currentPctAmount =
        formik.values.header.currentDiscount < 0 || formik.values.header.currentDiscount > 100
          ? 0
          : formik.values.header.currentDiscount
      currentTdAmount = (parseFloat(currentPctAmount) * parseFloat(formik.values.header.subtotal)) / 100
      currentDiscountAmount = currentPctAmount

      formik.setFieldValue('header.tdAmount', currentTdAmount)
      formik.setFieldValue('header.tdPct', currentPctAmount)
      formik.setFieldValue('header.currentDiscount', currentPctAmount)
    } else {
      currentTdAmount =
        formik.values.header.currentDiscount < 0 || subtotal < formik.values.header.currentDiscount
          ? 0
          : formik.values.header.currentDiscount
      currentPctAmount = (parseFloat(currentTdAmount) / parseFloat(formik.values.header.subtotal)) * 100
      currentDiscountAmount = currentTdAmount

      formik.setFieldValue('header.tdPct', currentPctAmount)
      formik.setFieldValue('header.tdAmount', currentTdAmount)
      formik.setFieldValue('header.currentDiscount', currentTdAmount)
    }
    setCycleButtonState(prevState => {
      const newState = prevState.text === '%' ? { text: '123', value: 1 } : { text: '%', value: 2 }
      formik.setFieldValue('header.tdType', newState.value)
      recalcGridVat(newState.value, currentPctAmount, currentTdAmount, currentDiscountAmount)

      return newState
    })
  }

  function getItemPriceRow(newRow, dirtyField, iconClicked) {
    !reCal && setReCal(true)

    const mdAmount = checkMinMaxAmount(newRow?.mdAmount, newRow?.mdType, MDTYPE_PCT)

    const itemPriceRow = getIPR({
      priceType: newRow?.priceType,
      basePrice: parseFloat(newRow?.basePrice) || 0,
      volume: newRow?.volume || 0,
      weight: newRow?.weight,
      unitPrice: newRow?.unitPrice || 0,
      upo: 0,
      qty: newRow?.qty,
      extendedPrice: newRow?.extendedPrice,
      mdAmount: mdAmount,
      mdType: newRow?.mdType,
      mdValue: newRow?.mdValue,
      baseLaborPrice: parseFloat(newRow?.baseLaborPrice) || 0,
      totalWeightPerG: newRow?.totalWeightPerG || 0,
      tdPct: formik?.values?.header?.tdPct || 0,
      dirtyField: dirtyField
    })

    const vatCalcRow = getVatCalc({
      priceType: itemPriceRow?.priceType,
      basePrice: itemPriceRow?.basePrice,
      unitPrice: itemPriceRow?.unitPrice,
      qty: itemPriceRow?.qty,
      weight: itemPriceRow?.weight,
      extendedPrice: itemPriceRow?.extendedPrice,
      baseLaborPrice: itemPriceRow?.baseLaborPrice,
      vatAmount: itemPriceRow?.vatAmount || 0,
      tdPct: formik?.values?.header?.tdPct,
      taxDetails: formik.values.header.isVattable === true ? newRow.taxDetails : null
    })

    const qtyInBase = itemPriceRow?.qty * newRow?.muQty

    let commonData = {
      ...newRow,
      id: newRow?.id,
      qty: itemPriceRow?.qty ? itemPriceRow?.qty : 0,
      baseQty: qtyInBase ? qtyInBase : 0,
      volume: itemPriceRow?.volume ? itemPriceRow.volume : 0,
      weight: itemPriceRow?.weight ? itemPriceRow.weight : 0,
      basePrice: itemPriceRow?.basePrice ? itemPriceRow.basePrice : 0,
      unitPrice: itemPriceRow?.unitPrice ? itemPriceRow.unitPrice : 0,
      extendedPrice: itemPriceRow?.extendedPrice ? itemPriceRow.extendedPrice : 0,
      mdValue: itemPriceRow?.mdValue,
      mdType: itemPriceRow?.mdType,
      totalWeightPerG: itemPriceRow?.totalWeightPerG ? itemPriceRow?.totalWeightPerG : 0,
      mdAmount: itemPriceRow?.mdAmount ? itemPriceRow.mdAmount : 0,
      vatAmount: vatCalcRow?.vatAmount ? vatCalcRow.vatAmount : 0
    }

    return iconClicked ? { changes: commonData } : commonData
  }

  const parsedItemsArray = formik.values.items
    ?.filter(item => item.itemId !== undefined)
    .map(item => ({
      ...item,
      basePrice: item.basePrice || 0,
      unitPrice: item.unitPrice || 0,
      vatAmount: item.vatAmount || 0,
      weight: item.weight || 0,
      volume: item.volume || 0,
      extendedPrice: item.extendedPrice || 0
    }))

  const subTotal = getSubtotal(parsedItemsArray)

  const miscValue = formik.values.miscAmount == 0 ? 0 : parseFloat(formik.values.header.miscAmount)

  const _footerSummary = getFooterTotals(parsedItemsArray, {
    totalQty: 0,
    totalWeight: 0,
    totalVolume: 0,
    sumVat: 0,
    sumExtended: parseFloat(subTotal),
    tdAmount: parseFloat(formik.values.header.tdAmount),
    net: 0,
    miscAmount: miscValue || 0
  })

  const totalQty = reCal ? _footerSummary?.totalQty : formik.values?.header?.qty || 0
  const amount = reCal ? _footerSummary?.net : formik.values?.header.amount || 0
  const totalVolume = reCal ? _footerSummary?.totalVolume : formik.values?.header.volume || 0
  const totalWeight = reCal ? _footerSummary?.totalWeight : formik.values?.header.weight || 0
  const subtotal = reCal ? subTotal : formik.values?.header.subtotal || 0
  const vatAmount = reCal ? _footerSummary?.sumVat : formik.values?.header.vatAmount || 0

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
    formik.setFieldValue('header.tdAmount', _discountObj?.hiddenTdAmount ? _discountObj?.hiddenTdAmount?.toFixed(2) : 0)

    formik.setFieldValue('header.tdType', _discountObj?.tdType)
    formik.setFieldValue('header.currentDiscount', _discountObj?.currentDiscount || 0)
    formik.setFieldValue('header.tdPct', _discountObj?.hiddenTdPct)

    return _discountObj?.hiddenTdPct
  }

  function recalcNewVat(tdPct) {
    formik.values.items.map((item, index) => {
      const vatCalcRow = getVatCalc({
        priceType: item?.priceType,
        basePrice: item?.basePrice,
        qty: item?.qty,
        weight: item?.weight,
        extendedPrice: item?.extendedPrice,
        baseLaborPrice: parseFloat(item?.baseLaborPrice),
        vatAmount: item?.vatAmount,
        tdPct: tdPct,
        taxDetails: formik.values.header.isVattable === true ? item.taxDetails : null
      })
      formik.setFieldValue(`items[${index}].vatAmount`, vatCalcRow?.vatAmount)
    })
  }

  async function recalcGridVat(typeChange, tdPct, tdAmount, currentDiscount) {
    const currentTdPct = checkDiscount(typeChange, tdPct, tdAmount, currentDiscount)
    recalcNewVat(currentTdPct)
  }

  async function refetchForm(recordId) {
    const saTrxpack = await getPurchaseTransactionPack(recordId)
    await fillForm(saTrxpack)
  }

  function getDTD(dtId) {
    const res = getRequest({
      extension: PurchaseRepository.DocumentTypeDefault.get,
      parameters: `_dtId=${dtId}`
    })

    return res
  }

  async function getMeasurementObject(msId) {
    const res = await getRequest({
      extension: InventoryRepository.Measurement.get,
      parameters: `_recordId=${msId}`
    })

    return res?.record
  }

  async function onChangeDtId(recordId) {
    const dtd = await getDTD(recordId)
    if (dtd?.record != null) {
      setMetalPriceOperations()
      setmetalPriceVisibility(true)
    } else {
      formik.setFieldValue('header.metalPrice', 0)
      formik.setFieldValue('header.KGmetalPrice', 0)
      setmetalPriceVisibility(false)
    }
    formik.setFieldValue('header.postMetalToFinancials', dtd?.record?.postMetalToFinancials)
    formik.setFieldValue('header.plantId', dtd?.record?.plantId || userDefaultsDataState?.plantId || null)
    formik.setFieldValue('header.spId', dtd?.record?.spId || userDefaultsDataState?.spId || null)
    formik.setFieldValue(
      'header.siteId',
      dtd?.record?.commitItems ? dtd?.record?.siteId || userDefaultsDataState?.siteId || null : null
    )
    formik.setFieldValue('header.commitItems', dtd?.record?.commitItems)
    fillMetalPrice()
  }

  async function sKULookupInfo(dtId) {
    if (!dtId) {
      formik.setFieldValue('disableSKULookup', false)

      return
    }

    const res = await getRequest({
      extension: PurchaseRepository.DocumentTypeDefault.get,
      parameters: `_dtId=${dtId}`
    })
    formik.setFieldValue('disableSKULookup', res?.record?.disableSKULookup || false)

    return res?.record?.disableSKULookup || false
  }
  useEffect(() => {
    formik.setFieldValue('header.qty', parseFloat(totalQty).toFixed(2))
    formik.setFieldValue('header.weight', parseFloat(totalWeight).toFixed(2))
    formik.setFieldValue('header.volume', parseFloat(totalVolume).toFixed(2))
    formik.setFieldValue('header.amount', parseFloat(amount).toFixed(2))
    formik.setFieldValue('header.baseAmount', parseFloat(amount).toFixed(2))
    formik.setFieldValue('header.subtotal', parseFloat(subtotal).toFixed(2))
    formik.setFieldValue('header.vatAmount', parseFloat(vatAmount).toFixed(2))
  }, [totalQty, amount, totalVolume, totalWeight, subtotal, vatAmount])

  useEffect(() => {
    if (reCal) {
      let currentTdAmount = (parseFloat(formik.values.header.tdPct) * parseFloat(subtotal)) / 100
      recalcGridVat(
        formik.values.header.tdType,
        formik.values.header.tdPct,
        currentTdAmount,
        formik.values.header.currentDiscount
      )
    }
  }, [subtotal])

  useEffect(() => {
    ;(async function () {
      const promotionTypes = await getPromotionTypes()
      if (promotionTypes && promotionTypes.length > 0) {
        const initialType = promotionTypes[0]
        setInitialPromotionType(initialType)

        formik.setFieldValue('items', [
          {
            ...formik.values.items[0],
            promotionType: initialType.key,
            promotionTypeName: initialType.value
          }
        ])
      }
    })()
  }, [])

  useEffect(() => {
    ;(async function () {
      const muList = await getMeasurementUnits()
      setMeasurements(muList?.list)
      setMetalPriceOperations()
      const defaultObj = await getDefaultsData()
      getUserDefaultsData()
      if (!recordId) {
        setCycleButtonState({ text: '%', value: DIRTYFIELD_TDPCT })
        formik.setFieldValue('header.tdType', 2)
      }
    })()
  }, [])

  useEffect(() => {
    ;(async function () {
      if (recordId && measurements) {
        const transactionPack = await getPurchaseTransactionPack(recordId)
        await fillForm(transactionPack)
      }
    })()
  }, [recordId, measurements])

  useEffect(() => {
    defaultsDataState && setDefaultFields()
  }, [defaultsDataState])

  useEffect(() => {
    if (!recordId) {
      if (formik.values?.header.dtId) onChangeDtId(formik.values?.header.dtId)
      sKULookupInfo(formik.values.header.dtId)
    }
  }, [formik.values?.header.dtId])

  async function getDefaultsData() {
    const myObject = {}

    const filteredList = defaultsData?.list?.filter(obj => {
      return (
        obj.key === 'baseMetalCuId' ||
        obj.key === 'mc_defaultRTSA' ||
        obj.key === 'plId' ||
        obj.key === 'ptId' ||
        obj.key === 'allowSalesNoLinesTrx' ||
        obj.key === 'sdpClientName' ||
        obj.key === 'sdpItemName' ||
        obj.key === 'currencyId'
      )
    })
    filteredList.forEach(obj => {
      myObject[obj.key] =
        obj.value === 'True' || obj.value === 'False' ? obj.value : obj.value ? parseInt(obj.value) : null
    })
    setDefaultsDataState(myObject)

    return myObject
  }

  async function getUserDefaultsData() {
    const myObject = {}

    const filteredList = userDefaultsData?.list?.filter(obj => {
      return obj.key === 'plantId' || obj.key === 'siteId'
    })
    filteredList.forEach(obj => (myObject[obj.key] = obj.value ? parseInt(obj.value) : null))
    setUserDefaultsDataState(myObject)

    return myObject
  }

  const setDefaultFields = () => {
    formik.setFieldValue('header.currencyId', defaultsDataState?.currencyId || null)
    if (!formik.values.header.plantId) formik.setFieldValue('header.plantId', userDefaultsDataState?.plantId || null)
    if (!formik.values.header.spId) formik.setFieldValue('header.spId', userDefaultsDataState?.spId || null)
    if (!formik.values.header.siteId)
      formik.setFieldValue(
        'header.siteId',
        !formik.values.header.dtId || (formik.values.header.dtId && formik.values.header.commitItems)
          ? userDefaultsDataState?.siteId || null
          : null
      )
  }

  const onCondition = row => {
    if (row.trackBy === 1) {
      return {
        imgSrc: '/images/TableIcons/imgSerials.png',
        hidden: false
      }
    } else {
      return {
        imgSrc: '',
        hidden: true
      }
    }
  }

  if (functionId == SystemFunction.PurchaseReturn) {
    columns.push({
      component: 'button',
      name: 'serials',
      label: platformLabels.serials,
      props: {
        onCondition
      },
      onClick: (e, row, update, updateRow) => {
        if (row?.trackBy === 1) {
          stack({
            Component: SerialsForm,
            props: {
              labels,
              row,
              disabled: isPosted,
              siteId: formik?.values?.header.siteId,
              maxAccess,
              checkForSiteId: row.qty >= 0 ? false : true,
              updateRow
            }
          })
        }
      }
    })
  }

  if (functionId == SystemFunction.PurchaseInvoice) {
    columns.push({
      component: 'button',
      name: 'serials',
      label: platformLabels.serials,
      props: {
        onCondition
      },
      onClick: (e, row, update, updateRow) => {
        if (row?.trackBy === 1) {
          stack({
            Component: PUSerialsForm,
            props: {
              row,
              disabled: isPosted,
              siteId: formik?.values?.header.siteId,
              updateRow
            }
          })
        }
      }
    })
  }

  async function getMultiCurrencyFormData(currencyId, date) {
    if (currencyId && date) {
      const res = await getRequest({
        extension: MultiCurrencyRepository.Currency.get,
        parameters: `_currencyId=${currencyId}&_date=${formatDateForGetApI(date)}&_rateDivision=${
          RateDivision.FINANCIALS
        }`
      })

      const updatedRateRow = getRate({
        amount: amount === 0 ? 0 : amount ?? formik.values.header.amount,
        exRate: res.record?.exRate,
        baseAmount: 0,
        rateCalcMethod: res.record?.rateCalcMethod,
        dirtyField: DIRTYFIELD_RATE
      })

      formik.setFieldValue('header.baseAmount', parseFloat(updatedRateRow?.baseAmount).toFixed(2) || 0)
      formik.setFieldValue('header.exRate', res.record?.exRate)
      formik.setFieldValue('header.rateCalcMethod', res.record?.rateCalcMethod)
      formik.setFieldValue('header.rateCalcMethodName', res.record?.rateCalcMethodName)
      formik.setFieldValue('header.rateTypeName', res.record?.rateTypeName)
      formik.setFieldValue('header.exchangeId', res.record?.exchangeId)
      formik.setFieldValue('header.exchangeName', res.record?.exchangeName)
    }
  }

  const getResourceMCR = functionId => {
    const fn = Number(functionId)
    switch (fn) {
      case SystemFunction.PurchaseInvoice:
        return ResourceIds.MCRPurchaseInvoice
      case SystemFunction.PurchaseReturn:
        return ResourceIds.MCRPurchaseReturn
      default:
        return null
    }
  }

  function openMCRForm(data) {
    stack({
      Component: MultiCurrencyRateForm,
      props: {
        DatasetIdAccess: getResourceMCR(functionId),
        data,
        onOk: childFormikValues => {
          formik.setFieldValue('header', {
            ...formik.values.header,
            ...childFormikValues
          })
        }
      }
    })
  }

  const getResourceId = functionId => {
    switch (functionId) {
      case SystemFunction.PurchaseInvoice:
        return ResourceIds.PurchaseInvoice
      case SystemFunction.PurchaseReturn:
        return ResourceIds.PurchaseReturn
      default:
        return null
    }
  }

  return (
    <FormShell
      resourceId={getResourceId(parseInt(functionId))}
      form={formik}
      functionId={functionId}
      maxAccess={maxAccess}
      previewReport={editMode}
      actions={actions}
      editMode={editMode}
      disabledSubmit={isPosted}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={2.4}>
              <ResourceComboBox
                endpointId={SystemRepository.DocumentType.qry}
                parameters={`_startAt=0&_pageSize=1000&_dgId=${functionId}`}
                name='header.dtId'
                readOnly={editMode || formik?.values?.items?.some(item => item.sku)}
                label={labels.documentType}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                valueField='recordId'
                displayField={['reference', 'name']}
                values={formik.values.header}
                maxAccess={maxAccess}
                onChange={(_, newValue) => {
                  const recordId = newValue ? newValue.recordId : null

                  if (newValue) {
                    formik.setFieldValue('header.dtId', recordId)
                  } else {
                    formik.setFieldValue('header.dtId', null)
                    formik.setFieldValue('header.metalPrice', 0)
                    formik.setFieldValue('header.KGmetalPrice', 0)
                    setmetalPriceVisibility(false)
                  }
                  changeDT(newValue)
                }}
                error={formik.touched.header?.dtId && Boolean(formik.errors.header?.dtId)}
              />
            </Grid>
            <Grid item xs={2.4}>
              <CustomDatePicker
                name='header.date'
                required
                label={labels.date}
                readOnly={isPosted}
                value={formik?.values?.header?.date}
                onChange={(e, newValue) => {
                  formik.setFieldValue('header.date', newValue)
                  getMultiCurrencyFormData(formik.values.header.currencyId, newValue)
                }}
                editMode={editMode}
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('header.date', '')}
                error={formik.touched?.header?.date && Boolean(formik.errors?.header?.date)}
              />
            </Grid>
            <Grid item xs={2.4}>
              <ResourceComboBox
                endpointId={SystemRepository.Plant.qry}
                name='header.plantId'
                label={labels.plant}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                readOnly={isPosted}
                values={formik.values.header}
                valueField='recordId'
                displayField={['reference', 'name']}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('header.plantId', newValue ? newValue.recordId : null)
                }}
                displayFieldWidth={2}
                error={formik.touched.header?.plantId && Boolean(formik.errors.header?.plantId)}
              />
            </Grid>
            <Grid item xs={2.4}>
              <ResourceComboBox
                datasetId={DataSets.PAYMENT_METHOD}
                name='header.paymentMethod'
                readOnly={isPosted}
                label={labels.paymentMethod}
                valueField='key'
                displayField='value'
                values={formik.values.header}
                onChange={(event, newValue) => {
                  formik.setFieldValue('header.paymentMethod', newValue ? newValue.key : null)
                }}
                error={formik.touched.header?.paymentMethod && Boolean(formik.errors.header?.paymentMethod)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={2.4}>
              <CustomTextField
                name='header.vendorDocRef'
                label={labels.vendorDocRef}
                value={formik?.values?.header?.vendorDocRef}
                maxAccess={maxAccess}
                readOnly={isPosted}
                maxLength='15'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('header.vendorDocRef', '')}
                error={formik.touched.header?.vendorDocRef && Boolean(formik.errors.header?.vendorDocRef)}
              />
            </Grid>

            <Grid item xs={2.4}>
              <CustomTextField
                name='header.reference'
                label={labels.reference}
                value={formik?.values?.header?.reference}
                maxAccess={!editMode && maxAccess}
                readOnly={editMode}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('header.reference', '')}
                error={formik.touched.header?.reference && Boolean(formik.errors.header?.reference)}
              />
            </Grid>
            <Grid item xs={2.4}>
              <CustomDatePicker
                name='header.dueDate'
                required
                label={labels.dueDate}
                readOnly={isPosted}
                value={formik?.values?.header?.dueDate}
                onChange={(e, newValue) => formik.setFieldValue('header.dueDate', newValue)}
                editMode={editMode}
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('header.dueDate', '')}
                error={formik.touched?.header?.dueDate && Boolean(formik.errors?.header?.dueDate)}
              />
            </Grid>
            <Grid item xs={2.4}>
              <ResourceComboBox
                endpointId={InventoryRepository.Site.qry}
                name='header.siteId'
                label={labels.site}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values.header}
                valueField='recordId'
                displayField={['reference', 'name']}
                maxAccess={maxAccess}
                displayFieldWidth={2}
                readOnly={isPosted || (formik?.values?.header?.dtId && !formik?.values?.header?.commitItems)}
                required={
                  !formik?.values?.header.dtId ||
                  (formik?.values?.header.dtId && formik?.values?.header.commitItems == true)
                }
                onChange={(event, newValue) => {
                  formik.setFieldValue('header.siteRef', newValue?.reference || null)
                  formik.setFieldValue('header.siteName', newValue?.name || null)
                  formik.setFieldValue('header.siteId', newValue?.recordId || null)
                }}
                error={formik.touched?.header?.siteId && Boolean(formik.errors?.header?.siteId)}
              />
            </Grid>
            <Grid item xs={2.4}>
              <ResourceComboBox
                endpointId={SystemRepository.Currency.qry}
                name='header.currencyId'
                label={labels.currency}
                filter={item => item.currencyType == 1}
                valueField='recordId'
                displayField={['reference', 'name']}
                readOnly={isPosted}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                required
                values={formik.values.header}
                maxAccess={maxAccess}
                onChange={async (event, newValue) => {
                  await getMultiCurrencyFormData(newValue?.recordId, formik.values.header?.date)
                  formik.setFieldValue('header.currencyId', newValue?.recordId || null)
                  formik.setFieldValue('header.currencyName', newValue?.name)
                }}
                error={formik.touched?.header?.currencyId && Boolean(formik.errors?.header?.currencyId)}
              />
            </Grid>
            <Grid item xs={1}>
              <CustomButton
                onClick={() => openMCRForm(formik.values.header)}
                label={platformLabels.add}
                disabled={formik.values.header.currencyId === defaultsDataState?.currencyId}
                image={'popup.png'}
                color='#231f20'
              />
            </Grid>
            <Grid item xs={4.8}>
              <ResourceLookup
                endpointId={PurchaseRepository.Vendor.snapshot}
                name='header.vendorId'
                label={labels.vendor}
                valueField='reference'
                displayField='name'
                valueShow='vendorRef'
                secondValueShow='vendorName'
                formObject={formik.values.header}
                form={formik}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' },
                  { key: 'flName', value: 'FL Name' }
                ]}
                onChange={(event, newValue) => {
                  fillVendorData(newValue)
                }}
                secondFieldName={'header.vendorName'}
                onSecondValueChange={(name, value) => {
                  formik.setFieldValue('header.vendorName', value)
                }}
                errorCheck={'header.vendorId'}
                maxAccess={maxAccess}
                required
                readOnly={isPosted || (formik?.values?.items?.length > 0 && formik?.values?.items[0]?.sku)}
                displayFieldWidth={3}
                editMode={editMode}
              />
            </Grid>
            <Grid item xs={2.4}>
              <CustomCheckBox
                name='header.isVattable'
                value={formik.values?.header?.isVattable}
                onChange={event => formik.setFieldValue('header.isVattable', event.target.checked)}
                label={labels.VAT}
                disabled={formik?.values?.items && formik?.values?.items[0]?.itemId}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={2.4}>
              <ResourceComboBox
                endpointId={FinancialRepository.TaxSchedules.qry}
                name='header.taxId'
                label={labels.tax}
                valueField='recordId'
                displayField={['name']}
                readOnly={
                  !formik.values?.header?.isVattable ||
                  (formik?.values?.items?.length > 0 && formik?.values?.items[0]?.sku)
                }
                values={formik.values.header}
                onChange={(event, newValue) => {
                  formik.setFieldValue('header.taxId', newValue?.recordId || null)
                  formik.setFieldValue('header.taxName', newValue?.name || null)
                }}
                error={formik.touched.header?.taxId && Boolean(formik.errors.header?.taxId)}
                maxAccess={maxAccess}
              />
            </Grid>

            <Grid item xs={2.4}>
              <CustomNumberField
                name='header.KGmetalPrice'
                label={labels.metalPrice}
                value={formik.values.header.KGmetalPrice}
                readOnly
                hidden={metalPriceVisibility}
              />
            </Grid>
          </Grid>
        </Fixed>

        <Grow>
          <DataGrid
            onChange={(value, action) => {
              formik.setFieldValue('items', value)
              itemsUpdate.current = value

              action === 'delete' && setReCal(true)
            }}
            onSelectionChange={(row, update, field) => {
              if (field == 'muRef') getFilteredMU(row?.itemId)
            }}
            initialValues={initialValues.items[0]}
            value={formik?.values?.items}
            error={formik.errors.items}
            name='items'
            columns={columns}
            maxAccess={maxAccess}
            allowDelete={!isPosted}
            disabled={isPosted || !formik.values.header.vendorId || !formik.values.header.vendorId}
          />
        </Grow>

        <Fixed>
          <Grid container spacing={2} sx={{ mt: '5px' }}>
            <Grid item xs={6}>
              <CustomTextArea
                name='header.description'
                label={labels.description}
                value={formik.values.header.description}
                rows={3}
                editMode={editMode}
                maxAccess={maxAccess}
                onChange={e => formik.setFieldValue('header.description', e.target.value)}
                onClear={() => formik.setFieldValue('header.description', '')}
                error={formik.touched.header?.description && Boolean(formik.errors.header?.description)}
              />
            </Grid>
            <Grid item xs={3}>
              <Stack spacing={2}>
                <CustomNumberField
                  name='header.qty'
                  maxAccess={maxAccess}
                  label={labels.totQty}
                  value={totalQty}
                  readOnly
                />
                <CustomNumberField
                  name='header.volume'
                  maxAccess={maxAccess}
                  label={labels.totVolume}
                  value={totalVolume}
                  readOnly
                />
                <CustomNumberField
                  name='header.weight'
                  maxAccess={maxAccess}
                  label={labels.totWeight}
                  value={totalWeight}
                  readOnly
                />
              </Stack>
            </Grid>
            <Grid item xs={3}>
              <Stack spacing={2}>
                <CustomNumberField
                  name='header.subTotal'
                  maxAccess={maxAccess}
                  label={labels.subtotal}
                  value={subtotal}
                  readOnly
                />
                <CustomNumberField
                  name='header.tdAmount'
                  maxAccess={maxAccess}
                  label={labels.discount}
                  value={formik.values.header.currentDiscount}
                  displayCycleButton={true}
                  cycleButtonLabel={cycleButtonState.text}
                  decimalScale={2}
                  readOnly={isPosted}
                  iconKey={cycleButtonState.text}
                  handleButtonClick={handleButtonClick}
                  ShowDiscountIcons={true}
                  onChange={e => {
                    let discount = Number(e.target.value.replace(/,/g, ''))
                    if (formik.values.header.tdType == DIRTYFIELD_TDPCT) {
                      if (discount < 0 || discount > 100) discount = 0
                      formik.setFieldValue('header.tdPct', discount)
                    } else {
                      if (discount < 0 || subtotal < discount) {
                        discount = 0
                      }
                      formik.setFieldValue('header.tdAmount', discount)
                    }
                    formik.setFieldValue('header.currentDiscount', discount)
                  }}
                  onBlur={async e => {
                    setReCal(true)
                    let discountAmount = Number(e.target.value.replace(/,/g, ''))
                    let tdPct = Number(e.target.value.replace(/,/g, ''))
                    let tdAmount = Number(e.target.value.replace(/,/g, ''))
                    if (formik.values.header.tdType == DIRTYFIELD_TDPLAIN) {
                      tdPct = (parseFloat(discountAmount) / parseFloat(subtotal)) * 100
                      formik.setFieldValue('header.tdPct', tdPct)
                    }
                    if (formik.values.header.tdType == DIRTYFIELD_TDPCT) {
                      tdAmount = (parseFloat(discountAmount) * parseFloat(subtotal)) / 100
                      formik.setFieldValue('header.tdAmount', tdAmount)
                    }

                    await recalcGridVat(formik.values.header.tdType, tdPct, tdAmount, discountAmount)
                  }}
                  onClear={() => {
                    formik.setFieldValue('header.tdAmount', 0)
                    formik.setFieldValue('header.tdPct', 0)
                    recalcGridVat(formik.values.header.tdType, 0, 0, 0)
                  }}
                />
                <CustomNumberField
                  name='header.miscAmount'
                  maxAccess={maxAccess}
                  label={labels.misc}
                  value={formik.values.header.miscAmount}
                  decimalScale={2}
                  readOnly={isPosted}
                  onChange={e => formik.setFieldValue('header.miscAmount', e.target.value || 0)}
                  onBlur={async () => {
                    setReCal(true)
                  }}
                  onClear={() => formik.setFieldValue('header.miscAmount', 0)}
                />
                <CustomNumberField
                  name='header.vatAmount'
                  maxAccess={maxAccess}
                  label={labels.VAT}
                  value={vatAmount}
                  readOnly
                />
                <CustomNumberField
                  name='header.amount'
                  maxAccess={maxAccess}
                  label={labels.net}
                  value={amount}
                  readOnly
                />
              </Stack>
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}
