import { Grid } from '@mui/material'
import { useContext } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import Table from 'src/components/Shared/Table'

export default function OperationsTab({ labels, store, maxAccess }) {
  const { getRequest } = useContext(RequestsContext)
  const { recordId } = store
  const resourceId = ResourceIds.Worksheet

  const {
    query: { data }
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: ManufacturingRepository.Worksheet.summary,
    datasetId: resourceId,
    enabled: Boolean(recordId)
  })

  async function fetchGridData() {
    return await getRequest({
      extension: ManufacturingRepository.Worksheet.summary,
      parameters: `_worksheetId=${recordId}`
    })
  }

  const totalIssued = data ? data.list.reduce((op, item) => op + item?.issued_qty, 0) : 0
  const totalLoss = data ? data.list.reduce((op, item) => op + item?.lost_qty, 0) : 0
  const totalReturned = data ? data.list.reduce((op, item) => op + item?.returned_qty, 0) : 0
  const otalConsumed = data ? data.list.reduce((op, item) => op + item?.consumed_qty, 0) : 0

  return (
    <VertLayout>
      <Grow>
        <Table
          name='operationTable'
          gridData={data}
          maxAccess={maxAccess}
          columns={[
            { field: 'operationRef', headerName: labels.operationRef, flex: 1 },
            { field: 'operationName', headerName: labels.operationName, flex: 2 },
            { field: 'categoryName', headerName: labels.category, flex: 2 },
            { field: 'issued_qty', headerName: labels.issued, type: 'number', flex: 1 },
            { field: 'returned_qty', headerName: labels.returned, type: 'number', flex: 1 },
            { field: 'lost_qty', headerName: labels.loss, type: 'number', flex: 1 },
            { field: 'consumed_qty', headerName: labels.consumed, type: 'number', flex: 1 }
          ]}
          rowId={['operationId']}
          pagination={false}
        />
      </Grow>
      <Fixed>
        <Grid container spacing={1} sx={{ pt: 2 }}>
          <Grid item xs={6.8}></Grid>
          <Grid item xs={5}>
            <Grid container spacing={4}>
              <Grid item xs={3}>
                <CustomNumberField name='totalIssued' value={totalIssued} label={labels.totalIssued} readOnly />
              </Grid>
              <Grid item xs={3}>
                <CustomNumberField name='totalLoss' label={labels.totalLoss} value={totalLoss} readOnly />
              </Grid>
              <Grid item xs={3}>
                <CustomNumberField name='totalReturned' label={labels.totalReturned} value={totalReturned} readOnly />
              </Grid>
              <Grid item xs={3}>
                <CustomNumberField name='totalConsumed' label={labels.totalConsumed} value={otalConsumed} readOnly />
              </Grid>
              <Grid item xs={0.2}></Grid>
            </Grid>
          </Grid>
        </Grid>
      </Fixed>
    </VertLayout>
  )
}
