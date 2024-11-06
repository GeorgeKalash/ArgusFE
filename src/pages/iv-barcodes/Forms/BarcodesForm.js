import { Grid } from '@mui/material'
import * as yup from 'yup'
import { useContext, useEffect, useRef } from 'react'
import FormShell from 'src/components/Shared/FormShell'
import ImageUpload from 'src/components/Inputs/ImageUpload'
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
import { useBarcodeFieldBehaviours } from 'src/hooks/useBarcodeFieldBehaviours'

export default function BarcodesForm({ labels, access, store, recordId, msId }) {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: InventoryRepository.Barcodes.qry
  })

  const { maxAccess, changeDT } = useBarcodeFieldBehaviours({
    access: access,
    editMode: false,
    fieldName: 'barcode',
    store
  })

  const imageUploadRef = useRef(null)

  const { formik } = useForm({
    initialValues: {
      recordId: recordId,
      itemId: recordId || store?.recordId,
      sku: store?._reference,
      defaultQty: '',
      itemName: store?._name,
      muId: null,
      msId: msId,
      scaleDescription: null,
      posDescription: null,
      barcode: null,
      isInactive: false
    },
    enableReinitialize: false,
    maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      itemId: yup.string().required()
    }),
    onSubmit: async values => {
      const res = await postRequest({
        extension: InventoryRepository.Barcodes.set,
        record: JSON.stringify(values)
      })

      if (imageUploadRef.current) {
        imageUploadRef.current.value = res.recordId

        await imageUploadRef.current.submit()
      }

      if (!values.recordId) {
        toast.success(platformLabels.Added)
        formik.setFieldValue('recordId', values?.barcode || res?.recordId)
        formik.setFieldValue('barcode', res?.recordId)
      } else toast.success(platformLabels.Edited)
      invalidate()
    }
  })

  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (store && !editMode) {
        formik.setValues({ ...formik.values, itemId: store?.recordId, sku: store?._reference, itemName: store?._name })

        return
      }
      if (recordId) {
        const res = await getRequest({
          extension: InventoryRepository.Barcodes.get,
          parameters: `_barcode=${recordId}`
        })
        formik.setValues({ ...res.record, recordId: res?.record?.barcode })
      }
    })()
  }, [])

  useEffect(() => {
    changeDT(store?.nraId)
  }, [store?.nraId])

  return (
    <FormShell resourceId={ResourceIds.Barcodes} form={formik} maxAccess={access} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={InventoryRepository.Item.snapshot}
                name='itemId'
                label={labels?.sku}
                readOnly={editMode || (!!store?._reference && !!store?._name)}
                valueField='recordId'
                displayField='sku'
                valueShow='sku'
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
                  formik.setFieldValue('msId', newValue?.msId)
                  formik.setFieldValue('scaleDescription', newValue?.description)
                  formik.setFieldValue('posDescription', newValue?.description)
                }}
                maxAccess={access}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='barcode'
                label={labels?.barcode}
                value={formik?.values?.barcode}
                maxLength='20'
                readOnly={editMode}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('barcode', '')}
                error={formik.touched.barcode && Boolean(formik.errors.barcode)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={InventoryRepository.MeasurementUnit.qry}
                parameters={formik?.values?.msId ? `_msId=${formik?.values?.msId}` : ''}
                readOnly={!formik?.values?.msId}
                name='muId'
                label={labels?.msUnit}
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
              <ImageUpload ref={imageUploadRef} resourceId={ResourceIds.Barcodes} seqNo={0} recordId={recordId} />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name='isInactive'
                    maxAccess={access}
                    checked={formik.values?.isInactive}
                    onChange={event => formik.setFieldValue('isInactive', event.target.checked ? true : false)}
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
