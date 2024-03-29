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

export default function CityForm ({ labels, recordId, maxAccess }) {

    const [isLoading, setIsLoading] = useState(false)
    const [editMode, setEditMode] = useState(!!recordId)

    const [initialValues, setInitialData] = useState({
      recordId: null,
      name: '',
      reference: '',
      countryId: null,
      stateId: null,
      countryName: '',
      stateName: ''
    })

    const { getRequest, postRequest } = useContext(RequestsContext)

    const invalidate = useInvalidate({
      endpointId: SystemRepository.City.page
    })

  const formik = useFormik({
      initialValues,
      enableReinitialize: true,
      validateOnChange: true,
      validationSchema: yup.object({
        name: yup.string().required('This field is required'),
        reference: yup.string().required('This field is required'),
        countryId: yup.string().required('This field is required')
      }),
      onSubmit: async obj => {
        const recordId = obj.recordId

        const response = await postRequest({
          extension: SystemRepository.City.set,
          record: JSON.stringify(obj)
        })
        
        if (!recordId) {
          toast.success('Record Added Successfully')
          setInitialData({
            ...obj, // Spread the existing properties
            recordId: response.recordId, // Update only the recordId field
          });
        }
        else toast.success('Record Edited Successfully')
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
              extension: SystemRepository.City.get,
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


    return(
      <FormShell 
      resourceId={ResourceIds.Cities}
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
          maxAccess={maxAccess}
          readOnly={editMode}
          onChange={formik.handleChange}
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
          readOnly={editMode}
          onChange={formik.handleChange}
          onClear={() => formik.setFieldValue('name', '')}
          error={formik.touched.name && Boolean(formik.errors.name)}
          helperText={formik.touched.name && formik.errors.name}
        />
      </Grid>
      <Grid item xs={12}>
      <ResourceComboBox
              endpointId={SystemRepository.Country.qry}
              name='countryId'
              label={labels.country}
              valueField='recordId'
              displayField='name'
              readOnly={editMode}
              displayFieldWidth={1}
              columnsInDropDown={[
                { key: 'reference', value: 'Reference' },
                { key: 'name', value: 'Name' }
              ]}
              values={formik.values}
              required
              maxAccess={maxAccess}
              onChange={(event, newValue) => {
                formik.setFieldValue('stateId', null)
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
      <ResourceComboBox
              endpointId={SystemRepository.State.qry}
              parameters={formik.values.countryId && `_countryId=${formik.values.countryId}`}
              name='stateId'
              label={labels.state}
              valueField='recordId'
              displayField='name'
              readOnly={(editMode || !formik.values.countryId) && true}
              values={formik.values}
              onChange={(event, newValue) => {
                formik.setFieldValue('stateId', newValue?.recordId)
              }}
              error={formik.touched.stateId && Boolean(formik.errors.stateId)}
              helperText={formik.touched.stateId && formik.errors.stateId}
              maxAccess={maxAccess}
            />
      </Grid>
    </Grid>
    </FormShell>
  )
}

