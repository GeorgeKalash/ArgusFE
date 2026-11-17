import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import { formatDateFromApi, formatDateToApi, findPeriod } from '@argus/shared-domain/src/lib/date-helper'
import { Grid } from '@mui/material'
import { useContext, useEffect, useRef, useState } from 'react'
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
import { DefaultsContext } from '@argus/shared-providers/src/providers/DefaultsContext'
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
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import { useRecordLock } from '@argus/shared-hooks/src/hooks/useRecordLock'
import LineNotes from '@argus/shared-ui/src/components/Shared/LineNote'
import ItemWindow from '@argus/shared-ui/src/components/Shared/ItemWindow'

const PROD_REQ_TYPE = {
  TopSales: 1,
  NewItems: 2,
  SpecialOrder: 3
}

export default function ProductionRequestForm({ recordId, labels, access, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { systemDefaults } = useContext(DefaultsContext)
  const { stack } = useWindow()
  const { stack: stackError } = useError()
  const [disablePreview, setDisablePreview] = useState(false)
  const [periodOptions, setPeriodOptions] = useState([])

  const minDay = parseInt(systemDefaults?.list?.find(({ key }) => key === 'pp_min_pr_dom')?.value) || null
  const maxDay = parseInt(systemDefaults?.list?.find(({ key }) => key === 'pp_max_pr_dom')?.value) || null

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
      plantId: null,
      fiscalYear: null,
      periodId: null,
      periodName: null,
      type: null,
      metalId: null,
      summaryId: null,
      pcs: 0,
      qty: 0,
      typeName: '',
      notes: '',
      status: 1
    },
    items: [
      {
        id: 1,
        requestId: recordId || null,
        seqNo: 1,
        itemId: null,
        sku: '',
        itemName: '',
        collectionName: '',
        itemGroupName: '',
        categoryName: '',
        onHand: null,
        qty: 0,
        pcs: null,
        itemWeight: null,
        note: ''
      }
    ],
    sizes: []
  }
    
  const { formik } = useForm({
    maxAccess,
    behavior: { key: 'header.dtId', value: documentType?.dtId, fieldBehavior: documentType?.reference },
    initialValues,
    validationSchema: yup.object({
      header: yup.object({
        date: yup.date().required(),
        plantId: yup.number().required(),
        fiscalYear: yup.number().required(),
        periodName: yup.string().required(),
        type: yup.number().required(),
      }),
      items: yup.array().of(
        yup.object().shape({
          sku: yup.string().required(),
          qty: yup.number().required(),
          pcs: yup.number().required().moreThan(0)
        })
      )
    }),
    onSubmit: async obj => {
      const items = obj.items.map(({ sizes, note, ...item }, index) => ({
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

      const notes = obj.items.flatMap((item, index) => {
        const text = (item.note || '').trim()

        if (!text) return []

        return [
          {
            functionId: SystemFunction.ProductionRequest,
            recordId: obj.recordId || recordId || 0,
            seqNo: index + 1,
            notes: text
          }
        ]
      })

      const res = await postRequest({
        extension: ManufacturingRepository.ProductionRequest.set2,
        record: JSON.stringify({
          header: { ...obj.header, date: formatDateToApi(obj.header.date) },
          items,
          sizes,
          notes
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

  const { type, plantId, metalId } = formik.values.header
  const isSpecialOrder = type === PROD_REQ_TYPE.SpecialOrder

  const isPreviewDisabled =
    !canPreview ||
    disablePreview ||
    (type === PROD_REQ_TYPE.TopSales && (!plantId || !metalId));

  const openNote = row => {
    stack({
      Component: LineNotes,
      props: {
        row,
        readOnly: isPosted,
        onSave: (row, note) => formik.setFieldValue('items', formik.values.items.map(r => (r.id === row.id ? { ...r, note } : r))),
        maxAccess
      },
      width: 500,
      height: 360,
      title: row.sku
    })
  }


  const loadPeriods = async years => {
    const results = await Promise.all(
      years.map(year =>
        getRequest({
          extension: SystemRepository.Period.qry,
          parameters: `_fiscalYear=${year}`
        }).catch(() => ({ list: [] }))
      )
    )

    const map = new Map()
    results.forEach(res => (res?.list || []).forEach(p => map.set(`${p.fiscalYear}-${p.periodId}`, p)))

    return Array.from(map.values())
  }

  async function refetchForm(requestId) {
    const { record } = await getRequest({
      extension: ManufacturingRepository.ProductionRequest.get2,
      parameters: `_recordId=${requestId}`
    })

    const sizesBySeq = (record?.sizes || []).reduce((acc, s) => {
      ;(acc[s.seqNo] ||= []).push(s)

      return acc
    }, {})

    const notesBySeq = (record?.notes || []).reduce((acc, n) => {
      acc[n.seqNo] = n.notes

      return acc
    }, {})

    const fiscalYear = record?.header?.fiscalYear

    if (fiscalYear) {
      const list = await loadPeriods([fiscalYear])

      setPeriodOptions(list)
    }
      
    formik.resetForm({
      values: {
        recordId: record.header.recordId,
        header: {
          ...record.header,
          date: formatDateFromApi(record.header?.date)
        },
        items:
          record?.items?.length > 0
            ? record?.items?.map((item, index) => {
                return {
                  ...item,
                  id: index + 1,
                  note: notesBySeq[item.seqNo] || '',
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
    formik.setFieldValue('header.pcs', parseInt(totalPcs))
  }

  const clearPeriod = () => {
    formik.setFieldValue('header.periodId', null)
    formik.setFieldValue('header.periodName', null)
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
    if (editMode) return

    const dtId = formik.values.header.dtId

    if (!dtId) return

    if (formik.values.items?.some(item => item.itemId)) return

    let cancelled = false

    ;(async () => {
      try {
        const res = await getRequest({
          extension: ManufacturingRepository.DocumentTypeDefault.get,
          parameters: `_dtId=${dtId}`
        })

        if (cancelled) return

        formik.setFieldValue('header.plantId', res?.record?.plantId ?? null)
        formik.setFieldValue('header.metalId', res?.record?.metalId ?? null)
      } catch (e) {
        if (cancelled) return
        formik.setFieldValue('header.plantId', null)
        formik.setFieldValue('header.metalId', null)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [formik.values.header.dtId])

  useEffect(() => {
    if (editMode) return

    const { date, type } = formik.values.header

    if (!date) {
      clearPeriod()

      return
    }

    const selected = new Date(date)

    if (isNaN(selected.getTime()) || selected.getFullYear() < 2000) return

    let cancelled = false

    const timer = setTimeout(async () => {
      const year = selected.getFullYear()
      const isPlanned = [PROD_REQ_TYPE.TopSales, PROD_REQ_TYPE.NewItems].includes(type)
      const isSpecial = type === PROD_REQ_TYPE.SpecialOrder

      if (isPlanned) {
        const day = selected.getDate()

        if ((minDay != null && day < minDay) || (maxDay != null && day > maxDay)) {
          stackError({ message: platformLabels.dayRange })
          formik.setFieldValue('header.typeName', '')
          formik.setFieldValue('header.type', null)
          clearPeriod()

          return
        }
      }

      try {
        const years = [year]

        const list = await loadPeriods(years)
        if (cancelled) return

        if (isPlanned) {
          setPeriodOptions(list)
          const nextMonth = new Date(year, selected.getMonth() + 1, 1)
          const period = findPeriod(list, nextMonth)

          if (!period || Number(period.fiscalYear) !== year) {
            stackError({ message: platformLabels.NoNextPeriod })
            clearPeriod()

            return
          }

          formik.setFieldValue('header.fiscalYear', period.fiscalYear)
          formik.setFieldValue('header.periodId', period.periodId)
          formik.setFieldValue('header.periodName', period.periodName)
        } else if (isSpecial) {
          const minStart = new Date(year, selected.getMonth(), 1)

          const options = list.filter(p => {
            const end = p.endDate ? new Date(formatDateFromApi(p.endDate)) : null

            return Number(p.fiscalYear) === year && (!end || end >= minStart)
          })

          setPeriodOptions(options)

          const stillValid = options.some(
            p =>
              p.periodId === formik.values.header.periodId &&
              (!formik.values.header.fiscalYear || p.fiscalYear === formik.values.header.fiscalYear)
          )

          if (!stillValid) {
            const period = findPeriod(options, selected) || options[0]

            formik.setFieldValue('header.fiscalYear', period?.fiscalYear ?? null)
            formik.setFieldValue('header.periodId', period?.periodId ?? null)
            formik.setFieldValue('header.periodName', period?.periodName ?? null)
          }
        } else {
          setPeriodOptions(list)
          const period = findPeriod(list, selected)

          formik.setFieldValue('header.fiscalYear', period?.fiscalYear ?? year)
          formik.setFieldValue('header.periodId', period?.periodId ?? null)
          formik.setFieldValue('header.periodName', period?.periodName ?? null)
        }
      } catch (e) {
        if (cancelled) return
        formik.setFieldValue('header.fiscalYear', year)
        formik.setFieldValue('header.periodId', null)
        formik.setFieldValue('header.periodName', null)
      }
    }, 800)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [formik.values.header.date, formik.values.header.type, systemDefaults])

  const mergePreviewedItems = async newItems => {
    const existingItems = (formik.values.items || []).filter(item => item.itemId)

    const sizesByItem = new Map(existingItems.map(item => [item.itemId, item.sizes || []]))
    const notesByItem = new Map(existingItems.map(item => [item.itemId, item.note || '']))

    const merged = newItems.map((item, index) => ({
      ...item,
      id: index + 1,
      seqNo: index + 1,
      collectionName: item.collectionName ?? '',
      itemGroupName: item.groupName ?? '',
      categoryName: item.categoryName ?? '',
      onHand: formik.values.header.type === PROD_REQ_TYPE.TopSales ? item.onHand ?? null : null,
      sizes: sizesByItem.get(item.itemId) || [],
      note: notesByItem.get(item.itemId) || ''
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
          plantId: formik.values.header.plantId,
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

  const onUnpost = async () => {
    await postRequest({
      extension: ManufacturingRepository.ProductionRequest.unpost,
      record: JSON.stringify({ recordId: formik.values.recordId })
    })

    toast.success(platformLabels.Unposted)
    invalidate()
    await refetchForm(formik.values.recordId)
  }

  const actions = [
    {
      key: 'RecordRemarks',
      condition: true,
      onClick: 'onRecordRemarks',
      disabled: !editMode
    },
    {
      key: 'Locked',
      condition: isPosted,
      onSuccess: onUnpost,
      onClick: 'onUnpostConfirmation',
      disabled: !editMode || !!formik.values.header.summaryId
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

  const itemsRef = useRef(formik.values.items)
  itemsRef.current = formik.values.items

  const getWeight = async itemId => {
    const res = await getRequest({
      extension: InventoryRepository.Physical.get,
      parameters: `_itemId=${itemId}`
    })

    return res?.record?.weight ?? null
  }

  const refreshRowItem = async itemId => {
    const [{ record: item }, itemWeight] = await Promise.all([
      getRequest({ 
        extension: InventoryRepository.Items.get, 
        parameters: `_recordId=${itemId}` 
      }),
      getWeight(itemId)
    ])

    if (!item) return

    formik.setFieldValue(
      'items', itemsRef.current.map(ref => ref.itemId !== itemId
          ? ref
          : {
              ...ref,
              sku: item.sku,
              itemName: item.name,
              collectionName: item.collectionName ?? '',
              itemGroupName: item.groupName ?? '',
              categoryName: item.categoryName ?? '',
              itemWeight
            }
      )
    )
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
              },
              onSuccess: () => refreshRowItem(row.itemId)
            },
            nextToTitle: row?.sku
          })
        }
      },
      props: {
        endpointId: InventoryRepository.Items.snapshot,
        parameters: {
          _startAt: 0,
          _size: 50
        },
        valueField: 'sku',
        displayField: 'sku',
        readOnly: canPreview,
        mapping: [
          { from: 'recordId', to: 'itemId' },
          { from: 'sku', to: 'sku' },
          { from: 'name', to: 'itemName' },
          { from: 'collectionName', to: 'collectionName' },
          { from: 'groupName', to: 'itemGroupName' },
          { from: 'categoryName', to: 'categoryName' },
          { from: 'dmgId', to: 'dmgId' },
          { from: 'msId', to: 'msId' }
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
          itemWeight = await getWeight(newRow.itemId)
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
      component: 'textfield',
      label: labels.collection,
      name: 'collectionName',
      flex: 1,
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      label: labels.itemGroupName,
      name: 'itemGroupName',
      flex: 1,
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      label: labels.category,
      name: 'categoryName',
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
      name: 'onHand',
      flex: 1,
      props: {
        readOnly: true,
        decimalScale: 2
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
    },
    {
      component: 'button',
      name: 'noteAction',
      label: labels.notes,
      flex: 0.5,
      props: {
        imgSrc:'/images/buttonsIcons/notes.png', 
        color: '#90278e',
        onCondition: row => ({
          disabled: !row?.itemId
        })
      },
      onClick: (e, row) => openNote(row)
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
      isWorkFlow={true}
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
                    readOnly={editMode}
                    required
                    onChange={formik.setFieldValue}
                    onClear={() => {
                      formik.setFieldValue('header.date', null)
                      clearPeriod()
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
                    store={periodOptions}
                    name='header.periodId'
                    label={labels.period}
                    valueField='periodId'
                    displayField='periodName'
                    values={formik?.values?.header}
                    required
                    readOnly={!(isSpecialOrder && !editMode) || isPosted}
                    maxAccess={maxAccess}
                    onChange={(_, newValue) => {
                      formik.setFieldValue('header.periodId', newValue?.periodId || null)
                      formik.setFieldValue('header.periodName', newValue?.periodName || null)
                      formik.setFieldValue('header.fiscalYear', newValue?.fiscalYear || null)
                    }}
                    error={formik?.touched?.header?.periodName && Boolean(formik?.errors?.header?.periodName)}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SystemRepository.Plant.qry}
                    name='header.plantId'
                    label={labels.plant}
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
                      formik.setFieldValue('header.plantId', newValue?.recordId || null)
                    }}
                    error={formik?.touched?.header?.plantId && Boolean(formik?.errors?.header?.plantId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={InventoryRepository.Metals.qry}
                    name='header.metalId'
                    label={labels.metal}
                    valueField='recordId'
                    displayField={'reference'}
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
            highlightRow={{
              condition: row => !!row?.note?.trim(),
              color: () => '#f9f763'
            }}
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