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
import { GeneralLedgerRepository } from 'src/repositories/GeneralLedgerRepository'
import { ControlContext } from 'src/providers/ControlContext'

const SystemFunctionIntegration = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const getGridData = async () => {
    try {
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

      formik.setValues({
        ...formik.values,
        rows
      })
    } catch (error) {}
  }

  const { labels: labels, maxAccess } = useResourceQuery({
    queryFn: getGridData,
    datasetId: ResourceIds.SystemFunctionIntegrations
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
          ilId: '',
          name: ''
        }
      ]
    },
    onSubmit: async values => {
      try {
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
      } catch (error) {}
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

export default SystemFunctionIntegration
