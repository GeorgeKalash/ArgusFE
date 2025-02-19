import { useContext, useEffect } from 'react'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { Grid } from '@mui/material'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { useForm } from 'src/hooks/form'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { SaleRepository } from 'src/repositories/SaleRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SystemFunction } from 'src/resources/SystemFunction'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { RGSaleRepository } from 'src/repositories/RGSaleRepository'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import WindowToolbar from 'src/components/Shared/WindowToolbar'
import { DeliveryRepository } from 'src/repositories/DeliveryRepository'
import CustomButton from 'src/components/Inputs/CustomButton'

const UndeliveredItems = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { labels, access: maxAccess } = useResourceQuery({
    datasetId: ResourceIds.UndeliveredItems
  })

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      dtId: 0,
      groupId: 0,
      plantId: 0,
      siteId: 0,
      categoryId: 0,
      clientId: 0,
      clientRef: '',
      clientName: '',
      soId: 0,
      items: [],
      marginDefault: null
    },
    validateOnChange: true,

    onSubmit: async obj => {
      const items = obj.items
        .filter(item => item.isChecked)
        .map(
          item =>
            item.isChecked && {
              ...item,
              date: formatDateToApi(item.date),
              soId: obj.soId
            }
        )
      postRequest({
        extension: DeliveryRepository.DeliveriesOrders.gen,
        record: JSON.stringify({ ...obj, items })
      }).then(res => {
        toast.success(platformLabels.success)
      })
    }
  })

  const { groupId, plantId, siteId, categoryId, clientId, soId, marginDefault } = formik.values

  useEffect(() => {
    getData()
  }, [clientId, categoryId, groupId])

  useEffect(() => {
    ;(async function () {
      const res = await getRequest({
        extension: SystemRepository.Default.get,
        parameters: `_key=DEORDMaxVarPct`
      })

      formik.setFieldValue('marginDefault', res.record?.value)
    })()
  }, [])

  async function getData() {
    const result = await getRequest({
      extension: RGSaleRepository.SaSaleOrder.open,
      parameters: `_categoryId=${categoryId}&_plantId=${plantId} &_siteId=${siteId}&_groupId=${groupId}&_clientId=${clientId}&_soId=${soId}`
    })

    const res = result.list.map((item, index) => ({
      ...item,
      id: index + 1,
      date: formatDateFromApi(item.date),
      balance: item.qty - item.deliveredQty
    }))

    formik.setFieldValue('items', res)
  }

  const isCheckedAll = formik.values.items?.length > 0 && formik.values.items?.every(item => item?.isChecked)

  const columns = [
    {
      component: 'checkbox',
      name: 'isChecked',
      flex: 0.3,
      checkAll: {
        value: isCheckedAll,
        visible: true,
        disabled: !clientId && !siteId,
        onChange({ checked }) {
          const items = formik.values.items.map(({ isChecked, ...item }) => ({
            ...item,
            isChecked: checked,
            deliverNow: checked ? item.balance : 0
          }))

          formik.setFieldValue('items', items)
        }
      },

      async onChange({ row: { update, newRow } }) {
        update({ deliverNow: newRow.isChecked ? newRow.balance : 0 })
      }
    },
    {
      component: 'textfield',
      label: labels.reference,
      name: 'reference',
      props: { readOnly: true }
    },
    {
      component: 'date',
      label: labels.date,
      name: 'date',
      props: { readOnly: true }
    },
    {
      component: 'textfield',
      label: labels.clientRef,
      name: 'clientRef',
      props: { readOnly: true }
    },
    {
      component: 'textfield',
      label: labels.client,
      name: 'clientName',
      props: { readOnly: true }
    },
    {
      component: 'textfield',
      label: labels.sku,
      name: 'sku',
      props: { readOnly: true }
    },
    {
      component: 'textfield',
      label: labels.item,
      name: 'itemName',
      props: { readOnly: true }
    },
    {
      component: 'numberfield',
      label: labels.qty,
      name: 'qty',
      props: { readOnly: true }
    },
    {
      component: 'textfield',
      label: labels.deliveredQty,
      name: 'deliveredQty',
      props: { readOnly: true }
    },
    {
      component: 'numberfield',
      label: labels.balance,
      name: 'balance',
      props: { readOnly: true }
    },
    {
      component: 'numberfield',
      label: labels.genQty,
      name: 'deliverNow',
      updateOn: 'blur',
      propsReducer({ row, props }) {
        return { ...props, readOnly: !row.isChecked }
      },
      async onChange({ row: { update, newRow } }) {
        const { deliverNow, balance, qty } = newRow

        let value = deliverNow

        if (deliverNow > balance) {
          const margin = (100 * (deliverNow - balance)) / qty

          if (marginDefault == 0) value = balance
          else if (margin < marginDefault) value = deliverNow
          else value = balance
        } else if (deliverNow < 0) value = 0

        update({ deliverNow: value })
      }
    }
  ]

  const actions = [
    {
      key: 'ORD',
      condition: true,
      onClick: () => formik.handleSubmit(),
      disabled: !clientId || !siteId
    }
  ]

  return (
    <VertLayout>
      <Fixed>
        <Grid container spacing={2} padding={2}>
          <Grid item xs={3} container spacing={2}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.DocumentType.qry}
                parameters={`_dgId=${SystemFunction.DeliveryOrder}&_startAt=${0}&_pageSize=${1000}`}
                name='dtId'
                label={labels.documentType}
                valueField='recordId'
                displayField='name'
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('dtId', newValue?.recordId || 0)
                }}
                error={formik.touched.dtId && Boolean(formik.errors.dtId)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={InventoryRepository.Category.qry}
                parameters='_pagesize=30&_startAt=0&_name='
                name='categoryId'
                label={labels.category}
                valueField='recordId'
                displayField={'name'}
                displayFieldWidth={1}
                values={formik?.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('categoryId', newValue?.recordId || 0)
                }}
                error={formik.touched.categoryId && Boolean(formik.errors.categoryId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={InventoryRepository.Group.qry}
                parameters='_startAt=0&_pageSize=1000'
                name='groupId'
                label={labels.plant}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('groupId', newValue?.recordId || 0)
                }}
                error={formik.touched.groupId && Boolean(formik.errors.groupId)}
                maxAccess={maxAccess}
              />
            </Grid>
          </Grid>
          <Grid item xs={3} container spacing={2}>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={SaleRepository.Client.snapshot}
                parameters={{
                  _category: 0
                }}
                valueField='reference'
                displayField='name'
                name='clientId'
                label={labels.client}
                form={formik}
                displayFieldWidth={2}
                valueShow='clientRef'
                secondValueShow='clientName'
                maxAccess={maxAccess}
                columnsInDropDown={[
                  { key: 'reference', value: 'Ref.' },
                  { key: 'name', value: 'Name' }
                ]}
                onChange={async (event, newValue) => {
                  formik.setFieldValue('clientId', newValue?.recordId || 0)
                  formik.setFieldValue('clientName', newValue?.name || '')
                  formik.setFieldValue('clientRef', newValue?.reference || '')
                }}
                errorCheck={'clientId'}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={InventoryRepository.Site.qry}
                name='siteId'
                label={labels.site}
                valueField='recordId'
                displayField={['reference', 'name']}
                maxAccess={maxAccess}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('siteId', newValue?.recordId || 0)
                  formik.setFieldValue('siteRef', newValue?.reference || '')
                  formik.setFieldValue('siteName', newValue?.name || '')
                }}
                required={formik.values.clientId}
                error={(formik.touched.sitId && Boolean(formik.errors.sitId)) || (clientId && !siteId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.Plant.qry}
                name='plantId'
                label={labels.plant}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('plantId', newValue?.recordId || 0)
                }}
                error={formik.touched.plantId && Boolean(formik.errors.plantId)}
                maxAccess={maxAccess}
              />
            </Grid>
          </Grid>
          <Grid item xs={4} container spacing={2} alignItems='center'>
            <Grid item xs={9}>
              <ResourceLookup
                endpointId={SaleRepository.SalesOrder.snapshot}
                parameters={{
                  _size: 30,
                  _startAt: 0
                }}
                valueField='reference'
                displayField='name'
                name='soId'
                label={labels.salesOrder}
                form={formik}
                required={formik.values.type === '2' || formik.values.type === 2}
                valueShow='soRef'
                secondDisplayField={false}
                maxAccess={maxAccess}
                onChange={async (event, newValue) => {
                  formik.setFieldValue('soId', newValue?.recordId || 0)
                  formik.setFieldValue('soRef', newValue?.reference || '')
                }}
                errorCheck={'soId'}
              />
            </Grid>
            <Grid item xs={3}>
              <CustomButton
                variant='contained'
                image={'preview.png'}
                label={platformLabels.Preview}
                onClick={() => getData()}
                color='#231f20'
              />
            </Grid>
          </Grid>
        </Grid>
      </Fixed>
      <Grow>
        <DataGrid
          onChange={value => formik.setFieldValue('items', value)}
          value={formik.values.items}
          error={formik.errors.items}
          columns={columns}
          name='items'
          allowDelete={false}
          allowAddNewLine={false}
          maxAccess={maxAccess}
        />
      </Grow>
      <Fixed>
        <WindowToolbar smallBox={true} actions={actions} />
      </Fixed>
    </VertLayout>
  )
}

export default UndeliveredItems
