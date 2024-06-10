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

const SystemFunction = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)

  const getGridData = async () => {
    const resSystemFunction = await getRequest({
      extension: SystemRepository.SystemFunction.qry,
      parameters: `_filter=`
    })
    formik.setValues({
      ...formik.values,
      rows: resSystemFunction.list.map(({ ...rest }, index) => ({
        id: index + 1,
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
      rows: [
        {
          id: 1,
          functionId: '',
          sfName: '',
          nraId: '',
          nraRef: '',
          batchNRAId: '',
          batchNRARef: ''
        }
      ]
    },
    onSubmit: async values => {
      const resultObject = {
        systemFunctionMappings: values.rows
      }

      await postRequest({
        extension: SystemRepository.SystemFunction.set2,
        record: JSON.stringify(resultObject)
      })
      toast.success('Record Updated Successfully')
    }
  })

  const columns = [
    {
      component: 'numberfield',
      label: labels.functionId,
      name: 'functionId',
      props: {
        readOnly: true
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
      component: 'resourcelookup',
      label: labels.batchNumberRange,
      name: 'batchNRARef',
      props: {
        endpointId: SystemRepository.NumberRange.snapshot,
        displayField: 'reference',
        valueField: 'recordId',
        columnsInDropDown: [
          { key: 'reference', value: 'Reference' },
          { key: 'description', value: 'Name' }
        ],
        mapping: [
          { from: 'recordId', to: 'batchNRAId' },
          { from: 'reference', to: 'batchNRARef' },
          { from: 'name', to: 'batchNRAName' }
        ]
      }
    }
  ]

  return (
    <FormShell form={formik} infoVisible={false} visibleClear={false} isCleared={false}>
      <VertLayout>
        <Grow>
          <DataGrid
            onChange={value => {
              formik.setFieldValue('rows', value)
            }}
            value={formik.values?.rows}
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
