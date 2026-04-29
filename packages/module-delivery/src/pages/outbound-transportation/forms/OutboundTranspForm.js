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
import { getDirtyFields } from '@argus/shared-utils/src/utils/getDirtyFields'

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

  const plantId = parseInt(userDefaults?.list?.find(({ key }) => key === 'plantId')?.value)

  const invalidate = useInvalidate({
    endpointId: DeliveryRepository.Trip.page
  })

  const initialValues = {
    recordId: null,
    header: {
      recordId: null,
      reference: '',
      plantId,
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
      capacityVolume: null,
      wip: 1
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
  }

  const { formik } = useForm({
    initialValues, 
    maxAccess,
    documentType: { key: 'header.dtId', value: documentType?.dtId, reference: documentType?.reference },
    validationSchema: yup.object({
      header: yup.object({
        departureTime: yup.string().required(),
        plantId: yup.number().required()
      })
    }),
    onSubmit: async obj => {
      const combinedDateTime = getShiftedDate(obj.header.departureTime, obj.header.departureTimeField)
      const header = { 
        ...obj.header, 
        date: formatDateToApi(obj.header.date), 
        departureTime: formatDateToApi(combinedDateTime) 
      }

      if (header.arrivalTime) {
        const arrCombinedDateTime = getShiftedDate(header.arrivalTime, header.arrivalTimeField)
        header.arrivalTime = formatDateToApi(arrCombinedDateTime)
      }

      const data = {
        header,
        tripOrders: formik.values.tripOrders
          ?.filter(order => order.soId)
          .map((order, index) => ({
            ...order,
            id: index + 1
          }))
      }

      const response = await postRequest({
        extension: DeliveryRepository.TripOrderPack2.set2,
        record: JSON.stringify(data)
      })

      await refetchForm(response.recordId)
      !formik.values.recordId ? toast.success(platformLabels.Added) : toast.success(platformLabels.Edited)

      invalidate()
    }
  })

  function getShiftedDate(date, time) {
    let originalDate = dayjs(date).startOf('day')

    if (time) {
      const parsedTime = dayjs(time, 'hh:mm A')
      originalDate = originalDate.set('hour', parsedTime.hour()).set('minute', parsedTime.minute())
    }

    return originalDate
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

     let tripOrders = res.record?.tripOrders?.length ? await Promise.all(
      (res.record?.tripOrders || []).map((item, index) => {
        return {
          ...item,
          id: index + 1,
          soDate: formatDateFromApi(item.soDate)
        }
      })
    ) : initialValues.tripOrders

    formik.resetForm({
      values: {
        recordId: res.record.header.recordId,
        header: {
          ...res.record.header,
          date: formatDateFromApi(res.record.header.date),
          departureTime: formattedDepDate,
          departureTimeField: formattedDepDate ? dayjs(dayjs(formattedDepDate), 'hh:mm A') : null,
          arrivalTime: formattedArrDate,
          arrivalTimeField: formattedArrDate ? dayjs(dayjs(formattedArrDate), 'hh:mm A') : null
        },
        tripOrders
      }
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

    toast.success(platformLabels.Closed)
    invalidate()

    await refetchForm(formik.values.recordId)
  }

  const onReopen = async () => {
    await postRequest({
      extension: DeliveryRepository.Trip.reopen,
      record: JSON.stringify(formik.values.header)
    })

    toast.success(platformLabels.Reopened)
    invalidate()

    await refetchForm(formik.values.recordId)
  }

  useEffect(() => {
    if (recordId) refetchForm(recordId)
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
      onClick: onClose,
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
      disableDuplicate: true,
      props: {
        valueField: 'reference',
        displayField: 'reference',
        displayFieldWidth: 1,
        endpointId: SaleRepository.SalesOrder.snapshot,
        mapping: [
          { from: 'recordId', to: 'soId' },
          { from: 'reference', to: 'soRef' },
          { from: 'date', to: 'date' },
          { from: 'clientId', to: 'clientId' },
          { from: 'clientRef', to: 'clientRef' },
          { from: 'clientName', to: 'clientName' },
          { from: 'volume', to: 'soVolume' },
          { from: 'szName', to: 'szName' },
          { from: 'wipName', to: 'soWipStatusName' }
        ],
        columnsInDropDown: [{ key: 'reference', value: 'Reference' }],
        readOnly: isPosted || isClosed
      },
      onChange({ row: { update, newRow } }) {
        update({
          soDate: newRow.date ? formatDateFromApi(newRow?.date) : null
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
      disabledSubmit={isClosed}
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
                    onChange={async (_, newValue) => {
                      changeDT(newValue)
                      formik.setFieldValue('header.dtId', newValue?.recordId || null)
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
                    onClear={() => formik.setFieldValue('header.departureTime', null)}
                    readOnly={isClosed}
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
                    readOnly={isClosed}
                    displayField={['reference', 'name']}
                    maxAccess={maxAccess}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik.values.header}
                    onChange={(_, newValue) => formik.setFieldValue('header.plantId', newValue?.recordId || null)}
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
                    onClear={() => formik.setFieldValue('header.departureTimeField', null)}
                    readOnly={isClosed}
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
                    readOnly={isClosed}
                    displayField='name'
                    maxAccess={maxAccess}
                    values={formik.values.header}
                    onChange={(_, newValue) => formik.setFieldValue('header.driverId', newValue?.recordId || null)}
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
                    onClear={() => formik.setFieldValue('header.date', null)}
                    readOnly={isClosed}
                    error={formik.touched?.header?.date && Boolean(formik.errors?.header?.date)}
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={4}>
                  <CustomDatePicker
                    name='header.arrivalTime'
                    label={labels.arrivalDate}
                    value={formik.values.header?.arrivalTime}
                    onChange={(_, newValue) => {
                      formik.setFieldValue('header.arrivalTime', newValue)
                      if (!newValue) formik.setFieldValue('header.arrivalTimeField', null)
                    }}
                    onClear={() => formik.setFieldValue('header.arrivalTime', null)}
                    readOnly={isClosed}
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
                    readOnly={isClosed}
                    displayField='name'
                    maxAccess={maxAccess}
                    values={formik.values.header}
                    onChange={(_, newValue) => {
                      formik.setFieldValue('header.vehicleId', newValue?.recordId || null)
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
                    onClear={() => formik.setFieldValue('header.arrivalTimeField', null)}
                    readOnly={isClosed || !formik.values.header?.arrivalTime}
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
                    readOnly={isClosed}
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
            initialValue={initialValues.tripOrders[0]}
            columns={columns}
            maxAccess={maxAccess}
            allowDelete={!isClosed}
            allowAddNewLine={!isClosed}
          />
        </Grow>
        <Fixed>
          <Grid container xs={10} spacing={2}>
            <Grid item xs={5}>
              <CustomNumberField
                name='totalVolume'
                label={labels.totVol}
                maxAccess={maxAccess}
                value={totalVol}
                readOnly
              />
            </Grid>
            <Grid item xs={5}>
              <CustomNumberField
                name='totalWeight'
                label={labels.totalWeight}
                maxAccess={maxAccess}
                value={totalWeight}
                readOnly
              />
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}
