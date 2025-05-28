import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { formatDateFromApi, formatDateToApi, formatDateForGetApI } from 'src/lib/date-helper'
import { Button, Grid } from '@mui/material'
import { useContext, useEffect, useRef, useState } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
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
import SalesTrxForm from 'src/components/Shared/SalesTrxForm'
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
  DIRTYFIELD_UPO,
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
import AddressFilterForm from 'src/components/Shared/AddressFilterForm'
import { MultiCurrencyRepository } from 'src/repositories/MultiCurrencyRepository'
import { RateDivision } from 'src/resources/RateDivision'
import { useError } from 'src/error'
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'
import { AddressFormShell } from 'src/components/Shared/AddressFormShell'
import NormalDialog from 'src/components/Shared/NormalDialog'
import CustomCheckBox from 'src/components/Inputs/CustomCheckBox'
import { ResourceIds } from 'src/resources/ResourceIds'
import MultiCurrencyRateForm from 'src/components/Shared/MultiCurrencyRateForm'
import { DIRTYFIELD_RATE, getRate } from 'src/utils/RateCalculator'
import TaxDetails from 'src/components/Shared/TaxDetails'
import { SerialsForm } from 'src/components/Shared/SerialsForm'
import AccountSummary from 'src/components/Shared/AccountSummary'

