import { Checkbox, FormControlLabel, Grid } from '@mui/material'
import { useFormik } from 'formik'
import * as yup from 'yup'
import { useEffect, useContext, useState } from 'react'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import FormShell from 'src/components/Shared/FormShell'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { SystemRepository } from 'src/repositories/SystemRepository'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { DataSets } from 'src/resources/DataSets'
import { formatDateFromApi } from 'src/lib/date-helper'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'
import { CashBankRepository } from 'src/repositories/CashBankRepository'
import { RequestsContext } from 'src/providers/RequestsContext'
import toast from 'react-hot-toast'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import FormGrid from 'src/components/form/layout/FormGrid'
import { useForm } from 'src/hooks/form'

export default function BenificiaryBank({ clientId, dispersalType, beneficiaryId, corId, countryId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const [maxAccess, setMaxAccess] = useState(null)

  useEffect(() => {
    ;(async function () {
      if (countryId || corId || dispersalType) {
        const qryCCL = await getRequest({
          extension: RemittanceSettingsRepository.CorrespondentControl.qry,
          parameters: `_countryId=${countryId}&_corId=${corId}&_resourceId=${ResourceIds.BeneficiaryBank}`
        })

        const controls = { controls: qryCCL.list }
        const maxAccess = { record: controls }
        setMaxAccess(maxAccess)
      }
      if (beneficiaryId) {
        const RTBEB = await getRequest({
          extension: RemittanceOutwardsRepository.BeneficiaryBank.get,
          parameters: `_clientId=${clientId}&_beneficiaryId=${beneficiaryId}`
        })

        const RTBEN = await getRequest({
          extension: RemittanceOutwardsRepository.Beneficiary.get,
          parameters: `_clientId=${clientId}&_beneficiaryId=${beneficiaryId}`
        })

        const obj = {
          //RTBEN
          clientId: clientId,
          beneficiaryId: beneficiaryId,
          recordId: clientId * 1000 + beneficiaryId,
          name: RTBEN?.record?.name,
          dispersalType: dispersalType,
          nationalityId: RTBEN?.record?.nationalityId,
          isBlocked: RTBEN?.record?.isBlocked,
          stoppedDate: RTBEN?.record?.stoppedDate && formatDateFromApi(RTBEN.record.stoppedDate),
          stoppedReason: RTBEN?.record?.stoppedReason,
          gender: RTBEN?.record?.gender,
          addressLine1: RTBEN?.record?.addressLine1,
          addressLine2: RTBEN?.record?.addressLine2,

          //RTBEB
          accountRef: RTBEB?.record?.accountRef,
          accountType: RTBEB?.record?.accountType,
          IBAN: RTBEB?.record?.IBAN,
          bankName: RTBEB?.record?.bankName,
          routingNo: RTBEB?.record?.routingNo,
          swiftCode: RTBEB?.record?.swiftCode,
          branchCode: RTBEB?.record?.branchCode,
          branchName: RTBEB?.record?.branchName,
          nationalityId: RTBEB?.record?.nationalityId,
          stateId: RTBEB?.record?.stateId,
          cityId: RTBEB?.record?.cityId,
          zipcode: RTBEB?.record?.zipcode,
          remarks: RTBEB?.record?.remarks
        }

        formik.setValues(obj)
      }
    })()
  }, [])

  const [initialValues, setInitialData] = useState({
    //RTBEN
    clientId: clientId || '',
    beneficiaryId: 0,
    recordId: '',
    name: '',
    dispersalType: dispersalType || '',
    nationalityId: null,
    isBlocked: false,
    stoppedDate: null,
    stoppedReason: '',
    gender: null,
    addressLine1: '',
    addressLine2: '',

    //RTBEB
    accountRef: '',
    accountType: '',
    IBAN: '',
    bankName: '',
    routingNo: '',
    swiftCode: '',
    branchCode: '',
    branchName: '',
    nationalityId: '',
    stateId: '',
    cityId: '',
    zipcode: '',
    remarks: ''
  })

  const { formik } = useForm({
    maxAccess,
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
        nationalityId: values.nationalityId,
        addressLine1: values.addressLine1,
        addressLine2: values.addressLine2
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

  const { labels: _labels } = useResourceQuery({
    datasetId: ResourceIds.BeneficiaryBank
  })

  return (
    <FormShell
      resourceId={ResourceIds.BeneficiaryBank}
      form={formik}
      editMode={formik?.values?.beneficiaryId}
      height={480}
      maxAccess={maxAccess}
    >
      <Grid container>
        {/* First Column */}
        <Grid container rowGap={2} xs={6} sx={{ px: 2, pt: 2 }}>
          <FormGrid hideonempty xs={12}>
            <CustomTextField
              name='name'
              label={_labels.name}
              value={formik.values.name}
              required
              onChange={formik.handleChange}
              maxLength='50'
              error={formik.touched.name && Boolean(formik.errors.name)}
              maxAccess={maxAccess}
            />
          </FormGrid>
          <FormGrid hideonempty xs={12}>
            <CustomTextField
              name='accountRef'
              label={_labels.accountRef}
              value={formik.values.accountRef}
              onChange={formik.handleChange}
              maxLength='50'
              error={formik.touched.accountRef && Boolean(formik.errors.accountRef)}
              maxAccess={maxAccess}
            />
          </FormGrid>

          <FormGrid hideonempty xs={12}>
            <CustomTextField
              name='branchName'
              label={_labels.branchName}
              rows={3}
              value={formik.values.branchName}
              onChange={formik.handleChange}
              maxLength='100'
              error={formik.touched.branchName && Boolean(formik.errors.branchName)}
              maxAccess={maxAccess}
            />
          </FormGrid>
          <FormGrid hideonempty xs={12}>
            <CustomTextField
              name='branchCode'
              label={_labels.branchCode}
              value={formik.values.branchCode}
              onChange={formik.handleChange}
              maxLength='20'
              error={formik.touched.branchCode && Boolean(formik.errors.branchCode)}
              maxAccess={maxAccess}
            />
          </FormGrid>
          <FormGrid hideonempty xs={12}>
            <ResourceComboBox
              datasetId={DataSets.BANK_ACCOUNT_TYPE}
              name='accountType'
              label={_labels.accountType}
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
              maxAccess={maxAccess}
              error={formik.touched.accountType && Boolean(formik.errors.accountType)}
            />
          </FormGrid>
          <FormGrid hideonempty xs={12}>
            <CustomTextArea
              name='addressLine1'
              label={_labels.addressLine1}
              value={formik.values.addressLine1}
              rows={3}
              maxLength='100'
              maxAccess={maxAccess}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('addressLine1', '')}
              error={formik.touched.addressLine1 && Boolean(formik.errors.addressLine1)}
            />
          </FormGrid>
          <FormGrid hideonempty xs={12}>
            <CustomTextArea
              name='addressLine2'
              label={_labels.addressLine2}
              value={formik.values.addressLine2}
              rows={3}
              maxLength='100'
              maxAccess={maxAccess}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('addressLine2', '')}
              error={formik.touched.addressLine2 && Boolean(formik.errors.addressLine2)}
            />
          </FormGrid>
          <FormGrid hideonempty xs={12}>
            <ResourceComboBox
              endpointId={SystemRepository.Country.qry}
              name='nationalityId'
              label={_labels.country}
              valueField='recordId'
              displayField={['reference', 'name', 'flName']}
              displayFieldWidth={1.25}
              columnsInDropDown={[
                { key: 'reference', value: 'Reference' },
                { key: 'name', value: 'Name' },
                { key: 'flName', value: 'FL Name' }
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
          </FormGrid>
          <FormGrid hideonempty xs={12}>
            <ResourceComboBox
              endpointId={formik.values.nationalityId && SystemRepository.State.qry}
              parameters={formik.values.nationalityId && `_countryId=${formik.values.nationalityId}`}
              name='stateId'
              label={_labels.state}
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
          </FormGrid>
          <FormGrid hideonempty xs={12}>
            <ResourceLookup
              endpointId={SystemRepository.City.snapshot}
              parameters={{
                _countryId: formik.values.nationalityId,
                _stateId: formik.values.stateId ?? 0
              }}
              valueField='name'
              displayField='name'
              name='city'
              label={_labels.city}
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
          </FormGrid>
        </Grid>
        {/* Second Column */}
        <Grid container rowGap={2} xs={6} sx={{ px: 2, pt: 2 }}>
          <FormGrid hideonempty xs={12}>
            <ResourceComboBox
              datasetId={DataSets.GENDER}
              name='gender'
              label={_labels.gender}
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
              maxAccess={maxAccess}
              error={formik.touched.gender && Boolean(formik.errors.gender)}
              helperText={formik.touched.gender && formik.errors.gender}
            />
          </FormGrid>
          <FormGrid hideonempty xs={12}>
            <CustomTextField
              name='zipcode'
              label={_labels.zipCode}
              value={formik.values.zipcode}
              maxLength='30'
              onChange={formik.handleChange}
              error={formik.touched.zipcode && Boolean(formik.errors.zipcode)}
              maxAccess={maxAccess}
            />
          </FormGrid>
          <FormGrid hideonempty xs={12}>
            <CustomTextField
              name='swiftCode'
              label={_labels.ifscSwift}
              maxLength='30'
              value={formik.values.swiftCode}
              onChange={formik.handleChange}
              error={formik.touched.swiftCode && Boolean(formik.errors.swiftCode)}
              maxAccess={maxAccess}
            />
          </FormGrid>
          <FormGrid hideonempty xs={12}>
            <CustomTextField
              name='routingNo'
              label={_labels.routingNo}
              maxLength='50'
              value={formik.values.routingNo}
              onChange={formik.handleChange}
              error={formik.touched.routingNo && Boolean(formik.errors.routingNo)}
              maxAccess={maxAccess}
            />
          </FormGrid>
          <FormGrid hideonempty xs={12}>
            <CustomTextField
              name='IBAN'
              label={_labels.iban}
              maxLength='50'
              value={formik.values.IBAN}
              onChange={formik.handleChange}
              error={formik.touched.IBAN && Boolean(formik.errors.IBAN)}
              maxAccess={maxAccess}
            />
          </FormGrid>
          <FormGrid hideonempty xs={12}>
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
              label={_labels.isBlocked}
            />
          </FormGrid>
          <FormGrid hideonempty xs={12}>
            <CustomTextArea
              name='remarks'
              label={_labels.remarks}
              value={formik.values.remarks}
              rows={3}
              maxLength='150'
              maxAccess={maxAccess}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('remarks', '')}
              error={formik.touched.remarks && Boolean(formik.errors.remarks)}
            />
          </FormGrid>
          <FormGrid hideonempty xs={12}>
            <CustomDatePicker
              name='stoppedDate'
              label={_labels.stoppedDate}
              value={formik.values?.stoppedDate}
              readOnly
              error={formik.touched.stoppedDate && Boolean(formik.errors.stoppedDate)}
              maxAccess={maxAccess}
            />
          </FormGrid>
          <FormGrid hideonempty xs={12}>
            <CustomTextArea
              name='stoppedReason'
              label={_labels.stoppedReason}
              readOnly
              value={formik.values.stoppedReason}
              rows={3}
              maxAccess={maxAccess}
              error={formik.touched.stoppedReason && Boolean(formik.errors.stoppedReason)}
            />
          </FormGrid>
        </Grid>
      </Grid>
    </FormShell>
  )
}
