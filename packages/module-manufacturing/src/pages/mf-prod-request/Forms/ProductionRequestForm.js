import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import { formatDateFromApi, formatDateToApi, findPeriod } from '@argus/shared-domain/src/lib/date-helper'
import { Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import CustomTextArea from '@argus/shared-ui/src/components/Inputs/CustomTextArea'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import PRItemSize from '@argus/shared-ui/src/components/Shared/PRItemSize'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { useDocumentType } from '@argus/shared-hooks/src/hooks/documentReferenceBehaviors'
import { ManufacturingRepository } from '@argus/repositories/src/repositories/ManufacturingRepository'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import PreviewPR from './PreviewPR'
import PreviewPR2 from './PreviewPR2'
import CustomButton from '@argus/shared-ui/src/components/Inputs/CustomButton'
import { useError } from '@argus/shared-providers/src/providers/error'
import WorkFlow from '@argus/shared-ui/src/components/Shared/WorkFlow'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'

import { useRecordLock } from '@argus/shared-hooks/src/hooks/useRecordLock'
import { FinancialRepository } from '@argus/repositories/src/repositories/FinancialRepository'
const PROD_REQ_TYPE = {
  TopSales: 1,
  NewItems: 2,
  SpecialOrder: 3
}

export default function ProductionRequestForm({ recordId, labels, access, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()
  const { stack: stackError } = useError()
  const [disablePreview, setDisablePreview] = useState(false)

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.ProductionRequest,
    access,
    enabled: !recordId,
    objectName: 'header'
  })

  const invalidate = useInvalidate({
    endpointId: ManufacturingRepository.ProductionRequest.page
  })

  const initialValues = {
    recordId,
    header: {
      recordId,
      dtId: null,
      reference: '',
      date: new Date(),
      plantGroupId: null,
      fiscalYear: null,
      periodId: null,
      periodName: null,
      type: null,
      metalId: null,
      pcs: 0,
      qty: 0,
      typeName: '',
      notes: '',
      status: 1
    },
    items: [{
      id: 1,
      requestId: recordId || null,
      seqNo: 1,
      itemId: null,
      sku: '',
      itemName: '',
      qty: 0,
      pcs: null,
      itemWeight: null
    }],
    sizes: []
  }
    
  const { formik } = useForm({
    maxAccess,
    behavior: { key: 'header.dtId', value: documentType?.dtId, fieldBehavior: documentType?.reference },
    initialValues,
    validationSchema: yup.object({
      header: yup.object({
        date: yup.date().required(),
        plantGroupId: yup.number().required(),
        fiscalYear: yup.number().required(),
        periodName: yup.string().required(),
        type: yup.number().required(),
      }),
      items: yup.array().of(
        yup.object().shape({
          sku: yup.string().required(),
          qty: yup.number().required()
        })
      )
    }),
    onSubmit: async obj => {
      const items = obj.items.map(({ sizes, ...item }, index) => ({
        ...item,
        requestId: recordId,
        seqNo: index + 1
      }))

      const sizes = obj.items.flatMap((item, index) =>
        (item.sizes || [])
          .filter(s => s.sizeId)
          .map((s, i) => ({
            requestId: recordId,
            seqNo: index + 1,
            sizeSeqNo: i + 1,
            sizeId: s.sizeId,
            pcs: s.pcs || 0,
            qty: s.qty || 0
          }))
      )

      const res = await postRequest({
        extension: ManufacturingRepository.ProductionRequest.set2,
        record: JSON.stringify({
          header: { ...obj.header, date: formatDateToApi(obj.header.date) },
          items,
          sizes
        })
      })
      toast.success(obj.recordId ? platformLabels.Edited : platformLabels.Added)

      refetchForm(res.recordId)
      invalidate()
    }
  })

  const editMode = !!formik.values.recordId
  const isPosted = formik.values.header.status === 3
  const isRaw = formik.values.header.status === 1
  
  const { releaseLock } = useRecordLock({
    recordId: recordId,
    reference: formik?.values?.header?.reference,
    resourceId: ResourceIds.ProductionRequest,
    enabled: !!recordId && !isPosted
  })

  const canPreview =
    isRaw &&
    [PROD_REQ_TYPE.TopSales, PROD_REQ_TYPE.NewItems].includes(
      formik.values.header.type
    )

  const { type, plantGroupId, metalId } = formik.values.header;

  const isPreviewDisabled =
    !canPreview ||
    disablePreview ||
    (type === PROD_REQ_TYPE.TopSales && (!plantGroupId || !metalId));

  async function refetchForm(requestId) {
    const { record } = await getRequest({
      extension: ManufacturingRepository.ProductionRequest.get2,
      parameters: `_recordId=${requestId}`
    })

    const sizesBySeq = (record?.sizes || []).reduce((acc, s) => {
      ;(acc[s.seqNo] ||= []).push(s)
      return acc
    }, {})
      
    formik.resetForm({
      values: {
        recordId: record.header.recordId,
        header: {
          ...record.header,
          date: formatDateFromApi(record.header?.date)
        },
        items: record?.items?.length > 0 ?
          record?.items?.map((item, index) => {
            return {
              ...item,
              id: index + 1,
              sizes: (sizesBySeq[item.seqNo] || []).map((s, i) => ({ ...s, id: i + 1 }))
            }
          })
          : initialValues.items
      }
    })


    setDisablePreview(false)

  }

  const onPost = async () => {
    await postRequest({
      extension: ManufacturingRepository.ProductionRequest.post,
      record: JSON.stringify({ recordId: formik.values.recordId })
    })

    toast.success(platformLabels.Posted)
    await releaseLock()
    window.close()
    invalidate()
  }

  const setTotals = items => {
    const totalQty = (items || []).reduce((sum, row) => sum + (Number(row.qty) || 0), 0)
    const totalPcs = (items || []).reduce((sum, row) => sum + (Number(row.pcs) || 0), 0)

    formik.setFieldValue('header.qty', totalQty)
    formik.setFieldValue('header.pcs', totalPcs)
  }

  const onChangeType = (_, { key, value } = {}) => {
    const type = key ? parseFloat(key) : null
    const hasFilledItems = formik.values.items?.some(item => item.itemId)

    if (formik.values.header.type && formik.values.header.type !== type && hasFilledItems) {
      stackError({ message: platformLabels.ChangingType })
      formik.setFieldValue('items', initialValues.items)
      setTotals(initialValues.items)
    }

    formik.setFieldValue('header.typeName', value || '')
    
    formik.setFieldValue('header.type', type || null)

    if (!editMode) {
      setDisablePreview(false)
    }
  }

  useEffect(() => {
    if (recordId) return

    const date = formik.values.header.date

    if (!date) {
      formik.setFieldValue('header.fiscalYear', null)
      formik.setFieldValue('header.periodId', null)
      return
    }

    let cancelled = false

    ;(async () => {
      const year = new Date(date).getFullYear()

      try {
        const res = await getRequest({
          extension: SystemRepository.Period.qry,
          parameters: `_fiscalYear=${year}`
        })

        if (cancelled) return

        const period = findPeriod(res?.list || [], date)

        formik.setFieldValue('header.fiscalYear', period?.fiscalYear ?? year)
        formik.setFieldValue('header.periodId', period?.periodId ?? null)
        formik.setFieldValue('header.periodName', period?.periodName ?? null)
      } catch (e) {
        if (cancelled) return
        formik.setFieldValue('header.fiscalYear', year)
        formik.setFieldValue('header.periodId', null)
        formik.setFieldValue('header.periodName', null)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [formik.values.header.date])

  const mergePreviewedItems = async newItems => {
    const sizesByItem = new Map(
      (formik.values.items || [])
        .filter(item => item.itemId)
        .map(item => [item.itemId, item.sizes || []])
    )

    const merged = newItems.map((item, index) => ({
      ...item,
      id: index + 1,
      seqNo: index + 1,
      sizes: sizesByItem.get(item.itemId) || []
    }))

    await formik.setFieldValue('items', merged)
    setTotals(merged)
    setDisablePreview(true)
  }

  const onPreview = () => {
    if (formik.values.header.type === PROD_REQ_TYPE.TopSales) {
      stack({
        Component: PreviewPR,
        props: {
          plantGroupId: formik.values.header.plantGroupId,
          metalId: formik.values.header.metalId,
          requestId: formik.values.recordId || 0,
          parentFormik: formik,
          onSelect: mergePreviewedItems
        },
        title: platformLabels?.Preview,
        width: 1300,
        height: 600
      })
    } else if (formik.values.header.type === PROD_REQ_TYPE.NewItems) {
      stack({
        Component: PreviewPR2,
        props: {
          requestId: formik.values.recordId || 0,
          parentFormik: formik,
          onSelect: mergePreviewedItems
        },
        title: platformLabels?.Preview,
        width: 1300,
        height: 600
      })
    }
  }

  const onWorkFlowClick = async () => {
    stack({
      Component: WorkFlow,
      props: {
        functionId: SystemFunction.ProductionRequest,
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
      key: 'Locked',
      condition: isPosted,
      onClick: 'onUnpostConfirmation',
      disabled: true
    },
    {
      key: 'Unlocked',
      condition: !isPosted,
      onClick: onPost,
      disabled: !editMode
    },
  ]

  useEffect(() => {
    if (recordId) {
      refetchForm(recordId)
    }
  }, [])

  const columns = [
    {
      component: 'resourcelookup',
      label: labels.sku,
      name: 'sku',
      flex: 1,
      props: {
        endpointId: InventoryRepository.Item.snapshot,
        valueField: 'sku',
        displayField: 'sku',
        readOnly: canPreview,
        mapping: [
          { from: 'recordId', to: 'itemId' },
          { from: 'sku', to: 'sku' },
          { from: 'name', to: 'itemName' }
        ],
        displayFieldWidth: 4,
        columnsInDropDown: [
          { key: 'sku', value: 'SKU' },
          { key: 'name', value: 'Name' }
        ]
      },
      async onChange({ row: { update, newRow } }) {
        let itemWeight = null, pcs=0, qty =0

        if (newRow?.itemId) {
          const res = await getRequest({
            extension: InventoryRepository.Physical.get,
            parameters: `_itemId=${newRow.itemId}`
          })

          itemWeight = res?.record?.weight
          if (newRow?.pcs) qty = itemWeight ? newRow?.pcs * itemWeight : 0
          else if (newRow?.qty) pcs = itemWeight ? newRow?.qty / itemWeight : 0
        }

        update({
          itemWeight,
          qty,
          pcs
        })
      }
    },
    {
      component: 'textfield',
      label: labels.itemName,
      name: 'itemName',
      flex: 1,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.weight,
      name: 'itemWeight',
      flex: 1,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.qty,
      name: 'qty',
      defaultValue: 0,
      flex: 1,
      props: {
        decimalScale: 2,
        maxLength: 10,
        allowNegative: false,
        readOnly: canPreview
      },
      async onChange({ row: { update, newRow } }) {
        let  pcs=0
        
        if (newRow?.qty) pcs = newRow?.itemWeight ? newRow?.qty / newRow?.itemWeight : 0
        

        update({pcs})
      }
    },
    {
      component: 'numberfield',
      label: labels.pcs,
      name: 'pcs',
      flex: 1,
      props: {
        decimalScale: 0,
        maxLength: 9,
        allowNegative: false,
        readOnly: canPreview
      },
      async onChange({ row: { update, newRow } }) {
        let  qty=0
        
        if (newRow?.pcs) qty = newRow?.itemWeight ? newRow?.pcs * newRow?.itemWeight : 0
        

        update({qty})
      }
    },
    {
      component: 'button',
      name: 'sizes',
      label: labels.sizes,
      flex: 0.5,
      props: {
        onCondition: row => {
          return {
            disabled: !row?.itemId
          }
        }
      },
      onClick: (e, row) => {
        stack({
          Component: PRItemSize,
          props: {
            readOnly: isPosted,
            sizes: row.sizes || [],
            onSave: sizes =>
              formik.setFieldValue(
                'items',
                formik.values.items.map(r => (r.id === row.id ? { ...r, sizes } : r))
              )
          }
        })
      }
    }
  ]

  async function onValidationRequired() {
    const errors = await formik.validateForm()

    if (errors.header && Object.keys(errors.header).length) {
      const touchedFields = {
        header: { ...formik.touched.header }
      }

      Object.keys(errors.header).forEach(key => {
        if (!formik.touched.header || !formik.touched.header[key]) {
          touchedFields.header[key] = true
        }
      })

      formik.setTouched(touchedFields, true)
    }
  }

  return (
    <FormShell
      resourceId={ResourceIds.ProductionRequest}
      functionId={SystemFunction.ProductionRequest}
      form={formik}
      maxAccess={maxAccess}
      actions={actions}
      editMode={editMode}
      previewReport={editMode}
      disabledSubmit={isPosted}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SystemRepository.DocumentType.qry}
                    parameters={`_startAt=0&_pageSize=1000&_dgId=${SystemFunction.ProductionRequest}`}
                    filter={!editMode ? item => item.activeStatus === 1 : undefined}
                    name='header.dtId'
                    label={labels.documentType}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    readOnly={editMode}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    values={formik?.values?.header}
                    maxAccess={maxAccess}
                    onChange={(_, newValue) => {
                      formik.setFieldValue('header.dtId', newValue?.recordId || null)
                      changeDT(newValue)
                    }}
                    error={formik?.touched?.header?.dtId && Boolean(formik?.errors?.header?.dtId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='header.reference'
                    label={labels.reference}
                    value={formik?.values?.header?.reference}
                    maxAccess={!editMode && maxAccess}
                    readOnly={editMode}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('header.reference', '')}
                    error={formik?.touched?.header?.reference && Boolean(formik?.errors?.header?.reference)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomDatePicker
                    name='header.date'
                    label={labels.date}
                    value={formik?.values?.header?.date}
                    readOnly={isPosted}
                    required
                    onChange={formik.setFieldValue}
                    onClear={() => {
                      formik.setFieldValue('header.date', null)
                      formik.setFieldValue('header.fiscalYear', null)
                      formik.setFieldValue('header.periodId', null)
                      formik.setFieldValue('header.periodName', null)
                    }}
                    error={formik?.touched?.header?.date && Boolean(formik?.errors?.header?.date)}
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='header.fiscalYear'
                    label={labels.fiscalYear}
                    value={formik?.values?.header?.fiscalYear}
                    readOnly
                    required
                    maxAccess={maxAccess}
                    error={formik?.touched?.header?.fiscalYear && Boolean(formik?.errors?.header?.fiscalYear)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='header.periodName'
                    label={labels.period}
                    value={formik?.values?.header?.periodName}
                    readOnly
                    required
                    maxAccess={maxAccess}
                    error={formik?.touched?.header?.periodName && Boolean(formik?.errors?.header?.periodName)}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SystemRepository.PlantGroup.qry}
                    name='header.plantGroupId'
                    label={labels.plantGroup}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik?.values?.header}
                    readOnly={isPosted || (formik.values.header.type === PROD_REQ_TYPE.TopSales && formik.values.items?.some(row => row.itemId))}
                    required
                    maxAccess={maxAccess}
                    onChange={(_, newValue) => {
                      formik.setFieldValue('header.plantGroupId', newValue?.recordId || null)
                    }}
                    error={formik?.touched?.header?.plantGroupId && Boolean(formik?.errors?.header?.plantGroupId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={InventoryRepository.Metals.qry}
                    name='header.metalId'
                    label={labels.metal}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik?.values?.header}
                    readOnly={isPosted || formik.values.items?.some(row => row.itemId)}
                    required
                    maxAccess={maxAccess}
                    onChange={(_, newValue) => {
                      formik.setFieldValue('header.metalId', newValue?.recordId || null)
                    }}
                    error={formik?.touched?.header?.metalId && Boolean(formik?.errors?.header?.metalId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextArea
                    name='header.notes'
                    label={labels.notes}
                    value={formik?.values?.header?.notes}
                    rows={3}
                    readOnly={isPosted}
                    maxAccess={maxAccess}
                    onChange={e => formik.setFieldValue('header.notes', e.target.value)}
                    onClear={() => formik.setFieldValue('header.notes', '')}
                    error={formik?.touched?.header?.notes && Boolean(formik?.errors?.header?.notes)}
                  />
                </Grid>
                
                <Grid item xs={9}>
                  <ResourceComboBox
                    datasetId={DataSets.PROD_REQ_TYPE}
                    name='header.type'
                    label={labels.type}
                    required
                    valueField='key'
                    displayField='value'
                    readOnly={editMode}
                    values={formik.values.header}
                    onClear={() => {
                      formik.setFieldValue('header.typeName', '')
                      formik.setFieldValue('header.type', null)
                    }}
                    onChange={onChangeType}
                    error={formik.touched?.header?.type && Boolean(formik.errors?.header?.type)}
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={3}>
                  <CustomButton
                    onClick={onPreview}
                    label={platformLabels.Preview}
                    disabled={isPreviewDisabled}
                    image='preview.png'
                    color='primary'
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
              setTotals(value)
              setDisablePreview(true)
            }}
            value={formik?.values?.items}
            error={formik?.errors?.items}
            columns={columns}
            maxAccess={maxAccess}
            enableFilters
            name='items'
            allowDelete={!isPosted && !canPreview}
            allowAddNewLine={!isPosted && !canPreview}
            disabled={isPosted || Object.entries(formik?.errors || {}).filter(([key]) => key !== 'items').length > 0}
            onValidationRequired={onValidationRequired}
          />
        </Grow>
        <Fixed>
          <Grid container spacing={2} sx={{ pt: 2 }} justifyContent='flex-end'>
            <Grid item xs={3}>
              <CustomNumberField
                name='header.qty'
                label={labels.qty}
                value={formik.values.header.qty}
                decimalScale={2}
                readOnly
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={3}>
              <CustomNumberField
                name='header.pcs'
                label={labels.pcs}
                value={formik.values.header.pcs}
                decimalScale={0}
                readOnly
                maxAccess={maxAccess}
              />
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}