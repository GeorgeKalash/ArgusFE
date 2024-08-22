import { Grid } from '@mui/material'
import React, { useEffect } from 'react'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import FormShell from 'src/components/Shared/FormShell'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { useForm } from 'src/hooks/form'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'

export default function ExtraIncome({ labels, editMode, maxAccess, clientFormik, window, readOnly }) {
  const { formik } = useForm({
    initialValues: {
      extraIncome: '',
      extraIncomeId: ''
    },
    enableReinitialize: true,
    maxAccess,
    validateOnChange: true,
    onSubmit: async obj => {
      clientFormik.setValues({
        ...clientFormik.values,
        extraIncome: obj.extraIncome,
        extraIncomeId: obj.extraIncomeId
      })
      window.close()
    }
  })

  useEffect(() => {
    formik.setValues({
      extraIncome: clientFormik.values.extraIncome,
      extraIncomeId: clientFormik.values.extraIncomeId
    })
  }, [])

  return (
    <FormShell form={formik} infoVisible={false} isCleared={false}>
      <Grid container spacing={2} sx={{ p: 5 }}>
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
      </Grid>
    </FormShell>
  )
}
