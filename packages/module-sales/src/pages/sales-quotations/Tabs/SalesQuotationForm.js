import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import { formatDateFromApi, formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'
import { Grid } from '@mui/material'
import { useContext, useEffect, useRef, useState } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import CustomTextArea from '@argus/shared-ui/src/components/Inputs/CustomTextArea'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import { SaleRepository } from '@argus/repositories/src/repositories/SaleRepository'
import { FinancialRepository } from '@argus/repositories/src/repositories/FinancialRepository'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import WorkFlow from '@argus/shared-ui/src/components/Shared/WorkFlow'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import {
  getIPR,
  DIRTYFIELD_QTY,
  DIRTYFIELD_BASE_PRICE,
  DIRTYFIELD_UNIT_PRICE,
  DIRTYFIELD_MDAMOUNT,
  DIRTYFIELD_UPO,
  DIRTYFIELD_EXTENDED_PRICE,
  MDTYPE_AMOUNT,
  MDTYPE_PCT
} from '@argus/shared-utils/src/utils/ItemPriceCalculator'
import { getVatCalc } from '@argus/shared-utils/src/utils/VatCalculator'
import { getDiscValues, getFooterTotals, getSubtotal } from '@argus/shared-utils/src/utils/FooterCalculator'
import AddressFilterForm from '@argus/shared-ui/src/components/Shared/AddressFilterForm'
import { useError } from '@argus/shared-providers/src/providers/error'
import { useDocumentType } from '@argus/shared-hooks/src/hooks/documentReferenceBehaviors'
import SalesTrxForm from '@argus/shared-ui/src/components/Shared/SalesTrxForm'
import CustomCheckBox from '@argus/shared-ui/src/components/Inputs/CustomCheckBox'
import TaxDetails from '@argus/shared-ui/src/components/Shared/TaxDetails'
import { BusinessPartnerRepository } from '@argus/repositories/src/repositories/BusinessPartnerRepository'
import AddressForm from '@argus/shared-ui/src/components/Shared/AddressForm'
import { createConditionalSchema } from '@argus/shared-domain/src/lib/validation'
import CustomButton from '@argus/shared-ui/src/components/Inputs/CustomButton'
import ChangeClient from '@argus/shared-ui/src/components/Shared/ChangeClient'
import { DefaultsContext } from '@argus/shared-providers/src/providers/DefaultsContext'

export default function SalesQuotationForm({ labels, access, recordId, currency, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { stack: stackError } = useError()
  const { platformLabels } = useContext(ControlContext)
  const { systemDefaults, userDefaults } = useContext(DefaultsContext)
  const [cycleButtonState, setCycleButtonState] = useState({ text: '%', value: 2 })
  const [address, setAddress] = useState({})
  const filteredMeasurements = useRef([])
  const [measurements, setMeasurements] = useState([])
  const [defaults, setDefaults] = useState(null)
  const [reCal, setReCal] = useState(false)
  const allowNoLines = systemDefaults?.list?.find(({ key }) => key === 'allowSalesNoLinesTrx')?.value == 'true'

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.SalesQuotation,
    access: access,
    enabled: !recordId
  })

  async function validateSalesPerson(spId) {
    if (!spId) return null

    const res = await getRequest({
      extension: SaleRepository.SalesPerson.get,
      parameters: `_recordId=${spId}`
    })

    const salesperson = res?.record

    if (!salesperson || salesperson.isInactive) {
      return null
    }

    return spId
  }

  const initialValues = {
    recordId,
    dtId: null,
    reference: null,
    date: new Date(),
    expiryDate: null,
    deliveryDate: null,
    validity: null,
    plantId: null,
    clientId: '',
    bpId: null,
    bpRef: null,
    bpName: null,
    currencyId: parseInt(currency),
    szId: null,
    spId: null,
    siteId: null,
    description: null,
    status: 1,
    isVattable: false,
    exWorks: false,
    taxId: null,
    shipAddress: '',
    subtotal: 0,
    miscAmount: 0,
    amount: 0,
    vatAmount: 0,
    tdAmount: 0,
    plId: null,
    ptId: null,
    shipToAddressId: null,
    maxDiscount: 0,
    currentDiscount: 0,
    exRate: 1,
    rateCalcMethod: null,
    tdType: 2,
    tdPct: 0,
    baseAmount: 0,
    volume: 0,
    weight: 0,
    qty: 0,
    serializedAddress: null,
    items: [
      {
        id: 1,
        quotationId: recordId || 0,
        itemId: null,
        sku: null,
        itemName: null,
        seqNo: 1,
        siteId: null,
        muId: null,
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
        overheadId: null,
        vatAmount: 0,
        mdAmount: 0,
        upo: 0,
        extendedPrice: 0,
        mdAmountPct: null,
        priceType: 1,
        applyVat: false,
        taxId: null,
        taxDetails: null,
        notes: null
      }
    ]
  }

  const invalidate = useInvalidate({
    endpointId: SaleRepository.SalesQuotations.page
  })

  const conditions = {
    sku: row => row?.sku,
    qty: row => row?.qty > 0
  }
  const { schema, requiredFields } = createConditionalSchema(conditions, allowNoLines, maxAccess, 'items')

  const { formik } = useForm({
    maxAccess,
    documentType: { key: 'dtId', value: documentType?.dtId },
    conditionSchema: ['items'],
    initialValues,
    validationSchema: yup.object({
      currencyId: yup.string().required(),
      date: yup.string().required(),
      clientId: yup
        .string()
        .nullable()
        .test(function (value) {
          return this.parent.bpId ? true : !!value
        }),
      bpId: yup
        .string()
        .nullable()
        .test(function (value) {
          return this.parent.clientId ? true : !!value
        }),

      items: yup.array().of(schema)
    }),
    onSubmit: async obj => {
      const copy = {
        ...obj,
        date: formatDateToApi(obj.date),
        miscAmount: obj.miscAmount || 0
      }

      delete copy.items
      ;['expiryDate', 'deliveryDate', 'rateCalcMethod'].forEach(field => {
        if (!obj[field]) delete copy[field]
      })

      if (copy.serializedAddress) {
        const addressRes = await postRequest({
          extension: SaleRepository.Address.set,
          record: JSON.stringify({
            clientId: copy.clientId,
            address
          })
        })
        copy.shipToAddressId = addressRes.recordId
      }

      const updatedRows = formik.values.items
        .filter(row => Object.values(requiredFields)?.every(fn => fn(row)))
        .map((itemDetails, index) => {
          const { physicalProperty, ...rest } = itemDetails

          return {
            ...rest,
            seqNo: index + 1,
            applyVat: obj.isVattable
          }
        })

      const itemsGridData = {
        header: copy,
        items: updatedRows
      }

      const sqRes = await postRequest({
        extension: SaleRepository.SalesQuotations.set2,
        record: JSON.stringify(itemsGridData)
      })

      toast.success(editMode ? platformLabels.Edited : platformLabels.Added)
      await refetchForm(sqRes.recordId)
      invalidate()
    }
  })

  const editMode = !!formik.values.recordId
  const isRaw = formik.values.status === 1

  async function getFilteredMU(itemId, msId = null) {
    if (!itemId) return

    const currentItemId = formik.values.items?.find(item => parseInt(item.itemId) === itemId)?.msId
    const updatedMsId = currentItemId == 0 ? msId || currentItemId : currentItemId
    const arrayMU = measurements?.filter(item => item.msId == updatedMsId) || []
    filteredMeasurements.current = arrayMU
  }

  const iconKey = ({ value, data }) => {
    const mdType = value?.mdType || data?.mdType

    return mdType === MDTYPE_PCT ? '%' : '123'
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
          { key: 'name', value: 'Item Name' },
          { key: 'flName', value: 'FL Name' }
        ],
        displayFieldWidth: 5,
        filter: { salesItem: true }
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
          if (itemInfo?.taxId) {
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

        const filteredMU = measurements?.filter(item => item.msId === itemInfo?.msId)
        getFilteredMU(newRow?.itemId, itemInfo?.msId)

        const filteredItems = filteredMeasurements?.current?.filter(item => item.recordId === newRow?.muId)

        update({
          volume: parseFloat(itemPhysProp?.volume) || 0,
          weight: parseFloat(itemPhysProp?.weight || 0).toFixed(2),
          vatAmount: parseFloat(itemInfo?.vatPct || 0).toFixed(2),
          basePrice: parseFloat(ItemConvertPrice?.basePrice || 0).toFixed(5),
          unitPrice: parseFloat(ItemConvertPrice?.unitPrice || 0).toFixed(3),
          upo: parseFloat(ItemConvertPrice?.upo || 0).toFixed(2),
          priceType: ItemConvertPrice?.priceType || 1,
          mdAmount: formik.values.maxDiscount ? parseFloat(formik.values.maxDiscount).toFixed(2) : 0,
          qty: 0,
          msId: itemInfo?.msId,
          muRef: filteredMU?.[0]?.reference,
          muId: filteredMU?.[0]?.recordId,
          extendedPrice: parseFloat('0').toFixed(2),
          mdValue: 0,
          taxId: rowTax,
          taxDetails: rowTaxDetails || null,
          mdType: 1,
          siteId: formik?.values?.siteId,
          siteRef: await getSiteRef(formik?.values?.siteId),
          baseQty: Number(filteredItems?.[0]?.qty) * Number(newRow?.qty)
        })

        formik.setFieldValue('mdAmount', formik.values.currentDiscount ? formik.values.currentDiscount : 0)
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
        const filteredItems = filteredMeasurements?.current.find(item => item.recordId === newRow?.muId)
        const muQty = newRow?.muQty ?? filteredItems?.qty

        update({
          baseQty: newRow?.qty * muQty
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
      onChange({ row: { update, newRow } }) {
        getFilteredMU(newRow?.itemId, newRow?.msId)
        const data = getItemPriceRow(newRow, DIRTYFIELD_QTY)
        const filteredItems = filteredMeasurements?.current.find(item => item.recordId === newRow?.muId)

        const muQty = newRow?.muQty ?? filteredItems?.qty
        update({
          ...data,
          baseQty: newRow?.qty * muQty
        })
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
      props: {
        decimalScale: 5
      },
      updateOn: 'blur',
      async onChange({ row: { update, newRow } }) {
        const data = getItemPriceRow(newRow, DIRTYFIELD_BASE_PRICE)
        update(data)
      }
    },
    {
      component: 'numberfield',
      label: labels.unitPrice,
      name: 'unitPrice',
      props: {
        decimalScale: 5
      },
      updateOn: 'blur',
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
        onCondition: row => {
          if (row.itemId && row.taxId) {
            return {
              imgSrc: require('@argus/shared-ui/src/components/images/buttonsIcons/tax-icon.png').default.src,
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
        onCondition: row => {
          return {
            disabled: !row.itemId
          }
        }
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

    const currentMdAmount = checkMinMaxAmount(value?.mdAmount, mdType)

    const newRow = {
      mdAmount: currentMdAmount,
      mdAmountPct: mdType,
      mdType: mdType
    }

    updateRow({ id: data.id, changes: newRow, commitOnBlur: true })
  }

  async function toInvoice() {
    const copy = { ...formik.values }
    delete copy.items
    copy.date = formatDateToApi(copy.date)
    copy.deliveryDate = copy.deliveryDate && formatDateToApi(copy.deliveryDate)
    copy.expiryDate = copy.expiryDate && formatDateToApi(copy.expiryDate)

    await postRequest({
      extension: SaleRepository.SalesQuotations.postToInvTrx,
      record: JSON.stringify(copy)
    })

    toast.success(platformLabels.Invoice)
    invalidate()
    window.close()
  }

  async function toConsignments() {
    const copy = { ...formik.values }
    delete copy.items
    copy.date = formatDateToApi(copy.date)
    copy.deliveryDate = copy.deliveryDate && formatDateToApi(copy.deliveryDate)
    copy.expiryDate = copy.expiryDate && formatDateToApi(copy.expiryDate)

    await postRequest({
      extension: SaleRepository.SalesQuotations.postToCons,
      record: JSON.stringify(copy)
    })

    toast.success(platformLabels.Consignments)
    invalidate()
    window.close()
  }

  async function toOrder() {
    const copy = { ...formik.values }
    delete copy.items
    copy.date = formatDateToApi(copy.date)
    copy.deliveryDate = copy.deliveryDate && formatDateToApi(copy.deliveryDate)
    copy.expiryDate = copy.expiryDate && formatDateToApi(copy.expiryDate)

    await postRequest({
      extension: SaleRepository.SalesQuotations.postQuotTrx,
      record: JSON.stringify(copy)
    })

    toast.success(platformLabels.Order)
    invalidate()
    window.close()
  }

  async function onWorkFlowClick() {
    stack({
      Component: WorkFlow,
      props: {
        functionId: SystemFunction.SalesQuotation,
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
      key: 'WorkFlow',
      condition: true,
      onClick: onWorkFlowClick,
      disabled: !editMode
    },
    {
      key: 'Invoice',
      condition: true,
      onClick: toInvoice,
      disabled: !(editMode && isRaw)
    },
    {
      key: 'Order',
      condition: true,
      onClick: toOrder,
      disabled: !(editMode && isRaw)
    },
    {
      key: 'Consignments',
      condition: true,
      onClick: toConsignments,
      disabled: !(editMode && isRaw)
    }
  ]

  async function fillForm(sqHeader, sqItems, clientDiscount) {
    const shipAdd = await getAddress(sqHeader?.record?.shipToAddressId)

    sqHeader?.record?.tdType == 1 || sqHeader?.record?.tdType == null
      ? setCycleButtonState({ text: '123', value: 1 })
      : setCycleButtonState({ text: '%', value: 2 })

    const modifiedList =
      sqItems?.list.length != 0
        ? await Promise.all(
            sqItems.list?.map(async (item, index) => {
              const taxDetailsResponse = sqHeader?.record?.isVattable ? await getTaxDetails(item.taxId) : null
              const itemInfo = await getItem(item?.itemId)

              return {
                ...item,
                id: index + 1,
                basePrice: parseFloat(item.basePrice).toFixed(5),
                unitPrice: parseFloat(item.unitPrice).toFixed(3),
                upo: parseFloat(item.upo).toFixed(2),
                vatAmount: parseFloat(item.vatAmount).toFixed(2),
                extendedPrice: parseFloat(item.extendedPrice).toFixed(2),
                msId: itemInfo?.msId || item.msId,
                taxDetails: taxDetailsResponse
              }
            })
          )
        : formik.values.items

    formik.setValues({
      ...sqHeader.record,
      currentDiscount:
        sqHeader?.record?.tdType == 1 || sqHeader?.record?.tdType == null
          ? sqHeader?.record?.tdAmount
          : sqHeader?.record?.tdPct,
      amount: parseFloat(sqHeader?.record?.amount).toFixed(2),
      maxDiscount: clientDiscount?.record?.tdPct || 0,
      shipAddress: shipAdd,
      items: modifiedList
    })
  }

  async function getSalesQuotation(sqId) {
    const res = await getRequest({
      extension: SaleRepository.SalesQuotations.get,
      parameters: `_recordId=${sqId}`
    })

    res.record.date = formatDateFromApi(res?.record?.date)
    res.record.expiryDate = formatDateFromApi(res?.record?.expiryDate)
    res.record.deliveryDate = formatDateFromApi(res?.record?.deliveryDate)

    return res
  }

  async function getSalesQuotationItems(sqId) {
    return await getRequest({
      extension: SaleRepository.QuotationItem.qry,
      parameters: `_params=1|${sqId}&_startAt=0&_pageSize=3000&_sortBy=seqno`
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
  async function getClientInfo(clientId) {
    if (!clientId) return

    const res = await getRequest({
      extension: SaleRepository.Client.get,
      parameters: `_recordId=${clientId}`
    })

    return res
  }

  async function fillClientData(clientId) {
    if (!clientId) return

    const res = await getClientInfo(clientId)

    formik.setFieldValue('ptId', res?.record?.ptId)
    formik.setFieldValue('plId', res?.record?.plId || formik.values?.plId || 0)
    formik.setFieldValue('szId', res?.record?.szId)
    formik.setFieldValue('currencyId', res?.record?.currencyId)
    const validSpId = await validateSalesPerson(res?.record?.spId || formik.values.spId)
    formik.setFieldValue('spId', validSpId)

    formik.setFieldValue('shipToAddressId', res?.record?.shipAddressId || null)
    const shipAdd = await getAddress(res?.record?.shipAddressId)
    formik.setFieldValue('shipAddress', shipAdd || '')
  }
  async function fillShipment(recordId) {
    if (!recordId) return

    const res = await getRequest({
      extension: BusinessPartnerRepository.BPAddress.qry,
      parameters: `_bpId=${recordId}&_filter=`
    })

    const shipId = res?.list[0].addressId
    const shipAdd = await getAddress(shipId)
    formik.setFieldValue('shipAddress', shipAdd || '')
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
      parameters: `_itemId=${itemId}&_clientId=${formik.values.clientId || 0}&_currencyId=${
        formik.values.currencyId
      }&_plId=${formik.values.plId}&_muId=0`
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

  function checkMinMaxAmount(amount, type) {
    let currentAmount = parseFloat(amount) || 0

    if (type === MDTYPE_PCT) {
      if (currentAmount < 0 || currentAmount > 100) currentAmount = 0
    } else {
      if (currentAmount < 0) currentAmount = 0
    }

    return currentAmount
  }

  function getItemPriceRow(newRow, dirtyField, iconClicked) {
    !reCal && setReCal(true)

    const mdAmount = checkMinMaxAmount(newRow?.mdAmount, newRow?.mdType)

    const itemPriceRow = getIPR({
      priceType: newRow?.priceType || 0,
      basePrice: parseFloat(newRow?.basePrice) || 0,
      volume: parseFloat(newRow?.volume) || 0,
      weight: parseFloat(newRow?.weight),
      unitPrice: parseFloat(newRow?.unitPrice || 0),
      upo: parseFloat(newRow?.upo) ? parseFloat(newRow?.upo) : 0,
      qty: parseFloat(newRow?.qty),
      extendedPrice: parseFloat(newRow?.extendedPrice),
      mdAmount,
      mdType: newRow?.mdType,
      baseLaborPrice: 0,
      totalWeightPerG: 0,
      mdValue: parseFloat(newRow?.mdValue),
      tdPct: formik?.values?.tdPct || 0,
      dirtyField: dirtyField
    })

    const vatCalcRow = getVatCalc({
      priceType: itemPriceRow?.priceType,
      basePrice: itemPriceRow?.basePrice,
      qty: itemPriceRow?.qty,
      weight: itemPriceRow?.weight,
      extendedPrice: parseFloat(itemPriceRow?.extendedPrice),
      baseLaborPrice: itemPriceRow?.baseLaborPrice,
      vatAmount: parseFloat(itemPriceRow?.vatAmount),
      tdPct: formik?.values?.tdPct,
      taxDetails: formik.values.isVattable ? newRow.taxDetails : null
    })

    let commonData = {
      ...newRow,
      id: newRow?.id,
      qty: itemPriceRow?.qty ? parseFloat(itemPriceRow?.qty).toFixed(2) : 0,
      volume: itemPriceRow?.volume ? parseFloat(itemPriceRow.volume).toFixed(2) : 0,
      weight: parseFloat(itemPriceRow?.weight).toFixed(2),
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
        priceType: item?.priceType,
        basePrice: parseFloat(item?.basePrice),
        qty: item?.qty,
        weight: item?.weight,
        extendedPrice: parseFloat(item?.extendedPrice),
        baseLaborPrice: parseFloat(item?.baseLaborPrice),
        vatAmount: parseFloat(item?.vatAmount),
        tdPct: tdPct,
        taxDetails: formik.values.isVattable ? item.taxDetails : null
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
    const maxClientAmountDiscount = rowData.unitPrice * (formik.values.maxDiscount / 100)
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
    const sqHeader = await getSalesQuotation(recordId)
    const sqItems = await getSalesQuotationItems(recordId)
    const clientDiscount = await getClientInfo(sqHeader.record.clientId)
    await fillForm(sqHeader, sqItems, clientDiscount)
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
        shipment: true,
        checkedAddressId: formik.values?.shipToAddressId,
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
        datasetId: ResourceIds.ADDSalesQuotations,
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

    const systemObject = (systemDefaults?.list || []).reduce((acc, { key, value }) => {
      if (systemKeys.includes(key)) {
        acc[key] = value === 'True' || value === 'False' ? value : value ? parseInt(value) : null
      }

      return acc
    }, {})

    const userObject = (userDefaults?.list || []).reduce((acc, { key, value }) => {
      if (userKeys.includes(key)) {
        acc[key] = value ? parseInt(value) : null
      }

      return acc
    }, {})

    setDefaults({
      userDefaultsList: userObject,
      systemDefaultsList: systemObject
    })

    return {
      userDefaultsList: userObject,
      systemDefaultsList: systemObject
    }
  }

  async function updateValues(fields) {
    Object.entries(fields).forEach(([key, val]) => {
      formik.setFieldValue(key, val)
    })
  }

  async function onChangeDtId(dtId) {
    if (!dtId) return

    const res = await getRequest({
      extension: SaleRepository.DocumentTypeDefault.get,
      parameters: `_dtId=${dtId}`
    })
    const validSpId = await validateSalesPerson(res?.record?.spId || defaults.userDefaultsList.spId)
    formik.setFieldValue('spId', validSpId)
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
    if (formik.values?.dtId && !recordId) onChangeDtId(formik.values?.dtId)
  }, [formik.values?.dtId])

  useEffect(() => {
    ;(async function () {
      const muList = await getMeasurementUnits()
      setMeasurements(muList?.list)
      const defaultValues = await getDefaultData()
      if (recordId) await refetchForm(recordId)
      else {
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
        const validSpId = await validateSalesPerson(salesPerson)
        formik.setFieldValue('spId', validSpId)

        formik.setFieldValue('plantId', parseInt(plant))
        formik.setFieldValue('plId', parseInt(defaultValues?.systemDefaultsList?.plId))
      }
    })()
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.SalesQuotations}
      functionId={SystemFunction.SalesQuotation}
      form={formik}
      maxAccess={maxAccess}
      previewReport={editMode}
      actions={actions}
      editMode={editMode}
      disabledSubmit={!isRaw}
      disabledSavedClear={!isRaw}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={3}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SystemRepository.DocumentType.qry}
                    parameters={`_startAt=0&_pageSize=1000&_dgId=${SystemFunction.SalesQuotation}`}
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
                    onChange={(_, newValue) => {
                      formik.setFieldValue('dtId', newValue?.recordId)
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
                    onClear={() => formik.setFieldValue('reference', null)}
                    error={formik.touched.reference && Boolean(formik.errors.reference)}
                  />
                </Grid>
                <Grid item xs={10}>
                  <ResourceLookup
                    endpointId={SaleRepository.Client.snapshot}
                    valueField='reference'
                    displayField='name'
                    secondFieldLabel={labels.name}
                    name='clientId'
                    label={labels.client}
                    form={formik}
                    readOnly={formik?.values?.bpId || formik?.values?.items?.some(item => item.itemId)}
                    displayFieldWidth={4}
                    valueShow='clientRef'
                    secondValueShow='clientName'
                    maxAccess={maxAccess}
                    editMode={editMode}
                    required={!formik.values.bpId}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    onChange={async (_, newValue) => {
                      fillClientData(newValue?.recordId)
                      formik.setFieldValue('isVattable', newValue?.isSubjectToVAT || false)
                      formik.setFieldValue('taxId', newValue?.taxId)
                      formik.setFieldValue('maxDiscount', newValue?.maxDiscount)
                      formik.setFieldValue('clientName', newValue?.name)
                      formik.setFieldValue('clientRef', newValue?.reference)
                      formik.setFieldValue('clientId', newValue?.recordId || null)
                    }}
                    errorCheck={'clientId'}
                  />
                </Grid>
                <Grid item >
                  <CustomButton
                    onClick={() => {
                      stack({
                        Component: ChangeClient,
                        props: {
                          formValues: formik.values,
                          onSubmit: fields => updateValues(fields)
                        }
                      })
                    }}
                    image='popup.png'
                    disabled={!(editMode && isRaw && formik.values.clientId)}
                    tooltipText={platformLabels.editClient}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceLookup
                    endpointId={BusinessPartnerRepository.MasterData.qry2}
                    parameters={{
                      _functionId: SystemFunction.SalesQuotation,
                      _startAt: 0,
                      _pageSize: 1000,
                      _sortBy: 'reference desc'
                    }}
                    valueField='reference'
                    displayField='name'
                    name='bpId'
                    label={labels.lead}
                    form={formik}
                    required={!formik.values.clientId}
                    readOnly={formik?.values?.clientId || formik?.values?.items?.some(item => item.itemId)}
                    displayFieldWidth={3}
                    valueShow='bpRef'
                    secondValueShow='bpName'
                    maxAccess={maxAccess}
                    editMode={editMode}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    onChange={async (_, newValue) => {
                      fillShipment(newValue?.recordId)
                      formik.setFieldValue('bpName', newValue?.name || '')
                      formik.setFieldValue('bpRef', newValue?.reference || '')
                      formik.setFieldValue('bpId', newValue?.recordId || null)
                    }}
                    errorCheck={'bpId'}
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
                    filter={!editMode ? item => !item.isInactive : undefined}
                    columnsInDropDown={[
                      { key: 'spRef', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    readOnly={!isRaw}
                    valueField='recordId'
                    displayField='name'
                    values={formik.values}
                    displayFieldWidth={1.5}
                    onChange={(_, newValue) => {
                      formik.setFieldValue('spId', newValue?.recordId)
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
                    editMode={editMode}
                    readOnly={!isRaw}
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
                      formik.setFieldValue('taxId', newValue ? newValue.recordId : '')
                    }}
                    error={formik.touched.taxId && Boolean(formik.errors.taxId)}
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SaleRepository.SalesZone.qry}
                    parameters={`_startAt=0&_pageSize=1000&_sortField="recordId"&_filter=`}
                    name='szId'
                    label={labels.saleZone}
                    valueField='recordId'
                    displayField='name'
                    readOnly={!isRaw}
                    values={formik.values}
                    displayFieldWidth={1.5}
                    onChange={(_, newValue) => {
                      formik.setFieldValue('szId', newValue?.recordId)
                    }}
                    error={formik.touched.szId && Boolean(formik.errors.szId)}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={3}>
              <Grid container spacing={2}>
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
                    readOnly={formik?.values?.items?.some(item => item.itemId)}
                    values={formik.values}
                    maxAccess={maxAccess}
                    onChange={(_, newValue) => {
                      formik.setFieldValue('items', [{ id: 1 }])
                      formik.setFieldValue('currencyId', newValue?.recordId || null)
                    }}
                    error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
                  />
                </Grid>

                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SystemRepository.Plant.qry}
                    name='plantId'
                    label={labels.plant}
                    readOnly={!isRaw}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik.values}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    maxAccess={maxAccess}
                    onChange={(_, newValue) => {
                      formik.setFieldValue('plantId', newValue?.recordId)
                    }}
                    displayFieldWidth={2}
                    error={formik.touched.plantId && Boolean(formik.errors.plantId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={InventoryRepository.Site.qry}
                    name='siteId'
                    readOnly={!isRaw}
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
                    onChange={(_, newValue) => {
                      formik.setFieldValue('siteId', newValue?.recordId)
                      formik.setFieldValue('siteRef', newValue ? newValue.reference : null)
                      formik.setFieldValue('siteName', newValue ? newValue.name : null)
                    }}
                    error={formik.touched.siteId && Boolean(formik.errors.siteId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomCheckBox
                    name='isVattable'
                    value={formik.values?.isVattable}
                    onChange={event => formik.setFieldValue('isVattable', event.target.checked)}
                    label={labels.VAT}
                    disabled
                    maxAccess={maxAccess}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={3}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <CustomTextArea
                    name='shipAddress'
                    label={labels.shipTo}
                    value={formik.values.shipAddress}
                    rows={2.5}
                    maxLength='100'
                    readOnly
                    disabled={formik.values.exWorks}
                    maxAccess={maxAccess}
                    viewDropDown={formik.values.clientId || formik.values.bpId}
                    viewAdd={(formik.values.clientId || formik.values.bpId) && !editMode}
                    onChange={e => formik.setFieldValue('shipAddress', e.target.value)}
                    onClear={() => formik.setFieldValue('shipAddress', null)}
                    onDropDown={() => openAddressFilterForm()}
                    handleAddAction={() => openAddressForm()}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='validity'
                    label={labels.validity}
                    value={formik?.values?.validity}
                    maxAccess={maxAccess}
                    readOnly={!isRaw}
                    onChange={e => {
                      formik.handleChange(e)
                      if (e.target.value) {
                        const date = new Date(formik.values.date)
                        date.setDate(date.getDate() + Number(e.target.value))
                        formik.setFieldValue('expiryDate', date)
                      } else formik.setFieldValue('expiryDate', null)
                    }}
                    onClear={() => {
                      formik.setFieldValue('validity', 0)
                      formik.setFieldValue('expiryDate', null)
                    }}
                    error={formik.touched.validity && Boolean(formik.errors.validity)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomDatePicker
                    name='expiryDate'
                    label={labels.expiryDate}
                    value={formik?.values?.expiryDate}
                    onChange={formik.setFieldValue}
                    editMode={editMode}
                    readOnly
                    maxAccess={maxAccess}
                    onClear={() => formik.setFieldValue('expiryDate', null)}
                    error={formik.touched.expiryDate && Boolean(formik.errors.expiryDate)}
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
              if (field == 'muRef') getFilteredMU(row?.itemId, row?.msId)
            }}
            initialValues={formik?.initialValues?.items?.[0]}
            value={formik.values.items}
            error={formik.errors.items}
            columns={columns}
            name='items'
            maxAccess={maxAccess}
            disabled={(!formik.values.clientId && !formik.values.bpId) || !isRaw}
            allowDelete={isRaw}
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
                  editMode={editMode}
                  readOnly={!isRaw}
                  maxAccess={maxAccess}
                  onChange={e => formik.setFieldValue('description', e.target.value)}
                  onClear={() => formik.setFieldValue('description', null)}
                  error={formik.touched.description && Boolean(formik.errors.description)}
                />
              </Grid>
            </Grid>
            <Grid item xs={3}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <CustomDatePicker
                    name='deliveryDate'
                    label={labels.deliveryDate}
                    value={formik?.values?.deliveryDate}
                    onChange={formik.setFieldValue}
                    editMode={editMode}
                    readOnly={!isRaw}
                    maxAccess={maxAccess}
                    onClear={() => formik.setFieldValue('deliveryDate', null)}
                    error={formik.touched.deliveryDate && Boolean(formik.errors.deliveryDate)}
                  />
                </Grid>
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
              <Grid container spacing={2}>
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
                    readOnly={!isRaw}
                    iconKey={cycleButtonState.text}
                    cycleButtonLabel={cycleButtonState.text}
                    decimalScale={2}
                    handleButtonClick={handleDiscountButtonClick}
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
                    readOnly={!isRaw}
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
