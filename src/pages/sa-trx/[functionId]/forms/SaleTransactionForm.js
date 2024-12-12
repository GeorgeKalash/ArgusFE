import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { formatDateFromApi, formatDateToApi, formatDateForGetApI } from 'src/lib/date-helper'
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
import AddressFilterForm from 'src/components/Shared/AddressFilterForm'
import { MultiCurrencyRepository } from 'src/repositories/MultiCurrencyRepository'
import { RateDivision } from 'src/resources/RateDivision'
import { useError } from 'src/error'
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'
import StrictUnpostConfirmation from 'src/components/Shared/StrictUnpostConfirmation'
import { AddressFormShell } from 'src/components/Shared/AddressFormShell'

export default function SaleTransactionForm({ labels, access, recordId, functionId, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack: stackError } = useError()
  const { stack } = useWindow()
  const { platformLabels, defaultsData, userDefaultsData } = useContext(ControlContext)
  const [cycleButtonState, setCycleButtonState] = useState({ text: '%', value: DIRTYFIELD_TDPCT })
  const [address, setAddress] = useState({})
  const [measurements, setMeasurements] = useState([])
  const [filteredMu, setFilteredMU] = useState([])
  const [metalPriceVisibility, setmetalPriceVisibility] = useState(false)
  const [defaultsDataState, setDefaultsDataState] = useState(null)
  const [userDefaultsDataState, setUserDefaultsDataState] = useState(null)
  const [reCal, setReCal] = useState(false)

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: functionId,
    access: access,
    enabled: !recordId
  })

  const [initialValues, setInitialData] = useState({
    recordId: recordId || null,
    header: {
      dgId: functionId,
      recordId: null,
      dtId: documentType?.dtId,
      reference: '',
      date: new Date(),
      dueDate: new Date(),
      plantId: null,
      clientId: null,
      clientName: '',
      clientRef: '',
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
      KGmetalPrice: 0
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
        saTrx: true
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
        clientId: yup.string().required(),
        siteId: yup
          .string()
          .nullable()
          .test('', function (value) {
            const { dtId } = this.parent
            if (dtId == null) {
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
      try {
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
                .filter(({ taxDetails }) => taxDetails && taxDetails.length > 0)
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
        formik.setFieldValue('recordId', saTrxRes.recordId)
        await refetchForm(saTrxRes.recordId)
        invalidate()
      } catch (error) {}
    }
  })

  const isPosted = formik.values.header.status === 3
  const editMode = !!formik.values.header.recordId

  const columns = [
    {
      component: 'textfield',
      label: labels.barcode,
      name: 'barcode',
      updateOn: 'blur',
      async onChange({ row: { update, newRow } }) {
        const ItemConvertPrice = await getItemConvertPrice2(newRow, formik.values.header)
        const itemPhysProp = await getItemPhysProp(ItemConvertPrice?.itemId)
        const itemInfo = await getItem(ItemConvertPrice?.itemId)

        const weight = parseFloat(itemPhysProp?.weight || 0).toFixed(2)
        const metalPurity = itemPhysProp?.metalPurity ?? 0
        const isMetal = itemPhysProp?.isMetal ?? false
        const metalId = itemPhysProp?.metalId ?? null

        const postMetalToFinancials = formik?.values?.header?.postMetalToFinancials ?? false
        const metalPrice = formik?.values?.header?.KGmetalPrice ?? 0
        const basePrice = (metalPrice * metalPurity) / 1000
        const basePriceValue = postMetalToFinancials === false ? basePrice : 0
        const TotPricePerG = basePriceValue

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
        const filteredMeasurements = measurements?.filter(item => item.msId === itemInfo?.msId)
        setFilteredMU(filteredMeasurements)
        update({
          sku: ItemConvertPrice?.sku,
          barcode: ItemConvertPrice?.barcode,
          itemName: ItemConvertPrice?.itemName,
          itemId: ItemConvertPrice?.itemId,
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
          unitPrice:
            ItemConvertPrice?.priceType === 3
              ? weight * TotPricePerG
              : parseFloat(ItemConvertPrice?.unitPrice || 0).toFixed(3),
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
          taxId: rowTax,
          taxDetails: formik.values.header.isVattable ? rowTaxDetails : null,
          siteId: formik?.values?.header?.siteId,
          siteRef: formik?.values?.header?.siteRef
        })

        formik.setFieldValue(
          'header.mdAmount',
          formik.values.header.currentDiscount ? formik.values.header.currentDiscount : 0
        )
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
        try {
          if (!newRow.itemId) return
          const itemPhysProp = await getItemPhysProp(newRow.itemId)
          const itemInfo = await getItem(newRow.itemId)
          const filteredMeasurements = measurements?.filter(item => item.msId === itemInfo?.msId)
          const ItemConvertPrice = await getItemConvertPrice(newRow.itemId, filteredMeasurements?.[0]?.recordId)
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
          setFilteredMU(filteredMeasurements)
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
            taxDetails: rowTaxDetails
          })

          formik.setFieldValue(
            'header.mdAmount',
            formik.values.header.currentDiscount ? formik.values.header.currentDiscount : 0
          )

          //getItemPriceRow(update, newRow, DIRTYFIELD_QTY)
        } catch (exception) {
          console.log(exception)
        }
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
          const ItemConvertPrice = await getItemConvertPrice(newRow.itemId, newRow?.muId)
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
      component: 'button',
      name: 'saTrx',
      defaultValue: true,
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
    let currentMdType
    let currentMdAmount = parseFloat(formik.values.items[id - 1].mdAmount)
    const maxClientAmountDiscount = formik.values.items[id - 1].unitPrice * (formik.values?.header.maxDiscount / 100)

    if (formik.values.items[id - 1].mdType == 2) {
      if (currentMdAmount < 0 || currentMdAmount > 100) currentMdAmount = 0
      formik.setFieldValue(`items[${id - 1}].mdAmountPct`, 1)
      formik.setFieldValue(`items[${id - 1}].mdType`, 1)
      currentMdType = 1
      formik.setFieldValue(`items[${id - 1}].mdAmount`, parseFloat(currentMdAmount).toFixed(2))
    } else {
      if (currentMdAmount < 0 || currentMdAmount > maxClientAmountDiscount) currentMdAmount = 0
      formik.setFieldValue(`items[${id - 1}].mdAmountPct`, 2)
      formik.setFieldValue(`items[${id - 1}].mdType`, 2)
      currentMdType = 2
      formik.setFieldValue(`items[${id - 1}].mdAmount`, parseFloat(currentMdAmount).toFixed(2))
    }

    const newRow = {
      ...formik.values.items[id - 1],
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
    const res = await postRequest({
      extension: SaleRepository.SaleTransaction.unpost,
      record: JSON.stringify(formik.values.header)
    })

    await refetchForm(res.recordId)
    toast.success(platformLabels.Posted)
    invalidate()
  }
  function openUnpostConfirmation(obj) {
    stack({
      Component: StrictUnpostConfirmation,
      props: {
        action() {
          onUnpost(obj)
        }
      },
      width: 500,
      height: 300,
      expandable: false,
      title: platformLabels.UnpostConfirmation
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
      disabled: !editMode
    },
    {
      key: 'Post',
      condition: isPosted,
      onClick: () => openUnpostConfirmation(formik.values),
      disabled: !isPosted
    },
    {
      key: 'Unpost',
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

  async function fillForm(recordId, saTrxPack) {
    const saTrxHeader = saTrxPack?.header
    const saTrxItems = saTrxPack?.items
    const saTrxTaxes = saTrxPack?.taxes
    const billAdd = await getAddress(saTrxHeader?.billAddressId)

    saTrxHeader?.tdType === 1 || saTrxHeader?.tdType == null
      ? setCycleButtonState({ text: '123', value: 1 })
      : setCycleButtonState({ text: '%', value: 2 })

    const modifiedList = await Promise.all(
      saTrxItems?.map(async (item, index) => {
        const filteredMeasurements = measurements.filter(x => x.msId === item?.msId)
        setFilteredMU(filteredMeasurements)

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
      recordId: recordId || null,
      ...formik.values,
      header: {
        ...formik.values.header,
        ...saTrxHeader,
        tdAmount: saTrxHeader?.tdType == 1 || saTrxHeader?.tdType == null ? saTrxHeader?.tdAmount : saTrxHeader?.tdPct,
        amount: parseFloat(saTrxHeader?.amount).toFixed(2),
        billAddress: billAdd,
        currentDiscount: saTrxHeader?.tdAmount,
        KGmetalPrice: saTrxHeader?.metalPrice * 1000
      },
      items: modifiedList,
      taxes: [...saTrxTaxes]
    })
    formik.setFieldValue('subtotal', saTrxHeader?.subtotal)
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
    if (baseMetalCuId) {
      const res = await getRequest({
        extension: MultiCurrencyRepository.Currency.get,
        parameters: `_currencyId=${baseMetalCuId}&&_date=${formatDateForGetApI(
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
    if (!clientId) {
      formik.setFieldValue('header.clientId', null)
      formik.setFieldValue('header.clientName', null)
      formik.setFieldValue('header.clientRef', null)

      return
    }

    try {
      const res = await getRequest({
        extension: SaleRepository.Client.get,
        parameters: `_recordId=${clientId}`
      })

      const record = res?.record || {}
      const accountId = record.accountId
      const currencyId = record.currencyId ?? formik.values.header.currencyId ?? null
      if (!currencyId) {
        stackError({ message: 'No currency or client currency' })

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

          //currentDiscount: clientObject?.tdPct,
          taxId: clientObject?.taxId,
          currencyId: currencyId,
          spId: record.spId,
          ptId: record.ptId ?? defaultsDataState.ptId,
          plId: record.plId ?? defaultsDataState.plId,
          szId: record.szId,
          billAddressId: record.billAddressId,
          billAddress: billAdd,
          creditLimit: accountLimit?.limit ?? 0
        }
      })
    } catch (error) {
      console.error('Error in formik.setValues:', error)
    }
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

  async function getItemConvertPrice(itemId, muId) {
    const res = await getRequest({
      extension: SaleRepository.ItemConvertPrice.get,
      parameters: `_itemId=${itemId}&_clientId=${formik.values.header.clientId}&_currencyId=${formik.values.header.currencyId}&_plId=${formik.values.header.plId}&_muId=${muId}`
    })

    return res?.record
  }

  async function getItemConvertPrice2(row, header) {
    const res = await getRequest({
      extension: SaleRepository.ItemConvertPrice.get2,
      parameters: `_barcode=${row?.barcode}&_clientId=${header.clientId}&_currencyId=${header.currencyId}&_plId=${header.plId}&_exRate=${header.exRate}&_rateCalcMethod=${header.rateCalcMethod}`
    })

    return res?.record
  }

  const handleCycleButtonClick = () => {
    setReCal(true)
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

      return newState
    })
  }

  function getItemPriceRow(update, newRow, dirtyField, iconClicked) {
    !reCal && setReCal(true)

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
      mdValue: parseFloat(newRow?.mdValue),
      baseLaborPrice: newRow?.baseLaborPrice,
      totalWeightPerG: newRow?.totalWeightPerG,
      tdPct: formik?.values?.header?.tdPct,
      dirtyField: dirtyField
    })

    const vatCalcRow = getVatCalc({
      basePrice: itemPriceRow?.basePrice,
      unitPrice: itemPriceRow?.unitPrice,
      qty: itemPriceRow?.qty,
      extendedPrice: parseFloat(itemPriceRow?.extendedPrice),
      baseLaborPrice: itemPriceRow?.baseLaborPrice,
      vatAmount: parseFloat(newRow?.vatAmount),
      tdPct: formik?.values?.header?.tdPct || 0,
      taxDetails: formik.values.header.isVatChecked ? null : newRow.taxDetails
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
  const subtotal = reCal ? subTotal : formik.values?.subtotal || 0
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

  async function recalcGridVat(typeChange, tdPct, tdAmount, currentDiscount) {
    checkDiscount(typeChange, tdPct, tdAmount, currentDiscount)
    recalcNewVat(tdPct)
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
    await fillForm(recordId, saTrxpack)
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
    formik.setFieldValue('header.plantId', dtd?.record?.plantId ?? userDefaultsDataState?.plantId)
    formik.setFieldValue('header.spId', dtd?.record?.spId ?? userDefaultsDataState?.spId)
    formik.setFieldValue('header.siteId', dtd?.record?.siteId ?? userDefaultsDataState?.siteId)
    formik.setFieldValue('header.commitItems', dtd?.record?.commitItems)
    fillMetalPrice()
    if (dtd?.record?.commitItems == false) formik.setFieldValue('header.siteId', null)
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
        const transactionPack = await getSalesTransactionPack(recordId)
        await fillForm(recordId, transactionPack)
        if (transactionPack.header.tdType === DIRTYFIELD_TDPCT) {
          setCycleButtonState({ text: '%', value: DIRTYFIELD_TDPCT })
          formik.setFieldValue('header.tdAmount', transactionPack.header.tdPct)
          formik.setFieldValue('header.currentDiscount', transactionPack.header.tdPct)
        } else {
          setCycleButtonState({ text: '123', value: DIRTYFIELD_TDPLAIN })
          formik.setFieldValue('header.tdAmount', transactionPack.header.tdAmount)
          formik.setFieldValue('header.currentDiscount', transactionPack.header.tdAmount)
        }
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
    formik.setFieldValue('header.siteId', userDefaultsDataState.siteId)
  }

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
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SaleRepository.SalesPerson.qry}
                    name='spId'
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
                    readOnly={isPosted}
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
                    readOnly={isPosted}
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
                    readOnly={!formik.values.header.clientId || isPosted}
                    maxAccess={maxAccess}
                    viewDropDown={formik.values.header.clientId}
                    viewAdd={formik.values.header.clientId && !editMode}
                    onChange={e => formik.setFieldValue('header.billAddress', e.target.value)}
                    onClear={() => formik.setFieldValue('header.billAddress', '')}
                    onDropDown={() => openAddressFilterForm()}
                    handleAddAction={() => openAddressForm()}
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
                  name='clientId'
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
                  secondFieldName={'header.clientName'}
                  onSecondValueChange={(name, value) => {
                    formik.setFieldValue('header.clientName', value)
                  }}
                  errorCheck={'clientId'}
                  maxAccess={maxAccess}
                  required
                  readOnly={isPosted}
                  displayFieldWidth={3}
                  editMode={editMode}
                />
              </Grid>

              <Grid item xs={2}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name='header.isVattable'
                      checked={formik.values?.header?.isVattable}
                      disabled={formik?.values?.items && formik?.values?.items[0]?.itemId}
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
                  displayField={['name']}
                  readOnly
                  values={formik.values.header}
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

                    //formik.setFieldValue('items', [{ id: 1 }])
                  }}
                  error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
                />
              </Grid>
              <Grid item xs={7}>
                <ResourceComboBox
                  endpointId={formik?.values?.header?.clientId && SaleRepository.Contact.qry}
                  parameters={`_clientId=${formik?.values?.header?.clientId}`}
                  name='contactId'
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
                  error={formik.touched.contactId && Boolean(formik.errors.contactId)}
                />
              </Grid>
              <Grid item xs={4}>
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
                  <CustomNumberField name='qty' maxAccess={maxAccess} label={labels.totQty} value={totalQty} readOnly />
                </Grid>
                <Grid item>
                  <CustomNumberField
                    name='volume'
                    maxAccess={maxAccess}
                    label={labels.totVolume}
                    value={totalVolume}
                    readOnly
                  />
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

              <Grid container item xs={6} direction='column' spacing={1} sx={{ px: 2, mt: 1 }}>
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
                    name='discount'
                    maxAccess={maxAccess}
                    label={labels.discount}
                    value={formik.values.header.currentDiscount}
                    displayCycleButton={true}
                    cycleButtonLabel={cycleButtonState.text}
                    decimalScale={2}
                    readOnly={isPosted}
                    handleCycleButtonClick={handleCycleButtonClick}
                    onChange={e => {
                      let discount = Number(e.target.value)
                      if (formik.values.header.tdType == DIRTYFIELD_TDPCT) {
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
                      setReCal(true)
                      let discountAmount = Number(e.target.value)
                      let tdPct = Number(e.target.value)
                      let tdAmount = Number(e.target.value)

                      if (formik.values.header.tdType == DIRTYFIELD_TDPLAIN) {
                        tdPct = (parseFloat(discountAmount) / parseFloat(subtotal)) * 100
                        formik.setFieldValue('header.tdPct', tdPct)
                      }

                      if (formik.values.header.tdType == DIRTYFIELD_TDPCT) {
                        tdAmount = (parseFloat(discountAmount) * parseFloat(subtotal)) / 100
                        formik.setFieldValue('header.tdAmount', tdAmount)
                      }

                      await recalcGridVat(formik.values.header.tdType, tdPct, tdAmount, Number(e.target.value))
                    }}
                    onClear={() => {
                      formik.setFieldValue('header.tdAmount', 0)
                      formik.setFieldValue('header.tdPct', 0)
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
                    readOnly={isPosted}
                    onChange={e => formik.setFieldValue('header.miscAmount', e.target.value)}
                    onBlur={async () => {
                      setReCal(true)
                    }}
                    onClear={() => formik.setFieldValue('header.miscAmount', 0)}
                  />
                </Grid>
                <Grid item>
                  <CustomNumberField
                    name='vatAmount'
                    maxAccess={maxAccess}
                    label={labels.VAT}
                    value={vatAmount}
                    readOnly
                  />
                </Grid>
                <Grid item>
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
