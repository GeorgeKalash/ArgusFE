import { Grid } from '@mui/material'
import { useContext, useEffect, useRef, useState } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'
import { SystemRepository } from 'src/repositories/SystemRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { SystemFunction } from 'src/resources/SystemFunction'
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'
import { ControlContext } from 'src/providers/ControlContext'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { FoundryRepository } from 'src/repositories/FoundryRepository'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import FieldSet from 'src/components/Shared/FieldSet'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { DataSets } from 'src/resources/DataSets'

export default function MetalSmeltingForm({ labels, access, recordId, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels, defaultsData, userDefaultsData } = useContext(ControlContext)
  const [allMetals, setAllMetals] = useState([])
  const filteredItems = useRef()
  const metalRef = useRef({})
  const alloyMetalItems = useRef({})
  const functionId = SystemFunction.MetalSmelting

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId,
    access,
    enabled: !recordId,
    objectName: 'header'
  })

  const invalidate = useInvalidate({
    endpointId: FoundryRepository.MetalSmelting.page
  })

  const plantId = parseInt(userDefaultsData?.list?.find(obj => obj.key === 'plantId')?.value)
  const siteId = parseInt(userDefaultsData?.list?.find(obj => obj.key === 'siteId')?.value)

  const { formik } = useForm({
    documentType: { key: 'header.dtId', value: documentType?.dtId, reference: documentType?.reference },
    initialValues: {
      recordId: recordId || null,
      header: {
        recordId,
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
        metalId: null
      },
      items: [
        {
          id: 1,
          itemId: null,
          sku: '',
          itemName: '',
          metalId: null,
          purity: 0,
          qty: 0,
          seqNo: 1,
          metalValue: null,
          trxId: recordId || 0,
          type: null,
          currentCost: 0,
          qtyAtPurity: 0,
          expectedAlloyQty: 0
        }
      ]
    },
    maxAccess,
    validationSchema: yup.object({
      header: yup.object({
        date: yup.string().required(),
        siteId: yup.number().required(),
        plantId: yup.number().required(),
        itemId: yup.number().required(),
        workCenterId: yup.number().required(),
        purity: yup.number().required(),
        qty: yup.number().required()
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
            qty: yup.number().required(),
            purity: yup.number().test(function (value) {
              if (this.parent.type == 1) {
                return !!value && value > 0
              }

              return true
            }),
            sku: yup.string().required()
          })
        )
        .required()
    }),
    onSubmit: async obj => {
      const payload = getPayload(obj)

      const response = await postRequest({
        extension: FoundryRepository.MetalSmelting.set2,
        record: JSON.stringify(payload)
      })
      toast.success(obj.recordId ? platformLabels.Edited : platformLabels.Added)
      refetchForm(response?.recordId)
      invalidate()
    }
  })

  const getPayload = obj => {
    return {
      header: { ...obj.header, date: formatDateToApi(obj.header.date) },
      items: obj.items?.map((item, index) => ({
        ...item,
        trxId: obj?.recordId || 0,
        seqNo: index + 1,
        purity: item.purity / 1000
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

  const totalQty = calculateTotal('qty')
  const totalMetal = calculateTotal('metalValue')
  const totalAlloy = calculateTotal('qty', 2)
  const expectedAlloy = calculateTotal('expectedAlloyQty')
  const headerPurity = parseFloat(formik.values?.header?.purity)

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
    return Math.abs((parseFloat(qty) * parseFloat(purity)) / parseFloat(headerPurity))
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
      extension: FoundryRepository.MetalSmelting.post,
      record: JSON.stringify({ ...formik.values?.header, date: formatDateToApi(formik.values.header.date) })
    })

    toast.success(platformLabels.Posted)
    invalidate()
    window.close()
  }

  const onUnpost = async () => {
    const res = await postRequest({
      extension: FoundryRepository.MetalSmelting.unpost,
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
    const metal = metalRef.current

    const { record } = await getRequest({
      extension: FoundryRepository.MetalSmelting.get,
      parameters: `_recordId=${recordId}`
    })

    const { list } = await getRequest({
      extension: FoundryRepository.TransactionItems.qry,
      parameters: `_trxId=${recordId}`
    })

    const modifiedList = list?.map((item, index) => ({
      ...item,
      id: index + 1,
      purity: item.purity * 1000,
      metalValue: metal ? ((item?.qty || 0) * (item?.purity || 0)) / 8750 : null,
      metalId: item.metalId || ''
    }))

    formik.setValues({
      recordId: record?.recordId,
      header: {
        ...record,
        date: formatDateFromApi(record.date)
      },
      items: modifiedList?.length > 0 ? modifiedList : formik.values.items
    })
  }

  const columns = [
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
        update({ itemId: null, sku: '', itemName: '', metalId: '', metalRef: '', purity: 0 })
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
        if (newRow.purity) update({ purity: newRow.purity * 1000 })
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
        displayFieldWidth: 2
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
      props: { allowNegative: false, decimalScale: 3 },
      onChange: ({ row: { update, newRow } }) => {
        const baseSalesMetalValue = ((newRow?.qty || 0) * (newRow?.purity || 0)) / 8750
        if (newRow?.type == 1) {
          const qtyAtPurity = qtyAtPurityPerRow(
            newRow?.qty || 0,
            newRow?.purity || 0,
            formik.values?.header?.purity || 0
          )
          const expectedAlloyQty = expectedAlloyQtyPerRow(qtyAtPurity || 0, newRow?.qty || 0)
          update({ expectedAlloyQty, qtyAtPurity })
        }

        update({
          metalValue: metalRef.current ? baseSalesMetalValue?.toFixed(2) : null
        })
      }
    },
    {
      component: 'numberfield',
      name: 'purity',
      label: labels.purity,
      props: { allowNegative: false, decimalScale: 3 },
      onChange: ({ row: { update, newRow } }) => {
        const baseSalesMetalValue = ((newRow?.qty || 0) * (newRow?.purity || 0)) / 8750
        if (newRow?.type == 1) {
          const qtyAtPurity = qtyAtPurityPerRow(
            newRow?.qty || 0,
            newRow?.purity || 0,
            formik.values?.header?.purity || 0
          )
          const expectedAlloyQty = expectedAlloyQtyPerRow(qtyAtPurity || 0, newRow?.qty || 0)
          update({ expectedAlloyQty, qtyAtPurity })
        }
        update({ metalValue: metalRef.current ? baseSalesMetalValue?.toFixed(2) : null })
      },
      propsReducer({ row, props }) {
        return { ...props, readOnly: row.type == 2 }
      }
    },
    {
      component: 'numberfield',
      name: 'qtyAtPurity',
      label: labels.purityQty,
      props: { readOnly: true, decimalScale: 3 }
    },
    {
      component: 'numberfield',
      name: 'expectedAlloyQty',
      label: labels.expectedAlloyQty,
      props: { readOnly: true, decimalScale: 3 }
    },
    {
      component: 'numberfield',
      name: 'currentCost',
      label: labels.unitCost,
      props: { readOnly: true }
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

  if (metalRef.current?.reference) {
    const qtyIndex = columns.findIndex(col => col.name === 'purity')
    if (qtyIndex !== -1) {
      columns.splice(qtyIndex + 1, 0, {
        component: 'numberfield',
        label: metalRef.current?.reference,
        name: 'metalValue',
        props: {
          decimalScale: 2,
          readOnly: true
        }
      })
    }
  }

  async function updateItemsMetal(itemId) {
    if (!itemId) return

    const res = await getRequest({
      extension: InventoryRepository.Physical.get,
      parameters: `_itemId=${itemId}`
    })

    return res?.record?.metalId || null
  }

  useEffect(() => {
    ;(async function () {
      await getAllMetals()
      const filteredItem = defaultsData?.list?.find(obj => obj.key === 'baseSalesMetalId')
      if (parseInt(filteredItem?.value)) {
        const metalRes = await getRequest({
          extension: InventoryRepository.Metals.get,
          parameters: `_recordId=${parseInt(filteredItem?.value)}`
        })

        metalRef.current = metalRes.record
      }

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
                    maxAccess={!editMode && maxAccess}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='header.reference'
                    label={labels.reference}
                    value={formik.values.header.reference}
                    readOnly={editMode || !formik.values.header.dtId}
                    maxAccess={!editMode && maxAccess}
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
                  <ResourceLookup
                    endpointId={InventoryRepository.Item.snapshot}
                    name='header.itemId'
                    label={labels.sku}
                    valueField='recordId'
                    displayField='name'
                    valueShow='sku'
                    secondValueShow='itemName'
                    form={formik}
                    formObject={formik.values.header}
                    required
                    columnsInDropDown={[
                      { key: 'sku', value: 'SKU' },
                      { key: 'name', value: 'Name' }
                    ]}
                    onChange={async (_, newValue) => {
                      const metal = await updateItemsMetal(newValue?.recordId)
                      formik.setFieldValue('header.metalId', metal || null)
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
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={InventoryRepository.Metals.qry}
                    name='header.metalId'
                    label={labels.metal}
                    valueField='recordId'
                    displayField='reference'
                    readOnly
                    values={formik.values.header}
                    onChange={(_, newValue) => formik.setFieldValue('header.metalId', newValue.recordId || null)}
                    error={formik.touched.header?.metalId && Boolean(formik.errors.header?.metalId)}
                    maxAccess={maxAccess}
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
                    required
                    decimalScale={3}
                    allowNegative={false}
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
                    onChange={formik.handleChange}
                    value={formik.values.header?.qty}
                    required
                    allowNegative={false}
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
          <Grid container spacing={2} sx={{ mt: 1 }} justifyContent={'flex-end'}>
            <Grid item xs={3}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <CustomNumberField label={labels.totalQty} value={totalQty} decimalScale={3} readOnly />
                </Grid>
                {metalRef.current?.reference && (
                  <Grid item xs={12}>
                    <CustomNumberField
                      label={`${labels.total} ${metalRef.current?.reference}`}
                      value={totalMetal}
                      decimalScale={2}
                      readOnly
                    />
                  </Grid>
                )}
              </Grid>
            </Grid>
            <Grid item xs={3}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <CustomNumberField
                    label={labels.totalDesiredPurity}
                    value={totalDesiredPurity}
                    decimalScale={3}
                    readOnly
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField label={labels.totalAlloy} value={totalAlloy} decimalScale={3} readOnly />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField label={labels.expectedAlloy} value={expectedAlloy} decimalScale={3} readOnly />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}
