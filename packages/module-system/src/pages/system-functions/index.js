import { useContext } from 'react'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import Form from '@argus/shared-ui/src/components/Shared/Form'

const SystemFunction = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const getGridData = async () => {
    const resSystemFunction = await getRequest({
      extension: SystemRepository.SystemFunction.qry,
      parameters: `_filter=`
    })

    formik.resetForm({
      values: {
        ...formik.values,
        rows: resSystemFunction.list.map(({ integrationLevel, ...rest }, index) => ({
          id: index + 1,
          integrationLevel: integrationLevel ?? '1',
          ...rest
        }))
      }
    })
  }

  const { labels: labels, access } = useResourceQuery({
    queryFn: getGridData,
    datasetId: ResourceIds.SystemFunction
  })

  const { formik } = useForm({
    maxAccess: access,
    initialValues: {
      rows: [
        {
          id: 1,
          functionId: '',
          sfName: '',
          nraId: '',
          nraRef: '',
          integrationLevel: '',
          integrationLevelName: ''
        }
      ]
    },
    onSubmit: async () => {
      const resultObject = {
        systemFunctionMappings: formik.values.rows
      }

      await postRequest({
        extension: SystemRepository.SystemFunction.set2,
        record: JSON.stringify(resultObject)
      })
      await getGridData()
      toast.success(platformLabels.Updated)
    }
  })

  const columns = [
    {
      component: 'textfield',
      label: labels.functionId,
      name: 'functionId',
      props: {
        readOnly: true,
        type: 'number'
      }
    },
    {
      component: 'textfield',
      label: labels.name,
      name: 'sfName',
      props: {
        readOnly: true
      }
    },
    {
      component: 'resourcelookup',
      label: labels.numberRange,
      name: 'nraRef',
      props: {
        endpointId: SystemRepository.NumberRange.snapshot,
        displayField: 'reference',
        valueField: 'recordId',
        columnsInDropDown: [
          { key: 'reference', value: 'Reference' },
          { key: 'description', value: 'Name' }
        ],
        mapping: [
          { from: 'recordId', to: 'nraId' },
          { from: 'reference', to: 'nraRef' },
          { from: 'name', to: 'nraName' }
        ]
      }
    },
    {
      component: 'resourcecombobox',
      name: 'integrationLevelName',
      label: labels.integrationLevel,
      props: {
        datasetId: DataSets.GLI_INTEGRATION_LEVEL,
        valueField: 'key',
        displayField: 'value',
        mapping: [
          { from: 'key', to: 'integrationLevel' },
          { from: 'value', to: 'integrationLevelName' }
        ]
      }
    }
  ]



  function handleRowsChange(newValues) {
    const updatedRows = formik.values.rows.map(row => {
      const newValue = newValues.find(newRow => newRow.id === row.id)

      return newValue ? newValue : row
    })

    formik.setFieldValue('rows', updatedRows)
  }

  return (
    <Form onSave={formik.handleSubmit} maxAccess={access} fullSize>
      <VertLayout>
        <Grow>
          <DataGrid
            onChange={value => handleRowsChange(value)}
            value={formik.values?.rows}
            error={formik.errors?.rows}
            columns={columns}
            enableFilters
            allowDelete={false}
            allowAddNewLine={false}
          />
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default SystemFunction
