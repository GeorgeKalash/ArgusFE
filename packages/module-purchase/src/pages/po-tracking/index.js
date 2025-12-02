import { useContext } from 'react'
import toast from 'react-hot-toast'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import { Grid } from '@mui/material'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import CustomButton from '@argus/shared-ui/src/components/Inputs/CustomButton'
import { PurchaseRepository } from '@argus/repositories/src/repositories/PurchaseRepository'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import { formatDateFromApi } from '@argus/shared-domain/src/lib/date-helper'
import Form from '@argus/shared-ui/src/components/Shared/Form'

const POTracking = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { stack } = useWindow()

  const { labels, access } = useResourceQuery({
    datasetId: ResourceIds.POTracking
  })

  const { formik } = useForm({
    validateOnChange: true,
    maxAccess: access,
    initialValues: {
      poId: null,
      items: []
    },
    onSubmit: async obj => {
      const items = obj?.items?.map((item, index) => ({
        poId: obj.poId,
        seqNo: item.id,
        deliveryDate: formatDateFromApi(item.date),
        ...item
      }))

      const payload = {
        poId: obj.poId,
        items
      }

      const response = await postRequest({
        extension: PurchaseRepository.OrderItem.set2,
        record: JSON.stringify(payload)
      })

      formik.setFieldValue('recordId', response.recordId)
      toast.success(platformLabels.Updated)
    }
  })

  const columns = [
    {
      component: 'resourcelookup',
      label: labels.sku,
      name: 'sku',
      props: {
        endpointId: InventoryRepository.Item.snapshot,
        valueField: 'sku',
        displayField: 'sku',
        readOnly: true,
        mapping: [
          { from: 'recordId', to: 'itemId' },
          { from: 'sku', to: 'sku' },
          { from: 'name', to: 'itemName' },
          { from: 'trackBy', to: 'trackBy' }
        ]
      }
    },
    {
      component: 'textfield',
      label: labels.itemName,
      name: 'itemName',
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      name: 'qty',
      label: labels.qty,
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      label: labels.requestRef,
      name: 'requestRef',
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      name: 'netUnitPrice',
      label: labels.unitCost,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      name: 'vatAmount',
      label: labels.vat,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      name: 'extendedPrice',
      label: labels.extendedCost,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      name: 'receivedQty',
      label: labels.receivedQty,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      name: 'invoicedQty',
      label: labels.invoicedQty,
      props: {
        readOnly: true
      }
    },
    {
      component: 'date',
      name: 'deliveryDate',
      flex: 2,
      label: labels?.deliveryDate
    },
    {
      component: 'resourcecombobox',
      label: labels.trackingStatus,
      name: 'trackingStatusId',
      props: {
        endpointId: PurchaseRepository.PUOrderStatus.qry,
        displayField: 'name',
        mapping: [
          { from: 'name', to: 'trackingStatusName' },
          { from: 'recordId', to: 'trackingStatusId' }
        ]
      }
    }
  ]

  async function fetchGridData() {
    const response = await getRequest({
      extension: PurchaseRepository.OrderItem.qry,
      parameters: `_poId=${formik.values.poId}`
    })

    formik.setFieldValue(
      'items',
      response?.list?.map(({ ...item }, index) => ({
        id: index + 1,
        ...item,
        deliveryDate: formatDateFromApi(item.deliveryDate)
      })) || formik.values.items
    )
  }

  return (
    <Form isParentWindow={false} onSave={formik.handleSubmit} maxAccess={access}>
      <VertLayout>
        <Fixed>
          <GridToolbar
            maxAccess={access}
            labels={labels}
            middleSection={
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <ResourceLookup
                      endpointId={PurchaseRepository.PurchaseOrder.snapshot}
                      name='poId'
                      filter={{ status: 4 }}
                      label={labels.purchaseOrder}
                      valueField='reference'
                      displayField='name'
                      secondDisplayField={false}
                      form={formik}
                      maxAccess={access}
                      valueShow='poRef'
                      onChange={(_, newValue) => {
                        formik.setFieldValue('poId', newValue?.recordId || null)
                        if (!newValue?.recordId) {
                          formik.setFieldValue('items', [])
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={1}>
                    <CustomButton
                      onClick={fetchGridData}
                      label={platformLabels.Preview}
                      color='#231F20'
                      image='preview.png'
                      disabled={!formik.values.poId}
                    />
                  </Grid>
                </Grid>
              </Grid>
            }
          />
        </Fixed>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('items', value)}
            value={formik.values.items}
            error={formik.errors.items}
            name='items'
            maxAccess={access}
            columns={columns}
            allowAddNewLine={false}
            allowDelete={false}
          />
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default POTracking
