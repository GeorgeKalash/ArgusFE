import { useContext, useEffect, useState } from 'react'
import Table from 'src/components/Shared/Table'
import { RequestsContext } from 'src/providers/RequestsContext'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { Grid } from '@mui/material'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SystemRepository } from 'src/repositories/SystemRepository'

const IvFy = () => {
  const { getRequest } = useContext(RequestsContext)
  const [fiscalYear, setFiscalYear] = useState({ fiscalYear: 2025 })

  async function fetchGridData() {
    const response = await getRequest({
      extension: InventoryRepository.FiscaYear.qry,
      parameters: `_fiscalYear=${fiscalYear.fiscalYear}`
    })

    return { ...response }
  }

  const {
    query: { data },
    labels: labels,
    refetch,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: InventoryRepository.FiscaYear.qry,
    datasetId: ResourceIds.FiscaYear
  })

  const columns = [
    {
      field: 'fiscalYear',
      headerName: labels.fiscalYear,
      flex: 1
    },
    {
      field: 'hasOpening',
      headerName: labels.hasOpening,
      flex: 1,
      type: 'checkbox'
    },
    {
      field: 'periodId',
      headerName: labels.period,
      flex: 1
    },
    {
      field: 'statusName',
      headerName: labels.status,
      flex: 1
    }
  ]

  useEffect(() => {
    refetch()
  }, [fiscalYear])

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar
          leftSection={
            <Grid item xs={3}>
              <ResourceComboBox
                endpointId={SystemRepository.FiscalYears.qry}
                name={'fiscalYear'}
                label={labels.fiscalYear}
                valueField='fiscalYear'
                displayField='fiscalYear'
                values={fiscalYear}
                onChange={(_, newValue) => {
                  setFiscalYear({
                    fiscalYear: newValue.fiscalYear
                  })
                }}
              />
            </Grid>
          }
        />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          pagination={false}
          rowId={['recordId']}
          isLoading={false}
          refetch={refetch}
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default IvFy
