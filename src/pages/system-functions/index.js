import { useContext } from 'react'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useForm } from 'src/hooks/form'
import FormShell from 'src/components/Shared/FormShell'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { ControlContext } from 'src/providers/ControlContext'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { DataSets } from 'src/resources/DataSets'

const SystemFunction = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const getGridData = async () => {
    const resSystemFunction = await getRequest({
      extension: SystemRepository.SystemFunction.qry,
      parameters: `_filter=`
    })

    formik.setValues({
      ...formik.values,
      rows: resSystemFunction.list.map(({ integrationLevel, ...rest }, index) => ({
        id: index + 1,
        integrationLevel: integrationLevel ?? '1',
        ...rest
      }))
    })
  }

  const { labels: labels, maxAccess } = useResourceQuery({
    queryFn: getGridData,
    datasetId: ResourceIds.SystemFunction
  })

  const { formik } = useForm({
    maxAccess,
    enableReinitialize: true,
    validateOnChange: true,
    initialValues: {
      search: '',
      rows: [
        {
          id: 1,
          functionId: '',
          sfName: '',
          nraId: '',
          nraRef: '',
          batchNRAId: '',
          batchNRARef: '',
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
      name: 'integrationLevel',
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

  const filteredData = formik.values.search
    ? formik.values.rows.filter(
        item =>
          item.functionId.toString().includes(formik.values.search.toLowerCase()) ||
          item.sfName?.toLowerCase().includes(formik.values.search.toLowerCase())
      )
    : formik.values.rows

  const handleSearchChange = event => {
    const { value } = event.target
    formik.setFieldValue('search', value)
  }

  function handleRowsChange(newValues) {
    const updatedRows = formik.values.rows.map(row => {
      const newValue = newValues.find(newRow => newRow.id === row.id)

      return newValue ? newValue : row
    })

    formik.setFieldValue('rows', updatedRows)
  }

  return (
    <FormShell form={formik} infoVisible={false} visibleClear={false} isCleared={false} isSavedClear={false}>
      <VertLayout>
        <Fixed>
          <CustomTextField
            name='search'
            value={formik.values.search}
            label={platformLabels.Search}
            onClear={() => {
              formik.setFieldValue('search', '')
            }}
            sx={{ width: '20%' }}
            onChange={handleSearchChange}
            onSearch={e => formik.setFieldValue('search', e)}
            search={true}
            height={35}
          />
        </Fixed>
        <Grow>
          <DataGrid
            onChange={value => handleRowsChange(value)}
            value={filteredData}
            error={formik.errors?.rows}
            columns={columns}
            allowDelete={false}
            allowAddNewLine={false}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default SystemFunction
