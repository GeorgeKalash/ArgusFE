import { useContext, useEffect, useState } from 'react'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { PayrollRepository } from '@argus/repositories/src/repositories/PayrollRepository'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import { Grid } from '@mui/material'
import FiscalPeriodForm from './FiscalPeriodForm'
import { useWindow } from '@argus/shared-providers/src/providers/windows'

export default function FiscalPeriodList ({fiscalYear, labels, maxAccess}) {
  const { getRequest } = useContext(RequestsContext)
  const [periodType, setPeriod] = useState('4')
  const [data, setData] = useState([])
  const { stack } = useWindow()

  async function fetchGridData() {
    if (!periodType) return
    
    const response = await getRequest({
      extension: PayrollRepository.Period.qry,
      parameters: `_year=${fiscalYear}&_salaryType=${periodType}&_status=0`
    })

     setData(response?.list || [])
  }

  const columns = [
    {
      field: 'periodId',
      headerName: '',
      flex: 1
    },
    {
      field: 'startDate',
      headerName: labels.from,
      flex: 2,
      type: 'date'
    },
    {
      field: 'endDate',
      headerName: labels.to,
      flex: 2,
      type: 'date'
    },
    {
      field: 'statusName',
      headerName: '',
      type: 'badge',
      family: 'document',
      valueField: 'status',
      flex: 2
    }
  ]

  const edit = obj => {
    openForm(obj.periodId)
  }

  async function openForm(periodId) {
    stack({
      Component: FiscalPeriodForm,
      props: {
        periodInfo: { fiscalYear, periodType, periodId },
        labels,
        maxAccess,
        refetch: fetchGridData
      },
      height: 350,
      width: 450,
      title: labels.fiscalPeriod
    })
  }

  useEffect(() => { fetchGridData() }, [periodType])

  return (
    <VertLayout>
      <Fixed>
         <GridToolbar maxAccess={maxAccess}
           leftSection={
            <Grid item xs={5} sx={{mt: 2}}>
              <ResourceComboBox
                datasetId={DataSets.PY_PAY_PERIOD}
                name='periodType'
                label={labels.periodType}
                valueField='key'
                displayField='value'
                value={periodType}
                maxAccess={maxAccess}
                onChange={(_, newValue) => setPeriod(newValue?.key) }
              />
            </Grid>
          }/>
      </Fixed>
      <Grow>
        <Table
          name='year'
          columns={columns}
          gridData={{ list: data }}
          rowId={['recordId']}
          onEdit={edit}
          pagination={false}
          maxAccess={maxAccess}
          actionCondition={(row, type) => { return type === 'edit' ? row.status !== 2 : true }}
        />
      </Grow>
    </VertLayout>
  )
}
