import { useEffect, useContext } from 'react'
import { Grid } from '@mui/material'
import { useFormik } from 'formik'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { useResourceQuery } from 'src/hooks/resource'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import FormShell from 'src/components/Shared/FormShell'

const SystemDefaults = () => {
  const { postRequest } = useContext(RequestsContext)
  const { platformLabels, defaultsData } = useContext(ControlContext)

  const { labels, access } = useResourceQuery({
    datasetId: ResourceIds.SystemDefaults
  })

  const formik = useFormik({
    initialValues: {
      mfimd1: null,
      mfimd2: null
    },
    onSubmit: values => {}
  })

  useEffect(() => {
    const keys = ['mfimd1', 'mfimd2']

    const myObject =
      defaultsData?.list?.reduce((acc, obj) => {
        if (keys.includes(obj.key)) {
          acc[obj.key] = obj.value ? parseInt(obj.value) : null
        }

        return acc
      }, {}) || {}

    formik.setValues(myObject)
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.SystemDefaults}
      form={formik}
      maxAccess={access}
      infoVisible={false}
      isSavedClear={false}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={5} lg={5}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.Currency.qry}
                name='mfimd1'
                label={labels.property1}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                required
                values={formik.values}
                valueField='recordId'
                displayField='name'
                maxAccess={access}
                onChange={(event, newValue) => {
                  formik.setFieldValue('mfimd1', newValue?.recordId || null)
                }}
                error={formik.touched.mfimd1 && Boolean(formik.errors.mfimd1)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.Country.qry}
                name='mfimd2'
                label={labels.property2}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                valueField='recordId'
                displayField='name'
                maxAccess={access}
                onChange={(event, newValue) => {
                  formik.setFieldValue('mfimd2', newValue?.recordId || null)
                }}
                error={formik.touched.mfimd2 && Boolean(formik.errors.mfimd2)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default SystemDefaults
