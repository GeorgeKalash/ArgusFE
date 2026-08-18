import { useEffect, useContext } from 'react'
import { Grid } from '@mui/material'
import toast from 'react-hot-toast'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import Form from '@argus/shared-ui/src/components/Shared/Form'
import { DefaultsContext } from '@argus/shared-providers/src/providers/DefaultsContext'

const ProdPlanningDefaultsForm = ({ _labels, access }) => {
  const { platformLabels } = useContext(ControlContext)
  const { systemDefaults, updateSystemDefaults } = useContext(DefaultsContext)
  const { postRequest } = useContext(RequestsContext)

  const arrayAllow = ['pp_lt_sales_benchmark', 'pp_st_sales_benchmark', 'pp_ni_sales_benchmark']

  const { formik } = useForm({
    maxAccess: access,
    initialValues: arrayAllow.reduce((acc, key) => ({ ...acc, [key]: null }), {}),
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
      updateSystemDefaults(data)
      toast.success(platformLabels.Edited)
    }
  })

  useEffect(() => {
    systemDefaults?.list?.forEach(obj => {
      if (arrayAllow.includes(obj.key)) {
        formik.setFieldValue(obj.key, obj.value ? parseFloat(obj.value) : null)
      }
    })
  }, [systemDefaults])

  return (
    <Form onSave={formik.handleSubmit} maxAccess={access}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomNumberField
                name='pp_lt_sales_benchmark'
                label={_labels.pp_lt_sales_benchmark}
                value={formik.values.pp_lt_sales_benchmark}
                onChange={formik.handleChange}
                maxAccess={access}
                onClear={() => formik.setFieldValue('pp_lt_sales_benchmark', '')}
                error={formik.touched.pp_lt_sales_benchmark && Boolean(formik.errors.pp_lt_sales_benchmark)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='pp_st_sales_benchmark'
                label={_labels.pp_st_sales_benchmark}
                value={formik.values.pp_st_sales_benchmark}
                onChange={formik.handleChange}
                maxAccess={access}
                onClear={() => formik.setFieldValue('pp_st_sales_benchmark', '')}
                error={formik.touched.pp_st_sales_benchmark && Boolean(formik.errors.pp_st_sales_benchmark)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='pp_ni_sales_benchmark'
                label={_labels.pp_ni_sales_benchmark}
                value={formik.values.pp_ni_sales_benchmark}
                onChange={formik.handleChange}
                maxAccess={access}
                onClear={() => formik.setFieldValue('pp_ni_sales_benchmark', '')}
                error={formik.touched.pp_ni_sales_benchmark && Boolean(formik.errors.pp_ni_sales_benchmark)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default ProdPlanningDefaultsForm