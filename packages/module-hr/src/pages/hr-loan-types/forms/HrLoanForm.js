import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import CustomCheckBox from '@argus/shared-ui/src/components/Inputs/CustomCheckBox'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import { LoanTrackingRepository } from '@argus/repositories/src/repositories/LoanTrackingRepository'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'

export default function HrLoanForm({ labels, maxAccess, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: LoanTrackingRepository.LoanType.page
  })

  const validationSchema = yup.object({
    reference: yup.string().required(),
    name: yup.string().required(),
    ldMethod: yup.number().nullable(),
    ldValue: yup
      .number()
      .nullable()
      .test('ldValue-validation', 'Invalid ldValue for selected method', function (value) {
        const { ldMethod } = this.parent
        if (ldMethod === null || ldMethod === undefined || value === null) return true
        if (![4, 5, 6].includes(ldMethod)) {
          return value > 0 && value < 100
        }

        return value >= 0
      }),
    disableEditing: yup.boolean()
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      reference: '',
      name: '',
      ldName: null,
      ldValue: null,
      disableEditing: false
    },
    maxAccess,
    validateOnChange: true,
    validationSchema,
    onSubmit: async obj => {
      const response = await postRequest({
        extension: LoanTrackingRepository.LoanType.set,
        record: JSON.stringify(obj)
      })

      toast.success(obj.recordId ? platformLabels.Edited : platformLabels.Added)
      !obj.recordId && formik.setFieldValue('recordId', response.recordId)
      invalidate()
    }
  })

  const editMode = !!formik?.values?.recordId

  useEffect(() => {
    if (recordId) {
      ;(async function () {
        const res = await getRequest({
          extension: LoanTrackingRepository.LoanType.get,
          parameters: `_recordId=${recordId}`
        })
        formik.setValues(res?.record)
      })()
    }
  }, [])

  return (
    <FormShell resourceId={ResourceIds.LoanTypes} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomTextField
                name='reference'
                label={labels.Reference}
                value={formik.values.reference}
                required
                maxAccess={maxAccess}
                maxLength='20'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('reference', '')}
                error={formik.touched.reference && Boolean(formik.errors.reference)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='name'
                label={labels.Name}
                value={formik.values.name}
                required
                maxAccess={maxAccess}
                maxLength='50'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('name', '')}
                error={formik.touched.name && Boolean(formik.errors.name)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.LOAN_DEDUCTION_METHOD}
                name='ldMethod'
                label={labels.loan}
                valueField='key'
                displayField='value'
                values={formik.values}
                onChange={(event, newValue) => formik.setFieldValue('ldMethod', newValue?.key || null)}
                maxAccess={maxAccess}
                error={formik.touched.ldMethod && Boolean(formik.errors.ldMethod)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='ldValue'
                label={labels.payment}
                value={formik.values.ldValue}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('ldValue', null)}
                maxAccess={maxAccess}
                allowNegative={false}
                error={formik.touched.ldValue && Boolean(formik.errors.ldValue)}
                maxLength={5}
                decimalScale={3}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomCheckBox
                name='disableEditing'
                label={labels.disable}
                value={formik.values.disableEditing}
                onChange={e => formik.setFieldValue('disableEditing', e.target.checked)}
                maxAccess={maxAccess}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
