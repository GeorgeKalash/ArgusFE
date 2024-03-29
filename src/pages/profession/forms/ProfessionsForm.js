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
import { handleChangeNumber } from 'src/lib/numberField-helper'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'

import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { DataSets } from 'src/resources/DataSets'

export default function ProfessionsForm ({labels, maxAccess,recordId}){
  const [isLoading, setIsLoading] = useState(false)
  const [editMode, setEditMode] = useState(!!recordId)
  const [position, setPosition] = useState(0)
  
  const [initialValues, setInitialData] = useState({
      recordId: null,
      reference: '',
      name: '',
      flName: '',
      monthlyIncome: '',
      riskFactor: '',
      diplomatStatus:''
    })

    const { getRequest, postRequest } = useContext(RequestsContext)

    const invalidate = useInvalidate({
      endpointId: RemittanceSettingsRepository.Profession.page,
    })

    const formik = useFormik({
      initialValues,
      enableReinitialize: true,
      validateOnChange: true,
      validationSchema: yup.object({
        name: yup.string().required(' '),
        reference: yup.string().required(' '),
        flName: yup.string().required(' '),
        monthlyIncome: yup.string().required(' '),
        riskFactor: yup.string().required(' '),
        diplomatStatus: yup.string().required(' '),
      }),
      onSubmit: async obj => {
        try{
        const recordId = obj.recordId

        const response = await postRequest({
          extension: RemittanceSettingsRepository.Profession.set,
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
      catch (exception) {
        setErrorMessage(error)
  }
}
    })

       useEffect(() => {
        ;(async function () {
          try {
            if (recordId) {
              setIsLoading(true)

              const res = await getRequest({
                extension: RemittanceSettingsRepository.Profession.get,
                parameters: `_recordId=${recordId}`
              })
              
              setInitialData(res.record)
            }
          } catch (exception) {
            setErrorMessage(error)
          }
          setIsLoading(false)
        })()
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [])

    return (
      <FormShell 
      resourceId={ResourceIds.Profession}
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
          onChange={formik.handleChange}
          maxLength = '10'
          maxAccess={maxAccess}
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
          maxLength = '50'
          maxAccess={maxAccess}
          onChange={formik.handleChange}
          onClear={() => formik.setFieldValue('name', '')}
          error={formik.touched.name && Boolean(formik.errors.name)}

          // helperText={formik.touched.name && formik.errors.name}
        />
      </Grid>
      <Grid item xs={12}>
        <CustomTextField
          name='flName'
          label={labels.flName}
          value={formik.values.flName}
          required
          maxLength = '50'
          maxAccess={maxAccess}
          onChange={formik.handleChange}
          onClear={() => formik.setFieldValue('flName', '')}
          error={formik.touched.flName && Boolean(formik.errors.flName)}

          // helperText={formik.touched.flName && formik.errors.flName}
        />
      </Grid>
      
      <Grid item xs={12}>
        <CustomTextField
          name='monthlyIncome'
          type="text"
          label={labels.monthlyIncome}
          value={formik.values.monthlyIncome}
          required
          maxAccess={maxAccess}
          onChange={e => {
            handleChangeNumber(
              e.target,
              8, // digitsBeforePoint
              2, // digitsAfterPoint
              formik,
              setPosition,
              'monthlyIncome'
            );
          }}
          onClear={() => formik.setFieldValue('monthlyIncome', '')}
          error={formik.touched.monthlyIncome && Boolean(formik.errors.monthlyIncome)}
      
          // helperText={formik.touched.monthlyIncome && formik.errors.monthlyIncome}
        />
      </Grid>
      <Grid item xs={12}>
        <CustomTextField
          name='riskFactor'
          label={labels.riskFactor}
          value={formik.values.riskFactor}
          required
          type="number"
          maxAccess={maxAccess}
          onChange={formik.handleChange}
          onClear={() => formik.setFieldValue('riskFactor', '')}
          error={formik.touched.riskFactor && Boolean(formik.errors.riskFactor)}

          // helperText={formik.touched.riskFactor && formik.errors.riskFactor}
        />
      </Grid>
      <Grid item xs={12}>
            <ResourceComboBox
              datasetId={DataSets.DIPLOMAT_STATUS}
              name='diplomatStatus'
              label={labels.diplomatStatus}
              valueField='key'
              displayField='value'
              values={formik.values}
              required
              readOnly={editMode}
              maxAccess={maxAccess}
              onChange={(event, newValue) => {
                formik.setFieldValue('diplomatStatus', newValue?.key)
              }}
              error={formik.touched.diplomatStatus && Boolean(formik.errors.diplomatStatus)}

              // helperText={formik.touched.diplomatStatus && formik.errors.diplomatStatus}
            />
          </Grid>
          </Grid>
             
      </FormShell>
    )
}

