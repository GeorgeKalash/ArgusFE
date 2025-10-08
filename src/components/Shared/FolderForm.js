import { useContext } from 'react'
import toast from 'react-hot-toast'
import { ControlContext } from 'src/providers/ControlContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useForm } from 'src/hooks/form'
import { useInvalidate } from 'src/hooks/resource'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { Grid } from '@mui/material'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import FormShell from 'src/components/Shared/FormShell'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { RequestsContext } from 'src/providers/RequestsContext'
import useSetWindow from 'src/hooks/useSetWindow'

const FolderForm = ({ labels, values, maxAccess, window, resourceId, recordId }) => {
  const { platformLabels } = useContext(ControlContext)
  const { postRequest } = useContext(RequestsContext)

  useSetWindow({ title: labels.folderName, window })

  const invalidate = useInvalidate({
    endpointId: `${SystemRepository.Attachment.qry}::r=${resourceId}::rec=${recordId ?? 0}`
  })

  const { formik } = useForm({
    initialValues: {
      folderId: values.folderId
    },
    maxAccess,
    onSubmit: async () => {
      if (formik.values?.folderId) {
        const obj = { ...values, folderId: formik.values?.folderId }

        await postRequest({
          extension: SystemRepository.Attachment.set,
          record: JSON.stringify(obj)
        })
        invalidate()
        toast.success(platformLabels.Added)
        window.close()
      }
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
        <Grid item xs={6}>
          <ResourceComboBox
            endpointId={SystemRepository.Folders.qry}
            name='folderId'
            label={labels.folderName}
            valueField='recordId'
            displayField='name'
            maxAccess={maxAccess}
            values={formik.values}
            onChange={(event, newValue) => {
              formik.setFieldValue('folderId', newValue?.recordId || 1)
            }}
            error={formik.touched.folderId && Boolean(formik.errors.folderId)}
          />
        </Grid>
      </VertLayout>
    </FormShell>
  )
}

FolderForm.width = 400
FolderForm.height = 200

export default FolderForm
