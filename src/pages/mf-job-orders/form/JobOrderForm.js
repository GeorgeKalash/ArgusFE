import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import { Grid } from '@mui/material'
import { useContext, useEffect, useRef, useState } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { SystemFunction } from 'src/resources/SystemFunction'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { SaleRepository } from 'src/repositories/SaleRepository'
import { useForm } from 'src/hooks/form'
import WorkFlow from 'src/components/Shared/WorkFlow'
import { useWindow } from 'src/windows'
import { ControlContext } from 'src/providers/ControlContext'
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import ImageUpload from 'src/components/Inputs/ImageUpload'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'
import SerialsLots from './SerialsLots'
import ConfirmationDialog from 'src/components/ConfirmationDialog'
import Samples from './Samples'

export default function JobOrderForm({ labels, maxAccess: access, setStore, store, setRefetchRouting }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)
  const imageUploadRef = useRef(null)
  const currentItem = useRef({ itemId: '', sku: '', itemName: '' })
  const [plStore, setPlStore] = useState([])
  const recordId = store?.recordId

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.JobOrder,
    access: access,
    enabled: !recordId
  })

  const initialValues = {
    recordId: recordId || null,
    dtId: null,
    reference: null,
    date: new Date(),
    plantId: null,
    designId: null,
    workCenterId: null,
    itemId: null,
    sku: null,
    itemName: null,
    clientId: null,
    routingId: null,
    routingSeqNo: null,
    startingDT: null,
    endingDT: null,
    description: null,
    weight: 0,
    qty: 0,
    pcs: 0,
    stdWeight: 0,
    netSerialsWeight: 0,
    producedWgt: 0,
    itemWeight: 0,
    expectedQty: 0,
    expectedPcs: 0,
    RMCost: 0,
    deliveryDate: null,
    spId: null,
    sizeId: null,
    lineId: null,
    itemsPL: null,
    designPL: null,
    trackBy: null,
    avgWeight: 0,
    categoryId: null,
    itemCategoryId: null,
    classId: null,
    standardId: null,
    status: 1,
    itemFromDesign: false
  }

  const invalidate = useInvalidate({
    endpointId: ManufacturingRepository.MFJobOrder.qry
  })

  const { formik } = useForm({
    maxAccess,
    documentType: { key: 'dtId', value: documentType?.dtId },
    initialValues,
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      date: yup.string().required(),
      expectedQty: yup.number().required(),
      expectedPcs: yup.number().required(),
      workCenterId: yup.string().required(),
      itemCategoryId: yup.string().required(),
      routingId: yup.string().required()
    }),
    onSubmit: async values => {
      const obj = { ...values }
      if (!obj.qty) delete obj.qty

      const res = await postRequest({
        extension: ManufacturingRepository.MFJobOrder.set,
        record: JSON.stringify({
          ...obj,
          date: obj?.date ? formatDateToApi(obj?.date) : null,
          endingDT: obj?.endingDT ? formatDateToApi(obj?.endingDT) : null,
          startingDT: obj?.startingDT ? formatDateToApi(obj?.startingDT) : null,
          deliveryDate: obj?.deliveryDate ? formatDateToApi(obj?.deliveryDate) : null
        })
      })

      if (imageUploadRef.current) {
        imageUploadRef.current.value = parseInt(res.recordId)

        await imageUploadRef.current.submit()
      }

      invalidate()
      const actionMessage = editMode ? platformLabels.Edited : platformLabels.Added
      toast.success(actionMessage)
      setStore(prevStore => ({
        ...prevStore,
        recordId: res?.recordId
      }))
      await refetchForm(res.recordId)
    }
  })
  const editMode = !!formik.values.recordId
  const isCancelled = formik.values.status == -1
  const isReleased = formik.values.status == 4
  const isPosted = formik.values.status == 3

  const actions = [
    {
      key: 'Locked',
      condition: isPosted,
      onClick: 'onUnpostConfirmation',
      disabled: true
    },
    {
      key: 'Unlocked',
      condition: !isPosted,
      onClick: onPost,
      disabled: !editMode || isPosted || isCancelled
    },
    {
      key: 'RecordRemarks',
      condition: true,
      onClick: 'onRecordRemarks',
      disabled: !editMode
    },
    {
      key: 'Cancel',
      condition: true,
      onClick: () => {
        confirmation(platformLabels.CancelConf, platformLabels.Confirmation, onCancel)
      },
      disabled: !editMode || isCancelled || isPosted
    },
    {
      key: 'WorkFlow',
      condition: true,
      onClick: onWorkFlowClick,
      disabled: !editMode
    },
    {
      key: 'GL',
      condition: true,
      onClick: 'onClickGL',
      disabled: !editMode
    },
    {
      key: 'IV',
      condition: true,
      onClick: 'onInventoryTransaction',
      disabled: !editMode || !isPosted
    },
    {
      key: 'SerialsLots',
      condition: true,
      onClick: openSerials,
      disabled: !editMode || !formik.values.itemId || (!isReleased && formik.values.trackBy == 1)
    },
    {
      key: 'Start',
      condition: !isReleased,
      onClick: () => {
        confirmation(platformLabels.StartRecord, platformLabels.Confirmation, onStart)
      },
      disabled: !editMode || isReleased || isPosted || isCancelled
    },
    {
      key: 'Stop',
      condition: isReleased,
      onClick: () => {
        confirmation(platformLabels.StopRecord, platformLabels.Confirmation, onStop)
      },
      disabled: !editMode || !isReleased || isPosted
    },
    {
      key: 'Sample',
      condition: true,
      onClick: openSample,
      disabled: !editMode || !isReleased || !isPosted ? !(isReleased || isPosted) : false
    }
  ]
  async function onStart() {
    const res = await postRequest({
      extension: ManufacturingRepository.MFJobOrder.start,
      record: JSON.stringify({
        ...formik.values,
        date: formatDateToApi(formik.values.date),
        deliveryDate: formik.values.deliveryDate ? formatDateToApi(formik.values.deliveryDate) : null
      })
    })
    toast.success(platformLabels.Started)
    invalidate()
    await refetchForm(res.recordId)
    setRefetchRouting(true)
  }
  async function onStop() {
    const res = await postRequest({
      extension: ManufacturingRepository.MFJobOrder.stop,
      record: JSON.stringify({
        ...formik.values,
        date: formatDateToApi(formik.values.date),
        deliveryDate: formik.values.deliveryDate ? formatDateToApi(formik.values.deliveryDate) : null
      })
    })
    toast.success(platformLabels.Stoped)
    invalidate()
    await refetchForm(res.recordId)
    setRefetchRouting(true)
  }
  async function onCancel() {
    const res = await postRequest({
      extension: ManufacturingRepository.MFJobOrder.cancel,
      record: JSON.stringify({
        ...formik.values,
        date: formatDateToApi(formik.values.date),
        deliveryDate: formik.values.deliveryDate ? formatDateToApi(formik.values.deliveryDate) : null
      })
    })
    toast.success(platformLabels.Cancelled)
    invalidate()
    await refetchForm(res.recordId)
    setStore(prevStore => ({
      ...prevStore,
      isCancelled: true
    }))
  }
  async function onPost() {
    const res = await postRequest({
      extension: ManufacturingRepository.MFJobOrder.post,
      record: JSON.stringify({
        ...formik.values,
        date: formatDateToApi(formik.values.date),
        deliveryDate: formik.values.deliveryDate ? formatDateToApi(formik.values.deliveryDate) : null
      })
    })
    toast.success(platformLabels.Post)
    invalidate()
    await refetchForm(res.recordId)
    setStore(prevStore => ({
      ...prevStore,
      isPosted: true
    }))
  }
  async function onWorkFlowClick() {
    stack({
      Component: WorkFlow,
      props: {
        functionId: SystemFunction.JobOrder,
        recordId: formik.values.recordId
      },
      width: 950,
      height: 600,
      title: labels.workflow
    })
  }
  function openSerials() {
    stack({
      Component: SerialsLots,
      props: { labels, maxAccess, recordId: formik.values.recordId, itemId: formik.values.itemId },
      width: 500,
      height: 600,
      title: labels.seriallot
    })
  }
  function openSample() {
    stack({
      Component: Samples,
      props: { labels, maxAccess, recordId: formik.values.recordId, itemId: formik.values.itemId },
      width: 500,
      height: 600,
      title: labels.samples
    })
  }
  function confirmation(dialogText, titleText, event) {
    stack({
      Component: ConfirmationDialog,
      props: {
        DialogText: dialogText,
        okButtonAction: async () => {
          await event()
        },
        fullScreen: false,
        close: true
      },
      width: 400,
      height: 150,
      title: titleText
    })
  }
  async function refetchForm(recordId) {
    if (!recordId) return

    const res = await getRequest({
      extension: ManufacturingRepository.MFJobOrder.get,
      parameters: `_recordId=${recordId}`
    })
    formik.setValues({
      ...res.record,
      date: formatDateFromApi(res?.record?.date),
      endingDT: formatDateFromApi(res?.record?.endingDT),
      startingDT: formatDateFromApi(res?.record?.startingDT),
      deliveryDate: formatDateFromApi(res?.record?.deliveryDate)
    })
    currentItem.current = { itemId: res?.record?.itemId, sku: res?.record?.sku, itemName: res?.record?.itemName }
    setStore(prevStore => ({
      ...prevStore,
      recordId: res?.record.recordId,
      isPosted: res?.record.status == 3,
      isCancelled: res?.record.status == -1
    }))
  }

  async function getRouting(recordId) {
    if (!recordId) return

    return await getRequest({
      extension: ManufacturingRepository.Routing.get,
      parameters: `_recordId=${recordId}`
    })
  }

  async function fillItemInfo(values) {
    if (!values?.recordId) {
      currentItem.current = { itemId: null, sku: null, itemName: null }
      formik.setFieldValue('itemsPL', null)
      formik.setFieldValue('itemWeight', null)
      formik.setFieldValue('itemCategoryId', null)
      formik.setFieldValue('itemFromDesign', false)

      return
    }
    const shouldUpdateCurrentItem = !currentItem.current.itemId || formik.values.itemFromDesign

    if (shouldUpdateCurrentItem) {
      currentItem.current = { itemId: values?.recordId, sku: values?.sku, itemName: values?.name }

      if (formik.values.itemFromDesign) {
        formik.setFieldValue('itemFromDesign', false)
      }
    }

    const ItemPhysProp = await getRequest({
      extension: InventoryRepository.Physical.get,
      parameters: `_itemId=${values?.recordId}`
    })

    const ItemProduction = await getRequest({
      extension: InventoryRepository.ItemProduction.get,
      parameters: `_recordId=${values?.recordId}`
    })
    formik.setFieldValue('itemCategoryId', values?.categoryId)
    formik.setFieldValue('itemWeight', ItemPhysProp?.record?.weight)
    formik.setFieldValue('itemsPL', ItemProduction?.record?.lineId)
    formik.setFieldValue('lineId', ItemProduction?.record?.lineId)
    formik.setFieldValue('designId', ItemProduction?.record?.designId || formik.values?.designId)
    formik.setFieldValue('designRef', ItemProduction?.record?.designRef || formik.values?.designRef)
    formik.setFieldValue('designName', ItemProduction?.record?.designName || formik.values?.designName)
  }
  async function fillDesignInfo(values) {
    if (values?.itemId) {
      currentItem.current = { itemId: values?.itemId, sku: values?.sku, itemName: values?.itemName }
      formik.setFieldValue('itemFromDesign', true)
    }
    formik.setFieldValue('designId', values?.recordId)
    formik.setFieldValue('designRef', values?.reference)
    formik.setFieldValue('designName', values?.name)
    formik.setFieldValue('stdWeight', values?.stdWeight)
    formik.setFieldValue(
      'expectedQty',
      !values?.stdWeight || !formik.values.expectedPcs ? 0 : formik.values.expectedPcs * values?.stdWeight
    )
    const routing = await getRouting(values?.routingId)
    if (routing?.record?.isInactive) {
      formik.setFieldValue('routingId', null)
      formik.setFieldValue('routingRef', null)
      formik.setFieldValue('routingName', null)
    } else {
      formik.setFieldValue('routingId', values?.routingId)
      formik.setFieldValue('routingRef', values?.routingRef)
      formik.setFieldValue('routingName', values?.routingName)
    }
    formik.setFieldValue('lineId', values?.lineId)
    formik.setFieldValue('designPL', values?.lineId)
    formik.setFieldValue('classId', values?.classId)
    formik.setFieldValue('standardId', values?.standardId)
    formik.setFieldValue('itemCategoryId', values?.itemCategoryId)
  }
  async function fillBillingInfo(values) {
    if (!values?.recordId) return

    const res = await getRequest({
      extension: SaleRepository.Address.qry,
      parameters: `_params=1|${values.recordId}`
    })

    return await getFormattedAddress(res?.list[0]?.addressId)
  }
  async function getFormattedAddress(addressId) {
    if (!addressId) return null

    const res = await getRequest({
      extension: SystemRepository.Address.format,
      parameters: `_addressId=${addressId}`
    })

    return res?.record?.formattedAddress.replace(/(\r\n|\r|\n)+/g, '\r\n')
  }
  async function getAllLines() {
    const res = await getRequest({
      extension: ManufacturingRepository.ProductionLine.qry,
      parameters: `_filter=`
    })
    setPlStore(res?.list)
  }
  async function getFilteredLines(itemId) {
    if (!itemId) return null

    const res = await getRequest({
      extension: ManufacturingRepository.ProductionLine.qry2,
      parameters: `_itemId=${itemId}`
    })
    setPlStore(res?.list)
  }
  async function updateWC(routingId) {
    if (!routingId) {
      formik.setFieldValue('workCenterId', null)
      formik.setFieldValue('wcRef', null)
      formik.setFieldValue('wcName', null)

      return
    }

    const res = await getRequest({
      extension: ManufacturingRepository.RoutingSequence.qry,
      parameters: `_routingId=${routingId}`
    })

    formik.setFieldValue('workCenterId', res?.list[0]?.workCenterId)
    formik.setFieldValue('wcRef', res?.list[0]?.workCenterRef)
    formik.setFieldValue('wcName', res?.list[0]?.workCenterName)
  }

  useEffect(() => {
    ;(async function () {
      formik.setFieldValue('itemId', currentItem?.current?.itemId)
      formik.setFieldValue('itemName', currentItem?.current?.itemName)
      formik.setFieldValue('sku', currentItem?.current?.sku)
      !currentItem?.current?.itemId ? await getAllLines() : await getFilteredLines(currentItem?.current?.itemId)
    })()
  }, [currentItem.current.itemId, formik.values.designId])

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        await refetchForm(recordId)
      } else await getAllLines()
    })()
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.MFJobOrders}
      functionId={SystemFunction.JobOrder}
      form={formik}
      maxAccess={maxAccess}
      previewReport={editMode}
      actions={actions}
      editMode={editMode}
      disabledSubmit={isCancelled || isPosted}
      disabledSavedClear={isCancelled || isPosted}
    >
      <VertLayout>
        <Fixed>
          <Grid container>
            <Grid container spacing={2} xs={8}>
              <Grid item xs={12}>
                <ResourceComboBox
                  endpointId={SystemRepository.DocumentType.qry}
                  parameters={`_startAt=0&_pageSize=1000&_dgId=${SystemFunction.JobOrder}`}
                  name='dtId'
                  label={labels.documentType}
                  columnsInDropDown={[
                    { key: 'reference', value: 'Reference' },
                    { key: 'name', value: 'Name' }
                  ]}
                  readOnly={editMode}
                  valueField='recordId'
                  displayField={['reference', 'name']}
                  values={formik.values}
                  maxAccess={maxAccess}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('dtId', newValue?.recordId)
                    changeDT(newValue)
                  }}
                  error={formik.touched.dtId && Boolean(formik.errors.dtId)}
                />
              </Grid>
              <Grid container item xs={12} spacing={4}>
                <Grid item xs={6}>
                  <Grid container direction='column' spacing={2}>
                    <Grid item>
                      <CustomTextField
                        name='reference'
                        label={labels.reference}
                        value={formik?.values?.reference}
                        maxAccess={!editMode && maxAccess}
                        readOnly={editMode}
                        onChange={formik.handleChange}
                        onClear={() => formik.setFieldValue('reference', '')}
                        error={formik.touched.reference && Boolean(formik.errors.reference)}
                      />
                    </Grid>
                    <Grid item>
                      <CustomDatePicker
                        name='date'
                        required
                        readOnly
                        label={labels.date}
                        value={formik?.values?.date}
                        editMode={editMode}
                        maxAccess={maxAccess}
                      />
                    </Grid>
                    <Grid item>
                      <CustomDatePicker
                        name='startingDT'
                        label={labels.startingDate}
                        value={formik?.values?.startingDT}
                        onChange={formik.setFieldValue}
                        editMode={editMode}
                        maxAccess={maxAccess}
                        readOnly
                      />
                    </Grid>
                    <Grid item>
                      <CustomDatePicker
                        name='endingDT'
                        readOnly
                        label={labels.endingDate}
                        value={formik?.values?.endingDT}
                        editMode={editMode}
                        maxAccess={maxAccess}
                      />
                    </Grid>
                    <Grid item>
                      <CustomDatePicker
                        name='deliveryDate'
                        readOnly={isCancelled || isReleased || isPosted}
                        label={labels.deliveryDate}
                        value={formik?.values?.deliveryDate}
                        onChange={formik.setFieldValue}
                        editMode={editMode}
                        maxAccess={maxAccess}
                        onClear={() => formik.setFieldValue('deliveryDate', null)}
                        error={formik.touched.deliveryDate && Boolean(formik.errors.deliveryDate)}
                      />
                    </Grid>
                    <Grid item>
                      <ResourceLookup
                        endpointId={InventoryRepository.Item.snapshot}
                        name='itemId'
                        readOnly={isCancelled || isPosted}
                        label={labels.item}
                        valueField='sku'
                        displayField='sku'
                        valueShow='sku'
                        secondValueShow='itemName'
                        columnsInDropDown={[
                          { key: 'sku', value: 'SKU' },
                          { key: 'name', value: 'Name' }
                        ]}
                        form={formik}
                        displayFieldWidth={2}
                        onChange={async (event, newValue) => {
                          await fillItemInfo(newValue)
                        }}
                        errorCheck={'itemId'}
                        maxAccess={maxAccess}
                      />
                    </Grid>
                    <Grid item>
                      <ResourceComboBox
                        endpointId={InventoryRepository.ItemSizes.qry}
                        name='sizeId'
                        label={labels.size}
                        readOnly={isCancelled || isReleased || isPosted}
                        columnsInDropDown={[
                          { key: 'reference', value: 'Reference' },
                          { key: 'name', value: 'Name' }
                        ]}
                        values={formik.values}
                        valueField='recordId'
                        displayField={['reference', 'name']}
                        maxAccess={maxAccess}
                        onChange={(event, newValue) => {
                          formik.setFieldValue('sizeId', newValue?.recordId)
                        }}
                        error={formik.touched.sizeId && Boolean(formik.errors.sizeId)}
                      />
                    </Grid>
                    <Grid item>
                      <CustomNumberField
                        name='expectedQty'
                        label={labels.expectedQty}
                        value={formik.values.expectedQty}
                        required
                        readOnly={isCancelled || isReleased || isPosted}
                        onChange={e => formik.setFieldValue('expectedQty', e.target.value)}
                        onClear={() => formik.setFieldValue('expectedQty', 0)}
                        error={formik.touched.expectedQty && Boolean(formik.errors.expectedQty)}
                      />
                    </Grid>
                    <Grid item>
                      <CustomNumberField
                        name='expectedPcs'
                        label={labels.expectedPcs}
                        value={formik.values.expectedPcs}
                        required
                        readOnly={isCancelled || isReleased || isPosted}
                        onChange={e => {
                          formik.setFieldValue('expectedPcs', e.target.value)
                          formik.setFieldValue(
                            'expectedQty',
                            formik.values.stdWeight ? formik.values.stdWeight * e.target.value : 0
                          )
                        }}
                        onClear={() => formik.setFieldValue('expectedPcs', 0)}
                        error={formik.touched.expectedPcs && Boolean(formik.errors.expectedPcs)}
                      />
                    </Grid>
                    <Grid item>
                      <ResourceLookup
                        endpointId={ManufacturingRepository.Design.snapshot}
                        valueField='reference'
                        displayField='name'
                        name='designId'
                        label={labels.design}
                        form={formik}
                        firstValue={formik.values.designRef}
                        secondValue={formik.values.designName}
                        errorCheck={'designId'}
                        maxAccess={maxAccess}
                        displayFieldWidth={2}
                        readOnly={isCancelled || isReleased || isPosted}
                        onChange={async (event, newValue) => {
                          await fillDesignInfo(newValue)
                          await updateWC(newValue?.routingId)
                        }}
                      />
                    </Grid>
                    <Grid item>
                      <CustomNumberField
                        name='netSerialsWeight'
                        label={labels.netSerialsWeight}
                        value={formik.values.netSerialsWeight}
                        readOnly
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={6}>
                  <Grid container direction='column' spacing={2}>
                    <Grid item>
                      <CustomTextArea
                        name='description'
                        label={labels.description}
                        value={formik.values.description}
                        rows={2.5}
                        maxLength='100'
                        readOnly={isCancelled || isPosted}
                        maxAccess={maxAccess}
                        onChange={e => formik.setFieldValue('description', e.target.value)}
                        onClear={() => formik.setFieldValue('description', null)}
                      />
                    </Grid>
                    <Grid item>
                      <CustomNumberField
                        name='itemWeight'
                        label={labels.itemWeight}
                        value={formik.values.itemWeight}
                        readOnly
                      />
                    </Grid>
                    <Grid item>
                      <CustomNumberField
                        name='avgWeight'
                        label={labels.avgWeight}
                        value={formik.values.avgWeight}
                        readOnly
                      />
                    </Grid>
                    <Grid item>
                      <CustomComboBox
                        store={plStore}
                        name='lineId'
                        label={labels.line}
                        valueField='recordId'
                        readOnly={isCancelled || isReleased}
                        displayField='name'
                        value={formik.values.lineId}
                        onChange={(event, newValue) => {
                          formik.setFieldValue('lineId', newValue?.recordId)
                        }}
                        error={formik.touched.lineId && Boolean(formik.errors.lineId)}
                      />
                    </Grid>
                    <Grid item>
                      <ResourceLookup
                        endpointId={ManufacturingRepository.Routing.snapshot2}
                        valueField='reference'
                        displayField='name'
                        name='routingId'
                        label={labels.routing}
                        form={formik}
                        required
                        minChars={2}
                        firstValue={formik.values.routingRef}
                        secondValue={formik.values.routingName}
                        errorCheck={'routingId'}
                        maxAccess={maxAccess}
                        displayFieldWidth={2}
                        readOnly={isCancelled || isReleased || isPosted}
                        columnsInDropDown={[
                          { key: 'reference', value: 'Reference' },
                          { key: 'name', value: 'Name' }
                        ]}
                        onChange={(event, newValue) => {
                          if (!newValue) {
                            formik.setFieldValue('routingId', null)
                            formik.setFieldValue('routingRef', null)
                            formik.setFieldValue('routingName', null)
                          }
                          updateWC(newValue?.recordId)
                        }}
                      />
                    </Grid>
                    <Grid item>
                      <ResourceLookup
                        endpointId={ManufacturingRepository.WorkCenter.snapshot}
                        valueField='reference'
                        displayField='name'
                        name='workCenterId'
                        label={labels.workCenter}
                        form={formik}
                        firstValue={formik.values.wcRef}
                        required
                        secondValue={formik.values.wcName}
                        errorCheck={'workCenterId'}
                        maxAccess={maxAccess}
                        readOnly={editMode ? true : formik?.values?.designId || formik?.values?.routingId}
                        displayFieldWidth={2}
                        onChange={(event, newValue) => {
                          formik.setFieldValue('workCenterId', newValue?.recordId)
                          formik.setFieldValue('wcRef', newValue?.reference)
                          formik.setFieldValue('wcName', newValue?.name)
                        }}
                      />
                    </Grid>
                    <Grid item>
                      <CustomNumberField name='qty' label={labels.netProduction} value={formik.values.qty} readOnly />
                    </Grid>
                    <Grid item>
                      <CustomNumberField name='pcs' label={labels.producedPcs} value={formik.values.pcs} readOnly />
                    </Grid>
                    <Grid item>
                      <CustomNumberField name='RMCost' label={labels.rmCost} value={formik.values.RMCost} readOnly />
                    </Grid>
                    <Grid item>
                      <ResourceComboBox
                        endpointId={ManufacturingRepository.ProductionClass.qry}
                        values={formik.values}
                        name='classId'
                        label={labels.productionClass}
                        valueField='recordId'
                        displayField='name'
                        maxAccess={maxAccess}
                        readOnly={isCancelled || isReleased || isPosted}
                        onChange={(event, newValue) => {
                          formik.setFieldValue('classId', newValue?.recordId)
                        }}
                        error={formik.touched.classId && Boolean(formik.errors.classId)}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid container spacing={2} xs={4} sx={{ pl: 3 }}>
              <Grid item>
                <ImageUpload
                  ref={imageUploadRef}
                  resourceId={ResourceIds.Design}
                  seqNo={0}
                  recordId={formik.values.recordId}
                  customWidth={300}
                  customHeight={180}
                  rerender={formik.values.designId}
                />
              </Grid>
              <Grid item xs={12}>
                <ResourceComboBox
                  endpointId={ManufacturingRepository.ProductionStandard.qry}
                  values={formik.values}
                  name='standardId'
                  label={labels.productionStandard}
                  valueField='recordId'
                  displayField='reference'
                  readOnly={isCancelled || isReleased || isPosted}
                  maxAccess={maxAccess}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('standardId', newValue?.recordId)
                  }}
                  error={formik.touched.standardId && Boolean(formik.errors.standardId)}
                />
              </Grid>
              <Grid item xs={12}>
                <ResourceComboBox
                  endpointId={ManufacturingRepository.JobCategory.qry}
                  name='categoryId'
                  label={labels.category}
                  columnsInDropDown={[
                    { key: 'reference', value: 'Reference' },
                    { key: 'name', value: 'Name' }
                  ]}
                  valueField='recordId'
                  displayField='name'
                  readOnly={isCancelled || isReleased || isPosted}
                  values={formik.values}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('categoryId', newValue?.recordId)
                  }}
                  error={formik.touched.categoryId && Boolean(formik.errors.categoryId)}
                />
              </Grid>
              <Grid item xs={12}>
                <ResourceComboBox
                  endpointId={InventoryRepository.Category.qry}
                  parameters='_pagesize=1000&_startAt=0&_name='
                  name='itemCategoryId'
                  label={labels.itemCategory}
                  readOnly
                  valueField='recordId'
                  displayField={['caRef', 'name']}
                  values={formik.values}
                  error={formik.touched.itemCategoryId && Boolean(formik.errors.itemCategoryId)}
                  maxAccess={maxAccess}
                />
              </Grid>
              <Grid item xs={12}>
                <ResourceComboBox
                  endpointId={SaleRepository.SalesPerson.qry}
                  name='spId'
                  label={labels.orderedBy}
                  columnsInDropDown={[
                    { key: 'spRef', value: 'Reference' },
                    { key: 'name', value: 'Name' }
                  ]}
                  valueField='recordId'
                  displayField='name'
                  readOnly={isCancelled || isReleased || isPosted}
                  values={formik.values}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('spId', newValue?.recordId)
                  }}
                  error={formik.touched.spId && Boolean(formik.errors.spId)}
                />
              </Grid>
              <Grid item xs={12}>
                <ResourceLookup
                  endpointId={SaleRepository.Client.snapshot}
                  name='clientId'
                  label={labels.client}
                  valueField='reference'
                  displayField='name'
                  valueShow='clientRef'
                  secondValueShow='clientName'
                  form={formik}
                  columnsInDropDown={[
                    { key: 'reference', value: 'Reference' },
                    { key: 'name', value: 'Name' }
                  ]}
                  onChange={async (event, newValue) => {
                    await fillBillingInfo(newValue)
                  }}
                  secondFieldName={'clientName'}
                  errorCheck={'clientId'}
                  maxAccess={maxAccess}
                  readOnly={isCancelled || isReleased || isPosted}
                  displayFieldWidth={3}
                  editMode={editMode}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextArea
                  name='billAddress'
                  label={labels.billAddress}
                  value={formik.values.billAddress}
                  rows={3.5}
                  maxLength='100'
                  readOnly={isCancelled || isReleased || isPosted}
                  maxAccess={maxAccess}
                  onChange={e => formik.setFieldValue('billAddress', e.target.value)}
                  onClear={() => formik.setFieldValue('billAddress', null)}
                />
              </Grid>
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}
