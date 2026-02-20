import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { useError } from '@argus/shared-providers/src/providers/error'
import { useDocumentType } from '@argus/shared-hooks/src/hooks/documentReferenceBehaviors'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { DeliveryRepository } from '@argus/repositories/src/repositories/DeliveryRepository'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { formatDateFromApi, formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'
import { ThreadProgress } from '@argus/shared-ui/src/components/Shared/ThreadProgress'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import CustomButton from '@argus/shared-ui/src/components/Inputs/CustomButton'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import CustomTimePicker from '@argus/shared-ui/src/components/Inputs/CustomTimePicker'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import CustomTextArea from '@argus/shared-ui/src/components/Inputs/CustomTextArea'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { DefaultsContext } from '@argus/shared-providers/src/providers/DefaultsContext'

export default function InboundTranspForm({ labels, maxAccess: access, recordId }) {
    const { getRequest, postRequest } = useContext(RequestsContext)
    const { platformLabels } = useContext(ControlContext)
    const { userDefaults } = useContext(DefaultsContext)
    const { stack } = useWindow()
    const { stack: stackError } = useError()
    const plantId = parseInt(userDefaults?.list?.find(({ key }) => key === 'plantId')?.value) || null

    const { documentType, maxAccess, changeDT } = useDocumentType({
        functionId: SystemFunction.InboundTransportation,
        access,
        enabled: !recordId
    })

    const invalidate = useInvalidate({
        endpointId: DeliveryRepository.InboundTransp.page
    })

    const { formik } = useForm({
        maxAccess,
        initialValues: {
            recordId: null,
            reference: '',
            plantId,
            tripId: null,
            tripRef: '',
            vehicleId: null,
            driverId: null,
            date: new Date(),
            arrivalTime: null,
            convertedArrivalTime: null,
            notes: '',
            dtId: null,
            status: 1,
            items: []
        },
        documentType: { key: 'dtId', value: documentType?.dtId },
        validationSchema: yup.object({
            vehicleId: yup.number().required(),
            driverId: yup.number().required(),
            tripId: yup.number().required(),
            date: yup.date().required()
        }),
        onSubmit: async obj => {
            const extractedHeader = { ...obj }
            delete extractedHeader.items

            const updatedItems = (obj?.items || []).map(item => ({
                ...item,
                deliveryStatus: item.checked ? 3 : 1
            }))

            const response = await postRequest({
                extension: DeliveryRepository.InboundTransp.set2,
                record: JSON.stringify({
                    header: {
                        ...extractedHeader, date: formatDateToApi(extractedHeader.date),
                        arrivalTime: extractedHeader?.arrivalTime ?
                            formatDateToApi(getShiftedDate(extractedHeader.arrivalTime, extractedHeader.convertedArrivalTime)) : null
                    },
                    items: updatedItems
                })
            })

            toast.success(!obj.recordId ? platformLabels.Added : platformLabels.Edited)
            refetchForm(response?.recordId)
            invalidate()
        }
    })

    function getShiftedDate(date, time) {
        const originalDate = dayjs(date).startOf('day')

        if (time) {
            const parsedTime = dayjs(time, 'hh:mm A')

            return originalDate.set('hour', parsedTime.hour()).set('minute', parsedTime.minute())
        }

        return originalDate
    }

    function getTotals(items = []) {
        if (!items.length) return { totalVolume: 0, totalWeight: 0 }

        const { totalWeight, totalVolume } = items.reduce(
            (acc, item) => {
                acc.totalWeight += Number(item?.soWeight) || 0
                acc.totalVolume += Number(item?.soVolume) || 0

                return acc
            },
            { totalWeight: 0, totalVolume: 0 }
        )

        return {
            totalVolume: totalVolume.toFixed(2),
            totalWeight: totalWeight.toFixed(2)
        }
    }

    const isPosted = formik.values.status == 3
    const editMode = !!formik.values.recordId

    async function getInboundTransp(recordId) {
        return await getRequest({
            extension: DeliveryRepository.InboundTransp.get2,
            parameters: `_recordId=${recordId}`
        })
    }

    function formatHeader(data){
        if (!Object.keys(data).length) return {}

        const formattedArrivalDate = data?.arrivalTime
        ? formatDateFromApi(data?.arrivalTime)
        : null

        return {
            ...data,
            date: data?.date ? formatDateFromApi(data?.date) : null,
            arrivalTime: formattedArrivalDate,
            ...(formattedArrivalDate && {
                convertedArrivalTime: dayjs(dayjs(formattedArrivalDate), 'hh:mm A')
            })
        }

    }

    async function refetchForm(recordId) {
        const res = await getInboundTransp(recordId)
        const header = res?.record?.header || {}
        const items = res?.record?.items || []
        fillForm(header, items)
    }

    function fillForm(header = {}, items = []) {
        const formattedHeader = formatHeader(header || {})
        
        const formattedItems = (items || []).map(item => ({
            ...item,
            checked: item?.deliveryStatus == 3 || false
        }))

        const totals = getTotals(items)

        formik.setValues({
            ...formik.values,
            ...formattedHeader,
            items: formattedItems,
            ...totals
        })
    }

    const onPost = async () => {
       const res = await postRequest({
            extension: DeliveryRepository.InboundTransp.post,
            record: JSON.stringify(formik.values)
        })
        toast.success(platformLabels.Posted)     
        await refetchInbound()
        invalidate()

        stack({
        Component: ThreadProgress,
        props: {
            recordId: res?.recordId || null,
            onComplete: async () => { await refetchOrders() }
        },
        closable: false
        })
        
    }

    const onUnpost = async () => {
      const res = await postRequest({
        extension: DeliveryRepository.InboundTransp.unpost,
        record: JSON.stringify(formik.values)
      })

      toast.success(platformLabels.Unposted)
      refetchForm(res?.recordId)
      invalidate()
    }

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
        }
    ]

    const columns = [
        {
            field: 'soRef',
            headerName: labels.reference,
            flex: 1
        },
        {
            field: 'soDate',
            headerName: labels.date,
            flex: 1,
            type: 'date'
        },
        {
            field: 'clientName',
            headerName: labels.client,
            flex: 1,
        },
        {
            field: 'szName',
            headerName: labels.salesZone,
            flex: 1
        },
        {
            field: 'soVolume',
            headerName: labels.volume,
            flex: 1,
            type: 'number'
        },
        {
            field: 'qty',
            headerName: labels.qty,
            flex: 1,
            type: 'number'
        },
        {
            field: 'deliveredQty',
            headerName: labels.deliveredQty,
            flex: 1,
            type: 'number'
        },
        {
            field: 'deliveryStatusName',
            headerName: labels.deliveryStatus,
            flex: 1
        },
        {
            field: 'isNotified',
            headerName: labels.isNotified,
            type: 'checkbox',
            flex: 1
        },
    ]

    function resetGrid(){
        formik.setFieldValue('totalWeight', 0)
        formik.setFieldValue('totalVolume', 0)
        formik.setFieldValue('items', [])
    }

    async function loadTripOrders() {
        if (!formik.values.tripId) {
            resetGrid()

            return
        }
        
        const res = await getRequest({
            extension: DeliveryRepository.TripOrder.qry,
            parameters: `_tripId=${formik.values.tripId}`
        })

        if (!res?.list.length) {
            stackError({
                message: labels.noOrders
            })
            formik.setFieldValue('totalWeight', 0)
            formik.setFieldValue('totalVolume', 0)
            formik.setFieldValue('tripId', null)
            formik.setFieldValue('tripRef', '')

            return
        }

        const totals = getTotals(res?.list)

        formik.setValues({
            ...formik.values,
            items: (res?.list || []).map(item => ({ ...item, qty:item?.soQty || 0 })),
            ...totals
        })
    }

    async function refetchInbound() {
     if (!formik.values.recordId) return
    
     const res = await getRequest({
        extension: DeliveryRepository.InboundTransp.get,
        parameters: `_recordId=${formik.values.recordId}`
     })

     const formattedHeader = formatHeader(res?.record || {})

     formik.setValues(prev => {
        const { items, totalVolume, totalWeight, ...otherFields } = prev

        return {
            ...otherFields,
            ...formattedHeader,
            items,
            totalVolume,
            totalWeight
        }
     })
    }

   async function refetchOrders() {
    if (!formik.values.recordId) {
        resetGrid()
        
        return
    }

    const res = await getRequest({
        extension: DeliveryRepository.InboundOrders.qry,
        parameters: `_inboundId=${formik.values.recordId}`
    })

    const totals = getTotals(res?.list)

    formik.setValues(prev => ({
        ...prev,
        items: (res?.list || []).map(item => ({
        ...item,
        checked: item?.deliveryStatus == 3 || false
        })),
        ...totals
    }))
   }


    useEffect(() => {
        if (recordId) refetchForm(recordId)
    }, [])

    return (
        <FormShell
            resourceId={ResourceIds.InboundTransportation}
            form={formik}
            maxAccess={maxAccess}
            editMode={editMode}
            actions={actions}
            functionId={SystemFunction.InboundTransportation}
            disabledSubmit={isPosted}
            previewReport={editMode}
        >
            <VertLayout>
                <Fixed>
                    <Grid container spacing={2}>
                        <Grid item xs={4}>
                            <ResourceComboBox
                                endpointId={DeliveryRepository.InboundTransp.pack}
                                reducer={response => response?.record?.documentTypes}
                                filter={!editMode ? item => item.activeStatus == 1 : undefined}
                                name='dtId'
                                label={labels.docType}
                                readOnly={editMode}
                                valueField='recordId'
                                displayField='name'
                                values={formik.values}
                                onChange={async (_, newValue) => {
                                    formik.setFieldValue('dtId', newValue?.recordId || null)
                                    changeDT(newValue)
                                }}
                                error={formik.touched.dtId && Boolean(formik.errors.dtId)}
                                maxAccess={maxAccess}
                            />
                        </Grid>
                        <Grid item xs={3}>
                            <ResourceLookup
                                endpointId={DeliveryRepository.Trip.snapshot2}
                                valueField='reference'
                                displayField='name'
                                secondFieldLabel={labels.name}
                                name='tripId'
                                label={labels.trip}
                                form={formik}
                                required
                                valueShow='tripRef'
                                readOnly={isPosted || editMode}
                                secondDisplayField={false}
                                maxAccess={maxAccess}
                                onChange={async (_, newValue) => {
                                    formik.setFieldValue('tripId', newValue?.recordId || null)
                                    formik.setFieldValue('tripRef', newValue?.reference || '')
                                    formik.setFieldValue('driverId', newValue?.driverId || null)
                                    formik.setFieldValue('vehicleId', newValue?.vehicleId || null)
                                }}
                                errorCheck={'tripId'}
                            />
                        </Grid>
                        <Grid item xs={1}>
                            <CustomButton
                                onClick={loadTripOrders}
                                image={'preview.png'}
                                tooltipText={platformLabels.Preview}
                                disabled={isPosted || !formik.values.tripId || editMode}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <ResourceComboBox
                                endpointId={DeliveryRepository.InboundTransp.pack}
                                reducer={response => response?.record?.plants}
                                name='plantId'
                                label={labels.plant}
                                valueField='recordId'
                                readOnly={isPosted}
                                displayField={['reference', 'name']}
                                columnsInDropDown={[
                                    { key: 'reference', value: 'Reference' },
                                    { key: 'name', value: 'Name' }
                                ]}
                                values={formik.values}
                                maxAccess={maxAccess}
                                onChange={(_, newValue) =>
                                    formik.setFieldValue('plantId', newValue?.recordId || null)
                                }
                                error={formik.touched.plantId && Boolean(formik.errors.plantId)}
                            />
                        </Grid>
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
                            <CustomDatePicker
                                name='arrivalTime'
                                label={labels.arrivalDate}
                                value={formik.values?.arrivalTime}
                                onChange={(_, newValue) => {
                                    formik.setFieldValue('arrivalTime', newValue)
                                    if (!newValue) formik.setFieldValue('convertedArrivalTime', '')
                                }}
                                onClear={() => formik.setFieldValue('arrivalTime', '')}
                                readOnly={isPosted}
                                maxAccess={maxAccess}
                                error={formik.touched.arrivalTime && Boolean(formik.errors.arrivalTime)}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <ResourceComboBox
                                endpointId={DeliveryRepository.InboundTransp.pack}
                                reducer={response => response?.record?.drivers}
                                name='driverId'
                                label={labels.driver}
                                valueField='recordId'
                                readOnly
                                displayField='name'
                                values={formik.values}
                                maxAccess={maxAccess}
                                required
                                onChange={(_, newValue) => {
                                    formik.setFieldValue('driverId', newValue?.recordId || null)
                                }}
                                error={formik.touched.driverId && Boolean(formik.errors.driverId)}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <CustomDatePicker
                                name='date'
                                label={labels.date}
                                value={formik.values.date}
                                onChange={formik.setFieldValue}
                                onClear={() => formik.setFieldValue('date', null)}
                                readOnly={isPosted}
                                required
                                error={formik.touched.date && Boolean(formik.errors.date)}
                                maxAccess={maxAccess}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <CustomTimePicker
                                label={labels.arrivalTime}
                                name='convertedArrivalTime'
                                value={formik.values?.convertedArrivalTime}
                                onChange={formik.setFieldValue}
                                onClear={() => formik.setFieldValue('convertedArrivalTime', '')}
                                readOnly={isPosted || !formik.values?.arrivalTime}
                                maxAccess={maxAccess}
                                error={formik.touched.convertedArrivalTime && Boolean(formik.errors.convertedArrivalTime)}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <ResourceComboBox
                                endpointId={DeliveryRepository.InboundTransp.pack}
                                reducer={response => response?.record?.vehicles}
                                name='vehicleId'
                                label={labels.vehicle}
                                valueField='recordId'
                                displayField='name'
                                values={formik.values}
                                readOnly
                                maxAccess={maxAccess}
                                required
                                onChange={(_, newValue) =>
                                    formik.setFieldValue('vehicleId', newValue?.recordId || null)
                                }
                                error={formik.touched.vehicleId && Boolean(formik.errors.vehicleId)}
                            />
                        </Grid>
                    </Grid>
                </Fixed>
                <Grow>
                    <Table
                        name='ItemsTable'
                        columns={columns}
                        gridData={{ list: formik.values.items || [] }}
                        rowId={['soId']}
                        pagination={false}
                        maxAccess={maxAccess}
                        showSelectAll={true}
                        showCheckboxColumn={true}
                        disable={(data) => data.isNotified}
                        disableCheckBox={isPosted}
                    />
                </Grow>
                <Fixed>
                    <Grid container xs={12} spacing={2} sx={{ pt: 2 }}>
                        <Grid item xs={6}>
                            <CustomTextArea
                                name='notes'
                                label={labels.notes}
                                value={formik.values.notes}
                                readOnly={isPosted}
                                maxAccess={maxAccess}
                                onChange={e => formik.setFieldValue('notes', e.target.value)}
                                onClear={() => formik.setFieldValue('notes', '')}
                                error={formik.touched.notes && Boolean(formik.errors.notes)}
                            />
                        </Grid>
                        <Grid item xs={3}>
                            <CustomNumberField
                                name='totalVolume'
                                label={labels.totVol}
                                value={formik.values.totalVolume}
                                readOnly
                            />
                        </Grid>
                        <Grid item xs={3}>
                            <CustomNumberField
                                name='totalWeight'
                                label={labels.totalWeight}
                                value={formik.values.totalWeight}
                                readOnly
                            />
                        </Grid>
                    </Grid>
                </Fixed>
            </VertLayout>
        </FormShell>
    )
}
