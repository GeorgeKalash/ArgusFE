import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { useForm } from 'src/hooks/form'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { ControlContext } from 'src/providers/ControlContext'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { useInvalidate } from 'src/hooks/resource'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import { InventoryRepository } from 'src/repositories/InventoryRepository'

export default function ComponentForm({ labels, maxAccess, recordId, seqNo, bomId, msId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: ManufacturingRepository.Component.qry
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      costTypeId: null,
      bomId,
      itemId: null,
      qty: null,
      muId: null,
      msId,
      currentCost: 0,
      seqNo,
      variationLimit: null
    },
    validateOnChange: false,
    validationSchema: yup.object({
      itemId: yup.string().required(),
      qty: yup.number().required()
    }),
    onSubmit: async obj => {
      const data = {
        ...obj,
        baseQty: obj.qty
      }
      await postRequest({
        extension: ManufacturingRepository.Component.set,
        record: JSON.stringify(data)
      }).then(res => {
        if (!obj.recordId) {
          toast.success(platformLabels.Added)
          formik.setFieldValue('recordId', res.recordId)
        } else {
          toast.success(platformLabels.Edited)
        }
        invalidate()
      })
    }
  })
  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: ManufacturingRepository.Component.get,
          parameters: `_bomId=${recordId}&_seqNo=${seqNo}`
        })

        const unitCost = res.record?.itemId && (await getUnitCost(res.record?.itemId))

        formik.setValues({
          ...res.record,
          currentCost: unitCost ?? 0
        })
      }
    })()
  }, [])

  const getUnitCost = async itemId => {
    if (itemId) {
      const res = await getRequest({
        extension: InventoryRepository.Cost.get,
        parameters: '_itemId=' + itemId
      })

      return res?.record?.currentCost
    }
  }

  return (
    <FormShell
      resourceId={ResourceIds.BillOfMaterials}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      isInfo={false}
      isCleared={false}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={InventoryRepository.RMSKU.snapshot}
                name='itemId'
                label={labels?.sku}
                valueField='recordId'
                displayField='sku'
                valueShow='sku'
                secondValueShow='itemName'
                form={formik}
                columnsInDropDown={[
                  { key: 'sku', value: 'SKU' },
                  { key: 'name', value: 'Name' }
                ]}
                onChange={async (event, newValue) => {
                  formik.setFieldValue('itemId', newValue?.recordId)
                  formik.setFieldValue('itemName', newValue?.name)
                  formik.setFieldValue('sku', newValue?.sku)
                  formik.setFieldValue('msId', newValue?.msId)
                  const unitCost = (await getUnitCost(newValue?.recordId)) ?? 0
                  formik.setFieldValue('currentCost', unitCost)
                }}
                maxAccess={maxAccess}
                errorCheck={'itemId'}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={InventoryRepository.MeasurementUnit.qry}
                parameters={formik?.values?.msId ? `_msId=${formik?.values?.msId}` : ''}
                name='muId'
                readOnly={!formik?.values?.msId}
                label={labels.measurementUnit}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('muId', newValue?.recordId || null)
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={InventoryRepository.Site.qry}
                name='siteId'
                label={labels.site}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                valueField='recordId'
                displayField={['reference', 'name']}
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('siteId', newValue?.recordId)
                }}
                error={formik.touched.siteId && Boolean(formik.errors.siteId)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='qty'
                required
                label={labels.qty}
                value={formik?.values?.qty}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('qty', 0)}
                error={formik.touched.qty && Boolean(formik.errors.qty)}
                decimalScale={5}
                maxLength={12}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='variationLimit'
                label={labels.variationLimit}
                value={formik?.values?.variationLimit}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                decimalScale={2}
                maxLength={5}
                onClear={() => formik.setFieldValue('variationLimit', 0)}
                error={formik.touched.variationLimit && Boolean(formik.errors.variationLimit)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='currentCost'
                label={labels.currentCost}
                value={formik?.values?.currentCost}
                maxAccess={maxAccess}
                readOnly
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
