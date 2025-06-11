import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { formatDateForGetApI, formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
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
  DIRTYFIELD_EXTENDED_PRICE,
  DIRTYFIELD_BASE_LABOR_PRICE,
  MDTYPE_PCT,
  MDTYPE_AMOUNT
} from 'src/utils/ItemPriceCalculator'
import { getVatCalc } from 'src/utils/VatCalculator'
import { getDiscValues, getFooterTotals, getSubtotal } from 'src/utils/FooterCalculator'
import AddressFilterForm from 'src/components/Shared/AddressFilterForm'
import { useError } from 'src/error'
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'
import CustomCheckBox from 'src/components/Inputs/CustomCheckBox'
import TaxDetails from 'src/components/Shared/TaxDetails'
import { BusinessPartnerRepository } from 'src/repositories/BusinessPartnerRepository'
import CustomButton from 'src/components/Inputs/CustomButton'
import { MultiCurrencyRepository } from 'src/repositories/MultiCurrencyRepository'
import { RateDivision } from 'src/resources/RateDivision'
import ChangeClient from 'src/components/Shared/ChangeClient'
import InvoiceForm from './InvoiceForm'
import { SerialsForm } from 'src/components/Shared/SerialsForm'

export default function ReturnOnInvoiceForm({ labels, access, recordId, currency }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { stack: stackError } = useError()
  const { platformLabels, defaultsData } = useContext(ControlContext)

  const [cycleButtonState, setCycleButtonState] = useState({ text: '%', value: 2 })
  const [reCal, setReCal] = useState(false)

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.ReturnOnInvoice,
    access,
    enabled: !recordId
  })

  const invalidate = useInvalidate({
    endpointId: SaleRepository.ReturnOnInvoice.page
  })

  const systemSales = defaultsData?.list?.find(({ key }) => key === 'salesTD')?.value
  const systemPriceLevel = defaultsData?.list?.find(({ key }) => key === 'plId')?.value

  const initialValues = {
    dtId: null,
    commitItems: false,
    isDefaultDtPresent: false,
    reference: '',
    status: 1,
    date: new Date(),
    currencyId: parseInt(currency),
    plantId: null,
    spId: null,
    szId: null,
    siteId: null,
    invoiceId: null,
    clientId: null,
    clientRef: '',
    clientName: '',
    exRate: 1,
    description: '',
    amount: 0,
    baseAmount: 0,
    rateCalcMethod: 1,
    subtotal: 0,
    miscAmount: 0,
    isVattable: false,
    vatAmount: 0,
    tdType: 2,
    tdPct: 0,
    tdAmount: 0,
    billAddressId: null,
    billAddress: '',
    returnReasonId: null,
    contactId: null,
    plId: null,
    qty: 0,
    pcs: 0,
    isVerified: false,
    metalPrice: 0,
    KGmetalPrice: 0,
    hiddenkgMetalPrice: 0,
    clientDiscount: 0,
    currentDiscount: 0,
    items: [
      {
        id: 1,
        returnId: recordId || 0,
        seqNo: 1,
        componentSeqNo: null,
        lotCategoryId: null,
        invoiceId: null,
        invoiceRef: null,
        invoiceSeqNo: 1,
        itemName: '',
        muId: null,
        baseQty: 0,
        applyVat: false,
        unitCost: 0,
        isMetal: false,
        metalId: 0,
        metalPurity: 0,
        taxId: 0,
        balanceQty: 0,
        pieces: 0,
        itemId: null,
        sku: null,
        priceType: 1,
        basePrice: 0,
        baseLaborPrice: 0,
        volume: 0,
        weight: 0,
        unitPrice: 0,
        upo: 0,
        qty: 0,
        mdAmount: 0,
        mdType: 1,
        mdValue: 0,
        vatPct: 0,
        vatAmount: 0,
        extendedPrice: 0,
        notes: null,
        returnNowQty: 0,
        returnedQty: 0,
        trackBy: null,
        isEditMode: false,
        taxDetailsButton: true,
        serials: []
      }
    ]
  }

  const { formik } = useForm({
    maxAccess,
    documentType: { key: 'dtId', value: documentType?.dtId },
    initialValues,
    validateOnChange: true,
    validationSchema: yup.object({
      currencyId: yup.number().required(),
      date: yup.string().required(),
      clientId: yup.number().required(),
      siteId: yup
        .number()
        .nullable()
        .test(function (value) {
          const { dtId, commitItems, isDefaultDtPresent } = this.parent
          if (!dtId) return !!value
          if (!isDefaultDtPresent) return !!value
          if (dtId && commitItems) return !!value

          return true
        }),
      items: yup.array().of(
        yup.object().shape({
          returnNowQty: yup.number().required().min(1),
          sku: yup.string().required(),
          itemName: yup.string().required()
        })
      )
    }),
    onSubmit: async values => {
      const obj = { ...values }
      delete obj.items

      const copy = {
        ...obj,
        date: formatDateToApi(obj.date),
        miscAmount: obj.miscAmount || 0
      }

      if (copy.rateCalcMethod == 1) copy.baseAmount = Number(copy.amount) * copy.exRate
      else if (copy.rateCalcMethod == 2) copy.baseAmount = Number(copy.amount) / copy.exRate

      const updatedRows = formik.values.items.map((itemDetails, index) => ({
        ...itemDetails,
        seqNo: index + 1,
        qty: itemDetails.sku ? itemDetails.returnNowQty || itemDetails.qty : itemDetails.qty
      }))

      const itemsGridData = {
        header: copy,
        items: updatedRows,
        serials: [],
        lots: []
      }

      const retRes = await postRequest({
        extension: SaleRepository.ReturnOnInvoice.set2,
        record: JSON.stringify(itemsGridData)
      })

      toast.success(editMode ? platformLabels.Edited : platformLabels.Added)
      await refetchForm(retRes.recordId)
      invalidate()
    }
  })
  const editMode = !!formik.values.recordId
  const isPosted = formik.values.status == 3
  const rowsUpdate = useRef(formik?.values?.items)

  const iconKey = ({ value, data }) => {
    const mdType = value?.mdType || data?.mdType

    return mdType === MDTYPE_PCT ? '%' : '123'
  }

  const onCondition = row => {
    if (row.trackBy == 1) {
      return {
        imgSrc: '/images/TableIcons/imgSerials.png',
        hidden: false
      }
    } else if (row.trackBy == 2) {
      return {
        imgSrc: '/images/TableIcons/lot.png',
        hidden: false
      }
    } else {
      return {
        imgSrc: '',
        hidden: true
      }
    }
  }

  const columns = [
    !formik.values.invoiceId && {
      component: 'resourcecombobox',
      label: labels.invoice,
      name: 'invoiceRef',
      flex: 2,
      props: {
        endpointId: SaleRepository.ReturnOnInvoice.balance,
        parameters: `_clientId=${formik.values.clientId}&_returnDate=${
          formik?.values?.date?.toISOString().split('T')[0] + 'T00:00:00'
        }`,
        displayField: 'reference',
        valueField: 'recordId',
        mapping: [
          { from: 'recordId', to: 'invoiceId' },
          { from: 'reference', to: 'invoiceRef' }
        ]
      },
      async onChange({ row: { update } }) {
        if (!formik.values.currencyId) {
          update({
            invoiceId: null,
            invoiceRef: null,
            invoiceName: null
          })

          stackError({
            message: labels.noCurrency
          })

          return
        }
      },
      propsReducer({ row, props }) {
        return { ...props, readOnly: row.invoiceId }
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
          { from: 'trackBy', to: 'trackBy' }
        ],
        columnsInDropDown: [
          { key: 'sku', value: 'SKU' },
          { key: 'name', value: 'Item Name' },
          { key: 'flName', value: 'FL Name' }
        ],
        displayFieldWidth: 5,
        filter: { salesItem: true }
      },
      async onChange({ row: { update, newRow } }) {
        if (!formik.values.currencyId) {
          update({
            itemId: null,
            sku: null,
            itemName: null
          })

          stackError({
            message: labels.noCurrency
          })

          return
        }
        if (!newRow.itemId) return

        let itemFound = {}
        if (!systemPriceLevel && !formik.values.plId) {
          stackError({ message: labels.noPriceLevel })

          return
        }
        if (newRow.invoiceId) {
          const res = await getRequest({
            extension: SaleRepository.ReturnItem.balance,
            parameters: `_invoiceId=${newRow.invoiceId}`
          })

          itemFound = (res.list || []).find(x => x.item.itemId == newRow.itemId)

          if (!itemFound) {
            update({ itemId: null, itemName: null, sku: null })
            stackError({ message: labels.itemNotInReturn })

            return
          }

          const itemData = {
            id: newRow?.id,
            itemId: itemFound?.item?.itemId,
            sku: itemFound?.item?.sku,
            itemName: itemFound?.item?.itemName,
            balanceQty: itemFound?.balanceQty,
            taxId: itemFound?.item?.taxId,
            vatPct: parseFloat(itemFound?.item?.vatPct || 0).toFixed(2),
            vatAmount: parseFloat(itemFound?.item?.vatAmount || 0).toFixed(2),
            unitPrice: parseFloat(itemFound?.item?.unitPrice || 0).toFixed(3),
            unitCost: parseFloat(itemFound?.item?.unitCost || 0).toFixed(2),
            pieces: itemFound?.item?.pieces,
            mdType: itemFound?.item?.mdType,
            mdAmount: itemFound?.item?.mdAmount,
            mdValue: itemFound?.item?.mdValue,
            pieces: itemFound?.item?.pieces,
            priceType: itemFound?.item?.priceType,
            basePrice: itemFound?.item?.basePrice,
            baseLaborPrice: itemFound?.item?.baseLaborPrice,
            weight: itemFound?.item?.weight,
            volume: itemFound?.item?.volume,
            isMetal: itemFound?.item?.isMetal || false,
            metalid: itemFound?.item?.metalId,
            metalPurity: itemFound?.item?.metalPurity,
            applyVat: formik.values.isVattable
          }

          update(itemData)
          getItemPriceRow(update, itemData, DIRTYFIELD_QTY)

          return
        }

        const [itemPhysProp, itemInfo, ItemConvertPrice] = await Promise.all([
          getItemPhysProp(newRow.itemId),
          getItem(newRow.itemId),
          getItemConvertPrice(newRow.itemId, update)
        ])

        let rowTax
        let rowTaxDetails
        const effectiveTaxId = formik.values.taxId || itemInfo.taxId

        if (effectiveTaxId) {
          const taxDetailsResponse = await getTaxDetails(effectiveTaxId)
          rowTax = effectiveTaxId
          rowTaxDetails = taxDetailsResponse.map(item => ({
            taxId: effectiveTaxId,
            taxCodeId: item.taxCodeId,
            taxBase: item.taxBase,
            amount: item.amount
          }))
        }

        update({
          itemId: newRow?.itemId,
          sku: newRow?.sku,
          itemName: newRow?.itemName,
          balanceQty: 0,
          taxId: 0,
          vatPct: 0,
          vatAmount: 0,
          volume: parseFloat(itemPhysProp?.volume) || 0,
          weight: parseFloat(itemPhysProp?.weight || 0).toFixed(2),
          basePrice: !itemPhysProp?.isMetal
            ? ItemConvertPrice?.basePrice
            : (itemPhysProp?.metalPurity || 0) > 0
            ? formik.values.postMetalToFinancials
              ? 0
              : (formik.values.KGMetalPrice || 0 * (itemPhysProp?.metalPurity || 0)) / 1000
            : 0,
          unitPrice: parseFloat(ItemConvertPrice?.unitPrice || 0).toFixed(3),
          unitCost: 0,
          upo: parseFloat(ItemConvertPrice?.upo || 0).toFixed(2),
          priceType: ItemConvertPrice?.priceType || 1,
          baseLaborPrice: 0,
          TotPricePerG: !formik.values.postMetalToFinancials
            ? ((formik.values.KGMetalPrice || 0) * (itemPhysProp?.metalPurity || 0)) / 1000
            : 0,
          isMetal: itemPhysProp?.isMetal || false,
          metalId: itemPhysProp?.metalId || null,
          metalPurity: itemPhysProp?.metalPurity || 0,
          mdAmount: formik.values.clientDiscount || 0,
          qty: 0,
          pieces: 0,
          msId: itemInfo?.msId,
          extendedPrice: parseFloat('0').toFixed(2),
          mdValue: 0,
          taxId: rowTax,
          taxDetails: formik.values.isVattable ? rowTaxDetails : null,
          mdType: 1,
          siteId: formik?.values?.siteId,
          siteRef: await getSiteRef(formik?.values?.siteId),
          applyVat: formik.values.isVattable,
          taxDetailsButton: true,
          trackBy: newRow?.trackBy
        })
      },
      propsReducer({ row, props }) {
        return { ...props, readOnly: row.itemId && row.invoiceId }
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
      name: 'returnNowQty',
      updateOn: 'blur',
      onChange({ row: { update, newRow } }) {
        const { returnNowQty, balanceQty, invoiceId } = newRow
        const validQty = invoiceId && Number(returnNowQty) > Number(balanceQty) ? balanceQty : returnNowQty
        update({ returnNowQty: validQty })

        getItemPriceRow(update, { ...newRow, returnNowQty: validQty }, DIRTYFIELD_QTY)
        if (invoiceId && Number(returnNowQty) > Number(balanceQty)) stackError({ message: labels.invalidQty })
      }
    },
    {
      component: 'button',
      name: 'serialLotButton',
      label: labels.serialsLots,
      props: {
        onCondition
      },
      onClick: (e, row, update, updateRow) => {
        if (row?.trackBy == 1) {
          stack({
            Component: SerialsForm,
            props: {
              labels,
              disabled: isPosted,
              row: { ...row, qty: row.returnNowQty },
              siteId: null,
              maxAccess,
              checkForSiteId: row.qty < 0,
              updateRow
            },
            width: 500,
            height: 700,
            title: platformLabels.serials
          })
        }
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
      label: labels.volume,
      name: 'volume',
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.unitPrice,
      name: 'unitPrice',
      props: {
        decimalScale: 5
      },
      async onChange({ row: { update, newRow } }) {
        getItemPriceRow(update, newRow, DIRTYFIELD_UNIT_PRICE)
      }
    },
    {
      component: 'numberfield',
      label: labels.basePrice,
      name: 'basePrice',
      props: {
        decimalScale: 5
      },
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
      label: labels.vat,
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
          const metalPrice = Number(formik.values.metalPrice) || 0
          const metalPurity = Number(row.metalPurity) || 0
          stack({
            Component: TaxDetails,
            props: {
              taxId: row?.taxId,
              obj: {
                ...row,
                basePrice: metalPrice !== 0 ? metalPrice * metalPurity : 0
              }
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
        getItemPriceRow(update, newRow, DIRTYFIELD_MDAMOUNT)
        checkMdAmountPct(newRow, update)
      }
    },
    {
      component: 'numberfield',
      label: labels.extendedPrice,
      name: 'extendedPrice',
      async onChange({ row: { update, newRow } }) {
        getItemPriceRow(update, newRow, DIRTYFIELD_EXTENDED_PRICE)
      }
    }
  ].filter(Boolean)

  function checkMinMaxAmount(amount, type) {
    let currentAmount = parseFloat(amount) || 0
    if (type === MDTYPE_PCT) {
      if (currentAmount < 0 || currentAmount > 100) currentAmount = 0
    } else {
      if (currentAmount < 0) currentAmount = 0
    }

    return currentAmount
  }

  function checkMdAmountPct(rowData, update) {
    const maxClientAmountDiscount = rowData.unitPrice * (formik.values.maxDiscount / 100)
    if (!formik.values.maxDiscount) return
    if (rowData.mdType == 1) {
      if (rowData.mdAmount > formik.values.maxDiscount) {
        ShowMdValueErrorMessage(formik.values.maxDiscount, rowData, update)

        return
      }
    } else {
      if (rowData.mdAmount > maxClientAmountDiscount) {
        ShowMdAmountErrorMessage(rowData.mdAmount, maxClientAmountDiscount, rowData, update)

        return
      }
    }
  }
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

  async function onWorkFlowClick() {
    stack({
      Component: WorkFlow,
      props: {
        functionId: SystemFunction.ReturnOnInvoice,
        recordId: formik.values.recordId
      },
      width: 950,
      height: 600,
      title: labels.workflow
    })
  }

  const handleMetalClick = async () => {
    const metalItemsList = rowsUpdate?.current
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
  async function onPost() {
    const copy = { ...formik.values }
    delete copy.items
    await postRequest({
      extension: SaleRepository.ReturnOnInvoice.post,
      record: JSON.stringify(copy)
    })

    toast.success(platformLabels.Posted)
    refetchForm(formik.values.recordId)
    invalidate()
  }
  async function onUnpost() {
    await postRequest({
      extension: SaleRepository.ReturnOnInvoice.unpost,
      record: JSON.stringify({ recordId: formik.values.recordId })
    })
    refetchForm(formik.values.recordId)
    toast.success(platformLabels.Unposted)
    invalidate()
  }
  async function verifyRecord() {
    const copy = { ...formik.values, isVerified: !formik.values.isVerified }
    delete copy.items
    await postRequest({
      extension: SaleRepository.ReturnOnInvoice.verify,
      record: JSON.stringify(copy)
    })

    toast.success(!formik.values.isVerified ? platformLabels.Verified : platformLabels.Unverfied)
    refetchForm(formik.values.recordId)
    invalidate()
  }

  const actions = [
    {
      key: 'Verify',
      condition: !formik.values.isVerified,
      onClick: verifyRecord,
      disabled: formik.values.isVerified || !editMode || !isPosted
    },
    {
      key: 'Unverify',
      condition: formik.values.isVerified,
      onClick: verifyRecord,
      disabled: !formik.values.isVerified
    },
    {
      key: 'Metals',
      condition: true,
      onClick: 'onClickMetal',
      handleMetalClick
    },
    {
      key: 'Aging',
      condition: true,
      onClick: 'onClickAging',
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
      key: 'FI Trx',
      condition: true,
      onClick: 'onClickIT',
      disabled: !editMode
    },
    {
      key: 'RecordRemarks',
      condition: true,
      onClick: 'onRecordRemarks',
      disabled: !editMode
    },
    {
      key: 'GL',
      condition: true,
      onClick: 'onClickGL',
      datasetId: ResourceIds.GLReturnOnInvoice,
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
      disabled: !editMode || formik.values.isVerified
    },
    {
      key: 'Unlocked',
      condition: !isPosted,
      onClick: onPost,
      disabled: !editMode
    }
  ]

  async function fillForm(retHeader, retItems, dtInfo, clientDiscount) {
    const billAdd = await getAddress(retHeader?.record?.billAddressId)

    retHeader?.record?.tdType == 1 || retHeader?.record?.tdType == null
      ? setCycleButtonState({ text: '123', value: 1 })
      : setCycleButtonState({ text: '%', value: 2 })

    const modifiedList =
      retItems?.list.length != 0
        ? await Promise.all(
            retItems.list?.map(async (item, index) => {
              const taxDetailsResponse = retHeader?.record?.isVattable ? await getTaxDetails(item.taxId) : null

              return {
                ...item,
                id: index + 1,
                basePrice: parseFloat(item.basePrice).toFixed(5),
                unitPrice: parseFloat(item.unitPrice).toFixed(3),
                upo: parseFloat(item.upo).toFixed(2),
                vatAmount: parseFloat(item.vatAmount).toFixed(2),
                extendedPrice: parseFloat(item.extendedPrice).toFixed(2),
                returnNowQty: parseFloat(item.qty).toFixed(2),
                taxDetails: taxDetailsResponse,
                isEditMode: true
              }
            })
          )
        : formik.values.items

    rowsUpdate.current = modifiedList
    formik.setValues({
      ...retHeader.record,
      currentDiscount:
        retHeader?.record?.tdType == 1 || retHeader?.record?.tdType == null
          ? retHeader?.record?.tdAmount
          : retHeader?.record?.tdPct,
      amount: parseFloat(retHeader?.record?.amount).toFixed(2),
      billAddress: billAdd || '',
      commitItems: dtInfo?.commitItems,
      isDefaultDtPresent: dtInfo?.dtId,
      clientDiscount: clientDiscount.tdPct || 0,
      items: modifiedList
    })
  }

  async function getRetailInvoice(retId) {
    const res = await getRequest({
      extension: SaleRepository.ReturnOnInvoice.get,
      parameters: `_recordId=${retId}`
    })

    res.record.date = formatDateFromApi(res?.record?.date)

    return res
  }

  async function getRetailInvoiceItems(retId) {
    return await getRequest({
      extension: SaleRepository.ReturnItem.qry,
      parameters: `_returnId=${retId}`
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

  async function getItemConvertPrice(itemId) {
    if (!itemId) return

    const res = await getRequest({
      extension: SaleRepository.ItemConvertPrice.get,
      parameters: `_itemId=${itemId}&_clientId=${formik.values.clientId}&_currencyId=${
        formik.values.currencyId
      }&_plId=${formik.values.plId || systemPriceLevel}&_muId=0`
    })

    return res?.record
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

  function getItemPriceRow(update, newRow, dirtyField, iconClicked) {
    !reCal && setReCal(true)

    const itemPriceRow = getIPR({
      priceType: newRow?.priceType || 0,
      basePrice: parseFloat(newRow?.basePrice) || 0,
      volume: parseFloat(newRow?.volume),
      weight: parseFloat(newRow?.weight),
      unitPrice: parseFloat(newRow?.unitPrice || 0),
      upo: parseFloat(newRow?.upo) ? parseFloat(newRow?.upo) : 0,
      qty: parseFloat(newRow?.returnNowQty),
      extendedPrice: parseFloat(newRow?.extendedPrice),
      mdAmount: parseFloat(newRow?.mdAmount),
      mdType: newRow?.mdType,
      baseLaborPrice: parseFloat(newRow.baseLaborPrice || 0),
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
      vatAmount: parseFloat(itemPriceRow?.vatAmount),
      tdPct: formik?.values?.tdPct,
      taxDetails: formik.values.isVattable ? newRow.taxDetails : null
    })

    let commonData = {
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
    let data = iconClicked ? { changes: commonData } : commonData
    update(data)
  }

  const parsedItemsArray = formik.values.items
    ?.filter(item => item.itemId !== undefined)
    .map(item => ({
      ...item,
      qty: parseFloat(item.returnNowQty) || 0,
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

  const totalQty = reCal ? _footerSummary?.totalQty.toFixed(2) : formik.values?.qty || 0
  const amount = reCal ? _footerSummary?.net.toFixed(2) : formik.values?.amount || 0
  const subtotal = reCal ? subTotal.toFixed(2) : formik.values?.subtotal || 0
  const vatAmount = reCal ? _footerSummary?.sumVat.toFixed(2) : formik.values?.vatAmount || 0

  function checkDiscount(typeChange, tdPct, tdAmount, currentDiscount) {
    const _discountObj = getDiscValues({
      tdAmount: parseFloat(currentDiscount),
      tdPlain: typeChange == 1,
      tdPct: typeChange == 2,
      tdType: typeChange,
      subtotal: parseFloat(subtotal),
      currentDiscount,
      hiddenTdPct: tdPct,
      hiddenTdAmount: parseFloat(tdAmount),
      typeChange
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
        tdPct,
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
      getItemPriceRow(update, rowData, DIRTYFIELD_MDAMOUNT)
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
      getItemPriceRow(update, rowData, DIRTYFIELD_MDAMOUNT)
      stackError({
        message: labels.clientMaxDiscount + ' ' + clientMaxDiscountValue
      })
    }
  }

  async function getClientInfo(clientId) {
    if (!clientId) return

    const res = await getRequest({
      extension: SaleRepository.Client.get,
      parameters: `_recordId=${clientId}`
    })

    return res.record
  }

  async function refetchForm(recordId) {
    const retHeader = await getRetailInvoice(recordId)
    const retItems = await getRetailInvoiceItems(recordId)
    const dtInfo = await onChangeDtId(retHeader.record.dtId)
    const clientDiscount = await getClientInfo(retHeader.record.clientId)
    await fillForm(retHeader, retItems, dtInfo, clientDiscount)
  }

  function setAddressValues(obj) {
    Object.entries(obj).forEach(([key, value]) => {
      formik.setFieldValue(key, value)
    })
  }

  function openAddressFilterForm() {
    stack({
      Component: AddressFilterForm,
      props: {
        maxAccess,
        labels,
        bill: true,
        checkedAddressId: formik.values?.billAddId,
        form: formik.values,
        handleAddressValues: setAddressValues
      },
      width: 950,
      height: 600,
      title: labels.AddressFilter
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

  async function onChangeDtId(dtId) {
    if (!dtId) return
    formik.setFieldValue('KGmetalPrice', formik.values.hiddenkgMetalPrice)
    formik.setFieldValue('defaultBaseMC', formik.values.hiddenkgMetalPrice)
    formik.setFieldValue('metalPrice', formik.values.hiddenkgMetalPrice ? formik.values.hiddenkgMetalPrice / 1000 : 0)

    const res = await getRequest({
      extension: SaleRepository.DocumentTypeDefault.get,
      parameters: `_dtId=${dtId}`
    })
    formik.setFieldValue('plantId', res?.record?.plantId || null)
    formik.setFieldValue('spId', res?.record?.spId || null)
    formik.setFieldValue('postMetalToFinancials', res?.record?.postMetalToFinancials)
    formik.setFieldValue('commitItems', res?.record?.commitItems)
    formik.setFieldValue('isDefaultDtPresent', res?.record?.dtId)
    formik.setFieldValue('siteId', res?.record?.siteId || null)
    if (!res?.record?.commitItems) formik.setFieldValue('siteId', null)

    return res?.record
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
    const hiddenkgMetalPrice = await fillMetalPrice(defaultMCbaseCU?.value)
    formik.setFieldValue('hiddenkgMetalPrice', hiddenkgMetalPrice || 0)
  }

  async function fillMetalPrice(baseMetalCuId) {
    if (!baseMetalCuId) return

    const res = await getRequest({
      extension: MultiCurrencyRepository.Currency.get,
      parameters: `_currencyId=${baseMetalCuId}&_date=${formatDateForGetApI(formik.values.date)}&_rateDivision=${
        RateDivision.SALES
      }`
    })

    return res.record.exRate * 1000
  }

  async function onValidationRequired() {
    if (Object.keys(await formik.validateForm()).length) {
      const errors = await formik.validateForm()

      const touchedFields = Object.keys(errors).reduce((acc, key) => {
        if (!formik.touched[key]) {
          acc[key] = true
        }

        return acc
      }, {})

      if (Object.keys(touchedFields).length) {
        formik.setTouched(touchedFields, true)
      }
    }
  }

  useEffect(() => {
    formik.setFieldValue('qty', parseFloat(totalQty).toFixed(2))
    formik.setFieldValue('amount', parseFloat(amount).toFixed(2))
    formik.setFieldValue('subtotal', parseFloat(subtotal).toFixed(2))
    formik.setFieldValue('vatAmount', parseFloat(vatAmount).toFixed(2))
  }, [totalQty, amount, subtotal, vatAmount])

  useEffect(() => {
    if (reCal) {
      let currentTdAmount = (parseFloat(formik.values.tdPct) * parseFloat(subtotal)) / 100
      recalcGridVat(formik.values.tdType, formik.values.tdPct, currentTdAmount, formik.values.currentDiscount)
    }
  }, [subtotal])

  useEffect(() => {
    if (formik.values?.dtId && !recordId) onChangeDtId(formik.values?.dtId)
  }, [formik.values?.dtId])

  useEffect(() => {
    ;(async function () {
      if (recordId) await refetchForm(recordId)
      else {
        await setMetalPriceOperations()
        if (systemSales) {
          setCycleButtonState({ text: '%', value: 2 })
          formik.setFieldValue('tdType', 2)
        } else {
          setCycleButtonState({ text: '123', value: 1 })
          formik.setFieldValue('tdType', 1)
        }

        formik.setFieldValue('plId', parseInt(systemPriceLevel))
      }
    })()
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.ReturnOnInvoice}
      functionId={SystemFunction.SalesReturn}
      form={formik}
      isSavedClear={false}
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
                    parameters={`_startAt=0&_pageSize=1000&_dgId=${SystemFunction.SalesReturn}`}
                    name='dtId'
                    label={labels.docType}
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
                      formik.setFieldValue('dtId', newValue?.recordId || null)
                      changeDT(newValue)
                    }}
                    error={formik.touched.dtId && Boolean(formik.errors.dtId)}
                  />
                </Grid>
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
                  <ResourceLookup
                    endpointId={SaleRepository.Client.snapshot}
                    valueField='reference'
                    displayField='name'
                    secondFieldLabel={labels.name}
                    name='clientId'
                    label={labels.client}
                    form={formik}
                    readOnly={isPosted || formik?.values?.items?.some(item => item.itemId)}
                    displayFieldWidth={4}
                    valueShow='clientRef'
                    secondValueShow='clientName'
                    maxAccess={maxAccess}
                    required={!formik.values.dpId}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' },
                      { key: 'flName', value: 'FlName' },
                      { key: 'keywords', value: 'Keywords' },
                      { key: 'cgName', value: 'Client Group' }
                    ]}
                    onChange={async (event, newValue) => {
                      formik.setFieldValue('clientId', newValue?.recordId || null)
                      formik.setFieldValue('clientName', newValue?.name)
                      formik.setFieldValue('clientRef', newValue?.reference)
                      formik.setFieldValue('isVattable', newValue?.isSubjectToVAT || false)
                      formik.setFieldValue('taxId', newValue?.taxId)
                      formik.setFieldValue('maxDiscount', newValue?.maxDiscount)
                      formik.setFieldValue('clientDiscount', newValue?.tdPct)
                      formik.setFieldValue('plId', newValue?.plId)
                      formik.setFieldValue('currencyId', newValue?.currencyId)
                      formik.setFieldValue('billAddId', newValue?.billAddressId || '')
                      const billAdd = await getAddress(newValue?.billAddressId || '')
                      formik.setFieldValue('billAddress', billAdd || '')
                      if (!newValue?.recordId) formik.setFieldValue('invoiceId', null)
                    }}
                    errorCheck={'clientId'}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={formik.values.clientId && formik.values.date && SaleRepository.ReturnOnInvoice.balance}
                    parameters={`_clientId=${formik.values.clientId}&_returnDate=${
                      formik?.values?.date?.toISOString().split('T')[0] + 'T00:00:00'
                    }`}
                    name='invoiceId'
                    label={labels.invoice}
                    valueField='recordId'
                    displayField='reference'
                    maxAccess={maxAccess}
                    readOnly={editMode || formik.values.items.some(item => item.itemId)}
                    values={formik.values}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('invoiceId', newValue?.recordId || null)
                      formik.setFieldValue('contactId', newValue?.contactId || null)
                      formik.setFieldValue('currencyId', newValue?.currencyId || null)
                      formik.setFieldValue('exRate', newValue?.exRate)
                      formik.setFieldValue('rateCalcMethod', newValue?.rateCalcMethod)
                      formik.setFieldValue('plantId', newValue?.plantId || null)
                      formik.setFieldValue('spId', newValue?.spId || null)
                      formik.setFieldValue('szId', newValue?.szId || null)
                      formik.setFieldValue('isVattable', newValue?.isVattable)
                      formik.setFieldValue('tdType', newValue?.tdType || 1)
                      formik.setFieldValue('tdAmount', newValue?.tdAmount)
                    }}
                    error={formik.touched.invoiceId && Boolean(formik.errors.invoiceId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='KGmetalPrice'
                    maxAccess={maxAccess}
                    label={labels.metalPrice}
                    value={formik.values.KGmetalPrice}
                    onChange={e => {
                      let KGmetalPrice = Number(e.target.value.replace(/,/g, ''))
                      formik.setFieldValue('KGmetalPrice', KGmetalPrice)
                      formik.setFieldValue('metalPrice', KGmetalPrice / 1000)
                    }}
                    readOnly={!formik.values.baseMetalCuId || isPosted}
                    hidden={
                      isPosted || (!editMode && !formik.values.baseMetalCuId) || (!editMode && !formik.values.dtId)
                    }
                    onClear={() => formik.setFieldValue('KGmetalPrice', '')}
                    error={formik.touched?.KGmetalPrice && Boolean(formik.errors?.KGmetalPrice)}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={3}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SystemRepository.Plant.qry}
                    name='plantId'
                    label={labels.plant}
                    readOnly={isPosted}
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
                    error={formik.touched.plantId && Boolean(formik.errors.plantId)}
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
                    readOnly={isPosted}
                    values={formik.values}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('items', [{ id: 1 }])
                      formik.setFieldValue('currencyId', newValue?.recordId || null)
                    }}
                    error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
                  />
                </Grid>
                <Grid item xs={3}>
                  <CustomButton
                    onClick={() => {
                      stack({
                        Component: ChangeClient,
                        props: {
                          form: formik
                        },
                        width: 500,
                        height: 570,
                        title: labels.changeClient
                      })
                    }}
                    image='popup.png'
                    disabled={isPosted || !formik.values.clientId}
                    tooltipText={platformLabels.editClient}
                  />
                </Grid>
                <Grid item xs={9}>
                  <CustomCheckBox
                    name='isVattable'
                    value={formik.values?.isVattable}
                    onChange={event => formik.setFieldValue('isVattable', event.target.checked)}
                    label={labels.vat}
                    disabled
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomButton
                    onClick={() => {
                      stack({
                        Component: InvoiceForm,
                        props: {
                          form: formik,
                          maxAccess,
                          labels,
                          setReCal
                        },
                        width: 900,
                        height: 550,
                        title: labels.invoice
                      })
                    }}
                    tooltipText={platformLabels.import}
                    image={'import.png'}
                    disabled={!formik.values.clientId || !formik.values.invoiceId}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={3}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SaleRepository.SalesPerson.qry}
                    name='spId'
                    label={labels.salesPerson}
                    columnsInDropDown={[
                      { key: 'spRef', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    readOnly={isPosted}
                    valueField='recordId'
                    displayField='name'
                    maxAccess={maxAccess}
                    values={formik.values}
                    displayFieldWidth={1.5}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('spId', newValue?.recordId || null)
                    }}
                    error={formik.touched.spId && Boolean(formik.errors.spId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomDatePicker
                    name='date'
                    required
                    label={labels.date}
                    value={formik?.values?.date}
                    onChange={formik.setFieldValue}
                    readOnly={isPosted}
                    maxAccess={maxAccess}
                    onClear={() => formik.setFieldValue('date', null)}
                    error={formik.touched.date && Boolean(formik.errors.date)}
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
                  <ResourceComboBox
                    endpointId={SaleRepository.ReturnReasons.qry}
                    name='returnReasonId'
                    label={labels.reason}
                    valueField='recordId'
                    displayField='name'
                    readOnly={isPosted}
                    values={formik.values}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('returnReasonId', newValue?.recordId || null)
                    }}
                    error={formik.touched.returnReasonId && Boolean(formik.errors.returnReasonId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={formik.values.clientId && BusinessPartnerRepository.MasterData.qry}
                    parameters={`_clientId=${formik.values.clientId}&_params=&_startAt=0&_pageSize=1000&_sortBy=recordId`}
                    name='contactId'
                    label={labels.contact}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    readOnly
                    values={formik.values}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('contactId', newValue?.recordId || null)
                    }}
                    error={formik.touched.contactId && Boolean(formik.errors.contactId)}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={3}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SaleRepository.SalesZone.qry}
                    parameters={`_startAt=0&_pageSize=1000&_sortField="recordId"&_filter=`}
                    name='szId'
                    label={labels.salesZone}
                    valueField='recordId'
                    maxAccess={maxAccess}
                    displayField='name'
                    readOnly={isPosted}
                    values={formik.values}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('szId', newValue?.recordId || null)
                    }}
                    error={formik.touched.szId && Boolean(formik.errors.szId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={InventoryRepository.Site.qry}
                    name='siteId'
                    readOnly={
                      isPosted || formik.values.isDefaultDtPresent
                        ? formik?.values?.dtId && !formik?.values?.commitItems
                        : false
                    }
                    label={labels.sites}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik.values}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    maxAccess={maxAccess}
                    required={
                      formik.values.isDefaultDtPresent
                        ? !formik?.values?.dtId || (formik?.values?.dtId && formik?.values?.commitItems)
                        : true
                    }
                    onChange={(event, newValue) => {
                      formik.setFieldValue('siteRef', newValue?.reference || '')
                      formik.setFieldValue('siteName', newValue?.name || '')
                      formik.setFieldValue('siteId', newValue?.recordId || null)
                    }}
                    error={formik.touched.siteId && Boolean(formik.errors.siteId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextArea
                    name='billAddress'
                    label={labels.billTo}
                    value={formik.values.billAddress}
                    rows={3}
                    maxLength='100'
                    readOnly={!formik.values.clientId || isPosted}
                    maxAccess={maxAccess}
                    viewDropDown={formik.values.clientId && !isPosted}
                    onChange={e => formik.setFieldValue('billAddress', e.target.value)}
                    onClear={() => {
                      formik.setFieldValue('billAddressId', null)
                      formik.setFieldValue('billAddress', '')
                    }}
                    onDropDown={() => openAddressFilterForm()}
                    error={formik?.touched.billAddress && Boolean(formik?.errors.billAddress)}
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
              rowsUpdate.current = value
              action === 'delete' && setReCal(true)
            }}
            value={formik.values.items}
            error={formik.errors.items}
            columns={columns}
            name='items'
            maxAccess={maxAccess}
            disabled={!formik.values.clientId || formik.values.invoiceId || isPosted}
            allowDelete={!isPosted && !formik.values.invoiceId}
            onValidationRequired={onValidationRequired}
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
                  readOnly={isPosted}
                  maxAccess={maxAccess}
                  onChange={e => formik.setFieldValue('description', e.target.value)}
                  onClear={() => formik.setFieldValue('description', '')}
                  error={formik.touched.description && Boolean(formik.errors.description)}
                />
              </Grid>
            </Grid>
            <Grid item xs={3}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <CustomNumberField name='totalQTY' label={labels.totalQty} value={totalQty} readOnly />
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
                    readOnly={isPosted}
                    isPercentIcon={cycleButtonState.text === '%' ? true : false}
                    cycleButtonLabel={cycleButtonState.text}
                    decimalScale={2}
                    handleButtonClick={handleDiscountButtonClick}
                    ShowDiscountIcons={true}
                    iconKey={cycleButtonState.text}
                    onChange={e => {
                      let discount = Number(e.target.value.replace(/,/g, ''))
                      if (formik.values.tdType == 1) {
                        if (discount < 0 || parseInt(subtotal) < discount) discount = 0
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
                    name='vatAmount'
                    maxAccess={maxAccess}
                    label={labels.vat}
                    value={vatAmount}
                    readOnly
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='amount'
                    maxAccess={maxAccess}
                    label={labels.amount}
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
