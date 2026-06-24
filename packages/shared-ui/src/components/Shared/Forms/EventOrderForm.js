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
import { formatDateFromApi, formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'
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
import AccountSummary from '@argus/shared-ui/src/components/Shared/AccountSummary'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'
import useResourceParams from '@argus/shared-hooks/src/hooks/useResourceParams'
import { useError } from '@argus/shared-providers/src/providers/error'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import { roundTo } from '@argus/shared-domain/src/lib/numberField-helper'

export default function EventOrderForm({ recordId, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { systemDefaults } = useContext(DefaultsContext)
  const { stack } = useWindow()
  const [reCalc, setReCalc] = useState(false)
  const functionId = SystemFunction.EventOrder
  const { stack: stackError } = useError()
  const msId = parseInt(systemDefaults?.list?.find(obj => obj.key === 'fixing_msId')?.value) || null
  
  const { labels, access } = useResourceParams({
    datasetId: ResourceIds.EventOrder,
    editMode: !!recordId
  })

  useSetWindow({ title: labels.eventOrder, window })

  const vatPct = Number(systemDefaults?.list?.find(({ key }) => key === 'vatPct')?.value)

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId,
    access,
    enabled: !recordId
  })

  const invalidate = useInvalidate({
    endpointId: BrokerageTradingRepository.EventOrder.page
  })

  const { formik } = useForm({
    behavior: { key: 'dtId', value: documentType?.dtId, fieldBehavior: documentType?.reference },
    initialValues: {
      plantId: null,
      accountId: null,
      direction: null,
      metalId: null,
      purity: null,
      currencyId: null,
      fi_currencyId: null,
      qty: null,
      qty_muId: null,
      qty_muQty: null,
      baseQty: null,
      targetPrice: null,
      targetPrice_muId: null,
      targetPrice_muQty: null,
      baseTargetPrice: null,
      validityType: null,
      expiryDate: null,
      amount: null,
      spId: null,
      wip: 1,
      notes: '',
      date: new Date(),
      dtId: null,
      recordId: null,
      reference: '',
      releaseStatus: null,
      status: 1,
      currencyId_metalId: '',
      sourceId: null,
      sourceNo: ''
    },
    maxAccess,
    validationSchema: yup.object({
      date: yup.date().required(),
      plantId: yup.number().required(),
      accountId: yup.number().required(),
      fi_currencyId: yup.number().required(),
      spId: yup.number().required(),
      direction: yup.number().required(),
      validityType: yup.number().required(),
      expiryDate: yup.date().when('validityType', {
        is:  value => value == 2,
        then: () => yup.date().required(),
        otherwise: () => yup.date().nullable()
      }),
      currencyId_metalId: yup.string().required(),
      purity: yup.number().required(),
      qty: yup.number().required(),
      targetPrice: yup.number().required(),
      qty_muId: yup.number().required(),
      baseQty: yup.number().required(),
      targetPrice_muId: yup.number().required(),
      baseTargetPrice: yup.number().required(),
      sourceNo: yup.string().nullable().test( function (value) {
        const { sourceId } = this.parent
        return !(sourceId && !value)
        }
      ),
    }),
    onSubmit: async obj => {
      const values = {
        ...obj,
        date: formatDateToApi(obj?.date),
        expiryDate: obj?.expiryDate ? formatDateToApi(obj?.expiryDate) : null
      }
      const response = await postRequest({
        extension: BrokerageTradingRepository.EventOrder.set,
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
      extension: BrokerageTradingRepository.EventOrder.get,
      parameters: `_recordId=${recordId}`
    })

    setReCalc(false)

    formik.resetForm({
      values: {
        ...res?.record,
        date: formatDateFromApi(res?.record?.date),
        expiryDate: res?.record?.expiryDate ? formatDateFromApi(res?.record?.expiryDate) : null,
        currencyId_metalId:
          res?.record?.currencyId && res?.record?.metalId
            ? `${res.record.currencyId}${res.record.metalId}`
            : null
      }
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
      extension: BrokerageTradingRepository.EventOrder.close,
      record: JSON.stringify({ recordId: formik.values?.recordId })
    })

    toast.success(platformLabels.Closed)
    invalidate()
    refetchForm(res.recordId)
  }

  const onReopen = async () => {
    const res = await postRequest({
      extension: BrokerageTradingRepository.EventOrder.reopen,
      record: JSON.stringify({ recordId: formik.values?.recordId })
    })

    toast.success(platformLabels.Reopened)
    invalidate()
    refetchForm(res.recordId)
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
      onClick: onReopen,
      disabled: !isClosed
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


  useEffect(() => {
    if (!reCalc) return

    const baseQty = roundTo(formik?.values?.qty * formik?.values?.qty_muQty) || 0
    const baseTargetPrice = roundTo(formik?.values?.targetPrice / formik?.values?.targetPrice_muQty) || 0
    const amount = roundTo(baseQty * baseTargetPrice) || 0

    formik.setValues({
      ...formik.values,
      baseQty,
      baseTargetPrice,
      amount
    })

  }, [
    reCalc,
    formik.values.qty,
    formik.values.qty_muQty,
    formik.values.targetPrice,
    formik.values.targetPrice_muQty,
    vatPct
  ])

useEffect(() => {
  if (!msId && labels?.msIdError) {
    
    window.close()
    stackError({
      message: labels.msIdError
    })
  }
}, [msId, labels?.msIdError])

  return (
    <FormShell
      resourceId={ResourceIds.EventOrder}
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
                endpointId={msId && BrokerageTradingRepository.EventOrder.pack}
                parameters={msId && `_dgId=${SystemFunction.EventOrder}&_msId=${msId}`}
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
                endpointId={msId && BrokerageTradingRepository.EventOrder.pack}
                parameters={msId && `_msId=${msId}`}
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
                endpointId={msId && BrokerageTradingRepository.EventOrder.pack}
                parameters={msId && `_msId=${msId}`}
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
                  formik.setFieldValue('fi_currencyId', newValue?.recordId || null)
                }}
                error={formik.touched.fi_currencyId && Boolean(formik.errors.fi_currencyId)}
              />
            </Grid>
            <Grid item xs={6}>
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
              <ResourceComboBox
                endpointId={msId && BrokerageTradingRepository.EventOrder.pack}
                parameters={msId && `_msId=${msId}`}
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
              <CustomDatePicker
                name='date'
                required
                label={labels.date}
                value={formik.values.date}
                onChange={async (e, newValue) => {
                  formik.setFieldValue('date', newValue)
                }}
                readOnly={isClosed}
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('date', null)}
                error={formik.touched.date && Boolean(formik.errors.date)}
              />
            </Grid>
            <Grid item xs={6}>
              <ResourceComboBox
                datasetId={DataSets.DIRECTION}
                name='direction'
                label={labels.direction}
                required
                valueField='key'
                displayField='value'
                maxAccess={maxAccess}
                values={formik.values}
                readOnly={isClosed}
                onClear={() => formik.setFieldValue('direction', null)}
                onChange={(_, newValue) => {
                  formik.setFieldValue('direction', newValue?.key || null)
                }}
                error={formik.touched.direction && Boolean(formik.errors.direction)}
              />
            </Grid>
            <Grid item xs={6}>
              <ResourceComboBox
                datasetId={DataSets.VALIDITY_TYPE}
                name='validityType'
                label={labels.validityType}
                required
                valueField='key'
                displayField='value'
                values={formik.values}
                maxAccess={maxAccess}
                readOnly={isClosed}
                onClear={() => {
                  formik.setFieldValue('validityType', null)
                  formik.setFieldValue('expiryDate', null)
                }}
                onChange={(_, newValue) => {
                  formik.setFieldValue('validityType', newValue?.key || null)
                  formik.setFieldValue('expiryDate', null)

                  formik.setFieldTouched('expiryDate', false)
                }}
                error={formik.touched.validityType && Boolean(formik.errors.validityType)}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomDatePicker
                name='expiryDate'
                required={formik.values.validityType == 2}
                label={labels.expiryDate}
                value={formik.values.expiryDate}
                min={formik.values.date}
                onChange={(e, newValue) => {
                  formik.setFieldValue('expiryDate', newValue)
                }}
                readOnly={isClosed || formik.values.validityType != 2}
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('expiryDate', null)}
                error={formik.touched.expiryDate && Boolean(formik.errors.expiryDate)}
              />
            </Grid>
            <Grid item xs={12}>
              <FieldSet title={labels.Commodity}>
                <Grid container xs={12} spacing={2}>
                  <Grid item xs={6}>
                    <ResourceComboBox
                      endpointId={msId && BrokerageTradingRepository.EventOrder.pack}
                      parameters={msId && `_msId=${msId}`}
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

                        setReCalc(true)
                        formik.setValues({
                          ...formik.values,
                          purity: res?.purity ?? null,
                          currencyId: newValue?.currencyId || null,
                          metalId: newValue?.metalId || null,
                          qty_muId: newValue?.eo_defQtyMUId || null,
                          qty_muQty: newValue?.eo_defQtyMUQty || null,
                          targetPrice_muId: newValue?.eo_defTargetPriceMUId || null,
                          targetPrice_muQty: newValue?.eo_defTargetPriceMUQty || null,
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
                      endpointId={msId && BrokerageTradingRepository.EventOrder.pack}
                      parameters={msId && `_msId=${msId}`}
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
                        formik.setFieldValue('qty', 0)
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
                      name='targetPrice'
                      label={labels.targetPrice}
                      value={formik.values.targetPrice}
                      required
                      maxAccess={maxAccess}
                      maxLength={12}
                      decimalScale={2}
                      readOnly={isClosed}
                      onChange={(e) => {
                        setReCalc(true)
                        formik.setFieldValue('targetPrice', e.target.value || null)
                      }}
                      onClear={() => formik.setFieldValue('targetPrice', null)}
                      error={formik.touched.targetPrice && Boolean(formik.errors.targetPrice)}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <ResourceComboBox
                      endpointId={msId && BrokerageTradingRepository.EventOrder.pack}
                      parameters={msId && `_msId=${msId}`}
                      reducer={response => response?.record?.measurementUnits}
                      name='targetPrice_muId'
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
                        formik.setFieldValue('targetPrice_muId', newValue?.recordId || null)
                        formik.setFieldValue('targetPrice_muQty', newValue?.qty || null)
                      }}
                      error={formik.touched.targetPrice_muId && Boolean(formik.errors.targetPrice_muId)}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <CustomNumberField
                      name='baseTargetPrice'
                      label={labels.baseTargetPrice}
                      value={formik.values.baseTargetPrice}
                      maxAccess={maxAccess}
                      readOnly
                      required
                      error={formik.touched.baseTargetPrice && Boolean(formik.errors.baseTargetPrice)}
                    />
                  </Grid>
                </Grid>
              </FieldSet>
              
            </Grid>
            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={msId && BrokerageTradingRepository.EventOrder.pack}
                    parameters={msId && `_msId=${msId}`}
                    reducer={response => response?.record?.salesOrderSources}
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
              <CustomNumberField
                name='amount'
                label={labels.totalAmount}
                value={formik.values.amount}
                maxAccess={maxAccess}
                readOnly
              />
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}

EventOrderForm.width = 1000
EventOrderForm.height = 700
