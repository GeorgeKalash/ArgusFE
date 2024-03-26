// ** MUI Imports
import { Grid } from '@mui/material'

import toast from 'react-hot-toast'
import * as yup from 'yup'

// ** Custom Imports
import { useFormik } from 'formik'
import { useContext, useEffect, useState } from 'react'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import FormShell from 'src/components/Shared/FormShell'
import { formatDateFromApi } from 'src/lib/date-helper'
import { RequestsContext } from 'src/providers/RequestsContext'
import { DocumentReleaseRepository } from 'src/repositories/DocumentReleaseRepository'
import { ResourceIds } from 'src/resources/ResourceIds'

const ValueForm = ({
  labels,
  maxAccess,
  getValueGridData,
  recordId,
  seqNo,
  chId
}) => {

  const { postRequest, getRequest} = useContext(RequestsContext)

  const [initialValues , setInitialData] = useState({
    value: null,
  })

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      value: yup.string().required(' ')
    }),
    onSubmit: values => {
      postValue(values)
    }
  })
  
  const postValue = obj => {
    obj.chId = chId
    obj.seqNo = seqNo
    postRequest({
      extension: DocumentReleaseRepository.CharacteristicsValues.set,
      record: JSON.stringify(obj)
    })
      .then(res => {
      getValueGridData(chId)
        if (recordId) {
          toast.success('Record Editted Successfully')
        } else toast.success('Record Added Successfully')

      })
  }

  useEffect(()=>{
    recordId  && getCharacteristicsById(recordId)
  },[recordId])

  const getCharacteristicsById =  recordId => {
    const defaultParams = `_chId=${recordId}&_seqNo=${seqNo}`
    var parameters = defaultParams
     getRequest({
      extension: DocumentReleaseRepository.CharacteristicsValues.get,
      parameters: parameters
    })
      .then(res => {
        res.record.validFrom = formatDateFromApi(res.record.validFrom)
        formik.setValues(res.record)
      })
  }

return (
    <FormShell
      form={formik}
      resourceId={ResourceIds.Characteristics}
      maxAccess={maxAccess}
      isInfo={false}
    >
        <Grid container spacing={4}>
            <Grid item xs={12}>
                <CustomTextField
                name='value'
                label={labels.values}
                value={formik.values.value}
                required
                maxLength='50'
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('value', '')}
                error={formik.touched.value && Boolean(formik.errors.value)}
                />
            </Grid>
        </Grid>
    </FormShell>
  )
}

export default ValueForm
