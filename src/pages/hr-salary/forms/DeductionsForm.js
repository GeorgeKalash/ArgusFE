import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import CustomCheckBox from 'src/components/Inputs/CustomCheckBox'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import { EmployeeRepository } from 'src/repositories/EmployeeRepository'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { DataSets } from 'src/resources/DataSets'

export default function DeductionsForm({ labels, maxAccess, recordId }) {
  const { platformLabels } = useContext(ControlContext)
  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: EmployeeRepository.SalaryDetails.qry
  })

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      recordId,
      includeInTotal: false,
      deductionId: null,
      isPercentage: false,
      pctOf: null,
      amount: 0,
      pct: 0,
      isTaxable: false,
      edCalcType: null
    },
    validationSchema: yup.object({
      edId: yup.number().required(),
      fixedAmount: yup.number().min(1).required(),
      edCalcType: yup.number().required()
    }),
    onSubmit: async values => {}
  })
  console.log('formik', formik)

  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (recordId) {
      }
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.Salaries} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={EmployeeRepository.EmployeeDeduction.qry}
              name='edId'
              label={labels.deduction}
              valueField='recordId'
              displayField='name'
              values={formik.values}
              filter={item => item.type == 2}
              onChange={(event, newValue) => {
                formik.setFieldValue('edId', newValue?.recordId || null)
              }}
              required
              error={formik.touched.edId && Boolean(formik.errors.edId)}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomCheckBox
              name='includeInTotal'
              value={formik.values?.includeInTotal}
              onChange={event => formik.setFieldValue('includeInTotal', event.target.checked)}
              label={labels.includeInTotal}
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomCheckBox
              name='isPct'
              value={formik.values?.isPct}
              onChange={event => formik.setFieldValue('isPct', event.target.checked)}
              label={labels.isPct}
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomNumberField
              name='pctOf'
              label={labels.pctOf}
              value={formik.values.pctOf}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('pctOf', 0)}
              error={formik.touched.pctOf && Boolean(formik.errors.pctOf)}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomNumberField
              name='pct'
              label={labels.pct}
              value={formik.values.pct}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('pct', 0)}
              error={formik.touched.pct && Boolean(formik.errors.pct)}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomNumberField
              name='amount'
              label={labels.amount}
              value={formik.values.amount}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('amount', 0)}
              error={formik.touched.amount && Boolean(formik.errors.amount)}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomCheckBox
              name='isTaxable'
              value={formik.values?.isTaxable}
              onChange={event => formik.setFieldValue('isTaxable', event.target.checked)}
              label={labels.isTaxable}
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              datasetId={DataSets.ED_CALC_TYPE}
              name='edCalcType'
              label={labels.calculationType}
              valueField='key'
              displayField='value'
              values={formik.values}
              maxAccess={maxAccess}
              required
              onChange={(event, newValue) => {
                formik.setFieldValue('edCalcType', newValue?.key || null)
              }}
              error={formik.touched.edCalcType && Boolean(formik.errors.edCalcType)}
            />
          </Grid>
        </Grid>
      </VertLayout>
    </FormShell>
  )
}
