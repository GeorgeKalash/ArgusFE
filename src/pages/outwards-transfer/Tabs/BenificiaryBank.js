import { Checkbox, FormControlLabel, Grid } from '@mui/material'
import { useFormik } from 'formik'
import * as yup from 'yup'
import { useContext, useState } from 'react'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import FormShell from 'src/components/Shared/FormShell'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { SystemRepository } from 'src/repositories/SystemRepository'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { DataSets } from 'src/resources/DataSets'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'
import { CashBankRepository } from 'src/repositories/CashBankRepository'
import { RequestsContext } from 'src/providers/RequestsContext'

export default function BenificiaryBank({ maxAccess, clientId, dispersalType }) {
  const { getRequest, postRequest } = useContext(RequestsContext)

  const [initialValues, setInitialData] = useState({
    //RTBEN
    clientId: clientId || '',
    beneficiaryId: '',
    name: '',
    dispersalType: dispersalType || '',
    nationalityId: null,
    isBlocked: false,
    stoppedDate: null,
    stoppedReason: '',
    gender: null,

    //RTBEB
    accountRef: '',
    accountType: '',
    IBAN: '',
    bankName: '',
    routingNo: '',
    swiftCode: '',
    branchCode: '',
    branchName: '',
    addressLine1: '',
    addressLine2: '',
    nationalityId: '',
    stateId: '',
    cityId: '',
    zipcode: '',
    remarks: ''
  })

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      name: yup.string().required(' ')
    }),
    onSubmit: async values => {
      const header = {
        clientId: values.clientId,
        beneficiaryId: values.beneficiaryId,
        gender: values.gender,
        name: values.name,
        dispersalType: values.dispersalType,
        isBlocked: values.isBlocked,
        stoppedDate: values.stoppedDate,
        stoppedReason: values.stoppedReason,
        nationalityId: values.nationalityId
      }

      const bankInfo = {
        clientId: values.clientId,
        beneficiaryId: values.beneficiaryId,
        accountRef: values.accountRef,
        accountType: values.accountType,
        IBAN: values.IBAN,
        bankName: values.name,
        routingNo: values.routingNo,
        swiftCode: values.swiftCode,
        branchCode: values.branchCode,
        branchName: values.branchName,
        addressLine1: values.addressLine1,
        addressLine2: values.addressLine2,
        cityId: values.cityId,
        stateId: values.stateId,
        zipcode: values.zipcode
      }
      const data = { header: header, beneficiaryBank: bankInfo }

      const res = await postRequest({
        extension: RemittanceOutwardsRepository.BeneficiaryBank.set,
        record: JSON.stringify(data)
      })
      if (res.recordId) {
        toast.success('Record Updated Successfully')
      }
    }
  })

  return (
    <FormShell //resourceId={ResourceIds.Currencies}
      form={formik}
      height={480} // maxAccess={maxAccess}
    >
      <Grid container>
        {/* First Column */}
        <Grid container rowGap={2} xs={6} sx={{ px: 2, pt: 2 }}>
          <Grid item xs={12}>
            <CustomTextField
              name='name'
              label='Name'
              value={formik.values.name}
              required
              onChange={formik.handleChange}
              maxLength='50'
              error={formik.touched.name && Boolean(formik.errors.name)}
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceLookup
              endpointId={CashBankRepository.CashAccount.snapshot}
              parameters={{
                _type: 1
              }}
              valueField='accountNo'
              displayField='name'
              name='accountId'
              label='Account Ref'
              form={formik}
              valueShow='accountRef'
              secondDisplayField={false}
              onChange={(event, newValue) => {
                if (newValue) {
                  formik.setFieldValue('accountId', newValue?.recordId)
                  formik.setFieldValue('accountRef', newValue?.accountNo)
                } else {
                  formik.setFieldValue('accountId', null)
                  formik.setFieldValue('accountRef', null)
                }
              }}
              errorCheck={'accountId'}
            />
          </Grid>

          <Grid item xs={12}>
            <CustomTextField
              name='branchName'
              label='Branch Name'
              rows={3}
              value={formik.values.branchName}
              onChange={formik.handleChange}
              maxLength='100'
              error={formik.touched.branchName && Boolean(formik.errors.branchName)}
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='branchCode'
              label='Branch Code'
              value={formik.values.branchCode}
              onChange={formik.handleChange}
              maxLength='20'
              error={formik.touched.branchCode && Boolean(formik.errors.branchCode)}
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              datasetId={DataSets.BANK_ACCOUNT_TYPE}
              name='accountType'
              label='account Type'
              valueField='key'
              displayField='value'
              values={formik.values}
              onChange={(event, newValue) => {
                if (newValue) {
                  formik.setFieldValue('accountType', newValue?.key)
                } else {
                  formik.setFieldValue('accountType', '')
                }
              }}
              error={formik.touched.accountType && Boolean(formik.errors.accountType)}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextArea
              name='addressLine1'
              label='Address 1'
              value={formik.values.addressLine1}
              rows={3}
              maxLength='100'
              maxAccess={maxAccess}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('addressLine1', '')}
              error={formik.touched.addressLine1 && Boolean(formik.errors.addressLine1)}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextArea
              name='addressLine2'
              label='Address 2'
              value={formik.values.addressLine2}
              rows={3}
              maxLength='100'
              maxAccess={maxAccess}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('addressLine2', '')}
              error={formik.touched.addressLine2 && Boolean(formik.errors.addressLine2)}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={SystemRepository.Country.qry}
              name='nationalityId'
              label='Country'
              valueField='recordId'
              displayField={['reference', 'name']}
              displayFieldWidth={2}
              columnsInDropDown={[
                { key: 'reference', value: 'Reference' },
                { key: 'name', value: 'Name' }
              ]}
              maxAccess={maxAccess}
              values={formik.values}
              onChange={(event, newValue) => {
                formik.setFieldValue('stateId', null)
                formik.setFieldValue('cityId', '')
                formik.setFieldValue('city', '')
                if (newValue) {
                  formik.setFieldValue('nationalityId', newValue?.recordId)
                } else {
                  formik.setFieldValue('nationalityId', '')
                }
              }}
              error={formik.touched.nationalityId && Boolean(formik.errors.nationalityId)}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={formik.values.nationalityId && SystemRepository.State.qry}
              parameters={formik.values.nationalityId && `_countryId=${formik.values.nationalityId}`}
              name='stateId'
              label='State'
              valueField='recordId'
              displayField='name'
              readOnly={!formik.values.nationalityId}
              values={formik.values}
              onChange={(event, newValue) => {
                formik.setFieldValue('stateId', newValue?.recordId)
                formik.setFieldValue('cityId', '')
                formik.setFieldValue('city', '')
              }}
              error={formik.touched.stateId && Boolean(formik.errors.stateId)}
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceLookup
              endpointId={SystemRepository.City.snapshot}
              parameters={{
                _countryId: formik.values.nationalityId,
                _stateId: formik.values.stateId ?? 0
              }}
              valueField='name'
              displayField='name'
              name='city'
              label='City'
              readOnly={!formik.values.stateId}
              form={formik}
              maxAccess={maxAccess}
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
        </Grid>
        {/* Second Column */}
        <Grid container rowGap={2} xs={6} sx={{ px: 2, pt: 2 }}>
          <Grid item xs={12}>
            <ResourceComboBox
              datasetId={DataSets.GENDER}
              name='gender'
              label='Gender'
              valueField='key'
              displayField='value'
              values={formik.values}
              onChange={(event, newValue) => {
                if (newValue) {
                  formik.setFieldValue('gender', newValue?.key)
                } else {
                  formik.setFieldValue('gender', '')
                }
              }}
              error={formik.touched.gender && Boolean(formik.errors.gender)}
              helperText={formik.touched.gender && formik.errors.gender}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='zipcode'
              label='Zip Code'
              value={formik.values.zipcode}
              maxLength='30'
              onChange={formik.handleChange}
              error={formik.touched.zipcode && Boolean(formik.errors.zipcode)}
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='swiftCode'
              label='IFSC / swift code'
              maxLength='30'
              value={formik.values.swiftCode}
              onChange={formik.handleChange}
              error={formik.touched.swiftCode && Boolean(formik.errors.swiftCode)}
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='routingNo'
              label='Routing Number'
              maxLength='50'
              value={formik.values.routingNo}
              onChange={formik.handleChange}
              error={formik.touched.routingNo && Boolean(formik.errors.routingNo)}
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='IBAN'
              label='IBAN'
              maxLength='50'
              value={formik.values.IBAN}
              onChange={formik.handleChange}
              error={formik.touched.IBAN && Boolean(formik.errors.IBAN)}
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  name='isBlocked'
                  readOnly
                  disabled={true}
                  checked={formik.values?.isBlocked}
                  onChange={formik.handleChange}
                  maxAccess={maxAccess}
                />
              }
              label='is Blocked'
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextArea
              name='remarks'
              label='Remarks'
              value={formik.values.remarks}
              rows={3}
              maxLength='150'
              maxAccess={maxAccess}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('remarks', '')}
              error={formik.touched.remarks && Boolean(formik.errors.remarks)}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomDatePicker
              name='stoppedDate'
              label={'stopped Date'}
              value={formik.values?.stoppedDate}
              readOnly
              error={formik.touched.stoppedDate && Boolean(formik.errors.stoppedDate)}
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextArea
              name='stoppedReason'
              label='Stop Reason'
              readOnly
              value={formik.values.stoppedReason}
              rows={3}
              maxAccess={maxAccess}
              error={formik.touched.stoppedReason && Boolean(formik.errors.stoppedReason)}
            />
          </Grid>
        </Grid>
      </Grid>
    </FormShell>
  )
}
