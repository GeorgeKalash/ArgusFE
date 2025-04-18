import { useState, useContext } from 'react'
import * as yup from 'yup'
import { RequestsContext } from 'src/providers/RequestsContext'
import Table from 'src/components/Shared/Table'
import { useResourceQuery } from 'src/hooks/resource'
import { Box, Grid } from '@mui/material'
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
import IconButton from '@mui/material/IconButton'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import { CompBarChart } from 'src/components/Shared/dashboardApplets/charts'

const RetailCompFigures = () => {
  const { getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { getAllKvsByDataset } = useContext(CommonContext)
  const [columns, setColumns] = useState([])
  const [collapsed, setCollapsed] = useState(false)
  const [prevRow, setPrevRow] = useState('')
  const [prevCol, setPrevCol] = useState('')
  const [monthsHeaders, setMonthsHeaders] = useState([])
  const [chartInfo, setChartInfo] = useState([])

  const {
    query: { data },
    labels,
    access,
    refetch
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: ReportPSGeneratorRepository.ComparativeFigRetail.PS302,
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

  async function fetchGridData() {
    const fiscalYear = formik?.values?.fiscalYear

    const months = await new Promise((resolve, reject) => {
      getAllKvsByDataset({
        _dataset: DataSets.MONTHS,
        callback: result => {
          if (result) resolve(result)
          else reject()
        }
      })
    })

    buildColumns(months)

    const monthsData = await getRequest({
      extension: ReportPSGeneratorRepository.ComparativeFigRetail.PS302,
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

    const sortedData = processedData.sort((a, b) => b.total - a.total)
    sortedData.unshift(totalRow)

    const monthsHeaders = [...months].sort((a, b) => Number(a.key) - Number(b.key))?.map(item => item.value)
    setMonthsHeaders(monthsHeaders)

    if (formik?.values?.posAnalysis == 2) {
      const totalColumnValues = sortedData?.filter((_, index) => index !== 0).map(item => item.total)
      const firstColumnValues = sortedData?.filter((_, index) => index !== 0).map(item => item.posRef)
      setChartInfo(prevState => ({
        ...prevState,
        categories: firstColumnValues,
        displayedGraph: Object.entries(totalColumnValues)
          .filter(([key]) => !isNaN(key))
          .map(([, value]) => value)
          .sort((a, b) => b - a)
      }))
    } else {
      setChartInfo(prevState => ({
        ...prevState,
        categories: monthsHeaders,
        displayedGraph: Object.entries(totalRow)
          .filter(([key]) => !isNaN(key))
          .map(([, value]) => value)
      }))
    }

    return {
      count: sortedData?.length || 0,
      list: sortedData?.length ? sortedData : []
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

  return (
    <FormShell
      resourceId={ResourceIds.RetailCompFigures}
      form={formik}
      maxAccess={access}
      isCleared={false}
      isSaved={false}
      infoVisible={false}
      isParentWindow={false}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={2}>
              <ResourceComboBox
                endpointId={SystemRepository.FiscalYears.qry}
                name='fiscalYear'
                label={labels.year}
                valueField='fiscalYear'
                displayField='fiscalYear'
                values={formik.values}
                onChange={(event, newValue) => {
                  if (newValue?.fiscalYear) formik.setFieldValue('fiscalYear', newValue?.fiscalYear)
                }}
                required
                error={formik.touched.fiscalYear && Boolean(formik.errors.fiscalYear)}
                maxAccess={access}
              />
            </Grid>
            <Grid item xs={1}>
              <CustomButton
                onClick={() => refetch()}
                label={platformLabels.Preview}
                image={'preview.png'}
                color='#231f20'
              />
            </Grid>
            <Grid item xs={2}>
              <ResourceComboBox
                datasetId={DataSets.POS_ANALYSIS_SORT_LEVEL}
                name='posAnalysis'
                label=' '
                valueField='key'
                displayField='value'
                values={formik.values}
                defaultIndex={0}
                required
                onChange={(event, newValue) => {
                  if (newValue?.key) formik.setFieldValue('posAnalysis', newValue?.key)
                }}
                error={formik.touched.posAnalysis && Boolean(formik.errors.posAnalysis)}
                maxAccess={access}
              />
            </Grid>
            <Grid item xs={7}></Grid>
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
                if (formik?.values?.posAnalysis == 2) {
                  if (columnField === 'plantName' || columnField === 'posRef' || columnField === prevCol) {
                    return
                  }
                  const firstColumnValues = data?.list?.filter((_, index) => index !== 0).map(item => item.posRef)
                  setChartInfo(prevState => ({
                    ...prevState,
                    categories: firstColumnValues,
                    displayedGraph: Object.entries(lineData?.filter((_, index) => index !== 0))
                      .filter(([key]) => !isNaN(key))
                      .map(([, value]) => value)
                      .sort((a, b) => b - a)
                  }))
                  setPrevCol(columnField)
                } else {
                  if (columnField === prevRow) {
                    return
                  }
                  setChartInfo(prevState => ({
                    ...prevState,
                    categories: monthsHeaders,
                    displayedGraph: Object.entries(lineData)
                      .filter(([key]) => !isNaN(key))
                      .map(([, value]) => value)
                  }))
                  setPrevRow(columnField)
                }
              }
            }}
          />
        </Grow>
        <Fixed>
          <Card
            sx={{
              my: 2,
              width: '100%',
              transition: 'all 0.4s ease'
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end'
              }}
            >
              <IconButton
                onClick={() => setCollapsed(!collapsed)}
                sx={{
                  display: 'flex',
                  margin: 2,
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
            </Box>
            {!collapsed && (
              <CardContent sx={{ p: '8px !important' }}>
                <CompBarChart
                  id='compFigChart'
                  labels={chartInfo.categories}
                  datasets={chartInfo.displayedGraph}
                  collapsed={collapsed}
                />
              </CardContent>
            )}
          </Card>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}

export default RetailCompFigures
