import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import { useFormik } from 'formik'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { SaleRepository } from 'src/repositories/SaleRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { DataSets } from 'src/resources/DataSets'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'

export default function ScheduleForm({ labels, maxAccess, store, setStore }) {
  const { recordId } = store
  const { platformLabels } = useContext(ControlContext)
  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: SaleRepository.CommissionSchedule.page
  })

  const formik = useFormik({
    initialValues: {
      recordId: null,
      name: '',
      type: null
    },
    validationSchema: yup.object({
      name: yup.string().required(),
      type: yup.number().required()
    }),
    onSubmit: async obj => {
      const response = await postRequest({
        extension: SaleRepository.CommissionSchedule.set,
        record: JSON.stringify(obj)
      })

      if (!obj.recordId) {
        setStore({ recordId: response.recordId })
        formik.setFieldValue('recordId', response.recordId)
      }
      toast.success(!!obj.recordId ? platformLabels.Edited : platformLabels.Added)
      invalidate()
    }
  })

  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: SaleRepository.CommissionSchedule.get,
          parameters: `_recordId=${recordId}`
        })
        formik.setValues({ ...res.record })
      }
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.CommissionSchedule} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
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
                error={formik.touched.name && Boolean(formik.errors.name)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.TYPE}
                name='type'
                label={labels.type}
                required
                readOnly={editMode}
                maxAccess={maxAccess}
                valueField='key'
                displayField='value'
                values={formik.values}
                onClear={() => formik.setFieldValue('type', null)}
                onChange={(_, newValue) => {
                  formik.setFieldValue('type', newValue?.key || null)
                }}
                error={formik.touched.type && Boolean(formik.errors.type)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
