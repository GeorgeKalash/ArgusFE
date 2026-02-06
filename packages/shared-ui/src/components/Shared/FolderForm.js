import { useContext } from 'react'
import toast from 'react-hot-toast'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { Grid } from '@mui/material'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'
import Form from './Form'

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
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess}>
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
    </Form>
  )
}

FolderForm.width = 400
FolderForm.height = 200

export default FolderForm
