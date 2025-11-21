import React, { useEffect, useContext } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import Grid from '@mui/system/Unstable_Grid/Grid'
import useResourceParams from '@argus/shared-hooks/src/hooks/useResourceParams'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import toast from 'react-hot-toast'
import { DataGrid } from './DataGrid'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import { RemittanceSettingsRepository } from '@argus/repositories/src/repositories/RemittanceRepository'
import { CommonContext } from '@argus/shared-providers/src/providers/CommonContext'
import CustomTextField from '../Inputs/CustomTextField'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import Form from './Form'

export const InterfacesForm = ({ recordId, resourceId, name }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { getAllKvsByDataset } = useContext(CommonContext)

  const { labels: _labels, access } = useResourceParams({
    datasetId: ResourceIds.InterfaceMap,
    editMode: !!recordId
  })

  const { formik } = useForm({
    initialValues: {
      rows: [
        {
          id: 1,
          recordId: recordId,
          resourceId: ResourceIds.resourceId,
          interfaceId: '',
          interfaceName: '',
          reference: ''
        }
      ]
    },
    validateOnChange: true,
    onSubmit: async values => {
      const rows = formik.values.rows.map(rest => ({
        recordId: recordId,
        resourceId: resourceId,
        ...rest
      }))

      const hasEmptyRows = rows.every(row => row.interfaceId === '')

      const resultRows = hasEmptyRows ? [] : rows

      const data = {
        recordId: recordId,
        resourceId: resourceId,
        items: resultRows
      }

      const res = await postRequest({
        extension: RemittanceSettingsRepository.InterfaceMaps.set2,
        record: JSON.stringify(data)
      })

      if (res.recordId) {
        toast.success('Record Successfully')
      }
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
      if (recordId) {
        const interfaceData = await getAllInterfaces()

        const resInterfaces = await getRequest({
          extension: RemittanceSettingsRepository.InterfaceMaps.qry,
          parameters: `_recordId=${recordId}&_resourceId=${resourceId}`
        })

        const mergedInterfaces = interfaceData.map(interfaceItem => {
          const item = {
            interfaceId: interfaceItem.key,
            interfaceName: interfaceItem.value,
            reference: ''
          }
          const matchingInterface = resInterfaces.list.find(y => item.interfaceId == y.interfaceId)

          if (matchingInterface) {
            item.reference = matchingInterface.reference
          }

          return item
        })

        formik.setValues({
          ...formik.values,
          rows: mergedInterfaces.map((items, index) => ({
            ...items,
            id: index + 1
          }))
        })
      }
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
    <Form onSave={formik.handleSubmit} maxAccess={access} editMode={true}>
      <VertLayout>
        <Grow>
          <Grid sx={{ width: '50%' }}>
            <CustomTextField label={_labels.name} value={name} readOnly />
          </Grid>
          <DataGrid
            onChange={value => formik.setFieldValue('rows', value)}
            value={formik.values.rows}
            error={formik.errors.rows}
            columns={columns}
            allowDelete={false}
          />
        </Grow>
      </VertLayout>
    </Form>
  )
}
