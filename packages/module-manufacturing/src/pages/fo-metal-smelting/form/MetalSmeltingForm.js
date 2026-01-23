import { Grid } from '@mui/material'
import { useContext, useEffect, useRef, useState } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import { formatDateFromApi, formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import { useDocumentType } from '@argus/shared-hooks/src/hooks/documentReferenceBehaviors'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import { FoundryRepository } from '@argus/repositories/src/repositories/FoundryRepository'
import { ManufacturingRepository } from '@argus/repositories/src/repositories/ManufacturingRepository'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import { useError } from '@argus/shared-providers/src/providers/error'
import { createConditionalSchema } from '@argus/shared-domain/src/lib/validation'
import CustomTextArea from '@argus/shared-ui/src/components/Inputs/CustomTextArea'
import { DefaultsContext } from '@argus/shared-providers/src/providers/DefaultsContext'

export default function MetalSmeltingForm({ labels, access, recordId, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { systemDefaults, userDefaults } = useContext(DefaultsContext)
  const { stack: stackError } = useError()
  const [allMetals, setAllMetals] = useState([])
  const [recalc, setRecalc] = useState(false)
  const filteredItems = useRef()
  const alloyMetalItems = useRef({})
  const functionId = SystemFunction.MetalSmelting

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId,
    access,
    enabled: !recordId,
    objectName: 'header'
  })

  const invalidate = useInvalidate({
    endpointId: FoundryRepository.FoundaryTransaction.page
  })

  const plantId = parseInt(userDefaults?.list?.find(obj => obj.key === 'plantId')?.value)
  const siteId = parseInt(userDefaults?.list?.find(obj => obj.key === 'siteId')?.value)
  const baseSalesMetalId = parseInt(systemDefaults?.list?.find(obj => obj.key === 'baseSalesMetalId')?.value) || null

  const scrapsConditions = {
    sku: row => row?.sku,
    itemName: row => row?.itemName,
    qty: row => row?.qty
  }

  const { schema, requiredFields } = createConditionalSchema(scrapsConditions, true, maxAccess, 'scraps')

  const { formik } = useForm({
    documentType: { key: 'header.dtId', value: documentType?.dtId, reference: documentType?.reference },
    initialValues: {
      recordId: recordId || null,
      header: {
        recordId,
        functionId: SystemFunction.MetalSmelting,
        date: new Date(),
        dtId: null,
        plantId,
        reference: '',
        siteId,
        status: 1,
        workCenterId: null,
        itemId: null,
        qty: null,
        extendedAlloy: 0,
        totalAlloy: 0,
        purity: null,
        metalId: null,
        smeltingMaxAllowedVariation: null,
        notes: '',
        baseSalesMetalPurity: 0,
        baseSalesMetalRef: '',
        avgPurity: 0
      },
      items: [
        {
          id: 1,
          itemId: null,
          sku: '',
          itemName: '',
          metalId: null,
          purity: null,
          qty: 0,
          seqNo: 1,
          trxId: recordId || 0,
          type: null,
          currentCost: 0,
          qtyAtPurity: 0,
          expectedAlloyQty: 0
        }
      ],
      scraps: [{ id: 1, itemId: null, sku: '', itemName: '', qty: null }]
    },
    maxAccess,
    conditionSchema: ['scraps'],
    validationSchema: yup.object({
      header: yup.object({
        date: yup.date().required(),
        siteId: yup.number().required(),
        plantId: yup.number().required(),
        workCenterId: yup.number().required(),
        metalId: yup.number().required()
      }),
      items: yup
        .array()
        .of(
          yup.object().shape({
            type: yup.number().required(),
            metalId: yup.number().test(function (value) {
              if (this.parent.type == 1) {
                return !!value
              }

              return true
            }),
            sku: yup.string().required(),
            itemName: yup.string().required()
          })
        )
        .required(),
      scraps: yup.array().of(schema)
    }),
    onSubmit: async obj => {
      if (
        obj.header?.smeltingMaxAllowedVariation &&
        expectedAlloy - totalAlloy > obj.header?.smeltingMaxAllowedVariation
      ) {
        stackError({
          message: labels.smeltingMaxAllowedVariation
        })

        return
      }

      const payload = getPayload(obj)

      const response = await postRequest({
        extension: FoundryRepository.FoundaryTransaction.set2,
        record: JSON.stringify(payload)
      })
      toast.success(obj.recordId ? platformLabels.Edited : platformLabels.Added)
      refetchForm(response?.recordId)
      invalidate()
    }
  })

  const getPayload = obj => {
    return {
      header: { ...obj.header, date: formatDateToApi(obj.header.date), qtyDiff, sumRMQty: totalRmQty, avgPurity},
      items: obj.items?.map((item, index) => ({
        ...item,
        trxId: obj?.recordId || 0,
        seqNo: index + 1,
        purity: item.purity / 1000
      })),
      scraps: (obj?.scraps || [])
        .filter(row => Object.values(requiredFields)?.every(fn => fn(row)))
        .map((item, index) => ({
          ...item,
          trxId: obj?.recordId || 0,
          seqNo: index + 1
        }))
    }
  }
  const editMode = !!formik.values?.header.recordId
  const isPosted = formik.values.header.status === 3

  const calculateTotal = (key, typeFilter = null) =>
    formik.values.items.reduce((sum, item) => {
      if (typeFilter && item.type != typeFilter) return sum

      return sum + (parseFloat(item[key]) || 0)
    }, 0)

  const scrapQty = formik?.values?.scraps?.reduce((sum, item) => {
    return sum + (parseFloat(item.qty) || 0)
  }, 0)

  const qtyIn = parseFloat(formik.values?.header?.qty || 0) + parseFloat(scrapQty || 0)
  const qtyOut = calculateTotal('qty')

  const qtyDiff = recalc ? parseFloat(qtyOut || 0) - parseFloat(qtyIn || 0) : formik.values?.header?.qtyDiff || 0
  const totalAlloy = calculateTotal('qty', 2)
  const expectedAlloy = calculateTotal('expectedAlloyQty')
  const headerPurity = parseFloat(formik.values?.header?.purity)
  const totalRmQty = recalc ? calculateTotal('rmQty') : formik.values?.header?.sumRMQty
  
  const avgPurity = recalc
    ? (((totalRmQty || 0) * (formik.values?.header?.baseSalesMetalPurity || 0)) / (qtyOut || 0)).toFixed(2)
    : formik.values?.header?.avgPurity || 0

  const totalDesiredPurity = headerPurity
    ? formik.values.items.reduce((sum, item) => {
        if (item.type != 1) return sum

        const qty = parseFloat(item.qty) || 0
        const purity = parseFloat(item.purity) || 0

        return sum + (qty * purity) / headerPurity
      }, 0)
    : 0

  const expectedAlloyQtyPerRow = (qtyAtPurity, qty) => {
    return parseFloat(qtyAtPurity) - parseFloat(qty)
  }

  const qtyAtPurityPerRow = (qty, purity, headerPurity) => {
    return Boolean(headerPurity)? Math.abs((parseFloat(qty) * parseFloat(purity)) / parseFloat(headerPurity)) : 0
  }

  const updatePurityRelatedFields = headerPurity => {
    const updatedList = formik.values?.items?.map(item => {
      const qtyAtPurity =
        item?.type == 1 ? qtyAtPurityPerRow(item?.qty || 0, item?.purity || 0, headerPurity || 0) : item?.qtyAtPurity

      return {
        ...item,
        expectedAlloyQty:
          item?.type == 1 ? expectedAlloyQtyPerRow(qtyAtPurity || 0, item?.qty || 0) : item?.expectedAlloyQty,
        qtyAtPurity
      }
    })
    formik.setFieldValue('items', updatedList)
  }

  const onPost = async () => {
    await postRequest({
      extension: FoundryRepository.FoundaryTransaction.post,
      record: JSON.stringify({ ...formik.values?.header, date: formatDateToApi(formik.values.header.date) })
    })

    toast.success(platformLabels.Posted)
    invalidate()
    window.close()
  }

  const onUnpost = async () => {
    const res = await postRequest({
      extension: FoundryRepository.FoundaryTransaction.unpost,
      record: JSON.stringify({ ...formik.values?.header, date: formatDateToApi(formik.values.header.date) })
    })

    toast.success(platformLabels.Unposted)
    refetchForm(res?.recordId)
    invalidate()
  }

  async function fillSKUStore(metalId, flag) {
    if (flag == 'metal')
      filteredItems.current = metalId
        ? allMetals.filter(metal => {
            return metal.metalId === metalId
          })
        : []
    else filteredItems.current = alloyMetalItems.current || []
  }

  async function getAllMetals() {
    const res = await getRequest({
      extension: InventoryRepository.Scrap.qry,
      parameters: '_metalId=0'
    })
    setAllMetals(res?.list)
  }

  async function getUnitCost(itemId) {
    if (!itemId) return

    const res = await getRequest({
      extension: InventoryRepository.CurrentCost.get,
      parameters: `_itemId=${itemId}`
    })

    return res?.record?.currentCost
  }

  async function refetchForm(recordId) {
    const { record } = await getRequest({
      extension: FoundryRepository.FoundaryTransaction.get2,
      parameters: `_recordId=${recordId}`
    })

    if (!record) {
      formik.setValues({ ...formik.initialValues })

      return
    }

    const dtInfo = await selectedDocTypeInfo(record?.header?.dtId || null)

    const itemsList = (record?.items || []).map((item, index) => ({
      ...item,
      id: index + 1,
      purity: item.purity * 1000,
      metalId: item.metalId || ''
    }))

    const scrapsList = (record?.scraps || []).map((item, index) => ({
      ...item,
      id: index + 1
    }))

    const metalInfo = await getBaseSalesMetalPurity()

    formik.setValues({
      recordId: record?.header?.recordId,
      header: {
        ...(record?.header || {}),
        date: formatDateFromApi(record?.header?.date),
        smeltingMaxAllowedVariation: dtInfo?.smeltingMaxAllowedVariation || null,
        baseSalesMetalPurity: metalInfo?.purity * 1000 || 0,
        baseSalesMetalRef: metalInfo?.reference || 0
      },
      items: itemsList?.length ? itemsList : formik.initialValues.items,
      scraps: scrapsList?.length ? scrapsList : formik.initialValues?.scraps
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
      component: 'resourcecombobox',
      label: labels.type,
      name: 'type',
      props: {
        datasetId: DataSets.SMELTING_METAL_TYPE,
        displayField: 'value',
        valueField: 'key',
        displayFieldWidth: 2,
        mapping: [
          { from: 'key', to: 'type' },
          { from: 'value', to: 'typeName' }
        ]
      },
      onChange: async ({ row: { update, newRow } }) => {
        if (newRow?.type == 2) fillSKUStore()
        update({ itemId: null, sku: '', itemName: '', metalId: '', metalRef: '', purity: newRow?.type == 1 ? 0 : '' })
      }
    },
    {
      component: 'resourcecombobox',
      label: labels.metal,
      name: 'metalId',
      props: {
        endpointId: InventoryRepository.Metals.qry,
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
        return { ...props, readOnly: !!row.itemId || row.type == 2 }
      },
      onChange: async ({ row: { update, newRow } }) => {
        fillSKUStore(newRow?.metalId, 'metal')
        if (newRow?.purity) update({ purity: newRow.purity * 1000 })
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
      propsReducer({ row, props }) {
        return { ...props, store: filteredItems?.current }
      },
      onChange: async ({ row: { update, newRow } }) => {
        if (!newRow?.itemId) return
        const currentCost = await getUnitCost(newRow?.itemId)
        update({
          currentCost
        })
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
      updateOn: 'blur',
      props: { allowNegative: false, maxLength: 12, decimalScale: 2 },
      onChange: ({ row: { update, newRow } }) => {
        setRecalc(true)
        if (newRow?.type == 1) {
          const qtyAtPurity = qtyAtPurityPerRow(
            newRow?.qty || 0,
            newRow?.purity || 0,
            formik.values?.header?.purity || 0
          )
          const expectedAlloyQty = expectedAlloyQtyPerRow(qtyAtPurity || 0, newRow?.qty || 0)
          
          const rmQty = formik.values?.header?.baseSalesMetalPurity
          ? (((newRow?.qty || 0) * (newRow?.purity || 0)) / formik.values?.header?.baseSalesMetalPurity).toFixed(2)
          : 0

          update({ expectedAlloyQty, qtyAtPurity, rmQty, qty: newRow?.qty || 0 })
        }
        else update({ qty: newRow?.qty || 0 })
      }
    },
    {
      component: 'numberfield',
      name: 'purity',
      label: labels.purity,
      props: { allowNegative: false, maxLength: 12, decimalScale: 2 },
      onChange: ({ row: { update, newRow } }) => {
        setRecalc(true)
        if (newRow?.type == 1) {
          const qtyAtPurity = qtyAtPurityPerRow(
            newRow?.qty || 0,
            newRow?.purity || 0,
            formik.values?.header?.purity || 0
          )
          const expectedAlloyQty = expectedAlloyQtyPerRow(qtyAtPurity || 0, newRow?.qty || 0)
          
          const rmQty = formik.values?.header?.baseSalesMetalPurity
          ? (((newRow?.qty || 0) * (newRow?.purity || 0)) / formik.values?.header?.baseSalesMetalPurity).toFixed(2)
          : 0

          update({ expectedAlloyQty, qtyAtPurity, rmQty})
        }
      },
      propsReducer({ row, props }) {
        return { ...props, readOnly: row.type == 2 }
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
      name: 'qtyAtPurity',
      label: labels.purityQty,
      props: { readOnly: true, decimalScale: 2 }
    },
    {
      component: 'numberfield',
      name: 'expectedAlloyQty',
      label: labels.expectedAlloyQty,
      props: { readOnly: true, decimalScale: 2 }
    },
    {
      component: 'numberfield',
      name: 'currentCost',
      label: labels.unitCost,
      props: { readOnly: true }
    }
  ]

  const scrapItemsColumns = [
    {
      component: 'resourcecombobox',
      label: labels.sku,
      name: 'sku',
      props: {
        endpointId: FoundryRepository.SmeltingScrapItem.qry,
        parameters: `_metalId=${formik.values?.header?.metalId}`,
        valueField: 'itemId',
        displayField: 'sku',
        displayFieldWidth: 3,
        mapping: [
          { from: 'itemName', to: 'itemName' },
          { from: 'itemId', to: 'itemId' },
          { from: 'sku', to: 'sku' }
        ],
        columnsInDropDown: [
          { key: 'sku', value: 'SKU' },
          { key: 'itemName', value: 'Item Name' }
        ]
      },
      propsReducer({ row, props }) {
        return { ...props, readOnly: !formik.values?.header?.metalId }
      }
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
      props: { allowNegative: false, maxLength: 12, decimalScale: 2 },
      onChange: () => {
        setRecalc(true)
      }
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
      disabled: !editMode || formik.values.header.qtyDiff != 0
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

  async function getItemMetal(itemId) {
    if (!itemId) return

    const res = await getRequest({
      extension: InventoryRepository.Physical.get,
      parameters: `_itemId=${itemId}`
    })

    return res?.record?.metalId || null
  }

  async function selectedDocTypeInfo(dtId) {
    if (!dtId) {
      formik.setFieldValue('header.smeltingMaxAllowedVariation', null)

      return
    }

    const res = await getRequest({
      extension: FoundryRepository.DocumentTypeDefault.get,
      parameters: `_dtId=${dtId}`
    })

    return res?.record || {}
  }

  function resetItem() {
    formik.setFieldValue('header.itemName', '')
    formik.setFieldValue('header.sku', '')
    formik.setFieldValue('header.itemId', null)
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
        formik.setFieldValue('header.smeltingMaxAllowedVariation', dtInfo?.smeltingMaxAllowedVariation || null)
      }
    })()
  }, [formik.values?.header?.dtId])

  useEffect(() => {
    ;(async function () {
      await getAllMetals()

      const { list } = await getRequest({
        extension: FoundryRepository.AlloyMetals.qry,
        parameters: `_filter=`
      })

      const mappedList = (list || []).map(item => ({
        ...item,
        itemName: item.name
      }))
      alloyMetalItems.current = mappedList || []
      if (recordId) refetchForm(recordId)
    })()
  }, [])

  useEffect(() => {
    ;(async function () {
      if (baseSalesMetalId && !recordId) {
        const res = await getBaseSalesMetalPurity()
        formik.setFieldValue('header.baseSalesMetalPurity', res?.purity * 1000 || 0)
        formik.setFieldValue('header.baseSalesMetalRef', res?.reference || '')
      }
    })()
  }, [baseSalesMetalId])

  return (
    <FormShell
      resourceId={ResourceIds.MetalSmelting}
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
            <Grid item xs={4}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SystemRepository.DocumentType.qry}
                    parameters={`_startAt=0&_pageSize=1000&_dgId=${functionId}`}
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
            <Grid item xs={4}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SystemRepository.Plant.qry}
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
                    onChange={(event, newValue) => {
                      formik.setFieldValue('header.plantId', newValue?.recordId || null)
                    }}
                    error={formik.touched.header?.plantId && Boolean(formik.errors.header?.plantId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={InventoryRepository.Site.qry}
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
                    endpointId={ManufacturingRepository.WorkCenter.qry}
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
            <Grid item xs={4}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={InventoryRepository.Metals.qry}
                    name='header.metalId'
                    label={labels.metal}
                    valueField='recordId'
                    displayField='reference'
                    values={formik.values.header}
                    required
                    onChange={(_, newValue) => {
                      resetItem()
                      formik.setFieldValue('header.metalId', newValue?.recordId || null)
                    }}
                    error={formik.touched.header?.metalId && Boolean(formik.errors.header?.metalId)}
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceLookup
                    endpointId={InventoryRepository.Item.snapshot}
                    name='header.itemId'
                    label={labels.sku}
                    valueField='sku'
                    displayField='name'
                    valueShow='sku'
                    secondValueShow='itemName'
                    form={formik}
                    formObject={formik.values.header}
                    columnsInDropDown={[
                      { key: 'sku', value: 'SKU' },
                      { key: 'name', value: 'Name' }
                    ]}
                    onChange={async (_, newValue) => {
                      formik.setFieldValue('header.sku', null)
                      const metal = await getItemMetal(newValue?.recordId)
                      if (newValue?.recordId && metal != formik.values.header.metalId) {
                        stackError({
                          message: labels.metalMismatch
                        })

                        resetItem()

                        return
                      }
                      formik.setFieldValue('header.itemName', newValue?.name || '')
                      formik.setFieldValue('header.sku', newValue?.sku || '')
                      formik.setFieldValue('header.itemId', newValue?.recordId || null)
                    }}
                    readOnly={isPosted}
                    displayFieldWidth={2}
                    maxAccess={access}
                    errorCheck={'header.itemId'}
                  />
                </Grid>
                <Grid item xs={6}>
                  <CustomNumberField
                    name='header.purity'
                    label={labels.purity}
                    readOnly={isPosted}
                    onBlur={e => {
                      let value = Number(e.target.value.replace(/,/g, ''))
                      updatePurityRelatedFields(value)
                      formik.setFieldValue('header.purity', value)
                    }}
                    value={formik.values.header.purity}
                    maxLength={12}
                    decimalScale={3}
                    allowNegative={false}
                    align='right'
                    onClear={() => {
                      updatePurityRelatedFields(0)
                      formik.setFieldValue('header.purity', '')
                    }}
                    error={formik.touched.header?.purity && Boolean(formik.errors.header?.purity)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <CustomNumberField
                    name='header.qty'
                    label={labels.qty}
                    onBlur={e => {
                      setRecalc(true)
                      let value = Number(e.target.value.replace(/,/g, ''))
                      formik.setFieldValue('header.qty', value)
                    }}
                    value={formik.values.header?.qty}
                    maxLength={12}
                    decimalScale={3}
                    allowNegative={false}
                    align='right'
                    readOnly={isPosted}
                    onClear={() => formik.setFieldValue('header.qty', '')}
                    error={formik.touched.header?.qty && Boolean(formik.errors.header?.qty)}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('items', value)}
            value={formik.values?.items}
            error={formik.errors?.items}
            name='items'
            columns={columns}
            initialValues={formik?.initialValues?.items?.[0]}
            maxAccess={maxAccess}
            disabled={isPosted}
            allowDelete={!isPosted}
            onSelectionChange={(row, _, field) => {
              const flag = row.type != 2 ? 'metal' : ''
              if (field == 'sku') fillSKUStore(row?.metalId, flag)
            }}
          />
        </Grow>
        <Fixed>
          <Grid container xs={12}>
            <Grid container xs={6}>
              <DataGrid
                onChange={value => formik.setFieldValue('scraps', value)}
                value={formik.values?.scraps}
                error={formik.errors?.scraps}
                name='ScrapItems'
                columns={scrapItemsColumns}
                initialValues={formik?.initialValues?.scraps}
                maxAccess={maxAccess}
                disabled={isPosted}
                allowDelete={!isPosted}
                height='26vh'
              />
            </Grid>
            <Grid item xs={4} sx={{ pl: 2, pt: 3 }}>
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
            <Grid container xs={2} justifyContent={'flex-end'} sx={{ pl: 2, pt: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <CustomNumberField
                    label={labels.totalMetal}
                    value={totalDesiredPurity}
                    decimalScale={3}
                    readOnly
                    align='right'
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    label={labels.totalAlloy}
                    value={totalAlloy}
                    decimalScale={3}
                    readOnly
                    align='right'
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    label={labels.expectedAlloy}
                    value={expectedAlloy}
                    decimalScale={3}
                    readOnly
                    align='right'
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField label={labels.qtyIn} value={qtyIn} decimalScale={3} readOnly align='right' />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField label={labels.qtyOut} value={qtyOut} decimalScale={3} readOnly align='right' />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField label={labels.qtyDiff} value={qtyDiff} decimalScale={3} readOnly align='right' />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField label={labels.avgPurity} value={avgPurity} decimalScale={3} readOnly align='right' />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}
