import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { formatDateForGetApI, formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import { Grid, Button } from '@mui/material'
import { useContext, useEffect, useRef, useState } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
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
import { useForm } from 'src/hooks/form'
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
import { getFooterTotals, getSubtotal } from 'src/utils/FooterCalculator'
import { useError } from 'src/error'
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'
import { PointofSaleRepository } from 'src/repositories/PointofSaleRepository'
import { AddressFormShell } from 'src/components/Shared/AddressFormShell'
import { SystemChecks } from 'src/resources/SystemChecks'
import { CashBankRepository } from 'src/repositories/CashBankRepository'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import { FinancialRepository } from 'src/repositories/FinancialRepository'
import { MultiCurrencyRepository } from 'src/repositories/MultiCurrencyRepository'
import { RateDivision } from 'src/resources/RateDivision'
import CustomCheckBox from 'src/components/Inputs/CustomCheckBox'

export default function RetailTransactionsForm({ labels, posUser, access, recordId, functionId, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack: stackError } = useError()
  const { stack } = useWindow()
  const { platformLabels, defaultsData } = useContext(ControlContext)
  const [address, setAddress] = useState({})
  const [reCal, setReCal] = useState(false)
  const [cashGridData, setCashGridData] = useState({ cashAccounts: [], creditCards: [], creditCardFees: [] })
  const [addressModified, setAddressModified] = useState(false)
  const filteredCreditCard = useRef([])

  const getEndpoint = {
    [SystemFunction.RetailInvoice]: PointofSaleRepository.RetailInvoice.set2,
    [SystemFunction.RetailReturn]: PointofSaleRepository.RetailReturn.set2,
    [SystemFunction.RetailPurchase]: PointofSaleRepository.RetailPurchase.set2
  }

  const getResourceId = {
    [SystemFunction.RetailInvoice]: ResourceIds.RetailInvoice,
    [SystemFunction.RetailReturn]: ResourceIds.RetailInvoiceReturn,
    [SystemFunction.RetailPurchase]: ResourceIds.RetailPurchase
  }

  const { documentType, maxAccess } = useDocumentType({
    functionId: functionId,
    access: access,
    enabled: !recordId
  })

  const initialValues = {
    recordId: recordId || null,
    singleCashPos: false,
    defaultMCbaseCU: null,
    header: {
      recordId: recordId || null,
      date: new Date(),
      reference: null,
      dtId: documentType?.dtId,
      functionId: functionId,
      posId: parseInt(posUser?.posId),
      currencyId: null,
      plantId: null,
      siteId: null,
      spId: parseInt(posUser?.spId),
      addressId: null,
      oDocId: null,
      subtotal: 0,
      vatAmount: 0,
      amount: 0,
      baseAmount: 0,
      metalPrice: 0,
      KGmetalPrice: 0,
      plId: null,
      taxId: null,
      isVatable: false,
      deliveryNotes: '',
      name: '',
      street1: null,
      street2: null,
      countryId: null,
      cityId: null,
      phone: null,
      city: null,
      defPriceType: null,
      posFlags: false,
      priceType: null,
      clientName: '',
      status: 1
    },
    items: [
      {
        id: 1,
        invoiceId: recordId || 0,
        seqNo: 0,
        itemId: 0,
        barcode: null,
        sku: null,
        itemName: null,
        priceType: null,
        qty: 0,
        weight: 0,
        volume: 0,
        basePrice: 0,
        baseLaborPrice: 0,
        totPricePerG: 0,
        unitPrice: 0,
        priceWithVAT: 0,
        vatPct: 0,
        vatAmount: 0,
        extendedPrice: 0,
        isMetal: false,
        metalId: null,
        metalPurity: null,
        mdType: MDTYPE_PCT,
        mdAmountPct: null,
        mdValue: 0,
        mdAmount: 0,
        metalRef: null,
        notes: null,
        posFlags: null,
        taxId: null,
        taxId_base: null,
        taxId_amount: null
      }
    ],
    cash: [
      {
        id: 1,
        invoiceId: recordId || 0,
        seqNo: null,
        cashAccountId: null,
        cashAccountRef: null,
        type: 0,
        typeName: null,
        amount: 0,
        bankFees: 0,
        receiptRef: null,
        ccId: '',
        ccRef: ''
      }
    ]
  }

  const invalidate = useInvalidate({
    endpointId: PointofSaleRepository.RetailInvoice.qry
  })

  const { formik } = useForm({
    maxAccess,
    initialValues,
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      header: yup.object({
        date: yup.string().required(),
        dtId: yup.string().required(),
        spId: yup.string().required(),
        name: yup.string().test('Name-Required', 'Name is required when street1 or street2 has a value', function () {
          const { street1, street2, name, phone, cityId } = this.parent

          return !(street1 || street2 || cityId || phone) ? true : Boolean(name)
        }),
        cityId: yup.string().test('City-Required', 'City is required when street1 or street2 has a value', function () {
          const { street1, street2, phone, cityId } = this.parent

          if (street1 || street2 || phone) {
            return cityId ? true : this.createError({ message: 'City is required' })
          }

          return true
        }),
        street1: yup.string().test('Street1-Required', 'Street1 is required when street2 has a value', function () {
          const { street1, street2, phone, cityId } = this.parent

          return !(street2 || phone || cityId) ? true : Boolean(street1)
        })
      }),
      items: yup.array().of(
        yup.object({
          sku: yup.string().required(),
          itemName: yup.string().required(),
          qty: yup.number().required().min(1),
          barcode: yup.string().required()
        })
      ),
      cash: yup.array().of(
        yup.object({
          ccRef: yup.string().test('Credit-Card', 'Credit Card is required', function () {
            const { type, ccId } = this.parent

            return type !== 1 || Boolean(ccId)
          })
        })
      )
    }),
    onSubmit: async obj => {
      let modifiedAddress = address || { recordId: '' }
      if ((obj.header.recordId && addressModified) || !obj.header.recordId) {
        modifiedAddress.recordId = ''
      }
      if (modifiedAddress.name && modifiedAddress.street1 && modifiedAddress.cityId) {
        const res = await postRequest({
          extension: SystemRepository.Address.set,
          record: JSON.stringify(modifiedAddress)
        })

        obj.header.addressId = res?.recordId
      }

      const mapWithSeqNo = rows => rows.map((row, index) => ({ ...row, seqNo: index + 1 }))
      if (obj.header.name) obj.header.clientName = obj.header.name

      const payload = {
        header: {
          ...obj.header,
          date: formatDateToApi(obj.header?.date)
        },
        items: mapWithSeqNo(obj.items),
        cash: mapWithSeqNo(obj.cash)
      }

      const retailRes = await setRetail(getEndpoint[functionId], payload)
      const actionMessage = editMode ? platformLabels.Edited : platformLabels.Added
      toast.success(actionMessage)
      await refetchForm(retailRes?.recordId)
      invalidate()
    }
  })
  async function setRetail(endPoint, payload) {
    return await postRequest({
      extension: endPoint,
      record: JSON.stringify(payload)
    })
  }

  const isPosted = formik.values.header.status === 3
  const editMode = !!formik.values.header.recordId

  async function getTaxDetails(taxId) {
    if (!taxId) return

    const res = await getRequest({
      extension: FinancialRepository.TaxDetailPack.qry,
      parameters: `_taxId=${taxId}`
    })

    return res?.list
  }

  async function barcodeSkuSelection(update, row, setItemInfo) {
    const itemRetail = await getItemRetail(row?.itemId)
    const itemPhysical = await getItemPhysical(row?.itemId)
    const itemConvertPrice = await getItemConvertPrice(row?.itemId)
    const basePrice = ((formik.values.header.KGmetalPrice || 0) * (itemPhysical?.metalPurity || 0)) / 1000
    const TotPricePerG = (basePrice || 0) + (itemConvertPrice?.baseLaborPrice || 0)
    const taxDetailsInfo = await getTaxDetails(row?.taxId)

    const result = {
      id: row?.id,
      itemId: row?.itemId,
      sku: row?.sku,
      itemName: row?.itemName,
      posFlags: itemRetail?.posFlags,
      metalPurity: itemPhysical?.metalPurity || 0,
      isMetal: itemPhysical?.isMetal || false,
      metalId: itemPhysical?.metalId || null,
      weight: itemPhysical?.weight || 0,
      volume: itemPhysical?.volume || 0,
      basePrice: basePrice || 0,
      TotPricePerG: TotPricePerG || 0,
      priceType: itemConvertPrice?.priceType,
      unitPrice:
        itemConvertPrice?.priceType == 3
          ? (itemPhysical?.weight || 0) * (TotPricePerG || 0)
          : itemConvertPrice?.unitPrice,
      qty: row?.qty || 1,
      extendedPrice: 0,
      mdAmount: 0,
      mdValue: 0,
      taxId: row?.taxId || formik.values.header.taxId,
      taxDetails: taxDetailsInfo || null
    }
    update(result)
    const result2 = await getItemPriceRow(update, result, DIRTYFIELD_UNIT_PRICE)
    if (row?.qty > 0) await getItemPriceRow(update, result2, DIRTYFIELD_QTY)
  }

  async function getItemRetail(itemId) {
    const res = await getRequest({
      extension: InventoryRepository.ItemRetail.get,
      parameters: `_itemId=${itemId}`
    })

    return res?.record
  }
  async function getItemPhysical(itemId) {
    const res = await getRequest({
      extension: InventoryRepository.Physical.get,
      parameters: `_itemId=${itemId}`
    })

    return res?.record
  }

  async function getItemConvertPrice(itemId) {
    const res = await getRequest({
      extension: SaleRepository.ItemConvertPrice.get,
      parameters: `_clientId=0&_itemId=${itemId}&_currencyId=${formik.values.header.currencyId}&_plId=${
        formik.values.header.plId
      }&_muId=${0}`
    })

    return res?.record
  }
  function calculateBankFees(ccId) {
    if (!ccId || !amount) return
    const arrayCC = cashGridData?.creditCardFees?.filter(({ creditCardId }) => parseInt(creditCardId) === ccId) ?? []
    if (arrayCC.length === 0) return
    const feeTier = arrayCC.find(({ upToAmount }) => upToAmount >= amount)
    if (!feeTier) return
    const { isPct, commissionFees } = feeTier

    return isPct ? (amount * commissionFees) / 100 : commissionFees
  }

  async function handleIconClick(id, updateRow) {
    const index = formik.values.items.findIndex(item => item.id === id)

    if (index === -1) return

    let currentMdType
    let currentMdAmount = parseFloat(formik.values.items[index].mdAmount)
    const maxClientAmountDiscount = formik.values.items[index].unitPrice * (formik.values?.header.maxDiscount / 100)

    if (formik.values.items[index].mdType === 2) {
      if (currentMdAmount < 0 || currentMdAmount > 100) currentMdAmount = 0

      formik.setFieldValue(`items[${index}].mdAmountPct`, 1)
      formik.setFieldValue(`items[${index}].mdType`, 1)
      currentMdType = 1
      formik.setFieldValue(`items[${index}].mdAmount`, parseFloat(currentMdAmount).toFixed(2))
    } else {
      if (currentMdAmount < 0 || currentMdAmount > maxClientAmountDiscount) currentMdAmount = 0

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

    await getItemPriceRow(updateRow, newRow, DIRTYFIELD_MDTYPE, true)
  }

  const onPost = async () => {
    await postRequest({
      extension: PointofSaleRepository.RetailInvoice.post,
      record: JSON.stringify(formik.values.header)
    })

    toast.success(platformLabels.Posted)
    invalidate()
    window.close()
  }

  const onUnpost = async () => {
    const res = await postRequest({
      extension: PointofSaleRepository.RetailInvoice.unpost,
      record: JSON.stringify(formik.values.header)
    })

    toast.success(platformLabels.Posted)
    invalidate()
    refetchForm(res?.recordId)
  }

  const actions = [
    {
      key: 'RecordRemarks',
      condition: true,
      onClick: 'onRecordRemarks',
      disabled: !editMode
    },
    {
      key: 'IV',
      condition: true,
      onClick: 'onInventoryTransaction',
      disabled: !editMode || !isPosted
    },
    {
      key: 'SA Trx',
      condition: true,
      onClick: 'onClickSATRX',
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
    }
  ]

  async function fillForm(retailTrxPack) {
    const retailTrxHeader = retailTrxPack?.header
    const retailTrxItems = retailTrxPack?.items
    const retailTrxCash = retailTrxPack?.cash
    const addressObj = await getAddress(retailTrxHeader?.addressId)

    const modifiedItemsList = await Promise.all(
      retailTrxItems?.map(async (item, index) => {
        const taxDetails = await getTaxDetails(item?.taxId)

        return {
          ...item,
          id: index + 1,
          qty: parseFloat(item.qty).toFixed(2),
          unitPrice: parseFloat(item.unitPrice).toFixed(2),
          extendedPrice: parseFloat(item.extendedPrice).toFixed(2),
          taxDetails
        }
      })
    )

    const modifiedCashList = await Promise.all(
      retailTrxCash?.map(async (item, index) => {
        return {
          ...item,
          id: index + 1,
          amount: parseFloat(item.amount).toFixed(2),
          ccRef: item?.ccRef || ''
        }
      })
    )
    const countryId = defaultsData?.list?.find(({ key }) => key === 'countryId')

    formik.setValues({
      recordId: retailTrxHeader.recordId || null,
      header: {
        ...retailTrxHeader,
        countryId: retailTrxHeader?.countryId || countryId?.value,
        name: addressObj?.record?.name || retailTrxHeader?.clientName,
        street1: addressObj?.record?.street1,
        street2: addressObj?.record?.street2,
        phone: addressObj?.record?.phone,
        cityId: addressObj?.record?.cityId
      },
      items: modifiedItemsList,
      cash: modifiedCashList
    })

    setAddress({
      ...(addressObj?.record || {}),
      countryId: addressObj?.countryId || countryId?.value
    })
  }

  async function getRetailTransactionPack(transactionId) {
    const res = await getRequest({
      extension: PointofSaleRepository.RetailInvoice.get2,
      parameters: `_recordId=${transactionId}`
    })
    res.record.header.date = formatDateFromApi(res?.record?.header?.date)

    return res.record
  }

  async function getAddress(addressId) {
    if (!addressId) return null

    return await getRequest({
      extension: SystemRepository.Address.get,
      parameters: `_recordId=${addressId}`
    })
  }

  async function getItemPriceRow(update, newRow, dirtyField, iconClicked) {
    !reCal && setReCal(true)

    const itemPriceRow = getIPR({
      priceType: newRow?.priceType,
      basePrice: parseFloat(newRow?.basePrice || 0),
      volume: parseFloat(newRow?.volume),
      weight: parseFloat(newRow?.weight),
      unitPrice: parseFloat(newRow?.unitPrice || 0),
      upo: 0,
      qty: parseFloat(newRow?.qty) || 0,
      extendedPrice: parseFloat(newRow?.extendedPrice),
      mdAmount: parseFloat(newRow?.mdAmount) || 0,
      mdType: newRow?.mdType || 1,
      baseLaborPrice: newRow?.baseLaborPrice || 0,
      totalWeightPerG: newRow?.TotPricePerG,
      mdValue: parseFloat(newRow?.mdValue),
      tdPct: 0,
      dirtyField: dirtyField
    })
    if (newRow?.taxDetails?.length > 0) newRow.taxDetails = [newRow.taxDetails[0]]

    const vatCalcRow = getVatCalc({
      basePrice: itemPriceRow?.basePrice,
      qty: parseFloat(itemPriceRow?.qty),
      extendedPrice: parseFloat(itemPriceRow?.extendedPrice),
      baseLaborPrice: itemPriceRow?.baseLaborPrice,
      vatAmount: parseFloat(itemPriceRow?.vatAmount) || 0,
      tdPct: 0,
      taxDetails: formik.values.header.isVatable ? newRow.taxDetails : null
    })

    let commonData = {
      id: newRow?.id,
      qty: parseFloat(itemPriceRow?.qty).toFixed(2),
      volume: parseFloat(itemPriceRow?.volume).toFixed(2),
      weight: parseFloat(itemPriceRow?.weight).toFixed(2),
      basePrice: parseFloat(itemPriceRow?.basePrice).toFixed(5),
      unitPrice: parseFloat(itemPriceRow?.unitPrice).toFixed(3),
      extendedPrice: parseFloat(itemPriceRow?.extendedPrice).toFixed(2),
      mdValue: itemPriceRow?.mdValue,
      mdType: itemPriceRow?.mdType,
      mdAmount: parseFloat(itemPriceRow?.mdAmount).toFixed(2),
      vatAmount: parseFloat(vatCalcRow?.vatAmount).toFixed(2),
      taxDetails: formik.values.header.isVatable ? newRow.taxDetails : null
    }
    let data = iconClicked ? { changes: commonData } : commonData

    update(data)

    return commonData
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

  const subTotal = reCal ? getSubtotal(parsedItemsArray) : formik.values?.header?.subtotal || 0

  const _footerSummary = getFooterTotals(parsedItemsArray, {
    totalQty: 0,
    totalWeight: 0,
    totalVolume: 0,
    totalUpo: 0,
    sumVat: 0,
    sumExtended: parseFloat(subTotal),
    tdAmount: 0,
    net: 0,
    miscAmount: 0
  })

  const totalQty = _footerSummary?.totalQty?.toFixed(2) || 0
  const amount = reCal ? _footerSummary?.net?.toFixed(2) : parseFloat(formik.values?.header?.amount).toFixed(2) || 0

  const totalWeight = reCal
    ? formik.values.items.reduce((curSum, row) => {
        const curValue = parseFloat(row.weight?.toString().replace(/,/g, '')) || 0
        const result = curSum + curValue

        return (parseFloat(result) || 0).toFixed(2)
      }, 0)
    : parseFloat(formik.values?.header?.weight || 0).toFixed(2)

  const subtotal = reCal ? subTotal?.toFixed(2) : parseFloat(formik.values?.header?.subtotal).toFixed(2) || 0

  const vatAmount = reCal
    ? _footerSummary?.sumVat.toFixed(2)
    : parseFloat(formik.values?.header.vatAmount).toFixed(2) || 0

  const cashAmount = formik.values.cash.reduce((curSum, row) => {
    const curValue = parseFloat(row.amount?.toString().replace(/,/g, '')) || 0

    return curSum + curValue
  }, 0)
  const totBalance = (parseFloat(subtotal) + parseFloat(vatAmount) - parseFloat(cashAmount)).toFixed(2)

  const columns = [
    {
      component: 'textfield',
      label: labels.barcode,
      name: 'barcode',
      updateOn: 'blur',
      async onChange({ row: { update, newRow } }) {
        if (!newRow?.barcode) return
        await barcodeSkuSelection(update, newRow, true)
      }
    },
    {
      component: 'resourcelookup',
      label: labels.sku,
      name: 'sku',
      flex: 2,
      props: {
        endpointId: PointofSaleRepository.PUItems.snapshot,
        parameters: {
          _siteId: totalQty > 0 || SystemFunction.RetailInvoice === functionId ? 0 : formik.values?.header?.siteId || 0
        },
        displayField: 'sku',
        valueField: 'recordId',
        mapping: [
          { from: 'itemId', to: 'itemId' },
          { from: 'sku', to: 'sku' },
          { from: 'itemName', to: 'itemName' },
          { from: 'taxId', to: 'taxId' }
        ],
        columnsInDropDown: [
          { key: 'sku', value: 'SKU' },
          { key: 'itemName', value: 'Item Name' }
        ],
        displayFieldWidth: 3
      },
      async onChange({ row: { update, newRow } }) {
        if (!newRow.itemId) return
        await barcodeSkuSelection(update, newRow, false)
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
      updateOn: 'blur',
      async onChange({ row: { update, newRow } }) {
        await getItemPriceRow(update, newRow, DIRTYFIELD_QTY)
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
      label: labels.basePrice,
      name: 'basePrice',
      updateOn: 'blur',
      async onChange({ row: { update, newRow } }) {
        await getItemPriceRow(update, newRow, DIRTYFIELD_BASE_PRICE)
      }
    },
    {
      component: 'numberfield',
      label: labels.baseLaborPrice,
      name: 'baseLaborPrice',
      updateOn: 'blur',
      async onChange({ row: { update, newRow } }) {
        await getItemPriceRow(update, newRow, DIRTYFIELD_BASE_LABOR_PRICE)
      }
    },
    {
      component: 'numberfield',
      label: labels.totalPricePerG,
      name: 'totPricePerG',
      updateOn: 'blur',
      async onChange({ row: { update, newRow } }) {
        await getItemPriceRow(update, newRow, DIRTYFIELD_TWPG)
      }
    },
    {
      component: 'numberfield',
      label: labels.unitPrice,
      name: 'unitPrice',
      updateOn: 'blur',
      async onChange({ row: { update, oldRow, newRow } }) {
        await getItemPriceRow(update, newRow, DIRTYFIELD_UNIT_PRICE)
      }
    },
    {
      component: 'numberfield',
      label: labels.priceWithVat,
      name: 'priceWithVAT'
    },
    {
      component: 'numberfield',
      label: labels.vat,
      name: 'vatAmount',
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.tax,
      name: 'taxDetails'
    },
    {
      component: 'textfield',
      label: labels.markdown,
      name: 'mdAmount',
      updateOn: 'blur',
      flex: 2,
      props: {
        ShowDiscountIcons: true,
        iconsClicked: (id, updateRow) => handleIconClick(id, updateRow),
        gridData: formik.values.items,
        type: 'numeric',
        concatenateWith: '%'
      },
      async onChange({ row: { update, newRow } }) {
        await getItemPriceRow(update, newRow, DIRTYFIELD_MDAMOUNT)
      }
    },
    {
      component: 'numberfield',
      label: labels.extendedPrice,
      name: 'extendedPrice',
      updateOn: 'blur',
      async onChange({ row: { update, newRow } }) {
        await getItemPriceRow(update, newRow, DIRTYFIELD_EXTENDED_PRICE)
      }
    },
    {
      component: 'textfield',
      label: labels.notes,
      name: 'notes'
    }
  ]

  const cashColumns = [
    {
      component: 'resourcecombobox',
      label: labels.cashbox,
      name: 'cashAccountId',
      props: {
        endpointId: PointofSaleRepository.CashAccount.qry,
        parameters: `_posId=${parseInt(posUser?.posId)}`,
        displayField: 'cashAccountRef',
        valueField: 'cashAccountId',
        mapping: [
          { from: 'cashAccountId', to: 'cashAccountId' },
          { from: 'cashAccountRef', to: 'cashAccountRef' },
          { from: 'type', to: 'type' },
          { from: 'ccId', to: 'ccId' }
        ],
        columnsInDropDown: [
          { key: 'cashAccountRef', value: 'Reference' },
          { key: 'cashAccountName', value: 'Name' }
        ],
        displayFieldWidth: 3
      },
      async onChange({ row: { update, newRow } }) {
        if (cashAmount == 0) update({ amount: (Number(amount) || 0).toFixed(2) })
        getFilteredCC(newRow?.cashAccountId)
        if (newRow?.type == 1) {
          update({ bankFees: calculateBankFees(newRow?.ccId) || 0 })
        }
      }
    },
    {
      component: 'numberfield',
      label: labels.amount,
      name: 'amount'
    },
    {
      component: 'resourcecombobox',
      label: labels.creditCard,
      name: 'ccRef',
      props: {
        store: filteredCreditCard?.current,
        displayField: 'reference',
        valueField: 'recordId',
        mapping: [
          { from: 'reference', to: 'ccRef' },
          { from: 'name', to: 'ccName' },
          { from: 'recordId', to: 'ccId' }
        ]
      },
      async onChange({ row: { update, newRow } }) {
        if (newRow?.recordId) {
          update({ bankFees: calculateBankFees(newRow?.recordId) || 0 })
        }
      },
      propsReducer({ row, props }) {
        return { ...props, store: filteredCreditCard.current, readOnly: row.type == 2 }
      }
    },
    {
      component: 'numberfield',
      label: labels.bankFees,
      name: 'bankFees',
      props: { readOnly: true }
    },
    {
      component: 'textfield',
      label: labels.reference,
      name: 'receiptRef'
    }
  ]

  async function refetchForm(recordId) {
    const retailTrxPack = await getRetailTransactionPack(recordId)
    await fillForm(retailTrxPack)
  }

  async function setMetalPriceOperations() {
    const defaultMCbaseCU = defaultsData?.list?.find(({ key }) => key === 'baseMetalCuId')
    const defaultRateType = defaultsData?.list?.find(({ key }) => key === 'mc_defaultRTSA')
    formik.setFieldValue('baseMetalCuId', parseInt(defaultMCbaseCU?.value))
    if (!defaultRateType.value) {
      stackError({
        message: labels.RTSANoteDefined
      })

      return
    }
    const kgMetalPriceValue = await fillMetalPrice(defaultMCbaseCU?.value)
    formik.setFieldValue('header.KGmetalPrice', kgMetalPriceValue || 0)
    formik.setFieldValue('header.metalPrice', kgMetalPriceValue ? kgMetalPriceValue / 1000 : 0)
  }

  async function fillMetalPrice(baseMetalCuId) {
    if (!baseMetalCuId) return

    const res = await getRequest({
      extension: MultiCurrencyRepository.Currency.get,
      parameters: `_currencyId=${baseMetalCuId}&_date=${formatDateForGetApI(formik.values.header.date)}&_rateDivision=${
        RateDivision.SALES
      }`
    })

    return res.record.exRate * 1000
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

  async function getPosInfo() {
    if (!posUser?.posId) return

    return await getRequest({
      extension: PointofSaleRepository.PointOfSales.get,
      parameters: `_recordId=${parseInt(posUser?.posId)}`
    })
  }

  async function checkSingleCashPos() {
    return await getRequest({
      extension: SystemRepository.SystemChecks.get,
      parameters: `_checkId=${SystemChecks.SINGLE_CASH_POS}&_scopeId=1&_masterId=0`
    })
  }

  async function setDefaults(posInfo) {
    let isVat = false
    let tax = null
    let taxRef = null
    switch (parseInt(functionId)) {
      case SystemFunction.RetailInvoice:
        isVat = posInfo?.applyTaxIVC || false
        tax = posInfo?.applyTaxIVC ? posInfo?.taxId : null
        taxRef = posInfo?.applyTaxIVC ? posInfo?.taxRef : null
        break
      case SystemFunction.RetailReturn:
        isVat = posInfo?.applyTaxRET || false
        tax = posInfo?.applyTaxRET ? posInfo?.taxId : null
        taxRef = posInfo?.applyTaxRET ? posInfo?.taxRef : null
        break
      case SystemFunction.RetailPurchase:
        isVat = posInfo?.applyTaxPUR || false
        tax = posInfo?.applyTaxPUR ? posInfo?.taxId : null
        taxRef = posInfo?.applyTaxPUR ? posInfo?.taxRef : null
        break
      default:
        break
    }

    const hasSingleCashPos = checkSingleCashPos?.record?.value
    const countryId = defaultsData?.list?.find(({ key }) => key === 'countryId')
    formik.setFieldValue('singleCashPos', hasSingleCashPos)
    formik.setFieldValue('header.isVatable', isVat)
    formik.setFieldValue('header.taxId', tax)
    formik.setFieldValue('header.taxRef', taxRef)
    formik.setFieldValue('header.currencyId', posInfo?.currencyId)
    formik.setFieldValue('header.currencyName', posInfo?.currencyName)
    formik.setFieldValue('header.plantId', posInfo?.plantId)
    formik.setFieldValue('header.plantName', posInfo?.plantName)
    formik.setFieldValue('header.siteId', posInfo?.siteId)
    formik.setFieldValue('header.siteName', posInfo?.siteName)
    formik.setFieldValue('header.posRef', posInfo?.reference)
    formik.setFieldValue('header.plId', posInfo?.plId)
    formik.setFieldValue('header.dtId', formik.values.header.dtId || posInfo?.dtId)
    formik.setFieldValue('header.countryId', countryId?.value)
    setAddress(prevAddress => ({
      ...prevAddress,
      countryId: countryId?.value
    }))
  }
  async function fillCashObjects() {
    const cashAccounts = await getAllCashBanks()
    const creditCards = await fillCreditCardStore()
    const creditCardFees = await getCreditCardFees()
    setCashGridData({
      cashAccounts: cashAccounts,
      creditCards: creditCards,
      creditCardFees: creditCardFees
    })
  }

  async function getAllCashBanks() {
    const res = await getRequest({
      extension: CashBankRepository.CashAccount.qry,
      parameters: `_type=1`
    })

    return res?.list || []
  }

  async function fillCreditCardStore() {
    const res = await getRequest({
      extension: CashBankRepository.CreditCard.qry,
      parameters: `_filter=`
    })

    return res?.list || []
  }

  async function getCreditCardFees() {
    const response = await getRequest({
      extension: CashBankRepository.CreditCardFees.qry,
      parameters: `_creditCardId=0&_filter=`
    })

    return response?.list?.sort((a, b) => a.upToAmount - b.upToAmount) || []
  }

  async function getFilteredCC(cashAccountId) {
    if (!cashAccountId) return

    const currentBankId = cashGridData?.cashAccounts?.find(
      account => parseInt(account.recordId) === cashAccountId
    )?.bankId

    const arrayCC = cashGridData?.creditCards?.filter(card => card.bankId == currentBankId) || []
    filteredCreditCard.current = arrayCC
  }

  useEffect(() => {
    formik.setFieldValue('header.name', address?.name || '')
    formik.setFieldValue('header.street1', address?.street1 || '')
    formik.setFieldValue('header.street2', address?.street2 || '')
    formik.setFieldValue('header.cityId', address?.cityId || '')
    formik.setFieldValue('header.city', address?.city || '')
    formik.setFieldValue('header.phone', address?.phone || '')
  }, [address])

  useEffect(() => {
    formik.setFieldValue('header.qty', parseFloat(totalQty).toFixed(2))
    formik.setFieldValue('header.weight', parseFloat(totalWeight).toFixed(2))
    formik.setFieldValue('header.amount', parseFloat(amount).toFixed(2))
    formik.setFieldValue('header.baseAmount', parseFloat(amount).toFixed(2))
    formik.setFieldValue('header.subtotal', parseFloat(subtotal).toFixed(2))
    formik.setFieldValue('header.vatAmount', parseFloat(vatAmount).toFixed(2))
  }, [totalQty, amount, totalWeight, subtotal, vatAmount])

  useEffect(() => {
    if (documentType?.dtId) {
      formik.setFieldValue('header.dtId', documentType.dtId)
    }
  }, [documentType?.dtId])

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        await refetchForm(recordId)
      } else {
        await setMetalPriceOperations()
        const res = await getPosInfo()
        await setDefaults(res?.record)
      }
      await fillCashObjects()
    })()
  }, [])

  return (
    <FormShell
      resourceId={getResourceId[parseInt(functionId)]}
      form={formik}
      functionId={functionId}
      maxAccess={maxAccess}
      previewReport={editMode}
      actions={actions}
      editMode={editMode}
      disabledSubmit={totBalance != 0.0 || isPosted}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={4} xs={12}>
            <Grid item xs={3}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={PointofSaleRepository.RetailInvoice.level}
                    reducer={response => {
                      return editMode
                        ? response?.record?.documentTypes
                        : response?.record?.documentTypes?.filter(item => item.activeStatus == 1)
                    }}
                    parameters={`_posId=${parseInt(posUser?.posId)}&_functionId=${functionId}`}
                    name='dtId'
                    readOnly={formik?.values?.items?.some(item => item.sku)}
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
                      formik.setFieldValue('header.dtId', newValue?.recordId)
                    }}
                    error={formik.errors?.dtId && Boolean(formik.errors?.header?.dtId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='reference'
                    label={labels.reference}
                    value={formik?.values?.header?.reference}
                    maxAccess={!editMode && maxAccess}
                    readOnly={editMode}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('header.reference', '')}
                    error={formik.errors?.header?.reference && Boolean(formik.errors?.header?.reference)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomDatePicker
                    name='date'
                    required
                    label={labels.date}
                    readOnly
                    value={formik?.values?.header?.date}
                    onChange={formik.setFieldValue}
                    editMode={editMode}
                    maxAccess={maxAccess}
                    onClear={() => formik.setFieldValue('header.date', '')}
                    error={formik.touched?.header?.date && Boolean(formik.errors?.header?.date)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={PointofSaleRepository.RetailInvoice.level}
                    reducer={response => {
                      return editMode
                        ? response?.record?.salesPeople
                        : response?.record?.salesPeople?.filter(item => item.isInactive !== true)
                    }}
                    parameters={`_posId=${parseInt(posUser?.posId)}&_functionId=${functionId}`}
                    name='spId'
                    readOnly={isPosted}
                    label={labels.salesPerson}
                    columnsInDropDown={[
                      { key: 'spRef', value: 'Reference' },
                      { key: 'spName', value: 'Name' }
                    ]}
                    valueField='spId'
                    displayField='spName'
                    values={formik.values.header}
                    maxAccess={maxAccess}
                    displayFieldWidth={1.5}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('header.spId', newValue?.spId)
                    }}
                    error={formik.errors.spId && Boolean(formik.errors?.header?.spId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='KGmetalPrice'
                    maxAccess={maxAccess}
                    label={labels.metalPrice}
                    value={formik.values.header.KGmetalPrice}
                    onChange={formik.handleChange}
                    readOnly={!formik.values.baseMetalCuId || isPosted}
                    hidden={(!editMode && !formik.values.baseMetalCuId) || (!editMode && formik.values.header.dtId)}
                    onClear={() => formik.setFieldValue('header.KGmetalPrice', '')}
                    error={formik.errors?.header?.KGmetalPrice && Boolean(formik.errors?.header?.KGmetalPrice)}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={3}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <CustomTextField
                    name='name'
                    label={labels.Name}
                    value={formik?.values?.header?.name}
                    maxAccess={maxAccess}
                    readOnly={isPosted}
                    onChange={e => {
                      const { value } = e.target
                      formik.handleChange(e)
                      setAddress(prevAddress => ({
                        ...prevAddress,
                        name: value
                      }))
                      setAddressModified(true)
                    }}
                    onClear={() => {
                      formik.setFieldValue('header.name', '')
                      setAddress(prevAddress => ({
                        ...prevAddress,
                        name: ''
                      }))
                      setAddressModified(true)
                    }}
                    error={formik.touched?.header?.name && Boolean(formik.errors?.header?.name)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='street1'
                    label={labels.street}
                    value={formik?.values?.header?.street1}
                    maxAccess={maxAccess}
                    readOnly={isPosted}
                    onChange={e => {
                      const { value } = e.target
                      formik.handleChange(e)
                      setAddress(prevAddress => ({
                        ...prevAddress,
                        street1: value
                      }))
                      setAddressModified(true)
                    }}
                    onClear={() => {
                      formik.setFieldValue('header.street1', '')
                      setAddress(prevAddress => ({
                        ...prevAddress,
                        street1: ''
                      }))
                      setAddressModified(true)
                    }}
                    error={(formik.touched.header?.street1 || true) && Boolean(formik.errors.header?.street1)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='street2'
                    label={labels.street2}
                    value={formik?.values?.header?.street2}
                    maxAccess={maxAccess}
                    readOnly={isPosted}
                    onChange={e => {
                      const { value } = e.target
                      formik.handleChange(e)
                      setAddress(prevAddress => ({
                        ...prevAddress,
                        street2: value
                      }))
                      setAddressModified(true)
                    }}
                    onClear={() => {
                      formik.setFieldValue('header.street2', '')
                      setAddress(prevAddress => ({
                        ...prevAddress,
                        street2: ''
                      }))
                      setAddressModified(true)
                    }}
                    error={formik.errors?.header?.street2 && Boolean(formik.errors?.header?.street2)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceLookup
                    endpointId={SystemRepository.City.snapshot}
                    parameters={{
                      _countryId: formik.values.header.countryId,
                      _stateId: formik.values.header.stateId || 0
                    }}
                    valueField='name'
                    displayField='name'
                    name='city'
                    label={labels.city}
                    readOnly={isPosted}
                    form={formik}
                    formObject={formik.values.header}
                    secondDisplayField={false}
                    onChange={(event, newValue) => {
                      setAddress(prevAddress => ({
                        ...prevAddress,
                        cityId: newValue?.recordId,
                        city: newValue?.name
                      }))
                      formik.setFieldValue('header.cityId', newValue?.recordId)
                      formik.setFieldValue('header.city', newValue?.name)
                      setAddressModified(true)
                    }}
                    errorCheck={'header.cityId'}
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='phone'
                    label={labels.phone}
                    value={formik.values.header.phone}
                    readOnly={isPosted}
                    maxLength='15'
                    phone={true}
                    onChange={e => {
                      const { value } = e.target
                      formik.handleChange(e)
                      setAddress(prevAddress => ({
                        ...prevAddress,
                        phone: value
                      }))
                      setAddressModified(true)
                    }}
                    onClear={() => {
                      formik.setFieldValue('header.phone', '')
                      setAddress(prevAddress => ({
                        ...prevAddress,
                        phone: ''
                      }))
                      setAddressModified(true)
                    }}
                    error={formik.touched.header?.phone && Boolean(formik.errors.header?.phone)}
                    maxAccess={maxAccess}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={3}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <CustomTextField
                    name='posRef'
                    label={labels.pos}
                    readOnly
                    value={formik?.values?.header?.posRef}
                    maxAccess={maxAccess}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('header.posRef', '')}
                    error={formik.errors?.header?.posRef && Boolean(formik.errors?.header?.posRef)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='plantName'
                    label={labels.plant}
                    value={formik?.values?.header?.plantName}
                    maxAccess={maxAccess}
                    readOnly
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('header.plantName', '')}
                    error={formik.errors?.header?.plantName && Boolean(formik.errors?.header?.plantName)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='siteName'
                    label={labels.site}
                    value={formik?.values?.header?.siteName}
                    maxAccess={maxAccess}
                    readOnly
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('header.siteName', '')}
                    error={formik.errors?.header?.siteName && Boolean(formik.errors?.header?.siteName)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='currencyName'
                    label={labels.currency}
                    value={formik?.values?.header?.currencyName}
                    maxAccess={maxAccess}
                    readOnly
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('header.currencyName', '')}
                    error={formik.errors?.header?.currencyName && Boolean(formik.errors?.header?.currencyName)}
                  />
                </Grid>
                <Grid item xs={10}>
                  <CustomTextField
                    name='taxRef'
                    label={labels.tax}
                    value={formik?.values?.header?.taxRef}
                    maxAccess={maxAccess}
                    readOnly
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('header.taxRef', '')}
                    error={formik.errors?.header?.axName && Boolean(formik.errors?.header?.taxRef)}
                  />
                </Grid>
                <Grid item xs={2}>
                  <CustomCheckBox
                    name='isVatable'
                    value={formik.values?.header?.isVatable}
                    onChange={event => formik.setFieldValue('header.isVatable', event.target.checked)}
                    label={labels.vat}
                    maxAccess={maxAccess}
                    disabled={formik?.values?.items?.some(item => item.sku)}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={3}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <CustomTextArea
                    name='deliveryNotes'
                    label={labels.notes}
                    value={formik.values.header.deliveryNotes}
                    rows={3.5}
                    maxAccess={maxAccess}
                    onChange={e => formik.setFieldValue('header.deliveryNotes', e.target.value)}
                    onClear={() => formik.setFieldValue('header.deliveryNotes', '')}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    sx={{
                      backgroundColor: '#000000',
                      color: '#FFFFFF',
                      '&:hover': {
                        backgroundColor: '#333333'
                      }
                    }}
                    onClick={() => openAddressForm()}
                  >
                    {labels.addressDetails}
                  </Button>
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
            value={formik?.values?.items}
            error={formik.errors.items}
            name='items'
            columns={columns}
            maxAccess={maxAccess}
            disabled={isPosted || !formik.values.header.currencyId}
          />
        </Grow>

        <Fixed>
          <Grid container rowGap={1} xs={12}>
            <Grid container rowGap={1} xs={8}>
              <DataGrid
                onChange={(value, action) => {
                  formik.setFieldValue('cash', value)
                  action === 'delete'
                }}
                value={formik?.values?.cash}
                error={formik.errors.cash}
                name='cash'
                onSelectionChange={(row, update, field) => {
                  if (field == 'ccRef') getFilteredCC(row?.cashAccountId)
                }}
                columns={cashColumns}
                maxAccess={maxAccess}
              />
            </Grid>

            <Grid container direction='row' xs={4} spacing={2} sx={{ pl: 2 }}>
              <Grid container item xs={6} direction='column' spacing={1} sx={{ mt: 1 }}>
                <Grid item>
                  <CustomNumberField
                    name='weight'
                    maxAccess={maxAccess}
                    label={labels.totWeight}
                    value={totalWeight}
                    readOnly
                  />
                </Grid>
                <Grid item>
                  <CustomNumberField name='qty' maxAccess={maxAccess} label={labels.totQty} value={totalQty} readOnly />
                </Grid>
              </Grid>
              <Grid container item xs={6} direction='column' spacing={1} sx={{ mt: 1 }}>
                <Grid item>
                  <CustomNumberField
                    name='subTotal'
                    maxAccess={maxAccess}
                    label={labels.subtotal}
                    value={subtotal}
                    readOnly
                  />
                </Grid>
                <Grid item>
                  <CustomNumberField
                    name='vatAmount'
                    maxAccess={maxAccess}
                    label={labels.vat}
                    value={vatAmount}
                    readOnly
                  />
                </Grid>
                <Grid item>
                  <CustomNumberField name='amount' maxAccess={maxAccess} label={labels.net} value={amount} readOnly />
                </Grid>
                <Grid item>
                  <CustomNumberField
                    name='balance'
                    maxAccess={maxAccess}
                    label={labels.balance}
                    value={totBalance}
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
