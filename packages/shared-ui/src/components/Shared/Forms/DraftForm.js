import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import { formatDateFromApi, formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'
import { Grid } from '@mui/material'
import { useContext, useEffect, useRef, useState } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import CustomTextArea from '@argus/shared-ui/src/components/Inputs/CustomTextArea'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import { SaleRepository } from '@argus/repositories/src/repositories/SaleRepository'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import WorkFlow from '@argus/shared-ui/src/components/Shared/WorkFlow'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { getVatCalc } from '@argus/shared-utils/src/utils/VatCalculator'
import {
  getFooterTotals,
  getSubtotal,
} from '@argus/shared-utils/src/utils/FooterCalculator'
import { getIPR, DIRTYFIELD_UNIT_PRICE } from '@argus/shared-utils/src/utils/ItemPriceCalculator'
import { useDocumentType } from '@argus/shared-hooks/src/hooks/documentReferenceBehaviors'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import TaxDetails from '@argus/shared-ui/src/components/Shared/TaxDetails'
import ImportSerials from '@argus/shared-ui/src/components/Shared/ImportSerials'
import { SystemChecks } from '@argus/shared-domain/src/resources/SystemChecks'
import { useError } from '@argus/shared-providers/src/providers/error'
import AccountSummary from '@argus/shared-ui/src/components/Shared/AccountSummary'
import { DefaultsContext } from '@argus/shared-providers/src/providers/DefaultsContext'

const DraftForm = ({ labels, access, recordId, invalidate }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { stack: stackError } = useError()
  const { platformLabels } = useContext(ControlContext)
  const { systemDefaults, userDefaults, systemChecks } = useContext(DefaultsContext)
  const [reCal, setReCal] = useState(false)
  const taxDetailsCacheRef = useRef(null)

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.DraftSerialsIn,
    access: access,
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
        subtotal: 0,
        amount: 0,
        vatAmount: 0,
        plId: defplId || null,
        ptId: null,
        weight: 0,
        accountId: null,
        disSkuLookup: false,
        search: '',
      },
      items: [
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
          priceType: 0,
          volume: 0
        }
      ],
      metalGridData: [],
      itemGridData: [],
      taxDetails: []
    },
    validateOnChange: true,
    validationSchema: yup.object({
      header: yup.object({
        date: yup.string().required(),
        currencyId: yup.string().required(),
        clientId: yup.string().required(),
        spId: yup.string().required(),
        siteId: yup.string().required(),
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
      const { items, header, } = obj

      const updatedRows = formik.values.items
        .filter(row => row.srlNo)
        .map(({ taxDetails, recordId, ...rest }, index) => ({
          ...rest,
          seqNo: index + 1,
          draftId: recordId || 0
        }))

      const DraftInvoicePack = {
        header: {
          ...header,
          pcs: items.length,
          date: formatDateToApi(header.date)
        },
        items: updatedRows
      }

      postRequest({
        extension: SaleRepository.DraftInvoice.set2,
        record: JSON.stringify(DraftInvoicePack)
      }).then(async diRes => {
        toast.success(editMode ? platformLabels.Edited : platformLabels.Added)
        await refetchForm(diRes.recordId)
        invalidate()
      })
    }
  })

  async function loadTaxDetails() {
    if (taxDetailsCacheRef.current) {
      return
    }

    const res = await getRequest({
      extension: SaleRepository.DraftInvoice.pack,
      parameters: ''
    })

    const taxDetails = res?.record?.taxDetails || []

    taxDetailsCacheRef.current = taxDetails
  }


  async function refetchForm(recordId) {
    const pack = await getDraftInvoicePack(recordId)
    await fillDraftFromPack(pack)
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
    if (!row?.draftId || !row?.itemId) return true

    const LastSerPack = {
      draftId: formik?.values?.header?.recordId,
      lineItem: row
    }

    await postRequest({
      extension: SaleRepository.DraftInvoiceSerial.del,
      record: JSON.stringify(LastSerPack)
    })

    toast.success(platformLabels.Deleted)

    return true
  }

  async function autoSave(draftId, lastLine) {
    if (lastLine?.srlNo) {
      lastLine.draftId = draftId

      const LastSerPack = {
        draftId: draftId,
        lineItem: lastLine
      }

      await postRequest({
        extension: SaleRepository.DraftInvoiceSerial.append,
        record: JSON.stringify(LastSerPack),
        noHandleError: true
      })
      
      toast.success(platformLabels.Saved)
      invalidate()

      return true
    }
  }

  async function saveHeader(lastLine) {
    const serialsForCalc = [lastLine]

    const { date, ...rest } = formik.values.header

    const DraftInvoicePack = {
      header: {
        ...rest,
        pcs: serialsForCalc.length,
        date: formatDateToApi(date)
      },
      items: [lastLine]
    }

    const diRes = await postRequest({
      extension: SaleRepository.DraftInvoice.set2,
      record: JSON.stringify(DraftInvoicePack)
    })

    if (diRes?.recordId) {
      toast.success(platformLabels.Saved)
      refetchForm(diRes?.recordId)
    }
  }

  async function getDraftInvoicePack(recordId) {
    if (!recordId) return null

    const res = await getRequest({
      extension: SaleRepository.DraftInvoice.get2,
      parameters: `_recordId=${recordId}`
    })

    const clientRes = await getRequest({
      extension: SaleRepository.Client.get,
      parameters: `_recordId=${res?.record?.header?.clientId}`
    })

    res.record.header.accountId = clientRes.record.accountId

    return res?.record || {}
  }


  const serialsColumns = [
    {
      component: 'textfield',
      label: labels.srlNo,
      name: 'srlNo',
      flex: 1.2,
      ...({ updateOn: 'blur' }),
      jumpToNextLine: jumpToNextLine,
      disableDuplicate: true,
      propsReducer({ row, props }) {
        return { ...props, readOnly: row?.srlNo }
      },
      async onChange({ row: { update, newRow, oldRow, addRow } }) {
        if (!newRow?.srlNo) {
          return
        }

        const res = await getRequest({
          extension: SaleRepository.DraftInvoiceSerial.get,
          parameters: `_currencyId=${formik?.values?.header?.currencyId}&_plId=${formik?.values?.header?.plId}&_srlNo=${newRow?.srlNo}&_siteId=${formik?.values?.header?.siteId}`
        })

        let lineObj = {
          fieldName: 'srlNo',
          changes: {
            id: newRow.id,
            seqNo: newRow.id,
            draftId: formik?.values?.header?.recordId || 0,
            srlNo: res?.record?.srlNo || '',
            sku: res?.record?.sku || '',
            itemName: res?.record?.itemName || '',
            categoryName: res?.record?.categoryName || '',
            weight: res?.record?.weight || 0,
            itemId: res?.record?.itemId || null,
            priceType: res?.record?.priceType || 0,
            metalId: res?.record?.metalId || null,
            metalRef: res?.record?.metalRef || '',
            designId: res?.record?.designId || null,
            designRef: res?.record?.designRef || null,
            categoryName: res?.record?.categoryName,
            volume: res?.record?.volume || 0,
            baseLaborPrice: res?.record?.baseLaborPrice || 0,
            unitPrice: parseFloat(res?.record?.unitPrice).toFixed(2) || 0,
            vatPct: res?.record?.vatPct || 0,
            vatAmount: parseFloat(res?.record?.vatAmount).toFixed(2) || 0,

            ...(res?.record?.taxId && {
              taxId: formik.values?.header?.taxId || res?.record?.taxId,
              taxDetails: await getTaxDetails(
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
            (lineObj.changes.taxDetails = await getTaxDetails(
              lineObj.changes.taxId
            ))
        }

        setReCal(true)

        const successSave = formik?.values?.header?.recordId
          ? await autoSave(formik?.values?.header?.recordId, lineObj.changes)
          : await saveHeader(lineObj.changes)

        if (!successSave) {
          update({
            ...formik?.initialValues?.items,
            id: newRow?.id,
            srlNo: ''
          })
        } else {
          await addRow(lineObj)
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
      extension: SaleRepository.DraftInvoice.close,
      record: JSON.stringify({
        ...restValues,
        date: formatDateToApi(formik.values.header?.date)
      })
    }).then(() => {
      toast.success(platformLabels.Closed)
      invalidate()
      refetchForm(formik?.values?.header?.recordId)
    })
  }

  async function onReopen() {
    const { serials, ...restValues } = formik.values

    await postRequest({
      extension: SaleRepository.DraftInvoice.reopen,
      record: JSON.stringify({
        ...restValues,
        date: formatDateToApi(formik.values.header?.date)
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
        functionId: SystemFunction.DraftSerialsIn,
        recordId: formik.values.header?.recordId
      }
    })
  }

  async function onImportClick() {
    stack({
      Component: ImportSerials,
      props: {
        endPoint: SaleRepository.DraftInvoiceSerial.batch,
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
      onClick: () => onImportClick(),
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

  async function fillDraftFromPack(pack) {
    if (!pack) return

    const modifiedList = await Promise.all(
      (pack.items || []).map(async (item, index) => {
        return {
          ...item,
          id: index + 1,
        }
      })
    )
    
    await formik.setValues({
      header: {
        ...pack.header,
        plId: defplId,
        date : formatDateFromApi(pack.header?.date)
      },
      items: modifiedList,
      taxDetails: pack.taxDetails
    })

  }

  async function getTaxDetails(taxId) {
    if (!taxId) return []

    const taxDetails = taxDetailsCacheRef.current
    return taxDetails ? taxDetails?.filter(td => td.taxId === taxId) : []
  }

  const filteredData = formik.values.header?.search
    ? formik.values.header?.items.filter(
        item =>
          item.srlNo?.toString()?.includes(formik.values.header?.search) ||
          item.sku?.toString()?.toLowerCase()?.includes(formik.values.header?.search.toLowerCase()) ||
          item.itemName?.toString()?.toLowerCase()?.includes(formik.values.header?.search.toLowerCase()) ||
          item.weight?.toString()?.includes(formik.values.header?.search)
      )
    : formik.values.items

  const handleSearchChange = event => {
    const { value } = event.target
    formik.setFieldValue('search', value)
  }

  const handleGridChange = (value, action, row) => {
    if (action === 'delete') {
      let updatedSerials = formik.values.items

      updatedSerials = updatedSerials.filter(item => item.id !== row.id)
      formik.setFieldValue('items', updatedSerials)
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

      formik.setFieldValue('plantId', dtd?.record?.plantId || null)
      formik.setFieldValue('spId', dtd?.record?.spId || defspId || null)
      formik.setFieldValue('siteId', dtd?.record?.siteId || defSiteId || null)
    }
  }

  
    const parsedItemsArray = formik.values.items
      ?.filter(item => item.itemId !== undefined)
      .map(item => ({
        ...item,
        qty: 1
    }))
    
    const subTotal = getSubtotal(parsedItemsArray)

    const _footerSummary = getFooterTotals(parsedItemsArray, {
      totalQty: 0,
      totalWeight: 0,
      totalVolume: 0,
      totalUpo: 0,
      sumVat: 0,
      sumExtended: parseFloat(subTotal),
      tdAmount: 0,
      net: 0,
      miscAmount: 0
    })

    const amount = reCal ? parseFloat(_footerSummary?.net) : formik.values?.header.amount || 0
    const weight = reCal ? _footerSummary?.totalWeight : formik.values?.header.weight || 0
    const subtotal = reCal ? subTotal.toFixed(2) : formik.values?.header.subtotal || 0
    const vatAmount = reCal ? _footerSummary?.sumVat : formik.values?.header.vatAmount || 0
  

  useEffect(() => {
    if (formik?.values?.items?.length) {
      const serials = formik?.values?.items

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
  }, [formik?.values?.items])

    useEffect(() => {
      formik.setFieldValue('header.amount', parseFloat(amount).toFixed(2))
      formik.setFieldValue('header.weight', parseFloat(weight).toFixed(2))
      formik.setFieldValue('header.subtotal', parseFloat(subtotal).toFixed(2))
      formik.setFieldValue('header.vatAmount', parseFloat(vatAmount).toFixed(2))
    }, [amount, weight, subtotal, vatAmount])

    console.log(amount, weight, subtotal, vatAmount)
  useEffect(() => {
    ;(async function () {
      if (!defplId)
        stackError({
          message: labels.noSelectedplId
        })

      await loadTaxDetails()

      if (recordId) {
        await refetchForm(recordId)
      }
    })()
  }, [])

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
            <Grid item xs={4}>
              <ResourceComboBox
                endpointId={SaleRepository.DraftInvoice.pack}
                reducer={response => response?.record?.documentTypes}
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
                  formik.setFieldValue('header.dtId', newValue?.recordId)
                  await onChangeDtId(newValue?.recordId)
                  changeDT(newValue)
                }}
                error={formik.touched.header?.dtId && Boolean(formik.errors.header?.dtId)}
              />
            </Grid>
            <Grid item xs={4}>
              <ResourceComboBox
                endpointId={SaleRepository.DraftInvoice.pack}
                reducer={response => response?.record?.sites}
                name='header.siteId'
                readOnly={isClosed || formik?.values?.items?.some(serial => serial.srlNo)}
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
                    formik.setFieldValue('header.siteId', newValue?.recordId)
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
            <Grid item xs={2}>
              <ResourceComboBox
                endpointId={SaleRepository.DraftInvoice.pack}
                reducer={response => response?.record?.currencies}
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
                readOnly={isClosed}
                values={formik.values.header}
                maxAccess={maxAccess}
                onChange={(_, newValue) => {
                  formik.setFieldValue('header.currencyId', newValue?.recordId || null)
                }}
                error={formik.touched.header?.currencyId && Boolean(formik.errors.header?.currencyId)}
              />
            </Grid>
            <Grid item xs={2}>
              <CustomTextField
                name='header.search'
                value={formik.values.search}
                label={platformLabels.Search}
                onClear={() => {
                  formik.setFieldValue('header.search', '')
                }}
                onChange={handleSearchChange}
                onSearch={e => formik.setFieldValue('header.search', e)}
                search={true}
              />
            </Grid>
            <Grid item xs={4}>
              <CustomTextField
                name='header.reference'
                label={labels.reference}
                value={formik?.values?.header?.reference}
                maxAccess={!editMode && maxAccess}
                readOnly={editMode}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('header.reference', '')}
                error={formik.touched.header?.reference && Boolean(formik.errors.header?.reference)}
              />
            </Grid>
            <Grid item xs={4}>
              <ResourceComboBox
                endpointId={SaleRepository.DraftInvoice.pack}
                reducer={response => response?.record?.plants}
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
                  formik.setFieldValue('header.plantId', newValue?.recordId)
                }}
                error={formik.touched.header?.plantId && Boolean(formik.errors.header?.plantId)}
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
                error={formik.touched.header?.contactId && Boolean(formik.errors.header?.contactId)}
              />
            </Grid>
            <Grid item xs={4}>
              <CustomDatePicker
                name='header.date'
                required
                label={labels.postingDate}
                value={formik?.values?.header?.date}
                onChange={formik.setFieldValue}
                editMode={editMode}
                readOnly={isClosed}
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('header.date', '')}
                error={formik.touched.header?.date && Boolean(formik.errors.header?.date)}
              />
            </Grid>
            <Grid item xs={4}>
              <ResourceComboBox
                endpointId={SaleRepository.DraftInvoice.pack}
                reducer={response => response?.record?.salesPeople}
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
                error={formik.touched.header?.spId && Boolean(formik.errors.header?.spId)}
              />
            </Grid>
            <Grid item xs={4}>
              <ResourceComboBox
                endpointId={SaleRepository.DraftInvoice.pack}
                reducer={response => response?.record?.taxSchedules}
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
                error={formik.touched.header?.taxId && Boolean(formik.errors.header?.taxId)}
              />
            </Grid>
            <Grid item xs={8}>
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
                    formik.setFieldValue('header.clientName', newValue?.name)
                    formik.setFieldValue('header.clientRef', newValue?.reference)
                    formik.setFieldValue('header.accountId', newValue?.accountId)
                    formik.setFieldValue('header.isVattable', newValue?.isSubjectToVAT || false)
                    formik.setFieldValue('header.taxId', newValue?.taxId)
                    formik.setFieldValue('header.clientId', newValue?.recordId || null)
                  }}
                  errorCheck={'header.clientId'}
                  secondFieldName={'header.clientName'}
                />
              </Grid>
            </Grid>
            <Grid item xs={4}>
              <CustomTextArea
                name='header.description'
                label={labels.description}
                value={formik.values.header?.description}
                rows={1.25}
                editMode={editMode}
                readOnly={isClosed}
                maxAccess={maxAccess}
                onChange={e => formik.setFieldValue('header.description', e.target.value)}
                onClear={() => formik.setFieldValue('header.description', '')}
                error={formik.touched.header?.description && Boolean(formik.errors.header?.description)}
              />
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <DataGrid
            onChange={(value, action, row) => handleGridChange(value, action, row)}
            value={filteredData || []}
            error={formik.errors.items}
            initialValues={formik?.initialValues?.items?.[0]}
            columns={serialsColumns}
            name='serials'
            showCounterColumn={true}
            maxAccess={maxAccess}
            disabled={isClosed || Object.entries(formik?.errors || {}).filter(([key]) => key !== 'items').length > 0}
            allowDelete={!isClosed}
            allowAddNewLine={
              !formik?.values?.header?.search &&
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
              <Grid item xs={12}>
                <CustomNumberField
                  name='header.subtotal'
                  maxAccess={maxAccess}
                  label={labels.subtotal}
                  value={subtotal}
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
                <CustomNumberField name='header.amount' maxAccess={maxAccess} label={labels.total} value={amount} readOnly />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </VertLayout>
    </FormShell>
  )
}
DraftForm.width = 1300
DraftForm.height = 750

export default DraftForm
