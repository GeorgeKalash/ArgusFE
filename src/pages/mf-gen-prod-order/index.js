import { useState, useContext, useEffect } from 'react'
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
import CustomButton from 'src/components/Inputs/CustomButton'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { SaleRepository } from 'src/repositories/SaleRepository'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import ProductionOrderForm from '../mf-prod-order/Forms/ProductionOrderForm'
import { useWindow } from 'src/windows'

const GeneratePoductionOrder = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  const { labels, access } = useResourceQuery({
    datasetId: ResourceIds.GenerateProductionOrder
  })

  const { labels: _labels, access: maxAccess } = useResourceQuery({
    datasetId: ResourceIds.ProductionOrder
  })

  const { formik } = useForm({
    initialValues: {
      clientId: null,
      itemSummaries: { list: [] },
      orders: { list: [] },
      ordersToGenerate: { list: [] }
    },
    maxAccess: access,
    enableReinitialize: true,
    onSubmit: async () => {
      const data = {
        items: formik?.values?.itemSummaries?.list
          ?.filter(item => item.checked)
          .map(item => ({
            poId: 0,
            seqNo: 0,
            itemId: item.itemId,
            qty: item.produceNow
          }))
      }

      const res = await postRequest({
        extension: ManufacturingRepository.ProductionOrder.gen,
        record: JSON.stringify(data)
      })

      stack({
        Component: ProductionOrderForm,
        props: {
          labels: _labels,
          access: maxAccess,
          recordId: res?.recordId
        },
        width: 850,
        height: 680,
        title: labels.ProductionOrder
      })

      toast.success(platformLabels.Generated)
    }
  })

  const columnsItemsSummary = [
    {
      field: 'sku',
      headerName: labels.sku,
      flex: 1
    },
    {
      field: 'itemName',
      headerName: labels.itemName,
      flex: 2
    },
    {
      field: 'soQty',
      headerName: labels.soQty,
      type: 'number',
      width: 130
    },
    {
      field: 'remainingQty',
      headerName: labels.remainingQty,
      type: 'number',
      width: 130
    },
    {
      field: 'onHand',
      headerName: labels.onHand,
      type: 'number',
      width: 130
    },
    {
      field: 'minQty',
      headerName: labels.minQty,
      type: 'number',
      width: 130
    },
    {
      field: 'inProduction',
      headerName: labels.inProduction,
      type: 'number',
      width: 130
    },
    {
      field: 'deltaQty',
      headerName: labels.deltaQty,
      type: 'number',
      width: 130
    },
    {
      field: 'produceNow',
      headerName: labels.produceNow,
      type: 'number',
      width: 130
    }
  ]

  const columnsOrders = [
    {
      field: 'orderRef',
      headerName: labels.orderRef,
      flex: 1
    },
    {
      field: 'orderDate',
      headerName: labels.orderDate,
      type: 'date',
      flex: 1
    },
    {
      field: 'clientName',
      headerName: labels.clientName,
      flex: 1,
      wrapText: true,
      autoHeight: true
    },
    {
      field: 'soQty',
      headerName: labels.soQty,
      type: 'number',
      flex: 1
    },
    {
      field: 'remainingQty',
      headerName: labels.remainingQty,
      type: 'number',
      flex: 1
    }
  ]

  const fillSummaryORD = async (clientId, initial) => {
    const response = await getRequest({
      extension: SaleRepository.SalesOrder.summaryORD,
      parameters: `_clientId=${clientId || 0}`
    })

    const newlyItemSummaries = response?.record?.itemSummaries.map((item, index) => ({
      ...item,
      id: index + 1,
      initialSoQty: item.soQty,
      initialRemainingQty: item.remainingQty,
      orders: response?.record?.orders
        ?.filter(order => order.itemId === item.itemId)
        .map((order, index) => ({ ...order, id: index + 1, checked: true }))
    }))

    formik.setFieldValue('itemSummaries', { list: newlyItemSummaries })

    if (!initial) {
      formik.setFieldValue('orders', { list: response?.record?.orders })
      formik.setFieldValue('ordersToGenerate', { list: response?.record?.ordersToGenerate })
    }
  }

  const resetForm = () => {
    formik.resetForm()
  }

  useEffect(() => {
    ;(async function () {
      await fillSummaryORD(0, true)
    })()
  }, [])

  const disableCondition = data => {
    return data?.deltaQty >= 0
  }

  useEffect(() => {
    const list = formik?.values?.itemSummaries?.list || []

    const updatedList = list.map(item =>
      item.deltaQty >= 0 && item.checked !== false ? { ...item, checked: false } : item
    )

    const hasChanges = list.some((item, index) => item.checked !== updatedList[index].checked)

    if (hasChanges) {
      formik.setFieldValue('itemSummaries.list', updatedList)
    }
  }, [formik.values.itemSummaries?.list])

  return (
    <FormShell
      resourceId={ResourceIds.GenerateProductionOrder}
      form={formik}
      maxAccess={access}
      isCleared={false}
      isSaved={false}
      infoVisible={false}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <ResourceLookup
                endpointId={SaleRepository.Client.snapshot}
                name='clientId'
                label={labels.client}
                valueField='reference'
                displayField='name'
                valueShow='clientRef'
                secondValueShow='clientName'
                formObject={formik.values.header}
                form={formik}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                onChange={(event, newValue) => {
                  formik.setFieldValue('clientId', newValue?.recordId)
                  formik.setFieldValue('clientName', newValue?.name)
                  formik.setFieldValue('clientRef', newValue?.reference)

                  fillSummaryORD(newValue?.recordId)
                }}
                secondField={{
                  name: 'clientName',
                  editable: false,
                  onChange: (name, value) => {
                    formik.setFieldValue('clientName', value)
                  }
                }}
                maxAccess={access}
                autoSelectFistValue={!formik.values.clientId}
                displayFieldWidth={3}
                error={formik.touched?.clientId && Boolean(formik.errors?.clientId)}
              />
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <Grid container spacing={2} sx={{ display: 'flex', flex: 1 }}>
            <Grid item xs={12} sx={{ display: 'flex' }}>
              <Grid container spacing={2} sx={{ display: 'flex', flex: 1 }}>
                <Grid item xs={12} sx={{ display: 'flex' }}>
                  <Table
                    columns={columnsItemsSummary}
                    gridData={formik?.values?.itemSummaries}
                    rowId={['itemId']}
                    pagination={false}
                    maxAccess={access}
                    disableSorting={true}
                    showCheckboxColumn={true}
                    showSelectAll={true}
                    disable={disableCondition}
                    onSelectionChange={row => {
                      if (row) {
                        formik.setFieldValue('orders', {
                          list: row.orders
                        })
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Table
                    columns={columnsOrders}
                    gridData={formik?.values?.orders}
                    rowId={['itemId']}
                    isLoading={false}
                    pagination={false}
                    maxAccess={access}
                    showCheckboxColumn={true}
                    showSelectAll={false}
                    handleCheckboxChange={() => {
                      const allOrders = formik?.values?.orders?.list || []
                      const checkedOrders = allOrders.filter(order => order.checked)

                      const allOrderSums = allOrders.reduce((acc, order) => {
                        const itemId = order.itemId
                        if (!acc[itemId]) {
                          acc[itemId] = { soQty: 0, remainingQty: 0 }
                        }
                        acc[itemId].soQty += order.soQty || 0
                        acc[itemId].remainingQty += order.remainingQty || 0

                        return acc
                      }, {})

                      const checkedOrderSums = checkedOrders.reduce((acc, order) => {
                        const itemId = order.itemId
                        if (!acc[itemId]) {
                          acc[itemId] = { soQty: 0, remainingQty: 0 }
                        }
                        acc[itemId].soQty += order.soQty || 0
                        acc[itemId].remainingQty += order.remainingQty || 0

                        return acc
                      }, {})

                      const updatedItemSummaries = formik.values.itemSummaries.list.map(item => {
                        const itemId = item.itemId

                        if (allOrderSums[itemId]) {
                          const checked = checkedOrderSums[itemId] || { soQty: 0, remainingQty: 0 }
                          const deltaQty = item.onHand + item.inProduction - item.minQty - checked.remainingQty

                          return {
                            ...item,
                            soQty: checked.soQty,
                            deltaQty,
                            remainingQty: checked.remainingQty,
                            produceNow: Math.abs(deltaQty)
                          }
                        }

                        return item
                      })

                      formik.setFieldValue(`itemSummaries`, { list: updatedItemSummaries })
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grow>
        <Fixed>
          <Grid container spacing={2} mt={2}>
            <Grid item xs={1}>
              <CustomButton
                onClick={() => resetForm()}
                label={platformLabels.Clear}
                tooltipText={platformLabels.Clear}
                image={'clear.png'}
                color='#f44336'
              />
            </Grid>

            <Grid item xs={10.5}></Grid>

            <Grid item xs={0.5}>
              <CustomButton
                onClick={() => formik.handleSubmit()}
                label={platformLabels.Generate}
                color='#231f20'
                tooltipText={platformLabels.Generate}
                image={'generate.png'}
              />
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}

export default GeneratePoductionOrder
