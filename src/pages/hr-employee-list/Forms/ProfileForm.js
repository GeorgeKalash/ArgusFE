import { Grid, FormControlLabel, RadioGroup, Radio } from '@mui/material'
import toast from 'react-hot-toast'
import * as yup from 'yup'
import { useContext, useEffect } from 'react'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import FormShell from 'src/components/Shared/FormShell'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { useInvalidate } from 'src/hooks/resource'
import { RequestsContext } from 'src/providers/RequestsContext'
import { FinancialRepository } from 'src/repositories/FinancialRepository'
import { AccessControlRepository } from 'src/repositories/AccessControlRepository'
import { SaleRepository } from 'src/repositories/SaleRepository'
import { DataSets } from 'src/resources/DataSets'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useForm } from 'src/hooks/form'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import CustomCheckBox from 'src/components/Inputs/CustomCheckBox'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'

const ProfileForm = ({ labels, maxAccess, setStore, store }) => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { recordId } = store

  const invalidate = useInvalidate({
    endpointId: FinancialRepository.Account.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      reference: '',
      firstName: '',
      middleName: '',
      familyName: '',
      idRef: '',
      homeMail: '',
      workMail: '',
      mobile: '',
      phone: '',
      civilStatus: null,
      otpId: null,
      birthDate: null,
      religion: null,
      nationalityId: null,
      citizenshipId: null,
      bloodType: null,
      scId: null,
      placeOfBirth: '',
      hireDate: null,
      gender: 2,
      hasSpecialNeeds: false
    },
    maxAccess: maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      reference: yup.string().required(),
      firstName: yup.string().required(),
      familyName: yup.string().required(),
      birthDate: yup.date().required(),
      scId: yup.number().required(),
      hireDate: yup.date().required()
    }),
    onSubmit: async values => {
      const res = await postRequest({
        extension: FinancialRepository.Account.set,
        record: JSON.stringify(values)
      })
      if (!obj.recordId) {
        setStore(prevStore => ({
          ...prevStore,
          recordId: res.recordId
        }))
        formik.setFieldValue('recordId', res.recordId)
      }
      invalidate()
      toast.success(!obj.recordId ? platformLabels.Added : platformLabels.Edited)
    }
  })

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: FinancialRepository.Account.get,
          parameters: `_recordId=${recordId}`
        })
        formik.setValues(res.record)
      }
    })()
  }, [])

  const editMode = !!formik.values.recordId

  const actions = [
    {
      key: 'RecordRemarks',
      condition: true,
      onClick: 'onRecordRemarks',
      disabled: !editMode
    }
  ]

  return (
    <FormShell
      resourceId={ResourceIds.EmployeeFilter}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      previewReport={editMode}
      actions={actions}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <CustomTextField
                    name='reference'
                    label={labels.reference}
                    value={formik.values.reference}
                    required
                    maxAccess={maxAccess}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('reference', '')}
                    error={formik.touched.reference && Boolean(formik.errors.reference)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='firstName'
                    label={labels.firstName}
                    value={formik.values.firstName}
                    maxAccess={maxAccess}
                    required
                    maxLength='10'
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('firstName', '')}
                    error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='middleName'
                    label={labels.middleName}
                    value={formik.values.middleName}
                    maxAccess={maxAccess}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('middleName', '')}
                    error={formik.touched.nmiddleNameame && Boolean(formik.errors.middleName)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='familyName'
                    label={labels.familyName}
                    value={formik.values.familyName}
                    maxAccess={maxAccess}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('familyName', '')}
                    error={formik.touched.familyName && Boolean(formik.errors.familyName)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='idRef'
                    label={labels.idRef}
                    value={formik.values.idRef}
                    maxAccess={maxAccess}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('idRef', '')}
                    error={formik.touched.idRef && Boolean(formik.errors.idRef)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='homeMail'
                    label={labels.homeMail}
                    value={formik.values.homeMail}
                    maxAccess={maxAccess}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('homeMail', '')}
                    error={formik.touched.homeMail && Boolean(formik.errors.homeMail)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='workMail'
                    label={labels.workMail}
                    value={formik.values.workMail}
                    maxAccess={maxAccess}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('workMail', '')}
                    error={formik.touched.workMail && Boolean(formik.errors.workMail)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='mobile'
                    label={labels.mobile}
                    value={formik.values.mobile}
                    maxAccess={maxAccess}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('mobile', '')}
                    error={formik.touched.mobile && Boolean(formik.errors.mobile)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='phone'
                    label={labels.homePhone}
                    value={formik.values.phone}
                    maxAccess={maxAccess}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('phone', '')}
                    error={formik.touched.phone && Boolean(formik.errors.phone)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    name='civilStatus'
                    label={labels.civilStatus}
                    datasetId={DataSets.FI_GROUP_TYPE} // Different KVS
                    required
                    values={formik.values}
                    valueField='key'
                    displayField='value'
                    onChange={(event, newValue) => {
                      formik.setFieldValue('civilStatus', newValue?.key || null)
                    }}
                    error={formik.touched.civilStatus && Boolean(formik.errors.civilStatus)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    name='otpId'
                    label={labels.overtimeProfile}
                    datasetId={DataSets.FI_GROUP_TYPE} // Different KVS
                    required
                    values={formik.values}
                    valueField='key'
                    displayField='value'
                    onChange={(event, newValue) => {
                      formik.setFieldValue('otpId', newValue?.key || null)
                    }}
                    error={formik.touched.otpId && Boolean(formik.errors.otpId)}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <CustomDatePicker
                    name='birthDate'
                    label={labels.birthDate}
                    value={formik.values?.birthDate}
                    required
                    onChange={formik.setFieldValue}
                    onClear={() => formik.setFieldValue('birthDate', '')}
                    error={formik.touched.birthDate && Boolean(formik.errors.birthDate)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    name='religion'
                    label={labels.religion}
                    datasetId={DataSets.FI_GROUP_TYPE} // Different KVS
                    required
                    values={formik.values}
                    valueField='key'
                    displayField='value'
                    onChange={(event, newValue) => {
                      formik.setFieldValue('religion', newValue?.key || null)
                    }}
                    error={formik.touched.religion && Boolean(formik.errors.religion)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SaleRepository.SalesZone.qry}
                    parameters={`_startAt=0&_pageSize=1000&_sortField="recordId"&_filter=`}
                    name='nationalityId'
                    label={labels.nationality}
                    valueField='recordId'
                    displayField='name'
                    values={formik.values}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('nationalityId', newValue?.recordId || null)
                    }}
                    error={formik.touched.nationalityId && Boolean(formik.errors.nationalityId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SaleRepository.SalesPerson.qry}
                    name='citizenshipId'
                    label={labels.citizenship}
                    columnsInDropDown={[{ key: 'name', value: 'Name' }]}
                    valueField='recordId'
                    displayField='name'
                    values={formik.values}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('citizenshipId', newValue?.recordId || null)
                    }}
                    error={formik.touched.citizenshipId && Boolean(formik.errors.citizenshipId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    name='bloodType'
                    label={labels.bloodType}
                    datasetId={DataSets.FI_GROUP_TYPE} // Different KVS
                    required
                    values={formik.values}
                    valueField='key'
                    displayField='value'
                    onChange={(event, newValue) => {
                      formik.setFieldValue('bloodType', newValue?.key || null)
                    }}
                    error={formik.touched.bloodType && Boolean(formik.errors.bloodType)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={AccessControlRepository.SecurityGroup.qry}
                    parameters={`_startAt=0&_pageSize=1000&filter=`}
                    name='scId'
                    label={labels.scheduleType}
                    values={formik.values}
                    valueField='recordId'
                    displayField='name'
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('scId', newValue?.recordId || null)
                    }}
                    error={formik.touched.scId && Boolean(formik.errors.scId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='placeOfBirth'
                    label={labels.placeOfBirth}
                    value={formik.values.placeOfBirth}
                    maxAccess={maxAccess}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('placeOfBirth', '')}
                    error={formik.touched.placeOfBirth && Boolean(formik.errors.placeOfBirth)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomDatePicker
                    name='hireDate'
                    label={labels.hireDate}
                    value={formik.values?.hireDate}
                    required
                    onChange={formik.setFieldValue}
                    onClear={() => formik.setFieldValue('hireDate', '')}
                    error={formik.touched.hireDate && Boolean(formik.errors.hireDate)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <RadioGroup row value={formik.values.gender} defaultValue={2} onChange={formik.setFieldValue}>
                    <FormControlLabel value={2} control={<Radio />} label={labels.male} />
                    <FormControlLabel value={1} control={<Radio />} label={labels.female} />
                  </RadioGroup>
                </Grid>
                <Grid item xs={12}>
                  <CustomCheckBox
                    name='hasSpecialNeeds'
                    value={formik.values?.hasSpecialNeeds}
                    onChange={event => formik.setFieldValue('hasSpecialNeeds', event.target.checked)}
                    label={labels.hasSpecialNeeds}
                    maxAccess={maxAccess}
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

export default ProfileForm
