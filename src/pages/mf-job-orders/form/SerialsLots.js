import { useContext } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ResourceIds } from 'src/resources/ResourceIds'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grid } from '@mui/material'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import useSetWindow from 'src/hooks/useSetWindow'
import { ControlContext } from 'src/providers/ControlContext'
import Table from 'src/components/Shared/Table'
import { useResourceQuery } from 'src/hooks/resource'

export default function SerialsLots({ labels, maxAccess, recordId, api, parameters, window }) {
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
    const res = await getRequest({
      extension: api,
      parameters
    })

    res.list = res?.list?.length
      ? await Promise.all(
          res?.list?.map(async (item, index) => {
            return {
              ...item,
              id: index + 1,
              srlSeqNo: index + 1,
              weight: item?.weight || 0
            }
          })
        )
      : []

    return res
  }

  const totWeight = data?.list?.reduce((weightSum, row) => {
    const weightValue = parseFloat(row?.weight?.toString().replace(/,/g, '')) || 0

    return weightSum + weightValue
  }, 0)

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
