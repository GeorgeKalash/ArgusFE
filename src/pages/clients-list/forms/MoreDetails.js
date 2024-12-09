import { Grid } from '@mui/material'
import React, { useContext, useEffect, useState } from 'react'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import FormShell from 'src/components/Shared/FormShell'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { useForm } from 'src/hooks/form'
import { RequestsContext } from 'src/providers/RequestsContext'
import { CashBankRepository } from 'src/repositories/CashBankRepository'
import { CurrencyTradingSettingsRepository } from 'src/repositories/CurrencyTradingSettingsRepository'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { DataSets } from 'src/resources/DataSets'

export default function MoreDetails({ labels, editMode, maxAccess, readOnly, clientFormik, allowEdit, window }) {
  const [countryId, setCountryId] = useState()
  const { getRequest } = useContext(RequestsContext)

  useEffect(() => {
    async function getCountry() {
      var parameters = `_filter=&_key=countryId`

      const res = await getRequest({
        extension: SystemRepository.Defaults.get,
        parameters: parameters
      })
      const countryId = res.record.value

      setCountryId(parseInt(countryId))
    }

    getCountry()
  }, [])

  const { formik } = useForm({
    initialValues: {
      trxCountPerYear: '',
      trxAmountPerYear: '',
      riskLevel: '',
      civilStatus: '',
      title: '',
      oldReference: '',
      extraIncome: '',
      bankId: '',
      iban: '',
      extraIncomeId: '',
      educationLevel: ''
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
        extraIncome: obj.extraIncome,
        extraIncomeId: obj.extraIncomeId,
        bankId: obj.bankId,
        iban: obj.iban,
        title: obj.title,
        educationLevel: obj.educationLevel
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
      title: clientFormik.values.title,
      extraIncome: clientFormik.values.extraIncome,
      extraIncomeId: clientFormik.values.extraIncomeId,
      bankId: clientFormik.values.bankId,
      iban: clientFormik.values.iban,
      educationLevel: clientFormik.values.educationLevel
    })
  }, [])

  return (
    <FormShell form={formik} infoVisible={false} isCleared={false} disabledSubmit={editMode}>
      <Grid container xs={12} spacing={2} sx={{ p: 5 }}>
        <Grid item xs={12}>
          <CustomNumberField
            name='trxCountPerYear'
            readOnly={editMode || readOnly}
            onChange={formik.handleChange}
            label={labels.trxCountPerYear}
            onClear={() => formik.setFieldValue('trxCountPerYear', '')}
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
            onClear={() => formik.setFieldValue('trxAmountPerYear', '')}
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
        <Grid item xs={12}>
          <CustomNumberField
            name='extraIncome'
            maxLength={12}
            decimalScale={0}
            readOnly={editMode || readOnly}
            onChange={formik.handleChange}
            label={labels.extraIncome}
            value={formik.values.extraIncome}
            error={formik.touched.extraIncome && Boolean(formik.errors.extraIncome)}
          />
        </Grid>
        <Grid item xs={12}>
          <ResourceComboBox
            endpointId={RemittanceSettingsRepository.ExtraIncome.qry}
            name='extraIncomeId'
            label={labels.extraIncomeType}
            readOnly={editMode || readOnly}
            valueField='recordId'
            displayField={['reference', 'name']}
            columnsInDropDown={[
              { key: 'reference', value: 'Reference' },
              { key: 'name', value: 'Name' }
            ]}
            values={formik.values}
            onChange={(event, newValue) => {
              formik.setFieldValue('extraIncomeId', newValue?.recordId || '')
            }}
            error={formik.touched.extraIncomeId && Boolean(formik.errors.extraIncomeId)}
            maxAccess={maxAccess}
          />
        </Grid>
        <Grid item xs={12}>
          <ResourceComboBox
            endpointId={countryId && CashBankRepository.CbBank.qry2}
            parameters={countryId && `_countryId=${countryId}`}
            name='bankId'
            label={labels.bank}
            readOnly={editMode || readOnly}
            valueField='recordId'
            displayField={['reference', 'name']}
            columnsInDropDown={[
              { key: 'reference', value: 'Reference' },
              { key: 'name', value: 'Name' }
            ]}
            values={formik.values}
            onChange={(event, newValue) => {
              formik.setFieldValue('bankId', newValue?.recordId || '')
            }}
            error={formik.touched.bankId && Boolean(formik.errors.bankId)}
            maxAccess={maxAccess}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name='iban'
            label={labels.iban}
            value={formik.values?.iban}
            readOnly={editMode || readOnly}
            onChange={formik.handleChange}
            maxLength='10'
            onClear={() => formik.setFieldValue('iban', '')}
            error={formik.touched.iban && Boolean(formik.errors.iban)}
            maxAccess={maxAccess}
          />
        </Grid>
        <Grid item xs='12'>
          <ResourceComboBox
            datasetId={DataSets.EDUCATION_LEVEL}
            name='educationLevel'
            label={labels.educationLevel}
            valueField='key'
            displayField='value'
            readOnly={editMode && !allowEdit && true}
            values={formik.values}
            onChange={(event, newValue) => {
              if (newValue) {
                formik.setFieldValue('educationLevel', newValue?.key)
              } else {
                formik.setFieldValue('educationLevel', null)
              }
            }}
            error={formik.touched.educationLevel && Boolean(formik.errors.educationLevel)}
            maxAccess={maxAccess}
          />
        </Grid>
      </Grid>
    </FormShell>
  )
}
