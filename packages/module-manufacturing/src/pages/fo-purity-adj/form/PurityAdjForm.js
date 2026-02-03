import { Grid } from '@mui/material'
import { useContext, useEffect, useRef, useState } from 'react'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import { useDocumentType } from '@argus/shared-hooks/src/hooks/documentReferenceBehaviors'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { FoundryRepository } from '@argus/repositories/src/repositories/FoundryRepository'
import { createConditionalSchema } from '@argus/shared-domain/src/lib/validation'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import CustomTextArea from '@argus/shared-ui/src/components/Inputs/CustomTextArea'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import { formatDateFromApi, formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'

export default function PurityAdjForm({ labels, access, recordId, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels, userDefaultsData, defaultsData } = useContext(ControlContext)
  const [allMetals, setAllMetals] = useState([])
  const [recalc, setRecalc] = useState(false)
  const filteredItems = useRef()
  const functionId = SystemFunction.PurityAdjustment

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId,
    access,
    enabled: !recordId,
    objectName: 'header'
  })

  const invalidate = useInvalidate({
    endpointId: FoundryRepository.PurityAdjustment.page
  })

  const plantId = parseInt(userDefaultsData?.list?.find(obj => obj.key === 'plantId')?.value) || null
  const siteId = parseInt(userDefaultsData?.list?.find(obj => obj.key === 'siteId')?.value) || null
  const baseSalesMetalId = parseInt(defaultsData?.list?.find(obj => obj.key === 'baseSalesMetalId')?.value) || null

  const conditions = {
    sku: row => row?.sku,
    itemName: row => row?.itemName,
    qty: row => row?.qty,
    purity: row => row?.purity,
    metalId: row => row?.metalId
  }

  const { schema, requiredFields } = createConditionalSchema(conditions, true, maxAccess, 'items')

  const { formik } = useForm({
    documentType: { key: 'header.dtId', value: documentType?.dtId, reference: documentType?.reference },
    initialValues: {
      recordId: recordId || null,
      header: {
        recordId,
        functionId: SystemFunction.PurityAdjustment,
        date: new Date(),
        dtId: null,
        plantId,
        reference: '',
        siteId,
        status: 1,
        workCenterId: null,
        qty: 0,
        baseSalesMetalPurity: 0,
        baseSalesMetalRef: '',
        notes: ''
      },
      items: [
        {
          id: 1,
          trxId: recordId || 0,
          seqNo: 1,
          itemId: null,
          sku: '',
          itemName: '',
          metalId: null,
          purity: null,
          stdPurity: null,
          qty: 0
        }
      ]
    },
    maxAccess,
    validationSchema: yup.object({
      header: yup.object({
        date: yup.date().required(),
        siteId: yup.number().required(),
        plantId: yup.number().required(),
        workCenterId: yup.number().required()
      }),
      items: yup.array().of(schema)
    }),
    conditionSchema: ['items'],
    onSubmit: async obj => {
      const payload = getPayload(obj)

      const response = await postRequest({
        extension: FoundryRepository.PurityAdjustment.set2,
        record: JSON.stringify(payload)
      })
      toast.success(obj.recordId ? platformLabels.Edited : platformLabels.Added)
      refetchForm(response?.recordId)
      invalidate()
    }
  })

  const getPayload = obj => {
    return {
      header: {
        ...obj.header,
        date: formatDateToApi(obj.header.date),
        sumQty: totalMetal,
        sumDeltaPurity: totalDiffPurity,
        sumDeltaRMQty: totalDiffQty,
        sumNewRMQty: totalRmNewQty,
        sumRMQty: totalRmQty,
        avgPurity,
        avgNewPuirty: avgStdPurity
      },
      items: (obj?.items || [])
        .filter(row => Object.values(requiredFields)?.every(fn => fn(row)))
        .map((item, index) => ({
          ...item,
          type: 1,
          trxId: obj?.recordId || 0,
          seqNo: index + 1,
          purity: item.purity / 1000
        }))
    }
  }
  const editMode = !!formik.values?.header.recordId
  const isPosted = formik.values.header.status === 3

