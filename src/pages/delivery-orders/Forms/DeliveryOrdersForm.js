import { Grid, Checkbox, FormControlLabel } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useError } from 'src/error'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { SystemFunction } from 'src/resources/SystemFunction'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import { DeliveryRepository } from 'src/repositories/DeliveryRepository'
import { SaleRepository } from 'src/repositories/SaleRepository'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { useWindow } from 'src/windows'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import WorkFlow from 'src/components/Shared/WorkFlow'
import AddressFilterForm from 'src/components/Shared/AddressFilterForm'
import GenerateInvoiceForm from './GenerateInvoiceForm'
import CustomCheckBox from 'src/components/Inputs/CustomCheckBox'

export default function DeliveriesOrdersForm({ labels, maxAccess: access, recordId, refresh = true, ...props }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels, userDefaultsData } = useContext(ControlContext)
  const { stack } = useWindow()
  const { stack: stackError } = useError()

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.DeliveryOrder,
    access,
    enabled: !recordId
  })

  const defPId = parseInt(userDefaultsData?.list?.find(obj => obj.key === 'plantId')?.value)
  const defSiteId = parseInt(userDefaultsData?.list?.find(obj => obj.key === 'siteId')?.value)

  const invalidate = useInvalidate(
    refresh && {
      endpointId: DeliveryRepository.DeliveriesOrders.qry
    }
  )

  const ordersInitialValues = [
    {
      id: 1,
      doId: null,
      doSeqNo: null,
      seqNo: 1,
      soSeqNo: null,
      soRef: null,
      itemId: null,
      soId: null,
      soDate: null,
      sku: null,
      itemName: null,
      qty: null,
      pendingQty: null,
      placeHolder: null,
      siteId: null,
      siteName: '',
      isEditMode: false,
      deliveredNowQty: null,
      deliveredQty: null,
      mwFunctionId: null,
      mwId: null,
      mwRef: '',
      mwSeqNo: null
    }
  ]

  const { formik } = useForm({
    documentType: { key: 'dtId', value: documentType?.dtId },
    initialValues: {
      recordId: null,
      reference: '',
      plantId: defPId,
      saleOrderId: null,
      clientRef: '',
      clientName: '',
      clientId: null,
      vehicleId: null,
      driverId: null,
      date: new Date(),
      notes: '',
      dtId: null,
      status: 1,
      statusName: '',
      printStatusName: '',
      printStatus: null,
      invoiceStatus: null,
      dtName: '',
      plantName: '',
      vehicleName: '',
      driverName: '',
      exWorks: false,
      addressId: null,
      szName: '',
      szId: null,
      spName: '',
      spId: null,
      volume: null,
      qty: null,
      siteId: defSiteId,
      address: '',
      orders: ordersInitialValues
    },
    maxAccess,
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      plantId: yup.number().required(),
      siteId: yup.string().required(),
      orders: yup.array().of(
        yup.object({
          mwRef: yup.string().required(),
          siteName: yup.string().required()
        })
      )
    }),
    onSubmit: async obj => {
      const copy = { ...obj }
      delete copy.orders

      copy.date = formatDateToApi(copy.date)

      const orders = formik.values.orders.map((order, index) => ({
        ...order,
        doId: recordId || 0,
        doSeqNo: index + 1,
        id: index + 1,
        reference: order.mwRef
      }))

      const data = {
        header: copy,
        items: orders
      }

      const res = await postRequest({
        extension: DeliveryRepository.DeliveriesOrders.set2,
        record: JSON.stringify(data)
      })

      formik.setFieldValue('recordId', res.recordId)

      await refetchForm(res.recordId)
      !formik.values.recordId ? toast.success(platformLabels.Added) : toast.success(platformLabels.Edited)

      invalidate()
    }
  })

  const totalQty = formik.values.orders.reduce((qtySum, row) => {
    const qtyValue = parseFloat(row.qty) || 0

    return qtySum + qtyValue
  }, 0)

  const isPosted = formik.values.status === 3
  const isCancelled = formik.values.status == -1
  const editMode = !!formik.values.recordId

  async function refetchForm(recordId) {
    const res = await getDeliveryOrder(recordId)

    res.record.date = formatDateFromApi(res.record.date)
    const doItems = await getOrders(res?.record)
    await fillForm(res, doItems)
  }

  async function getDeliveryOrder(recordId) {
    return await getRequest({
      extension: DeliveryRepository.DeliveriesOrders.get,
      parameters: `_doId=${recordId}&_recordId=${recordId}`
    })
  }

  async function getAddress(addressId) {
    if (!addressId) return null

    const res = await getRequest({
      extension: SystemRepository.Address.format,
      parameters: `_addressId=${addressId}`
    })

    return res?.record?.formattedAddress.replace(/(\r\n|\r|\n)+/g, '\r\n')
  }

  const getOrders = async data => {
    return await getRequest({
      extension: DeliveryRepository.OrderItem.qry,
      parameters: `_tripId=${data.recordId}&_doId=${data.recordId}`
    })
  }

  async function fillForm(doHeader, doItems) {
    const address = await getAddress(doHeader?.record?.addressId)

    let ordersList = ordersInitialValues

    if (doItems.list != []) {
      ordersList = await Promise.all(
        doItems.list.map((item, index) => {
          return {
            ...item,
            id: index + 1,
            soDate: formatDateFromApi(item.soDate)
          }
        })
      )
    }

    formik.setValues({
      ...doHeader?.record,
      plantId: props.plantId || doHeader?.record.plantId,
      dtId: props.dtId || doHeader?.record.dtId,
      address: address,
      orders: ordersList
    })
  }

  const onPost = async () => {
    await postRequest({
      extension: DeliveryRepository.DeliveriesOrders.post,
      record: JSON.stringify(formik.values)
    })

    toast.success(platformLabels.Posted)
    invalidate()

    await refetchForm(formik.values.recordId)
  }

  const onUnpost = async () => {
    await postRequest({
      extension: DeliveryRepository.DeliveriesOrders.unpost,
      record: JSON.stringify(formik.values)
    })

    toast.success(platformLabels.Unposted)
    invalidate()

    await refetchForm(formik.values.recordId)
  }

  const onCancel = async () => {
    await postRequest({
      extension: DeliveryRepository.DeliveriesOrders.cancel,
      record: JSON.stringify(formik.values)
    })

    if (recordId) toast.success(platformLabels.Cancelled)
    invalidate()

    await refetchForm(formik.values.recordId)
  }

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        await refetchForm(recordId)
      }
    })()
  }, [])

  const onWorkFlow = async () => {
    stack({
      Component: WorkFlow,
      props: {
        functionId: SystemFunction.DeliveryOrder,
        recordId: formik.values.recordId
      },
      width: 950,
      title: labels.WorkFlow
    })
  }

  async function openGenerateInvoiceForm() {
    const resClient = await getRequest({
      extension: SaleRepository.Client.get,
      parameters: `_recordId=${formik.values.clientId}&_doId=${formik.values.recordId}`
    })

    if (resClient?.record?.ptId === null) {
      stackError({
        message: platformLabels.paymentTermError
      })
    } else {
      stack({
        Component: GenerateInvoiceForm,
        props: {
          form: formik,
          labels,
          maxAccess,
          recordId
        },
        width: 500,
        height: 550,
        title: platformLabels.GenerateInvoice
      })
    }
  }

  const actions = [
    {
      key: 'Locked',
      condition: isPosted,
      onClick: 'onUnpostConfirmation',
      onSuccess: onUnpost,
      disabled: !editMode || isCancelled
    },
    {
      key: 'Unlocked',
      condition: !isPosted,
      onClick: onPost,
      disabled: !editMode || isCancelled
    },
    {
      key: 'Cancel',
      condition: true,
      onClick: onCancel,
      disabled: !editMode || !isPosted || isCancelled
    },
    {
      key: 'WorkFlow',
      condition: true,
      onClick: onWorkFlow,
      disabled: !editMode
    },
    {
      key: 'generateIV',
      condition: true,
      onClick: openGenerateInvoiceForm,
      disabled: !isPosted && !isCancelled
    }
  ]

  const columns = [
    {
      component: 'resourcecombobox',
      label: labels.reference,
      name: 'mwRef',
      props: {
        endpointId: formik?.values?.clientId && DeliveryRepository.MW.qry,
        parameters: formik?.values?.clientId && `_clientId=${formik?.values?.clientId}`,
        displayField: 'reference',
        valueField: 'itemName',
        readOnly: isPosted || isCancelled,
        mapping: [
          { from: 'reference', to: 'reference' },
          { from: 'itemName', to: 'itemName' },
          { from: 'seqNo', to: 'mwSeqNo' },
          { from: 'qty', to: 'qty' },
          { from: 'functionId', to: 'mwFunctionId' },
          { from: 'reference', to: 'mwRef' },
          { from: 'itemId', to: 'itemId' },
          { from: 'recordId', to: 'mwId' },
          { from: 'dropDownQty', to: 'deliveredNowQty' },
          { from: 'dropDownQty', to: 'pendingQty' },
          { from: 'sku', to: 'sku' },
          { from: 'doId', to: 'doId' }
        ],
        columnsInDropDown: [
          { key: 'reference', value: 'Reference' },
          { key: 'itemName', value: 'Name' },
          { key: 'sku', value: 'SKU' },
          { key: 'qty', value: 'Qty' }
        ],
        displayFieldWidth: 3
      },
      propsReducer({ row, props }) {
        return { ...props, readOnly: !!row.mwId }
      }
    },
    {
      component: 'textfield',
      label: labels.sku,
      name: 'sku',
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      label: labels.itemName,
      name: 'itemName',
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.qty,
      name: 'qty',
      props: {
        readOnly: isPosted || isCancelled,
        allowNegative: false
      },
      async onChange({ row: { update, oldRow, newRow } }) {
        if (newRow.qty) {
          if (newRow.qty > oldRow.qty) {
            update({
              qty: oldRow.qty
            })
          }
        }
      }
    },
    {
      component: 'resourcecombobox',
      label: labels.site,
      name: 'siteName',
      props: {
        endpointId: InventoryRepository.Site.qry,
        displayField: 'name',
        valueField: 'recordId',
        readOnly: isPosted || isCancelled,
        mapping: [
          { from: 'recordId', to: 'siteId' },
          { from: 'name', to: 'siteName' }
        ]
      }
    }
  ]

  async function previewBtnClicked() {
    const data = { printStatus: 2, recordId: formik.values.recordId }

    await postRequest({
      extension: DeliveryRepository.DeliveriesOrders.flag,
      record: JSON.stringify(data)
    })

    invalidate()
  }

  function setAddressValues(obj) {
    Object.entries(obj).forEach(([key, value]) => {
      formik.setFieldValue(key, value)
    })
  }

  function openAddressFilterForm(deliveryOrder) {
    stack({
      Component: AddressFilterForm,
      props: {
        maxAccess,
        labels,
        deliveryOrder,
        form: formik.values,
        handleAddressValues: setAddressValues,
        checkedAddressId: formik.values.addressId
      },
      width: 950,
      height: 600,
      title: labels.AddressFilter
    })
  }

  return (
    <FormShell
      resourceId={ResourceIds.DeliveriesOrders}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      actions={actions}
      previewBtnClicked={previewBtnClicked}
      functionId={SystemFunction.DeliveryTrip}
      disabledSubmit={isPosted || isCancelled}
      previewReport={editMode}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={8}>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <ResourceComboBox
                    endpointId={SystemRepository.DocumentType.qry}
                    parameters={`_dgId=${SystemFunction.DeliveryOrder}&_startAt=${0}&_pageSize=${1000}`}
                    filter={!editMode ? item => item.activeStatus === 1 : undefined}
                    name='dtId'
                    label={labels.docType}
                    readOnly={editMode || isCancelled}
                    valueField='recordId'
                    displayField='name'
                    values={formik.values}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('dtId', newValue?.recordId || '')
                      changeDT(newValue)
                    }}
                    error={formik.touched.dtId && Boolean(formik.errors.dtId)}
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={4}>
                  <ResourceComboBox
                    endpointId={SystemRepository.Plant.qry}
                    name='plantId'
                    label={labels.plant}
                    valueField='recordId'
                    readOnly={isPosted || isCancelled}
                    displayField={['reference', 'name']}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik.values}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('plantId', newValue ? newValue?.recordId : '')
                    }}
                    error={formik.touched.plantId && Boolean(formik.errors.plantId)}
                    required
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={4}>
                  <CustomDatePicker
                    name='date'
                    label={labels.date}
                    value={formik.values?.date}
                    onChange={formik.setFieldValue}
                    onClear={() => formik.setFieldValue('date', '')}
                    readOnly={isPosted || isCancelled}
                    error={formik.touched.date && Boolean(formik.errors.date)}
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={4}>
                  <CustomTextField
                    name='reference'
                    label={labels.reference}
                    value={formik.values.reference}
                    readOnly={editMode || isCancelled}
                    maxAccess={maxAccess}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('reference', '')}
                    error={formik.touched.reference && Boolean(formik.errors.reference)}
                  />
                </Grid>
                <Grid item xs={4}>
                  <ResourceComboBox
                    endpointId={InventoryRepository.Site.qry}
                    name='siteId'
                    label={labels.site}
                    required
                    values={formik.values}
                    displayField='name'
                    maxAccess={maxAccess}
                    readOnly={isPosted || isCancelled}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('siteId', newValue?.recordId || '')
                    }}
                    error={formik.touched.siteId && Boolean(formik.errors.siteId)}
                  />
                </Grid>
                <Grid item xs={4}>
                  <ResourceComboBox
                    endpointId={DeliveryRepository.Driver.qry}
                    name='driverId'
                    label={labels.driver}
                    valueField='recordId'
                    readOnly={isPosted || isCancelled}
                    displayField='name'
                    values={formik.values}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('driverId', newValue ? newValue?.recordId : '')
                    }}
                    maxAccess={maxAccess}
                    error={formik.touched.driverId && Boolean(formik.errors.driverId)}
                  />
                </Grid>
                <Grid item xs={8}>
                  <ResourceLookup
                    endpointId={SaleRepository.Client.snapshot}
                    valueField='reference'
                    displayField='name'
                    secondFieldLabel={labels.client}
                    name='clientId'
                    label={labels.client}
                    form={formik}
                    required
                    readOnly={isCancelled || editMode}
                    displayFieldWidth={2}
                    valueShow='clientRef'
                    secondValueShow='clientName'
                    maxAccess={maxAccess}
                    editMode={editMode}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' },
                      { key: 'szName', value: 'Sales Zone' }
                    ]}
                    onChange={async (event, newValue) => {
                      formik.setFieldValue('clientId', newValue?.recordId)
                      formik.setFieldValue('clientName', newValue?.name)
                      formik.setFieldValue('clientRef', newValue?.reference)
                      if (!newValue?.recordId) {
                        formik.setFieldValue('orders', ordersInitialValues)
                        formik.setFieldValue('addressId', null)
                        formik.setFieldValue('address', '')
                      }
                    }}
                    errorCheck={'clientId'}
                  />
                </Grid>
                <Grid item xs={4}>
                  <ResourceComboBox
                    endpointId={DeliveryRepository.Vehicle.qry}
                    name='vehicleId'
                    label={labels.vehicle}
                    valueField='recordId'
                    readOnly={isPosted || isCancelled}
                    displayField='name'
                    maxAccess={maxAccess}
                    values={formik.values}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('vehicleId', newValue ? newValue?.recordId : '')
                    }}
                    error={formik.touched.vehicleId && Boolean(formik.errors.vehicleId)}
                  />
                </Grid>
                <Grid item xs={8}>
                  <CustomCheckBox
                    name='exWorks'
                    value={formik.values?.exWorks}
                    onChange={event => formik.setFieldValue('exWorks', event.target.checked)}
                    label={labels.exWorks}
                    maxAccess={maxAccess}
                    readOnly
                    disabled={true}
                  />
                </Grid>
                <Grid item xs={4}>
                  <ResourceComboBox
                    endpointId={SaleRepository.SalesZone.qry}
                    parameters={`_startAt=0&_pageSize=1000&_sortField="recordId"&_filter=`}
                    name='szId'
                    label={labels.saleZone}
                    readOnly={isPosted || isCancelled}
                    valueField='recordId'
                    displayField='name'
                    values={formik.values}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('szId', newValue ? newValue.recordId : null)
                    }}
                    error={formik.touched.szId && Boolean(formik.errors.szId)}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={4}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <CustomTextField
                    name='salePerson'
                    label={labels.salePerson}
                    value={formik.values.salePerson}
                    onChange={formik.handleChange}
                    readOnly
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextArea
                    name='address'
                    label={labels.address}
                    value={formik.values.address}
                    rows={3.5}
                    maxLength='100'
                    readOnly={isCancelled || isPosted}
                    maxAccess={maxAccess}
                    viewDropDown={formik.values.clientId && !isCancelled && !isPosted}
                    onChange={e => formik.setFieldValue('address', e.target.value)}
                    onClear={() => formik.setFieldValue('address', '')}
                    onDropDown={() => openAddressFilterForm(true)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextArea
                    name='notes'
                    label={labels.notes}
                    value={formik.values.notes}
                    readOnly={isPosted || isCancelled}
                    maxAccess={maxAccess}
                    onChange={e => formik.setFieldValue('notes', e.target.value)}
                    onClear={() => formik.setFieldValue('notes', '')}
                    error={formik.touched.notes && Boolean(formik.errors.notes)}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <DataGrid
            onChange={value => {
              formik.setFieldValue('orders', value)
            }}
            value={formik?.values?.orders}
            error={formik?.errors?.orders}
            columns={columns}
            maxAccess={maxAccess}
            name='orders'
            allowDelete={!isPosted && !isCancelled}
            allowAddNewLine={!isPosted && !isCancelled}
          />
        </Grow>
        <Fixed>
          <Grid container spacing={2} mt={0.3}>
            <Grid item xs={3}>
              <CustomTextField
                name='totalQty'
                label={labels.totalQty}
                maxAccess={maxAccess}
                value={totalQty}
                maxLength='30'
                readOnly
                error={formik.touched.totalQty && Boolean(formik.errors.totalQty)}
                helperText={formik.touched.totalQty && formik.errors.totalQty}
              />
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}
