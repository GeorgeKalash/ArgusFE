import { Grid } from '@mui/material'
import React, { useEffect } from 'react'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import FormShell from 'src/components/Shared/FormShell'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { useForm } from 'src/hooks/form'
import { CurrencyTradingSettingsRepository } from 'src/repositories/CurrencyTradingSettingsRepository'
import { DataSets } from 'src/resources/DataSets'

export default function MoreDetails({ labels, editMode, maxAccess, readOnly, clientFormik, window }) {
  const { formik } = useForm({
    initialValues: {
      trxCountPerYear: '',
      trxAmountPerYear: '',
      riskLevel: '',
      civilStatus: '',
      title: '',
      oldReference: ''
    },
    enableReinitialize: true,
    maxAccess,
    validateOnChange: true,
    onSubmit: async obj => {
      clientFormik.setValues({
        ...clientFormik.values,
        trxCountPerYear: obj.trxCountPerYear,
        trxAmountPerYear: obj.trxAmountPerYear,
        riskLevel: obj.riskLevel,
        civilStatus: obj.civilStatus,
        oldReference: obj.oldReference,
        title: obj.title
      })
      window.close()
    }
  })

  useEffect(() => {
    formik.setValues({
      trxCountPerYear: clientFormik.values.trxCountPerYear,
      trxAmountPerYear: clientFormik.values.trxAmountPerYear,
      riskLevel: clientFormik.values.riskLevel,
      civilStatus: clientFormik.values.civilStatus,
      oldReference: clientFormik.values.oldReference,
      title: clientFormik.values.title
    })
  }, [])

  return (
    <FormShell form={formik} infoVisible={false} isCleared={false}>
      <Grid container xs={12} spacing={2} sx={{ p: 5 }}>
        <Grid item xs={12}>
          <CustomNumberField
            name='trxCountPerYear'
            readOnly={editMode || readOnly}
            onChange={formik.handleChange}
            label={labels.trxCountPerYear}
            value={formik.values.trxCountPerYear}
            error={formik.touched.trxCountPerYear && Boolean(formik.errors.trxCountPerYear)}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomNumberField
            name='trxAmountPerYear'
            readOnly={editMode || readOnly}
            label={labels.trxAmountPerYear}
            onChange={formik.handleChange}
            value={formik.values.trxAmountPerYear}
            error={formik.touched.trxAmountPerYear && Boolean(formik.errors.trxAmountPerYear)}
          />
        </Grid>

        <Grid item xs={12}>
          <ResourceComboBox
            endpointId={CurrencyTradingSettingsRepository.RiskLevel.qry}
            name='riskLevel'
            label={labels.riskLevel}
            readOnly={(editMode && !allowEdit) || readOnly}
            valueField='recordId'
            displayField={['reference', 'name']}
            columnsInDropDown={[
              { key: 'reference', value: 'Reference' },
              { key: 'name', value: 'Name' }
            ]}
            values={formik.values}
            onChange={(event, newValue) => {
              if (newValue) {
                formik.setFieldValue('riskLevel', newValue?.recordId)
              } else {
                formik.setFieldValue('riskLevel', null)
              }
            }}
            error={formik.touched.riskLevel && Boolean(formik.errors.riskLevel)}
            maxAccess={maxAccess}
          />
        </Grid>

        <Grid item xs={12}>
          <ResourceComboBox
            datasetId={DataSets.CIVIL_STATUS}
            name='civilStatus'
            label={labels.civilStatus}
            valueField='key'
            displayField='value'
            values={formik.values}
            readOnly={(editMode && !allowEdit) || readOnly}
            onChange={(event, newValue) => {
              if (newValue) {
                formik.setFieldValue('civilStatus', newValue?.key)
              } else {
                formik.setFieldValue('civilStatus', newValue?.key)
              }
            }}
            error={formik.touched.civilStatus && Boolean(formik.errors.civilStatus)}
            maxAccess={maxAccess}
          />
        </Grid>

        <Grid item xs={12}>
          <CustomTextField
            name='oldReference'
            label={labels.oldReference}
            value={formik.values?.oldReference}
            readOnly={editMode || readOnly}
            onChange={formik.handleChange}
            maxLength='10'
            onClear={() => formik.setFieldValue('oldReference', '')}
            error={formik.touched.oldReference && Boolean(formik.errors.oldReference)}
            maxAccess={maxAccess}
          />
        </Grid>

        <Grid item xs={12}>
          <ResourceComboBox
            datasetId={DataSets.TITLE}
            name='title'
            label={labels.title}
            valueField='key'
            displayField='value'
            readOnly={(editMode && !allowEdit) || readOnly}
            values={formik.values}
            onChange={(event, newValue) => {
              if (newValue) {
                formik.setFieldValue('title', newValue?.key)
              } else {
                formik.setFieldValue('title', null)
              }
            }}
            error={formik.touched.title && Boolean(formik.errors.title)}
            maxAccess={maxAccess}
          />
        </Grid>
      </Grid>
    </FormShell>
  )
}
