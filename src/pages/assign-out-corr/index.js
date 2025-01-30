import { Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { useResourceQuery } from 'src/hooks/resource'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'
import Table from 'src/components/Shared/Table'
import { useWindow } from 'src/windows'
import AssignCorrespondentForm from './AssignCorrespondentForm'
import { useForm } from 'src/hooks/form'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'

const OutwardsCorrespondent = () => {
  const { getRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const [data, setData] = useState([])

  const {
    labels: labels,
    maxAccess,
    refetch
  } = useResourceQuery({
    queryFn: fetchWithFilter,
    endpointId: RemittanceOutwardsRepository.OutwardsTransfer.qry2,
    datasetId: ResourceIds.CorrespondentOutwards
  })

  const rowColumns = [
    {
      field: 'reference',
      headerName: labels.reference
    },
    {
      field: 'date',
      headerName: labels.date,
      type: 'date'
    },
    {
      field: 'countryRef',
      headerName: labels.country,
      flex: 1
    },
    {
      field: 'currencyRef',
      headerName: labels.currency,
      flex: 1
    },
    {
      field: 'dispersalName',
      headerName: labels.dispersalType,
      flex: 1
    },
    {
      field: 'clientName',
      headerName: labels.client
    },
    {
      field: 'fcAmount',
      headerName: labels.fcAmount,
      type: 'number'
    },
    {
      field: 'amount',
      headerName: labels.amount,
      type: 'number'
    }
  ]

  const initialValues = {
    countryId: 0,
    currencyId: '',
    fromAmount: '',
    dispersalType: '',
    totalFc: '',
    totalAm: '',
    fromDate: '',
    toDate: ''
  }

  const { formik } = useForm({
    initialValues,
    maxAccess,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      countryId: yup.string().required()
    })
  })

  const formatDate = date => {
    if (!date) return '1-1-1970'

    const d = new Date(date)
    const month = d.getMonth() + 1
    const day = d.getDate()
    const year = d.getFullYear()

    return `${month}-${day}-${year}`
  }

  async function fetchWithFilter() {
    const formattedFromDate = formatDate(formik.values.fromDate)

    const formattedToDate =
      formatDate(formik.values.toDate) === '1-1-1970' ? '1-1-2050' : formatDate(formik.values.toDate)

    const res = await getRequest({
      extension: RemittanceOutwardsRepository.OutwardsTransfer.qry2,
      parameters: `_countryId=${formik.values.countryId || 0}&_currencyId=${formik.values.currencyId || 0}&_corId=${
        formik.values.corId || 0
      }&_dispersalType=${formik.values.dispersalType || 0}&_fromAmount=${formik.values.fromAmount || 0}&_toAmount=${
        formik.values.toAmount || 0
      }&_fromDate=${formattedFromDate}&_todate=${formattedToDate}`
    })

    setData(res ?? { list: [] })
  }

  const openCorrespondent = () => {
    stack({
      Component: AssignCorrespondentForm,
      props: {
        maxAccess: maxAccess,
        labels: labels,
        outwardsList: data?.list?.filter(item => item.checked),
        refetch: fetchWithFilter
      },
      width: 500,
      height: 250,
      title: labels.correspondent
    })
  }

  const actions = [
    {
      key: 'Correspondent',
      condition: true,
      onClick: openCorrespondent
    }
  ]

  useEffect(() => {
    fetchWithFilter()
    formik.setFieldValue('totalAm', 0)
    formik.setFieldValue('totalFc', 0)
  }, [
    formik.values.countryId,
    formik.values.currencyId,
    formik.values.dispersalType,
    formik.values.fromDate,
    formik.values.toDate,
    formik.values.fromAmount,
    formik.values.toAmount
  ])
  function calcFc() {
    const totalFc =
      formik.values.countryId && formik.values.currencyId
        ? data.list?.reduce((sumAmount, row) => {
            let curValue = 0
            if (row.checked) curValue = parseFloat(row.fcAmount.toString().replace(/,/g, '')) || 0

            return sumAmount + curValue
          }, 0)
        : 0

    const totalAm = data.list?.reduce((sumAmount, row) => {
      let curValue = 0
      if (row.checked) curValue = parseFloat(row.amount.toString().replace(/,/g, '')) || 0

      return sumAmount + curValue
    }, 0)

    formik.setFieldValue('totalFc', totalFc)
    formik.setFieldValue('totalAm', totalAm)
  }

  return (
    <FormShell
      form={formik}
      isInfo={false}
      isSaved={false}
      isCleared={false}
      isSavedClear={false}
      actions={actions}
      maxAccess={maxAccess}
      resourceId={ResourceIds.CorrespondentOutwards}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <ResourceComboBox
                    endpointId={RemittanceOutwardsRepository.UnassignedCountry.unassigned}
                    name='countryId'
                    label={labels.country}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' },
                      { key: 'flName', value: 'Foreign Language Name' }
                    ]}
                    values={formik.values}
                    valueField='recordId'
                    displayField={['reference', 'name', 'flName']}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      if (newValue) {
                        formik.setFieldValue('countryId', newValue.recordId)
                        formik.setFieldValue('currencyId', '')
                        formik.setFieldValue('dispersalType', '')
                      } else {
                        formik.setFieldValue('countryId', 0)
                        formik.setFieldValue('currencyId', '')
                        formik.setFieldValue('dispersalType', '')
                      }
                    }}
                    error={formik.touched.countryId && Boolean(formik.errors.countryId)}
                  />
                </Grid>

                <Grid item xs={4}>
                  <ResourceComboBox
                    endpointId={RemittanceOutwardsRepository.UnassignedCurrency.unassigned}
                    parameters={formik.values.countryId && `_countryId=${formik.values.countryId || 0}`}
                    name='currencyId'
                    label={labels.currency}
                    readOnly={!formik.values.countryId}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' },
                      { key: 'flName', value: 'Foreign Language Name' }
                    ]}
                    values={formik.values}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('currencyId', newValue?.recordId || null)
                      formik.setFieldValue('dispersalType', '')
                    }}
                    error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
                  />
                </Grid>
                <Grid item xs={4}>
                  <ResourceComboBox
                    endpointId={RemittanceOutwardsRepository.UnassignedDispersalType.unassigned}
                    parameters={
                      formik.values.currencyId &&
                      `_countryId=${formik.values.countryId || 0}&_currencyId=${formik.values.currencyId || 0}`
                    }
                    name='dispersalType'
                    label={labels.dispersalType}
                    readOnly={!formik.values.currencyId}
                    valueField='key'
                    displayField='value'
                    values={formik.values}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('dispersalType', newValue?.key)
                    }}
                  />
                </Grid>
                <Grid item xs={3}>
                  <CustomNumberField
                    name='fromAmount'
                    label={labels.fromAmount}
                    value={formik.values.fromAmount}
                    onBlur={formik.handleChange}
                    onClear={() => formik.setFieldValue('fromAmount', '')}
                    decimalScale={2}
                  />
                </Grid>
                <Grid item xs={3}>
                  <CustomNumberField
                    name='toAmount'
                    label={labels.toAmount}
                    value={formik.values.toAmount}
                    onBlur={formik.handleChange}
                    onClear={() => formik.setFieldValue('toAmount', '')}
                    decimalScale={2}
                  />
                </Grid>
                <Grid item xs={3}>
                  <CustomDatePicker
                    name='fromDate'
                    max={formik.values.toDate}
                    label={labels.fromDate}
                    value={formik?.values?.fromDate}
                    onChange={formik.setFieldValue}
                    onClear={() => formik.setFieldValue('fromDate', '')}
                    error={false}
                  />
                </Grid>
                <Grid item xs={3}>
                  <CustomDatePicker
                    name='toDate'
                    min={formik.values.fromDate}
                    label={labels.toDate}
                    value={formik?.values?.toDate}
                    onChange={formik.setFieldValue}
                    onClear={() => formik.setFieldValue('toDate', '')}
                    error={false}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <Table
            columns={rowColumns}
            gridData={data}
            rowId={['recordId']}
            isLoading={false}
            refetch={refetch}
            maxAccess={maxAccess}
            pageSize={50}
            paginationType='client'
            showCheckboxColumn={true}
            handleCheckboxChange={calcFc}
          />
        </Grow>
        <Fixed>
          <Grid container justifyContent='flex-end' spacing={2} sx={{ px: 2 }}>
            <Grid item xs={1.2}>
              <CustomNumberField
                name='totalFc'
                label={labels.totalFc}
                value={formik.values.totalFc}
                readOnly={true}
                hidden={!(formik.values.countryId && formik.values.currencyId)}
              />
            </Grid>
            <Grid item xs={1.2}>
              <CustomNumberField name='totalAm' label={labels.totalAm} value={formik.values.totalAm} readOnly={true} />
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}

export default OutwardsCorrespondent
