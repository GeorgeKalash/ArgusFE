import { useEffect, useState, useContext } from 'react'
import { Grid } from '@mui/material'
import { useFormik } from 'formik'
import toast from 'react-hot-toast'
import WindowToolbar from 'src/components/Shared/WindowToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { MultiCurrencyRepository } from 'src/repositories/MultiCurrencyRepository'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'

const MCDefault = ({ _labels, acces }) => {
  const { postRequest } = useContext(RequestsContext)
  const { platformLabels, defaultsData, setDefaultsData } = useContext(ControlContext)

  const [initialValues, setInitialValues] = useState({
    mc_defaultRTSA: null,
    mc_defaultRTPU: null,
    mc_defaultRTMF: null,
    mc_defaultRTFI: null,
    mc_defaultRTTAX: null
  })

  useEffect(() => {
    getDataResult()
  }, [])

  const getDataResult = () => {
    const myObject = {}

    const filteredList = defaultsData.list.filter(obj => {
      return (
        obj.key === 'mc_defaultRTSA' ||
        obj.key === 'mc_defaultRTPU' ||
        obj.key === 'mc_defaultRTMF' ||
        obj.key === 'mc_defaultRTFI' ||
        obj.key === 'mc_defaultRTTAX'
      )
    })
    filteredList.forEach(obj => (myObject[obj.key] = obj.value ? parseInt(obj.value) : null))
    setInitialValues(myObject)
  }

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
    }).then(res => {
      if (res) toast.success(platformLabels.Edited)

      const updatedDefaultsData = [...defaultsData.list, ...data].reduce((acc, obj) => {
        const existing = acc.find(item => item.key === obj.key)
        if (existing) {
          existing.value = obj.value
        } else {
          acc.push({ ...obj, value: obj.value })
        }

        return acc
      }, [])
      setDefaultsData({ list: updatedDefaultsData })
    })
  }

  const handleSubmit = () => {
    formik.handleSubmit()
  }

  return (
    <VertLayout>
      <Grow>
        <Grid container spacing={5} sx={{ pl: '10px', pt: '10px' }} xs={12}>
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
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={MultiCurrencyRepository.RateType.qry}
              name='mc_defaultRTTAX'
              label={_labels.mc_defaultRTTAX}
              valueField='recordId'
              displayField='name'
              values={formik.values}
              onChange={(event, newValue) => {
                formik.setFieldValue('mc_defaultRTTAX', newValue?.recordId || '')
              }}
              error={formik.touched.mc_defaultRTTAX && Boolean(formik.errors.mc_defaultRTTAX)}
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
