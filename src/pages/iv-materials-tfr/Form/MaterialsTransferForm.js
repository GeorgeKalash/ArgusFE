import { Grid } from '@mui/material'
import { useContext, useEffect, useRef, useState } from 'react'
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
import SkuForm from './SkuForm'
import CustomButton from 'src/components/Inputs/CustomButton'
import { SerialsForm } from 'src/components/Shared/SerialsForm'

export default function MaterialsTransferForm({ labels, maxAccess: access, recordId, plantId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels, userDefaultsData } = useContext(ControlContext)
  const { stack } = useWindow()
  const { stack: stackError } = useError()
  const filteredMeasurements = useRef([])

  const [measurements, setMeasurements] = useState([])

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
    plId: null,
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
        qtyInBase: 0,
        muId: null,
        muQty: '',
        muRef: '',
        weight: null,
        unitCost: 0,
        msId: null,
        trackBy: null,
        lotCategoryId: null,
        metalId: null,
        metalRef: '',
        totalCost: 0,
        priceType: null,
        details: false
      }
    ],
    serials: [
      {
        transferId: recordId || 0,
        seqNo: 1,
        componentSeqNo: 0,
        srlSeqNo: null,
        srlNo: null,
        weight: null
      }
    ]
  }

  const invalidate = useInvalidate({
    endpointId: InventoryRepository.MaterialsTransfer.page
  })

  async function getDefaultFromSiteId() {
    if (editMode) {
      return
    }

    if (documentType?.dtId) {
      await getDTD(documentType?.dtId)

      return
    } else {
      const defaultFromSiteId = userDefaultsData?.list?.find(({ key }) => key === 'siteId')

      if (defaultFromSiteId?.value && !formik.values.fromSiteId)
        formik.setFieldValue('fromSiteId', parseInt(defaultFromSiteId?.value || ''))
    }
  }

  async function handleNotificationSubmission(recordId, reference, formik, status) {
    const notificationData = {
      recordId: recordId,
      functionId: SystemFunction.MaterialTransfer,
      notificationGroupId: formik.values.notificationGroupId,
      date: formik.values.date,
      reference: reference,
      status: status
    }

    await postRequest({
      extension: AccessControlRepository.Notification.set,
      record: JSON.stringify(notificationData)
    })
  }

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
            qty: yup.string().required(),
            msId: yup.string().required()
          })
        )
        .required()
    }),
    onSubmit: async values => {
      const copy = { ...values }
      delete copy.transfers
      delete copy.serials
      copy.date = !!copy.date ? formatDateToApi(copy.date) : null
      copy.closedDate = !!copy.closedDate ? formatDateToApi(copy.closedDate) : null
      copy.receivedDate = !!copy.receivedDate ? formatDateToApi(copy.receivedDate) : null

      const serialsValues = []

      const updatedRows = formik.values.transfers.map((transferDetails, index) => {
        const { serials, ...restDetails } = transferDetails
        if (serials) {
          const updatedSerials = serials.map((serialDetail, index) => {
            return {
              ...serialDetail,
              srlSeqNo: 0,
              componentSeqNo: 0,
              transferId: formik.values.recordId || 0
            }
          })
          serialsValues.push(...updatedSerials)
        }

        return {
          ...restDetails,
          seqNo: index + 1,
          transferId: formik.values.recordId || 0,
          unitCost: parseFloat(transferDetails.unitCost),
          totalCost: parseFloat(transferDetails.totalCost)
        }
      })

      const resultObject = {
        header: copy,
        items: updatedRows,
        serials: serialsValues,
        lots: []
      }

      if (values.fromSiteId === values.toSiteId) {
        stackError({
          message: labels.errorMessage
        })

        return
      }

      const res = await postRequest({
        extension: InventoryRepository.MaterialsTransfer.set2,
        record: JSON.stringify(resultObject)
      })

      if (!values.recordId) {
        toast.success(platformLabels.Added)
        formik.setFieldValue('recordId', res.recordId)

        await refetchForm(res.recordId)

        invalidate()
      } else {
        if (formik.values.notificationGroupId) {
          handleNotificationSubmission(res.recordId, formik.values.reference, formik, 1)
        } else if (!formik.values.notificationGroupId && res.recordId) {
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
        await refetchForm(formik.values.recordId)
        toast.success(platformLabels.Edited)
      }
    }
  })

  const isPosted = formik.values.status === 3
  const isClosed = formik.values.wip === 2
  const editMode = !!formik.values.recordId

  const getWeightAndMetalId = async itemId => {
    const res = await getRequest({
      extension: InventoryRepository.Physical.get,
      parameters: '_itemId=' + itemId
    })

    return {
      weight: res?.record?.weight ?? 0,
      metalId: res?.record?.metalId,
      metalRef: res?.record?.metalRef
    }
  }

  const getUnitCost = async itemId => {
    const res = await getRequest({
      extension: InventoryRepository.Cost.get,
      parameters: '_itemId=' + itemId
    })

    return res?.record?.currentCost
  }

  function calcTotalCost(rec) {
    if (rec.priceType === 1) return (Math.round(rec.qty * rec.unitCost * 100) / 100).toFixed(2)
    else if (rec.priceType === 2) return (Math.round(rec.qty * rec.unitCost * rec.volume * 100) / 100).toFixed(2)
    else if (rec.priceType === 3) return (Math.round(rec.qty * rec.unitCost * rec.weight * 100) / 100).toFixed(2)
    else return 0
  }

  async function getDTD(dtId) {
    const res = await getRequest({
      extension: InventoryRepository.DocumentTypeDefaults.get,
      parameters: `_dtId=${dtId}`
    })

    formik.setFieldValue('toSiteId', res?.record?.toSiteId)
    formik.setFieldValue('fromSiteId', res?.record?.siteId)
    formik.setFieldValue('carrierId', res?.record?.carrierId)

    return res
  }

  const { totalQty, totalCost, totalWeight } = formik?.values?.transfers?.reduce(
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

  const getMeasurementUnits = async () => {
    return await getRequest({
      extension: InventoryRepository.MeasurementUnit.qry,
      parameters: `_msId=0`
    })
  }

  async function getItem(itemId) {
    const res = await getRequest({
      extension: InventoryRepository.Item.get,
      parameters: `_recordId=${itemId}`
    })

    return res?.record
  }

  async function getFilteredMU(itemId) {
    if (!itemId) return

    const currentItemId = formik.values.transfers?.find(transfer => parseInt(transfer.itemId) === itemId)?.msId

    const arrayMU = measurements?.filter(item => item.msId === currentItemId) || []
    filteredMeasurements.current = arrayMU
  }

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
        readOnly: isClosed,
        displayFieldWidth: 4,
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
          { key: 'name', value: 'Name' },
          { key: 'flName', value: 'flName' }
        ]
      },
      async onChange({ row: { update, newRow } }) {
        if (!newRow?.itemId) {
          update({
            details: false
          })

          return
        }

        if (newRow?.itemId) {
          const { weight, metalId, metalRef } = await getWeightAndMetalId(newRow?.itemId)
          const unitCost = (await getUnitCost(newRow?.itemId)) ?? 0
          const totalCost = calcTotalCost(newRow)
          const itemInfo = await getItem(newRow.itemId)
          getFilteredMU(newRow?.itemId)
          const filteredMeasurements = measurements?.filter(item => item.msId === itemInfo?.msId)
          update({
            weight,
            unitCost,
            totalCost,
            details: true,
            msId: itemInfo?.msId,
            muRef: filteredMeasurements?.[0]?.reference,
            muId: filteredMeasurements?.[0]?.recordId,
            metalId,
            metalRef
          })
        }
      }
    },
    {
      component: 'button',
      name: 'details',
      defaultValue: !!formik.values?.plId,
      props: {
        imgSrc: '/images/buttonsIcons/popup-black.png'
      },
      label: labels.details,
      onClick: (e, row, update, newRow) => {
        if (row?.itemId) {
          stack({
            Component: SkuForm,
            props: {
              labels,
              maxAccess,
              itemId: row?.itemId,
              plId: formik.values?.plId
            },
            width: 700,
            height: 500,
            title: labels.Transfer
          })
        }
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
        readOnly: isClosed,
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
      props: {
        readOnly: isClosed
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
      label: labels.unitCost,
      name: 'unitCost',
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.totalCost,
      name: 'totalCost',
      props: {
        readOnly: true
      }
    },
    {
      component: 'button',
      name: 'serials',
      label: labels.currencyNotes,
      props: {
        imgSrc: '/images/TableIcons/imgSerials.png'
      },
      onClick: (e, row, update, updateRow) => {
        stack({
          Component: SerialsForm,
          props: {
            labels,
            row,
            values: formik.values,
            maxAccess: access,
            checkForSiteId: false,
            updateRow
          },
          width: 500,
          height: 700,
          title: platformLabels.serials
        })
      }
    }
  ]

  async function getData(recordId) {
    const res = await getRequest({
      extension: InventoryRepository.MaterialsTransfer.get,
      parameters: `_recordId=${recordId}`
    })

    res.record.date = formatDateFromApi(res?.record?.date)
    res.record.closedDate = formatDateFromApi(res?.record?.closedDate)
    res.record.receivedDate = formatDateFromApi(res?.record?.receivedDate)

    return res
  }

  async function refetchForm(recordId) {
    const res = await getData(recordId)

    if (!!formik.values.notificationGroupId) {
      handleNotificationSubmission(recordId, res.record.reference, formik, 1)
    }

    const res3 = await getDataGrid(recordId)

    const updatedTransfers = await Promise.all(
      res3.list.map(async item => {
        const serials = await getSerials(recordId, item.seqNo)

        return {
          ...item,
          id: item.seqNo,
          totalCost: calcTotalCost(item),
          serials: serials.list.map((serialDetail, index) => {
            return {
              ...serialDetail,
              id: index
            }
          }),
          unitCost: item.unitCost ?? 0
        }
      })
    )

    formik.setValues({
      ...res.record,
      recordId,
      transfers: updatedTransfers,
      notificationGroupId: formik.values.notificationGroupId
    })
  }

  const onClose = async recId => {
    await postRequest({
      extension: InventoryRepository.MaterialsTransfer.close,
      record: JSON.stringify({ recordId: recId })
    })

    toast.success(platformLabels.Closed)
    invalidate()

    await refetchForm(formik.values.recordId)
  }

  async function onReopen() {
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
  }

  const onWorkFlowClick = async () => {
    stack({
      Component: WorkFlow,
      props: {
        functionId: SystemFunction.MaterialTransfer,
        recordId: formik.values.recordId
      },
      width: 950,
      title: labels.workflow
    })
  }

  const onPost = async () => {
    const copy = { ...formik.values }
    delete copy.transfers
    delete copy.notificationGroupId
    copy.date = !!copy.date ? formatDateToApi(copy.date) : null
    copy.closedDate = !!copy.closedDate ? formatDateToApi(copy.closedDate) : null
    copy.receivedDate = !!copy.receivedDate ? formatDateToApi(copy.receivedDate) : null

    await postRequest({
      extension: InventoryRepository.MaterialsTransfer.post,
      record: JSON.stringify(copy)
    })

    if (formik.values.notificationGroupId) {
      handleNotificationSubmission(formik.values.recordId, formik.values.reference, formik, 3)
    } else if (!formik.values.notificationGroupId) {
      const data = {
        recordId: formik.values.recordId,
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
    await refetchForm(formik.values.recordId)
  }

  const onUnpost = async () => {
    const copy = { ...formik.values }
    delete copy.transfers
    delete copy.notificationGroupId
    copy.date = !!copy.date ? formatDateToApi(copy.date) : null
    copy.closedDate = !!copy.closedDate ? formatDateToApi(copy.closedDate) : null
    copy.receivedDate = !!copy.receivedDate ? formatDateToApi(copy.receivedDate) : null

    await postRequest({
      extension: InventoryRepository.MaterialsTransfer.unpost,
      record: JSON.stringify(copy)
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
      key: 'Locked',
      condition: isPosted,
      onClick: 'onUnpostConfirmation',
      onSuccess: onUnpost,
      disabled: !editMode || !isClosed || formik.values.isVerified
    },
    {
      key: 'Unlocked',
      condition: !isPosted,
      onClick: onPost,
      disabled: !editMode || !isClosed || formik.values.isVerified
    },
    {
      key: 'Close',
      condition: !isClosed,
      onClick: () => onClose(formik.values.recordId),
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
    return await getRequest({
      extension: AccessControlRepository.Notification.get,
      parameters: `_recordId=${recordId}&_functionId=${SystemFunction.MaterialTransfer}`
    })
  }

  async function getDataGrid(recordId) {
    return await getRequest({
      extension: InventoryRepository.MaterialsTransferItems.qry,
      parameters: `_transferId=${recordId}&_functionId=${SystemFunction.MaterialTransfer}`
    })
  }

  useEffect(() => {
    ;(async function () {
      const muList = await getMeasurementUnits()
      setMeasurements(muList?.list)
      getDefaultFromSiteId()

      if (documentType?.dtId) {
        formik.setFieldValue('dtId', documentType.dtId)
        getDTD(documentType?.dtId)
      }
    })()
  }, [])

  async function getSerials(recordId, seqNo) {
    return await getRequest({
      extension: InventoryRepository.MaterialTransferSerial.qry,
      parameters: `_transferId=${recordId}&_seqNo=${seqNo}&_componentSeqNo=${0}`
    })
  }

  useEffect(() => {
    ;(async function () {
      if (recordId && measurements) {
        const res = await getData(recordId)
        const resNotification = await getNotificationData(recordId)
        const res3 = await getDataGrid(recordId)

        const updatedTransfers = await Promise.all(
          res3.list.map(async item => {
            const serials = await getSerials(recordId, item.seqNo)

            return {
              ...item,
              id: item.seqNo,
              totalCost: calcTotalCost(item),
              serials: serials.list.map((serialDetail, index) => {
                return {
                  ...serialDetail,
                  id: index
                }
              }),
              unitCost: item.unitCost ?? 0
            }
          })
        )

        formik.setValues({
          ...res.record,
          transfers: updatedTransfers,
          notificationGroupId: resNotification?.record?.notificationGroupId
        })
      }

      if (!!formik.values.toSiteId) {
        const res2 = await getRequest({
          extension: InventoryRepository.Site.get,
          parameters: `_recordId=${formik.values.toSiteId}`
        })

        formik.setFieldValue('plId', res2.record.plId)
      }
    })()
  }, [recordId, measurements, formik.values.toSiteId])

  async function previewBtnClicked() {
    const data = { printStatus: 2, recordId: formik.values.recordId }

    await postRequest({
      extension: InventoryRepository.MaterialsTransfer.print,
      record: JSON.stringify(data)
    })

    invalidate()
  }

  return (
    <FormShell
      resourceId={ResourceIds.MaterialsTransfer}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      previewReport={editMode}
      previewBtnClicked={previewBtnClicked}
      actions={actions}
      functionId={SystemFunction.MaterialTransfer}
      disabledSubmit={isPosted || isClosed}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={8} marginTop={1}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <ResourceComboBox
                    endpointId={SystemRepository.DocumentType.qry}
                    parameters={`_dgId=${SystemFunction.MaterialTransfer}&_startAt=${0}&_pageSize=${50}`}
                    filter={!editMode ? item => item.activeStatus === 1 : undefined}
                    name='dtId'
                    label={labels.documentType}
                    readOnly={isPosted || isClosed}
                    valueField='recordId'
                    displayField='name'
                    values={formik?.values}
                    onChange={async (event, newValue) => {
                      formik.setFieldValue('dtId', newValue?.recordId || '')
                      if (newValue?.recordId) await getDTD(newValue?.recordId)
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
                    readOnly={isPosted || isClosed || editMode}
                    maxAccess={!editMode && maxAccess}
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
                    readOnly={isPosted || isClosed || formik?.values?.transfers?.some(transfer => transfer.sku)}
                    label={labels.fromSite}
                    values={formik.values}
                    displayField={['reference', 'name']}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    displayFieldWidth={1}
                    required
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('fromSiteId', newValue?.recordId || '')
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
                      formik.setFieldValue('carrierId', newValue ? newValue.recordId : '')
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
                    displayField={['reference', 'name']}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    displayFieldWidth={1}
                    required
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('toSiteId', newValue?.recordId)
                      formik.setFieldValue('plId', newValue?.plId)
                    }}
                    error={formik.touched.toSiteId && Boolean(formik.errors.toSiteId)}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid container xs={4} spacing={2} style={{ marginTop: 0 }}>
              <Grid item xs={12} marginLeft={2}>
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
              <Grid item xs={12} marginLeft={2}>
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
                    formik.setFieldValue('plantId', newValue?.recordId || null)
                  }}
                  error={formik.touched.plantId && Boolean(formik.errors.plantId)}
                />
              </Grid>
            </Grid>
          </Grid>
          <DataGrid
            onChange={value => {
              const data = value?.map(transfer => {
                return {
                  ...transfer,
                  details: false,
                  qtyInBase: 0
                }
              })

              formik?.setFieldValue('transfers', data)
            }}
            onSelectionChange={(row, update, field) => {
              if (field == 'muRef') getFilteredMU(row?.itemId)
            }}
            name='transfers'
            maxAccess={maxAccess}
            value={formik?.values?.transfers}
            error={formik?.errors?.transfers}
            columns={columns}
            allowDelete={!isClosed}
          />
        </Grow>
        <Fixed>
          <Grid container direction='row' wrap='nowrap' sx={{ justifyContent: 'space-between' }}>
            <Grid container xs={3} direction='column' wrap='nowrap' sx={{ pt: 5, justifyContent: 'flex-start' }}>
              <Grid item xs={3}>
                <CustomTextField
                  name='totalQty'
                  maxAccess={maxAccess}
                  value={getFormattedNumber(totalQty)}
                  label={labels.totalQty}
                  readOnly
                />
              </Grid>
              <Grid item xs={3} sx={{ mt: 2 }}>
                <CustomTextField
                  name='totalCost'
                  maxAccess={maxAccess}
                  value={getFormattedNumber(totalCost)}
                  label={labels.totalCost}
                  readOnly
                />
              </Grid>
              <Grid item xs={3} sx={{ mt: 2 }}>
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
