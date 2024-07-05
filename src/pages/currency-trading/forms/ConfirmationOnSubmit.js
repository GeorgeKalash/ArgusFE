import React from 'react'
import { useFormik } from 'formik'
import { Grid } from '@mui/material'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import FormShell from 'src/components/Shared/FormShell'

export default function ConfirmationOnSubmit({ formik, labels, window }) {
  const fetchFormik = useFormik({
    enableReinitialize: false,
    validateOnChange: true,
    initialValues: {
      idNo: formik.values.id_number,
      cellPhone: formik.values.cellPhone,
      idNoRepeat: '',
      cellPhoneRepeat: ''
    },
    validate: values => {
      const errors = {}
      if (!formik.values.clientId && !values.cellPhoneRepeat) {
        errors.cellPhoneRepeat = 'Cell Phone Confirm is required'
      } else if (!formik.values.clientId && values.cellPhone !== values.cellPhoneRepeat) {
        errors.cellPhoneRepeat = 'Cell Phone must match'
      }

      if (!values.idNoRepeat) {
        errors.idNoRepeat = 'Id number Confirm is required'
      } else if (values.idNo.toString() != values.idNoRepeat.toString()) {
        errors.idNoRepeat = 'Id Number  must match'
      }

      return errors
    },
    onSubmit: values => {
      formik.setFieldValue('cellPhoneConfirm', values.cellPhoneRepeat)
      formik.setFieldValue('idNoConfirm', values.idNoRepeat)

      formik.handleSubmit()
      window.close()
    }
  })

  return (
    <>
      <FormShell form={fetchFormik} infoVisible={false}>
        <Grid container spacing={4}>
          <Grid item xs={12} sx={{ position: 'relative', width: '100%' }}>
            <CustomTextField
              name='idNoRepeat'
              label={labels.confirmIdNumber}
              value={fetchFormik.values?.idNoRepeat}
              required
              onChange={fetchFormik.handleChange}
              maxLength='15'
              onClear={() => {
                fetchFormik.setFieldValue('idNoRepeat', '')
              }}
              error={fetchFormik.touched.idNoRepeat && Boolean(fetchFormik.errors.idNoRepeat)}
              helperText={fetchFormik.touched.idNoRepeat && fetchFormik.errors.idNoRepeat}
            />
          </Grid>

          {!formik.values.clientId && (
            <Grid item xs={12} sx={{ position: 'relative', width: '100%' }}>
              <CustomTextField
                name='cellPhoneRepeat'
                label={labels.cellPhoneConfirm}
                value={fetchFormik.values?.cellPhoneRepeat}
                required
                onChange={fetchFormik.handleChange}
                maxLength='15'
                onClear={() => {
                  fetchFormik.setFieldValue('cellPhoneRepeat', '')
                }}
                error={fetchFormik.touched.cellPhoneRepeat && Boolean(fetchFormik.errors.cellPhoneRepeat)}
                helperText={fetchFormik.touched.cellPhoneRepeat && fetchFormik.errors.cellPhoneRepeat}
              />
            </Grid>
          )}
        </Grid>
      </FormShell>
    </>
  )
}
