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

export default function EntitlementForm({ labels, maxAccess, recordId }) {
  const { platformLabels } = useContext(ControlContext)

  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: ManufacturingRepository.Machine.page
  })

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      recordId,
      includeInTotal: false,
      entitlementId: null,
      isPercentage: false,
      amount: 0,
      percentage: 0,
      comments: '',
      isTaxable: false,
      calculationType: null
    },
    validateOnChange: false,
    validationSchema: yup.object({
    }),
    onSubmit: async values => {
      
    }
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
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <ResourceComboBox
            endpointId={ManufacturingRepository.WorkCenter.qry}
            name='entitlementId'
            label={labels.entitlementId}
            valueField='recordId'
            displayField='name'
            values={formik.values}
            onChange={(event, newValue) => {
              formik.setFieldValue('entitlementId', newValue?.recordId || null)
            }}
            error={formik.touched.entitlementId && Boolean(formik.errors.entitlementId)}
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
            name='isPercentage'
            value={formik.values?.isPercentage}
            onChange={event => formik.setFieldValue('isPercentage', event.target.checked)}
            label={labels.isPercentage}
            maxAccess={maxAccess}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomNumberField
            name='percentage'
            label={labels.percentage}
            value={formik.values.percentage}
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('percentage', 0)}
            error={formik.touched.percentage && Boolean(formik.errors.percentage)}
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
        <Grid item xs={6}>
          <ResourceComboBox
            endpointId={ManufacturingRepository.Operation.qry}
            name='calculationType'
            label={labels.calculationType}
            valueField='recordId'
            displayField='name'
            values={formik.values}
            onChange={(event, newValue) => {
              formik.setFieldValue('calculationType', newValue?.recordId || null)
            }}
            error={formik.touched.calculationType && Boolean(formik.errors.calculationType)}
          />
        </Grid>
      </Grid>
    </FormShell>
  )
}
