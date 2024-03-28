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
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SystemFunction } from 'src/resources/SystemFunction'

import {
    formatDateToApi,
    formatDateToApiFunction,
    formatDateFromApi,formatDateDefault,formatDateFromApiInline
  } from "src/lib/date-helper";
  
// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'

import { GeneralLedgerRepository } from 'src/repositories/GeneralLedgerRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { Today } from '@mui/icons-material'


export default function JournalVoucherForm({ labels, maxAccess, recordId }) {
    const [isLoading, setIsLoading] = useState(false)
    const [editMode, setEditMode] = useState(!!recordId)
    const [responseValue, setResponseValue] = useState(null);

    const [initialValues, setInitialData] = useState({
        recordId: null,
        reference:'',
        date: new Date(),
        notes:'',
        currencyId :'',
        dtId:'',
        status:1,
        rateCalcMethod:1,
        exRate:1,
      })

    const { getRequest, postRequest } = useContext(RequestsContext)

    //const editMode = !!recordId

    const invalidate = useInvalidate({
        endpointId: GeneralLedgerRepository.JournalVoucher.qry
      })
  
    const formik = useFormik({
        initialValues,
        enableReinitialize: true,
        validateOnChange: true,
        validationSchema: yup.object({
          date: yup.string().required('This field is required'),
          currencyId: yup.string().required('This field is required'),
          dtId: yup.string().required('This field is required'),
        
        }),
        onSubmit: async obj => {
            const data = {
              ...obj,
              date: formatDateToApi(obj.date),
               recordId : initialValues.recordId,
               response : responseValue
            }  
            try {
              
                const response = await postRequest({
                  extension: GeneralLedgerRepository.JournalVoucher.set,
                  record: JSON.stringify(data),
                })
          
          if (!recordId) {
            toast.success('Record Added Successfully')

            setInitialData({
              ...obj, 
              recordId: response.recordId,
        
            });
          }
          else toast.success('Record Edited Successfully')
          setEditMode(true)

          invalidate()
        }catch (error) {
            toast("Something went wrong");
          }}
      })
    
      useEffect(() => {
        ;(async function () {
          try {
            if (recordId) {
              setIsLoading(true)
    
              const res = await getRequest({
                extension: GeneralLedgerRepository.JournalVoucher.get,
                parameters: `_recordId=${recordId}`
              })
              
              setInitialData({
                ...res.record,

                 date: formatDateFromApi(res.record.date) 
              });
            }
          } catch (exception) {
            setErrorMessage(error)
          }
          setIsLoading(false)
        })()
      }, [])
      console.log(SystemFunction.JournalVoucher)
      
    return (
        <FormShell 
            resourceId={ResourceIds.JournalVoucher }
            form={formik} 
            height={300} 
            functionId={SystemFunction.JournalVoucher}
            maxAccess={maxAccess} 
            NewComponentVisible={editMode}
            editMode={editMode}
        >
            <Grid container spacing={4}>
            <Grid item xs={12}>
      <ResourceComboBox
              endpointId={SystemRepository.DocumentType.qry}


              name='dtId'
              label={labels.documentType}
              valueField='recordId'
              displayField='name'
              parameters={`_dgId=${SystemFunction.JournalVoucher}&_startAt=${0}&_pageSize=${50}`}
              values={formik.values}
              onChange={(event, newValue) => {
                formik.setFieldValue('dtId', newValue?.recordId)
              }}
              error={formik.touched.dtId && Boolean(formik.errors.dtId)}
              helperText={formik.touched.dtId && formik.errors.dtId}
              maxAccess={maxAccess}
              required
            />
      </Grid>
                <Grid item xs={12}>
                    <CustomTextField
                    name='reference'
                    label={labels.reference}
                    value={formik.values.reference}
                    readOnly
                    
                    maxAccess={maxAccess}
                    maxLength='30'
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('reference', '')}
                    error={formik.touched.reference && Boolean(formik.errors.reference)}
                    helperText={formik.touched.reference && formik.errors.reference}
                    />
                </Grid>
                <Grid item xs={12}>
                <CustomDatePicker
                         name='date'
                         label={labels.date}
                         onChange={formik.setFieldValue}
                         value={formik.values.date}
                         maxAccess={maxAccess}
                         required
                         error={formik.touched.date && Boolean(formik.errors.date)}

                        //  disabledDate={Today}
                         
                  />
                </Grid>
                <Grid item xs={12}>
      <ResourceComboBox
              endpointId={SystemRepository.Currency.qry}

              name='currencyId'
              label={labels.currency}
              valueField='recordId'
              displayField='reference'

            //   readOnly={(editMode || !formik.values.countryId) && true}
              values={formik.values}
              onChange={(event, newValue) => {
                formik.setFieldValue('currencyId', newValue?.recordId)
              }}
              error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
              helperText={formik.touched.currencyId && formik.errors.currencyId}
              maxAccess={maxAccess}
              required
            />
      </Grid>
                <Grid item xs={12}>
                    <CustomTextArea
                    name='notes'
                    label={labels.notes}
                    value={formik.values.notes}
                    
                    maxLength='100'
                    rows={2}
                    maxAccess={maxAccess}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('notes', '')}
                    error={formik.touched.notes && Boolean(formik.errors.notes)}

                    // helperText={formik.touched.notes && formik.errors.notes}
                    />
                </Grid>
              

      
            </Grid>
        </FormShell>
  )
}