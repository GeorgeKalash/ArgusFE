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

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'

import { SystemRepository } from 'src/repositories/SystemRepository'

// ** Helpers
import { getFormattedNumberMax, validateNumberField, getNumberWithoutCommas } from 'src/lib/numberField-helper'

export default function CountryForm({ _labels, maxAccess, recordId }) {
  const [isLoading, setIsLoading] = useState(false)
  const [editMode, setEditMode] = useState(!!recordId)

  const [initialValues, setInitialData] = useState({
    recordId: null,
    name: '',
    reference: '',
    flName: '',
    currencyId: null,
    regionId: null,
    ibanLength: '',
    isInactive: false,
    currencyRef: null,
    currencyName: null,
    regionRef: null,
    regionName: null
  })

  const { getRequest, postRequest } = useContext(RequestsContext)

  //const editMode = !!recordId

  const invalidate = useInvalidate({
    endpointId: SystemRepository.Country.page
  })

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      ibanLength: yup
        .number()
        .transform((value, originalValue) => validateNumberField(value, originalValue))
        .min(0, 'Value must be greater than or equal to 0')
        .max(32767, 'Value must be less than or equal to 32,767'),
      name: yup.string().required('This field is required'),
      reference: yup.string().required('This field is required'),
      flName: yup.string().required('This field is required')
    }),
    onSubmit: async obj => {
      obj.ibanLength = getNumberWithoutCommas(obj.ibanLength)
      const recordId = obj.recordId

      const response = await postRequest({
        extension: SystemRepository.Country.set,
        record: JSON.stringify(obj)
      })

      if (!recordId) {
        toast.success('Record Added Successfully')
        setInitialData({
          ...obj, // Spread the existing properties
          recordId: response.recordId // Update only the recordId field
        })
      } else toast.success('Record Edited Successfully')
      setEditMode(true)

      invalidate()
    }
  })

  useEffect(() => {
    ;(async function () {
      try {
        if (recordId) {
          setIsLoading(true)

          const res = await getRequest({
            extension: SystemRepository.Country.get,
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
    <FormShell resourceId={ResourceIds.Countries} form={formik} height={400} maxAccess={maxAccess} editMode={editMode}>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <CustomTextField
            name='reference'
            label={_labels.reference}
            value={formik.values.reference}
            readOnly={editMode}
            required
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('reference', '')}
            error={formik.touched.reference && Boolean(formik.errors.reference)}
            helperText={formik.touched.reference && formik.errors.reference}
            maxAccess={maxAccess}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name='name'
            label={_labels.name}
            value={formik.values.name}
            required
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('name', '')}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
            maxAccess={maxAccess}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name='flName'
            label={_labels.fLang}
            value={formik.values.flName}
            required
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('flName', '')}
            error={formik.touched.flName && Boolean(formik.errors.flName)}
            helperText={formik.touched.flName && formik.errors.flName}
            maxLength='30'
            maxAccess={maxAccess}
          />
        </Grid>
        <Grid item xs={12}>
          <ResourceComboBox
            endpointId={SystemRepository.Currency.qry}
            name='currencyId'
            label={_labels.currency}
            valueField='recordId'
            displayField='name'
            values={formik.values}
            onChange={(event, newValue) => {
              formik && formik.setFieldValue('currencyId', newValue?.recordId)
            }}
            error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
            helperText={formik.touched.currencyId && formik.errors.currencyId}
            maxAccess={maxAccess}
          />
        </Grid>
        <Grid item xs={12}>
          <ResourceComboBox
            endpointId={SystemRepository.GeographicRegion.qry}
            name='regionId'
            label={_labels.geoRegion}
            valueField='recordId'
            displayField='name'
            values={formik.values}
            onChange={(event, newValue) => {
              formik && formik.setFieldValue('regionId', newValue?.recordId)
            }}
            error={formik.touched.regionId && Boolean(formik.errors.regionId)}
            helperText={formik.touched.regionId && formik.errors.regionId}
            maxAccess={maxAccess}
            parameters='_startAt=0&_pageSize=1000'
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name='ibanLength'
            label={_labels.ibanLength}
            value={getFormattedNumberMax(formik.values.ibanLength, 5, 0)}
            onChange={e => formik.setFieldValue('ibanLength', getFormattedNumberMax(e.target.value, 5, 0))}
            onClear={() => formik.setFieldValue('ibanLength', '')}
            error={formik.touched.ibanLength && Boolean(formik.errors.ibanLength)}
            helperText={formik.touched.ibanLength && formik.errors.ibanLength}
            maxAccess={maxAccess}
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
            label={_labels.isInactive}
          />
        </Grid>
      </Grid>
    </FormShell>
 )
}