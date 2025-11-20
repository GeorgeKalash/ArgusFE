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
import { SystemRepository } from '@argus/repositories/repositories/SystemRepository'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import { formatDateFromApi, formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import { useDocumentType } from '@argus/shared-hooks/src/hooks/documentReferenceBehaviors'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { InventoryRepository } from '@argus/repositories/repositories/InventoryRepository'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import { FoundryRepository } from '@argus/repositories/repositories/FoundryRepository'

export default function MetalSmeltingForm({ labels, access, recordId, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels, defaultsData, userDefaultsData } = useContext(ControlContext)
  const [allMetals, setAllMetals] = useState([])
  const filteredItems = useRef()
  const metalRef = useRef({})

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
        status: 1
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
          onHand: 0
        }
      ]
    },
    maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      header: yup.object({
        date: yup.string().required(),
        siteId: yup.number().required(),
        plantId: yup.number().required()
      }),
      items: yup
        .array()
        .of(
          yup.object().shape({
            metalId: yup.string().required(),
            qty: yup.number().required(),
            purity: yup.number().required().moreThan(0),
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
      items: obj.items?.map(item => ({
        trxId: obj?.recordId || 0,
        seqNo: item.id,
        metalId: item.metalId,
        itemId: item.itemId,
        qty: item.qty,
        purity: item.purity / 1000
      }))
    }
  }

  const editMode = !!formik.values?.header.recordId
  const isPosted = formik.values.header.status === 3
  const calculateTotal = key => formik.values.items.reduce((sum, item) => sum + (parseFloat(item[key]) || 0), 0)
  const totalQty = calculateTotal('qty')
  const totalMetal = calculateTotal('metalValue')

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

  function getFilteredMetal(metalId) {
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
      metalValue: metal ? ((item.qty * item.purity) / metal?.purity).toFixed(2) : null
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
        return { ...props, readOnly: !!row.itemId }
      },
      onChange: async ({ row: { update, newRow } }) => {
        getFilteredMetal(newRow?.metalId)
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

        const res = await getRequest({
          extension: InventoryRepository.Availability.get,
          parameters: `_siteId=${formik.values?.siteId}&_itemId=${newRow?.itemId}&_seqNo=0`
        })
        update({
          onhand: res?.record?.onhand || 0
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
      flex: 3.5
    },

    {
      component: 'numberfield',
      name: 'purity',
      label: labels.purity,
      props: { allowNegative: false },
      onChange: ({ row: { update, newRow } }) => {
        const baseSalesMetalValue = (newRow.qty * newRow.purity) / (metalRef.current?.purity * 1000)
        update({ metalValue: metalRef.current ? baseSalesMetalValue?.toFixed(2) : null })
      }
    },
    {
      component: 'numberfield',
      name: 'qty',
      label: labels.qty,
      onChange: ({ row: { update, newRow } }) => {
        const baseSalesMetalValue = (newRow.qty * newRow.purity) / (metalRef.current?.purity * 1000)
        update({ metalValue: metalRef.current ? baseSalesMetalValue?.toFixed(2) : null })
      }
    },
    {
      component: 'numberfield',
      name: 'onhand',
      label: labels.onHand,
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
    const qtyIndex = columns.findIndex(col => col.name === 'qty')
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
                onChange={(event, newValue) => {
                  formik.setFieldValue('header.siteId', newValue?.recordId || null)
                }}
                required
                error={formik.touched.header?.siteId && Boolean(formik.errors.header?.siteId)}
              />
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
              if (field == 'sku') getFilteredMetal(row?.metalId)
            }}
          />
        </Grow>
        <Fixed>
          <Grid container>
            <Grid item xs={9}></Grid>
            <Grid item xs={3}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <CustomNumberField label={labels.totalQty} value={totalQty} decimalScale={2} readOnly />
                </Grid>
                <Grid item xs={12}></Grid>
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
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}
