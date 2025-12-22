import React, { useContext } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { RTCLRepository } from '@argus/repositories/src/repositories/RTCLRepository'
import CustomTextField from '../Inputs/CustomTextField'
import Grid from '@mui/system/Unstable_Grid/Grid'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import Table from './Table'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ClientRelationForm } from './ClientRelationForm'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'

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
      flex: 2
    },
    {
      field: 'relationName',
      headerName: _labels.relation,
      flex: 1
    },
    {
      field: 'expiryDate',
      headerName: _labels.expiryDate,
      type: 'date',
      flex: 1
    },
    {
      field: 'activationDate',
      headerName: _labels.activationDate,
      type: 'date',
      flex: 1
    },
    {
      field: 'otpVerified',
      headerName: _labels.otp,
      type: 'checkbox',
      flex: 1
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
        <Grid container xs={9} spacing={2} sx={{ p: 5 }}>
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
