import { useContext } from 'react'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useForm } from 'src/hooks/form'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { GeneralLedgerRepository } from 'src/repositories/GeneralLedgerRepository'
import { ControlContext } from 'src/providers/ControlContext'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import WindowToolbar from 'src/components/Shared/WindowToolbar'

const SyAlerts = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const getGridData = async () => {
    const rows = await getRequest({
      extension: SystemRepository.SystemAlerts.qry,
      parameters: `_filter=`
    })

    // formik.setValues(rows)
  }

  const { labels: labels, maxAccess } = useResourceQuery({
    endpointId: SystemRepository.SystemAlerts.qry,
    queryFn: getGridData,
    datasetId: ResourceIds.SystemAlerts
  })

  const { formik } = useForm({
    maxAccess,
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
    <VertLayout>
      <Grow>
        <DataGrid
          name='rows'
          onChange={value => {
            formik.setFieldValue('rows', value)
          }}
          value={formik.values?.rows}
          error={formik.errors?.rows}
          columns={columns}
          allowDelete={false}
          allowAddNewLine={false}
          maxAccess={maxAccess}
        />
      </Grow>
      <Fixed>
        <WindowToolbar onSave={formik.submitForm} isSaved={true} smallBox={true} />
      </Fixed>
    </VertLayout>
  )
}

export default SyAlerts
