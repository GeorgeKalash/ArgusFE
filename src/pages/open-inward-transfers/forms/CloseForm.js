import { Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import FieldSet from 'src/components/Shared/FieldSet'
import FormShell from 'src/components/Shared/FormShell'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { useError } from 'src/error'
import { useForm } from 'src/hooks/form'
import { useInvalidate } from 'src/hooks/resource'
import { ControlContext } from 'src/providers/ControlContext'
import { RequestsContext } from 'src/providers/RequestsContext'
import { CashBankRepository } from 'src/repositories/CashBankRepository'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import * as yup from 'yup'

export default function CloseForm({ form, labels, access, window }) {
  const { stack: stackError } = useError()
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels, defaultsData } = useContext(ControlContext)
  const [mismatchedFields, setMismatchedFields] = useState([])
  form.receiver_bankId = 2

  const invalidate = useInvalidate({
    endpointId: RemittanceOutwardsRepository.InwardsTransfer.open
  })

  const { formik } = useForm({
    initialValues: {
      recordId: form?.recordId,
      corId: null,
      corRef: '',
      corName: '',
      amount: null,
      receiver_firstName: '',
      receiver_lastName: '',
      trackingNo: '',
      countryId: '',
      receiver_bankId: '',
      receiver_accountNo: ''
    },
    access,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      corId: yup.string().required(),
      amount: yup.number().required(),
      receiver_firstName: yup.string().required(),
      receiver_lastName: yup.string().required(),
      trackingNo: yup.string().test('is-trackingNo-required', 'Tracking number is required', function (value) {
        if (form.trackingNo) {
          return !!value
        }

        return true
      }),
      receiver_accountNo: yup
        .string()
        .test('is-receiver_accountNo-required', 'receiver_accountNo is required', function (value) {
          if (form.dispersalMode == 2) {
            return !!value
          }

          return true
        }),
      receiver_bankId: yup
        .string()
        .test('is-receiver_bankId-required', 'receiver_bankId is required', function (value) {
          if (form.dispersalMode == 2) {
            return !!value
          }

          return true
        })
    }),
    onSubmit: () => {
      setMismatchedFields([])
      const filteredValues = { ...formik.values }
      delete filteredValues.countryId

      if (form.dispersalMode === 1) {
        delete filteredValues.receiver_bankId
        delete filteredValues.receiver_accountNo
      }

      const mismatches = Object.keys(filteredValues).filter(key => filteredValues[key] != form[key])

      if (mismatches.length === 0) {
        onClose()
      } else {
        setMismatchedFields(mismatches)
        stackError({ message: platformLabels.fieldsDoNotMatch })
      }
    }
  })

  const onClose = async () => {
    const copy = { ...form }
    copy.baseAmount = copy?.baseAmount === '' ? copy?.amount : copy?.baseAmount
    copy.rateCalcMethod = copy?.rateCalcMethod === '' ? 1 : copy?.rateCalcMethod

    const res = await postRequest({
      extension: RemittanceOutwardsRepository.InwardsTransfer.close,
      record: JSON.stringify(copy)
    })

    toast.success(platformLabels.Closed)

    const res2 = await getInwards(res.recordId)
    if (res2.record.status == 4) {
      await postIW(res2.record)
    }

    invalidate()
    window.close()
  }

  async function getInwards(recordId) {
    return await getRequest({
      extension: RemittanceOutwardsRepository.InwardsTransfer.get,
      parameters: `_recordId=${recordId}`
    })
  }

  async function postIW(obj) {
    await postRequest({
      extension: RemittanceOutwardsRepository.InwardsTransfer.post,
      record: JSON.stringify(obj)
    })
  }
  const getFieldError = fieldName => mismatchedFields.includes(fieldName)

  useEffect(() => {
    const defaultCountry = defaultsData?.list?.find(({ key }) => key === 'countryId')

    formik.setFieldValue('countryId', parseInt(defaultCountry.value))
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.InwardTransfer}
      form={formik}
      isInfo={false}
      isSavedClear={false}
      isCleared={false}
    >
      <VertLayout>
        <Fixed>
          <FieldSet title={labels.header} sx={{ flex: 0 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <ResourceLookup
                  endpointId={RemittanceSettingsRepository.Correspondent.snapshot}
                  valueField='reference'
                  displayField='name'
                  name='corId'
                  label={labels.correspondent}
                  form={formik}
                  required
                  displayFieldWidth={2}
                  valueShow='corRef'
                  secondValueShow='corName'
                  access={access}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('corId', newValue ? newValue.recordId : '')
                    formik.setFieldValue('corName', newValue ? newValue.name : '')
                    formik.setFieldValue('corRef', newValue ? newValue.reference : '')
                  }}
                  error={(formik.touched.corId && Boolean(formik.errors.corId)) || getFieldError('corId')}
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
              <Grid item xs={12}>
                <CustomTextField
                  name='trackingNo'
                  label={labels.trackingNo}
                  value={formik?.values?.trackingNo}
                  maxLength='30'
                  required={form?.trackingNo}
                  onChange={e => formik.setFieldValue('trackingNo', e.target.value)}
                  onClear={() => formik.setFieldValue('trackingNo', '')}
                  error={
                    (formik.touched.trackingNo && Boolean(formik.errors.trackingNo)) || getFieldError('trackingNo')
                  }
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
              {form.dispersalMode == 2 && (
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={formik.values.countryId && CashBankRepository.CbBank.qry2}
                    parameters={`_countryId=${formik.values.countryId}`}
                    name='receiver_bankId'
                    label={labels.receiver_bank}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik.values}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('receiver_bankId', newValue?.recordId)
                    }}
                    required={form.dispersalMode == 2}
                    error={
                      (formik.touched.receiver_bankId && Boolean(formik.errors.receiver_bankId)) ||
                      getFieldError('receiver_bankId')
                    }
                  />
                </Grid>
              )}
              {form.dispersalMode == 2 && (
                <Grid item xs={12}>
                  <CustomTextField
                    name='receiver_accountNo'
                    label={labels.receiver_accountNo}
                    value={formik?.values?.receiver_accountNo}
                    maxLength='30'
                    required={form.dispersalMode == 2}
                    error={
                      (formik.touched.receiver_accountNo && Boolean(formik.errors.receiver_accountNo)) ||
                      getFieldError('receiver_accountNo')
                    }
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('receiver_accountNo', '')}
                  />
                </Grid>
              )}
            </Grid>
          </FieldSet>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}
