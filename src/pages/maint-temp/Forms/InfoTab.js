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
import { RepairAndServiceRepository } from 'src/repositories/RepairAndServiceRepository'
import { Grid } from '@mui/material'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { DataSets } from 'src/resources/DataSets'

export default function InfoTab({ labels, maxAccess, store, setStore, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const recordId = store?.recordId

  const invalidate = useInvalidate({
    endpointId: RepairAndServiceRepository.MaintenanceTemplates.page
  })

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      recordId: null,
      name: '',
      primaryMeter: null,
      secondaryMeter: null
    },
    validationSchema: yup.object({
      name: yup.string().required(),
      primaryMeter: yup.string().required()
    }),
    onSubmit: async obj => {
      const response = await postRequest({
        extension: RepairAndServiceRepository.MaintenanceTemplates.set,
        record: JSON.stringify(obj)
      })

      toast.success(obj.recordId ? platformLabels.Edited : platformLabels.Added)
      if (!obj.recordId) formik.setFieldValue('recordId', response.recordId)
      setStore(prevStore => ({
        ...prevStore,
        recordId: response.recordId
      }))
      invalidate()
      window.close()
    }
  })
  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: RepairAndServiceRepository.MaintenanceTemplates.get,
          parameters: `_recordId=${recordId}`
        })
        formik.setValues(res?.record)
      }
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.MaintenanceTemplates} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
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
                datasetId={DataSets.RS_EQUIPMENT_METER}
                label={labels.primaryMeter}
                name='primaryMeter'
                values={formik.values}
                valueField='key'
                displayField='value'
                maxAccess={maxAccess}
                required
                onChange={(event, newValue) => {
                  formik.setFieldValue('primaryMeter', newValue?.key || null)
                }}
                error={formik.touched.primaryMeter && Boolean(formik.errors.primaryMeter)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.RS_EQUIPMENT_METER}
                label={labels.secondaryMeter}
                name='secondaryMeter'
                values={formik.values}
                valueField='key'
                displayField='value'
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('secondaryMeter', newValue?.key || null)
                }}
                error={formik.touched.secondaryMeter && Boolean(formik.errors.secondaryMeter)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
