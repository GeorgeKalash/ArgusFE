import { useContext, useEffect, useState } from 'react'
import { useFormik } from 'formik'
import * as yup from 'yup'
import { RequestsContext } from 'src/providers/RequestsContext'

// import { BusinessPartnerRepository } from 'src/repositories/BusinessPartnerRepository'
import toast from 'react-hot-toast'
import FormShell from 'src/components/Shared/FormShell'
import { Grid, FormControlLabel, Checkbox } from '@mui/material'


import { SystemRepository } from 'src/repositories/SystemRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'

import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'

import { MultiCurrencyRepository } from 'src/repositories/MultiCurrencyRepository'


export default function MultiCurrencyForm({ labels, maxAccess, defaultValue, currencyId, rateTypeId}){
    const [isLoading, setIsLoading] = useState(false)
    const [editMode, setEditMode] = useState(!!currencyId && !!rateTypeId )
    
    const [initialValues, setInitialData] = useState({
        currencyId: null,
        rateTypeId:null,
        exId:null,
      })

    const { getRequest, postRequest } = useContext(RequestsContext)

    //const editMode = !!recordId

    const invalidate = useInvalidate({
        endpointId: MultiCurrencyRepository.McExchangeMap.page
      })
  
    const formik = useFormik({
        initialValues,
        enableReinitialize: true,
        validateOnChange: true,
        validationSchema: yup.object({
            currencyId: yup.string().required('This field is required'),
            rateTypeId: yup.string().required('This field is required'),
            exId: yup.string().required('This field is required'),
        }),
        onSubmit: async obj => {
          const currencyId = obj.currencyId
          const rateTypeId = obj.rateTypeId
          

          const response = await postRequest({
            extension: MultiCurrencyRepository.McExchangeMap.set,
            record: JSON.stringify(obj)
          })
          
          if (!currencyId&&!rateTypeId) {
            
            toast.success('Record Added Successfully')
            setInitialData({
              ...obj, // Spread the existing properties
              currencyId: response.currencyId,
              rateTypeId : response.rateTypeId,
              
            });
            setEditMode(false)
          }
          else toast.success('Record Edited Successfully')
          setEditMode(true)

          invalidate()
        }
      })
    
      useEffect(() => {
        ;(async function () {
          try {
            if (rateTypeId && currencyId ) {
              setIsLoading(true)
    
              const res = await getRequest({
                extension: MultiCurrencyRepository.McExchangeMap.get,
                parameters: `_currencyId=${currencyId}&_rateTypeId=${rateTypeId}`
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
            resourceId={ResourceIds.MultiCurrencyMapping}
            form={formik} 
            height={300} 
            maxAccess={maxAccess} 
            editMode={editMode}
        >
            <Grid container spacing={4}>
                <Grid item xs={12}>
                <ResourceComboBox
                readOnly={editMode}
                endpointId={SystemRepository.Currency.qry}
                name='currencyId'
                label={labels.currency}
                valueField='recordId'
                displayField= {['reference', 'name']}
                
                columnsInDropDown= {[
                    { key: 'reference', value: 'Currency Ref' },
                    { key: 'name', value: 'Name' },
                ]}
                values={formik.values}
                required
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                    formik && formik.setFieldValue('currencyId', newValue?.recordId)
                }}
                error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
                helperText={formik.touched.currencyId && formik.errors.currencyId}
                  />
                </Grid>
                <Grid item xs={12}>
                <ResourceComboBox
                    endpointId={MultiCurrencyRepository.RateType.qry}
                    name='rateTypeId'
                    label={labels.rateType}
                    valueField='recordId'
                    displayField= {['reference', 'name']}
                    columnsInDropDown= {[
                      { key: 'reference', value: ' Ref' },
                      { key: 'name', value: 'Name' },
                    ]}
                    values={formik.values}
                    required
                    maxAccess={maxAccess}
                    readOnly={editMode}
                    onChange={(event, newValue) => {
                      formik && formik.setFieldValue('rateTypeId', newValue?.recordId)
                    }}
                    error={formik.touched.rateTypeId && Boolean(formik.errors.rateTypeId)}
                    helperText={formik.touched.rateTypeId && formik.errors.rateTypeId}
                  />
                </Grid>
                <Grid item xs={12}>
                <ResourceComboBox
                  
                    endpointId={MultiCurrencyRepository.ExchangeTable.qry}
                    name='exId'
                    label={labels.exchangeTable}
                    valueField='recordId'
                    displayField= {['reference', 'name']}
                    columnsInDropDown= {[
                      { key: 'reference', value: ' Ref' },
                      { key: 'name', value: 'Name' },
                    ]}
                    values={formik.values}
                    required
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik && formik.setFieldValue('exId', newValue?.recordId)
                    }}
                    error={formik.touched.exId && Boolean(formik.errors.exId)}
                    helperText={formik.touched.exId && formik.errors.exId}
                  />
             
                </Grid>
            </Grid>
        </FormShell>
  )
}