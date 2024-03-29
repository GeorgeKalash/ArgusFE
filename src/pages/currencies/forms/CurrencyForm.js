// ** MUI Imports
import { Grid, FormControlLabel, Checkbox } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { useFormik } from 'formik'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { DataSets } from 'src/resources/DataSets'

// ** Custom Imports
import CustomComboBox from 'src/components/Inputs/CustomComboBox'
import CustomTextField from 'src/components/Inputs/CustomTextField'

import { SystemRepository } from 'src/repositories/SystemRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'

export default function CurrencyForm ({
  labels,
  maxAccess,
  recordId
})
{

    const [isLoading, setIsLoading] = useState(false)
    const [editMode, setEditMode] = useState(!!recordId)

    const [initialValues, setInitialData] = useState({
        recordId: null,
        name: '',
        reference: '',
        flName: '',
        decimals: null,
        profileId: null,
        currencyType: null,
        currencyTypeName: null,
        sale: false,
        purchase: false,
        isoCode: '',
        symbol: ''
      })

    const { getRequest, postRequest } = useContext(RequestsContext)

    //const editMode = !!recordId

    const invalidate = useInvalidate({
        endpointId: SystemRepository.Currency.qry
      })

    const formik = useFormik({
        initialValues,
        enableReinitialize: true,
        validateOnChange: true,
        validationSchema: yup.object({
          name: yup.string().required('This field is required'),
          reference: yup.string().required('This field is required'),
          decimals: yup.string().required('This field is required'),
          currencyType: yup.string().required('This field is required'),
          profileId: yup.string().required('This field is required')
        }),
        onSubmit: async obj => {
          const recordId = obj.recordId

          const response = await postRequest({
            extension: SystemRepository.Currency.set,
            record: JSON.stringify(obj)
          })

          if (!recordId) {
            toast.success('Record Added Successfully')
            setInitialData({
              ...obj, // Spread the existing properties
              recordId: response.recordId, // Update only the recordId field
            });
          }
          else {toast.success('Record Edited Successfully')
          setEditMode(true)
}
          invalidate()
        }
      })

      useEffect(() => {
        ;(async function () {
          try {
            if (recordId) {
              setIsLoading(true)

              const res = await getRequest({
                extension: SystemRepository.Currency.get,
                parameters: `_recordId=${recordId}`
              })

              setInitialData(res.record)
            }
          } catch (exception) {
            setErrorMessage(error)
          }
          setIsLoading(false)
        })()
      }, [])

  return (
    <FormShell
    resourceId={ResourceIds.Currencies}
    form={formik}
    height={400}
    maxAccess={maxAccess}
    editMode={editMode}
    >
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <CustomTextField
          name='reference'
          label={labels.reference}
          value={formik.values.reference}
          required
          onChange={formik.handleChange}
          maxLength='3'
          maxAccess={maxAccess}
          onClear={() => formik.setFieldValue('reference', '')}
          error={formik.touched.reference && Boolean(formik.errors.reference)}
          helperText={formik.touched.reference && formik.errors.reference}
        />
      </Grid>
      <Grid item xs={12}>
        <CustomTextField
          name='name'
          label={labels.name}
          value={formik.values.name}
          required
          maxAccess={maxAccess}
          onChange={formik.handleChange}
          onClear={() => formik.setFieldValue('name', '')}
          error={formik.touched.name && Boolean(formik.errors.name)}
          helperText={formik.touched.name && formik.errors.name}
        />
      </Grid>
      <Grid item xs={12}>
        <CustomTextField
          name='flName'
          label={labels.foreignLanguage}
          value={formik.values.flName}
          maxAccess={maxAccess}
          onChange={formik.handleChange}
          onClear={() => formik.setFieldValue('flName', '')}
          error={formik.touched.flName && Boolean(formik.errors.flName)}
          helperText={formik.touched.flName && formik.errors.flName}
        />
      </Grid>
      <Grid item xs={12}>
        <ResourceComboBox
          datasetId={DataSets.CURRENCY_DECIMALS}
          name='decimals'
          label={labels.decimals}
          valueField='key'
          displayField='value'
          values={formik.values}
          required
          maxAccess={maxAccess}
          onChange={(event, newValue) => {
            formik && formik.setFieldValue('decimals', newValue?.key)
          }}
          error={formik.touched.decimals && Boolean(formik.errors.decimals)}
          helperText={formik.touched.decimals && formik.errors.decimals}
        />
      </Grid>
      <Grid item xs={12}>
        <ResourceComboBox
          datasetId={DataSets.CURRENCY_PROFILE}
          name='profileId'
          label={labels.profile}
          valueField='key'
          displayField='value'
          values={formik.values}
          required
          maxAccess={maxAccess}
          onChange={(event, newValue) => {
            formik && formik.setFieldValue('profileId', newValue?.key)
          }}
          error={formik.touched.profileId && Boolean(formik.errors.profileId)}
          helperText={formik.touched.profileId && formik.errors.profileId}
        />
      </Grid>
      <Grid item xs={12}>
        <ResourceComboBox
          datasetId={DataSets.CURRENCY_TYPE}
          name='currencyType'
          label={labels.currencyType}
          valueField='key'
          displayField='value'
          values={formik.values}
          required
          maxAccess={maxAccess}
          readOnly={editMode}
          onChange={(event, newValue) => {
            formik && formik.setFieldValue('currencyType', newValue?.key)
          }}
          error={formik.touched.currencyType && Boolean(formik.errors.currencyType)}
          helperText={formik.touched.currencyType && formik.errors.currencyType}
        />
      </Grid>
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Checkbox
              maxAccess={maxAccess}
              name='sale'
              checked={formik.values?.sale}
              onChange={formik.handleChange}
            />
          }
          label={labels.sales}
        />
      </Grid>
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Checkbox
              maxAccess={maxAccess}
              name='purchase'
              checked={formik.values?.purchase}
              onChange={formik.handleChange}
            />
          }
          label={labels.purchase}
        />
      </Grid>
      <Grid item xs={12}>
        <CustomTextField
          name='isoCode'
          label={labels.isoCode}
          value={formik.values.isoCode}
          onChange={formik.handleChange}
          maxLength='3'
          maxAccess={maxAccess}
          onClear={() => formik.setFieldValue('isoCode', '')}
          error={formik.touched.isoCode && Boolean(formik.errors.isoCode)}
          helperText={formik.touched.isoCode && formik.errors.isoCode}
        />
      </Grid>
      <Grid item xs={12}>
        <CustomTextField
          name='symbol'
          label={labels.symbol}
          value={formik.values.symbol}
          onChange={formik.handleChange}
          maxLength='5'
          maxAccess={maxAccess}
          onClear={() => formik.setFieldValue('symbol', '')}
          error={formik.touched.symbol && Boolean(formik.errors.symbol)}
          helperText={formik.touched.symbol && formik.errors.symbol}
        />
      </Grid>
    </Grid>
    </FormShell>
  )
}

