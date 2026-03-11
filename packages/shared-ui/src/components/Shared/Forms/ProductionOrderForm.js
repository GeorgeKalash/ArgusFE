import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import { formatDateFromApi, formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'
import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import CustomTextArea from '@argus/shared-ui/src/components/Inputs/CustomTextArea'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { useDocumentType } from '@argus/shared-hooks/src/hooks/documentReferenceBehaviors'
import { ManufacturingRepository } from '@argus/repositories/src/repositories/ManufacturingRepository'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import ConfirmationDialog from '@argus/shared-ui/src/components/ConfirmationDialog'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { SaleRepository } from '@argus/repositories/src/repositories/SaleRepository'
import ImportForm from '@argus/shared-ui/src/components/Shared/ImportForm'
import { createConditionalSchema } from '@argus/shared-domain/src/lib/validation'
import WorkFlow from '@argus/shared-ui/src/components/Shared/WorkFlow'
import useResourceParams from '@argus/shared-hooks/src/hooks/useResourceParams'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'
import { DefaultsContext } from '@argus/shared-providers/src/providers/DefaultsContext'

export default function ProductionOrderForm({ recordId, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { userDefaults } = useContext(DefaultsContext)
  const { stack } = useWindow()

  const { labels, access } = useResourceParams({
    datasetId: ResourceIds.ProductionOrder
  })

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.ProductionOrder,
    access,
    enabled: !recordId
  })

  useSetWindow({ title: labels.ProductionOrder, window })

  const plantId = parseInt(userDefaults?.list?.find(obj => obj.key === 'plantId')?.value)

  const invalidate = useInvalidate({
    endpointId: ManufacturingRepository.ProductionOrder.page
  })

  const conditions = {
    sku: row => row?.sku,
    qty: row => row?.qty != null,
    jobCount: row => row?.jobCount != null,
    itemName: row => row?.itemName
  }
  const { schema, requiredFields } = createConditionalSchema(conditions, true, maxAccess, 'rows')

  const { formik } = useForm({
    maxAccess,
    documentType: { key: 'dtId', value: documentType?.dtId },
    conditionSchema: ['rows'],
    initialValues: {
      recordId,
      dtId: null,
      reference: '',
      plantId,
      lineId: null,
      notes: '',
      date: new Date(),
      status: 1,
      rows: [
        {
          id: 1,
          poId: recordId,
          sku: '',
          itemName: '',
          qty: null,
          pcs: null,
          designId: null,
          jobCount: null,
          notes: '',
          seqNo: '',
          lineId: null,
          lineRef: ''
        }
      ]
    },
    validateOnChange: true,
    validationSchema: yup.object({
      date: yup.date().required(),
      rows: yup.array().of(schema)
    }),
    onSubmit: async obj => {
      const { rows, date, ...rest } = obj

      const header = {
        ...rest,
        date: formatDateToApi(date)
      }

      const updatedRows = rows
        ?.filter(row => Object.values(requiredFields)?.every(fn => fn(row)))
        .map((prodDetails, index) => {
          return {
            ...prodDetails,
            poId: recordId ?? 0,
            deliveryDate: prodDetails.deliveryDate ? formatDateToApi(prodDetails.deliveryDate) : null,
            seqNo: index + 1
          }
        })

      const resultObject = {
        header,
        items: updatedRows
      }

      const res = await postRequest({
        extension: ManufacturingRepository.ProductionOrder.set2,
        record: JSON.stringify(resultObject)
      })

      const actionMessage = !obj.recordId ? platformLabels.Added : platformLabels.Edited
      toast.success(actionMessage)
      invalidate()
      refetchForm(res?.recordId)
    }
  })

  const editMode = !!formik.values.recordId
  const isPosted = formik.values.status === 3
  const isClosed = formik.values.wip === 2

  const totalQty = formik.values?.rows
    ?.reduce((qtySum, row) => {
      const qtyValue = parseFloat(row.qty) || 0

      return qtySum + qtyValue
    }, 0)
    .toFixed(2)

  async function onPost() {
    const errors = await formik.validateForm()
    if (Object.keys(errors).length > 0) {
      return
    }

    await postRequest({
      extension: ManufacturingRepository.ProductionOrder.post,
      record: JSON.stringify({
        ...formik.values,
        date: formatDateToApi(formik.values.date)
      })
    })
    toast.success(platformLabels.Posted)
    window.close()
    invalidate()
  }

  async function onGenerateAssembly() {
    const res = await postRequest({
      extension: ManufacturingRepository.Assembly.generate,
      record: JSON.stringify({
        poId: formik.values.recordId
      })
    })

    stack({
      Component: ConfirmationDialog,
      props: {
        DialogText: res?.recordId || platformLabels.NoAssembliesGenerated,
        fullScreen: false,
        close: true,
        okButtonAction: () => window.close()
      },
      width: 500,
      height: 150,
      title: res?.recordId ? platformLabels.Success : platformLabels.Error
    })
  }

  async function getDTD(dtId) {
    if (dtId) {
      const res = await getRequest({
        extension: InventoryRepository.DocumentTypeDefaults.get,
        parameters: `_dtId=${dtId}`
      })

      formik.setFieldValue('plantId', res?.record?.plantId ? res?.record?.plantId : plantId)

      return res
    }
  }

  useEffect(() => {
    getDTD(formik?.values?.dtId)
  }, [formik.values.dtId])

  const columns = [
    {
      component: 'resourcelookup',
      label: labels.sku,
      name: 'sku',
      width: 100,
      props: {
        endpointId: InventoryRepository.Item.snapshot,
        valueField: 'sku',
        displayField: 'sku',
        mapping: [
          { from: 'recordId', to: 'itemId' },
          { from: 'sku', to: 'sku' },
          { from: 'name', to: 'itemName' }
        ],
        columnsInDropDown: [
          { key: 'sku', value: 'SKU' },
          { key: 'name', value: 'Name' }
        ],
        displayFieldWidth: 3
      },
      async onChange({ row: { update, newRow } }) {
        let result
        let result1

        if (newRow?.itemId) {
          const res = await getRequest({
            extension: InventoryRepository.ItemProduction.get,
            parameters: `_recordId=${newRow.itemId}`
          })
          result = res?.record

          if (result?.designId) {
            const res1 = await getRequest({
              extension: ManufacturingRepository.Design.get,
              parameters: `_recordId=${res.record?.designId}`
            })
            result1 = res1?.record
          }
        }

        update({
          designId: result?.designId || null,
          designRef: result?.designRef || '',
          lineId: result?.lineId || null,
          lineRef: result?.lineRef || '',
          itemWeight: result1?.stdWeight || null,
          routingId: result1?.routingId || null,
          routingRef: result1?.routingRef || '',
          routingName: result1?.routingName || '',
          jobCount: 1
        })
      }
    },
    {
      component: 'textfield',
      label: labels.itemName,
      name: 'itemName',
      width: 200,
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      label: labels.design,
      name: 'designRef',
      width: 200,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.jobCount,
      name: 'jobCount',
      width: 100
    },
    {
      component: 'resourcecombobox',
      label: labels.prodLine,
      name: 'lineId',
      props: {
        endpointId: ManufacturingRepository.ProductionLine.qry,
        valueField: 'recordId',
        displayField: 'reference',
        displayFieldWidth: 2,
        columnsInDropDown: [
          { key: 'reference', value: 'Reference' },
          { key: 'name', value: 'Name' }
        ],
        mapping: [
          { from: 'reference', to: 'lineRef' },
          { from: 'recordId', to: 'lineId' },
          { from: 'name', to: 'lineName' }
        ]
      },
      width: 150
    },
    {
      component: 'date',
      name: 'deliveryDate',
      width: 150,
      label: labels?.deliveryDate
    },
    {
      component: 'resourcelookup',
      label: labels.routing,
      name: 'routingName',
      width: 150,
      props: {
        valueField: 'reference',
        displayField: 'reference',
        displayFieldWidth: 2,
        endpointId: ManufacturingRepository.Routing.snapshot,
        mapping: [
          { from: 'recordId', to: 'routingId' },
          { from: 'name', to: 'routingName' },
          { from: 'reference', to: 'routingRef' }
        ],
        columnsInDropDown: [
          { key: 'reference', value: 'Reference' },
          { key: 'name', value: 'Name' }
        ]
      }
    },
    {
      component: 'numberfield',
      name: 'itemWeight',
      label: labels.stdWeight,
      width: 100,
      props: {
        maxLength: 12,
        decimalScale: 3,
        readOnly: true
      },
      async onChange({ row: { update, newRow } }) {
        update({ qty: newRow?.itemWeight * newRow?.pcs || 0 })
      }
    },
    {
      component: 'numberfield',
      name: 'pcs',
      label: labels.ExPcs,
      width: 100,
      props: {
        maxLength: 4,
        decimalScale: 0
      },
      async onChange({ row: { update, newRow } }) {
        update({ qty: newRow?.itemWeight * newRow?.pcs || 0 })
      }
    },
    {
      component: 'numberfield',
      name: 'qty',
      width: 100,
      label: labels.ExQty,
      props: {
        maxLength: 12,
        decimalScale: 2
      }
    },
    {
      component: 'resourcelookup',
      label: labels.sizeRef,
      name: 'sizeName',
      width: 100,
      props: {
        endpointId: InventoryRepository.ItemSizes.snapshot,
        displayField: 'reference',
        valueField: 'reference',
        minChars: 2,
        mapping: [
          { from: 'recordId', to: 'sizeId' },
          { from: 'reference', to: 'sizeRef' },
          { from: 'name', to: 'sizeName' }
        ],
        columnsInDropDown: [
          { key: 'reference', value: 'Reference' },
          { key: 'name', value: 'Name' }
        ],
        displayFieldWidth: 2
      }
    },
    {
      component: 'resourcecombobox',
      label: labels.jobCategory,
      name: 'jobCategoryId',
      width: 150,
      props: {
        endpointId: ManufacturingRepository.JobCategory.qry,
        valueField: 'recordId',
        displayField: 'name',
        displayFieldWidth: 1.5,
        mapping: [
          { from: 'name', to: 'jobCategoryName' },
          { from: 'recordId', to: 'jobCategoryId' }
        ]
      }
    },
    {
      component: 'resourcelookup',
      label: labels.client,
      name: 'clientName',
      width: 100,
      props: {
        endpointId: SaleRepository.Client.snapshot,
        displayField: 'reference',
        valueField: 'reference',
        displayFieldWidth: 3,
        minChars: 2,
        mapping: [
          { from: 'recordId', to: 'clientId' },
          { from: 'reference', to: 'clientRef' },
          { from: 'name', to: 'clientName' }
        ],
        columnsInDropDown: [
          { key: 'reference', value: 'Reference' },
          { key: 'name', value: 'Name' }
        ]
      }
    },
    {
      component: 'textfield',
      label: labels.notes,
      width: 200,
      name: 'notes'
    }
  ]
  async function refetchForm(recordId) {
    const res = await getRequest({
      extension: ManufacturingRepository.ProductionOrder.get2,
      parameters: `_recordId=${recordId}`
    })

    const modifiedList = res?.record?.items?.length
      ? res?.record?.items?.map((item, index) => ({
          ...item,
          deliveryDate: formatDateFromApi(item.deliveryDate),
          id: index + 1
        }))
      : formik.initialValues.rows

    formik.setValues({
      ...res?.record?.header,
      date: formatDateFromApi(res?.record?.header?.date),
      rows: modifiedList
    })

    return res?.record
  }

  useEffect(() => {
    if (recordId) refetchForm(recordId)
  }, [])

  async function onImportClick() {
    stack({
      Component: ImportForm,
      props: {
        resourceId: ResourceIds.ImportProductionOrder,
        access: maxAccess,
        staticColumns: [
          { field: 'poRef', value: formik.values.reference },
        ],
        onSuccess: async () => {
          if (recordId) refetchForm(recordId)
        }
      }
    })
  }

  const onClose = async () => {
    const errors = await formik.validateForm()
    if (Object.keys(errors).length > 0) {
      return
    }

    await postRequest({
      extension: ManufacturingRepository.ProductionOrder.close,
      record: JSON.stringify(formik.values)
    })

    toast.success(platformLabels.Closed)
    refetchForm(formik.values.recordId)
    invalidate()
  }

  const onWorkFlowClick = async () => {
    stack({
      Component: WorkFlow,
      props: {
        functionId: SystemFunction.ProductionOrder,
        recordId: formik.values.recordId
      }
    })
  }

  const actions = [
    {
      key: 'RecordRemarks',
      condition: true,
      onClick: 'onRecordRemarks',
      disabled: !editMode
    },
    {
      key: 'WorkFlow',
      condition: true,
      onClick: onWorkFlowClick,
      disabled: !editMode
    },
    {
      key: 'Unlocked',
      condition: !isPosted,
      onClick: onPost,
      disabled: !editMode || !isClosed
    },
    {
      key: 'Locked',
      condition: isPosted,
      onClick: 'onUnpostConfirmation',
      disabled: true
    },
    {
      key: 'Close',
      condition: true,
      onClick: onClose,
      disabled: isClosed || !editMode
    },
    {
      key: 'generate',
      condition: true,
      onClick: onGenerateAssembly,
      disabled: !editMode
    },
    {
      key: 'GenerateJob',
      condition: true,
      onClick: generateJob,
      disabled: !isPosted
    },
    {
      key: 'Import',
      condition: true,
      onClick: onImportClick,
      disabled: !editMode || isPosted || isClosed
    },
    {
      key: 'Refresh',
      condition: true,
      onClick: sync,
      disabled: isPosted
    }
  ]

  async function generateJob() {
    const { rows, rsName, statusName, wipName, batchId, date, plantRef, plantName, isVerified, ...rest } = formik.values
    await postRequest({
      extension: ManufacturingRepository.JobOrder.gen,
      record: JSON.stringify({ ...rest, date: formatDateToApi(date) })
    })

    toast.success(platformLabels.Generated)
  }

  async function sync() {
    await postRequest({
      extension: ManufacturingRepository.RefreshPoItem.refresh,
      record: JSON.stringify(formik.values)
    })
    toast.success(platformLabels.Refresh)
    refetchForm(formik.values.recordId)
  }

  return (
    <FormShell
      resourceId={ResourceIds.ProductionOrder}
      functionId={SystemFunction.ProductionOrder}
      form={formik}
      maxAccess={maxAccess}
      actions={actions}
      editMode={editMode}
      previewReport={editMode}
      disabledSubmit={isPosted || isClosed}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SystemRepository.DocumentType.qry}
                    parameters={`_startAt=0&_pageSize=1000&_dgId=${SystemFunction.ProductionOrder}`}
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
                      formik.setFieldValue('dtId', newValue?.recordId || null)
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
                    maxLength='30'
                    readOnly={editMode}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('reference', '')}
                    error={formik.touched.reference && Boolean(formik.errors.reference)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomDatePicker
                    name='date'
                    label={labels.date}
                    readOnly={isPosted || isClosed}
                    value={formik?.values?.date}
                    onChange={formik.setFieldValue}
                    required
                    maxAccess={maxAccess}
                    onClear={() => formik.setFieldValue('date', null)}
                    error={formik.touched.date && Boolean(formik.errors.date)}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SystemRepository.Plant.qry}
                    name='plantId'
                    label={labels.plant}
                    readOnly={isPosted || isClosed}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik.values}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('plantId', newValue?.recordId)
                    }}
                    error={formik.touched.plantId && Boolean(formik.errors.plantId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={ManufacturingRepository.ProductionLine.qry}
                    name='lineId'
                    label={labels.prodLine}
                    readOnly={isPosted || isClosed}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik.values}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('lineId', newValue?.recordId)
                    }}
                    error={formik.touched.lineId && Boolean(formik.errors.lineId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextArea
                    name='notes'
                    label={labels.description}
                    value={formik?.values?.notes}
                    rows={2.5}
                    readOnly={isPosted || isClosed}
                    maxAccess={maxAccess}
                    onChange={formik.handleChange}
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
            onChange={value => formik.setFieldValue('rows', value)}
            value={formik.values.rows}
            error={formik.errors.rows}
            name='rows'
            maxAccess={maxAccess}
            initialValues={formik?.initialValues?.rows?.[0]}
            columns={columns}
            allowAddNewLine={!isPosted && !isClosed}
            allowDelete={!isPosted && !isClosed}
            disabled={isPosted || isClosed}
          />
        </Grow>
        <Fixed>
          <Grid container xs={6}>
            <CustomNumberField
              name='totalQty'
              label={labels.totalQty}
              maxAccess={maxAccess}
              value={totalQty}
              maxLength='30'
              readOnly
              error={formik.touched.totalQty && Boolean(formik.errors.totalQty)}
            />
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}

ProductionOrderForm.width = 1200
ProductionOrderForm.height = 680
