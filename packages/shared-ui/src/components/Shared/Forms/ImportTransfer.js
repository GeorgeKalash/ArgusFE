import { Grid } from '@mui/material'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import Form from '@argus/shared-ui/src/components/Shared/Form'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import * as yup from 'yup'

export default function ImportTransfer({ maxAccess, labels, onImport, window }) {

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      dtId: null,
      transferId: null
    },
    validationSchema: yup.object({
      dtId: yup.string().required(),
      transferId: yup.string().required()
    }),
    onSubmit: async values => {
      onImport(values?.transferId, true)
      window.close()
    }
  })

  const actions = [
    {
      key: 'Import',
      condition: true,
      onClick: () => {
        formik.handleSubmit()
      }
    }
  ]

  return (
    <Form isSaved={false} actions={actions} maxAccess={maxAccess} editMode={true}>
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.DocumentType.qry}
                parameters={`_dgId=${SystemFunction.MaterialTransfer}&_startAt=0&_pageSize=1000`}
                name='dtId'
                label={labels.documentType}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                onChange={async (_, newValue) => {
                  formik.setValues({
                    transferId: null,
                    transferRef: '',
                    dtId: newValue?.recordId || null
                  })
                }}
                error={formik.touched.dtId && Boolean(formik.errors.dtId)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={InventoryRepository.MaterialsTransfer.snapshot2}
                parameters={{
                  _dtId: formik.values.dtId
                }}
                valueField='reference'
                displayField='reference'
                name='transferRef'
                label={labels.MaterialsTransfer}
                form={formik}
                secondDisplayField={false}
                maxAccess={maxAccess}
                required
                readOnly={!formik.values.dtId}
                onChange={async (_, newValue) => {
                  formik.setFieldValue('transferRef', newValue?.reference || '')
                  formik.setFieldValue('transferId', newValue?.recordId || null)
                }}
                errorCheck={'transferId'}
              />
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </Form>
  )
}
