// ** MUI Imports
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

import { CurrencyTradingSettingsRepository } from 'src/repositories/CurrencyTradingSettingsRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { DataSets } from 'src/resources/DataSets'


export default function CommissionTypesForm({ labels, maxAccess, recordId }) {
    const [isLoading, setIsLoading] = useState(false)
    const [editMode, setEditMode] = useState(!!recordId)
    
    const [initialValues, setInitialData] = useState({
        recordId: null,
        reference: '',
        name: '',
        typeName: '',
      })

    const { getRequest, postRequest } = useContext(RequestsContext)

    //const editMode = !!recordId

    const invalidate = useInvalidate({
        endpointId: CurrencyTradingSettingsRepository.CommissionType.page
      })
  
    const formik = useFormik({
        initialValues,
        enableReinitialize: true,
        validateOnChange: true,
        validationSchema: yup.object({
          reference: yup.string().required(' '),
          name: yup.string().required(' '),
          typeName: yup.string().required(' ')
   
        }),
        onSubmit: async obj => {
          const recordId = obj.recordId

          const response = await postRequest({
            extension: CurrencyTradingSettingsRepository.CommissionType.set,
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
                extension: CurrencyTradingSettingsRepository.CommissionType.get,
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
            resourceId={ResourceIds.CommissionType}
            form={formik} 
            height={300} 
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
                    maxLength='30'
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('reference', '')}
                    error={formik.touched.reference && Boolean(formik.errors.reference)}
                    
                    // helperText={formik.touched.reference && formik.errors.reference}
                    />
                </Grid>
                <Grid item xs={12}>
                    <CustomTextField
                    name='name'
                    label={labels.name}
                    value={formik.values.name}
                    required
                    rows={2}
                    maxAccess={maxAccess}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('name', '')}
                    error={formik.touched.name && Boolean(formik.errors.name)}

                    // helperText={formik.touched.name && formik.errors.name}
                    />
                </Grid>
                <Grid item xs={12}>
                <ResourceComboBox
                  datasetId={DataSets.CT_COMMISSION_TYPES}
                  name='typeName'
                  label={labels.type}
                  valueField='key'
                  displayField='value'
                  values={formik.values}
                  required
                  maxAccess={maxAccess}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('typeName', newValue?.key)
                  }}
                  error={formik.touched.typeName && Boolean(formik.errors.typeName)}

                  // helperText={formik.touched.typeName && formik.errors.typeName}
                />
                </Grid>
              </Grid>
        </FormShell>
  )
}