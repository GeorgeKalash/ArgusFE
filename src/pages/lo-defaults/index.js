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
import { InventoryRepository } from 'src/repositories/InventoryRepository'

const LoDefault = () => {
    const [errorMessage, setErrorMessage] = useState(null)
    const { getRequest, postRequest } = useContext(RequestsContext)

    const [initialValues, setInitialValues] = useState({
        transitSiteId:null,
    });

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
        .then(res => {console.log(res);
            
            const filteredList = res.list.filter(obj => {
                return (
                    obj.key === 'transitSiteId'
                );
            });
            filteredList.forEach(obj => (
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
        datasetId: ResourceIds.carrierSite,
      })
    
    const formik = useFormik({
        enableReinitialize: true,
        validateOnChange: true,
        initialValues,
        onSubmit: values => {
          postLoDefault(values)
        }
    })

    const postLoDefault = obj => {

        var data = []
        Object.entries(obj).forEach(([key, value]) => {
           const newObj = { key: key  , value : value };
           data.push(newObj);
     
        })
        postRequest({
            extension: SystemRepository.Defaults.set,
            record:   JSON.stringify({  SysDefaults  : data }),
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
                            endpointId={InventoryRepository.Site.qry}
                            name='transitSiteId'
                            label={_labels.carrierSite}
                            columnsInDropDown={[
                            { key: 'reference', value: 'Reference' },
                            { key: 'name', value: 'Name' }
                            ]}
                            values={formik.values}
                            valueField='recordId'
                            displayField='name'
                            maxAccess={access}
                            onChange={(event, newValue) => {
                            formik.setFieldValue('transitSiteId', newValue?.recordId)
                            }}
                            error={formik.touched.transitSiteId && Boolean(formik.errors.transitSiteId)}

                            // helperText={formik.touched.transitSiteId && formik.errors.transitSiteId}
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
  
  export default LoDefault