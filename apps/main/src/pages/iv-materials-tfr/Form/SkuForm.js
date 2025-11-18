import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import { RequestsContext } from '@argus/shared-providers/providers/RequestsContext'
import CustomTextField from '@argus/shared-ui/components/Inputs/CustomTextField'
import { useForm } from '@argus/shared-hooks/hooks/form'
import { VertLayout } from '@argus/shared-ui/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/components/Layouts/Grow'
import { InventoryRepository } from '@argus/repositories/repositories/InventoryRepository'

export default function SkuForm({ labels, maxAccess, plId, itemId }) {
  const { getRequest } = useContext(RequestsContext)

  const { formik } = useForm({
    initialValues: {
      recordId: itemId,
      sku: '',
      name: '',
      weight: '',
      volume: '',
      qtyOnHand: '',
      currentCost: '',
      defaultSalePrice: ''
    },
    maxAccess,
    validateOnChange: true
  })

  useEffect(() => {
    ;(async function () {
      if (itemId) {
        const res = await getRequest({
          extension: InventoryRepository.Item.quickView,
          parameters: `_itemId=${itemId}&_plId=${plId || 0}`
        })

        formik.setValues({
          ...res.record,
          currentCost: res?.record?.hideCost ? '**' : res?.record?.currentCost
        })
      }
    })()
  }, [])

  return (
    <VertLayout>
      <Grow>
        <Grid container spacing={4} p={2}>
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
            <CustomTextField name='qtyOnHand' value={formik?.values?.qtyOnHand} label={labels.qtyOnHand} readOnly />
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
  )
}
