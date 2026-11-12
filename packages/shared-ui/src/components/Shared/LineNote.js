import { useContext } from 'react'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import Form from '@argus/shared-ui/src/components/Shared/Form'
import CustomTextArea from '@argus/shared-ui/src/components/Inputs/CustomTextArea'

const LineNotes = ({ row, readOnly, onSave, maxAccess, window }) => {
  const { platformLabels } = useContext(ControlContext)

  const { formik } = useForm({
    initialValues: { note: row?.note || '' }
  })

  const ok = () => {
    onSave(row, formik.values.note.trim())
    window.close()
  }

  const actions = [
    {
      key: 'Ok',
      condition: true,
      onClick: ok,
      disabled: readOnly
    }
  ]

  return (
    <Form onSave={ok} actions={actions} maxAccess={maxAccess} editMode={false} isSaved={false}>
      <VertLayout>
        <Grow>
          <CustomTextArea
            name='note'
            label={platformLabels?.notes}
            value={formik.values.note}
            rows={4}
            maxLength='500'
            readOnly={readOnly}
            maxAccess={maxAccess}
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('note', '')}
          />
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default LineNotes