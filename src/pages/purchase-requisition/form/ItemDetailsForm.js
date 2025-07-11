import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'
import { PurchaseRepository } from 'src/repositories/PurchaseRepository'
import { useError } from 'src/error'

export default function ItemDetailsForm({
  recordId,
  maxSeqNo,
  seqNo,
  labels,
  maxAccess,
  readOnlyField,
  refetchTable,
  window
}) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack: stackError } = useError()

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      trxId: recordId,
      sku: '',
      seqNo: null,
      itemId: null,
      itemName: '',
      siteId: null,
      muId: null,
      muQty: null,
      qty: null,
      baseQty: null,
      deliveryDate: new Date(),
      status: 1,
      onhand: null,
      lastPurchaseDate: null,
      lastPurchaseCurrencyId: null,
      lastPurchaseUnitPrice: null,
      unitCost: null,
      totalCost: null,
      justification: ''
    },
    validateOnChange: true,
    validationSchema: yup.object({
      itemId: yup.number().required(),
      qty: yup.number().required()
    }),
    onSubmit: async obj => {
      if (!obj.seqNo && !obj.recordId) obj.seqNo = maxSeqNo + 1
      await postRequest({
        extension: PurchaseRepository.RequisitionDetail.set,
        record: JSON.stringify({
          ...obj,
          deliveryDate: obj?.deliveryDate ? formatDateToApi(obj?.deliveryDate) : null,
          baseQty: obj.muQty ? obj.muQty * obj.qty : obj.qty
        })
      })
      refetchTable(recordId)
      toast.success(obj.trxId ? platformLabels.Edited : platformLabels.Added)
      window.close()
    }
  })

  const editMode = !!formik.values.recordId

  async function getAvailability(itemId) {
    if (!itemId) {
      formik.setFieldValue('onhand', 0)

      return
    }

    const res = await getRequest({
      extension: InventoryRepository.Availability.get,
      parameters: `_itemId=${itemId}&_seqNo=0`
    })
    formik.setFieldValue('onhand', res?.record?.onhand || 0)
  }
  async function getlastIVI(itemId) {
    if (!itemId) {
      formik.setFieldValue('lastPurchaseUnitPrice', 0)
      formik.setFieldValue('lastPurchaseDate', null)
      formik.setFieldValue('lastPurchaseCurrencyId', null)

      return
    }

    const lastResp = await getRequest({
      extension: PurchaseRepository.ItemLastPurchaseInfo.last,
      parameters: `_itemId=${itemId}&_vendorId=${formik?.values?.vendorId || 0}`
    })
    formik.setFieldValue('lastPurchaseUnitPrice', lastResp?.record?.invoiceItem?.unitPrice || 0)
    formik.setFieldValue('lastPurchaseDate', formatDateFromApi(lastResp?.record?.invoice?.date))
    formik.setFieldValue('lastPurchaseCurrencyId', lastResp?.record?.invoice?.currencyId)
  }

  async function getCurrentCost(itemId) {
    if (!itemId) {
      formik.setFieldValue('unitCost', 0)

      return
    }

    const res = await getRequest({
      extension: InventoryRepository.CurrentCost.get,
      parameters: `_itemId=${itemId}`
    })
    formik.setFieldValue('unitCost', res?.record?.currentCost || 0)
  }

  async function refetchForm() {
    if (!seqNo) return

    const res = await getRequest({
      extension: PurchaseRepository.RequisitionDetail.get,
      parameters: `_trxId=${recordId}&_seqNo=${seqNo}`
    })
    formik.setValues({
      ...res.record,
      onhand: res?.record?.onHand || 0,
      deliveryDate: res?.record?.deliveryDate ? formatDateFromApi(res?.record?.deliveryDate) : null,
      lastPurchaseDate: res?.record?.lastPurchaseDate ? formatDateFromApi(res?.record?.lastPurchaseDate) : null
    })
  }

  useEffect(() => {
    refetchForm()
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.PurchaseRequisition}
      form={formik}
      maxAccess={maxAccess}
      editMode={true}
      isInfo={false}
      isCleared={false}
      disabledSubmit={readOnlyField}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceLookup
                    endpointId={InventoryRepository.Item.snapshot}
                    valueField='reference'
                    displayField='name'
                    name='itemId'
                    label={labels.item}
                    form={formik}
                    readOnly={readOnlyField}
                    displayFieldWidth={3}
                    valueShow='sku'
                    secondValueShow='itemName'
                    maxAccess={maxAccess}
                    required
                    editMode={editMode}
                    columnsInDropDown={[
                      { key: 'sku', value: 'SKU' },
                      { key: 'name', value: 'Name' }
                    ]}
                    onChange={async (event, newValue) => {
                      if (newValue?.isInactive) {
                        stackError({
                          message: labels.inactiveItem
                        })

                        formik.resetForm()
                        formik.setFieldValue('sku', null)

                        return
                      }
                      await getAvailability(newValue?.recordId)
                      await getlastIVI(newValue?.recordId)
                      await getCurrentCost(newValue?.recordId)
                      formik.setFieldValue('msId', newValue?.msId || null)
                      formik.setFieldValue('muId', null)
                      formik.setFieldValue('totalCost', formik.values.qty || 0 * formik.values.unitCost || 0)
                      formik.setFieldValue('itemName', newValue?.name || '')
                      formik.setFieldValue('sku', newValue?.sku || '')
                      formik.setFieldValue('itemId', newValue?.recordId || null)
                    }}
                    errorCheck={'itemId'}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={InventoryRepository.Site.qry}
                    name='siteId'
                    readOnly={readOnlyField}
                    label={labels.site}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik.values}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('siteId', newValue?.recordId || null)
                    }}
                    error={formik.touched.siteId && Boolean(formik.errors.siteId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={formik.values.msId && InventoryRepository.MeasurementUnit.qry}
                    parameters={`_msId=${formik.values.msId}`}
                    name='muId'
                    readOnly={editMode || readOnlyField}
                    label={labels.measurement}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik.values}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('muId', newValue?.recordId || '')
                      formik.setFieldValue('muQty', newValue?.qty)
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='qty'
                    label={labels.qty}
                    value={formik.values.qty}
                    onChange={e => {
                      let qty = Number(e.target.value.replace(/,/g, ''))
                      formik.setFieldValue('qty', qty)
                      formik.setFieldValue('totalCost', (qty || 0) * (formik.values.unitCost || 0))
                    }}
                    onClear={() => formik.setFieldValue('qty', '')}
                    readOnly={readOnlyField}
                    required
                    error={formik.touched.qty && Boolean(formik.errors.qty)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='unitCost'
                    label={labels.unitCost}
                    value={formik.values.unitCost}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('unitCost', '')}
                    readOnly
                    error={formik.touched.unitCost && Boolean(formik.errors.unitCost)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='totalCost'
                    label={labels.totalCost}
                    value={formik.values.totalCost}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('totalCost', '')}
                    readOnly
                    error={formik.touched.totalCost && Boolean(formik.errors.totalCost)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='onhand'
                    label={labels.onHand}
                    value={formik.values.onhand}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('onhand', '')}
                    readOnly
                    error={formik.touched.onhand && Boolean(formik.errors.onhand)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceLookup
                    endpointId={PurchaseRepository.Vendor.snapshot}
                    valueField='reference'
                    displayField='name'
                    name='vendorId'
                    label={labels.vendor}
                    form={formik}
                    readOnly={readOnlyField}
                    displayFieldWidth={3}
                    valueShow='vendorRef'
                    secondValueShow='vendorName'
                    maxAccess={maxAccess}
                    editMode={editMode}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    onChange={async (event, newValue) => {
                      formik.setFieldValue('vendorId', newValue?.recordId || null)
                      formik.setFieldValue('vendorName', newValue?.name || '')
                      formik.setFieldValue('vendorRef', newValue?.reference || '')
                    }}
                    errorCheck={'vendorId'}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <CustomDatePicker
                    name='deliveryDate'
                    label={labels.deliveryDate}
                    readOnly={readOnlyField}
                    value={formik?.values?.deliveryDate}
                    onChange={formik.setFieldValue}
                    maxAccess={maxAccess}
                    onClear={() => formik.setFieldValue('deliveryDate', null)}
                    error={formik.touched.deliveryDate && Boolean(formik.errors.deliveryDate)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='lastPurchaseUnitPrice'
                    label={labels.lastPurchaseUnitPrice}
                    value={formik.values.lastPurchaseUnitPrice}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('lastPurchaseUnitPrice', '')}
                    readOnly
                    error={formik.touched.lastPurchaseUnitPrice && Boolean(formik.errors.lastPurchaseUnitPrice)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SystemRepository.Currency.qry}
                    name='lastPurchaseCurrencyId'
                    label={labels.lastPurchaseCurrency}
                    valueField='recordId'
                    displayField='name'
                    readOnly
                    values={formik.values}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('lastPurchaseCurrencyId', newValue?.recordId || null)
                    }}
                    error={formik.touched.lastPurchaseCurrencyId && Boolean(formik.errors.lastPurchaseCurrencyId)}
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomDatePicker
                    name='lastPurchaseDate'
                    label={labels.lastPurchaseDate}
                    readOnly
                    value={formik?.values?.lastPurchaseDate}
                    onChange={formik.setFieldValue}
                    maxAccess={maxAccess}
                    onClear={() => formik.setFieldValue('lastPurchaseDate', null)}
                    error={formik.touched.lastPurchaseDate && Boolean(formik.errors.lastPurchaseDate)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextArea
                    name='justification'
                    label={labels.justification}
                    value={formik?.values?.justification}
                    rows={2.5}
                    readOnly={readOnlyField}
                    maxAccess={maxAccess}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('justification', '')}
                    error={formik.touched.justification && Boolean(formik.errors.justification)}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}
