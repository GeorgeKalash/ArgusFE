// ** React Imports
import { useContext, useEffect, useState } from 'react'

// ** MUI Imports
import { Box, Grid } from '@mui/material'

// ** Third Party Imports
import { useFormik } from 'formik'
import toast from 'react-hot-toast'

// ** Custom Imports
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import WindowToolbar from 'src/components/Shared/WindowToolbar'

// ** API
import CustomLookup from 'src/components/Inputs/CustomLookup'
import { CommonContext } from 'src/providers/CommonContext'
import { ControlContext } from 'src/providers/ControlContext'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'

// ** Resources
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'

const DocumentTypeMaps = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { fillDocumentTypeStore } = useContext(CommonContext)
  const { getLabels, getAccess } = useContext(ControlContext)

  //control
  const [labels, setLabels] = useState(null)
  const [access, setAccess] = useState(null)
  const [numberRangeStore, setNumberRangeStore] = useState([])

  //stores

  const [errorMessage, setErrorMessage] = useState(null)

  useEffect(() => {
    if (!access) getAccess(ResourceIds.SystemDefault, setAccess)
    else {
      if (access.record.maxAccess > 0) {
        getLabels(ResourceIds.SystemDefault, setLabels)

        getDataResult()
      } else {
        setErrorMessage({ message: "YOU DON'T HAVE ACCESS TO THIS SCREEN" })
      }
    }

    // getDataResult()
  }, [access])

  const _labels = {
    nuRange: labels && labels.find(item => item.key === '1').value
  }

  const getDataResult = () => {
    const myObject = {}

    var parameters = `_filter=`
    getRequest({
      extension: RemittanceSettingsRepository.RtDefault.qry,
      parameters: parameters
    })
      .then(res => {
        res.list.map(obj => (myObject[obj.key] = obj.value))
        myObject['nraRef'] = null

        rtDefaultFormValidation.setValues(myObject)

        if (myObject && myObject['rt-nra-product']) {
          getNumberRange(myObject['rt-nra-product'])
        }
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const getNumberRange = nraId => {
    var parameters = `_filter=` + '&_recordId=' + nraId
    getRequest({
      extension: SystemRepository.NumberRange.get,
      parameters: parameters
    })
      .then(res => {
        // console.log(res)
        rtDefaultValidation.setFieldValue('rt-nra-product', res.record.recordId)

        rtDefaultFormValidation.setFieldValue('nraId', res.record.recordId)
        rtDefaultFormValidation.setFieldValue('nraRef', res.record.reference)
        rtDefaultFormValidation.setFieldValue('nraDescription', res.record.description)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const rtDefaultFormValidation = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    initialValues: {
      nraId: null,
      nraRef: null,
      nraDescription: null
    },
    onSubmit: values => {
      // postRtDefault(values)
    }
  })

  const rtDefaultValidation = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    initialValues: {
      'rt-nra-product': null
    },
    onSubmit: values => {
      postRtDefault(values)
    }
  })

  const postRtDefault = obj => {
    var data = []
    Object.entries(obj).forEach(([key, value], i) => {
      // console.log(`Key: ${key}, Value: ${value}`);
      const newObj = { key: key, value: value }

      // Push the new object into the array
      data.push(newObj)
    })

    postRequest({
      extension: RemittanceSettingsRepository.RtDefault.set2,
      record: JSON.stringify({ sysDefaults: data })
    })
      .then(res => {
        console.log(res)
        if (res) toast.success('Record Successfully')
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const handleSubmit = () => {
    rtDefaultValidation.handleSubmit()
  }

  const lookupNumberRange = searchQry => {
    var parameters = `_size=30&_startAt=0&_filter=${searchQry}`
    getRequest({
      extension: SystemRepository.NumberRange.snapshot,
      parameters: parameters
    })
      .then(res => {
        setNumberRangeStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          marginTop: '10px'
        }}
      >
        <Grid container spacing={2} sx={{ width: '50%' }}>
          {/* First Row */}
          <Grid item xs={12}>
            <ResourceLookup
              endpointId={SystemRepository.NumberRange.snapshot}
              form={rtDefaultFormValidation}
              name='rt-nra-product'
              label={_labels.nuRange}
              valueField='reference'
              displayField='description'
              firstValue={rtDefaultFormValidation.values.nraRef}
              secondValue={rtDefaultFormValidation.values.nraDescription}
              onChange={(event, newValue) => {
                if (newValue) {
                  rtDefaultValidation.setFieldValue('rt-nra-product', newValue?.recordId)
                  rtDefaultFormValidation.setFieldValue('nraId', newValue?.recordId)
                  rtDefaultFormValidation.setFieldValue('nraRef', newValue?.reference)
                  rtDefaultFormValidation.setFieldValue('nraDescription', newValue?.description)
                } else {
                  rtDefaultValidation.setFieldValue('rt-nra-product', null)
                  rtDefaultFormValidation.setFieldValue('nraId', null)
                  rtDefaultFormValidation.setFieldValue('nraRef', null)
                  rtDefaultFormValidation.setFieldValue('nraDescription', null)
                }
              }}
              error={rtDefaultFormValidation.touched.nraId && Boolean(rtDefaultFormValidation.errors.nraId)}
              helperText={rtDefaultFormValidation.touched.nraId && rtDefaultFormValidation.errors.nraId}
              maxAccess={access}
            />
          </Grid>

          {/* <ResourceLookup
              endpointId={SystemRepository.NumberRange.snapshot}
              form={formik}
              valueField='reference'
              displayField='description'
              name='ct-nra-individual'
              firstValue={formik.values['ct-nra-individual-ref']}
              label={_labels['ct-nra-individual']}
              
              secondValue={formik.values['ct-nra-individual-description']}
              onChange={(event, newValue) => {
                if (newValue) {
                  formik.setFieldValue('ct-nra-individual', newValue?.recordId)
                  formik.setFieldValue('ct-nra-individual-ref', newValue?.reference)
                  formik.setFieldValue('ct-nra-individual-description', newValue?.description)
                } else {
                  formik.setFieldValue('ct-nra-individual', '')
                  formik.setFieldValue('ct-nra-individual-ref', '')
                  formik.setFieldValue('ct-nra-individual-description', '')
                }
              }}
              error={formik.touched['ct-nra-individual'] && Boolean(formik.errors['ct-nra-individual'])}
              helperText={formik.touched['ct-nra-individual'] && formik.errors['ct-nra-individual']}
            />
          </Grid> */}
        </Grid>
        <Grid
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            width: '100%',
            padding: 3,
            textAlign: 'center'
          }}
        >
          <WindowToolbar onSave={handleSubmit} isSaved={true} />
        </Grid>
      </Box>

      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default DocumentTypeMaps
