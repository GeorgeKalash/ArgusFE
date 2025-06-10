import { useEffect, useContext, useState } from 'react'
import { Grid } from '@mui/material'
import { useFormik } from 'formik'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useResourceQuery } from 'src/hooks/resource'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import FormShell from 'src/components/Shared/FormShell'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'
import toast from 'react-hot-toast'

const IomProperties = () => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels, defaultsData, updateDefaults } = useContext(ControlContext)
  const [propertyStore, setPropertyStore] = useState([])

  const { labels, access } = useResourceQuery({
    datasetId: ResourceIds.IomProperties
  })

  const formik = useFormik({
    initialValues: {
      mfimd1: null,
      mfimd2: null
    },
    onSubmit: async obj => {
      const data = Object.entries(obj).map(([key, value]) => ({ key, value }))

      await postRequest({
        extension: SystemRepository.Defaults.set,
        record: JSON.stringify({ sysDefaults: data })
      })

      toast.success(platformLabels.Edited)
      updateDefaults(data)
    }
  })

  useEffect(() => {
    ;(async function () {
      const dimensions = await getRequest({
        extension: SystemRepository.Defaults.qry,
        parameters: `_filter=ivtDimension`
      })

      const items = (dimensions?.list || [])
        .filter(item => item.value !== '')
        .map(item => {
          const match = item.key?.match(/^ivtDimension(\d{1,2})$/)
          if (match) {
            return {
              ...item,
              recordId: parseInt(match[1]),
              name: item.value
            }
          }

          return item
        })

      setPropertyStore(items || [])
    })()
  }, [])

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
  }, [propertyStore])

  return (
    <FormShell
      resourceId={ResourceIds.IomProperties}
      form={formik}
      maxAccess={access}
      infoVisible={false}
      isSavedClear={false}
      isCleared={false}
    >
      <VertLayout>
        <Grow>
          <Grid container>
            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <CustomComboBox
                    store={propertyStore}
                    name='mfimd1'
                    label={labels.property1}
                    valueField='recordId'
                    displayField='name'
                    value={formik.values.mfimd1}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('mfimd1', newValue?.recordId || null)
                    }}
                    error={formik.touched.mfimd1 && Boolean(formik.errors.mfimd1)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomComboBox
                    store={propertyStore}
                    name='mfimd2'
                    label={labels.property2}
                    valueField='recordId'
                    displayField='name'
                    value={formik.values.mfimd2}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('mfimd2', newValue?.recordId || null)
                    }}
                    error={formik.touched.mfimd2 && Boolean(formik.errors.mfimd2)}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default IomProperties
