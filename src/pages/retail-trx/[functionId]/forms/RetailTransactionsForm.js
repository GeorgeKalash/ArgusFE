import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { formatDateForGetApI, formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import { Grid, FormControlLabel, Checkbox, Button } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
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
import { getDiscValues, getFooterTotals, getSubtotal } from 'src/utils/FooterCalculator'
import { useError } from 'src/error'
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'
import NormalDialog from 'src/components/Shared/NormalDialog'
import { PointofSaleRepository } from 'src/repositories/PointofSaleRepository'
import { AddressFormShell } from 'src/components/Shared/AddressFormShell'
import { SystemChecks } from 'src/resources/SystemChecks'

export default function RetailTransactionsForm({ labels, posUser, access, recordId, functionId, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack: stackError } = useError()
  const { stack } = useWindow()
  const { platformLabels, defaultsData, userDefaultsData } = useContext(ControlContext)
  const [address, setAddress] = useState({})
  const [reCal, setReCal] = useState(false)

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
      spId: null,
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
      deliveryNotes: null,
      name: null,
      street1: null,
      street2: null,
      countryId: null,
      cityId: null,
      phone: null,
      city: null,
      defPriceType: null
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
        mdType: null,
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
        ccId: null,
        ccRef: null
      }
    ]
  }

  const invalidate = useInvalidate({
    endpointId: SaleRepository.SalesTransaction.qry
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
        spId: yup.string().required()
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
          cashAccountRef: yup.string().required(),
          amount: yup.number().required()
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
        taxes: [
          ...[
            ...obj.taxes,
            ...obj.items
              .filter(({ taxDetails }) => taxDetails && taxDetails?.length > 0)
              .map(({ taxDetails, id }) => ({
                seqNo: id,
                ...taxDetails[0]
              }))
          ].filter(tax => obj.items.some(item => item.id === tax.seqNo))
        ],
        ...(({ header, items, taxes, ...rest }) => rest)(obj)
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

  const isPosted = formik.values.header.status === 3
  const editMode = !!formik.values.header.recordId

  async function barcodeSkuSelection(update, ItemConvertPrice, itemPhysProp, itemInfo, setItemInfo) {
    const weight = parseFloat(itemPhysProp?.weight || 0).toFixed(2)
    const metalPurity = itemPhysProp?.metalPurity ?? 0
    const isMetal = itemPhysProp?.isMetal ?? false
    const metalId = itemPhysProp?.metalId ?? null

    const postMetalToFinancials = formik?.values?.header?.postMetalToFinancials ?? false
    const KGmetalPrice = formik?.values?.header?.KGmetalPrice ?? 0
    const basePrice = (KGmetalPrice * metalPurity) / 1000
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
      if (itemInfo.taxId) {
        const taxDetailsResponse = await getTaxDetails(itemInfo.taxId)

        const details = taxDetailsResponse.map(item => ({
          invoiceId: formik.values.recordId,
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
      mdAmount: formik.values.header.maxDiscount ? parseFloat(formik.values.header.maxDiscount).toFixed(2) : 0,
      mdValue: 0,
      mdType: MDTYPE_PCT,
      extendedPrice: parseFloat('0').toFixed(2),
      mdValue: 0,
      taxId: rowTax,
      minPrice,
      taxDetails: rowTaxDetails
    })

    formik.setFieldValue(
      'header.mdAmount',
      formik.values.header.currentDiscount ? formik.values.header.currentDiscount : 0
    )
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
        const itemPhysProp = await getItemPhysProp(ItemConvertPrice?.itemId)
        const itemInfo = await getItem(ItemConvertPrice?.itemId)
        await barcodeSkuSelection(update, ItemConvertPrice, itemPhysProp, itemInfo, true)
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
        if (!newRow.itemId) return
        const itemPhysProp = await getItemPhysProp(newRow.itemId)
        const itemInfo = await getItem(newRow.itemId)
        const ItemConvertPrice = await getItemConvertPrice(newRow.itemId)
        await barcodeSkuSelection(update, ItemConvertPrice, itemPhysProp, itemInfo, false)
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
        getItemPriceRow(update, newRow, DIRTYFIELD_QTY)
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
      label: labels.totalPricePerG,
      name: 'totPricePerG',
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
      async onChange({ row: { update, oldRow, newRow } }) {
        const unitPrice = parseFloat(newRow.unitPrice || 0).toFixed(3)
        const minPrice = parseFloat(oldRow?.minPrice || 0).toFixed(3)

        if (parseFloat(minPrice) > 0 && parseFloat(unitPrice) < parseFloat(minPrice)) {
          ShowMinPriceValueErrorMessage(minPrice, unitPrice)
        }
        getItemPriceRow(update, newRow, DIRTYFIELD_UNIT_PRICE)
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
        getItemPriceRow(update, newRow, DIRTYFIELD_MDAMOUNT)
        checkMdAmountPct(newRow, update)
      }
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

  const cashColumns = [
    {
      component: 'resourcecombobox',
      label: labels.cashbox,
      name: 'cashAccountRef',
      props: {
        endpointId: PointofSaleRepository.CashAccount.qry,
        parameters: `_posId= parseInt(posUser?.posId) `,
        displayField: 'reference',
        valueField: 'recordId',
        mapping: [
          { from: 'reference', to: 'cashAccountRef' },
          { from: 'name', to: 'cashAccountName' },
          { from: 'recordId', to: 'cashAccountId' }
        ]
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
        displayField: 'reference',
        valueField: 'recordId'
      }
    },
    {
      component: 'numberfield',
      label: labels.bankFees,
      name: 'bankFees'
    },
    {
      component: 'textfield',
      label: labels.reference,
      name: 'receiptRef'
    }
  ]

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

    getItemPriceRow(updateRow, newRow, DIRTYFIELD_MDTYPE, true)
    checkMdAmountPct(newRow, updateRow)
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
      invalidate()
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
      key: 'ClientSalesTransaction',
      condition: true,
      onClick: 'onClientSalesTransaction',
      disabled: !formik.values.header?.clientId
    }
  ]

  async function fillForm(saTrxPack) {
    const saTrxHeader = saTrxPack?.header
    const saTrxItems = saTrxPack?.items
    const saTrxTaxes = saTrxPack?.taxes
    const billAdd = await getAddress(saTrxHeader?.billAddressId)

    const modifiedList = await Promise.all(
      saTrxItems?.map(async (item, index) => {
        const taxDetailsResponse = saTrxHeader.isVattable ? await getTaxDetails(item.taxId) : null

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
          taxDetails: updatedSaTrxTaxes
        }
      })
    )
    formik.setValues({
      ...formik.values,
      recordId: saTrxHeader.recordId || null,
      header: {
        ...formik.values.header,
        ...saTrxHeader,
        amount: parseFloat(saTrxHeader?.amount).toFixed(2),
        billAddress: billAdd,
        currentDiscount:
          saTrxHeader?.tdType == 1 || saTrxHeader?.tdType == null ? saTrxHeader?.tdAmount : saTrxHeader?.tdPct,
        KGmetalPrice: saTrxHeader?.KGmetalPrice * 1000
      },
      items: modifiedList,
      taxes: [...saTrxTaxes]
    })

    // const res = await getClientInfo(saTrxHeader.clientId)
    // getClientBalance(res?.record?.accountId, saTrxHeader.currencyId)
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

  async function getAddress(addressId) {
    if (!addressId) return null

    const res = await getRequest({
      extension: SystemRepository.FormattedAddress.get,
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
    const res = await getRequest({
      extension: FinancialRepository.TaxDetailPack.qry,
      parameters: `_taxId=${taxId}`
    })

    return res?.list
  }

  async function getItemConvertPrice(itemId) {
    const res = await getRequest({
      extension: SaleRepository.ItemConvertPrice.get,
      parameters: `_itemId=${itemId}&_clientId=${formik.values.header.clientId}&_currencyId=${formik.values.header.currencyId}&_plId=${formik.values.header.plId}`
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

  function getItemPriceRow(update, newRow, dirtyField, iconClicked) {
    !reCal && setReCal(true)

    const itemPriceRow = getIPR({
      priceType: newRow?.priceType,
      basePrice: parseFloat(newRow?.basePrice || 0),
      volume: parseFloat(newRow?.volume),
      weight: parseFloat(newRow?.weight),
      unitPrice: parseFloat(newRow?.unitPrice || 0),
      upo: parseFloat(newRow?.upo) ? parseFloat(newRow?.upo) : 0,
      qty: parseFloat(newRow?.qty),
      extendedPrice: parseFloat(newRow?.extendedPrice),
      mdAmount: parseFloat(newRow?.mdAmount) || 0,
      mdType: newRow?.mdType,
      mdValue: parseFloat(newRow?.mdValue),
      baseLaborPrice: newRow?.baseLaborPrice,
      totalPricePerG: newRow?.totalPricePerG,
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
      taxDetails: formik.values.header.isVattable ? newRow.taxDetails : null
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
      basePrice: parseFloat(item.basePrice) || 0,
      unitPrice: parseFloat(item.unitPrice) || 0,
      upo: parseFloat(item.upo) || 0,
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
    totalUpo: 0,
    sumVat: 0,
    sumExtended: parseFloat(subTotal),
    tdAmount: parseFloat(formik.values.header.tdAmount),
    net: 0,
    miscAmount: miscValue
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
      if (item?.taxDetails?.length > 0) item.taxDetails = [item.taxDetails[0]]

      const vatCalcRow = getVatCalc({
        basePrice: parseFloat(item?.basePrice),
        qty: parseFloat(item?.qty),
        extendedPrice: parseFloat(item?.extendedPrice),
        baseLaborPrice: parseFloat(item?.baseLaborPrice),
        vatAmount: parseFloat(item?.vatAmount),
        tdPct: parseFloat(tdPct),
        taxDetails: item.taxDetails
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
      getItemPriceRow(update, rowData, DIRTYFIELD_MDAMOUNT)
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
      getItemPriceRow(update, rowData, DIRTYFIELD_MDAMOUNT)
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

  const getResourceId = functionId => {
    switch (functionId) {
      case SystemFunction.SalesInvoice:
        return ResourceIds.SalesInvoice
      case SystemFunction.SalesReturn:
        return ResourceIds.SaleReturn
      case SystemFunction.ConsignmentIn:
        return ResourceIds.ClientGOCIn
      case SystemFunction.ConsignmentOut:
        return ResourceIds.ClientGOCOut
      default:
        return null
    }
  }

  async function previewBtnClicked() {
    const data = { printStatus: 2, recordId: formik.values.header.recordId }

    await postRequest({
      extension: SaleRepository.FlagTR,
      record: JSON.stringify(data)
    })

    invalidate()
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
    let tax = false
    switch (functionId) {
      case SystemFunction.RetailInvoice:
        isVat = posUser?.applyTaxIVC
        tax = pos?.applyTaxIVC ? posUser?.taxId : null
        break
      case SystemFunction.RetailReturn:
        isVat = posUser?.applyTaxRET
        tax = pos?.applyTaxRET ? posUser?.taxId : null
        break
      case SystemFunction.RetailPurchase:
        isVat = posUser?.applyTaxPUR
        tax = pos?.applyTaxPUR ? posUser?.taxId : null
        break
      default:
        break
    }
    const hasSingleCashPos = checkSingleCashPos?.record?.value
    const countryId = defaultsData?.list?.find(({ key }) => key === 'country')
    formik.setFieldValue('singleCashPos', hasSingleCashPos)
    formik.setFieldValue('header.isVatable', isVat)
    formik.setFieldValue('header.taxId', tax)
    formik.setFieldValue('header.currencyId', posInfo?.currencyId)
    formik.setFieldValue('header.currencyRef', posInfo?.currencyRef)
    formik.setFieldValue('header.plantId', posInfo?.plantId)
    formik.setFieldValue('header.plantName', posInfo?.plantName)
    formik.setFieldValue('header.siteId', posInfo?.siteId)
    formik.setFieldValue('header.siteName', posInfo?.siteName)
    formik.setFieldValue('header.posRef', posInfo?.reference)
    formik.setFieldValue('header.plId', posInfo?.plId)
    formik.setFieldValue('header.dtId', posInfo?.dtId)
    formik.setFieldValue('header.spId', posUser?.spId)
    formik.setFieldValue('header.countryId', countryId?.value)
  }

  useEffect(() => {}, [address])

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
      if (recordId) {
        const transactionPack = await getSalesTransactionPack(recordId)
        await fillForm(transactionPack)
      } else {
        await setMetalPriceOperations()
        const res = await getPosInfo()
        await setDefaults(res?.record)
      }
    })()
  }, [])

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
          <Grid container spacing={4} xs={12}>
            <Grid item xs={4}>
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
                      formik.setFieldValue('header.dtId', newValue.recordId)
                    }}
                    error={formik.touched.dtId && Boolean(formik.errors.dtId)}
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
                    error={formik.touched.reference && Boolean(formik.errors.reference)}
                  />
                </Grid>
                <Grid item xs={12}>
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
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={PointofSaleRepository.RetailInvoice.level}
                    reducer={response => {
                      return response?.record?.salesPeople?.filter(item => item.inActive === false)
                    }}
                    parameters={`_posId=${parseInt(posUser?.posId)}&_functionId=${functionId}`}
                    name='spId'
                    readOnly={isPosted}
                    label={labels.salesPerson}
                    columnsInDropDown={[
                      { key: 'spRef', value: 'Reference' },
                      { key: 'spName', value: 'Name' }
                    ]}
                    valueField='recordId'
                    displayField='name'
                    values={formik.values.header}
                    maxAccess={maxAccess}
                    displayFieldWidth={1.5}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('header.spId', newValue ? newValue.recordId : null)
                    }}
                    error={formik.touched.spId && Boolean(formik.errors.spId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='KGmetalPrice'
                    maxAccess={maxAccess}
                    label={labels.metalPrice}
                    value={formik.values.header.KGmetalPrice}
                    onChange={formik.handleChange}
                    readOnly={editMode}
                    hidden={!formik.values.baseMetalCuId}
                    onClear={() => formik.setFieldValue('header.KGmetalPrice', '')}
                    error={formik.touched.KGmetalPrice && Boolean(formik.errors.KGmetalPrice)}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={4}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <CustomTextField
                    name='name'
                    label={labels.name}
                    value={formik?.values?.header?.name}
                    maxAccess={maxAccess}
                    readOnly={editMode}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('header.name', '')}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='street1'
                    label={labels.street1}
                    value={formik?.values?.header?.street1}
                    maxAccess={maxAccess}
                    readOnly={isPosted}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('header.street1', '')}
                    error={formik.touched.street1 && Boolean(formik.errors.street1)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='street2'
                    label={labels.street2}
                    value={formik?.values?.header?.street2}
                    maxAccess={maxAccess}
                    readOnly={isPosted}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('header.street2', '')}
                    error={formik.touched.street2 && Boolean(formik.errors.street2)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceLookup
                    endpointId={SystemRepository.City.snapshot}
                    parameters={{
                      _countryId: formik.values.header.countryId
                    }}
                    valueField='name'
                    displayField='name'
                    name='cityId'
                    label={labels.city}
                    readOnly={isPosted}
                    form={formik}
                    secondDisplayField={false}
                    onChange={() => {}}
                    errorCheck={'cityId'}
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={7}>
                  <CustomTextField
                    name='phone'
                    label={labels.phone}
                    value={formik.values.phone}
                    readOnly={isPosted}
                    maxLength='15'
                    phone={true}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('phone', '')}
                    error={formik.touched.phone && Boolean(formik.errors.phone)}
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={5}>
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

            <Grid item xs={4}>
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
                    error={formik.touched.posRef && Boolean(formik.errors.posRef)}
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
                    error={formik.touched.plantName && Boolean(formik.errors.plantName)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='siteName'
                    label={labels.site}
                    value={formik?.values?.header?.siteRef}
                    maxAccess={maxAccess}
                    readOnly
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('header.siteRef', '')}
                    error={formik.touched.siteRef && Boolean(formik.errors.siteRef)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='currencyName'
                    label={labels.currency}
                    value={formik?.values?.header?.currencyRef}
                    maxAccess={maxAccess}
                    readOnly
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('header.currencyRef', '')}
                    error={formik.touched.currencyRef && Boolean(formik.errors.currencyRef)}
                  />
                </Grid>
                <Grid item xs={10}>
                  <CustomTextField
                    name='taxName'
                    label={labels.tax}
                    value={formik?.values?.header?.taxRef}
                    maxAccess={maxAccess}
                    readOnly
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('header.taxRef', '')}
                    error={formik.touched.taxRef && Boolean(formik.errors.taxRef)}
                  />
                </Grid>
                <Grid item xs={2}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name='header.isVatable'
                        checked={formik.values?.header?.isVatable}
                        onChange={formik.handleChange}
                        disabled={formik?.values?.items?.some(item => item.sku)}
                      />
                    }
                    label={labels.vat}
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
            value={formik?.values?.items}
            error={formik.errors.items}
            name='items'
            columns={columns}
            maxAccess={maxAccess}
            disabled={isPosted || !formik.values.header.clientId || !formik.values.header.currencyId}
          />
        </Grow>

        <Fixed>
          <Grid container rowGap={1} xs={12}>
            <Grid container rowGap={1} xs={6}>
              <DataGrid
                onChange={(value, action) => {
                  formik.setFieldValue('cash', value)
                  action === 'delete'
                }}
                value={formik?.values?.cash}
                error={formik.errors.cash}
                name='cash'
                columns={cashColumns}
                maxAccess={maxAccess}
              />
            </Grid>

            <Grid container direction='row' xs={6} spacing={2} sx={{ pl: 2 }}>
              <Grid container item xs={6} direction='column' spacing={1} sx={{ mt: 1 }}>
                <Grid item>
                  <CustomNumberField name='qty' maxAccess={maxAccess} label={labels.totQty} value={totalQty} readOnly />
                </Grid>
                <Grid item>
                  <CustomNumberField
                    name='weight'
                    maxAccess={maxAccess}
                    label={labels.totWeight}
                    value={totalWeight}
                    readOnly
                  />
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
                    value={formik.values.header.balance}
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
