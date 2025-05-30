import { Grid } from '@mui/material'
import { useContext, useEffect, useRef } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
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
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import CustomButton from 'src/components/Inputs/CustomButton'
import ConfirmationDialog from 'src/components/ConfirmationDialog'
import { useWindow } from 'src/windows'
import { useError } from 'src/error'
import LotForm from './LotForm'

export default function AssemblyForm({ labels, maxAccess: access, store, setStore, totalOverhead }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels, defaultsData, userDefaultsData } = useContext(ControlContext)
  const recordId = store?.recordId
  const currentItemId = useRef(null)
  const { stack } = useWindow()
  const { stack: stackError } = useError()

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.Assembly,
    access,
    enabled: !recordId
  })

  const invalidate = useInvalidate({
    endpointId: ManufacturingRepository.Assembly.page
  })

  const hiddenMuId = defaultsData?.list?.find(({ key }) => key === 'mf_mu')?.value == 1
  const siteId = userDefaultsData?.list?.find(({ key }) => key === 'siteId')?.value

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      bomId: null,
      bomName: '',
      bomRef: '',
      sku: null,
      itemId: null,
      itemName: '',
      siteId: parseInt(siteId) || null,
      qty: 0,
      rmCost: 0,
      notes: '',
      dtId: null,
      reference: '',
      status: 1,
      releaseStatus: null,
      date: new Date(),
      plantId: null,
      machineId: null,
      machineName: '',
      machineRef: '',
      batches: 0,
      batchSize: 0,
      trackBy: null,
      lotCategoryId: null,
      labourId: null,
      shiftId: null,
      items: []
    },
    maxAccess,
    documentType: { key: 'dtId', value: documentType?.dtId },
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      date: yup.date().required(),
      dtId: yup.string().required(),
      siteId: yup.string().required(),
      qty: yup.number().required(),
      itemId: yup.string().required(),
      items: yup
        .array()
        .of(
          yup.object().shape({
            sku: yup.string().required(),
            itemName: yup.string().required(),
            siteName: yup.string().required(),
            siteRef: yup.string().required(),
            qty: yup.number().required(),
            diffQty: yup.number().required()
          })
        )
        .required()
    }),
    onSubmit: async () => {
      const updatedRows = formik?.values?.items.map((itemDetails, index) => {
        return {
          ...itemDetails,
          seqNo: index + 1,
          transferId: formik.values.recordId || 0,
          baseQty: !hiddenMuId && itemDetails.muId ? itemDetails.qty * itemDetails.muQty : itemDetails.qty
        }
      })

      const resultObject = {
        header: { ...formik.values, date: formatDateToApi(formik.values.date) },
        items: updatedRows
      }

      const res = await postRequest({
        extension: ManufacturingRepository.Assembly.set2,
        record: JSON.stringify(resultObject)
      })
      refetchForm(res.recordId)
      toast.success(recordId ? platformLabels.Edited : platformLabels.Added)
      invalidate()
    }
  })

  const isPosted = formik.values.status === 3
  const editMode = !!formik.values.recordId

  const totalCost = formik.values.items
    .reduce((currentCost, row) => {
      const totalCostValue =
        (parseFloat(row.qty?.toString().replace(/,/g, '')) || 0) *
        (parseFloat(row.cost?.toString().replace(/,/g, '')) || 0)

      return currentCost + totalCostValue
    }, 0)
    .toFixed(2)

  const avgUnitCost = ((Number(totalCost) || 0) + (Number(totalOverhead) || 0)) / (Number(formik.values.qty) || 0)

  const designQuantity = formik.values.items.reduce((currentQty, row) => {
    const qtyValue = parseFloat(row.designQty?.toString().replace(/,/g, '')) || 0

    return currentQty + qtyValue
  }, 0)

  const diffQuantity = formik.values.items.reduce((currentQty, row) => {
    const qtyValue = parseFloat(row.diffQty?.toString().replace(/,/g, '')) || 0

    return currentQty + qtyValue
  }, 0)

  const rawMaterialCost = formik.values.items.reduce((currentCost, row) => {
    const costValue =
      (parseFloat(row.cost?.toString().replace(/,/g, '')) || 0) *
      (parseFloat(row.qty?.toString().replace(/,/g, '')) || 0)

    return currentCost + costValue
  }, 0)

  const totalRawMaterial = designQuantity + diffQuantity

  const disablePreview = !formik.values.bomId || !formik.values.siteId || !Number(formik.values.qty)

  const fetchLookup = async searchQry => {
    if (!searchQry) return

    const listRV = []
    if (!currentItemId.current) return listRV

    const [replacementsRes, itemRes] = await Promise.all([
      getRequest({
        extension: InventoryRepository.Replacement.qry,
        parameters: `_itemId=${currentItemId.current}`
      }),
      getRequest({
        extension: InventoryRepository.Item.get,
        parameters: `_recordId=${currentItemId.current}`
      })
    ])
    listRV.push({
      sku: itemRes?.record?.sku,
      itemName: itemRes?.record?.name,
      itemId: itemRes?.record?.recordId,
      ivtItem: itemRes?.record?.ivtItem
    })

    replacementsRes?.list?.forEach(({ replacementSKU, replacementItemName, replacementId, ivtItem }) => {
      listRV.push({
        sku: replacementSKU,
        itemName: replacementItemName,
        itemId: replacementId,
        ivtItem
      })
    })

    return listRV.filter(
      item =>
        item.sku?.toLowerCase().includes(searchQry.toLowerCase()) ||
        item.itemName?.toLowerCase().includes(searchQry.toLowerCase())
    )
  }

  const columns = [
    {
      component: 'resourcelookup',
      label: labels.componentItem,
      name: 'sku',
      props: {
        onLookup: fetchLookup,
        valueField: 'itemName',
        displayField: 'itemName',
        displayFieldWidth: 3,
        mapping: [
          { from: 'itemId', to: 'itemId' },
          { from: 'sku', to: 'sku' },
          { from: 'itemName', to: 'itemName' }
        ],
        columnsInDropDown: [
          { key: 'sku', value: 'sku' },
          { key: 'itemName', value: 'itemName' }
        ]
      },
      async onChange({ row: { update, newRow, oldRow } }) {
        if (!newRow.itemId) {
          update(oldRow)

          return
        }
        const currentCost = await getCost(newRow.itemId)
        update({ cost: currentCost })
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
      component: 'resourcecombobox',
      label: labels.siteRef,
      name: 'siteRef',
      props: {
        endpointId: InventoryRepository.Site.qry,
        displayField: 'reference',
        valueField: 'recordId',
        mapping: [
          { from: 'recordId', to: 'siteId' },
          { from: 'reference', to: 'siteRef' },
          { from: 'name', to: 'siteName' }
        ],
        columnsInDropDown: [
          { key: 'reference', value: 'Reference' },
          { key: 'name', value: 'Name' }
        ],
        displayFieldWidth: 3
      }
    },
    {
      component: 'textfield',
      label: labels.siteName,
      name: 'siteName',
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.designQty,
      name: 'designQty',
      props: {
        readOnly: true,
        decimalScale: 3
      }
    },
    !hiddenMuId && {
      component: 'resourcecombobox',
      label: labels.measurementUnit,
      name: 'muRef',
      props: {
        endpointId: InventoryRepository.MeasurementUnit.qry,
        parameters: `_msId=0&filter=`,
        displayField: 'reference',
        valueField: 'recordId',
        mapping: [
          { from: 'reference', to: 'muRef' },
          { from: 'qty', to: 'muQty' },
          { from: 'recordId', to: 'muId' }
        ],
        columnsInDropDown: [
          { key: 'reference', value: 'Reference' },
          { key: 'name', value: 'Name' }
        ],
        displayFieldWidth: 3
      }
    },
    {
      component: 'numberfield',
      label: labels.qty,
      name: 'qty',
      updateOn: 'blur',
      props: {
        readOnly: isPosted,
        decimalScale: 3
      },
      async onChange({ row: { update, newRow } }) {
        await isValidQty(newRow?.designQty, newRow?.qty, newRow?.variationLimit, update)
      }
    },
    {
      component: 'numberfield',
      label: labels.diffQty,
      name: 'diffQty',
      props: {
        readOnly: true,
        decimalScale: 3
      }
    },
    {
      component: 'numberfield',
      label: labels.cost,
      name: 'cost',
      props: {
        readOnly: true,
        decimalScale: 3
      }
    },
    {
      component: 'numberfield',
      label: labels.variationLimit,
      name: 'variationLimit',
      props: {
        readOnly: true
      }
    }
  ].filter(Boolean)

  async function isValidQty(designQty, qty, variationLimit, update) {
    const diffQty = qty - designQty

    if (!variationLimit) {
      update({ diffQty })

      return true
    }

    const allowedVariation = (variationLimit / 100) * designQty
    if (Math.abs(diffQty) > allowedVariation) {
      update({ qty: 0, diffQty: 0 })
      stackError({ message: labels.inValidQty })

      return false
    }

    update({ qty, diffQty })

    return true
  }

  async function getCost(itemId) {
    if (!itemId) return

    const res = await getRequest({
      extension: InventoryRepository.CurrentCost.get,
      parameters: `_itemId=${itemId}`
    })

    return res?.record?.currentCost || 0
  }

  async function getSiteInfo() {
    if (!formik.values.siteId) return

    const res = await getRequest({
      extension: InventoryRepository.Site.get,
      parameters: `_recordId=${formik.values.siteId}`
    })

    return res.record
  }
  async function getBomInfo() {
    if (!formik.values.bomId) return

    const res = await getRequest({
      extension: ManufacturingRepository.BillOfMaterials.get,
      parameters: `_recordId=${formik.values.bomId}`
    })

    return res.record
  }
  async function getHeaderData(recordId) {
    const res = await getRequest({
      extension: ManufacturingRepository.Assembly.get,
      parameters: `_recordId=${recordId}`
    })

    res.record.date = formatDateFromApi(res?.record?.date)

    return res
  }

  async function getItemsData(recordId) {
    return await getRequest({
      extension: ManufacturingRepository.AssemblyItems.qry,
      parameters: `_assemblyId=${recordId}`
    })
  }

  async function getBillItem() {
    const res = await getRequest({
      extension: ManufacturingRepository.Component.qry,
      parameters: `_bomId=${formik.values.bomId}`
    })
    const site = await getSiteInfo()
    const bomInfo = await getBomInfo()

    const itemsList = res?.list?.map(item => ({
      ...item,
      id: item.seqNo,
      cost: item.currentCost || 0,
      designQty: ((item.qty * (formik.values.qty || 0)) / parseFloat(bomInfo?.qty || 0)).toFixed(3),
      qty: ((item.qty * (formik.values.qty || 0)) / parseFloat(bomInfo?.qty || 0)).toFixed(3),
      diffQty: 0,
      baseQty: item.baseQty * (formik.values.qty || 0),
      siteId: item.siteId || formik.values.siteId,
      siteRef: item.siteId ? item.siteRef : site?.reference,
      siteName: item.siteId ? item.siteName : site?.name
    }))

    formik.setFieldValue('items', itemsList)
  }

  async function fillItem(bomId) {
    if (!bomId) return

    const res = await getRequest({
      extension: ManufacturingRepository.BillOfMaterials.get,
      parameters: `_recordId=${bomId}`
    })

    return res?.record
  }

  async function refetchForm(recordId) {
    const header = await getHeaderData(recordId)
    const items = await getItemsData(recordId)

    setStore(prevStore => ({
      ...prevStore,
      recordId: header?.record.recordId,
      isPosted: header?.record.status == 3
    }))

    formik.setValues({
      ...header.record,
      items:
        items?.list?.map(item => ({
          ...item,
          id: item.seqNo,
          diffQty: ((item.qty || 0) - (item.designQty || 0)).toFixed(3),
          designQty: (item.designQty || 0).toFixed(3),
          qty: (item.qty || 0).toFixed(3)
        })) || []
    })
  }

  const onPost = async () => {
    await postRequest({
      extension: ManufacturingRepository.Assembly.post,
      record: JSON.stringify(formik.values)
    })
    toast.success(platformLabels.Posted)
    invalidate()
    await refetchForm(formik.values.recordId)
    setStore(prevStore => ({
      ...prevStore,
      isPosted: true
    }))
  }

  const onUnpost = async () => {
    await postRequest({
      extension: ManufacturingRepository.Assembly.unpost,
      record: JSON.stringify(formik.values)
    })
    toast.success(platformLabels.Unposted)
    invalidate()
    await refetchForm(formik.values.recordId)
    setStore(prevStore => ({
      ...prevStore,
      isPosted: false
    }))
  }

  const actions = [
    {
      key: 'ClearGrid',
      condition: true,
      onClick: () => {
        formik.setFieldValue('items', formik.initialValues.items)
      },
      disabled: formik?.values?.items?.length === 0
    },
    {
      key: 'RecordRemarks',
      condition: true,
      onClick: 'onRecordRemarks',
      disabled: !editMode
    },
    {
      key: 'GL',
      condition: true,
      onClick: 'onClickGL',
      datasetId: ResourceIds.GLAssemblies,
      disabled: !editMode
    },
    {
      key: 'IV',
      condition: true,
      onClick: 'onInventoryTransaction',
      disabled: !editMode || !isPosted
    },
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
      key: 'Lots',
      condition: true,
      onClick: () => {
        stack({
          Component: LotForm,
          props: {
            labels,
            access,
            form: formik.values
          },
          width: 700,
          height: 550,
          title: labels.lot
        })
      },
      disabled: !editMode || isPosted || formik.values.trackBy != 2
    }
  ]

  useEffect(() => {
    if (recordId) refetchForm(recordId)
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.Assemblies}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      previewReport={editMode}
      actions={actions}
      functionId={SystemFunction.Assembly}
      disabledSubmit={isPosted}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SystemRepository.DocumentType.qry}
                    parameters={`_startAt=0&_pageSize=1000&_dgId=${SystemFunction.Assembly}`}
                    name='dtId'
                    label={labels.docType}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    readOnly={editMode}
                    required
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
                <Grid item xs={12}>
                  <CustomTextField
                    name='reference'
                    label={labels.reference}
                    value={formik?.values?.reference}
                    maxAccess={!editMode && maxAccess}
                    readOnly={editMode}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('reference', null)}
                    error={formik.touched.reference && Boolean(formik.errors.reference)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomDatePicker
                    name='date'
                    required
                    readOnly={isPosted}
                    label={labels.date}
                    value={formik?.values?.date}
                    onChange={formik.setFieldValue}
                    maxAccess={maxAccess}
                    onClear={() => formik.setFieldValue('date', null)}
                    error={formik.touched.date && Boolean(formik.errors.date)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextArea
                    name='notes'
                    label={labels.notes}
                    value={formik.values.notes}
                    rows={2.5}
                    maxLength='100'
                    readOnly={isPosted}
                    disabled={formik.values.notes}
                    maxAccess={maxAccess}
                    onChange={e => formik.setFieldValue('notes', e.target.value)}
                    onClear={() => formik.setFieldValue('notes', '')}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={5}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceLookup
                    endpointId={ManufacturingRepository.Machine.snapshot}
                    valueField='reference'
                    displayField='name'
                    name='machineId'
                    label={labels.machine}
                    form={formik}
                    readOnly={editMode}
                    displayFieldWidth={2}
                    valueShow='machineRef'
                    secondValueShow='machineName'
                    maxAccess={maxAccess}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    onChange={async (event, newValue) => {
                      formik.setFieldValue('machineId', newValue?.recordId)
                      formik.setFieldValue('machineName', newValue?.name)
                      formik.setFieldValue('machineRef', newValue?.reference)
                      formik.setFieldValue('batchSize', newValue?.batchSize)
                    }}
                    errorCheck={'machineId'}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceLookup
                    endpointId={ManufacturingRepository.BillOfMaterials.snapshot}
                    valueField='reference'
                    displayField='name'
                    name='bomId'
                    label={labels.BOM}
                    form={formik}
                    displayFieldWidth={2}
                    valueShow='bomRef'
                    secondValueShow='bomName'
                    maxAccess={maxAccess}
                    filter={{ activeStatus: 1 }}
                    readOnly={isPosted || editMode || formik.values.items?.some(item => !!item.sku)}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    onChange={async (event, newValue) => {
                      formik.setFieldValue('bomId', newValue?.recordId)
                      formik.setFieldValue('bomName', newValue?.name)
                      formik.setFieldValue('bomRef', newValue?.reference)
                      const item = await fillItem(newValue?.recordId)
                      formik.setFieldValue('itemName', item?.itemName)
                      formik.setFieldValue('sku', item?.sku)
                      formik.setFieldValue('itemId', item?.itemId)
                    }}
                    errorCheck={'bomId'}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceLookup
                    endpointId={InventoryRepository.Item.snapshot}
                    name='itemId'
                    label={labels?.sku}
                    valueField='recordId'
                    displayField='sku'
                    valueShow='sku'
                    secondValueShow='itemName'
                    displayFieldWidth={2}
                    form={formik}
                    readOnly
                    required
                    maxAccess={maxAccess}
                    errorCheck={'itemId'}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={InventoryRepository.Site.qry}
                    name='siteId'
                    label={labels.site}
                    values={formik.values}
                    displayField={['reference', 'name']}
                    maxAccess={maxAccess}
                    required
                    readOnly={isPosted}
                    columnsInDropDown={[
                      { key: 'reference', value: 'reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('siteId', newValue?.recordId)
                    }}
                    error={formik.touched.siteId && Boolean(formik.errors.siteId)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <CustomNumberField
                    name='rmCost'
                    label={labels.totalCost}
                    value={rawMaterialCost}
                    maxAccess={maxAccess}
                    readOnly
                  />
                </Grid>
                <Grid item xs={6}>
                  <CustomButton
                    onClick={() => {
                      if (formik.values.items?.some(item => !!item.sku)) {
                        stack({
                          Component: ConfirmationDialog,
                          props: {
                            DialogText: labels.resetMsg,
                            okButtonAction: getBillItem,
                            fullScreen: false,
                            close: true
                          },
                          width: 400,
                          height: 150,
                          title: platformLabels.Confirmation
                        })
                      } else getBillItem()
                    }}
                    image={'preview.png'}
                    tooltipText={platformLabels.Preview}
                    disabled={isPosted || disablePreview}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='avgUnitCost'
                    label={labels.unitCost}
                    readOnly
                    value={avgUnitCost}
                    maxAccess={maxAccess}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={3}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='designQty'
                    label={labels.designQty}
                    readOnly
                    value={designQuantity}
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='qty'
                    label={labels.qty}
                    allowNegative={false}
                    readOnly={isPosted || editMode || formik.values.items?.some(item => !!item.sku)}
                    onChange={formik.handleChange}
                    value={formik?.values?.qty}
                    maxAccess={maxAccess}
                    onClear={() => formik.setFieldValue('qty', 0)}
                    error={formik.touched.qty && Boolean(formik.errors.qty)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='diffQty'
                    label={labels.diffQty}
                    readOnly
                    value={diffQuantity}
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='totalRM'
                    label={labels.totalRM}
                    readOnly
                    value={totalRawMaterial}
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='batchSize'
                    label={labels.batchSize}
                    readOnly={editMode}
                    allowNegative={false}
                    value={formik?.values?.batchSize}
                    maxAccess={maxAccess}
                    onChange={e => {
                      let batchSize = Number(e.target.value.replace(/,/g, ''))
                      formik.setFieldValue('batchSize', batchSize)
                      if (!batchSize) return
                      formik.setFieldValue('qty', (formik.values.qty || 0) * batchSize)
                    }}
                    onClear={() => formik.setFieldValue('batchSize', 0)}
                    error={formik.touched.batchSize && Boolean(formik.errors.batchSize)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='batches'
                    label={labels.batches}
                    readOnly={editMode}
                    value={formik?.values?.batches}
                    maxAccess={maxAccess}
                    allowNegative={false}
                    onChange={e => {
                      let batch = Number(e.target.value.replace(/,/g, ''))
                      formik.setFieldValue('batches', batch)
                      if (!batch) return
                      formik.setFieldValue('qty', (formik.values.batchSize || 0) * batch)
                    }}
                    onClear={() => formik.setFieldValue('batches', 0)}
                    error={formik.touched.batches && Boolean(formik.errors.batches)}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Fixed>

        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('items', disablePreview ? [] : value)}
            value={formik.values.items}
            error={formik.errors.items}
            columns={columns}
            name='items'
            maxAccess={maxAccess}
            disabled={isPosted}
            allowDelete={false}
            allowAddNewLine={false}
            onSelectionChange={(row, update, field) => {
              if (field == 'sku') currentItemId.current = row?.itemId
            }}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
