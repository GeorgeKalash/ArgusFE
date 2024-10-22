import { Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { useResourceQuery } from 'src/hooks/resource'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { DataSets } from 'src/resources/DataSets'
import { SystemRepository } from 'src/repositories/SystemRepository'
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
    endpointId: RemittanceOutwardsRepository.OutwardsOrder.qry2,
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
      field: 'currencyRef',
      headerName: labels.currency
    },
    {
      field: 'clientName',
      headerName: labels.client
    },
    {
      field: 'lcAmount',
      headerName: labels.lcAmount
    },
    {
      field: 'amount',
      headerName: labels.amount
    }
  ]

  const initialValues = {
    countryId: '',
    dispersalType: '',
    currencyId: '',
    totalFc: ''
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

  async function fetchWithFilter() {
    if (!formik.values.countryId) return

    const res = await getRequest({
      extension: RemittanceOutwardsRepository.OutwardsOrder.qry2,
      parameters: `_countryId=${formik.values?.countryId}&_currencyId=${
        formik.values?.currencyId || 0
      }&_dispersalType=${formik.values?.dispersalType || 0}`
    })
    console.log(formik?.values, 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')

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
      onClick: openCorrespondent,
      disabled: !formik.values.countryId
    }
  ]

  function calcFc() {
    const totalFc =
      formik.values.countryId && formik.values.currencyId
        ? data.list?.reduce((sumAmount, row) => {
            let curValue = 0
            if (row.checked) curValue = parseFloat(row.fcAmount.toString().replace(/,/g, '')) || 0

            return sumAmount + curValue
          }, 0)
        : 0
    formik.setFieldValue('totalFc', totalFc)
  }

  useEffect(() => {
    ;(async function () {
      try {
        await fetchWithFilter()
      } catch (error) {}
    })()
  }, [formik.values.countryId, formik.values.currencyId, formik.values.dispersalType])

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
          <Grid container spacing={2} sx={{ pt: 5 }}>
            <Grid item xs={2}>
              <ResourceComboBox
                endpointId={RemittanceOutwardsRepository.UnassignedCountry.unassigned}
                name='countryId'
                label={labels.country}
                valueField='recordId'
                required
                displayField={['name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' },
                  { key: 'flName', value: 'Foreign Language Name' }
                ]}
                values={formik.values}
                displayFieldWidth={1.75}
                onChange={(event, newValue) => {
                  if (newValue) {
                    formik.setFieldValue('countryId', newValue.recordId)
                    formik.setFieldValue('currencyId', '')
                    formik.setFieldValue('dispersalType', '')
                  } else {
                    formik.setFieldValue('countryId', '')
                    formik.setFieldValue('currencyId', '')
                    formik.setFieldValue('dispersalType', '')

                    setData([])
                  }
                }}
                error={formik.touched.countryId && Boolean(formik.errors.countryId)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={2}>
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
                  { key: 'name', value: 'Name' }
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
            <Grid item xs={2}>
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
          </Grid>
        </Fixed>

        <Grow>
          <Table
            columns={rowColumns}
            gridData={data ?? { list: [] }}
            setData={setData}
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
          <Grid container justifyContent='flex-end' sx={{ px: 2 }}>
            <Grid item xs={2}>
              <CustomNumberField
                name='totalFc'
                label={labels.totalFc}
                value={formik.values.totalFc}
                readOnly={true}
                hidden={!(formik.values.countryId && formik.values.currencyId)}
              />
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}

export default OutwardsCorrespondent
