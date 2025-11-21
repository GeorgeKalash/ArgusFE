import { useContext, useEffect } from 'react'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import { ManufacturingRepository } from '@argus/repositories/src/repositories/ManufacturingRepository'
import Form from '@argus/shared-ui/src/components/Shared/Form'

export default function MeasurementScheduleMapForm({ _labels: labels, maxAccess }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      rows: []
    },
    maxAccess,
    validateOnChange: true,
    onSubmit: async values => {
      const withType = values.rows.filter(row => !!row.type)
      const withoutType = values.rows.filter(row => !row.type)

      if (withoutType.length > 0) {
        await Promise.all(
          withoutType.map(row =>
            postRequest({
              extension: ManufacturingRepository.MeasurementScheduleMap.del,
              record: JSON.stringify({ msId: row.msId })
            })
          )
        )
      }
      if (withType.length > 0) {
        await Promise.all(
          withType.map(row =>
            postRequest({
              extension: ManufacturingRepository.MeasurementScheduleMap.set,
              record: JSON.stringify({
                msId: row.msId,
                type: row.type
              })
            })
          )
        )
      }

      toast.success(platformLabels.Updated)
      fetchMeasurements()
    }
  })

  const fetchMeasurements = async () => {
    const [msRes, mapRes] = await Promise.all([
      getRequest({
        extension: InventoryRepository.Measurement.qry,
        parameters: `_name=`
      }),
      getRequest({
        extension: ManufacturingRepository.MeasurementScheduleMap.qry,
        parameters: `_msId=0`
      })
    ])

    const rows =
      msRes?.list?.map((msItem, idx) => {
        const mapped = mapRes?.list?.find(m => m.msId === msItem.recordId)

        return {
          id: idx + 1,
          msId: msItem.recordId,
          name: msItem.name,
          typeName: mapped?.typeName || '',
          type: mapped?.type
        }
      }) || []

    formik.setFieldValue('rows', rows)
  }

  useEffect(() => {
    fetchMeasurements()
  }, [])

  const columns = [
    {
      component: 'textfield',
      label: labels?.ms,
      name: 'name',
      props: {
        readOnly: true
      }
    },
    {
      component: 'resourcecombobox',
      name: 'typeName',
      label: labels.type,
      props: {
        datasetId: DataSets.MF_MEASUREMENT_SCHEDULE_MAP,
        valueField: 'key',
        displayField: 'value',
        mapping: [
          { from: 'value', to: 'typeName' },
          { from: 'key', to: 'type' }
        ]
      }
    }
  ]

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess} editMode={false}>
      <DataGrid
        onChange={value => {
          formik.setFieldValue('rows', value)
        }}
        name='rows'
        value={formik.values.rows}
        error={formik.errors.rows}
        columns={columns}
        allowDelete={false}
        allowAddNewLine={false}
        maxAccess={maxAccess}
      />
    </Form>
  )
}
