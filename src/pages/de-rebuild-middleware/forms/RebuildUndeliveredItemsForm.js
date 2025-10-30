import { Grid } from '@mui/material'
import * as yup from 'yup'
import { useContext } from 'react'
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
import { formatDateToISO } from 'src/lib/date-helper'
import Form from 'src/components/Shared/Form'

export default function RebuildUndeliveredItemsForm({ _labels, access }) {
  const { postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  const { formik } = useForm({
    initialValues: {
      startDate: null,
      endDate: null
    },
    maxAccess: access,
    validateOnChange: true,
    validationSchema: yup.object({
      startDate: yup
        .date()
        .required()
        .test(function (value) {
          const { endDate } = this.parent

          return value.getTime() <= endDate?.getTime()
        }),
      endDate: yup
        .date()
        .required()
        .test(function (value) {
          const { startDate } = this.parent

          return value.getTime() >= startDate?.getTime()
        })
    }),
    onSubmit: async obj => {
      try {
        const copy = { ...obj }
        copy.startDate = formatDateToISO(new Date(copy.startDate))
        copy.endDate = formatDateToISO(new Date(copy.endDate))

        const res = await postRequest({
          extension: DeliveryRepository.Reduild.rebuild,
          record: JSON.stringify(copy)
        })

        stack({
          Component: ThreadProgress,
          props: {
            recordId: res.recordId
          },
          closable: false
        })

        toast.success(platformLabels.Added)
        formik.setValues(obj)

        invalidate()
      } catch (error) {}
    }
  })

  const actions = [
    {
      key: 'Locked',
      condition: true,
      onClick: () => formik.handleSubmit(),
      disabled: false
    }
  ]

  return (
    <Form onSave={formik.handleSubmit} actions={actions} isSaved={false} editMode={true} maxAccess={access}>
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <CustomDatePicker
                name='startDate'
                label={_labels.startDate}
                max={formik.values.endDate}
                value={formik.values?.startDate}
                required
                onChange={formik.setFieldValue}
                onClear={() => formik.setFieldValue('startDate', '')}
                error={formik.touched.startDate && Boolean(formik.errors.startDate)}
                maxAccess={access}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='endDate'
                label={_labels.endDate}
                value={formik.values?.endDate}
                min={formik.values.startDate}
                required
                onChange={formik.setFieldValue}
                onClear={() => formik.setFieldValue('endDate', '')}
                error={formik.touched.endDate && Boolean(formik.errors.endDate)}
                maxAccess={access}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </Form>
  )
}
