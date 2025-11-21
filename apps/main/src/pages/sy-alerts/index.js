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
import * as yup from 'yup'
import Form from '@argus/shared-ui/src/components/Shared/Form'

const SyAlerts = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const getGridData = async () => {
    const rows = await getRequest({
      extension: SystemRepository.SystemAlerts.qry,
      parameters: `_filter=`
    })

    formik.setValues({
      rows: rows.list.map(({ activeStatus, ...item }, index) => ({
        id: index + 1,
        activeStatus: activeStatus == 1,
        ...item
      }))
    })
  }

  const { labels, access } = useResourceQuery({
    endpointId: SystemRepository.SystemAlerts.qry,
    queryFn: getGridData,
    datasetId: ResourceIds.SystemAlerts
  })

  const { formik } = useForm({
    maxAccess: access,
    validateOnChange: true,
    initialValues: {
      rows: [
        {
          id: 1,
          alertId: null,
          days: null,
          name: '',
          activeStatus: false
        }
      ]
    },
    validationSchema: yup.object().shape({
      rows: yup.array().of(
        yup.object().shape({
          days: yup.number().required().max(32767)
        })
      )
    }),
    onSubmit: async values => {
      const rows = values.rows.map(({ id, name, activeStatus, ...item }) => ({
        activeStatus: activeStatus ? 1 : -1,
        ...item
      }))

      await postRequest({
        extension: SystemRepository.SystemAlerts.arr,
        record: JSON.stringify(rows)
      })
      toast.success(platformLabels.Updated)
    }
  })

  const columns = [
    {
      component: 'checkbox',
      name: 'activeStatus',
      label: labels.active,
      flex: 0.1
    },
    {
      component: 'textfield',
      label: labels.name,
      name: 'name',
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.days,
      name: 'days',
      props: {
        decimalScale: 0,
        allowNegative: false
      },
      flex: 0.2
    }
  ]

  return (
    <Form onSave={formik.handleSubmit} maxAccess={access} fullSize>
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
            maxAccess={access}
          />
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default SyAlerts
