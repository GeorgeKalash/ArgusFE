// ** MUI Imports
import { Grid, FormControlLabel, Checkbox } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { useFormik } from 'formik'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { DataSets } from 'src/resources/DataSets'
import { SystemFunction } from 'src/resources/SystemFunction'


// ** Custom Imports
import CustomComboBox from 'src/components/Inputs/CustomComboBox'
import CustomTextField from 'src/components/Inputs/CustomTextField'

import { SystemRepository } from 'src/repositories/SystemRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'


export default function DocumentTypeMapForm ({
  labels,
  maxAccess,
  recordId,
  fromFunctionId, fromDTId, toFunctionId
})
{

    const [isLoading, setIsLoading] = useState(false)
    const [editMode, setEditMode] = useState(!!recordId)
    const [functionStore, setFunctionStore] = useState([])
    const [fromDocumentTypeStore, setFromDocumentTypeStore] = useState([])
    const [toDocumentTypeStore, setToDocumentTypeStore] = useState([])

    const [initialValues, setInitialData] = useState({
        recordId: null,
        fromFunctionId: null,
        fromDTId: '',
        toFunctionId: null,
        decimals: null,
        profileId: null,
        currencyType: null,
        currencyTypeName: null,
        sale: false,
        useSameReference: false,
        dtId: '',
        symbol: '',
        fromFunctionName:'',
        toFunctionName:'',
        fromDTName:''
      })

    const { getRequest, postRequest } = useContext(RequestsContext)

    //const editMode = !!recordId

    const invalidate = useInvalidate({
        endpointId: SystemRepository.DocumentTypeMap.qry
      })

    const formik = useFormik({
        initialValues,
        enableReinitialize: true,
        validateOnChange: true,
        validationSchema: yup.object({
            fromFunctionId: yup.string().required('This field is required'),
            fromDTId: yup.string().required('This field is required'),
            toFunctionId: yup.string().required('This field is required'),
            dtId: yup.string().required('This field is required')
          }),
        onSubmit: async obj => {
         
          const fromFunctionId = initialValues.fromFunctionId
          const fromDTId = initialValues.fromDTId
          const toFunctionId = initialValues.toFunctionId

          const response = await postRequest({
            extension: SystemRepository.DocumentTypeMap.set,
            record: JSON.stringify(obj)
          })

          if (!fromFunctionId&&!fromDTId&&!toFunctionId) {
            toast.success('Record Added Successfully')
            setInitialData({
              ...obj, // Spread the existing properties
              recordId: Math.floor(Math.random() * 100000000) + 1,
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
            if (fromFunctionId && fromDTId&&toFunctionId ) {
              setIsLoading(true)
    
              const res = await getRequest({
                extension: SystemRepository.DocumentTypeMap.get,
                parameters: `_fromFunctionId=${fromFunctionId}&_fromDTId=${fromDTId}&_toFunctionId=${toFunctionId}`
              })
              
              setInitialData({
                ...res.record,
                recordId:  Math.floor(Math.random() * 10000) + 1,
              });
            }
          } catch (exception) {
            setErrorMessage(error)
          }
          setIsLoading(false)
        })()
      }, [])

  return (
    <FormShell
    resourceId={ResourceIds.DocumentTypeMaps}
    form={formik}
    height={400}
    maxAccess={maxAccess}
    editMode={editMode}
    >
    <Grid container spacing={4} sx={{ px: 4 }}>
            <Grid item xs={12}>
              <ResourceComboBox
               datasetId={DataSets.SYSTEM_FUNCTION}
                name='fromFunctionId'
                label='From Function'
                valueField='key'
                maxAccess={maxAccess}
                displayField='value'
                values={formik.values}
                required
                onClear={() => formik.setFieldValue('fromFunctionId', '')}
                onChange={(event, newValue) => {
                    formik &&formik.setFieldValue('fromFunctionId', newValue?.key)
                
                }}

      
                
              />





            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
              endpointId={SystemRepository.DocumentType.qry}
                name='fromDTId'
                label='From Document Type'
                valueField='recordId'
                displayField='name'
                values={formik.values}
                parameters={`_dgId=${formik.values.fromFunctionId}&_startAt=${0}&_pageSize=${50}`}
               
                maxAccess={maxAccess}
                
                onChange={(event, newValue) => {
                  formik.setFieldValue('fromDTId', newValue?.recordId)

                    // formik.setFieldValue('fromDTName', newValue?.values)
                }}
                error={
                    formik.touched.fromDTId && Boolean(formik.errors.fromDTId)
                }
                helperText={formik.touched.fromDTId && formik.errors.fromDTId}
 
              />
 
            </Grid>
            <Grid item xs={12}>
            <ResourceComboBox
              datasetId={DataSets.SYSTEM_FUNCTION}
                name='toFunctionId'
                label='To Function'
                valueField='key'
                displayField='value'
          
                maxAccess={maxAccess}
                values={formik.values}
                onChange={(event, newValue) => {
                  formik &&formik.setFieldValue('toFunctionId', newValue?.key)

                  formik &&formik.setFieldValue('toFunctionName', newValue?.value)
                }}
                error={
                    formik.touched.toFunctionId && Boolean(formik.errors.toFunctionId)
                }
                helperText={formik.touched.toFunctionId && formik.errors.toFunctionId}
 
              />
            </Grid>
            <Grid item xs={12}>
            <ResourceComboBox
            endpointId={SystemRepository.DocumentType.qry}
                name='dtId'
                label='To Document Type'
                valueField='recordId'
                displayField='reference'
          
                maxAccess={maxAccess}
                values={formik.values}
                parameters={`_dgId=${SystemFunction.JournalVoucher}&_startAt=${0}&_pageSize=${50}`}
                
                onChange={(event, newValue) => {
                  formik.setFieldValue('dtId', newValue?.recordId)
                }}
                error={
                    formik.touched.dtId && Boolean(formik.errors.dtId)
                }
                helperText={formik.touched.dtId && formik.errors.dtId}
 
              />
   
       
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name='useSameReference'
                    checked={formik.values?.useSameReference}
                    onChange={formik.handleChange}
                  />
                }
                label='Use Same Reference'
              />
            </Grid>
          </Grid>
    </FormShell>
  )
}

// formik.setFieldValue('toFunctionId', newValue?.key)
//                     formik.setFieldValue('toFunctionName', newValue?.value)


// formik.setFieldValue('dtId', newValue?.recordId)
// formik.setFieldValue('toDTName', newValue?.name)
// name='dtId'
// label='To Document Type'