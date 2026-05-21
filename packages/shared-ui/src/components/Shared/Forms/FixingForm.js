import { Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import { formatDateForGetApI, formatDateFromApi, formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import CustomTextArea from '@argus/shared-ui/src/components/Inputs/CustomTextArea'
import { FinancialRepository } from '@argus/repositories/src/repositories/FinancialRepository'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import { useDocumentType } from '@argus/shared-hooks/src/hooks/documentReferenceBehaviors'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { DefaultsContext } from '@argus/shared-providers/src/providers/DefaultsContext'
import { BrokerageTradingRepository } from '@argus/repositories/src/repositories/BrokerageTradingRepository'
import FieldSet from '@argus/shared-ui/src/components/Shared/FieldSet'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import { RateDivision } from '@argus/shared-domain/src/resources/RateDivision'
import { DIRTYFIELD_RATE, getRate } from '@argus/shared-utils/src/utils/RateCalculator'
import { MultiCurrencyRepository } from '@argus/repositories/src/repositories/MultiCurrencyRepository'
import AccountSummary from '@argus/shared-ui/src/components/Shared/AccountSummary'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'
import useResourceParams from '@argus/shared-hooks/src/hooks/useResourceParams'
import { useError } from '@argus/shared-providers/src/providers/error'

export default function FixingForm({ recordId, functionId, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { systemDefaults } = useContext(DefaultsContext)
  const { stack } = useWindow()
  const [reCalc, setReCalc] = useState(false)
  const { stack: stackError } = useError()
  const msId = parseInt(systemDefaults?.list?.find(obj => obj.key === 'fixing_msId')?.value) || null
  
  const getResourceId = functionId => {
    switch (functionId) {
      case SystemFunction.FixingSales:
        return ResourceIds.FixingSales
      case SystemFunction.FixingPurchases:
        return ResourceIds.FixingPurchases
      default:
        return null
    }
  }
  
  const { labels, access } = useResourceParams({
    datasetId: ResourceIds.FixingSales,
    DatasetIdAccess: getResourceId(parseInt(functionId)),
    editMode: !!recordId
  })

  useSetWindow({ title: SystemFunction.FixingPurchases == functionId ? labels.FixingPurchases : labels.FixingSales, window })

  const BrokerageTradingRepositories = {
    [SystemFunction.FixingPurchases]: BrokerageTradingRepository.FixingPurchases,
    [SystemFunction.FixingSales]: BrokerageTradingRepository.FixingSales
  };

  const getEndpoint = (functionId) => BrokerageTradingRepositories[Number(functionId)] ?? null;
  const vatPct = Number(systemDefaults?.list?.find(({ key }) => key === 'vatPct')?.value)

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId,
    access,
    enabled: !recordId
  })

  const invalidate = useInvalidate({
    endpointId: getEndpoint(functionId).page
  })

  const { formik } = useForm({
    documentType: { key: 'dtId', value: documentType?.dtId, reference: documentType?.reference },
    initialValues: {
      functionId,
      plantId: null,
      accountId: null,
      fi_currencyId: null,
      metalId: null,
      currencyId: null,
      qty: null,
      purity: null,
      qty_muId: null,
      baseQty: null,
      unitPrice: null,
      unitPrice_muId: null,
      baseUnitPrice: null,
      subtotal: null,
      miscAmount: 0,
      taxAmount: null,
      amount: null,
      exRate: 1,
      rateCalcMethod: 1,
      baseAmount: null,
      notes: '',
      spId: null,
      wip: 1,
      sourceId: null,
      dueDays: null,
      dueDate: new Date(),
      sourceNo: '',
      date: new Date(),
      dtId: null,
      recordId: null,
      reference: '',
      releaseStatus: 1,
      currencyId_metalId: '',
      status: 1
    },
    maxAccess,
    validationSchema: yup.object({
      date: yup.date().required(),
      plantId: yup.number().required(),
      accountId: yup.number().required(),
      fi_currencyId: yup.number().required(),
      metalId: yup.number().required(),
      currencyId: yup.number().required(),
      qty: yup.number().required(),
      purity: yup.number().required(),
      spId: yup.number().required(),
      dueDate: yup.date().required(),
      dueDays: yup.number().required(),
      sourceNo: yup.string().nullable().test( function (value) {
        const { sourceId } = this.parent
        return !(sourceId && !value)
        }
      ),
      currencyId_metalId: yup.string().required(),
      unitPrice: yup.number().required(),
      unitPrice_muId: yup.number().required(),
      baseUnitPrice: yup.number().required(),
      baseQty: yup.number().required(),
      qty_muId: yup.number().required(),
      exRate: yup.number().required()
    }),
    onSubmit: async obj => {
      const values = {
        ...obj,
        date: formatDateToApi(obj?.date),
        dueDate: formatDateToApi(obj?.dueDate),
        dueDays: Number(obj?.dueDays),
      }
      const response = await postRequest({
        extension: getEndpoint(functionId).set,
        record: JSON.stringify(values)
      })
      toast.success(editMode ? platformLabels.Edited : platformLabels.Added)
      refetchForm(response?.recordId)
      invalidate()
    }
  })

  const editMode = !!formik.values?.recordId
  const isClosed = formik.values.wip == 2

  async function refetchForm(recordId) {
    if (!msId) return

    const res = await getRequest({
      extension: getEndpoint(functionId).get,
      parameters: `_recordId=${recordId}`
    })

    setReCalc(false)

    formik.setValues({
      ...res?.record,
      date: formatDateFromApi(res?.record?.date),
      dueDate: formatDateFromApi(res?.record?.dueDate),
      currencyId_metalId:
        res?.record?.currencyId && res?.record?.metalId
          ? `${res.record.currencyId}${res.record.metalId}`
          : null,
      netAmount: getNetAmount({
        amount: res.record?.amount,
        exRate: res.record?.exRate,
        rateCalcMethod: res.record?.rateCalcMethod
      })
    })
  }

  useEffect(() => {
    if (recordId) refetchForm(recordId)
  }, [])

  async function getMetalPurity(metalId) {
    if (!metalId) return

    const res = await getRequest({
      extension: InventoryRepository.Metals.get,
      parameters: `_recordId=${metalId}`
    })

    return res?.record || {}
  }

  const onClose = async () => {
    const res = await postRequest({
      extension: getEndpoint(functionId).close,
      record: JSON.stringify({ recordId: formik.values?.recordId })
    })

    toast.success(platformLabels.Closed)
    invalidate()
    refetchForm(res.recordId)
  }

  async function getMultiCurrencyFormData(currencyId, date) {
    if (currencyId && date) {
      const res = await getRequest({
        extension: MultiCurrencyRepository.Currency.get,
        parameters: `_currencyId=${currencyId}&_date=${formatDateForGetApI(date)}&_rateDivision=${RateDivision.FINANCIALS}`
      })

      const updatedRateRow = getRate({
        amount: formik.values.amount,
        exRate: res.record?.exRate,
        baseAmount: 0,
        rateCalcMethod: res.record?.rateCalcMethod,
        dirtyField: DIRTYFIELD_RATE
      })

      formik.setFieldValue('baseAmount', parseFloat(updatedRateRow?.baseAmount).toFixed(2) || 0)

      formik.setFieldValue('exRate', res.record?.exRate)
      formik.setFieldValue('rateCalcMethod', res.record?.rateCalcMethod)
    }
  }

  const actions = [
    {
      key: 'Close',
      condition: !isClosed,
      onClick: onClose,
      disabled: !editMode
    },
    {
      key: 'Reopen',
      condition: isClosed,
      disabled: true
    },
    {
      key: 'Approval',
      condition: true,
      onClick: 'onApproval',
      disabled: !isClosed
    },
    {
      key: 'AccountSummary',
      condition: true,
      onClick: () => {
        stack({
          Component: AccountSummary,
          props: {
            accountId: parseInt(formik.values.accountId),
            date: formik.values.date
          }
        })
      },
      disabled: !formik.values.accountId || !formik.values.date
    }
  ]

  const getNetAmount = ({ amount, exRate, rateCalcMethod }) => {
    const updatedRateRow = getRate({
      amount: parseFloat(amount).toFixed(2) || 0,
      exRate,
      baseAmount: 0,
      rateCalcMethod,
      dirtyField: DIRTYFIELD_RATE
    })

    return parseFloat(updatedRateRow?.baseAmount).toFixed(2) || 0
  }


  useEffect(() => {
    if (!reCalc) return

    const baseQty = parseFloat(parseFloat(formik?.values?.qty) * parseFloat(formik?.values?.qty_muQty)).toFixed(2) || 0
    const baseUnitPrice = parseFloat(parseFloat(formik?.values?.unitPrice) / parseFloat(formik?.values?.unitPrice_muQty)).toFixed(2) || 0
    const subtotal = parseFloat(parseFloat(baseQty) * parseFloat(baseUnitPrice)).toFixed(2) || 0
    const taxAmount = (subtotal + parseFloat(formik?.values?.miscAmount)) * vatPct / 100
    const amount = parseFloat(subtotal) + parseFloat(formik?.values?.miscAmount) + parseFloat(taxAmount)

    formik.setValues({
      ...formik.values,
      baseQty,
      baseUnitPrice,
      subtotal,
      taxAmount,
      amount,
      netAmount: getNetAmount({
        amount,
        exRate: formik.values.exRate,
        rateCalcMethod: formik.values.rateCalcMethod
      })
    })

  }, [
    reCalc,
    formik.values.qty,
    formik.values.qty_muQty,
    formik.values.unitPrice,
    formik.values.unitPrice_muQty,
    formik.values.miscAmount,
    formik.values.exRate,
    formik.values.rateCalcMethod,
    vatPct
  ])

  const calculateDueDate = (date, dueDays) => {
    if (!date) return null

    const days = !dueDays ? 0 : Number(dueDays)

    if (Number.isNaN(days)) return null

    const dueDate = new Date(date)
    dueDate.setDate(dueDate.getDate() + days)

    return dueDate
  }

useEffect(() => {
  if (!msId && labels?.msIdError) {
    
    window.close()
    stackError({
      message: labels.msIdError
    })


    return
  }
}, [msId, labels?.msIdError])

  return (
    <FormShell
      resourceId={getResourceId(parseInt(functionId))}
      form={formik}
      maxAccess={maxAccess}
      previewReport={editMode}
      editMode={editMode}
      functionId={functionId}
      disabledSubmit={isClosed}
      actions={actions}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <ResourceComboBox
                endpointId={msId && BrokerageTradingRepository.Fixing.pack}
                parameters={msId && `_dgId=${functionId}&_msId=${msId}`}
                reducer={response => response?.record?.documentTypes}
                filter={!editMode ? item => item.activeStatus === 1 : undefined}
                name='dtId'
                label={labels.docType}
                readOnly={editMode}
                valueField='recordId'
                displayField='name'
                values={formik.values}
                onChange={(_, newValue) => {
                  changeDT(newValue)
                  
                  formik.setFieldValue('dtId', newValue?.recordId || null)
                }}
                error={formik.touched.dtId && Boolean(formik.errors.dtId)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={6}>
              <ResourceComboBox
                endpointId={msId && BrokerageTradingRepository.Fixing.pack}
                parameters={msId && `_dgId=${functionId}&_msId=${msId}`}
                reducer={response => response?.record?.plants}
                name='plantId'
                label={labels.plant}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(_, newValue) => {
                  formik.setFieldValue('plantId', newValue?.recordId || null)
                }}
                required
                readOnly={isClosed}
                error={formik.touched.plantId && Boolean(formik.errors.plantId)}
              />
            </Grid>
            
            <Grid item xs={6}>
              <CustomTextField
                name='reference'
                label={labels.reference}
                value={formik.values.reference}
                readOnly={editMode}
                maxAccess={!editMode && maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('reference', '')}
                error={formik.touched.reference && Boolean(formik.errors.reference)}
              />
            </Grid>
            
            <Grid item xs={6}>
              <ResourceComboBox
                endpointId={msId && BrokerageTradingRepository.Fixing.pack}
                parameters={msId && `_dgId=${functionId}&_msId=${msId}`}
                reducer={response => response?.record?.currencies}
                name='fi_currencyId'
                filter={item => item.currencyType === 1}
                label={labels.currency}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                required
                readOnly={editMode}
                maxAccess={maxAccess}
                onChange={async (_, newValue) => {
                  await getMultiCurrencyFormData(newValue?.recordId, formik.values.date)
                  formik.setFieldValue('fi_currencyId', newValue?.recordId || null)
                }}
                error={formik.touched.fi_currencyId && Boolean(formik.errors.fi_currencyId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={FinancialRepository.Account.snapshot}
                name='accountId'
                label={labels.accountRef}
                valueField='reference'
                displayField='name'
                valueShow='accountRef'
                secondValueShow='accountName'
                form={formik}
                required
                readOnly={isClosed}
                onChange={(_, newValue) => {
                  formik.setFieldValue('accountRef', newValue?.reference || '')
                  formik.setFieldValue('accountName', newValue?.name || '')

                  formik.setFieldValue('accountId', newValue?.recordId || null)
                }}
                error={formik.touched.accountId && Boolean(formik.errors.accountId)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomDatePicker
                name='date'
                required
                label={labels.date}
                value={formik.values.date}
                onChange={async (e, newValue) => {
                  formik.setFieldValue('date', newValue)
                  formik.setFieldValue('dueDate', calculateDueDate(newValue, formik.values.dueDays))

                  await getMultiCurrencyFormData(formik.values.fi_currencyId, newValue)
                }}
                readOnly={isClosed}
                maxAccess={maxAccess}
                onClear={() => {
                  formik.setFieldValue('date', null)
                  formik.setFieldValue('dueDate', null)
                }}
                error={formik.touched.date && Boolean(formik.errors.date)}
              />
            </Grid>
            <Grid item xs={6}>
              <ResourceComboBox
                endpointId={msId && BrokerageTradingRepository.Fixing.pack}
                parameters={msId && `_dgId=${functionId}&_msId=${msId}`}
                reducer={response => response?.record?.salesPeople}
                name='spId'
                label={labels.spName}
                columnsInDropDown={[
                  { key: 'spRef', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                valueField='recordId'
                displayField='name'
                values={formik.values}
                onChange={(_, newValue) => {
                  formik.setFieldValue('spId', newValue?.recordId || null)
                }}
                required
                readOnly={isClosed}
                error={formik.touched.spId && Boolean(formik.errors.spId)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomNumberField
                name='dueDays'
                label={labels.dueDays}
                value={formik?.values?.dueDays}
                maxAccess={maxAccess}
                allowNegative={false}
                required
                readOnly={isClosed}
                decimalScale={0}
                maxLength={3}
                onChange={e => {
                  const value = e.target.value
                  const dueDays = !value ? null : Number(value)

                  formik.setFieldValue('dueDate', calculateDueDate(formik.values.date, dueDays))
                  
                  formik.setFieldValue('dueDays', dueDays)
                }}
                onClear={() => {
                  formik.setFieldValue('dueDays', null)
                  formik.setFieldValue('dueDate', calculateDueDate(formik.values.date, 0))
                }}
                error={formik.touched.dueDays && Boolean(formik.errors.dueDays)}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomDatePicker
                name='dueDate'
                required
                label={labels.dueDate}
                value={formik.values.dueDate}
                maxAccess={maxAccess}
                readOnly
                error={formik.touched.dueDate && Boolean(formik.errors.dueDate)}
              />
            </Grid>
            <Grid item xs={12}>
              <FieldSet title={labels.Commodity}>
                <Grid container xs={12} spacing={2}>
                  <Grid item xs={6}>
                    <ResourceComboBox
                      endpointId={msId && BrokerageTradingRepository.Fixing.pack}
                      parameters={msId && `_dgId=${functionId}&_msId=${msId}`}
                      name='currencyId_metalId'
                      label={labels.cmp}
                      valueField='recordId'
                      displayField={['metalRef', 'currencyRef']}
                      reducer={response =>
                        response?.record?.commodityPairs?.map(item => ({
                          ...item,
                          recordId: `${item.currencyId}${item.metalId}`
                        }))
                      }
                      columnsInDropDown={[
                        { key: 'metalRef', value: 'Metal Reference' },
                        { key: 'currencyRef', value: 'Currency Reference' }
                      ]}
                      values={formik.values}
                      required
                      maxAccess={maxAccess}
                      readOnly={isClosed}
                      onChange={async (_, newValue) => {
                        const res = await getMetalPurity(newValue?.metalId)

                        formik.setValues({
                          ...formik.values,
                          purity: res?.purity ?? null,
                          currencyId: newValue?.currencyId || null,
                          metalId: newValue?.metalId || null,
                          currencyId_metalId: newValue ? `${newValue.currencyId}${newValue.metalId}` : null
                        })
                        
                      }}
                      error={formik.touched.currencyId_metalId && Boolean(formik.errors.currencyId_metalId)}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <CustomNumberField
                      name='purity'
                      label={labels.purity}
                      value={formik.values.purity}
                      required
                      maxAccess={maxAccess}
                      maxLength={10}
                      decimalScale={5}
                      readOnly={isClosed}
                      onChange={formik.handleChange}
                      onClear={() => formik.setFieldValue('purity', null)}
                      error={formik.touched.purity && Boolean(formik.errors.purity)}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <CustomNumberField
                      name='qty'
                      label={labels.qty}
                      value={formik.values.qty}
                      required
                      maxLength={12}
                      decimalScale={2}
                      maxAccess={maxAccess}
                      readOnly={isClosed}
                      onChange={(e) => {
                        setReCalc(true)
                        formik.setFieldValue('qty', e.target.value || null)
                      }}
                      onClear={() => formik.setFieldValue('qty', null)}
                      error={formik.touched.qty && Boolean(formik.errors.qty)}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <ResourceComboBox
                      endpointId={msId && BrokerageTradingRepository.Fixing.pack}
                      parameters={msId && `_dgId=${functionId}&_msId=${msId}`}
                      reducer={response => response?.record?.measurementUnits}
                      name='qty_muId'
                      label={labels.mu}
                      valueField='recordId'
                      displayField={['reference', 'name']}
                      columnsInDropDown={[
                        { key: 'reference', value: 'Reference' },
                        { key: 'name', value: 'Name' }
                      ]}
                      values={formik.values}
                      required
                      maxAccess={maxAccess}
                      readOnly={isClosed}
                      onChange={(_, newValue) => {
                        setReCalc(true)
                        formik.setFieldValue('qty_muId', newValue?.recordId || null)
                        formik.setFieldValue('qty_muQty', newValue?.qty || null)
                      }}
                      error={formik.touched.qty_muId && Boolean(formik.errors.qty_muId)}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <CustomNumberField
                      name='baseQty'
                      label={labels.baseQty}
                      value={formik.values.baseQty}
                      maxAccess={maxAccess}
                      readOnly
                      required
                      error={formik.touched.baseQty && Boolean(formik.errors.baseQty)}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <CustomNumberField
                      name='unitPrice'
                      label={labels.unitPrice}
                      value={formik.values.unitPrice}
                      required
                      maxAccess={maxAccess}
                      maxLength={12}
                      decimalScale={2}
                      readOnly={isClosed}
                      onChange={(e) => {
                        setReCalc(true)
                        formik.setFieldValue('unitPrice', e.target.value || null)
                      }}
                      onClear={() => formik.setFieldValue('unitPrice', null)}
                      error={formik.touched.unitPrice && Boolean(formik.errors.unitPrice)}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <ResourceComboBox
                      endpointId={msId && BrokerageTradingRepository.Fixing.pack}
                      parameters={msId && `_dgId=${functionId}&_msId=${msId}`}
                      reducer={response => response?.record?.measurementUnits}
                      name='unitPrice_muId'
                      label={labels.mu}
                      valueField='recordId'
                      displayField={['reference', 'name']}
                      columnsInDropDown={[
                        { key: 'reference', value: 'Reference' },
                        { key: 'name', value: 'Name' }
                      ]}
                      values={formik.values}
                      required
                      readOnly={isClosed}
                      maxAccess={maxAccess}
                      onChange={(_, newValue) => {
                        setReCalc(true)
                        formik.setFieldValue('unitPrice_muId', newValue?.recordId || null)
                        formik.setFieldValue('unitPrice_muQty', newValue?.qty || null)
                      }}
                      error={formik.touched.unitPrice_muId && Boolean(formik.errors.unitPrice_muId)}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <CustomNumberField
                      name='baseUnitPrice'
                      label={labels.baseUnitPrice}
                      value={formik.values.baseUnitPrice}
                      maxAccess={maxAccess}
                      readOnly
                      required
                      error={formik.touched.baseUnitPrice && Boolean(formik.errors.baseUnitPrice)}
                    />
                  </Grid>
                </Grid>
              </FieldSet>
              
            </Grid>
              <Grid item xs={6}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <ResourceComboBox
                      endpointId={msId && BrokerageTradingRepository.Fixing.pack}
                      parameters={msId && `_dgId=${functionId}&_msId=${msId}`}
                      reducer={response => response?.record?.sources}
                      name='sourceId'
                      label={labels.source}
                      valueField='recordId'
                      displayField={['reference', 'name']}
                      readOnly={isClosed}
                      columnsInDropDown={[
                        { key: 'reference', value: 'Reference' },
                        { key: 'name', value: 'Name' }
                      ]}
                      value={formik.values.sourceId}
                      values={formik.values}
                      maxAccess={maxAccess}
                      onChange={(_, newValue) => {
                        formik.setFieldValue('sourceNo', null)
                        formik.setFieldValue('sourceId', newValue?.recordId || null)
                      }}
                      error={formik.touched.sourceId && Boolean(formik.errors.sourceId)}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <CustomTextField
                      name='sourceNo'
                      label={labels.sourceNo}
                      value={formik.values.sourceNo}
                      maxLength={20}
                      onChange={formik.handleChange}
                      readOnly={!formik.values.sourceId || isClosed}
                      required={formik.values.sourceId}
                      maxAccess={maxAccess}
                      error={formik.touched.sourceNo && Boolean(formik.errors.sourceNo)}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <CustomTextArea
                      name='notes'
                      label={labels.notes}
                      value={formik.values.notes}
                      rows={4}
                      maxAccess={maxAccess}
                      readOnly={isClosed}
                      onChange={e => formik.setFieldValue('notes', e.target.value)}
                      onClear={() => formik.setFieldValue('notes', '')}
                      error={formik.touched.notes && Boolean(formik.errors.notes)}
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={6}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <CustomNumberField
                      name='subtotal'
                      label={labels.subtotal}
                      value={formik.values.subtotal}
                      maxAccess={maxAccess}
                      decimalScale={2}
                      readOnly
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <CustomNumberField
                      name='miscAmount'
                      label={labels.miscAmount}
                      value={formik.values.miscAmount}
                      maxAccess={maxAccess}
                      maxLength={12}
                      decimalScale={2}
                      readOnly={isClosed}
                      onChange={e => {
                        setReCalc(true)
                        formik.setFieldValue('miscAmount', e.target.value || 0)
                      }}
                      onClear={() => formik.setFieldValue('miscAmount', 0)}
                      error={formik.touched.miscAmount && Boolean(formik.errors.miscAmount)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <CustomNumberField
                      name='taxAmount'
                      label={labels.taxAmount}
                      value={formik.values.taxAmount}
                      maxAccess={maxAccess}
                      readOnly
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <CustomNumberField
                      name='amount'
                      label={labels.amount}
                      value={formik.values.amount}
                      maxAccess={maxAccess}
                      readOnly
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <CustomNumberField
                      name='exRate'
                      label={labels.exRate}
                      value={formik.values.exRate}
                      required
                      maxAccess={maxAccess}
                      readOnly={isClosed}
                      maxLength={17}
                      decimalScale={5}
                      onChange={(e) => {
                        setReCalc(true)
                        formik.setFieldValue('exRate', e.target.value || null)
                      }}
                      onClear={() => formik.setFieldValue('exRate', null)}
                      error={formik.touched.exRate && Boolean(formik.errors.exRate)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <CustomNumberField
                      name='netAmount'
                      label={labels.netAmount}
                      value={formik.values.netAmount}
                      maxAccess={maxAccess}
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

FixingForm.width = 1100
FixingForm.height = 770
