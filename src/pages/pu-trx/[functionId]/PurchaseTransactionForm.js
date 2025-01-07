import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { formatDateFromApi, formatDateToApi, formatDateForGetApI } from 'src/lib/date-helper'
import { Grid, FormControlLabel, Checkbox, Stack } from '@mui/material'
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
  DIRTYFIELD_MDTYPE,
  DIRTYFIELD_EXTENDED_PRICE,
  MDTYPE_PCT
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

export default function PurchaseTransactionForm({ labels, access, recordId, functionId, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { platformLabels, defaultsData, userDefaultsData } = useContext(ControlContext)
  const { getAllKvsByDataset } = useContext(CommonContext)
  const [cycleButtonState, setCycleButtonState] = useState({ text: '%', value: DIRTYFIELD_TDPCT })
  const [measurements, setMeasurements] = useState([])
  const [filteredMu, setFilteredMU] = useState([])
  const [initialPromotionType, setInitialPromotionType] = useState()
  const [metalPriceVisibility, setmetalPriceVisibility] = useState(false)
  const [defaultsDataState, setDefaultsDataState] = useState(null)
  const [userDefaultsDataState, setUserDefaultsDataState] = useState(null)
  const [reCal, setReCal] = useState(false)

  const { documentType, maxAccess } = useDocumentType({
    functionId: functionId,
    access: access,
    enabled: !recordId
  })

  const initialValues = {
    recordId: recordId,
    header: {
      dgId: functionId,
      functionId: functionId,
      recordId: null,
      dtId: documentType?.dtId,
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
      currentDiscount: '',
      exRate: 1,
      rateCalcMethod: 1,
      tdType: DIRTYFIELD_TDPCT,
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
        sku: null,
        itemName: null,
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
        promotionTypeName: '',
        promotionType: null,
        costHistory: false,
        taxDetailsButton: false,
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

  const onClick = () => {
    stack({
      Component: ItemPromotion,
      props: {
        invoiceId: formik.values.header.recordId
      },
      width: 1330,
      height: 720,
      title: platformLabels.ItemPromotion
    })
  }

  const { formik } = useForm({
    maxAccess,
    initialValues: initialValues,
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      header: yup.object({
        date: yup.string().required(),
        dueDate: yup.string().required(),
        currencyId: yup.string().required(),
        vendorId: yup.string().required(),
        siteId: yup
          .number()
          .test('', function (value) {
            const { dtId } = this.parent
            if (dtId == null) {
              return !!value
            }

            return true
          })
      }),
      items: yup
        .array()
        .of(
          yup.object({
            sku: yup.string().required(),
            itemName: yup.string().required(),
            qty: yup.number().required().min(1)
          })
        )
        .required()
    }),
    onSubmit: async obj => {
      const payload = {
        header: {
          ...obj.header,
          date: formatDateToApi(obj.header.date),
          dueDate: formatDateToApi(obj.header.dueDate)
        },
        items: obj.items.map(({ id, isVattable, taxDetails, ...rest }) => ({
          seqNo: id,
          applyVat: isVattable,
          ...rest
        })),
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
        ...(({ header, items, taxCodes, ...rest }) => rest)(obj)
      }

      const puTrxRes = await postRequest({
        extension: PurchaseRepository.PurchaseInvoiceHeader.set2,
        record: JSON.stringify(payload)
      })
      const actionMessage = editMode ? platformLabels.Edited : platformLabels.Added
      toast.success(actionMessage)
      await refetchForm(puTrxRes.recordId)
      invalidate()
    }
  })

  const isPosted = formik.values.header.status === 3
  const editMode = !!formik.values.header.recordId

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
      },
      defaultValue: {
        promotionType: initialPromotionType?.key,
        promotionTypeName: initialPromotionType?.value
      }
    },
    {
      component: 'resourcelookup',
      label: labels.sku,
      name: 'sku',
      flex: 2,
      props: {
        endpointId: InventoryRepository.Item.snapshot,
        parameters: { _categoryId: 0, _msId: 0, _startAt: 0, _size: 1000 },
        displayField: 'sku',
        valueField: 'recordId',
        mapping: [
          { from: 'recordId', to: 'itemId' },
          { from: 'sku', to: 'sku' },
          { from: 'name', to: 'itemName' },
          { from: 'msId', to: 'msId' }
        ],
        columnsInDropDown: [
          { key: 'sku', value: 'SKU' },
          { key: 'name', value: 'Item Name' }
        ],
        displayFieldWidth: 5
      },
      async onChange({ row: { update, newRow } }) {
        if (!newRow?.itemId) {
          update({
            enabled: false
          })

          return
        }
        const phycialProperty = await getItemPhysProp(newRow.itemId)
        const itemInfo = await getItem(newRow.itemId)

        const vendorPrice =
          newRow?.promotionTypeId === '3' || newRow?.promotionTypeId === '4'
            ? undefined
            : await getVendorPrice(newRow, formik.values.header)
        fillItemObject(update, phycialProperty, itemInfo, vendorPrice)
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
        store: filteredMu,
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
          const filteredItems = filteredMu.filter(item => item.recordId === newRow?.muId)
          const qtyInBase = newRow?.qty * filteredItems?.muQty

          update({
            qtyInBase,
            muQty: newRow?.muQty
          })
        }
      }
    },
    {
      component: 'numberfield',
      label: labels.quantity,
      name: 'qty',
      updateOn: 'blur',
      async onChange({ row: { update, newRow } }) {
        getItemPriceRow(update, newRow, DIRTYFIELD_QTY)
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
      async onChange({ row: { update, newRow } }) {
        getItemPriceRow(update, newRow, DIRTYFIELD_BASE_PRICE)
      }
    },
    {
      component: 'numberfield',
      label: labels.baseLaborPrice,
      name: 'baseLaborPrice',
      updateOn: 'blur',
      async onChange({ row: { update, newRow } }) {
        getItemPriceRow(update, newRow, DIRTYFIELD_BASE_LABOR_PRICE)
      }
    },
    {
      component: 'numberfield',
      label: labels.totalPPG,
      name: 'totalWeightPerG',
      updateOn: 'blur',
      async onChange({ row: { update, newRow } }) {
        getItemPriceRow(update, newRow, DIRTYFIELD_TWPG)
      }
    },
    {
      component: 'numberfield',
      label: labels.unitPrice,
      name: 'unitPrice',
      updateOn: 'blur',
      async onChange({ row: { update, newRow } }) {
        getItemPriceRow(update, newRow, DIRTYFIELD_UNIT_PRICE)
      }
    },
    {
      component: 'button',
      name: 'costHistory',
      defaultValue: true,
      props: {
        imgSrc: '/images/buttonsIcons/popup-black.png'
      },
      label: labels.costHistory,
      onClick: (e, row) => {
        if (row?.itemId) {
          stack({
            Component: ItemCostHistory,
            props: {
              itemId: row?.itemId,
              obj: row
            },
            width: 1000,
            title: platformLabels.CostHistory
          })
        }
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
      defaultValue: true,
      props: {
        imgSrc: '/images/buttonsIcons/tax-icon.png'
      },
      label: labels.tax,
      onClick: (e, row) => {
        if (row?.taxId) {
          stack({
            Component: TaxDetails,
            props: {
              taxId: row?.taxId,
              obj: row
            },
            width: 1000,
            title: platformLabels.TaxDetails
          })
        }
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
        iconsClicked: (id, updateRow) => handleIconClick(id, updateRow),
        gridData: formik.values.items,
        type: 'numeric',
        concatenateWith: '%',
        defaultValue: 0
      },
      async onChange({ row: { update, newRow } }) {
        getItemPriceRow(update, newRow, DIRTYFIELD_MDAMOUNT)
      }
    },
    {
      component: 'numberfield',
      label: labels.extendedprice,
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

  async function handleIconClick(id, updateRow) {
    const index = formik.values.items.findIndex(item => item.id === id)

    if (index === -1) return

    let currentMdType
    let currentMdAmount = parseFloat(formik.values.items[index].mdAmount)

    if (formik.values.items[index].mdType === 2) {
      if (currentMdAmount < 0 || currentMdAmount > 100) currentMdAmount = 0

      formik.setFieldValue(`items[${index}].mdAmountPct`, 1)
      formik.setFieldValue(`items[${index}].mdType`, 1)
      currentMdType = 1
      formik.setFieldValue(`items[${index}].mdAmount`, parseFloat(currentMdAmount).toFixed(2))
    } else {
      if (currentMdAmount < 0) currentMdAmount = 0

      formik.setFieldValue(`items[${index}].mdAmountPct`, 2)
      formik.setFieldValue(`items[${index}].mdType`, 2)
      currentMdType = 2
      formik.setFieldValue(`items[${index}].mdAmount`, parseFloat(currentMdAmount).toFixed(2))
    }

    const newRow = {
      ...formik.values.items[index],
      mdAmount: currentMdAmount,
      mdType: currentMdType
    }

    getItemPriceRow(updateRow, newRow, DIRTYFIELD_MDTYPE, true)
  }

  async function onWorkFlowClick() {
    stack({
      Component: WorkFlow,
      props: {
        functionId: functionId,
        recordId: formik.values.header.recordId
      },
      width: 950,
      height: 600,
      title: labels.workflow
    })
  }

  const onPost = async () => {
    await postRequest({
      extension: PurchaseRepository.PurchaseInvoiceHeader.post,
      record: JSON.stringify(formik.values.header)
    })

    await refetchForm(formik.values.recordId)
    toast.success(platformLabels.Posted)
    invalidate()
    window.close()
  }

  const onUnpost = async () => {
    const res = await postRequest({
      extension: PurchaseRepository.PurchaseInvoiceHeader.unpost,
      record: JSON.stringify(formik.values.header)
    })

    await refetchForm(res.recordId)
    toast.success(platformLabels.Posted)
    invalidate()
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
      valuesPath: formik.values.header,
      disabled: !editMode
    },
    {
      key: 'ItemPromotion',
      condition: true,
      onClick: onClick,
      disabled: !editMode
    }
  ]

  async function fillForm(puTrxPack) {
    const puTrxHeader = puTrxPack?.header
    const puTrxItems = puTrxPack?.items
    const puTrxTaxes = puTrxPack?.taxCodes

    puTrxHeader?.tdType === 1 || puTrxHeader?.tdType == null
      ? setCycleButtonState({ text: '123', value: 1 })
      : setCycleButtonState({ text: '%', value: 2 })

    const modifiedList = await Promise.all(
      puTrxItems?.map(async (item, index) => {
        const filteredMeasurements = measurements.filter(x => x.msId === item?.msId)
        setFilteredMU(filteredMeasurements)

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
          basePrice: parseFloat(item.basePrice).toFixed(5),
          unitPrice: parseFloat(item.unitPrice).toFixed(3),
          vatAmount: parseFloat(item.vatAmount).toFixed(2),
          extendedPrice: parseFloat(item.extendedPrice).toFixed(2),
          puTrx: true,
          taxDetails: updatedpuTrxTaxes.filter(tax => tax.seqNo === item.seqNo)
        }
      })
    )

    formik.setValues({
      ...formik.values,
      recordId: puTrxHeader.recordId || null,
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

      return res.record.exRate * 1000
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
        currentDiscount: object?.tradeDiscount,
        tdType: currenctTdType,
        taxId: object?.taxId,
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
    const res = await getRequest({
      extension: FinancialRepository.TaxDetailPack.qry,
      parameters: `_taxId=${taxId}`
    })

    return res?.list
  }
  async function getVendorPrice(object, form) {
    const res = await getRequest({
      extension: PurchaseRepository.VendorPrice.get,
      parameters: `_itemId=${object.itemId}&_vendorId=${form.vendorId}&_currencyId=${form.currencyId}&_functionId=${functionId}`
    })

    return res?.record
  }

  async function fillItemObject(update, itemPhysProp, itemInfo, vendorPrice) {
    const weight = parseFloat(itemPhysProp?.weight || 0).toFixed(2)
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
          amount: item.amount
        }))
        rowTax = itemInfo.taxId
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
      rowTaxDetails = details
    }

    const filteredMeasurements = measurements?.filter(item => item.msId === itemInfo?.msId)
    setFilteredMU(filteredMeasurements)

    update({
      sku: itemInfo?.sku || '',
      itemName: itemInfo?.name || '',
      itemId: itemInfo?.recordId || null,
      isMetal: isMetal,
      metalId: metalId,
      metalPurity: metalPurity,
      volume: parseFloat(itemPhysProp?.volume) || 0,
      weight: weight,
      basePrice: basePriceValue,
      baseLaborPrice: baseLaborPrice,
      TotPricePerG: TotPricePerG,
      unitPrice: unitPrice,
      priceType: itemInfo?.priceType || 1,
      qty: 0,
      msId: itemInfo?.msId,
      muRef: filteredMeasurements?.[0]?.reference,
      muId: filteredMeasurements?.[0]?.recordId,
      muQty: filteredMeasurements?.[0]?.qty,
      mdAmount: formik.values.header.maxDiscount ? parseFloat(formik.values.header.maxDiscount).toFixed(2) : 0,
      mdValue: 0,
      mdType: MDTYPE_PCT,
      extendedPrice: parseFloat('0').toFixed(2),
      mdValue: 0,
      taxId: rowTax,
      taxDetails: rowTaxDetails,
      costHistory: true,
      taxDetailsButton: true
    })

    formik.setFieldValue(
      'header.mdAmount',
      formik.values.header.currentDiscount ? formik.values.header.currentDiscount : 0
    )
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
        formik.values.header.currentDiscount < 0 || formik.values.header.subtotal < formik.values.header.currentDiscount
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

  function getItemPriceRow(update, newRow, dirtyField, iconClicked) {
    !reCal && setReCal(true)

    const itemPriceRow = getIPR({
      priceType: newRow?.priceType,
      basePrice: parseFloat(newRow?.basePrice || 0),
      volume: parseFloat(newRow?.volume),
      weight: parseFloat(newRow?.weight),
      unitPrice: parseFloat(newRow?.unitPrice || 0),
      upo: 0,
      qty: parseFloat(newRow?.qty),
      extendedPrice: parseFloat(newRow?.extendedPrice),
      mdAmount: parseFloat(newRow?.mdAmount) || 0,
      mdType: newRow?.mdType,
      mdValue: parseFloat(newRow?.mdValue),
      baseLaborPrice: newRow?.baseLaborPrice || 0,
      totalWeightPerG: newRow?.totalWeightPerG || 0,
      tdPct: formik?.values?.header?.tdPct || 0,
      dirtyField: dirtyField
    })

    if (newRow?.taxDetails?.length > 0) newRow.taxDetails = [newRow.taxDetails[0]]

    const vatCalcRow = getVatCalc({
      basePrice: itemPriceRow?.basePrice,
      unitPrice: itemPriceRow?.unitPrice,
      qty: parseFloat(itemPriceRow?.qty),
      extendedPrice: parseFloat(itemPriceRow?.extendedPrice),
      baseLaborPrice: itemPriceRow?.baseLaborPrice,
      vatAmount: parseFloat(itemPriceRow?.vatAmount) || 0,
      tdPct: formik?.values?.header?.tdPct,
      taxDetails: formik.values.header.isVattable === true ? newRow.taxDetails : null
    })

    const qtyInBase = itemPriceRow?.qty * newRow?.muQty

    let commonData = {
      id: newRow?.id,
      qty: parseFloat(itemPriceRow?.qty).toFixed(2),
      baseQty: parseFloat(qtyInBase).toFixed(2),
      volume: parseFloat(itemPriceRow?.volume).toFixed(2),
      weight: parseFloat(itemPriceRow?.weight).toFixed(2),
      basePrice: parseFloat(itemPriceRow?.basePrice).toFixed(5),
      unitPrice: parseFloat(itemPriceRow?.unitPrice).toFixed(3),
      extendedPrice: parseFloat(itemPriceRow?.extendedPrice).toFixed(2),
      mdValue: itemPriceRow?.mdValue,
      mdType: itemPriceRow?.mdType,
      mdAmount: parseFloat(itemPriceRow?.mdAmount).toFixed(2),
      vatAmount: parseFloat(vatCalcRow?.vatAmount).toFixed(2)
    }
    let data = iconClicked ? { changes: commonData } : commonData
    update(data)
  }

  const parsedItemsArray = formik.values.items
    ?.filter(item => item.itemId !== undefined)
    .map(item => ({
      ...item,
      basePrice: parseFloat(item.basePrice) || 0,
      unitPrice: parseFloat(item.unitPrice) || 0,
      vatAmount: parseFloat(item.vatAmount) || 0,
      weight: parseFloat(item.weight) || 0,
      volume: parseFloat(item.volume) || 0,
      extendedPrice: parseFloat(item.extendedPrice) || 0
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
    formik.setFieldValue(
      'header.tdAmount',
      formik.values?.header?.currentDiscount
        ? formik.values?.header?.currentDiscount
        : _discountObj?.hiddenTdAmount
        ? _discountObj?.hiddenTdAmount?.toFixed(2)
        : 0
    )
    formik.setFieldValue('header.tdType', _discountObj?.tdType)
    formik.setFieldValue('header.currentDiscount', _discountObj?.currentDiscount || 0)
    formik.setFieldValue('header.tdPct', _discountObj?.hiddenTdPct)

    return _discountObj?.hiddenTdPct
  }

  function recalcNewVat(tdPct) {
    formik.values.items.map((item, index) => {
      if (item?.taxDetails?.length > 0) item.taxDetails = [item.taxDetails[0]]

      const vatCalcRow = getVatCalc({
        basePrice: parseFloat(item?.basePrice),
        qty: parseFloat(item?.qty),
        extendedPrice: parseFloat(item?.extendedPrice),
        baseLaborPrice: parseFloat(item?.baseLaborPrice),
        vatAmount: parseFloat(item?.vatAmount),
        tdPct: parseFloat(tdPct),
        taxDetails: formik.values.header.isVattable === true ? item.taxDetails : null
      })
      formik.setFieldValue(`items[${index}].vatAmount`, parseFloat(vatCalcRow?.vatAmount).toFixed(2))
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
    formik.setFieldValue('header.plantId', dtd?.record?.plantId ?? userDefaultsDataState?.plantId)
    formik.setFieldValue('header.spId', dtd?.record?.spId ?? userDefaultsDataState?.spId)
    formik.setFieldValue('header.siteId', dtd?.record?.siteId ?? userDefaultsDataState?.siteId ?? null)
    formik.setFieldValue('header.commitItems', dtd?.record?.commitItems)
    fillMetalPrice()
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
    if (documentType?.dtId) {
      formik.setFieldValue('header.dtId', documentType.dtId)
      onChangeDtId(documentType.dtId)
    }
  }, [documentType?.dtId])

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
        formik.setValues({
          ...formik.values,
          items: formik.values.items.map(item => ({
            ...item,
            promotionTypeName: initialType.value,
            promotionType: initialType.key
          }))
        })
      }
      const muList = await getMeasurementUnits()
      setMeasurements(muList?.list)
      setMetalPriceOperations()
      const defaultObj = await getDefaultsData()
      getUserDefaultsData()
      if (!recordId) {
        if (defaultObj.salesTD == 'True') {
          setCycleButtonState({ text: '%', value: DIRTYFIELD_TDPCT })
          formik.setFieldValue('header.tdType', 2)
        } else {
          setCycleButtonState({ text: '123', value: 1 })
          formik.setFieldValue('header.tdType', 1)
        }
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

  async function getDefaultsData() {
    const myObject = {}

    const filteredList = defaultsData?.list?.filter(obj => {
      return (
        obj.key === 'baseMetalCuId' ||
        obj.key === 'mc_defaultRTSA' ||
        obj.key === 'plId' ||
        obj.key === 'ptId' ||
        obj.key === 'allowSalesNoLinesTrx' ||
        obj.key === 'salesTD' ||
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
    formik.setFieldValue('header.currencyId', defaultsDataState.currencyId)
    formik.setFieldValue('header.plantId', userDefaultsDataState.plantId)
    formik.setFieldValue('header.spId', userDefaultsDataState.spId)
    formik.setFieldValue('header.siteId', userDefaultsDataState.siteId ?? null)
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
                name='dtId'
                readOnly={editMode}
                label={labels.documentType}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                valueField='recordId'
                displayField={['reference', 'name']}
                values={formik.values.header}
                maxAccess={maxAccess}
                onChange={async (_, newValue) => {
                  const recordId = newValue ? newValue.recordId : null

                  await formik.setFieldValue('header.dtId', recordId)

                  if (newValue) {
                    onChangeDtId(recordId)
                  } else {
                    formik.setFieldValue('header.dtId', null)
                    formik.setFieldValue('header.siteId', null)
                    formik.setFieldValue('header.metalPrice', 0)
                    formik.setFieldValue('header.KGmetalPrice', 0)
                    setmetalPriceVisibility(false)
                  }
                }}
                error={formik.touched.dtId && Boolean(formik.errors.dtId)}
              />
            </Grid>
            <Grid item xs={2.4}>
              <CustomDatePicker
                name='date'
                required
                label={labels.date}
                readOnly={isPosted}
                value={formik?.values?.header?.date}
                onChange={formik.setFieldValue}
                editMode={editMode}
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('header.date', '')}
                error={formik.touched?.header?.date && Boolean(formik.errors?.header?.date)}
              />
            </Grid>
            <Grid item xs={2.4}>
              <ResourceComboBox
                endpointId={SystemRepository.Plant.qry}
                name='plantId'
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
                error={formik.touched.plantId && Boolean(formik.errors.plantId)}
              />
            </Grid>
            <Grid item xs={2.4}>
              <ResourceComboBox
                datasetId={DataSets.PAYMENT_METHOD}
                name='paymentMethod'
                readOnly={isPosted}
                label={labels.paymentMethod}
                valueField='key'
                displayField='value'
                values={formik.values.header}
                onChange={(event, newValue) => {
                  formik.setFieldValue('header.paymentMethod', newValue ? newValue.key : null)
                }}
                error={formik.touched.paymentMethod && Boolean(formik.errors.paymentMethod)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={2.4}>
              <CustomTextField
                name='vendorDocRef'
                label={labels.vendorDocRef}
                value={formik?.values?.header?.vendorDocRef}
                maxAccess={maxAccess}
                readOnly={isPosted}
                maxLength='15'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('header.vendorDocRef', '')}
                error={formik.touched.vendorDocRef && Boolean(formik.errors.vendorDocRef)}
              />
            </Grid>

            <Grid item xs={2.4}>
              <CustomTextField
                name='reference'
                label={labels.reference}
                value={formik?.values?.header?.reference}
                maxAccess={!editMode && maxAccess}
                readOnly={editMode}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('header.reference', '')}
                error={formik.touched.reference && Boolean(formik.errors.reference)}
              />
            </Grid>
            <Grid item xs={2.4}>
              <CustomDatePicker
                name='dueDate'
                required
                label={labels.dueDate}
                readOnly={isPosted}
                value={formik?.values?.header?.dueDate}
                onChange={formik.setFieldValue}
                editMode={editMode}
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('header.dueDate', '')}
                error={formik.touched?.header?.dueDate && Boolean(formik.errors?.header?.dueDate)}
              />
            </Grid>
            <Grid item xs={2.4}>
              <ResourceComboBox
                endpointId={InventoryRepository.Site.qry}
                name='siteId'
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
                readOnly={
                  formik?.values?.header.dtId ||
                  (formik?.values?.header.dtId && formik?.values?.header.commitItems == false) ||
                  isPosted
                }
                required={
                  !formik?.values?.header.dtId ||
                  (formik?.values?.header.dtId && formik?.values?.header.commitItems == true)
                }
                onChange={(event, newValue) => {
                  formik.setFieldValue('header.siteId', newValue ? newValue.recordId : null)
                  formik.setFieldValue('header.siteRef', newValue ? newValue.reference : null)
                  formik.setFieldValue('header.siteName', newValue ? newValue.name : null)
                }}
                error={formik.touched?.header?.siteId && Boolean(formik.errors?.header?.siteId)}
              />
            </Grid>
            <Grid item xs={2.4}>
              <ResourceComboBox
                endpointId={SystemRepository.Currency.qry}
                name='currencyId'
                label={labels.currency}
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
                onChange={(event, newValue) => {
                  formik.setFieldValue('header.currencyId', newValue?.recordId || null)
                }}
                error={formik.touched?.header?.currencyId && Boolean(formik.errors?.header?.currencyId)}
              />
            </Grid>
            <Grid item xs={2.4}></Grid>

            <Grid item xs={4.8}>
              <ResourceLookup
                endpointId={PurchaseRepository.Vendor.snapshot}
                name='vendorId'
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
                readOnly={isPosted}
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
                name='taxId'
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
                }}
                error={formik.touched.taxId && Boolean(formik.errors.taxId)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={2.4}>
              {metalPriceVisibility && (
                <CustomNumberField
                  name='KGmetalPrice'
                  label={labels.metalPrice}
                  value={formik.values.header.KGmetalPrice}
                  readOnly
                />
              )}
            </Grid>
          </Grid>
        </Fixed>

        <Grow>
          <DataGrid
            onChange={(value, action) => {
              formik.setFieldValue('items', value)
              action === 'delete' && setReCal(true)
            }}
            value={formik?.values?.items}
            error={formik.errors.items}
            name='items'
            columns={columns}
            maxAccess={maxAccess}
            disabled={isPosted || !formik.values.header.vendorId || !formik.values.header.vendorId}
          />
        </Grow>

        <Fixed>
          <Grid container spacing={2} sx={{ mt: '5px' }}>
            <Grid item xs={6}>
              <CustomTextArea
                name='description'
                label={labels.description}
                value={formik.values.header.description}
                rows={3}
                editMode={editMode}
                maxAccess={maxAccess}
                onChange={e => formik.setFieldValue('header.description', e.target.value)}
                onClear={() => formik.setFieldValue('header.description', '')}
                error={formik.touched.description && Boolean(formik.errors.description)}
              />
            </Grid>
            <Grid item xs={3}>
              <Stack spacing={2}>
                <CustomNumberField name='qty' maxAccess={maxAccess} label={labels.totQty} value={totalQty} readOnly />
                <CustomNumberField
                  name='volume'
                  maxAccess={maxAccess}
                  label={labels.totVolume}
                  value={totalVolume}
                  readOnly
                />
                <CustomNumberField
                  name='weight'
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
                  name='subTotal'
                  maxAccess={maxAccess}
                  label={labels.subtotal}
                  value={subtotal}
                  readOnly
                />
                <CustomNumberField
                  name='tdAmount'
                  maxAccess={maxAccess}
                  label={labels.discount}
                  value={formik.values.header.tdAmount}
                  displayCycleButton={true}
                  cycleButtonLabel={cycleButtonState.text}
                  decimalScale={2}
                  readOnly={isPosted}
                  isPercentIcon={cycleButtonState.text === '%' ? true : false}
                  handleButtonClick={handleButtonClick}
                  ShowDiscountIcons={true}
                  onChange={e => {
                    let discount = Number(e.target.value.replace(/,/g, ''))
                    if (formik.values.header.tdType == DIRTYFIELD_TDPCT) {
                      if (discount < 0 || discount > 100) discount = 0
                      formik.setFieldValue('header.tdPct', discount)
                    } else {
                      if (discount < 0 || formik.values.header.subtotal < discount) {
                        discount = 0
                      }
                      formik.setFieldValue('header.tdAmount', discount)
                    }
                    formik.setFieldValue('header.currentDiscount', discount)
                  }}
                  onBlur={async e => {
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
                    setReCal(true)
                    await recalcGridVat(formik.values.header.tdType, tdPct, tdAmount, discountAmount)
                  }}
                  onClear={() => {
                    formik.setFieldValue('header.tdAmount', 0)
                    formik.setFieldValue('header.tdPct', 0)
                    recalcGridVat(formik.values.header.tdType, 0, 0, 0)
                  }}
                />
                <CustomNumberField
                  name='miscAmount'
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
                  name='vatAmount'
                  maxAccess={maxAccess}
                  label={labels.VAT}
                  value={vatAmount}
                  readOnly
                />
                <CustomNumberField name='amount' maxAccess={maxAccess} label={labels.net} value={amount} readOnly />
              </Stack>
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}
