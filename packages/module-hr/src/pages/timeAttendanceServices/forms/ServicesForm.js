import { useContext } from 'react'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { ThreadProgress } from '@argus/shared-ui/src/components/Shared/ThreadProgress'
import Form from '@argus/shared-ui/src/components/Shared/Form'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import SuccessDialog from '@argus/shared-ui/src/components/Shared/SuccessDialog'

export default function ServicesForm({ access }) {
  const { platformLabels } = useContext(ControlContext)
  const { postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const query = new URLSearchParams(window.location.search)
  const api = query.get('api')

  const { formik } = useForm({
    initialValues: {}, 
    maxAccess: access,
    onSubmit: async () => {
      const res = await postRequest({
        extension: api,
        record: null
      })

    const response = res?.recordId
    if (!response) return

    const recordId = Number(response)
    if (!Number.isInteger(recordId)) {
       stack({
          Component: SuccessDialog,
          props: {
            open: true,
            fullScreen: false,
            message: response
          }
        })

      return
    }

    toast.success(platformLabels.Added)
    stack({
      Component: ThreadProgress,
      props: { recordId },
      closable: false
    })
    }
  })

  return (
    <Form onSave={formik.handleSubmit} editMode={true} maxAccess={access}></Form>
  )
}
