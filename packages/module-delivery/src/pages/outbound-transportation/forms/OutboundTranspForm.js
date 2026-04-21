import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import CustomTextArea from '@argus/shared-ui/src/components/Inputs/CustomTextArea'
import { useDocumentType } from '@argus/shared-hooks/src/hooks/documentReferenceBehaviors'
import { formatDateFromApi, formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'
import { DeliveryRepository } from '@argus/repositories/src/repositories/DeliveryRepository'
import { SaleRepository } from '@argus/repositories/src/repositories/SaleRepository'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import CustomTimePicker from '@argus/shared-ui/src/components/Inputs/CustomTimePicker'
import dayjs from 'dayjs'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import { DefaultsContext } from '@argus/shared-providers/src/providers/DefaultsContext'

export default function OutboundTranspForm({ labels, maxAccess: access, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { userDefaults } = useContext(DefaultsContext)

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.DeliveryTrip,
    access,
    enabled: !recordId,
    objectName: 'header'
  })

  async function getDefaultData() {
    const userKeys = ['plantId']

    const plantIdDefault = (userDefaults?.list || []).reduce((acc, { key, value }) => {
      if (userKeys.includes(key)) {
        acc[key] = value ? parseInt(value) : null
      }

      return acc
    }, {})

    formik.setFieldValue('header.plantId', parseInt(plantIdDefault?.plantId))
  }

  const invalidate = useInvalidate({
    endpointId: DeliveryRepository.Trip.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      header: {
        recordId: null,
        reference: '',
        plantId: null,
        vehicleId: null,
        driverId: null,
        date: new Date(),
        departureTime: new Date(),
        departureTimeField: null,
        arrivalTime: null,
        arrivalTimeField: null,
        notes: '',
        dtId: null,
        status: 1,
        statusName: '',
        printStatusName: '',
        dtName: '',
        plantName: '',
        vehName: '',
        driverName: '',
        capacityVolume: null,
        wip: 1,
        wipName: ''
      },
      tripOrders: [
        {
          id: 1,
          soRef: null,
          soId: null,
          soDate: null,
          clientName: null,
          soVolume: null,
          soWeight: null,
          soWipStatusName: null
        }
      ]
    },
    maxAccess,
    documentType: { key: 'header.dtId', value: documentType?.dtId },
    validateOnChange: true,
    validationSchema: yup.object({
      header: yup.object({
        departureTime: yup.string().required(),
        plantId: yup.number().required()
      })
    }),
    onSubmit: async obj => {
      const header = { ...obj.header }

      header.date = formatDateToApi(header.date)

      const combinedDateTime = getShiftedDate(header.departureTime, header.departureTimeField)
      header.departureTime = formatDateToApi(combinedDateTime)

      if (header.arrivalTime) {
        const arrCombinedDateTime = getShiftedDate(header.arrivalTime, header.arrivalTimeField)
        header.arrivalTime = formatDateToApi(arrCombinedDateTime)
      }

      let filteredOrders = formik.values.tripOrders.filter(
        order => order.soId !== '' && order.soId !== undefined && order.soId !== null
      )

      const soIdSet = new Set()
      let hasDuplicates = false

      for (const order of filteredOrders) {
        if (soIdSet.has(order.soId)) {
          hasDuplicates = true
          break
        }
        soIdSet.add(order.soId)
      }

      if (hasDuplicates) {
        return
      }

      filteredOrders = filteredOrders?.some(order => order.soId)
        ? filteredOrders.map((order, index) => ({
            ...order,
            id: index + 1
          }))
        : []

      const data = {
        header,
        tripOrders: filteredOrders
      }

      const response = await postRequest({
        extension: DeliveryRepository.TripOrderPack2.set2,
        record: JSON.stringify(data)
      })

      formik.setFieldValue('recordId', response.recordId)

      await refetchForm(response.recordId)
      !formik.values.recordId ? toast.success(platformLabels.Added) : toast.success(platformLabels.Edited)

      invalidate()
    }
  })

  function getShiftedDate(date, time) {
    const originalDate = dayjs(date).startOf('day')
    let combinedDateTime = originalDate

    if (time != null) {
      const parsedTime = dayjs(time, 'hh:mm A')
      combinedDateTime = originalDate.set('hour', parsedTime.hour()).set('minute', parsedTime.minute())
    }

    return combinedDateTime
  }

  const totalVol = formik.values.tripOrders.reduce((volSum, row) => {
    const volValue = parseFloat(row.soVolume) || 0

    return volSum + volValue
  }, 0)

  const totalWeight = formik.values.tripOrders.reduce((weightSum, row) => {
    const weightValue = parseFloat(row.soWeight) || 0

    return weightSum + weightValue
  }, 0)

  const isPosted = formik.values.header.status === 3
  const isClosed = formik.values.header.wip === 2
  const editMode = !!formik.values.recordId

  async function refetchForm(recordId) {
    const res = await getOutboundTransp(recordId)
    const formattedDepDate = formatDateFromApi(res.record.header.departureTime)
    const formattedArrDate = formatDateFromApi(res.record.header.arrivalTime)

    res.record.header.date = formatDateFromApi(res.record.header.date)
    res.record.header.departureTime = formattedDepDate
    if (formattedDepDate) res.record.header.departureTimeField = dayjs(dayjs(formattedDepDate), 'hh:mm A')
    res.record.header.arrivalTime = formattedArrDate
    if (formattedArrDate) res.record.header.arrivalTimeField = dayjs(dayjs(formattedArrDate), 'hh:mm A')

    let ordersList = []

    if (res.record.tripOrders != []) {
      ordersList = await Promise.all(
        res.record.tripOrders.map((item, index) => {
          return {
            ...item,
            id: index + 1,
            soDate: formatDateFromApi(item.soDate)
          }
        })
      )
    }

    formik.setValues({
      recordId: res.record.header.recordId,
      header: res.record.header,
      tripOrders: ordersList
    })
  }

  async function getOutboundTransp(recordId) {
    return await getRequest({
      extension: DeliveryRepository.Trip.get2,
      parameters: `_recordId=${recordId}`
    })
  }


  const onPost = async () => {
    await postRequest({
      extension: DeliveryRepository.Trip.post,
      record: JSON.stringify(formik.values.header)
    })

    toast.success(platformLabels.Posted)
    invalidate()

    await refetchForm(formik.values.recordId)
  }

  const onUnpost = async () => {
    await postRequest({
      extension: DeliveryRepository.Trip.unpost,
      record: JSON.stringify(formik.values.header)
    })

    toast.success(platformLabels.Unposted)
    invalidate()

    await refetchForm(formik.values.recordId)
  }

  const onClose = async () => {
    await postRequest({
      extension: DeliveryRepository.Trip.close,
      record: JSON.stringify(formik.values.header)
    })

    if (recordId) toast.success(platformLabels.Closed)
    invalidate()

    await refetchForm(formik.values.recordId)
  }

  const onReopen = async () => {
    await postRequest({
      extension: DeliveryRepository.Trip.reopen,
      record: JSON.stringify(formik.values.header)
    })

    if (recordId) toast.success(platformLabels.Reopened)
    invalidate()

    await refetchForm(formik.values.recordId)
  }

  useEffect(() => {
    ;(async function () {
      getDefaultData()
      if (recordId) {
        await refetchForm(recordId)
      }
    })()
  }, [])

  const actions = [
    {
      key: 'Locked',
      condition: isPosted,
      onClick: 'onUnpostConfirmation',
      onSuccess: onUnpost,
      disabled: !editMode || !isClosed
    },
    {
      key: 'Unlocked',
      condition: !isPosted,
      onClick: onPost,
      disabled: !editMode || !isClosed
    },
    {
      key: 'Close',
      condition: !isClosed,
      onClick: () => onClose(formik.values.recordId),
      disabled: isPosted || isClosed || !editMode
    },
    {
      key: 'Reopen',
      condition: isClosed,
      onClick: onReopen,
      disabled: !isClosed || isPosted
    }
  ]

  const columns = [
    {
      component: 'resourcelookup',
      label: labels.reference,
      name: 'soRef',
      props: {
        valueField: 'reference',
        displayField: 'reference',
        displayFieldWidth: 1,
        endpointId: SaleRepository.SalesOrder.snapshot,
        mapping: [
          { from: 'recordId', to: 'soId' },
          { from: 'reference', to: 'soRef' },
          { from: 'date', to: 'soDate' },
          { from: 'clientId', to: 'clientId' },
          { from: 'clientRef', to: 'clientRef' },
          { from: 'clientName', to: 'clientName' },
          { from: 'volume', to: 'soVolume' },
          { from: 'weight', to: 'soWeight' },
          { from: 'szName', to: 'szName' },
          { from: 'wipName', to: 'soWipStatusName' }
        ],
        columnsInDropDown: [{ key: 'reference', value: 'Reference' }],
        readOnly: isPosted || isClosed
      },
      onChange({ row: { update, newRow } }) {
        const formattedDate = newRow?.soDate ? formatDateFromApi(newRow?.soDate) : ''
        update({
          soDate: formattedDate
        })
      }
    },
    {
      component: 'date',
      name: 'soDate',
      label: labels.date,
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      label: labels.client,
      name: 'clientName',
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      label: labels.szName,
      name: 'szName',
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      label: labels.volume,
      name: 'soVolume',
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      label: labels.wip,
      name: 'soWipStatusName',
      props: {
        readOnly: true
      }
    }
  ]

  async function previewBtnClicked() {
    const data = { printStatus: 2, recordId: formik.values.recordId }

    await postRequest({
      extension: DeliveryRepository.TRP.flag,
      record: JSON.stringify(data)
    })

    invalidate()
  }

  return (
    <FormShell
      resourceId={ResourceIds.Trip}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      actions={actions}
      previewBtnClicked={previewBtnClicked}
      functionId={SystemFunction.DeliveryTrip}
      disabledSubmit={isPosted || isClosed}
      previewReport={editMode}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Grid container xs={12} spacing={2}>
                <Grid item xs={4}>
                  <ResourceComboBox
                    endpointId={SystemRepository.DocumentType.qry}
                    parameters={`_dgId=${SystemFunction.DeliveryTrip}&_startAt=${0}&_pageSize=${1000}`}
                    filter={!editMode ? item => item.activeStatus === 1 : undefined}
                    name='header.dtId'
                    label={labels.docType}
                    readOnly={editMode}
                    valueField='recordId'
                    displayField='name'
                    values={formik.values.header}
                    onChange={async (event, newValue) => {
                      formik.setFieldValue('header.dtId', newValue?.recordId || '')
                      changeDT(newValue)
                    }}
                    error={formik.touched?.header?.dtId && Boolean(formik.errors?.header?.dtId)}
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={4}>
                  <CustomDatePicker
                    name='header.departureTime'
                    label={labels.departureDate}
                    value={formik.values.header?.departureTime}
                    onChange={formik.setFieldValue}
                    onClear={() => formik.setFieldValue('header.departureTime', '')}
                    readOnly={isPosted || isClosed}
                    error={formik.touched?.header?.departureTime && Boolean(formik.errors?.header?.departureTime)}
                    maxAccess={maxAccess}
                    required
                  />
                </Grid>
                <Grid item xs={4}>
                  <ResourceComboBox
                    endpointId={SystemRepository.Plant.qry}
                    name='header.plantId'
                    label={labels.plant}
                    valueField='recordId'
                    readOnly={isPosted || isClosed}
                    displayField={['reference', 'name']}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik.values.header}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('header.plantId', newValue ? newValue?.recordId : '')
                    }}
                    error={formik.touched?.header?.plantId && Boolean(formik.errors?.header?.plantId)}
                    required
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Grid container xs={12} spacing={2}>
                <Grid item xs={4}>
                  <CustomTextField
                    name='header.reference'
                    label={labels.reference}
                    value={formik.values.header.reference}
                    readOnly={editMode}
                    maxAccess={maxAccess}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('header.reference', '')}
                    error={formik.touched?.header?.reference && Boolean(formik.errors?.header?.reference)}
                  />
                </Grid>

                <Grid item xs={4}>
                  <CustomTimePicker
                    label={labels.departureTime}
                    name='header.departureTimeField'
                    value={formik.values.header?.departureTimeField}
                    onChange={formik.setFieldValue}
                    onClear={() => formik.setFieldValue('header.departureTimeField', '')}
                    readOnly={isPosted || isClosed}
                    error={
                      formik.touched?.header?.departureTimeField &&
                      Boolean(formik.errors?.header?.departureTimeField)
                    }
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={4}>
                  <ResourceComboBox
                    endpointId={DeliveryRepository.Driver.qry}
                    name='header.driverId'
                    label={labels.driver}
                    valueField='recordId'
                    readOnly={isPosted || isClosed}
                    displayField='name'
                    values={formik.values.header}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('header.driverId', newValue ? newValue?.recordId : '')
                    }}
                    error={formik.touched?.header?.driverId && Boolean(formik.errors?.header?.driverId)}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Grid container xs={12} spacing={2}>
                <Grid item xs={4}>
                  <CustomDatePicker
                    name='header.date'
                    label={labels.date}
                    value={formik.values.header?.date}
                    onChange={formik.setFieldValue}
                    onClear={() => formik.setFieldValue('header.date', '')}
                    readOnly={isPosted || isClosed}
                    error={formik.touched?.header?.date && Boolean(formik.errors?.header?.date)}
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={4}>
                  <CustomDatePicker
                    name='header.arrivalTime'
                    label={labels.arrivalDate}
                    value={formik.values.header?.arrivalTime}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('header.arrivalTime', newValue)
                      if (!newValue) {
                        formik.setFieldValue('header.arrivalTimeField', '')
                      }
                    }}
                    onClear={() => formik.setFieldValue('header.arrivalTime', '')}
                    readOnly={isPosted || isClosed}
                    error={formik.touched?.header?.arrivalTime && Boolean(formik.errors?.header?.arrivalTime)}
                    maxAccess={maxAccess}
                  />
                </Grid>

                <Grid item xs={4}>
                  <ResourceComboBox
                    endpointId={DeliveryRepository.Vehicle.qry}
                    name='header.vehicleId'
                    label={labels.vehicle}
                    valueField='recordId'
                    readOnly={isPosted || isClosed}
                    displayField='name'
                    values={formik.values.header}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('header.vehicleId', newValue ? newValue?.recordId : '')
                    }}
                    error={formik.touched?.header?.vehicleId && Boolean(formik.errors?.header?.vehicleId)}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Grid container xs={12} spacing={2}>
                <Grid item xs={4}></Grid>
                <Grid item xs={4}>
                  <CustomTimePicker
                    label={labels.arrivalTime}
                    name='header.arrivalTimeField'
                    value={formik.values.header?.arrivalTimeField}
                    onChange={formik.setFieldValue}
                    onClear={() => formik.setFieldValue('header.arrivalTimeField', '')}
                    readOnly={isPosted || isClosed || !formik.values.header?.arrivalTime}
                    error={
                      formik.touched?.header?.arrivalTimeField &&
                      Boolean(formik.errors?.header?.arrivalTimeField)
                    }
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={4}>
                  <CustomTextArea
                    name='header.notes'
                    type='text'
                    label={labels.notes}
                    value={formik.values.header.notes}
                    readOnly={isPosted || isClosed}
                    rows={3}
                    maxAccess={maxAccess}
                    onChange={e => formik.setFieldValue('header.notes', e.target.value)}
                    onClear={() => formik.setFieldValue('header.notes', '')}
                    error={formik.touched?.header?.notes && Boolean(formik.errors?.header?.notes)}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Fixed>

        <Grow>
          <DataGrid
            onChange={value => {
              formik.setFieldValue('tripOrders', value)
            }}
            value={formik?.values?.tripOrders}
            error={formik?.errors?.tripOrders}
            columns={columns}
            allowDelete={!isPosted && !isClosed}
            allowAddNewLine={!isPosted && !isClosed}
          />
        </Grow>
        <Fixed>
          <Grid container rowGap={1} xs={10} spacing={2} pt={2}>
            <Grid item xs={5}>
              <CustomNumberField
                name='totalVolume'
                label={labels.totVol}
                maxAccess={maxAccess}
                value={totalVol}
                decimalScale={2}
                readOnly
              />
            </Grid>
            <Grid item xs={5}>
              <CustomNumberField
                name='totalWeight'
                label={labels.totalWeight}
                maxAccess={maxAccess}
                value={totalWeight}
                decimalScale={2}
                readOnly
              />
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}
