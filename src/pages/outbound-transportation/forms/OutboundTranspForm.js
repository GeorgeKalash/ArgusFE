import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
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
import { DeliveryRepository } from 'src/repositories/DeliveryRepository'
import { SaleRepository } from 'src/repositories/SaleRepository'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import CustomTimePicker from 'src/components/Inputs/CustomTimePicker'
import dayjs from 'dayjs'

export default function OutboundTranspForm({ labels, maxAccess: access, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels, userDefaultsData } = useContext(ControlContext)

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.DeliveryTrip,
    access,
    enabled: !recordId
  })

  async function getDefaultData() {
    const userKeys = ['plantId']

    const plantIdDefault = (userDefaultsData?.list || []).reduce((acc, { key, value }) => {
      if (userKeys.includes(key)) {
        acc[key] = value ? parseInt(value) : null
      }

      return acc
    }, {})

    formik.setFieldValue('plantId', parseInt(plantIdDefault?.plantId))
  }

  const invalidate = useInvalidate({
    endpointId: DeliveryRepository.Trip.page
  })

  const { formik } = useForm({
    initialValues: {
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
      wipName: '',
      orders: [
        {
          id: 1,
          soRef: null,
          soId: null,
          soDate: null,
          clientName: null,
          soVolume: null,
          soWipStatusName: null
        }
      ]
    },
    maxAccess,
    documentType: { key: 'dtId', value: documentType?.dtId },
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      departureTime: yup.string().required(),
      plantId: yup.number().required()
    }),
    onSubmit: async obj => {
      const copy = { ...obj }
      delete copy.orders

      copy.date = formatDateToApi(copy.date)

      const combinedDateTime = getShiftedDate(copy.departureTime, copy.departureTimeField)
      copy.departureTime = formatDateToApi(combinedDateTime)

      if (copy.arrivalTime) {
        const arrCombinedDateTime = getShiftedDate(copy.arrivalTime, copy.arrivalTimeField)
        copy.arrivalTime = formatDateToApi(arrCombinedDateTime)
      }

      const headerResponse = await postRequest({
        extension: DeliveryRepository.Trip.set,
        record: JSON.stringify(copy)
      })

      formik.setFieldValue('recordId', headerResponse.recordId)

      let filteredOrders = formik.values.orders.filter(order => order.soId !== '' && order.soId !== undefined)
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

      filteredOrders =
        filteredOrders[0].soId !== null && filteredOrders[0].soRef !== null
          ? filteredOrders.map((order, index) => ({
              ...order,
              tripId: headerResponse.recordId || 0,
              id: index + 1
            }))
          : []

      const data = {
        tripId: headerResponse.recordId || 0,
        tripOrders: filteredOrders
      }

      await postRequest({
        extension: DeliveryRepository.TripOrderPack2.set2,
        record: JSON.stringify(data)
      })

      await refetchForm(headerResponse.recordId)
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

  const totalVol = formik.values.orders.reduce((volSum, row) => {
    const volValue = parseFloat(row.soVolume) || 0

    return volSum + volValue
  }, 0)

  const totalWeight = formik.values.orders.reduce((weightSum, row) => {
    const weightValue = parseFloat(row.soWeight) || 0

    return weightSum + weightValue
  }, 0)

  const isPosted = formik.values.status === 3
  const isClosed = formik.values.wip === 2
  const editMode = !!formik.values.recordId

  async function refetchForm(recordId) {
    const res = await getOutboundTransp(recordId)
    const formattedDepDate = formatDateFromApi(res.record.departureTime)
    const formattedArrDate = formatDateFromApi(res.record.arrivalTime)

    res.record.date = formatDateFromApi(res.record.date)
    res.record.departureTime = formattedDepDate
    if (formattedDepDate) res.record.departureTimeField = dayjs(dayjs(formattedDepDate), 'hh:mm A')
    res.record.arrivalTime = formattedArrDate
    if (formattedArrDate) res.record.arrivalTimeField = dayjs(dayjs(formattedArrDate), 'hh:mm A')

    await getOrders(res.record)
  }

  async function getOutboundTransp(recordId) {
    return await getRequest({
      extension: DeliveryRepository.Trip.get,
      parameters: `_recordId=${recordId}`
    })
  }

  const getOrders = async data => {
    const res = await getRequest({
      extension: DeliveryRepository.TripOrder.qry,
      parameters: `_tripId=${data.recordId}`
    })

    let ordersList = []

    if (res.list != []) {
      ordersList = await Promise.all(
        res.list.map((item, index) => {
          return {
            ...item,
            id: index + 1,
            soDate: formatDateFromApi(item.soDate)
          }
        })
      )
    }

    formik.setValues({
      ...data,
      orders: ordersList
    })
  }

  const onPost = async () => {
    const res = await postRequest({
      extension: DeliveryRepository.Trip.post,
      record: JSON.stringify(formik.values)
    })

    toast.success(platformLabels.Posted)
    invalidate()

    await refetchForm(formik.values.recordId)
  }

  const onUnpost = async () => {
    await postRequest({
      extension: DeliveryRepository.Trip.unpost,
      record: JSON.stringify(formik.values)
    })

    toast.success(platformLabels.Unposted)
    invalidate()

    await refetchForm(formik.values.recordId)
  }

  const onClose = async () => {
    const res = await postRequest({
      extension: DeliveryRepository.Trip.close,
      record: JSON.stringify(formik.values)
    })

    if (recordId) toast.success(platformLabels.Closed)
    invalidate()

    await refetchForm(formik.values.recordId)
  }

  const onReopen = async () => {
    await postRequest({
      extension: DeliveryRepository.Trip.reopen,
      record: JSON.stringify(formik.values)
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
                    name='dtId'
                    label={labels.docType}
                    readOnly={editMode}
                    valueField='recordId'
                    displayField='name'
                    values={formik.values}
                    onChange={async (event, newValue) => {
                      formik.setFieldValue('dtId', newValue?.recordId || '')
                      changeDT(newValue)
                    }}
                    error={formik.touched.dtId && Boolean(formik.errors.dtId)}
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={4}>
                  <CustomDatePicker
                    name='departureTime'
                    label={labels.departureDate}
                    value={formik.values?.departureTime}
                    onChange={formik.setFieldValue}
                    onClear={() => formik.setFieldValue('departureTime', '')}
                    readOnly={isPosted || isClosed}
                    error={formik.touched.departureTime && Boolean(formik.errors.departureTime)}
                    maxAccess={maxAccess}
                    required
                  />
                </Grid>
                <Grid item xs={4}>
                  <ResourceComboBox
                    endpointId={SystemRepository.Plant.qry}
                    name='plantId'
                    label={labels.plant}
                    valueField='recordId'
                    readOnly={isPosted || isClosed}
                    displayField={['reference', 'name']}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik.values}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('plantId', newValue ? newValue?.recordId : '')
                    }}
                    error={formik.touched.plantId && Boolean(formik.errors.plantId)}
                    required
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Grid container xs={12} spacing={2}>
                <Grid item xs={4}>
                  <CustomTextField
                    name='reference'
                    label={labels.reference}
                    value={formik.values.reference}
                    readOnly={editMode}
                    maxAccess={maxAccess}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('reference', '')}
                    error={formik.touched.reference && Boolean(formik.errors.reference)}
                  />
                </Grid>

                <Grid item xs={4}>
                  <CustomTimePicker
                    label={labels.departureTime}
                    name='departureTimeField'
                    value={formik.values?.departureTimeField}
                    onChange={formik.setFieldValue}
                    onClear={() => formik.setFieldValue('departureTimeField', '')}
                    readOnly={isPosted || isClosed}
                    error={formik.touched.departureTimeField && Boolean(formik.errors.departureTimeField)}
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={4}>
                  <ResourceComboBox
                    endpointId={DeliveryRepository.Driver.qry}
                    name='driverId'
                    label={labels.driver}
                    valueField='recordId'
                    readOnly={isPosted || isClosed}
                    displayField='name'
                    values={formik.values}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('driverId', newValue ? newValue?.recordId : '')
                    }}
                    error={formik.touched.driverId && Boolean(formik.errors.driverId)}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Grid container xs={12} spacing={2}>
                <Grid item xs={4}>
                  <CustomDatePicker
                    name='date'
                    label={labels.date}
                    value={formik.values?.date}
                    onChange={formik.setFieldValue}
                    onClear={() => formik.setFieldValue('date', '')}
                    readOnly={isPosted || isClosed}
                    error={formik.touched.date && Boolean(formik.errors.date)}
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={4}>
                  <CustomDatePicker
                    name='arrivalTime'
                    label={labels.arrivalDate}
                    value={formik.values?.arrivalTime}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('arrivalTime', newValue)
                      if (!newValue) {
                        formik.setFieldValue('arrivalTimeField', '')
                      }
                    }}
                    onClear={() => formik.setFieldValue('arrivalTime', '')}
                    readOnly={isPosted || isClosed}
                    error={formik.touched.arrivalTime && Boolean(formik.errors.arrivalTime)}
                    maxAccess={maxAccess}
                  />
                </Grid>

                <Grid item xs={4}>
                  <ResourceComboBox
                    endpointId={DeliveryRepository.Vehicle.qry}
                    name='vehicleId'
                    label={labels.vehicle}
                    valueField='recordId'
                    readOnly={isPosted || isClosed}
                    displayField='name'
                    values={formik.values}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('vehicleId', newValue ? newValue?.recordId : '')
                    }}
                    error={formik.touched.vehicleId && Boolean(formik.errors.vehicleId)}
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
                    name='arrivalTimeField'
                    value={formik.values?.arrivalTimeField}
                    onChange={formik.setFieldValue}
                    onClear={() => formik.setFieldValue('arrivalTimeField', '')}
                    readOnly={isPosted || isClosed || !formik.values?.arrivalTime}
                    error={formik.touched.arrivalTimeField && Boolean(formik.errors.arrivalTimeField)}
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={4}>
                  <CustomTextArea
                    name='notes'
                    type='text'
                    label={labels.notes}
                    value={formik.values.notes}
                    readOnly={isPosted || isClosed}
                    rows={3}
                    maxAccess={maxAccess}
                    onChange={e => formik.setFieldValue('notes', e.target.value)}
                    onClear={() => formik.setFieldValue('notes', '')}
                    error={formik.touched.notes && Boolean(formik.errors.notes)}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Fixed>

        <Grow>
          <DataGrid
            onChange={value => {
              formik.setFieldValue('orders', value)
            }}
            value={formik?.values?.orders}
            error={formik?.errors?.orders}
            columns={columns}
            allowDelete={!isPosted && !isClosed}
            allowAddNewLine={!isPosted && !isClosed}
          />
        </Grow>
        <Fixed>
          <Grid container rowGap={1} xs={10} spacing={2} pt={2}>
            <Grid item xs={5}>
              <CustomTextField
                name='totalVolume'
                label={labels.totVol}
                maxAccess={maxAccess}
                value={totalVol}
                maxLength='30'
                readOnly
                error={formik.touched.totalVolume && Boolean(formik.errors.totalVolume)}
                helperText={formik.touched.totalVolume && formik.errors.totalVolume}
              />
            </Grid>
            <Grid item xs={5}>
              <CustomTextField
                name='totalWeight'
                label={labels.totalWeight}
                maxAccess={maxAccess}
                value={totalWeight}
                maxLength='30'
                readOnly
                error={formik.touched.totalWeight && Boolean(formik.errors.totalWeight)}
                helperText={formik.touched.totalWeight && formik.errors.totalWeight}
              />
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}
