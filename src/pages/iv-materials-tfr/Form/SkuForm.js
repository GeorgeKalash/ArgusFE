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
import { InventoryRepository } from 'src/repositories/InventoryRepository'

export default function SkuForm({ labels, maxAccess, recordId, itemId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: DeliveryRepository.Vehicle.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: itemId,
      sku: '',
      name: '',
      weight: '',
      volume: '',
      qtyInHand: '',
      currentCost: '',
      defaultSalePrice: ''
    },
    maxAccess,
    enableReinitialize: true,
    validateOnChange: true
  })

  useEffect(() => {
    ;(async function () {
      if (itemId) {
        const res = await getRequest({
          extension: InventoryRepository.Item.get,
          parameters: `_recordId=${itemId}`
        })

        formik.setValues(res.record)
      }
    })()
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.MaterialsTransfer}
      form={formik}
      maxAccess={maxAccess}
      editMode={false}
      isSaved={false}
      isInfo={false}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <CustomTextField name='sku' value={formik?.values?.sku} label={labels.sku} readOnly />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField name='name' value={formik?.values?.name} label={labels.name} readOnly />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField name='weight' value={formik?.values?.weight} label={labels.weight} readOnly />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField name='volume' value={formik?.values?.volume} label={labels.volume} readOnly />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField name='qtyInHand' value={formik?.values?.qtyInHand} label={labels.qtyInHand} readOnly />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='currentCost'
                value={formik?.values?.currentCost}
                label={labels.currentCost}
                readOnly
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='defaultSalePrice'
                value={formik?.values?.defaultSalePrice}
                label={labels.defaultSalePrice}
                readOnly
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
