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
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { FoundryRepository } from 'src/repositories/FoundryRepository'

export default function MetalSettingsForm({ labels, maxAccess, store, setStore, window }) {
  const { platformLabels } = useContext(ControlContext)
  const { recordId, metalColorId } = store
  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: FoundryRepository.MetalSettings.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      metalId: null,
      metalColorId: null,
      rate: '',
      stdLossRate: '',
      rmItemId: null,
      sfItemId: null,
      damageItemId: null
    },
    maxAccess,
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      metalId: yup.string().required(),
      metalColorId: yup.string().required(),
      rate: yup.number().required()
    }),
    onSubmit: async obj => {
      const res = await postRequest({
        extension: FoundryRepository.MetalSettings.set,
        record: JSON.stringify(obj)
      })

      
      if (!recordId) {
        toast.success(platformLabels.Added)
        formik.setFieldValue('recordId', obj.metalId)

        const res2 = await getRequest({
          extension: FoundryRepository.Scrap.qry,
          parameters: `_metalId=${formik.values?.metalId}&_metalColorId=${formik.values?.metalColorId}`
        })
        
        setStore(prevStore => ({
          ...prevStore,
          metalId: formik.values?.metalId,
          metalColorId: formik.values?.metalColorId,
          scrap: res2.list.map((item, index) => ({
            ...item,
            scrapItemId: item.scrapItemId,
            id: index + 1
          }))
        }))
        toast.success(platformLabels.Added)
      } else toast.success(platformLabels.Edited)

      invalidate()
      window.close()
    }
  })
  const editMode = !!recordId

  useEffect(() => {
    ;(async function () {
      if (recordId && metalColorId) {
        const res = await getRequest({
          extension: FoundryRepository.MetalSettings.get,
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
    <FormShell
      resourceId={ResourceIds.MetalSettings}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      isInfo={false}
    >
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
                onChange={(event, newValue) => {
                  formik.setFieldValue('metalId', newValue?.recordId)
                }}
                required
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
                required
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('metalColorId', newValue?.recordId)
                }}
                error={formik.touched.metalColorId && formik.errors.metalColorId}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='rate'
                label={labels.rate}
                value={formik.values?.rate}
                required
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('rate', '')}
                maxAccess={maxAccess}
                error={formik.touched.rate && Boolean(formik.errors.rate)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='stdLossRate'
                label={labels.stdLossRate}
                value={formik.values?.stdLossRate}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('stdLossRate', '')}
                maxAccess={maxAccess}
                error={formik.touched.stdLossRate && Boolean(formik.errors.stdLossRate)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={InventoryRepository.RMSKU.snapshot}
                name='rmItemId'
                label={labels.RMSKU}
                valueField='sku'
                displayField='name'
                valueShow='rmItemSku'
                secondValueShow='rmItemName'
                form={formik}
                onChange={(event, newValue) => {
                  formik.setFieldValue('rmItemId', newValue?.recordId)
                  formik.setFieldValue('rmItemSku', newValue?.sku)
                  formik.setFieldValue('rmItemName', newValue?.name)
                }}
                error={formik.touched.rmItemId && Boolean(formik.errors.rmItemId)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={InventoryRepository.SFSKU.snapshot}
                name='sfItemId'
                label={labels.SFSKU}
                valueField='sku'
                displayField='name'
                valueShow='sfItemSku'
                secondValueShow='sfItemName'
                form={formik}
                onChange={(event, newValue) => {
                  formik.setFieldValue('sfItemId', newValue?.recordId)
                  formik.setFieldValue('sfItemSku', newValue?.sku)
                  formik.setFieldValue('sfItemName', newValue?.name)
                }}
                error={formik.touched.sfItemId && Boolean(formik.errors.sfItemId)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={InventoryRepository.Item.snapshot}
                name='damageItemId'
                label={labels.DMSKU}
                valueField='sku'
                displayField='name'
                valueShow='damageItemSku'
                secondValueShow='damageItemName'
                form={formik}
                onChange={(event, newValue) => {
                  formik.setFieldValue('damageItemId', newValue?.recordId)
                  formik.setFieldValue('damageItemSku', newValue?.sku)
                  formik.setFieldValue('damageItemName', newValue?.name)
                }}
                error={formik.touched.damageItemId && Boolean(formik.errors.damageItemId)}
                maxAccess={maxAccess}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
