import { Grid } from '@mui/material'
import React, { useContext, useEffect } from 'react'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { useForm } from 'src/hooks/form'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ControlContext } from 'src/providers/ControlContext'
import toast from 'react-hot-toast'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useResourceQuery } from 'src/hooks/resource'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import WindowToolbar from 'src/components/Shared/WindowToolbar'
import CustomTextField from 'src/components/Inputs/CustomTextField'

export default function MobileSystem() {
  const { platformLabels, defaultsData, updateDefaults } = useContext(ControlContext)

  const { labels, access } = useResourceQuery({
    datasetId: ResourceIds.MobileSystemDefaults
  })

  const { formik } = useForm({
    maxAccess: access,
    initialValues: {
      rt_mob_plantId: null,
      rt_mob_whatsapp: '',
      rt_mob_email1: '',
      rt_mob_email2: '',
      rt_mob_call_us: '',
      smsMobileProviderId: null
    },
    onSubmit: async obj => {
      const data = Object.entries(obj).map(([key, value]) => ({
        key,
        value
      }))

      await updateDefaults(data)
      toast.success(platformLabels.Edited)
    }
  })

  useEffect(() => {
    loadDefaults()
  }, [defaultsData])

  const loadDefaults = () => {
    if (!defaultsData?.list) return

    const fetchedValues = {}

    const filteredList = defaultsData.list.filter(
      obj =>
        obj.key === 'rt_mob_plantId' ||
        obj.key === 'rt_mob_whatsapp' ||
        obj.key === 'rt_mob_email1' ||
        obj.key === 'rt_mob_call_us' ||
        obj.key === 'rt_mob_email2' ||
        obj.key === 'smsMobileProviderId'
    )

    filteredList.forEach(obj => {
      if (obj.value && !isNaN(obj.value) && obj.value.trim() !== '') {
        fetchedValues[obj.key] = parseInt(obj.value)
      } else {
        fetchedValues[obj.key] = obj.value
      }
    })

    formik.setValues({ ...formik.values, ...fetchedValues })
  }

  return (
    <VertLayout>
      <Grow>
        <Grid container spacing={4} sx={{ p: 2 }}>
          <Grid item xs={12}>
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
              onChange={(event, newValue) => {
                formik.setFieldValue('rt_mob_plantId', newValue?.recordId || null)
              }}
              error={formik.touched.rt_mob_plantId && Boolean(formik.errors.rt_mob_plantId)}
              maxAccess={access}
            />
          </Grid>

          <Grid item xs={12}>
            <CustomTextField
              name='rt_mob_whatsapp'
              label={labels.whatsapp}
              value={formik.values.rt_mob_whatsapp}
              maxAccess={access}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('rt_mob_whatsapp', '')}
            />
          </Grid>

          <Grid item xs={12}>
            <CustomTextField
              name='rt_mob_call_us'
              label={labels.callUs}
              value={formik.values.rt_mob_call_us}
              maxAccess={access}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('rt_mob_call_us', '')}
            />
          </Grid>

          <Grid item xs={12}>
            <CustomTextField
              name='rt_mob_email1'
              label={labels.email1}
              value={formik.values.rt_mob_email1}
              maxAccess={access}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('rt_mob_email1', '')}
            />
          </Grid>

          <Grid item xs={12}>
            <CustomTextField
              name='rt_mob_email2'
              label={labels.email2}
              value={formik.values.rt_mob_email2}
              maxAccess={access}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('rt_mob_email2', '')}
            />
          </Grid>

          <Grid item xs={12}>
            <CustomTextField
              name='smsMobileProviderId'
              label={labels.smsMobileProviderId}
              value={formik.values.smsMobileProviderId}
              maxAccess={access}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('smsMobileProviderId', null)}
            />
          </Grid>
        </Grid>
      </Grow>

      <Fixed>
        <WindowToolbar onSave={formik.handleSubmit} isSaved={true} />
      </Fixed>
    </VertLayout>
  )
}
