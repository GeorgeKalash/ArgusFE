import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
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

export default function DraftForm({ labels, access, recordId, invalidate }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { stack: stackError } = useError()
  const { platformLabels, defaultsData, userDefaultsData, systemChecks } = useContext(ControlContext)

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.DraftSerialsIn,
    access: access,
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
      recordId: recordId || '',
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
      disSkuLookup: false,
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
      const { serials, date, ...rest } = obj

      const header = {
        ...rest,
        pcs: serials.length,
        date: formatDateToApi(date)
      }

      const updatedRows = formik.values.serials
        .filter(row => row.srlNo)
        .map(({ taxDetails, recordId, ...rest }, index) => ({
          ...rest,
          seqNo: index + 1,
          draftId: recordId || 0
        }))

      const DraftInvoicePack = {
        header,
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
    return await getRequest({
      extension: SaleRepository.DraftInvoiceSerial.qry,
      parameters: `_draftId=${diId}`
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
    if (!row?.itemName) return true

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
      lastLine.draftId = draftId

      const LastSerPack = {
        draftId: draftId,
        lineItem: lastLine
      }

      const response = await postRequest({
        extension: SaleRepository.DraftInvoiceSerial.append,
        record: JSON.stringify(LastSerPack),
        noHandleError: true
      })
      if (response?.error) {
        stackError({
          message: response?.error
        })

        return false
      }
      toast.success(platformLabels.Saved)

      return true
    }
  }

  async function saveHeader(lastLine) {
    const DraftInvoicePack = {
      header: {
        ...formik?.values,
        pcs: 0,
        date: formatDateToApi(formik.values.date)
      },
      items: []
    }

    delete DraftInvoicePack.header.serials

    const diRes = await postRequest({
      extension: SaleRepository.DraftInvoice.set2,
      record: JSON.stringify(DraftInvoicePack)
    })

    const diHeader = await getDraftInv(diRes.recordId)
    formik.setFieldValue('recordId', diRes.recordId)
    formik.setFieldValue('reference', diHeader?.record?.reference)
    formik.setFieldValue('date', diHeader?.record?.date)

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
      component: 'textfield',
      label: labels.srlNo,
      name: 'srlNo',
      flex: 2,
      ...(formik?.values?.autoSrlNo && { updateOn: 'blur' }),
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
            extension: SaleRepository.DraftInvoiceSerial.get,
            parameters: `_currencyId=${formik?.values?.currencyId}&_plId=${formik?.values?.plId}&_srlNo=${newRow?.srlNo}&_siteId=${formik?.values?.siteId}`
          })

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
                  taxDetails: await FilteredListByTaxId(
                    formik?.values?.taxDetailsStore,
                    formik.values?.taxId || res?.record?.taxId
                  ),
                  taxDetailsButton: true
                })
              }
            }

            const { unitPrice, baseLaborPrice } = getItemPriceRow(lineObj.changes, DIRTYFIELD_UNIT_PRICE)

            lineObj.changes.unitPrice = unitPrice
            lineObj.changes.baseLaborPrice = baseLaborPrice

            if (lineObj.changes.taxId != null) {
              ;(lineObj.changes.extendedPrice = unitPrice),
                (lineObj.changes.taxDetails = FilteredListByTaxId(
                  formik?.values?.taxDetailsStore,
                  lineObj.changes.taxId
                ))
            }

            addRow(lineObj)

            const successSave = formik?.values?.recordId
              ? await autoSave(formik?.values?.recordId, lineObj.changes)
              : await saveHeader(lineObj.changes)

            if (!successSave) {
              update({
                ...formik?.initialValues?.serials,
                id: newRow?.id
              })
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
      extension: SaleRepository.DraftInvoice.reopen,
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
        functionId: SystemFunction.DraftSerialsIn,
        recordId: formik.values.recordId
      },
      width: 950,
      height: 600,
      title: labels.workflow
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
      onClick: () => onImportClick(),
      disabled: !editMode || formik.values.status != 1 || isClosed
    }
  ]

  async function fillGrids() {
    const diHeader = await getDraftInv(formik?.values?.recordId)
    const diItems = await getDraftInvItems(formik?.values?.recordId)

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
          taxDetailsButton: true,
          taxDetails: taxDetailsResponse
        }
      })
    )

    formik.setFieldValue('serials', modifiedList)

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
          taxDetailsButton: true,
          taxDetails: taxDetailsResponse
        }
      })
    )

    await formik.setValues({
      ...formik.values,
      ...diHeader.record,
      plId: defplId || formik?.values?.plId,
      amount: parseFloat(diHeader?.record?.amount).toFixed(2),
      vatAmount: parseFloat(diHeader?.record?.vatAmount).toFixed(2),
      subtotal: parseFloat(diHeader?.record?.subtotal).toFixed(2),
      totalWeight: parseFloat(diHeader?.record?.totalWeight).toFixed(2),
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
    ? formik.values.serials.filter(item => item.srlNo?.toString()?.includes(formik.values.search.toLowerCase()))
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

  useEffect(() => {
    formik.setFieldValue('subtotal', subtotal)
    formik.setFieldValue('vatAmount', vatAmount)
    formik.setFieldValue('weight', totalWeight)
    formik.setFieldValue('amount', subtotal + vatAmount)
  }, [totalWeight, subtotal, vatAmount])

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
                endpointId={SystemRepository.DocumentType.qry}
                parameters={`_startAt=0&_pageSize=1000&_dgId=${SystemFunction.DraftSerialsIn}`}
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
                readOnly={isClosed || formik?.values?.serials?.some(serial => serial.srlNo)}
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
                    formik.setFieldValue('siteId', newValue?.recordId)
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
                  formik.setFieldValue('contactId', newValue?.recordId || null)
                }}
                error={formik.touched.contactId && Boolean(formik.errors.contactId)}
              />
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
                  formik.setFieldValue('spId', newValue?.recordId || null)
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
            <Grid item xs={6}>
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
                      formik.setFieldValue('clientName', newValue?.name)
                      formik.setFieldValue('clientRef', newValue?.reference)
                      formik.setFieldValue('accountId', newValue?.accountId)
                      formik.setFieldValue('isVattable', newValue?.isSubjectToVAT || false)
                      formik.setFieldValue('taxId', newValue?.taxId)
                      formik.setFieldValue('clientId', newValue?.recordId || null)
                    }}
                    errorCheck={'clientId'}
                  />
                </Grid>
                <Grid item xs={5}>
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
        </Fixed>
        <Grow>
          <DataGrid
            onChange={(value, action, row) => handleGridChange(value, action, row)}
            value={filteredData || []}
            error={formik.errors.serials}
            columns={serialsColumns}
            name='serials'
            maxAccess={maxAccess}
            disabled={isClosed || !formik.values.clientId}
            allowDelete={!isClosed}
            allowAddNewLine={!formik?.values?.search}
            autoDelete={autoDelete}
          />
        </Grow>
        <Grid container spacing={3}>
          <Grid item xs={9}>
            <Grid container spacing={3}>
              <Grid item xs={9} height={132} sx={{ display: 'flex', flex: 1 }}>
                <Table
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
              <Grid item xs={3}>
                <Grid container spacing={2}>
                  <Grid item xs={12}></Grid>
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
                      name='vatAmount'
                      maxAccess={maxAccess}
                      label={labels.vat}
                      value={vatAmount}
                      readOnly
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <CustomNumberField
                      name='total'
                      maxAccess={maxAccess}
                      label={labels.total}
                      value={formik?.values?.amount || 0}
                      readOnly
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} height={132} sx={{ display: 'flex', flex: 1 }}>
                <Table
                  columns={[
                    { field: 'seqNo', headerName: labels.seqNo, type: 'number', flex: 1 },
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
          </Grid>
          <Grid item xs={2.5}>
            <Grid container spacing={2}>
              <Grid item xs={12}></Grid>
              <Grid item xs={12}>
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
        </Grid>
      </VertLayout>
    </FormShell>
  )
}
