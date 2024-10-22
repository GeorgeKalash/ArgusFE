import { Checkbox, FormControlLabel, Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { useForm } from 'src/hooks/form'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { ControlContext } from 'src/providers/ControlContext'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { DataSets } from 'src/resources/DataSets'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import FieldSet from 'src/components/Shared/FieldSet'
import Table from 'src/components/Shared/Table'

export default function AutoPostExclusionForm({ labels, maxAccess, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: RemittanceOutwardsRepository.AutoPostExclusion.qry
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      name: '',
      functionId: '',
      corId: '',
      currencyId: '',
      countryId: '',
      dispersalType: '',
      minAmount: '',
      maxAmount: '',
      isInactive: false,
      plantGroupId: '',
      cgId: '',
      items: [{ checked: false, exclusionId: 0, plantRef: '', plantName: '' }]
    },
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      name: yup.string().required(),
      functionId: yup.string().required(),
      minAmount: yup
        .number()
        .nullable()
        .transform((value, originalValue) => (String(originalValue).trim() === '' ? null : value))
        .test('is-less-than-max', 'Min Amount should be less than or equal to Max Amount', function (value) {
          const { maxAmount } = this.parent
          if (value !== null && maxAmount !== null && value > maxAmount) {
            this.createError({ path: 'maxAmount', message: 'Max Amount should be greater than or equal to Min Amount' })

            return false
          }

          return true
        }),
      maxAmount: yup
        .number()
        .nullable()
        .transform((value, originalValue) => (String(originalValue).trim() === '' ? null : value))
        .test('is-greater-than-min', 'Max Amount should be greater than or equal to Min Amount', function (value) {
          const { minAmount } = this.parent
          if (value !== null && minAmount !== null && value < minAmount) {
            this.createError({ path: 'minAmount', message: 'Min Amount should be less than or equal to Max Amount' })

            return false
          }

          return true
        })
    }),
    onSubmit: async obj => {
      const resultObject = {
        header: {
          recordId: obj.recordId,
          name: obj.name,
          functionId: obj.functionId,
          corId: obj.corId,
          currencyId: obj.currencyId,
          countryId: obj.countryId,
          dispersalType: obj.dispersalType,
          minAmount: obj.minAmount,
          maxAmount: obj.maxAmount,
          isInactive: obj.isInactive,
          plantGroupId: obj.plantGroupId,
          cgId: obj.cgId,
          plantId: obj.plantId
        },
        items: obj.items
          .filter(item => item.checked)
          .map(item => ({
            exclusionId: item.exclusionId,
            plantId: item.plantId
          }))
      }

      const response = await postRequest({
        extension: RemittanceOutwardsRepository.AutoPostExclusionPlants.set2,
        record: JSON.stringify(resultObject)
      })

      if (!obj.recordId) {
        toast.success(platformLabels.Added)
        formik.setFieldValue('recordId', response.recordId)
      } else toast.success(platformLabels.Edited)
      invalidate()
    }
  })

  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      const plants = await getRequest({
        extension: SystemRepository.Plant.qry,
        parameters: ``
      })
      if (recordId) {
        const result = await getRequest({
          extension: RemittanceOutwardsRepository.AutoPostExclusionPlants.get2,
          parameters: `_exclusionId=${recordId}`
        })

        const rows = plants.list.map((plant, index) => {
          const existingPlant = result.record.items.find(item => item.plantId === plant.recordId)

          return {
            checked: existingPlant ? true : false,
            exclusionId: recordId || 0,
            plantRef: plant.reference,
            plantName: plant.name,
            plantId: plant.recordId
          }
        })

        formik.setValues({
          ...formik.values,
          recordId: result.record.header.recordId,
          name: result.record.header.name,
          functionId: result.record.header.functionId,
          corId: result.record.header.corId,
          currencyId: result.record.header.currencyId,
          countryId: result.record.header.countryId,
          dispersalType: result.record.header.dispersalType,
          minAmount: result.record.header.minAmount,
          maxAmount: result.record.header.maxAmount,
          isInactive: result.record.header.isInactive,
          plantGroupId: result.record.header.plantGroupId,
          cgId: result.record.header.cgId,
          plantId: result.record.header.plantId,
          items: rows
        })
      } else {
        const rows = plants.list.map((plant, index) => {
          return {
            checked: false,
            exclusionId: recordId || 0,
            plantRef: plant.reference,
            plantName: plant.name,
            plantId: plant.recordId
          }
        })

        formik.setValues({
          ...formik.values,
          items: rows
        })
      }
    })()
  }, [])

  const rowColumns = [
    {
      field: 'plantRef',
      flex: 1,
      headerName: labels.plantRef
    },
    {
      field: 'plantName',
      flex: 1,
      headerName: labels.plantName
    }
  ]

  return (
    <FormShell resourceId={ResourceIds.AutoPostExclusion} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <CustomTextField
                    name='name'
                    label={labels.name}
                    value={formik.values.name}
                    required
                    maxAccess={maxAccess}
                    maxLength='30'
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('name', '')}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    datasetId={DataSets.RT_Function}
                    name='functionId'
                    label={labels.function}
                    required
                    valueField='key'
                    displayField='value'
                    values={formik.values}
                    maxAccess={maxAccess}
                    onClear={() => formik.setFieldValue('functionId', '')}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('functionId', newValue?.key || '')
                    }}
                    error={formik.touched.functionId && Boolean(formik.errors.functionId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceLookup
                    endpointId={RemittanceSettingsRepository.Correspondent.snapshot}
                    valueField='reference'
                    displayField='name'
                    name='corId'
                    label={labels.corName}
                    form={formik}
                    displayFieldWidth={2}
                    valueShow='corRef'
                    readOnly={editMode}
                    secondValueShow='corName'
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('corId', newValue ? newValue.recordId : '')
                      formik.setFieldValue('corName', newValue ? newValue.name : '')
                      formik.setFieldValue('corRef', newValue ? newValue.reference : '')
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SystemRepository.Currency.qry}
                    name='currencyId'
                    label={labels.currencyName}
                    valueField='recordId'
                    readOnly={editMode}
                    displayField={['reference', 'name', 'flName']}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' },
                      { key: 'flName', value: 'FL Name' }
                    ]}
                    values={formik.values}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('currencyId', newValue?.recordId || null)
                    }}
                    error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    name='dispersalType'
                    label={labels.dispersal}
                    datasetId={DataSets.RT_Dispersal_Type}
                    valueField='key'
                    readOnly={editMode}
                    displayField='value'
                    values={formik.values}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('dispersalType', newValue?.key)
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SystemRepository.Country.qry}
                    name='countryId'
                    label={labels.country}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' },
                      { key: 'flName', value: 'FL Name' }
                    ]}
                    readOnly={editMode}
                    values={formik.values}
                    valueField='recordId'
                    displayField={['reference', 'name', 'flName']}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('countryId', newValue?.recordId)
                    }}
                    error={formik.touched.countryId && Boolean(formik.errors.countryId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='minAmount'
                    label={labels.minAmount}
                    value={formik.values.minAmount}
                    maxAccess={maxAccess}
                    onChange={e => formik.setFieldValue('minAmount', e.target.value)}
                    onClear={() => formik.setFieldValue('minAmount', '')}
                    error={formik.touched.minAmount && Boolean(formik.errors.minAmount)}
                    decimalScale={2}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='maxAmount'
                    label={labels.maxAmount}
                    value={formik.values.maxAmount}
                    maxAccess={maxAccess}
                    onChange={e => formik.setFieldValue('maxAmount', e.target.value)}
                    onClear={() => formik.setFieldValue('maxAmount', '')}
                    error={formik.touched.maxAmount && Boolean(formik.errors.maxAmount)}
                    decimalScale={2}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SystemRepository.PlantGroup.qry}
                    name='plantGroupId'
                    label={labels.plantGroup}
                    readOnly={editMode}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik.values}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('plantGroupId', newValue?.recordId)
                    }}
                    error={formik.touched.plantGroupId && Boolean(formik.errors.plantGroupId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={RemittanceSettingsRepository.CorrespondentGroup.qry}
                    name='cgId'
                    readOnly={editMode}
                    label={labels.correspondentGroup}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik.values}
                    valueField='recordId'
                    displayField='name'
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('cgId', newValue?.recordId)
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name='isInactive'
                        maxAccess={maxAccess}
                        checked={formik.values?.isInactive}
                        onChange={formik.handleChange}
                      />
                    }
                    label={labels.isInactive}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={6} sx={{ display: 'flex', flex: 1 }}>
              <FieldSet sx={{ flex: 1 }} title={labels.plant}>
                <Table
                  columns={rowColumns}
                  gridData={{ list: formik.values.items }}
                  rowId={['plantId']}
                  pageSize={50}
                  pagination={false}
                  paginationType='client'
                  isLoading={false}
                  maxAccess={maxAccess}
                  showCheckboxColumn={true}
                />
              </FieldSet>
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
