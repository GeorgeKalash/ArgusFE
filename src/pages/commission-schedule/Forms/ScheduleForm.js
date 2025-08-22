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

export default function ScheduleForm({ labels, maxAccess, recordId, editMode, setEditMode, setSelectedRecordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: SaleRepository.CommissionSchedule.qry
  })

  const formik = useFormik({
    initialValues: {
      recordId: null,
      name: '',
      type: ''
    },
    validateOnChange: true,
    validationSchema: yup.object({
      name: yup.string().required(),
      type: yup.string().required()
    }),
    onSubmit: async obj => {
      const response = await postRequest({
        extension: SaleRepository.CommissionSchedule.set,
        record: JSON.stringify(obj)
      })

      !obj.recordId &&
        formik.setValues({
          ...obj,
          recordId: response.recordId
        })
      !obj.recordId && setSelectedRecordId(response.recordId)
      toast.success(!obj.recordId ? platformLabels.Added : platformLabels.Edited)
      setEditMode(true)

      invalidate()
    }
  })

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: SaleRepository.CommissionSchedule.get,
          parameters: `_recordId=${recordId}`
        })

        formik.setValues(res.record)
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
                label={labels[2]}
                value={formik.values.name}
                required
                maxAccess={maxAccess}
                maxLength='30'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('name', '')}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.TYPE}
                name='type'
                label={labels[3]}
                valueField='key'
                displayField='value'
                values={formik.values}
                required
                readOnly={editMode}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('type', newValue?.key)
                }}
                error={formik.touched.type && Boolean(formik.errors.type)}
                helperText={formik.touched.type && formik.errors.type}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
