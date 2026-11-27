import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import { formatDateFromApi, formatDateToApi, findPeriod } from '@argus/shared-domain/src/lib/date-helper'
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
import { SaleRepository } from '@argus/repositories/src/repositories/SaleRepository'
import { createConditionalSchema } from '@argus/shared-domain/src/lib/validation'
import { useError } from '@argus/shared-providers/src/providers/error'
import { useRecordLock } from '@argus/shared-hooks/src/hooks/useRecordLock'
import ItemWindow from '@argus/shared-ui/src/components/Shared/ItemWindow'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import LineNotes from '@argus/shared-ui/src/components/Shared/LineNote'
import ItemDetailsTable from './ItemDetailsTable'
import ItemSize from '@argus/shared-ui/src/components/Shared/ItemSize'
import ImportForm from '@argus/shared-ui/src/components/Shared/ImportForm'

export default function ProductionSummaryForm({ recordId, labels, access, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack: stackError } = useError()
  const { stack } = useWindow()

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.ProductionSummary,
    access,
    enabled: !recordId,
    objectName: 'header'
  })

  const conditions = {
    itemId: row => row?.qty != 0 || row?.pcs != null || row?.clientId != null,
  }

  const { schema, requiredFields } = createConditionalSchema(conditions, true, maxAccess, 'items')

  const invalidate = useInvalidate({
    endpointId: ManufacturingRepository.ProductionSummary.page
  })

  const initialValues = {
    recordId,
    header: {
      recordId,
      dtId: null,
      reference: '',
      date: new Date(),
      fiscalYear: null,
      periodId: null,
      notes: '',
      status: 1,
      wip: 1
    },
    items: [
      {
        id: 1,
        rsId: recordId || null,
        seqNo: 1,
        itemId: null,
        sku: '',
        itemName: '',
        clientId: null,
        qty: 0,
        pcs: null,
        itemWeight: null,
        onhand: null
      }
    ],
    sizes: []
  }

  const { formik } = useForm({
    maxAccess,
    conditionSchema: ['items'],
    behavior: { key: 'header.dtId', value: documentType?.dtId, fieldBehavior: documentType?.reference },
    initialValues,
    validationSchema: yup.object({
      header: yup.object({
        date: yup.date().required(),
        fiscalYear: yup.number().required(),
        periodId: yup.number().required()
      }),
      items: yup.array().of(schema)
    }),
    onSubmit: async obj => {
      const items = obj?.items
        ?.filter(row => Object.values(requiredFields)?.every(fn => fn(row)))
        ?.map(({ sizes, ...item }) => item)

      const sizes = obj?.items
        ?.filter(row => Object.values(requiredFields)?.every(fn => fn(row)))
        ?.flatMap((item, index) =>
          (item.sizes || [])
            .filter(s => s.sizeId)
            .map((s, i) => ({
              rsId: recordId,
              seqNo: index + 1,
              sizeSeqNo: i + 1,
              sizeId: s.sizeId,
              pcs: s.pcs || 0,
              qty: s.qty || 0
            }))
        )

      const res = await postRequest({
        extension: ManufacturingRepository.ProductionSummary.set2,
        record: JSON.stringify({
          header: { ...obj?.header, date: formatDateToApi(obj?.header?.date) },
          items,
          sizes
        })
      })
      toast.success(obj.recordId ? platformLabels.Edited : platformLabels.Added)
      refetchForm(res.recordId)
      invalidate()
    }
  })


  useEffect(() => {
    if (editMode) return

    const date = formik.values.header.date

    if (!date) {
      formik.setFieldValue('header.fiscalYear', null)
      formik.setFieldValue('header.periodId', null)
      return
    }

    let cancelled = false

    const timer = setTimeout(async () => {
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
      } catch (e) {
        if (cancelled) return
        formik.setFieldValue('header.fiscalYear', year)
        formik.setFieldValue('header.periodId', null)
      }
    }, 800)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [formik.values.header.date])

  const editMode = !!formik.values.recordId
  const isPosted = formik.values.header.status === 3

  const { releaseLock } = useRecordLock({
    recordId: recordId,
    reference: formik?.values?.header?.reference,
    resourceId: ResourceIds.ProductionSummary,
    enabled: !!recordId && !isPosted
  })

  const isGridEmpty = !formik.values.items?.some(item => item.itemId)

  async function refetchForm(summaryId) {
    const { record } = await getRequest({
      extension: ManufacturingRepository.ProductionSummary.get2,
      parameters: `_recordId=${summaryId}`
    })

    const sizesBySeq = (record?.sizes || []).reduce((acc, s) => {
      ;(acc[s.seqNo] ||= []).push(s)

      return acc
    }, {})

    const notesBySeq = (record?.notes || []).reduce((acc, n) => {
      acc[n.seqNo] = n.notes

      return acc
    }, {})

    formik.resetForm({
      values: {
        recordId: record.header.recordId,
        header: {
          ...record.header,
          date: formatDateFromApi(record.header?.date)
        },
        items: record.items.length > 0 ? record.items?.map((item, index) => ({
          ...item,
          id: index + 1,
          seqNo: index + 1,
          note: notesBySeq[item.seqNo] || '',
          sizes: (sizesBySeq[item.seqNo] || []).map((s, i) => ({ ...s, id: i + 1 }))
        })) : initialValues.items
      }
    })
  }


  const onPost = async () => {
    await postRequest({
      extension: ManufacturingRepository.ProductionSummary.post,
      record: JSON.stringify({ recordId: formik.values.recordId })
    })
    toast.success(platformLabels.Posted)
    await releaseLock()
    window.close()
    invalidate()
  }

  async function onImportClick() {
    const res = await getRequest({
      extension: ManufacturingRepository.ProductionRequestItems.import,
      parameters: `_fiscalYear=${formik.values.header.fiscalYear}&_periodId=${formik.values.header.periodId}&_type=${formik.values?.header?.type}`
    })

    if (res?.list?.length > 0) {
      await postRequest({
        extension: ManufacturingRepository.ProductionSummary.set2,
        record: JSON.stringify({
          header: { ...formik.values?.header, date: formatDateToApi(formik?.values?.header?.date) },
          items: res?.list
        })
      })

      await postRequest({
        extension: ManufacturingRepository.ProductionSummary.setPRSummary,
        record: JSON.stringify({ summaryId: formik.values.recordId })
      })

      refetchForm(formik.values.recordId)
      toast.success(platformLabels.Saved)
    } else {
      stackError({
        message: platformLabels.noItemsToImport
      })
    }
  }

  function onCsvImport() {
    stack({
      Component: ImportForm,
      props: {
        resourceId: ResourceIds.ProductionSummary,
        access: maxAccess,
        autoSubmit: false,
        onSuccess: async (data) => { updateItemsData(data) }    
      }
    })
  }

  function updateItemsData(data) {
    const rows = data?.items || []
    if (!rows.length) return

    const normalize = sku => String(sku ?? '').trim().toLowerCase()
    const importedBySku = new Map(rows.filter(r => r?.sku).map(r => [normalize(r.sku), r]))

    const items = formik.values.items.map(item => {
      const match = importedBySku.get(normalize(item.sku))
      if (!match) return item

      return { ...item, qty: match.qty, pcs: match.pcs }
    })

    formik.setFieldValue('items', items)
  }

  const actions = [
    {
      key: 'Import',
      condition: true,
      onClick: onImportClick,
      disabled: !isGridEmpty || !editMode || isPosted
    },
    {
      key: 'ImportCSV',
      condition: (formik.values?.header?.type == 1 || formik.values?.header?.type == 2),
      onClick: onCsvImport,
      disabled: !editMode || !formik.values?.items?.some(item => item?.itemId) || isPosted
    },
    {
      key: 'RecordRemarks',
      condition: true,
      onClick: 'onRecordRemarks',
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
    }
  ]

  useEffect(() => {
    if (recordId) {
      refetchForm(recordId)
    }
  }, [])

  async function getOnHand(itemId) {
    if (!itemId) return 0

    const res = await getRequest({
      extension: InventoryRepository.Availability.get,
      parameters: `_itemId=${itemId}&_seqNo=0&_siteId=0`
    })

    return res?.record?.onhand || 0
  }

  const columns = [
    {
      component: 'resourcelookup',
      label: labels.sku,
      name: 'sku',
      flex: 1,
      link: {
        enabled: true,
        popup: row => {
          stack({
              Component: ItemWindow,
              props: {
                obj: {
                  recordId: row.itemId,
                  ...row
                }
              },
              nextToTitle: row?.sku
            })
          }
      },
      props: {
        endpointId: InventoryRepository.Item.snapshot,
        valueField: 'sku',
        displayField: 'sku',
        mapping: [
          { from: 'recordId', to: 'itemId' },
          { from: 'sku', to: 'sku' },
          { from: 'name', to: 'itemName' },
          { from: 'weight', to: 'itemWeight' }
        ],
        displayFieldWidth: 2,
        columnsInDropDown: [
          { key: 'sku', value: 'SKU' },
          { key: 'name', value: 'Name' }
        ]
      },
      async onChange({ row: { update, newRow } }) {
        let itemWeight = null

        if (newRow?.itemId) {
          const res = await getRequest({
            extension: InventoryRepository.Physical.get,
            parameters: `_itemId=${newRow.itemId}`
          })

          itemWeight = res?.record?.weight
        }

        update({
          itemWeight,
          onhand: await getOnHand(newRow?.itemId)
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
      label: labels.onhand,
      name: 'onhand',
      flex: 1,
      props: {
        readOnly: true
      }
    },
    {
      component: 'resourcelookup',
      label: labels.client,
      name: 'clientId',
      props: {
        endpointId: SaleRepository.Client.snapshot,
        valueField: 'reference',
        displayField: 'name',
        columnsInDropDown: [
          { key: 'reference', value: 'Reference' },
          { key: 'name', value: 'Name' },
          { key: 'szName', value: 'Sales Zone' }
        ],
        mapping: [
          { from: 'recordId', to: 'clientId' },
          { from: 'reference', to: 'clientRef' },
          { from: 'name', to: 'clientName' }
        ],
        displayFieldWidth: 4
      }
    },
    {
      component: 'textfield',
      label: labels.brand,
      name: 'brandName',
      flex: 1,
      props: {
        readOnly: true
      }
    },
        {
      component: 'numberfield',
      label: labels.shortTerm,
      name: 'sts_qty',
      flex: 1,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.longTerm,
      name: 'lts_qty',
      flex: 1,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.qty,
      name: 'qty',
      flex: 1,
      defaultValue: 0,
      props: {
        decimalScale: 2,
        maxLength: 10,
        allowNegative: false
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
        allowNegative: false
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
          Component: ItemSize,
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
    },
    ...((formik.values?.header?.type == 1 || formik.values?.header?.type == 2)
      ? [
          {
            component: 'button',
            name: 'detailsAction',
            label: labels.details,
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
                Component: ItemDetailsTable,
                props: {
                  row,
                  maxAccess,
                  labels
                },
                width: 800,
                height: 500,
                title: labels.details
              })
            }
          }
        ]
      : []),
    ...(formik.values?.header?.type == 3
    ? [
        {
          component: 'button',
          name: 'noteAction',
          label: labels.notes,
          flex: 0.5,
          props: {
            imgSrc: '/images/buttonsIcons/notes.png',
            color: '#90278e',
            onCondition: row => ({
              disabled: !row?.itemId
            })
          },
          onClick: (e, row) => {
            stack({
              Component: LineNotes,
              props: {
                row,
                readOnly: true,
                maxAccess,
                showOkBtn: false,
                onSave: () => {}
              },
              width: 500,
              height: 360,
              title: labels.notes
            })
          }
        }
      ]
    : [])
  ]

  return (
    <FormShell
      resourceId={ResourceIds.ProductionSummary}
      functionId={SystemFunction.ProductionSummary}
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
                    parameters={`_startAt=0&_pageSize=1000&_dgId=${SystemFunction.ProductionSummary}`}
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
                    readOnly={editMode}
                    required
                    onChange={formik.setFieldValue}
                    onClear={() => {
                      formik.setFieldValue('header.date', null)
                      formik.setFieldValue('header.fiscalYear', null)
                      formik.setFieldValue('header.periodId', null)
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
                  <ResourceComboBox
                    endpointId={formik.values?.header?.fiscalYear && SystemRepository.Period.qry}
                    parameters={formik.values?.header?.fiscalYear && `_fiscalYear=${formik.values?.header?.fiscalYear}`}
                    name='header.periodId'
                    label={labels.period}
                    valueField='periodId'
                    displayField='periodName'
                    values={formik.values.header}
                    required
                    readOnly={editMode}
                    maxAccess={maxAccess}
                    onChange={(_, newValue) => formik.setFieldValue('header.periodId', newValue?.periodId || null)}
                    error={formik?.touched?.header?.periodId && Boolean(formik?.errors?.header?.periodId)}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceComboBox
                    datasetId={DataSets.PROD_REQ_TYPE}
                    name='header.type'
                    label={labels.type}
                    valueField='key'
                    displayField='value'
                    values={formik.values.header}
                    readOnly={isPosted}
                    onClear={() => {
                      formik.setFieldValue('header.typeName', '')
                      formik.setFieldValue('header.type', null)
                    }}
                    onChange={(_, newValue) => {
                      const type = newValue?.key ? parseFloat(newValue?.key) : null
                      const hasFilledItems = formik.values.items?.some(item => item.itemId)

                      if (formik.values.header.type && formik.values.header.type !== type && hasFilledItems) {
                        stackError({ message: platformLabels.ChangingType })
                        formik.setFieldValue('items', initialValues.items)
                      }

                      formik.setFieldValue('header.typeName', newValue?.value || '')
                      formik.setFieldValue('header.type', type)

                    }}
                    error={formik.touched?.header?.type && Boolean(formik.errors?.header?.type)}
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextArea
                    name='header.notes'
                    label={labels.notes}
                    value={formik?.values?.header?.notes}
                    rows={4}
                    readOnly={isPosted}
                    maxAccess={maxAccess}
                    onChange={e => formik.setFieldValue('header.notes', e.target.value)}
                    onClear={() => formik.setFieldValue('header.notes', '')}
                    error={formik?.touched?.header?.notes && Boolean(formik?.errors?.header?.notes)}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('items', value)}
            value={formik?.values?.items}
            error={formik?.errors?.items}
            columns={columns}
            maxAccess={maxAccess}
            name='items'
            allowDelete={false}
            disabled={true}
            highlightRow={{
              condition: row => formik.values?.header?.type == 3 && !!row?.note?.trim(),
              color: () => '#f9f763'
            }}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}