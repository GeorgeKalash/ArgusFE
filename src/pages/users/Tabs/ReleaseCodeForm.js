import { Grid } from '@mui/material'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { useForm } from 'src/hooks/form'
import FormShell from 'src/components/Shared/FormShell'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useContext } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { AccessControlRepository } from 'src/repositories/AccessControlRepository'
import toast from 'react-hot-toast'
import * as yup from 'yup'
import { DocumentReleaseRepository } from 'src/repositories/DocumentReleaseRepository'
import { ControlContext } from 'src/providers/ControlContext'

const ReleaseCodeForm = ({ labels, maxAccess, storeRecordId, invalidate, window }) => {
  const { postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { formik } = useForm({
    enableReinitialize: false,
    validateOnChange: true,
    initialValues: {
      userId: storeRecordId,
      codeId: null
    },
    validationSchema: yup.object({
      codeId: yup.string().required()
    }),
    onSubmit: async obj => {
      try {
        await postRequest({
          extension: AccessControlRepository.UserReleaseCode.set,
          record: JSON.stringify(obj)
        })
        toast.success(platformLabels.Updated)
        window.close()
        invalidate()
      } catch (error) {}
    }
  })

  return (
    <FormShell
      resourceId={ResourceIds.Users}
      form={formik}
      maxAccess={maxAccess}
      editMode={!!storeRecordId}
      isInfo={false}
      isCleared={false}
    >
      <VertLayout>
        <Grow>
          <Grid item xs={6}>
            <ResourceComboBox
              endpointId={DocumentReleaseRepository.ReleaseCode.qry}
              parameters={`_filter=&_startAt=${0}&_pageSize=${1000}`}
              name='codeId'
              label={labels.code}
              valueField='recordId'
              displayField='name'
              required
              values={formik.values}
              onChange={async (event, newValue) => {
                formik.setFieldValue('codeId', newValue ? newValue.recordId : null)
              }}
              error={formik.touched.codeId && Boolean(formik.errors.codeId)}
              maxAccess={maxAccess}
            />
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default ReleaseCodeForm
