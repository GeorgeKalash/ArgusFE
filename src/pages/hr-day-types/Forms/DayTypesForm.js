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

const colorPalette = [
  '#000000',
  '#993300',
  '#333300',
  '#003300',
  '#003366',
  '#000080',
  '#333399',
  '#333333',
  '#800000',
  '#FF6600',
  '#808000',
  '#008000',
  '#008080',
  '#0000FF',
  '#666699',
  '#808080',
  '#FF0000',
  '#FF9900',
  '#99CC00',
  '#339966',
  '#33CCCC',
  '#3366FF',
  '#800080',
  '#969696',
  '#FF00FF',
  '#FFCC00',
  '#FFFF00',
  '#00FF00',
  '#00FFFF',
  '#00CCFF',
  '#993366',
  '#C0C0C0',
  '#FF99CC',
  '#FFCC99',
  '#FFFF99',
  '#CCFFCC',
  '#CCFFFF',
  '#99CCFF',
  '#CC99FF',
  '#FFFFFF'
]

export default function DayTypesForm({ labels, maxAccess, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: TimeAttendanceRepository.DayTypes.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      name: '',
      reference: ''
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
                label={labels.color}
                colorPalette={colorPalette}
                value={formik.values.color}
                onChange={(field, hex) => formik.setFieldValue(field, hex)}
                required
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
