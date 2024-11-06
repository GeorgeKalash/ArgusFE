import { useState, useEffect, useContext } from 'react'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { RequestsContext } from 'src/providers/RequestsContext'
import Table from 'src/components/Shared/Table'
import { useResourceQuery } from 'src/hooks/resource'
import { Grid } from '@mui/material'
import * as yup from 'yup'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useForm } from 'src/hooks/form'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import FormShell from 'src/components/Shared/FormShell'
import { ControlContext } from 'src/providers/ControlContext'
import toast from 'react-hot-toast'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'

const TrxDetails = () => {
  const [data, setData] = useState([])
  const { getRequest } = useContext(RequestsContext)

  const formatDate = date => {
    if (!date) return '1-1-1970'

    const d = new Date(date)
    const month = d.getMonth() + 1
    const day = d.getDate()
    const year = d.getFullYear()

    return `${month}-${day}-${year}`
  }

  const fetchRemittanceData = () => {
    const formattedstartDate = formatDate(formik.values.startDate)

    const formattedendDate =
      formatDate(formik.values.endDate) === '1-1-1970' ? '1-1-2050' : formatDate(formik.values.endDate)

    getRequest({
      extension: SystemRepository.TrxDetails.qry,
      parameters: `_resourceId=${formik.values.countryId}&_currencyId=${formik.values.currencyId || 0}&_resourceId=${
        formik.values.resourceId
      }&_userId=${formik.values.userId || 0}&_dispersalType=${formik.values.dispersalType || 0}&_fromAmount=${
        formik.values.fromAmount || 0
      }&_toAmount=${formik.values.toAmount || 0}&_startDate=${formattedstartDate}&_endDate=${formattedendDate}`
    }).then(response => {
      setData(response.list || [])
    })
  }

  const {
    labels: _labels,
    access,
    refetch
  } = useResourceQuery({
    queryFn: fetchRemittanceData,
    endpointId: SystemRepository.TrxDetails.qry,
    datasetId: ResourceIds.TrxDetails
  })

  const { formik } = useForm({
    initialValues: {
      countryId: 0,
      currencyId: '',
      fromAmount: '',
      corId: '',
      dispersalType: '',
      userId: '',
      startDate: '',
      endDate: ''
    },
    access,
    enableReinitialize: true,
    validateOnChange: true
  })

  const columns = [
    {
      field: 'reference',
      headerName: _labels.reference,
      flex: 1
    },
    {
      field: 'date',
      headerName: _labels.date,
      flex: 1,
      type: 'date'
    },
    {
      field: 'countryRef',
      headerName: _labels.country,
      flex: 1
    },
    {
      field: 'currencyRef',
      headerName: _labels.currency,
      flex: 1
    },
    {
      field: 'dispersalName',
      headerName: _labels.dispersal,
      flex: 1
    },
    {
      field: 'corName',
      headerName: _labels.cor,
      flex: 1
    },
    {
      field: 'clientName',
      headerName: _labels.client,
      flex: 1
    },
    {
      field: 'timeToPost',
      headerName: _labels.timeToPost,
      flex: 1
    },
    {
      field: 'fcAmount',
      headerName: _labels.fcAmount,
      flex: 1,
      type: 'number'
    },
    {
      field: 'amount',
      headerName: _labels.amount,
      flex: 1,
      type: 'number'
    }
  ]

  useEffect(
    () => {
      fetchRemittanceData()
    },
    [
      // formik.values.countryId,
      // formik.values.currencyId,
      // formik.values.corId,
      // formik.values.dispersalType,
      // formik.values.startDate,
      // formik.values.endDate,
      // formik.values.fromAmount,
      // formik.values.toAmount
    ]
  )

  return (
    <FormShell
      resourceId={ResourceIds.PostOutwards}
      form={formik}
      maxAccess={access}
      isCleared={false}
      isSaved={false}
      isSavedClear={false}
      infoVisible={false}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={3}>
                  <ResourceComboBox
                    endpointId={RemittanceOutwardsRepository.AssignedCountry.assigned}
                    name='countryId'
                    label={_labels.country}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' },
                      { key: 'flName', value: 'Foreign Language Name' }
                    ]}
                    values={formik.values}
                    valueField='recordId'
                    displayField={['reference', 'name', 'flName']}
                    maxAccess={access}
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

                <Grid item xs={3}>
                  <ResourceComboBox
                    endpointId={RemittanceOutwardsRepository.AssignedCurrency.assigned}
                    parameters={formik.values.countryId && `_countryId=${formik.values.countryId || 0}`}
                    name='currencyId'
                    label={_labels.currency}
                    readOnly={!formik.values.countryId}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' },
                      { key: 'flName', value: 'Foreign Language Name' }
                    ]}
                    values={formik.values}
                    maxAccess={access}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('currencyId', newValue?.recordId || null)
                      formik.setFieldValue('dispersalType', '')
                    }}
                    error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
                  />
                </Grid>

                <Grid item xs={3}>
                  <ResourceComboBox
                    endpointId={RemittanceOutwardsRepository.AssignedDispersalType.assigned}
                    parameters={
                      formik.values.currencyId &&
                      `_countryId=${formik.values.countryId || 0}&_currencyId=${formik.values.currencyId || 0}`
                    }
                    name='dispersalType'
                    label={_labels.dispersal}
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
                  <ResourceLookup
                    endpointId={RemittanceSettingsRepository.Correspondent.snapshot}
                    valueField='reference'
                    displayField='name'
                    name='corId'
                    label={_labels.cor}
                    form={formik}
                    displayFieldWidth={2}
                    valueShow='corRef'
                    secondValueShow='corName'
                    maxAccess={access}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('corId', newValue ? newValue.recordId : '')
                      formik.setFieldValue('corName', newValue ? newValue.name : '')
                      formik.setFieldValue('corRef', newValue ? newValue.reference : '')
                    }}
                  />
                </Grid>

                <Grid item xs={3}>
                  <CustomNumberField
                    name='fromAmount'
                    label={_labels.fromAmount}
                    value={formik.values.fromAmount}
                    onBlur={formik.handleChange}
                    onClear={() => formik.setFieldValue('fromAmount', '')}
                    decimalScale={2}
                  />
                </Grid>

                <Grid item xs={3}>
                  <CustomNumberField
                    name='toAmount'
                    label={_labels.toAmount}
                    value={formik.values.toAmount}
                    onBlur={formik.handleChange}
                    onClear={() => formik.setFieldValue('toAmount', '')}
                    decimalScale={2}
                  />
                </Grid>

                <Grid item xs={3}>
                  <CustomDatePicker
                    name='startDate'
                    max={formik.values.endDate}
                    label={_labels.startDate}
                    value={formik?.values?.startDate}
                    onChange={formik.setFieldValue}
                    onClear={() => formik.setFieldValue('startDate', '')}
                    error={false}
                  />
                </Grid>

                <Grid item xs={3}>
                  <CustomDatePicker
                    name='endDate'
                    min={formik.values.startDate}
                    label={_labels.endDate}
                    value={formik?.values?.endDate}
                    onChange={formik.setFieldValue}
                    onClear={() => formik.setFieldValue('endDate', '')}
                    error={false}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <Table
            columns={columns}
            gridData={data}
            rowId={['recordId']}
            isLoading={false}
            pagination={false}
            pageSize={50}
            maxAccess={access}
            paginationType='client'
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default TrxDetails
