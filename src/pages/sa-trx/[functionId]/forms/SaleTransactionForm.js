import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { formatDateFromApi, formatDateToApi, formatDateToApiFunction } from 'src/lib/date-helper'
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
  DIRTYFIELD_BASE_LABOR_PRICE,
  DIRTYFIELD_TWPG,
  DIRTYFIELD_UNIT_PRICE,
  DIRTYFIELD_MDAMOUNT,
  DIRTYFIELD_UPO,
  DIRTYFIELD_EXTENDED_PRICE
} from 'src/utils/ItemPriceCalculator'
import { getVatCalc } from 'src/utils/VatCalculator'
import { getDiscValues, getFooterTotals, getSubtotal } from 'src/utils/FooterCalculator'
import AddressFilterForm from '../../../sales-order/Tabs/AddressFilterForm'
import { AddressFormShell } from 'src/components/Shared/AddressFormShell'
import { MultiCurrencyRepository } from 'src/repositories/MultiCurrencyRepository'
import { RateDivision } from 'src/resources/RateDivision'

export default function SaleTransactionForm({ labels, access: maxAccess, recordId, functionId, defaultSalesTD }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)
  const [cycleButtonState, setCycleButtonState] = useState({ text: '%', value: 2 })
  const [address, setAddress] = useState({})
  const [measurements, setMeasurements] = useState([])
  const [filteredMu, setFilteredMU] = useState([])
  const [metalPriceVisibility, setmetalPriceVisibility] = useState(false)

  const [initialValues, setInitialData] = useState({
    header: {
      dgId: functionId,
      recordId: recordId || null,
      dtId: null,
      reference: '',
      date: new Date(),
      dueDate: new Date(),
      plantId: null,
      clientId: '',
      clientName: '',
      clientRef: '',
      currencyId: null,
      szId: '',
      spId: null,
      siteId: null,
      description: '',
      status: 1,
      isVattable: false,
      taxId: '',
      subtotal: '',
      miscAmount: 0,
      amount: 0,
      vatAmount: 0,
      tdAmount: 0,
      plId: '',
      ptId: '',
      billAddressId: '',
      billAddress: '',
      maxDiscount: '',
      currentDiscount: '',
      exRate: 1,
      rateCalcMethod: 1,
      tdType: '',
      tdPct: 0,
      baseAmount: 0,
      volume: 0,
      weight: 0,
      qty: 0,
      isVerified: false,
      contactId: null,
      postMetalToFinancials: false,
      commitItems: false,
      postMetalToFinancials: false,
      isMetal: false,
      metalId: null,
      metalPurity: 0,
      metalPrice: 0,
      KGmetalPrice: 0
    },
    items: [
      {
        id: 1,
        orderId: recordId || 0,
        itemId: '',
        sku: '',
        itemName: '',
        seqNo: 1,
        siteId: '',
        muId: '',
        qty: 0,
        volume: 0,
        weight: 1,
        msId: 0,
        muId: 0,
        muRef: '',
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
        applyVat: false,
        taxId: '',
        taxDetails: null,
        notes: ''
      }
    ],
    serials: [],
    lots: [],
    taxes: []
  })

  const invalidate = useInvalidate({
    endpointId: SaleRepository.SalesTransaction.qry
  })

  const { formik } = useForm({
    maxAccess,
    initialValues,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      header: yup.object({
        date: yup.string().required(),
        currencyId: yup.string().required(),
        clientId: yup.string().required()
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
      /*
      public class InvoicePack :ModelBase
      {
          public SaleTransaction header;
          public List<SaleItem> items;
          public List<ItemLot> lots;
          public List<TrxSerial> serials;
          public List<SalesInvoiceTaxCode> taxes;
      }
      */

      try {
        const payload = {
          header: {
            ...obj.header,
            date: formatDateToApiFunction(obj.header.date),
            dueDate: formatDateToApiFunction(obj.header.dueDate)
          },
          items: obj.items.map(({ id, isVattable, taxDetails, ...rest }) => ({
            seqNo: id,
            applyVat: isVattable,
            ...rest
          })),
          ...obj
        }

        const soRes = await postRequest({
          extension: SaleRepository.SalesTransaction.set2,
          record: JSON.stringify(payload)
        })
        const actionMessage = editMode ? platformLabels.Edited : platformLabels.Added
        toast.success(actionMessage)
        await refetchForm(soRes.recordId)
        invalidate()
      } catch (error) {}
    }
  })

  const editMode = !!formik.values.header.recordId

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
        displayFieldWidth: 5
      },
      async onChange({ row: { update, newRow } }) {
        if (!newRow.itemId) return
        const itemPhysProp = await getItemPhysProp(newRow.itemId)
        const itemInfo = await getItem(newRow.itemId)
        const ItemConvertPrice = await getItemConvertPrice(newRow.itemId)
        const metalPurity = itemPhysProp?.metalPurity ?? 0
        const isMetal = itemPhysProp?.isMetal ?? false
        const metalId = itemPhysProp?.metalId ?? false
        let rowTax = null
        let rowTaxDetails = null

        if (!formik.values.header.taxId) {
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
          const taxDetailsResponse = await getTaxDetails(formik.values.header.taxId)

          const details = taxDetailsResponse.map(item => ({
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
          isMetal: isMetal,
          metalId: metalId,
          metalPurity: metalPurity,
          volume: parseFloat(itemPhysProp?.volume) || 0,
          weight: parseFloat(itemPhysProp?.weight || 0).toFixed(2),
          basePrice: parseFloat(ItemConvertPrice?.basePrice || 0).toFixed(5),
          unitPrice: parseFloat(ItemConvertPrice?.unitPrice || 0).toFixed(3),
          upo: parseFloat(ItemConvertPrice?.upo || 0).toFixed(2),
          priceType: ItemConvertPrice?.priceType || 1,
          mdAmount: 0,
          qty: 0,
          msId: itemInfo?.msId,
          muRef: filteredMeasurements?.[0]?.reference,
          muId: filteredMeasurements?.[0]?.recordId,
          extendedPrice: parseFloat('0').toFixed(2),
          mdValue: 0,
          taxId: rowTax,
          taxDetails: rowTaxDetails
        })

        formik.setFieldValue(
          'header.mdAmount',
          formik.values.header.currentDiscount ? formik.values.header.currentDiscount : 0
        )
      }
    },
    {
      component: 'textfield',
      label: labels.itemName,
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
      component: 'resourcecombobox',
      label: labels.measurementUnit,
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

      // propsReducer({ row, props }) {
      //   return { ...props, store: filters[row.itemId]?.list ?? [] }
      // },
      async onChange({ row: { update, newRow } }) {
        try {
          if (newRow) {
            const qtyInBase = newRow?.qty * newRow?.muQty

            update({
              qtyInBase,
              muQty: newRow?.muQty
            })
          }
        } catch (exception) {}
      }
    },
    {
      component: 'numberfield',
      label: labels.quantity,
      name: 'qty',
      updateOn: 'blur',
      onChange({ row: { update, newRow } }) {
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
        getItemPriceRow(update, newRow, DIRTYFIELD_UPO)
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
        getItemPriceRow(update, newRow, DIRTYFIELD_MDAMOUNT)
        checkMdAmountPct(newRow, update)
      }
    },
    {
      component: 'numberfield',
      label: labels.sales,
      name: 'saTrx'
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
    }
  ]

  async function fillForm(soHeader, soItems) {
    const billAdd = await getAddress(soHeader?.record?.billAddressId)

    soHeader?.record?.tdType == 1 || soHeader?.record?.tdType == null
      ? setCycleButtonState({ text: '123', value: 1 })
      : setCycleButtonState({ text: '%', value: 2 })

    const modifiedList = soItems.list?.map((item, index) => ({
      ...item,
      id: index + 1,
      basePrice: parseFloat(item.basePrice).toFixed(5),
      unitPrice: parseFloat(item.unitPrice).toFixed(3),
      upo: parseFloat(item.upo).toFixed(2),
      vatAmount: parseFloat(item.vatAmount).toFixed(2),
      extendedPrice: parseFloat(item.extendedPrice).toFixed(2)
    }))
    formik.setValues({
      ...formik.values,
      header: {
        ...formik.values.header,
        ...soHeader.record,
        tdAmount:
          soHeader?.record?.tdType == 1 || soHeader?.record?.tdType == null
            ? soHeader?.record?.tdAmount
            : soHeader?.record?.tdPct,
        amount: parseFloat(soHeader?.record?.amount).toFixed(2),
        billAddress: billAdd,
        currentDiscount: soHeader?.record?.tdAmount
      },
      items: modifiedList
    })
  }

  async function getSalesTransactionHeader(transactionId) {
    const res = await getRequest({
      extension: SaleRepository.SalesTransaction.get,
      parameters: `_recordId=${transactionId}`
    })

    res.record.date = formatDateFromApi(res?.record?.date)

    return res
  }

  async function getSalesTransactionItems(transactionId) {
    return await getRequest({
      extension: SaleRepository.SalesTransactionItems.qry,
      parameters: `_params=1|${transactionId}&_pageSize=3000&_startAt=0&_sortBy=seqno`
    })
  }

  const getMeasurementUnits = async () => {
    return await getRequest({
      extension: InventoryRepository.MeasurementUnit.qry,
      parameters: `_msId=0`
    })
  }

  async function getDefaultByKey(key) {
    try {
      const res = await getRequest({
        extension: SystemRepository.Defaults.get,
        parameters: `_filter=&_key=${key}`
      })

      return res?.record?.value
    } catch (error) {}
  }

  async function fillMetalPrice(baseMetalCuId) {
    //get currencyId from SY.getDE? key = baseMetalCuId
    //if a null value is returned, you stop here

    if (baseMetalCuId) {
      const res = await getRequest({
        extension: MultiCurrencyRepository.Currency.get,
        parameters: `_currencyId=${baseMetalCuId}&&_date=${formatDateToApiFunction(
          formik.values.header.date
        )}&_rateDivision=${RateDivision.SALES}`
      })

      return res.record.exRate * 1000
    }
  }

  async function setMetalPriceOperations() {
    const MCbaseCU = await getDefaultByKey('baseMetalCuId')
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
    if (!addressId) return null

    const res = await getRequest({
      extension: SystemRepository.FormattedAddress.get,
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
    if (!clientId) return

    try {
      const res = await getRequest({
        extension: SaleRepository.Client.get,
        parameters: `_recordId=${clientId}`
      })

      const record = res?.record || {}
      const accountId = record.accountId
      const currencyId = record.currencyId ?? formik.values.header.currencyId
      const billAdd = await getAddress(record.billAddressId)

      formik.setValues({
        ...formik.values,
        header: {
          ...formik.values.header,
          clientId: clientObject?.recordId,
          clientName: clientObject?.name,
          clientRef: clientObject?.reference,
          isVattable: clientObject?.isSubjectToVAT || false,
          maxDiscount: clientObject?.maxDiscount,
          currentDiscount: clientObject?.tdPct,
          taxId: clientObject?.taxId,
          currencyId: record.currencyId,
          spId: record.spId,
          ptId: record.ptId ?? defaultPtId,
          plId: record.plId ?? defaultPlId,
          szId: record.szId,
          billAddressId: record.billAddressId
        }
      })

      formik.setFieldValue('header.billAddress', billAdd)

      const accountLimit = await getAccountLimit(currencyId, accountId)
      formik.setFieldValue('header.creditLimit', accountLimit?.limit ?? 0)
    } catch (error) {}
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

  const handleCycleButtonClick = () => {
    let currentTdAmount
    let currentPctAmount

    if (cycleButtonState.value == 1) {
      currentPctAmount =
        formik.values.header.currentDiscount < 0 || formik.values.header.currentDiscount > 100
          ? 0
          : formik.values.header.currentDiscount

      currentTdAmount = (parseFloat(currentPctAmount) * parseFloat(formik.values.header.subtotal)) / 100
      formik.setFieldValue('header.tdAmount', currentTdAmount)
      formik.setFieldValue('header.tdPct', currentPctAmount)
    } else {
      currentTdAmount =
        formik.values.header.currentDiscount < 0 || formik.values.header.subtotal < formik.values.header.currentDiscount
          ? 0
          : formik.values.header.currentDiscount
      currentPctAmount = (parseFloat(currentTdAmount) / parseFloat(formik.values.header.subtotal)) * 100
      formik.setFieldValue('header.tdPct', currentPctAmount)
      formik.setFieldValue('header.tdAmount', currentTdAmount)
    }
    setCycleButtonState(prevState => {
      const newState = prevState.text === '%' ? { text: '123', value: 1 } : { text: '%', value: 2 }

      formik.setFieldValue('header.tdType', newState.value)
      recalcGridVat(newState.value, currentPctAmount, currentTdAmount, formik.values.header.currentDiscount)
      calcTotals(formik.values.items, currentTdAmount)

      return newState
    })
  }

  function getItemPriceRow(update, newRow, dirtyField) {
    const itemPriceRow = getIPR({
      priceType: newRow?.priceType,
      basePrice: parseFloat(newRow?.basePrice || 0),
      volume: newRow?.volume,
      weight: parseFloat(newRow?.weight),
      unitPrice: parseFloat(newRow?.unitPrice || 0),
      upo: parseFloat(newRow?.upo) ? parseFloat(newRow?.upo) : 0,
      qty: newRow?.qty,
      extendedPrice: parseFloat(newRow?.extendedPrice),
      mdAmount: parseFloat(newRow?.mdAmount),
      mdType: newRow?.mdType,
      baseLaborPrice: newRow?.baseLaborPrice,
      totalWeightPerG: newRow?.totalWeightPerG,
      mdValue: parseFloat(newRow?.mdValue),
      tdPct: formik?.values?.header?.tdPct,
      dirtyField: dirtyField
    })

    const vatCalcRow = getVatCalc({
      basePrice: itemPriceRow?.basePrice,
      unitPrice: itemPriceRow?.unitPrice,
      qty: itemPriceRow?.qty,
      extendedPrice: parseFloat(itemPriceRow?.extendedPrice),
      baseLaborPrice: itemPriceRow?.baseLaborPrice,
      vatAmount: parseFloat(itemPriceRow?.vatAmount),
      tdPct: formik?.values?.header?.tdPct,
      taxDetails: formik.values.header.isVatChecked ? null : newRow.taxDetails
    })

    console.log(vatCalcRow)

    update({
      id: newRow?.id,
      basePrice: parseFloat(itemPriceRow?.basePrice).toFixed(5),
      baseLaborPrice: parseFloat(itemPriceRow?.baseLaborPrice).toFixed(2),
      totalWeightPerG: parseFloat(itemPriceRow?.totalWeightPerG).toFixed(2),
      unitPrice: parseFloat(itemPriceRow?.unitPrice).toFixed(3),
      extendedPrice: parseFloat(itemPriceRow?.extendedPrice).toFixed(2),
      upo: parseFloat(itemPriceRow?.upo).toFixed(2),
      mdValue: itemPriceRow?.mdValue,
      mdType: itemPriceRow?.mdType,
      mdAmount: parseFloat(itemPriceRow?.mdAmount).toFixed(2),
      vatAmount: parseFloat(vatCalcRow?.vatAmount).toFixed(2)
    })
  }

  function calcTotals(itemsArray, tdAmount) {
    const parsedItemsArray = itemsArray
      .filter(item => item.itemId !== undefined)
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

    const subtotal = getSubtotal(parsedItemsArray)

    const _footerSummary = getFooterTotals(parsedItemsArray, {
      totalQty: 0,
      totalWeight: 0,
      totalVolume: 0,
      totalUpo: 0,
      sumVat: 0,
      sumExtended: parseFloat(subtotal),
      tdAmount: tdAmount || formik.values.header.tdAmount,
      net: 0,
      miscAmount: parseFloat(formik.values.header.miscAmount)
    })

    formik.setFieldValue('header.volume', _footerSummary?.totalVolume?.toFixed(2) || 0)
    formik.setFieldValue('header.weight', _footerSummary?.totalWeight?.toFixed(2) || 0)
    formik.setFieldValue('header.qty', _footerSummary?.totalQty.toFixed(2) || 0)
    formik.setFieldValue('header.subtotal', subtotal?.toFixed(2) || 0)
    formik.setFieldValue('header.amount', _footerSummary?.net?.toFixed(2) || 0)
    formik.setFieldValue('header.vatAmount', _footerSummary?.sumVat.toFixed(2) || 0)
    formik.setFieldValue('header.baseAmount', _footerSummary?.net.toFixed(2) || 0)
  }

  function checkDiscount(typeChange, tdPct, tdAmount, currentDiscount) {
    const _discountObj = getDiscValues({
      tdAmount: parseFloat(currentDiscount),
      tdPlain: typeChange == 1,
      tdPct: typeChange == 2,
      tdType: typeChange,
      subtotal: parseFloat(formik.values.header.subtotal),
      currentDiscount: currentDiscount,
      hiddenTdPct: tdPct,
      hiddenTdAmount: parseFloat(tdAmount),
      typeChange: typeChange
    })
    formik.setFieldValue('header.tdAmount', _discountObj?.tdAmount?.toFixed(2) || 0)
    formik.setFieldValue('header.tdType', _discountObj?.tdType)
    formik.setFieldValue('header.currentDiscount', _discountObj?.currentDiscount || 0)
    formik.setFieldValue('header.tdPct', _discountObj?.hiddenTdPct)
    formik.setFieldValue('header.tdAmount', _discountObj?.hiddenTdAmount?.toFixed(2))
  }

  function recalcNewVat(tdPct) {
    formik.values.items.map(item => {
      const vatCalcRow = getVatCalc({
        basePrice: parseFloat(item?.basePrice),
        qty: item?.qty,
        extendedPrice: parseFloat(item?.extendedPrice),
        baseLaborPrice: parseFloat(item?.baseLaborPrice),
        vatAmount: parseFloat(item?.vatAmount),
        tdPct: tdPct,
        taxDetails: item.taxDetails
      })

      const index = item.id - 1
      formik.setFieldValue(`items[${index}].vatAmount`, parseFloat(vatCalcRow?.vatAmount).toFixed(2))
    })
  }

  function recalcGridVat(typeChange, tdPct, tdAmount, currentDiscount) {
    checkDiscount(typeChange, tdPct, tdAmount, currentDiscount)
    recalcNewVat(tdPct)
  }

  function ShowMdAmountErrorMessage(actualDiscount, clientMaxDiscount, rowData, update) {
    if (actualDiscount > clientMaxDiscount) {
      formik.setFieldValue('header.mdAmount', clientMaxDiscount)
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
      formik.setFieldValue('header.mdType', 2)
      formik.setFieldValue('header.mdAmount', clientMaxDiscountValue)
      rowData.mdType = 2
      rowData.mdAmount = clientMaxDiscountValue
      getItemPriceRow(update, rowData, DIRTYFIELD_MDAMOUNT)
      calcTotals(formik.values.items)
      stackError({
        message: labels.clientMaxDiscount + ' ' + clientMaxDiscountValue
      })
    }
  }

  //   function checkMdAmountPct(rowData, update) {
  //     const maxClientAmountDiscount = rowData.unitPrice * (formik.values.header.maxDiscount / 100)
  //     if (!formik.values.header.maxDiscount) return
  //     if (rowData.mdType == 1) {
  //       if (rowData.mdAmount > formik.values.header.maxDiscount) {
  //         ShowMdAmountErrorMessage(value, clientMax, rowData, update)

  //         return false
  //       } else {
  //         return true
  //       }
  //     } else {
  //       if (rowData.mdAmount > maxClientAmountDiscount) {
  //         ShowMdValueErrorMessage(value, maxClientAmountDiscount, rowData, update)

  //         return false
  //       } else {
  //         return true
  //       }
  //     }
  //   }

  async function refetchForm(recordId) {
    const soHeader = await getSalesTransactionHeader(recordId)
    const soItems = await getSalesTransactionItems(recordId)
    await fillForm(soHeader, soItems)
  }

  function openAddressFilterForm(clickShip, clickBill) {
    stack({
      Component: AddressFilterForm,
      props: {
        maxAccess,
        labels,
        shipment: clickShip,
        bill: clickBill,
        form: formik
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

  function getDTD(dtId) {
    const res = getRequest({
      extension: SaleRepository.DocumentTypeDefault.get,
      parameters: `_dtId=${dtId}`
    })

    return res
  }

  useEffect(() => {
    ;(async function () {
      const muList = await getMeasurementUnits()
      setMeasurements(muList?.list)
      setMetalPriceOperations()

      if (recordId) {
        const transactionHeader = await getSalesTransactionHeader(recordId)
        const transactionItems = await getSalesTransactionItems(recordId)
        await fillForm(transactionHeader, transactionItems)
        calcTotals(transactionItems?.list, transactionHeader?.record?.tdAmount)
      } else {
        if (defaultSalesTD) {
          setCycleButtonState({ text: '%', value: 2 })
          formik.setFieldValue('header.tdType', 2)
        } else {
          setCycleButtonState({ text: '123', value: 1 })
          formik.setFieldValue('header.tdType', 1)
        }
      }
    })()
  }, [])

  useEffect(() => {
    calcTotals(formik.values.items)
  }, [formik.values.items])

  const getResourceId = functionId => {
    switch (functionId) {
      case SystemFunction.SalesInvoice:
        return ResourceIds.SalesInvoice
      case SystemFunction.SalesReturn:
        return ResourceIds.SalesReturn
      case SystemFunction.ConsignmentIn:
        return ResourceIds.ClientGOCIn
      case SystemFunction.ConsignmentOut:
        return ResourceIds.ClientGOCOut
      default:
        return null
    }
  }

  return (
    <FormShell
      resourceId={getResourceId(parseInt(formik.values.header.functionId))}
      form={formik}
      maxAccess={maxAccess}
      previewReport={editMode}
      actions={actions}
      editMode={editMode}
    >
      <VertLayout>
        <Fixed>
          <Grid container xs={12}>
            <Grid
              container
              xs={9}
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
                    parameters={`_startAt=0&_pageSize=1000&_dgId=${functionId}`}
                    name='dtId'
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
                        formik.setFieldValue('header.plantId', dtd?.record?.plantId)
                        formik.setFieldValue('header.spId', dtd?.record?.spId)
                        formik.setFieldValue('header.siteId', dtd?.record?.siteId)
                        formik.setFieldValue('header.commitItems', dtd?.record?.commitItems)
                        fillMetalPrice()
                        if (dtd?.record?.commitItems == false) formik.setFieldValue('header.siteId', null)
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
                    values={formik.values.header}
                    displayFieldWidth={1.5}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('header.spId', newValue ? newValue.recordId : null)
                    }}
                    error={formik.touched.spId && Boolean(formik.errors.spId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='creditLimit'
                    maxAccess={maxAccess}
                    label={labels.creditLimit}
                    value={formik.values.header.creditLimit}
                    readOnly
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SystemRepository.Plant.qry}
                    name='plantId'
                    label={labels.plant}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
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
              </Grid>
              <Grid
                container
                xs={12}
                direction='row'
                spacing={2}
                sx={{ overflowX: 'auto', flexWrap: 'nowrap', pl: '8px' }}
              >
                <Grid item xs={4}>
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
                <Grid item xs={4}>
                  <CustomDatePicker
                    name='date'
                    required
                    label={labels.date}
                    value={formik?.values?.header?.date}
                    onChange={formik.setFieldValue}
                    editMode={editMode}
                    maxAccess={maxAccess}
                    onClear={() => formik.setFieldValue('header.date', '')}
                    error={formik.touched.date && Boolean(formik.errors.date)}
                  />
                </Grid>
                <Grid item xs={4}>
                  <ResourceComboBox
                    endpointId={SaleRepository.SalesZone.qry}
                    parameters={`_startAt=0&_pageSize=1000&_sortField="recordId"&_filter=`}
                    name='szId'
                    label={labels.saleZone}
                    columnsInDropDown={[{ key: 'name', value: 'Name' }]}
                    valueField='recordId'
                    displayField='name'
                    values={formik.values.header}
                    displayFieldWidth={1.5}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('header.szId', newValue ? newValue.recordId : null)
                    }}
                    error={formik.touched.szId && Boolean(formik.errors.szId)}
                  />
                </Grid>
                <Grid item xs={4}>
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
                    readOnly={formik?.values?.header.commitItems == false}
                    required={formik?.values?.header.commitItems == true}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('header.siteId', newValue ? newValue.recordId : null)
                      formik.setFieldValue('header.siteRef', newValue ? newValue.reference : null)
                      formik.setFieldValue('header.siteName', newValue ? newValue.name : null)
                    }}
                    error={formik.touched.siteId && Boolean(formik.errors.siteId)}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid container xs={3} direction='column' spacing={2} sx={{ flexWrap: 'nowrap', pl: '5px' }}>
              <Grid container xs={12} direction='row' spacing={2} sx={{ flexWrap: 'nowrap' }}>
                <Grid item xs={12}>
                  <CustomTextArea
                    name='billAddress'
                    label={labels.billTo}
                    value={formik.values.header.billAddress}
                    rows={3}
                    maxLength='100'
                    maxAccess={maxAccess}
                    viewDropDown={formik.values.header.clientId}
                    onChange={e => formik.setFieldValue('header.BillAddress', e.target.value)}
                    onClear={() => formik.setFieldValue('header.BillAddress', '')}
                    onDropDown={() => openAddressFilterForm(false, true)}
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
                  name='header.clientId'
                  label={labels.client}
                  form={formik}
                  required
                  displayFieldWidth={3}
                  valueShow='header.clientRef'
                  secondValueShow='header.clientName'
                  maxAccess={maxAccess}
                  editMode={editMode}
                  columnsInDropDown={[
                    { key: 'reference', value: 'Reference' },
                    { key: 'name', value: 'Name' },
                    { key: 'szName', value: 'Sales Zone' },
                    { key: 'keywords', value: 'Keywords' },
                    { key: 'cgName', value: 'Client Group' }
                  ]}
                  onChange={async (event, newValue) => {
                    fillClientData(newValue)
                  }}
                  errorCheck={'header.clientId'}
                />
              </Grid>
              <Grid item xs={2}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name='header.isVattable'
                      checked={formik.values?.header?.isVattable}
                      disabled={formik?.values?.items[0]?.itemId}
                      onChange={formik.handleChange}
                    />
                  }
                  label={labels.VAT}
                />
              </Grid>
              <Grid item xs={5}>
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
                  values={formik.values.header}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('header.taxId', newValue ? newValue.recordId : '')
                  }}
                  error={formik.touched.taxId && Boolean(formik.errors.taxId)}
                  maxAccess={maxAccess}
                />
              </Grid>
              <Grid item xs={7}>
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
                  values={formik.values.header}
                  maxAccess={maxAccess}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('header.currencyId', newValue?.recordId || null)
                    formik.setFieldValue('items', [{ id: 1 }])
                  }}
                  error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
                />
              </Grid>
              <Grid item xs={7}>
                <ResourceComboBox
                  endpointId={formik?.values?.clientId && SaleRepository.Contact.qry}
                  parameters={`_clientId=${formik?.values?.clientId}`}
                  name='contactId'
                  label={labels.contact}
                  valueField='recordId'
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
                  error={formik.touched.contactId && Boolean(formik.errors.contactId)}
                />
              </Grid>
              <Grid item xs={4}>
                {metalPriceVisibility && (
                  <CustomNumberField
                    name='KGmetalPrice'
                    label={labels.KGmetalPrice}
                    value={formik.values.header.KGmetalPrice}
                    readOnly
                  />
                )}
              </Grid>
            </Grid>
          </Grid>
        </Fixed>

        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('items', value)}
            value={formik.values.items}
            error={formik.errors.items}
            name='items'
            columns={columns}
            maxAccess={maxAccess}
            disabled={!formik.values.header.clientId || !formik.values.header.currencyId}
          />
        </Grow>

        <Fixed>
          <Grid container rowGap={1} xs={12}>
            <Grid container rowGap={1} xs={6} style={{ marginTop: '10px' }}>
              <Grid item xs={12} sx={{ pr: '5px' }}>
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
            </Grid>

            <Grid
              container
              direction='row'
              xs={6}
              spacing={2}
              sx={{ overflow: 'hidden', flexWrap: 'nowrap', pt: '5px' }}
            >
              <Grid container item xs={6} direction='column' spacing={1} sx={{ px: 2, mt: 1 }}>
                <Grid item>
                  <CustomNumberField
                    name='qty'
                    maxAccess={maxAccess}
                    label={labels.totQty}
                    value={formik.values.header.qty}
                    readOnly
                  />
                </Grid>
                <Grid item>
                  <CustomNumberField
                    name='volume'
                    maxAccess={maxAccess}
                    label={labels.totVolume}
                    value={formik.values.header.volume}
                    readOnly
                  />
                </Grid>
                <Grid item>
                  <CustomNumberField
                    name='weight'
                    maxAccess={maxAccess}
                    label={labels.totWeight}
                    value={formik.values.header.weight}
                    readOnly
                  />
                </Grid>
              </Grid>

              <Grid container item xs={6} direction='column' spacing={1} sx={{ px: 2, mt: 1 }}>
                <Grid item>
                  <CustomNumberField
                    name='subTotal'
                    maxAccess={maxAccess}
                    label={labels.subtotal}
                    value={formik.values.header.subtotal}
                    readOnly
                  />
                </Grid>
                <Grid item>
                  <CustomNumberField
                    name='discount'
                    maxAccess={maxAccess}
                    label={labels.discount}
                    value={formik.values.header.currentDiscount}
                    displayCycleButton={true}
                    cycleButtonLabel={cycleButtonState.text}
                    decimalScale={2}
                    handleCycleButtonClick={handleCycleButtonClick}
                    onChange={e => {
                      let discount = Number(e.target.value)
                      if (formik.values.header.tdType == 1) {
                        if (discount < 0 || formik.values.header.subtotal < discount) {
                          discount = 0
                        }
                        formik.setFieldValue('header.tdAmount', discount)
                      } else {
                        if (discount < 0 || discount > 100) discount = 0
                        formik.setFieldValue('header.tdPct', discount)
                      }
                      formik.setFieldValue('header.currentDiscount', discount)
                    }}
                    onBlur={async e => {
                      let discountAmount = Number(e.target.value)
                      let tdPct = Number(e.target.value)
                      let tdAmount = Number(e.target.value)

                      if (formik.values.header.tdType == 1) {
                        tdPct = (parseFloat(discountAmount) / parseFloat(formik.values.header.subtotal)) * 100
                        formik.setFieldValue('header.tdPct', tdPct)
                      }

                      if (formik.values.header.tdType == 2) {
                        tdAmount = (parseFloat(discountAmount) * parseFloat(formik.values.header.subtotal)) / 100
                        formik.setFieldValue('header.tdAmount', tdAmount)
                      }

                      recalcGridVat(formik.values.header.tdType, tdPct, tdAmount, Number(e.target.value))
                      calcTotals(formik.values.items, tdAmount)
                    }}
                    onClear={() => {
                      formik.setFieldValue('header.tdAmount', 0)
                      formik.setFieldValue('header.tdPct', 0)
                      calcTotals(formik.values.items, 0)
                      recalcGridVat(formik.values.header.tdType, 0, 0, 0)
                    }}
                  />
                </Grid>
                <Grid item>
                  <CustomNumberField
                    name='miscAmount'
                    maxAccess={maxAccess}
                    label={labels.misc}
                    value={formik.values.header.miscAmount}
                    decimalScale={2}
                    onChange={e => formik.setFieldValue('header.miscAmount', e.target.value)}
                    onBlur={async () => {
                      calcTotals(formik.values.items)
                    }}
                    onClear={() => formik.setFieldValue('header.miscAmount', 0)}
                  />
                </Grid>
                <Grid item>
                  <CustomNumberField
                    name='vatAmount'
                    maxAccess={maxAccess}
                    label={labels.VAT}
                    value={formik.values.header.vatAmount}
                    readOnly
                  />
                </Grid>
                <Grid item>
                  <CustomNumberField
                    name='amount'
                    maxAccess={maxAccess}
                    label={labels.net}
                    value={formik.values.header.amount}
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
