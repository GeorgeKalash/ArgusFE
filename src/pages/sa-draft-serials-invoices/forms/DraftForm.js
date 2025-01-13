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
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'
import Table from 'src/components/Shared/Table'
import TaxDetails from 'src/components/Shared/TaxDetails'
import ImportSerials from 'src/components/Shared/ImportSerials'
import { getIPR, DIRTYFIELD_UNIT_PRICE } from 'src/utils/ItemPriceCalculator'
import { SystemChecks } from 'src/resources/SystemChecks'
import { useError } from 'src/error'
import { RiceBowlOutlined } from '@mui/icons-material'

export default function DraftForm({ labels, access, recordId, currency, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { stack: stackError } = useError()
  const { platformLabels, defaultsData, userDefaultsData } = useContext(ControlContext)

  const [metalGridData, setMetalGridData] = useState([])
  const [itemGridData, setItemGridData] = useState([])
  const [defaultsDataState, setDefaultsDataState] = useState(null)
  const [userDefaultsDataState, setUserDefaultsDataState] = useState(null)
  const [taxDetailsStore, setTaxDetailsStore] = useState([])
  const [deleted, setDeleted] = useState(false)
  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.DraftSerialsIn,
    access: access,
    enabled: !recordId
  })

  const [initialValues] = useState({
    recordId: recordId || '',
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
    taxId: null,
    subtotal: 0,
    amount: 0,
    vatAmount: 0,
    plId: 0,
    ptId: '',
    weight: 0,
    disSkuLookup: false,
    jumpToNextLine: false,
    autoSrlNo: true,
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
        taxId: null,
        taxDetails: null,
        taxDetailsButton: false,
        priceType: 0,
        volume: 0
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
      dtId: yup.string().required(),
      serials: yup.array().of(
        yup.object().shape({
          srlNo: yup.string().test({
            name: 'srlNo-first-row-check',
            test(value, context) {
              const { parent } = context
              if (parent?.id == 1 && value) return true
              if (parent?.id == 1 && !value) return true
              if (parent?.id > 1 && !value) return false

              return value
            }
          })
        })
      )
    }),
    onSubmit: async obj => {
      const copy = { ...obj }
      copy.pcs = copy.serials.length
      delete copy.serials
      copy.date = formatDateToApi(copy.date)
      copy.status = 1

      const updatedRows = formik.values.serials
        .filter(row => row.srlNo)
        .map((copy, index) => {
          const { taxDetails, ...rest } = copy
          return {
            ...rest,
            seqNo: index + 1,
            draftId: copy?.recordId || 0
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

  async function refetchForm(recordId, plId) {
    const diHeader = await getDraftInv(recordId)
    const diItems = await getDraftInvItems(recordId)
    await fillForm(diHeader, diItems, plId)
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
    return await getRequest({
      extension: SaleRepository.DraftInvoiceSerial.qry,
      parameters: `_draftId=${diId}`
    })
  }

  useEffect(() => {
    SystemChecks.POS_JUMP_TO_NEXT_LINE && SystemChecks.SRLNO_TEXT_CHECK && getSysChecks()
  }, [])

  async function getSysChecks() {
    const Jres = await getRequest({
      extension: SystemRepository.SystemChecks.get,
      parameters: `_checkId=${SystemChecks.POS_JUMP_TO_NEXT_LINE}&_scopeId=1&_masterId=0`
    })

    if (Jres?.record?.value) formik.setFieldValue('jumpToNextLine', Jres?.record?.value)

    /* const STres = await getRequest({
      extension: SystemRepository.SystemChecks.get,
      parameters: `_checkId=${SystemChecks.SRLNO_TEXT_CHECK}&_scopeId=1&_masterId=0`
    }) */

    //if (STres?.record?.value) formik.setFieldValue('autoSrlNo', STres?.record?.value || true)
  }

  function getItemPriceRow(newRow, dirtyField, iconClicked) {
    const itemPriceRow = getIPR({
      priceType: 3,
      basePrice: 0,
      volume: parseFloat(newRow?.volume || 0),
      weight: 1,
      unitPrice: parseFloat(newRow?.baseLaborPrice),
      upo: 0,
      qty: parseFloat(newRow?.weight),
      extendedPrice: parseFloat(newRow?.unitPrice).toFixed(2),
      mdAmount: 0,
      mdType: 0,
      baseLaborPrice: 0,
      totalWeightPerG: 0,
      mdValue: 0,
      tdPct: 0,
      dirtyField: dirtyField
    })

    const vatCalcRow = getVatCalc({
      basePrice: 0,
      qty: parseFloat(newRow?.weight),
      extendedPrice: parseFloat(itemPriceRow?.extendedPrice),
      tdPct: 0,
      baseLaborPrice: 0,
      taxDetails: parseFloat(newRow?.taxDetails)
    })

    let commonData = {
      unitPrice: parseFloat(itemPriceRow?.extendedPrice).toFixed(2),
      baseLaborPrice: parseFloat(itemPriceRow?.unitPrice).toFixed(2)
      //vatAmount: parseFloat(vatCalcRow?.vatAmount).toFixed(2)
    }
    let data = iconClicked ? { changes: commonData } : commonData

    return data

    /*  if (!formik?.values?.autoSrlNo) {
      update(data)
    } else { */
  }

  const editMode = !!formik.values.recordId
  const isClosed = formik.values.wip === 2

  const assignStoreTaxDetails = serials => {
    const updatedSer = serials?.map(serial => {
      if (serial.taxId != null) {
        return {
          ...serial,
          extendedPrice: serial.unitPrice,
          taxDetails: FilteredListByTaxId(taxDetailsStore, serial.taxId)
        }
      }

      return serial
    })
    formik.setFieldValue('serials', updatedSer)
  }

  const FilteredListByTaxId = (store, taxId) => {
    if (!store?.data?.items) return []

    return store.data.items.map(item => item.data).filter(obj => obj.taxId === taxId)
  }

  const autoDelete = async row => {
    if (!row?.itemName) return true
    // row.draftId = 0
    const LastSerPack = {
      draftId: formik?.values?.recordId,
      lineItem: row
    }

    await postRequest({
      extension: SaleRepository.DraftInvoiceSerial.del,
      record: JSON.stringify(LastSerPack)
    })

    return true
  }

  async function autoSave(draftId, lastLine) {
    if (lastLine?.srlNo) {
      const LastSerPack = {
        draftId: draftId,
        lineItem: lastLine
      }

      try {
        await postRequest({
          extension: SaleRepository.DraftInvoiceSerial.append,
          record: JSON.stringify(LastSerPack),
          noHandleError: true
        })
        toast.success(platformLabels.Saved)
        return true
      } catch (error) {
        console.log('resp', error)
        stackError({
          message: error
        })
        return false
      }
    }
  }

  async function saveHeader(lastLine) {
    console.log('in save header')

    let header = formik?.values
    header.pcs = 0
    delete header.serials
    header.date = formatDateToApi(header.date)
    header.status = 1

    const DraftInvoicePack = {
      header: header,
      items: []
    }

    const diRes = await postRequest({
      extension: SaleRepository.DraftInvoice.set2,
      record: JSON.stringify(DraftInvoicePack)
    })

    console.log('in savee', diRes.recordId)

    formik.setFieldValue('recordId', diRes.recordId)
    const success = await autoSave(diRes.recordId, lastLine)

    if (success) {
      toast.success(platformLabels.Saved)

      const diHeader = await getDraftInv(diRes.recordId)
      const diItems = await getDraftInvItems(diRes.recordId)
      await fillForm(diHeader, diItems)
      return true
    } else {
      return false
    }
  }

  const serialsColumns = [
    {
      component: 'textfield', //formik?.values?.autoSrlNo ? 'textfield' : 'resourcelookup',
      label: labels.srlNo,
      name: 'srlNo',
      flex: 2,
      ...(formik?.values?.autoSrlNo && { updateOn: 'blur' }),
      jumpToNextLine: formik?.values?.jumpToNextLine || true,
      disableDuplicate: true,
      propsReducer({ row, props }) {
        return { ...props, readOnly: row?.srlNo }
      },

      /* props: {
        ...(!formik?.values?.autoSrlNo && {
          endpointId: InventoryRepository.Serial.snapshot,
          parameters: { _itemId: 0, _siteId: formik?.values?.siteId || 0, _srlNo: 0, _startAt: 0, _pageSize: 1000 },
          displayField: 'srlNo',
          valueField: 'srlNo',
          displayFieldWidth: 2,
          columnsInDropDown: [{ key: 'srlNo', value: 'Serial No' }],
          mapping: [{ from: 'srlNo', to: 'srlNo' }]
        })
      }, */
      async onChange({ row: { update, newRow, oldRow, addRow } }) {
        if (!newRow?.srlNo) {
          return
        }

        if (newRow?.srlNo && newRow.srlNo !== oldRow?.srlNo) {
          console.log('formikkk', formik?.values)

          const res = await getRequest({
            extension: SaleRepository.DraftInvoiceSerial.get,
            parameters: `_currencyId=${formik?.values?.currencyId}&_plId=${formik?.values?.plId}&_srlNo=${newRow?.srlNo}&_siteId=${formik?.values?.siteId}`
          })

          /* if (!formik?.values?.autoSrlNo) {
            update({
              srlNo: res?.record?.srlNo || '',
              sku: res?.record?.sku || '',
              itemName: res?.record?.itemName || '',
              weight: res?.record?.weight || 0,
              itemId: res?.record?.itemId || null,
              priceType: res?.record?.priceType || 0,
              metalId: res?.record?.metalId || null,
              metalRef: res?.record?.metalRef || '',
              designId: res?.record?.designId || null,
              designRef: res?.record?.designRef || null,
              volume: res?.record?.volume || 0,
              baseLaborPrice: res?.record?.baseLaborPrice || 0,
              extendedPrice: res?.record?.extendedPrice || 0,
              unitPrice: res?.record?.unitPrice || 0,
              vatPct: res?.record?.vatPct || 0,
              vatAmount: res?.record?.vatAmount || 0,

              ...(res?.record?.taxId && {
                taxId: formik.values?.taxId || res?.record?.taxId,
                taxDetails: await FilteredListByTaxId(taxDetailsStore, formik.values?.taxId || res?.record?.taxId),
                taxDetailsButton: true
              })
            })
            await getItemPriceRow(update, newRow, addRow, DIRTYFIELD_UNIT_PRICE)
            addRow()
          } */

          if (formik?.values?.autoSrlNo) {
            let lineObj = {
              fieldName: 'srlNo',
              changes: {
                id: newRow.id,
                seqNo: newRow.id,
                draftId: formik?.values?.recordId,
                srlNo: res?.record?.srlNo || '',
                sku: res?.record?.sku || '',
                itemName: res?.record?.itemName || '',
                weight: res?.record?.weight || 0,
                itemId: res?.record?.itemId || null,
                priceType: res?.record?.priceType || 0,
                metalId: res?.record?.metalId || null,
                metalRef: res?.record?.metalRef || '',
                designId: res?.record?.designId || null,
                designRef: res?.record?.designRef || null,
                volume: res?.record?.volume || 0,
                baseLaborPrice: res?.record?.baseLaborPrice || 0,
                unitPrice: res?.record?.unitPrice || 0,
                vatPct: res?.record?.vatPct || 0,
                vatAmount: parseFloat(res?.record?.vatAmount) || 0,

                ...(res?.record?.taxId && {
                  taxId: formik.values?.taxId || res?.record?.taxId,
                  taxDetails: await FilteredListByTaxId(taxDetailsStore, formik.values?.taxId || res?.record?.taxId),
                  taxDetailsButton: true
                })
              }
            }

            const { unitPrice, baseLaborPrice } = await getItemPriceRow(lineObj.changes, DIRTYFIELD_UNIT_PRICE)

            lineObj.changes.unitPrice = unitPrice
            lineObj.changes.baseLaborPrice = baseLaborPrice

            //lineObj.changes.vatPct = 0
            //lineObj.changes.vatAmount = parseFloat(vatAmount).toFixed(2)

            if (lineObj.changes.taxId != null) {
              ;(lineObj.changes.extendedPrice = unitPrice),
                (lineObj.changes.taxDetails = FilteredListByTaxId(taxDetailsStore, lineObj.changes.taxId))
            }

            // console.log(lineObj.changes)
            // console.log(formik?.values?.recordId)

            const successSave = formik?.values?.recordId
              ? await autoSave(formik?.values?.recordId, lineObj.changes)
              : await saveHeader(lineObj.changes)

            console.log('successSave', successSave)
            if (!successSave) {
              console.log('in condition', {
                id: newRow?.id
              })
              update({
                id: newRow?.id,
                srlNo: ''
              })
            } else {
              addRow(lineObj)
            }
          }
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
        row.qty = row.weight
        row.basePrice = 0
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
        decimalScale: 2,
        readOnly: true
      }
      /* async onChange({ row: { update, newRow } }) {
        const { unitPrice, baseLaborPrice} = await getItemPriceRow(newRow, DIRTYFIELD_UNIT_PRICE)

        update({
          unitPrice: unitPrice,
          baseLaborPrice: baseLaborPrice,
        })
      } */
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
      props: {
        endPoint: SaleRepository.DraftInvoiceSerial.batch,
        draftId: formik?.values?.recordId,
        onCloseimport: fillGrids,
        maxAccess: maxAccess
      },
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
      disabled: !isClosed || formik.values.status == 3 || formik.values.deliveryStatus == 4 || !editMode
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

  async function fillGrids() {
    let diHeader = await getDraftInv(formik?.values?.recordId)
    let diItems = await getDraftInvItems(formik?.values?.recordId)

    const modifiedList = await Promise.all(
      diItems.list?.map(async (item, index) => {
        const taxDetailsResponse = diHeader?.record?.isVattable ? await getTaxDetails(item.taxId) : null

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

    formik.setFieldValue('serials', modifiedList)

    assignStoreTaxDetails(modifiedList)
  }

  async function fillForm(diHeader, diItems, plId) {
    let modifiedList = []

    diItems &&
      (modifiedList = await Promise.all(
        diItems?.list?.map(async (item, index) => {
          const taxDetailsResponse = diHeader?.record?.isVattable ? await getTaxDetails(item.taxId) : null

          console.log('serialll', diItems)

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
      ))

    console.log('PLID', formik.values, diHeader.record)

    await formik.setValues({
      ...formik.values,
      ...diHeader.record,
      plId: plId || formik?.values?.plId,
      amount: parseFloat(diHeader?.record?.amount).toFixed(2),
      vatAmount: parseFloat(diHeader?.record?.vatAmount).toFixed(2),
      subtotal: parseFloat(diHeader?.record?.subtotal).toFixed(2),
      totalWeight: parseFloat(diHeader?.record?.totalWeight).toFixed(2),
      serials: modifiedList
    })

    assignStoreTaxDetails(modifiedList)
  }

  async function getTaxDetails(taxId) {
    if (!taxId) return

    const res = await getRequest({
      extension: FinancialRepository.TaxDetailPack.qry,
      parameters: `_taxId=${taxId}`
    })

    return res?.list
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
    formik.setFieldValue('siteRef', dtd?.record?.siteId && (await getSiteRef(dtd?.record?.siteId)))
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
          acc[metalId].totalWeight += parseFloat(weight || 0)
        }

        return acc
      }, {})

      Object.keys(metalMap).forEach(metalId => {
        metalMap[metalId].totalWeight = parseFloat(metalMap[metalId].totalWeight.toFixed(2))
      })

      setMetalGridData(Object.values(metalMap))

      var seqNo = 0

      const itemMap = serials.reduce((acc, { sku, itemId, itemName, weight }) => {
        if (itemId) {
          if (!acc[itemId]) {
            seqNo++
            acc[itemId] = { sku: sku, pcs: 0, weight: 0, itemName: itemName, seqNo: seqNo }
          }
          acc[itemId].pcs += 1
          acc[itemId].weight += parseFloat(weight || 0)
        }

        return acc
      }, {})

      setItemGridData(Object.values(itemMap).sort((a, b) => a.seqNo - b.seqNo))
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
    console.log('feObj', myObject)

    return myObject
  }

  useEffect(() => {
    ;(async function () {
      const myObject = await getDefaultsData()
      getUserDefaultsData()

      console.log('plid', parseInt(myObject?.plId))

      myObject?.plId
        ? formik.setFieldValue('plId', myObject?.plId)
        : stackError({
            message: labels.noSelectedplId
          })

      if (formik?.values?.recordId) {
        await refetchForm(formik?.values?.recordId, myObject?.plId)
      } else {
        console.log('def', myObject)
        formik.setFieldValue('currencyId', parseInt(myObject?.currencyId))

        if (documentType?.dtId) {
          formik.setFieldValue('dtId', documentType.dtId)
          getDTD(documentType?.dtId)
        }
      }
    })()
  }, [])

  useEffect(() => {
    const { subtotal, vatAmount, totalWeight } = formik?.values?.serials?.reduce(
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

    formik.setFieldValue('subtotal', subtotal)
    formik.setFieldValue('vatAmount', vatAmount)
    formik.setFieldValue('weight', totalWeight)
  }, [formik?.values?.serials])

  return (
    <FormShell
      resourceId={ResourceIds.DraftSerialsInvoices}
      functionId={SystemFunction.DraftSerialsIn}
      form={formik}
      maxAccess={maxAccess}
      previewReport={editMode}
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
                        formik.setFieldValue('dtId', newValue ? newValue.recordId : null)
                        changeDT(newValue)
                        onChangeDtId(recordId)
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
                    readOnly={isClosed || editMode}
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
                      if (!newValue?.isInactive) {
                        formik.setFieldValue('siteId', newValue ? newValue.recordId : null)
                        formik.setFieldValue('siteRef', newValue ? newValue.reference : null)
                      } else {
                        formik.setFieldValue('siteId', null)
                        formik.setFieldValue('siteRef', null)

                        stackError({
                          message: labels.inactiveSite
                        })
                      }
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
                    readOnly={isClosed || editMode}
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
                        filter={{ isInactive: false }}
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
                          { key: 'szName', value: 'Sales Zone' },
                          { key: 'keywords', value: 'Keywords' },
                          { key: 'cgName', value: 'Client Group' }
                        ]}
                        onChange={async (event, newValue) => {
                          formik.setFieldValue('clientId', newValue?.recordId)
                          formik.setFieldValue('clientName', newValue?.name)
                          formik.setFieldValue('accountId', newValue?.accountId)
                          formik.setFieldValue('isVattable', newValue?.isSubjectToVAT || false)
                          formik.setFieldValue('taxId', newValue?.taxId)
                        }}
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
            onChange={value => {
              formik.setFieldValue('serials', value)
            }}
            value={filteredData}
            error={formik.errors.serials}
            columns={serialsColumns}
            name='serials'
            maxAccess={maxAccess}
            disabled={isClosed || !formik.values.clientId}
            allowDelete={!isClosed}
            autoDelete={autoDelete}
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
                  value={formik?.values?.subtotal}
                  readOnly
                />
              </Grid>
              <Grid item sx={{ pt: 2 }}>
                <CustomNumberField
                  name='vatAmount'
                  maxAccess={maxAccess}
                  label={labels.vat}
                  value={formik?.values?.vatAmount}
                  readOnly
                />
              </Grid>
              <Grid item sx={{ pt: 2 }}>
                <CustomNumberField
                  name='total'
                  maxAccess={maxAccess}
                  label={labels.total}
                  value={Number(formik?.values?.subtotal) + Number(formik?.values?.vatAmount) || 0}
                  readOnly
                />
              </Grid>
              <Grid item sx={{ pt: 12 }}>
                <CustomNumberField
                  name='totalWeight'
                  maxAccess={maxAccess}
                  label={labels.totalWeight}
                  value={formik?.values?.weight}
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
