import { useEffect, useContext } from 'react'
import { Grid } from '@mui/material'
import toast from 'react-hot-toast'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import * as yup from 'yup'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import Form from '@argus/shared-ui/src/components/Shared/Form'

const IvSettings = ({ _labels, access }) => {
  const { platformLabels, defaultsData, updateDefaults } = useContext(ControlContext)
  const { postRequest } = useContext(RequestsContext)

  const arrayAllow = ['itemSearchStyle', 'itemSearchFields', 'iv_minSerialSize', 'minItemSearchTextSize']

  const { formik } = useForm({
    maxAccess: access,
    initialValues: arrayAllow.reduce((acc, key) => ({ ...acc, [key]: null }), {}),
    validationSchema: yup.object({
      iv_minSerialSize: yup.number().min(1).max(20).nullable(),
      minItemSearchTextSize: yup.number().min(3).max(20).required()
    }),
    onSubmit: async obj => {
      const data = []
      Object.entries(obj).forEach(([key, value]) => {
        const newObj = { key: key, value: value }
        data.push(newObj)
      })
      await postRequest({
        extension: SystemRepository.Defaults.set,
        record: JSON.stringify({ sysDefaults: data })
      })
      updateDefaults(data)
      toast.success(platformLabels.Edited)
    }
  })

  useEffect(() => {
    const myObject = {}
    defaultsData?.list?.forEach(obj => {
      if (arrayAllow.includes(obj.key)) {
        myObject[obj.key] = obj.value ? parseFloat(obj.value) : null
        formik.setFieldValue(obj.key, myObject[obj.key])
      }
    })
  }, [defaultsData])

  return (
    <Form onSave={formik.handleSubmit} maxAccess={access}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.ITEM_SEARCH_STYLE}
                name='itemSearchStyle'
                label={_labels.itemSearchStyle}
                valueField='key'
                displayField='value'
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('itemSearchStyle', newValue?.key || '')
                }}
                error={formik.touched.itemSearchStyle && Boolean(formik.errors.itemSearchStyle)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.ITEM_SEARCH_FIELDS}
                name='itemSearchFields'
                label={_labels.itemSearchFields}
                valueField='key'
                displayField='value'
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('itemSearchFields', newValue?.key || '')
                }}
                error={formik.touched.itemSearchFields && Boolean(formik.errors.itemSearchFields)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='iv_minSerialSize'
                label={_labels.serial}
                value={formik.values.iv_minSerialSize}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('iv_minSerialSize', '')}
                error={formik.touched.iv_minSerialSize && Boolean(formik.errors.iv_minSerialSize)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='minItemSearchTextSize'
                label={_labels.minItemSearchTextSize}
                value={formik.values.minItemSearchTextSize}
                onChange={formik.handleChange}
                required
                onClear={() => formik.setFieldValue('minItemSearchTextSize', '')}
                error={formik.touched.minItemSearchTextSize && Boolean(formik.errors.minItemSearchTextSize)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default IvSettings
