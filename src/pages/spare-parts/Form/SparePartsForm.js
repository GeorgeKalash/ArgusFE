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
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { ControlContext } from 'src/providers/ControlContext'
import { RepairAndServiceRepository } from 'src/repositories/RepairAndServiceRepository'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { PurchaseRepository } from 'src/repositories/PurchaseRepository'
import CustomCheckBox from 'src/components/Inputs/CustomCheckBox'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { InventoryRepository } from 'src/repositories/InventoryRepository'

export default function SparePartsForm({ labels, maxAccess, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: RepairAndServiceRepository.SpareParts.page
  })

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      recordId: null,
      partNo: null,
      name: '',
      categoryId: null,
      vendorId: null,
      manufacturerId: null,
      vendorPartNo: null,
      barcode: null,
      trackInventory: false,
      itemId: null
    },
    validationSchema: yup.object({
      name: yup.string().required(),
      partNo: yup.number().required(),
      vendorPartNo: yup.number().nullable(),
      itemId: yup
        .number()
        .nullable()
        .when('trackInventory', {
          is: true,
          then: schema => schema.required(),
          otherwise: schema => schema.nullable()
        })
    }),
    onSubmit: async obj => {
      const response = await postRequest({
        extension: RepairAndServiceRepository.SpareParts.set,
        record: JSON.stringify(obj)
      })

      toast.success(!obj.recordId ? platformLabels.Added : platformLabels.Edited)
      formik.setFieldValue('recordId', response.recordId)

      invalidate()
    }
  })
  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: RepairAndServiceRepository.SpareParts.get,
          parameters: `_recordId=${recordId}`
        })

        formik.setValues(res.record)
      }
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.SpareParts} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomNumberField
                name='partNo'
                label={labels.partNo}
                value={formik?.values?.partNo}
                maxAccess={maxAccess}
                maxLength={24}
                required
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('partNo', null)}
                error={formik.touched.partNo && Boolean(formik.errors.partNo)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='name'
                label={labels.name}
                value={formik.values.name}
                required
                maxAccess={maxAccess}
                maxLength='50'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('name', '')}
                error={formik.touched.name && Boolean(formik.errors.name)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={RepairAndServiceRepository.SparePartsCategory.qry}
                name='categoryId'
                label={labels.categoryId}
                values={formik.values}
                valueField='recordId'
                displayField='name'
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('categoryId', newValue?.recordId || null)
                }}
                error={formik.touched.categoryId && Boolean(formik.errors.categoryId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={PurchaseRepository.Vendor.qry}
                parameters={`_sortField=reference&_params=&_startAt=0&_pageSize=1000`}
                name='vendorId'
                label={labels.vendorId}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                valueField='recordId'
                displayField={['reference', 'name']}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('vendorId', newValue?.recordId || null)
                }}
                error={formik.touched.vendorId && Boolean(formik.errors.vendorId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={RepairAndServiceRepository.Manufacturer.qry}
                name='manufacturerId'
                label={labels.manufacturerId}
                values={formik.values}
                valueField='recordId'
                displayField='name'
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('manufacturerId', newValue?.recordId || null)
                }}
                error={formik.touched.manufacturerId && Boolean(formik.errors.manufacturerId)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='vendorPartNo'
                label={labels.vendorPartNo}
                value={formik?.values?.vendorPartNo}
                maxAccess={maxAccess}
                maxLength={24}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('vendorPartNo', '')}
                error={formik.touched.vendorPartNo && Boolean(formik.errors.vendorPartNo)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='barcode'
                label={labels.barcode}
                value={formik?.values?.barcode}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('barcode', '')}
                error={formik.touched.barcode && Boolean(formik.errors.barcode)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomCheckBox
                name='trackInventory'
                value={formik.values?.trackInventory}
                onChange={event => formik.setFieldValue('trackInventory', event.target.checked)}
                label={labels.trackInventory}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={InventoryRepository.Item.snapshot}
                name='itemId'
                label={labels.sku}
                valueField='sku'
                displayField='name'
                readOnly={!formik.values.trackInventory}
                required={formik.values.trackInventory}
                valueShow='sku'
                secondValueShow='itemName'
                form={formik}
                columnsInDropDown={[
                  { key: 'sku', value: 'SKU' },
                  { key: 'name', value: 'Name' }
                ]}
                onChange={(event, newValue) => {
                  formik.setFieldValue('itemId', newValue?.recordId || null)
                  formik.setFieldValue('itemName', newValue?.name || '')
                  formik.setFieldValue('sku', newValue?.sku || '')
                }}
                errorCheck={'itemId'}
                maxAccess={maxAccess}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
