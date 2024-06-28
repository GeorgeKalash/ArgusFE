import { Grid, Typography } from '@mui/material'
import { useContext, useState } from 'react'
import toast from 'react-hot-toast'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import FieldSet from 'src/components/Shared/FieldSet'
import FormShell from 'src/components/Shared/FormShell'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { useError } from 'src/error'
import { useForm } from 'src/hooks/form'
import { useInvalidate } from 'src/hooks/resource'
import { formatDateToApi } from 'src/lib/date-helper'
import { ControlContext } from 'src/providers/ControlContext'
import { RequestsContext } from 'src/providers/RequestsContext'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import * as yup from 'yup'

export default function CloseForm({ form, labels, setIsClosed, isClosed, maxAccess, window, recordId, window2 }) {
  const { stack: stackError } = useError()
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const [mismatchedFields, setMismatchedFields] = useState([])

  const invalidate = useInvalidate({
    endpointId: RemittanceOutwardsRepository.InwardsTransfer.snapshot
  })

  const { formik } = useForm({
    initialValues: {
      recordId: recordId || null,
      corId: null,
      amount: null,
      receiver_firstName: '',
      receiver_lastName: '',
      receiver_ttNo: ''
    },
    maxAccess,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      corId: yup.string().required(),
      amount: yup.number().required(),
      receiver_firstName: yup.string().required(),
      receiver_lastName: yup.string().required(),
      receiver_ttNo: yup.string().required()
    }),
    onSubmit: () => {
      setMismatchedFields([])
      const mismatches = Object.keys(formik.values).filter(key => formik.values[key] != form.values[key])
      if (mismatches.length === 0) {
        onClose()
      } else {
        setMismatchedFields(mismatches)
        toast.error(platformLabels.fieldsDoNotMatch)
      }
    }
  })

  const onClose = async () => {
    const copy = { ...form.values }
    copy.date = formatDateToApi(copy?.date)
    copy.wip = copy?.wip === '' ? 1 : copy?.wip
    copy.status = copy?.status === null ? 1 : copy?.status
    copy.exRate = copy?.exRate === '' ? 1 : copy?.exRate
    copy.baseAmount = copy?.baseAmount === '' ? copy?.amount : copy?.baseAmount
    copy.rateCalcMethod = copy?.rateCalcMethod === '' ? 1 : copy?.rateCalcMethod
    copy.sender_idIssueDate = copy.sender_idIssueDate ? formatDateToApi(copy?.sender_idIssueDate) : null
    copy.sender_idExpiryDate = copy.sender_idExpiryDate ? formatDateToApi(copy?.sender_idExpiryDate) : null
    copy.receiver_idIssueDate = copy.receiver_idIssueDate ? formatDateToApi(copy?.receiver_idIssueDate) : null
    copy.receiver_idExpiryDate = copy.receiver_idExpiryDate ? formatDateToApi(copy?.receiver_idExpiryDate) : null
    copy.expiryDate = copy.expiryDate ? formatDateToApi(copy?.expiryDate) : null

    const res = await postRequest({
      extension: RemittanceOutwardsRepository.InwardsTransfer.close,
      record: JSON.stringify(copy)
    })
    if (res.recordId) {
      toast.success(platformLabels.Closed)
      setIsClosed(true)
      invalidate()
      window.close()
      window2.close()
    }
  }

  const getFieldError = fieldName => mismatchedFields.includes(fieldName)

  return (
    <FormShell resourceId={ResourceIds.InwardTransfer} form={formik} isInfo={false}>
      <VertLayout>
        <Fixed>
          <FieldSet title={labels.header} sx={{ flex: 0 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <ResourceLookup
                  endpointId={RemittanceSettingsRepository.Correspondent.snapshot}
                  valueField='reference'
                  displayField='id'
                  name='corId'
                  label={labels.correspondent}
                  form={formik}
                  required
                  firstFieldWidth='30%'
                  displayFieldWidth={1.5}
                  valueShow='corRef'
                  maxAccess={maxAccess}
                  onChange={async (event, newValue) => {
                    if (newValue) {
                      formik.setFieldValue('corId', newValue?.recordId)
                    } else {
                      formik.setFieldValue('corId', null)
                    }
                  }}
                  errorCheck={'corId'}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomNumberField
                  name='amount'
                  required
                  label={labels.amount}
                  value={formik.values.amount}
                  onChange={e => formik.setFieldValue('amount', e.target.value)}
                  onClear={() => formik.setFieldValue('amount', '')}
                  error={(formik.touched.amount && Boolean(formik.errors.amount)) || getFieldError('amount')}
                  maxLength={15}
                  decimalScale={2}
                />
              </Grid>
            </Grid>
          </FieldSet>
          <FieldSet title={labels.receiverDetails} sx={{ flex: 0 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <CustomTextField
                  name='receiver_firstName'
                  label={labels.receiver_firstName}
                  value={formik?.values?.receiver_firstName}
                  maxLength='20'
                  required
                  error={
                    (formik.touched.receiver_firstName && Boolean(formik.errors.receiver_firstName)) ||
                    getFieldError('receiver_firstName')
                  }
                  onChange={formik.handleChange}
                  onClear={() => formik.setFieldValue('receiver_firstName', '')}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  name='receiver_lastName'
                  label={labels.receiver_lastName}
                  value={formik?.values?.receiver_lastName}
                  maxLength='20'
                  required
                  error={
                    (formik.touched.receiver_lastName && Boolean(formik.errors.receiver_lastName)) ||
                    getFieldError('receiver_lastName')
                  }
                  onChange={formik.handleChange}
                  onClear={() => formik.setFieldValue('receiver_lastName', '')}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  name='receiver_ttNo'
                  label={labels.receiver_ttNo}
                  value={formik?.values?.receiver_ttNo}
                  maxLength='20'
                  required
                  error={
                    (formik.touched.receiver_ttNo && Boolean(formik.errors.receiver_ttNo)) ||
                    getFieldError('receiver_ttNo')
                  }
                  onChange={formik.handleChange}
                  onClear={() => formik.setFieldValue('receiver_ttNo', '')}
                />
              </Grid>
            </Grid>
          </FieldSet>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}
