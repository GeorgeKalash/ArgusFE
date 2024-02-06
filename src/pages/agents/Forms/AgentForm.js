// ** MUI Imports
import { Grid } from '@mui/material'
import { useFormik } from 'formik'
import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import FormShell from 'src/components/Shared/FormShell'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'

const AgentForm = ({ labels, maxAccess, recordId }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [editMode, setEditMode] = useState(!!recordId)

  const [initialValues, setInitialData] = useState({
      recordId: null,
      name: '',
      countryId: '',
    })

  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: RemittanceSettingsRepository.CorrespondentAgents.page
  })

   const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      name: yup.string().required(' '),
      countryId: yup.string().required(' ')
    }),
    onSubmit: async obj => {
      const recordId = obj.recordId

      const response = await postRequest({
        extension: RemittanceSettingsRepository.CorrespondentAgents.set,
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
            extension: RemittanceSettingsRepository.CorrespondentAgents.get,
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
      resourceId={ResourceIds.CorrespondentAgents}
      form={formik} 
      height={300} 
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
            
            // helperText={formik.touched.name && formik.errors.name}
          />
        </Grid>
        <Grid item xs={12}>
          <ResourceComboBox
            endpointId={SystemRepository.Country.qry}
            name='countryId'
            label={labels.country}
            columnsInDropDown={[
              { key: 'reference', value: 'Reference' },
              { key: 'name', value: 'Name' }
            ]}
            values={formik.values}
            valueField='recordId'
            displayField='name'
            required
            maxAccess={maxAccess}
            onChange={(event, newValue) => {
              formik.setFieldValue('countryId', newValue?.recordId)
            }}
            error={formik.touched.countryId && Boolean(formik.errors.countryId)}

            // helperText={formik.touched.countryId && formik.errors.countryId}
          />
        </Grid>
      </Grid>
    </FormShell>
  )
}

export default AgentForm
