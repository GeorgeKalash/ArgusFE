import React, { useEffect, useContext } from 'react'
import FormShell from './FormShell'
import { RequestsContext } from 'src/providers/RequestsContext'
import Grid from '@mui/system/Unstable_Grid/Grid'
import useResourceParams from 'src/hooks/useResourceParams'
import { ResourceIds } from 'src/resources/ResourceIds'
import toast from 'react-hot-toast'
import { DataGrid } from './DataGrid'
import * as yup from 'yup'
import { useForm } from 'src/hooks/form'
import { DataSets } from 'src/resources/DataSets'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { CommonContext } from 'src/providers/CommonContext'

export const InterfacesForm = ({ recordId, expanded, height }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { getAllKvsByDataset } = useContext(CommonContext)

  const { labels: _labels, access } = useResourceParams({
    datasetId: ResourceIds.InterfaceMap
  })

  const { formik } = useForm({
    initialValues: {
      rows: [
        {
          id: 1,
          recordId: recordId,
          resourceId: ResourceIds.InterfaceMap,
          interfaceId: '',
          interfaceName: '',
          reference: ''
        }
      ]
    },
    enableReinitialize: true,
    validateOnChange: true,
    onSubmit: async values => {
      const rows = formik.values.rows.map(rest => ({
        recordId: recordId,
        resourceId: ResourceIds.IdTypes,
        ...rest
      }))

      const data = {
        recordId: recordId,
        resourceId: ResourceIds.IdTypes,
        items: rows
      }

      const res = await postRequest({
        extension: RemittanceSettingsRepository.InterfaceMaps.set2,
        record: JSON.stringify(data)
      })
      if (res.recordId) toast.success('Record Successfully')
    }
  })
  async function getAllInterfaces() {
    return new Promise((resolve, reject) => {
      getAllKvsByDataset({
        _dataset: DataSets.ALL_INTERFACES,
        callback: result => {
          if (result) resolve(result)
          else reject()
        }
      })
    })
  }
  useEffect(() => {
    ;(async function () {
      const interfaceData = await getAllInterfaces()

      const resInterfaces = getRequest({
        extension: RemittanceSettingsRepository.InterfaceMaps.qry,
        parameters: `_recordId=${recordId}&_resourceId=${ResourceIds.IdTypes}`
      })

      Promise.all([resInterfaces]).then(([interfaces]) => {
        const mergedInterfaces = interfaceData.map(interfaceItem => {
          const item = {
            interfaceId: interfaceItem.key,
            interfaceName: interfaceItem.value,
            reference: ''
          }
          const matchingInterface = interfaces.list.find(y => item.interfaceId == y.interfaceId)

          matchingInterface && (item.reference = matchingInterface.reference)

          return item
        })

        formik.setValues({
          ...formik.values,
          rows: mergedInterfaces.map((items, index) => ({
            ...items,
            id: index + 1
          }))
        })
      })
    })()
  }, [recordId])

  const columns = [
    {
      component: 'resourcecombobox',
      label: _labels.interface,
      name: 'interfaceId',
      props: {
        readOnly: true,
        datasetId: DataSets.ALL_INTERFACES,
        valueField: 'key',
        displayField: 'value',
        displayFieldWidth: 2,
        mapping: [
          { from: 'key', to: 'interfaceId' },
          { from: 'value', to: 'interfaceName' }
        ]
      }
    },
    {
      component: 'textfield',
      label: _labels.reference,
      name: 'reference'
    }
  ]

  return (
    <FormShell
      form={formik}
      resourceId={ResourceIds.InterfaceMap}
      maxAccess={access}
      infoVisible={false}
      editMode={true}
    >
      <DataGrid
        onChange={value => formik.setFieldValue('rows', value)}
        value={formik.values.rows}
        error={formik.errors.rows}
        columns={columns}
        height={`${expanded ? `calc(100vh - 280px)` : `${height - 100}px`}`}
        allowDelete={false}
      />
    </FormShell>
  )
}
