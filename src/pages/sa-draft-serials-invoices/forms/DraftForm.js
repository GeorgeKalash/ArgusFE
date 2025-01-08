import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import { Grid } from '@mui/material'
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
import { getVatCalc } from 'src/utils/VatCalculator'
import { getDiscValues, getFooterTotals, getSubtotal } from 'src/utils/FooterCalculator'
import { AddressFormShell } from 'src/components/Shared/AddressFormShell'
import AddressFilterForm from 'src/components/Shared/AddressFilterForm'
import { useError } from 'src/error'
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'
import Table from 'src/components/Shared/Table'
import TaxDetails from 'src/components/Shared/TaxDetails'
import ImportSerials from 'src/components/Shared/ImportSerials'

export default function DraftForm({ labels, access, recordId, currency, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { stack: stackError } = useError()
  const { platformLabels, defaultsData, userDefaultsData } = useContext(ControlContext)
  const [reCal, setReCal] = useState(false)
  const [defaults, setDefaults] = useState({ userDefaultsList: {}, systemDefaultsList: {} })
  const [metalGridData, setMetalGridData] = useState([])
  const [itemGridData, setItemGridData] = useState([])
  const [defaultsDataState, setDefaultsDataState] = useState(null)
  const [userDefaultsDataState, setUserDefaultsDataState] = useState(null)

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.DraftSerialsIn,
    access: access,
    enabled: !recordId
  })

  const [initialValues, setInitialData] = useState({
    recordId: recordId || null,
    dtId: documentType?.dtId,
    reference: '',
    date: new Date(),
    plantId: null,
    clientId: null,
    currencyId: parseInt(currency),
    spId: null,
    siteId: null,
    description: '',
    status: 1,
    wip: 1,
    isVattable: false,
    taxId: '',
    subtotal: '',
    amount: 0,
    vatAmount: '',
    totalWeight: 0,
    plId: '',
    ptId: '',
    weight: '',
    search: '',
    serials: [
      {
        id: 1,
        draftId: recordId || 0,
        srlNo: '',
        metalId: '',
        designId: '',
        itemId: '',
        sku: '',
        itemName: '',
        seqNo: '',
        extendedPrice: 0,
        baseLaborPrice: 0,
        weight: 0,
        metalRef: '',
        designRef: '',
        vatAmount: 0,
        vatPct: 0,
        unitPrice: 0,
        taxId: '',
        taxDetails: null,
        taxDetailsButton: false,
        priceType: 0,
        volume: 0
      }
    ],
    metals: [
      {
        metals: '',
        pcs: 0,
        totalWeight: 0
      }
    ],
    items: [
      {
        seqNo: '',
        itemId: '',
        sku: '',
        itemName: '',
        weight: 0,
        pcs: 0
      }
    ]
  })

  const invalidate = useInvalidate({
    endpointId: SaleRepository.DraftInvoice.page
  })

  const { formik } = useForm({
    maxAccess,
    initialValues,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      date: yup.string().required(),
      currencyId: yup.string().required(),
      clientId: yup.string().required(),
      spId: yup.string().required(),
      siteId: yup.string().required(),
      serials: yup.array().of(
        yup.object({
          srlNo: yup.string().required()
        })
      )
    }),
    onSubmit: async obj => {
      const copy = { ...obj }
      copy.pcs = copy.items.length
      delete copy.items
      copy.date = formatDateToApi(copy.date)

      //copy.dueDate = formatDateToApi(copy.dueDate)
      //copy.miscAmount = copy.miscAmount || 0

      //if (!obj.rateCalcMethod) delete copy.rateCalcMethod

      const updatedRows = formik.values.items.map((itemDetails, index) => {
        //const { physicalProperty, ...rest } = itemDetails

        return {
          ...rest,
          seqNo: index + 1,
          draftId: obj.recordId

          //applyVat: obj.isVattable
        }
      })

      const DraftInvoicePack = {
        header: copy,
        items: updatedRows
      }

      const diRes = await postRequest({
        extension: SaleRepository.DraftInvoice.set2,
        record: JSON.stringify(DraftInvoicePack)
      })

      const actionMessage = editMode ? platformLabels.Edited : platformLabels.Added
      toast.success(actionMessage)
      await refetchForm(diRes.recordId)
      invalidate()
    }
  })

  async function refetchForm(recordId) {
    const diHeader = await getDraftInv(recordId)
    const diItems = await getDraftInvItems(recordId)
    await fillForm(diHeader, diItems)
  }

  async function getDraftInv(diId) {
    const res = await getRequest({
      extension: SaleRepository.DraftInvoice.get,
      parameters: `_recordId=${diId}`
    })

    res.record.date = formatDateFromApi(res?.record?.date)

    return res
  }

  async function getDraftInvItems(diId) {
    //siteId condition
    return await getRequest({
      extension: SaleRepository.DraftInvoiceSerial.qry,
      parameters: `_draftId=${diId}`
    })
  }

  function getItemPriceRow(update, newRow, dirtyField, iconClicked) {
    !reCal && setReCal(true)

    const itemPriceRow = getIPR({
      priceType: 0,
      basePrice: 0,
      volume: parseFloat(newRow?.volume),
      weight: 1,
      unitPrice: parseFloat(newRow?.baseLaborPrice || 0),
      upo: 0,
      qty: parseFloat(newRow?.weight),
      extendedPrice: parseFloat(newRow?.unitPrice),
      mdAmount: 0,
      mdType: 0,
      baseLaborPrice: 0,
      totalWeightPerG: 0,
      mdValue: 0,
      tdPct: 0,
      dirtyField: dirtyField
    })

    const vatCalcRow = getVatCalc({
      basePrice: itemPriceRow?.basePrice,
      extendedPrice: parseFloat(itemPriceRow?.extendedPrice),
      upo: parseFloat(itemPriceRow?.upo).toFixed(2),
      mdValue: itemPriceRow?.mdValue,
      mdType: itemPriceRow?.mdType,
      mdAmount: parseFloat(itemPriceRow?.mdAmount).toFixed(2),
      baseLaborPrice: parseFloat(itemPriceRow?.unitPrice).toFixed(3),
      unitPrice: parseFloat(itemPriceRow?.extendedPrice).toFixed(2),
      totalWeightPerG: parseFloat(itemPriceRow?.totalWeightPerG)
    })

    let commonData = {
      id: newRow?.id,
      qty: parseFloat(itemPriceRow?.qty).toFixed(2),
      volume: parseFloat(itemPriceRow?.volume).toFixed(2),
      weight: parseFloat(itemPriceRow?.qty).toFixed(2),
      basePrice: parseFloat(itemPriceRow?.basePrice).toFixed(5),
      unitPrice: parseFloat(itemPriceRow?.extendedPrice).toFixed(3),
      extendedPrice: parseFloat(itemPriceRow?.extendedPrice).toFixed(2),
      baseLaborPrice: parseFloat(itemPriceRow?.unitPrice).toFixed(3),
      upo: parseFloat(itemPriceRow?.upo).toFixed(2),
      mdValue: itemPriceRow?.mdValue,
      mdType: itemPriceRow?.mdType,
      mdAmount: parseFloat(itemPriceRow?.mdAmount).toFixed(2),
      vatAmount: parseFloat(vatCalcRow?.vatAmount).toFixed(2)
    }
    let data = iconClicked ? { changes: commonData } : commonData
    update(data)
  }

  const editMode = !!formik.values.recordId
  const isClosed = formik.values.wip === 2

  const serialsColumns = [
    {
      component: 'resourcelookup',
      label: labels.srlNo,
      name: 'srlNo',
      flex: 2,
      props: {
        endpointId: InventoryRepository.Serial.qry,
        parameters: { _itemId: 0, _siteId: formik.values.siteId, _srlNo: 0, _startAt: 0, _pageSize: 1000 }, //page size, filter
        displayField: 'srlNo',
        valueField: 'srlNo',
        displayFieldWidth: 5
      }

      //async onChange({ row: { update, newRow } }) {
      /*   if (!newRow.itemId) {
          update({
            saTrx: false
          })

          return
        }
        const itemPhysProp = await getItemPhysProp(newRow.itemId)
        const itemInfo = await getItem(newRow.itemId)
        const ItemConvertPrice = await getItemConvertPrice(newRow.itemId, update)
        let rowTax = null
        let rowTaxDetails = null

        if (!formik.values.taxId) {
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

        const filteredMeasurements = measurements?.filter(item => item.msId === itemInfo?.msId)
        setFilteredMU(filteredMeasurements)

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
          muRef: filteredMeasurements?.[0]?.reference,
          muId: filteredMeasurements?.[0]?.recordId,
          extendedPrice: parseFloat('0').toFixed(2),
          mdValue: 0,
          taxId: rowTax,
          taxDetails: formik.values.isVattable ? rowTaxDetails : null,
          mdType: 1,
          siteId: formik?.values?.siteId,
          siteRef: await getSiteRef(formik?.values?.siteId),
          saTrx: true
        })

        formik.setFieldValue('mdAmount', formik.values.currentDiscount ? formik.values.currentDiscount : 0) */
      //}
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
      component: 'textfield',
      label: labels.sku,
      name: 'sku',
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      label: labels.itemName,
      name: 'itemName',
      flex: 2,
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      label: labels.metalRef,
      name: 'metalRef',
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.vatAmount,
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
      label: labels.baseLaborPrice,
      name: 'baseLaborPrice',
      updateOn: 'blur',
      props: {
        decimalScale: 2
      },
      async onChange({ row: { update, newRow } }) {
        getItemPriceRow(update, newRow, DIRTYFIELD_BASE_PRICE)

        //calctotals
      }
    },
    {
      component: 'numberfield',
      label: labels.unitPrice,
      name: 'unitPrice',
      props: {
        readOnly: true
      }
    }
  ]

  async function onClose() {
    const copy = { ...formik.values }
    delete copy.items
    copy.date = formatDateToApi(copy.date)

    const res = await postRequest({
      extension: SaleRepository.DraftInvoice.close,
      record: JSON.stringify(copy)
    })
    toast.success(platformLabels.Closed)
    invalidate()
    await refetchForm(res.recordId)
  }

  async function onReopen() {
    const copy = { ...formik.values }
    delete copy.items
    copy.date = formatDateToApi(copy.date)

    const res = await postRequest({
      extension: SaleRepository.DraftInvoice.reopen,
      record: JSON.stringify(copy)
    })

    toast.success(platformLabels.Reopened)
    invalidate()
    await refetchForm(res.recordId)
  }

  async function onWorkFlowClick() {
    stack({
      Component: WorkFlow,
      props: {
        functionId: SystemFunction.DraftSerialsIn,
        recordId: formik.values.recordId
      },
      width: 950,
      height: 600,
      title: platformLabels.workflow
    })
  }

  async function onImportClick() {
    stack({
      Component: ImportSerials,
      props: { maxAccess },
      width: 550,
      height: 270,
      title: platformLabels.importSerials
    })
  }

  const actions = [
    {
      key: 'Close',
      condition: !isClosed,
      onClick: onClose,
      disabled: isClosed || !editMode
    },
    {
      key: 'Reopen',
      condition: isClosed,
      onClick: onReopen,
      disabled: !isClosed || formik.values.status == 3 || formik.values.deliveryStatus == 4
    },
    {
      key: 'WorkFlow',
      condition: true,
      onClick: onWorkFlowClick,
      disabled: !editMode
    },
    {
      key: 'Import',
      condition: true,
      onClick: () => onImportClick(),
      disabled: !editMode || formik.values.status != 1
    }
  ]

  async function fillForm(diHeader, diItems) {
    console.log('in fill form ', diHeader, diItems)

    const modifiedList = await Promise.all(
      diItems.list?.map(async (item, index) => {
        const taxDetailsResponse = diHeader?.record?.isVattable ? await getTaxDetails(item.taxId) : null

        //tax js function

        return {
          ...item,
          id: index + 1,
          baseLaborPrice: parseFloat(item.baseLaborPrice).toFixed(2),
          unitPrice: parseFloat(item.unitPrice).toFixed(2),
          vatAmount: parseFloat(item.vatAmount).toFixed(2),
          taxDetailsButton: true,
          taxDetails: taxDetailsResponse
        }
      })
    )

    formik.setValues({
      ...diHeader.record,
      amount: parseFloat(diHeader?.record?.amount).toFixed(2),
      vatAmount: parseFloat(diHeader?.record?.vatAmount).toFixed(2),
      subtotal: parseFloat(diHeader?.record?.subtotal).toFixed(2),
      serials: modifiedList
    })
  }

  async function getTaxDetails(taxId) {
    if (!taxId) return

    const res = await getRequest({
      extension: FinancialRepository.TaxDetailPack.qry,
      parameters: `_taxId=${taxId}`
    })

    return res?.list
  }

  async function fillClientData(clientId) {
    if (!clientId) return

    const res = await getRequest({
      extension: SaleRepository.Client.get,
      parameters: `_recordId=${clientId}`
    })

    //formik.setFieldValue('currencyId', res?.record?.currencyId)
    /* formik.setFieldValue('spId', res?.record?.spId || formik.values.spId)
    formik.setFieldValue('accountId', res?.record?.accountId) //do it in edit mode
    formik.setFieldValue('plId', res?.record?.plId || defaults.systemDefaultsList.plId || 0)
    formik.setFieldValue('isVattable', res?.record?.IsSubjectToVat)
    formik.setFieldValue('taxId', res?.record?.taxId) */

    //TestClientInfo
  }

  const filteredData = formik.values.search
    ? formik.values.serials.filter(
        item =>
          item.srlNo?.toString()?.includes(formik.values.search.toLowerCase()) ||
          item.weight?.toString()?.includes(formik.values.search.toLowerCase()) ||
          item.sku?.toLowerCase().includes(formik.values.search.toLowerCase()) ||
          item.itemName?.toLowerCase().includes(formik.values.search.toLowerCase())
      )
    : formik.values.serials

  const handleSearchChange = event => {
    const { value } = event.target
    formik.setFieldValue('search', value)
  }

  function getDTD(dtId) {
    const res = getRequest({
      extension: SaleRepository.DocumentTypeDefault.get,
      parameters: `_dtId=${dtId}`
    })

    return res
  }

  async function getSiteRef(siteId) {
    if (!siteId) return null

    const res = await getRequest({
      extension: InventoryRepository.Site.get,
      parameters: `_recordId=${siteId}`
    })

    return res?.record?.reference
  }

  async function onChangeDtId(recordId) {
    const dtd = await getDTD(recordId)

    formik.setFieldValue('plantId', dtd?.record?.plantId ?? null)
    formik.setFieldValue('spId', dtd?.record?.spId ?? userDefaultsDataState?.spId)
    formik.setFieldValue('siteId', dtd?.record?.siteId ?? userDefaultsDataState?.siteId)
    formik.setFieldValue('siteRef', dtd?.record?.siteId && (await getSiteRef(dtd?.record?.siteId))) //SITE REF CONDITION

    //fillMetalPrice()
  }

  useEffect(() => {
    if (formik?.values?.serials?.length) {
      const serials = formik?.values?.serials

      const metalMap = serials.reduce((acc, { metalId, weight, metalRef }) => {
        if (metalId) {
          if (!acc[metalId]) {
            acc[metalId] = { metal: metalRef, pcs: 0, totalWeight: 0 }
          }
          acc[metalId].pcs += 1
          acc[metalId].totalWeight = parseFloat(weight || 0)
        }

        return acc
      }, {})
      console.log('metlaGrp', Object.values(metalMap))

      setMetalGridData(Object.values(metalMap))

      const itemMap = serials.reduce((acc, { sku, itemId, itemName, weight }) => {
        var seqNo = 0
        if (itemId) {
          if (!acc[itemId]) {
            acc[itemId] = { sku: sku, pcs: 0, weight: 0, itemName: itemName, seqNo: seqNo + 1 }
            seqNo++
          }
          acc[itemId].pcs += 1
          acc[itemId].weight += parseFloat(weight || 0)
        }

        return acc
      }, {})
      console.log('itemGrp', Object.values(itemMap))

      setItemGridData(Object.values(itemMap))
    }
  }, [formik?.values?.serials])

  async function getUserDefaultsData() {
    const myObject = {}

    const filteredList = userDefaultsData?.list?.filter(obj => {
      return obj.key === 'siteId' || obj.key === 'spId'
    })
    filteredList.forEach(obj => (myObject[obj.key] = obj.value ? parseInt(obj.value) : null))
    setUserDefaultsDataState(myObject)

    return myObject
  }

  async function getDefaultsData() {
    const myObject = {}

    const filteredList = defaultsData?.list?.filter(obj => {
      return (
        obj.key === 'draft_gc_vat' ||
        obj.key === 'draft_gc_des' ||
        obj.key === 'plId' ||
        obj.key === 'draft_gc_lbr' ||
        obj.key === 'draft_gc_txd' ||
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

  /* useEffect(() => {
    defaultsDataState && setDefaultFields()
  }, [defaultsDataState])

  const setDefaultFields = () => {
    formik.setFieldValue('plId', userDefaultsDataState.plId)
  } */

  useEffect(() => {
    ;(async function () {
      //const muList = await getMeasurementUnits()
      //setMeasurements(muList?.list)

      getDefaultsData()
      getUserDefaultsData()

      if (recordId) {
        refetchForm(recordId)
      } else {
        formik.setFieldValue('currencyId', parseInt(defaultsDataState.currencyId))
        formik.setFieldValue('plId', parseInt(defaultsDataState.plId))
        if (documentType?.dtId) {
          //search for documentType?.dtId
          formik.setFieldValue('dtId', documentType.dtId)
          getDTD(documentType?.dtId)
        }
      }
    })()
  }, [])

  const { subtotal, vatAmount, total, totalWeight } = formik?.values?.serials?.reduce(
    (acc, row) => {
      const subTot = parseFloat(row?.unitPrice) || 0
      const vatAmountTot = parseFloat(row?.vatAmount) || 0
      const totWeight = parseFloat(row?.weight) || 0

      return {
        subtotal: acc?.subtotal + subTot,
        vatAmount: acc?.vatAmount + vatAmountTot,
        totalWeight: acc?.totalWeight + totWeight
      }
    },
    { subtotal: 0, vatAmount: 0, totalWeight: 0 }
  )

  return (
    <FormShell
      resourceId={ResourceIds.DraftSerialsInvoices}
      functionId={SystemFunction.DraftSerialsIn}
      form={formik}
      maxAccess={maxAccess}
      previewReport={editMode}
      //previewBtnClicked={previewBtnClicked}
      isClosed={isClosed}
      actions={actions}
      editMode={editMode}
      disabledSubmit={isClosed && !editMode}
      disabledSavedClear={isClosed && !editMode}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <ResourceComboBox
                    endpointId={SystemRepository.DocumentType.qry}
                    parameters={`_startAt=0&_pageSize=1000&_dgId=${SystemFunction.DraftSerialsIn}`}
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
                    onChange={async (_, newValue) => {
                      const recordId = newValue ? newValue.recordId : null

                      await formik.setFieldValue('dtId', recordId)

                      if (newValue) {
                        onChangeDtId(recordId) //USEEFFECT??
                      } else {
                        formik.setFieldValue('dtId', null)
                        formik.setFieldValue('siteId', null)
                        formik.setFieldValue('siteRef', null)
                        formik.setFieldValue('spId', null)
                        formik.setFieldValue('plantId', null)
                      }
                    }}
                    error={formik.touched.dtId && Boolean(formik.errors.dtId)}
                  />
                </Grid>
                <Grid item xs={4}>
                  <ResourceComboBox
                    endpointId={InventoryRepository.Site.qry}
                    name='siteId'
                    readOnly={isClosed}
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
                    onChange={(event, newValue) => {
                      formik.setFieldValue('siteId', newValue ? newValue.recordId : null)
                      formik.setFieldValue('siteRef', newValue ? newValue.reference : null)

                      //inactive site error
                    }}
                    error={formik.touched.siteId && Boolean(formik.errors.siteId)}
                  />
                </Grid>
                <Grid item xs={4}>
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
                    readOnly={isClosed}
                    values={formik.values}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('currencyId', newValue?.recordId || null)
                    }}
                    error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
                  />
                </Grid>
                <Grid item xs={4}>
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
                <Grid item xs={4}>
                  <ResourceComboBox
                    endpointId={SystemRepository.Plant.qry}
                    name='plantId'
                    label={labels.plant}
                    readOnly={isClosed}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik.values}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('plantId', newValue ? newValue.recordId : null)
                    }}
                    displayFieldWidth={2}
                    error={formik.touched.plantId && Boolean(formik.errors.plantId)}
                  />
                </Grid>
                <Grid item xs={4}>
                  {formik.values.clientId && (
                    <ResourceComboBox
                      endpointId={SaleRepository.Contact.contact}
                      parameters={`_clientId=${formik.values.clientId}`}
                      name='contactId'
                      label={labels.contact}
                      readOnly={isClosed}
                      columnsInDropDown={[
                        { key: 'reference', value: 'Reference' },
                        { key: 'name', value: 'Name' }
                      ]}
                      values={formik.values}
                      valueField='recordId'
                      displayField={['reference', 'name']}
                      maxAccess={maxAccess}
                      onChange={(event, newValue) => {
                        formik.setFieldValue('contactId', newValue ? newValue.recordId : null)
                      }}
                      displayFieldWidth={2}
                      error={formik.touched.contactId && Boolean(formik.errors.contactId)}
                    />
                  )}
                </Grid>
                <Grid item xs={4}>
                  <CustomDatePicker
                    name='date'
                    required
                    label={labels.date}
                    value={formik?.values?.date}
                    onChange={formik.setFieldValue}
                    editMode={editMode}
                    readOnly={isClosed}
                    maxAccess={maxAccess}
                    onClear={() => formik.setFieldValue('date', '')}
                    error={formik.touched.date && Boolean(formik.errors.date)}
                  />
                </Grid>
                <Grid item xs={4}>
                  <ResourceComboBox
                    endpointId={SaleRepository.SalesPerson.qry}
                    name='spId'
                    label={labels.salesPerson}
                    columnsInDropDown={[
                      { key: 'spRef', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    readOnly={isClosed}
                    valueField='recordId'
                    displayField='name'
                    values={formik.values}
                    displayFieldWidth={1.5}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('spId', newValue ? newValue.recordId : null)
                    }}
                    error={formik.touched.spId && Boolean(formik.errors.spId)}
                  />
                </Grid>
                <Grid item xs={4}>
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
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('taxId', newValue?.recordId || null)
                    }}
                    error={formik.touched.taxId && Boolean(formik.errors.taxId)}
                  />
                </Grid>
                <Grid container spacing={2} sx={{ pt: 2, pl: 2 }}>
                  <Grid item xs={6}>
                    <Grid item>
                      <ResourceLookup
                        endpointId={SaleRepository.Client.snapshot}
                        valueField='reference'
                        displayField='name'
                        secondFieldLabel={labels.name}
                        name='clientId'
                        label={labels.client}
                        form={formik}
                        required
                        readOnly={isClosed}
                        displayFieldWidth={2}
                        valueShow='clientRef'
                        secondValueShow='clientName'
                        maxAccess={maxAccess}
                        editMode={editMode}
                        columnsInDropDown={[
                          { key: 'reference', value: 'Reference' },
                          { key: 'name', value: 'Name' },
                          { key: 'szName', value: 'Sales Zone' }
                        ]}
                        onChange={async (event, newValue) => {
                          formik.setFieldValue('clientId', newValue?.recordId)
                          formik.setFieldValue('clientName', newValue?.name)
                          formik.setFieldValue('clientRef', newValue?.reference)
                          formik.setFieldValue('plId', newValue?.plId)
                          formik.setFieldValue('accountId', newValue?.accountId)
                          formik.setFieldValue('isVattable', newValue?.isSubjectToVAT || false)
                          formik.setFieldValue('taxId', newValue?.taxId)
                          fillClientData(newValue?.recordId)
                        }}
                        errorCheck={'clientId'} //?
                      />
                    </Grid>
                    <Grid item sx={{ pt: 2 }}>
                      <CustomTextField
                        name='search'
                        value={formik.values.search}
                        label={platformLabels.Search}
                        onClear={() => {
                          formik.setFieldValue('search', '')
                        }}
                        sx={{ width: '45%' }}
                        onChange={handleSearchChange}
                        onSearch={e => formik.setFieldValue('search', e)}
                        search={true}
                        height={25}
                      />
                    </Grid>
                  </Grid>
                  <Grid item xs={6}>
                    <CustomTextArea
                      name='description'
                      label={labels.description}
                      value={formik.values.description}
                      rows={2}
                      editMode={editMode}
                      readOnly={isClosed}
                      maxAccess={maxAccess}
                      onChange={e => formik.setFieldValue('description', e.target.value)}
                      onClear={() => formik.setFieldValue('description', '')}
                      error={formik.touched.description && Boolean(formik.errors.description)}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <DataGrid
            onChange={(value, action) => {
              formik.setFieldValue('serials', value)
              action === 'delete' && setReCal(true) //fix
            }}
            value={filteredData}
            error={formik.errors.serials}
            columns={serialsColumns}
            name='serials'
            maxAccess={maxAccess}
            disabled={isClosed || !formik.values.clientId}
            allowDelete={!isClosed}
          />
        </Grow>
        <Fixed>
          <Grid container spacing={16}>
            <Grid item xs={8}>
              <Grid item height={125} sx={{ display: 'flex', flex: 1 }}>
                <Table
                  gridData={{ count: 1, list: metalGridData }}
                  maxAccess={access}
                  columns={[
                    { field: 'metal', headerName: labels.metal, flex: 1 },
                    { field: 'pcs', headerName: labels.pcs, type: 'number', flex: 1 },
                    { field: 'totalWeight', headerName: labels.totalWeight, type: 'number', flex: 1 }
                  ]}
                  rowId={['metal']}
                  pagination={false}
                />
              </Grid>
              <Grid item height={125} sx={{ display: 'flex', flex: 1 }}>
                <Table
                  columns={[
                    { field: 'seqNo', headerName: labels.seqNo, type: 'number', flex: 1 },
                    { field: 'sku', headerName: labels.sku, flex: 1 },
                    { field: 'itemName', headerName: labels.itemDesc, flex: 2 },
                    { field: 'pcs', headerName: labels.pcs, type: 'number', flex: 1 },
                    { field: 'weight', headerName: labels.weight, type: 'number', flex: 1 }
                  ]}
                  gridData={{ count: 1, list: itemGridData }}
                  rowId={['sku']}
                  maxAccess={access}
                  pagination={false}
                />
              </Grid>
            </Grid>
            <Grid item xs={4}>
              <Grid item sx={{ pt: 4 }}>
                <CustomNumberField
                  name='subTotal'
                  maxAccess={maxAccess}
                  label={labels.subtotal}
                  value={subtotal}
                  readOnly
                />
              </Grid>
              <Grid item sx={{ pt: 2 }}>
                <CustomNumberField
                  name='vatAmount'
                  maxAccess={maxAccess}
                  label={labels.vat}
                  value={vatAmount}
                  readOnly
                />
              </Grid>
              <Grid item sx={{ pt: 2 }}>
                <CustomNumberField
                  name='total'
                  maxAccess={maxAccess}
                  label={labels.total}
                  value={subtotal + vatAmount || 0}
                  readOnly
                />
              </Grid>
              <Grid item sx={{ pt: 12 }}>
                <CustomNumberField
                  name='totalWeight'
                  maxAccess={maxAccess}
                  label={labels.totalWeight}
                  value={totalWeight}
                  readOnly
                />
              </Grid>
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}
