import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { DataSets } from 'src/resources/DataSets'
import CustomCheckBox from 'src/components/Inputs/CustomCheckBox'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'

export default function OutwardReturnReasonForm({ labels, maxAccess, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: RemittanceOutwardsRepository.OutwardReturnReason.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      reference: '',
      name: '',
      correspondant: false,
      client: false,
      company: false,
      feesStatus: '',
      rateStatus: ''
    },
    maxAccess,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      reference: yup.string().required(),
      name: yup.string().required(),
      feesStatus: yup.string().required(),
      rateStatus: yup.string().required()
    }),
    onSubmit: async obj => {
      const response = await postRequest({
        extension: RemittanceOutwardsRepository.OutwardReturnReason.set,
        record: JSON.stringify(obj)
      })

      if (!obj.recordId) {
        toast.success(platformLabels.Added)
        formik.setFieldValue('recordId', response.recordId)
      } else toast.success(platformLabels.Edited)

      invalidate()
    }
  })

  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: RemittanceOutwardsRepository.OutwardReturnReason.get,
          parameters: `_recordId=${recordId}`
        })

        formik.setValues(res.record)
      }
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.OutwardReturnReason} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
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
                name='name'
                label={labels.name}
                value={formik.values.name}
                required
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('name', '')}
                error={formik.touched.name && Boolean(formik.errors.name)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomCheckBox
                name='correspondant'
                value={formik.values.correspondant}
                onChange={event => formik.setFieldValue('correspondant', event.target.checked)}
                label={labels.correspondant}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomCheckBox
                name='client'
                value={formik.values.client}
                onChange={event => formik.setFieldValue('client', event.target.checked)}
                label={labels.client}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomCheckBox
                name='company'
                value={formik.values.company}
                onChange={event => formik.setFieldValue('company', event.target.checked)}
                label={labels.company}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.OW_FEES_STATUS}
                name='feesStatus'
                label={labels.feesStatus}
                valueField='key'
                required
                displayField='value'
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('feesStatus', newValue?.key || '')
                }}
                maxAccess={maxAccess}
                error={formik.touched.feesStatus && Boolean(formik.errors.feesStatus)}
                readOnly={editMode}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.OW_RATE_STATUS}
                name='rateStatus'
                label={labels.rateStatus}
                valueField='key'
                required
                displayField='value'
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('rateStatus', newValue?.key || '')
                }}
                maxAccess={maxAccess}
                error={formik.touched.rateStatus && Boolean(formik.errors.rateStatus)}
                readOnly={editMode}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
