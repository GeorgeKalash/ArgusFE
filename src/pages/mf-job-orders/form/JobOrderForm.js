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

export default function JobOrderForm({ labels, access, setStore, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)
  const imageUploadRef = useRef(null)
  const [plStore, setPlStore] = useState([])

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.JobOrder,
    access: access,
    enabled: !recordId
  })

  const initialValues = {
    recordId: recordId || null,
    dtId: documentType?.dtId,
    reference: '',
    date: new Date(),
    plantId: '',
    designId: '',
    workCenterId: '',
    itemId: '',
    clientId: '',
    routingId: '',
    routingSeqNo: '',
    startingDT: null,
    endingDT: null,
    description: '',
    weight: '',
    qty: '',
    pcs: '',
    stdWeight: '',
    netSerialsWeight: '',
    producedWgt: '',
    itemWeight: '',
    stdWeight: '',
    expectedQty: '',
    expectedPcs: '',
    RMCost: '',
    deliveryDate: null,
    spId: '',
    sizeId: '',
    lineId: '',
    itemsPL: '',
    designPL: '',
    trackBy: '',
    avgWeight: '',
    categoryId: '',
    itemCategoryId: '',
    classId: '',
    standardId: ''
  }

  const invalidate = useInvalidate({
    endpointId: ManufacturingRepository.MFJobOrder.qry
  })

  const { formik } = useForm({
    maxAccess,
    initialValues,
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      date: yup.string().required()
    }),
    onSubmit: async obj => {
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

      const actionMessage = editMode ? platformLabels.Edited : platformLabels.Added
      toast.success(actionMessage)
      setStore(res?.recordId)
      await refetchForm(res.recordId)
      invalidate()
    }
  })

  const editMode = !!formik.values.recordId
  const isCancelled = formik.values.status == -1
  const isReleased = formik.values.status == 4
  const isPosted = formik.values.status == 3

  async function onCancel() {
    const res = await postRequest({
      extension: ManufacturingRepository.MFJobOrder.cancel,
      record: JSON.stringify({
        ...formik.values,
        date: formatDateToApi(formik.values.date),
        deliveryDate: formik.values.deliveryDate ? formatDateToApi(formik.values.deliveryDate) : null
      })
    })
    toast.success(platformLabels.Cancel)
    invalidate()
    await refetchForm(res.recordId)
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

  const actions = [
    {
      key: 'Locked',
      condition: isPosted,
      onClick: 'onUnpostConfirmation',
      onSuccess: () => {},
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
      onClick: onCancel,
      disabled: isCancelled || isPosted
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
      disabled: !editMode || (!isReleased && formik.values.trackBy == 1)
    }
  ]
  console.log('check condition ', !editMode, !isReleased, formik.values.trackBy == 1)
  function openSerials() {
    stack({
      Component: SerialsLots,
      props: { labels, maxAccess, recordId: formik.values.recordId, itemId: formik.values.itemId },
      width: 500,
      height: 600,
      title: labels.seriallot
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
  }

  async function fillItemInfo(values) {
    if (!values?.recordId) {
      formik.setFieldValue('itemId', null)
      formik.setFieldValue('itemName', null)
      formik.setFieldValue('sku', null)
      formik.setFieldValue('itemsPL', null)
      formik.setFieldValue('itemWeight', null)

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
    formik.setFieldValue('itemsPL', ItemProduction?.record?.lineId)
    formik.setFieldValue('lineId', ItemProduction?.record?.lineId)
    formik.setFieldValue('itemWeight', ItemPhysProp?.record?.weight)
  }
  async function fillDesignInfo(values) {
    formik.setFieldValue('designId', values?.recordId)
    formik.setFieldValue('designRef', values?.reference)
    formik.setFieldValue('designName', values?.name)
    formik.setFieldValue('stdWeight', values?.stdWeight)
    formik.setFieldValue(
      'expectedQty',
      !values?.stdWeight || !formik.values.expectedPcs ? 0 : formik.values.expectedPcs * values?.stdWeight
    )
    formik.setFieldValue('itemId', values?.itemId)
    formik.setFieldValue('itemName', values?.itemName)
    formik.setFieldValue('sku', values?.sku)
    formik.setFieldValue('routingId', values?.routingId)
    formik.setFieldValue('lineId', values?.lineId)
    formik.setFieldValue('designPL', values?.lineId)
    await updateWC(values?.routingId)
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
    if (!routingId) return

    const res = await getRequest({
      extension: ManufacturingRepository.RoutingSequence.qry,
      parameters: `_routingId=${routingId}`
    })

    formik.setFieldValue('workCenterId', res.list[0].workCenterId)
    formik.setFieldValue('wcRef', res.list[0].workCenterRef)
    formik.setFieldValue('wcName', res.list[0].workCenterName)
  }

  useEffect(() => {
    if (documentType?.dtId) formik.setFieldValue('dtId', documentType.dtId)
  }, [documentType?.dtId])

  useEffect(() => {
    ;(async function () {
      !formik?.values?.itemId ? await getAllLines() : await getFilteredLines(formik.values.itemId)
    })()
  }, [formik?.values?.itemId])

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
            {/*1st column*/}
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
                    formik.setFieldValue('dtId', newValue ? newValue.recordId : null)
                    changeDT(newValue)
                  }}
                  error={formik.touched.dtId && Boolean(formik.errors.dtId)}
                />
              </Grid>

              <Grid container item xs={12} spacing={4}>
                {/* First Column Container */}
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
                        readOnly={editMode}
                        label={labels.date}
                        value={formik?.values?.date}
                        onChange={formik.setFieldValue}
                        editMode={editMode}
                        maxAccess={maxAccess}
                        onClear={() => formik.setFieldValue('date', '')}
                        error={formik.touched.date && Boolean(formik.errors.date)}
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
                        readOnly={true}
                        onClear={() => formik.setFieldValue('startingDT', '')}
                        error={formik.touched.startingDT && Boolean(formik.errors.startingDT)}
                      />
                    </Grid>
                    <Grid item>
                      <CustomDatePicker
                        name='endingDT'
                        readOnly={true}
                        label={labels.endingDate}
                        value={formik?.values?.endingDT}
                        onChange={formik.setFieldValue}
                        editMode={editMode}
                        maxAccess={maxAccess}
                        onClear={() => formik.setFieldValue('endingDT', '')}
                        error={formik.touched.endingDT && Boolean(formik.errors.endingDT)}
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
                        onClear={() => formik.setFieldValue('deliveryDate', '')}
                        error={formik.touched.deliveryDate && Boolean(formik.errors.deliveryDate)}
                      />
                    </Grid>
                    <Grid item>
                      <ResourceLookup
                        endpointId={InventoryRepository.Item.snapshot}
                        name='itemId'
                        readOnly={isCancelled || isPosted}
                        label={labels.item}
                        valueField='recordId'
                        displayField='sku'
                        valueShow='sku'
                        secondValueShow='itemName'
                        required
                        columnsInDropDown={[
                          { key: 'sku', value: 'SKU' },
                          { key: 'itemName', value: 'Name' }
                        ]}
                        form={formik}
                        displayFieldWidth={2}
                        onChange={async (event, newValue) => {
                          await fillItemInfo(newValue)
                        }}
                        errorCheck={'sku'}
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
                        readOnly={isCancelled || isReleased || isPosted}
                        onChange={e => formik.setFieldValue('expectedQty', e.target.value)}
                        onClear={() => formik.setFieldValue('expectedQty', '')}
                        error={formik.touched.expectedQty && Boolean(formik.errors.expectedQty)}
                      />
                    </Grid>
                    <Grid item>
                      <CustomNumberField
                        name='expectedPcs'
                        label={labels.expectedPcs}
                        value={formik.values.expectedPcs}
                        readOnly={isCancelled || isReleased || isPosted}
                        onChange={e => {
                          formik.setFieldValue('expectedPcs', e.target.value)
                          formik.setFieldValue(
                            'expectedQty',
                            formik.values.stdWeight ? formik.values.stdWeight * e.target.value : 0
                          )
                        }}
                        onClear={() => formik.setFieldValue('expectedPcs', '')}
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
                        readOnly={editMode}
                        onChange={(event, newValue) => fillDesignInfo(newValue)}
                      />
                    </Grid>
                    <Grid item>
                      <CustomNumberField
                        name='netSerialsWeight'
                        label={labels.netSerialsWeight}
                        value={formik.values.netSerialsWeight}
                        readOnly={true}
                        onChange={e => formik.setFieldValue('netSerialsWeight', e.target.value)}
                        onClear={() => formik.setFieldValue('netSerialsWeight', '')}
                        error={formik.touched.netSerialsWeight && Boolean(formik.errors.netSerialsWeight)}
                      />
                    </Grid>
                  </Grid>
                </Grid>

                {/* Second Column Container */}
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
                        onClear={() => formik.setFieldValue('description', '')}
                      />
                    </Grid>
                    <Grid item>
                      <CustomNumberField
                        name='itemWeight'
                        label={labels.itemWeight}
                        value={formik.values.itemWeight}
                        readOnly={true}
                        onChange={e => formik.setFieldValue('itemWeight', e.target.value)}
                        onClear={() => formik.setFieldValue('itemWeight', '')}
                        error={formik.touched.itemWeight && Boolean(formik.errors.itemWeight)}
                      />
                    </Grid>
                    <Grid item>
                      <CustomNumberField
                        name='avgWeight'
                        label={labels.avgWeight}
                        value={formik.values.avgWeight}
                        readOnly={true}
                        onChange={e => formik.setFieldValue('avgWeight', e.target.value)}
                        onClear={() => formik.setFieldValue('avgWeight', '')}
                        error={formik.touched.avgWeight && Boolean(formik.errors.avgWeight)}
                      />
                    </Grid>
                    <Grid item>
                      <CustomComboBox
                        store={plStore}
                        name='lineId'
                        label={labels.line}
                        valueField='recordId'
                        displayField='name'
                        readOnly={editMode ? true : formik.values.itemsPL || formik.values.designPL}
                        value={formik.values.lineId}
                        onChange={(event, newValue) => {
                          formik.setFieldValue('lineId', newValue?.recordId)
                          formik.setFieldValue('routingId', newValue?.routingId)
                        }}
                        error={formik.touched.lineId && Boolean(formik.errors.lineId)}
                      />
                    </Grid>
                    <Grid item>
                      <ResourceComboBox
                        endpointId={ManufacturingRepository.Routing.qry}
                        parameters={`_params=`}
                        name='routingId'
                        label={labels.routing}
                        valueField='recordId'
                        displayField={['reference', 'name']}
                        columnsInDropDown={[
                          { key: 'reference', value: 'Reference' },
                          { key: 'name', value: 'Name' }
                        ]}
                        readOnly={isCancelled || isReleased || isPosted}
                        values={formik.values}
                        onChange={async (event, newValue) => {
                          formik.setFieldValue('routingId', newValue?.recordId)
                          await updateWC(newValue?.recordId)
                        }}
                        error={formik.touched.routingId && Boolean(formik.errors.routingId)}
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
                      <CustomNumberField
                        name='qty'
                        label={labels.netProduction}
                        value={formik.values.qty}
                        readOnly={true}
                        onChange={e => formik.setFieldValue('qty', e.target.value)}
                        onClear={() => formik.setFieldValue('qty', '')}
                        error={formik.touched.qty && Boolean(formik.errors.qty)}
                      />
                    </Grid>
                    <Grid item>
                      <CustomNumberField
                        name='pcs'
                        label={labels.producedPcs}
                        value={formik.values.pcs}
                        readOnly={true}
                        onChange={e => formik.setFieldValue('pcs', e.target.value)}
                        onClear={() => formik.setFieldValue('pcs', '')}
                        error={formik.touched.pcs && Boolean(formik.errors.pcs)}
                      />
                    </Grid>
                    <Grid item>
                      <CustomNumberField
                        name='RMCost'
                        label={labels.rmCost}
                        value={formik.values.RMCost}
                        readOnly={true}
                        onChange={e => formik.setFieldValue('RMCost', e.target.value)}
                        onClear={() => formik.setFieldValue('RMCost', '')}
                        error={formik.touched.RMCost && Boolean(formik.errors.RMCost)}
                      />
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

            {/*2nd column*/}
            <Grid container xs={4} sx={{ pl: 3 }}>
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
                  parameters='_pagesize=30&_startAt=0&_name='
                  name='itemCategoryId'
                  label={labels.itemCategory}
                  readOnly={isCancelled || isReleased || isPosted}
                  valueField='recordId'
                  displayField={['caRef', 'name']}
                  columnsInDropDown={[
                    { key: 'caRef', value: 'Reference' },
                    { key: 'name', value: 'Name' }
                  ]}
                  values={formik.values}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('itemCategoryId', newValue?.recordId)
                  }}
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
                  onClear={() => formik.setFieldValue('billAddress', '')}
                />
              </Grid>
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}
