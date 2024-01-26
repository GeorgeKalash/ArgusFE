// ** React Imports
import { useEffect, useState, useContext } from 'react'

// ** MUI Imports
import { Grid, Box, FormControlLabel, Checkbox } from '@mui/material'

// ** Third Party Imports
import { useFormik } from 'formik'
import * as yup from 'yup'
import toast from 'react-hot-toast'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'
import GridToolbar from 'src/components/Shared/GridToolbar'
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import Window from 'src/components/Shared/Window'
import WindowToolbar from 'src/components/Shared/WindowToolbar'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'
import { ControlContext } from 'src/providers/ControlContext'
import { CommonContext } from 'src/providers/CommonContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { getNewDocumentTypeMaps, populateDocumentTypeMaps } from 'src/Models/System/DocumentTypeMaps'
import CustomLookup from 'src/components/Inputs/CustomLookup'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { DataSets } from 'src/resources/DataSets'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'
import { MultiCurrencyRepository } from 'src/repositories/MultiCurrencyRepository'

const MCDefault = () => {
    const [errorMessage, setErrorMessage] = useState(null)

    const {
        labels: _labels,
        access
      } = useResourceQuery({
        datasetId: ResourceIds.MC_Default,
      })
    
    const formik = useFormik({
        enableReinitialize: true,
        validateOnChange: true,
         initialValues: {
            defaultRTSA : null
        },
        onSubmit: values => {
          postMcDefault(values)
        }
    })

    const postMcDefault = obj => {

        var data = []
        Object.entries(obj).forEach(([key, value], i) => {
           // console.log(`Key: ${key}, Value: ${value}`);
           const newObj = { key: key  , value : value };
     
           // Push the new object into the array
           data.push(newObj);
     
        })
        postRequest({
            extension: SystemRepository.Defaults.set2DE,
            record:   JSON.stringify({  sysDefaults  : data })
        })
        console.log(res)

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
                <Grid container spacing={5} sx={{width : '30%', pl:'10px'}}>
                    <Grid item xs={12}>
                        <ResourceComboBox
                        endpointId={MultiCurrencyRepository.RateType.qry}
                        name='defaultRTSA'
                        label={_labels.mc_defaultRTSA}
                        valueField='recordId'
                        displayField='name'
                        values={formik.values}
                        onChange={(event, newValue) => {
                            formik && formik.setFieldValue('defaultRTSA', newValue?.recordId)
                        }}
                        error={formik.touched.defaultRTSA && Boolean(formik.errors.defaultRTSA)}
                        helperText={formik.touched.defaultRTSA && formik.errors.defaultRTSA}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <ResourceComboBox
                        endpointId={MultiCurrencyRepository.RateType.qry}
                        name='defaultRTPU'
                        label={_labels.mc_defaultRTPU}
                        valueField='recordId'
                        displayField='name'
                        values={formik.values}
                        onChange={(event, newValue) => {
                            formik && formik.setFieldValue('defaultRTPU', newValue?.recordId)
                        }}
                        error={formik.touched.defaultRTPU && Boolean(formik.errors.defaultRTPU)}
                        helperText={formik.touched.defaultRTPU && formik.errors.defaultRTPU}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <ResourceComboBox
                        endpointId={MultiCurrencyRepository.RateType.qry}
                        name='defaultRTMF'
                        label={_labels.mc_defaultRTMF}
                        valueField='recordId'
                        displayField='name'
                        values={formik.values}
                        onChange={(event, newValue) => {
                            formik && formik.setFieldValue('defaultRTMF', newValue?.recordId)
                        }}
                        error={formik.touched.defaultRTMF && Boolean(formik.errors.defaultRTMF)}
                        helperText={formik.touched.defaultRTMF && formik.errors.defaultRTMF}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <ResourceComboBox
                        endpointId={MultiCurrencyRepository.RateType.qry}
                        name='defaultRTFI'
                        label={_labels.mc_defaultRTFI}
                        valueField='recordId'
                        displayField='name'
                        values={formik.values}
                        onChange={(event, newValue) => {
                            formik && formik.setFieldValue('defaultRTFI', newValue?.recordId)
                        }}
                        error={formik.touched.defaultRTFI && Boolean(formik.errors.defaultRTFI)}
                        helperText={formik.touched.defaultRTFI && formik.errors.defaultRTFI}
                        />
                    </Grid>
                    <WindowToolbar onSave={handleSubmit}  /> 
                </Grid>
                <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />

            </Box>
        </>
    )
  }
  
  export default MCDefault