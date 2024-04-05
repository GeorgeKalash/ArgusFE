import { Box, Grid } from '@mui/material'
import { useContext, useState } from 'react'
import { useResourceQuery } from 'src/hooks/resource'
import { RequestsContext } from 'src/providers/RequestsContext'

import { ResourceIds } from 'src/resources/ResourceIds'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { DataSets } from 'src/resources/DataSets'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { useFormik } from 'formik'
import * as yup from 'yup'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
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
        id: 1,
        controlId: '',
        controlName: '',
        accessLevel: '',
        accessLevelName: '',
        corId: '',
        countryId: '',
        resourceId: ''
      }
    ]
  })

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      countryId: yup.string().required('This field is required'),
      dispersalType: yup.string().required('This field is required'),
      corId: yup.string().required('This field is required')
    }),
    onSubmit: async obj => {
      const headerObj = {
        countryId: obj.countryId,
        dispersalType: obj.dispersalType,
        corId: obj.corId
      }
      console.log('obj ', headerObj)

      const controlAccessList = obj.rows
        .filter(row => row.accessLevel)
        .map(row => ({
          controlId: row.controlId,
          controlName: row.controlName,
          accessLevel: row.accessLevel,
          corId: obj.corId,
          resourceId: obj.dispersalType,
          countryId: obj.countryId
        }))

      const resultObject = {
        header: headerObj,
        items: controlAccessList
      }

      const res = await postRequest({
        extension: RemittanceSettingsRepository.CorrespondentControl.set,
        record: JSON.stringify(resultObject)
      })
      if (res) {
        toast.success('Record Updated Successfully')
      }
    }
  })

  async function fetchWithFilter({ filters }) {
    const countryId = filters?.countryId
    const dispersalType = filters?.dispersalType
    const corId = filters?.corId

    if (!filters || !countryId || !dispersalType || !corId) {
      return { list: [] }
    } else if (dispersalType !== '' && corId !== '') {
      const controllRES = await getRequest({
        extension: SystemRepository.ResourceControls.qry,
        parameters: `_resourceId=${dispersalType}`
      })

      const accessLevelRES = await getRequest({
        extension: RemittanceSettingsRepository.CorrespondentControl.qry,
        parameters: `_countryId=${countryId}&_corId=${corId}&_resourceId=${dispersalType}`
      })

      const finalList = controllRES.list.map(x => {
        const n = {
          controlId: x.id,
          controlName: x.name,
          accessLevel: null,
          accessLevelName: null
        }

        const matchingControl = accessLevelRES.list.find(y => n.controlId === y.controlId)

        if (matchingControl) {
          n.accessLevel = matchingControl.accessLevel
          n.accessLevelName = matchingControl.accessLevelName
        }

        return n
      })
      formik.setValues({
        ...formik.values,
        rows: finalList.map((item, index) => ({
          id: index + 1,
          ...item
        }))
      })

      return { list: finalList }
    }
  }

  const {
    labels: labels,
    filterBy,
    access,
    filters
  } = useResourceQuery({
    datasetId: ResourceIds.CorrespondentControl,
    filter: {
      endpointId: SystemRepository.ResourceControls.qry,
      filterFn: fetchWithFilter
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
          <GridToolbar maxAccess={access}>
            <Box sx={{ display: 'flex', width: '1000px', justifyContent: 'flex-start', pt: 2, pl: 2 }}>
              <ResourceComboBox
                endpointId={SystemRepository.Country.qry}
                name='countryId'
                label={labels.country}
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
                error={formik.touched.countryId && Boolean(formik.errors.countryId)}
                maxAccess={access}
                sx={{ width: '300px' }}
              />
              <ResourceComboBox
                datasetId={DataSets.BENEFICIARY_RESOURCEIDS}
                label={labels.dispersalType}
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
                  label={labels.correspondent}
                  form={formik}
                  required
                  displayFieldWidth={2}
                  firstFieldWidth='40%'
                  valueShow='corRef'
                  secondValueShow='corName'
                  maxAccess={access}
                  onChange={async (event, newValue) => {
                    if (newValue) {
                      onChange('corId', newValue?.recordId)
                      formik.setFieldValue('corId', newValue?.recordId)
                      formik.setFieldValue('corName', newValue?.name || '')
                      formik.setFieldValue('corRef', newValue?.reference || '')
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
          initialValues={initialValues}
          resourceId={ResourceIds.CorrespondentControl}
        >
          <Grid width={'100%'}>
            <DataGrid
              onChange={value => formik.setFieldValue('rows', value)}
              value={formik.values.rows}
              error={formik.errors.rows}
              allowDelete={false}
              height={550}
              columns={[
                {
                  component: 'textfield',
                  name: 'controlId',
                  label: labels.controlId,
                  props: {
                    readOnly: true
                  }
                },
                {
                  component: 'textfield',
                  name: 'controlName',
                  label: labels.controlName,
                  props: {
                    readOnly: true
                  }
                },
                {
                  component: 'resourcecombobox',
                  label: labels.accessLevel,
                  name: 'accesslevelName',
                  props: {
                    datasetId: DataSets.AU_RESOURCE_CONTROL_ACCESS_LEVEL,
                    displayField: 'value',
                    valueField: 'key',
                    mapping: [
                      { from: 'key', to: 'accessLevel' },
                      { from: 'value', to: 'accessLevelName' }
                    ],
                    displayFieldWidth: 20
                  },
                  widthDropDown: 200
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
