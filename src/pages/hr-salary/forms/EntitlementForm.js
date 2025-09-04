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

export default function EntitlementForm({ labels, maxAccess, recordId }) {
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
      edId: null,
      isPct: false,
      fixedAmount: 0,
      pct: 0,
      comments: '',
      isTaxable: false,
      edCalcType: null
    },
    validateOnChange: true,
    validationSchema: yup.object({
      edId: yup.string().required(),
      fixedAmount: yup.string().required(),
      edCalcType: yup.string().required()
    }),
    onSubmit: async values => {}
  })

  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (recordId) {
      }
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.Machines} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={EmployeeRepository.EmployeeDeduction.qry}
              name='edId'
              label={labels.entitlements}
              valueField='recordId'
              displayField='name'
              values={formik.values}
              filter={item => item.type == 1}
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
              name='fixedAmount'
              label={labels.amount}
              value={formik.values.fixedAmount}
              onChange={formik.handleChange}
              required
              onClear={() => formik.setFieldValue('fixedAmount', 0)}
              error={formik.touched.fixedAmount && Boolean(formik.errors.fixedAmount)}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextArea
              name='comments'
              label={labels.comments}
              value={formik.values.comments}
              maxLength='100'
              rows={2}
              maxAccess={maxAccess}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('comments', '')}
              error={formik.touched.comments && Boolean(formik.errors.comments)}
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
              endpointId={ManufacturingRepository.Operation.qry}
              name='edCalcType'
              label={labels.edCalcType}
              valueField='recordId'
              displayField='name'
              values={formik.values}
              required
              onChange={(event, newValue) => {
                formik.setFieldValue('edCalcType', newValue?.recordId || null)
              }}
              error={formik.touched.edCalcType && Boolean(formik.errors.edCalcType)}
            />
          </Grid>
        </Grid>
      </VertLayout>
    </FormShell>
  )
}
