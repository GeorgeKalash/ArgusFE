import { Checkbox, FormControlLabel, Grid } from '@mui/material'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useContext, useEffect } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { useForm } from 'src/hooks/form'
import { CashBankRepository } from 'src/repositories/CashBankRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'

const BankBranchesForm = ({ labels, maxAccess, recordId }) => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: CashBankRepository.BankBranches.qry
  })

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      recordId: recordId || null,
      name: '',
      bankId: '',
      swiftCode: '',
      addressLine1: '',
      addressLine2: '',
      addressLine3: '',
      addressLine4: '',

      ////////
      countryId: '',
      contact1: '',
      contact2: '',
      remarks: '',
      isInactive: false
    },
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      name: yup.string().required(' ')
    }),
    onSubmit: async obj => {
      const recordId = obj.recordId

      const response = await postRequest({
        extension: CashBankRepository.BankBranches.set,
        record: JSON.stringify(obj)
      })

      if (!recordId) {
        toast.success(platformLabels.Added)
        formik.setValues({
          ...obj,
          recordId: response.recordId
        })
      } else toast.success(platformLabels.Edited)

      invalidate()
    }
  })

  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      try {
        if (recordId) {
          const res = await getRequest({
            extension: CashBankRepository.BankBranches.get,
            parameters: `_recordId=${recordId}`
          })

          formik.setValues(res.record)
        }
      } catch (exception) {}
    })()
  }, [])

  return (
    <FormShell form={formik} resourceId={ResourceIds.BankBranches} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grid container gap={2}>
          <Grow>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <CustomTextField
                  name='name'
                  label={labels.name}
                  value={formik.values.name}
                  required
                  maxLength='50'
                  maxAccess={maxAccess}
                  onChange={formik.handleChange}
                  onClear={() => formik.setFieldValue('name', '')}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                />
              </Grid>
              <Grid item xs={12}>
                <ResourceComboBox
                  endpointId={CashBankRepository.CbBank.qry}
                  name='bankId'
                  label={labels.bank}
                  valueField='recordId'
                  displayField='name'
                  values={formik.values}
                  required
                  maxAccess={maxAccess}
                  onChange={(event, newValue) => {
                    formik && formik.setFieldValue('bankId', newValue?.recordId)
                  }}
                  error={formik.touched.bankId && Boolean(formik.errors.bankId)}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  name='swiftCode'
                  label={labels.swiftCode}
                  value={formik.values.swiftCode}
                  maxLength='20'
                  maxAccess={maxAccess}
                  onChange={formik.handleChange}
                  onClear={() => formik.setFieldValue('swiftCode', '')}
                  error={formik.touched.swiftCode && Boolean(formik.errors.swiftCode)}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  name='addressLine1'
                  label={labels.adressLine1}
                  value={formik.values.addressLine1}
                  maxLength='100'
                  maxAccess={maxAccess}
                  onChange={formik.handleChange}
                  onClear={() => formik.setFieldValue('addressLine1', '')}
                  error={formik.touched.addressLine1 && Boolean(formik.errors.addressLine1)}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  name='addressLine2'
                  label={labels.adressLine2}
                  value={formik.values.addressLine2}
                  maxLength='100'
                  maxAccess={maxAccess}
                  onChange={formik.handleChange}
                  onClear={() => formik.setFieldValue('addressLine2', '')}
                  error={formik.touched.addressLine2 && Boolean(formik.errors.addressLine2)}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  name='addressLine3'
                  label={labels.adressLine3}
                  value={formik.values.addressLine3}
                  maxLength='100'
                  maxAccess={maxAccess}
                  onChange={formik.handleChange}
                  onClear={() => formik.setFieldValue('addressLine3', '')}
                  error={formik.touched.addressLine3 && Boolean(formik.errors.addressLine3)}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  name='addressLine4'
                  label={labels.adressLine4}
                  value={formik.values.addressLine4}
                  maxLength='100'
                  maxAccess={maxAccess}
                  onChange={formik.handleChange}
                  onClear={() => formik.setFieldValue('addressLine4', '')}
                  error={formik.touched.addressLine4 && Boolean(formik.errors.addressLine4)}
                />
              </Grid>
            </Grid>
          </Grow>
          <Grow>
            <Grid container gap={2}>
              <Grid item xs={12}>
                <ResourceComboBox
                  endpointId={SystemRepository.Country.qry}
                  name='countryId'
                  label={labels.country}
                  columnsInDropDown={[
                    { key: 'reference', value: 'Reference' },
                    { key: 'name', value: 'Name' }
                  ]}
                  values={formik.values}
                  valueField='recordId'
                  displayField='name'
                  required
                  maxAccess={maxAccess}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('countryId', newValue?.recordId)
                  }}
                  error={formik.touched.countryId && Boolean(formik.errors.countryId)}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  name='contact1'
                  type='numeric'
                  label={labels.contact1}
                  value={formik.values.contact1}
                  maxLength='100'
                  maxAccess={maxAccess}
                  onChange={formik.handleChange}
                  onClear={() => formik.setFieldValue('contact1', '')}
                  error={formik.touched.contact1 && Boolean(formik.errors.contact1)}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  name='contact2'
                  type='numeric'
                  label={labels.contact2}
                  value={formik.values.contact2}
                  maxLength='100'
                  maxAccess={maxAccess}
                  onChange={formik.handleChange}
                  onClear={() => formik.setFieldValue('contact2', '')}
                  error={formik.touched.contact2 && Boolean(formik.errors.contact2)}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextArea
                  name='remarks'
                  label={labels.remarks}
                  value={formik.values.remarks}
                  maxLength='100'
                  rows={2}
                  maxAccess={maxAccess}
                  onChange={formik.handleChange}
                  onClear={() => formik.setFieldValue('remarks', '')}
                  error={formik.touched.remarks && Boolean(formik.errors.remarks)}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name='isInactive'
                      maxAccess={maxAccess}
                      checked={formik.values?.isInactive}
                      onChange={formik.handleChange}
                    />
                  }
                  label={labels.isInactive}
                />
              </Grid>
            </Grid>
          </Grow>
        </Grid>
      </VertLayout>
    </FormShell>
  )
}

export default BankBranchesForm
