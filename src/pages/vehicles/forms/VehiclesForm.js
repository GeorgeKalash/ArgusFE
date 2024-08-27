import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { DeliveryRepository } from 'src/repositories/DeliveryRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SystemRepository } from 'src/repositories/SystemRepository'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { PurchaseRepository } from 'src/repositories/PurchaseRepository'

export default function VehiclesForm({ labels, maxAccess, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: DeliveryRepository.Vehicle.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      plateNo: '',
      name: '',
      capacityVolume: '',
      capacityWeight: '',
      plantId: ''
    },
    maxAccess,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      name: yup.string().required(),
      plateNo: yup.string().required(),
      capacityVolume: yup.number().required(),
      capacityWeight: yup.number().required()
    }),
    onSubmit: async obj => {
      try {
        const response = await postRequest({
          extension: DeliveryRepository.Vehicle.set,
          record: JSON.stringify(obj)
        })

        if (!obj.recordId) {
          toast.success(platformLabels.Added)
          formik.setFieldValue('recordId', response.recordId)
        } else toast.success(platformLabels.Edited)

        invalidate()
      } catch (error) {}
    }
  })

  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      try {
        if (recordId) {
          const res = await getRequest({
            extension: DeliveryRepository.Vehicle.get,
            parameters: `_recordId=${recordId}`
          })

          formik.setValues(res.record)
        }
      } catch (exception) {}
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.Vehicle} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <CustomTextField
                name='name'
                label={labels.name}
                value={formik.values.name}
                required
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('name', '')}
                error={formik.touched.name && Boolean(formik.errors.name)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='plateNo'
                label={labels.plateNo}
                value={formik.values.plateNo}
                required
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('plateNo', '')}
                error={formik.touched.plateNo && Boolean(formik.errors.plateNo)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='capacityVolume'
                required
                label={labels.capacityVolume}
                value={formik.values.capacityVolume}
                maxAccess={maxAccess}
                onChange={e => formik.setFieldValue('capacityVolume', e.target.value)}
                onClear={() => formik.setFieldValue('capacityVolume', '')}
                error={formik.touched.capacityVolume && Boolean(formik.errors.capacityVolume)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='capacityWeight'
                required
                label={labels.capacityWeight}
                value={formik.values.capacityWeight}
                maxAccess={maxAccess}
                onChange={e => formik.setFieldValue('capacityWeight', e.target.value)}
                onClear={() => formik.setFieldValue('capacityWeight', '')}
                error={formik.touched.capacityWeight && Boolean(formik.errors.capacityWeight)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.Plant.qry}
                name='plantId'
                label={labels.plant}
                valueField='recordId'
                displayField='name'
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('plantId', newValue ? newValue?.recordId : '')
                }}
                error={formik.touched.plantId && Boolean(formik.errors.recordId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={PurchaseRepository.Vendor.qry}
                parameters={`_startAt=0&_pageSize=50&_params=&_sortField=`}
                name='vendorId'
                label={labels.vendor}
                valueField='recordId'
                displayField='name'
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('vendorId', newValue ? newValue?.recordId : '')
                }}
                error={formik.touched.vendorId && Boolean(formik.errors.vendorId)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}