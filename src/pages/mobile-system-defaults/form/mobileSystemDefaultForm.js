import { Grid } from '@mui/material'
import React, { useContext } from 'react'
import FormShell from 'src/components/Shared/FormShell'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { useForm } from 'src/hooks/form'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ControlContext } from 'src/providers/ControlContext'
import { RequestsContext } from 'src/providers/RequestsContext'
import toast from 'react-hot-toast'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useResourceQuery } from 'src/hooks/resource'
import { useEffect } from 'react'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import WindowToolbar from 'src/components/Shared/WindowToolbar'
import CustomTextField from 'src/components/Inputs/CustomTextField'

export default function MobileSystem() {
  const { platformLabels } = useContext(ControlContext)
  const { getRequest, postRequest } = useContext(RequestsContext)

  const { labels, access } = useResourceQuery({
    datasetId: ResourceIds.MobileSystemDefaults
  })

  const { formik } = useForm({
    enableReinitialize: false,
    initialValues: {
      rt_mob_plantId: '',
      rt_mob_whatsapp: '',
      rt_mob_email1: '',
      rt_mob_email2: '',
      rt_mob_call_us: '',
      smsMobileProviderId: ''
    },
    onSubmit: async obj => {
      try {
        var data = []
        Object.entries(obj).forEach(([key, value]) => {
          const newObj = { key: key, value: value }
          data.push(newObj)
        })
        await postRequest({
          extension: SystemRepository.Defaults.set,
          record: JSON.stringify({ sysDefaults: data })
        })
        toast.success(platformLabels.Edited)
      } catch (e) {}
    }
  })

  useEffect(() => {
    getDataResult()
  }, [])

  const handleSubmit = () => {
    formik.handleSubmit()
  }

  const getDataResult = () => {
    const fetchedValues = {}
    var parameters = `_filter=`
    getRequest({
      extension: SystemRepository.Defaults.qry,
      parameters: parameters
    })
      .then(res => {
        const filteredList = res.list.filter(obj => {
          return (
            obj.key === 'rt_mob_plantId' ||
            obj.key === 'rt_mob_whatsapp' ||
            obj.key === 'rt_mob_email1' ||
            obj.key === 'rt_mob_call_us' ||
            obj.key === 'rt_mob_email2' ||
            obj.key === 'smsMobileProviderId'
          )
        })
        filteredList.forEach(obj => {
          if (obj.value && !isNaN(obj.value) && obj.value.trim() !== '') {
            fetchedValues[obj.key] = parseInt(obj.value)
          } else {
            fetchedValues[obj.key] = obj.value
          }
        })
        formik.setValues(fetchedValues)
      })
      .catch(error => {})
  }

  return (
    <VertLayout>
      <Grow>
        <Grid container spacing={4} sx={{ pt: '0.5rem' }}>
          <Grid item xs={12} sx={{ marginLeft: '0.5rem', marginRight: '0.5rem' }}>
            <ResourceComboBox
              endpointId={SystemRepository.Plant.qry}
              name='rt_mob_plantId'
              label={labels.plant}
              valueField='recordId'
              displayField={['reference', 'name']}
              columnsInDropDown={[
                { key: 'reference', value: 'Reference' },
                { key: 'name', value: 'Name' }
              ]}
              values={formik.values}
              onChange={async (event, newValue) => {
                formik.setFieldValue('rt_mob_plantId', newValue?.recordId || '')
              }}
              error={formik.touched.rt_mob_plantId && Boolean(formik.errors.rt_mob_plantId)}
              maxAccess={access}
            />
          </Grid>
          <Grid item xs={12} sx={{ marginLeft: '0.5rem', marginRight: '0.5rem' }}>
            <CustomTextField
              name='rt_mob_whatsapp'
              label={labels.whatsapp}
              value={formik.values.rt_mob_whatsapp}
              maxAccess={access}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('rt_mob_whatsapp', '')}
            />
          </Grid>
          <Grid item xs={12} sx={{ marginLeft: '0.5rem', marginRight: '0.5rem' }}>
            <CustomTextField
              name='rt_mob_call_us'
              label={labels.callUs}
              value={formik.values.rt_mob_call_us}
              maxAccess={access}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('rt_mob_call_us', '')}
            />
          </Grid>
          <Grid item xs={12} sx={{ marginLeft: '0.5rem', marginRight: '0.5rem' }}>
            <CustomTextField
              name='rt_mob_email1'
              label={labels.email1}
              value={formik.values.rt_mob_email1}
              maxAccess={access}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('rt_mob_email1', '')}
            />
          </Grid>
          <Grid item xs={12} sx={{ marginLeft: '0.5rem', marginRight: '0.5rem' }}>
            <CustomTextField
              name='rt_mob_email2'
              label={labels.email2}
              value={formik.values.rt_mob_email2}
              maxAccess={access}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('rt_mob_email2', '')}
            />
          </Grid>
          <Grid item xs={12} sx={{ marginLeft: '0.5rem', marginRight: '0.5rem' }}>
            <CustomTextField
              name='smsMobileProviderId'
              label={labels.smsMobileProviderId}
              value={formik.values.smsMobileProviderId}
              maxAccess={access}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('smsMobileProviderId', '')}
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
