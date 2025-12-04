import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import CustomCheckBox from '@argus/shared-ui/src/components/Inputs/CustomCheckBox'
import { EmployeeRepository } from '@argus/repositories/src/repositories/EmployeeRepository'
import { PayrollRepository } from '@argus/repositories/src/repositories/PayrollRepository'
import { MathExpressionRepository } from '@argus/repositories/src/repositories/MathExpressionRepository'
import { MasterSource } from '@argus/shared-domain/src/resources/MasterSource'

export default function EntDeductionForm({ labels, recordId, maxAccess, window }) {
  const { platformLabels } = useContext(ControlContext)
  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: EmployeeRepository.EmployeeDeduction.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId,
      name: '',
      type: null,
      reference: '',
      paycodeRef: '',
      expressionId: null
    },
    maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      name: yup.string().required(),
      reference: yup.string().required(),
      type: yup.number().required(),
      paycodeRef: yup.string().required()
    }),
    onSubmit: async obj => {
      const response = await postRequest({
        extension: EmployeeRepository.EmployeeDeduction.set,
        record: JSON.stringify(obj)
      })

      toast.success(!obj.recordId ? platformLabels.Added : platformLabels.Edited)
      formik.setFieldValue('recordId', response.recordId)

      invalidate()
      window.close()
    }
  })

  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: EmployeeRepository.EmployeeDeduction.get,
          parameters: `_recordId=${recordId}`
        })

        formik.setValues(res.record)
      }
    })()
  }, [])

  const actions = [
    {
      key: 'Integration Account',
      condition: true,
      onClick: 'onClickGIA',
      masterSource: MasterSource.PayrollEntitlementDeduction,
      disabled: !editMode
    }
  ]

  return (
    <FormShell
      resourceId={ResourceIds.EntitlementDeduction}
      actions={actions}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      isCleared={false}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomTextField
                name='reference'
                label={labels.reference}
                value={formik.values.reference}
                required
                maxLength='10'
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('reference', '')}
                error={formik.touched.reference && formik.errors.reference}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='name'
                label={labels.name}
                value={formik.values.name}
                required
                maxLength='30'
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('name', '')}
                error={formik.touched.name && formik.errors.name}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.ENTITLEMENT_DEDUCTION_TYPE}
                name='type'
                label={labels.type}
                values={formik.values}
                valueField='key'
                displayField='value'
                required
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('type', newValue?.key || null)
                }}
                error={formik.touched.type && Boolean(formik.errors.type)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={PayrollRepository.Paycode.qry}
                name='paycodeRef'
                label={labels.paycodeRef}
                values={formik.values}
                valueField='payCode'
                displayField='name'
                required
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('paycodeRef', newValue?.payCode || '')
                }}
                error={formik.touched.paycodeRef && Boolean(formik.errors.paycodeRef)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={MathExpressionRepository.Expression.qry}
                name='expressionId'
                label={labels.expression}
                displayField='name'
                valueField='recordId'
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('expressionId', newValue?.recordId || null)
                }}
                maxAccess={maxAccess}
                error={formik.touched.expressionId && Boolean(formik.errors.expressionId)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomCheckBox
                name='isTaxable'
                value={formik.values?.isTaxable}
                onChange={e => formik.setFieldValue('isTaxable', e.target.checked)}
                label={labels.isTaxable}
                maxAccess={maxAccess}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
