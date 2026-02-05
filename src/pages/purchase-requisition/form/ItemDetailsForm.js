import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
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
import Form from 'src/components/Shared/Form'

export default function ItemDetailsForm({
  recordId,
  maxSeqNo,
  seqNo,
  labels,
  maxAccess,
  readOnlyField,
  refetchTable,
  siteId,
  window
}) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack: stackError } = useError()

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      details: {
        trxId: recordId,
        sku: '',
        seqNo: null,
        itemId: null,
        itemName: '',
        siteId,
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
      }
    },
    validateOnChange: true,
    validationSchema: yup.object({
      details: yup.object({ itemId: yup.number().required(), qty: yup.number().required() })
    }),
    onSubmit: async obj => {
      obj = obj.details
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

  const editMode = !!formik.values.details.recordId

  async function getAvailability(itemId) {
    if (!itemId) {
      formik.setFieldValue('details.onhand', 0)

      return
    }

    const res = await getRequest({
      extension: InventoryRepository.Availability.get,
      parameters: `_itemId=${itemId}&_seqNo=0`
    })
    formik.setFieldValue('details.onhand', res?.record?.onhand || 0)
  }
  async function getlastIVI(itemId) {
    if (!itemId) {
      formik.setFieldValue('details.lastPurchaseUnitPrice', 0)
      formik.setFieldValue('details.lastPurchaseDate', null)
      formik.setFieldValue('details.lastPurchaseCurrencyId', null)

      return
    }

    const lastResp = await getRequest({
      extension: PurchaseRepository.ItemLastPurchaseInfo.last,
      parameters: `_itemId=${itemId}&_vendorId=${formik?.values?.vendorId || 0}`
    })
    formik.setFieldValue('details.lastPurchaseUnitPrice', lastResp?.record?.invoiceItem?.unitPrice || 0)
    formik.setFieldValue(
      'details.lastPurchaseDate',
      lastResp?.record?.invoice?.date ? formatDateFromApi(lastResp?.record?.invoice?.date) : null
    )
    formik.setFieldValue('details.lastPurchaseCurrencyId', lastResp?.record?.invoice?.currencyId)
  }

  async function getCurrentCost(itemId) {
    if (!itemId) {
      formik.setFieldValue('details.unitCost', 0)

      return
    }

    const res = await getRequest({
      extension: InventoryRepository.CurrentCost.get,
      parameters: `_itemId=${itemId}`
    })
    formik.setFieldValue('details.unitCost', res?.record?.currentCost || 0)
  }

  async function refetchForm() {
    if (!seqNo) return

    const res = await getRequest({
      extension: PurchaseRepository.RequisitionDetail.get,
      parameters: `_trxId=${recordId}&_seqNo=${seqNo}`
    })
    formik.setValues({
      details: {
        ...res.record,
        onhand: res?.record?.onHand || 0,
        totalCost: (res?.record?.qty || 0) * (res?.record?.unitCost || 0),
        deliveryDate: res?.record?.deliveryDate ? formatDateFromApi(res?.record?.deliveryDate) : null,
        lastPurchaseDate: res?.record?.lastPurchaseDate ? formatDateFromApi(res?.record?.lastPurchaseDate) : null
      }
    })
  }

  useEffect(() => {
    refetchForm()
  }, [])

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess} editMode={true} disabledSubmit={readOnlyField}>
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
                    name='details.itemId'
                    label={labels.item}
                    form={formik}
                    readOnly={readOnlyField}
                    displayFieldWidth={3}
                    valueShow='sku'
                    secondValueShow='itemName'
                    maxAccess={maxAccess}
                    required
                    formObject={formik.values.details}
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
                        formik.setFieldValue('details.sku', null)

                        return
                      }
                      await getAvailability(newValue?.recordId)
                      await getlastIVI(newValue?.recordId)
                      await getCurrentCost(newValue?.recordId)
                      formik.setFieldValue('details.msId', newValue?.msId || null)
                      formik.setFieldValue('details.muId', null)
                      formik.setFieldValue(
                        'details.totalCost',
                        formik.values.details.qty || 0 * formik.values.details.unitCost || 0
                      )
                      formik.setFieldValue('details.itemName', newValue?.name || '')
                      formik.setFieldValue('details.sku', newValue?.sku || '')
                      formik.setFieldValue('details.itemId', newValue?.recordId || null)
                    }}
                    errorCheck={'details.itemId'}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={InventoryRepository.Site.qry}
                    name='details.siteId'
                    readOnly={readOnlyField}
                    label={labels.site}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik.values.details}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('details.siteId', newValue?.recordId || null)
                    }}
                    error={formik?.touched.details?.siteId && Boolean(formik?.errors.details?.siteId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={formik.values.details.msId && InventoryRepository.MeasurementUnit.qry}
                    parameters={`_msId=${formik.values.details.msId}`}
                    name='details.muId'
                    readOnly={editMode || readOnlyField}
                    label={labels.measurement}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik.values.details}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('details.muId', newValue?.recordId || '')
                      formik.setFieldValue('details.muQty', newValue?.qty)
                    }}
                    error={formik?.touched.details?.muId && Boolean(formik?.errors.details?.muId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='details.qty'
                    label={labels.qty}
                    value={formik.values.details.qty}
                    onChange={e => {
                      let qty = Number(e.target.value.replace(/,/g, ''))
                      formik.setFieldValue('details.totalCost', (qty || 0) * (formik.values.details.unitCost || 0))
                      formik.setFieldValue('details.qty', qty)
                    }}
                    onClear={() => formik.setFieldValue('details.qty', null)}
                    readOnly={readOnlyField}
                    maxAccess={maxAccess}
                    required
                    error={formik?.touched.details?.qty && Boolean(formik?.errors.details?.qty)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='details.unitCost'
                    label={labels.unitCost}
                    value={formik.values.details.unitCost}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('details.unitCost', '')}
                    readOnly
                    maxAccess={maxAccess}
                    error={formik?.touched.details?.unitCost && Boolean(formik?.errors.details?.unitCost)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='details.totalCost'
                    label={labels.totalCost}
                    value={formik.values.details.totalCost}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('details.totalCost', 0)}
                    readOnly
                    maxAccess={maxAccess}
                    error={formik?.touched.details?.totalCost && Boolean(formik?.errors.details?.totalCost)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='details.onhand'
                    label={labels.onHand}
                    value={formik.values.details.onhand}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('details.onhand', 0)}
                    readOnly
                    maxAccess={maxAccess}
                    error={formik?.touched.details?.onhand && Boolean(formik?.errors.details?.onhand)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceLookup
                    endpointId={PurchaseRepository.Vendor.snapshot}
                    valueField='reference'
                    displayField='name'
                    name='details.vendorId'
                    label={labels.vendor}
                    form={formik}
                    readOnly={readOnlyField}
                    displayFieldWidth={3}
                    valueShow='vendorRef'
                    secondValueShow='vendorName'
                    maxAccess={maxAccess}
                    formObject={formik.values.details}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    onChange={async (event, newValue) => {
                      formik.setFieldValue('details.vendorName', newValue?.name || '')
                      formik.setFieldValue('details.vendorRef', newValue?.reference || '')
                      formik.setFieldValue('details.vendorId', newValue?.recordId || null)
                    }}
                    errorCheck={'details.vendorId'}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <CustomDatePicker
                    name='details.deliveryDate'
                    label={labels.deliveryDate}
                    readOnly={readOnlyField}
                    value={formik?.values?.details.deliveryDate}
                    onChange={formik.setFieldValue}
                    maxAccess={maxAccess}
                    onClear={() => formik.setFieldValue('details.deliveryDate', null)}
                    error={formik?.touched.details?.deliveryDate && Boolean(formik?.errors.details?.deliveryDate)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='details.lastPurchaseUnitPrice'
                    label={labels.lastPurchaseUnitPrice}
                    value={formik.values.details.lastPurchaseUnitPrice}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('details.lastPurchaseUnitPrice', '')}
                    readOnly
                    maxAccess={maxAccess}
                    error={
                      formik?.touched.details?.lastPurchaseUnitPrice &&
                      Boolean(formik?.errors.details?.lastPurchaseUnitPrice)
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SystemRepository.Currency.qry}
                    name='details.lastPurchaseCurrencyId'
                    label={labels.lastPurchaseCurrency}
                    valueField='recordId'
                    displayField='name'
                    readOnly
                    values={formik.values.details}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('details.lastPurchaseCurrencyId', newValue?.recordId || null)
                    }}
                    error={
                      formik?.touched.details?.lastPurchaseCurrencyId &&
                      Boolean(formik?.errors.details?.lastPurchaseCurrencyId)
                    }
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomDatePicker
                    name='details.lastPurchaseDate'
                    label={labels.lastPurchaseDate}
                    readOnly
                    value={formik?.values?.details.lastPurchaseDate}
                    onChange={formik.setFieldValue}
                    maxAccess={maxAccess}
                    onClear={() => formik.setFieldValue('details.lastPurchaseDate', null)}
                    error={
                      formik?.touched.details?.lastPurchaseDate && Boolean(formik?.errors.details?.lastPurchaseDate)
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextArea
                    name='details.justification'
                    label={labels.justification}
                    value={formik?.values?.details.justification}
                    rows={2.5}
                    readOnly={readOnlyField}
                    maxAccess={maxAccess}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('details.justification', '')}
                    error={formik?.touched.details?.justification && Boolean(formik?.errors.details?.justification)}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </Form>
  )
}
