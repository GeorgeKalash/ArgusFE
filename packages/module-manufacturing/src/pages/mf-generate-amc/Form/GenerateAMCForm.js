import { useContext } from 'react'
import { Grid } from '@mui/material'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { ManufacturingRepository } from '@argus/repositories/src/repositories/ManufacturingRepository'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import Form from '@argus/shared-ui/src/components/Shared/Form'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'

export default function GenerateAMCForm({ _labels, access }) {
  const { postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { formik } = useForm({
    initialValues: {
      itemCategoryId: null,
      productionLevel: null
    },
    maxAccess: access,
    onSubmit: async obj => {
      await postRequest({
        extension: ManufacturingRepository.GenerateAMC.generate,
        record: JSON.stringify(obj)
      })

      toast.success(platformLabels.Generated)
    }
  })

  const actions = [
    {
      key: 'generate',
      condition: true,
      onClick: () => formik.handleSubmit(),
      onClick: () => formik.handleSubmit(),
      disabled: false
    }
  ]

  return (
    <Form actions={actions} maxAccess={access} isSaved={false} >
      <VertLayout>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={InventoryRepository.Category.qry}
              parameters='_name=&_pageSize=1000&_startAt=0'
              values={formik.values}
              name='itemCategoryId'
              label={_labels.itemCategory}
              valueField='recordId'
              displayField={['caRef', 'name']}
              columnsInDropDown={[
                { key: 'caRef', value: 'Reference' },
                { key: 'name', value: 'Name' }
              ]}
              maxAccess={access}
              onChange={(_, newValue) => {
                formik.setFieldValue('itemCategoryId', newValue?.recordId || null)
              }}
              error={formik.touched.itemCategoryId && Boolean(formik.errors.itemCategoryId)}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              datasetId={DataSets.PRODUCTION_LEVEL}
              name='productionLevel'
              label={_labels.productionLevel}
              valueField='key'
              displayField='value'
              values={formik.values}
              onChange={(_, newValue) => formik.setFieldValue('productionLevel', newValue?.key || null)}
              maxAccess={access}
              error={formik.touched.productionLevel && Boolean(formik.errors.productionLevel)}
            />
          </Grid>
        </Grid>
      </VertLayout>
    </Form>
  )
}
