import { useContext } from 'react'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { ThreadProgress } from '@argus/shared-ui/src/components/Shared/ThreadProgress'
import { DeliveryRepository } from '@argus/repositories/src/repositories/DeliveryRepository'
import Form from '@argus/shared-ui/src/components/Shared/Form'

export default function RebuildUndeliveredItemsForm({ access }) {
  const { postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  const { formik } = useForm({
    initialValues: {},
    maxAccess: access,
    onSubmit: async obj => {
      const res = await postRequest({
        extension: DeliveryRepository.Reduild.rebuild,
        record: JSON.stringify({})
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
    </Form>
  )
}
