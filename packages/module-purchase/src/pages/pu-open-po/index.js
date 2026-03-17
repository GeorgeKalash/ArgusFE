import { useContext, useEffect } from 'react'
import toast from 'react-hot-toast'
import * as yup from 'yup'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import { Grid } from '@mui/material'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import { formatDateFromApi } from '@argus/shared-domain/src/lib/date-helper'
import CustomButton from '@argus/shared-ui/src/components/Inputs/CustomButton'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { useError } from '@argus/shared-providers/src/providers/error'
import { PurchaseRepository } from '@argus/repositories/src/repositories/PurchaseRepository'
import { ReportPuGeneratorRepository } from '@argus/repositories/src/repositories/ReportPuGeneratorRepository'
import ShipmentsForm from '../shipments/forms/ShipmentsForm'
import Form from '@argus/shared-ui/src/components/Shared/Form'
import { DefaultsContext } from '@argus/shared-providers/src/providers/DefaultsContext'

const OpenPurchaseOrder = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { systemDefaults } = useContext(DefaultsContext)
  const { stack } = useWindow()
  const { stack: stackError } = useError()

  const { labels, access } = useResourceQuery({
    datasetId: ResourceIds.OpenPOs
  })

  const defaultVat = systemDefaults?.list?.find(({ key }) => key === 'POSHPVarPct')

  const { formik } = useForm({
    maxAccess: access,
    initialValues: {
      recordId: null,
      dtId: null,
      groupId: 0,
      plantId: 0,
      siteId: 0,
      categoryId: 0,
      vendorId: 0,
      clientRef: '',
      clientName: '',
      itemId: 0,
      poId: 0,
      items: [],
      marginDefault: defaultVat?.value
    },
    validationSchema: yup.object({
      siteId: yup.number().required()
    }),
    validateOnChange: true,
    onSubmit: async obj => {
      const { vendorId, siteId, items, dtId, plantId } = obj

      const itemValues = items
        .filter(item => item.isChecked)
        .map(({ scheduledDate, functionId, id, isChecked, ...item }) => item)

      if (itemValues?.length < 1) {
        stackError({
          message: labels.checkItemsBeforeAppend
        })

        return
      }

      const res = await postRequest({
        extension: PurchaseRepository.Shipment.gen,
        record: JSON.stringify({ vendorId, siteId, dtId, plantId: plantId === 0 ? null : plantId, items: itemValues })
      })

      if (res.recordId) {
        const items = obj.items.map(({ isChecked, ...item }) => ({
          ...item,
          isChecked: false,
          receiveNow: 0
        }))
        formik.setFieldValue('items', items)
        stack({
          Component: ShipmentsForm,
          props: {
            recordId: res.recordId
          }
        })

        toast.success(platformLabels.Generated)
        getData()
      }
    }
  })

  const { groupId, plantId, siteId, categoryId, vendorId, itemId, marginDefault, poId } = formik.values

  useEffect(() => {
    getData()
  }, [vendorId, categoryId, groupId, poId, itemId])

  async function getData() {
    const result = await getRequest({
      extension: ReportPuGeneratorRepository.OpenPurchaseOrder.open,
      parameters: `_categoryId=${categoryId}&_siteId=${siteId}&_groupId=${groupId}&_vendorId=${vendorId}&_itemId=${itemId}&_plantId=${plantId}&_poId=${poId}`
    })

    const res = result?.list?.map((item, index) => ({
      ...item,
      id: index + 1,
      date: formatDateFromApi(item.date),
      balance: item.qty - item.receivedQty
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
        onChange({ checked }) {
          const items = formik.values.items.map(({ isChecked, ...item }) => ({
            ...item,
            isChecked: checked,
            receiveNow: checked ? item.balance : 0
          }))

          formik.setFieldValue('items', items)
        }
      },

      async onChange({ row: { update, newRow } }) {
        update({ receiveNow: newRow.isChecked ? newRow.balance : 0 })
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
      label: labels.sku,
      name: 'sku',
      props: { readOnly: true }
    },
    {
      component: 'textfield',
      label: labels.name,
      name: 'itemName',
      props: { readOnly: true }
    },
    {
      component: 'textfield',
      label: labels.vendor,
      name: 'vendorRef',
      props: { readOnly: true }
    },
    {
      component: 'textfield',
      label: labels.vendorName,
      name: 'vendorName',
      props: { readOnly: true }
    },
    {
      component: 'textfield',
      label: labels.mu,
      name: 'muRef',
      props: { readOnly: true }
    },
    {
      component: 'numberfield',
      label: labels.qty,
      name: 'qty',
      props: { readOnly: true }
    },
    {
      component: 'numberfield',
      label: labels.received,
      name: 'receivedQty',
      props: { readOnly: true }
    },
    {
      component: 'numberfield',
      label: labels.balance,
      name: 'balance',
      props: { readOnly: true, decimalScale: 2 }
    },
    {
      component: 'numberfield',
      label: labels.genQty,
      name: 'receiveNow',
      updateOn: 'blur',
      defaultValue: 0,
      propsReducer({ row, props }) {
        return { ...props, readOnly: !row.isChecked }
      },
      async onChange({ row: { update, newRow } }) {
        const { receiveNow, balance, qty } = newRow
        let value = receiveNow
        const maxValue = balance

        if (value > maxValue) {
          const margin = (100 * (value - balance)) / qty

          if (marginDefault == 0 || marginDefault == null) {
            value = maxValue
          } else {
            if (margin < marginDefault) {
              value = receiveNow
            } else {
              value = maxValue
            }
          }
        } else if (value < 0) {
          value = 0
        } else {
          value = receiveNow
        }

        update({ receiveNow: value || 0 })
      }
    }
  ]

  const actions = [
    {
      key: 'SHP',
      condition: true,
      onClick: () => formik.handleSubmit(),
      disabled: !vendorId || !siteId
    }
  ]

  return (
    <Form
      actions={actions}
      onSave={formik.handleSubmit}
      disabledSubmit={!vendorId || !siteId}
      isSaved={false}
      maxAccess={access}
      fullSize
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2} p={2}>
            <Grid item xs={4}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SystemRepository.DocumentType.qry}
                    parameters={`_dgId=${SystemFunction.Shipment}&_startAt=${0}&_pageSize=${1000}`}
                    name='dtId'
                    label={labels.documentType}
                    valueField='recordId'
                    displayField='name'
                    values={formik.values}
                    onChange={(_, newValue) => {
                      formik.setFieldValue('dtId', newValue?.recordId || null)
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
                    values={formik?.values}
                    maxAccess={access}
                    onChange={(_, newValue) => {
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
                    label={labels.group}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik.values}
                    onChange={(_, newValue) => {
                      formik.setFieldValue('groupId', newValue?.recordId || 0)
                    }}
                    error={formik.touched.groupId && Boolean(formik.errors.groupId)}
                    maxAccess={access}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={4}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceLookup
                    endpointId={PurchaseRepository.Vendor.snapshot}
                    filter={item => !item.isInactive}
                    valueField='reference'
                    displayField='name'
                    name='vendorId'
                    label={labels.vendor}
                    form={formik}
                    displayFieldWidth={2}
                    valueShow='vendorRef'
                    secondValueShow='vendorName'
                    maxAccess={access}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' },
                      { key: 'flName', value: 'Foreign Language' }
                    ]}
                    onChange={async (_, newValue) => {
                      formik.setFieldValue('vendorName', newValue?.name || '')
                      formik.setFieldValue('vendorRef', newValue?.reference || '')
                      formik.setFieldValue('vendorId', newValue?.recordId || 0)
                    }}
                    errorCheck={'vendorId'}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={InventoryRepository.Site.qry}
                    name='siteId'
                    label={labels.site}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    maxAccess={access}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    required
                    values={formik.values}
                    onChange={(_, newValue) => {
                      formik.setFieldValue('siteId', newValue?.recordId || 0)
                    }}
                    error={formik.touched.sitId && Boolean(formik.errors.sitId)}
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
                    onChange={(_, newValue) => {
                      formik.setFieldValue('plantId', newValue?.recordId || 0)
                    }}
                    error={formik.touched.plantId && Boolean(formik.errors.plantId)}
                    maxAccess={access}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={4}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceLookup
                    endpointId={InventoryRepository.Item.snapshot}
                    name='itemId'
                    label={labels.sku}
                    valueField='sku'
                    displayField='name'
                    valueShow='itemRef'
                    secondValueShow='itemName'
                    form={formik}
                    columnsInDropDown={[
                      { key: 'sku', value: 'SKU' },
                      { key: 'name', value: 'Name' }
                    ]}
                    onChange={(_, newValue) => {
                      formik.setFieldValue('itemId', newValue?.recordId || 0)
                      formik.setFieldValue('itemName', newValue?.name || '')
                      formik.setFieldValue('itemRef', newValue?.sku || '')
                      formik.setFieldValue('sku', newValue?.sku || '')
                    }}
                    displayFieldWidth={2}
                    maxAccess={access}
                  />
                </Grid>
                <Grid item xs={10}>
                  <ResourceLookup
                    endpointId={PurchaseRepository.UnpostedOrderPack.snapshot}
                    valueField='reference'
                    displayField='name'
                    name='poId'
                    label={labels.ref}
                    form={formik}
                    secondDisplayField={false}
                    displayFieldWidth={2}
                    valueShow='poRef'
                    maxAccess={access}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    onChange={async (_, newValue) => {
                      formik.setFieldValue('poName', newValue?.name || '')
                      formik.setFieldValue('poRef', newValue?.reference || '')
                      formik.setFieldValue('poId', newValue?.recordId || 0)
                    }}
                    errorCheck={'poId'}
                  />
                </Grid>
                <Grid item xs={2}>
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
            maxAccess={access}
          />
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default OpenPurchaseOrder
