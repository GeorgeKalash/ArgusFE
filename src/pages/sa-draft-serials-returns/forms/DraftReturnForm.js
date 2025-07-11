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
import CustomButton from 'src/components/Inputs/CustomButton'
import AccountSummary from 'src/components/Shared/AccountSummary'

export default function DraftReturnForm({ labels, access, recordId, invalidate }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { stack: stackError } = useError()
  const { platformLabels, defaultsData, userDefaultsData, systemChecks } = useContext(ControlContext)
  const [reCal, setReCal] = useState(false)

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.DraftInvoiceReturn,
    access,
    enabled: !recordId
  })

  useEffect(() => {
    if (documentType?.dtId) {
      onChangeDtId(documentType.dtId)
    }
  }, [documentType?.dtId])

  const defCurrencyId = parseInt(defaultsData?.list?.find(obj => obj.key === 'currencyId')?.value)
  const defplId = parseInt(defaultsData?.list?.find(obj => obj.key === 'plId')?.value)
  const defspId = parseInt(userDefaultsData?.list?.find(obj => obj.key === 'spId')?.value)
  const defSiteId = parseInt(userDefaultsData?.list?.find(obj => obj.key === 'siteId')?.value)

  const { formik } = useForm({
    maxAccess,
    documentType: { key: 'dtId', value: documentType?.dtId },
    initialValues: {
      recordId,
      dtId: null,
      reference: '',
      date: new Date(),
      plantId: null,
      clientId: null,
      currencyId: defCurrencyId || null,
      spId: defspId || null,
      siteId: defSiteId || null,
      description: '',
      status: 1,
      wip: 1,
      isVattable: false,
      taxId: null,
      subTotal: 0,
      amount: 0,
      vatAmount: 0,
      plId: defplId,
      ptId: null,
      weight: 0,
      disSkuLookup: false,
      invoiceId: null,
      invoiceRef: '',
      returnReasonId: null,
      search: '',
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
          priceType: 0,
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
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      date: yup.string().required(),
      currencyId: yup.string().required(),
      clientId: yup.string().required(),
      spId: yup.string().required(),
      siteId: yup.string().required(),
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
      const { taxDetailsStore, itemGridData, metalGridData, search, disSkuLookup, serials, date, ...rest } = obj

      const header = {
        ...rest,
        pcs: serials.length,
        date: formatDateToApi(date)
      }

      const updatedRows = formik?.values?.serials
        .filter(row => row.srlNo)
        .map(({ taxDetails, recordId, ...rest }, index) => ({
          ...rest,
          seqNo: index + 1,
          returnId: recordId || 0
        }))

      const DraftReturnPack = {
        header,
        items: updatedRows
      }

      postRequest({
        extension: SaleRepository.DraftReturn.set2,
        record: JSON.stringify(DraftReturnPack)
      }).then(async diRes => {
        toast.success(editMode ? platformLabels.Edited : platformLabels.Added)
        await refetchForm(diRes.recordId)
        invalidate()
      })
    }
  })

  async function refetchForm(recordId) {
    const diHeader = await getDraftReturn(recordId)
    const diItems = await getDraftReturnItems(recordId)
    await fillForm(diHeader, diItems)
  }

  async function getDraftReturn(diId) {
    const res = await getRequest({
      extension: SaleRepository.DraftReturn.get,
      parameters: `_recordId=${diId}`
    })

    const clientRes = await getRequest({
      extension: SaleRepository.Client.get,
      parameters: `_recordId=${res.record.clientId}`
    })

    res.record.date = formatDateFromApi(res?.record?.date)
    res.record.accountId = clientRes.record.accountId

    return res
  }

  async function getDraftReturnItems(diId) {
    return await getRequest({
      extension: SaleRepository.DraftReturnSerial.qry,
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
  const editMode = !!formik.values.recordId
  const isClosed = formik.values.wip === 2

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
      extension: SaleRepository.DraftReturnSerial.del,
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
      extension: SaleRepository.DraftReturnSerial.append,
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
    const { taxDetailsStore, itemGridData, metalGridData, search, disSkuLookup, serials, date, ...rest } =
      formik?.values

    const DraftReturnPack = {
      header: {
        ...rest,
        pcs: 0,
        date: formatDateToApi(date)
      },
      items: []
    }

    delete DraftReturnPack.header.serials

    const diRes = await postRequest({
      extension: SaleRepository.DraftReturn.set2,
      record: JSON.stringify(DraftReturnPack)
    })

    const diHeader = await getDraftReturn(diRes.recordId)
    formik.setFieldValue('recordId', diRes.recordId)
    formik.setFieldValue('reference', diHeader?.record?.reference)
    formik.setFieldValue('date', diHeader?.record?.date)

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
            extension: SaleRepository.LastSerialInvoice.get,
            parameters: `_currencyId=${formik?.values?.currencyId}&_clientId=${formik?.values?.clientId}&_srlNo=${newRow?.srlNo}`
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
              priceType: res?.record?.priceType || 0,
              metalId: res?.record?.metalId,
              metalRef: res?.record?.metalRef,
              designId: res?.record?.designId,
              designRef: res?.record?.designRef,
              categoryName: res?.record?.categoryName,
              invoiceReference: res?.record?.invoiceRef,
              volume: res?.record?.volume || 0,
              baseLaborPrice: res?.record?.laborPrice || 0,
              unitPrice: parseFloat(res?.record?.unitPrice).toFixed(2) || 0,
              vatPct: res?.record?.vatPct || 0,
              vatAmount: parseFloat(res?.record?.vatAmount).toFixed(2) || 0,
              invoiceTrxId: res?.record?.trxId || 0,

              ...(res?.record?.taxId && {
                taxId: formik.values?.taxId || res?.record?.taxId,
                taxDetails: await FilteredListByTaxId(
                  formik?.values?.taxDetailsStore,
                  formik.values?.taxId || res?.record?.taxId
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
            ? await autoSave(formik?.values, lineObj.changes)
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
      label: labels.sku,
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
      label: labels.metalRef,
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
              imgSrc: '/images/buttonsIcons/tax-icon.png',
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
    const { serials, ...restValues } = formik.values

    await postRequest({
      extension: SaleRepository.DraftReturn.close,
      record: JSON.stringify({
        ...restValues,
        date: formatDateToApi(formik.values.date)
      })
    }).then(() => {
      toast.success(platformLabels.Closed)
      invalidate()
      refetchForm(formik?.values?.recordId)
    })
  }

  async function onReopen() {
    const { serials, ...restValues } = formik.values

    await postRequest({
      extension: SaleRepository.DraftReturn.reopen,
      record: JSON.stringify({
        ...restValues,
        date: formatDateToApi(formik.values.date)
      })
    }).then(() => {
      toast.success(platformLabels.Reopened)
      invalidate()
      refetchForm(formik?.values?.recordId)
    })
  }

  async function onWorkFlowClick() {
    stack({
      Component: WorkFlow,
      props: {
        functionId: SystemFunction.DraftInvoiceReturn,
        recordId: formik.values.recordId
      }
    })
  }

  async function onImportClick() {
    stack({
      Component: ImportSerials,
      props: {
        endPoint: SaleRepository.DraftReturnSerial.batch,
        header: {
          draftId: formik?.values?.recordId
        },
        onCloseimport: fillGrids,
        maxAccess: maxAccess
      }
    })
  }

  const actions = [
    {
      key: 'Close',
      condition: !isClosed,
      onClick: onClose,
      disabled: isClosed || !editMode || !formik?.values?.serials?.[0]?.srlNo
    },
    {
      key: 'Reopen',
      condition: isClosed,
      onClick: onReopen,
      disabled: !isClosed || formik.values.status == 3 || !editMode
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
      onClick: onImportClick,
      disabled: !editMode || formik.values.status != 1 || isClosed
    },
    {
      key: 'AccountSummary',
      condition: true,
      onClick: () => {
        stack({
          Component: AccountSummary,
          props: {
            accountId: parseInt(formik.values.accountId),
            moduleId: 1
          }
        })
      },
      disabled: !formik.values.clientId
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
      plId: defplId || formik?.values?.plId,
      amount: diHeader?.record?.amount,
      vatAmount: diHeader?.record?.vatAmount,
      subTotal: diHeader?.record?.subTotal,
      weight: diHeader?.record?.weight,
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
      ...diHeader.record,
      plId: defplId || formik?.values?.plId,
      amount: diHeader?.record?.amount,
      vatAmount: diHeader?.record?.vatAmount,
      subTotal: diHeader?.record?.subTotal,
      weight: diHeader?.record?.weight,
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

  const filteredData = formik.values.search
    ? formik.values.serials.filter(
        item =>
          item.srlNo?.toString()?.includes(formik.values.search.toLowerCase()) ||
          item.sku?.toString()?.toLowerCase()?.includes(formik.values.search.toLowerCase()) ||
          item.itemName?.toString()?.toLowerCase()?.includes(formik.values.search.toLowerCase()) ||
          item.weight?.toString()?.includes(formik.values.search)
      )
    : formik.values.serials

  const handleSearchChange = event => {
    const { value } = event.target
    formik.setFieldValue('search', value)
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
        extension: SaleRepository.DocumentTypeDefault.get,
        parameters: `_dtId=${recordId}`
      })

      formik.setFieldValue('plantId', dtd?.record?.plantId || null)
      formik.setFieldValue('spId', dtd?.record?.spId || defspId || null)
      formik.setFieldValue('siteId', dtd?.record?.siteId || defSiteId || null)
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

      const itemMap = serials.reduce((acc, { sku, itemId, itemName, weight, categoryName }) => {
        if (itemId) {
          if (!acc[itemId]) {
            seqNo++
            acc[itemId] = { sku, pcs: 0, weight: 0, itemName, seqNo, categoryName }
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
        subTotal: reCal ? parseFloat((acc?.subTotal + subTot).toFixed(2)) : formik.values?.subTotal || 0,
        vatAmount: reCal ? parseFloat((acc?.vatAmount + vatAmountTot).toFixed(2)) : formik.values?.vatAmount || 0,
        weight: reCal ? acc?.weight + weight : formik.values?.weight || 0,
        amount: reCal
          ? parseFloat((acc?.subTotal + subTot + acc?.vatAmount + vatAmountTot).toFixed(2))
          : formik.values?.amount || 0
      }
    },
    { subTotal: 0, vatAmount: 0, weight: 0, amount: 0 }
  )

  useEffect(() => {
    formik.setFieldValue('subTotal', subTotal)
    formik.setFieldValue('vatAmount', vatAmount)
    formik.setFieldValue('weight', weight)
    formik.setFieldValue('amount', amount)
  }, [weight, subTotal, vatAmount, amount])

  useEffect(() => {
    ;(async function () {
      if (!defplId)
        stackError({
          message: labels.noSelectedplId
        })

      fillTaxStore()

      if (formik?.values?.recordId) {
        await refetchForm(formik?.values?.recordId)
      }
    })()
  }, [])

  async function importSerials() {
    const isValid = await onValidationRequired()
    if (!isValid) return

    let updatedSerials = [...formik.values.serials]

    const res = await getRequest({
      extension: SaleRepository.LastSerialInvoice.import,
      parameters: `_invoiceId=${formik?.values?.invoiceId}`
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
          invoiceReference: formik?.values?.invoiceRef,
          invoiceTrxId: x.trxId,
          invoiceSeqNo: x.seqNo,
          invoiceComponentSeqNo: x.componentSeqNo,
          weight: x.weight,
          metalId: x.metalId,
          baseLaborPrice: x.laborPrice,
          unitPrice: x.unitPrice,
          vatAmount: x.vatAmount,
          metalRef: x.metalRef,
          categoryName: x.categoryName,
          seqNo: lId + 1,
          id: lId + 1,
          ...(res?.record?.taxId && {
            taxId: formik.values?.taxId || res?.record?.taxId
          })
        }

        const { unitPrice, baseLaborPrice } = getItemPriceRow(draft, DIRTYFIELD_UNIT_PRICE)

        draft.unitPrice = unitPrice
        draft.baseLaborPrice = baseLaborPrice

        if (draft.taxId != null) {
          draft.extendedPrice = unitPrice
        }

        const header = formik?.values
        const { taxDetailsStore, metalGridData, itemGridData, ...restHeader } = header

        const successSave =
          formik?.values?.recordId || updatedSerials.length > 0
            ? await autoSaveImport(restHeader, draft, updatedSerials?.[0]?.returnId)
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
      resourceId={ResourceIds.DraftSerialReturns}
      functionId={SystemFunction.DraftInvoiceReturn}
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
            <Grid item xs={4}>
              <ResourceComboBox
                endpointId={SystemRepository.DocumentType.qry}
                parameters={`_startAt=0&_pageSize=1000&_dgId=${SystemFunction.DraftInvoiceReturn}`}
                name='dtId'
                label={labels.documentType}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                readOnly={editMode}
                required
                valueField='recordId'
                displayField={['reference', 'name']}
                values={formik.values}
                maxAccess={maxAccess}
                onChange={async (event, newValue) => {
                  formik.setFieldValue('dtId', newValue?.recordId)
                  await onChangeDtId(newValue?.recordId)
                  changeDT(newValue)
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
                required
                valueField='recordId'
                displayField={['reference', 'name']}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  if (!newValue?.isInactive) {
                    formik.setFieldValue('siteId', newValue?.recordId || null)
                  } else {
                    formik.setFieldValue('siteId', null)
                    stackError({
                      message: labels.inactiveSite
                    })
                  }
                }}
                error={formik.touched.siteId && Boolean(formik.errors.siteId)}
              />
            </Grid>
            <Grid item xs={2}>
              <ResourceComboBox
                endpointId={SystemRepository.Currency.qry}
                name='currencyId'
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
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('invoiceId', null)
                  formik.setFieldValue('invoiceRef', '')
                  formik.setFieldValue('currencyId', newValue?.recordId || null)
                }}
                error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
              />
            </Grid>
            <Grid item xs={2}>
              <CustomTextField
                name='search'
                value={formik.values.search}
                label={platformLabels.Search}
                onClear={() => {
                  formik.setFieldValue('search', '')
                }}
                onChange={handleSearchChange}
                onSearch={e => formik.setFieldValue('search', e)}
                search={true}
              />
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={2}>
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
                    readOnly
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik.values}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('plantId', newValue?.recordId)
                    }}
                    error={formik.touched.plantId && Boolean(formik.errors.plantId)}
                  />
                </Grid>
                <Grid item xs={4}>
                  <ResourceComboBox
                    endpointId={formik?.values?.clientId && SaleRepository.Contact.contact}
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
                    error={formik.touched.contactId && Boolean(formik.errors.contactId)}
                  />
                </Grid>
                <Grid item xs={4}>
                  <CustomDatePicker
                    name='date'
                    required
                    label={labels.postingDate}
                    value={formik?.values?.date}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('date', newValue)
                      formik.setFieldValue('invoiceId', null)
                      formik.setFieldValue('invoiceRef', '')
                    }}
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
                    required
                    label={labels.salesPerson}
                    columnsInDropDown={[
                      { key: 'spRef', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    readOnly={isClosed}
                    valueField='recordId'
                    displayField='name'
                    values={formik.values}
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
              </Grid>
            </Grid>
            <Grid item xs={8}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
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
                    firstFieldWidth={3}
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
                      formik.setFieldValue('clientName', newValue?.name || null)
                      formik.setFieldValue('clientRef', newValue?.reference || null)
                      formik.setFieldValue('accountId', newValue?.accountId || null)
                      formik.setFieldValue('isVattable', newValue?.isSubjectToVAT || false)
                      formik.setFieldValue('taxId', newValue?.taxId || null)
                      formik.setFieldValue('invoiceId', null)
                      formik.setFieldValue('invoiceRef', '')
                      formik.setFieldValue('clientId', newValue?.recordId || null)
                    }}
                    errorCheck={'clientId'}
                  />
                </Grid>
                <Grid item xs={5.2}>
                  <ResourceComboBox
                    key={`${formik.values.clientId}-${formik.values.date?.toISOString()}-${formik.values.currencyId}`}
                    endpointId={
                      formik?.values?.clientId && formik?.values?.date && SaleRepository.ReturnOnInvoice.balance
                    }
                    parameters={`_clientId=${
                      formik?.values?.clientId
                    }&_returnDate=${formik?.values?.date?.toISOString()}`}
                    filter={item => item.currencyId == formik?.values?.currencyId}
                    name='invoiceId'
                    label={labels.salesInv}
                    valueField='recordId'
                    displayField={'reference'}
                    displayFieldWidth={1}
                    readOnly={isClosed}
                    values={formik.values}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('invoiceId', newValue?.recordId || null)
                      formik.setFieldValue('invoiceRef', newValue?.reference || '')
                    }}
                    error={formik.touched.invoiceId && Boolean(formik.errors.invoiceId)}
                  />
                </Grid>

                <Grid item xs={1}>
                  <CustomButton
                    onClick={importSerials}
                    label={platformLabels.import}
                    image={'import.png'}
                    color='#000'
                    disabled={!formik?.values?.invoiceId || isClosed}
                  />
                </Grid>
                <Grid item xs={5.8}>
                  <ResourceComboBox
                    endpointId={SaleRepository.ReturnReasons.qry}
                    name='returnReasonId'
                    label={labels.reason}
                    valueField='recordId'
                    displayField='name'
                    readOnly={isClosed}
                    values={formik.values}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('returnReasonId', newValue?.recordId || null)
                    }}
                    error={formik.touched.returnReasonId && Boolean(formik.errors.returnReasonId)}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={4}>
              <CustomTextArea
                name='description'
                label={labels.description}
                value={formik.values.description}
                rows={2.4}
                editMode={editMode}
                readOnly={isClosed}
                maxAccess={maxAccess}
                onChange={e => formik.setFieldValue('description', e.target.value)}
                onClear={() => formik.setFieldValue('description', '')}
                error={formik.touched.description && Boolean(formik.errors.description)}
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
            disabled={isClosed || Object.entries(formik?.errors || {}).filter(([key]) => key !== 'serials').length > 0}
            allowDelete={!isClosed}
            allowAddNewLine={
              !formik?.values?.search &&
              (formik.values?.serials?.length === 0 ||
                !!formik.values?.serials?.[formik.values?.serials?.length - 1]?.srlNo)
            }
            autoDelete={autoDelete}
            onValidationRequired={onValidationRequired}
          />
        </Grow>
        <Grid container spacing={3}>
          <Grid item xs={6.5} sx={{ display: 'flex', flex: 1 }}>
            <Table
              name='item'
              columns={[
                { field: 'seqNo', headerName: labels.seqNo, type: 'number', flex: 0.75 },
                { field: 'sku', headerName: labels.sku, flex: 1 },
                { field: 'itemName', headerName: labels.itemDesc, flex: 2 },
                { field: 'categoryName', headerName: labels.category, flex: 2 },
                { field: 'pcs', headerName: labels.pcs, type: 'number', flex: 1 },
                { field: 'weight', headerName: labels.weight, type: 'number', flex: 1 }
              ]}
              gridData={{ count: 1, list: formik?.values?.itemGridData }}
              rowId={['sku']}
              maxAccess={access}
              pagination={false}
            />
          </Grid>
          <Grid item xs={3} sx={{ display: 'flex', flex: 1 }}>
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
              <Grid item xs={12}></Grid>
              <Grid item xs={12}>
                <CustomNumberField
                  name='weight'
                  maxAccess={maxAccess}
                  label={labels.totalWeight}
                  value={weight}
                  readOnly
                />
              </Grid>
              <Grid item xs={12}></Grid>
              <Grid item xs={12}>
                <CustomNumberField
                  name='subTotal'
                  maxAccess={maxAccess}
                  label={labels.subtotal}
                  value={subTotal}
                  readOnly
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
                <CustomNumberField name='total' maxAccess={amount} label={labels.total} value={amount} readOnly />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </VertLayout>
    </FormShell>
  )
}
