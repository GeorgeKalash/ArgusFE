import { useState, useContext, useMemo, useEffect } from 'react'
import toast from 'react-hot-toast'
import * as yup from 'yup'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
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
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ReportPSGeneratorRepository } from 'src/repositories/ReportPSGeneratorRepository'
import OutboundTranspForm from '../outbound-transportation/forms/OutboundTranspForm'
import { useWindow } from 'src/windows'
import ConfirmationDialog from 'src/components/ConfirmationDialog'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomButton from 'src/components/Inputs/CustomButton'
import { DataSets } from 'src/resources/DataSets'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'
import { CommonContext } from 'src/providers/CommonContext'

const RetailCompFigures = () => {
  const [selectedSaleZones, setSelectedSaleZones] = useState('')
  const [reCalc, setReCalc] = useState(false)
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels, userDefaultsData } = useContext(ControlContext)
  const { stack } = useWindow()
  const [fiscalYearStore, setFiscalYearStore] = useState([])
  const [posAnalysisStore, setPosAnalysisStore] = useState([])
  const { getAllKvsByDataset } = useContext(CommonContext)
  const [columns, setColumns] = useState([])
  const [data, setData] = useState([])

  const { labels, access } = useResourceQuery({
    datasetId: ResourceIds.POSComparativeFigures
  })

  //const plantId = parseInt(userDefaultsData?.list?.find(({ key }) => key === 'plantId')?.value)

  const { formik } = useForm({
    initialValues: {
      fiscalYear: '',
      posAnalysis: '', // set initial
      salesZones: { list: [] } // check
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
    console.log('fiscalYear', fiscalYear)

    const months = await new Promise((resolve, reject) => {
      getAllKvsByDataset({
        _dataset: DataSets.MONTHS,
        callback: result => {
          if (result) resolve(result)
          else reject()
        }
      })
    })

    console.log('months', months)

    await buildColumns(months)

    const monthsData = await getRequest({
      extension: ReportPSGeneratorRepository.PS302.qry,
      parameters: `_year=${fiscalYear}`
    })

    if (!monthsData?.list) return

    console.log('monthsData', monthsData)

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

    processedData.unshift(totalRow)

    console.log(processedData)
    setData({
      count: processedData?.length || 0,
      list: processedData?.length ? processedData : []
    })
  }

  const buildColumns = months => {
    const sortedMonths = [...months].sort((a, b) => Number(a.key) - Number(b.key))

    let dynamicColumns = [
      {
        field: 'posRef',
        headerName: labels.posRef,
        width: 250
      },
      {
        field: 'plantName',
        headerName: labels.plantName,
        width: 350
      },
      {
        field: 'total',
        headerName: labels.total,
        type: 'number',
        width: 210
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

  const fillFiscalYearStore = () => {
    getRequest({
      extension: SystemRepository.FiscalYears.qry,
      parameters: ``
    }).then(res => {
      setFiscalYearStore(res.list)
      const year = res.list?.filter(item => item.fiscalYear === new Date().getFullYear())[0]
      console.log('year', year)
      processGridData(year.fiscalYear)
    })
  }

  async function fillPosAnalysisStore() {
    return new Promise((resolve, reject) => {
      getAllKvsByDataset({
        _dataset: DataSets.POS_ANALYSIS_SORT_LEVEL,
        callback: result => {
          if (result) resolve(result)
          else reject()
        }
      })
    })
  }

  useEffect(() => {
    ;(async function () {
      fillFiscalYearStore()
      setPosAnalysisStore(await fillPosAnalysisStore())

      //processGridData()
    })()
  }, [])

  useEffect(() => {
    console.log('Updated Data:', data)
  }, [data])

  useEffect(() => {
    console.log('Updated Columns:', columns)
  }, [columns])

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
                  <CustomComboBox
                    name='fiscalYear'
                    label={labels.fiscalYear}
                    valueField='fiscalYear'
                    displayField='fiscalYear'
                    store={fiscalYearStore}
                    value={fiscalYearStore?.filter(item => item.fiscalYear === new Date().getFullYear())[0]}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('fiscalYear', newValue?.fiscalYear || null)
                      processGridData(newValue?.fiscalYear)
                    }}
                    required
                    error={formik.touched.fiscalYear && Boolean(formik.errors.fiscalYear)}
                    maxAccess={access}
                  />
                </Grid>
                <Grid item xs={2}>
                  <CustomButton
                    onClick={() => fillTable()}
                    label={platformLabels.Preview}
                    image={'preview.png'}
                    color='#231f20'
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={2}>
              <ResourceComboBox
                name='posAnalysis'
                label=''
                valueField='key'
                displayField='value'
                store={posAnalysisStore}
                value={posAnalysisStore?.[0]}
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
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default RetailCompFigures
