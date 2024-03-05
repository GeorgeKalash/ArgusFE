import { Grid } from '@mui/material'
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

import { SystemRepository } from 'src/repositories/SystemRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import {ResourceLookup} from 'src/components/Shared/ResourceLookup'

export default function CityDistrictForm ({ _labels, recordId, maxAccess }) {
  const [isLoading, setIsLoading] = useState(false)
  const [editMode, setEditMode] = useState(!!recordId)

  const [initialValues, setInitialData] = useState({
    recordId: null,
    name: '',
    reference: '',
    countryId: null,
    cityId: null,
    countryName: '',
    cityName: '',
    cityRef: ''
  })

  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: SystemRepository.CityDistrict.page
  })

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      name: yup.string().required('This field is required'),
      reference: yup.string().required('This field is required'),
      countryId: yup.string().required('This field is required'),
      cityId: yup.string().required('This field is required')
    }),
    onSubmit: async obj => {
      const recordId = obj.recordId

      const response = await postRequest({
        extension: SystemRepository.CityDistrict.set,
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
            extension: SystemRepository.CityDistrict.get,
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
      resourceId={ResourceIds.CityDistrict}
      form={formik}
      height={400}
      maxAccess={maxAccess}
      editMode={editMode}
    >
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
            maxLength='10'
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
            maxLength='40'
            maxAccess={maxAccess}
          />
        </Grid>
        <Grid item xs={12}>
          <ResourceComboBox
            endpointId={SystemRepository.Country.qry}
            name='countryId'
            label={_labels.country}
            valueField='recordId'
            displayField='name'
            displayFieldWidth={1}
            columnsInDropDown={[
              { key: 'reference', value: 'Reference' },
              { key: 'name', value: 'Name' },
              { key: 'flName', value: 'Foreign Language' }
            ]}
            values={formik.values}
            required
            maxAccess={maxAccess}
            onChange={(event, newValue) => {
              formik.setFieldValue('cityId', null) //city lookup depends on countryId
              formik.setFieldValue('cityRef', null)
              formik.setFieldValue('cityName', null)
              if (newValue) {
                formik.setFieldValue('countryId', newValue?.recordId)
              } else {
                formik.setFieldValue('countryId', '')
              }
            }}
            error={formik.touched.countryId && Boolean(formik.errors.countryId)}
            helperText={formik.touched.countryId && formik.errors.countryId}
          />
        </Grid>
        <Grid item xs={12}>
          <ResourceLookup
            endpointId={SystemRepository.City.snapshot}
            parameters={{
              _countryId: formik.values.countryId,
              _stateId: 0
            }}
            valueField='reference'
            displayField='name'
            name='cityRef'
            label={_labels.city}
            required
            form={formik}
            secondDisplayField={true}
            firstValue={formik.values.cityRef}
            secondValue={formik.values.cityName}
            onChange={(event, newValue) => {
              if (newValue) {
                formik.setFieldValue('cityId', newValue?.recordId)
                formik.setFieldValue('cityRef', newValue?.reference)
                formik.setFieldValue('cityName', newValue?.name)
              } else {
                formik.setFieldValue('cityId', '')
                formik.setFieldValue('cityRef', null)
                formik.setFieldValue('cityName', null)
              }
            }}
            errorCheck={'cityId'}
            maxAccess={maxAccess}
            readOnly = {(!formik.values.countryId) && true}
          />
        </Grid>
      </Grid>
    </FormShell>
  )
}
