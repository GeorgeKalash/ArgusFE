import { Box, Grid } from '@mui/material'
import { useContext, useState } from 'react'
import { useResourceQuery } from 'src/hooks/resource'
import { RequestsContext } from 'src/providers/RequestsContext'
import Table from 'src/components/Shared/Table'

import { ResourceIds } from 'src/resources/ResourceIds'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { AuthContext } from 'src/providers/AuthContext'
import { DataSets } from 'src/resources/DataSets'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { useFormik } from 'formik'
import * as yup from 'yup'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'
import { DataGrid } from 'src/components/Shared/DataGrid'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'

const BeneficiaryFields = () => {
  const { postRequest, getRequest } = useContext(RequestsContext)

  const [initialValues, setInitialData] = useState({
    countryId: '',
    dispersalType: '',
    corId: '',
    rows: [
      {
        controlId: '',
        controlName: '',
        accessLevel: '',
        accessLevelName: ''
      }
    ]
  })

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      countryId: yup.string().required('This field is required'),
      dispersalType: yup.string().required('This field is required')
    }),
    onSubmit: async obj => {
      const headerObj = {
        countryId: obj.countryId,
        dispersalType: obj.dispersalType,
        corId: obj.corId
      }

      const controlAccessList = obj.rows.map(row => ({
        controlId: row.controlId,
        controlName: row.controlName,
        accessLevel: row.accessLevel,
        accessLevelName: row.accessLevelName
      }))

      const resultObject = {
        header: headerObj,
        items: controlAccessList
      }

      const res = await postRequest({
        //extension:,
        record: JSON.stringify(resultObject)
      })

      if (res.recordId) {
        toast.success('Record Updated Successfully')
      }
    }
  })

  async function fetchWithFilter({ filters }) {
    const countryId = filters?.countryId
    const dispersalType = filters?.dispersalType
    const corId = filters?.corId || 0

    if (!filters || !countryId || dispersalType || corId) {
      return { list: [] }
    } else {
      /*  return await getRequest({
        extension: SystemRepository.SMSRequest.qry,
        parameters: `_countryId=${countryId}&_correspondentId=${corId}&_dispersalType=${dispersalType}`
      })*/
      return
    }
  }

  const {
    query: { data },
    labels: labels,
    filterBy,
    access,
    filters
  } = useResourceQuery({
    datasetId: ResourceIds.OutwardsTransfer,
    filter: {
      //endpointId: SystemRepository.SMSRequest.qry,
      //filterFn: fetchWithFilter
    }
  })

  const onChange = (index, value) => {
    if (value) {
      if (index === 'countryId') filterBy('countryId', value)
      if (index === 'dispersalType') filterBy('dispersalType', value)
      if (index === 'corId') filterBy('corId', value)
    }
  }

  return (
    <>
      <Box sx={{ height: `calc(100vh - 48px)`, display: 'flex', flexDirection: 'column', zIndex: 1 }}>
        <div style={{ display: 'flex' }}>
          <GridToolbar //  maxAccess={access}
          >
            <Box sx={{ display: 'flex', width: '1000px', justifyContent: 'flex-start', pt: 2, pl: 2 }}>
              <ResourceComboBox
                endpointId={SystemRepository.Country.qry}
                name='countryId'
                label='Country'
                valueField='recordId'
                required
                displayField={['reference', 'name', 'flName']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' },
                  { key: 'flName', value: 'Foreign Language Name' }
                ]}
                values={formik.values}
                displayFieldWidth={1.25}
                onChange={(event, newValue) => {
                  if (newValue) {
                    formik.setFieldValue('countryId', newValue?.recordId)
                    onChange('countryId', newValue?.recordId)
                  }
                }}
                error={formik.touched.countryId && Boolean(formik.errors.countryId)} // maxAccess={access}
                sx={{ width: '300px' }}
              />
              <ResourceComboBox
                datasetId={DataSets.RT_Dispersal_Type}
                label={'DispersalType'}
                required
                name='dispersalType'
                valueField='key'
                displayField='value'
                values={formik.values}
                onChange={(event, newValue) => {
                  if (newValue) {
                    onChange('dispersalType', newValue?.key)
                    formik.setFieldValue('dispersalType', newValue?.key)
                  }
                }}
                error={formik.touched.dispersalType && Boolean(formik.errors.dispersalType)}
                sx={{ pl: 2, width: '310px' }}
              />
              <Box sx={{ pl: 2, width: '600px' }}>
                <ResourceLookup
                  endpointId={RemittanceSettingsRepository.Correspondent.snapshot}
                  valueField='reference'
                  displayField='name'
                  name='corId'
                  label='Correspondant'
                  form={formik}
                  displayFieldWidth={2}
                  firstFieldWidth='40%'
                  valueShow='corRef'
                  secondValueShow='corName' // maxAccess={maxAccess}
                  onChange={async (event, newValue) => {
                    if (newValue) {
                      onChange('corId', newValue?.recordId)
                      formik.setFieldValue('corId', newValue?.recordId)
                      formik.setFieldValue('corName', newValue?.name || '')
                      formik.setFieldValue('corRef', newValue?.reference || '')
                    } else {
                      formik.setFieldValue('corId', null)
                      formik.setFieldValue('corName', null)
                      formik.setFieldValue('corRef', null)
                    }
                  }}
                  errorCheck={'corId'}
                />
              </Box>
            </Box>
          </GridToolbar>
        </div>
        <FormShell
          height={600}
          form={formik}
          isInfo={false}
          initialValues={initialValues} //resourceId={35208}
        >
          <Grid width={'100%'}>
            <DataGrid
              onChange={value => formik.setFieldValue}
              value={formik.values}
              error={formik.errors}
              height={300}
              columns={[
                {
                  component: 'numberfield',
                  name: 'controlId',
                  label: 'Control Id',
                  props: {
                    readOnly: true
                  }
                },
                {
                  component: 'numberfield',
                  name: 'controlName',
                  label: 'Control Name',
                  props: {
                    readOnly: true
                  }
                },
                {
                  component: 'resourcecombobox',
                  label: 'Access Level',
                  name: 'accesslevel',
                  props: {
                    endpointId: SystemRepository.Currency.qry,
                    displayField: ['reference', 'name'],
                    valueField: 'recordId',
                    columnsInDropDown: [
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]
                  },
                  async onChange({ row: { update, oldRow, newRow } }) {
                    if (!newRow?.currency?.recordId) {
                      return
                    }
                    update({
                      currencyId: newRow.currency.recordId
                    })
                  },
                  flex: 1.5
                }
              ]}
            />
          </Grid>
        </FormShell>
      </Box>
    </>
  )
}

export default BeneficiaryFields
