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
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'

const BeneficiaryFields = () => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const initialValues = {
    countryId: '',
    dispersalType: '',
    corId: 0,
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
  }

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      countryId: yup.string().required(),
      dispersalType: yup.string().required()
    }),
    onSubmit: async obj => {
      const headerObj = {
        countryId: obj.countryId,
        dispersalType: obj.dispersalType,
        corId: obj.corId
      }

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
        toast.success(platformLabels.Updated)
      }
    }
  })

  async function fetchWithFilter({ filters }) {
    const countryId = filters?.countryId
    const dispersalType = filters?.dispersalType
    const corId = filters?.corId == null ? 0 : filters?.corId
    if (!filters || !countryId || !dispersalType) {
      return { list: [] }
    } else if (dispersalType !== '' && corId !== '') {
      const controllRES = await getRequest({
        extension: SystemRepository.ResourceControl.qry,
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
      endpointId: SystemRepository.ResourceControl.qry,
      filterFn: fetchWithFilter
    }
  })

  const onChange = (index, value) => {
    console.log(index, value)
    if (value) {
      if (index === 'countryId') filterBy('countryId', value)
      if (index === 'dispersalType') filterBy('dispersalType', value)
      if (index === 'corId') filterBy('corId', value)
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
                  if (formik.values.corId) onChange('corId', formik.values.corId)
                  else onChange('corId', 0)
                  formik.setFieldValue('dispersalType', newValue?.key)
                }
              }}
              error={formik.touched.dispersalType && Boolean(formik.errors.dispersalType)}
            />
          </Grid>
          <Grid item xs={4}>
            <ResourceLookup
              endpointId={RemittanceSettingsRepository.Correspondent.snapshot}
              valueField='reference'
              displayField='name'
              name='corId'
              label={labels.correspondent}
              form={formik}
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
                } else {
                  onChange('corId', 0)
                  formik.setFieldValue('corId', 0)
                  formik.setFieldValue('corName', '')
                  formik.setFieldValue('corRef', '')
                }
              }}
              onClear={() => {
                onChange('corId', 0)
                formik.setFieldValue('corId', 0)
                formik.setFieldValue('corName', '')
                formik.setFieldValue('corRef', '')
              }}
              errorCheck={'corId'}
            />
          </Grid>
        </Grid>
      </Fixed>
      <FormShell
        form={formik}
        isInfo={false}
        initialValues={initialValues}
        resourceId={ResourceIds.CorrespondentControl}
      >
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('rows', value)}
            value={formik.values.rows}
            error={formik.errors.rows}
            allowDelete={false}
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
                  ]
                }
              }
            ]}
          />
        </Grow>
      </FormShell>
    </VertLayout>
  )
}

export default BeneficiaryFields
