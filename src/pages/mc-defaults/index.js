// ** React Imports
import { useEffect, useState, useContext } from 'react'

// ** MUI Imports
import { Grid, Box } from '@mui/material'

// ** Third Party Imports
import { useFormik } from 'formik'
import toast from 'react-hot-toast'

// ** Custom Imports
import WindowToolbar from 'src/components/Shared/WindowToolbar'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'
import { MultiCurrencyRepository } from 'src/repositories/MultiCurrencyRepository'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'

const MCDefault = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)

  const [initialValues, setInitialValues] = useState({
    mc_defaultRTSA: null,
    mc_defaultRTPU: null,
    mc_defaultRTMF: null,
    mc_defaultRTFI: null
  })

  useEffect(() => {
    getDataResult()
  }, [])

  const getDataResult = () => {
    const myObject = {}
    var parameters = `_filter=`
    getRequest({
      extension: SystemRepository.Defaults.qry,
      parameters: parameters
    })
      .then(res => {
        const filteredList = res.list.filter(obj => {
          return (
            obj.key === 'mc_defaultRTSA' ||
            obj.key === 'mc_defaultRTPU' ||
            obj.key === 'mc_defaultRTMF' ||
            obj.key === 'mc_defaultRTFI'
          )
        })
        filteredList.forEach(obj => (myObject[obj.key] = obj.value ? parseInt(obj.value) : null))
        setInitialValues(myObject)
      })
      .catch(error => {})
  }

  const { labels: _labels, access } = useResourceQuery({
    datasetId: ResourceIds.MC_Default
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
      const newObj = { key: key, value: value }
      data.push(newObj)
    })
    postRequest({
      extension: SystemRepository.Defaults.set,
      record: JSON.stringify({ sysDefaults: data })
    })
      .then(res => {
        if (res) toast.success('Record Successfully')
      })
      .catch(error => {})
  }

  const handleSubmit = () => {
    formik.handleSubmit()
  }

  return (
    <VertLayout>
      <Grow>
      <Grid container spacing={5} sx={{ pl: '10px', pt:'10px' }} lg={4} md={7} sm={7} xs={12}>
        <Grid item xs={12}>
          <ResourceComboBox
            endpointId={MultiCurrencyRepository.RateType.qry}
            name='mc_defaultRTSA'
            label={_labels.mc_defaultRTSA}
            valueField='recordId'
            displayField='name'
            values={formik.values}
            onChange={(event, newValue) => {
              formik.setFieldValue('mc_defaultRTSA', newValue?.recordId || '')
            }}
            error={formik.touched.mc_defaultRTSA && Boolean(formik.errors.mc_defaultRTSA)}
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
              formik.setFieldValue('mc_defaultRTPU', newValue?.recordId || '')
            }}
            error={formik.touched.mc_defaultRTPU && Boolean(formik.errors.mc_defaultRTPU)}
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
              formik.setFieldValue('mc_defaultRTMF', newValue?.recordId || '')
            }}
            error={formik.touched.mc_defaultRTMF && Boolean(formik.errors.mc_defaultRTMF)}
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
              formik.setFieldValue('mc_defaultRTFI', newValue?.recordId || '')
            }}
            error={formik.touched.mc_defaultRTFI && Boolean(formik.errors.mc_defaultRTFI)}
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

export default MCDefault
