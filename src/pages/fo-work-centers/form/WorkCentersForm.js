import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useForm } from 'src/hooks/form'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { FoundryRepository } from 'src/repositories/FoundryRepository'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import { DataSets } from 'src/resources/DataSets'

export default function WorkCentersForm({ labels, workCenterId, maxAccess }) {
  const { platformLabels } = useContext(ControlContext)

  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: FoundryRepository.WorkCenter.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      workCenterId: null,
      activity: ''
    },
    maxAccess,
    enableReinitialize: true,
    validateOnChange: true,

    validationSchema: yup.object({
      workCenterId: yup.string().required(),
      activity: yup.string().required()
    }),
    onSubmit: async obj => {
      const workCenterId = obj.workCenterId

      await postRequest({
        extension: FoundryRepository.WorkCenter.set,
        record: JSON.stringify(obj)
      })

      if (!workCenterId) {
        toast.success(platformLabels.Added)
        formik.setValues(obj)
      } else toast.success(platformLabels.Edited)
      formik.setFieldValue('recordId', formik.values.workCenterId)
      invalidate()
    }
  })

  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (workCenterId) {
        const res = await getRequest({
          extension: FoundryRepository.WorkCenter.get,
          parameters: `_workCenterId=${workCenterId}`
        })

        formik.setValues({ ...res.record, recordId: res.record.workCenterId })
      }
    })()
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.FoWorkCenters}
      form={formik}
      maxAccess={maxAccess}
      isSavedClear={false}
      editMode={editMode}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={ManufacturingRepository.WorkCenter.qry}
                name='workCenterId'
                label={labels.workCenter}
                readOnly={editMode}
                valueField='recordId'
                displayField='name'
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                required
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('workCenterId', newValue?.recordId || '')
                }}
                error={formik.touched.workCenterId && formik.errors.workCenterId}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.Activity}
                name='activity'
                label={labels.activity}
                required
                valueField='key'
                displayField='value'
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('activity', newValue?.key || '')
                }}
                error={formik.touched.activity && Boolean(formik.errors.activity)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
