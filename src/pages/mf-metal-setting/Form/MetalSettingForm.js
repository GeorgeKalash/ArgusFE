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
import { FoundryRepository } from 'src/repositories/FoundryRepository'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'

export default function MetalSettingsForm({ labels, maxAccess, recordId, metalColorId }) {
  const { platformLabels } = useContext(ControlContext)
  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: FoundryRepository.MetalSettings.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      metalId: null,
      metalColorId: null,
      damageNonMetalItemId: null,
      damageItemId: null
    },
    maxAccess,
    validationSchema: yup.object({
      damageNonMetalItemId: yup.number().required(),
      damageItemId: yup.number().required()
    }),
    onSubmit: async obj => {
      await postRequest({
        extension: ManufacturingRepository.MetalSetting.set,
        record: JSON.stringify(obj)
      })

      if (!obj.recordId) {
        formik.setFieldValue('recordId', obj.metalId)
      }
      toast.success(!obj.recordId ? platformLabels.Added : platformLabels.Edited)

      invalidate()
    }
  })
  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (recordId && metalColorId) {
        const res = await getRequest({
          extension: ManufacturingRepository.MetalSetting.get,
          parameters: `_metalId=${recordId}&_metalColorId=${metalColorId}`
        })

        formik.setValues({
          ...res.record,
          recordId: res.record.metalId
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
                endpointId={InventoryRepository.Items.pack}
                values={formik.values}
                reducer={response => {
                  return response?.record?.metalColors
                }}
                name='metalColorId'
                label={labels.metalColor}
                readOnly={editMode}
                valueField='recordId'
                displayField='reference'
                displayFieldWidth={1}
                maxAccess={maxAccess}
                onChange={(_, newValue) => formik.setFieldValue('metalColorId', newValue?.recordId || null)}
                error={formik.touched.metalColorId && formik.errors.metalColorId}
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
                  formik.setFieldValue('damageItemId', newValue?.recordId || null)
                  formik.setFieldValue('damageItemSku', newValue?.sku || '')
                  formik.setFieldValue('damageItemName', newValue?.name || '')
                }}
                error={formik.touched.damageItemId && Boolean(formik.errors.damageItemId)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={InventoryRepository.Metals.qry}
                name='damageNonMetalItemId'
                label={labels.damageNonMetalItem}
                valueField='recordId'
                displayField='reference'
                values={formik.values}
                maxAccess={maxAccess}
                required
                onChange={(_, newValue) => {
                  formik.setFieldValue('damageNonMetalItemId', newValue?.recordId || '')
                }}
                error={formik.touched.damageNonMetalItemId && Boolean(formik.errors.damageNonMetalItemId)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
