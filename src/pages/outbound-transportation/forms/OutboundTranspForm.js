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
import { formatDateFromApi, formatDateToApi, formatTimeFromApi, getTimeInTimeZone } from 'src/lib/date-helper'
import { useWindow } from 'src/windows'
import { DeliveryRepository } from 'src/repositories/DeliveryRepository'
import { SaleRepository } from 'src/repositories/SaleRepository'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Box } from '@mui/system'
import CustomTimePicker from 'src/components/Inputs/CustomTimePicker'
import dayjs from 'dayjs'
import { CopyAll } from '@mui/icons-material'

export default function OutboundTranspForm({ labels, maxAccess: access, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.DeliveryTrip,
    access,
    enabled: !recordId
  })

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
      arrivalTime: null, //case of empty??
      arrivalTimeField: null,
      notes: '',
      dtId: documentType?.dtId,
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
      orders: []

      /*  {
          id: 1,
          tripId: recordId || 0,
          soId: null,
          soRef: '',
          soWeight: null,
          soVolume: null,
          soWipStatusName: '',
          clientName: '',
          clientRef: '',
          soDate: null
        }
      ]*/
    },
    maxAccess,
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      departureTime: yup.string().required(),
      plantId: yup.number().required(),
      vehicleId: yup.string().required(),
      driverId: yup.string().required()
    }),
    onSubmit: async obj => {
      try {
        const copy = { ...obj }
        delete copy.orders
        console.log('copyyy', copy)

        //copy.date = formatDateToApi(copy.date)

        /* const combinedDateTime = getShiftetDate(copy.departureTime, copy.departureTimeField)
        copy.departureTime = formatDateToApi(combinedDateTime)

        if (copy.arrivalTime) {
          const arrCombinedDateTime = getShiftetDate(copy.arrivalTime, copy.arrivalTimeField)
          copy.arrivalTime = formatDateToApi(arrCombinedDateTime)
        }

        const headerResponse = await postRequest({
          extension: DeliveryRepository.Trip.set,
          record: JSON.stringify(copy)
        })

        formik.setFieldValue('recordId', headerResponse.recordId)

        let filteredOrders = formik.values.orders.filter(order => order.soId !== '')
        console.log(filteredOrders)
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
          console.log('Duplicate soId found. Operation aborted.')

          return
        }

        filteredOrders = filteredOrders.map((order, index) => ({
          ...order,
          tripId: headerResponse.recordId || 0,
          id: index + 1
        }))

        const data = {
          tripId: headerResponse.recordId || 0,
          tripOrders: filteredOrders
        }

        const response = await postRequest({
          extension: DeliveryRepository.TripOrderPack2.set2,
          record: JSON.stringify(data)
        })

        await refetchForm(headerResponse.recordId)
        !formik.values.recordId ? toast.success(platformLabels.Added) : toast.success(platformLabels.Edited)

        invalidate() */
      } catch (error) {}
    }
  })

  function getShiftetDate(date, time) {
    //add time field to date after modifying time by timezone
    const originalDate = dayjs(date).startOf('day')
    const selectedTime = formatDateToApi(time)
    const adjustedTimeString = getTimeInTimeZone(selectedTime, +3)
    const adjustedTime = dayjs(adjustedTimeString, 'HH:mm:ss')

    const combinedDateTime = originalDate.set('hour', adjustedTime.hour()).set('minute', adjustedTime.minute())

    return combinedDateTime
  }

  const totalVol = formik.values.orders.reduce((volSum, row) => {
    // Parse qty as a number, assuming it's a numeric value
    const volValue = parseFloat(row.soVolume) || 0

    return volSum + volValue
  }, 0)

  const totalWeight = formik.values.orders.reduce((weightSum, row) => {
    // Parse qty as a number, assuming it's a numeric value
    const weightValue = parseFloat(row.soWeight) || 0

    return weightSum + weightValue
  }, 0)

  const isPosted = formik.values.status === 3
  const isClosed = formik.values.wip === 2
  const editMode = !!formik.values.recordId

  async function refetchForm(recordId) {
    const res = await getOutboundTransp(recordId)
    console.log(res)

    //if (res.record.departureTime) res.record.departureTimeField = formatTimeFromApi(res.record.departureTime, -3)

    //if (res.record.arrivalTime) res.record.arrivalTimeField = formatTimeFromApi(res.record.arrivalTime, -3)
    res.record.date = formatDateFromApi(res.record.date)
    res.record.departureTime = formatDateFromApi(res.record.departureTime)
    console.log(res.record.departureTime)
    res.record.arrivalTime = formatDateFromApi(res.record.arrivalTime)

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

    console.log(res.list)

    const ordersList = await Promise.all(
      res.list.map((item, index) => {
        return {
          ...item,
          id: index + 1, //correct?
          soDate: formatDateFromApi(item.soDate)
        }
      })
    )
    console.log(data)
    formik.setValues({
      ...data,
      orders: ordersList
    })
  }

  const onPost = async () => {
    try {
      const res = await postRequest({
        extension: DeliveryRepository.Trip.post,
        record: JSON.stringify(formik.values)
      })

      toast.success(platformLabels.Posted)
      invalidate()

      await refetchForm(res.recordId)
    } catch (exception) {}
  }

  const onClose = async recId => {
    try {
      const res = await postRequest({
        extension: DeliveryRepository.Trip.close,
        record: JSON.stringify({ recordId: recId })
      })

      if (recordId) toast.success(platformLabels.Closed)
      invalidate()

      await refetchForm(res.recordId)
    } catch (error) {}
  }

  useEffect(() => {
    ;(async function () {
      try {
        if (recordId) {
          await refetchForm(recordId)
        }
      } catch (error) {}
    })()
  }, [])

  const actions = [
    {
      key: 'Post',
      condition: true,
      onClick: onPost,
      disabled: isPosted || !editMode
    },
    {
      key: 'Close',
      condition: !isClosed,
      onClick: () => onClose(formik.values.recordId),
      disabled: isPosted || !editMode
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
        displayFieldWidth: 4,
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
        columnsInDropDown: [
          { key: 'reference', value: 'Reference' },
          { key: 'name', value: 'Name' }
        ],
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

  return (
    <FormShell
      resourceId={ResourceIds.Trip}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      actions={actions}
      functionId={SystemFunction.DeliveryTrip}
      disabledSubmit={isPosted || isClosed}
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
                      changeDT(newValue) //change REF??
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
                    label={labels.departureDate}
                    name='departureTimeField'
                    value={formik.values?.departureTimeField}
                    onChange={formik.setFieldValue}
                    onClear={() => formik.setFieldValue('departureTimeField', '')}
                    readOnly={isPosted || isClosed}
                    error={formik.touched.departureTimeField && Boolean(formik.errors.departureTimeField)}
                    maxAccess={maxAccess}

                    //renderInput={params => <CustomTextField {...params} />}
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

                    //affect time picker function //time picker
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

                    //set cap volume hidden, calculate footer
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Grid container xs={12} spacing={2}>
                <Grid item xs={4}></Grid>
                <Grid item xs={4}>
                  <CustomTimePicker
                    label={labels.arrivalDate}
                    name='arrivalTimeField'
                    value={formik.values?.arrivalTimeField}
                    onChange={formik.setFieldValue}
                    onClear={() => formik.setFieldValue('arrivalTimeField', '')}
                    readOnly={isPosted || isClosed || !formik.values?.arrivalTime}
                    error={formik.touched.arrivalTimeField && Boolean(formik.errors.arrivalTimeField)}
                    maxAccess={maxAccess}

                    //renderInput={params => <CustomTextField {...params} />}
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
          <Grid container rowGap={1} xs={10} spacing={2}>
            <Grid item xs={5}>
              <CustomTextField
                name='totalVolume'
                label={labels.totVol}
                maxAccess={maxAccess}
                value={totalVol}
                maxLength='30'
                readOnly={true}
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
                readOnly={true}
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
