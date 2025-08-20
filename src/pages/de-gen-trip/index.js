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

const GenerateOutboundTransportation = () => {
  const [selectedSaleZones, setSelectedSaleZones] = useState('')
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
      const selectedIds = selectedSaleZones ? selectedSaleZones.split(',') : []
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

  useEffect(() => {
    if (reCalc) {
      const totalAmountValue = totalAmountFromChecked()
      const totalVolumeValue = totalVolumeFromChecked()
      formik.setFieldValue('totalAmount', totalAmountValue)
      formik.setFieldValue('totalVolume', totalVolumeValue)
      setReCalc(false)
    }
  }, [reCalc])

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
      autoHeight: true
    },
    {
      field: 'szName',
      headerName: labels.zone,
      width: 120,
      wrapText: true,
      autoHeight: true
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
      autoHeight: true
    },
    {
      field: 'szName',
      headerName: labels.zone,
      width: 120,
      wrapText: true,
      autoHeight: true
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

    formik.setFieldValue('salesZones', {
      ...salesZones,
      list: salesZones.list
    })
  }

  const onSaleZoneCheckbox = (row, checked) => {
    const { recordId } = row

    setSelectedSaleZones(prev => {
      const ids = prev ? prev.split(',') : []

      const updatedIds = checked ? [...new Set([...ids, recordId])] : ids.filter(id => id != recordId)

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
    const existingDeliveryOrderIds = new Set(formik?.values?.deliveryOrders?.list?.map(item => item.recordId))

    const newItems = items.list.filter(item => !existingDeliveryOrderIds.has(item.recordId))

    formik.setFieldValue('data', { list: newItems })
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
    setSelectedSaleZones('')
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
              <Grid container spacing={2}>
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
                      setSelectedSaleZones('')
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
            <Grid item xs={2}>
              <CustomNumberField name='balance' label={labels.balance} value={balance} readOnly align='right' />
            </Grid>
            <Grid item xs={5}></Grid>
            <Grid item xs={3}>
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
            </Grid>
            <Grid item xs={2}>
              <CustomNumberField
                name='capacity'
                label={labels.capacity}
                value={formik.values.capacity}
                readOnly
                align='right'
              />
            </Grid>
            <Grid item xs={4}></Grid>
            <Grid item xs={1}>
              <CustomButton onClick={() => formik.handleSubmit()} label={platformLabels.Generate} color='#231f20' />
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <Grid container spacing={2} sx={{ display: 'flex', flex: 1 }}>
            <Grid item xs={3} sx={{ display: 'flex', flex: 1 }}>
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
            <Grid item xs={9} sx={{ display: 'flex', flex: 1 }}>
              <Grid container spacing={2} sx={{ display: 'flex', flex: 1 }}>
                <Grid item xs={12} sx={{ display: 'flex', height: 255 }}>
                  <Table
                    columns={columnsOrders}
                    gridData={formik?.values?.data}
                    rowId={['recordId']}
                    isLoading={false}
                    pagination={false}
                    maxAccess={access}
                    showCheckboxColumn={true}
                    handleCheckboxChange={onRowCheckboxChange}
                  />
                </Grid>
                <Grid item xs={12} sx={{ display: 'flex', flex: 0 }}>
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
                </Grid>
                <Grid item xs={12} sx={{ display: 'flex', height: 255 }}>
                  <Grow>
                    <Table
                      columns={columnsDeliveryOrders}
                      gridData={formik?.values?.deliveryOrders}
                      rowId={['recordId']}
                      isLoading={false}
                      pagination={false}
                      maxAccess={access}
                      showCheckboxColumn={true}
                      handleCheckboxChange={Confirmation}
                      showSelectAll={false}
                    />
                  </Grow>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grow>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={2}>
              <CustomButton
                onClick={() => onUndelivered(selectedSaleZones)}
                label={platformLabels.Preview}
                color='#231f20'
              />
            </Grid>
            <Grid item xs={7}></Grid>
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
