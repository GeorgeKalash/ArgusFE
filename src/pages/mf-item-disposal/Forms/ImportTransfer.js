import { useContext } from 'react'
import * as yup from 'yup'
import { RequestsContext } from 'src/providers/RequestsContext'
import { Grid } from '@mui/material'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { BusinessPartnerRepository } from 'src/repositories/BusinessPartnerRepository'
import { useForm } from 'src/hooks/form'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import Form from 'src/components/Shared/Form'

export default function ImportTransfer({ maxAccess, labels }) {
  const { getRequest } = useContext(RequestsContext)

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      groupId: ''
    },
    maxAccess,
    validationSchema: yup.object({
      groupId: yup.string().required()
    }),
    onSubmit: async obj => {}
  })

  const actions = [
    {
      key: 'Ok',
      condition: true,
      onClick: () => {}
    }
  ]

  return (
    <Form form={formik} isSaved={false} actions={actions} maxAccess={maxAccess}>
      <VertLayout>
        <Grow>
          <Grid container>
            <Grid item xs={12}>
              {/* <ResourceComboBox
                endpointId={BusinessPartnerRepository.Group.qry}
                name='groupId'
                label={labels.materialsTransfer}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: ' Ref' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                required
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik && formik.setFieldValue('groupId', newValue?.recordId)
                }}
                error={formik.touched.groupId && Boolean(formik.errors.groupId)}
              /> */}
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </Form>
  )
}
