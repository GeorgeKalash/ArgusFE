import { Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { FinancialRepository } from 'src/repositories/FinancialRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { useForm } from 'src/hooks/form'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { SystemFunction } from 'src/resources/SystemFunction'
import { CashBankRepository } from 'src/repositories/CashBankRepository'
import { LogisticsRepository } from 'src/repositories/LogisticsRepository'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'
import { DataSets } from 'src/resources/DataSets'
import { getStorageData } from 'src/storage/storage'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import { ControlContext } from 'src/providers/ControlContext'
import { SaleRepository } from 'src/repositories/SaleRepository'

export default function ReceiptVoucherForm({ labels, maxAccess: access, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.ReceiptVoucher,
    access: access,
    enabled: !recordId
  })

  const invalidate = useInvalidate({
    endpointId: FinancialRepository.ReceiptVouchers.qry
  })

  const { formik } = useForm({
    maxAccess: maxAccess,
    enableReinitialize: false,
    validateOnChange: true,
    initialValues: {
      reference: '',
      accountId: null,
      date: new Date(),
      currencyId: null,
      dtId: documentType?.dtId,
      dgId: '',
      amount: '',
      baseAmount: '',
      notes: '',
      oDocId: '',
      printStatus: '',
      status: 1,
      paymentMethod: '1',
      cashAccountId: null,
      plantId: null,
      exRate: 1.0,
      rateCalcMethod: 1,
      contactId: null,
      collectorId: null,
      isVerified: true,
      template: 1,
      sourceReference: '',
      spId: ''
    },
    validationSchema: yup.object({
      accountId: yup.string().required(),
      currencyId: yup.string().required(),
      cashAccountId: yup.string().required(),
      amount: yup.string().required(),
      paymentMethod: yup.string().required()
    }),
    onSubmit: async obj => {
      try {
        const response = await postRequest({
          extension: FinancialRepository.ReceiptVouchers.set,
          record: JSON.stringify({ ...obj, date: formatDateToApi(obj.date) })
        })
        if (!obj.recordId) {
          toast.success(platformLabels.Added)
          formik.setFieldValue('recordId', response.recordId)
          getData(response.recordId)
        } else toast.success(platformLabels.Edited)
        invalidate()
      } catch (e) {}
    }
  })

  const editMode = !!recordId || !!formik.values.recordId
  const isCancelled = formik.values.status === -1
  const isPosted = formik.values.status === 3
  const readOnly = formik.values.status !== 1

  const getDefaultDT = async () => {
    const userData = getStorageData('userData')

    const _userId = userData.userId
    try {
      const { record: cashAccountRecord } = await getRequest({
        extension: SystemRepository.UserDefaults.get,
        parameters: `_userId=${_userId}&_key=cashAccountId`
      })

      const { record: currency } = await getRequest({
        extension: SystemRepository.Default.get,
        parameters: `_key=currencyId`
      })
      const cashAccountId = cashAccountRecord?.value
      if (cashAccountId) {
        const { record: cashAccountResult } = await getRequest({
          extension: CashBankRepository.CbBankAccounts.get,
          parameters: `_recordId=${cashAccountId}`
        })

        formik.setFieldValue('cashAccountId', cashAccountId)
        formik.setFieldValue('cashAccountRef', cashAccountResult.reference)
        formik.setFieldValue('cashAccountName', cashAccountResult.name)
        formik.setFieldValue('currencyId', parseInt(currency.value))
      }

      const { record: plantRecord } = await getRequest({
        extension: SystemRepository.UserDefaults.get,
        parameters: `_userId=${_userId}&_key=plantId`
      })
      if (plantRecord) {
        formik.setFieldValue('plantId', parseInt(plantRecord.value))
      }
    } catch (error) {}
  }

  useEffect(() => {
    recordId && getDefaultDT()
    ;(async function () {
      getData()
    })()
  }, [recordId])

  async function getData(_recordId) {
    try {
      const finalRecordId = _recordId || recordId || formik.values.recordId
      if (finalRecordId) {
        const res = await getRequest({
          extension: FinancialRepository.ReceiptVouchers.get,
          parameters: `_recordId=${finalRecordId}`
        })

        formik.setValues({ ...res.record, date: formatDateFromApi(res.record.date) })
      }
    } catch (e) {}
  }

  const onCancel = async () => {
    try {
      const obj = formik.values

      const res = await postRequest({
        extension: FinancialRepository.ReceiptVouchers.cancel,
        record: JSON.stringify({ ...obj, date: formatDateToApi(obj.date) })
      })

      if (res?.recordId) {
        getData()
        toast.success('Record Cancelled Successfully')
        invalidate()
      }
    } catch (e) {}
  }

  const onPost = async () => {
    try {
      const res = await postRequest({
        extension: FinancialRepository.ReceiptVouchers.post,
        record: JSON.stringify(formik.values)
      })

      if (res) {
        toast.success('Record Posted Successfully')
        invalidate()
        getData()
      }
    } catch (e) {}
  }

  const actions = [
    {
      key: 'GL',
      condition: true,
      onClick: 'onClickGL',
      disabled: !editMode
    },

    {
      key: 'Cancel',
      condition: true,
      onClick: onCancel,
      disabled: !editMode || isPosted || isCancelled
    },
    {
      key: 'FI Trx',
      condition: true,
      onClick: 'onClickIT',
      disabled: !editMode
    },
    {
      key: 'Aging',
      condition: true,
      onClick: 'onClickAging',
      disabled: !editMode
    },
    {
      key: 'RecordRemarks',
      condition: true,
      onClick: 'onRecordRemarks',
      disabled: !editMode
    },
    {
      key: 'Post',
      condition: true,
      onClick: onPost,
      disabled: isPosted || !editMode || isCancelled
    }
  ]

  return (
    <FormShell
      resourceId={ResourceIds.ReceiptVoucher}
      functionId={SystemFunction.ReceiptVoucher}
      form={formik}
      actions={actions}
      maxAccess={maxAccess}
      editMode={editMode}
      disabledSubmit={isPosted || isCancelled}
      previewReport={editMode}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <CustomTextField
                    name='reference'
                    label={labels.reference}
                    value={formik.values.reference}
                    readOnly={editMode}
                    maxAccess={!editMode && maxAccess}
                    maxLength='30'
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('reference', '')}
                    error={formik.touched.reference && Boolean(formik.errors.reference)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <CustomDatePicker
                    name='date'
                    label={labels.date}
                    onChange={formik.setFieldValue}
                    readOnly={readOnly}
                    value={formik.values.date}
                    maxAccess={maxAccess}
                    error={formik.touched.date && Boolean(formik.errors.date)}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <CustomTextField
                    name='reference'
                    label={labels.reference}
                    value={formik.values.reference}
                    readOnly={editMode}
                    maxAccess={!editMode && maxAccess}
                    maxLength='30'
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('reference', '')}
                    error={formik.touched.reference && Boolean(formik.errors.reference)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <CustomNumberField
                    name='amount'
                    label={labels.amount}
                    value={formik.values.amount}
                    required
                    allowClear={!editMode}
                    readOnly={true}
                    maxAccess={maxAccess}
                    onChange={e => formik.setFieldValue('amount', e.target.value)}
                    onBlur={async () => {
                      if (!formik.values.fcAmount)
                        await fillProducts({
                          countryId: formik.values.countryId,
                          currencyId: formik.values.currencyId,
                          dispersalType: formik.values.dispersalType,
                          amount: formik.values.amount || 0,
                          fcAmount: formik.values.fcAmount || 0
                        })
                    }}
                    onClear={() => {
                      formik.setFieldValue('amount', '')
                      if (!formik.values.fcAmount) {
                        handleSelectedProduct(null, true)
                        formik.setFieldValue('products', [])
                      }
                    }}
                    error={formik.touched.amount && Boolean(formik.errors.amount)}
                    maxLength={10}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
