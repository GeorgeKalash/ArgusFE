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

export default function TasksForm({ taskInfo, maxAccess, labels }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { templateId: recordId, taskId } = taskInfo

  const invalidate = useInvalidate({
    endpointId: RepairAndServiceRepository.MaintenanceTemplateTask.qry
  })

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      recordId: null,
      namePMT: null,
      tbd: false,
      tbdEvery: null,
      tbdFrequency: null,
      tbdReminder: null,
      tbh: false,
      tbhEvery: null,
      tbhReminder: null,
      expectedLaborHrs: null,
      notes: ''
    },
    validationSchema: yup.object({
      namePMT: yup.string().required()
    }),
    onSubmit: async obj => {
      const response = await postRequest({
        extension: RepairAndServiceRepository.MaintenanceTemplateTask.set,
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
  const editMode = !!formik?.values?.recordId

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: RepairAndServiceRepository.MaintenanceTemplateTask.get,
          parameters: `_templateId=${recordId}&_taskId=${taskId}`
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
              <ResourceComboBox
                endpointId={LogisticsRepository.LoCarrier.qry}
                name='namePMT'
                label={labels.name}
                values={formik.values}
                valueField='recordId'
                displayField='name'
                required
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('namePMT', newValue?.recordId || null)
                }}
                error={formik.touched.namePMT && Boolean(formik.errors.namePMT)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
