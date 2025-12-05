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
import { GeneralLedgerRepository } from '@argus/repositories/src/repositories/GeneralLedgerRepository'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import Form from '@argus/shared-ui/src/components/Shared/Form'

const SystemFunctionIntegration = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const getGridData = async () => {
    const [resSystemFunction, resIntegrationLogic] = await Promise.all([
      getRequest({
        extension: SystemRepository.SystemFunction.qry,
        parameters: `_filter=`
      }),
      getRequest({
        extension: GeneralLedgerRepository.IntegrationSystemFunction.qry,
        parameters: `_filter=`
      })
    ])

    const integrationLogicMap =
      resIntegrationLogic?.list?.reduce((acc, { functionId, ilId, ilName }) => {
        acc[functionId] = { ilId, ilName }

        return acc
      }, {}) || {}

    const rows = resSystemFunction?.list?.map(({ functionId, ...rest }, index) => {
      const integrationLogic = integrationLogicMap[functionId] || {}

      return {
        id: index + 1,
        functionId,
        ilId: integrationLogic.ilId || null,
        name: integrationLogic.ilName || null,
        ...rest
      }
    })
    formik.setFieldValue('rows', rows)
  }

  const { labels, access } = useResourceQuery({
    queryFn: getGridData,
    datasetId: ResourceIds.SystemFunctionIntegrations
  })

  const { formik } = useForm({
    maxAccess: access,
    validateOnChange: true,
    initialValues: {
      rows: [
        {
          id: 1,
          functionId: '',
          sfName: '',
          ilId: '',
          name: ''
        }
      ]
    },
    onSubmit: async values => {
      const filteredRows = values.rows
        .filter(row => row.ilId && row.ilId !== '')
        .map(({ functionId, ilId, name }) => ({
          functionId,
          ilId,
          name
        }))

      const resultObject = {
        items: filteredRows
      }

      await postRequest({
        extension: GeneralLedgerRepository.IntegrationSystemFunction.set2,
        record: JSON.stringify(resultObject)
      })
      toast.success(platformLabels.Updated)
      await getGridData()
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
      label: labels.functionName,
      name: 'sfName',
      props: {
        readOnly: true
      }
    },
    {
      component: 'resourcecombobox',
      label: labels.integrationLogic,
      name: 'ilId',
      props: {
        endpointId: GeneralLedgerRepository.IntegrationLogic.qry,
        displayField: 'name',
        mapping: [
          { from: 'name', to: 'name' },
          { from: 'recordId', to: 'ilId' }
        ]
      }
    }
  ]

  return (
    <Form onSave={formik.handleSubmit} maxAccess={access} fullSize>
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
            maxAccess={access}
            name='rows'
          />
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default SystemFunctionIntegration
