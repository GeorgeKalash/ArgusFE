import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import { formatDateFromApi, formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'
import { Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
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
import { calcVatAmountPerTaxDetail, getVatCalc } from '@argus/shared-utils/src/utils/VatCalculator'
import { useDocumentType } from '@argus/shared-hooks/src/hooks/documentReferenceBehaviors'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import TaxDetails from '@argus/shared-ui/src/components/Shared/TaxDetails'
import ImportSerials from '@argus/shared-ui/src/components/Shared/ImportSerials'
import { getIPR, DIRTYFIELD_UNIT_PRICE } from '@argus/shared-utils/src/utils/ItemPriceCalculator'
import { SystemChecks } from '@argus/shared-domain/src/resources/SystemChecks'
import { useError } from '@argus/shared-providers/src/providers/error'
import CustomButton from '@argus/shared-ui/src/components/Inputs/CustomButton'
import AccountSummary from '@argus/shared-ui/src/components/Shared/AccountSummary'
import { DefaultsContext } from '@argus/shared-providers/src/providers/DefaultsContext'

export default function DraftReturnForm({ labels, access, recordId, invalidate }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { stack: stackError } = useError()
  const { platformLabels} = useContext(ControlContext)
  const { systemDefaults, userDefaults, systemChecks } = useContext(DefaultsContext)
  const [reCal, setReCal] = useState(false)

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.DraftInvoiceReturn,
    access,
    enabled: !recordId,
    objectName: 'header'
  })

  useEffect(() => {
    if (documentType?.dtId) {
      onChangeDtId(documentType.dtId)
    }
  }, [documentType?.dtId])

  const defCurrencyId = parseInt(systemDefaults?.list?.find(obj => obj.key === 'currencyId')?.value)
  const defplId = parseInt(systemDefaults?.list?.find(obj => obj.key === 'plId')?.value)
  const defspId = parseInt(userDefaults?.list?.find(obj => obj.key === 'spId')?.value)
  const defSiteId = parseInt(userDefaults?.list?.find(obj => obj.key === 'siteId')?.value)

  const { formik } = useForm({
    maxAccess,
    documentType: { key: 'header.dtId', value: documentType?.dtId },
    initialValues: {
      recordId: recordId || null,
      header: {
        dtId: null,
        reference: '',
        date: new Date(),
        plantId: null,
        clientId: null,
        clientRef: '',
        clientName: '',
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
        plId: defplId || null,
        ptId: null,
        weight: 0,
        accountId: null,
        disSkuLookup: false,
        invoiceId: null,
        invoiceRef: '',
        returnReasonId: null,
      },
      items: [
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
    validateOnChange: true,
    validationSchema: yup.object({
      header: yup.object({
        date: yup.date().required(),
        currencyId: yup.number().required(),
        clientId: yup.number().required(),
        spId: yup.number().required(),
        siteId: yup.number().required()
      }),
      items: yup.array().of(
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
      const { header, items } = obj

      const updatedRows = items
        .filter(row => row.srlNo)
        .map(({ taxDetails, ...rest }, index) => ({
          ...rest,
          seqNo: index + 1,
          returnId: header.recordId || 0
        }))

      const DraftReturnPack = {
        header: {
          ...header,
          pcs: updatedRows.length,
          date: formatDateToApi(header.date)
        },
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

  function buildCalculatedTaxDetails(row, taxDetailsList = []) {
    return (taxDetailsList || []).map(td => {
      const singleTaxDetail = {
        ...td,
        taxScheduleAmount: td.amount || 0
      }

      const calculatedAmount = calcVatAmountPerTaxDetail(
        {
          priceType: row?.priceType,
          basePrice: 0,
          unitPrice: parseFloat(row?.baseLaborPrice || 0),
          qty: parseFloat(row?.weight || 0),
          weight: parseFloat(row?.weight || 0),
          extendedPrice: parseFloat(row?.unitPrice || 0),
          baseLaborPrice: 0,
          vatAmount: parseFloat(row?.vatAmount || 0),
          tdPct: 0,
          taxDetails: singleTaxDetail
        },
        singleTaxDetail
      )

      return {
        ...td,
        invoiceId: formik.values?.header?.recordId || 0,
        taxSeqNo: td.seqNo,
        taxScheduleAmount: td.amount || 0,
        amount: parseFloat(calculatedAmount || 0)
      }
    })
  }

  async function refetchForm(recordId) {
    const pack = await getDraftReturn(recordId)
    await fillForm(pack)
  }

  async function getDraftReturn(diId) {
    const res = await getRequest({
      extension: SaleRepository.DraftReturn.get2,
      parameters: `_recordId=${diId}`
    })

    const clientRes = await getRequest({
      extension: SaleRepository.Client.get,
      parameters: `_recordId=${res?.record?.header?.clientId}`
    })

    res.record.header.accountId = clientRes.record.accountId

    return res?.record || {}
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
      priceType: itemPriceRow?.priceType,
      basePrice: 0,
      qty: parseFloat(newRow?.weight),
      weight: parseFloat(newRow?.weight),
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
  const editMode = !!formik.values.header?.recordId
  const isClosed = formik.values.header?.wip === 2


  const autoDelete = async row => {
    if (!row?.returnId || !row?.itemId) return true

    const LastSerPack = {
      returnId: formik?.values?.header?.recordId,
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
    }

    return true
  }

  async function autoSave(header, lastLine) {
    if (lastLine?.srlNo) {
      const resp = await autoSaveProcess(header, lastLine)
      if (resp) {
        toast.success(platformLabels.Saved)
        return true
      }

      return false
    }
  }

  async function saveHeader(lastLine, type) {
    const { header } = formik.values

    const DraftReturnPack = {
      header: {
        ...header,
        pcs: 0,
        date: formatDateToApi(header.date)
      },
      items: []
    }

    const diRes = await postRequest({
      extension: SaleRepository.DraftReturn.set2,
      record: JSON.stringify(DraftReturnPack)
    })

    const pack = await getDraftReturn(diRes.recordId)
    formik.setFieldValue('recordId', pack.header.recordId)
    formik.setFieldValue('header.recordId', pack.header.recordId)
    formik.setFieldValue('header.reference', pack.header?.reference)
    formik.setFieldValue('header.date', formatDateFromApi(pack.header?.date))

    const success =
      type === 'import' ? await autoSaveImport(pack.header, lastLine) : await autoSave(pack.header, lastLine)

    if (success) {
      toast.success(platformLabels.Saved)

      const pack = await getDraftReturn(diRes.recordId)
      await fillForm(pack)
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
            parameters: `_currencyId=${formik?.values?.header?.currencyId}&_clientId=${formik?.values?.header?.clientId}&_srlNo=${newRow?.srlNo}`
          })

          const effectiveTaxId = !formik.values.header.isVattable
            ? null
            : formik.values.header.taxId
            ? res?.record?.taxId
              ? formik.values.header.taxId
              : null
            : res?.record?.taxId ?? null

          let lineObj = {
            fieldName: 'srlNo',
            changes: {
              id: newRow.id,
              seqNo: newRow.id,
              invoiceSeqNo: newRow.id,
              invoiceComponentSeqNo: res?.record?.invoiceComponentSeqNo || 0,
              returnId: formik?.values?.header?.recordId,
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
              categoryName: res?.record?.categoryName || '',
              invoiceReference: res?.record?.invoiceRef,
              volume: res?.record?.volume || 0,
              baseLaborPrice: res?.record?.laborPrice || 0,
              unitPrice: parseFloat(res?.record?.unitPrice).toFixed(2) || 0,
              vatPct: res?.record?.vatPct || 0,
              vatAmount: parseFloat(res?.record?.vatAmount).toFixed(2) || 0,
              invoiceTrxId: res?.record?.trxId || null,
              invoiceDate: formatDateFromApi(res?.record?.invoiceDate) || null,
              taxId: effectiveTaxId
            }
          }

          const { unitPrice, baseLaborPrice } = getItemPriceRow(lineObj.changes, DIRTYFIELD_UNIT_PRICE)

          lineObj.changes.unitPrice = unitPrice
          lineObj.changes.baseLaborPrice = baseLaborPrice
          lineObj.changes.extendedPrice = unitPrice

          if (lineObj.changes.taxId != null) {
            const rawTaxDetails = await getTaxDetails(lineObj.changes.taxId)
            lineObj.changes.taxDetails = buildCalculatedTaxDetails(
              lineObj.changes,
              rawTaxDetails
            )
          } else {
            lineObj.changes.taxDetails = []
          }
          const successSave = formik?.values?.header?.recordId
            ? await autoSave(formik?.values?.header, lineObj.changes)
            : await saveHeader(lineObj.changes)

          if (!successSave) {
            update({
              ...formik?.initialValues?.items?.[0],
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
      label: labels.categoryName,
      name: 'categoryName',
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
      component: 'date',
      label: labels.invoiceDate,
      name: 'invoiceDate',
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
        row.qty = row.weight
        row.basePrice = 0
        stack({
          Component: TaxDetails,
          props: {
            taxId: row?.taxId,
            obj: row,
            taxes: row?.taxDetails || []
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
    await postRequest({
      extension: SaleRepository.DraftReturn.close,
      record: JSON.stringify({
        ...formik.values.header,
        date: formatDateToApi(formik.values.header.date)
      })
    }).then(() => {
      toast.success(platformLabels.Closed)
      invalidate()
      refetchForm(formik?.values?.header?.recordId)
    })
  }

  async function onReopen() {
    await postRequest({
      extension: SaleRepository.DraftReturn.reopen,
      record: JSON.stringify({
        ...formik.values.header,
        date: formatDateToApi(formik.values.header.date)
      })
    }).then(() => {
      toast.success(platformLabels.Reopened)
      invalidate()
      refetchForm(formik?.values?.header?.recordId)
    })
  }

  async function onWorkFlowClick() {
    stack({
      Component: WorkFlow,
      props: {
        functionId: SystemFunction.DraftInvoiceReturn,
        recordId: formik.values.header?.recordId
      }
    })
  }

  async function onImportClick() {
    stack({
      Component: ImportSerials,
      props: {
        endPoint: SaleRepository.DraftReturnSerial.batch,
        header: {
          draftId: formik?.values?.header?.recordId
        },
        onCloseimport: async () => {
          await refetchForm(formik.values.header?.recordId)
        },
        maxAccess: maxAccess
      }
    })
  }

  const actions = [
    {
      key: 'Close',
      condition: !isClosed,
      onClick: onClose,
      disabled: isClosed || !editMode || !formik?.values?.items?.[0]?.srlNo
    },
    {
      key: 'Reopen',
      condition: isClosed,
      onClick: onReopen,
      disabled: !isClosed || formik.values.header?.status == 3 || !editMode
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
      disabled: !editMode || formik.values.header?.status != 1 || isClosed
    },
    {
      key: 'AccountSummary',
      condition: true,
      onClick: () => {
        stack({
          Component: AccountSummary,
          props: {
            accountId: parseInt(formik.values.header?.accountId),
            date: formik.values.header?.date
          }
        })
      },
      disabled: !formik.values.header?.clientId || !formik.values.header?.date
    }
  ]

  async function fillForm(pack) {
    if (!pack) return

    const modifiedList = await Promise.all(
      (pack.items || []).map(async (item, index) => {
         let calculatedTaxDetails = []

        if (item?.taxId) {
          const rawTaxDetails = pack.taxDetails.filter(tax => tax.taxId === item?.taxId)
          calculatedTaxDetails = buildCalculatedTaxDetails(item, rawTaxDetails)
        }
        return {
          ...item,
          id: item.seqNo,
          baseLaborPrice: parseFloat(item.baseLaborPrice).toFixed(2),
          unitPrice: parseFloat(item.unitPrice).toFixed(2),
          vatAmount: parseFloat(item.vatAmount).toFixed(2),
          amount: parseFloat(item.amount).toFixed(2),
          invoiceDate: formatDateFromApi(item.invoiceDate),
          taxDetails: calculatedTaxDetails
        }
      }) || []
    )

    await formik.setValues({
      recordId: pack.header?.recordId || null,
      header: {
        ...pack.header,
        plId: defplId || pack.header?.plId || null,
        date: formatDateFromApi(pack.header?.date)
      },
      items: modifiedList.length ? modifiedList : formik?.initialValues?.items,
      taxDetails: pack.taxDetails
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

  const handleGridChange = (value, action, row) => {
    if (action === 'delete') {
      let updatedItems = formik.values.items
      updatedItems = updatedItems.filter(item => item.id !== row.id)
      formik.setFieldValue('items', updatedItems)
      setReCal(true)
    } else {
      formik.setFieldValue('items', value)
    }
  }

  async function onChangeDtId(recordId) {
    if (recordId) {
      const dtd = await getRequest({
        extension: SaleRepository.DocumentTypeDefault.get,
        parameters: `_dtId=${recordId}`
      })

      formik.setFieldValue('header.plantId', dtd?.record?.plantId || null)
      formik.setFieldValue('header.spId', dtd?.record?.spId || defspId || null)
      formik.setFieldValue('header.siteId', dtd?.record?.siteId || defSiteId || null)
    }
  }

  useEffect(() => {
    if (formik?.values?.items?.length) {
      const items = formik?.values?.items

      const metalMap = items.reduce((acc, { metalId, weight, metalRef }) => {
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

      let seqNo = 0

      const itemMap = items.reduce((acc, { sku, itemId, itemName, weight, categoryName }) => {
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
  }, [formik?.values?.items])

  const { subTotal, vatAmount, weight, amount } = formik?.values?.items?.reduce(
    (acc, row) => {
      const subTot = parseFloat(row?.unitPrice) || 0
      const vatAmountTot = parseFloat(row?.vatAmount) || 0
      const weight = parseFloat(row?.weight) || 0

      return {
        subTotal: reCal ? parseFloat((acc?.subTotal + subTot).toFixed(2)) : formik.values?.header?.subTotal || 0,
        vatAmount: reCal ? parseFloat((acc?.vatAmount + vatAmountTot).toFixed(2)) : formik.values?.header?.vatAmount || 0,
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
      if (!defplId)
        stackError({
          message: labels.noSelectedplId
        })

      if (formik?.values?.recordId) {
        await refetchForm(formik?.values?.recordId)
      }
    })()
  }, [])

  async function importSerials() {
    const isValid = await onValidationRequired()
    if (!isValid) return

    let updatedItems = [...formik.values.items]

    const res = await getRequest({
      extension: SaleRepository.LastSerialInvoice.import,
      parameters: `_invoiceId=${formik?.values?.header?.invoiceId}`
    })

    let lId = updatedItems.length ? updatedItems[updatedItems.length - 1].id : 0

    if (res.count > 0) {
      updatedItems = updatedItems.filter(s => s.srlNo)

      for (const x of res.list) {
        const effectiveTaxId = !formik?.values?.header.isVattable
          ? null
          : formik?.values?.header.taxId
          ? x.taxId
            ? formik?.values?.header.taxId
            : null
          : x.taxId ?? null

        const draft = {
          srlNo: x.srlNo,
          itemId: x.itemId,
          sku: x.sku,
          itemName: x.itemName,
          invoiceReference: formik?.values?.header?.invoiceRef,
          invoiceTrxId: x.trxId,
          invoiceSeqNo: x.seqNo,
          invoiceComponentSeqNo: x.componentSeqNo,
          invoiceDate: formatDateFromApi(x.invoiceDate),
          weight: x.weight,
          metalId: x.metalId,
          baseLaborPrice: x.laborPrice,
          unitPrice: x.unitPrice,
          vatAmount: x.vatAmount,
          metalRef: x.metalRef,
          categoryName: x.categoryName,
          seqNo: lId + 1,
          id: lId + 1,
          ...(x?.taxId && {
            taxId: effectiveTaxId
          })
        }

        const { unitPrice, baseLaborPrice } = getItemPriceRow(draft, DIRTYFIELD_UNIT_PRICE)

        draft.unitPrice = unitPrice
        draft.baseLaborPrice = baseLaborPrice

        
        if (effectiveTaxId) {
          const taxDetailsResponse = await getTaxDetails(effectiveTaxId)
          draft.taxId = effectiveTaxId
          draft.taxDetails = buildCalculatedTaxDetails(draft, taxDetailsResponse)
        }

        if (draft.taxId != null) {
          draft.extendedPrice = unitPrice
        }

        const header = formik?.values?.header

        const successSave =
          formik?.values?.header?.recordId || updatedItems.length > 0
            ? await autoSaveImport(header, draft, updatedItems?.[0]?.returnId)
            : await saveHeader(draft, 'import')

        if (successSave) {
          lId++
          formik.setFieldValue('items', [...updatedItems, draft])
          updatedItems.push(draft)
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
                error={formik?.touched?.header?.dtId && Boolean(formik?.errors?.header?.dtId)}
              />
            </Grid>
            <Grid item xs={4}>
              <ResourceComboBox
                endpointId={InventoryRepository.Site.qry}
                name='header.siteId'
                readOnly={isClosed}
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
                error={formik?.touched?.header?.siteId && Boolean(formik?.errors?.header?.siteId)}
              />
            </Grid>
            <Grid item xs={4}>
              <ResourceComboBox
                endpointId={SystemRepository.Currency.qry}
                filter={item => item.currencyType === 1}
                name='header.currencyId'
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
                error={formik?.touched?.header?.currencyId && Boolean(formik?.errors?.header?.currencyId)}
              />
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <CustomTextField
                    name='header.reference'
                    label={labels.reference}
                    value={formik?.values?.header?.reference}
                    maxAccess={!editMode && maxAccess}
                    readOnly={editMode}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('header.reference', '')}
                    error={formik?.touched?.header?.reference && Boolean(formik?.errors?.header?.reference)}
                  />
                </Grid>
                <Grid item xs={4}>
                  <ResourceComboBox
                    endpointId={SystemRepository.Plant.qry}
                    name='header.plantId'
                    label={labels.plant}
                    readOnly
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik.values.header}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    maxAccess={maxAccess}
                    onChange={(_, newValue) => {
                      formik.setFieldValue('header.plantId', newValue?.recordId || null)
                    }}
                    error={formik?.touched?.header?.plantId && Boolean(formik?.errors?.header?.plantId)}
                  />
                </Grid>
                <Grid item xs={4}>
                  <ResourceComboBox
                    endpointId={formik?.values?.header?.clientId && SaleRepository.Contact.contact}
                    parameters={`_clientId=${formik.values.header?.clientId}`}
                    name='header.contactId'
                    label={labels.contact}
                    readOnly={isClosed}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik.values.header}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    maxAccess={maxAccess}
                    onChange={(_, newValue) => {
                      formik.setFieldValue('header.contactId', newValue?.recordId || null)
                    }}
                    error={formik?.touched?.header?.contactId && Boolean(formik?.errors?.header?.contactId)}
                  />
                </Grid>
                <Grid item xs={4}>
                  <CustomDatePicker
                    name='header.date'
                    required
                    label={labels.postingDate}
                    value={formik?.values?.header?.date}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('header.date', newValue || null)
                      formik.setFieldValue('header.invoiceId', null)
                      formik.setFieldValue('header.invoiceRef', '')
                    }}
                    editMode={editMode}
                    readOnly={isClosed}
                    maxAccess={maxAccess}
                    onClear={() => formik.setFieldValue('header.date', null)}
                    error={formik?.touched?.header?.date && Boolean(formik?.errors?.header?.date)}
                  />
                </Grid>
                <Grid item xs={4}>
                  <ResourceComboBox
                    endpointId={SaleRepository.SalesPerson.qry}
                    name='header.spId'
                    required
                    label={labels.salesPerson}
                    columnsInDropDown={[
                      { key: 'spRef', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    readOnly={isClosed}
                    valueField='recordId'
                    displayField='name'
                    values={formik.values.header}
                    onChange={(_, newValue) => {
                      formik.setFieldValue('header.spId', newValue?.recordId || null)
                    }}
                    error={formik?.touched?.header?.spId && Boolean(formik?.errors?.header?.spId)}
                  />
                </Grid>
                <Grid item xs={4}>
                  <ResourceComboBox
                    endpointId={FinancialRepository.TaxSchedules.qry}
                    name='header.taxId'
                    label={labels.tax}
                    valueField='recordId'
                    displayField={['reference', 'name']}
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
                    error={formik?.touched?.header?.taxId && Boolean(formik?.errors?.header?.taxId)}
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
                    name='header.clientId'
                    label={labels.client}
                    formObject={formik.values.header}
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
                    onChange={async (_, newValue) => {
                      formik.setFieldValue('header.clientName', newValue?.name || '')
                      formik.setFieldValue('header.clientRef', newValue?.reference || '')
                      formik.setFieldValue('header.accountId', newValue?.accountId || null)
                      formik.setFieldValue('header.isVattable', newValue?.isSubjectToVAT || false)
                      formik.setFieldValue('header.taxId', newValue?.taxId || null)
                      formik.setFieldValue('header.invoiceId', null)
                      formik.setFieldValue('header.invoiceRef', '')
                      formik.setFieldValue('header.clientId', newValue?.recordId || null)
                    }}
                    errorCheck='header.clientId'
                  />
                </Grid>

                <Grid item xs={5.2}>
                  <ResourceComboBox
                    key={`${formik.values.header?.clientId}-${formik.values.header?.date ? formik.values.header?.date?.toISOString() : null}-${formik.values.header?.currencyId}`}
                    endpointId={
                      formik?.values?.header?.clientId &&
                      formik?.values?.header?.date &&
                      SaleRepository.ReturnOnInvoice.balance
                    }
                    parameters={`_clientId=${formik?.values?.header?.clientId}&_returnDate=${
                      formik?.values?.header?.date ? formik?.values?.header?.date?.toISOString() : null
                    }`}
                    filter={item => item.currencyId == formik?.values?.header?.currencyId}
                    name='header.invoiceId'
                    label={labels.salesInv}
                    valueField='recordId'
                    displayField='reference'
                    displayFieldWidth={1}
                    readOnly={isClosed}
                    values={formik.values.header}
                    maxAccess={maxAccess}
                    onChange={(_, newValue) => {
                      formik.setFieldValue('header.invoiceId', newValue?.recordId || null)
                      formik.setFieldValue('header.invoiceRef', newValue?.reference || '')
                    }}
                    error={formik?.touched?.header?.invoiceId && Boolean(formik?.errors?.header?.invoiceId)}
                  />
                </Grid>

                <Grid item xs={1}>
                  <CustomButton
                    onClick={importSerials}
                    label={platformLabels.import}
                    image={'import.png'}
                    color='#000'
                    disabled={!formik?.values?.header?.invoiceId || isClosed}
                  />
                </Grid>
                <Grid item xs={5.8}>
                  <ResourceComboBox
                    endpointId={SaleRepository.ReturnReasons.qry}
                    name='header.returnReasonId'
                    label={labels.reason}
                    valueField='recordId'
                    displayField='name'
                    readOnly={isClosed}
                    values={formik.values.header}
                    maxAccess={maxAccess}
                    onChange={(_, newValue) => {
                      formik.setFieldValue('header.returnReasonId', newValue?.recordId || null)
                    }}
                    error={formik?.touched?.header?.returnReasonId && Boolean(formik?.errors?.header?.returnReasonId)}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={4}>
              <CustomTextArea
                name='header.description'
                label={labels.description}
                value={formik.values.header?.description}
                rows={2.4}
                editMode={editMode}
                readOnly={isClosed}
                maxAccess={maxAccess}
                onChange={e => formik.setFieldValue('header.description', e.target.value)}
                onClear={() => formik.setFieldValue('header.description', '')}
                error={formik?.touched?.header?.description && Boolean(formik?.errors?.header?.description)}
              />
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <DataGrid
            onChange={(value, action, row) => handleGridChange(value, action, row)}
            value={formik.values.items || []}
            error={formik.errors.items}
            initialValues={formik?.initialValues?.items?.[0]}
            columns={serialsColumns}
            showCounterColumn={true}
            name='items'
            enableFilters
            maxAccess={maxAccess}
            disabled={isClosed || Object.entries(formik?.errors || {}).filter(([key]) => key !== 'items').length > 0}
            allowDelete={!isClosed}
            allowAddNewLine={
              (formik.values?.items?.length === 0 ||
                !!formik.values?.items?.[formik.values?.items?.length - 1]?.srlNo)
            }
            autoDelete={autoDelete}
            onValidationRequired={onValidationRequired}
          />
        </Grow>
        <Grid container spacing={2}>
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
                  name='header.weight'
                  maxAccess={maxAccess}
                  label={labels.totalWeight}
                  value={weight}
                  readOnly
                />
              </Grid>
              <Grid item xs={12}></Grid>
              <Grid item xs={12}>
                <CustomNumberField
                  name='header.subTotal'
                  maxAccess={maxAccess}
                  label={labels.subtotal}
                  value={subTotal}
                  readOnly
                />
              </Grid>
              <Grid item xs={12}>
                <CustomNumberField
                  name='header.vatAmount'
                  maxAccess={maxAccess}
                  label={labels.vat}
                  value={vatAmount}
                  readOnly
                />
              </Grid>
              <Grid item xs={12}>
                <CustomNumberField
                  name='header.total'
                  maxAccess={maxAccess}
                  label={labels.total}
                  value={amount}
                  readOnly
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </VertLayout>
    </FormShell>
  )
}
