// ** MUI Imports
import { Checkbox, FormControlLabel, Grid } from '@mui/material'

import toast from 'react-hot-toast'
import * as yup from 'yup'

// ** Custom Imports
import { useFormik } from 'formik'
import { useContext, useEffect, useState } from 'react'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import FormShell from 'src/components/Shared/FormShell'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { useInvalidate } from 'src/hooks/resource'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import { RequestsContext } from 'src/providers/RequestsContext'
import { CurrencyTradingSettingsRepository } from 'src/repositories/CurrencyTradingSettingsRepository'
import { DataSets } from 'src/resources/DataSets'
import { ResourceIds } from 'src/resources/ResourceIds'

const IdTypesForm = ({
  labels,
  editMode,
  maxAccess,
  setEditMode,
  setStore,
  store
}) => {

  const { postRequest, getRequest} = useContext(RequestsContext)
  const {recordId} = store

  const invalidate = useInvalidate({
    endpointId: CurrencyTradingSettingsRepository.IdTypes.qry
  })

  const [initialValues , setInitialData] = useState({
    recordId: null,
    name: null,
    format: null,
    length: null,
    category: null,
    clientFileExpiryType: null,
    clientFileLifeTime: null,
    type: null,
    isDiplomat:false
  })

  const formik = useFormik({
    enableReinitialize: false,
    validateOnChange: true,
    initialValues,
    validationSchema: yup.object({
      name: yup.string().required(' '),
      format: yup.string().required(' '),
      length: yup.string().required(' '),
      category: yup.string().required(' '),
      clientFileExpiryType: yup.string().required(' '),

      // clientFileLifeTime: values?.type === '1' ? yup.string().required(' ') : yup.string().notRequired(),
      isDiplomat: yup.string().required(' ')
    }),
    onSubmit: values => {
      postIdTypes(values)
    }
  })

  const postIdTypes = obj => {console.log(obj.validFrom)
    const recordId = obj?.recordId || ''
    const date =  obj?.validFrom && formatDateToApi(obj?.validFrom)
    const data = { ...obj, validFrom : date }
    console.log(obj.validFrom)
    postRequest({
      extension: CurrencyTradingSettingsRepository.IdTypes.set,
      record: JSON.stringify(data)
    })
      .then(res => {
        if (!recordId) {
            setEditMode(true)
            setStore(prevStore => ({
              ...prevStore,
              recordId: res.recordId
            }));
            toast.success('Record Added Successfully')
            
            formik.setFieldValue('recordId', res.recordId )
            formik.setFieldValue('validFrom', formatDateFromApi(res.validFrom))
            invalidate()

        } else {
          invalidate()
          toast.success('Record Editted Successfully')
        }
      })
  }

  useEffect(()=>{
    recordId  && getIdTypesById(recordId)
  },[recordId])

  const getIdTypesById =  recordId => {
    const defaultParams = `_recordId=${recordId}`
    var parameters = defaultParams
     getRequest({
      extension: CurrencyTradingSettingsRepository.IdTypes.get,
      parameters: parameters
    })
      .then(res => {
        res.record.validFrom = formatDateFromApi(res.record.validFrom)
        formik.setValues(res.record)
        setEditMode(true)
      })
  }

return (
    <FormShell
      form={formik}
      resourceId={ResourceIds.IdTypes}
      maxAccess={maxAccess}
      editMode={editMode} 
    >
     <Grid container spacing={4}>
      <Grid item xs={12}>
        <CustomTextField
          name='name'
          label={labels.name}
          value={formik.values.name}
          required
          maxLength='50'
          maxAccess={maxAccess}
          onChange={formik.handleChange}
          onClear={() => formik.setFieldValue('name', '')}
          error={formik.touched.name && Boolean(formik.errors.name)}
        />
      </Grid>
      <Grid item xs={12}>
        <CustomTextField
          name='format'
          label={labels.format}
          value={formik.values.format}
          required
          maxLength='10'
          maxAccess={maxAccess}
          onChange={formik.handleChange}
          onClear={() => formik.setFieldValue('format', '')}
          error={formik.touched.format && Boolean(formik.errors.format)}
        />
      </Grid>
      <Grid item xs={12}>
        <CustomTextField
          name='length'
          label={labels.length}
          value={formik.values.length}
          required
          minLength='1'
          maxLength='10'
          maxAccess={maxAccess}
          onChange={formik.handleChange}
          onClear={() => formik.setFieldValue('length', '')}
          error={formik.touched.length && Boolean(formik.errors.length)}
        />
      </Grid>
      <Grid item xs={12}>
        <ResourceComboBox
          datasetId={DataSets.ID_CATEGORY}
          name='category'
          label={labels.category}
          required
          valueField='key'
          displayField='value'
          values={formik.values}
          onChange={(event, newValue) => {
            formik.setFieldValue('type', '')
            formik && formik.setFieldValue('category', parseInt(newValue?.key))
          }}
          error={formik.touched.category && Boolean(formik.errors.category)}
        />
      </Grid>
      <Grid item xs={12}>
        <ResourceComboBox
          datasetId={DataSets.FILE_EMPIRY_TYPE}
          name='clientFileExpiryType'
          label={labels.clientFileExpiryType}
          required
          valueField='key'
          displayField='value'
          values={formik.values}
          onChange={(event, newValue) => { 
            formik && formik.setFieldValue('type', newValue?.key);
            formik && formik.setFieldValue('clientFileExpiryType', newValue?.key)
          }}
          error={formik.touched.clientFileExpiryType && Boolean(formik.errors.clientFileExpiryType)}
        />
      </Grid>
      <Grid item xs={12}>
        <CustomTextField
          name='clientFileLifeTime'
          label={labels.clientFileLifeTime}
          value={formik.values.clientFileLifeTime}
          required={formik.values.clientFileExpiryType === "1" ? true : false}
          readOnly={formik.values.clientFileExpiryType === "1" ? false : true}
          onChange={formik.handleChange}
          maxLength='10'
          maxAccess={maxAccess}
          onClear={() => formik.setFieldValue('clientFileLifeTime', '')}
          error={formik.touched.clientFileLifeTime && Boolean(formik.errors.clientFileLifeTime)}
        />
      </Grid>
      <Grid item xs={12}>
        <ResourceComboBox
          datasetId={DataSets.ID_TYPE}
          name='type'
          label={labels.type}
          required={formik.values.category ===1 && true}
          readOnly={formik.values.category !==1 && true}
          valueField='key'
          displayField='value'
          values={formik.values}
          onChange={(event, newValue) => {
            formik && formik.setFieldValue('type', newValue?.key || null)
          }}
          error={formik.touched.type && Boolean(formik.errors.type)}
        />
      </Grid>
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Checkbox
              name='isDiplomat'
              checked={formik.values?.isDiplomat}
              onChange={formik.handleChange}
              maxAccess={maxAccess}
            />
          }
          label={labels.isDiplomat}
        />
      </Grid>
    </Grid>
    </FormShell>
  )
}

export default IdTypesForm
