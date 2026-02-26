import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import useResourceParams from '@argus/shared-hooks/src/hooks/useResourceParams'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import toast from 'react-hot-toast'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import * as yup from 'yup'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import { EmployeeRepository } from '@argus/repositories/src/repositories/EmployeeRepository'
import { PayrollRepository } from '@argus/repositories/src/repositories/PayrollRepository'
import FieldSet from '@argus/shared-ui/src/components/Shared/FieldSet'
import { BenefitsRepository } from '@argus/repositories/src/repositories/BenefitsRepository'
import Form from '@argus/shared-ui/src/components/Shared/Form'

const PYSettings = () => {
  const { postRequest } = useContext(RequestsContext)
  const { platformLabels, defaultsData, updateDefaults } = useContext(ControlContext)

  const { labels, access } = useResourceParams({
    datasetId: ResourceIds.PayrollSettings
  })

  useEffect(() => {
    ;(async function () {
      const myObject = {}

      const filteredList = defaultsData?.list?.filter(obj => {
        return (
          obj.key === 'ssId' ||
          obj.key === 'ssId_foreigners' ||
          obj.key === 'loanDeductionId' ||
          obj.key === 'ldMethod' ||
          obj.key === 'ldValue' ||
          obj.key === 'basicSalaryEDId' ||
          obj.key === 'socialSecurityEDId' ||
          obj.key === 'PYISmale' ||
          obj.key === 'PYISfemale' ||
          obj.key === 'yearDays' ||
          obj.key === 'monthWorkDays' ||
          obj.key === 'monthWorkHrs' ||
          obj.key === 'dayWorkHrs' ||
          obj.key === 'bsId' ||
          obj.key === 'leaveBalRound' ||
          obj.key === 'MaxLoanDeduction' ||
          obj.key === 'pytvStartDate' ||
          obj.key === 'pytvEndDate'
        )
      })
      filteredList?.forEach(obj => {
        myObject[obj.key] = obj.value ? parseInt(obj.value, 10) : null
      })
      formik.setValues(myObject)
    })()
  }, [defaultsData])

  const { formik } = useForm({
    maxAccess: access,
    validateOnChange: true,
    initialValues: {
      ssId: null,
      ssId_foreigners: null,
      loanDeductionId: null,
      ldMethod: null,
      ldValue: null,
      basicSalaryEDId: null,
      socialSecurityEDId: null,
      PYISmale: null,
      PYISfemale: null,
      yearDays: null,
      monthWorkDays: null,
      monthWorkHrs: null,
      dayWorkHrs: null,
      bsId: null,
      leaveBalRound: null,
      MaxLoanDeduction: null,
      pytvStartDate: null,
      pytvEndDate: null
    },
    validationSchema: yup.object().shape({
      yearDays: yup.number().max(365).nullable(),
      monthWorkDays: yup.number().max(30).nullable(),
      monthWorkHrs: yup.number().min(200).max(300).nullable(),
      dayWorkHrs: yup.number().min(6).max(24).nullable(),
      MaxLoanDeduction: yup.number().max(100).nullable(),
      pytvEndDate: yup.number().min(15).max(28).nullable()
    }),
    onSubmit: async obj => {
      const data = Object.entries(obj).map(([key, value]) => ({
        key,
        value
      }))

      await postRequest({
        extension: SystemRepository.Defaults.set,
        record: JSON.stringify({ sysDefaults: data })
      })
      updateDefaults(data)
      toast.success(platformLabels.Edited)
    }
  })

  return (
    <Form onSave={formik.handleSubmit} maxAccess={access}>
      <VertLayout>
        <Grid container spacing={2} xs={5}>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={PayrollRepository.SecuritySchedule.qry}
              name='ssId'
              label={labels.ssId}
              values={formik.values}
              valueField='recordId'
              displayField='name'
              maxAccess={access}
              onChange={(event, newValue) => {
                formik.setFieldValue('ssId', newValue?.recordId || null)
              }}
              error={formik.touched.ssId && Boolean(formik.errors.ssId)}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={PayrollRepository.SecuritySchedule.qry}
              name='ssId_foreigners'
              label={labels.ssId_foreigners}
              values={formik.values}
              valueField='recordId'
              displayField='name'
              maxAccess={access}
              onChange={(event, newValue) => {
                formik.setFieldValue('ssId_foreigners', newValue?.recordId || null)
              }}
              error={formik.touched.ssId_foreigners && Boolean(formik.errors.ssId_foreigners)}
            />
          </Grid>
          <Grid item xs={12}>
            <FieldSet title={labels.loans}>
              <Grid item xs={12}>
                <ResourceComboBox
                  endpointId={EmployeeRepository.EmployeeDeduction.qry}
                  name='loanDeductionId'
                  label={labels.loanDeductionId}
                  values={formik.values}
                  valueField='recordId'
                  displayField='name'
                  maxAccess={access}
                  filter={item => item.type === 2}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('loanDeductionId', newValue?.recordId || null)
                  }}
                  error={formik.touched.loanDeductionId && Boolean(formik.errors.loanDeductionId)}
                />
              </Grid>
              <Grid item xs={12}>
                <ResourceComboBox
                  datasetId={DataSets.LOAN_DEDUCTION_METHOD}
                  name='ldMethod'
                  label={labels.ldMethod}
                  valueField='key'
                  displayField='value'
                  values={formik.values}
                  maxAccess={access}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('ldMethod', newValue?.key || null)
                  }}
                  error={formik.touched.ldMethod && Boolean(formik.errors.ldMethod)}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomNumberField
                  name='ldValue'
                  label={labels.ldValue}
                  value={formik.values.ldValue}
                  maxAccess={access}
                  allowNegative={false}
                  onChange={formik.handleChange}
                  onClear={() => formik.setFieldValue('ldValue', null)}
                  error={formik.touched.ldValue && Boolean(formik.errors.ldValue)}
                />
              </Grid>
            </FieldSet>
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={EmployeeRepository.EmployeeDeduction.qry}
              name='basicSalaryEDId'
              label={labels.basicSalaryEDId}
              values={formik.values}
              valueField='recordId'
              displayField='name'
              maxAccess={access}
              filter={item => item.type === 1}
              onChange={(event, newValue) => {
                formik.setFieldValue('basicSalaryEDId', newValue?.recordId || null)
              }}
              error={formik.touched.basicSalaryEDId && Boolean(formik.errors.basicSalaryEDId)}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={EmployeeRepository.EmployeeDeduction.qry}
              name='socialSecurityEDId'
              label={labels.socialSecurityEDId}
              values={formik.values}
              valueField='recordId'
              displayField='name'
              maxAccess={access}
              filter={item => item.type === 2}
              onChange={(event, newValue) => {
                formik.setFieldValue('socialSecurityEDId', newValue?.recordId || null)
              }}
              error={formik.touched.socialSecurityEDId && Boolean(formik.errors.socialSecurityEDId)}
            />
          </Grid>
          <Grid item xs={12}>
            <FieldSet title={labels.indemnitySchedules}>
              <Grid item xs={12}>
                <ResourceComboBox
                  endpointId={PayrollRepository.IndemnitySchedule.qry}
                  name='PYISmale'
                  label={labels.PYISmale}
                  values={formik.values}
                  valueField='recordId'
                  displayField='name'
                  maxAccess={access}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('PYISmale', newValue?.recordId || null)
                  }}
                  error={formik.touched.PYISmale && Boolean(formik.errors.PYISmale)}
                />
              </Grid>
              <Grid item xs={12}>
                <ResourceComboBox
                  endpointId={PayrollRepository.IndemnitySchedule.qry}
                  name='PYISfemale'
                  label={labels.PYISfemale}
                  values={formik.values}
                  valueField='recordId'
                  displayField='name'
                  maxAccess={access}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('PYISfemale', newValue?.recordId || null)
                  }}
                  error={formik.touched.PYISfemale && Boolean(formik.errors.PYISfemale)}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomNumberField
                  name='yearDays'
                  label={labels.yearDays}
                  value={formik.values.yearDays}
                  maxAccess={access}
                  allowNegative={false}
                  onChange={formik.handleChange}
                  onClear={() => formik.setFieldValue('yearDays', null)}
                  error={formik.touched.yearDays && Boolean(formik.errors.yearDays)}
                />
              </Grid>
            </FieldSet>
          </Grid>
          <Grid item xs={12}>
            <CustomNumberField
              name='monthWorkDays'
              label={labels.monthWorkDays}
              value={formik.values.monthWorkDays}
              maxAccess={access}
              allowNegative={false}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('monthWorkDays', null)}
              error={formik.touched.monthWorkDays && Boolean(formik.errors.monthWorkDays)}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomNumberField
              name='monthWorkHrs'
              label={labels.monthWorkHrs}
              value={formik.values.monthWorkHrs}
              maxAccess={access}
              allowNegative={false}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('monthWorkHrs', null)}
              error={formik.touched.monthWorkHrs && Boolean(formik.errors.monthWorkHrs)}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomNumberField
              name='dayWorkHrs'
              label={labels.dayWorkHrs}
              value={formik.values.dayWorkHrs}
              maxAccess={access}
              allowNegative={false}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('dayWorkHrs', null)}
              error={formik.touched.dayWorkHrs && Boolean(formik.errors.dayWorkHrs)}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={BenefitsRepository.BenefitSchedule.qry}
              name='bsId'
              label={labels.bsId}
              values={formik.values}
              valueField='recordId'
              displayField='name'
              maxAccess={access}
              onChange={(event, newValue) => {
                formik.setFieldValue('bsId', newValue?.recordId || null)
              }}
              error={formik.touched.bsId && Boolean(formik.errors.bsId)}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              datasetId={DataSets.LEAVE_ROUND_BALANCE}
              name='leaveBalRound'
              label={labels.leaveBalRound}
              valueField='key'
              displayField='value'
              values={formik.values}
              maxAccess={access}
              onChange={(event, newValue) => {
                formik.setFieldValue('leaveBalRound', newValue?.key || null)
              }}
              error={formik.touched.leaveBalRound && Boolean(formik.errors.leaveBalRound)}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomNumberField
              name='MaxLoanDeduction'
              label={labels.MaxLoanDeduction}
              value={formik.values.MaxLoanDeduction}
              maxAccess={access}
              allowNegative={false}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('MaxLoanDeduction', null)}
              error={formik.touched.MaxLoanDeduction && Boolean(formik.errors.MaxLoanDeduction)}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomNumberField
              name='pytvStartDate'
              label={labels.pytvStartDate}
              value={formik.values.pytvStartDate}
              maxAccess={access}
              allowNegative={false}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('pytvStartDate', null)}
              error={formik.touched.pytvStartDate && Boolean(formik.errors.pytvStartDate)}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomNumberField
              name='pytvEndDate'
              label={labels.pytvEndDate}
              value={formik.values.pytvEndDate}
              maxAccess={access}
              allowNegative={false}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('pytvEndDate', null)}
              error={formik.touched.pytvEndDate && Boolean(formik.errors.pytvEndDate)}
            />
          </Grid>
        </Grid>
      </VertLayout>
    </Form>
  )
}

export default PYSettings
