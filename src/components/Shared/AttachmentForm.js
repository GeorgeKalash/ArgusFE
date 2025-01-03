import { useContext, useRef } from 'react'
import toast from 'react-hot-toast'
import { ControlContext } from 'src/providers/ControlContext'
import { VertLayout } from './Layouts/VertLayout'
import { Grow } from './Layouts/Grow'
import FileUpload from '../Inputs/FileUpload'
import FormShell from './FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useForm } from 'src/hooks/form'
import { useInvalidate } from 'src/hooks/resource'
import { SystemRepository } from 'src/repositories/SystemRepository'

const AttachmentForm = ({ resourceId, recordId, maxAccess, seqNo, window }) => {
  const { platformLabels } = useContext(ControlContext)
  const fileUploadRef = useRef(null)

  const invalidate = useInvalidate({
    endpointId: SystemRepository.Attachment.qry
  })

  const { formik } = useForm({
    initialValues: {
      resourceId: resourceId,
      seqNo: seqNo
    },
    enableReinitialize: false,
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
    <FormShell
      resourceId={ResourceIds.SystemAttachments}
      form={formik}
      isSavedClear={false}
      isCleared={false}
      isInfo={false}
    >
      <VertLayout>
        <Grow>
          <FileUpload
            ref={fileUploadRef}
            resourceId={ResourceIds.SystemAttachments}
            seqNo={seqNo}
            recordId={recordId}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default AttachmentForm
