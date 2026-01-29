import { Grid } from '@mui/material'
import toast from 'react-hot-toast'
import { differenceInDays } from 'date-fns'
import * as yup from 'yup'
import { useContext, useEffect } from 'react'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import CustomTextArea from '@argus/shared-ui/src/components/Inputs/CustomTextArea'
import { EmployeeRepository } from '@argus/repositories/src/repositories/EmployeeRepository'
import { PayrollRepository } from '@argus/repositories/src/repositories/PayrollRepository'
import { formatDateFromApi, formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'
import Form from '@argus/shared-ui/src/components/Shared/Form'

const HiringTab = ({ labels, maxAccess, store }) => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { recordId, hireDate } = store

  const invalidate = useInvalidate({
    endpointId: EmployeeRepository.EmployeeChart.page
  })

  function normalizeDate(date) {
    if (!date) return null
    if (typeof date === 'string' && date.includes('/Date')) {
      return formatDateFromApi(date)
    }

    return new Date(date)
  }
  
  const normalizedHireDate = normalizeDate(hireDate)

  const { formik } = useForm({
    initialValues: {
      recordId,
      employeeId: recordId,
      probationEndDate: normalizedHireDate,
      pyActiveDate: normalizedHireDate,
      nextReviewDate: null,
      npId: null,
      termEndDate: null,
      recruitmentInfo: '',
      recruitmentCost: null,
      pyReference: '',
      taReference: '',
      ssBranchId: null,
      probationPeriod: 0,
      sponsorId: null,
      otherRef: '',
      bsId: null,
      languageId: null
    },
    maxAccess,
    validationSchema: yup.object({
      probationEndDate: yup.date().required(),
      pyActiveDate: yup.date().required()
    }),
    onSubmit: async values => {
      await postRequest({
        extension: EmployeeRepository.Hiring.set,
        record: JSON.stringify({
          ...values,
          employeeId: recordId,
          pyActiveDate: formatDateToApi(values.pyActiveDate),
          termEndDate: values.termEndDate ? formatDateToApi(values.termEndDate) : null,
          nextReviewDate: values.nextReviewDate ? formatDateToApi(values.nextReviewDate) : null,
          probationEndDate: formatDateToApi(values.probationEndDate)
        })
      })
      invalidate()
      toast.success(platformLabels.Edited)
    }
  })

  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: EmployeeRepository.Hiring.get,
          parameters: `_employeeId=${recordId}`
        })

        if (res?.record) {
          formik.setValues({
            ...res?.record,
            employeeId: recordId,
            pyActiveDate: res?.record?.pyActiveDate ? formatDateFromApi(res.record.pyActiveDate) : null,
            termEndDate: res?.record?.termEndDate ? formatDateFromApi(res.record.termEndDate) : null,
            nextReviewDate: res?.record?.nextReviewDate ? formatDateFromApi(res.record.nextReviewDate) : null,
            probationEndDate: res?.record?.probationEndDate ? formatDateFromApi(res.record.probationEndDate) : null
          })
        } else {
          formik.setFieldValue('probationEndDate', normalizedHireDate)
          formik.setFieldValue('pyActiveDate', normalizedHireDate)
        }
      }
    })()
  }, [hireDate])

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={EmployeeRepository.NoticePeriods.qry}
                    name='npId'
                    label={labels.noticePeriod}
                    valueField='recordId'
                    displayField='name'
                    values={formik.values}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('npId', newValue?.recordId || null)
                    }}
                    error={formik.touched.npId && Boolean(formik.errors.npId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='probationPeriod'
                    label={labels.probationPeriod}
                    value={formik.values.probationPeriod}
                    maxAccess={maxAccess}
                    maxLength={9}
                    onChange={formik.handleChange}
                    allowNegative={false}
                    onBlur={e => {
                      const value = e.target.value
                      formik.setFieldValue('probationPeriod', value)

                      if (hireDate && value) {
                        const start =
                          typeof hireDate === 'string' && hireDate.includes('/Date')
                            ? formatDateFromApi(hireDate)
                            : new Date(hireDate)

                        const endDate = new Date(start)
                        endDate.setDate(endDate.getDate() + Number(value))

                        formik.setFieldValue('probationEndDate', endDate)
                      }
                    }}
                    onClear={() => formik.setFieldValue('probationPeriod', '')}
                    error={formik.touched.probationPeriod && Boolean(formik.errors.probationPeriod)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomDatePicker
                    name='probationEndDate'
                    label={labels.probationEndDate}
                    value={formik.values?.probationEndDate}
                    required
                    onChange={(e, newValue) => {
                      let start = null
                      let end = newValue ? new Date(newValue) : null

                      if (hireDate) {
                        start =
                          typeof hireDate === 'string' && hireDate.includes('/Date')
                            ? formatDateFromApi(hireDate)
                            : new Date(hireDate)
                      }

                      if (end && start) {
                        const days = differenceInDays(end, start)
                        formik.setFieldValue('probationPeriod', days > 0 ? days : 0)
                      }

                      formik.setFieldValue('probationEndDate', newValue)
                    }}
                    maxAccess={maxAccess}
                    onClear={() => formik.setFieldValue('probationEndDate', '')}
                    error={formik.touched.probationEndDate && Boolean(formik.errors.probationEndDate)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomDatePicker
                    name='nextReviewDate'
                    label={labels.nextReviewDate}
                    value={formik.values?.nextReviewDate}
                    onChange={formik.setFieldValue}
                    maxAccess={maxAccess}
                    onClear={() => formik.setFieldValue('nextReviewDate', '')}
                    error={formik.touched.nextReviewDate && Boolean(formik.errors.nextReviewDate)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomDatePicker
                    name='termEndDate'
                    label={labels.termEndDate}
                    value={formik.values?.termEndDate}
                    maxAccess={maxAccess}
                    onChange={formik.setFieldValue}
                    onClear={() => formik.setFieldValue('termEndDate', '')}
                    error={formik.touched.termEndDate && Boolean(formik.errors.termEndDate)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomDatePicker
                    name='pyActiveDate'
                    label={labels.pyActiveDate}
                    value={formik.values?.pyActiveDate}
                    required
                    maxAccess={maxAccess}
                    onChange={formik.setFieldValue}
                    onClear={() => formik.setFieldValue('pyActiveDate', '')}
                    error={formik.touched.pyActiveDate && Boolean(formik.errors.pyActiveDate)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    name='languageId'
                    label={labels.language}
                    datasetId={DataSets.LANGUAGE_EMPLOYEE}
                    values={formik.values}
                    maxAccess={maxAccess}
                    valueField='key'
                    displayField='value'
                    onChange={(event, newValue) => {
                      formik.setFieldValue('languageId', newValue?.key || null)
                    }}
                    error={formik.touched.languageId && Boolean(formik.errors.languageId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextArea
                    name='recruitmentInfo'
                    label={labels.recruitmentInfo}
                    value={formik?.values?.recruitmentInfo}
                    maxLength='255'
                    maxAccess={maxAccess}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('recruitmentInfo', '')}
                    error={formik.touched.recruitmentInfo && Boolean(formik.errors.recruitmentInfo)}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='recruitmentCost'
                    label={labels.recruitmentCost}
                    value={formik.values.recruitmentCost}
                    maxAccess={maxAccess}
                    maxLength='10'
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('recruitmentCost', '')}
                    error={formik.touched.recruitmentCost && Boolean(formik.errors.recruitmentCost)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='pyReference'
                    label={labels.pyReference}
                    value={formik.values.pyReference}
                    maxAccess={maxAccess}
                    maxLength='10'
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('pyReference', '')}
                    error={formik.touched.pyReference && Boolean(formik.errors.pyReference)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='taReference'
                    label={labels.taReference}
                    value={formik.values.taReference}
                    maxAccess={maxAccess}
                    maxLength='10'
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('taReference', '')}
                    error={formik.touched.taReference && Boolean(formik.errors.taReference)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={PayrollRepository.BankTransferFilters.qry}
                    name='ssBranchId'
                    label={labels.ssBranch}
                    valueField='recordId'
                    displayField='name'
                    maxAccess={maxAccess}
                    values={formik.values}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('ssBranchId', newValue?.recordId || null)
                    }}
                    error={formik.touched.ssBranchId && Boolean(formik.errors.ssBranchId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={EmployeeRepository.SponsorFilters.qry}
                    name='sponsorId'
                    label={labels.sponsor}
                    valueField='recordId'
                    displayField='name'
                    values={formik.values}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('sponsorId', newValue?.recordId || null)
                    }}
                    error={formik.touched.sponsorId && Boolean(formik.errors.sponsorId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='otherRef'
                    label={labels.otherRef}
                    value={formik.values.otherRef}
                    maxAccess={maxAccess}
                    maxLength={15}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('otherRef', '')}
                    error={formik.touched.otherRef && Boolean(formik.errors.otherRef)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={PayrollRepository.BankTransferFilters.qry}
                    name='bsId'
                    label={labels.benefitSchedule}
                    values={formik.values}
                    valueField='recordId'
                    displayField='name'
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('bsId', newValue?.recordId || null)
                    }}
                    error={formik.touched.bsId && Boolean(formik.errors.bsId)}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default HiringTab
