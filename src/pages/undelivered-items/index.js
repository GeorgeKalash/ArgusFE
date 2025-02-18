import { useContext, useEffect } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import * as yup from 'yup'
import { useWindow } from 'src/windows'
import { ControlContext } from 'src/providers/ControlContext'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { Box, Button, Grid } from '@mui/material'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { useForm } from 'src/hooks/form'
import { SystemRepository } from 'src/repositories/SystemRepository'
import FormShell from 'src/components/Shared/FormShell'
import { SaleRepository } from 'src/repositories/SaleRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SystemFunction } from 'src/resources/SystemFunction'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { RGSaleRepository } from 'src/repositories/RGSaleRepository'
import { formatDateFromApi } from 'src/lib/date-helper'
import CustomCheckBox from 'src/components/Inputs/CustomCheckBox'
import WindowToolbar from 'src/components/Shared/WindowToolbar'

const UndeliveredItems = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { stack } = useWindow()

  const { formik } = useForm({
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
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      itemId: yup.string().required()
    })
  })

  const { labels, access } = useResourceQuery({
    datasetId: ResourceIds.UndeliveredItems
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

  const columns = [
    {
      component: 'checkbox',
      label: ' ',
      name: 'isChecked',
      flex: 0.5,
      checkAll: { visible: true, disabled: !!formik.values.clientId },
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
      label: labels.sku,
      name: 'sku',
      props: { readOnly: true }
    },
    {
      component: 'textfield',
      label: labels.itemName,
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
      props: { readOnly: true },
      updateOn: 'blur',
      propsReducer({ row, props }) {
        return { ...props, readOnly: !row.isChecked }
      },
      async onChange({ row: { update, newRow } }) {
        const { deliveryNow, balance } = newRow

        let value = deliveryNow

        if (deliveryNow > balance) {
          margin = (100 * (deliveryNow - balance)) / qty
          if (marginDefault == 0) value = balance
          else if (margin < marginDefault) value = deliveryNow
          else value = balance
        } else if (deliveryNow < 0) value = 0

        update({ deliverNow: value })
      }
    }
  ]

  console.log('formik', formik.values)

  const actions = [
    {
      key: 'ORD',
      condition: true,
      onClick: 'onORD',
      disabled: false
    }
  ]

  return (
    <FormShell resourceId={ResourceIds.UndeliveredItems} actions={actions} form={formik} maxAccess={access}>
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={3} container spacing={2}>
              <Grid item xs={12}>
                <ResourceComboBox
                  endpointId={SystemRepository.DocumentType.qry}
                  parameters={`_dgId=${SystemFunction.DeliveryOrder}&_startAt=${0}&_pageSize=${1000}`}
                  name='dtId'
                  label={labels.docType}
                  valueField='recordId'
                  displayField='name'
                  values={formik.values}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('dtId', newValue?.recordId || 0)
                  }}
                  error={formik.touched.dtId && Boolean(formik.errors.dtId)}
                  maxAccess={access}
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
                  required
                  values={formik?.values}
                  maxAccess={access}
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
                  maxAccess={access}
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
                  maxAccess={access}
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
                  name='sitId'
                  label={labels.incomeType}
                  valueField='recordId'
                  displayField={['reference', 'name']}
                  maxAccess={access}
                  columnsInDropDown={[
                    { key: 'reference', value: 'Reference' },
                    { key: 'name', value: 'Name' }
                  ]}
                  values={formik.values}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('sitId', newValue?.recordId || 0)
                    formik.setFieldValue('sitRef', newValue?.reference || '')
                    formik.setFieldValue('sitName', newValue?.name || '')
                  }}
                  error={formik.touched.incomeType && Boolean(formik.errors.incomeType)}
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
                  maxAccess={access}
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
                  label={labels.client}
                  form={formik}
                  required={formik.values.type === '2' || formik.values.type === 2}
                  valueShow='soRef'
                  secondDisplayField={false}
                  maxAccess={access}
                  onChange={async (event, newValue) => {
                    formik.setFieldValue('soId', newValue?.recordId || 0)
                    formik.setFieldValue('soRef', newValue?.reference || '')
                  }}
                  errorCheck={'clientId'}
                />
              </Grid>
              <Grid item xs={3}>
                <Button
                  sx={{ minWidth: '90px !important', pr: 2, ml: 2, height: 35 }}
                  variant='contained'
                  size='small'
                  onClick={() => getData()}
                >
                  {platformLabels.Apply}
                </Button>
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
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default UndeliveredItems