export default function SaleTransactionForm({
  labels,
  access,
  recordId,
  functionId,
  window,
  lockRecord,
  getResourceId
}) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack: stackError } = useError()
  const { stack } = useWindow()
  const { platformLabels, defaultsData, userDefaultsData } = useContext(ControlContext)
  const [cycleButtonState, setCycleButtonState] = useState({ text: '%', value: DIRTYFIELD_TDPCT })
  const [measurements, setMeasurements] = useState([])
  const [address, setAddress] = useState({})
  const [metalPriceVisibility, setmetalPriceVisibility] = useState(false)
  const [defaultsDataState, setDefaultsDataState] = useState(null)
  const [userDefaultsDataState, setUserDefaultsDataState] = useState(null)
  const [reCal, setReCal] = useState(false)
  const filteredMeasurements = useRef([])

  const { documentType, maxAccess } = useDocumentType({
    functionId: functionId,
    access: access,
    enabled: !recordId,
    objectName: 'header'
  })

  const invalidate = useInvalidate({
    endpointId: SaleRepository.SalesTransaction.qry
  })

  const { labels: _labels, access: MRCMaxAccess } = useResourceQuery({
    endpointId: MultiCurrencyRepository.Currency.get,
    datasetId: ResourceIds.MultiCurrencyRate
  })

  const { formik } = useForm({
    maxAccess,
    documentType: { key: 'header.dtId', value: documentType?.dtId },
    initialValues: {
      recordId: recordId || null,
      header: {
        dgId: functionId,
        recordId: null,
        dtId: null,
        reference: '',
        date: new Date(),
        dueDate: new Date(),
        plantId: null,
        clientId: null,
        clientName: '',
        clientRef: '',
        currencyId: null,
        currencyName: '',
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
        billAddressId: null,
        billAddress: '',
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
        KGmetalPrice: 0,
        balance: 0,
        accountId: 0
      },
      items: [
        {
          id: 1,
          orderId: recordId || 0,
          barcode: '',
          itemId: '',
          sku: '',
          itemName: '',
          seqNo: 1,
          siteId: null,
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
          minPrice: 0,
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
          upo: 0,
          extendedPrice: 0,
          priceType: 0,
          applyVat: false,
          taxId: null,
          taxDetails: null,
          notes: '',
          saTrx: true,
          taxDetailsButton: true
        }
      ],
      serials: [],
      lots: [],
      taxes: []
    },
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      header: yup.object({
        date: yup.string().required(),
        currencyId: yup.string().required(),
        clientId: yup.string().required(),
        siteId: yup
          .string()
          .nullable()
          .test(function (value) {
            const { dtId, commitItems } = this.parent
            if (!dtId) {
              return !!value
            }
            if (dtId && commitItems) {
              return !!value
            }

            return true
          })
      }),
      items: yup.array().of(
        yup.object({
          sku: yup.string().required(),
          itemName: yup.string().required(),
          qty: yup.number().required().min(1)
        })
      )
    }),
    onSubmit: async obj => {
      if (obj.header.serializedAddress) {
        const addressData = {
          clientId: obj.header.clientId,
          address: address
        }

        const addressRes = await postRequest({
          extension: SaleRepository.Address.set,
          record: JSON.stringify(addressData)
        })

        obj.header.billAddressId = addressRes.recordId
      }

      let serialsValues = []

      const updatedRows = obj.items.map(({ id, isVattable, taxDetails, ...rest }) => {
        const { serials, ...restDetails } = rest

        if (serials) {
          const updatedSerials = serials.map((serialDetail, idx) => ({
            ...serialDetail,
            srlSeqNo: 0,
            id: idx,
            componentSeqNo: 0,
            trxId: formik.values.recordId || 0,
            itemId: rest?.itemId,
            seqNo: id
          }))

          serialsValues = [...serialsValues, ...updatedSerials]
        }

        return {
          ...restDetails,
          seqNo: id,
          applyVat: isVattable
        }
      })

      const payload = {
        header: {
          ...obj.header,
          date: formatDateToApi(obj.header.date),
          dueDate: formatDateToApi(obj.header.dueDate)
        },
        items: updatedRows,
        serials: serialsValues,
        taxes: Object.values(
          [
            ...obj.taxes,
            ...obj.items
              .filter(({ taxDetails }) => taxDetails && taxDetails.length > 0)
              .map(({ taxDetails, id }) => ({
                seqNo: id,
                ...taxDetails[0]
              }))
          ].reduce((acc, tax) => {
            if (obj.items.some(item => item.id === tax.seqNo)) {
              acc[tax.seqNo] = tax
            }

            return acc
          }, {})
        ),

        ...(({ header, items, taxes, serials, ...rest }) => rest)(obj)
      }

      const saTrxRes = await postRequest({
        extension: SaleRepository.SalesTransaction.set2,
        record: JSON.stringify(payload)
      })
      const actionMessage = editMode ? platformLabels.Edited : platformLabels.Added
      toast.success(actionMessage)
      await refetchForm(saTrxRes.recordId)
      invalidate()
    }
  })

  const itemsUpdate = useRef(formik?.values?.items)

  function openMCRForm(data) {
    stack({
      Component: MultiCurrencyRateForm,
      props: {
        labels: _labels,
        maxAccess: MRCMaxAccess,
        data: data,
        onOk: childFormikValues => {
          formik.setFieldValue('header', {
            ...formik.values.header,
            ...childFormikValues
          })
        }
      },
      width: 500,
      height: 500,
      title: _labels.MultiCurrencyRate
    })
  }

  const isPosted = formik.values.header.status === 3
  const editMode = !!formik.values.header.recordId

  async function barcodeSkuSelection(update, ItemConvertPrice, itemPhysProp, itemInfo, setItemInfo) {
    const weight = parseFloat(itemPhysProp?.weight || 0).toFixed(2)
    const metalPurity = itemPhysProp?.metalPurity ?? 0
    const isMetal = itemPhysProp?.isMetal ?? false
    const metalId = itemPhysProp?.metalId ?? null

    const postMetalToFinancials = formik?.values?.header?.postMetalToFinancials ?? false
    const metalPrice = formik?.values?.header?.KGmetalPrice ?? 0
    const basePrice = (metalPrice * metalPurity) / 1000
    const basePriceValue = postMetalToFinancials === false ? basePrice : 0
    const TotPricePerG = basePriceValue

    const unitPrice =
      ItemConvertPrice?.priceType === 3
        ? weight * TotPricePerG
        : parseFloat(ItemConvertPrice?.unitPrice || 0).toFixed(3)

    const minPrice = parseFloat(ItemConvertPrice?.minPrice || 0).toFixed(3)
    let rowTax = null
    let rowTaxDetails = null

    if (!formik.values.header.taxId) {
      if (itemInfo?.taxId) {
        const taxDetailsResponse = await getTaxDetails(itemInfo.taxId)

        const details = taxDetailsResponse.map(item => ({
          invoiceId: formik.values.recordId,
          taxSeqNo: item.seqNo,
          taxId: itemInfo.taxId,
          taxCodeId: item.taxCodeId,
          taxBase: item.taxBase,
          amount: item.amount ?? 0
        }))
        rowTax = itemInfo.taxId
        rowTaxDetails = details
      }
    } else {
      const taxDetailsResponse = await getTaxDetails(formik.values.header.taxId)

      const details = taxDetailsResponse.map(item => ({
        invoiceId: formik.values.recordId,
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
    if (parseFloat(unitPrice) < parseFloat(minPrice)) {
      ShowMinPriceValueErrorMessage(minPrice, unitPrice)
    }

    if (setItemInfo) {
      update({
        sku: ItemConvertPrice?.sku,
        barcode: ItemConvertPrice?.barcode,
        itemName: ItemConvertPrice?.itemName,
        itemId: ItemConvertPrice?.itemId
      })
    }

    update({
      isMetal: isMetal,
      metalId: metalId,
      metalPurity: metalPurity,
      volume: parseFloat(itemPhysProp?.volume) || 0,
      weight: weight,
      basePrice:
        isMetal === false
          ? parseFloat(ItemConvertPrice?.basePrice || 0).toFixed(5)
          : metalPurity > 0
          ? basePriceValue
          : 0,
      baseLaborPrice: 0,
      TotPricePerG: TotPricePerG,
      unitPrice: unitPrice,
      upo: parseFloat(ItemConvertPrice?.upo || 0).toFixed(2),
      priceType: ItemConvertPrice?.priceType || 1,
      qty: 0,
      msId: itemInfo?.msId,
      muRef: filteredMeasurements?.[0]?.reference,
      muId: filteredMeasurements?.[0]?.recordId,
      mdAmount: formik.values.header.maxDiscount ? parseFloat(formik.values.header.maxDiscount).toFixed(2) : 0,
      mdValue: 0,
      mdType: MDTYPE_PCT,
      extendedPrice: parseFloat('0').toFixed(2),
      mdValue: 0,
      taxId: rowTax,
      minPrice,
      taxDetails: rowTaxDetails,
      taxDetailsButton: true
    })

    formik.setFieldValue(
      'header.mdAmount',
      formik.values.header.currentDiscount ? formik.values.header.currentDiscount : 0
    )
  }

  async function getMultiCurrencyFormData(currencyId, date, rateType, amount) {
    if (currencyId && date && rateType) {
      const res = await getRequest({
        extension: MultiCurrencyRepository.Currency.get,
        parameters: `_currencyId=${currencyId}&_date=${formatDateForGetApI(date)}&_rateDivision=${rateType}`
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

  const iconKey = ({ value, data }) => {
    const mdType = value?.mdType || data?.mdType

    return mdType === MDTYPE_PCT ? '%' : '123'
  }

  const columns = [
    {
      component: 'textfield',
      label: labels.barcode,
      name: 'barcode',
      updateOn: 'blur',
      async onChange({ row: { update, newRow } }) {
        if (!newRow?.barcode) return

        const ItemConvertPrice = await getItemConvertPrice2(newRow)
        if (ItemConvertPrice) {
          const itemPhysProp = await getItemPhysProp(ItemConvertPrice?.itemId)
          const itemInfo = await getItem(ItemConvertPrice?.itemId)
          await barcodeSkuSelection(update, ItemConvertPrice, itemPhysProp, itemInfo, true)
        } else {
          update({
            barcode: null
          })
        }
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
        valueField: 'sku',
        mapping: [
          { from: 'recordId', to: 'itemId' },
          { from: 'sku', to: 'sku' },
          { from: 'name', to: 'itemName' },
          { from: 'trackBy', to: 'trackBy' },
          { from: 'msId', to: 'msId' }
        ],
        columnsInDropDown: [
          { key: 'sku', value: 'SKU' },
          { key: 'name', value: 'Item Name' }
        ],
        displayFieldWidth: 5
      },
      async onChange({ row: { update, newRow } }) {
        if (!newRow.itemId) return
        const itemPhysProp = await getItemPhysProp(newRow.itemId)
        const itemInfo = await getItem(newRow.itemId)
        getFilteredMU(newRow?.itemId)
        const ItemConvertPrice = await getItemConvertPrice(newRow.itemId)
        await barcodeSkuSelection(update, ItemConvertPrice, itemPhysProp, itemInfo, false)
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
        if (newRow) {
          await getItemConvertPrice(newRow.itemId, newRow?.muId)
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
      async onChange({ row: { update, oldRow, newRow } }) {
        const unitPrice = parseFloat(newRow.unitPrice || 0).toFixed(3)
        const minPrice = parseFloat(oldRow?.minPrice || 0).toFixed(3)

        if (parseFloat(minPrice) > 0 && parseFloat(unitPrice) < parseFloat(minPrice)) {
          ShowMinPriceValueErrorMessage(minPrice, unitPrice)
        }
        const data = getItemPriceRow(newRow, DIRTYFIELD_UNIT_PRICE)
        update(data)
      }
    },
    {
      component: 'numberfield',
      label: labels.priceWithVAT,
      name: 'priceWithVAT'
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
      props: {
        imgSrc: '/images/buttonsIcons/popup-black.png'
      },
      label: labels.salesTrx,
      onClick: (e, row, update, newRow) => {
        stack({
          Component: SalesTrxForm,
          props: {
            recordId: 0,
            functionId: functionId,
            itemId: row?.itemId,
            clientId: formik?.values?.header?.clientId
          },
          width: 1200,
          title: platformLabels.SalesTransactions
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
      name: 'notes'
    },
    {
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
              checkForSiteId: true,
              updateRow
            },
            width: 500,
            height: 700,
            title: platformLabels.serials
          })
        }
      }
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
      },
      width: 950,
      height: 600,
      title: labels.workflow
    })
  }

  const onPost = async () => {
    await postRequest({
      extension: SaleRepository.SaleTransaction.post,
      record: JSON.stringify(formik.values.header)
    })

    toast.success(platformLabels.Posted)
    invalidate()
    window.close()
  }

  const onUnpost = async () => {
    await postRequest({
      extension: SaleRepository.SaleTransaction.unpost,
      record: JSON.stringify(formik.values.header)
    }).then(res => {
      toast.success(platformLabels.Posted)
      lockRecord({
        recordId: res.recordId,
        reference: formik.values.header.reference,
        resourceId: getResourceId(parseInt(functionId)),
        onSuccess: () => {
          refetchForm(res.recordId)
        },
        isAlreadyLocked: name => {
          window.close()
          stack({
            Component: NormalDialog,
            props: {
              DialogText: `${platformLabels.RecordLocked} ${name}`,
              width: 600,
              height: 200,
              title: platformLabels.Dialog
            }
          })
        }
      })
      invalidate()
    })
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
      key: 'FI Trx',
      condition: true,
      onClick: 'onClickIT',
      disabled: !editMode
    },
    {
      key: 'SA Trx',
      condition: true,
      onClick: 'onClickSATRX',
      disabled: !editMode
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
      disabled: !isPosted
    },
    {
      key: 'Unlocked',
      condition: !isPosted,
      onClick: onPost,
      disabled: !editMode
    },
    {
      key: 'ClientSalesTransaction',
      condition: true,
      onClick: 'onClientSalesTransaction',
      disabled: !formik.values.header?.clientId
    },
    {
      key: 'AccountSummary',
      condition: true,
      onClick: () => {
        stack({
          Component: AccountSummary,
          props: {
            clientId: parseInt(formik.values.header.clientId),
            moduleId: 1
          },
          width: 1000,
          height: 500,
          title: labels.accountSummary
        })
      },
      disabled: !formik.values.header.clientId
    }
  ]

  async function getSerials(recordId, seqNo) {
    if (recordId)
      return await getRequest({
        extension: SaleRepository.LastSerialInvoice.qry,
        parameters: `_trxId=${recordId}&_seqNo=${seqNo}&_componentSeqNo=${0}`
      })
  }

  async function fillForm(saTrxPack, dtInfo) {
    const saTrxHeader = saTrxPack?.header
    const saTrxItems = saTrxPack?.items
    const saTrxTaxes = saTrxPack?.taxes
    const billAdd = await getAddress(saTrxHeader?.billAddressId)

    saTrxHeader?.tdType === 1 || saTrxHeader?.tdType == null
      ? setCycleButtonState({ text: '123', value: 1 })
      : setCycleButtonState({ text: '%', value: 2 })

    const modifiedList = await Promise.all(
      saTrxItems?.map(async (item, index) => {
        const taxDetailsResponse = saTrxHeader.isVattable ? await getTaxDetails(item.taxId) : null
        const serials = await getSerials(recordId, item.seqNo)

        const updatedSaTrxTaxes =
          saTrxTaxes?.map(tax => {
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
          upo: parseFloat(item.upo).toFixed(2),
          vatAmount: parseFloat(item.vatAmount).toFixed(2),
          extendedPrice: parseFloat(item.extendedPrice).toFixed(2),
          saTrx: true,
          serials: serials?.list?.map((serialDetail, index) => {
            return {
              ...serialDetail,
              id: index
            }
          }),
          taxDetails:
            updatedSaTrxTaxes?.filter(tax => saTrxItems?.some(responseTax => responseTax.seqNo != tax.seqNo)) || null
        }
      })
    )
    formik.setValues({
      ...formik.values,
      recordId: saTrxHeader.recordId || null,
      header: {
        ...formik.values.header,
        ...saTrxHeader,
        amount: parseFloat(saTrxHeader?.amount).toFixed(2) ?? 0,
        billAddress: billAdd,
        currentDiscount:
          saTrxHeader?.tdType == 1 || saTrxHeader?.tdType == null ? saTrxHeader?.tdAmount : saTrxHeader?.tdPct,
        KGmetalPrice: saTrxHeader?.metalPrice * 1000,
        subtotal: saTrxHeader?.subtotal.toFixed(2),
        commitItems: dtInfo?.record?.commitItems
      },
      items: modifiedList,
      taxes: [...saTrxTaxes]
    })
    itemsUpdate.current = modifiedList

    const res = await getClientInfo(saTrxHeader.clientId)
    getClientBalance(res?.record?.accountId, saTrxHeader.currencyId)
    !formik.values.recordId &&
      lockRecord({
        recordId: saTrxHeader.recordId,
        reference: saTrxHeader.reference,
        resourceId: getResourceId(parseInt(functionId))
      })
  }

  async function getSalesTransactionPack(transactionId) {
    const res = await getRequest({
      extension: SaleRepository.SalesTransaction.get2,
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
        )}&_rateDivision=${RateDivision.SALES}`
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

  async function getAddress(addressId) {
    if (!addressId) return

    const res = await getRequest({
      extension: SystemRepository.Address.format,
      parameters: `_addressId=${addressId}`
    })

    return res?.record?.formattedAddress.replace(/(\r\n|\r|\n)+/g, '\r\n')
  }

  async function getAccountLimit(currencyId, accountId) {
    const res = await getRequest({
      extension: FinancialRepository.AccountCreditLimit.get,
      parameters: `_accountId=${accountId}&_currencyId=${currencyId}`
    })

    return res?.record
  }

  async function fillClientData(clientObject) {
    const clientId = clientObject?.recordId
    if (!clientId) {
      formik.setFieldValue('header.clientId', null)
      formik.setFieldValue('header.clientName', null)
      formik.setFieldValue('header.clientRef', null)

      return
    }

    const res = await getClientInfo(clientId)

    const record = res?.record || {}
    const accountId = record.accountId
    const currencyId = record.currencyId ?? formik.values.header.currencyId ?? null
    if (!currencyId) {
      stackError({ message: labels.NoCurrencyAvailable })

      return
    }
    const billAdd = await getAddress(record.billAddressId)
    const accountLimit = await getAccountLimit(currencyId, accountId)

    formik.setValues({
      ...formik.values,
      header: {
        ...formik.values.header,
        clientId: clientObject?.recordId,
        clientName: clientObject?.name,
        clientRef: clientObject?.reference,
        isVattable: clientObject?.isSubjectToVAT || false,
        maxDiscount: clientObject?.maxDiscount,
        taxId: clientObject?.taxId,
        currencyId: currencyId,
        spId: record.spId,
        ptId: record.ptId ?? defaultsDataState.ptId,
        plId: record.plId ?? defaultsDataState.plId,
        szId: record.szId,
        billAddressId: record.billAddressId,
        billAddress: billAdd,
        creditLimit: accountLimit?.limit ?? 0,
        accountId: record?.accountId
      }
    })

    await getClientBalance(record?.accountId, formik.values.header.currencyId)
  }

  async function getClientInfo(clientId) {
    return await getRequest({
      extension: SaleRepository.Client.get,
      parameters: `_recordId=${clientId}`
    })
  }

  async function getClientBalance(accountId, currencyId) {
    const res = await getRequest({
      extension: FinancialRepository.AccountCreditBalance.get,
      parameters: `_accountId=${accountId}&_currencyId=${currencyId}`
    })
    formik.setFieldValue('header.balance', res?.record?.balance || 0)
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

  async function getItemConvertPrice(itemId) {
    const res = await getRequest({
      extension: SaleRepository.ItemConvertPrice.get,
      parameters: `_itemId=${itemId}&_clientId=${formik.values.header.clientId}&_currencyId=${
        formik.values.header.currencyId
      }&_plId=${formik.values.header.plId}&_muId=${0}`
    })

    return res?.record
  }

  async function getItemConvertPrice2(row) {
    const res = await getRequest({
      extension: SaleRepository.ItemConvertPrice.get2,
      parameters: `_barcode=${row?.barcode}&_clientId=${formik.values.header.clientId}&_currencyId=${formik.values.header.currencyId}&_plId=${formik.values.header.plId}&_exRate=${formik.values.header.exRate}&_rateCalcMethod=${formik.values.header.rateCalcMethod}`
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
      formik.setFieldValue('currentDiscount', currentTdAmount)
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
      basePrice: parseFloat(newRow?.basePrice || 0),
      volume: parseFloat(newRow?.volume) || 0,
      weight: parseFloat(newRow?.weight),
      unitPrice: parseFloat(newRow?.unitPrice || 0),
      upo: parseFloat(newRow?.upo) ? parseFloat(newRow?.upo) : 0,
      qty: parseFloat(newRow?.qty),
      extendedPrice: parseFloat(newRow?.extendedPrice),
      mdAmount: mdAmount,
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
      taxDetails: formik.values.header?.isVattable ? newRow.taxDetails : null
    })

    let commonData = {
      ...newRow,
      id: newRow?.id,
      qty: itemPriceRow?.qty ? parseFloat(itemPriceRow?.qty).toFixed(2) : 0,
      volume: itemPriceRow?.volume ? parseFloat(itemPriceRow.volume).toFixed(2) : 0,
      weight: itemPriceRow?.weight ? parseFloat(itemPriceRow.weight).toFixed(2) : 0,
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

  async function getFilteredMU(itemId) {
    if (!itemId) return

    const currentItemId = formik.values.items?.find(item => parseInt(item.itemId) === itemId)?.msId

    const arrayMU = measurements?.filter(item => item.msId === currentItemId) || []
    filteredMeasurements.current = arrayMU
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

  const miscValue = formik.values.miscAmount == 0 ? 0 : parseFloat(formik.values.header.miscAmount) || 0

  const _footerSummary = getFooterTotals(parsedItemsArray, {
    totalQty: 0,
    totalWeight: 0,
    totalVolume: 0,
    totalUpo: 0,
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
  const subtotal = reCal ? subTotal.toFixed(2) : formik.values?.header.subtotal || 0
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
      if (item?.taxDetails?.length > 0) item.taxDetails = [item.taxDetails[0]]

      const vatCalcRow = getVatCalc({
        basePrice: parseFloat(item?.basePrice),
        qty: parseFloat(item?.qty),
        extendedPrice: parseFloat(item?.extendedPrice),
        baseLaborPrice: parseFloat(item?.baseLaborPrice),
        vatAmount: parseFloat(item?.vatAmount),
        tdPct: parseFloat(tdPct),
        taxDetails: formik.values.header?.isVattable ? item.taxDetails : null
      })
      formik.setFieldValue(`items[${index}].vatAmount`, parseFloat(vatCalcRow?.vatAmount).toFixed(2))
    })
  }

  async function recalcGridVat(typeChange, tdPct, tdAmount, currentDiscount) {
    const currentTdPct = checkDiscount(typeChange, tdPct, tdAmount, currentDiscount)
    recalcNewVat(currentTdPct)
  }

  function ShowMdAmountErrorMessage(actualDiscount, clientMaxDiscount, rowData, update) {
    if (actualDiscount > clientMaxDiscount) {
      formik.setFieldValue('header.mdAmount', clientMaxDiscount)
      rowData.mdAmount = clientMaxDiscount
      const data = getItemPriceRow(rowData, DIRTYFIELD_MDAMOUNT)
      update(data)
      stackError({
        message: labels.clientMaxPctDiscount + ' ' + clientMaxDiscount + '%'
      })
    }
  }

  function ShowMdValueErrorMessage(actualDiscountAmount, clientMaxDiscountValue, rowData, update) {
    if (actualDiscountAmount > clientMaxDiscountValue) {
      formik.setFieldValue('header.mdType', 2)
      formik.setFieldValue('header.mdAmount', clientMaxDiscountValue)
      rowData.mdType = 2
      rowData.mdAmount = clientMaxDiscountValue
      const data = getItemPriceRow(rowData, DIRTYFIELD_MDAMOUNT)
      update(data)
      stackError({
        message: labels.clientMaxDiscount + ' ' + clientMaxDiscountValue
      })
    }
  }

  function ShowMinPriceValueErrorMessage(minPrice, unitPrice) {
    if (parseFloat(minPrice) > 0 && parseFloat(unitPrice) < parseFloat(minPrice)) {
      stackError({
        message: `${labels.minPriceError}: ${minPrice}`
      })
    }
  }

  function checkMdAmountPct(rowData, update) {
    const maxClientAmountDiscount = rowData.unitPrice * (formik.values.header.maxDiscount / 100)
    if (!formik.values.header.maxDiscount) return
    if (rowData.mdType == MDTYPE_PCT) {
      if (rowData.mdAmount > formik.values.header.maxDiscount) {
        ShowMdValueErrorMessage(formik.values.header.maxDiscount, rowData, update)

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
    const saTrxpack = await getSalesTransactionPack(recordId)
    await fillForm(saTrxpack)
  }
  function setAddressValues(obj) {
    Object.entries(obj).forEach(([key, value]) => {
      formik.setFieldValue(`header.${key}`, value)
    })
  }

  function openAddressFilterForm() {
    stack({
      Component: AddressFilterForm,
      props: {
        maxAccess,
        labels,
        bill: true,
        form: formik.values.header,
        checkedAddressId: formik.values?.header?.billAddressId,
        handleAddressValues: setAddressValues
      },
      width: 950,
      height: 600,
      title: labels.AddressFilter
    })
  }

  function openAddressForm() {
    stack({
      Component: AddressFormShell,
      props: {
        address: address,
        setAddress: setAddress,
        isCleared: false,
        isSavedClear: false
      },
      width: 850,
      height: 620,
      title: labels.address
    })
  }

  useEffect(() => {
    let billAdd = ''
    const { name, street1, street2, city, phone, phone2, email1 } = address
    if (name || street1 || street2 || city || phone || phone2 || email1) {
      billAdd = `${name || ''}\n${street1 || ''}\n${street2 || ''}\n${city || ''}\n${phone || ''}\n${phone2 || ''}\n${
        email1 || ''
      }`
    }

    formik.setFieldValue('header.billAddress', billAdd)
    formik.setFieldValue('header.serializedAddress', billAdd)
  }, [address])

  function getDTD(dtId) {
    if (!dtId) return

    const res = getRequest({
      extension: SaleRepository.DocumentTypeDefault.get,
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
    formik.setFieldValue('header.plantId', dtd?.record?.plantId || userDefaultsDataState?.plantId || null)
    formik.setFieldValue('header.spId', dtd?.record?.spId || userDefaultsDataState?.spId || null)
    formik.setFieldValue('header.siteId', dtd?.record?.siteId || userDefaultsDataState?.siteId || null)
    formik.setFieldValue('header.commitItems', dtd?.record?.commitItems)
    fillMetalPrice()
    if (dtd?.record?.commitItems == false) formik.setFieldValue('header.siteId', null)
  }

  useEffect(() => {
    formik.setFieldValue('header.qty', parseFloat(totalQty).toFixed(2))
    formik.setFieldValue('header.weight', parseFloat(totalWeight).toFixed(2))
    formik.setFieldValue('header.volume', parseFloat(totalVolume).toFixed(2))
    formik.setFieldValue('header.amount', parseFloat(amount).toFixed(2))

    const updatedRateRow = getRate({
      amount: amount ?? 0,
      exRate: formik.values?.header?.exRate,
      baseAmount: 0,
      rateCalcMethod: formik.values?.header?.rateCalcMethod,
      dirtyField: DIRTYFIELD_RATE
    })

    formik.setFieldValue('header.baseAmount', parseFloat(updatedRateRow?.baseAmount).toFixed(2) || 0)
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
    if (formik.values?.header.dtId && !recordId) onChangeDtId(formik.values?.header.dtId)
  }, [formik.values?.header.dtId])

  useEffect(() => {
    ;(async function () {
      if (recordId && measurements) {
        const transactionPack = await getSalesTransactionPack(recordId)
        const dtInfo = await getDTD(transactionPack.header.dtId)
        await fillForm(transactionPack, dtInfo)
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
      return obj.key === 'plantId' || obj.key === 'siteId' || obj.key === 'spId'
    })
    filteredList.forEach(obj => (myObject[obj.key] = obj.value ? parseInt(obj.value) : null))
    setUserDefaultsDataState(myObject)

    return myObject
  }

  const setDefaultFields = () => {
    if (!editMode) formik.setFieldValue('header.currencyId', defaultsDataState?.currencyId || null)
    formik.setFieldValue('header.plantId', userDefaultsDataState?.plantId || null)
    formik.setFieldValue('header.spId', userDefaultsDataState?.spId || null)
    formik.setFieldValue('header.siteId', userDefaultsDataState?.siteId || null)
  }

  async function previewBtnClicked() {
    const data = { printStatus: 2, recordId: formik.values.header.recordId }

    await postRequest({
      extension: SaleRepository.FlagTR,
      record: JSON.stringify(data)
    })

    invalidate()
  }

  return (
    <FormShell
      resourceId={getResourceId(parseInt(functionId))}
      form={formik}
      functionId={functionId}
      maxAccess={maxAccess}
      previewReport={editMode}
      previewBtnClicked={previewBtnClicked}
      actions={actions}
      editMode={editMode}
      disabledSubmit={isPosted}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={9} container direction='column' gap={2}>
              <Grid container spacing={2}>
                <Grid item xs={3}>
                  <ResourceComboBox
                    endpointId={SystemRepository.DocumentType.qry}
                    parameters={`_startAt=0&_pageSize=1000&_dgId=${functionId}`}
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
                    onChange={async (_, newValue) => {
                      const recordId = newValue ? newValue.recordId : null
                      await formik.setFieldValue('header.dtId', recordId)
                      if (!newValue) {
                        formik.setFieldValue('header.dtId', null)
                        formik.setFieldValue('header.siteId', null)
                        formik.setFieldValue('header.metalPrice', 0)
                        formik.setFieldValue('header.KGmetalPrice', 0)
                        setmetalPriceVisibility(false)
                      }
                    }}
                    error={formik?.touched?.header?.dtId && Boolean(formik?.errors?.header?.dtId)}
                  />
                </Grid>
                <Grid item xs={3}>
                  <ResourceComboBox
                    endpointId={SaleRepository.SalesPerson.qry}
                    name='header.spId'
                    readOnly={isPosted}
                    label={labels.salesPerson}
                    columnsInDropDown={[
                      { key: 'spRef', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    valueField='recordId'
                    displayField='name'
                    values={formik.values.header}
                    maxAccess={maxAccess}
                    displayFieldWidth={1.5}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('header.spId', newValue ? newValue.recordId : null)
                    }}
                    error={formik?.touched?.header?.spId && Boolean(formik?.errors?.header?.spId)}
                  />
                </Grid>
                <Grid item xs={3}>
                  <CustomNumberField
                    name='header.creditLimit'
                    maxAccess={maxAccess}
                    label={labels.creditLimit}
                    value={formik.values.header.creditLimit}
                    readOnly
                  />
                </Grid>
                <Grid item xs={3}>
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
                    error={formik?.touched?.header?.plantId && Boolean(formik?.errors?.header?.plantId)}
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={3}>
                  <CustomTextField
                    name='header.reference'
                    label={labels.reference}
                    value={formik?.values?.header?.reference}
                    maxAccess={!editMode && maxAccess}
                    readOnly={editMode}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('header.reference', '')}
                    error={formik?.touched?.header?.reference && Boolean(formik?.errors?.header?.reference)}
                  />
                </Grid>
                <Grid item xs={3}>
                  <CustomDatePicker
                    name='header.date'
                    required
                    label={labels.date}
                    readOnly={isPosted}
                    value={formik?.values?.header?.date}
                    onChange={async (e, newValue) => {
                      formik.setFieldValue('header.date', newValue)
                      await getMultiCurrencyFormData(formik.values.header.currencyId, newValue, RateDivision.FINANCIALS)
                    }}
                    editMode={editMode}
                    maxAccess={maxAccess}
                    onClear={() => formik.setFieldValue('header.date', null)}
                    error={formik.touched?.header?.date && Boolean(formik.errors?.header?.date)}
                  />
                </Grid>
                <Grid item xs={3}>
                  <ResourceComboBox
                    endpointId={SaleRepository.SalesZone.qry}
                    parameters={`_startAt=0&_pageSize=1000&_sortField="recordId"&_filter=`}
                    name='header.szId'
                    label={labels.saleZone}
                    readOnly={isPosted}
                    columnsInDropDown={[{ key: 'name', value: 'Name' }]}
                    valueField='recordId'
                    displayField='name'
                    values={formik.values.header}
                    maxAccess={maxAccess}
                    displayFieldWidth={1.5}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('header.szId', newValue ? newValue.recordId : null)
                    }}
                    error={formik?.touched?.header?.szId && Boolean(formik?.errors?.header?.szId)}
                  />
                </Grid>
                <Grid item xs={3}>
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
                      formik.setFieldValue('header.siteId', newValue ? newValue.recordId : null)
                      formik.setFieldValue('header.siteRef', newValue ? newValue.reference : null)
                      formik.setFieldValue('header.siteName', newValue ? newValue.name : null)
                    }}
                    error={formik?.touched?.header?.siteId && Boolean(formik.errors?.header?.siteId)}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={3}>
              <CustomTextArea
                name='header.billAddress'
                label={labels.billTo}
                value={formik.values.header.billAddress}
                rows={3}
                maxLength='100'
                readOnly={!formik.values.header.clientId || isPosted}
                maxAccess={maxAccess}
                viewDropDown={formik.values.header.clientId}
                viewAdd={formik.values.header.clientId && !editMode}
                onChange={e => formik.setFieldValue('header.billAddress', e.target.value)}
                onClear={() => formik.setFieldValue('header.billAddress', '')}
                onDropDown={() => openAddressFilterForm()}
                handleAddAction={() => openAddressForm()}
                error={formik?.touched?.header?.billAddress && Boolean(formik?.errors?.header?.billAddress)}
              />
            </Grid>
            <Grid item xs={3}>
              <ResourceLookup
                endpointId={SaleRepository.Client.snapshot}
                name='header.clientId'
                label={labels.client}
                valueField='reference'
                displayField='name'
                valueShow='clientRef'
                secondValueShow='clientName'
                formObject={formik.values.header}
                form={formik}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' },
                  { key: 'szName', value: 'Sales Zone' },
                  { key: 'keywords', value: 'Keywords' },
                  { key: 'cgName', value: 'Client Group' }
                ]}
                onChange={(event, newValue) => {
                  fillClientData(newValue)
                }}
                secondField={{
                  name: 'header.clientName',
                  editable: true,
                  onChange: (name, value) => {
                    formik.setFieldValue('header.clientName', value)
                  }
                }}
                maxAccess={maxAccess}
                required
                autoSelectFistValue={!formik.values.clientId}
                readOnly={formik.values.items.length > 0 && formik.values.items[0].sku}
                displayFieldWidth={3}
                editMode={editMode}
                error={formik.touched?.header?.clientId && Boolean(formik.errors?.header?.clientId)}
              />
            </Grid>
            <Grid item xs={1}>
              <CustomCheckBox
                name='header.isVattable'
                value={formik.values?.header?.isVattable}
                onChange={event => formik.setFieldValue('header.isVattable', event.target.checked)}
                label={labels.VAT}
                maxAccess={maxAccess}
                disabled={formik?.values?.items && formik?.values?.items[0]?.itemId}
              />
            </Grid>
            <Grid item xs={2}>
              <ResourceComboBox
                endpointId={FinancialRepository.TaxSchedules.qry}
                name='header.taxId'
                label={labels.tax}
                valueField='recordId'
                displayField={['name']}
                readOnly
                values={formik.values.header}
                error={formik?.touched?.header?.taxId && Boolean(formik?.errors?.header?.taxId)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={2}>
              <Grid container spacing={1} alignItems='center'>
                <Grid item xs={8}>
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
                    onChange={async (event, newValue) => {
                      await getMultiCurrencyFormData(
                        newValue?.recordId,
                        formik.values.header?.date,
                        RateDivision.FINANCIALS
                      )
                      formik.setFieldValue('header.currencyId', newValue?.recordId || null)
                      formik.setFieldValue('header.currencyName', newValue?.name)
                    }}
                    error={formik.touched?.header?.currencyId && Boolean(formik.errors?.header?.currencyId)}
                  />
                </Grid>
                <Grid item xs={4}>
                  <Button
                    variant='contained'
                    size='small'
                    onClick={() => openMCRForm(formik.values.header)}
                    disabled={formik.values.header.currencyId === defaultsDataState?.currencyId}
                  >
                    <img src='/images/buttonsIcons/popup.png' alt={platformLabels.add} />
                  </Button>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={2}>
              <ResourceComboBox
                endpointId={formik?.values?.header?.clientId && SaleRepository.Contact.qry}
                parameters={`_clientId=${formik?.values?.header?.clientId}`}
                name='header.contactId'
                label={labels.contact}
                valueField='recordId'
                readOnly={isPosted}
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values.header}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('header.contactId', newValue?.recordId || null)
                }}
                error={formik?.touched?.header?.contactId && Boolean(formik?.errors?.header?.contactId)}
              />
            </Grid>
            <Grid item xs={2}>
              {metalPriceVisibility && (
                <CustomNumberField
                  name='header.KGmetalPrice'
                  label={labels.metalPrice}
                  value={formik.values.header.KGmetalPrice}
                  maxAccess={maxAccess}
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
              itemsUpdate.current = value
              action === 'delete' && setReCal(true)
            }}
            value={formik?.values?.items}
            error={formik.errors.items}
            initialValues={formik?.initialValues?.items[0]}
            onSelectionChange={(row, update, field) => {
              if (field == 'muRef') getFilteredMU(row?.itemId)
            }}
            name='items'
            columns={columns}
            maxAccess={maxAccess}
            allowDelete={!isPosted}
            disabled={isPosted || !formik.values.header.clientId || !formik.values.header.currencyId}
          />
        </Grow>
        <Fixed>
          <Grid container spacing={2} sx={{ pt: 2 }}>
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
                error={formik?.touched?.header?.description && Boolean(formik?.errors?.header?.description)}
              />
            </Grid>
            <Grid item xs={3}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='header.qty'
                    maxAccess={maxAccess}
                    label={labels.totQty}
                    value={totalQty}
                    readOnly
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='header.volume'
                    maxAccess={maxAccess}
                    label={labels.totVolume}
                    value={totalVolume}
                    readOnly
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='header.weight'
                    maxAccess={maxAccess}
                    label={labels.totWeight}
                    value={totalWeight}
                    readOnly
                  />
                </Grid>
                <Grid item>
                  <CustomNumberField
                    name='header.balance'
                    maxAccess={maxAccess}
                    label={labels.balance}
                    value={formik.values.header.balance}
                    readOnly
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={3}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='header.subTotal'
                    maxAccess={maxAccess}
                    label={labels.subtotal}
                    value={subtotal}
                    readOnly
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='header.discount'
                    maxAccess={maxAccess}
                    label={labels.discount}
                    value={formik.values.header.currentDiscount}
                    displayCycleButton={true}
                    cycleButtonLabel={cycleButtonState.text}
                    decimalScale={2}
                    readOnly={isPosted}
                    handleButtonClick={handleButtonClick}
                    iconKey={cycleButtonState.text}
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
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='header.miscAmount'
                    maxAccess={maxAccess}
                    label={labels.misc}
                    value={formik.values.header.miscAmount}
                    decimalScale={2}
                    readOnly={isPosted}
                    onChange={e => {
                      formik.setFieldValue('header.miscAmount', e.target.value)

                      const updatedRateRow = getRate({
                        amount: e.target.value ?? 0,
                        exRate: formik.values?.exRate,
                        baseAmount: 0,
                        rateCalcMethod: formik.values?.rateCalcMethod,
                        dirtyField: DIRTYFIELD_RATE
                      })
                      formik.setFieldValue('header.baseAmount', parseFloat(updatedRateRow?.baseAmount).toFixed(2) || 0)
                    }}
                    onBlur={async () => {
                      setReCal(true)
                    }}
                    onClear={() => formik.setFieldValue('header.miscAmount', 0)}
                    error={formik?.touched?.header?.miscAmount && Boolean(formik?.errors?.header?.miscAmount)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='header.vatAmount'
                    maxAccess={maxAccess}
                    label={labels.VAT}
                    value={vatAmount}
                    readOnly
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='header.amount'
                    maxAccess={maxAccess}
                    label={labels.net}
                    value={amount}
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
