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

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'
import { MultiCurrencyRepository } from 'src/repositories/MultiCurrencyRepository'

const MCDefault = () => {
    const [errorMessage, setErrorMessage] = useState(null)
    const { getRequest, postRequest } = useContext(RequestsContext)

    const [initialValues, setInitialValues] = useState({
        mc_defaultRTSA:null,
        mc_defaultRTPU:null,
        mc_defaultRTMF:null,
        mc_defaultRTFI:null,
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
        datasetId: ResourceIds.MC_Default,
      })
    
    const formik = useFormik({
        enableReinitialize: true,
        validateOnChange: true,
        initialValues,
        onSubmit: values => {
          postMcDefault(values)
        }
    })

    const postMcDefault = obj => {

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
                        <ResourceComboBox
                        endpointId={MultiCurrencyRepository.RateType.qry}
                        name='mc_defaultRTSA'
                        label={_labels.mc_defaultRTSA}
                        valueField='recordId'
                        displayField='name'
                        values={formik.values}
                        onChange={(event, newValue) => {
                            formik && formik.setFieldValue('mc_defaultRTSA', newValue?.recordId)
                        }}
                        error={formik.touched.mc_defaultRTSA && Boolean(formik.errors.mc_defaultRTSA)}

                        // helperText={formik.touched.mc_defaultRTSA && formik.errors.mc_defaultRTSA}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <ResourceComboBox
                        endpointId={MultiCurrencyRepository.RateType.qry}
                        name='mc_defaultRTPU'
                        label={_labels.mc_defaultRTPU}
                        valueField='recordId'
                        displayField='name'
                        values={formik.values}
                        onChange={(event, newValue) => {
                            formik && formik.setFieldValue('mc_defaultRTPU', newValue?.recordId)
                        }}
                        error={formik.touched.mc_defaultRTPU && Boolean(formik.errors.mc_defaultRTPU)}

                        // helperText={formik.touched.mc_defaultRTPU && formik.errors.mc_defaultRTPU}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <ResourceComboBox
                        endpointId={MultiCurrencyRepository.RateType.qry}
                        name='mc_defaultRTMF'
                        label={_labels.mc_defaultRTMF}
                        valueField='recordId'
                        displayField='name'
                        values={formik.values}
                        onChange={(event, newValue) => {
                            if (newValue) {
                                formik.setFieldValue('mc_defaultRTMF', newValue?.recordId)
                              } else {
                                formik.setFieldValue('mc_defaultRTMF', '')
                              }
                        }}
                        error={formik.touched.mc_defaultRTMF && Boolean(formik.errors.mc_defaultRTMF)}

                        // helperText={formik.touched.mc_defaultRTMF && formik.errors.mc_defaultRTMF}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <ResourceComboBox
                        endpointId={MultiCurrencyRepository.RateType.qry}
                        name='mc_defaultRTFI'
                        label={_labels.mc_defaultRTFI}
                        valueField='recordId'
                        displayField='name'
                        values={formik.values}
                        onChange={(event, newValue) => {
                            formik && formik.setFieldValue('mc_defaultRTFI', newValue?.recordId)
                        }}
                        error={formik.touched.mc_defaultRTFI && Boolean(formik.errors.mc_defaultRTFI)}

                        // helperText={formik.touched.mc_defaultRTFI && formik.errors.mc_defaultRTFI}
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
  
  export default MCDefault