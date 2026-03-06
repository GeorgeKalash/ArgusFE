import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import { formatDateFromApi, formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'
import { Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
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
import { FinancialRepository } from '@argus/repositories/src/repositories/FinancialRepository'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import WorkFlow from '@argus/shared-ui/src/components/Shared/WorkFlow'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { getVatCalc } from '@argus/shared-utils/src/utils/VatCalculator'
import { useDocumentType } from '@argus/shared-hooks/src/hooks/documentReferenceBehaviors'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import TaxDetails from '@argus/shared-ui/src/components/Shared/TaxDetails'
import ImportSerials from '@argus/shared-ui/src/components/Shared/ImportSerials'
import { getIPR, DIRTYFIELD_UNIT_PRICE } from '@argus/shared-utils/src/utils/ItemPriceCalculator'
import { SystemChecks } from '@argus/shared-domain/src/resources/SystemChecks'
import { useError } from '@argus/shared-providers/src/providers/error'
import CustomButton from '@argus/shared-ui/src/components/Inputs/CustomButton'
import AccountSummary from '@argus/shared-ui/src/components/Shared/AccountSummary'
import { PurchaseRepository } from '@argus/repositories/src/repositories/PurchaseRepository'
import { DefaultsContext } from '@argus/shared-providers/src/providers/DefaultsContext'

export default function PUDraftReturnForm({ labels, access, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { stack: stackError } = useError()
  const { platformLabels } = useContext(ControlContext)
  const { systemDefaults, userDefaults, systemChecks } = useContext(DefaultsContext)
  const [reCal, setReCal] = useState(false)

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.PUDraftSerialReturn,
    access,
    enabled: !recordId,
    objectName: 'header'
  })

  const invalidate = useInvalidate({
    endpointId: PurchaseRepository.PUDraftReturn.page
  })

  useEffect(() => {
    if (documentType?.dtId) {
      onChangeDtId(documentType.dtId)
    }
  }, [documentType?.dtId])

  const defCurrencyId = parseInt(systemDefaults?.list?.find(obj => obj.key === 'currencyId')?.value)
  const defSiteId = parseInt(userDefaults?.list?.find(obj => obj.key === 'siteId')?.value)

  const { formik } = useForm({
    maxAccess,
    documentType: { key: 'dtId', value: documentType?.dtId },
    initialValues: {
      recordId,
      header: {
        dtId: null,
        reference: '',
        date: new Date(),
        plantId: null,
        vendorId: null,
        currencyId: defCurrencyId || null,
        siteId: defSiteId || null,
        description: '',
        status: 1,
        wip: 1,
        isVattable: false,
        taxId: null,
        weight: 0,
        disSkuLookup: false,
        invoiceId: null,
        invoiceRef: '',
        subTotal: 0,
        vatAmount: 0,
        amount: 0,
        search: ''
      },
      serials: [
        {
          id: 1,
          returnId: recordId || 0,
          srlNo: '',
          metalId: '',
          designId: '',
          itemId: '',
          sku: '',
          itemName: '',
          seqNo: 1,
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
          volume: 0,
          invoiceReference: '',
          invoiceTrxId: null,
          invoiceSeqNo: 1,
          invoiceComponentSeqNo: 0
        }
      ],
      metalGridData: [],
      itemGridData: [],
      taxDetailsStore: []
    },
    validateOnChange: true,
    validationSchema: yup.object({
      header: yup.object({
        dtId: yup.number().required(),
        date: yup.date().required(),
        currencyId: yup.number().required(),
        vendorId: yup.number().required(),
        plantId: yup.number().required(),
        siteId: yup.number().required()
      }),
      serials: yup.array().of(
        yup.object().shape({
          srlNo: yup.string().test({
            name: 'srlNo-first-row-check',
            test(value, context) {
              const { parent } = context

              if (parent?.id == 1) return true
              if (parent?.id > 1 && !value) return false

              return value
            }
          })
        })
      )
    }),
    onSubmit: async obj => {
      const { invoiceId, invoiceRef, disSkuLookup, search, date, ...rest } = obj.header

      const DraftReturnPack = {
        header: {
          ...rest,
          pcs: obj?.serials.length,
          date: formatDateToApi(date)
        },
        items: formik?.values?.serials
          .filter(row => row.srlNo)
          .map(({ taxDetails, recordId, ...rest }, index) => ({
            ...rest,
            seqNo: index + 1,
            returnId: recordId || 0
          }))
      }

      postRequest({
        extension: PurchaseRepository.PUDraftReturn.set2,
        record: JSON.stringify(DraftReturnPack)
      }).then(async diRes => {
        toast.success(recordId ? platformLabels.Edited : platformLabels.Added)
        await refetchForm(diRes.recordId)
        invalidate()
      })
    }
  })

  async function refetchForm(recordId) {
    const diHeader = await getDraftReturn(recordId)
    const diItems = await getDraftReturnItems(recordId)
    fillForm(diHeader, diItems)
  }

  async function getDraftReturn(diId) {
    const res = await getRequest({
      extension: PurchaseRepository.PUDraftReturn.get,
      parameters: `_recordId=${diId}`
    })

    const vendorRes = await getRequest({
      extension: PurchaseRepository.Vendor.get,
      parameters: `_recordId=${res?.record?.vendorId}`
    })

    res.record.date = formatDateFromApi(res?.record?.date)
    res.record.accountId = vendorRes.record.accountId

    return res
  }

  async function getDraftReturnItems(diId) {
    return await getRequest({
      extension: PurchaseRepository.PUDraftReturnSerial.qry,
      parameters: `_returnId=${diId}`
    })
  }

  async function fillTaxStore() {
    const taxDet = await getRequest({
      extension: FinancialRepository.TaxDetailPack.qry,
      parameters: `_taxId=0`
    })

    formik.setFieldValue('taxDetailsStore', taxDet?.list)
  }

  function getItemPriceRow(newRow, dirtyField) {
    !reCal && setReCal(true)

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

    return {
      unitPrice: parseFloat(itemPriceRow?.extendedPrice).toFixed(2),
      baseLaborPrice: parseFloat(itemPriceRow?.unitPrice).toFixed(2),
      vatAmount: parseFloat(vatCalcRow?.vatAmount).toFixed(2)
    }
  }

  const jumpToNextLine = systemChecks?.find(item => item.checkId === SystemChecks.POS_JUMP_TO_NEXT_LINE)?.value
  const editMode = !!formik.values?.recordId
  const isPosted = formik.values.header?.status === 3

  const assignStoreTaxDetails = serials => {
    if (serials.length) {
      const updatedSer = serials?.map(serial => {
        return serial.taxId != null
          ? {
              ...serial,
              extendedPrice: serial.unitPrice,
              taxDetails: FilteredListByTaxId(formik?.values?.taxDetailsStore, serial.taxId)
            }
          : serial
      })
      formik.setFieldValue('serials', updatedSer)
    }
  }

  const FilteredListByTaxId = (store, taxId) => {
    if (!store?.data?.items) return []

    return store.data.items.map(item => item.data).filter(obj => obj.taxId === taxId)
  }

  const autoDelete = async row => {
    if (!row?.returnId || !row?.itemId) return true

    const LastSerPack = {
      returnId: formik?.values?.recordId,
      lineItem: row
    }

    await postRequest({
      extension: PurchaseRepository.PUDraftReturnSerial.del,
      record: JSON.stringify(LastSerPack)
    })

    return true
  }

  async function autoSaveImport(header, lastLine, id) {
    if (lastLine?.srlNo) {
      return autoSaveProcess(header, lastLine, id)
    }
  }

  async function autoSaveProcess(header, lastLine, id) {
    lastLine.returnId = header?.recordId || id
    header.recordId = header?.recordId || id
    delete header.serials

    const LastSerPack = {
      header,
      lineItem: lastLine
    }

    const response = await postRequest({
      extension: PurchaseRepository.PUDraftReturnSerial.append,
      record: JSON.stringify(LastSerPack),
      noHandleError: true
    })
    if (response?.error) {
      stackError({
        message: response?.error
      })

      return false
    } else return true
  }

  async function autoSave(header, lastLine) {
    if (lastLine?.srlNo) {
      const resp = autoSaveProcess(header, lastLine)
      if (resp) {
        toast.success(platformLabels.Saved)

        return true
      } else {
        return false
      }
    }
  }

  async function saveHeader(lastLine, type) {
    const { invoiceId, invoiceRef, disSkuLookup, search, date, ...rest } = formik?.values?.header

    const DraftReturnPack = {
      header: {
        ...rest,
        pcs: 0,
        date: formatDateToApi(date)
      },
      items: []
    }

    const diRes = await postRequest({
      extension: PurchaseRepository.PUDraftReturn.set2,
      record: JSON.stringify(DraftReturnPack)
    })

    const diHeader = await getDraftReturn(diRes.recordId)
    formik.setFieldValue('header.recordId', diRes.recordId)
    formik.setFieldValue('header.reference', diHeader?.record?.reference)
    formik.setFieldValue('header.date', diHeader?.record?.date)

    const success =
      type === 'import' ? await autoSaveImport(diHeader?.record, lastLine) : await autoSave(diHeader?.record, lastLine)

    if (success) {
      toast.success(platformLabels.Saved)

      const diHeader = await getDraftReturn(diRes.recordId)
      const diItems = await getDraftReturnItems(diRes.recordId)
      await fillForm(diHeader, diItems)
      invalidate()

      return true
    } else {
      return false
    }
  }

  const serialsColumns = [
    {
      component: 'textfield',
      label: labels.srlNo,
      name: 'srlNo',
      flex: 1.2,
      updateOn: 'blur',
      jumpToNextLine: jumpToNextLine,
      disableDuplicate: true,
      propsReducer({ row, props }) {
        return { ...props, readOnly: row?.srlNo }
      },
      async onChange({ row: { update, newRow, oldRow, addRow } }) {
        if (!newRow?.srlNo) {
          return
        }

        if (newRow?.srlNo && newRow.srlNo !== oldRow?.srlNo) {
          const res = await getRequest({
            extension: PurchaseRepository.Serials.last,
            parameters: `_currencyId=${formik?.values?.header?.currencyId}&_vendorId=${formik?.values?.header?.vendorId}&_srlNo=${newRow?.srlNo}`
          })

          let lineObj = {
            fieldName: 'srlNo',
            changes: {
              id: newRow.id,
              seqNo: newRow.id,
              invoiceSeqNo: newRow.id,
              invoiceComponentSeqNo: res?.record?.invoiceComponentSeqNo || 0,
              returnId: formik?.values?.recordId,
              srlNo: res?.record?.srlNo,
              sku: res?.record?.sku,
              itemName: res?.record?.itemName,
              weight: res?.record?.weight || 0,
              itemId: res?.record?.itemId,
              metalId: res?.record?.metalId,
              metalRef: res?.record?.metalRef,
              designId: res?.record?.designId,
              designRef: res?.record?.designRef,
              invoiceReference: res?.record?.invoiceRef,
              volume: res?.record?.volume || 0,
              baseLaborPrice: res?.record?.laborPrice || 0,
              unitPrice: parseFloat(res?.record?.unitPrice).toFixed(2) || 0,
              vatPct: res?.record?.vatPct || 0,
              extendedPrice: res?.record?.extendedPrice || 0,
              vatAmount: parseFloat(res?.record?.vatAmount).toFixed(2) || 0,
              invoiceTrxId: res?.record?.trxId || null,

              ...(res?.record?.taxId && {
                taxId: formik.values?.taxId || res?.record?.taxId,
                taxDetails: await FilteredListByTaxId(
                  formik?.values?.taxDetailsStore,
                  formik.values?.header?.taxId || res?.record?.taxId
                )
              })
            }
          }

          const { unitPrice, baseLaborPrice } = getItemPriceRow(lineObj.changes, DIRTYFIELD_UNIT_PRICE)

          lineObj.changes.unitPrice = unitPrice
          lineObj.changes.baseLaborPrice = baseLaborPrice

          if (lineObj.changes.taxId != null) {
            ;(lineObj.changes.extendedPrice = unitPrice),
              (lineObj.changes.taxDetails = FilteredListByTaxId(formik?.values?.taxDetailsStore, lineObj.changes.taxId))
          }

          const successSave = formik?.values?.recordId
            ? await autoSave(formik?.values?.header, lineObj.changes)
            : await saveHeader(lineObj.changes)

          if (!successSave) {
            update({
              ...formik?.initialValues?.serials,
              id: newRow?.id,
              srlNo: ''
            })
          } else {
            await addRow(lineObj)
          }
        }
      }
    },
    {
      component: 'textfield',
      label: labels.itemRef,
      name: 'sku',
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      label: labels.itemDesc,
      name: 'itemName',
      flex: 2,
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      label: labels.metal,
      name: 'metalRef',
      flex: 0.6,
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      label: labels.invoiceNo,
      name: 'invoiceReference',
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
      label: labels.vatAmount,
      name: 'vatAmount',
      props: {
        readOnly: true
      }
    },
    {
      component: 'button',
      name: 'taxDetailsButton',
      flex: 0.75,
      props: {
        onCondition: row => {
          if (row.itemId && row.taxId) {
            return {
              imgSrc:require('@argus/shared-ui/src/components/images/buttonsIcons/tax-icon.png').default.src, 
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
        row.qty = row.weight
        row.basePrice = 0
        stack({
          Component: TaxDetails,
          props: {
            taxId: row?.taxId,
            obj: row
          }
        })
      }
    }
  ]

  async function onWorkFlowClick() {
    stack({
      Component: WorkFlow,
      props: {
        functionId: SystemFunction.PUDraftSerialReturn,
        recordId: formik.values?.recordId
      }
    })
  }

  async function onImportClick() {
    stack({
      Component: ImportSerials,
      props: {
        endPoint: PurchaseRepository.PUDraftReturnSerial.batch,
        header: {
          draftId: formik?.values?.recordId
        },
        onCloseimport: fillGrids,
        maxAccess: maxAccess
      }
    })
  }

  const onPost = async () => {
    const { invoiceId, invoiceRef, disSkuLookup, search, date, ...rest } = formik?.values?.header

    await postRequest({
      extension: PurchaseRepository.PUDraftReturn.post,
      record: JSON.stringify({
        ...rest,
        date: formatDateToApi(date),
        wip: 2
      })
    }).then(async () => {
      toast.success(platformLabels.Posted)
      invalidate()
      await refetchForm(formik?.values?.recordId)
    })
  }

  const actions = [
    {
      key: 'WorkFlow',
      condition: true,
      onClick: onWorkFlowClick,
      disabled: !editMode
    },
    {
      key: 'Import',
      condition: true,
      onClick: onImportClick,
      disabled: !editMode || isPosted
    },
    {
      key: 'AccountSummary',
      condition: true,
      onClick: () => {
        stack({
          Component: AccountSummary,
          props: {
            accountId: parseInt(formik.values.header?.accountId),
            date: formik?.values?.header?.date
          }
        })
      },
      disabled: !formik.values.header?.accountId || !formik.values.header?.date
    },
    {
      key: 'Unlocked',
      condition: !isPosted,
      onClick: onPost,
      disabled: !editMode
    },
    {
      key: 'Locked',
      condition: isPosted,
      disabled: true
    }
  ]

  async function fillGrids() {
    const diHeader = await getDraftReturn(formik?.values?.recordId)
    const diItems = await getDraftReturnItems(formik?.values?.recordId)

    const modifiedList = await Promise.all(
      diItems.list?.map(async (item, index) => {
        const taxDetailsResponse = diHeader?.record?.isVattable ? await getTaxDetails(item.taxId) : null

        return {
          ...item,
          id: index + 1,
          baseLaborPrice: parseFloat(item.baseLaborPrice).toFixed(2),
          unitPrice: parseFloat(item.unitPrice).toFixed(2),
          vatAmount: parseFloat(item.vatAmount).toFixed(2),
          amount: parseFloat(item.amount).toFixed(2),
          taxDetails: taxDetailsResponse
        }
      })
    )

    await formik.setValues({
      ...formik.values,
      ...diHeader.record,
      serials: modifiedList.length ? modifiedList : formik?.initialValues?.serials
    })

    assignStoreTaxDetails(modifiedList)
  }

  async function fillForm(diHeader, diItems) {
    const modifiedList = await Promise.all(
      diItems?.list?.map(async (item, index) => {
        const taxDetailsResponse = diHeader?.record?.isVattable ? await getTaxDetails(item.taxId) : null

        return {
          ...item,
          id: item.seqNo,
          baseLaborPrice: parseFloat(item.baseLaborPrice).toFixed(2),
          unitPrice: parseFloat(item.unitPrice).toFixed(2),
          vatAmount: parseFloat(item.vatAmount).toFixed(2),
          amount: parseFloat(item.amount).toFixed(2),
          taxDetails: taxDetailsResponse
        }
      })
    )

    await formik.setValues({
      ...formik.values,
      recordId: diHeader.record.recordId,
      dtId: diHeader.record.dtId,
      header: {
        ...formik.values.header,
        ...diHeader.record,
        amount: diHeader?.record?.amount,
        vatAmount: diHeader?.record?.vatAmount,
        subTotal: diHeader?.record?.subTotal,
        weight: diHeader?.record?.weight
      },
      serials: modifiedList.length ? modifiedList : formik?.initialValues?.serials
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

  const filteredData = formik.values.header?.search
    ? formik.values.serials.filter(
        item =>
          item.srlNo?.toString()?.includes(formik.values.header?.search.toLowerCase()) ||
          item.sku?.toString()?.toLowerCase()?.includes(formik.values.header?.search.toLowerCase()) ||
          item.itemName?.toString()?.toLowerCase()?.includes(formik.values.header?.search.toLowerCase()) ||
          item.weight?.toString()?.includes(formik.values.header?.search)
      )
    : formik.values.serials

  const handleSearchChange = event => {
    const { value } = event.target
    formik.setFieldValue('header.search', value)
  }

  const handleGridChange = (value, action, row) => {
    if (action === 'delete') {
      let updatedSerials = formik.values.serials

      updatedSerials = updatedSerials.filter(item => item.id !== row.id)
      formik.setFieldValue('serials', updatedSerials)
      setReCal(true)
    } else {
      formik.setFieldValue('serials', value)
    }
  }

  async function onChangeDtId(recordId) {
    if (recordId) {
      const dtd = await getRequest({
        extension: PurchaseRepository.DocumentTypeDefault.get,
        parameters: `_dtId=${recordId}`
      })

      formik.setFieldValue('header.plantId', dtd?.record?.plantId || null)
      formik.setFieldValue('header.siteId', dtd?.record?.siteId || defSiteId || null)
    } else {
      formik.setFieldValue('header.plantId', null)
      formik.setFieldValue('header.siteId', null)
    }
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

      formik.setFieldValue('metalGridData', Object.values(metalMap))

      var seqNo = 0

      const itemMap = serials.reduce((acc, { sku, itemId, itemName, weight }) => {
        if (itemId) {
          if (!acc[itemId]) {
            seqNo++
            acc[itemId] = { sku: sku, pcs: 0, weight: 0, itemName: itemName, seqNo: seqNo }
          }
          acc[itemId].pcs += 1
          acc[itemId].weight = parseFloat((acc[itemId].weight + parseFloat(weight || 0)).toFixed(2))
        }

        return acc
      }, {})

      formik.setFieldValue(
        'itemGridData',
        Object.values(itemMap).sort((a, b) => a.seqNo - b.seqNo)
      )
    }
  }, [formik?.values?.serials])

  const { subTotal, vatAmount, weight, amount } = formik?.values?.serials?.reduce(
    (acc, row) => {
      const subTot = parseFloat(row?.unitPrice) || 0
      const vatAmountTot = parseFloat(row?.vatAmount) || 0
      const weight = parseFloat(row?.weight) || 0

      return {
        subTotal: reCal ? parseFloat((acc?.subTotal + subTot).toFixed(2)) : formik.values?.header?.subTotal || 0,
        vatAmount: reCal
          ? parseFloat((acc?.vatAmount + vatAmountTot).toFixed(2))
          : formik.values?.header?.vatAmount || 0,
        weight: reCal ? acc?.weight + weight : formik.values?.header?.weight || 0,
        amount: reCal
          ? parseFloat((acc?.subTotal + subTot + acc?.vatAmount + vatAmountTot).toFixed(2))
          : formik.values?.header?.amount || 0
      }
    },
    { subTotal: 0, vatAmount: 0, weight: 0, amount: 0 }
  )

  useEffect(() => {
    formik.setFieldValue('header.subTotal', subTotal)
    formik.setFieldValue('header.vatAmount', vatAmount)
    formik.setFieldValue('header.weight', weight)
    formik.setFieldValue('header.amount', amount)
  }, [weight, subTotal, vatAmount, amount])

  useEffect(() => {
    ;(async function () {
      fillTaxStore()

      if (recordId) {
        await refetchForm(recordId)
      }
    })()
  }, [])

  async function importSerials() {
    const isValid = await onValidationRequired()
    if (!isValid) return

    let updatedSerials = [...formik.values.serials]

    const res = await getRequest({
      extension: PurchaseRepository.Serials.import,
      parameters: `_invoiceId=${formik?.values?.header?.invoiceId}`
    })

    let lId = updatedSerials.length ? updatedSerials[updatedSerials.length - 1].id : 0

    if (res.count > 0) {
      updatedSerials = updatedSerials.filter(s => s.srlNo)
      for (const x of res.list) {
        const draft = {
          srlNo: x.srlNo,
          itemId: x.itemId,
          sku: x.sku,
          itemName: x.itemName,
          invoiceReference: formik?.values?.header?.invoiceRef,
          invoiceTrxId: x.trxId,
          invoiceSeqNo: x.seqNo,
          invoiceComponentSeqNo: x.componentSeqNo,
          weight: x.weight,
          metalId: x.metalId,
          baseLaborPrice: x.laborPrice,
          unitPrice: x.unitPrice,
          vatAmount: x.vatAmount,
          metalRef: x.metalRef,
          seqNo: lId + 1,
          id: lId + 1,
          ...(res?.record?.taxId && {
            taxId: formik.values?.header?.taxId || res?.record?.taxId
          })
        }

        const { unitPrice, baseLaborPrice } = getItemPriceRow(draft, DIRTYFIELD_UNIT_PRICE)

        draft.unitPrice = unitPrice
        draft.baseLaborPrice = baseLaborPrice

        if (draft.taxId != null) {
          draft.extendedPrice = unitPrice
        }

        const successSave =
          formik?.values?.recordId || updatedSerials.length > 0
            ? await autoSaveImport(formik?.values?.header, draft, updatedSerials?.[0]?.returnId)
            : await saveHeader(draft, 'import')

        if (successSave) {
          lId++
          formik.setFieldValue('serials', [...updatedSerials, draft])

          updatedSerials.push(draft)
        }
      }
      toast.success(platformLabels.Saved)
    }
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

      return false
    }

    return true
  }

  return (
    <FormShell
      resourceId={ResourceIds.PUDraftSerialReturns}
      functionId={SystemFunction.DraftInvoiceReturn}
      form={formik}
      maxAccess={maxAccess}
      previewReport={editMode}
      isPosted={isPosted}
      actions={actions}
      editMode={editMode}
      disabledSubmit={isPosted && !editMode}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={8}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <ResourceComboBox
                    endpointId={SystemRepository.DocumentType.qry}
                    parameters={`_startAt=0&_pageSize=1000&_dgId=${SystemFunction.PUDraftSerialReturn}`}
                    name='header.dtId'
                    label={labels.documentType}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    readOnly={editMode}
                    required
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    values={formik.values.header}
                    maxAccess={maxAccess}
                    onChange={async (_, newValue) => {
                      await onChangeDtId(newValue?.recordId)
                      changeDT(newValue)
                      formik.setFieldValue('header.dtId', newValue?.recordId || null)
                    }}
                    error={formik.touched.header?.dtId && Boolean(formik.errors.header?.dtId)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <ResourceComboBox
                    endpointId={InventoryRepository.Site.qry}
                    name='header.siteId'
                    readOnly={isPosted}
                    label={labels.site}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik.values.header}
                    required
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    maxAccess={maxAccess}
                    onChange={(_, newValue) => {
                      if (!newValue?.isInactive) {
                        formik.setFieldValue('header.siteId', newValue?.recordId || null)
                      } else {
                        formik.setFieldValue('header.siteId', null)
                        stackError({
                          message: labels.inactiveSite
                        })
                      }
                    }}
                    error={formik.touched.header?.siteId && Boolean(formik.errors.header?.siteId)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <CustomTextField
                    name='header.reference'
                    label={labels.docReference}
                    value={formik?.values?.header?.reference}
                    maxAccess={!editMode && maxAccess}
                    readOnly={editMode}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('header.reference', '')}
                    error={formik.touched.header?.reference && Boolean(formik.errors.header?.reference)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <ResourceComboBox
                    endpointId={SystemRepository.Plant.qry}
                    name='header.plantId'
                    label={labels.plant}
                    readOnly={isPosted}
                    required
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik.values.header}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    maxAccess={maxAccess}
                    onChange={(_, newValue) => {
                      formik.setFieldValue('header.plantId', newValue?.recordId)
                    }}
                    error={formik.touched.header?.plantId && Boolean(formik.errors.header?.plantId)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <CustomDatePicker
                    name='header.date'
                    required
                    label={labels.postingDate}
                    value={formik?.values?.header?.date}
                    onChange={(_, newValue) => {
                      formik.setFieldValue('header.date', newValue)
                      formik.setFieldValue('header.invoiceId', null)
                      formik.setFieldValue('header.invoiceRef', '')
                    }}
                    readOnly={isPosted}
                    maxAccess={maxAccess}
                    onClear={() => formik.setFieldValue('header.date', '')}
                    error={formik.touched.header?.date && Boolean(formik.errors.header?.date)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <ResourceComboBox
                    endpointId={SystemRepository.Currency.qry}
                    name='header.currencyId'
                    filter={item => item.currencyType === 1}
                    label={labels.currency}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    required
                    readOnly={editMode}
                    values={formik.values.header}
                    maxAccess={maxAccess}
                    onChange={(_, newValue) => {
                      formik.setFieldValue('header.invoiceId', null)
                      formik.setFieldValue('header.invoiceRef', '')
                      formik.setFieldValue('header.currencyId', newValue?.recordId || null)
                    }}
                    error={formik.touched.header?.currencyId && Boolean(formik.errors.header?.currencyId)}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={4}>
              <CustomTextArea
                name='header.description'
                label={labels.description}
                value={formik.values.header?.description}
                rows={4.2}
                readOnly={isPosted}
                maxAccess={maxAccess}
                onChange={e => formik.setFieldValue('header.description', e.target.value)}
                onClear={() => formik.setFieldValue('header.description', '')}
                error={formik.touched.header?.description && Boolean(formik.errors.header?.description)}
              />
            </Grid>
            <Grid item xs={8}>
              <ResourceLookup
                endpointId={PurchaseRepository.Vendor.snapshot}
                filter={{ isInactive: val => val !== true }}
                valueField='reference'
                displayField='name'
                secondFieldLabel={labels.name}
                name='header.vendorId'
                label={labels.vendor}
                formObject={formik.values.header}
                form={formik}
                required
                readOnly={isPosted}
                displayFieldWidth={2}
                firstFieldWidth={3}
                secondFieldName={'header.vendorName'}
                valueShow='vendorRef'
                secondValueShow='vendorName'
                maxAccess={maxAccess}
                onSecondValueChange={(_, value) => {
                  formik.setFieldValue('header.vendorName', value)
                }}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' },
                  { key: 'flName', value: 'Foreign Language' }
                ]}
                onChange={async (_, newValue) => {
                  formik.setFieldValue('header.vendorName', newValue?.name || '')
                  formik.setFieldValue('header.vendorRef', newValue?.reference || '')

                  formik.setFieldValue('header.accountId', newValue?.accountId || null)
                  formik.setFieldValue('header.isVattable', newValue?.isTaxable || false)
                  formik.setFieldValue('header.taxId', newValue?.taxId || null)
                  formik.setFieldValue('header.invoiceId', null)
                  formik.setFieldValue('header.invoiceRef', '')
                  formik.setFieldValue('header.vendorId', newValue?.recordId || null)
                }}
                errorCheck={'header.vendorId'}
              />
            </Grid>
            <Grid item xs={4}>
              <ResourceComboBox
                endpointId={FinancialRepository.TaxSchedules.qry}
                name='header.taxId'
                label={labels.tax}
                valueField='recordId'
                displayField={['name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                readOnly
                values={formik.values.header}
                maxAccess={maxAccess}
                onChange={(_, newValue) => {
                  formik.setFieldValue('header.taxId', newValue?.recordId || null)
                }}
                error={formik.touched.header?.taxId && Boolean(formik.errors.header?.taxId)}
              />
            </Grid>
            <Grid item xs={4}>
              <ResourceComboBox
                key={`${formik.values.header?.vendorId}-${formik?.values?.header?.date ? formik.values.header?.date?.toISOString() : null}-${
                  formik.values.header?.currencyId
                }`}
                endpointId={
                  formik?.values?.header?.vendorId &&
                  formik?.values?.header?.date &&
                  PurchaseRepository.PUInvoiceRetBalance.balance
                }
                parameters={`_vendorId=${
                  formik?.values?.header?.vendorId
                }&_returnDate=${formik?.values?.header?.date ? formik?.values?.header?.date?.toISOString() : null}`}
                filter={item => item.currencyId == formik?.values?.header?.currencyId}
                name='header.invoiceId'
                label={labels.puInv}
                valueField='recordId'
                displayField={'reference'}
                displayFieldWidth={1}
                readOnly={isPosted}
                values={formik.values.header}
                maxAccess={maxAccess}
                onChange={(_, newValue) => {
                  formik.setFieldValue('header.invoiceId', newValue?.recordId || null)
                  formik.setFieldValue('header.invoiceRef', newValue?.reference || '')
                }}
                error={formik.touched.header?.invoiceId && Boolean(formik.errors.header?.invoiceId)}
              />
            </Grid>
            <Grid item xs={4}>
              <CustomButton
                onClick={importSerials}
                label={platformLabels.import}
                image={'import.png'}
                color='#000'
                disabled={!formik?.values?.header?.invoiceId || isPosted}
              />
            </Grid>
            <Grid item xs={4}>
              <CustomTextField
                name='header.search'
                value={formik.values.header?.search}
                label={platformLabels.Search}
                onClear={() => {
                  formik.setFieldValue('header.search', '')
                }}
                onChange={handleSearchChange}
                onSearch={e => formik.setFieldValue('header.search', e)}
                search={true}
              />
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <DataGrid
            onChange={(value, action, row) => handleGridChange(value, action, row)}
            value={filteredData || []}
            error={formik.errors.serials}
            initialValues={formik?.initialValues?.serials?.[0]}
            columns={serialsColumns}
            name='serials'
            maxAccess={maxAccess}
            disabled={isPosted || Object.entries(formik?.errors || {}).filter(([key]) => key !== 'serials').length > 0}
            allowDelete={!isPosted}
            allowAddNewLine={
              !formik?.values?.header?.search &&
              (formik.values?.serials?.length === 0 ||
                !!formik.values?.serials?.[formik.values?.serials?.length - 1]?.srlNo)
            }
            autoDelete={autoDelete}
            onValidationRequired={onValidationRequired}
          />
        </Grow>
        <Grid container spacing={2}>
          <Grid item xs={5} height={'13vh'} sx={{ display: 'flex', flex: 1 }}>
            <Table
              name='metal'
              gridData={{ count: 1, list: formik?.values?.metalGridData }}
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
          <Grid item xs={0.5}></Grid>
          <Grid item xs={2}>
            <Grid container spacing={2}>
              <Grid item xs={12} height={20}></Grid>
              <Grid item xs={12}>
                <CustomNumberField
                  name='header.weight'
                  maxAccess={maxAccess}
                  label={labels.totalWeight}
                  value={weight}
                  readOnly
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={8} height={'13vh'} sx={{ display: 'flex', flex: 1 }}>
            <Table
              name='item'
              columns={[
                { field: 'seqNo', headerName: labels.seqNo, type: 'number', flex: 0.75 },
                { field: 'sku', headerName: labels.sku, flex: 1 },
                { field: 'itemName', headerName: labels.itemDesc, flex: 2 },
                { field: 'pcs', headerName: labels.pcs, type: 'number', flex: 1 },
                { field: 'weight', headerName: labels.weight, type: 'number', flex: 1 }
              ]}
              gridData={{ count: 1, list: formik?.values?.itemGridData }}
              rowId={['sku']}
              maxAccess={access}
              pagination={false}
            />
          </Grid>
        </Grid>
      </VertLayout>
    </FormShell>
  )
}
