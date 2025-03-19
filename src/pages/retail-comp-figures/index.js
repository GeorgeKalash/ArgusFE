import { useState, useContext, useMemo, useEffect } from 'react'
import toast from 'react-hot-toast'
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
import CustomComboBox from 'src/components/Inputs/CustomComboBox'
import { CommonContext } from 'src/providers/CommonContext'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import ReactApexcharts from 'src/@core/components/react-apexcharts'
import Box from '@mui/material/Box'
import { hexToRGBA } from 'src/@core/utils/hex-to-rgba'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import Chart from 'chart.js/auto'

const RetailCompFigures = () => {
  const { getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { getAllKvsByDataset } = useContext(CommonContext)
  const [columns, setColumns] = useState([])
  const [displayedRow, setDisplayedRow] = useState([])
  const [data, setData] = useState([])

  const [categories, setCategories] = useState([
    'JAN',
    'FEB',
    'MAR',
    'APR',
    'MAY',
    'JUN',
    'JUL',
    'AUG',
    'SEP',
    'OCT',
    'NOV',
    'DEC'
  ])

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
    enableReinitialize: true,
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

    const sortedData = processedData.slice(1).sort((a, b) => b.total - a.total) // Sort rows not external!!
    sortedData.unshift(totalRow)
    setDisplayedRow(
      Object.entries(totalRow)
        .filter(([key]) => !isNaN(key))
        .map(([, value]) => value)
    )

    console.log('sortedData', sortedData)
    setData({
      count: sortedData?.length || 0,
      list: sortedData?.length ? sortedData : []
    })
  }

  const buildColumns = months => {
    const sortedMonths = [...months].sort((a, b) => Number(a.key) - Number(b.key))

    let dynamicColumns = [
      {
        field: 'posRef',
        headerName: labels.posRef,
        width: 200,
        pinned: 'left'
      },
      {
        field: 'plantName',
        headerName: labels.plantName,
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

  const fillPosAnalysisStore = async () => {
    const data = await new Promise((resolve, reject) => {
      getAllKvsByDataset({
        _dataset: DataSets.POS_ANALYSIS_SORT_LEVEL,
        callback: result => {
          if (result) resolve(result)
          else reject()
        }
      })
    })
    setPosAnalysisStore(data)
  }

  useEffect(() => {
    console.log('cate', displayedRow)
    const ctx = document.getElementById('compFigChart').getContext('2d')

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: categories,
        datasets: [
          {
            data: displayedRow,
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
  }, [categories, displayedRow])

  useEffect(() => {
    ;(async function () {
      //fillFiscalYearStore()
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
                    label={labels.fiscalYear}
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
                    onClick={() => processGridData(formik?.values?.fiscalYear)}
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
                  formik.setFieldValue('posAnalysis', newValue?.key) //FIX
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
            onSelectionChange={lineData => {
              if (lineData) {
                if (formik?.values?.posAnalysis != 1) {
                  const firstColumnValues = data?.list?.filter((_, index) => index !== 0).map(item => item.posRef)
                  setCategories(firstColumnValues)
                  setDisplayedRow(
                    Object.entries(lineData?.filter((_, index) => index !== 0))
                      .filter(([key]) => !isNaN(key))
                      .map(([, value]) => value)
                  )
                } else {
                  setCategories(['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'])
                  setDisplayedRow(
                    Object.entries(lineData)
                      .filter(([key]) => !isNaN(key))
                      .map(([, value]) => value)
                  )
                }
              }
            }}
          />
        </Grow>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Card sx={{ width: '100%', height: '300px' }}>
                <CardContent sx={{ pb: '8px !important', pt: '8px !important', height: '100%' }}>
                  <canvas id={'compFigChart'} style={{ width: '100% !important', height: '100%' }}></canvas>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          {/* <Card>
            <CardContent sx={{ pt: `${theme.spacing(3)} !important` }}>
              <ReactApexcharts type='bar' height={250} options={options} series={[{ data: displayedRow }]} />
            </CardContent>
          </Card> */}
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}

export default RetailCompFigures
