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

const GenerateOutboundTransportation2 = () => {
  const [selectedSaleZones, setSelectedSaleZones] = useState([])
  const [selectedSaleZonesIds, setSelectedSaleZonesIds] = useState('')
  const [filteredOrders, setFilteredOrders] = useState([])
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
      totalOrdersVolume: 0,
      truckNo: 0,
      selectedTrucks: [
        {
          id: 1,
          no: 1,
          volume: 0
        }
      ],
      vehicleAllocations: { list: [] },
      vehicleOrders: { list: [] },
      deliveryOrders: { list: [] },
      data: { list: [] },
      salesZones: { list: [] },
      orders: { list: [] }
    },
    maxAccess: access,
    enableReinitialize: true,
    validateOnChange: true,
    onSubmit: async obj => {
      const data = {
        plantId,
        vehicleAllocations: obj.vehicleAllocations.list,
        vehicleOrders: obj.vehicleOrders.list
      }

      const res = await postRequest({
        extension: DeliveryRepository.Trip.setTRP2,
        record: JSON.stringify(data)
      })

      if (res.recordId) {
        // await openForm(res.recordId)
        // formik.setValues({
        //   ...formik.values,
        //   volume: 0,
        //   capacity: 0,
        //   amount: 0,
        //   balance: 0
        // })
        // formik.setFieldValue('deliveryOrders', { list: [] })
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

  function totalVolume() {
    return (
      formik?.values?.orders?.list.reduce((volumeSum, row) => {
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

  const onOrderChecked = () => {
    setReCalc(true)
  }

  useEffect(() => {
    if (reCalc) {
      const totalAmountValue = totalAmountFromChecked()
      const totalVolumeValue = totalVolumeFromChecked()
      const totalOrdersVolume = totalVolume()

      formik.setFieldValue('totalAmount', totalAmountValue)
      formik.setFieldValue('totalVolume', totalVolumeValue)
      formik.setFieldValue('totalOrdersVolume', totalOrdersVolume)
      setReCalc(false)
    }
  }, [reCalc])

  const totalTrucksVolume =
    formik?.values?.selectedTrucks?.reduce((sum, order) => sum + parseInt(order.volume || 0), 0) || 0

  const totalOrderVolume =
    formik?.values?.orders?.list?.filter(order => order.checked).reduce((sum, order) => sum + (order.volume || 0), 0) ||
    0

  useEffect(() => {
    formik.setFieldValue('totalOrdersVolume', totalOrderVolume)
  }, [formik?.values?.orders?.list])

  // const totalAmount = formik?.values?.deliveryOrders?.list?.reduce((sum, order) => sum + (order.amount || 0), 0) || 0

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
      flex: 3
    },
    {
      field: 'volume',
      headerName: labels.volume,
      flex: 2,
      type: 'number'
    }
  ]

  const columnsSelectedZones = [
    {
      field: 'name',
      headerName: labels.name,
      wrapText: true,
      autoHeight: true,
      flex: 3,
      rowDrag: true
    },
    {
      field: 'volume',
      headerName: labels.volume,
      flex: 2,
      type: 'number'
    }
  ]

  const columnsTrucks = [
    {
      component: 'numberfield',
      name: 'no',
      label: labels.No,
      flex: 1,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      name: 'volume',
      label: labels.allocatedVolume,
      flex: 2
    }
  ]

  const columnsVehicleAllocations = [
    {
      field: 'seqNo',
      headerName: labels.seqNo,
      width: 100
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
      field: 'route',
      headerName: labels.route,
      flex: 2
    }
  ]

  const columnsSalesOrders = [
    {
      field: 'szName',
      headerName: labels.szName,
      width: 130
    },
    {
      field: 'orderRef',
      headerName: labels.reference,
      width: 130
    },
    {
      field: 'orderDate',
      headerName: labels.orderDate,
      type: 'date',
      width: 130
    },
    {
      field: 'clientName',
      headerName: labels.clientName,
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
      flex: 1,
      wrapText: true,
      autoHeight: true
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
      flex: 1,
      wrapText: true,
      autoHeight: true
    },
    {
      field: 'szName',
      headerName: labels.zone,
      flex: 1,
      wrapText: true,
      autoHeight: true
    },
    {
      field: 'clientName',
      headerName: labels.client,
      wrapText: true,
      autoHeight: true,
      flex: 1
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
    }
  ]

  const onSaleZoneChange = async szId => {
    const response = await getRequest({
      extension: DeliveryRepository.Volume.vol,
      parameters: `_parentId=${szId || 0}`
    })

    if (!response?.record?.saleZoneOrderVolumeSummaries) {
      return
    }

    const { saleZoneOrderVolumeSummaries = [], orders = [] } = response.record

    const updatedSalesZones = saleZoneOrderVolumeSummaries.map(zone => {
      const zoneOrders = orders.filter(order => order.szId === zone.szId)

      return {
        ...zone,
        name: zone.zoneName,
        orders: zoneOrders
      }
    })

    formik.setFieldValue('salesZones', {
      ...response.record,
      list: updatedSalesZones
    })
  }

  const [sortedZones, setSortedZones] = useState(selectedSaleZones)

  const handleRowDragEnd = event => {
    if (!event.api) return

    let allNodes = []
    event.api.forEachNode(node => allNodes.push(node))

    const newOrder = allNodes.sort((a, b) => a.rowIndex - b.rowIndex).map(node => node.data)

    setSortedZones(newOrder)
  }

  const sortedZoneIds = useMemo(() => {
    return sortedZones.map(zone => zone.szId).join(',')
  }, [sortedZones])

  const onSaleZoneCheckbox = (row, checked) => {
    const { recordId } = row

    setSelectedSaleZonesIds(prev => {
      const ids = prev ? prev.split(',') : []

      const updatedIds = checked ? [...new Set([...ids, recordId])] : ids.filter(id => id != recordId)

      return updatedIds.join(',')
    })
  }

  const onPreviewOutbounds = async szIds => {
    const volumes = formik.values.selectedTrucks?.map(truck => truck.volume).join(',')

    const orderIds = sortedZones
      .flatMap(zone => zone.orders.filter(order => order.checked))
      .map(order => order.recordId)
      .join(',')

    const items = await getRequest({
      extension: DeliveryRepository.GenerateTrip.previewTRP,
      parameters: `_orderIds=${orderIds || 0}&_volumes=${volumes}`
    })

    if (items?.record?.vehicleAllocations) {
      formik.setFieldValue('vehicleAllocations', { list: items.record.vehicleAllocations })
    }

    formik.setFieldValue('vehicleOrders', { list: items?.record?.vehicleOrders })
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
        item?.name?.toString().toLowerCase().includes(formik?.values?.search?.toLowerCase())
      )
    }
  }, [formik?.values?.salesZones, formik.values.search])

  const filteredData = formik?.values?.salesZones?.list.length > 0 ? filteredSalesZones : formik?.values?.salesZones

  const handleImport = async () => {
    setSelectedSaleZones(() => {
      const selectedRows = filteredData?.list
        .filter(item => item.checked)
        .map(item => ({
          ...item,
          orders: item.orders?.map(order => ({ ...order, checked: true }))
        }))

      return { list: selectedRows }
    })
  }

  useEffect(() => {
    setSortedZones(selectedSaleZones.list || [])
  }, [selectedSaleZones])

  const totalOrdersVolume = useMemo(() => {
    return (selectedSaleZones.list || []).reduce((sum, zone) => sum + (zone.volume || 0), 0)
  }, [selectedSaleZones])

  const balance = totalTrucksVolume - totalOrdersVolume

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
          <Grid container>
            <Grid item xs={2}>
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
                  formik.setFieldValue('orders', { list: [] })
                  setSelectedSaleZonesIds('')
                  setSelectedSaleZones([])
                }}
                readOnly={formik?.values?.deliveryOrders?.list.length > 0}
                error={formik.touched.szId && Boolean(formik.errors.szId)}
                maxAccess={access}
              />
            </Grid>

            <Grid item xs={0.25}></Grid>
            <Grid item xs={0.75}>
              <CustomButton
                onClick={() => resetForm()}
                label={platformLabels.Clear}
                image={'clear.png'}
                color='#f44336'
              />
            </Grid>
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
            {/* <Grid item xs={4}></Grid> */}

            <Grid item xs={0.25}></Grid>
            <Grid item xs={0.75}>
              <CustomButton onClick={handleImport} label={platformLabels.Import} color='#231f20' image={'import.png'} />
            </Grid>
            <Grid item xs={2}>
              <CustomNumberField
                name='truckNo'
                label={labels.truckNo}
                value={formik.values.truckNo}
                onChange={async e => {
                  formik.setFieldValue('truckNo', e.target.value)
                }}
                onClear={async () => {
                  formik.setFieldValue('truckNo', 0)
                  handleTruckNoChange(0)
                }}
                onBlur={async e => {
                  handleTruckNoChange(e.target.value)
                }}
              />
            </Grid>
            <Grid item xs={2.5}></Grid>
            <Grid item xs={1.5}>
              <CustomButton onClick={() => formik.handleSubmit()} label={platformLabels.Generate} color='#231f20' />
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <Grid container spacing={2} sx={{ display: 'flex', flex: 1 }}>
            <Grid item xs={12} sx={{ display: 'flex' }}>
              <Grid container spacing={2} sx={{ display: 'flex', flex: 1 }}>
                <Grid item xs={3} sx={{ display: 'flex' }}>
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
                <Grid item xs={9} sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Table
                    columns={columnsOrders}
                    gridData={formik?.values?.orders}
                    rowId={['recordId']}
                    isLoading={false}
                    pagination={false}
                    maxAccess={access}
                    showCheckboxColumn={true}
                    showSelectAll={false}
                    handleCheckboxChange={onOrderChecked}
                  />
                  <Grid container>
                    <Grid item xs={10}></Grid>
                    <Grid item xs={2} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 5 }}>
                      <CustomNumberField
                        name='ordersVolume'
                        label={labels.totalVolume}
                        value={formik.values.totalOrdersVolume}
                        readOnly
                        align='right'
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={3} sx={{ display: 'flex' }}>
                  <Table
                    columns={columnsSelectedZones}
                    gridData={selectedSaleZones}
                    rowId={['recordId']}
                    isLoading={false}
                    pagination={false}
                    maxAccess={access}
                    rowDragManaged={true}
                    disableSorting={true}
                    onRowDragEnd={handleRowDragEnd}
                    onSelectionChange={row => {
                      if (row) {
                        formik.setFieldValue('orders', {
                          list: row.orders
                        })
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={9} sx={{ display: 'flex' }}>
                  <Table
                    columns={columnsVehicleAllocations}
                    gridData={formik?.values?.vehicleAllocations}
                    rowId={['recordId']}
                    isLoading={false}
                    pagination={false}
                    maxAccess={access}
                    onSelectionChange={row => {
                      if (row) {
                        const filteredOrders = formik.values.vehicleOrders.list.filter(item => row.seqNo == item.seqNo)
                        setFilteredOrders({ list: filteredOrders })
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={3} sx={{ display: 'flex', mt: 1.5 }}>
                  <DataGrid
                    onChange={value => formik.setFieldValue('selectedTrucks', value)}
                    value={formik.values.selectedTrucks || []}
                    error={formik.errors.selectedTrucks}
                    columns={columnsTrucks}
                    allowAddNewLine={false}
                    allowDelete={false}
                  />
                </Grid>
                <Grid item xs={9} sx={{ display: 'flex' }}>
                  <Table
                    columns={columnsSalesOrders}
                    gridData={filteredOrders}
                    rowId={['vehicleId']}
                    isLoading={false}
                    pagination={false}
                    maxAccess={access}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grow>
        <Fixed>
          <Grid container spacing={2} mt={2}>
            <Grid item xs={2}>
              <CustomButton
                onClick={() => onPreviewOutbounds(sortedZoneIds)}
                label={platformLabels.Preview}
                color='#231f20'
              />
            </Grid>
            <Grid item xs={4}></Grid>
            <Grid item xs={2}>
              <CustomNumberField
                name='totalTrucksVolume'
                label={labels.totalTrucksVolume}
                value={totalTrucksVolume}
                readOnly
                align='right'
              />
            </Grid>
            <Grid item xs={2}>
              <CustomNumberField
                name='totalOrdersVolume'
                label={labels.totalOrdersVolume}
                value={totalOrdersVolume}
                readOnly
                align='right'
              />
            </Grid>
            <Grid item xs={2}>
              <CustomNumberField name='balance' label={labels.balance} value={balance} readOnly align='right' />
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}

export default GenerateOutboundTransportation2
