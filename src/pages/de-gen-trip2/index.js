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
import { useWindow } from 'src/windows'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomButton from 'src/components/Inputs/CustomButton'
import { DataGrid } from 'src/components/Shared/DataGrid'
import UnallocatedOrdersForm from './Forms/UnallocatedOrders'
import { formatDateToApi } from 'src/lib/date-helper'
import CustomDateTimePicker from 'src/components/Inputs/CustomDateTimePicker'

const GenerateOutboundTransportation2 = () => {
  const [selectedSaleZones, setSelectedSaleZones] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [sortedZones, setSortedZones] = useState(selectedSaleZones)
  const [reCalc, setReCalc] = useState(false)
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels, userDefaultsData } = useContext(ControlContext)
  const { stack } = useWindow()

  const { labels, access } = useResourceQuery({
    datasetId: ResourceIds.GenerateTrip
  })

  const plantId = parseInt(userDefaultsData?.list?.find(({ key }) => key === 'plantId')?.value)

  const { formik } = useForm({
    initialValues: {
      search: '',
      departureDate: null,
      szId: null,
      balance: 0,
      totalAmount: 0,
      totalVolume: 0,
      zonesVolume: 0,
      truckNo: 0,
      selectedTrucks: [],
      vehicleAllocations: { list: [] },
      vehicleOrders: { list: [] },
      data: { list: [] },
      salesZones: { list: [] },
      orders: { list: [] },
      unallocatedOrders: { list: [] }
    },
    maxAccess: access,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      departureDate: yup.date().required(),
      selectedTrucks: yup.array().of(
        yup.object().shape({
          overloadMargins: yup.number().min(0).max(100)
        })
      )
    }),
    onSubmit: async obj => {
      const data = {
        plantId,
        departureDate: formatDateToApi(obj.departureDate),
        vehicleAllocations: obj.vehicleAllocations.list,
        vehicleOrders: obj.vehicleOrders.list,
        unallocatedOrders: obj.unallocatedOrders.list
      }

      await postRequest({
        extension: DeliveryRepository.Trip.setTRP2,
        record: JSON.stringify(data)
      })

      resetForm()
      toast.success(platformLabels.Generated)
    }
  })

  async function openForm() {
    stack({
      Component: UnallocatedOrdersForm,
      props: {
        labels,
        data: formik?.values?.unallocatedOrders,
        access
      },
      width: 1000,
      height: 700,
      title: labels.unallocatedOrders
    })
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

  useEffect(() => {
    if (reCalc) {
      const totalAmountValue = totalAmountFromChecked()
      const totalVolumeValue = totalVolumeFromChecked()
      const zonesVolume = totalVolume()

      formik.setFieldValue('totalAmount', totalAmountValue)
      formik.setFieldValue('totalVolume', totalVolumeValue)
      formik.setFieldValue('zonesVolume', zonesVolume)
      setReCalc(false)
    }
  }, [reCalc])

  const totalTrucksVolume =
    formik?.values?.selectedTrucks?.reduce((sum, order) => sum + parseInt(order.volume || 0), 0) || 0

  const zonesVolume =
    formik?.values?.orders?.list?.filter(order => order.checked).reduce((sum, order) => sum + (order.volume || 0), 0) ||
    0

  useEffect(() => {
    formik.setFieldValue('zonesVolume', zonesVolume)
  }, [formik?.values?.orders?.list])

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
      flex: 0.5,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      name: 'volume',
      label: labels.allocatedVolume,
      flex: 1
    },
    {
      component: 'numberfield',
      name: 'overloadMargins',
      label: labels.overload,
      props: {
        allowNegative: false,
        decimalScale: 0
      },
      defaultValue: 0,
      flex: 1
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
      headerName: labels.saleZone,
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
    if (szId) {
      const response = await getRequest({
        extension: DeliveryRepository.Volume.vol,
        parameters: `_parentId=${szId}`
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
    } else {
      formik.setFieldValue('salesZones', { list: [] })
    }
  }

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

  const onPreviewOutbounds = async szIds => {
    if (formik.errors?.selectedTrucks?.length > 0) {
      return
    }
    const volumes = formik.values.selectedTrucks?.map(truck => truck.volume).join(',')
    const overloads = formik.values.selectedTrucks?.map(truck => truck?.overloadMargins || 0).join(',')

    const orderIds = sortedZones
      .flatMap(zone => zone.orders.filter(order => order.checked))
      .map(order => order.recordId)
      .join(',')

    const items = await getRequest({
      extension: DeliveryRepository.GenerateTrip.previewTRP,
      parameters: `_zones=${szIds || 0}&_volumes=${volumes}&_overloadMargins=${overloads}&_orderIds=${orderIds || 0}`
    })

    formik.setFieldValue('vehicleAllocations', { list: items?.record?.vehicleAllocations })

    formik.setFieldValue('vehicleOrders', { list: items?.record?.vehicleOrders })
    formik.setFieldValue('unallocatedOrders', { list: items?.record?.unallocatedOrders })
  }

  const resetForm = () => {
    setSelectedSaleZones([])
    setFilteredOrders([])
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
    setSelectedSaleZones(prevState => {
      const prevSelected = prevState?.list || []

      const newlySelected = formik.values.salesZones.list
        .filter(item => item.checked)
        .map(item => ({
          ...item,
          orders: item.orders?.map(order => ({ ...order, checked: true }))
        }))

      const updatedPrevSelected = prevSelected.filter(prevItem =>
        formik.values.salesZones.list.some(newItem => newItem.szId === prevItem.szId && newItem.checked)
      )

      const uniqueNewlySelected = newlySelected.filter(
        newItem => !updatedPrevSelected.some(prevItem => prevItem.szId === newItem.szId)
      )

      return { list: [...updatedPrevSelected, ...uniqueNewlySelected] }
    })
  }

  useEffect(() => {
    setSortedZones(selectedSaleZones.list || [])
  }, [selectedSaleZones])

  const handleTruckNoChange = truckNo => {
    if (!truckNo || truckNo <= 0) {
      formik.setFieldValue('selectedTrucks', [])

      return
    }

    const trucks = Array.from({ length: truckNo }, (_, index) => ({
      id: index + 1,
      no: index + 1,
      volume: 0,
      overloadMargins: 0
    }))

    formik.setFieldValue('selectedTrucks', trucks)
  }

  const ordersVolume = useMemo(() => {
    return (selectedSaleZones.list || []).reduce((sum, zone) => {
      const ordersSum = (zone.orders || [])
        .filter(order => order.checked)
        .reduce((orderSum, order) => orderSum + (order.volume || 0), 0)

      return sum + ordersSum
    }, 0)
  }, [JSON.stringify(selectedSaleZones.list)])

  const balance = totalTrucksVolume - ordersVolume

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
            <Grid item xs={1.5}>
              <ResourceComboBox
                endpointId={DeliveryRepository.GenerateTrip.root}
                parameters={`_startAt=0&_pageSize=1000&_sortField="recordId"&_filter=`}
                name='szId'
                label={labels.saleZone}
                valueField='recordId'
                displayField={'name'}
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('szId', newValue?.recordId)
                  onSaleZoneChange(newValue?.recordId)
                  formik.setFieldValue('data', { list: [] })
                  formik.setFieldValue('orders', { list: [] })
                  formik.setFieldValue('selectedTrucks', [])
                  formik.setFieldValue('vehicleAllocations', { list: [] })
                  formik.setFieldValue('salesZones', { list: [] })
                  setFilteredOrders([])
                  setSelectedSaleZones([])
                }}
                error={formik.touched.szId && Boolean(formik.errors.szId)}
                maxAccess={access}
              />
            </Grid>

            <Grid item xs={1.5}>
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

            <Grid item xs={1.5}>
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
            <Grid item xs={1.5}>
              <CustomDateTimePicker
                name='departureDate'
                min={new Date()}
                label={labels.departureDate}
                value={formik.values.departureDate}
                onChange={formik.setFieldValue}
                maxAccess={access}
                required
                onClear={() => formik.setFieldValue('departureDate', '')}
                error={formik.touched.departureDate && Boolean(formik.errors.departureDate)}
              />
            </Grid>
            <Grid item xs={1.5}>
              <CustomNumberField
                name='totalTrucksVolume'
                label={labels.trucksVolume}
                value={totalTrucksVolume}
                readOnly
                align='right'
              />
            </Grid>
            <Grid item xs={1.5}>
              <CustomNumberField
                name='ordersVolume'
                label={labels.ordersVolume}
                value={ordersVolume}
                readOnly
                align='right'
              />
            </Grid>
            <Grid item xs={1.5}>
              <CustomNumberField name='balance' label={labels.balance} value={balance} readOnly align='right' />
            </Grid>
            <Grid item xs={1.5}>
              <CustomNumberField
                name='zonesVolume'
                label={labels.zonesVolume}
                value={formik.values.zonesVolume}
                readOnly
                align='right'
              />
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
                    disableSorting={true}
                    showCheckboxColumn={true}
                    showSelectAll={false}
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
                    handleCheckboxChange={() => {
                      setReCalc(true)
                    }}
                  />
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
            <Grid item xs={0.65}>
              <CustomButton
                onClick={() => resetForm()}
                label={platformLabels.Clear}
                tooltipText={platformLabels.Clear}
                image={'clear.png'}
                color='#f44336'
              />
            </Grid>
            <Grid item xs={0.65}>
              <CustomButton
                onClick={handleImport}
                label={platformLabels.import}
                tooltipText={platformLabels.import}
                color='#231f20'
                image={'import.png'}
              />
            </Grid>
            <Grid item xs={8.75}></Grid>
            <Grid item xs={0.65}>
              <CustomButton
                onClick={openForm}
                tooltipText={labels.unallocatedOrders}
                label={labels.unallocatedOrders}
                image={'cancelWhite.png'}
                disabled={formik.values.unallocatedOrders?.list?.length == 0}
                color='#f44336'
              />
            </Grid>

            <Grid item xs={0.65}>
              <CustomButton
                onClick={() => onPreviewOutbounds(sortedZoneIds)}
                disabled={
                  formik.values.selectedTrucks.length === 0 ||
                  formik.values.selectedTrucks.some(truck => !truck.volume) ||
                  formik.values.orders.length === 0
                }
                tooltipText={platformLabels.Preview}
                image={'preview.png'}
                color='#231f20'
              />
            </Grid>
            <Grid item xs={0.65}>
              <CustomButton
                onClick={() => formik.handleSubmit()}
                label={platformLabels.Generate}
                color='#231f20'
                tooltipText={platformLabels.Generate}
                image={'generate.png'}

                //disabled={balance + 0.1 * totalTrucksVolume < 0}
              />
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}

export default GenerateOutboundTransportation2
