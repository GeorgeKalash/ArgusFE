import { useState, useContext, useEffect } from 'react'
import toast from 'react-hot-toast'
import * as yup from 'yup'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { RequestsContext } from 'src/providers/RequestsContext'
import Table from 'src/components/Shared/Table'
import { useResourceQuery } from 'src/hooks/resource'
import { Grid, Button } from '@mui/material'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useForm } from 'src/hooks/form'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import FormShell from 'src/components/Shared/FormShell'
import { ControlContext } from 'src/providers/ControlContext'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { DeliveryRepository } from 'src/repositories/DeliveryRepository'
import { SaleRepository } from 'src/repositories/SaleRepository'
import CustomCheckBox from 'src/components/Inputs/CustomCheckBox'
import OutboundTranspForm from '../outbound-transportation/forms/OutboundTranspForm'
import { useWindow } from 'src/windows'
import ConfirmationDialog from 'src/components/ConfirmationDialog'

const GenerateOutboundTransportation = () => {
  const [data, setData] = useState([])
  const [deliveryOrders, setDeliveryOrders] = useState({ list: [] })
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  const { labels, access } = useResourceQuery({
    datasetId: ResourceIds.GenerateTrip
  })

  const { labels: _labels, access: maxAccess } = useResourceQuery({
    datasetId: ResourceIds.Trip
  })

  const { formik } = useForm({
    initialValues: {
      vehicleId: null,
      driverId: null,
      szId: null,
      capacity: 0,
      balance: null,
      volume: 0
    },
    validationSchema: yup.object({
      driverId: yup.number().required(),
      vehicleId: yup.number().required()
    }),
    maxAccess: access,
    enableReinitialize: true,
    validateOnChange: true,
    onSubmit: async obj => {
      const data = {
        vehicleId: obj.vehicleId,
        driverId: obj.driverId,
        tripOrderIDs: deliveryOrders.list.map(order => order.recordId)
      }

      const res = await postRequest({
        extension: DeliveryRepository.Trip.generate,
        record: JSON.stringify(data)
      })

      if (res.recordId) {
        await openForm(res.recordId)
        resetForm()
        toast.success(platformLabels.Generated)
      }
    }
  })

  const resetForm = () => {
    formik.setValues({
      ...formik.values,
      volume: 0,
      capacity: 0,
      amount: null,
      balance: null
    })
    setDeliveryOrders({ list: [] })
  }

  async function openForm(recordId) {
    stack({
      Component: OutboundTranspForm,
      props: {
        labels: _labels,
        recordId,
        maxAccess
      },
      width: 1300,
      height: 700,
      title: _labels.outboundTransp
    })
  }

  const onRowCheckboxChange = (row, checked) => {
    if (checked) {
      setDeliveryOrders(prev => {
        const itemToAdd = data.list.find(item => item.recordId === row.recordId)
        if (!itemToAdd) return prev

        return {
          ...prev,
          list: [...(prev?.list || []), itemToAdd],
          count: (prev?.list?.length || 0) + 1
        }
      })

      setData(prev => ({
        ...prev,
        list: prev?.list?.filter(item => item.recordId !== row.recordId) || [],
        count: (prev?.list?.length || 0) - 1
      }))
    } else {
      setData(prev => {
        const itemToAdd = deliveryOrders.list.find(item => item.recordId === row.recordId)
        if (!itemToAdd || itemToAdd.szId !== formik.values.szId) return prev

        return {
          ...prev,
          list: [...(prev?.list || []), itemToAdd],
          count: (prev?.list?.length || 0) + 1
        }
      })

      setDeliveryOrders(prev => ({
        ...prev,
        list: prev?.list?.filter(item => item.recordId !== row.recordId) || [],
        count: (prev?.list?.length || 0) - 1
      }))
    }
  }

  const onPreview = async szId => {
    const orders = await getRequest({
      extension: DeliveryRepository.GenerateTrip.undelivered,
      parameters: `_szId=${szId || 0}`
    })

    if (!orders || !orders.list) {
      return
    }

    const filteredOrders = {
      ...orders,
      list:
        orders.list.filter(
          order => !deliveryOrders?.list?.some(deliveredOrder => deliveredOrder.recordId === order.recordId)
        ) || []
    }

    setData({
      ...filteredOrders,
      list: filteredOrders.list,
      count: filteredOrders.list.length
    })
  }

  const totalVolume = deliveryOrders?.list?.reduce((sum, order) => sum + (order.volume || 0), 0) || 0
  const totalAmount = deliveryOrders?.list?.reduce((sum, order) => sum + (order.amount || 0), 0) || 0
  const balance = formik.values.capacity - totalVolume

  const Confirmation = (row, value) => {
    stack({
      Component: ConfirmationDialog,
      props: {
        DialogText: platformLabels.UncheckConf,
        okButtonAction: () => onRowCheckboxChange(row, value),
        fullScreen: false,
        close: true
      },
      width: 400,
      height: 150,
      title: platformLabels.Confirmation
    })
  }

  const columnsOrders = [
    {
      width: 50,
      cellRenderer: row => (
        <CustomCheckBox
          name='checked'
          value={deliveryOrders.list.some(item => item.recordId === row.data.recordId)}
          onChange={e => onRowCheckboxChange(row.data, e.target.value)}
        />
      )
    },
    {
      field: 'date',
      headerName: labels.date,
      type: 'date',
      width: 130
    },
    {
      field: 'reference',
      headerName: labels.reference,
      width: 130
    },
    {
      field: 'spName',
      headerName: labels.salesPerson,
      width: 200
    },
    {
      field: 'szName',
      headerName: labels.zone,
      width: 200
    },
    {
      field: 'clientName',
      headerName: labels.client,
      width: 280
    },
    {
      field: 'amount',
      headerName: labels.amount,
      type: 'number',
      width: 130
    },
    {
      field: 'volume',
      headerName: labels.volume,
      type: 'number',
      width: 130
    },
    {
      field: 'notes',
      headerName: labels.notes,
      flex: 1
    }
  ]

  const columnsDeliveryOrders = [
    {
      width: 50,
      cellRenderer: row => (
        <CustomCheckBox name='checked' value={true} onChange={e => Confirmation(row.data, e.target.checked)} />
      )
    },
    {
      field: 'date',
      headerName: labels.date,
      type: 'date',
      width: 130
    },
    {
      field: 'reference',
      headerName: labels.reference,
      width: 130
    },
    {
      field: 'spName',
      headerName: labels.salesPerson,
      width: 200
    },
    {
      field: 'szName',
      headerName: labels.zone,
      width: 200
    },
    {
      field: 'clientName',
      headerName: labels.client,
      width: 280
    },
    {
      field: 'amount',
      headerName: labels.amount,
      type: 'number',
      width: 130
    },
    {
      field: 'volume',
      headerName: labels.volume,
      type: 'number',
      width: 130
    },
    {
      field: 'notes',
      headerName: labels.notes,
      flex: 1
    }
  ]

  useEffect(() => {
    if (formik.values.vehicleId || formik.values?.szId) onPreview(formik.values?.szId)
  }, [formik.values.szId])

  return (
    <FormShell
      resourceId={ResourceIds.GenerateTrip}
      form={formik}
      maxAccess={access}
      isCleared={false}
      isSaved={false}
      infoVisible={false}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={3}>
              <ResourceComboBox
                endpointId={DeliveryRepository.Vehicle.qry}
                name='vehicleId'
                label={labels.truck}
                valueField='recordId'
                displayField={['plateNo', 'name']}
                columnsInDropDown={[
                  { key: 'plateNo', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('vehicleId', newValue?.recordId)
                  formik.setFieldValue('capacity', newValue?.capacityVolume)
                }}
                required
                error={formik.touched.vehicleId && Boolean(formik.errors.vehicleId)}
                maxAccess={access}
              />
            </Grid>
            <Grid item xs={3}>
              <ResourceComboBox
                endpointId={DeliveryRepository.Driver.qry}
                name='driverId'
                label={labels.driver}
                valueField='recordId'
                displayField={'name'}
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('driverId', newValue?.recordId || null)
                }}
                required
                error={formik.touched.driverId && Boolean(formik.errors.driverId)}
                maxAccess={access}
              />
            </Grid>
            <Grid item xs={3}>
              <CustomNumberField
                name='volume'
                label={labels.volume}
                value={totalVolume}
                readOnly
                error={formik.touched.volume && Boolean(formik.errors.volume)}
              />
            </Grid>
            <Grid item xs={3}>
              <CustomNumberField name='capacity' label={labels.capacity} value={formik.values.capacity} readOnly />
            </Grid>
            <Grid item xs={6}>
              <ResourceComboBox
                endpointId={SaleRepository.SalesZone.qry}
                parameters={`_startAt=0&_pageSize=1000&_sortField="recordId"&_filter=`}
                name='szId'
                label={labels.saleZone}
                valueField='recordId'
                displayField={['szRef', 'name']}
                columnsInDropDown={[
                  { key: 'szRef', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('szId', newValue?.recordId || null)
                  if (formik.values.vehicleId) onPreview(newValue?.recordId)
                }}
                error={formik.touched.szId && Boolean(formik.errors.szId)}
                maxAccess={access}
              />
            </Grid>
            <Grid item xs={3}>
              <CustomNumberField name='balance' label={labels.balance} value={balance} readOnly />
            </Grid>
            <Grid item xs={3}>
              <CustomNumberField name='amount' label={labels.amount} value={totalAmount} readOnly />
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <Table
            columns={columnsOrders}
            gridData={data}
            rowId={['recordId']}
            isLoading={false}
            pagination={false}
            maxAccess={access}
          />
        </Grow>
        <Grow>
          <Table
            columns={columnsDeliveryOrders}
            gridData={deliveryOrders}
            rowId={['recordId']}
            isLoading={false}
            pagination={false}
            maxAccess={access}
          />
        </Grow>
        <Grid item mt={2} display={'flex'} justifyContent={'flex-end'}>
          <Button
            onClick={() => formik.handleSubmit()}
            variant='contained'
            sx={{
              mr: 1,
              backgroundColor: '#231f20',
              '&:hover': {
                backgroundColor: '#231f20',
                opacity: 0.8
              },
              width: '85px !important',
              height: '40px',
              objectFit: 'contain',
              minWidth: '30px !important'
            }}
          >
            {platformLabels.Generate}
          </Button>
        </Grid>
      </VertLayout>
    </FormShell>
  )
}

export default GenerateOutboundTransportation
