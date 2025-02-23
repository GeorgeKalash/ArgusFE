import { useState, useContext, useMemo, useEffect } from 'react'
import toast from 'react-hot-toast'
import * as yup from 'yup'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { RequestsContext } from 'src/providers/RequestsContext'
import Table from 'src/components/Shared/Table'
import { useResourceQuery } from 'src/hooks/resource'
import { Grid } from '@mui/material'
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
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomButton from 'src/components/Inputs/CustomButton'
import { DataGrid } from 'src/components/Shared/DataGrid'

const GenerateOutboundTransportation = () => {
  const [selectedSaleZones, setSelectedSaleZones] = useState([])
  const [selectedSaleZonesIds, setSelectedSaleZonesIds] = useState('')
  const [selectedTrucks, setSelectedTrucks] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [trucks, setTrucks] = useState([])
  const [reCalc, setReCalc] = useState(false)
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels, userDefaultsData } = useContext(ControlContext)
  const { stack } = useWindow()

  const { labels, access } = useResourceQuery({
    datasetId: ResourceIds.GenerateTrip
  })

  const { labels: _labels, access: maxAccess } = useResourceQuery({
    datasetId: ResourceIds.Trip
  })

  const plantId = parseInt(userDefaultsData?.list?.find(({ key }) => key === 'plantId')?.value)

  const { formik } = useForm({
    initialValues: {
      search: '',
      vehicleId: null,
      driverId: null,
      szId: null,
      capacity: 0,
      balance: 0,
      volume: 0,
      totalAmount: 0,
      totalVolume: 0,
      truckNo: 0,
      selectedTrucks: [
        {
          id: 1,
          no: 1,
          volume: 0
        }
      ],
      vehicleOrders: { list: [] },
      deliveryOrders: { list: [] },
      data: { list: [] },
      salesZones: { list: [] }
    },
    validationSchema: yup.object({
      vehicleId: yup.number().required()
    }),
    maxAccess: access,
    enableReinitialize: true,
    validateOnChange: true,
    onSubmit: async obj => {
      const data = {
        vehicleId: obj.vehicleId,
        driverId: obj.driverId,
        plantId,
        tripOrderIDs: obj.deliveryOrders.list.map(order => order.recordId)
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
          amount: 0,
          balance: 0
        })
        formik.setFieldValue('deliveryOrders', { list: [] })
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
    if (!checked) {
      const selectedIds = selectedSaleZonesIds ? selectedSaleZonesIds.split(',') : []
      let modifiedData = [...(formik?.values?.data?.list?.length > 0 ? formik.values.data.list : [])]

      const itemToAdd = formik?.values?.deliveryOrders?.list?.find(item => item.recordId == row.recordId)

      if (itemToAdd && selectedIds.includes(String(itemToAdd.szId))) {
        modifiedData.push(itemToAdd)
      }

      formik.setFieldValue('data', { list: modifiedData })

      const updatedDeliveryOrders = {
        ...formik?.values?.deliveryOrders,
        list: (formik?.values?.deliveryOrders?.list || []).filter(item => item.recordId !== row.recordId)
      }

      formik.setFieldValue('deliveryOrders', updatedDeliveryOrders)
    }
  }

  function totalAmountFromChecked() {
    return (
      formik?.values?.data?.list.reduce((amountSum, row) => {
        let amountValue = 0
        if (row.checked) {
          amountValue = parseFloat(row?.amount?.toString().replace(/,/g, '')) || 0
        }

        return amountSum + amountValue
      }, 0) || 0
    )
  }

  function totalVolumeFromChecked() {
    return (
      formik?.values?.data?.list.reduce((volumeSum, row) => {
        let volumeValue = 0

        if (row.checked) {
          volumeValue = parseFloat(row?.volume?.toString().replace(/,/g, '')) || 0
        }

        return volumeSum + volumeValue
      }, 0) || 0
    )
  }

  const onRowCheckboxChange = (data, checked) => {
    setReCalc(true)
    if (Array.isArray(data)) {
      data.forEach(row => {
        onSelectCheckBox(row, checked)
      })
    } else {
      onSelectCheckBox(data, checked)
    }
  }

  const getAllTrucks = async () => {
    const trucks = await getRequest({
      extension: DeliveryRepository.Vehicle.qry,
      parameters: ``
    })

    if (!trucks?.list) {
      return
    }

    setTrucks(trucks)
  }

  useEffect(() => {
    if (reCalc) {
      const totalAmountValue = totalAmountFromChecked()
      const totalVolumeValue = totalVolumeFromChecked()
      formik.setFieldValue('totalAmount', totalAmountValue)
      formik.setFieldValue('totalVolume', totalVolumeValue)
      setReCalc(false)
    }
  }, [reCalc])

  useEffect(() => {
    getAllTrucks()
  }, [])

  const totalVolume = formik?.values?.deliveryOrders?.list?.reduce((sum, order) => sum + (order.volume || 0), 0) || 0
  const totalAmount = formik?.values?.deliveryOrders?.list?.reduce((sum, order) => sum + (order.amount || 0), 0) || 0
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
        const updatedData = formik?.values?.deliveryOrders?.list.map(item =>
          item.recordId == row.recordId ? { ...item, checked: true } : item
        )

        const updatedDeliveryOrders = {
          ...formik.values.deliveryOrders,
          list: updatedData
        }

        formik.setFieldValue('deliveryOrders', updatedDeliveryOrders)
      },
      width: 400,
      height: 150,
      title: platformLabels.Confirmation
    })
  }

  const columnsZones = [
    {
      field: 'name',
      headerName: labels.name,
      wrapText: true,
      autoHeight: true,
      flex: 1
    }
  ]

  const columnsSelectedZones = [
    {
      field: 'name',
      headerName: labels.name,
      wrapText: true,
      autoHeight: true,
      flex: 1,
      rowDrag: true
    }
  ]

  const columnsTrucks = [
    {
      component: 'numberfield',
      name: 'no',
      label: labels.No,
      flex: 1
    },
    {
      component: 'numberfield',
      name: 'volume',
      label: labels.allocatedVolume,
      flex: 2
    }
  ]

  const columnsSelectedTrucks = [
    {
      field: 'plateNo',
      headerName: labels.plateNo,
      flex: 1
    },
    {
      field: 'allocatedVolume',
      headerName: labels.allocatedVolume,
      type: 'number',
      flex: 1
    },
    {
      field: 'volume',
      headerName: labels.volume,
      type: 'number',
      flex: 1
    },
    {
      field: 'notes',
      headerName: labels.notes,
      flex: 1
    }
  ]

  const columnsSalesOrders = [
    {
      field: 'vehicle',
      headerName: labels.truck,
      width: 130
    },
    {
      field: 'orderDate',
      headerName: labels.orderDate,
      type: 'date',
      width: 130
    },
    {
      field: 'orderRef',
      headerName: labels.reference,
      width: 130
    },
    {
      field: 'szRef',
      headerName: labels.zone,
      width: 130,
      wrapText: true,
      autoHeight: true
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

    formik.setFieldValue('salesZones', {
      ...salesZones,
      list: salesZones.list
    })
  }

  const onSaleZoneCheckbox = (row, checked) => {
    const { recordId } = row

    setSelectedSaleZonesIds(prev => {
      const ids = prev ? prev.split(',') : []

      const updatedIds = checked ? [...new Set([...ids, recordId])] : ids.filter(id => id != recordId)

      return updatedIds.join(',')
    })
    setSelectedSaleZones(prev => {
      // Ensure `prev` is an object with a `list` property or fallback to an empty list.
      const currentList = prev?.list || []

      let updatedZonesList
      if (checked) {
        updatedZonesList = [...currentList, row] // Add the new zone if checked.
      } else {
        updatedZonesList = currentList.filter(zone => zone.recordId !== row.recordId) // Remove the zone if unchecked.
      }

      return { list: updatedZonesList } // Return the updated state as an object.
    })
  }

  const onTripCheckbox = (row, checked) => {
    setSelectedTrucks(prev => {
      let updatedTrucks

      if (checked) {
        updatedTrucks = [...prev, row]
      } else {
        updatedTrucks = prev.filter(truck => truck.recordId !== row.recordId)
      }

      return updatedTrucks
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
    const existingDeliveryOrderIds = new Set(formik?.values?.deliveryOrders?.list?.map(item => item.recordId))

    const newItems = items.list.filter(item => !existingDeliveryOrderIds.has(item.recordId))

    formik.setFieldValue('data', { list: newItems })
  }

  const onPreviewOutbounds = async (szIds, trucks) => {
    const commaSeparatedTrucks = trucks.map(truck => truck.recordId).join(',')

    const items = await getRequest({
      extension: DeliveryRepository.GenerateTrip.previewTRP,
      parameters: `_szIds=${szIds || 0}&_vehicleIds=${commaSeparatedTrucks}`
    })

    formik.setFieldValue('selectedTrucks', { list: items?.record?.vehicleAllocations })
    formik.setFieldValue('vehicleOrders', { list: items?.record?.vehicleOrders })

    // if (!items?.list) {
    //   return
    // }
    // const existingDeliveryOrderIds = new Set(formik?.values?.deliveryOrders?.list?.map(item => item.recordId))

    // const newItems = items.list.filter(item => !existingDeliveryOrderIds.has(item.recordId))
  }

  const onAdd = () => {
    const selectedRows = formik.values.data?.list?.filter(item => item.checked)

    const updatedDeliveryOrders = {
      ...formik.values.deliveryOrders,
      list: [...(formik.values.deliveryOrders?.list || []), ...selectedRows]
    }

    formik.setFieldValue('deliveryOrders', updatedDeliveryOrders)
    formik.setFieldValue('data', {
      ...formik.values.data,
      list: formik.values.data.list.filter(item => !item.checked) || []
    })
    formik.setFieldValue('totalAmount', 0)
    formik.setFieldValue('totalVolume', 0)
  }

  const resetForm = () => {
    setSelectedSaleZones([])
    setSelectedSaleZonesIds('')
    formik.resetForm()
  }

  const handleSearchChange = event => {
    const { value } = event.target
    if (formik.values.search !== value) {
      formik.setFieldValue('search', value)
    }
  }

  const filteredSalesZones = useMemo(() => {
    return {
      ...formik?.values?.salesZones,
      list: formik?.values?.salesZones?.list.filter(item =>
        item.name.toString().toLowerCase().includes(formik?.values?.search?.toLowerCase())
      )
    }
  }, [formik?.values?.salesZones, formik.values.search])

  const filteredData = formik?.values?.salesZones?.list.length > 0 ? filteredSalesZones : formik?.values?.salesZones

  const handleTruckNoChange = truckNo => {
    if (!truckNo || truckNo <= 0) {
      formik.setFieldValue('selectedTrucks', [])

      return
    }

    const trucks = Array.from({ length: truckNo }, (_, index) => ({
      id: index + 1,
      no: index + 1,
      volume: 0
    }))

    formik.setFieldValue('selectedTrucks', trucks)
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
      <VertLayout>
        <Fixed>
          <Grid container spacing={1.5}>
            <Grid item xs={3}>
              <Grid container spacing={1.5}>
                <Grid item xs={9}>
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
                      formik.setFieldValue('data', { list: [] })
                      setSelectedSaleZonesIds('')
                      setSelectedSaleZones([])
                    }}
                    readOnly={formik?.values?.deliveryOrders?.list.length > 0}
                    error={formik.touched.szId && Boolean(formik.errors.szId)}
                    maxAccess={access}
                  />
                </Grid>
                <Grid item xs={2}>
                  <CustomButton
                    onClick={() => resetForm()}
                    label={platformLabels.Clear}
                    image={'clear.png'}
                    color='#f44336'
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={2}>
              {/*  <ResourceComboBox
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
              /> */}
            </Grid>
            {/* <Grid item xs={2}>
              <CustomNumberField name='balance' label={labels.balance} value={balance} readOnly align='right' />
            </Grid> */}
            <Grid item xs={6}></Grid>
            <Grid item xs={2}>
              <CustomTextField
                name='search'
                value={formik.values.search}
                label={platformLabels.Search}
                onClear={() => {
                  formik.setFieldValue('search', '')
                }}
                size='small'
                onChange={handleSearchChange}
                onSearch={e => formik.setFieldValue('search', e)}
                search={true}
              />
            </Grid>
            <Grid item xs={2}>
              <CustomNumberField
                name='truckNo'
                label={labels.truckNo}
                value={formik.values.truckNo}
                onChange={async e => {
                  formik.setFieldValue('truckNo', e.target.value)

                  //handleTruckNoChange(e.target.value)
                }}
                onBlur={async e => {
                  //formik.setFieldValue('truckNo', e.target.value)

                  handleTruckNoChange(e.target.value)
                }}
              />
            </Grid>
            {/* <Grid item xs={2}>
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
                error={formik.touched.driverId && Boolean(formik.errors.driverId)}
                maxAccess={access}
              />
            </Grid> */}
            {/* <Grid item xs={2}>
              <CustomNumberField
                name='capacity'
                label={labels.capacity}
                value={formik.values.capacity}
                readOnly
                align='right'
              />
            </Grid> */}
            <Grid item xs={4}></Grid>
            <Grid item xs={1}>
              <CustomButton onClick={() => formik.handleSubmit()} label={platformLabels.Generate} color='#231f20' />
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <Grid container spacing={2} sx={{ display: 'flex', flex: 1 }}>
            <Grid item xs={2} sx={{ display: 'flex' }}>
              <Grid container sx={{ display: 'flex', flex: 1 }}>
                <Grid item xs={12} sx={{ display: 'flex' }}>
                  <Table
                    columns={columnsZones}
                    gridData={filteredData}
                    rowId={['recordId']}
                    isLoading={false}
                    pagination={false}
                    maxAccess={access}
                    showCheckboxColumn={true}
                    showSelectAll={false}
                    handleCheckboxChange={onSaleZoneCheckbox}
                  />
                </Grid>
                <Grid item xs={12} sx={{ display: 'flex' }}>
                  <Table
                    columns={columnsSelectedZones}
                    gridData={selectedSaleZones}
                    rowId={['recordId']}
                    isLoading={false}
                    pagination={false}
                    maxAccess={access}
                    rowDragManaged={true}
                    disableSorting={true}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={2} sx={{ display: 'flex' }}>
              <DataGrid
                onChange={value => formik.setFieldValue('selectedTrucks', value)}
                value={formik.values.selectedTrucks || []}
                error={formik.errors.selectedTrucks}
                columns={columnsTrucks}
              />
              {/* <DataGrid
                columns={columnsTrucks}
                gridData={trucks}
                rowId={['recordId']}
                isLoading={false}
                pagination={false}
                maxAccess={access}
                showCheckboxColumn={true}
                showSelectAll={false}
                handleCheckboxChange={onTripCheckbox}
              /> */}
            </Grid>
            <Grid item xs={8} sx={{ display: 'flex', flex: 1 }}>
              <Grid container spacing={2} sx={{ display: 'flex', flex: 1 }}>
                <Grid item xs={12} sx={{ display: 'flex' }}>
                  <Table
                    columns={columnsSelectedTrucks}
                    gridData={formik?.values?.selectedTrucks}
                    rowId={['recordId']}
                    isLoading={false}
                    pagination={false}
                    maxAccess={access}
                    onSelectionChange={row => {
                      if (row) {
                        console.log(row)

                        const filteredOrders = formik.values.vehicleOrders.list.filter(
                          item => row.vehicleId == item.vehicleId
                        )

                        setFilteredOrders({ list: filteredOrders })
                      }
                    }}
                  />
                </Grid>
                {/* <Grid item xs={12} sx={{ display: 'flex', flex: 0 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={3}>
                      <CustomButton
                        onClick={onAdd}
                        label={platformLabels.Import}
                        color='#231f20'
                        image={'import.png'}
                      />
                    </Grid>
                    <Grid item xs={5}></Grid>
                    <Grid item xs={2}>
                      <CustomNumberField
                        name='amount'
                        label={labels.amount}
                        value={formik.values.totalAmount}
                        readOnly
                        align='right'
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <CustomNumberField
                        name='volume'
                        label={labels.volume}
                        value={formik.values.totalVolume}
                        readOnly
                        align='right'
                      />
                    </Grid>
                  </Grid>
                </Grid> */}
                <Grid item xs={12} sx={{ display: 'flex' }}>
                  <Grow>
                    <Table
                      columns={columnsSalesOrders}
                      gridData={filteredOrders}
                      rowId={['vehicleId']}
                      isLoading={false}
                      pagination={false}
                      maxAccess={access}

                      // showCheckboxColumn={true}
                      // handleCheckboxChange={Confirmation}
                      // showSelectAll={false}
                    />
                  </Grow>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grow>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={2}></Grid>
            <Grid item xs={2}>
              <CustomButton
                onClick={() => onPreviewOutbounds(selectedSaleZonesIds, selectedTrucks)}
                label={platformLabels.Preview}
                color='#231f20'
              />
            </Grid>
            <Grid item xs={4}></Grid>
            <Grid item xs={1.5}>
              <CustomNumberField name='amount' label={labels.amount} value={totalAmount} readOnly align='right' />
            </Grid>
            <Grid item xs={1.5}>
              <CustomNumberField name='volume' label={labels.volume} value={totalVolume} readOnly align='right' />
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}

export default GenerateOutboundTransportation
