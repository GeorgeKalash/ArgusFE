import { useContext, useRef } from 'react'
import toast from 'react-hot-toast'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import FileUpload from '../Inputs/FileUpload'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'
import Form from './Form'

const AttachmentForm = ({ resourceId, recordId, seqNo, window }) => {
  const { platformLabels } = useContext(ControlContext)
  const fileUploadRef = useRef(null)

  useSetWindow({ title: platformLabels.Attachment, window })

  const invalidate = useInvalidate({
    endpointId: `${SystemRepository.Attachment.qry}::r=${resourceId}::rec=${recordId ?? 0}`,
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
