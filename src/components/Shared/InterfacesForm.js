import React, { useEffect, useContext, useState } from 'react'
import FormShell from './FormShell'
import { RequestsContext } from 'src/providers/RequestsContext'
import { RTCLRepository } from 'src/repositories/RTCLRepository'
import Grid from '@mui/system/Unstable_Grid/Grid'
import useResourceParams from 'src/hooks/useResourceParams'
import { ResourceIds } from 'src/resources/ResourceIds'
import toast from 'react-hot-toast'
import { DataGrid } from './DataGrid'
import * as yup from 'yup'
import { useForm } from 'react-hook-form'
import { DataSets } from 'src/resources/DataSets'

export const InterfacesForm = ({ recordId }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)

  const { labels: _labels, access } = useResourceParams({
    datasetId: ResourceIds.InterfaceMap
  })

  const { formik } = useForm({
    initialValues: {
      rows: [
        {
          recordId: recordId,
          resourceId: ResourceIds.IdTypes,
          interfaceId: '',
          interfaceName: '',
          reference: ''
        }
      ]
    },
    enableReinitialize: true,
    validateOnChange: true,
    onSubmit: async values => {
      /* const rows = obj.relations.map(({ recordId, activationDate, expiryDate, ...rest }, index) => ({
        recordId: recordId,
        seqNo: index + 1,
        activationDate: activationDate && formatDateToApiFunction(activationDate),
        expiryDate: expiryDate && formatDateToApiFunction(expiryDate),
        ...rest
      }))

      const data = {
        recordId: recordId,
        items: rows
      }

      const res = await postRequest({
        extension: RTCLRepository.ClientRelation.set2,
        record: JSON.stringify(data)
      })
      if (res.recordId) toast.success('Record Successfully')*/
    }
  })

  useEffect(() => {
    getGridData(recordId)
  }, [recordId])

  async function getGridData(recordId) {
    var parameters = `_recordId=${recordId}`

    await getRequest({
      extension: RTCLRepository.ClientRelation.qry,
      parameters: parameters
    })

    /*const result = res.list

    const processedData = result.map((item, index) => ({
      ...item,
      id: index + 1,
      seqNo: index + 1,
      activationDate: formatDateFromApi(item?.activationDate),
      expiryDate: formatDateFromApi(item?.expiryDate)
    }))
    res.list.length > 0 && formik.setValues({ relations: processedData })*/
  }

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
    <FormShell form={formik}>
      <Grid spacing={4} sx={{ mt: 1 }}>
        <DataGrid
          onChange={value => formik.setFieldValue('rows', value)}
          value={formik.values.rows}
          error={formik.errors.rows}
          columns={columns}
          height={`calc(100vh - 330px)`}
        />
      </Grid>
    </FormShell>
  )
}
