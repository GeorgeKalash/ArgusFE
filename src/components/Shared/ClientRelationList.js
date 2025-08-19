import React, { useContext } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { RTCLRepository } from 'src/repositories/RTCLRepository'
import CustomTextField from '../Inputs/CustomTextField'
import Grid from '@mui/system/Unstable_Grid/Grid'
import { ResourceIds } from 'src/resources/ResourceIds'
import { Grow } from './Layouts/Grow'
import { Fixed } from './Layouts/Fixed'
import { VertLayout } from './Layouts/VertLayout'
import Table from './Table'
import { useResourceQuery } from 'src/hooks/resource'
import { ClientRelationForm } from './ClientRelationForm'
import { useWindow } from 'src/windows'
import useSetWindow from 'src/hooks/useSetWindow'
import { ControlContext } from 'src/providers/ControlContext'

export const ClientRelationList = ({ recordId, name, reference, category, window }) => {
  const { getRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)

  useSetWindow({ title: platformLabels.ClientRelation, window })

  async function fetchGridData() {
    const response = await getRequest({
      extension: RTCLRepository.ClientRelation.qry,
      parameters: `_clientId=${recordId}`
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
    datasetId: ResourceIds.ClientRelation,
    filter: {
      filterFn: fetchGridData,
      default: { category }
    }
  })

  const columns = [
    {
      field: 'parentRef',
      headerName: _labels.clientRef,
      flex: 1
    },
    {
      field: 'parentName',
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
    },
    {
      field: 'otpVerified',
      headerName: _labels.otpVerified,
      type: 'checkbox'
    }
  ]

  const edit = obj => {
    stack({
      Component: ClientRelationForm,
      props: {
        clientId: obj?.clientId,
        seqNo: obj?.seqNo
      }
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

ClientRelationList.width = 900
ClientRelationList.height = 600
