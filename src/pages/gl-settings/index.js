// ** React Imports
import { useEffect, useState, useContext } from 'react'

// ** MUI Imports
import { Grid, Box, TextField } from '@mui/material'

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
import FormShell from 'src/components/Shared/FormShell'

const GLSettings = () => {
    const [errorMessage, setErrorMessage] = useState(null)
    const { getRequest, postRequest } = useContext(RequestsContext)

    const [initialValues, setInitialValues] = useState({
        
        GLACSegments: null,
        GLACSeg0: null,
        GLACSeg1: null,
        GLACSeg2: null,
        GLACSeg3: null,
        GLACSeg4: null,
        GLACSegName0: null,
        GLACSegName1: null,
        GLACSegName2: null,
        GLACSegName3: null,
        GLACSegName4: null
      })

    useEffect(() => {
        getDataResult()
      }, [])

    const getDataResult = () => {
        const myObject = {};
        var parameters = `_filter=`
        getRequest({
          extension:  SystemRepository.Defaults.qry,
          parameters: parameters
        })
        .then(res => {
            const filteredList = res.list.filter(obj => {
                return (
                    obj.key === 'GLACSegments' ||
                    obj.key === 'GLACSeg0' || 
                    obj.key === 'GLACSeg1' || 
                    obj.key === 'GLACSeg2' || 
                    obj.key === 'GLACSeg3' ||
                    obj.key === 'GLACSeg4' ||
                    obj.key === 'GLACSegName0' ||
                    obj.key === 'GLACSegName1' ||
                    obj.key === 'GLACSegName2' ||
                    obj.key === 'GLACSegName3' ||
                    obj.key === 'GLACSegName4'
                );
            });
        
            filteredList.forEach(obj => {
                myObject[obj.key] = (
                    obj.key === 'GLACSegments' ||
                    obj.key === 'GLACSeg0' || 
                    obj.key === 'GLACSeg1' || 
                    obj.key === 'GLACSeg2' || 
                    obj.key === 'GLACSeg3' ||
                    obj.key === 'GLACSeg4' 

                ) ? (obj.value ? parseInt(obj.value) : null) :  (obj.value ? obj.value : null) ;
               
            });
            
            setInitialValues(myObject);
            console.log(myObject)
        })
        .catch(error => {
            setErrorMessage(error);
        });
      };

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
       
        validationSchema: yup.object({
            GLACSegments: yup.number().nullable(),
            GLACSeg0: yup.number().test({
                test: function(value) {
                    const GLACSegments = this.parent.GLACSegments;

                    return GLACSegments >= 2 ? value != null && value >= 1 && value <=8 : true;
                },
                message: 'GLACSeg0 is required',
            }),
            GLACSegName0: yup.string().test({
                test: function(value) {
                    const GLACSegments = this.parent.GLACSegments;

                    return GLACSegments >= 2 ? value != null && value !== '' : true;
                },
                message: 'GLACSegName0 is required',
            }),
            GLACSeg1: yup.number().test({
                test: function(value) {
                    const GLACSegments = this.parent.GLACSegments;

                    return GLACSegments >= 2 ? value != null && value >= 1 && value <=8 : true;
                },
                message: 'GLACSeg1 is required',
            }),
            GLACSegName1: yup.string().test({
                test: function(value) {
                    const GLACSegments = this.parent.GLACSegments;

                    return GLACSegments >= 2 ? value != null && value !== '' : true;
                },
                message: 'GLACSegName1 is required',
            }),
            GLACSeg2: yup.number().test({
                test: function(value) {
                    const GLACSegments = this.parent.GLACSegments;

                    return GLACSegments >= 3 ? value != null && value >= 1 && value <=8 : true;
                },
                message: 'GLACSeg2 is required',
            }),
            GLACSegName2: yup.string().test({
                test: function(value) {
                    const GLACSegments = this.parent.GLACSegments;

                    return GLACSegments >= 3 ? value != null && value !== '' : true;
                },
                message: 'GLACSegName2 is required',
            }),
            GLACSeg3: yup.number().test({
                test: function(value) {
                    const GLACSegments = this.parent.GLACSegments;
                    
                    return GLACSegments >= 4 ? value != null && value >= 1 && value <=8 : true;
                },
                message: 'GLACSeg3 is required',
            }),
            GLACSegName3: yup.string().test({
                test: function(value) {
                    const GLACSegments = this.parent.GLACSegments;

                    return GLACSegments >= 4 ? value != null && value !== '' : true;
                },
                message: 'GLACSegName3 is required',
            }),
            GLACSeg4: yup.number().test({
                test: function(value) {
                    const GLACSegments = this.parent.GLACSegments;

                    return GLACSegments >= 5 ? value != null && value >= 1 && value <=8 : true;
                },
                message: 'GLACSeg4 is required',
            }),
            GLACSegName4: yup.string().test({
                test: function(value) {
                    const GLACSegments = this.parent.GLACSegments;

                    return GLACSegments >= 5 ? value != null && value !== '' : true;
                },
                message: 'GLACSegName4 is required',
            }),
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
            extension: SystemRepository.Defaults.set,
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

      const segNumb = [
        "GLACSeg0",
        "GLACSeg1",
        "GLACSeg2",
        "GLACSeg3",
        "GLACSeg4",
      ];

      const segName = [
        "GLACSegName0",
        "GLACSegName1",
        "GLACSegName2",
        "GLACSegName3",
        "GLACSegName4",
      ]

      useEffect(() => {
        const segmentsNum = formik.values.GLACSegments
        
        segNumb.forEach((seg, idx) => {
            if(idx >= segmentsNum) {
                formik.setFieldValue(seg, null)
            }
        })
        segName.forEach((seg, idx) => {
            if(idx >= segmentsNum) {
                formik.setFieldValue(seg, null)
            }
        })

      }, [formik.values.GLACSegments]);

      return(
        <>
        <FormShell
        resourceId={ResourceIds.GLSettings}
        maxAccess={access}
        form={formik}
        >
         
                <Grid container spacing={2} >
                    <Grid item xs={12}>
                        <CustomTextField
                            name='GLACSegments'
                            label={_labels.segments}
                            value={formik.values.GLACSegments}
                            onChange={formik.handleChange}
                            type='number'
                            numberField={true}
                            onClear={() => formik.setFieldValue('GLACSegments', '')}
                            error={formik.touched.GLACSegments && Boolean(formik.errors.GLACSegments)}

                            // helperText={formik.touched.hourRate && formik.errors.hourRate}
                        />
                    </Grid>
                    
                        <Grid item xs={12} lg={6}>
                            {segNumb.map((name, idx) => <Grid key={name} item xs={12} sx={{marginTop:'7px'}}>
                                <CustomTextField
                                    name={name}
                                    label={_labels["segment" + idx]}
                                    readOnly={formik.values.GLACSegments <= idx}
                                    value={formik.values[name]}
                                    onClear={() => formik.setFieldValue(name, '')}
                                    type='number'
                                    numberField={true}
                                    onChange={formik.handleChange}
                                    error={formik.values.GLACSegments > idx && Boolean(formik.errors[name])}

                                    // helperText={formik.touched.hourRate && formik.errors.hourRate}
                                />
                            </Grid>)}
                        </Grid>
                        <Grid item xs={12} lg={6}>
                            {segName.map((name, idx) => <Grid key={name} item xs={12} sx={{marginTop:'7px'}}>
                                <CustomTextField
                                    name={name}
                                    label={"GLACSegName" + (idx + 1)}
                                    readOnly={formik.values.GLACSegments <= idx}
                                    value={formik.values[name]}
                                    onClear={() => formik.setFieldValue(name, '')}
                                    maxLength='20'
                                    numberField={true}
                                    onChange={formik.handleChange}
                                    error={formik.values.GLACSegments > idx  && Boolean(formik.errors[name])}

                                    // helperText={formik.touched.hourRate && formik.errors.hourRate}
                                />
                            </Grid>)}
                        </Grid>
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
                    
                
                <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
            </FormShell>
        </>
    )
  }

  export default GLSettings




/**
 * 
 * 
 *  <Grid item xs={12}>
                    <CustomTextField
                    name='GLACSeg0'
                    label={_labels.segment0}
                    value={formik.values.GLACSeg0}
                    onClear={() => formik.setFieldValue('GLACSeg0', '')}
                    type='number'
                    numberField={true}
                    onChange={formik.handleChange}
                    error={formik.touched.GLACSeg0 && Boolean(formik.errors.GLACSeg0)}

                    // helperText={formik.touched.hourRate && formik.errors.hourRate}
                  />
                    </Grid>
                    <Grid item xs={12}>
                    <CustomTextField
                    name='GLACSeg1'
                    label={_labels.segment1}
                    value={formik.values.GLACSeg1}
                    onClear={() => formik.setFieldValue('GLACSeg1', '')}

                    type='number'
                    numberField={true}
                    onChange={formik.handleChange}
                    error={formik.touched.GLACSeg1 && Boolean(formik.errors.GLACSeg1)}

                    // helperText={formik.touched.GLACSeg0 && formik.errors.GLACSeg0}
                  />
                    </Grid>
                    <Grid item xs={12}>
                    <CustomTextField
                    name='GLACSeg2'
                    label={_labels.segment2}
                    value={formik.values.GLACSeg2}
                    onClear={() => formik.setFieldValue('GLACSeg2', '')}

                    type='number'
                    numberField={true}
                    onChange={formik.handleChange}
                    
                    error={formik.values.GLACSegments >= 3 && Boolean(formik.errors.GLACSeg2)}

                    // helperText={formik.touched.hourRate && formik.errors.hourRate}
                  />
                    </Grid>  
                    <Grid item xs={12}>
                    <CustomTextField
                    name='GLACSeg3'
                    label={_labels.segment3}
                    value={formik.values.GLACSeg3}
                    onClear={() => formik.setFieldValue('GLACSeg3', '')}

                    type='number'
                    numberField={true}
                    onChange={formik.handleChange}
                    error={formik.values.GLACSegments >= 4 && Boolean(formik.errors.GLACSeg3)}

                    // helperText={formik.touched.hourRate && formik.errors.hourRate}
                  />
                    </Grid>  
                    <Grid item xs={12}>
                    <CustomTextField
                    name='GLACSeg4'
                    label={_labels.segment4}
                    value={formik.values.GLACSeg4}
                    onClear={() => formik.setFieldValue('GLACSeg4', '')}

                    type='number'
                    numberField={true}
                    onChange={formik.handleChange}
                    error={formik.touched.GLACSeg4 && Boolean(formik.errors.GLACSeg4)}

                    // helperText={formik.touched.GLACSeg4 && formik.errors.GLACSeg4}
                  />
                    </Grid>  
                   
                    <Grid item xs={12}>
                    <CustomTextField
                    name='GLACSegName0'
                    label={"GLACSegName1"}
                    value={formik.values.GLACSegName0}
                    onClear={() => formik.setFieldValue('GLACSegName0', '')}

                    type='number'
                    numberField={true}
                    onChange={formik.handleChange}
                    error={formik.touched.GLACSegName0 && Boolean(formik.errors.GLACSegName0)}

                    // helperText={formik.touched.hourRate && formik.errors.hourRate}
                  />
                    </Grid> 
                    <Grid item xs={12}>
                    <CustomTextField
                    name='GLACSegName1'
                    label={"GLACSegName2"}
                    value={formik.values.GLACSegName1}
                    onClear={() => formik.setFieldValue('GLACSegName1', '')}
                    type='number'
                    numberField={true}
                    onChange={formik.handleChange}
                    error={formik.touched.GLACSegName1 && Boolean(formik.errors.GLACSegName1)}

                    // helperText={formik.touched.hourRate && formik.errors.hourRate}
                  />
                    </Grid> 
                    <Grid item xs={12}>
                    <CustomTextField
                    name='GLACSegName2'
                    label={"GLACSegName3"}
                    value={formik.values.GLACSegName2}
                    onClear={() => formik.setFieldValue('GLACSegName2', '')}
                    type='number'
                    numberField={true}
                    onChange={formik.handleChange}
                    error={formik.touched.GLACSegName2 && Boolean(formik.errors.GLACSegName2)}

                    // helperText={formik.touched.hourRate && formik.errors.hourRate}
                  />
                    </Grid> 
                    <Grid item xs={12}>
                    <CustomTextField
                    name='GLACSegName3'
                    label={"GLACSegName4"}
                    value={formik.values.GLACSegName3}
                    onClear={() => formik.setFieldValue('GLACSegName3', '')}
                    type='number'
                    numberField={true}
                    onChange={formik.handleChange}
                    error={formik.touched.GLACSegName3 && Boolean(formik.errors.GLACSegName3)}
                    
                    // helperText={formik.touched.hourRate && formik.errors.hourRate}
                  />
                    </Grid> 
                    <Grid item xs={12}>
                    <CustomTextField
                    name='GLACSegName4'
                    label={'GLACSegName5'}
                    value={formik.values.GLACSegName4}
                    onClear={() => formik.setFieldValue('GLACSegName4', '')}
                    type='number'
                    numberField={true}
                    onChange={formik.handleChange}
                    error={formik.touched.GLACSegName4 && Boolean(formik.errors.GLACSegName4)}

                    // helperText={formik.touched.hourRate && formik.errors.hourRate}
                  />
                    </Grid> 
 * 
 */
