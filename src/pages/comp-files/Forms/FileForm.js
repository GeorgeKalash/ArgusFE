import { useContext, useRef } from 'react'
import toast from 'react-hot-toast'
import { ControlContext } from 'src/providers/ControlContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useForm } from 'src/hooks/form'
import { useInvalidate } from 'src/hooks/resource'
import { SystemRepository } from 'src/repositories/SystemRepository'
import FormShell from 'src/components/Shared/FormShell'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import FileUpload from 'src/components/Inputs/FileUpload'

const FileForm = ({ resourceId, recordId, seqNo, window }) => {
  const { platformLabels } = useContext(ControlContext)
  const fileUploadRef = useRef(null)

  const invalidate = useInvalidate({
    endpointId: SystemRepository.Attachment.qry
  })

  const { formik } = useForm({
    initialValues: {
      resourceId,
      seqNo
    },
    validateOnChange: false,
    onSubmit: async () => {
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
          <FileUpload ref={fileUploadRef} resourceId={resourceId} seqNo={seqNo} recordId={recordId} showFolder={true} />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default FileForm
