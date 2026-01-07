import { useContext, useEffect } from 'react'
import toast from 'react-hot-toast'
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
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import { formatDateFromApi } from '@argus/shared-domain/src/lib/date-helper'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { useError } from '@argus/shared-providers/src/providers/error'
import { PurchaseRepository } from '@argus/repositories/src/repositories/PurchaseRepository'
import { ReportPuGeneratorRepository } from '@argus/repositories/src/repositories/ReportPuGeneratorRepository'
import { companyStructureRepository } from '@argus/repositories/src/repositories/companyStructureRepository'
import { FinancialRepository } from '@argus/repositories/src/repositories/FinancialRepository'
import PuQtnForm from '../pu-qtn/forms/PuQtnForm'
import PurchaseOrderForm from '@argus/shared-ui/src/components/Shared/Forms/PurchaseOrderForm'
import Form from '@argus/shared-ui/src/components/Shared/Form'

const OpenPurchaseRequisition = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()
  const { stack: stackError } = useError()

  const { labels, access } = useResourceQuery({
    datasetId: ResourceIds.OpenPRs
  })

  function checkItems(items) {
    if (items?.length < 1) {
      stackError({
        message: labels.checkItemsBeforeAppend
      })

      return false
    }

    return true
  }

  function getItems(items) {
    return items.filter(item => item?.isChecked).map(({ scheduledDate, functionId, id, isChecked, ...item }) => item)
  }

  const { formik } = useForm({
    maxAccess: access,
    initialValues: {
      recordId: null,
      groupId: 0,
      departmentId: 0,
      categoryId: 0,
      vendorId: 0,
      clientRef: '',
      clientName: '',
      itemId: 0,
      prId: 0,
      items: []
    },
    validateOnChange: true,
    onSubmit: async obj => {
      const { vendorId, currencyId, items, taxId } = obj

      const itemValues = getItems(items)

      if (!checkItems(itemValues)) {
        return
      }

      const res = await postRequest({
        extension: PurchaseRepository.GeneratePOPRPack.gen,
        record: JSON.stringify({
          vendorId,
          currencyId,
          taxId,
          items: itemValues
        })
      })

      if (res.recordId) {
        stack({
          Component: PurchaseOrderForm,
          props: {
            recordId: res.recordId
          }
        })

        toast.success(platformLabels.Generated)

        getData()
      }
    }
  })

  const { groupId, departmentId, categoryId, vendorId, currencyId, itemId, prId } = formik.values

  useEffect(() => {
    getData()
  }, [categoryId, groupId, prId, itemId, departmentId])

  async function getData() {
    const result = await getRequest({
      extension: ReportPuGeneratorRepository.OpenPurchaseRequisition.open,
      parameters: `_categoryId=${categoryId}&_groupId=${groupId}&_itemId=${itemId}&_departmentId=${departmentId}&_prId=${prId}`
    })

    const res = result?.list?.map((item, index) => ({
      ...item,
      id: index + 1,
      date: formatDateFromApi(item.date),
      balance: item.qty - item.orderedQty
    }))

    formik.setFieldValue('items', res || [])
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
            orderNow: checked ? item.balance : 0
          }))

          formik.setFieldValue('items', items)
        }
      },

      async onChange({ row: { update, newRow } }) {
        update({ orderNow: newRow.isChecked ? newRow.balance : 0 })
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
      label: labels.department,
      name: 'departmentName',
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
      label: labels.ordered,
      name: 'orderedQty',
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
      name: 'orderNow',
      updateOn: 'blur',
      props: {
        allowNegative: false
      },
      propsReducer({ row, props }) {
        return { ...props, readOnly: !row.isChecked }
      },
      async onChange({ row: { update, newRow } }) {
        const { orderNow, balance } = newRow
        const value = orderNow <= balance ? orderNow : balance

        update({ orderNow: value || 0 })
      }
    }
  ]

  const onGenerate = async () => {
    const { vendorId, currencyId, items, taxId } = formik.values

    const itemValues = getItems(items)

    if (!checkItems(itemValues)) {
      return
    }

    const response = await postRequest({
      extension: PurchaseRepository.GenerateQTNPRPack.gen,
      record: JSON.stringify({ vendorId, currencyId, taxId, items: itemValues })
    })

    toast.success(platformLabels.Generated)

    if (response.recordId)
      stack({
        Component: PuQtnForm,
        props: {
          recordId: response.recordId
        }
      })

    getData()
  }

  const actions = [
    {
      key: 'generateQTN',
      condition: true,
      onClick: onGenerate,
      disabled: !vendorId || !currencyId
    },
    {
      key: 'generatePO',
      condition: true,
      onClick: () => formik.handleSubmit(),
      disabled: !vendorId || !currencyId
    }
  ]

  return (
    <Form
      actions={actions}
      onSave={formik.handleSubmit}
      disabledSubmit={!vendorId || !currencyId}
      fullSize
      maxAccess={access}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2} p={2}>
            <Grid item xs={4}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={InventoryRepository.Category.qry}
                    parameters='_pagesize=30&_startAt=0&_name='
                    name='categoryId'
                    label={labels.category}
                    valueField='recordId'
                    displayField='name'
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
                    label={labels.group}
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
                    onChange={async (event, newValue) => {
                      formik.setFieldValue('vendorName', newValue?.name || '')
                      formik.setFieldValue('vendorRef', newValue?.reference || '')
                      formik.setFieldValue('vendorId', newValue?.recordId || 0)
                    }}
                    errorCheck={'vendorId'}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SystemRepository.Currency.qry}
                    name='currencyId'
                    label={labels.currency}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik.values}
                    maxAccess={access}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('currencyId', newValue?.recordId || 0)
                    }}
                    error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceLookup
                    endpointId={PurchaseRepository.PurchaseRequisition.snapshot}
                    valueField='reference'
                    name='prId'
                    label={labels.ref}
                    form={formik}
                    secondDisplayField={false}
                    valueShow='poRef'
                    maxAccess={access}
                    onChange={async (event, newValue) => {
                      formik.setFieldValue('poRef', newValue?.reference || '')
                      formik.setFieldValue('prId', newValue?.recordId || 0)
                    }}
                    errorCheck={'prId'}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={4}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={companyStructureRepository.DepartmentFilters.qry}
                    parameters={`_filter=&_size=1000&_startAt=0&_type=0&_activeStatus=0&_sortBy=recordId`}
                    name='departmentId'
                    label={labels.department}
                    values={formik.values}
                    displayField={['departmentRef', 'name']}
                    columnsInDropDown={[
                      { key: 'departmentRef', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    maxAccess={access}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('departmentId', newValue?.recordId || 0)
                    }}
                    error={formik.touched.departmentId && Boolean(formik.errors.departmentId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={FinancialRepository.TaxSchedules.qry}
                    name='taxId'
                    label={labels.tax}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik.values}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('taxId', newValue.recordId || null)
                    }}
                    error={formik.touched.taxId && Boolean(formik.errors.taxId)}
                    maxAccess={access}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceLookup
                    endpointId={InventoryRepository.Item.snapshot}
                    name='itemId'
                    label={labels.sku}
                    valueField='sku'
                    displayField='name'
                    valueShow='sku'
                    secondValueShow='itemName'
                    form={formik}
                    columnsInDropDown={[
                      { key: 'sku', value: 'SKU' },
                      { key: 'name', value: 'Name' }
                    ]}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('itemName', newValue?.name || '')
                      formik.setFieldValue('sku', newValue?.sku || '')
                      formik.setFieldValue('itemId', newValue?.recordId || 0)
                    }}
                    displayFieldWidth={2}
                    maxAccess={access}
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

export default OpenPurchaseRequisition
