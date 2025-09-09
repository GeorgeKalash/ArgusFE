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
import { RepairAndServiceRepository } from 'src/repositories/RepairAndServiceRepository'
import CustomCheckBox from 'src/components/Inputs/CustomCheckBox'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { createConditionalSchema } from 'src/lib/validation'

export default function InspectionTemplateForm({ labels, maxAccess, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: RepairAndServiceRepository.InspectionTemplate.page
  })

  const conditions = {
    taskName: row => row?.taskName
  }

  const { schema, requiredFields } = createConditionalSchema(conditions, true, maxAccess, 'items')

  const { formik } = useForm({
    conditionSchema: ['items'],
    maxAccess,
    initialValues: {
      recordId: null,
      name: '',
      allowSkipTask: false,
      items: [
        {
          id: 1,
          itId: recordId || 0,
          taskName: '',
          seqNo: 1
        }
      ]
    },
    validationSchema: yup.object({
      name: yup.string().required(),
      items: yup.array().of(schema)
    }),
    onSubmit: async obj => {
      const { items, ...values } = obj

      const modifiedList = items
        .filter(row => Object.values(requiredFields)?.every(fn => fn(row)))
        ?.map((item, index) => ({
          ...item,
          id: index + 1,
          seqNo: index + 1,
          itId: recordId
        }))

      const response = await postRequest({
        extension: RepairAndServiceRepository.InspectionTemplate.set2,
        record: JSON.stringify({
          header: {
            ...values
          },
          items: modifiedList
        })
      })

      toast.success(!obj.recordId ? platformLabels.Added : platformLabels.Edited)
      formik.setFieldValue('recordId', response.recordId)

      invalidate()
    }
  })

  console.log(formik)
  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: RepairAndServiceRepository.InspectionTemplate.get2,
          parameters: `_recordId=${recordId}`
        })

        const modifiedList = res?.record?.items?.map((item, index) => ({
          ...item,
          id: index + 1,
          seqNo: index + 1
        }))

        formik.setValues({
          ...res?.record?.header,
          items: modifiedList
        })
      }
    })()
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.InspectionTemplate}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      isCleared={false}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
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
              <CustomCheckBox
                name='allowSkipTask'
                value={formik.values?.allowSkipTask}
                onChange={event => formik.setFieldValue('allowSkipTask', event.target.checked)}
                label={labels.allowSkipTask}
                maxAccess={maxAccess}
              />
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('items', value)}
            name='items'
            value={formik.values.items}
            error={formik.errors.items}
            maxAccess={maxAccess}
            columns={[
              {
                component: 'textfield',
                label: labels.task,
                name: 'taskName'
              }
            ]}
            allowDelete={true}
            allowAddNewLine={true}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
