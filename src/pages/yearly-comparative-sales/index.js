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
import { Grid } from '@mui/material'
import { LineChartDark } from 'src/components/Shared/dashboardApplets/charts'
import { ControlContext } from 'src/providers/ControlContext'
import CustomButton from 'src/components/Inputs/CustomButton'

const YearlyComparativeSales = () => {
  const { getRequest } = useContext(RequestsContext)
  const { getAllKvsByDataset } = useContext(CommonContext)
  const { platformLabels } = useContext(ControlContext)

  const [fiscalYears, setFiscalYears] = useState([])
  const [monthLabels, setTableMonths] = useState([])
  const [chartInfo, setChartInfo] = useState([])
  const [disablePreview, setDisbalePreview] = useState(false)

  const {
    query: { data },
    filterBy,
    labels,
    access,
    refetch
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: ReportSAGeneratorRepository.YearlyComparativeSale.SA503,
    datasetId: ResourceIds.YearlyComparativeSales,
    filter: {
      filterFn: fetchWithFilter
    }
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
      width: 150,
      pinned: 'left'
    },
    {
      field: 'total',
      headerName: labels.total,
      width: 220,
      type: 'number',
      pinned: 'left'
    },
    {
      field: 'salary1',
      headerName: monthLabels.JAN,

      type: 'number',
      width: 170
    },
    {
      field: 'salary2',
      headerName: monthLabels.FEB,

      type: 'number',
      width: 170
    },
    {
      field: 'salary3',
      headerName: monthLabels.MAR,

      type: 'number',
      width: 170
    },
    {
      field: 'salary4',
      headerName: monthLabels.APR,

      type: 'number',
      width: 170
    },
    {
      field: 'salary5',
      headerName: monthLabels.MAY,

      type: 'number',
      width: 170
    },
    {
      field: 'salary6',
      headerName: monthLabels.JUN,

      type: 'number',
      width: 170
    },
    {
      field: 'salary7',
      headerName: monthLabels.JUL,

      type: 'number',
      width: 170
    },
    {
      field: 'salary8',
      headerName: monthLabels.AUG,

      type: 'number',
      width: 170
    },
    {
      field: 'salary9',
      headerName: monthLabels.SEP,

      type: 'number',
      width: 170
    },
    {
      field: 'salary10',
      headerName: monthLabels.OCT,

      type: 'number',
      width: 170
    },
    {
      field: 'salary11',
      headerName: monthLabels.NOV,

      type: 'number',
      width: 170
    },
    {
      field: 'salary12',
      headerName: monthLabels.DEC,

      type: 'number',
      width: 170
    }
  ]

  async function fetchGridData(options = {}) {
    const { params = [] } = options

    const checkedYears = fiscalYears.filter(yearObj => yearObj.checked).map(yearObj => yearObj.year)

    setChartInfo(prevState => ({
      ...prevState,
      datasetLabels: checkedYears.map(String)
    }))

    if (checkedYears.length > 0) {
      const response = await getRequest({
        extension: ReportSAGeneratorRepository.YearlyComparativeSale.SA503,
        parameters: `_years=${checkedYears.join(',')}&_params=${params}`
      })

      const aggregatedData = checkedYears.reduce((acc, year) => {
        acc[year] = {
          year,
          total: 0,
          ...Object.fromEntries(Array.from({ length: 12 }, (_, i) => [`salary${i + 1}`, 0]))
        }

        return acc
      }, {})

      response.list.forEach(({ year, netSales = 0, month }) => {
        if (!aggregatedData[year]) return
        aggregatedData[year].total += netSales
        aggregatedData[year][`salary${month}`] += netSales
      })

      return { list: Object.values(aggregatedData) }
    }
  }

  async function fetchWithFilter({ filters }) {
    return fetchGridData({ params: filters?.params })
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
      const trimmedValues = removeTrailingZeros(values)

      return { [`dataset${index + 1}`]: year, values: trimmedValues }
    })
  }

  const removeTrailingZeros = arr => {
    let lastNonZeroIndex = arr.length - 1
    while (lastNonZeroIndex >= 0 && arr[lastNonZeroIndex] === 0) {
      lastNonZeroIndex--
    }

    return arr.slice(0, lastNonZeroIndex + 1)
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
      const datasets = transformData(data).map(item => item.values)
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
        <RPBGridToolbar maxAccess={access} reportName={'SA503'} filterBy={filterBy} hasSearch={false} />
      </Fixed>
      <Fixed>
        <Table
          name='yearsTable'
          columns={columns}
          gridData={data}
          rowId={['year']}
          isLoading={false}
          maxAccess={access}
          pagination={false}
          maxHeight={'300px'}
        />
      </Fixed>
      <Grow>
        <Grid container sx={{ display: 'flex', flex: 1 }} spacing={2}>
          <Grid item xs={2}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
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
                  height='300px'
                  handleCheckboxChange={() =>
                    setDisbalePreview(
                      fiscalYears.filter(yearObj => yearObj.checked).map(yearObj => yearObj.year).length == 0
                    )
                  }
                />
              </Grid>
              <Grid item xs={4}>
                <CustomButton
                  onClick={refetch}
                  disabled={disablePreview}
                  image={'preview.png'}
                  tooltipText={platformLabels.Preview}
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={10} sx={{ display: 'flex', flex: 1, p: 2 }}>
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
