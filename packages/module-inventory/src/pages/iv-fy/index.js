import { useContext, useEffect, useState } from 'react'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { Grid } from '@mui/material'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'

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
          name='table'
          columns={columns}
          gridData={data}
          paginationType={'client'}
          rowId={['recordId']}
          refetch={refetch}
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default IvFy
