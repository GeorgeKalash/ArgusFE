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
      headerName: labels.date
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
      field: 'amount',
      headerName: labels.amount
    }
  ]

  const initialValues = {
    countryId: '',
    dispersalType: '',
    currencyId: ''
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
      extension: RemittanceOutwardsRepository.OutwardsTransfer.qry2,
      parameters: `_countryId=${formik.values?.countryId}&_currencyId=${
        formik.values?.currencyId || 0
      }&_dispersalType=${formik.values?.dispersalType || 0}`
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
      onClick: openCorrespondent,
      disabled: !formik.values.countryId
    }
  ]

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
                endpointId={SystemRepository.Country.qry}
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
                    formik.setFieldValue('countryId', newValue?.recordId || 0)
                  }
                }}
                error={formik.touched.countryId && Boolean(formik.errors.countryId)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={2}>
              <ResourceComboBox
                endpointId={SystemRepository.Currency.qry}
                name='currencyId'
                label={labels.currency}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('currencyId', newValue?.recordId || 0)
                }}
                error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
              />
            </Grid>
            <Grid item xs={2}>
              <ResourceComboBox
                name='dispersalType'
                label={labels.dispersalType}
                datasetId={DataSets.RT_Dispersal_Type}
                valueField='key'
                displayField='value'
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('dispersalType', newValue?.key || 0)
                }}
                error={formik.touched.dispersalType && Boolean(formik.errors.dispersalType)}
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
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default OutwardsCorrespondent
