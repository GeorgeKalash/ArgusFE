import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import useResourceParams from '@argus/shared-hooks/src/hooks/useResourceParams'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'

export default function ItemDetails({ plId, itemId, window }) {
  const { getRequest } = useContext(RequestsContext)
  const { labels, access: maxAccess } = useResourceParams({
    datasetId: ResourceIds.ItemDetails
  })
  useSetWindow({ title: labels.itemQuickView, window })

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      recordId: itemId,
      sku: '',
      name: '',
      weight: null,
      volume: null,
      qtyOnHand: null,
      currentCost: null,
      defaultSalePrice: null
    }
  })

  useEffect(() => {
    ;(async function () {
      if (!itemId) return 
      const res = await getRequest({
        extension: InventoryRepository.Item.quickView,
        parameters: `_itemId=${itemId}&_plId=${plId || 0}`
      })

      formik.setValues({
        ...res.record,
        currentCost: res?.record?.hideCost ? '**' : res?.record?.currentCost
      })
    })()
  }, [])

  return (
    <VertLayout>
      <Grow>
        <Grid container spacing={3} p={2}>
          <Grid item xs={12}>
            <CustomTextField name='sku' value={formik?.values?.sku} label={labels.sku} readOnly maxAccess={maxAccess}/>
          </Grid>
          <Grid item xs={12}>
            <CustomTextField name='name' value={formik?.values?.name} label={labels.name} readOnly maxAccess={maxAccess}/>
          </Grid>
          <Grid item xs={12}>
            <CustomTextField name='weight' value={formik?.values?.weight} label={labels.weight} readOnly maxAccess={maxAccess}/>
          </Grid>
          <Grid item xs={12}>
            <CustomTextField name='volume' value={formik?.values?.volume} label={labels.volume} readOnly maxAccess={maxAccess}/>
          </Grid>
          <Grid item xs={12}>
            <CustomTextField name='qtyOnHand' value={formik?.values?.qtyOnHand} label={labels.qtyOnHand} readOnly maxAccess={maxAccess}/>
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='currentCost'
              value={formik?.values?.currentCost}
              label={labels.currentCost}
              readOnly
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='defaultSalePrice'
              value={formik?.values?.defaultSalePrice}
              label={labels.defaultSalePrice}
              readOnly
              maxAccess={maxAccess}
            />
          </Grid>
        </Grid>
      </Grow>
    </VertLayout>
  )
}

ItemDetails.width = 700
ItemDetails.height = 500