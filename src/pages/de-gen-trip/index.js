import { useState, useContext } from 'react'
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
import OutboundTranspForm from '../outbound-transportation/forms/OutboundTranspForm'
import { useWindow } from 'src/windows'
import ConfirmationDialog from 'src/components/ConfirmationDialog'

const GenerateOutboundTransportation = () => {
  const [data, setData] = useState({ list: [] })
  const [deliveryOrders, setDeliveryOrders] = useState({ list: [] })
  const [salesZones, setSalesZones] = useState({ list: [] })
  const [selectedSaleZones, setSelectedSaleZones] = useState('')
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels, userDefaultsData } = useContext(ControlContext)
  const { stack } = useWindow()

  const { labels, access } = useResourceQuery({
    datasetId: ResourceIds.GenerateTrip
  })

  const { labels: _labels, access: maxAccess } = useResourceQuery({
    datasetId: ResourceIds.Trip
  })

  const getPlantId = async () => {
    const defaultPlant = userDefaultsData?.list?.find(({ key }) => key === 'plantId')

    return defaultPlant?.value ? parseInt(defaultPlant.value) : null
  }

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
      const plantId = await getPlantId()

      const data = {
        vehicleId: obj.vehicleId,
        driverId: obj.driverId,
        plantId,
        tripOrderIDs: deliveryOrders.list.map(order => order.recordId)
      }

      const res = await postRequest({
        extension: DeliveryRepository.Trip.generate,
        record: JSON.stringify(data)
      })

      if (res.recordId) {
        await openForm(res.recordId)
        formik.setValues({
          ...formik.values,
          volume: 0,
          capacity: 0,
          amount: null,
          balance: null
        })
        setDeliveryOrders({ list: [] })
        toast.success(platformLabels.Generated)
      }
    }
  })

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

  const onSelectCheckBox = (row, checked) => {
    if (checked) {
      setTotalAmountFromChecked(prev => prev + row.amount)
      setTotalVolumeFromChecked(prev => prev + row.volume)
    } else {
      const selectedIds = selectedSaleZones ? selectedSaleZones.split(',') : []
  
      setData(prev => {
        const itemToAdd = deliveryOrders.list.find(item => item.recordId == row.recordId)
        
        if (!itemToAdd || !selectedIds.includes(String(itemToAdd.szId))) return prev
  
        return {
          ...prev,
          list: [...(prev?.list || []), itemToAdd],
          count: (prev?.list?.length || 0) + 1
        }
      })

      setDeliveryOrders(prev => ({
        ...prev,
        list: prev?.list?.filter(item => item.recordId !== row.recordId) || [],
        count: Math.max((prev?.list?.length || 0) - 1, 0)
      }))
    }
  }

  const [totalVolumeFromChecked, setTotalVolumeFromChecked] = useState(0)
  const [totalAmountFromChecked, setTotalAmountFromChecked] = useState(0)

  const onRowCheckboxChange = (data, checked) => {
    if (Array.isArray(data)) {
      data.forEach(row => {
        onSelectCheckBox(row, checked)
      })
    } else {
      onSelectCheckBox(data, checked)
    }
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
      onClose: () => {
        const updatedData = deliveryOrders.list.map(item =>
          item.recordId == row.recordId ? { ...item, checked: true } : item
        )

        setDeliveryOrders(prev => ({
          ...prev,
          list: updatedData,
        }))
      },
      width: 400,
      height: 150,
      title: platformLabels.Confirmation
    })
  }

  const columnsZones = [
    {
      field: 'szRef',
      headerName: labels.ref,
      wrapText: true,
      autoHeight: true,
      width: 70
    },
    {
      field: 'name',
      headerName: labels.name,
      wrapText: true,
      autoHeight: true,
      flex: 1
    }
  ]

  const columnsOrders = [
    {
      field: 'date',
      headerName: labels.date,
      type: 'date',
      width: 120
    },
    {
      field: 'reference',
      headerName: labels.reference,
      width: 130
    },
    {
      field: 'spName',
      headerName: labels.salesPerson,
      width: 130,
      wrapText: true,
      autoHeight: true,
    },
    {
      field: 'szName',
      headerName: labels.zone,
      width: 120,
      wrapText: true,
      autoHeight: true,
    },
    {
      field: 'clientName',
      headerName: labels.client,
      wrapText: true,
      autoHeight: true,
      width: 130
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
      width: 130,
      wrapText: true,
      autoHeight: true,
    },
    {
      field: 'szName',
      headerName: labels.zone,
      width: 120,
      wrapText: true,
      autoHeight: true,
    },
    {
      field: 'clientName',
      headerName: labels.client,
      wrapText: true,
      autoHeight: true,
      width: 130
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

  const onSaleZoneChange = async szId => {
    const salesZones = await getRequest({
      extension: DeliveryRepository.GenerateTrip.firstLevel,
      parameters: `_szId=${szId || 0}`
    })

    if (!salesZones?.list) {
      return
    }

    setSalesZones({
      ...salesZones,
      list: salesZones.list,
      count: salesZones.list.length
    })
  }

  const onSaleZoneCheckbox = (row, checked) => {
    const { recordId } = row

    setSelectedSaleZones(prev => {
      const ids = prev ? prev.split(',') : [];
  
      let updatedIds;
      if (checked) {
        updatedIds = [...new Set([...ids, recordId])]; 
      } else {
        updatedIds = ids.filter((id) => id != recordId)
      }
  
      return updatedIds.join(',')
    })
  }

  const onUndelivered = async szIds => {
    const items = await getRequest({
      extension: DeliveryRepository.GenerateTrip.undelivered2,
      parameters: `_szIds=${szIds || 0}`
    })

    if (!items?.list) {
      return
    }

    if (data?.list?.length > 0) {
      setData(prev => {
        const existingDeliveryOrderIds = new Set(deliveryOrders.list.map(item => item.recordId))
    
        const newItems = items.list.filter(item => 
          !existingDeliveryOrderIds.has(item.recordId)
        );
    
        return {
          ...prev,
          list: newItems, 
          count: prev.list.length + newItems.length
        }
      })
    } else {
      setData({
        ...items,
        list: items.list,
        count: items.list.length
      })

    }
    
  };
  
  const onAdd = () => {
    const selectedRows = data?.list?.filter(item => item.checked)
    setTotalVolumeFromChecked(0)
    setTotalAmountFromChecked(0)
    setDeliveryOrders(prev => ({
      ...prev,
      list: [...(prev?.list || []), ...selectedRows],
      count: (prev?.list?.length || 0) + selectedRows.length
    }))

    setData(prev => ({
      ...prev,
      list: prev?.list?.filter(item => !item.checked) || [],
      count: (prev?.list?.length || 0) - selectedRows.length
    }))
  }

  return (
    <FormShell
      resourceId={ResourceIds.GenerateTrip}
      form={formik}
      maxAccess={access}
      isCleared={false}
      isSaved={false}
      infoVisible={false}
    >
      <Grid container sx={{ flex: 1 }}>
        <Grid item xs={2.5} sx={{ display: 'flex', flex: 1, marginRight: 1 }}>
          <VertLayout>
            <Fixed>
              <Grid item xs={8}>
                <ResourceComboBox
                  endpointId={DeliveryRepository.GenerateTrip.root}
                  parameters={`_startAt=0&_pageSize=1000&_sortField="recordId"&_filter=`}
                  name='szId'
                  label={labels.saleZone}
                  valueField='recordId'
                  displayField={'name'}
                  values={formik.values}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('szId', newValue?.recordId || null)
                    onSaleZoneChange(newValue?.recordId)
                  }}
                  error={formik.touched.szId && Boolean(formik.errors.szId)}
                  maxAccess={access}
                />
              </Grid>
            </Fixed>

            <Grow>
              <Table
                columns={columnsZones}
                gridData={salesZones}
                rowId={['recordId']}
                isLoading={false}
                pagination={false}
                maxAccess={access}
                showCheckboxColumn={true}
                handleCheckboxChange={onSaleZoneCheckbox}
              />
            </Grow>
            <Grid item mt={2} display={'flex'} justifyContent={'flex-end'}>
              <Button
                onClick={() => onUndelivered(selectedSaleZones)}
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
                {platformLabels.Preview}
              </Button>
            </Grid>
          </VertLayout>
        </Grid>
        <Grid item xs={9.4} sx={{ display: 'flex', flex: 1, marginLeft: 1 }}>
          <VertLayout>
            <Fixed>
              <Grid container spacing={2}>
                <Grid container xs={6} pl={2} spacing={2}>
                  <Grid item xs={6}>
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
                        formik.setFieldValue('vehicleId', newValue?.recordId || null)
                        formik.setFieldValue('capacity', newValue?.capacityVolume || null)
                      }}
                      required
                      error={formik.touched.vehicleId && Boolean(formik.errors.vehicleId)}
                      maxAccess={access}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <CustomNumberField name='balance' label={labels.balance} value={balance} readOnly />
                  </Grid>
                  <Grid item xs={6}>
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
                  <Grid item xs={6}>
                    <CustomNumberField
                      name='capacity'
                      label={labels.capacity}
                      value={formik.values.capacity}
                      readOnly
                    />
                  </Grid>
                </Grid>
                <Grid item xs={6} container alignItems='flex-end' justifyContent='flex-end'>
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
                showCheckboxColumn={true}
                handleCheckboxChange={onRowCheckboxChange}
              />
            </Grow>
            <Grid container pt={2} spacing={2}>
              <Grid item xs={3}>
                <Button
                  onClick={onAdd}
                  variant='contained'
                  sx={{
                    backgroundColor: '#231f20',
                    '&:hover': {
                      backgroundColor: '#231f20',
                      opacity: 0.8
                    },
                    width: '30px !important',
                    height: '40px',
                    objectFit: 'contain',
                    minWidth: '30px !important'
                  }}
                >
                  <img src='/images/buttonsIcons/import.png' alt={platformLabels.Import} />
                </Button>
              </Grid>
              <Grid item xs={5}></Grid>
              <Grid item xs={3}>
                <Grid container spacing={2}>
                  <Grid item xs={5}>
                    <CustomNumberField name='amount' label={labels.amount} value={totalAmountFromChecked} readOnly />
                  </Grid>
                  <Grid item xs={5}>
                    <CustomNumberField name='volume' label={labels.volume} value={totalVolumeFromChecked} readOnly />
                  </Grid>
                </Grid>
                <Grid item xs={2}></Grid>
              </Grid>
            </Grid>

            <Grow>
              <Table
                columns={columnsDeliveryOrders}
                gridData={deliveryOrders}
                rowId={['recordId']}
                isLoading={false}
                pagination={false}
                maxAccess={access}
                showCheckboxColumn={true}
                handleCheckboxChange={Confirmation}
                showSelectAll={false}
              />
            </Grow>
            <Grid container pt={2} spacing={2}>
              <Grid item xs={8}></Grid>
              <Grid item xs={3}>
                <Grid container spacing={2}>
                  <Grid item xs={5}>
                    <CustomNumberField name='amount' label={labels.amount} value={totalAmount} readOnly />
                  </Grid>
                  <Grid item xs={5}>
                    <CustomNumberField name='volume' label={labels.volume} value={totalVolume} readOnly />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </VertLayout>
        </Grid>
      </Grid>
    </FormShell>
  )
}

export default GenerateOutboundTransportation