const calculateTotal = key =>
  formik.values.items
    .reduce((sum, item) => {
      return sum + (parseFloat(item[key]) || 0)
    }, 0)
    .toFixed(2)

  const totalMetal = recalc ? calculateTotal('qty') : formik.values?.header?.sumQty
  const totalRmQty = recalc ? calculateTotal('rmQty') : formik.values?.header?.sumRMQty
  const totalRmNewQty = recalc ? calculateTotal('newRmQty') : formik.values?.header?.sumNewRMQty
  const totalDiffQty = recalc ? calculateTotal('deltaRMQty') : formik.values?.header?.sumDeltaRMQty

  const avgPurity = recalc
    ? (((totalRmQty || 0) * (formik.values?.header?.baseSalesMetalPurity || 0)) / (totalMetal || 0)).toFixed(2)
    : formik.values?.header?.avgPurity

  const avgStdPurity = recalc
    ? (((totalRmNewQty || 0) * (formik.values?.header?.baseSalesMetalPurity || 0)) / (totalMetal || 0)).toFixed(2)
    : formik.values?.header?.avgNewPuirty
  const totalDiffPurity = recalc ? ((avgStdPurity || 0) - (avgPurity || 0)).toFixed(2) : formik.values?.header?.sumDeltaPurity

  const onPost = async () => {
    await postRequest({
      extension: FoundryRepository.PurityAdjustment.post,
      record: JSON.stringify({ ...formik.values?.header, date: formatDateToApi(formik.values.header.date) })
    })

    toast.success(platformLabels.Posted)
    invalidate()
    window.close()
  }

  const onUnpost = async () => {
    const res = await postRequest({
      extension: FoundryRepository.PurityAdjustment.unpost,
      record: JSON.stringify({ ...formik.values?.header, date: formatDateToApi(formik.values.header.date) })
    })

    toast.success(platformLabels.Unposted)
    refetchForm(res?.recordId)
    invalidate()
  }

  async function fillSKUStore(metalId) {
    filteredItems.current = metalId
      ? allMetals.filter(metal => {
          return metal.metalId === metalId
        })
      : []
  }

  async function getAllMetals() {
    const res = await getRequest({
      extension: InventoryRepository.Scrap.qry,
      parameters: '_metalId=0'
    })
    setAllMetals(res?.list)
  }

  const getOpenMetalPurity = async itemId => {
    const res = await getRequest({
      extension: InventoryRepository.Physical.get,
      parameters: `_itemId=${itemId}`
    })
  
    return res?.record?.isOpenMetalPurity || false
  }

  async function refetchForm(recordId) {
    const { record } = await getRequest({
      extension: FoundryRepository.PurityAdjustment.get2,
      parameters: `_recordId=${recordId}`
    })

    if (!record) {
      formik.setValues({ ...formik.initialValues })

      return
    }

   const itemsList = await Promise.all(
    (record?.items || []).map(async (item, index) => {
     const isOpenMetalPurity = await getOpenMetalPurity(item.itemId)

     return {
     ...item,
     id: index + 1,
     purity: item.purity * 1000,
     isOpenMetalPurity,
     }
    })
   )

    const metalInfo = await getBaseSalesMetalPurity()

    formik.setValues({
      recordId: record?.header?.recordId,
      header: {
        ...(record?.header || {}),
        date: formatDateFromApi(record?.header?.date),
        baseSalesMetalPurity: metalInfo?.purity * 1000 || 0,
        baseSalesMetalRef: metalInfo?.reference || 0
      },
      items: itemsList?.length ? itemsList : formik.initialValues.items
    })
    setRecalc(false)
  }

  const columns = [
    {
      component: 'numberfield',
      name: 'id',
      label: labels.count,
      props: { readOnly: true }
    },
    {
      component: 'textfield',
      label: labels.batchRef,
      name: 'batchRef',
      props: { maxLength: 10 }
    },
    {
      component: 'resourcecombobox',
      label: labels.metal,
      name: 'metalId',
      props: {
        endpointId: FoundryRepository.PurityAdjustment.combos,
        reducer: response => response?.record?.metals,
        valueField: 'recordId',
        displayField: 'reference',
        displayFieldWidth: 1.5,
        mapping: [
          { from: 'reference', to: 'metalRef' },
          { from: 'recordId', to: 'metalId' },
          { from: 'purity', to: 'purity' }
        ]
      },
      propsReducer({ row, props }) {
        return { ...props, readOnly: !!row.itemId }
      },
      onChange: async ({ row: { update, newRow } }) => {
        setRecalc(true)
        fillSKUStore(newRow?.metalId)
        update({
          purity: (newRow?.purity * 1000 || 0).toFixed(2),
          deltaPurity: ((newRow?.stdPurity || 0) - (newRow?.purity || 0) * 1000).toFixed(2)
        })
      }
    },
    {
      component: 'resourcecombobox',
      label: labels.sku,
      name: 'sku',
      props: {
        store: filteredItems?.current,
        valueField: 'itemId',
        displayField: 'sku',
        refresh: false,
        mapping: [
          { from: 'itemName', to: 'itemName' },
          { from: 'itemId', to: 'itemId' },
          { from: 'sku', to: 'sku' }
        ],
        columnsInDropDown: [
          { key: 'sku', value: 'SKU' },
          { key: 'itemName', value: 'Item Name' }
        ],
        displayFieldWidth: 3.5
      },
      onChange: async ({ row: { update, newRow } }) => {
        setRecalc(true)

        const stdPurity = 0
        const isOpenMetalPurity = await getOpenMetalPurity(newRow?.itemId)

        const newRmQty = formik.values?.header?.baseSalesMetalPurity

          ? (((newRow?.qty || 0) * (stdPurity)) / formik.values?.header?.baseSalesMetalPurity).toFixed(2)
          : 0

        update({
          stdPurity,
          deltaPurity: ((stdPurity) - (newRow?.purity || 0)).toFixed(2),
          newRmQty,
          deltaRMQty: (newRmQty - (newRow?.rmQty || 0)).toFixed(2),
          isOpenMetalPurity
        })
      },
      propsReducer({ row, props }) {
        return { ...props, store: filteredItems?.current }
      },
      flex: 1.5
    },
    {
      component: 'textfield',
      label: labels.itemName,
      name: 'itemName',
      props: {
        readOnly: true
      },
      flex: 2
    },
    {
      component: 'numberfield',
      name: 'qty',
      label: labels.qty,
      props: { allowNegative: false, maxLength: 11, decimalScale: 2 },
      async onChange({ row: { update, newRow } }) {
        setRecalc(true)

        const rmQty = formik.values?.header?.baseSalesMetalPurity
          ? (((newRow?.qty || 0) * (newRow?.purity || 0)) / formik.values?.header?.baseSalesMetalPurity).toFixed(2)
          : 0

        const newRmQty = formik.values?.header?.baseSalesMetalPurity
          ? (((newRow?.qty || 0) * (newRow?.stdPurity || 0)) / formik.values?.header?.baseSalesMetalPurity).toFixed(2)
          : 0

        update({
          rmQty,
          newRmQty,
          deltaRMQty: (newRmQty - rmQty).toFixed(2)
        })
      }
    },
    {
      component: 'numberfield',
      name: 'purity',
      label: labels.purity,
      props: { decimalScale: 2 },
      async onChange({ row: { update, newRow } }) {
        setRecalc(true)

        const rmQty = formik.values?.header?.baseSalesMetalPurity
          ? (((newRow?.qty || 0) * (newRow?.purity || 0)) / formik.values?.header?.baseSalesMetalPurity).toFixed(2)
          : 0
        update({
          deltaPurity:((newRow?.stdPurity || 0) - (newRow?.purity || 0)).toFixed(2),
          rmQty,
          deltaRMQty: ((newRow?.newRmQty || 0) - rmQty).toFixed(2)
        })
      },
      propsReducer({ row, props }) {
        return { ...props, readOnly: !row.isOpenMetalPurity }
      }
    },
    {
      component: 'numberfield',
      name: 'rmQty',
      label: `${labels.qty} ${formik.values?.header?.baseSalesMetalRef || ''}`,
      props: { decimalScale: 2, readOnly: true }
    },
    {
      component: 'numberfield',
      name: 'stdPurity',
      label: labels.newPurity,
      updateOn: 'blur',
      props: {decimalScale: 2, maxLength: 11 , allowNegative: false},
      async onChange({ row: { update, newRow } }) {
       setRecalc(true)
       
       const newRmQty = formik.values?.header?.baseSalesMetalPurity
          ? (((newRow?.qty || 0) * (newRow?.stdPurity || 0)) / formik.values?.header?.baseSalesMetalPurity).toFixed(2)
          : 0
        update({
          stdPurity: newRow?.stdPurity || 0,
          deltaPurity: ((newRow?.stdPurity || 0) - (newRow?.purity || 0)).toFixed(2),
          newRmQty,
          deltaRMQty: (newRmQty - (newRow?.rmQty || 0)).toFixed(2)
        })
      }
    },
    {
      component: 'numberfield',
      name: 'newRmQty',
      label: `${labels.newRmQty} ${formik.values?.header?.baseSalesMetalRef || ''}`,
      props: { decimalScale: 2, readOnly: true }
    },
    {
      component: 'numberfield',
      name: 'deltaRMQty',
      label: labels.diffQty,
      props: { decimalScale: 2, readOnly: true }
    },
    {
      component: 'numberfield',
      name: 'deltaPurity',
      label: labels.diffPurity,
      props: { readOnly: true, decimalScale: 2 }
    }
  ]

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
      key: 'IV',
      condition: true,
      onClick: 'onInventoryTransaction',
      disabled: !editMode || !isPosted
    },
    {
      key: 'GL',
      condition: true,
      onClick: 'onClickGL',
      datasetId: ResourceIds.GLTransactionItem,
      valuesPath: formik.values.header,
      disabled: !editMode
    }
  ]

  async function selectedDocTypeInfo(dtId) {
    if (!dtId) return

    const res = await getRequest({
      extension: FoundryRepository.DocumentTypeDefault.get,
      parameters: `_dtId=${dtId}`
    })

    return res?.record || {}
  }

  async function getBaseSalesMetalPurity() {
    if (!baseSalesMetalId) return

    const res = await getRequest({
      extension: InventoryRepository.Metals.get,
      parameters: `_recordId=${baseSalesMetalId}`
    })

    return res?.record || {}
  }

  useEffect(() => {
    ;(async function () {
      if (!recordId) {
        const dtInfo = await selectedDocTypeInfo(formik?.values?.header?.dtId)
        formik.setFieldValue('header.siteId', dtInfo?.siteId || null)
        formik.setFieldValue('header.workCenterId', dtInfo?.workCenterId || null)
      }
    })()
  }, [formik.values?.header?.dtId])

  useEffect(() => {
    ;(async function () {
      if (baseSalesMetalId && !recordId) {
        const res = await getBaseSalesMetalPurity()
        formik.setFieldValue('header.baseSalesMetalPurity', res?.purity * 1000 || 0)
        formik.setFieldValue('header.baseSalesMetalRef', res?.reference || '')
      }
    })()
  }, [baseSalesMetalId])

  useEffect(() => {
    ;(async function () {
      await getAllMetals()
      if (recordId) refetchForm(recordId)
    })()
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.PurityAdjustment}
      form={formik}
      maxAccess={maxAccess}
      actions={actions}
      previewReport={editMode}
      editMode={editMode}
      functionId={functionId}
      disabledSubmit={isPosted}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={FoundryRepository.PurityAdjustment.combos}
                    reducer={response => response?.record?.documentTypes}
                    filter={!editMode ? item => item.activeStatus === 1 : undefined}
                    name='header.dtId'
                    label={labels.docType}
                    readOnly={editMode}
                    valueField='recordId'
                    displayField='name'
                    values={formik.values.header}
                    onChange={(_, newValue) => {
                      changeDT(newValue)
                      formik.setFieldValue('header.dtId', newValue?.recordId || null)
                    }}
                    error={formik.touched.header?.dtId && Boolean(formik.errors.header?.dtId)}
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='header.reference'
                    label={labels.reference}
                    value={formik.values.header.reference}
                    readOnly={editMode}
                    maxAccess={!editMode && maxAccess}
                    maxLength='15'
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('header.reference', '')}
                    error={formik.touched.header?.reference && Boolean(formik.errors.header?.reference)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomDatePicker
                    name='header.date'
                    required
                    readOnly={isPosted}
                    label={labels.date}
                    value={formik.values.header.date}
                    onChange={formik.setFieldValue}
                    maxAccess={maxAccess}
                    onClear={() => formik.setFieldValue('header.date', null)}
                    error={formik.touched.header?.date && Boolean(formik.errors.header?.date)}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={FoundryRepository.PurityAdjustment.combos}
                    reducer={response => response?.record?.plants}
                    name='header.plantId'
                    readOnly={editMode}
                    required
                    label={labels.plant}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik.values.header}
                    maxAccess={maxAccess}
                    onChange={(_, newValue) => {
                      formik.setFieldValue('header.plantId', newValue?.recordId || null)
                    }}
                    error={formik.touched.header?.plantId && Boolean(formik.errors.header?.plantId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={FoundryRepository.PurityAdjustment.combos}
                    reducer={response => response?.record?.sites}
                    name='header.siteId'
                    label={labels.site}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    values={formik.values.header}
                    maxAccess={maxAccess}
                    readOnly={isPosted}
                    onChange={(_, newValue) => formik.setFieldValue('header.siteId', newValue?.recordId || null)}
                    required
                    error={formik.touched.header?.siteId && Boolean(formik.errors.header?.siteId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={FoundryRepository.PurityAdjustment.combos}
                    reducer={response => response?.record?.workCenters}
                    name='header.workCenterId'
                    label={labels.workCenter}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik.values.header}
                    required
                    readOnly={isPosted}
                    maxAccess={maxAccess}
                    onChange={(_, newValue) => formik.setFieldValue('header.workCenterId', newValue?.recordId || null)}
                    error={formik.touched.header?.workCenterId && formik.errors.header?.workCenterId}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <DataGrid
              onChange={(value, action) => {
              formik.setFieldValue('items', value)
              action === 'delete' && setRecalc(true)
            }}
            value={formik.values?.items}
            error={formik.errors?.items}
            name='items'
            columns={columns}
            initialValues={formik?.initialValues?.items?.[0]}
            maxAccess={maxAccess}
            disabled={isPosted}
            allowDelete={!isPosted}
            onSelectionChange={(row, _, field) => {
              if (field == 'sku') fillSKUStore(row?.metalId)
            }}
          />
        </Grow>
        <Fixed>
          <Grid container xs={12}>
            <Grid item xs={6}>
              <CustomTextArea
                name='header.notes'
                label={labels.notes}
                value={formik.values.header?.notes}
                rows={4}
                maxLength='200'
                readOnly={isPosted}
                maxAccess={maxAccess}
                onChange={e => formik.setFieldValue('header.notes', e.target.value)}
                onClear={() => formik.setFieldValue('header.notes', '')}
                error={formik.touched.header?.notes && Boolean(formik.errors.header?.notes)}
              />
            </Grid>
            <Grid container xs={6} justifyContent={'flex-end'}>
              <Grid container xs={4} spacing={2}>
                <Grid item xs={12}>
                  <CustomNumberField
                    label={labels.totalQty}
                    value={totalMetal}
                    decimalScale={2}
                    readOnly
                    align='right'
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    label={`${labels.totalQty} ${formik.values?.header?.baseSalesMetalRef || ''}`}
                    value={totalRmQty}
                    decimalScale={2}
                    readOnly
                    align='right'
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    label={`${labels.totalNewRmQty} ${formik.values?.header?.baseSalesMetalRef || ''}`}
                    value={totalRmNewQty}
                    decimalScale={2}
                    readOnly
                    align='right'
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    label={labels.totalDiffQty}
                    value={totalDiffQty}
                    decimalScale={2}
                    readOnly
                    align='right'
                  />
                </Grid>
              </Grid>
              <Grid container xs={4} spacing={2} sx={{ pl: 1, height: '70%' }}>
                <Grid item xs={12}>
                  <CustomNumberField
                    label={labels.avgPurity}
                    value={avgPurity}
                    decimalScale={2}
                    readOnly
                    align='right'
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    label={labels.avgStdPurity}
                    value={avgStdPurity}
                    decimalScale={2}
                    readOnly
                    align='right'
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    label={labels.totalDiffPurity}
                    value={totalDiffPurity}
                    decimalScale={2}
                    readOnly
                    align='right'
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}
