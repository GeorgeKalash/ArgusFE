import { Checkbox, FormControlLabel, Grid } from '@mui/material'
import { useFormik } from 'formik'
import * as yup from 'yup'
import { useState } from 'react'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import FormShell from 'src/components/Shared/FormShell'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { SystemRepository } from 'src/repositories/SystemRepository'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'

export default function BenificiaryBank() {
  const [initialValues, setInitialData] = useState({
    recordId: null,
    name: '',
    serviceType: '',
    branchName: '',
    address1: '',
    address2: '',
    countryId: '',
    stateId: '',
    cityId: '',
    city: '',
    zipCode: '',
    drBank: '',
    remarks: '',
    ifsc: '',
    routingNumber: '',
    iban: '',
    isBlocked: false,
    stopDate: '',
    stopReason: ''
  })

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      name: yup.string().required('This field is required'),
      serviceType: yup.string().required('This field is required'),
      branchName: yup.string().required('This field is required'),
      countryId: yup.string().required('This field is required'),
      drBank: yup.string().required('This field is required'),
      remarks: yup.string().required('This field is required'),
      ifsc: yup.string().required('This field is required'),
      isBlocked: yup.string().required('This field is required')
    }),
    onSubmit: values => {}
  })

  return (
    <FormShell //resourceId={ResourceIds.Currencies}
      form={formik}
      height={480} // maxAccess={maxAccess}
    >
      <Grid container>
        {/* First Column */}
        <Grid container rowGap={2} xs={6} sx={{ px: 2 }}>
          <Grid item xs={12}>
            <CustomTextField
              name='name'
              label='Name'
              value={formik.values.name}
              required
              onChange={formik.handleChange}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name} // maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox //endpointId={SystemRepository.Plant.qry}
              name='serviceType'
              label='serviceType'
              required
              valueField='recordId'
              values={formik.values}
              onChange={(event, newValue) => {
                formik.setFieldValue('serviceType', newValue?.recordId)
              }}
              error={formik.touched.serviceType && Boolean(formik.errors.serviceType)}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='branchName'
              label='Branch Name'
              value={formik.values.branchName}
              required
              onChange={formik.handleChange}
              error={formik.touched.branchName && Boolean(formik.errors.branchName)}
              helperText={formik.touched.branchName && formik.errors.branchName} // maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextArea
              name='address1'
              label='Address 1'
              value={formik.values.address1}
              rows={3}
              maxLength='150' //maxAccess={maxAccess}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('address1', '')}
              error={formik.touched.address1 && Boolean(formik.errors.address1)}
              helperText={formik.touched.address1 && formik.errors.address1}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextArea
              name='address2'
              label='Address 2'
              value={formik.values.address2}
              rows={3}
              maxLength='150' //maxAccess={maxAccess}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('address2', '')}
              error={formik.touched.address2 && Boolean(formik.errors.address2)}
              helperText={formik.touched.address2 && formik.errors.address2}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={SystemRepository.Country.qry}
              name='countryId'
              label='Country'
              valueField='recordId'
              displayField={['reference', 'name']}
              displayFieldWidth={2}
              columnsInDropDown={[
                { key: 'reference', value: 'Reference' },
                { key: 'name', value: 'Name' }
              ]}
              values={formik.values}
              required
              onChange={(event, newValue) => {
                formik.setFieldValue('stateId', null)
                formik.setFieldValue('cityId', '')
                formik.setFieldValue('city', '')
                if (newValue) {
                  formik.setFieldValue('countryId', newValue?.recordId)
                } else {
                  formik.setFieldValue('countryId', '')
                }
              }}
              error={formik.touched.countryId && Boolean(formik.errors.countryId)}
              helperText={formik.touched.countryId && formik.errors.countryId}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={formik.values.countryId && SystemRepository.State.qry}
              parameters={formik.values.countryId && `_countryId=${formik.values.countryId}`}
              name='stateId'
              label='State'
              valueField='recordId'
              displayField='name'
              readOnly={!formik.values.countryId}
              values={formik.values}
              onChange={(event, newValue) => {
                formik.setFieldValue('stateId', newValue?.recordId)
                formik.setFieldValue('cityId', '')
                formik.setFieldValue('city', '')
              }}
              error={formik.touched.stateId && Boolean(formik.errors.stateId)}
              helperText={formik.touched.stateId && formik.errors.stateId}

              // maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceLookup
              endpointId={SystemRepository.City.snapshot}
              parameters={{
                _countryId: formik.values.countryId,
                _stateId: formik.values.stateId ?? 0
              }}
              valueField='name'
              displayField='name'
              name='city'
              label='City'
              readOnly={!formik.values.stateId}
              form={formik}
              secondDisplayField={false}
              onChange={(event, newValue) => {
                if (newValue) {
                  formik.setFieldValue('cityId', newValue?.recordId)
                  formik.setFieldValue('city', newValue?.name)
                } else {
                  formik.setFieldValue('cityId', '')
                  formik.setFieldValue('city', '')
                }
                formik.setFieldValue('cityDistrictId', '')
                formik.setFieldValue('cityDistrict', '')
              }}
              errorCheck={'cityId'}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='zipCode'
              label='Zip Code'
              value={formik.values.zipCode}
              onChange={formik.handleChange}
              error={formik.touched.zipCode && Boolean(formik.errors.zipCode)}
              helperText={formik.touched.zipCode && formik.errors.zipCode} // maxAccess={maxAccess}
            />
          </Grid>
        </Grid>
        {/* Second Column */}
        <Grid container rowGap={2} xs={6} sx={{ px: 2 }}>
          <Grid item xs={12}>
            <CustomTextField
              name='drBank'
              label='DR Bank'
              value={formik.values.drBank}
              required
              onChange={formik.handleChange}
              error={formik.touched.branchNadrBankme && Boolean(formik.errors.drBank)}
              helperText={formik.touched.drBank && formik.errors.drBank} // maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='drBranch'
              label='DR Branch'
              value={formik.values.drBranch}
              required
              onChange={formik.handleChange}
              error={formik.touched.drBranch && Boolean(formik.errors.drBranch)}
              helperText={formik.touched.drBranch && formik.errors.drBranch} // maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextArea
              name='remarks'
              label='Remarks'
              value={formik.values.remarks}
              rows={3}
              maxLength='150' //maxAccess={maxAccess}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('remarks', '')}
              error={formik.touched.remarks && Boolean(formik.errors.remarks)}
              helperText={formik.touched.remarks && formik.errors.remarks}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='ifsc'
              label='IFSC'
              value={formik.values.ifsc}
              required
              onChange={formik.handleChange}
              error={formik.touched.ifsc && Boolean(formik.errors.ifsc)}
              helperText={formik.touched.ifsc && formik.errors.ifsc} // maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='routingNumber'
              label='Routing Number'
              value={formik.values.routingNumber}
              numberField={true}
              onChange={formik.handleChange}
              error={formik.touched.routingNumber && Boolean(formik.errors.routingNumber)}
              helperText={formik.touched.routingNumber && formik.errors.routingNumber} // maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='iban'
              label='IBAN'
              value={formik.values.iban}
              onChange={formik.handleChange}
              error={formik.touched.iban && Boolean(formik.errors.iban)}
              helperText={formik.touched.iban && formik.errors.iban} // maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  name='isBlocked'
                  readOnly
                  checked={formik.values.isBlocked}
                  onChange={formik.handleChange} //maxAccess={maxAccess}
                />
              }
              label='is Blocked'
            />
          </Grid>
          <Grid item xs={7}>
            <CustomDatePicker
              name='stopDate'
              label='Stop Date'
              value={formik.values?.stopDate}
              onChange={formik.setFieldValue}
              onClear={() => formik.setFieldValue('stopDate', '')}
              readOnly
              error={formik.touched.stopDate && Boolean(formik.errors.stopDate)} //maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextArea
              name='stopReason'
              label='Stop Reason'
              readOnly
              value={formik.values.stopReason}
              rows={3}
              maxLength='150' //maxAccess={maxAccess}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('stopReason', '')}
              error={formik.touched.stopReason && Boolean(formik.errors.stopReason)}
              helperText={formik.touched.stopReason && formik.errors.stopReason}
            />
          </Grid>
        </Grid>
      </Grid>
    </FormShell>
  )
}
