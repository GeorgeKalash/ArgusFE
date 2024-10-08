import { Grid } from '@mui/material'
import * as yup from 'yup'
import { useContext, useEffect } from 'react'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { Checkbox, FormControlLabel } from '@mui/material'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { ControlContext } from 'src/providers/ControlContext'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { useInvalidate } from 'src/hooks/resource'

export default function BarcodesForm({ labels, access, recordId, barcode }) {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: InventoryRepository.Barcodes.qry
  })

  const { formik } = useForm({
    initialValues: {
      recordId: recordId,
      itemId: recordId,
      sku: null,
      defaultQty: null,
      muId: null,
      scaleDescription: null,
      posDescription: null,
      barcode: barcode,
      isInactive: false
    },
    enableReinitialize: false,
    maxAccess: access,
    validateOnChange: true,
    validationSchema: yup.object({
      sku: yup.string().required(),
      barcode: yup.string().required()
    }),
    onSubmit: async obj => {
      const response = await postRequest({
        extension: InventoryRepository.Barcodes.set,
        record: JSON.stringify(obj)
      })

      if (!obj.recordId) {
        toast.success(platformLabels.Added)
        formik.setFieldValue('recordId', response.recordId)
      } else toast.success(platformLabels.Edited)

      invalidate()
    }
  })

  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (barcode) {
        const res = await getRequest({
          extension: InventoryRepository.Barcodes.get,
          parameters: `_barcode=${barcode}`
        })
        formik.setValues(res.record)
      }
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.Barcodes} form={formik} maxAccess={access} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <CustomTextField
                name='barcode'
                label={labels?.barcode}
                value={formik.values.barcode}
                required
                maxLength='20'
                maxAccess={access}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('barcode', '')}
                error={formik.touched.barcode && Boolean(formik.errors.barcode)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={InventoryRepository.Item.snapshot}
                name='itemId'
                label={labels?.sku}
                valueField='recordId'
                displayField='sku'
                valueShow='itemRef'
                secondValueShow='itemName'
                form={formik}
                columnsInDropDown={[
                  { key: 'sku', value: 'SKU' },
                  { key: 'name', value: 'Name' }
                ]}
                onChange={(event, newValue) => {
                  formik.setFieldValue('itemId', newValue?.recordId)
                  formik.setFieldValue('itemName', newValue?.name)
                  formik.setFieldValue('sku', newValue?.sku)
                  formik.setFieldValue('itemRef', newValue?.sku)
                }}
                maxAccess={access}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={InventoryRepository.MeasurementUnit.qry}
                parameters={`_msId=${recordId}`}
                name='muId'
                label={labels?.measurementUnit}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('muId', newValue?.recordId)
                }}
                error={formik.touched.muId && Boolean(formik.errors.muId)}
                maxAccess={access}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='defaultQty'
                label={labels?.defaultQty}
                value={formik?.values?.defaultQty}
                maxAccess={access}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('defaultQty', '')}
                error={formik.touched.defaultQty && Boolean(formik.errors.defaultQty)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='scaleDescription'
                label={labels?.scaleDescription}
                value={formik.values.scaleDescription}
                maxAccess={access}
                maxLength='20'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('scaleDescription', '')}
                error={formik.touched.scaleDescription && Boolean(formik.errors.scaleDescription)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='posDescription'
                label={labels?.posDescription}
                value={formik.values.posDescription}
                maxAccess={access}
                maxLength='25'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('posDescription', '')}
                error={formik.touched.posDescription && Boolean(formik.errors.posDescription)}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name='isInactive'
                    maxAccess={access}
                    checked={formik.values?.isInactive}
                    onChange={formik.handleChange}
                  />
                }
                label={labels?.isInactive}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
