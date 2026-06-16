import { useEffect, useContext } from 'react'
import { Grid } from '@mui/material'
import toast from 'react-hot-toast'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import Form from '@argus/shared-ui/src/components/Shared/Form'
import { DefaultsContext } from '@argus/shared-providers/src/providers/DefaultsContext'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'

const BtDefaults = ({ _labels, access }) => {
  const { platformLabels } = useContext(ControlContext)
  const { systemDefaults, updateSystemDefaults } = useContext(DefaultsContext)
  const { postRequest } = useContext(RequestsContext)

  const arrayAllow = ['fixing_msId']

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
  ;(async function () {
    const myObject = {}

    systemDefaults?.list?.forEach(obj => {
      if (arrayAllow.includes(obj.key)) {
        const parsedValue = obj.value ? parseFloat(obj.value) : null
        myObject[obj.key] = parsedValue
      }
    })

    formik.resetForm({ values: myObject })
  })()
  }, [systemDefaults])

  return (
    <Form onSave={formik.handleSubmit} maxAccess={access}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={InventoryRepository.Measurement.qry}
                parameters='_name='
                name='fixing_msId'
                label={_labels.measurementSchedule}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                onChange={(_, newValue) => {
                  formik.setFieldValue('fixing_msId', newValue?.recordId || '')
                }}
                error={formik.touched.fixing_msId && Boolean(formik.errors.fixing_msId)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default BtDefaults
