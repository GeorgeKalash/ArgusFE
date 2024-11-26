import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import FormShell from 'src/components/Shared/FormShell'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { useForm } from 'src/hooks/form'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { InventoryRepository } from 'src/repositories/InventoryRepository'

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
    enableReinitialize: true,
    validateOnChange: true
  })

  useEffect(() => {
    ;(async function () {
      if (itemId) {
        const res = await getRequest({
          extension: InventoryRepository.Item.quickView,
          parameters: `_itemId=${itemId}&_plId=${plId}`
        })

        formik.setValues({
          ...res.record,
          currentCost: res?.record?.hideCost ? '**' : res?.record?.currentCost,
          defaultSalePrice: res?.record?.defaultSalePrice
        })
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
      isCleared={false}
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
                disabled={!formik?.values?.defaultSalePrice}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
