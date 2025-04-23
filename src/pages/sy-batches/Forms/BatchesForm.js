import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { DataSets } from 'src/resources/DataSets'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { SystemRepository } from 'src/repositories/SystemRepository'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'

export default function BatchesForm({ labels, maxAccess, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: SystemRepository.Batch.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      reference: '',
      name: '',
      functionId: null,
      date: new Date()
    },
    maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      reference: yup.string().required(),
      name: yup.string().required(),
      functionId: yup.number().required(),
      date: yup.date().required()
    }),
    onSubmit: async obj => {
      const res = {
        ...obj,
        date: formatDateToApi(obj.date)
      }

      const response = await postRequest({
        extension: SystemRepository.Batch.set,
        record: JSON.stringify(res)
      })

      toast.success(!obj.recordId ? platformLabels.Added : platformLabels.Edited)
      await getData(response.recordId)
      invalidate()
    }
  })

  const editMode = !!formik.values.recordId

  const getData = async recordId => {
    if (recordId) {
      const res = await getRequest({
        extension: SystemRepository.Batch.get,
        parameters: `_recordId=${recordId}`
      })
      formik.setValues({
        ...res.record,
        date: formatDateFromApi(res.record.date)
      })
    }
  }
  useEffect(() => {
    ;(async function () {
      await getData(recordId)
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.Batches} form={formik} maxAccess={maxAccess} editMode={editMode}>
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
                maxLength='30'
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
                maxLength='50'
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('name', '')}
                error={formik.touched.name && Boolean(formik.errors.name)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.SYSTEM_FUNCTION}
                name='functionId'
                label={labels.systemFunction}
                required
                valueField='key'
                displayField='value'
                values={formik.values}
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('functionId', null)}
                onChange={(_, newValue) => {
                  formik.setFieldValue('functionId', newValue?.key || null)
                }}
                error={formik.touched.functionId && Boolean(formik.errors.functionId)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='date'
                required
                label={labels.date}
                value={formik?.values?.date}
                onChange={formik.setFieldValue}
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('date', null)}
                error={formik.touched.date && Boolean(formik.errors.date)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
