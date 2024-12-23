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
import { InventoryRepository } from 'src/repositories/InventoryRepository'

const MCDefault = ({ _labels }) => {
  const { postRequest } = useContext(RequestsContext)
  const { platformLabels, defaultsData, updateDefaults } = useContext(ControlContext)
  const [baseMetalCuId, setBaseMetalCuId] = useState(null)
  const [baseSalesMetalId, setBaseSalesMetalId] = useState(null)

  const [initialValues, setInitialValues] = useState({
    mc_defaultRTSA: null,
    mc_defaultRTPU: null,
    mc_defaultRTMF: null,
    mc_defaultRTFI: null,
    mc_defaultRTTAX: null,
    baseMetalCuId: null,
    baseSalesMetalId: null
  })

  useEffect(() => {
    getDataResult()
  }, [])

  const getDataResult = () => {
    const myObject = {}

    const filteredList = defaultsData?.list?.filter(obj => {
      return (
        obj.key === 'mc_defaultRTSA' ||
        obj.key === 'mc_defaultRTPU' ||
        obj.key === 'mc_defaultRTMF' ||
        obj.key === 'mc_defaultRTFI' ||
        obj.key === 'mc_defaultRTTAX' ||
        obj.key === 'baseMetalCuId' ||
        obj.key === 'baseSalesMetalId'
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

    const updatedData = {
      ...obj,
      baseMetalCuId: baseMetalCuId,
      baseSalesMetalId: baseSalesMetalId
    }
    Object.entries(updatedData).forEach(([key, value]) => {
      const newObj = { key: key, value: value }
      data.push(newObj)
    })
    postRequest({
      extension: SystemRepository.Defaults.set,
      record: JSON.stringify({ sysDefaults: data })
    }).then(res => {
      if (res) toast.success(platformLabels.Edited)
      updateDefaults(data)
    })
  }

  const handleSubmit = () => {
    formik.handleSubmit()
  }

  return (
    <VertLayout>
      <Grow>
        <Grid container spacing={4} sx={{ pl: '10px', pt: '10px' }} xs={12}>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={MultiCurrencyRepository.RateType.qry}
              name='mc_defaultRTSA'
              label={_labels.mc_defaultRTSA}
              valueField='recordId'
              displayField={['reference', 'name']}
              columnsInDropDown={[
                { key: 'reference', value: 'Reference' },
                { key: 'name', value: 'Name' }
              ]}
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
              displayField={['reference', 'name']}
              columnsInDropDown={[
                { key: 'reference', value: 'Reference' },
                { key: 'name', value: 'Name' }
              ]}
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
              displayField={['reference', 'name']}
              columnsInDropDown={[
                { key: 'reference', value: 'Reference' },
                { key: 'name', value: 'Name' }
              ]}
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
              displayField={['reference', 'name']}
              columnsInDropDown={[
                { key: 'reference', value: 'Reference' },
                { key: 'name', value: 'Name' }
              ]}
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
              displayField={['reference', 'name']}
              columnsInDropDown={[
                { key: 'reference', value: 'Reference' },
                { key: 'name', value: 'Name' }
              ]}
              values={formik.values}
              onChange={(event, newValue) => {
                formik.setFieldValue('mc_defaultRTTAX', newValue?.recordId || '')
              }}
              error={formik.touched.mc_defaultRTTAX && Boolean(formik.errors.mc_defaultRTTAX)}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={SystemRepository.Currency.qry}
              name='baseMetalCuId'
              label={_labels.baseMetalCuId}
              valueField='recordId'
              displayField={['reference', 'name']}
              columnsInDropDown={[
                { key: 'reference', value: 'Reference' },
                { key: 'name', value: 'Name' }
              ]}
              readOnly={formik.values.baseMetalCuId}
              values={formik.values.baseMetalCuId ? formik.values : baseMetalCuId}
              onChange={(event, newValue) => {
                setBaseMetalCuId(newValue?.recordId || '')
              }}
              error={formik.touched.baseMetalCuId && Boolean(formik.errors.baseMetalCuId)}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={InventoryRepository.Metals.qry}
              name='baseSalesMetalId'
              label={_labels.baseSalesMetalId}
              valueField='recordId'
              displayField='reference'
              values={formik.values.baseSalesMetalId ? formik.values : baseSalesMetalId}
              readOnly={formik.values.baseSalesMetalId}
              onChange={(event, newValue) => {
                setBaseSalesMetalId(newValue?.recordId || '')
              }}
              error={formik.touched.baseSalesMetalId && Boolean(formik.errors.baseSalesMetalId)}
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
