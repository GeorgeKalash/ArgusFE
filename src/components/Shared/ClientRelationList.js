import React, { useEffect, useContext, useState } from 'react'
import FormShell from './FormShell'
import { RequestsContext } from 'src/providers/RequestsContext'
import { RTCLRepository } from 'src/repositories/RTCLRepository'
import { CTCLRepository } from 'src/repositories/CTCLRepository'
import { useFormik } from 'formik'
import CustomTextField from '../Inputs/CustomTextField'
import Grid from '@mui/system/Unstable_Grid/Grid'
import { CurrencyTradingSettingsRepository } from 'src/repositories/CurrencyTradingSettingsRepository'
import { formatDateFromApi, formatDateToApiFunction } from 'src/lib/date-helper'
import useResourceParams from 'src/hooks/useResourceParams'
import { ResourceIds } from 'src/resources/ResourceIds'
import toast from 'react-hot-toast'
import * as yup from 'yup'
import { Grow } from './Layouts/Grow'
import { Fixed } from './Layouts/Fixed'
import { VertLayout } from './Layouts/VertLayout'
import Table from './Table'
import { useResourceQuery } from 'src/hooks/resource'
import { ClientRelationForm } from './ClientRelationForm'
import { useWindow } from 'src/windows'

export const ClientRelationList = ({ recordId, name, reference, setErrorMessage }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()

  async function fetchGridData() {
    const response = await getRequest({
      extension: RTCLRepository.ClientRelation.qry,
      parameters: `_parentId=${recordId}`
    })

    return response
  }

  const {
    query: { data },
    labels: _labels,
    refetch,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: RTCLRepository.ClientRelation.qry,
    datasetId: ResourceIds.ClientRelation
  })

  const columns = [
    {
      field: 'clientRef',
      headerName: _labels.clientRef,
      flex: 1
    },
    {
      field: 'clientName',
      headerName: _labels.clientName,
      flex: 1
    },
    {
      field: 'relationName',
      headerName: _labels.relationName,
      flex: 1
    },
    {
      field: 'expiryDate',
      headerName: _labels.expiryDate,
      type: 'date'
    },

    {
      field: 'activationDate',
      headerName: _labels.activationDate,
      type: 'date'
    }
  ]

  const post = obj => {
    const res = obj.relations.map(({ parentId, activationDate, expiryDate, ...rest }, index) => ({
      parentId: recordId,
      seqNo: index + 1,
      activationDate: activationDate && formatDateToApiFunction(activationDate),
      expiryDate: expiryDate && formatDateToApiFunction(expiryDate),
      ...rest
    }))

    const data = {
      parentId: recordId,
      items: res
    }

    postRequest({
      extension: RTCLRepository.ClientRelation.set2,
      record: JSON.stringify(data)
    })
      .then(res => {
        toast.success('Record Successfully')
      })
      .catch(error => {})
  }

  const edit = obj => {
    stack({
      Component: ClientRelationForm,
      props: {
        labels: _labels,
        recordId: obj?.parentId,
        seqNo: obj?.seqNo,
        maxAccess: access
      },
      width: 500,
      height: 450,
      title: _labels.descriptionTemplate
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <Grid container xs={9} spacing={4} sx={{ p: 5 }}>
          <Grid item xs={4}>
            <CustomTextField value={reference} label={_labels.reference} readOnly={true} />
          </Grid>
          <Grid item xs={5}></Grid>
          <Grid item xs={6}>
            <CustomTextField value={name} label={_labels.client} readOnly={true} />
          </Grid>
        </Grid>
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['seqNo']}
          isLoading={false}
          onEdit={edit}
          pageSize={50}
          refetch={refetch}
          paginationType='client'
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}
