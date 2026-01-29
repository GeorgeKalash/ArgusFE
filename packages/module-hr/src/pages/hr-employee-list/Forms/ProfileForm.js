import { Grid, FormControlLabel, RadioGroup, Radio } from '@mui/material'
import toast from 'react-hot-toast'
import * as yup from 'yup'
import { useContext, useEffect } from 'react'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import { TimeAttendanceRepository } from '@argus/repositories/src/repositories/TimeAttendanceRepository'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { EmployeeRepository } from '@argus/repositories/src/repositories/EmployeeRepository'
import { formatDateFromApi, formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'
import CustomCheckBox from '@argus/shared-ui/src/components/Inputs/CustomCheckBox'
import { AccessControlRepository } from '@argus/repositories/src/repositories/AccessControlRepository'
import CustomRadioButtonGroup from '@argus/shared-ui/src/components/Inputs/CustomRadioButtonGroup'

const ProfileForm = ({ labels, maxAccess, setStore, store, imageUploadRef, getData }) => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { recordId } = store

  const invalidate = useInvalidate({
    endpointId: EmployeeRepository.EmployeeChart.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId,
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
      lastName: '',
      religion: null,
      nationalityId: null,
      bloodType: null,
      scId: null,
      scType: null,
      placeOfBirth: '',
      hireDate: null,
      gender: 1,
      activeStatus: 1,
      isConfidential: false,
      sgId: null
    },
    maxAccess,
    validationSchema: yup.object({
      reference: yup.string().required(),
      firstName: yup.string().required(),
      middleName: yup.string().required(),
      lastName: yup.string().required(),
      birthDate: yup.date().required(),
      scType: yup.number().required(),
      hireDate: yup.date().required(),
      homeMail: yup.string().email().nullable(),
      workMail: yup.string().email().nullable(),
      mobile: yup.number().min(999999).nullable(),
      phone: yup.number().min(999999).nullable(),
      scId: yup.number().when('scType', {
        is: value => value == 2,
        then: () => yup.number().required(),
        otherwise: () => yup.number().nullable()
      }),
      sgId: yup
        .number()
        .nullable()
        .test('sgId-required-if-confidential', 'sgId is required when confidential', function (value) {
          const { isConfidential } = this.parent

          return !(isConfidential && !value)
        })
    }),
    onSubmit: async values => {
      const res = await postRequest({
        extension: EmployeeRepository.Employee.set,
        record: JSON.stringify({
          ...values,
          hireDate: formatDateToApi(values.hireDate),
          birthDate: formatDateToApi(values.birthDate)
        })
      })
      if (!values.recordId) {
        formik.setFieldValue('recordId', res.recordId)
      }
      setStore(prevStore => ({
        ...prevStore,
        recordId: res.recordId,
        hireDate: values.hireDate
      }))

      if (imageUploadRef.current) {
        imageUploadRef.current.value = parseInt(res.recordId)

        await imageUploadRef.current.submit()
      }
      invalidate()
      getData(res.recordId)
      toast.success(!values.recordId ? platformLabels.Added : platformLabels.Edited)
    }
  })

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: EmployeeRepository.Employee.get1,
          parameters: `_recordId=${recordId}`
        })

        formik.setValues({
          ...res.record,
          hireDate: res?.record?.hireDate ? formatDateFromApi(res.record.hireDate) : null,
          birthDate: res?.record?.birthDate ? formatDateFromApi(res.record.birthDate) : null
        })

        setStore(prevStore => ({
          ...prevStore,
          hireDate: res?.record?.hireDate
        }))
      }
    })()
  }, [])

  const editMode = !!formik?.values?.recordId

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
      reportSize={5}
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
                    maxLength='10'
                    readOnly={editMode}
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
                    maxLength='20'
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
                    required
                    maxLength='20'
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('middleName', '')}
                    error={formik.touched.middleName && Boolean(formik.errors.middleName)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='lastName'
                    label={labels.lastName}
                    value={formik.values.lastName}
                    maxAccess={maxAccess}
                    maxLength='20'
                    required
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('lastName', '')}
                    error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='familyName'
                    label={labels.familyName}
                    value={formik.values.familyName}
                    maxAccess={maxAccess}
                    maxLength='20'
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
                    maxLength='20'
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
                    maxLength='40'
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
                    maxLength='40'
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
                    maxLength={15}
                    phone={true}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('mobile', null)}
                    error={formik.touched.mobile && Boolean(formik.errors.mobile)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='phone'
                    label={labels.homePhone}
                    value={formik.values.phone}
                    maxAccess={maxAccess}
                    maxLength={15}
                    phone={true}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('phone', null)}
                    error={formik.touched.phone && Boolean(formik.errors.phone)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    name='civilStatus'
                    label={labels.civilStatus}
                    datasetId={DataSets.CIVIL_STATUS}
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
                    endpointId={TimeAttendanceRepository.OvertimeProfiles.qry}
                    name='otpId'
                    label={labels.overtimeProfile}
                    valueField='recordId'
                    displayField='name'
                    values={formik.values}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('otpId', newValue?.recordId || null)
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
                    onClear={() => formik.setFieldValue('birthDate', null)}
                    error={formik.touched.birthDate && Boolean(formik.errors.birthDate)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    name='religion'
                    label={labels.religion}
                    datasetId={DataSets.RELIGION}
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
                    name='nationalityId'
                    endpointId={SystemRepository.Country.qry}
                    label={labels.nationality}
                    valueField='recordId'
                    displayField='name'
                    values={formik.values}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('nationalityId', newValue?.recordId || 0)
                    }}
                    maxAccess={maxAccess}
                    error={formik.touched.nationalityId && Boolean(formik.errors.nationalityId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    name='bloodType'
                    label={labels.bloodType}
                    datasetId={DataSets.BLOOD_TYPE}
                    values={formik.values}
                    valueField='key'
                    displayField='value'
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('bloodType', newValue?.key || null)
                    }}
                    error={formik.touched.bloodType && Boolean(formik.errors.bloodType)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    name='scType'
                    label={labels.scheduleType}
                    datasetId={DataSets.SCHEDULE_TYPE}
                    values={formik.values}
                    required
                    valueField='key'
                    displayField='value'
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      if (newValue?.key == 1 || newValue?.key == 3 || newValue?.key == 4) {
                        formik.setFieldValue('scId', null)
                      }

                      formik.setFieldValue('scType', newValue?.key || null)
                    }}
                    error={formik.touched.scType && Boolean(formik.errors.scType)}
                  />
                </Grid>

                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={TimeAttendanceRepository.Schedule.qry}
                    name='scId'
                    label={labels.schedule}
                    valueField='recordId'
                    displayField='name'
                    values={formik.values}
                    maxAccess={maxAccess}
                    required={formik.values.scType == 2}
                    readOnly={formik.values.scType == 1 || formik.values.scType == 3 || formik.values.scType == 4}
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
                    maxLength='30'
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
                    maxAccess={maxAccess}
                    onChange={formik.setFieldValue}
                    onClear={() => formik.setFieldValue('hireDate', null)}
                    error={formik.touched.hireDate && Boolean(formik.errors.hireDate)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomRadioButtonGroup
                    name='gender'
                    maxAccess={maxAccess}
                    row
                    value={formik.values.gender}
                    onChange={e => formik.setFieldValue('gender', Number(e.target.value))}
                    options={[
                      { label: labels.male, value: 1 },
                      { label: labels.female, value: 2 }
                    ]}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomCheckBox
                    name='isConfidential'
                    value={formik.values?.isConfidential}
                    onChange={event => {
                      formik.setFieldValue('isConfidential', event.target.checked)
                      formik.setFieldValue('sgId', null)
                    }}
                    label={labels.isConfidential}
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={AccessControlRepository.SecurityGroup.qry}
                    parameters={`_startAt=0&_pageSize=1000&filter=`}
                    name='sgId'
                    label={labels.securityGrp}
                    values={formik.values}
                    valueField='recordId'
                    displayField='name'
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('sgId', newValue?.recordId || null)
                    }}
                    required={formik.values.isConfidential}
                    readOnly={!formik.values.isConfidential}
                    error={formik.touched.sgId && Boolean(formik.errors.sgId)}
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
