// ** React Imports
import { useEffect, useState, useContext } from 'react'

// ** MUI Imports
import { Grid, Box } from '@mui/material'

// ** Third Party Imports
import { useFormik } from 'formik'
import toast from 'react-hot-toast'

// ** Custom Imports
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import WindowToolbar from 'src/components/Shared/WindowToolbar'

import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'
import { MultiCurrencyRepository } from 'src/repositories/MultiCurrencyRepository'
import * as yup from 'yup'

const GLSettings = () => {
    const [errorMessage, setErrorMessage] = useState(null)
    const { getRequest, postRequest } = useContext(RequestsContext)

    const [initialValues, setInitialValues] = useState({
        
        GLACSegments:null,
        GLACSeg0:null,
        GLACSeg1:null,
        GLACSeg2:null,
        GLACSeg3:null,
        GLACSeg4:null,
        GLACSegName0:null,
        GLACSegName1:null,
        GLACSegName2:null,
        GLACSegName3:null,
        GLACSegName4:null
      })

    useEffect(() => {
        getDataResult()
      }, [])

    const getDataResult = () => {
        const myObject = {};
        var parameters = `_filter=`
        getRequest({
          extension:  SystemRepository.GLSettings.qry,
          parameters: parameters
        })
        .then(res => {
           res.list.map(obj => (
           myObject[obj.key] = obj.value? parseInt(obj.value): null
            )); 
            setInitialValues(myObject)
        })
        .catch(error => {
            setErrorMessage(error)
        })
      }

    const {
        labels: _labels,
        access
      } = useResourceQuery({
        datasetId: ResourceIds.GLSettings,
      })
    
    const formik = useFormik({
        initialValues,
        enableReinitialize: true,
        validateOnChange: true,
        initialValues,
        validationSchema: yup.object({
            GLACSegments: yup.number().nullable(),
            GLACSeg0: yup.string().when('GLACSegments', {
                is: (val) => val >= 1,
                then: yup.string().required('GLACSeg0 is required'),
            }),
            GLACSegName0: yup.string().when('GLACSegments', {
                is: (val) => val >= 1,
                then: yup.string().required('GLACSegName0 is required'),
            }),
            GLACSeg1: yup.string().when('GLACSegments', {
                is: (val) => val >= 2,
                then: yup.string().required('GLACSeg1 is required'),
            }),
            GLACSegName1: yup.string().when('GLACSegments', {
                is: (val) => val >= 2,
                then: yup.string().required('GLACSegName1 is required'),
            }),
            GLACSeg2: yup.string().when('GLACSegments', {
                is: (val) => val >= 3,
                then: yup.string().required('GLACSeg2 is required'),
            }),
            GLACSegName2: yup.string().when('GLACSegments', {
                is: (val) => val >= 3,
                then: yup.string().required('GLACSegName2 is required'),
            }), GLACSeg3: yup.string().when('GLACSegments', {
                is: (val) => val >= 4,
                then: yup.string().required('GLACSeg3 is required'),
            }),
            GLACSegName3: yup.string().when('GLACSegments', {
                is: (val) => val >= 4,
                then: yup.string().required('GLACSegName3 is required'),
            }), GLACSeg4: yup.string().when('GLACSegments', {
                is: (val) => val = 5,
                then: yup.string().required('GLACSeg4 is required'),
            }),
            GLACSegName4: yup.string().when('GLACSegments', {
                is: (val) => val = 5,
                then: yup.string().required('GLACSegName4 is required'),
            })
            
   
        }),
        onSubmit: values => {
            postGLSettings(values);
        },
    });

    const postGLSettings = obj => {

        var data = []
        Object.entries(obj).forEach(([key, value]) => {
           const newObj = { key: key  , value : value };
     
           // Push the new object into the array
           data.push(newObj);
     
        })
        postRequest({
            extension: SystemRepository.GLSettings.set,
            record:   JSON.stringify({  sysDefaults  : data }),
        })

        .then(res => {
            if (res) toast.success('Record Successfully')
        })
        .catch(error => {
            setErrorMessage(error)
        })
    }

       const handleSubmit = () => {
        formik.handleSubmit()
      }

      return(
        <>
            <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                marginTop: '10px'
            }}
            >
                <Grid container spacing={5} sx={{pl:'10px'}} lg={4} md={7} sm={7} xs={12} >
                    <Grid item xs={12}>
                    <CustomTextField
                    name='GLACSegments'
                    label={_labels.segments}
                    value={formik.values.GLACSegments}
                    
                    type='number'
                    numberField={true}
                    onChange={(event, newValue) => {
                        formik && formik.setFieldValue('GLACSegments', newValue?.recordId)
                    }}onClear={() => {formik.setFieldValue('GLACSegments','')}}
                    
                    error={formik.touched.GLACSegments && Boolean(formik.errors.GLACSegments)}

                    // helperText={formik.touched.hourRate && formik.errors.hourRate}
                  />
                </Grid>
                    <Grid item xs={12}>
                    <CustomTextField
                    name='GLACSeg0'
                    label={_labels.segment0}
                    value={formik.values.GLACSeg0}
                    
                    type='number'
                    numberField={true}
                    onChange={(event, newValue) => {
                        formik && formik.setFieldValue('GLACSeg0', newValue?.recordId)
                    }}                    onClear={() => {formik.setFieldValue('GLACSeg0','')}}
                    
                    error={formik.touched.GLACSeg0 && Boolean(formik.errors.GLACSeg0)}

                    // helperText={formik.touched.hourRate && formik.errors.hourRate}
                  />
                    </Grid>
                    <Grid item xs={12}>
                    <CustomTextField
                    name='GLACSeg1'
                    label={_labels.segment1}
                    value={formik.values.GLACSeg1}
                    
                    type='number'
                    numberField={true}
                    onChange={(event, newValue) => {
                        formik && formik.setFieldValue('GLACSeg1', newValue?.recordId)
                    }}                    
                    onClear={() => {formik.setFieldValue('GLACSeg1','')}}
                    
                    error={formik.touched.GLACSeg1 && Boolean(formik.errors.GLACSeg1)}

                    // helperText={formik.touched.GLACSeg0 && formik.errors.GLACSeg0}
                  />
                    </Grid>
                    <Grid item xs={12}>
                    <CustomTextField
                    name='GLACSeg2'
                    label={_labels.segment2}
                    value={formik.values.GLACSeg2}
                    
                    type='number'
                    numberField={true}
                    onChange={(event, newValue) => {
                        formik && formik.setFieldValue('GLACSeg2', newValue?.recordId)
                    }}                    onClear={() => {formik.setFieldValue('GLACSeg2','')}}
                    
                    error={formik.touched.GLACSeg2 && Boolean(formik.errors.GLACSeg2)}

                    // helperText={formik.touched.hourRate && formik.errors.hourRate}
                  />
                    </Grid>  
                    <Grid item xs={12}>
                    <CustomTextField
                    name='GLACSeg3'
                    label={_labels.segment3}
                    value={formik.values.GLACSeg3}
                    
                    type='number'
                    numberField={true}
                    onChange={(event, newValue) => {
                        formik && formik.setFieldValue('GLACSeg3', newValue?.recordId)
                    }}onClear={() => {formik.setFieldValue('GLACSeg3','')}}
                    
                    error={formik.touched.GLACSeg3 && Boolean(formik.errors.GLACSeg3)}

                    // helperText={formik.touched.hourRate && formik.errors.hourRate}
                  />
                    </Grid>  
                    <Grid item xs={12}>
                    <CustomTextField
                    name='GLACSeg4'
                    label={_labels.segment4}
                    value={formik.values.GLACSeg4}
                    
                    type='number'
                    numberField={true}
                    onChange={(event, newValue) => {
                        formik && formik.setFieldValue('GLACSeg4', newValue?.recordId)
                    }}
                    onClear={() => formik.setFieldValue('GLACSeg4', '')}
                    
                    error={formik.touched.hourRate && Boolean(formik.errors.hourRate)}

                    // helperText={formik.touched.hourRate && formik.errors.hourRate}
                  />
                    </Grid>  
                   
                    <Grid item xs={12}>
                    <CustomTextField
                    name='GLACSegName0'
                    label={"GLACSegName1"}
                    value={formik.values.GLACSegName0}
                    
                    type='number'
                    numberField={true}
                    onChange={(event, newValue) => {
                        formik && formik.setFieldValue('GLACSegName0', newValue?.recordId)
                    }}
                    onClear={() => formik.setFieldValue('GLACSegName0', '')}
                    
                    error={formik.touched.GLACSegName0 && Boolean(formik.errors.GLACSegName0)}

                    // helperText={formik.touched.hourRate && formik.errors.hourRate}
                  />
                    </Grid> 
                    <Grid item xs={12}>
                    <CustomTextField
                    name='GLACSegName1'
                    label={"GLACSegName2"}
                    value={formik.values.GLACSegName1}
                    
                    type='number'
                    numberField={true}
                    onChange={(event, newValue) => {
                        formik && formik.setFieldValue('GLACSegName1', newValue?.recordId)
                    }}
                    onClear={() => formik.setFieldValue('GLACSegName1', '')}
                    
                    error={formik.touched.GLACSegName1 && Boolean(formik.errors.GLACSegName1)}

                    // helperText={formik.touched.hourRate && formik.errors.hourRate}
                  />
                    </Grid> 
                    <Grid item xs={12}>
                    <CustomTextField
                    name='GLACSegName2'
                    label={"GLACSegName3"}
                    value={formik.values.GLACSegName2}
                    
                    type='number'
                    numberField={true}
                    onChange={(event, newValue) => {
                        formik && formik.setFieldValue('GLACSegName2', newValue?.recordId)
                    }}
                    onClear={() => formik.setFieldValue('GLACSegName2', '')}
                    
                    error={formik.touched.GLACSegName2 && Boolean(formik.errors.GLACSegName2)}

                    // helperText={formik.touched.hourRate && formik.errors.hourRate}
                  />
                    </Grid> 
                    <Grid item xs={12}>
                    <CustomTextField
                    name='GLACSegName3'
                    label={"GLACSegName4"}
                    value={formik.values.GLACSegName3}
                    
                    type='number'
                    numberField={true}
                    onChange={(event, newValue) => {
                        formik && formik.setFieldValue('GLACSegName3', newValue?.recordId)
                    }}
                    onClear={() => formik.setFieldValue('GLACSegName3', '')}
                    
                    error={formik.touched.hourRate && Boolean(formik.errors.hourRate)}

                    // helperText={formik.touched.hourRate && formik.errors.hourRate}
                  />
                    </Grid> 
                    <Grid item xs={12}>
                    <CustomTextField
                    name='GLACSegName4'
                    label={'GLACSegName5'}
                    value={formik.values.GLACSegName4}
                    
                    type='number'
                    numberField={true}
                    onChange={(event, newValue) => {
                        formik && formik.setFieldValue('GLACSegName4', newValue?.recordId)
                    }}
                    onClear={() => formik.setFieldValue('GLACSegName4', '')}
                    
                    error={formik.touched.hourRate && Boolean(formik.errors.hourRate)}

                    // helperText={formik.touched.hourRate && formik.errors.hourRate}
                  />
                    </Grid> 
                    <Grid sx={{
                        position: 'fixed',
                        bottom: 0,
                        left: 0,
                        width: '100%',
                        padding: 3,
                        textAlign: 'center',
                    }}>
                        <WindowToolbar onSave={handleSubmit}  />
                    </Grid>
                    
                </Grid>
                
                <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />

            </Box>
        </>
    )
  }

  export default GLSettings