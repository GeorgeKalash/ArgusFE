// ** MUI Imports
import { Grid, FormControlLabel, Checkbox } from '@mui/material'

import * as yup from 'yup'
import toast from 'react-hot-toast'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { BusinessPartnerRepository } from 'src/repositories/BusinessPartnerRepository'
import FormShell from 'src/components/Shared/FormShell'
import { useFormik } from 'formik'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useContext, useEffect, useState } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'

const CorrespondentForm = ({
  labels,
  editMode,
  maxAccess,
  setEditMode,
  setStore,
  store
}) => {

  const { postRequest, getRequest} = useContext(RequestsContext)
  const {recordId} = store

  const [initialValues , setInitialData] = useState({
    recordId: null,
    name: null,
    reference: null,
    bpId: null,
    currencyId: null,
    currencyRef: null,
    isInactive: false
  })

  const formik = useFormik({
    enableReinitialize: false,
    validateOnChange: true,
    initialValues,
    validationSchema: yup.object({
      reference: yup.string().required('This field is required'),
      name: yup.string().required('This field is required'),
      bpId: yup.string().required('This field is required'),
      bpRef: yup.string().required('This field is required'),
      bpName: yup.string().required('This field is required')
    }),
    onSubmit: values => {
      postCorrespondent(values)
    }
  })

  const postCorrespondent = obj => {
    const recordId = obj?.recordId ||
    postRequest({
      extension: RemittanceSettingsRepository.Correspondent.set,
      record: JSON.stringify(obj)
    })
      .then(res => {
        // setEditMode(true)
        if (!recordId) {
          toast.success('Record Added Successfully')
          if (res.recordId) {
            formik.setFieldValue('recordId',res.recordId )
            setStore(prevStore => ({
              ...prevStore,
              recordId: res.recordId
            }));
          }
        } else {
          toast.success('Record Editted Successfully')
        }
      })
      .catch(error => {
      })
  }

  useEffect(()=>{
    recordId  && getCorrespondentById(recordId)

  },[recordId])

  const getCorrespondentById = recordId => {
    const defaultParams = `_recordId=${recordId}`
    var parameters = defaultParams
    getRequest({
      extension: RemittanceSettingsRepository.Correspondent.get,
      parameters: parameters
    })
      .then(res => {
        formik.setValues(res.record)
        setEditMode(true)
      })
      .catch(error => {
      })
  }

return (
    <FormShell
    form={formik}
    resourceId={ResourceIds.Correspondent}
    maxAccess={maxAccess}
    editMode={editMode} >
     <Grid container spacing={4}>
      <Grid item xs={12}>
        <CustomTextField
          name='reference'
          label={labels.reference}
          value={formik.values.reference}
          required
          onChange={formik.handleChange}
          maxLength='10'
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
          maxLength='50'
          maxAccess={maxAccess}
          onChange={formik.handleChange}
          onClear={() => formik.setFieldValue('name', '')}
          error={formik.touched.name && Boolean(formik.errors.name)}
          helperText={formik.touched.name && formik.errors.name}
        />
      </Grid>

         <Grid item xs={12}>
        <ResourceLookup
         endpointId={BusinessPartnerRepository.MasterData.snapshot}
          name='bpRef'
          required
          label={labels.bpRef}
          valueField='reference'
          displayField='name'

          valueShow='bpRef'
          secondValueShow='bpName'

          form={formik}
          onChange={(event, newValue) => {
            if (newValue) {
              formik.setFieldValue('bpId', newValue?.recordId)
              formik.setFieldValue('bpRef', newValue?.reference)
              formik.setFieldValue('bpName', newValue?.name)
            } else {
              formik.setFieldValue('bpId', null)
              formik.setFieldValue('bpRef', null)
              formik.setFieldValue('bpName', null)
            }
          }}
          errorCheck={'bpId'}
          maxAccess={maxAccess}
        />
      </Grid>
      <Grid item xs={12}>
            <ResourceComboBox
              endpointId={SystemRepository.Currency.qry}
              name='currencyId'
              label={labels.currency}
              valueField='recordId'
              displayField={['reference', 'name']}
              columnsInDropDown={[
                { key: 'reference', value: 'Reference' },
                { key: 'name', value: 'Name' }
              ]}
              values={formik.values}
              onChange={(event, newValue) => {
                formik.setFieldValue('currencyId', newValue?.recordId)
              }}
              error={formik.touched.countryId && Boolean(formik.errors.countryId)}
              helperText={formik.touched.countryId && formik.errors.countryId}
            />
          </Grid>
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Checkbox
              name='isInactive'
              checked={formik.values?.isInactive}
              onChange={formik.handleChange}
              maxAccess={maxAccess}
            />
          }
          label={labels.isInactive}
        />
      </Grid>

    </Grid>
    </FormShell>
  )
}

export default CorrespondentForm
