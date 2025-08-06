import { useContext, useEffect } from 'react'
import toast from 'react-hot-toast'
import * as yup from 'yup'
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
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { formatDateFromApi } from 'src/lib/date-helper'
import WindowToolbar from 'src/components/Shared/WindowToolbar'
import { useWindow } from 'src/windows'
import { useError } from 'src/error'
import { PurchaseRepository } from 'src/repositories/PurchaseRepository'
import { ReportPuGeneratorRepository } from 'src/repositories/ReportPuGeneratorRepository'
import ShipmentsForm from '../shipments/forms/ShipmentsForm'
import { companyStructureRepository } from 'src/repositories/companyStructureRepository'
import { FinancialRepository } from 'src/repositories/FinancialRepository'

const OpenPurchaseRequisition = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels, defaultsData } = useContext(ControlContext)
  const { stack } = useWindow()
  const { stack: stackError } = useError()

  const { labels, access } = useResourceQuery({
    datasetId: ResourceIds.OpenPRs
  })

  const { labels: _labels, access: maxAccess } = useResourceQuery({
    datasetId: ResourceIds.Shipments
  })

  const defaultVat = defaultsData?.list?.find(({ key }) => key === 'POSHPVarPct')

  const { formik } = useForm({
    maxAccess: access,
    initialValues: {
      recordId: null,
      dtId: null,
      groupId: 0,
      departmentId: 0,
      siteId: 0,
      categoryId: 0,
      vendorId: 0,
      clientRef: '',
      clientName: '',
      itemId: 0,
      prId: 0,
      items: [],
      marginDefault: defaultVat?.value
    },
    validationSchema: yup.object({
      siteId: yup.number().required()
    }),
    validateOnChange: true,
    onSubmit: async obj => {
      const { vendorId, currencyId, items, taxId } = obj

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
        extension: PurchaseRepository.GeneratePOPRPack.generate,
        record: JSON.stringify({
          vendorId,
          currencyId,
          taxId,
          items: itemValues
        })
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
            labels: _labels,
            recordId: res.recordId,
            maxAccess,
            currencyId,
            taxId
          },
          width: 1300,
          height: 700,
          title: _labels.shipment
        })

        toast.success(platformLabels.Generated)
        getData()
      }
    }
  })

  const { groupId, departmentId, categoryId, vendorId, currencyId, itemId, marginDefault, prId } = formik.values

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
      name: 'baseQty',
      props: { readOnly: true, decimalScale: 2 }
    },
    {
      component: 'numberfield',
      label: labels.genQty,
      name: 'orderNow',
      updateOn: 'blur',
      defaultValue: 0,
      propsReducer({ row, props }) {
        return { ...props, readOnly: !row.isChecked }
      },
      async onChange({ row: { update, newRow } }) {
        const { orderNow, balance, qty } = newRow
        let value = orderNow
        const maxValue = balance

        if (value > maxValue) {
          const margin = (100 * (value - balance)) / qty

          if (marginDefault == 0 || marginDefault == null) {
            value = maxValue
          } else {
            if (margin < marginDefault) {
              value = orderNow
            } else {
              value = maxValue
            }
          }
        } else if (value < 0) {
          value = 0
        } else {
          value = orderNow
        }

        update({ orderNow: value || 0 })
      }
    }
  ]

  const onGenerate = async () => {
    await postRequest({
      extension: PurchaseRepository.GenerateQTNPRPack.generate,
      record: JSON.stringify(formik.values)
    })

    toast.success(platformLabels.Generated)
    invalidate()
  }

  const handleSubmit = e => {
    setTimeout(() => {
      formik.handleSubmit()
    }, 5)
  }

  const actions = [
    {
      key: 'generate',
      condition: true,
      onClick: onGenerate,
      disabled: !vendorId || !currencyId
    },
    {
      key: 'SHP',
      condition: true,
      onClick: handleSubmit,
      disabled: !vendorId || !currencyId
    }
  ]

  return (
    <VertLayout>
      <Fixed>
        <Grid container spacing={2} padding={2}>
          <Grid item xs={4}>
            <Grid container spacing={2}>
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
                  maxAccess={maxAccess}
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
                  required
                  maxAccess={maxAccess}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('currencyId', newValue?.recordId || 0)
                  }}
                  error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
                />
              </Grid>
              <Grid item xs={12}>
                <ResourceLookup
                  endpointId={PurchaseRepository.UnpostedOrderPack.snapshot}
                  valueField='reference'
                  displayField='name'
                  name='prId'
                  label={labels.ref}
                  form={formik}
                  secondDisplayField={false}
                  displayFieldWidth={2}
                  valueShow='poRef'
                  maxAccess={maxAccess}
                  columnsInDropDown={[
                    { key: 'reference', value: 'Reference' },
                    { key: 'name', value: 'Name' }
                  ]}
                  onChange={async (event, newValue) => {
                    formik.setFieldValue('poName', newValue?.name || '')
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
                  displayField='name'
                  maxAccess={maxAccess}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('departmentId', newValue?.recordId || null)
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
                    formik.setFieldValue('taxId', newValue ? newValue.recordId : '')
                  }}
                  error={formik.touched.taxId && Boolean(formik.errors.taxId)}
                  maxAccess={maxAccess}
                />
              </Grid>
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
                  onChange={(event, newValue) => {
                    formik.setFieldValue('itemId', newValue?.recordId || 0)
                    formik.setFieldValue('itemName', newValue?.name || '')
                    formik.setFieldValue('itemRef', newValue?.sku || '')
                    formik.setFieldValue('sku', newValue?.sku || '')
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
      <Fixed>
        <WindowToolbar smallBox={true} actions={actions} />
      </Fixed>
    </VertLayout>
  )
}

export default OpenPurchaseRequisition
