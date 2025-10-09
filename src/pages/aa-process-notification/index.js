import { useContext, useEffect } from 'react'
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

  useEffect(() => {
    getAllNotificationType().catch(() => {})
  }, [])

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
        extension: AdministrationRepository.PN.qryPN,
        parameters: `_filter=`
      }),
      getRequest({
        extension: AdministrationRepository.PN.qryTE,
        parameters: `_filter=`
      }) 
    ])

    const mappings = pnRes?.list ?? []
    const templates = teRes?.list ?? []

    const rows = (kvsList ?? []).map((k, index) => {
      const processId = Number(k.key)
      const processName = k.value
      const found = mappings.find(m => m.processId === processId)
      const templateId = found?.templateId ?? null

      const templateName =
        templateId != null ? (templates.find(t => t.recordId === templateId)?.name ?? '') : ''

      return {
        id: index + 1,
        processId,
        processName,
        templateId,
        templateName
      }
    })

    formik.setValues({
      ...formik.values,
      rows
    })
  }

  const { labels, access } = useResourceQuery({
    queryFn: getGridData,
    datasetId: ResourceIds.AAPN 
  })

  const { formik } = useForm({
    maxAccess: access,
    initialValues: {
      search: '',
      rows: [
        {
          id: 1,
          processId: null,
          processName: '',
          templateId: null,
          templateName: ''
        }
      ]
    },
    onSubmit: async () => {
      const items = (formik.values.rows || [])
      .filter(r => r.templateId != null)
      .map(r => ({ processId: r.processId, templateId: r.templateId }));  

      await postRequest({
        extension: AdministrationRepository.PN.set2PN,
        record: JSON.stringify({ items })
      })

      await getGridData()
      toast.success(platformLabels.Updated)
    }
  })

  const columns = [
    {
      component: 'textfield',
      label: labels.name ,
      name: 'processName',
      props: {
        readOnly: true
      }
    },
    {
      component: 'resourcecombobox',
      label: labels.template ,
      name: 'Template', 
      props: {
        endpointId: AdministrationRepository.PN.qryTE,
        valueField: 'recordId', 
        displayField: 'name',
        mapping: [
          { from: 'recordId', to: 'templateId' },
          { from: 'name', to: 'templateName' }
        ],
        columnsInDropDown: [{ key: 'name', value: 'Name' }]
      }
    }
  ]

  const filteredData = formik.values.search
    ? formik.values.rows.filter(item => {
        const s = String(formik.values.search || '').toLowerCase()

        return (
          String(item.processId || '').includes(s) ||
          String(item.processName || '').toLowerCase().includes(s) ||
          String(item.templateName || '').toLowerCase().includes(s)
        )
      })
    : formik.values.rows

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
            value={filteredData}
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
