// ** MUI Imports
import { Grid, Box, FormControlLabel, Checkbox } from '@mui/material'

import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'
import { useFormik } from 'formik'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import { DataSets } from 'src/resources/DataSets'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { useContext, useEffect } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'

const ProductDispersalForm = ({
  pId,
  labels,
  recordId,
  getGridData,
  maxAccess,
  window,
}) => {

  const { getRequest, postRequest } = useContext(RequestsContext)

  const formik = useFormik({
    initialValues : {
      recordId: null,
      productId: pId,
      reference: null,
      name: null,
      dispersalType: null,
      isDefault: false,
      isInactive: false
    },
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      productId: yup.string().required('This field is required'),
      reference: yup.string().required('This field is required'),
      name: yup.string().required('This field is required'),
      dispersalType: yup.string().required('This field is required'),
      isDefault: yup.string().required('This field is required'),
      isInactive: yup.string().required('This field is required')
    }),
    onSubmit: values => {
      post(values)
    }
  })



  const post = obj => {
    const recordId = obj.recordId
    const productId = obj.productId  ? obj.productId : pId
    postRequest({
      extension: RemittanceSettingsRepository.ProductDispersal.set,
      record: JSON.stringify(obj)
    })
      .then(res => {
        if (!recordId) {
          toast.success('Record Added Successfully')
        }
        else toast.success('Record Editted Successfully')

        getGridData(pId)
        window.close()
      })
      .catch(error => {
      })
  }

  const getDispersalById = id => {
    const _recordId = id
    const defaultParams = `_recordId=${_recordId}`
    var parameters = defaultParams
    getRequest({
      extension: RemittanceSettingsRepository.ProductDispersal.get,
      parameters: parameters
    })
      .then(res => {
        formik.setValues(res.record)


      })
      .catch(error => {
        setErrorMessage(error)
      })
  }
  useEffect(()=>{
    recordId && getDispersalById(recordId)
  },[recordId])

return (
  <FormShell form={formik}
   resourceId={ResourceIds.ProductMaster}
   maxAccess={maxAccess}
  >
     <Grid container gap={2}>
            <Grid container xs={12} spacing={2}>
              <Grid item xs={12}>
                <CustomTextField
                  name='reference'
                  label={labels.reference}
                  value={formik.values.reference}
                  required
                  readOnly={false}
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
                  label={labels.name}
                  value={formik.values.name}
                  required
                  readOnly={false}
                  onChange={formik.handleChange}
                  onClear={() => formik.setFieldValue('name', '')}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                  maxAccess={maxAccess}
                />
              </Grid>
              <Grid item xs={12}>
                <ResourceComboBox
                  name='dispersalType'
                  label={labels.dispersalType}
                  datasetId={DataSets.RT_Dispersal_Type}
                  valueField='key'
                  displayField='value'
                  values={formik.values}
                  required
                  onChange={(event, newValue) => {
                    formik.setFieldValue('dispersalType', newValue?.key)
                  }}
                  error={formik.touched.dispersalType && Boolean(formik.errors.dispersalType)}
                  helperText={formik.touched.dispersalType && formik.errors.dispersalType}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name='isDefault'
                      required
                      checked={formik.values?.isDefault}
                      onChange={formik.handleChange}
                    />
                  }
                  label={labels.isDefault}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name='isInactive'
                      required
                      checked={formik.values?.isInactive}
                      onChange={formik.handleChange}
                    />
                  }
                  label={labels.isInactive}
                />
              </Grid>
            </Grid>
          </Grid>

        </FormShell>

  )
}

export default ProductDispersalForm
