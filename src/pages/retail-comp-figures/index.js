import { useState, useContext, useEffect } from 'react'
import * as yup from 'yup'
import { RequestsContext } from 'src/providers/RequestsContext'
import Table from 'src/components/Shared/Table'
import { useResourceQuery } from 'src/hooks/resource'
import { Grid } from '@mui/material'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useForm } from 'src/hooks/form'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import FormShell from 'src/components/Shared/FormShell'
import { ControlContext } from 'src/providers/ControlContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ReportPSGeneratorRepository } from 'src/repositories/ReportPSGeneratorRepository'
import CustomButton from 'src/components/Inputs/CustomButton'
import { DataSets } from 'src/resources/DataSets'
import { CommonContext } from 'src/providers/CommonContext'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import Chart from 'chart.js/auto'
import IconButton from '@mui/material/IconButton'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'

const RetailCompFigures = () => {
  const { getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { getAllKvsByDataset } = useContext(CommonContext)
  const [columns, setColumns] = useState([])
  const [data, setData] = useState([])
  const [displayedGraph, setDisplayedGraph] = useState([])
  const [collapsed, setCollapsed] = useState(false)
  const [prevRow, setPrevRow] = useState('')
  const [prevCol, setPrevCol] = useState('')
  const [monthsHeaders, setMonthsHeaders] = useState([])
  const [categories, setCategories] = useState([])

  const { labels, access } = useResourceQuery({
    datasetId: ResourceIds.POSComparativeFigures
  })

  const { formik } = useForm({
    initialValues: {
      fiscalYear: new Date().getFullYear(),
      posAnalysis: null
    },
    validationSchema: yup.object({
      fiscalYear: yup.number().required(),
      posAnalysis: yup.number().required()
    }),
    maxAccess: access,
    enableReinitialize: false,
    validateOnChange: true
  })

  const processGridData = async fiscalYear => {
    const months = await new Promise((resolve, reject) => {
      getAllKvsByDataset({
        _dataset: DataSets.MONTHS,
        callback: result => {
          if (result) resolve(result)
          else reject()
        }
      })
    })

    await buildColumns(months)

    const monthsData = await getRequest({
      extension: ReportPSGeneratorRepository.PS302.qry,
      parameters: `_year=${fiscalYear}`
    })

    if (!monthsData?.list) return

    let sumTotal = months.map(() => 0)
    let processedData = []

    let totalRow = {
      posRef: null,
      plantName: null,
      total: 0
    }

    months.forEach(month => {
      totalRow[month.key] = 0
    })

    monthsData?.list.forEach(pos => {
      let row = {
        posRef: pos.posRef,
        plantName: pos.plantName,
        total: 0
      }

      let sum = 0
      months.forEach((month, index) => {
        const currentMonth = pos.amounts.find(amount => amount.monthId === Number(month.key))
        const amount = currentMonth ? currentMonth.amount : 0
        row[month.key] = amount
        sum += amount

        sumTotal[index] += amount
      })

      row.total = sum

      totalRow.total += sum

      processedData.push(row)
    })

    months.forEach((month, index) => {
      totalRow[month.key] = sumTotal[index]
    })

    const sortedData = processedData.slice(1).sort((a, b) => b.total - a.total)
    sortedData.unshift(totalRow)

    setData({
      count: sortedData?.length || 0,
      list: sortedData?.length ? sortedData : []
    })

    const monthsHeaders = [...months].sort((a, b) => Number(a.key) - Number(b.key))?.map(item => item.value)
    setMonthsHeaders(monthsHeaders)

    if (formik?.values?.posAnalysis != 1) {
      const totalColumnValues = sortedData?.filter((_, index) => index !== 0).map(item => item.total)
      const firstColumnValues = sortedData?.filter((_, index) => index !== 0).map(item => item.posRef)
      setCategories(firstColumnValues)
      setDisplayedGraph(
        Object.entries(totalColumnValues)
          .filter(([key]) => !isNaN(key))
          .map(([, value]) => value)
      )
    } else {
      setCategories(monthsHeaders)
      setDisplayedGraph(
        Object.entries(totalRow)
          .filter(([key]) => !isNaN(key))
          .map(([, value]) => value)
      )
    }
  }

  const buildColumns = months => {
    const sortedMonths = [...months].sort((a, b) => Number(a.key) - Number(b.key))

    let dynamicColumns = [
      {
        field: 'posRef',
        headerName: labels.POS,
        width: 200,
        pinned: 'left'
      },
      {
        field: 'plantName',
        headerName: labels.plant,
        width: 300,
        pinned: 'left'
      },
      {
        field: 'total',
        headerName: labels.total,
        type: 'number',
        width: 180

        //comparator: (valueA, valueB) => valueB - valueA,
      }
    ]

    sortedMonths.forEach(month => {
      dynamicColumns.push({
        field: month.key,
        headerName: month.value,
        width: months.length <= 8 ? null : 130,
        flex: months.length <= 8 ? 1 : null,
        type: 'number'
      })
    })

    setColumns(dynamicColumns)
  }

  useEffect(() => {
    if (!collapsed) {
      const ctx = document.getElementById('compFigChart').getContext('2d')

      const chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: categories,
          datasets: [
            {
              data: displayedGraph,
              backgroundColor: 'rgba(0, 123, 255, 0.5)',
              hoverBackgroundColor: 'rgb(255, 255, 0)',
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            datalabels: {
              anchor: context => {
                const chart = context.chart
                const dataset = context.dataset
                const value = dataset.data[context.dataIndex]

                const chartHeight = chart.scales.y.bottom - chart.scales.y.top
                const maxValue = chart.scales.y.max

                const barHeight = (value / maxValue) * chartHeight

                return barHeight >= 120 ? 'center' : 'end'
              },
              align: context => {
                const chart = context.chart
                const dataset = context.dataset
                const value = dataset.data[context.dataIndex]

                const chartHeight = chart.scales.y.bottom - chart.scales.y.top
                const maxValue = chart.scales.y.max

                const barHeight = (value / maxValue) * chartHeight

                return barHeight >= 120 ? 'center' : 'end'
              },
              color: 'black',
              offset: 0,
              rotation: -90,
              font: { size: 14, weight: 'bold' },
              formatter: val => val?.toLocaleString()
            }
          },
          scales: {
            x: {
              ticks: {
                color: '#000'
              },
              grid: {
                display: true,
                color: 'rgba(255, 255, 255, 0.2)'
              }
            },
            y: {
              ticks: {
                color: '#000'
              }
            }
          }
        },
        plugins: [ChartDataLabels]
      })

      return () => {
        chart.destroy()
      }
    }
  }, [categories, displayedGraph, collapsed])

  useEffect(() => {
    ;(async function () {
      processGridData(formik?.values?.fiscalYear)
    })()
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.RetailCompFigures}
      form={formik}
      maxAccess={access}
      isCleared={false}
      isSaved={false}
      infoVisible={false}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={3}>
              <Grid container spacing={2}>
                <Grid item xs={9}>
                  <ResourceComboBox
                    endpointId={SystemRepository.FiscalYears.qry}
                    name='fiscalYear'
                    label={labels.year}
                    valueField='fiscalYear'
                    displayField='fiscalYear'
                    values={formik.values}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('fiscalYear', newValue?.fiscalYear || new Date().getFullYear())
                    }}
                    required
                    error={formik.touched.fiscalYear && Boolean(formik.errors.fiscalYear)}
                    maxAccess={access}
                  />
                </Grid>
                <Grid item xs={2}>
                  <CustomButton
                    onClick={() => {
                      processGridData(formik?.values?.fiscalYear)
                    }}
                    label={platformLabels.Preview}
                    image={'preview.png'}
                    color='#231f20'
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={2}>
              <ResourceComboBox
                datasetId={DataSets.POS_ANALYSIS_SORT_LEVEL}
                name='posAnalysis'
                label=''
                valueField='key'
                displayField='value'
                values={formik.values}
                defaultIndex={0}
                required
                onChange={(event, newValue) => {
                  formik.setFieldValue('posAnalysis', newValue?.key)
                }}
                error={formik.touched.posAnalysis && Boolean(formik.errors.posAnalysis)}
                maxAccess={access}
              />
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <Table
            columns={columns}
            gridData={data}
            rowId={['posRef']}
            maxAccess={access}
            pagination={false}
            name='compFigTable'
            selectionMode={formik?.values?.posAnalysis == 1 ? 'row' : 'column'}
            onSelectionChange={(lineData, columnField) => {
              if (lineData) {
                if (formik?.values?.posAnalysis != 1) {
                  if (columnField === 'plantName' || columnField === 'posRef' || columnField === prevCol) {
                    return
                  }
                  const firstColumnValues = data?.list?.filter((_, index) => index !== 0).map(item => item.posRef)
                  setCategories(firstColumnValues)
                  setDisplayedGraph(
                    Object.entries(lineData?.filter((_, index) => index !== 0))
                      .filter(([key]) => !isNaN(key))
                      .map(([, value]) => value)
                  )
                  setPrevCol(columnField)
                } else {
                  if (columnField === prevRow) {
                    return
                  }
                  console.log('data', data)
                  setCategories(monthsHeaders)
                  setDisplayedGraph(
                    Object.entries(lineData)
                      .filter(([key]) => !isNaN(key))
                      .map(([, value]) => value)
                  )
                  setPrevRow(columnField)
                }
              }
            }}
          />
        </Grow>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Card
                sx={{
                  width: '100%',
                  height: collapsed ? '35px' : '300px',
                  transition: 'all 0.4s ease',
                  overflow: 'hidden'
                }}
              >
                <IconButton
                  onClick={() => setCollapsed(!collapsed)}
                  sx={{
                    position: 'absolute',
                    right: 18,
                    color: 'black',
                    backgroundColor: '#f0f0f0',
                    borderRadius: '30%',
                    padding: 1,
                    '&:hover': {
                      backgroundColor: '#d9d9d9'
                    }
                  }}
                  size='small'
                >
                  {collapsed ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}
                </IconButton>
                {!collapsed && (
                  <CardContent sx={{ pb: '8px !important', pt: '8px !important', height: '100%' }}>
                    <canvas id={'compFigChart'} style={{ width: '100% !important', height: '100%' }}></canvas>
                  </CardContent>
                )}
              </Card>
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}

export default RetailCompFigures
