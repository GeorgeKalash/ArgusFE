// ** MUI Imports
import { Grid, FormControlLabel, Checkbox } from '@mui/material'

import * as yup from 'yup'
import toast from 'react-hot-toast'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'

import FormShell from 'src/components/Shared/FormShell'
import { useFormik } from 'formik'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useContext, useEffect, useState } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { DocumentReleaseRepository} from 'src/repositories/DocumentReleaseRepository'
import { useInvalidate} from 'src/hooks/resource'

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

  const invalidate = useInvalidate({
    endpointId: DocumentReleaseRepository.DRGroup.qry
  })

  const [initialValues , setInitialData] = useState({
    recordId: null,
    name: null,
    reference: null,
 
  })

  const formik = useFormik({
    enableReinitialize: false,
    validateOnChange: true,
    initialValues,
    validationSchema: yup.object({
      reference: yup.string().required('This field is required'),
      name: yup.string().required('This field is required'),
     
    }),
    onSubmit: values => {
      postGroups(values)
    }
  })

  const postGroups = obj => {
    const recordId = obj?.recordId || ''
    postRequest({
      extension:  DocumentReleaseRepository.DRGroup.set,
      record: JSON.stringify(obj)
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
            invalidate()

        } else {
          toast.success('Record Editted Successfully')
        }
      })
      .catch(error => {
      })
  }

  useEffect(()=>{
    recordId  && getGroupId(recordId)
  },[recordId])

  const getGroupId =  recordId => {
    const defaultParams = `_recordId=${recordId}`
    var parameters = defaultParams
     getRequest({
      extension: DocumentReleaseRepository.DRGroup.get,
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
    resourceId={ResourceIds.DRGroups}
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
      </Grid>

        
    </FormShell>
  )
}

export default CorrespondentForm
