import { useContext, useRef } from 'react'
import toast from 'react-hot-toast'
import { ControlContext } from 'src/providers/ControlContext'
import { VertLayout } from './Layouts/VertLayout'
import { Grow } from './Layouts/Grow'
import FileUpload from '../Inputs/FileUpload'
import { useForm } from 'src/hooks/form'
import { useInvalidate } from 'src/hooks/resource'
import { SystemRepository } from 'src/repositories/SystemRepository'
import useSetWindow from 'src/hooks/useSetWindow'
import Form from './Form'

const AttachmentForm = ({ resourceId, recordId, seqNo, window }) => {
  const { platformLabels } = useContext(ControlContext)
  const fileUploadRef = useRef(null)

  useSetWindow({ title: platformLabels.Attachment, window })

  const invalidate = useInvalidate({
    endpointId: SystemRepository.Attachment.qry
  })

  const { formik } = useForm({
    initialValues: {
      resourceId,
      seqNo
    },
    validateOnChange: false,
    onSubmit: async obj => {
      if (fileUploadRef.current) {
        await fileUploadRef.current.submit()
      }
      invalidate()
      toast.success(platformLabels.Added)
      window.close()
    }
  })

  return (
    <Form onSave={formik.handleSubmit}>
      <VertLayout>
        <Grow>
          <FileUpload ref={fileUploadRef} resourceId={resourceId} seqNo={seqNo} recordId={recordId} />
        </Grow>
      </VertLayout>
    </Form>
  )
}

AttachmentForm.width = 800
AttachmentForm.height = 500

export default AttachmentForm
