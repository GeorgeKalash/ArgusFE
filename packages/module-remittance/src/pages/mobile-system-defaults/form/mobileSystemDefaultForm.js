import { Grid } from '@mui/material'
import React, { useContext, useEffect } from 'react'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import toast from 'react-hot-toast'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'

import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import Form from '@argus/shared-ui/src/components/Shared/Form'

export default function MobileSystem() {
  const { postRequest } = useContext(RequestsContext)
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
      await postRequest({
        extension: SystemRepository.Defaults.set,
        record: JSON.stringify({ sysDefaults: data })
      })
      updateDefaults(data)
      toast.success(platformLabels.Updated)
    }
  })

  useEffect(() => {
    loadDefaults()
  }, [defaultsData])

  const loadDefaults = () => {
    if (!defaultsData?.list) return

    const fetchedValues = {}

    const keysToLoad = [
      'rt_mob_plantId',
      'rt_mob_whatsapp',
      'rt_mob_email1',
      'rt_mob_call_us',
      'rt_mob_email2',
      'smsMobileProviderId'
    ]

    defaultsData.list
      .filter(obj => keysToLoad.includes(obj.key))
      .forEach(obj => {
        const val = obj.value

        if (typeof val === 'string' && val.trim() !== '' && !isNaN(Number(val))) {
          fetchedValues[obj.key] = parseInt(val, 10)
        } else {
          fetchedValues[obj.key] = val ?? null
        }
      })

    formik.setValues(prev => ({
      ...prev,
      ...fetchedValues
    }))
  }

  return (
    <Form onSave={formik.handleSubmit} maxAccess={access}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
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
                onChange={async (event, newValue) => {
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
      </VertLayout>
    </Form>
  )
}
