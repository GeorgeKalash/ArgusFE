import { Grid } from '@mui/material'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { BusinessPartnerRepository } from '@argus/repositories/src/repositories/BusinessPartnerRepository'
import { useContext, useEffect } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import Form from '@argus/shared-ui/src/components/Shared/Form'

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
          <Grid container>
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
                  formik.setFieldValue('roleId', newValue?.recordId || null)
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
