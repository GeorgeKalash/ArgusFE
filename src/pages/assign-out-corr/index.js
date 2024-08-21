import { Grid } from '@mui/material'
import { useContext } from 'react'
import { useResourceQuery } from 'src/hooks/resource'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { DataSets } from 'src/resources/DataSets'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { useFormik } from 'formik'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'
import Table from 'src/components/Shared/Table'
import { useWindow } from 'src/windows'
import AssignCorrespondentForm from './AssignCorrespondentForm'

const OutwardsCorrespondent = () => {
  const { getRequest } = useContext(RequestsContext)
  const { stack } = useWindow()

  const initialValues = {
    countryId: '',
    dispersalType: '',
    currencyId: '',
    corId: 0,
    outwards: [
      {
        id: 1,
        checked: false
      }
    ]
  }

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      countryId: yup.string().required()
    })
  })

  async function fetchWithFilter({ filters }) {
    if (!filters.countryId) return { list: [] }
    return await getRequest({
      extension: RemittanceOutwardsRepository.OutwardsTransfer.qry2,
      parameters: `_countryId=${filters?.countryId}&_currencyId=${filters?.currencyId ?? 0}&_dispersalType=${
        filters?.dispersalType ?? 0
      }`
    })
  }

  const {
    query: { data },
    labels: labels,
    filterBy,
    access,
    filters
  } = useResourceQuery({
    datasetId: ResourceIds.CorrespondentOutwards,
    filter: {
      endpointId: RemittanceOutwardsRepository.OutwardsTransfer.qry2,
      filterFn: fetchWithFilter
    }
  })

  const onChange = (index, value) => {
    if (index === 'countryId') filterBy('countryId', value)
    if (index === 'dispersalType') filterBy('dispersalType', value)
    if (index === 'currencyId') filterBy('currencyId', value)
  }
  const rowColumns = [
    {
      field: 'reference',
      headerName: ''
    }
  ]
  const openCorrespondent = () => {
    stack({
      Component: AssignCorrespondentForm,
      props: {
        maxAccess: access,
        labels: labels,
        outwardsList: formik.values.outwards.filter(item => item.checked)
      },
      width: 600,
      height: 500,
      title: labels.correspondent
    })
  }

  const actions = [
    {
      key: 'Correspondent',
      condition: true,
      onClick: openCorrespondent,
      disabled: !filters.countryId
    }
  ]

  return (
    <VertLayout>
      <Fixed>
        <Grid container spacing={2} sx={{ pt: 5, pl: 5 }}>
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
                  onChange('countryId', newValue?.recordId || 0)
                }
              }}
              error={formik.touched.countryId && Boolean(formik.errors.countryId)}
              maxAccess={access}
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
              maxAccess={access}
              onChange={(event, newValue) => {
                onChange('currencyId', newValue?.recordId || 0)
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
                onChange('dispersalType', newValue?.key || 0)
                formik.setFieldValue('dispersalType', newValue?.key || 0)
              }}
              error={formik.touched.dispersalType && Boolean(formik.errors.dispersalType)}
            />
          </Grid>
        </Grid>
      </Fixed>
      <FormShell
        form={formik}
        isInfo={false}
        isSaved={false}
        isCleared={false}
        isSavedClear={false}
        actions={actions}
        resourceId={ResourceIds.CorrespondentOutwards}
      >
        <Grow>
          <Table
            columns={rowColumns}
            gridData={data}
            rowId={['recordId']}
            isLoading={false}
            maxAccess={access}
            pageSize={50}
            paginationType='client'
            showCheckboxColumn={true}
          />
        </Grow>
      </FormShell>
    </VertLayout>
  )
}

export default OutwardsCorrespondent
