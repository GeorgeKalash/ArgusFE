import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import { formatDateFromApi, formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'
import { Grid } from '@mui/material'
import { useContext, useEffect, useRef, useState } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import CustomTextArea from '@argus/shared-ui/src/components/Inputs/CustomTextArea'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { SaleRepository } from '@argus/repositories/src/repositories/SaleRepository'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import WorkFlow from '@argus/shared-ui/src/components/Shared/WorkFlow'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { useDocumentType } from '@argus/shared-hooks/src/hooks/documentReferenceBehaviors'
import { ManufacturingRepository } from '@argus/repositories/src/repositories/ManufacturingRepository'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import ImageUpload from '@argus/shared-ui/src/components/Inputs/ImageUpload'
import SerialsLots from './SerialsLots'
import ConfirmationDialog from '@argus/shared-ui/src/components/ConfirmationDialog'
import Samples from './Samples'
import { ProductModelingRepository } from '@argus/repositories/src/repositories/ProductModelingRepository'
import NormalDialog from '@argus/shared-ui/src/components/Shared/NormalDialog'
import { LockedScreensContext } from '@argus/shared-providers/src/providers/LockedScreensContext'

export default function JobOrderForm({
  labels,
  maxAccess: access,
  setStore,
  store,
  setRefetchRouting,
  invalidate,
  lockRecord,
  refetchJob,
  setRefetchJob,
  window
}) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)
  const imageUploadRef = useRef(null)
  const recordId = store?.recordId
  const [imageSource, setImageSource] = useState(null)
  const [parentImage, setParentImage] = useState({ recordId: null, resourceId: null })
  const { addLockedScreen } = useContext(LockedScreensContext)

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
    description: '',
    weight: 0,
    qty: 0,
    pcs: 0,
    stdWeight: 0,
    netSerialsWeight: 0,
    producedWgt: 0,
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
    rubberId: null,
    threeDDId: null,
    status: 1,
    itemFromDesign: false,
    standardCost: null
  }

  const { formik } = useForm({
    maxAccess,
    documentType: { key: 'dtId', value: documentType?.dtId },
    initialValues,
    validationSchema: yup.object({
      date: yup.string().required(),
      expectedQty: yup.number().required(),
      expectedPcs: yup.number().moreThan(0).required(),
      workCenterId: yup.number().required()
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
      const reference = await refetchForm(res.recordId)
      if (window.setTitle && !editMode) {
        window.setTitle(reference ? `${labels.jobOrder} ${reference}` : labels.jobOrder)
      }
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
      datasetId: ResourceIds.GLMFJobOrders,
      disabled: !editMode,
      error: !formik?.values?.endingDT ? { message: labels.emptyEndingDate } : null,
      values: { ...formik.values, date: formik?.values?.endingDT, notes: formik?.values?.description }
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
      onClick: openSerials
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
    if (Object.keys(formik?.errors)?.length > 0) {
      onValidationRequired()

      return
    }

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
    if (Object.keys(formik?.errors)?.length > 0) {
      onValidationRequired()

      return
    }

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
    toast.success(platformLabels.Posted)
    lockRecord({
      recordId: res.recordId,
      reference: formik.values.reference,
      resourceId: ResourceIds.MFJobOrders,
      onSuccess: () => {
        addLockedScreen({
          resourceId: ResourceIds.MFJobOrders,
          recordId: res.recordId,
          reference: formik.values.reference
        })
        refetchForm(res.recordId)
        setStore(prevStore => ({
          ...prevStore,
          isPosted: true
        }))
      },
      isAlreadyLocked: name => {
        window.close()
        stack({
          Component: NormalDialog,
          props: {
            DialogText: `${platformLabels.RecordLocked} ${name}`,
            width: 600,
            height: 200,
            title: platformLabels.Dialog
          }
        })
      }
    })

    invalidate()
  }
  async function onWorkFlowClick() {
    stack({
      Component: WorkFlow,
      props: {
        functionId: SystemFunction.JobOrder,
        recordId: formik.values.recordId
      }
    })
  }
  function openSerials() {
    stack({
      Component: SerialsLots,
      props: {
        labels,
        maxAccess,
        api: ManufacturingRepository.MFSerial.qry,
        parameters: `_jobId=${recordId}`
      }
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
      extension: ManufacturingRepository.MFJobOrder.get2,
      parameters: `_recordId=${recordId}`
    })
    const { jobOrder, ...rest } = res?.record || {}
    formik.setValues({
      ...jobOrder,
      date: formatDateFromApi(jobOrder?.date),
      endingDT: formatDateFromApi(jobOrder?.endingDT),
      startingDT: formatDateFromApi(jobOrder?.startingDT),
      deliveryDate: formatDateFromApi(jobOrder?.deliveryDate)
    })

    setStore(prevStore => ({
      ...prevStore,
      recordId: jobOrder?.recordId,
      isPosted: jobOrder?.status == 3,
      jobReference: jobOrder?.reference,
      isCancelled: jobOrder?.status == -1,
      status: jobOrder?.status,
      routingId: jobOrder?.routingId || null,
      ...rest
    }))

    !formik.values.recordId &&
      lockRecord({
        recordId: jobOrder?.recordId,
        reference: jobOrder?.reference,
        resourceId: ResourceIds.MFJobOrders,
        onSuccess: () => {
          addLockedScreen({
            resourceId: ResourceIds.MFJobOrders,
            recordId: jobOrder?.recordId,
            reference: jobOrder?.reference
          })
        }
      })

    return jobOrder?.reference
  }

  async function getRouting(recordId) {
    if (!recordId) return

    return await getRequest({
      extension: ManufacturingRepository.Routing.get,
      parameters: `_recordId=${recordId}`
    })
  }

  async function fillItemInfo(values) {
    if (imageSource == 2) updateParent(values.recordId, imageSource)
    if (!values?.recordId) {
      formik.setFieldValue('itemId', null)
      formik.setFieldValue('itemName', null)
      formik.setFieldValue('sku', null)
      formik.setFieldValue('itemsPL', null)
      formik.setFieldValue('stdWeight', null)
      formik.setFieldValue('itemCategoryId', null)
      formik.setFieldValue('itemFromDesign', false)

      return
    }

    const ItemPhysProp = await getRequest({
      extension: InventoryRepository.Physical.get,
      parameters: `_itemId=${values?.recordId}`
    })

    const ItemProduction = await getRequest({
      extension: InventoryRepository.ItemProduction.get,
      parameters: `_recordId=${values?.recordId}`
    })
    formik.setFieldValue('itemId', values?.recordId)
    formik.setFieldValue('itemName', values?.name)
    formik.setFieldValue('sku', values?.sku)
    formik.setFieldValue('stdWeight', ItemPhysProp?.record?.weight)
    formik.setFieldValue(
      'expectedQty',
      !ItemPhysProp?.record?.weight || !formik.values.expectedPcs
        ? 0
        : formik.values.expectedPcs * ItemPhysProp?.record?.weight
    )
    formik.setFieldValue('itemsPL', ItemProduction?.record?.lineId)
    formik.setFieldValue('lineId', ItemProduction?.record?.lineId)
    formik.setFieldValue('itemCategoryId', values?.categoryId)
  }
  async function fillDesignInfo(values) {
    if (imageSource == 1) updateParent(values.recordId, imageSource)
    else if (imageSource == 2) updateParent(values.itemId, imageSource)
    formik.setFieldValue('designId', values?.recordId || null)
    formik.setFieldValue('designRef', values?.reference || '')
    formik.setFieldValue('designName', values?.name || '')
    formik.setFieldValue('stdWeight', values?.stdWeight)
    formik.setFieldValue(
      'expectedQty',
      !values?.stdWeight || !formik.values.expectedPcs ? 0 : formik.values.expectedPcs * values?.stdWeight
    )
    if (!isReleased) {
      const routing = await getRouting(values?.routingId)
      if (routing?.record?.isInactive) {
        formik.setFieldValue('routingId', null)
        formik.setFieldValue('routingRef', null)
        formik.setFieldValue('routingName', null)
      } else {
        formik.setFieldValue('routingId', values?.routingId || null)
        formik.setFieldValue('routingRef', values?.routingRef)
        formik.setFieldValue('routingName', values?.routingName)
      }
    }
    formik.setFieldValue('lineId', values?.lineId)
    formik.setFieldValue('designPL', values?.lineId)
    formik.setFieldValue('classId', values?.classId)
    formik.setFieldValue('standardId', values?.standardId)
    formik.setFieldValue('itemCategoryId', values?.itemCategoryId || null)
    formik.setFieldValue('threeDDId', values?.threeDDId)
    formik.setFieldValue('threeDDRef', values?.threeDDRef)
    formik.setFieldValue('rubberId', values?.rubberId)
    formik.setFieldValue('rubberRef', values?.rubberRef)
    formik.setFieldValue('itemId', values?.itemId)
    formik.setFieldValue('itemName', values?.itemName)
    formik.setFieldValue('sku', values?.sku)
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

  async function updateWC(routingId, isRouting) {
    if (!routingId) {
      if (!isRouting) {
        formik.setFieldValue('wcRef', null)
        formik.setFieldValue('wcName', null)
        formik.setFieldValue('workCenterId', null)
      }

      return
    }

    const res = await getRequest({
      extension: ManufacturingRepository.RoutingSequence.qry,
      parameters: `_routingId=${routingId}`
    })

    formik.setFieldValue('wcRef', res?.list[0]?.workCenterRef || '')
    formik.setFieldValue('wcName', res?.list[0]?.workCenterName || '')
    formik.setFieldValue('workCenterId', res?.list[0]?.workCenterId || null)
  }
  function updateParent(recordId, imgSource) {
    setParentImage({
      recordId,
      resourceId:
        imgSource == 1
          ? ResourceIds.Design
          : imgSource == 2
          ? ResourceIds.Item
          : imgSource == 3
          ? ResourceIds.MFJobOrders
          : null
    })
  }
  async function onValidationRequired() {
    if (Object.keys(await formik.validateForm()).length) {
      const errors = await formik.validateForm()

      const touchedFields = Object.keys(errors).reduce((acc, key) => {
        if (!formik.touched[key]) {
          acc[key] = true
        }

        return acc
      }, {})

      if (Object.keys(touchedFields).length) {
        formik.setTouched(touchedFields, true)
      }
    }
  }

  useEffect(() => {
    ;(async function () {
      if (!editMode)
        if (formik.values.dtId) {
          const dtd = await getRequest({
            extension: ManufacturingRepository.DocumentTypeDefault.get,
            parameters: `_dtId=${formik.values.dtId}`
          })

          formik.setFieldValue('plantId', dtd?.record?.plantId || null)
        } else {
          formik.setFieldValue('plantId', null)
        }
    })()
  }, [formik.values.dtId])

  useEffect(() => {
    if (recordId && refetchJob) refetchForm(recordId)
    setRefetchJob(false)
  }, [refetchJob])

  useEffect(() => {
    ;(async function () {
      const res = await getRequest({
        extension: SystemRepository.Defaults.get,
        parameters: `_filter=&_key=mf_jo_pic_source`
      })
      setImageSource(res?.record?.value || 3)

      if (recordId) await refetchForm(recordId)
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
                  endpointId={ManufacturingRepository.MFJobOrder.pack}
                  reducer={response => response?.record?.documentTypes}
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
                  onChange={(_, newValue) => {
                    formik.setFieldValue('dtId', newValue?.recordId)
                    changeDT(newValue)
                  }}
                  error={formik.touched.dtId && Boolean(formik.errors.dtId)}
                />
              </Grid>
              <Grid container item xs={12} spacing={2}>
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
                    <Grid item xs={12}>
                      <ResourceComboBox
                        endpointId={ManufacturingRepository.MFJobOrder.pack}
                        reducer={response => response?.record?.plants}
                        name='plantId'
                        label={platformLabels.plant}
                        valueField='recordId'
                        displayField={['reference', 'name']}
                        columnsInDropDown={[
                          { key: 'reference', value: 'plant Ref' },
                          { key: 'name', value: 'Name' }
                        ]}
                        values={formik.values}
                        readOnly={isCancelled || isPosted}
                        onChange={(_, newValue) => {
                          formik.setFieldValue('plantId', newValue?.recordId || null)
                        }}
                        error={formik.touched.plantId && Boolean(formik.errors.plantId)}
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
                        onChange={async (_, newValue) => {
                          if (isReleased) {
                            formik.setFieldValue('itemId', newValue?.recordId || null)
                            formik.setFieldValue('itemName', newValue?.name || '')
                            formik.setFieldValue('sku', newValue?.sku || '')

                            return
                          }
                          await fillItemInfo(newValue)
                        }}
                        errorCheck={'itemId'}
                        maxAccess={maxAccess}
                      />
                    </Grid>
                    <Grid item>
                      <ResourceComboBox
                        endpointId={ManufacturingRepository.MFJobOrder.pack}
                        reducer={response => response?.record?.itemSizes}
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
                        onChange={(_, newValue) => {
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
                        onClear={() => {
                          formik.setFieldValue('expectedPcs', 0)
                          formik.setFieldValue('expectedQty', 0)
                        }}
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
                        readOnly={isCancelled || isPosted}
                        onChange={async (_, newValue) => {
                          if (isReleased) {
                            formik.setFieldValue('designRef', newValue?.reference || '')
                            formik.setFieldValue('designName', newValue?.name || '')
                            formik.setFieldValue('designId', newValue?.recordId || null)

                            return
                          }
                          await fillDesignInfo(newValue)
                          await updateWC(newValue?.routingId, false)
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
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <CustomTextArea
                        name='description'
                        label={labels.description}
                        value={formik.values.description}
                        rows={2.8}
                        maxAccess={maxAccess}
                        readOnly={isCancelled || isPosted}
                        onChange={formik.handleChange}
                        onClear={() => formik.setFieldValue('description', '')}
                        error={formik.touched.description && Boolean(formik.errors.description)}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <CustomNumberField
                        name='stdWeight'
                        label={labels.itemWeight}
                        value={formik.values.stdWeight}
                        readOnly
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <CustomNumberField
                        name='standardCost'
                        label={labels.standardCost}
                        value={formik.values.standardCost}
                        readOnly
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <CustomNumberField
                        name='avgWeight'
                        label={labels.avgWeight}
                        value={formik.values.avgWeight}
                        readOnly
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <ResourceComboBox
                        endpointId={ManufacturingRepository.MFJobOrder.pack}
                        reducer={response => response?.record?.productionLines}
                        name='lineId'
                        label={labels.line}
                        values={formik.values}
                        valueField='recordId'
                        displayField='name'
                        maxAccess={maxAccess}
                        readOnly={isCancelled || isPosted}
                        onChange={(_, newValue) => {
                          formik.setFieldValue('lineId', newValue?.recordId)
                        }}
                        error={formik.touched.lineId && Boolean(formik.errors.lineId)}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <ResourceLookup
                        endpointId={ManufacturingRepository.Routing.snapshot}
                        valueField='reference'
                        displayField='name'
                        name='routingId'
                        label={labels.routing}
                        form={formik}
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
                        onChange={async (_, newValue) => {
                          await updateWC(newValue?.recordId, true)
                          formik.setFieldValue('routingRef', newValue?.reference || null)
                          formik.setFieldValue('routingName', newValue?.name || null)
                          formik.setFieldValue('routingId', newValue?.recordId || null)
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
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
                        readOnly={formik?.values?.routingId || formik?.values?.designId}
                        displayFieldWidth={2}
                        onChange={(_, newValue) => {
                          formik.setFieldValue('wcRef', newValue?.reference || '')
                          formik.setFieldValue('wcName', newValue?.name || '')
                          formik.setFieldValue('workCenterId', newValue?.recordId || null)
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <CustomNumberField
                        name='qty'
                        label={labels.netProduction}
                        value={formik.values.qty}
                        readOnly
                        maxAccess={maxAccess}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <CustomNumberField
                        name='pcs'
                        label={labels.producedPcs}
                        value={formik.values.pcs}
                        readOnly
                        maxAccess={maxAccess}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <CustomNumberField
                        name='RMCost'
                        label={labels.rmCost}
                        value={formik.values.RMCost}
                        readOnly
                        maxAccess={maxAccess}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <ResourceComboBox
                        endpointId={ManufacturingRepository.MFJobOrder.pack}
                        reducer={response => response?.record?.productionClasses}
                        values={formik.values}
                        name='classId'
                        label={labels.productionClass}
                        valueField='recordId'
                        displayField='name'
                        maxAccess={maxAccess}
                        readOnly={isCancelled || isReleased || isPosted}
                        onChange={(_, newValue) => {
                          formik.setFieldValue('classId', newValue?.recordId)
                        }}
                        error={formik.touched.classId && Boolean(formik.errors.classId)}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <ResourceComboBox
                        endpointId={ManufacturingRepository.MFJobOrder.pack}
                        reducer={response => response?.record?.productionStandards}
                        values={formik.values}
                        name='standardId'
                        label={labels.productionStandard}
                        valueField='recordId'
                        displayField='reference'
                        readOnly={isCancelled || isReleased || isPosted}
                        maxAccess={maxAccess}
                        onChange={(_, newValue) => {
                          formik.setFieldValue('standardId', newValue?.recordId)
                        }}
                        error={formik.touched.standardId && Boolean(formik.errors.standardId)}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid container spacing={2} xs={4} sx={{ pl: 2 }}>
              <Grid item>
                <ImageUpload
                  ref={imageUploadRef}
                  resourceId={ResourceIds.MFJobOrders}
                  recordId={formik.values.recordId}
                  seqNo={0}
                  customWidth={300}
                  customHeight={180}
                  disabled={isCancelled || isPosted}
                  isAbsolutePath={true}
                  parentImage={parentImage}
                />
              </Grid>
              <Grid item xs={12}>
                <ResourceComboBox
                  endpointId={ManufacturingRepository.MFJobOrder.pack}
                  reducer={response => response?.record?.jobCategories}
                  name='categoryId'
                  label={labels.category}
                  columnsInDropDown={[
                    { key: 'reference', value: 'Reference' },
                    { key: 'name', value: 'Name' }
                  ]}
                  valueField='recordId'
                  maxAccess={maxAccess}
                  displayField='name'
                  readOnly={isCancelled || isReleased || isPosted}
                  values={formik.values}
                  onChange={(_, newValue) => {
                    formik.setFieldValue('categoryId', newValue?.recordId)
                  }}
                  error={formik.touched.categoryId && Boolean(formik.errors.categoryId)}
                />
              </Grid>
              <Grid item xs={12}>
                <ResourceComboBox
                  endpointId={ManufacturingRepository.MFJobOrder.pack}
                  reducer={response => response?.record?.categories}
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
                <ResourceLookup
                  endpointId={ProductModelingRepository.ThreeDDrawing.snapshot2}
                  valueField='reference'
                  displayField='reference'
                  secondDisplayField={false}
                  name='threeDDId'
                  label={labels.threeDD}
                  form={formik}
                  valueShow='threeDDRef'
                  maxAccess={maxAccess}
                  readOnly={isCancelled || isReleased || isPosted}
                  onChange={(_, newValue) => {
                    formik.setFieldValue('threeDDId', newValue?.recordId || null)
                    formik.setFieldValue('threeDDRef', newValue?.reference || '')
                    formik.setFieldValue('fileReference', newValue?.fileReference || '')
                  }}
                  errorCheck={'threeDDId'}
                />
              </Grid>
              <Grid item xs={12}>
                <ResourceLookup
                  endpointId={ProductModelingRepository.Rubber.snapshot}
                  valueField='reference'
                  displayField='reference'
                  secondDisplayField={false}
                  name='rubberId'
                  label={labels.rubber}
                  form={formik}
                  valueShow='rubberRef'
                  maxAccess={maxAccess}
                  readOnly={isCancelled || isReleased || isPosted}
                  onChange={(_, newValue) => {
                    formik.setFieldValue('rubberId', newValue?.recordId || null)
                    formik.setFieldValue('rubberRef', newValue?.reference || '')
                  }}
                  errorCheck={'rubberId'}
                />
              </Grid>
              <Grid item xs={12}>
                <ResourceComboBox
                  endpointId={ManufacturingRepository.MFJobOrder.pack}
                  reducer={response => response?.record?.salesPeople}
                  name='spId'
                  label={labels.orderedBy}
                  columnsInDropDown={[
                    { key: 'spRef', value: 'Reference' },
                    { key: 'name', value: 'Name' }
                  ]}
                  valueField='recordId'
                  maxAccess={maxAccess}
                  displayField='name'
                  readOnly={isCancelled || isReleased || isPosted}
                  values={formik.values}
                  onChange={(_, newValue) => {
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
                  onChange={async (_, newValue) => {
                    await fillBillingInfo(newValue)
                    formik.setFieldValue('clientName', newValue?.name || '')
                    formik.setFieldValue('clientRef', newValue?.reference || '')

                    formik.setFieldValue('clientId', newValue?.recordId || null)
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
