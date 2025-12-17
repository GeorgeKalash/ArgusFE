import { useContext } from 'react'
import { Grid } from '@mui/material'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import FieldSet from '@argus/shared-ui/src/components/Shared/FieldSet'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import useResourceParams from '@argus/shared-hooks/src/hooks/useResourceParams'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { useError } from '@argus/shared-providers/src/providers/error'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import Form from '@argus/shared-ui/src/components/Shared/Form'

const MigrateBarcodeForm = () => {
  const { postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { stack: stackError } = useError()

  const { access, labels } = useResourceParams({
    datasetId: ResourceIds.MigrateBarcodeData
  })

  const { formik } = useForm({
    initialValues: {
      fromBarcodeItemId: null,
      toBarcodeItemId: null,
      fromBarcode: null,
      toBarcode: null
    },
    validateOnChange: true,
    validationSchema: yup.object({
      fromBarcode: yup.string().required(),
      toBarcode: yup.string().required()
    }),
    onSubmit: async obj => {
      if (obj?.fromBarcodeItemId === obj?.toBarcodeItemId) {
        const data = {
          itemId: obj?.toBarcodeItemId,
          fromBarcode: obj?.fromBarcode,
          toBarcode: obj?.toBarcode
        }
        await postRequest({
          extension: InventoryRepository.Barcode.migrate,
          record: JSON.stringify(data)
        }).then(res => {
          if (res) {
            toast.success(platformLabels.Updated), formik.resetForm()
          }
        })
      } else {
        stackError({
          message: platformLabels.MismatchedItemId
        })
      }
    }
  })

  const actions = [
    {
      key: 'Transfer',
      condition: true,
      onClick: () => formik.handleSubmit(),
      disabled: false
    }
  ]

  return (
    <Form maxAccess={access} actions={actions} onSave={() => formik.handleSubmit()} isSaved={false}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <FieldSet title={labels.transferFromBarcode}>
                <Grid container spacing={2} xs={12}>
                  <Grid item xs={7}>
                    <ResourceLookup
                      endpointId={InventoryRepository.Barcodes.snapshot}
                      valueField='barcode'
                      displayField='barcode'
                      name='fromBarcode'
                      required
                      label={labels.Barcode}
                      form={formik}
                      secondDisplayField={false}
                      columnsInDropDown={[
                        { key: 'barcode', value: 'Barcode' },
                        { key: 'itemName', value: 'Item Name' }
                      ]}
                      onChange={(event, newValue) => {
                        formik.setValues({
                          ...formik.values,
                          fromBarcode: newValue?.barcode || null,
                          fromBarcodeSku: newValue?.sku || null,
                          fromBarcodeItemName: newValue?.itemName || null,
                          fromBarcodeMeasUnit: newValue?.muName || null,
                          fromBarcodePosDescr: newValue?.posDescription || null,
                          fromBarcodeScaleDescr: newValue?.scaleDescription || null,
                          fromBarcodeItemId: newValue?.itemId || null
                        })
                      }}
                      displayFieldWidth={2}
                      errorCheck={'fromBarcode'}
                      maxAccess={access}
                    />
                  </Grid>
                  <Grid item xs={5}></Grid>
                  <Grid item xs={7}>
                    <CustomTextField
                      name='fromBarcodeSku'
                      label={labels?.BarcodeSku}
                      value={formik?.values?.fromBarcodeSku}
                      readOnly
                    />
                  </Grid>
                  <Grid item xs={5}></Grid>
                  <Grid item xs={12}>
                    <CustomTextField
                      name='fromBarcodeItemName'
                      label={labels?.BarcodeItemName}
                      value={formik?.values?.fromBarcodeItemName}
                      readOnly
                    />
                  </Grid>
                  <Grid item xs={7}>
                    <CustomTextField
                      name='fromBarcodeMeasUnit'
                      label={labels?.BarcodeMeasUnit}
                      value={formik?.values?.fromBarcodeMeasUnit}
                      readOnly
                    />
                  </Grid>
                  <Grid item xs={5}></Grid>
                  <Grid item xs={12}>
                    <CustomTextField
                      name='fromBarcodePosDescr'
                      label={labels?.BarcodePosDescr}
                      value={formik?.values?.fromBarcodePosDescr}
                      readOnly
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <CustomTextField
                      name='fromBarcodeScaleDescr'
                      label={labels?.BarcodeScaleDescr}
                      value={formik?.values?.fromBarcodeScaleDescr}
                      readOnly
                    />
                  </Grid>
                </Grid>
              </FieldSet>
            </Grid>
            <Grid item xs={6}>
              <FieldSet title={labels.transferToBarcode}>
                <Grid container spacing={2} xs={12}>
                  <Grid item xs={7}>
                    <ResourceLookup
                      endpointId={InventoryRepository.Barcodes.snapshot}
                      valueField='barcode'
                      displayField='barcode'
                      name='toBarcode'
                      required
                      label={labels.Barcode}
                      form={formik}
                      secondDisplayField={false}
                      columnsInDropDown={[
                        { key: 'barcode', value: 'Barcode' },
                        { key: 'itemName', value: 'Item Name' }
                      ]}
                      onChange={(event, newValue) => {
                        formik.setValues({
                          ...formik.values,
                          toBarcode: newValue?.barcode || null,
                          toBarcodeSku: newValue?.sku || null,
                          toBarcodeItemName: newValue?.itemName || null,
                          toBarcodeMeasUnit: newValue?.muName || null,
                          toBarcodePosDescr: newValue?.posDescription || null,
                          toBarcodeScaleDescr: newValue?.scaleDescription || null,
                          toBarcodeItemId: newValue?.itemId || null
                        })
                      }}
                      displayFieldWidth={2}
                      errorCheck={'toBarcode'}
                      maxAccess={access}
                    />
                  </Grid>
                  <Grid item xs={5}></Grid>
                  <Grid item xs={7}>
                    <CustomTextField
                      name='toBarcodeSku'
                      label={labels?.BarcodeSku}
                      value={formik?.values?.toBarcodeSku}
                      readOnly
                    />
                  </Grid>
                  <Grid item xs={5}></Grid>
                  <Grid item xs={12}>
                    <CustomTextField
                      name='toBarcodeItemName'
                      label={labels?.BarcodeItemName}
                      value={formik?.values?.toBarcodeItemName}
                      readOnly
                    />
                  </Grid>
                  <Grid item xs={7}>
                    <CustomTextField
                      name='toBarcodeMeasUnit'
                      label={labels?.BarcodeMeasUnit}
                      value={formik?.values?.toBarcodeMeasUnit}
                      readOnly
                    />
                  </Grid>
                  <Grid item xs={5}></Grid>
                  <Grid item xs={12}>
                    <CustomTextField
                      name='toBarcodePosDescr'
                      label={labels?.BarcodePosDescr}
                      value={formik?.values?.toBarcodePosDescr}
                      readOnly
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <CustomTextField
                      name='toBarcodeScaleDescr'
                      label={labels?.BarcodeScaleDescr}
                      value={formik?.values?.toBarcodeScaleDescr}
                      readOnly
                    />
                  </Grid>
                </Grid>
              </FieldSet>
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default MigrateBarcodeForm
