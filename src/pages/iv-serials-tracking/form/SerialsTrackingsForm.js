import { useContext, useEffect } from 'react'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { DataSets } from 'src/resources/DataSets'

export default function SerialsTrackingsForm({ _labels: labels, access }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      rows: []
    },
    access,
    validateOnChange: true,
    onSubmit: async values => {
      const payload = values.rows
        .filter(row => !!row.type)
        .map(row => ({
          msId: row.msId,
          type: row.type
        }))

      await postRequest({
        extension: InventoryRepository.MeasurementSerial.set2,
        record: JSON.stringify({
          items: payload
        })
      })

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
        extension: InventoryRepository.MeasurementSerial.qry,
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
        datasetId: DataSets.IV_MEASUREMENT_SERIAL_MAP,
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
    <FormShell
      resourceId={ResourceIds.SerialsTrackings}
      isInfo={false}
      form={formik}
      access={access}
      editMode={false}
      isCleared={false}
    >
      <DataGrid
        onChange={value => {
          formik.setFieldValue('rows', value)
        }}
        value={formik.values.rows}
        error={formik.errors.rows}
        columns={columns}
        allowDelete={false}
        allowAddNewLine={false}
      />
    </FormShell>
  )
}
