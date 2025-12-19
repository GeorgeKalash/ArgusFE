import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { ControlContext } from 'src/providers/ControlContext'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'

export default function MetalSettingsForm({ labels, maxAccess, metalId, metalColorId }) {
  const { platformLabels } = useContext(ControlContext)
  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: ManufacturingRepository.MetalSetting.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      metalId: null,
      metalColorId: null,
      damageNonMetalId: null,
      damageItemId: null
    },
    maxAccess,
    validationSchema: yup.object({
      damageNonMetalId: yup.number().required(),
      damageItemId: yup.number().required()
    }),
    onSubmit: async obj => {
      await postRequest({
        extension: ManufacturingRepository.MetalSetting.set,
        record: JSON.stringify(obj)
      })

      if (!obj.recordId) {
        formik.setFieldValue('recordId', String(obj.metalId * 10) + String(obj.metalColorId))
      }
      toast.success(!obj.recordId ? platformLabels.Added : platformLabels.Edited)

      invalidate()
    }
  })
  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (metalId && metalColorId) {
        const res = await getRequest({
          extension: ManufacturingRepository.MetalSetting.get,
          parameters: `_metalId=${metalId}&_metalColorId=${metalColorId}`
        })

        formik.setValues({
          ...res.record,
          recordId: String(res?.record?.metalId * 10) + String(res?.record?.metalColorId)
        })
      }
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.MetalSetting} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={InventoryRepository.Metals.qry}
                name='metalId'
                label={labels.metal}
                valueField='recordId'
                displayField={'reference'}
                readOnly={editMode}
                values={formik.values}
                onChange={(_, newValue) => formik.setFieldValue('metalId', newValue?.recordId || null)}
                error={formik.touched.metalId && Boolean(formik.errors.metalId)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={InventoryRepository.MetalColor.qry}
                name='metalColorId'
                required
                label={labels.metalColor}
                valueField='recordId'
                displayField={'reference'}
                values={formik.values}
                maxAccess={maxAccess}
                onChange={async (_, newValue) => {
                  formik.setFieldValue('metalColorId', newValue?.recordId || null)
                }}
                error={formik.touched?.metalColorId && Boolean(formik.errors?.metalColorId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={InventoryRepository.Item.snapshot}
                name='damageItemId'
                label={labels.damageItem}
                valueField='sku'
                displayField='name'
                valueShow='damageItemSku'
                secondValueShow='damageItemName'
                form={formik}
                required
                onChange={(_, newValue) => {
                  formik.setFieldValue('damageItemSku', newValue?.sku || '')
                  formik.setFieldValue('damageItemName', newValue?.name || '')

                  formik.setFieldValue('damageItemId', newValue?.recordId || null)
                }}
                error={formik.touched.damageItemId && Boolean(formik.errors.damageItemId)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={InventoryRepository.Metals.qry}
                name='damageNonMetalId'
                label={labels.damageNonMetalItem}
                valueField='recordId'
                displayField='reference'
                values={formik.values}
                maxAccess={maxAccess}
                required
                onChange={(_, newValue) => {
                  formik.setFieldValue('damageNonMetalId', newValue?.recordId || null)
                }}
                error={formik.touched.damageNonMetalId && Boolean(formik.errors.damageNonMetalId)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
