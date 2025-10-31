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
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { DataSets } from 'src/resources/DataSets'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { PayrollRepository } from 'src/repositories/PayrollRepository'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'

export default function IndemnityForm({ labels, maxAccess, store, setStore }) {
  const { recordId } = store
  const { platformLabels } = useContext(ControlContext)
  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: PayrollRepository.IndemnitySchedule.page
  })

  const formik = useFormik({
    initialValues: {
      recordId: null,
      name: '',
      calcMethod: null,
      minResignationDays: null
    },
    validationSchema: yup.object({
      name: yup.string().required(),
      calcMethod: yup.number().required(),
      minResignationDays: yup.number().max(32767).required()
    }),
    onSubmit: async obj => {
      const response = await postRequest({
        extension: PayrollRepository.IndemnitySchedule.set,
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
          extension: PayrollRepository.IndemnitySchedule.get,
          parameters: `_recordId=${recordId}`
        })
        formik.setValues(res.record)
      }
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.Indemnity} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
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
              <CustomNumberField
                name='minResignationDays'
                label={labels.minResignationDays}
                value={formik.values?.minResignationDays}
                required
                maxLength='7'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('minResignationDays', null)}
                maxAccess={maxAccess}
                error={formik.touched.minResignationDays && Boolean(formik.errors.minResignationDays)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.INDEMNITY_CALC_METHOD}
                name='calcMethod'
                label={labels.calcMethode}
                required
                readOnly={editMode}
                maxAccess={maxAccess}
                valueField='key'
                displayField='value'
                values={formik.values}
                onClear={() => formik.setFieldValue('calcMethod', null)}
                onChange={(_, newValue) => {
                  formik.setFieldValue('calcMethod', newValue?.key || null)
                }}
                error={formik.touched.calcMethod && Boolean(formik.errors.calcMethod)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
