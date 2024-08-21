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
import toast from 'react-hot-toast'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'

const OutwardsCorrespondent = () => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const initialValues = {
    countryId: '',
    dispersalType: '',
    currencyId: '',
    corId: 0,
    outwards: [
      {
        id: 1
      }
    ]
  }

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      countryId: yup.string().required()
    }),
    onSubmit: async obj => {}
  })

  async function fetchWithFilter({ filters }) {
    return await getRequest({
      extension: RemittanceOutwardsRepository.OutwardsTransfer.qry2,
      parameters: `_countryId=${filters?.countryId}&_currencyId=${filters?.currencyId}&_dispersalType=${filters?.dispersalType}`
    })
  }

  const {
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
    if (value) {
      if (index === 'countryId') filterBy('countryId', value)
      if (index === 'dispersalType') filterBy('dispersalType', value)
      if (index === 'currencyId') filterBy('currencyId', value)
    }
  }

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
                  formik.setFieldValue('countryId', newValue?.recordId)
                  onChange('countryId', newValue?.recordId)
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
                formik.setFieldValue('currencyId', newValue?.recordId || null)
              }}
              error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
            />
          </Grid>
          <Grid item xs={2}>
            <ResourceComboBox
              datasetId={DataSets.BENEFICIARY_RESOURCEIDS}
              label={labels.dispersalType}
              name='dispersalType'
              valueField='key'
              displayField='value'
              values={formik.values}
              onChange={(event, newValue) => {
                if (newValue) {
                  onChange('dispersalType', newValue?.key)
                  if (formik.values.corId) onChange('corId', formik.values.corId)
                  else onChange('corId', 0)
                  formik.setFieldValue('dispersalType', newValue?.key)
                }
              }}
              error={formik.touched.dispersalType && Boolean(formik.errors.dispersalType)}
            />
          </Grid>
        </Grid>
      </Fixed>
      <FormShell
        form={formik}
        isInfo={false}
        initialValues={initialValues}
        resourceId={ResourceIds.CorrespondentOutwards}
      >
        <Grow></Grow>
      </FormShell>
    </VertLayout>
  )
}

export default OutwardsCorrespondent
