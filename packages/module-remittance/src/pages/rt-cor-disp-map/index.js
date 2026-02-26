import { Grid } from '@mui/material'
import { useContext } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import * as yup from 'yup'
import { RemittanceSettingsRepository } from '@argus/repositories/src/repositories/RemittanceRepository'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import toast from 'react-hot-toast'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import Form from '@argus/shared-ui/src/components/Shared/Form'

const CorrespondentDispersal = () => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const initialValues = {
    corId: null,
    items: []
  }

  const { labels, access } = useResourceQuery({
    datasetId: ResourceIds.CorrespondentDispersal
  })

  const { formik } = useForm({
    initialValues,
    maxAccess: access,
    validationSchema: yup.object({
      corId: yup.string().required()
    }),
    onSubmit: async obj => {
      await postRequest({
        extension: RemittanceSettingsRepository.CorrespondentDispersal.set2,
        record: JSON.stringify(obj)
      })

      toast.success(platformLabels.Updated)
    }
  })

  const getData = async corId => {
    if (corId) {
      const res = await getRequest({
        extension: RemittanceSettingsRepository.CorrespondentDispersal.qry,
        parameters: `_corId=${corId}`
      })

      if (res?.list?.length > 0) {
        const items = res.list.map((item, index) => ({
          ...item,
          id: index + 1,
          dispersalType: parseInt(item.dispersalType)
        }))
        formik.setFieldValue('items', items)
      }
    } else {
      formik.setFieldValue('items', [])
    }
  }

  const columns = [
    {
      component: 'textfield',
      name: 'corDeliveryModeName',
      label: labels.corDeliveryModeName,
      props: {
        readOnly: true
      }
    },
    {
      component: 'resourcecombobox',
      label: labels.dispersalType,
      name: 'dispersalTypeName',
      props: {
        datasetId: DataSets.RT_Dispersal_Type,
        displayField: 'value',
        valueField: 'key',
        mapping: [
          { from: 'key', to: 'dispersalType' },
          { from: 'value', to: 'dispersalTypeName' }
        ]
      }
    }
  ]

  return (
    <Form onSave={formik.handleSubmit} maxAccess={access} fullSize>
      <VertLayout>
        <Fixed>
          <Grid container spacing={2} p={2}>
            <Grid item xs={4}>
              <ResourceComboBox
                endpointId={RemittanceSettingsRepository.Correspondent.qry2}
                name='corId'
                label={labels.correspondent}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                required
                onChange={(event, newValue) => {
                  getData(newValue?.recordId)
                  formik.setFieldValue('corId', newValue?.recordId || null)
                }}
              />
            </Grid>
          </Grid>
        </Fixed>

        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('items', value)}
            value={formik?.values?.items}
            error={formik.errors.items}
            name='items'
            allowAddNewLine={false}
            maxAccess={access}
            allowDelete={false}
            columns={columns}
          />
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default CorrespondentDispersal
