import { Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
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
import WorkFlow from 'src/components/Shared/WorkFlow'
import { useWindow } from 'src/windows'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { LogisticsRepository } from 'src/repositories/LogisticsRepository'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { getFormattedNumber } from 'src/lib/numberField-helper'
import { useError } from 'src/error'
import { AccessControlRepository } from 'src/repositories/AccessControlRepository'

export default function MaterialsTransferForm({ labels, maxAccess: access, recordId, plantId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()
  const { stack: stackError } = useError()
  
  const [measurementUnits, setMeasurementUnits] = useState([])
  const [filters, setFilters] = useState(measurementUnits)

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.MaterialTransfer,
    access,
    enabled: !recordId
  })

  const initialValues = {
    recordId: null,
    functionId: SystemFunction.MaterialTransfer,
    reference: '',
    dtId: documentType?.dtId,
    oDocId: '',
    date: new Date(),
    closedDate: null,
    receivedDate: null,
    fromSiteId: '',
    toSiteId: '',
    notes: '',
    status: 1,
    plantId: parseInt(plantId),
    printStatus: null,
    qty: null,
    pcs: null,
    isVerified: false,
    wip: 1,
    carrierId: null,
    transfers: [
      {
        id: 1,
        transferId: recordId || 0,
        seqNo: 1,
        sku: '',
        itemName: null,
        itemId: null,
        qty: null,
        componentSeqNo: 0,
        qtyInBase: '',
        muId: 1,
        muQty: '',
        weight: null,
        unitCost: 0,
        msId: null,
        trackBy: null,
        lotCategoryId: null,
        metalId: null,
        totalCost: null,
        priceType: null
      }
    ]
  }

  const invalidate = useInvalidate({
    endpointId: InventoryRepository.MaterialsTransfer.qry
  })

  const { formik } = useForm({
    initialValues,
    maxAccess,
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      date: yup.date().required(),
      fromSiteId: yup.string().required(),
      toSiteId: yup.string().required(),
      transfers: yup
        .array()
        .of(
          yup.object().shape({
            sku: yup.string().required(),
            qty: yup.string().required()
          })
        )
        .required()
    }),
    onSubmit: async values => {
      try {
        const copy = { ...values }
        delete copy.transfers
        copy.date = !!copy.date ? formatDateToApi(copy.date) : null
        copy.closedDate = !!copy.closedDate ? formatDateToApi(copy.closedDate) : null
        copy.receivedDate = !!copy.receivedDate ? formatDateToApi(copy.receivedDate) : null
        copy.status = copy.status === '' ? 1 : copy.status
        copy.wip = copy.wip === '' ? 1 : copy.wip

        const updatedRows = formik?.values?.transfers.map((transferDetail, index) => {
          return {
            ...transferDetail,
            seqNo: index + 1,
            transferId: formik.values.recordId || 0
          }
        })
        if (values.fromSiteId === values.toSiteId) {
          stackError({
            message: `Cannot have same from and to site`
          })

          return
        }

        const resultObject = {
          header: copy,
          items: updatedRows,
          serials: [],
          lots: []
        }

        let notificationData

        const res = await postRequest({
          extension: InventoryRepository.MaterialsTransfer.set2,
          record: JSON.stringify(resultObject)
        })

        if (!values.recordId) {
          toast.success(platformLabels.Added)
          formik.setFieldValue('recordId', res.recordId)

          const res2 = await getRequest({
            extension: InventoryRepository.MaterialsTransfer.get,
            parameters: `_recordId=${res.recordId}`
          })

          formik.setFieldValue('reference', res2.record.reference)
          notificationData = {
            recordId: res.recordId,
            functionId: SystemFunction.MaterialTransfer,
            notificationGroupId: formik.values.notificationGroupId,
            date: formik.values.date,
            reference: res2.record.reference,
            status: 1
          }

          await postRequest({
            extension: AccessControlRepository.Notification.set,
            record: JSON.stringify(notificationData)
          })

          invalidate()
        } else {
          if (formik.values.notificationGroupId) {
            notificationData = {
              recordId: res.recordId,
              functionId: SystemFunction.MaterialTransfer,
              notificationGroupId: formik.values.notificationGroupId,
              date: formik.values.date,
              reference: formik.values.reference,
              status: 1
            }

            await postRequest({
              extension: AccessControlRepository.Notification.set,
              record: JSON.stringify(notificationData)
            })
          } else if (!formik.values.notificationGroupId) {
            const data = {
              recordId: res.recordId,
              functionId: SystemFunction.MaterialTransfer,
              notificationGroupId: 0
            }

            await postRequest({
              extension: AccessControlRepository.Notification.del,
              record: JSON.stringify(data)
            })
          }

          toast.success(platformLabels.Edited)
        }
      } catch (error) {}
    }
  })

  const isPosted = formik.values.status === 3
  const isClosed = formik.values.wip === 2
  const editMode = !!formik.values.recordId

  const getWeightAndMetalId = async itemId => {
    const res = await getRequest({
      extension: InventoryRepository.PP.get,
      parameters: '_itemId=' + itemId
    })

    return {
      weight: res?.record?.weight ?? 0,
      metalId: res?.record?.metalId
    }
  }

  const getMeasurementUnits = async msId => {
    const res = await getRequest({
      extension: InventoryRepository.MeasurementUnit.qry,
      parameters: `_msId=${msId}`
    })

    setMeasurementUnits(res)

    return res
  }

  const getUnitCost = async itemId => {
    const res = await getRequest({
      extension: InventoryRepository.Cost.get,
      parameters: '_itemId=' + itemId
    })

    return res?.record?.currentCost
  }

  function calcTotalCost(rec) {
    if (rec.priceType === 1) return rec.qty * rec.unitCost
    else if (rec.priceType === 2) return rec.qty * rec.unitCost * rec.volume
    else if (rec.priceType === 3) return rec.qty * rec.unitCost * rec.weight
    else return 0
  }

  const totalQty = formik?.values?.transfers?.reduce((qtySum, row) => {
    const qtyValue = parseFloat(row?.qty) || 0

    return qtySum + qtyValue
  }, 0)

  const totalCost = formik?.values?.transfers?.reduce((costSum, row) => {
    const totalCostValue = parseFloat(row?.totalCost) || 0

    return costSum + totalCostValue
  }, 0)

  const totalWeight = formik?.values?.transfers?.reduce((weightSum, row) => {
    const weightValue = parseFloat(row?.weight) || 0

    return weightSum + weightValue
  }, 0)

  const columns = [
    {
      component: 'resourcelookup',
      label: labels.sku,
      name: 'sku',
      props: {
        endpointId: InventoryRepository.Item.snapshot,
        valueField: 'recordId',
        displayField: 'sku',
        mandatory: true,
        mapping: [
          { from: 'recordId', to: 'itemId' },
          { from: 'msId', to: 'msId' },
          { from: 'trackBy', to: 'trackBy' },
          { from: 'lotCategoryId', to: 'lotCategoryId' },
          { from: 'priceType', to: 'priceType' },
          { from: 'sku', to: 'sku' },
          { from: 'name', to: 'itemName' }
        ],
        columnsInDropDown: [
          { key: 'sku', value: 'SKU' },
          { key: 'name', value: 'Name' }
        ],
        displayFieldWidth: 1
      },
      async onChange({ row: { update, oldRow, newRow } }) {
        try {
          if (newRow?.itemId) {
            const { weight, metalId } = await getWeightAndMetalId(newRow?.itemId)
            const unitCost = (await getUnitCost(newRow?.itemId)) ?? 0
            const totalCost = calcTotalCost(newRow)

            const measurementUnits = await getMeasurementUnits(newRow?.msId)

            update({
              weight,
              unitCost,
              totalCost,
              msId: newRow?.msId,
              metalId
            })

            setFilters(measurementUnits.list)
          }
        } catch (exception) {}
      }
    },
    {
      component: 'textfield',
      label: labels.itemName,
      name: 'itemName',
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.metalRef,
      name: 'metalId',
      props: {
        readOnly: true
      }
    },
    {
      component: 'resourcecombobox',
      label: labels.muId,
      name: 'muRef',
      props: {
        store: filters,
        displayField: 'reference',
        valueField: 'recordId',
        mapping: [
          { from: 'reference', to: 'muRef' },
          { from: 'qty', to: 'muQty' },
          { from: 'recordId', to: 'muId' }
        ]
      },
      async onChange({ row: { update, oldRow, newRow } }) {
        try {
          if (newRow) {
            const qtyInBase = newRow?.qty * newRow?.muQty

            update({
              qtyInBase,
              muQty: newRow?.muQty
            })
          }
        } catch (exception) {}
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
      label: labels.qty,
      name: 'qty',
      async onChange({ row: { update, oldRow, newRow } }) {
        try {
          if (newRow) {
            const totalCost = calcTotalCost(newRow)
            const qtyInBase = newRow?.qty * newRow?.muQty

            update({
              totalCost,
              qtyInBase
            })
          }
        } catch (exception) {}
      }
    },
    {
      component: 'numberfield',
      label: labels.unitCost,
      name: 'unitCost'
    },
    {
      component: 'numberfield',
      label: labels.totalCost,
      name: 'totalCost'
    }
  ]

  async function getData(recordId) {
    try {
      return await getRequest({
        extension: InventoryRepository.MaterialsTransfer.get,
        parameters: `_recordId=${recordId}`
      })
    } catch (error) {}
  }

  async function refetchForm(recordId) {
    const res = await getData(recordId)
    res.record.date = formatDateFromApi(res.record.date)
    res.record.closedDate = formatDateFromApi(res.record.closedDate)
    res.record.receivedDate = formatDateFromApi(res.record.receivedDate)
    const resNotification = await getNotificationData(recordId)
    const res3 = await getDataGrid()

    formik.setValues({
      ...res.record,
      transfers: res3.list.map(item => ({
        ...item,
        id: item.seqNo,
        totalCost: calcTotalCost(item),
        unitCost: item.unitCost ?? 0
      })),
      notificationGroupId: resNotification?.record?.notificationGroupId,
      receivedDate: !!res?.record?.receivedDate ? formatDateFromApi(res?.record?.receivedDate) : null,
      closedDate: !!res?.record?.closedDate ? formatDateFromApi(res?.record?.closedDate) : null,
      date: !!res?.record?.date ? formatDateFromApi(res?.record?.date) : null
    })
  }

  const onClose = async recId => {
    try {
      const res = await postRequest({
        extension: InventoryRepository.MaterialsTransfer.close,
        record: JSON.stringify({ recordId: recId })
      })

      toast.success(platformLabels.Closed)
      invalidate()
      await refetchForm(formik.values.recordId)
    } catch (error) {}
  }

  async function onReopen() {
    try {
      const copy = { ...formik.values }
      delete copy.transfers
      delete copy.notificationGroupId
      copy.date = !!copy.date ? formatDateToApi(copy.date) : null
      copy.closedDate = !!copy.closedDate ? formatDateToApi(copy.closedDate) : null
      copy.receivedDate = !!copy.receivedDate ? formatDateToApi(copy.receivedDate) : null

      await postRequest({
        extension: InventoryRepository.MaterialsTransfer.reopen,
        record: JSON.stringify(copy)
      })

      toast.success(platformLabels.Reopened)
      invalidate()
      await refetchForm(formik.values.recordId)
    } catch (error) {}
  }

  const onWorkFlowClick = async () => {
    stack({
      Component: WorkFlow,
      props: {
        functionId: SystemFunction.MaterialTransfer,
        recordId: formik.values.recordId
      },
      width: 950,
      title: 'Workflow'
    })
  }

  const onPost = async () => {
    try {
      const copy = { ...formik.values }
      delete copy.transfers
      delete copy.notificationGroupId
      copy.date = !!copy.date ? formatDateToApi(copy.date) : null
      copy.closedDate = !!copy.closedDate ? formatDateToApi(copy.closedDate) : null
      copy.receivedDate = !!copy.receivedDate ? formatDateToApi(copy.receivedDate) : null

      const res = await postRequest({
        extension: InventoryRepository.MaterialsTransfer.post,
        record: JSON.stringify(copy)
      })

      let notificationData

      if (formik.values.notificationGroupId) {
        notificationData = {
          recordId: res.recordId,
          functionId: SystemFunction.MaterialTransfer,
          notificationGroupId: formik.values.notificationGroupId,
          date: formik.values.date,
          reference: formik.values.reference,
          status: 3
        }

        await postRequest({
          extension: AccessControlRepository.Notification.set,
          record: JSON.stringify(notificationData)
        })
      } else if (!formik.values.notificationGroupId) {
        const data = {
          recordId: res.recordId,
          functionId: SystemFunction.MaterialTransfer,
          notificationGroupId: 0
        }

        await postRequest({
          extension: AccessControlRepository.Notification.del,
          record: JSON.stringify(data)
        })
      }

      toast.success(platformLabels.Posted)
      invalidate()
      await refetchForm(res.recordId)
    } catch (error) {}
  }

  const actions = [
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
      disabled: !editMode
    },
    {
      key: 'IV',
      condition: true,
      onClick: 'onInventoryTransaction',
      disabled: !editMode || !isPosted
    },
    {
      key: 'Post',
      condition: true,
      onClick: onPost,
      disabled: isPosted || !editMode || !isClosed
    },
    {
      key: 'Close',
      condition: !isClosed,
      onClick: () => {
        onClose(formik.values.recordId)
      },
      disabled: isClosed || !editMode || isPosted
    },
    {
      key: 'Reopen',
      condition: isClosed,
      onClick: onReopen,
      disabled: !isClosed || !editMode || isPosted
    },
    {
      key: 'WorkFlow',
      condition: true,
      onClick: onWorkFlowClick,
      disabled: !editMode
    }
  ]

  async function getNotificationData(recordId) {
    try {
      return await getRequest({
        extension: AccessControlRepository.Notification.get,
        parameters: `_recordId=${recordId}&_functionId=${SystemFunction.MaterialTransfer}`
      })
    } catch (error) {}
  }

  async function getDataGrid() {
    try {
      return await getRequest({
        extension: InventoryRepository.MaterialsTransferItems.qry,
        parameters: `_transferId=${recordId}&_functionId=${SystemFunction.MaterialTransfer}`
      })
    } catch (error) {}
  }

  useEffect(() => {
    ;(async function () {
      try {
        if (recordId) {
          const res = await getData(recordId)
          const resNotification = await getNotificationData(recordId)
          const res3 = await getDataGrid()

          formik.setValues({
            ...res.record,
            transfers: res3.list.map(item => ({
              ...item,
              id: item.seqNo,
              totalCost: calcTotalCost(item),
              unitCost: item.unitCost ?? 0
            })),
            notificationGroupId: resNotification?.record?.notificationGroupId,
            receivedDate: !!res?.record?.receivedDate ? formatDateFromApi(res?.record?.receivedDate) : null,
            closedDate: !!res?.record?.closedDate ? formatDateFromApi(res?.record?.closedDate) : null,
            date: !!res?.record?.date ? formatDateFromApi(res?.record?.date) : null
          })
        }
      } catch (error) {}
    })()
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.MaterialsTransfer}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      previewReport={editMode}
      actions={actions}
      functionId={SystemFunction.MaterialTransfer}
      disabledSubmit={isPosted || isClosed}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={8}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <ResourceComboBox
                    endpointId={SystemRepository.DocumentType.qry}
                    parameters={`_dgId=${SystemFunction.MaterialTransfer}&_startAt=${0}&_pageSize=${50}`}
                    filter={!editMode ? item => item.activeStatus === 1 : undefined}
                    name='dtId'
                    label={labels.documentType}
                    readOnly={isPosted || isClosed || editMode}
                    valueField='recordId'
                    displayField='name'
                    values={formik?.values}
                    onChange={async (event, newValue) => {
                      formik.setFieldValue('dtId', newValue?.recordId || '')
                      changeDT(newValue)
                    }}
                    error={formik.touched.dtId && Boolean(formik.errors.dtId)}
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={6}>
                  <CustomDatePicker
                    name='closedDate'
                    label={labels.shippingDate}
                    value={formik?.values?.closedDate}
                    onChange={formik.setFieldValue}
                    onClear={() => formik.setFieldValue('closedDate', '')}
                    readOnly={isPosted || isClosed}
                    error={formik.touched.date && Boolean(formik.errors.closedDate)}
                    maxAccess={maxAccess}
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2} marginTop={0.5}>
                <Grid item xs={6}>
                  <CustomTextField
                    name='reference'
                    label={labels.reference}
                    value={formik?.values?.reference}
                    readOnly={isPosted || isClosed}
                    maxAccess={maxAccess}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('reference', '')}
                    error={formik.touched.reference && Boolean(formik.errors.reference)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <CustomDatePicker
                    name='receivedDate'
                    label={labels.receivedDate}
                    value={formik?.values?.receivedDate}
                    onChange={formik?.setFieldValue}
                    onClear={() => formik.setFieldValue('receivedDate', '')}
                    readOnly={isPosted || isClosed}
                    error={formik.touched.receivedDate && Boolean(formik.errors.receivedDate)}
                    maxAccess={maxAccess}
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2} marginTop={0.5}>
                <Grid item xs={6}>
                  <CustomDatePicker
                    name='date'
                    label={labels.date}
                    value={formik?.values?.date}
                    required
                    onChange={formik.setFieldValue}
                    onClear={() => formik.setFieldValue('date', '')}
                    readOnly={isPosted || isClosed}
                    error={formik.touched.date && Boolean(formik.errors.date)}
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={6}>
                  <ResourceComboBox
                    endpointId={InventoryRepository.Site.qry}
                    name='fromSiteId'
                    readOnly={isPosted || isClosed}
                    label={labels.fromSite}
                    values={formik.values}
                    displayField='name'
                    required
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('fromSiteId', newValue?.recordId)
                    }}
                    error={formik.touched.fromSiteId && Boolean(formik.errors.fromSiteId)}
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2} marginTop={0.5}>
                <Grid item xs={6}>
                  <ResourceComboBox
                    endpointId={LogisticsRepository.LoCarrier.qry}
                    name='carrierId'
                    label={labels.carrier}
                    values={formik?.values}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    readOnly={isPosted || isClosed}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik && formik.setFieldValue('carrierId', newValue ? newValue.recordId : '')
                    }}
                    error={formik.touched.carrierId && Boolean(formik.errors.carrierId)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <ResourceComboBox
                    endpointId={InventoryRepository.Site.qry}
                    name='toSiteId'
                    readOnly={isPosted || isClosed}
                    label={labels.toSite}
                    values={formik?.values}
                    displayField='name'
                    required
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('toSiteId', newValue?.recordId)
                    }}
                    error={formik.touched.toSiteId && Boolean(formik.errors.toSiteId)}
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2} marginTop={0.5}>
                <Grid item xs={6}>
                  <ResourceComboBox
                    endpointId={SystemRepository.Plant.qry}
                    name='plantId'
                    label={labels.plant}
                    readOnly={isPosted || isClosed}
                    valueField='recordId'
                    displayField='name'
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik?.values}
                    maxAccess={maxAccess}
                    onClear={() => formik.setFieldValue('plantId', '')}
                    onChange={(event, newValue) => {
                      formik && formik.setFieldValue('plantId', newValue?.recordId)
                    }}
                    error={formik.touched.plantId && Boolean(formik.errors.plantId)}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={4}>
              <CustomTextArea
                name='notes'
                label={labels.notes}
                value={formik?.values?.notes}
                readOnly={isPosted || isClosed}
                maxLength='200'
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('notes', '')}
                error={formik.touched.notes && Boolean(formik.errors.notes)}
              />
            </Grid>
          </Grid>
          <DataGrid
            onChange={value => formik.setFieldValue('transfers', value)}
            value={formik?.values?.transfers || []}
            error={formik?.errors?.transfers}
            columns={columns}
          />
        </Grow>
        <Fixed>
          <Grid container direction='row' wrap='nowrap' sx={{ justifyContent: 'space-between' }}>
            <Grid container xs={3} direction='column' wrap='nowrap' sx={{ pt: 5, justifyContent: 'flex-start' }}>
              <Grid item xs={3} sx={{ pl: 3 }}>
                <CustomTextField
                  name='totalQty'
                  maxAccess={maxAccess}
                  value={getFormattedNumber(totalQty)}
                  label={labels.totalQty}
                  readOnly
                />
              </Grid>
              <Grid item xs={3} sx={{ pl: 3, mt: 2 }}>
                <CustomTextField
                  name='totalCost'
                  maxAccess={maxAccess}
                  value={getFormattedNumber(totalCost)}
                  label={labels.totalCost}
                  readOnly
                />
              </Grid>
              <Grid item xs={3} sx={{ pl: 3, mt: 2 }}>
                <CustomTextField
                  name='totalWeight'
                  maxAccess={maxAccess}
                  value={getFormattedNumber(totalWeight)}
                  label={labels.totalWeight}
                  readOnly
                />
              </Grid>
            </Grid>

            <Grid item xs={6} sx={{ pl: 3, mt: 4 }}>
              <ResourceComboBox
                endpointId={AccessControlRepository.NotificationGroup.qry}
                name='notificationGroupId'
                readOnly={isPosted || isClosed}
                label={labels.notify}
                values={formik?.values}
                displayField='name'
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('notificationGroupId', newValue?.recordId)
                }}
                error={formik.touched.notificationGroupId && Boolean(formik.errors.notificationGroupId)}
              />
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}
