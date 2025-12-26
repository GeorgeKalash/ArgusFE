import { useEffect, useContext } from 'react'
import { Grid } from '@mui/material'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import Form from '@argus/shared-ui/src/components/Shared/Form'

const LoDefault = ({ _labels, access }) => {
  const { postRequest } = useContext(RequestsContext)
  const { platformLabels, defaultsData, updateDefaults } = useContext(ControlContext)

  const arrayAllow = ['transitSiteId', 'lo_min_car_amount']

  useEffect(() => {
    const myObject = {}
    defaultsData.list.forEach(obj => {
      if (arrayAllow.includes(obj.key)) {
        myObject[obj.key] = obj.value ? parseFloat(obj.value) : null
        formik.setFieldValue(obj.key, myObject[obj.key])
      }
    })
  }, [defaultsData])

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
      updateDefaults(data)
      toast.success(platformLabels.Edited)
    }
  })

  return (
    <Form onSave={formik.handleSubmit} maxAccess={access} isParentWindow={false}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2} sx={{ p: 2 }}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={InventoryRepository.Site.qry}
                name='transitSiteId'
                label={_labels.carrierSite}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                valueField='recordId'
                displayField='name'
                maxAccess={access}
                onChange={(event, newValue) => {
                  formik.setFieldValue('transitSiteId', newValue?.recordId || null)
                }}
                error={formik.touched.transitSiteId && Boolean(formik.errors.transitSiteId)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='lo_min_car_amount'
                onChange={e => formik.setFieldValue('lo_min_car_amount', e?.target?.value)}
                onClear={() => formik.setFieldValue('lo_min_car_amount', null)}
                label={_labels.mca}
                value={formik.values.lo_min_car_amount}
                error={formik.touched.lo_min_car_amount && Boolean(formik.errors.lo_min_car_amount)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default LoDefault
