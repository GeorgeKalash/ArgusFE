import { useContext, useEffect, useState } from 'react'
import { useResourceQuery } from 'src/hooks/resource'
import { RequestsContext } from 'src/providers/RequestsContext'
import Table from 'src/components/Shared/Table'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import RPBGridToolbar from 'src/components/Shared/RPBGridToolbar'
import { ReportSAGeneratorRepository } from 'src/repositories/ReportSAGeneratorRepository'
import { DataSets } from 'src/resources/DataSets'
import { CommonContext } from 'src/providers/CommonContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { Button, Grid } from '@mui/material'
import { LineChartDark } from 'src/components/Shared/dashboardApplets/charts'
import { ControlContext } from 'src/providers/ControlContext'

const YearlyComparativeSales = () => {
  const { getRequest } = useContext(RequestsContext)
  const { getAllKvsByDataset } = useContext(CommonContext)
  const { platformLabels } = useContext(ControlContext)
  const [fiscalYears, setFiscalYears] = useState([])
  const [monthLabels, setTableMonths] = useState([])
  const [chartInfo, setChartInfo] = useState([])

  const {
    query: { data },
    filterBy,
    labels,
    access,
    refetch
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: ReportSAGeneratorRepository.YearlyComparativeSale.SA503,
    datasetId: ResourceIds.YearlyComparativeSales
  })

  const loadMonths = async () => {
    const monthsData = await new Promise((resolve, reject) => {
      getAllKvsByDataset({
        _dataset: DataSets.MONTHS,
        callback: result => {
          if (result) resolve(result)
          else reject()
        }
      })
    })

    const sortedMonthsData = monthsData.sort((a, b) => a.key - b.key)

    const monthNames = sortedMonthsData.reduce((acc, { key, value }) => {
      acc[value] = value

      return acc
    }, {})

    setTableMonths(monthNames)
  }

  async function getFiscalYears() {
    const fiscalRes = await getRequest({
      extension: SystemRepository.FiscalYears.qry,
      parameters: '_filter='
    })

    if (fiscalRes?.list?.length > 0) {
      const updatedList = fiscalRes.list.map((item, index, arr) => ({
        year: item.fiscalYear,
        checked: arr.length === 1 || index >= arr.length - 2
      }))

      return updatedList
    }
  }

  const columns = [
    {
      field: 'year',
      headerName: labels.year,
      flex: 1
    },
    {
      field: 'total',
      headerName: labels.total,
      flex: 1,
      type: 'number'
    },
    {
      field: 'salary1',
      headerName: monthLabels.JAN,
      flex: 1,
      type: 'number'
    },
    {
      field: 'salary2',
      headerName: monthLabels.FEB,
      flex: 1,
      type: 'number'
    },
    {
      field: 'salary3',
      headerName: monthLabels.MAR,
      flex: 1,
      type: 'number'
    },
    {
      field: 'salary4',
      headerName: monthLabels.APR,
      flex: 1,
      type: 'number'
    },
    {
      field: 'salary5',
      headerName: monthLabels.MAY,
      flex: 1,
      type: 'number'
    },
    {
      field: 'salary6',
      headerName: monthLabels.JUN,
      flex: 1,
      type: 'number'
    },
    {
      field: 'salary7',
      headerName: monthLabels.JUL,
      flex: 1,
      type: 'number'
    },
    {
      field: 'salary8',
      headerName: monthLabels.AUG,
      flex: 1,
      type: 'number'
    },
    {
      field: 'salary9',
      headerName: monthLabels.SEP,
      flex: 1,
      type: 'number'
    },
    {
      field: 'salary10',
      headerName: monthLabels.OCT,
      flex: 1,
      type: 'number'
    },
    {
      field: 'salary11',
      headerName: monthLabels.NOV,
      flex: 1,
      type: 'number'
    },
    {
      field: 'salary12',
      headerName: monthLabels.DEC,
      flex: 1,
      type: 'number'
    }
  ]

  async function fetchGridData(options = {}) {
    const { params = [] } = options
    if (fiscalYears.length > 0) {
      const checkedYears = fiscalYears.filter(yearObj => yearObj.checked).map(yearObj => yearObj.year)

      const response = await getRequest({
        extension: ReportSAGeneratorRepository.YearlyComparativeSale.SA503,
        parameters: `_years=${checkedYears.join(',')}&_params=${params}`
      })

      const aggregatedData = response.list.reduce((acc, obj) => {
        const { year, netSales = 0, month } = obj
        const monthKey = `salary${month}`
        if (!acc[year]) acc[year] = { year, total: 0 }
        if (!acc[year][monthKey]) acc[year][monthKey] = 0
        acc[year].total += netSales
        acc[year][monthKey] = (acc[year][monthKey] || 0) + netSales

        return acc
      }, {})

      checkedYears.forEach(year => {
        if (!aggregatedData[year]) {
          aggregatedData[year] = { year, total: 0 }
          for (let month = 1; month <= 12; month++) {
            aggregatedData[year][`salary${month}`] = 0
          }
        }
      })

      const result = Object.values(aggregatedData).map(yearData => {
        for (let month = 1; month <= 12; month++) {
          const monthKey = `salary${month}`
          if (!yearData[monthKey]) yearData[monthKey] = 0
        }

        return yearData
      })

      checkedYears.map(String)
      setChartInfo(prevState => ({
        ...prevState,
        datasetLabels: checkedYears.map(String)
      }))

      return { list: result }
    }
  }

  const onApply = ({ search, rpbParams }) => {
    if (!search && rpbParams.length === 0) {
      clearFilter('params')
    } else if (!search) {
      filterBy('params', rpbParams)
    } else {
      filterBy('qry', search)
    }
    refetch()
  }

  const transformData = data => {
    return data.list.map((item, index) => {
      const { year, total, ...salaries } = item

      const values = Object.keys(salaries)
        .sort((a, b) => {
          const numA = a.match(/\d+/)?.[0] || '0'
          const numB = b.match(/\d+/)?.[0] || '0'

          return Number(numA) - Number(numB)
        })
        .map(key => salaries[key])

      return { [`dataset${index + 1}`]: year, values }
    })
  }

  useEffect(() => {
    ;(async function () {
      await loadMonths()
      const years = await getFiscalYears()
      setFiscalYears(years)
    })()
  }, [])

  useEffect(() => {
    if (fiscalYears.length > 0) refetch()
  }, [fiscalYears])

  useEffect(() => {
    if (data?.list?.length > 0) {
      const labels = Object.values(monthLabels)
      const datasets = transformData(data).map(item => item.values.filter(value => value !== 0))

      setChartInfo(prevState => ({
        ...prevState,
        labels,
        datasets
      }))
    }
  }, [data, monthLabels])

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar maxAccess={access} onApply={onApply} reportName={'SA503'} />
      </Fixed>
      <Grow>
        <Grid container spacing={2} sx={{ display: 'flex', flex: 1 }}>
          <Grid item xs={12} sx={{ display: 'flex', flex: 1 }}>
            <Table
              name='yearsTable'
              columns={columns}
              gridData={data}
              rowId={['recordId']}
              isLoading={false}
              maxAccess={access}
              pagination={false}
            />
          </Grid>
          <Grid item xs={2} sx={{ display: 'flex', flex: 1 }}>
            <Grid container sx={{ display: 'flex', flex: 1 }}>
              <Grid item xs={12} sx={{ display: 'flex', flex: 1 }}>
                <Table
                  name='fiscalTable'
                  columns={[
                    {
                      field: 'year',
                      headerName: labels.year,
                      flex: 1
                    }
                  ]}
                  gridData={{ list: fiscalYears }}
                  rowId={['year']}
                  showCheckboxColumn={true}
                  isLoading={false}
                  maxAccess={access}
                  pagination={false}
                />
              </Grid>
              <Grid item xs={4} sx={{ p: 2 }}>
                <Button variant='contained' size='small' onClick={() => refetch()}>
                  <img src='/images/buttonsIcons/preview.png' alt={platformLabels.Preview} />
                </Button>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={10} sx={{ display: 'flex', flex: 1, height: '60%' }}>
            {chartInfo.labels?.length > 0 && (
              <LineChartDark
                id='yearlySalesChart'
                labels={chartInfo.labels}
                datasets={chartInfo.datasets}
                datasetLabels={chartInfo.datasetLabels}
              />
            )}
          </Grid>
        </Grid>
      </Grow>
    </VertLayout>
  )
}

export default YearlyComparativeSales
