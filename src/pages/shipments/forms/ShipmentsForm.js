import { Grid } from '@mui/material'
import { useContext, useEffect, useRef, useState } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { RequestsContext } from 'src/providers/RequestsContext'
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
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { useWindow } from 'src/windows'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import WorkFlow from 'src/components/Shared/WorkFlow'
import GenerateInvoiceForm from './GenerateInvoiceForm'
import { PurchaseRepository } from 'src/repositories/PurchaseRepository'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'

export default function ShipmentsForm({ labels, maxAccess: access, recordId, invalidate, ...props }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels, userDefaultsData, defaultsData } = useContext(ControlContext)
  const { stack } = useWindow()
  const unpostedOrders = useRef([])
  const skuStore = useRef([])
  const filteredMeasurements = useRef([])
  const [measurements, setMeasurements] = useState([])
  const { stack: stackError } = useError()

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.Shipment,
    access,
    enabled: !recordId,
    objectName: 'header'
  })

  const defplantId = parseInt(userDefaultsData?.list?.find(obj => obj.key === 'plantId')?.value)
  const defSiteId = parseInt(userDefaultsData?.list?.find(obj => obj.key === 'siteId')?.value)
  const marginDefault = parseInt(defaultsData?.list?.find(obj => obj.key === 'POSHPVarPct')?.value) || 0

  const { formik } = useForm({
    documentType: { key: 'header.dtId', value: documentType?.dtId },
    initialValues: {
      recordId: recordId || null,
      header: {
        reference: '',
        recordId: null,
        date: new Date(),
        dtId: null,
        status: 1,
        plantId: defplantId,
        siteId: defSiteId,
        vendorId: null,
        volume: 0,
        qty: 0,
        weight: 0,
        notes: '',
        invoiceId: null,
        poRef: '',
        vendorName: '',
        vendorRef: ''
      },
      items: [
        {
          id: 1,
          seqNo: 1,
          itemId: null,
          sku: '',
          itemName: '',
          qty: null,
          pendingQty: null,
          shippedNowQty: null,
          shipmentId: null,
          poSeqNo: null,
          volume: null,
          weight: null,
          poId: recordId || 0,
          poRef: '',
          siteId: null,
          siteRef: '',
          siteName: '',
          status: null,
          unitCost: null,
          trackBy: null,
          lotCategoryId: null,
          muName: '',
          muId: null,
          muRef: '',
          msId: null,
          baseQty: 0,
          muQty: 0,
          shipmentId: null,
          lotButton: true
        }
      ]
    },
    maxAccess,
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      header: yup.object({
        plantId: yup.number().required(),
        date: yup.string().required(),
        siteId: yup.number().required(),
        vendorId: yup.number().required()
      }),
      items: yup.array().of(
        yup.object({
          poRef: yup.string().required(),
          sku: yup.string().required(),
          itemName: yup.string().required(),
          shippedNowQty: yup.number().required(),
          siteName: yup.string().required()
        })
      )
    }),
    onSubmit: async obj => {
      const data = {
        header: {
          ...obj.header,
          date: formatDateToApi(obj.header.date)
        },
        items: formik.values.items.map((item, index) => ({
          ...item,
          id: index + 1,
          seqNo: index + 1,
          qty: item.shippedNowQty,
          shipmentId: formik?.values?.recordId || 0
        }))
      }

      const res = await postRequest({
        extension: PurchaseRepository.Shipment.set2,
        record: JSON.stringify(data)
      })

      formik.setFieldValue('recordId', res.recordId)
      formik.setFieldValue('header.recordId', res.recordId)

      await refetchForm(res.recordId)
      recordId ? toast.success(platformLabels.Edited) : toast.success(platformLabels.Added)

      invalidate()
    }
  })

  const { totalQty, totalVolume, totalWeight } = formik?.values?.items?.reduce(
    (acc, row) => {
      const totQ = parseFloat(row?.shippedNowQty) || 0
      const totV = parseFloat(row?.volume) || 0
      const totW = parseFloat(row?.weight) || 0

      return {
        totalQty: acc?.totalQty + totQ,
        totalVolume: acc?.totalVolume + totV,
        totalWeight: acc?.totalWeight + totW
      }
    },
    { totalQty: 0, totalVolume: 0, totalWeight: 0 }
  )

  useEffect(() => {
    formik.setFieldValue('header.qty', totalQty)
    formik.setFieldValue('header.volume', totalVolume)
    formik.setFieldValue('header.weight', totalWeight)
  }, [totalWeight, totalVolume, totalQty])

  const isPosted = formik.values.header?.status === 3
  const editMode = !!formik.values.header?.recordId

  async function refetchForm(recordId) {
    const res = await getShipment(recordId)

    res.record.date = formatDateFromApi(res.record.date)
    const shipItems = await getItems(res?.record)
    await fillForm(res, shipItems)
  }

  async function getShipment(recordId) {
    if (recordId) {
      return await getRequest({
        extension: PurchaseRepository.Shipment.get,
        parameters: `_recordId=${recordId}`
      })
    }
  }

  const getItems = async data => {
    if (data.recordId) {
      return await getRequest({
        extension: PurchaseRepository.ShipmentItem.qry,
        parameters: `_shipmentId=${data.recordId}`
      })
    }
  }

  async function fillForm(shipHeader, shipItems) {
    let itemsList = formik.initialValues.items

    if (shipItems.list != []) {
      itemsList = await Promise.all(
        shipItems.list.map((item, index) => {
          return {
            ...item,
            id: index + 1,
            seqNo: index + 1,
            date: formatDateFromApi(item.date),
            shippedNowQty: item.qty
          }
        })
      )
    }

    formik.setValues({
      ...formik.values,
      recordId: shipHeader.record.recordId,
      dtId: shipHeader.record.dtId,
      header: {
        ...formik.values.header,
        plantId: props.plantId || formik?.values?.header?.plantId,
        dtId: props.dtId || formik?.values?.header?.dtId,
        ...shipHeader.record
      },
      items: itemsList
    })

    fillGridRefCombo(shipHeader.record.vendorId)
  }

  const onPost = async () => {
    await postRequest({
      extension: PurchaseRepository.Shipment.post,
      record: JSON.stringify(formik.values.header)
    })

    toast.success(platformLabels.Posted)
    invalidate()

    await refetchForm(formik.values.recordId)
  }

  const onUnpost = async () => {
    await postRequest({
      extension: PurchaseRepository.Shipment.unpost,
      record: JSON.stringify(formik.values.header)
    })

    toast.success(platformLabels.Unposted)
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
        functionId: SystemFunction.Shipment,
        recordId: formik.values.header.recordId
      },
      width: 950,
      title: labels.WorkFlow
    })
  }

  async function openGenerateInvoiceForm() {
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

  const actions = [
    {
      key: 'Locked',
      condition: isPosted,
      onClick: 'onUnpostConfirmation',
      onSuccess: onUnpost,
      disabled: !editMode
    },
    {
      key: 'Unlocked',
      condition: !isPosted,
      onClick: onPost,
      disabled: !editMode
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
      disabled: !isPosted || formik?.values?.header?.invoiceId
    },
    {
      key: 'GL',
      condition: true,
      onClick: 'onClickGL',
      valuesPath: formik.values.header,
      disabled: !editMode
    },
    {
      key: 'IV',
      condition: true,
      onClick: 'onInventoryTransaction',
      disabled: !editMode || !isPosted
    },
    {
      key: 'Attachment',
      condition: true,
      onClick: 'onClickAttachment',
      disabled: !editMode
    },
    {
      key: 'RecordRemarks',
      condition: true,
      onClick: 'onRecordRemarks',
      disabled: !editMode
    }
  ]

  async function fillGridRefCombo(vendorId) {
    if (vendorId) {
      await getRequest({
        extension: PurchaseRepository.UnpostedOrderPack.get,
        parameters: `_vendorId=${vendorId}`
      }).then(res => {
        unpostedOrders.current = res.record
      })
    } else {
      unpostedOrders.current = []
    }
  }

  const filterByPoId = poId => {
    if (!unpostedOrders?.current?.items?.length) return []

    const array = unpostedOrders?.current?.items

    const filteredData = array
      .filter(item => item.poId === poId)
      .map(({ poId, poSeqNo, itemId, sku, itemName, qty, trackBy, lotCategoryId, msId }) => ({
        poId,
        poSeqNo,
        itemId,
        sku,
        itemName,
        qty,
        trackBy,
        lotCategoryId,
        msId
      }))

    skuStore.current = filteredData
  }

  useEffect(() => {
    ;(async function () {
      const muList = await getMeasurementUnits()
      setMeasurements(muList?.list)
    })()
  }, [])

  const getMeasurementUnits = async () => {
    return await getRequest({
      extension: InventoryRepository.MeasurementUnit.qry,
      parameters: `_msId=0`
    })
  }

  async function getFilteredMU(itemId, msId) {
    if (!itemId) return

    const arrayMU = measurements?.filter(item => item.msId === msId) || []
    filteredMeasurements.current = arrayMU
  }

  const columns = [
    {
      component: 'resourcecombobox',
      label: labels.reference,
      name: 'poRef',
      props: {
        store: unpostedOrders?.current?.orders,
        displayField: 'reference',
        valueField: 'reference',
        readOnly: isPosted,
        mapping: [
          { from: 'poId', to: 'poId' },
          { from: 'reference', to: 'poRef' }
        ],
        columnsInDropDown: [{ key: 'reference', value: 'Reference' }],
        displayFieldWidth: 1
      },
      async onChange({ row: { newRow } }) {
        filterByPoId(newRow?.poId)
      },
      propsReducer({ row, props }) {
        return { ...props, readOnly: !!row.poId }
      }
    },
    {
      component: 'resourcecombobox',
      label: labels.sku,
      name: 'sku',
      flex: 1,
      propsReducer({ row, props }) {
        return { ...props, readOnly: !!row.shipmentId && !!row.poId && !!row.sku }
      },
      props: {
        store: skuStore?.current,
        displayField: 'sku',
        valueField: 'sku',
        mapping: [
          { from: 'itemId', to: 'itemId' },
          { from: 'sku', to: 'sku' },
          { from: 'itemName', to: 'itemName' },
          { from: 'msId', to: 'msId' },
          { from: 'poSeqNo', to: 'poSeqNo' },
          { from: 'qty', to: 'qty' },
          { from: 'qty', to: 'shippedNowQty' },
          { from: 'trackBy', to: 'trackBy' },
          { from: 'lotCategoryId', to: 'lotCategoryId' }
        ],
        columnsInDropDown: [
          { key: 'sku', value: 'SKU' },
          { key: 'itemName', value: 'Item Name' }
        ],
        displayFieldWidth: 2
      },
      async onChange({ row: { update, newRow } }) {
        if (!newRow.itemId) {
          filteredMeasurements.current = []
          update({
            muRef: null,
            muId: null,
            baseQty: 0,
            muQty: 0
          })

          return
        }

        //lot store

        getFilteredMU(newRow?.itemId, newRow?.msId)
        update({
          muRef: filteredMeasurements?.current?.[0]?.reference || null,
          muId: filteredMeasurements?.current?.[0]?.recordId || null,
          muQty: filteredMeasurements?.current?.[0]?.qty || 0,
          baseQty: filteredMeasurements?.current?.[0]?.qty || newRow?.qty
        })
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
      component: 'resourcecombobox',
      label: labels.MU,
      name: 'muRef',
      props: {
        readOnly: isPosted,
        store: filteredMeasurements?.current,
        displayField: 'reference',
        valueField: 'recordId',
        mapping: [
          { from: 'reference', to: 'muRef' },
          { from: 'name', to: 'muName' },
          { from: 'qty', to: 'muQty' },
          { from: 'recordId', to: 'muId' }
        ]
      },
      async onChange({ row: { update, newRow } }) {
        if (newRow) {
          !newRow.muId
            ? update({
                baseQty: 0
              })
            : update({
                baseQty: newRow?.qty * newRow?.muQty
              })
        }
      },
      propsReducer({ row, props }) {
        let store = []
        if (row?.itemId) {
          getFilteredMU(row?.itemId, row?.msId)

          store = filteredMeasurements?.current
        }

        return { ...props, store }
      }
    },
    {
      component: 'numberfield',
      label: labels.qty,
      name: 'shippedNowQty',
      props: {
        readOnly: isPosted
      },
      async onChange({ row: { update, oldRow, newRow } }) {
        checkMaximum(newRow?.shippedNowQty, newRow, update)
        if (newRow?.muQty)
          update({
            baseQty: newRow?.muQty * newRow?.shippedNowQty
          })
        else
          update({
            baseQty: newRow?.shippedNowQty
          })
      }
    },
    {
      component: 'button',
      hidden: true,
      name: 'lotButton',
      defaultValue: true,
      props: {
        imgSrc: '/images/TableIcons/lot.png'
      },
      label: labels.lot, //not added
      onClick: (e, row) => {}
    },
    {
      component: 'resourcecombobox',
      label: labels.site,
      name: 'siteName',
      props: {
        endpointId: InventoryRepository.Site.qry,
        displayField: 'name',
        valueField: 'recordId',
        readOnly: isPosted,
        mapping: [
          { from: 'recordId', to: 'siteId' },
          { from: 'reference', to: 'siteRef' },
          { from: 'name', to: 'siteName' }
        ],
        columnsInDropDown: [
          { key: 'reference', value: 'Reference' },
          { key: 'name', value: 'Name' }
        ]
      }
    }
  ]

  const checkMaximum = (value, newRow, update) => {
    if (!value) return

    const poShpVarPct = newRow?.qty * (marginDefault / 100)
    const maxQty = newRow?.qty + poShpVarPct
    const maxPending = newRow?.pendingQty + poShpVarPct

    let updatedValues = { shippedNowQty: value }

    if (newRow?.pendingQty) {
      if (value > maxPending) {
        updatedValues = { shippedNowQty: 0 }
      } else if (value < 0) {
        updatedValues = { qty: 0 }
      }
    } else {
      if (value > maxQty) {
        updatedValues = { shippedNowQty: 0 }
      } else if (value < 0) {
        updatedValues = { qty: 0 }
      }
    }

    update(updatedValues)
  }

  return (
    <FormShell
      resourceId={ResourceIds.Shipments}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      actions={actions}
      functionId={SystemFunction.Shipment}
      disabledSubmit={isPosted}
      previewReport={editMode}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={8}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <ResourceComboBox
                    endpointId={SystemRepository.DocumentType.qry}
                    parameters={`_dgId=${SystemFunction.Shipment}&_startAt=0&_pageSize=1000`}
                    name='header.dtId'
                    label={labels.docType}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    readOnly={editMode}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    values={formik.values.header}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('header.dtId', newValue?.recordId || '')
                      changeDT(newValue)
                    }}
                    error={formik.touched.header?.dtId && Boolean(formik.errors.header?.dtId)}
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={6}>
                  <CustomDatePicker
                    name='header.date'
                    label={labels.date}
                    value={formik.values?.header?.date}
                    onChange={formik.setFieldValue}
                    onClear={() => formik.setFieldValue('header.date', '')}
                    readOnly={isPosted}
                    error={formik.touched.header?.date && Boolean(formik.errors.header?.date)}
                    maxAccess={maxAccess}
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <CustomTextField
                    name='header.reference'
                    label={labels.reference}
                    value={formik.values.header?.reference}
                    readOnly={editMode}
                    maxAccess={maxAccess}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('header.reference', '')}
                    error={formik.touched.header?.reference && Boolean(formik.errors.header?.reference)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <ResourceComboBox
                    endpointId={SystemRepository.Plant.qry}
                    name='header.plantId'
                    label={labels.plant}
                    valueField='recordId'
                    readOnly={isPosted}
                    displayField={['reference', 'name']}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik.values.header}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('header.plantId', newValue?.recordId || null)
                    }}
                    error={formik.touched?.header?.plantId && Boolean(formik.errors?.header?.plantId)}
                    required
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceLookup
                    endpointId={PurchaseRepository.Vendor.snapshot}
                    filter={item => !item.isInactive}
                    valueField='reference'
                    displayField='name'
                    secondFieldLabel={labels.vendor}
                    name='header.vendorId'
                    label={labels.vendor}
                    formObject={formik.values.header}
                    form={formik}
                    required
                    readOnly={editMode}
                    displayFieldWidth={2}
                    valueShow='vendorRef'
                    secondValueShow='vendorName'
                    maxAccess={maxAccess}
                    secondFieldName={'header.vendorName'}
                    onSecondValueChange={(name, value) => {
                      formik.setFieldValue('header.vendorName', value)
                    }}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' },
                      { key: 'flName', value: 'Foreign Language' }
                    ]}
                    onChange={async (event, newValue) => {
                      formik.setFieldValue('header.vendorName', newValue?.name || '')
                      formik.setFieldValue('header.vendorRef', newValue?.reference || '')
                      fillGridRefCombo(newValue?.recordId)
                      if (!newValue?.recordId) {
                        formik.setFieldValue('items', formik?.initialValues?.items)
                      }
                      formik.setFieldValue('header.vendorId', newValue?.recordId || null)
                    }}
                    errorCheck={'header.vendorId'}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={4}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={InventoryRepository.Site.qry}
                    name='header.siteId'
                    label={labels.site}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    filter={
                      formik?.values?.header?.plantId
                        ? item => Number(item.plantId) === Number(formik?.values?.header?.plantId)
                        : undefined
                    }
                    required
                    values={formik.values.header}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    maxAccess={maxAccess}
                    readOnly={isPosted}
                    onChange={(event, newValue) => {
                      if (!newValue?.isInactive) {
                        formik.setFieldValue('header.siteId', newValue?.recordId || null)
                      } else {
                        stackError({
                          message: labels.inactiveSite
                        })

                        formik.setFieldValue('header.siteId', null)
                      }
                    }}
                    error={formik.touched?.header?.siteId && Boolean(formik.errors?.header?.siteId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextArea
                    name='header.notes'
                    label={labels.notes}
                    value={formik.values.header?.notes}
                    readOnly={isPosted}
                    maxAccess={maxAccess}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('header.notes', '')}
                    error={formik.touched.header?.notes && Boolean(formik.errors.header?.notes)}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <DataGrid
            onChange={value => {
              formik.setFieldValue('items', value)
            }}
            value={formik?.values?.items}
            error={formik?.errors?.items}
            columns={columns}
            maxAccess={maxAccess}
            name='shippedItems'
            allowDelete={!isPosted}
            allowAddNewLine={!isPosted}
          />
        </Grow>
        <Fixed>
          <Grid container spacing={2} mt={0.3}>
            <Grid item xs={3}>
              <CustomNumberField
                name='totalQty'
                label={labels.totalQty}
                maxAccess={maxAccess}
                value={totalQty}
                readOnly
              />
            </Grid>
            <Grid item xs={3}>
              <CustomNumberField
                name='totalVolume'
                label={labels.totalVolume}
                maxAccess={maxAccess}
                value={totalVolume}
                readOnly
              />
            </Grid>
            <Grid item xs={3}>
              <CustomNumberField
                name='totalWeight'
                label={labels.totalWeight}
                maxAccess={maxAccess}
                value={totalWeight}
                readOnly
              />
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}
