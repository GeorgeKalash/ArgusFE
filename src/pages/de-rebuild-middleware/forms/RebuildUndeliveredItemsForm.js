import { Grid } from '@mui/material'
import * as yup from 'yup'
import { useContext } from 'react'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { ControlContext } from 'src/providers/ControlContext'
import { useWindow } from 'src/windows'
import { ThreadProgress } from 'src/components/Shared/ThreadProgress'
import { DeliveryRepository } from 'src/repositories/DeliveryRepository'

export default function RebuildUndeliveredItemsForm({ _labels, access }) {
  const { postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  const { formik } = useForm({
    initialValues: {
      startDate: null,
      endDate: null,
    },
    enableReinitialize: false,
    maxAccess: access,
    validateOnChange: true,
    validationSchema: yup.object({
      startDate: yup.string().required(),
      endDate: yup.string().required()
    }),
    onSubmit: async obj => {
      try {
        const res = await postRequest({
          extension: DeliveryRepository.Reduild.rebuild,
          record: JSON.stringify(obj)
        })

        stack({
          Component: ThreadProgress,
          props: {
            recordId: res.recordId
          },
          width: 500,
          height: 450,
          closable: false,
          title: platformLabels.Progress
        })

        toast.success(platformLabels.Added)
        formik.setValues(obj)

        invalidate()
      } catch (error) {}
    }
  })

  const actions = [
    {
      key: 'Post',
      condition: true,
      onClick: () => formik.handleSubmit(),
      disabled: false
    }
  ]

  return (
    <FormShell
      form={formik}
      actions={actions}
      isSaved={false}
      editMode={true}
      isInfo={false}
      isCleared={false}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <CustomDatePicker
                name='startDate'
                label={_labels.startDate}
                value={formik.values?.startDate}
                required
                onChange={formik.setFieldValue}
                onClear={() => formik.setFieldValue('startDate', '')}
                error={formik.touched.startDate && Boolean(formik.errors.startDate)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='endDate'
                label={_labels.endDate}
                value={formik.values?.endDate}
                required
                onChange={formik.setFieldValue}
                onClear={() => formik.setFieldValue('endDate', '')}
                disabledRangeDate={{ date: formik.values.startDate }}
                error={formik.touched.endDate && Boolean(formik.errors.endDate)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
