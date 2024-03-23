// ** MUI Imports
import { Grid, FormControlLabel, Checkbox } from '@mui/material'


// ** Third Party Imports
import { useFormik } from 'formik'
import * as yup from 'yup'
import toast from 'react-hot-toast'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'
import CustomLookup from 'src/components/Inputs/CustomLookup'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { DataSets } from 'src/resources/DataSets'
import { useContext, useState } from 'react'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import { RequestsContext } from 'src/providers/RequestsContext'

const ProductMasterTab = ({
  store,
  setStore,
  labels,
  editMode,
  setEditMode,
  maxAccess
}) => {
  const { getRequest, postRequest } = useContext(RequestsContext)

  const[ initialValues, setData] = useState({
    recordId: null,
    name: null,
    reference: null,
    type: null,
    functionId: null,
    corId: null,
    corName: null,
    corRef: null,
    languages: null,
    commissionBase: null,
    interfaceId: null,
    posMsg: null,
    posMsgIsActive: false,
    isInactive: false
  })

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      reference:  yup.string().required('This field is required'),
      name:  yup.string().required('This field is required'),
      type:  yup.string().required('This field is required'),
      functionId:  yup.string().required('This field is required'),
      interfaceId:  yup.string().required('This field is required'),
      commissionBase:  yup.string().required('This field is required'),
      isInactive:  yup.string().required('This field is required'),

      // corId : type==="1" ? yup.string().required('This field is required') : yup.string().notRequired()
    }),
    onSubmit: values => {
      postProductMaster(values)
    }
  })

  const postProductMaster = obj => {
    const recordId = obj.recordId
    postRequest({
      extension: RemittanceSettingsRepository.ProductMaster.set,
      record: JSON.stringify(obj)
    })
      .then(res => {

        if (!recordId){
          formik.setFieldValue('recordId', res.recordId)

          toast.success('Record Added Successfully')
          setEditMode(true)
          setStore(prevStore => ({
            ...prevStore,
              recordId: res.recordId
          }));

        }else{
          toast.success('Record Editted Successfully')
        }


      })
      .catch(error => {
      })
  }

return (
  <FormShell form={formik}
   resourceId={ResourceIds.ProductMaster}
   maxAccess={maxAccess}
   editMode={editMode}>      <Grid container>
        {/* First Column */}
        <Grid container rowGap={2} xs={6} sx={{ px: 2 }}>
          <Grid item xs={12}>
            <CustomTextField
              name='reference'
              label='Reference'
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
              label='Name'
              value={formik.values.name}
              required
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('name', '')}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              name='type'
              label='Type'
              datasetId={DataSets.RT_Product_Type}
              valueField='key'
              displayField='value'
              values={formik.values}
              required
              onChange={(event, newValue) => {
                formik && formik.setFieldValue('type', newValue?.key);
              }}
              error={formik.touched.type && Boolean(formik.errors.type)}
              helperText={formik.touched.type && formik.errors.type}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              name='functionId'
              label='Function'
              datasetId={DataSets.RT_Function}
              valueField='key'
              displayField='value'
              values={formik.values}
              required
              onChange={(event, newValue) => {
                formik.setFieldValue('functionId', newValue?.key)
              }}
              error={formik.touched.functionId && Boolean(formik.errors.functionId)}
              helperText={formik.touched.functionId && formik.errors.functionId}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceLookup
              name='corId'
              endpointId={RemittanceSettingsRepository.Correspondent.snapshot}
              label='Correspondent'
              form={formik}
              required={formik.values.type === "1" ? true : false}
              valueField='reference'
              displayField='name'
              firstValue={formik.values.corRef}
              secondValue={formik.values.corName}
              onChange={(event, newValue) => {
                if (newValue) {
                  formik.setFieldValue('corId', newValue?.recordId)
                  formik.setFieldValue('corRef', newValue?.reference)
                  formik.setFieldValue('corName', newValue?.name)
                } else {
                  formik.setFieldValue('corId', null)
                  formik.setFieldValue('corRef', null)
                  formik.setFieldValue('corName', null)
                }
              }}
              error={
                formik.touched.corId &&
                Boolean(formik.errors.corId)
              }
              helperText={
                formik.touched.corId && formik.errors.corId
              }
              maxAccess={maxAccess}
            />
          </Grid>

        </Grid>
        {/* Second Column */}
        <Grid container rowGap={2} xs={6} sx={{ px: 2 }}>
          <Grid item xs={12}>
            <ResourceComboBox
              datasetId={DataSets.RT_Language}
              name='languages'
              label='languages'
              valueField='key'
              displayField='value'
              values={formik.values}
              onChange={(event, newValue) => {
                formik.setFieldValue('languages', newValue?.key)
              }}
              error={formik.touched.languages && Boolean(formik.errors.languages)}
              helperText={formik.touched.languages && formik.errors.languages}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={ RemittanceSettingsRepository.Interface.qry}
              name='interfaceId'
              label='Interface'
              valueField='recordId'
              displayField='name'
              values={formik.values}
              required
              onChange={(event, newValue) => {
                formik.setFieldValue('interfaceId', newValue?.recordId)
              }}
              error={ formik.touched.interfaceId && Boolean(formik.errors.interfaceId)}
              helperText={formik.touched.interfaceId && formik.errors.interfaceId}
            />
          </Grid>


          <Grid item xs={12}>
            <ResourceComboBox
              datasetId={DataSets.RT_Commission_Base}
              name='commissionBase'
              label='Commission Base'
              valueField='key'
              displayField='value'
              values={formik.values}
              required
              onChange={(event, newValue) => {
             formik.setFieldValue('commissionBase', newValue?.key)
              }}
              error={formik.touched.commissionBase && Boolean(formik.errors.commissionBase)}
              helperText={formik.touched.commissionBase && formik.errors.commissionBase}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='posMsg'
              label='Message To Operator'
              value={formik.values.posMsg}
              readOnly={false}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('posMsg', '')}
              error={ formik.errors && Boolean(formik.errors.posMsg)}
              helperText={formik.errors && formik.errors.posMsg}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  name='posMsgIsActive'
                  checked={formik.values?.posMsgIsActive}
                  onChange={formik.handleChange}
                />
              }
              label='Activate Counter Message'
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  name='isInactive'
                  checked={formik.values?.isInactive}
                  onChange={formik.handleChange}
                />
              }
              label='Is inactive'
            />
          </Grid>
        </Grid>
      </Grid>
    </FormShell>
  )
}

export default ProductMasterTab
