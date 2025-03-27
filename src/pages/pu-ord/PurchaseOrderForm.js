import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import { Grid, Stack } from '@mui/material'
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

import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'
import { DataSets } from 'src/resources/DataSets'
import ItemCostHistory from 'src/components/Shared/ItemCostHistory'
import TaxDetails from 'src/components/Shared/TaxDetails'
import ItemPromotion from 'src/components/Shared/ItemPromotion'
import CustomCheckBox from 'src/components/Inputs/CustomCheckBox'
import CustomButton from 'src/components/Inputs/CustomButton'

export default function PurchaseOrderForm({ labels, access, recordId, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { platformLabels, defaultsData, userDefaultsData } = useContext(ControlContext)
  const [measurements, setMeasurements] = useState([])
  const filteredMeasurements = useRef([])
  const [reCal, setReCal] = useState(false)
  const functionId = SystemFunction.PurchaseOrder

  const defaultsValues = defaultsData?.list?.reduce((acc, obj) => {
    if (obj.key === 'currencyId') acc.currencyId = parseInt(obj.value)
    if (obj.key === 'salesTD') acc.salesTD = obj.value

    return acc
  }, {})

  const defaultsUserValues = userDefaultsData?.list?.reduce((acc, obj) => {
    if (obj.key === 'plantId') acc.plantId = parseInt(obj.value)
    if (obj.key === 'siteId') acc.siteId = parseInt(obj.value)

    return acc
  }, {})

  const defPlId = defaultsUserValues?.plantId
  const defSiteId = defaultsUserValues?.siteId
  const defCurrencyId = defaultsValues?.currencyId
  const salesTD = defaultsValues.salesTD
  const text = salesTD == 'True' ? '%' : 123
  const value = salesTD == 'True' ? DIRTYFIELD_TDPCT : 1

  const [cycleButtonState, setCycleButtonState] = useState({
    text,
    value
  })

  const { documentType, maxAccess } = useDocumentType({
    functionId: functionId,
    access: access,
    enabled: !recordId,
    objectName: 'header'
  })

  const initialValues = {
    recordId: recordId,
    requestId: null,
    requestRef: null,
    header: {
      printStatus: '',
      status: 1,
      releaseStatus: null,
      dtId: null,
      dgId: functionId,
      functionId: functionId,
      recordId: null,
      date: new Date(),
      deliveryDate: null,
      reference: '',
      siteId: defSiteId,
      isVattable: false,
      currencyId: defCurrencyId,
      plantId: defPlId,
      subtotal: 0,
      vatAmount: 0,
      miscAmount: 0,
      amount: 0,
      description: '',
      baseAmount: 0,
      tdType: salesTD == 'True' ? 2 : 1,
      tdPct: 0,
      tdAmount: 0,
      exRate: 1,
      rateCalcMethod: 1,
      volume: 0,
      weight: 0,
      qty: 0,
      vendorId: null,
      vendorName: '',
      vendorRef: '',
      paymentMethod: null,
      exWorks: false,
      deliveryStatus: null,
      vendorDocRef: '',
      deliveryMethodId: null,
      ptId: null,
      taxId: null,
      currentDiscount: 0 // testing
    },
    items: [
      {
        id: 1,
        poSeqNo: '',
        poId: 0,
        seqNo: null,
        componentSeqNo: null,
        itemId: null,
        sku: null,
        itemName: null,
        siteId: null,
        trackingStatusId: null,
        trackingStatusName: '',
        muId: null,
        spId: null,
        qty: 0,
        baseQty: 0,
        unitPrice: 0,
        baseLaborPrice: 0,
        isMetal: false,
        metalId: null,
        metalPurity: 0,
        basePrice: 0,
        mdType: MDTYPE_PCT,
        mdValue: 0,
        mdAmount: 0,
        pieces: 0,
        extendedPrice: 0,
        applyVat: false,
        vatAmount: 0,
        vatPct: 0,
        unitCost: 0,
        priceType: 0,
        weight: 0,
        volume: 0,
        notes: '',
        upo: 0,
        poRef: '',
        trackBy: '',
        lotCategoryId: null,
        taxId: null,
        deliveryDate: null,
        requestId: null,
        requestRef: '',
        requestSeqNo: null,
        receivedQty: 0,
        invoicedQty: 0,
        msId: null,
        muRef: '',
        muQty: 0,
        netUnitPrice: 0,
        netUnitPriceVariation: 0
      }
    ]
  }

  const invalidate = useInvalidate({
    endpointId: PurchaseRepository.PurchaseOrder.page
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
    documentType: { key: 'header.dtId', value: documentType?.dtId },
    initialValues: initialValues,
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      header: yup.object({
        date: yup.string().required(),
        currencyId: yup.string().required(),
        vendorId: yup.string().required()
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
          date: formatDateToApi(obj.header.date)

          // dueDate: formatDateToApi(obj.header.dueDate)
        },
        items: obj.items.map(({ id, isVattable, taxDetails, ...rest }, index) => ({
          ...rest,
          seqNo: id,
          applyVat: isVattable
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
        extension: PurchaseRepository.PurchaseOrder.set2,
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

  async function getFilteredMU(itemId) {
    if (!itemId) return

    const currentItemId = formik.values.items?.find(item => parseInt(item.itemId) === itemId)?.msId

    const arrayMU = measurements?.filter(item => item.msId === currentItemId) || []
    filteredMeasurements.current = arrayMU
  }

  console.log(filteredMeasurements?.current)

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
          { from: 'name', to: 'itemName' },
          { from: 'msId', to: 'msId' }
        ],
        columnsInDropDown: [
          { key: 'sku', value: 'SKU' },
          { key: 'name', value: 'Item Name' }
        ],
        displayFieldWidth: 5,
        minChars: 2
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

        const vendorPrice = await getVendorPrice(newRow, formik.values.header)
        const data = await getItemObject(phycialProperty, itemInfo, vendorPrice)
        update(data)
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

    // {
    //   component: 'resourcecombobox',
    //   label: labels.site,
    //   name: 'siteRef',
    //   props: {
    //     endpointId: InventoryRepository.Site.qry,
    //     displayField: 'reference',
    //     valueField: 'recordId',
    //     mapping: [
    //       { from: 'recordId', to: 'siteId' },
    //       { from: 'reference', to: 'siteRef' },
    //       { from: 'name', to: 'siteName' }
    //     ],
    //     columnsInDropDown: [
    //       { key: 'reference', value: 'Reference' },
    //       { key: 'name', value: 'Name' }
    //     ],
    //     displayFieldWidth: 5
    //   }
    // },
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
      async onChange({ row: { update, newRow } }) {
        getItemPriceRow(update, newRow, DIRTYFIELD_QTY)
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
      async onChange({ row: { update, newRow } }) {
        getItemPriceRow(update, newRow, DIRTYFIELD_BASE_PRICE)
      }
    },
    {
      component: 'resourcelookup',
      label: labels.requestRef,
      name: 'requestId',
      props: {
        endpointId: PurchaseRepository?.Request.snapshot,
        filter: { status: 4 },
        displayField: 'reference',
        valueField: 'reference',
        mapping: [
          { from: 'reference', to: 'requestRef' },
          { from: 'recordId', to: 'requestId' }
        ]
      }
    },

    {
      component: 'numberfield',
      label: labels.unitCost,
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
      label: labels.extendedCost,
      name: 'extendedPrice',
      updateOn: 'blur',
      async onChange({ row: { update, newRow } }) {
        getItemPriceRow(update, newRow, DIRTYFIELD_EXTENDED_PRICE)
      }
    },
    {
      component: 'date',
      label: labels.deliveryDate,
      name: 'deliveryDate'
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
      extension: PurchaseRepository.PurchaseOrder.post,
      record: JSON.stringify(formik.values.header)
    })

    toast.success(platformLabels.Posted)
    await refetchForm(formik.values.recordId)
    invalidate()
    window.close()
  }

  const onUnpost = async () => {
    const res = await postRequest({
      extension: PurchaseRepository.PurchaseOrder.unpost,
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
          deliveryDate: formatDateFromApi(item.deliveryDate),
          puTrx: true,
          taxDetails: updatedpuTrxTaxes?.filter(tax => tax.seqNo === item.seqNo)
        }
      })
    )

    formik.setValues({
      ...formik.values,
      recordId: puTrxHeader.recordId || null,
      dtId: puTrxHeader.dtId || null,
      header: {
        ...formik.values.header,
        ...puTrxHeader,
        amount: parseFloat(puTrxHeader?.amount).toFixed(2),
        currentDiscount:
          puTrxHeader?.tdType == 1 || puTrxHeader?.tdType == null ? puTrxHeader?.tdAmount : puTrxHeader?.tdPct
      },
      items: modifiedList
    })
  }

  async function getPurchaseTransactionPack(transactionId) {
    const res = await getRequest({
      extension: PurchaseRepository.PurchaseOrder.get2,
      parameters: `_poId=${transactionId}`
    })

    res.record.header.date = formatDateFromApi(res?.record?.header?.date)
    res.record.header.deliveryDate = formatDateFromApi(res?.record?.header?.deliveryDate)

    return res.record
  }

  const getMeasurementUnits = async () => {
    return await getRequest({
      extension: InventoryRepository.MeasurementUnit.qry,
      parameters: `_msId=0`
    })
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

    const unitPrice = !vendorPrice ? 0 : vendorPrice.priceList
    const baseLaborPrice = !vendorPrice ? 0 : vendorPrice.baseLaborPrice
    const TotPricePerG = baseLaborPrice
    const postMetalToFinancials = formik?.values?.header?.postMetalToFinancials ?? false

    const basePriceValue = postMetalToFinancials === false ? metalPurity : 0

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

    const row = {
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
    }

    formik.setFieldValue(
      'header.mdAmount',
      formik.values.header.currentDiscount ? formik.values.header.currentDiscount : 0
    )

    if (update) update(row)
    else return row
  }

  async function getItemObject(itemPhysProp, itemInfo, vendorPrice) {
    const weight = parseFloat(itemPhysProp?.weight || 0).toFixed(2)
    const metalPurity = itemPhysProp?.metalPurity ?? 0
    const isMetal = itemPhysProp?.isMetal ?? false
    const metalId = itemPhysProp?.metalId ?? null

    const unitPrice = !vendorPrice ? 0 : vendorPrice.priceList
    const baseLaborPrice = !vendorPrice ? 0 : vendorPrice.baseLaborPrice
    const TotPricePerG = baseLaborPrice
    const postMetalToFinancials = formik?.values?.header?.postMetalToFinancials ?? false

    const basePriceValue = postMetalToFinancials === false ? metalPurity : 0

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

    return {
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
    }
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
    const currentDiscount = formik.values.header.currentDiscount
    if (cycleButtonState.value == 1) {
      currentPctAmount = currentDiscount < 0 || currentDiscount > 100 ? 0 : currentDiscount
      currentTdAmount = (parseFloat(currentPctAmount) * parseFloat(subtotal)) / 100
      currentDiscountAmount = currentPctAmount

      formik.setFieldValue('header.tdAmount', currentTdAmount)
      formik.setFieldValue('header.tdPct', currentPctAmount)
      formik.setFieldValue('header.currentDiscount', currentPctAmount)
    } else {
      currentTdAmount = currentDiscount < 0 || subtotal < currentDiscount ? 0 : currentDiscount
      currentPctAmount = (parseFloat(currentTdAmount) / parseFloat(subtotal)) * 100
      currentDiscountAmount = currentTdAmount
      formik.setFieldValue('header.tdPct', currentPctAmount)
      formik.setFieldValue('header.tdAmount', currentTdAmount)
      formik.setFieldValue('header.currentDiscount', currentTdAmount)
    }
    setCycleButtonState(prevState => {
      const newState = prevState.text === '%' ? { text: '123', value: 1 } : { text: '%', value: 2 }
      formik.setFieldValue('tdType', newState.value)
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

    formik.setFieldValue('tdAmount', _discountObj?.hiddenTdAmount ? _discountObj?.hiddenTdAmount?.toFixed(2) : 0)
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
    console.log('saTrxpack', saTrxpack)
    if (saTrxpack) fillForm(saTrxpack)
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
      const muList = await getMeasurementUnits()
      setMeasurements(muList?.list)
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

  const getItems = async () => {
    const response = await getRequest({
      extension: PurchaseRepository.Requisition.qry,
      parameters: `_trxId=${formik.values.requestId}`
    })

    const itemInfoArray = await Promise.all(
      response.list.map(async (item, index) => {
        const itemInfo = await getItemInfo(item.itemId)

        return { id: index + 1, ...itemInfo }
      })
    )

    formik.setFieldValue('items', itemInfoArray)
  }

  const getItemInfo = async itemId => {
    const phycialProperty = await getItemPhysProp(itemId)
    const itemInfo = await getItem(itemId)
    console.log(itemInfo)
    const obj = { itemId: itemId }
    const vendorPrice = await getVendorPrice(obj, formik.values.header)

    return fillItemObject('', phycialProperty, itemInfo, vendorPrice)
  }

  return (
    <FormShell
      resourceId={ResourceIds.PurchaseTransactions}
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
            <Grid item xs={3}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SystemRepository.DocumentType.qry}
                    parameters={`_startAt=0&_pageSize=1000&_dgId=${SystemFunction.PurchaseOrder}`}
                    name='header.dtId'
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
                    onChange={(_, newValue) => {
                      formik.setFieldValue('header.dtId', newValue.recordId)
                    }}
                    error={formik.touched.header?.dtId && Boolean(formik.errors.header?.dtId)}
                  />
                </Grid>

                <Grid item xs={12}>
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

                <Grid item xs={12}>
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
                    readOnly={isPosted}
                    displayFieldWidth={3}
                    editMode={editMode}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceLookup
                    endpointId={PurchaseRepository?.Request.snapshot}
                    name='requestId'
                    label={labels.requisition}
                    valueField='reference'
                    valueShow='requestRef'
                    formObject={formik.values.header}
                    form={formik}
                    secondDisplayField={false}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('requestId', newValue.recordId)
                      formik.setFieldValue('requestRef', newValue.reference)
                    }}
                    errorCheck={'header.vendorId'}
                    maxAccess={maxAccess}
                    required
                    readOnly={isPosted}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={3}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <CustomDatePicker
                    name='header.date'
                    required
                    label={labels.date}
                    readOnly={isPosted}
                    value={formik?.values?.header?.date}
                    onChange={(e, newValue) => formik.setFieldValue('header.date', newValue)}
                    editMode={editMode}
                    maxAccess={maxAccess}
                    onClear={() => formik.setFieldValue('header.date', '')}
                    error={formik.touched?.header?.date && Boolean(formik.errors?.header?.date)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SystemRepository.Currency.qry}
                    name='header.currencyId'
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
                <Grid item xs={12}></Grid>
                <Grid item xs={12}></Grid>
                <Grid item xs={12}></Grid>
                <Grid item xs={12}></Grid>
                <Grid item xs={12}></Grid>
                <Grid item xs={12}>
                  <CustomButton
                    onClick={() => getItems()}
                    label={'platformLabels.Generate'}
                    color='#231f20'
                    // tooltipText={platformLabels.Generate}
                    image={'generate.png'}
                  />{' '}
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={3}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
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
                <Grid item xs={12}>
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
                <Grid item xs={12}>
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
                    }}
                    error={formik.touched.header?.taxId && Boolean(formik.errors.header?.taxId)}
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={12}>
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
              </Grid>
            </Grid>
            <Grid item xs={3}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <CustomDatePicker
                    name='header.deliveryDate'
                    required
                    label={labels.deliveryDate}
                    readOnly={isPosted}
                    value={formik?.values?.header?.deliveryDate}
                    onChange={(e, newValue) => formik.setFieldValue('header.deliveryDate', newValue)}
                    editMode={editMode}
                    maxAccess={maxAccess}
                    onClear={() => formik.setFieldValue('header.deliveryDate', '')}
                    error={formik.touched?.header?.date && Boolean(formik.errors?.header?.date)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={PurchaseRepository.DeliveryMethods.qry}
                    name='header.deliveryMethodId'
                    label={labels.deliveryMethod}
                    valueField='recordId'
                    displayField={['name']}
                    values={formik.values.header}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('header.deliveryMethodId', newValue?.recordId || null)
                    }}
                    error={formik.touched.header?.deliveryMethodId && Boolean(formik.errors.header?.deliveryMethodId)}
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={PurchaseRepository.PaymentTerms.qry}
                    name='header.ptId'
                    label={labels.paymentTerms}
                    valueField='recordId'
                    displayField={['name']}
                    values={formik.values.header}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('header.ptId', newValue?.recordId || null)
                    }}
                    error={formik.touched.header?.ptId && Boolean(formik.errors.header?.ptId)}
                    maxAccess={maxAccess}
                  />
                </Grid>

                <Grid item xs={6}>
                  <CustomCheckBox
                    name='header.isVattable'
                    value={formik.values?.header?.isVattable}
                    onChange={event => formik.setFieldValue('header.isVattable', event.target.checked)}
                    label={labels.VAT}
                    disabled={formik?.values?.items && formik?.values?.items[0]?.itemId}
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={6}>
                  <CustomCheckBox
                    name='header.exWorks'
                    value={formik.values?.header?.exWorks}
                    onChange={event => formik.setFieldValue('header.exWork', event.target.checked)}
                    label={labels.exWorks}
                    disabled={formik?.values?.items && formik?.values?.items[0]?.itemId}
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
              if (field == 'muRef') getFilteredMU(row?.itemId)
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
