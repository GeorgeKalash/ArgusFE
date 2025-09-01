import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { useForm } from 'src/hooks/form'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { ControlContext } from 'src/providers/ControlContext'
import { useInvalidate } from 'src/hooks/resource'
import { TimeAttendanceRepository } from 'src/repositories/TimeAttendanceRepository'
import ColorComboBox from 'src/components/Shared/ColorCombobox'
import CustomCheckBox from 'src/components/Inputs/CustomCheckBox'

export default function DayTypesForm({ labels, maxAccess, recordId, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: TimeAttendanceRepository.DayTypes.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      name: '',
      color: ''
    },
    validateOnChange: true,
    validationSchema: yup.object({
      name: yup.string().required(),
      color: yup.string().required()
    }),
    onSubmit: async obj => {
      const response = await postRequest({
        extension: TimeAttendanceRepository.DayTypes.set,
        record: JSON.stringify(obj)
      })

      toast.success(!obj.recordId ? platformLabels.Added : platformLabels.Edited)
      formik.setFieldValue('recordId', response.recordId)

      invalidate()
      window.close()
    }
  })
  const editMode = !!formik.values.recordId
  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: TimeAttendanceRepository.DayTypes.get,
          parameters: `_recordId=${recordId}`
        })

        formik.setValues(res.record)
      }
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.PaymentReasons} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomTextField
                name='name'
                label={labels.name}
                value={formik.values.name}
                required
                maxAccess={maxAccess}
                maxLength='50'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('name', '')}
                error={formik.touched.name && Boolean(formik.errors.name)}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomCheckBox
                name='isWorkingDay'
                value={formik.values.isWorkingDay}
                onChange={event => formik.setFieldValue('isWorkingDay', event.target.checked)}
                label={labels.isWorkingDay}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <ColorComboBox
                name='color'
                label={labels.color}
                value={formik.values.color}
                onChange={(field, hex) => formik.setFieldValue(field, hex)}
                required
                maxAccess={maxAccess}
                error={formik.touched.color && Boolean(formik.errors.color)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
