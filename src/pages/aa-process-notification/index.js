import { useContext } from 'react'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { AdministrationRepository } from 'src/repositories/AdministrationRepository'
import { CommonContext } from 'src/providers/CommonContext'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useForm } from 'src/hooks/form'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { ControlContext } from 'src/providers/ControlContext'
import { DataSets } from 'src/resources/DataSets'
import Form from 'src/components/Shared/Form'

const ProcessNotification = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { getAllKvsByDataset } = useContext(CommonContext)

  const { labels, access } = useResourceQuery({
    queryFn: () => getGridData(),
    datasetId: ResourceIds.ProcessNotifications
  })

  const { formik } = useForm({
    maxAccess: access,
    initialValues: {
      rows: [
        {
          id: 1,
          processId: null,
          templateId: null
        }
      ]
    },
    onSubmit: async () => {
      const items = (formik.values.rows || []).filter(r => r.templateId)
      await postRequest({
        extension: AdministrationRepository.ProcessNotification.set,
        record: JSON.stringify({ items })
      })
      toast.success(platformLabels.Updated)
    }
  })

 

  async function getAllNotificationType() {
    return new Promise((resolve, reject) => {
      getAllKvsByDataset({
        _dataset: DataSets.PROCESS_NOTIFICATION_TYPE,
        callback: result => {
          if (result) resolve(result)
          else reject()
        }
      })
    })
  }

  const getGridData = async () => {
    const [kvsList, pnRes, teRes] = await Promise.all([
      getAllNotificationType(),
      getRequest({
        extension: AdministrationRepository.ProcessNotification.qry,
        parameters: `_filter=`
      }),
      getRequest({
        extension: AdministrationRepository.AdTemplate.qry,
        parameters: `_filter=`
      })
    ])

    const rows = (kvsList ?? []).map((k, index) => {
      const mapping = (pnRes?.list || []).find(m => m.processId === Number(k.key))
    
      const templateName =
        (teRes?.list || []).find(
          t => t.recordId === (mapping?.templateId ?? null)
        )?.name || ''
    
      return {
        id: index + 1,
        processId: Number(k.key),
        processName: k.value,
        templateId: mapping?.templateId ?? null,
        templateName
      }
    })
        formik.setFieldValue('rows',rows)
  }

  const columns = [
    {
      component: 'textfield',
      label: labels.name,
      name: 'processName',
      props: {
        readOnly: true
      }
    },
    {
      component: 'resourcecombobox',
      label: labels.template,
      name: 'Template',
      props: {
        endpointId: AdministrationRepository.AdTemplate.qry,
        valueField: 'recordId',
        displayField: 'name',
        mapping: [
          { from: 'recordId', to: 'templateId' },
          { from: 'name', to: 'templateName' }
        ]
      }
    }
  ]

  return (
    <Form onSave={formik.handleSubmit} maxAccess={access} fullSize>
      <VertLayout>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('rows', value)}
            value={formik.values.rows}
            name='PNTable' 
            maxAccess={access}
            error={formik.errors?.rows}
            columns={columns}
            allowDelete={false}
            allowAddNewLine={false}
          />
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default ProcessNotification
