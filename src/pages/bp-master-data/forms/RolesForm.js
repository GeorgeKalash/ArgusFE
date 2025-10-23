import { Grid } from '@mui/material'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { BusinessPartnerRepository } from 'src/repositories/BusinessPartnerRepository'
import { useContext, useEffect } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'
import { useInvalidate } from 'src/hooks/resource'
import Form from 'src/components/Shared/Form'

const RolesForm = ({ roleId, recordId, labels, window, maxAccess }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: BusinessPartnerRepository.MasterDataRole.qry
  })

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      bpId: recordId,
      roleId: null
    },
    validationSchema: yup.object({
      roleId: yup.string().required()
    }),
    onSubmit: async obj => {
      await postRequest({
        extension: BusinessPartnerRepository.MasterDataRole.set,
        record: JSON.stringify(obj)
      })
      invalidate()
      toast.success(!obj.roleId ? platformLabels.Added : platformLabels.Edited)
      window.close()
    }
  })

  useEffect(() => {
    async function fetchData() {
      const res = await getRequest({
        extension: BusinessPartnerRepository.MasterDataRole.get,
        parameters: `_bpId=${recordId}&_roleId=${roleId}`
      })
      formik.setValues(res.record)
    }
    if (roleId) fetchData()
  }, [])

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess}>
      <VertLayout>
        <Grow>
          <Grid container gap={2}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={BusinessPartnerRepository.Role.qry}
                name='roleId'
                label={labels.role}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                valueField='recordId'
                displayField='name'
                values={formik.values}
                maxAccess={maxAccess}
                required
                onChange={(_, newValue) => {
                  formik && formik.setFieldValue('roleId', newValue?.recordId || '')
                }}
                error={formik.touched.roleId && Boolean(formik.errors.roleId)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default RolesForm
