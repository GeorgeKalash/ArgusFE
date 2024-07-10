import { Grid } from '@mui/material'
import { useContext } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { DocumentReleaseRepository } from 'src/repositories/DocumentReleaseRepository'
import { AccessControlRepository } from 'src/repositories/AccessControlRepository'

export default function ReleaseCodeForm({ labels, maxAccess, recordId, window }) {
  const { postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: AccessControlRepository.SGReleaseCode.qry
  })

  const { formik } = useForm({
    initialValues: {
      sgId: recordId,
      codeId: null
    },
    maxAccess,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      codeId: yup.string().required()
    }),
    onSubmit: async obj => {
      try {
        await postRequest({
          extension: AccessControlRepository.SGReleaseCode.set,
          record: JSON.stringify(obj)
        })
        toast.success('Record Added Successfully')
        invalidate()
        window.close()
      } catch (error) {}
    }
  })

  return (
    <FormShell
      resourceId={ResourceIds.SecurityGroup}
      form={formik}
      maxAccess={maxAccess}
      editMode={!!recordId}
      isCleared={false}
      isInfo={false}
    >
      <VertLayout>
        <Grow>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={DocumentReleaseRepository.ReleaseCode.qry}
              parameters='_startAt=0&_pageSize=1000'
              name='codeId'
              label={labels.code}
              valueField='recordId'
              displayField='name'
              values={formik.values}
              onChange={(event, newValue) => {
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
