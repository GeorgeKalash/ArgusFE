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
        fromDTId: null,
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
              recordId: Math.floor(Math.random() * 10000) + 1,
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

                // error={
                //     formik.touched.fromFunctionId &&
                //   Boolean(formik.errors.fromFunctionId)
                // }
                // helperText={
                //     formik.touched.fromFunctionId && formik.errors.fromFunctionId
                // }
                
              />


{/* datasetId={DataSets.DR_CHA_DATA_TYPE}
              name='dataType'
              label={_labels.dataType}
              valueField='key'
              displayField='value'
              values={characteristicValidation.values}
              required
              maxAccess={maxAccess}
              onChange={(event, newValue) => {
                characteristicValidation.setFieldValue('dataType', newValue?.key)
              }}
              error={characteristicValidation.touched.dataType && Boolean(characteristicValidation.errors.dataType)}
              helperText={characteristicValidation.touched.dataType && characteristicValidation.errors.dataType}
            /> */}


            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
              endpointId={SystemRepository.DocumentType.qry}
                name='fromDTId'
                label='From Document Type'
                valueField='key'
                displayField='value'
                values={formik.values}
                parameters={`_dgId=${formik.values.dtId}&_startAt=${0}&_pageSize=${50}`}
               
                maxAccess={maxAccess}
                
                onChange={(event, newValue) => {
                  formik &&formik.setFieldValue('fromDTId', newValue?.key)

                    // formik.setFieldValue('fromDTName', newValue?.values)
                }}
                error={
                    formik.touched.fromDTId && Boolean(formik.errors.fromDTId)
                }
                helperText={formik.touched.fromDTId && formik.errors.fromDTId}
 
              />
                       {/* <ResourceComboBox
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
                    maxAccess={access}
                    onChange={(event, newValue) => {
                      formik && formik.setFieldValue('currencyId', newValue?.recordId)
                    }}
                    error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
                    helperText={formik.touched.currencyId && formik.errors.currencyId}
                  /> */}
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
              datasetId={DataSets.SYSTEM_FUNCTION}
                name='dtId'
                label='To Document Type'
                valueField='key'
                displayField='value'
          
                maxAccess={maxAccess}
                values={formik.values}
                onChange={(event, newValue) => {
                  formik &&formik.setFieldValue('dtId', newValue?.key)

                  formik &&formik.setFieldValue('toDTName', newValue?.value)
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