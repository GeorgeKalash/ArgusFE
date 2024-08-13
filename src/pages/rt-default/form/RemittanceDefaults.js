import { useContext, useEffect, useState } from 'react'
import { Box, Grid } from '@mui/material'
import { useFormik } from 'formik'
import toast from 'react-hot-toast'
import WindowToolbar from 'src/components/Shared/WindowToolbar'
import { ControlContext } from 'src/providers/ControlContext'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { FinancialRepository } from 'src/repositories/FinancialRepository'

const RemittanceDefaults = ({ _labels }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { getLabels, getAccess } = useContext(ControlContext)
  const [labels, setLabels] = useState(null)
  const [access, setAccess] = useState(null)
  const { platformLabels } = useContext(ControlContext)

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
  }, [access])

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

        if (myObject['rt-fii-accountGroupId']) {
          rtDefaultValidation.setFieldValue('rt-fii-accountGroupId', parseInt(myObject['rt-fii-accountGroupId']))
        }

        if (myObject['rt-nra-product']) {
          rtDefaultFormValidation.setFieldValue('rt-nra-product', myObject['rt-nra-product'])
          getNumberRange(myObject['rt-nra-product'])
        }

        rtDefaultFormValidation.setValues(myObject)
      })
      .catch(error => {})
  }

  const getNumberRange = nraId => {
    var parameters = `_filter=` + '&_recordId=' + nraId
    getRequest({
      extension: SystemRepository.NumberRange.get,
      parameters: parameters
    })
      .then(res => {
        rtDefaultValidation.setFieldValue('rt-nra-product', res.record.recordId)

        rtDefaultFormValidation.setFieldValue('nraId', res.record.recordId)
        rtDefaultFormValidation.setFieldValue('nraRef', res.record.reference)
        rtDefaultFormValidation.setFieldValue('nraDescription', res.record.description)
      })
      .catch(error => {})
  }

  const rtDefaultFormValidation = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    initialValues: {
      nraId: null,
      nraRef: null,
      nraDescription: null
    },

    onSubmit: values => {}
  })

  const rtDefaultValidation = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    initialValues: {
      'rt-nra-product': null,
      'rt-fii-accountGroupId': ''
    },

    onSubmit: values => {
      postRtDefault(values)
    }
  })

  const postRtDefault = obj => {
    var data = []
    Object.entries(obj).forEach(([key, value], i) => {
      const newObj = { key: key, value: value }

      data.push(newObj)
    })

    postRequest({
      extension: RemittanceSettingsRepository.RtDefault.set2,
      record: JSON.stringify({ sysDefaults: data })
    })
      .then(res => {
        if (res) toast.success(platformLabels.Updated)
      })
      .catch(error => {})
  }

  const handleSubmit = () => {
    rtDefaultValidation.handleSubmit()
  }

  return (
    <VertLayout>
      <Grow>
        <Grid container spacing={4} sx={{ pt: '0.5rem' }}>
          <Grid item xs={12} sx={{ marginLeft: '0.5rem', marginRight: '0.5rem' }}>
            <ResourceLookup
              endpointId={SystemRepository.NumberRange.snapshot}
              form={rtDefaultFormValidation}
              name='nraId'
              label={_labels.nuRange}
              valueField='reference'
              displayField='description'
              firstValue={rtDefaultFormValidation.values.nraRef}
              secondValue={rtDefaultFormValidation.values.nraDescription}
              onChange={(event, newValue) => {
                if (newValue) {
                  rtDefaultValidation.setFieldValue('rt-nra-product', newValue?.recordId || '')
                  rtDefaultFormValidation.setFieldValue('nraId', newValue?.recordId)
                  rtDefaultFormValidation.setFieldValue('nraRef', newValue?.reference)
                  rtDefaultFormValidation.setFieldValue('nraDescription', newValue?.description || '')
                } else {
                  rtDefaultValidation.setFieldValue('rt-nra-product', '')
                  rtDefaultFormValidation.setFieldValue('nraId', '')
                  rtDefaultFormValidation.setFieldValue('nraRef', '')
                  rtDefaultFormValidation.setFieldValue('nraDescription', '')
                }
              }}
              maxAccess={access}
            />
          </Grid>
          <Grid item xs={12} sx={{ marginLeft: '0.5rem', marginRight: '0.5rem' }}>
            {' '}
            <ResourceComboBox
              endpointId={FinancialRepository.Group.qry}
              name='rt-fii-accountGroupId'
              label={_labels.dag}
              valueField='recordId'
              displayField='name'
              values={rtDefaultValidation.values}
              onChange={(event, newValue) => {
                rtDefaultValidation.setFieldValue('rt-fii-accountGroupId', newValue?.recordId || '')
              }}
            />
          </Grid>
        </Grid>
      </Grow>
      <Fixed>
        <WindowToolbar onSave={handleSubmit} isSaved={true} />
      </Fixed>
    </VertLayout>
  )
}

export default RemittanceDefaults
