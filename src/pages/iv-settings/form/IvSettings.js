import { useEffect, useContext } from 'react'
import { Grid } from '@mui/material'
import toast from 'react-hot-toast'
import FormShell from 'src/components/Shared/FormShell'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { DataSets } from 'src/resources/DataSets'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import * as yup from 'yup'
import { useForm } from 'src/hooks/form'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { RequestsContext } from 'src/providers/RequestsContext'
import Form from 'src/components/Shared/Form'

const IvSettings = ({ _labels, access }) => {
  const { platformLabels, defaultsData, updateDefaults } = useContext(ControlContext)
  const { postRequest } = useContext(RequestsContext)

  const arrayAllow = ['itemSearchStyle', 'itemSearchFields', 'iv_minSerialSize']

  const { formik } = useForm({
    maxAccess: access,
    initialValues: arrayAllow.reduce((acc, key) => ({ ...acc, [key]: null }), {}),
    validationSchema: yup.object({
      iv_minSerialSize: yup.number().min(1).max(20).nullable()
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
          <Grid container spacing={4}>
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
          </Grid>
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default IvSettings
