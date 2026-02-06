import { useContext } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grid } from '@mui/material'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'

export default function SerialsLots({ labels, maxAccess, api, parameters, window }) {
  const { getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  useSetWindow({ title: platformLabels.serials, window })

  const columns = [
    {
      field: 'srlSeqNo',
      flex: 0.5,
      headerName: labels.rowCount
    },
    {
      field: 'srlNo',
      flex: 1,
      headerName: labels.srlNo
    },
    {
      field: 'weight',
      flex: 1,
      headerName: labels.weight,
      type: 'number'
    }
  ]

  const {
    query: { data },
    refetch
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: api,
    datasetId: ResourceIds.MFJobOrders,
    params: { disabledReqParams: true, maxAccess }
  })

  async function fetchGridData() {
    return await getRequest({
      extension: api,
      parameters
    })
  }

  const totWeight = data?.list?.reduce((acc, curr) => acc + curr.weight, 0)

  return (
    <VertLayout>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          maxAccess={maxAccess}
          refetch={refetch}
          pageSize={50}
          paginationType='client'
        />
      </Grow>
      <Fixed>
        <Grid container spacing={2}>
          <Grid item xs={4} sx={{ p: 2, ml: 2 }}>
            <CustomNumberField name='totalWeight' label={labels.totWeight} value={totWeight} readOnly />
          </Grid>
        </Grid>
      </Fixed>
    </VertLayout>
  )
}

SerialsLots.width = 680
SerialsLots.height = 600
