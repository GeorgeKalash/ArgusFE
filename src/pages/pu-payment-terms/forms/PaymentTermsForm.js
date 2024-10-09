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
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { ControlContext } from 'src/providers/ControlContext'
import { PurchaseRepository } from 'src/repositories/PurchaseRepository'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { DataSets } from 'src/resources/DataSets'

export default function PaymentTermsForm({ labels, maxAccess, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: PurchaseRepository.PaymentTerms.qry
  })

  const { formik } = useForm({
    initialValues: {
      recordId: recordId || null,
      name: '',
      reference: '',
      type: '',
      discount: '',
      discountDays: '',
      days: 0
    },
    maxAccess,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      name: yup.string().required(),
      reference: yup.string().required(),
      type: yup.string().required()
    }),
    onSubmit: async obj => {
      try {
        const response = await postRequest({
          extension: PurchaseRepository.PaymentTerms.set,
          record: JSON.stringify(obj)
        })

        if (!obj.recordId) {
          toast.success(platformLabels.Added)
          formik.setFieldValue('recordId', response.recordId)
        } else toast.success(platformLabels.Edited)

        invalidate()
      } catch (error) {}
    }
  })
  const editMode = !!formik.values.recordId
  useEffect(() => {
    ;(async function () {
      try {
        if (recordId) {
          const res = await getRequest({
            extension: PurchaseRepository.PaymentTerms.get,
            parameters: `_recordId=${recordId}`
          })

          formik.setValues(res.record)
        }
      } catch (error) {}
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.PaymentTerm} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
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
                name='name'
                label={labels.name}
                value={formik.values.name}
                required
                maxAccess={maxAccess}
                maxLength='30'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('name', '')}
                error={formik.touched.name && Boolean(formik.errors.name)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.PAYMENT_TERM_TYPE}
                name='type'
                label={labels.type}
                required
                valueField='key'
                displayField='value'
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('type', newValue?.key)
                }}
                error={formik.touched.type && Boolean(formik.errors.type)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='discountDays'
                label={labels.discountDays}
                value={formik.values.discountDays}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('discountDays', '')}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='days'
                label={labels.days}
                value={formik.values.days}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('days', 0)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='discount'
                label={labels.discount}
                value={formik.values.discount}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('discount', '')}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
