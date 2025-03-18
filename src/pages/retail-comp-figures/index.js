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
import { useTheme } from '@mui/material/styles'

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

    console.log('totalRow', totalRow)
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

  const theme = useTheme()

  const options = {
    chart: {
      parentHeightOffset: 0,
      toolbar: { show: false }
    },
    grid: {
      show: true,
      borderColor: '#ccc'
    },
    plotOptions: {
      bar: {
        borderRadius: 0,
        distributed: true,
        columnWidth: '90%',
        dataLabels: {
          position: 'top',
          orientation: 'vertical'
        }
      }
    },
    legend: { show: false },
    dataLabels: {
      enabled: true,
      formatter: val => val?.toLocaleString(), // Format with commas
      style: {
        fontSize: '14px',
        fontWeight: 'bold',
        colors: ['black'] // Ensure contrast with bars
      },
      offsetY: -30 // Adjust label position },
    },
    fill: {
      colors: [hexToRGBA('#007bff', 0.5)] // Set the bar color (blue)
    },
    states: {
      hover: {
        filter: { type: 'lighten' }
      },
      active: {
        filter: { type: 'none' }
      }
    },
    xaxis: {
      categories: categories,
      axisTicks: { show: true },
      axisBorder: { show: true },
      tickPlacement: 'on',
      labels: {
        style: {
          fontSize: '12px',
          fontWeight: 'bold',
          colors: theme.palette.text.disabled
        }
      }
    },
    tooltip: {
      y: {
        formatter: function (val, { seriesIndex, dataPointIndex }) {
          console.log('data', data[dataPointIndex])

          const value = displayedRow[dataPointIndex] // Access the value for the respective month

          return value ? value.toLocaleString() : '0' // Return formatted value
        }
      }
    },
    yaxis: {
      min: 0, // Ensure the axis starts at zero
      //max: Math.max(...displayedRow) * 1.2, // Adjust max dynamically based on data
      tickAmount: 13, // Adjust for better spacing
      labels: {
        formatter: val => val?.toLocaleString(), // Format with commas
        style: {
          fontSize: '12px',
          colors: '#000'
        }
      }
    }
  }

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
                console.log('row', lineData)
                if (formik?.values?.posAnalysis !== 1) {
                  const firstColumnKey = Object.keys(data)[0] // Get the first column key
                  const firstColumnValue = data[firstColumnKey] // Get the first column value
                  console.log('firstColumnValue', firstColumnValue)
                  setCategories([]) //POS
                }

                setDisplayedRow(
                  Object.entries(lineData)
                    .filter(([key]) => !isNaN(key))
                    .map(([, value]) => value)
                )
              }
            }}
          />
        </Grow>
        <Fixed>
          <Card>
            {/* <CardHeader
                  title='Weekly Sales'
                  subheader='Total 85.4k Sales'
                  titleTypographyProps={{ sx: { lineHeight: '2rem !important', letterSpacing: '0.15px !important' } }}
                  action={
                    <OptionsMenu
                      options={['Last 28 Days', 'Last Month', 'Last Year']}
                      iconButtonProps={{ size: 'small', sx: { color: 'text.primary' } }}
                    />
                  }
                /> */}
            <CardContent sx={{ pt: `${theme.spacing(3)} !important` }}>
              <ReactApexcharts type='bar' height={250} options={options} series={[{ data: displayedRow }]} />
              {/*   <Box sx={{ mt: 9.5, display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
                <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
                  <CustomAvatar
                    skin='light'
                    variant='rounded'
                    sx={{ mr: 4, width: 42, height: 42, '& svg': { color: 'primary.main' } }}
                  >
                    <Icon icon='mdi:trending-up' fontSize='1.875rem' />
                  </CustomAvatar>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography sx={{ fontWeight: 600 }}>34.6k</Typography>
                    <Typography variant='body2' sx={{ lineHeight: '1.313rem', letterSpacing: '0.25px' }}>
                      Sales
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CustomAvatar
                    skin='light'
                    color='success'
                    variant='rounded'
                    sx={{ mr: 4, width: 42, height: 42, '& svg': { color: 'success.main' } }}
                  >
                    <Icon icon='mdi:currency-usd' fontSize='1.875rem' />
                  </CustomAvatar>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography sx={{ fontWeight: 600 }}>$482k</Typography>
                    <Typography variant='body2' sx={{ lineHeight: '1.313rem', letterSpacing: '0.25px' }}>
                      Total Profit
                    </Typography>
                  </Box>
                </Box>
              </Box> */}
            </CardContent>
          </Card>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}

export default RetailCompFigures
