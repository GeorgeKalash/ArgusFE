import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import { formatDateFromApi, formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'
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
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import { SaleRepository } from '@argus/repositories/src/repositories/SaleRepository'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { SerialsForm } from '@argus/shared-ui/src/components/Shared/SerialsForm'
import { getFormattedNumber } from '@argus/shared-domain/src/lib/numberField-helper'
import { SystemChecks } from '@argus/shared-domain/src/resources/SystemChecks'
import { useError } from '@argus/shared-providers/src/providers/error'

export default function MaterialsAdjustmentForm({ labels, access, recordId, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels, userDefaultsData, systemChecks } = useContext(ControlContext)
  const { stack } = useWindow()
  const { stack: stackError } = useError()

  const filteredMeasurements = useRef([])
  const [measurements, setMeasurements] = useState([])

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.MaterialAdjustment,
    access,
    enabled: !recordId
  })

  const plantId = parseInt(userDefaultsData?.list?.find(obj => obj.key === 'plantId')?.value)
  const siteId = parseInt(userDefaultsData?.list?.find(obj => obj.key === 'siteId')?.value)
  const jumpToNextLine = systemChecks?.find(item => item.checkId === SystemChecks.POS_JUMP_TO_NEXT_LINE)?.value

  const initialValues = {
    disableSKULookup: false,
    recordId,
    dtId: null,
    reference: '',
    plantId,
    siteId,
    description: '',
    date: new Date(),
    status: 1,
    wip: 1,
    rsStatus: '',
    clientId: null,
    clientName: '',
    isVerified: false,
    clientRef: '',
    rows: [
      {
        id: 1,
        itemId: '',
        sku: '',
        itemName: '',
        qty: '',
        totalCost: '',
        totalQty: '',
        muQty: '',
        qtyInBase: '',
        notes: '',
        seqNo: ''
      }
    ],
    serials: []
  }

  const invalidate = useInvalidate({
    endpointId: InventoryRepository.MaterialsAdjustment.page
  })

  const { formik } = useForm({
    maxAccess,
    documentType: { key: 'dtId', value: documentType?.dtId },
    initialValues,
    validateOnChange: true,
    validationSchema: yup.object({
      siteId: yup.number().required(),
      date: yup.date().required(),
      rows: yup
        .array()
        .of(
          yup.object().shape({
            sku: yup.string().required(),
            qty: yup.number().required(),
            itemName: yup.string().required()
          })
        )
        .required()
    }),
    onSubmit: async obj => {
      const copy = { ...obj }
      delete copy.rows
      delete copy.serials
      copy.date = formatDateToApi(copy.date)

      const serialsValues = []

      const updatedRows = formik.values.rows.map((adjDetail, index) => {
        const { serials, ...restDetails } = adjDetail
        let muQty = adjDetail.muQty || 1

        if (serials) {
          const updatedSerials = serials.map((serialDetail, idx) => {
            return {
              ...serialDetail,
              seqNo: index + 1,
              srlSeqNo: 0,
              componentSeqNo: 0,
              itemId: adjDetail?.itemId,
              adjustmentId: formik.values.recordId || 0,
              id: idx
            }
          })
          serialsValues.push(...updatedSerials)
        }

        return {
          ...restDetails,
          adjustmentId: formik.values.recordId || 0,
          qtyInBase: muQty * adjDetail.qty,
          seqNo: index + 1
        }
      })

      const resultObject = {
        header: copy,
        items: updatedRows,
        serials: serialsValues,
        lots: []
      }

      const res = await postRequest({
        extension: InventoryRepository.MaterialsAdjustment.set2,
        record: JSON.stringify(resultObject)
      })

      const actionMessage = editMode ? platformLabels.Edited : platformLabels.Added
      if (res?.recordId) {
        await refetchForm(res?.recordId)
        toast.success(actionMessage)
        invalidate()
      }
    }
  })

  const editMode = !!formik.values.recordId
  const isPosted = formik.values.status === 3
  const rowsUpdate = useRef(formik?.values?.rows)

  const { totalQty, totalCost, totalWeight } = formik?.values?.rows?.reduce(
    (acc, row) => {
      const qtyValue = parseFloat(row?.qty) || 0
      const totalCostValue = parseFloat(row?.totalCost) || 0
      const weightValue = parseFloat(row?.weight) || 0

      return {
        totalQty: acc?.totalQty + qtyValue,
        totalCost: (Math.round((parseFloat(acc?.totalCost) + totalCostValue) * 100) / 100).toFixed(2),
        totalWeight: acc?.totalWeight + weightValue
      }
    },
    { totalQty: 0, totalCost: 0, totalWeight: 0 }
  )
  async function onPost() {
    await postRequest({
      extension: InventoryRepository.MaterialsAdjustment.post,
      record: JSON.stringify({
        ...formik.values,
        date: formatDateToApi(formik.values.date)
      })
    })
    window.close()
    invalidate()
  }

  const onUnpost = async () => {
    const res = await postRequest({
      extension: InventoryRepository.MaterialsAdjustment.unpost,
      record: JSON.stringify({
        ...formik.values,
        date: formatDateToApi(formik.values.date)
      })
    })
    toast.success(platformLabels.Unposted)
    refetchForm(res?.recordId)
    invalidate()
  }

  async function getDTD(dtId) {
    if (dtId) {
      const res = await getRequest({
        extension: InventoryRepository.DocumentTypeDefaults.get,
        parameters: `_dtId=${dtId}`
      })

      formik.setFieldValue('siteId', res?.record?.siteId || siteId || null)
      formik.setFieldValue('plantId', res?.record?.plantId || plantId)
      formik.setFieldValue('disableSKULookup', res?.record?.disableSKULookup || false)

      return res
    }
  }
  useEffect(() => {
    if (formik.values.dtId && !recordId) getDTD(formik?.values?.dtId)
    if (!formik?.values?.dtId) {
      formik.setFieldValue('disableSKULookup', false)

      return
    }
  }, [formik.values.dtId])

  const onCondition = row => {
    if (row.trackBy === 1) {
      return {
        imgSrc: require('@argus/shared-ui/src/components/images/TableIcons/imgSerials.png').default.src,
        hidden: false
      }
    } else {
      return {
        imgSrc: '',
        hidden: true
      }
    }
  }

  const getPhysicalProperty = async itemId => {
    const res = await getRequest({
      extension: InventoryRepository.Physical.get,
      parameters: `_itemId=${itemId}`
    })

    return {
      weight: res?.record?.weight ?? 0,
      metalId: res?.record?.metalId,
      metalRef: res?.record?.metalRef
    }
  }

  const getUnitCost = async itemId => {
    const res = await getRequest({
      extension: InventoryRepository.CurrentCost.get,
      parameters: '_itemId=' + itemId
    })

    return res?.record?.currentCost
  }

  async function getFilteredMU(itemId, msId) {
    if (!itemId) return

    const arrayMU = measurements?.filter(item => item.msId === msId) || []
    filteredMeasurements.current = arrayMU
  }

  const getMeasurementUnits = async () => {
    return await getRequest({
      extension: InventoryRepository.MeasurementUnit.qry,
      parameters: `_msId=0`
    })
  }

  function calcTotalCost(rec) {
    if (rec.priceType === 1) return (Math.round(rec.qty * rec.unitCost * 100) / 100).toFixed(2)
    else if (rec.priceType === 2) return (Math.round(rec.qty * rec.unitCost * rec.volume * 100) / 100).toFixed(2)
    else if (rec.priceType === 3) return (Math.round(rec.qty * rec.unitCost * rec.weight * 100) / 100).toFixed(2)
    else return 0
  }

  function calcUnitCost(rec) {
    if (rec.priceType === 1) return rec.qty != 0 ? (rec.totalCost / rec.qty).toFixed(2) : 0
    else if (rec.priceType === 2)
      return rec.qty != 0 || rec.volume != 0 ? (rec.totalCost / (rec.qty * rec.volume)).toFixed(2) : 0
    else if (rec.priceType === 3)
      return rec.qty != 0 || rec.weight != 0 ? (rec.totalCost / (rec.qty * rec.weight)).toFixed(2) : 0
    else return 0
  }

  async function getItem(itemId) {
    const res = await getRequest({
      extension: InventoryRepository.Item.get,
      parameters: `_recordId=${itemId}`
    })

    return res?.record
  }

  async function getMeasurementObject(msId) {
    const res = await getRequest({
      extension: InventoryRepository.Measurement.get,
      parameters: `_recordId=${msId}`
    })

    return res?.record
  }

  useEffect(() => {
    ;(async function () {
      const muList = await getMeasurementUnits()
      setMeasurements(muList?.list)
    })()
  }, [])

  const fillSkuData = async (newRow, update) => {
    const itemIdValue = formik.values.disableSKULookup ? newRow?.recordId : newRow?.itemId
    const itemNameValue = formik.values.disableSKULookup ? newRow?.name : newRow?.itemName
    if (itemIdValue) {
      const { weight, metalId, metalRef } = await getPhysicalProperty(itemIdValue)
      const unitCost = (await getUnitCost(itemIdValue)) ?? 0
      const totalCost = calcTotalCost(newRow)
      const itemInfo = await getItem(itemIdValue)
      await getFilteredMU(itemIdValue, newRow?.msId)
      const filteredMeasurements = measurements?.filter(item => item.msId === itemInfo?.msId)
      const measurementSchedule = await getMeasurementObject(newRow?.msId)
      update({
        qty: 0,
        sku: newRow.sku,
        itemId: itemIdValue,
        weight,
        unitCost,
        itemName: itemNameValue,
        totalCost,
        details: true,
        msId: itemInfo?.msId,
        decimals: measurementSchedule?.decimals,
        muRef: filteredMeasurements?.[0]?.reference,
        muId: filteredMeasurements?.[0]?.recordId,
        metalId,
        metalRef,
        priceType: newRow?.priceType
      })
    }
  }

  const columns = [
    {
      component: formik?.values?.disableSKULookup ? 'textfield' : 'resourcelookup',
      label: labels.sku,
      name: 'sku',
      jumpToNextLine,
      ...(formik.values.disableSKULookup && { updateOn: 'blur' }),
      props: {
        ...(!formik.values.disableSKULookup && {
          endpointId: InventoryRepository.Item.snapshot,
          valueField: 'sku',
          displayField: 'sku',
          mapping: [
            { from: 'recordId', to: 'itemId' },
            { from: 'msId', to: 'msId' },
            { from: 'trackBy', to: 'trackBy' },
            { from: 'lotCategoryId', to: 'lotCategoryId' },
            { from: 'priceType', to: 'priceType' },
            { from: 'sku', to: 'sku' },
            { from: 'name', to: 'itemName' },
            { from: 'isInactive', to: 'isInactive' }
          ],
          columnsInDropDown: [
            { key: 'sku', value: 'SKU' },
            { key: 'name', value: 'Name' }
          ],
          displayFieldWidth: 3
        })
      },
      propsReducer({ row, props }) {
        return { ...props, imgSrc: onCondition(row) }
      },
      async onChange({ row: { update, newRow } }) {
        if (!formik.values.disableSKULookup) {
          if (!newRow?.itemId) {
            update({
              details: false
            })

            return
          }
          if (newRow.isInactive) {
            update({
              ...formik.initialValues.rows[0],
              id: newRow.id
            })
            stackError({
              message: labels.inactiveItem
            })

            return
          }

          if (newRow?.itemId) {
            await fillSkuData(newRow, update)
          }
        } else {
          if (!newRow?.sku) {
            update({
              ...formik.initialValues.rows[0],
              id: newRow.id
            })

            return
          }

          const skuInfo = await getRequest({
            extension: InventoryRepository.Items.get2,
            parameters: `_sku=${newRow.sku}`
          })
          if (!skuInfo.record) {
            update({
              ...formik.initialValues.rows[0],
              id: newRow.id
            })
            stackError({
              message: labels.invalidSKU
            })

            return
          }
          if (newRow?.sku) {
            fillSkuData(skuInfo.record, update)
          }
        }
      }
    },
    {
      component: 'textfield',
      label: labels.itemName,
      name: 'itemName',
      flex: 2,
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      label: labels.metalRef,
      name: 'metalRef',
      props: {
        readOnly: true
      }
    },
    {
      component: 'resourcecombobox',
      label: labels.muId,
      name: 'muRef',
      props: {
        store: filteredMeasurements?.current,
        displayField: 'reference',
        valueField: 'recordId',
        mapping: [
          { from: 'reference', to: 'muRef' },
          { from: 'qty', to: 'muQty' },
          { from: 'recordId', to: 'muId' }
        ]
      },
      async onChange({ row: { update, newRow } }) {
        const filteredItems = filteredMeasurements?.current.filter(item => item.recordId === newRow?.muId)
        const qtyInBase = newRow?.qty * filteredItems?.muQty ?? 0

        update({
          qtyInBase,
          muQty: newRow?.muQty
        })
      },
      propsReducer({ row, props }) {
        return { ...props, store: filteredMeasurements?.current }
      }
    },
    {
      component: 'numberfield',
      label: labels.qty,
      name: 'qty',
      props: {
        maxLength: 11,
        onCondition: row => {
          return {
            decimalScale: row?.decimals,
            readOnly: !row?.itemId
          }
        }
      },
      async onChange({ row: { update, newRow } }) {
        if (newRow) {
          const totalCost = calcTotalCost(newRow)
          const qtyInBase = newRow?.qty * newRow?.muQty ?? 0

          update({
            totalCost,
            qtyInBase
          })
        }
      }
    },
    {
      component: 'numberfield',
      label: labels.pieces,
      name: 'pcs',
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.weight,
      name: 'weight',
      props: {
        readOnly: true
      }
    },

    {
      component: 'numberfield',
      label: labels.unitCost,
      name: 'unitCost',
      async onChange({ row: { update, newRow } }) {
        if (newRow) {
          const totalCost = calcTotalCost(newRow)

          update({
            totalCost
          })
        }
      }
    },
    {
      component: 'numberfield',
      label: labels.totalCost,
      name: 'totalCost',
      async onChange({ row: { update, newRow } }) {
        if (newRow) {
          const unitCost = calcUnitCost(newRow)

          update({
            unitCost
          })
        }
      }
    },
    {
      component: 'textfield',
      label: labels.notes,
      name: 'notes'
    },
    {
      component: 'button',
      name: 'serials',
      label: platformLabels.serials,
      props: {
        onCondition
      },
      onClick: (e, row, update, updateRow) => {
        if (row?.trackBy === 1) {
          stack({
            Component: SerialsForm,
            props: {
              labels,
              disabled: isPosted,
              row,
              siteId: row.qty >= 0 ? null : formik?.values?.siteId,
              maxAccess,
              checkForSiteId: row.qty >= 0 ? false : true,
              updateRow
            }
          })
        }
      }
    }
  ]

  async function getSerials(recordId, seqNo) {
    return await getRequest({
      extension: InventoryRepository.MaterialAdjustmentSerial.qry,
      parameters: `_adjustmentId=${recordId}&_seqNo=${seqNo}&_componentSeqNo=${0}`
    })
  }

  async function refetchForm(recordId) {
    const res = await getRequest({
      extension: InventoryRepository.MaterialsAdjustment.get,
      parameters: `_recordId=${recordId}`
    })

    const res2 = await getRequest({
      extension: InventoryRepository.MaterialsAdjustmentDetail.qry,
      parameters: `_filter=&_adjustmentId=${recordId}`
    })

    const updatedAdjustments = await Promise.all(
      res2.list.map(async item => {
        const serials = await getSerials(recordId, item.seqNo)

        return {
          ...item,
          id: item.seqNo,
          pcs: item.pcs || 0,
          serials: serials?.list?.map((serialDetail, index) => {
            return {
              ...serialDetail,
              id: index
            }
          }),
          totalCost: calcTotalCost(item)
        }
      })
    )

    formik.setValues({
      ...res.record,
      date: formatDateFromApi(res.record.date),
      rows: updatedAdjustments
    })

    return res?.record
  }

  useEffect(() => {
    if (recordId) refetchForm(recordId)
  }, [])

  const handleMetalClick = async () => {
    const metalItemsList = rowsUpdate?.current
      ?.filter(item => item.metalId)
      .map(item => ({
        qty: item.qty,
        metalRef: '',
        metalId: item.metalId,
        metalPurity: item.metalPurity,
        weight: item.weight,
        priceType: item.priceType
      }))

    return metalItemsList || []
  }

  async function verifyRecord() {
    const copy = { ...formik.values, isVerified: !formik.values.isVerified }
    delete copy.items
    await postRequest({
      extension: InventoryRepository.MaterialsAdjustment.verify,
      record: JSON.stringify(copy)
    })

    toast.success(!formik.values.isVerified ? platformLabels.Verified : platformLabels.Unverfied)
    refetchForm(formik.values.recordId)
    invalidate()
  }

  const actions = [
    {
      key: 'Verify',
      condition: !formik.values.isVerified,
      onClick: verifyRecord,
      disabled: formik.values.isVerified || !editMode || !isPosted
    },
    {
      key: 'Unverify',
      condition: formik.values.isVerified,
      onClick: verifyRecord,
      disabled: !formik.values.isVerified
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
      key: 'GL',
      condition: true,
      onClick: 'onClickGL',
      disabled: !editMode,
      valuesPath: {
        ...formik.values,
        notes: formik.values.description
      },
      datasetId: ResourceIds.GLMaterialAdjustment
    },
    {
      key: 'IV',
      condition: true,
      onClick: 'onInventoryTransaction',
      disabled: !editMode || !isPosted
    },
    {
      key: 'Metals',
      condition: true,
      onClick: 'onClickMetal',
      handleMetalClick
    }
  ]

  return (
    <FormShell
      resourceId={ResourceIds.MaterialsAdjustment}
      functionId={SystemFunction.MaterialAdjustment}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      isPosted={isPosted}
      postVisible={true}
      actions={actions}
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
                    parameters={`_startAt=0&_pageSize=1000&_dgId=${SystemFunction.MaterialAdjustment}`}
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
                    maxAccess={!editMode && maxAccess}
                    onChange={(event, newValue) => {
                      changeDT(newValue)
                      formik.setFieldValue('dtId', newValue?.recordId || null)
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
                    onClear={() => formik.setFieldValue('reference', '')}
                    error={formik.touched.reference && Boolean(formik.errors.reference)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomDatePicker
                    name='date'
                    label={labels.date}
                    readOnly={isPosted}
                    value={formik?.values?.date}
                    onChange={formik.setFieldValue}
                    required
                    maxAccess={maxAccess}
                    onClear={() => formik.setFieldValue('date', null)}
                    error={formik.touched.date && Boolean(formik.errors.date)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceLookup
                    endpointId={SaleRepository.Client.snapshot}
                    valueField='reference'
                    displayField='name'
                    name='clientId'
                    label={labels.client}
                    form={formik}
                    readOnly={isPosted}
                    displayFieldWidth={3}
                    valueShow='clientRef'
                    secondValueShow='clientName'
                    maxAccess={maxAccess}
                    editMode={editMode}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' },
                      { key: 'szName', value: 'Sales Zone' }
                    ]}
                    onChange={async (event, newValue) => {
                      formik.setFieldValue('clientId', newValue?.recordId || null)
                      formik.setFieldValue('clientName', newValue?.name || '')
                      formik.setFieldValue('clientRef', newValue?.reference || '')
                    }}
                    errorCheck={'clientId'}
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
                    readOnly={isPosted}
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
                    endpointId={InventoryRepository.Site.qry}
                    name='siteId'
                    readOnly={isPosted}
                    label={labels.site}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik.values}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    required
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('plantId', newValue?.plantId || null)
                      formik.setFieldValue('siteId', newValue?.recordId || null)
                    }}
                    error={formik.touched.siteId && Boolean(formik.errors.siteId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextArea
                    name='description'
                    label={labels.description}
                    value={formik?.values?.description}
                    rows={2.5}
                    readOnly={isPosted}
                    maxAccess={maxAccess}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('description', '')}
                    error={formik.touched.description && Boolean(formik.errors.description)}
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
            onSelectionChange={(row, update, field) => {
              if (field == 'muRef') getFilteredMU(row?.itemId, row?.msId)
            }}
            columns={columns}
            allowAddNewLine={!isPosted}
            allowDelete={!isPosted}
            disabled={isPosted || !formik.values.siteId}
          />
        </Grow>
        <Fixed>
          <Grid container xs={3} spacing={2}>
            <Grid item xs={12}>
              <CustomTextField
                name='totalQty'
                maxAccess={maxAccess}
                value={getFormattedNumber(Number(totalQty).toFixed(2))}
                label={labels.totalQty}
                readOnly
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='totalCost'
                maxAccess={maxAccess}
                value={getFormattedNumber(Number(totalCost).toFixed(2))}
                label={labels.totalCost}
                readOnly
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='totalWeight'
                maxAccess={maxAccess}
                value={getFormattedNumber(totalWeight)}
                label={labels.totalWeight}
                readOnly
              />
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}
