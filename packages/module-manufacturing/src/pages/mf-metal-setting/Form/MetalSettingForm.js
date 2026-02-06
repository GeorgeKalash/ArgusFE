import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ManufacturingRepository } from '@argus/repositories/src/repositories/ManufacturingRepository'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'

export default function MetalSettingsForm({ labels, maxAccess, record, recordId }) {
  const { platformLabels } = useContext(ControlContext)
  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: ManufacturingRepository.MetalSetting.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId,
      metalId: null,
      metalColorId: null,
      damageNonMetalItemId: null,
      damageMetalItemId: null
    },
    maxAccess,
    validationSchema: yup.object({
      damageNonMetalItemId: yup.number().required(),
      damageMetalItemId: yup.number().required(),
      metalId: yup.number().required(),
      metalColorId: yup.number().required()
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
      if (record && record.metalId && record.metalColorId && recordId) {
        const res = await getRequest({
          extension: ManufacturingRepository.MetalSetting.get,
          parameters: `_metalId=${record.metalId}&_metalColorId=${record.metalColorId}`
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
                required
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
                readOnly={editMode}
                onChange={async (_, newValue) => {
                  formik.setFieldValue('metalColorId', newValue?.recordId || null)
                }}
                error={formik.touched?.metalColorId && Boolean(formik.errors?.metalColorId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={InventoryRepository.Item.snapshot}
                name='damageMetalItemId'
                label={labels.damageItem}
                valueField='sku'
                displayField='name'
                valueShow='damageMetalItemSku'
                secondValueShow='damageMetalItemName'
                columnsInDropDown={[
                  { key: 'sku', value: 'SKU' },
                  { key: 'name', value: 'Item Name', grid: 3 }
                ]}
                form={formik}
                displayFieldWidth={2}
                required
                onChange={(_, newValue) => {
                  formik.setFieldValue('damageMetalItemSku', newValue?.sku || '')
                  formik.setFieldValue('damageMetalItemName', newValue?.name || '')

                  formik.setFieldValue('damageMetalItemId', newValue?.recordId || null)
                }}
                error={formik.touched.damageMetalItemId && Boolean(formik.errors.damageMetalItemId)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={InventoryRepository.Item.snapshot}
                name='damageNonMetalItemId'
                label={labels.damageNonMetalItem}
                valueField='sku'
                displayField='name'
                valueShow='damageNonMetalItemSku'
                secondValueShow='damageNonMetalItemName'
                form={formik}
                displayFieldWidth={2}
                columnsInDropDown={[
                  { key: 'sku', value: 'SKU' },
                  { key: 'name', value: 'Item Name', grid: 3 }
                ]}
                required
                onChange={(_, newValue) => {
                  formik.setFieldValue('damageNonMetalItemSku', newValue?.sku || '')
                  formik.setFieldValue('damageNonMetalItemName', newValue?.name || '')

                  formik.setFieldValue('damageNonMetalItemId', newValue?.recordId || null)
                }}
                error={formik.touched.damageNonMetalItemId && Boolean(formik.errors.damageNonMetalItemId)}
                maxAccess={maxAccess}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
