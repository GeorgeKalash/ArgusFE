import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import { Grid, FormControlLabel, Checkbox } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { useFormik } from 'formik'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { SystemFunction } from 'src/resources/SystemFunction'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { SaleRepository } from 'src/repositories/SaleRepository'
import { FinancialRepository } from 'src/repositories/FinancialRepository'

export default function SalesOrderForm({ labels, maxAccess, recordId, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)

  const initialValues = {
    recordId: recordId || null,
    dtId: '',
    reference: '',
    date: new Date(),
    plantId: '',
    clientId: '',
    currencyId: '',
    szId: '',
    spId: '',
    siteId: '',
    description: '',
    status: '',
    releaseStatus: '',
    wip: '',
    deliveryStatus: '',
    printStatusName: '',
    isVattable: false,
    exWorks: false,
    taxId: '',
    shipAddress: '',
    billAddress: '',
    subtotal: '',
    tdValue: '',
    miscAmount: '',
    amount: '',
    vatAmount: '',
    overdraft: false,
    itemRows: [
      {
        id: 1,
        itemId: '',
        sku: '',
        itemName: '',
        seqNo: '',
        siteId: '',
        muId: '',
        qty: '',
        volume: '',
        weight: '',
        basePrice: '',
        unitPrice: '',
        overheadId: '',
        vatAmount: '',
        mdAmount: '',
        upo: '',
        extendedPrice: '',
        notes: ''
      }
    ]
  }

  const invalidate = useInvalidate({
    endpointId: SaleRepository.SalesOrder.qry
  })

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      siteId: yup.string().required('This field is required')
    }),
    onSubmit: async obj => {
      window.close()
    }
  })
  const isPosted = formik.values.status == 3
  const editMode = !formik.values.recordId

  const totalQty = formik.values.itemRows.reduce((qtySum, row) => {
    const qtyValue = parseFloat(row.qty) || 0

    return qtySum + qtyValue
  }, 0)

  const totalVolume = formik.values.itemRows.reduce((volumeSum, row) => {
    const volumeValue = parseFloat(row.volume) || 0

    return volumeSum + volumeValue
  }, 0)

  const totalWeight = formik.values.itemRows.reduce((weightSum, row) => {
    const weightValue = parseFloat(row.weight) || 0

    return weightSum + weightValue
  }, 0)

  const columns = [
    {
      component: 'resourcelookup',
      label: labels.sku,
      name: 'sku',
      props: {
        endpointId: InventoryRepository.Item.snapshot,
        parameters: '_categoryId=0&_msId=0&_startAt=0&_size=1000',
        displayField: 'sku',
        valueField: 'recordId',
        mapping: [
          { from: 'recordId', to: 'itemId' },
          { from: 'sku', to: 'sku' },
          { from: 'name', to: 'itemName' }
        ],
        columnsInDropDown: [
          { key: 'sku', value: 'SKU' },
          { key: 'name', value: 'Item Name' }
        ],
        displayFieldWidth: 2
      }
    },
    {
      component: 'textfield',
      label: labels.name,
      name: 'itemName',
      props: {
        readOnly: true
      }
    },
    {
      component: 'resourcecombobox',
      label: labels.site,
      name: 'siteRef',
      props: {
        endpointId: InventoryRepository.Site.qry,
        displayField: 'reference',
        valueField: 'recordId',
        mapping: [
          { from: 'recordId', to: 'siteId' },
          { from: 'reference', to: 'siteRef' },
          { from: 'name', to: 'siteName' }
        ],
        columnsInDropDown: [
          { key: 'reference', value: 'Reference' },
          { key: 'name', value: 'Name' }
        ],
        displayFieldWidth: 3
      }
    },
    {
      component: 'textfield',
      label: labels.measurementUnit,
      name: 'muRef'
    },
    {
      component: 'numberfield',
      label: labels.quantity,
      name: 'qty'
    },
    {
      component: 'numberfield',
      label: labels.volume,
      name: 'volume'
    },
    {
      component: 'numberfield',
      label: labels.weight,
      name: 'weight'
    },
    {
      component: 'numberfield',
      label: labels.basePrice,
      name: 'basePrice'
    },
    {
      component: 'numberfield',
      label: labels.unitPrice,
      name: 'unitPrice'
    },
    {
      component: 'numberfield',
      label: labels.upo,
      name: 'upo'
    },
    {
      component: 'numberfield',
      label: labels.VAT,
      name: 'vatAmount'
    },
    {
      component: 'numberfield',
      label: labels.tax,
      name: 'taxId'
    },
    {
      component: 'numberfield',
      label: labels.mdAmount,
      name: 'mdAmount'
    },
    {
      component: 'numberfield',
      label: labels.sales,
      name: 'salesTrx'
    },
    {
      component: 'numberfield',
      label: labels.extendedPrice,
      name: 'extendedPrice'
    },
    {
      component: 'textfield',
      label: labels.notes,
      name: 'notes'
    }
  ]

  const fillForm = async (soHeader, soItems) => {
    const modifiedList = soItems.list.map((item, index) => ({
      ...item,
      id: index + 1
    }))
    console.log('check data ', soHeader.record, modifiedList)
    formik.setValues({
      ...formik.values,
      ...soHeader.record,
      itemRows: modifiedList
    })
  }

  const getSalesOrder = async soId => {
    const res = await getRequest({
      extension: SaleRepository.SalesOrder.get,
      parameters: `_recordId=${soId}`
    })
    res.record.date = formatDateFromApi(res.record.date)

    return res
  }

  const getSalesOrderItems = async (soId, trxId) => {
    const res = await getRequest({
      extension: SaleRepository.SalesOrderItem.qry,
      parameters: `_recordId=${soId}&_params=1|${trxId}`
    })

    return res
  }

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const soHeader = await getSalesOrder(recordId)
        const soItems = await getSalesOrderItems(recordId, soHeader.record.status)
        fillForm(soHeader, soItems)
      }
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.SalesOrder} form={formik} maxAccess={maxAccess}>
      <VertLayout>
        <Fixed>
          <Grid container xs={12}>
            <Grid
              container
              xs={8}
              direction='column'
              spacing={2}
              sx={{ overflowX: 'auto', flexWrap: 'nowrap', pt: '5px' }}
            >
              <Grid
                container
                xs={12}
                direction='row'
                spacing={2}
                sx={{ overflowX: 'auto', flexWrap: 'nowrap', pl: '8px' }}
              >
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SystemRepository.DocumentType.qry}
                    parameters={`_startAt=0&_pageSize=1000&_dgId=${SystemFunction.SalesOrder}`}
                    name='dtId'
                    label={labels.documentType}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    readOnly={isPosted}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    values={formik.values}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('dtId', newValue ? newValue.recordId : null)
                    }}
                    error={formik.touched.dtId && Boolean(formik.errors.dtId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SaleRepository.SalesPerson.qry}
                    name='spId'
                    label={labels.salesPerson}
                    columnsInDropDown={[
                      { key: 'spRef', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    valueField='recordId'
                    displayField='name'
                    values={formik.values}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('spId', newValue ? newValue.recordId : null)
                    }}
                    error={formik.touched.spId && Boolean(formik.errors.spId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  {/* Items.Items.Where(x => x.currencyType == 1).ToList() fiat money only are shown */}
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
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('currencyId', newValue?.recordId || null)
                    }}
                    error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
                  />
                </Grid>
              </Grid>
              {/* 2nd row */}
              <Grid
                container
                xs={12}
                direction='row'
                spacing={2}
                sx={{ overflowX: 'auto', flexWrap: 'nowrap', pl: '8px' }}
              >
                <Grid item xs={12}>
                  <CustomTextField
                    name='reference'
                    label='ref'
                    value={formik?.values?.reference}
                    maxAccess={maxAccess}
                    maxLength='30'
                    readOnly={isPosted}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('reference', '')}
                    error={formik.touched.reference && Boolean(formik.errors.reference)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomDatePicker
                    name='date'
                    label='date'
                    readOnly={isPosted}
                    value={formik?.values?.date}
                    onChange={formik.handleChange}
                    maxAccess={maxAccess}
                    onClear={() => formik.setFieldValue('date', '')}
                    error={formik.touched.date && Boolean(formik.errors.date)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SystemRepository.Plant.qry}
                    name='plantId'
                    label={labels.plant}
                    readOnly={isPosted}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik.values}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('plantId', newValue ? newValue.recordId : null)
                    }}
                    error={formik.touched.plantId && Boolean(formik.errors.plantId)}
                  />
                </Grid>
              </Grid>
            </Grid>
            {/* 2nd col */}
            <Grid container xs={4} direction='column' spacing={2} sx={{ flexWrap: 'nowrap', pl: '5px' }}>
              <Grid container xs={12} direction='row' spacing={2} sx={{ flexWrap: 'nowrap' }}>
                <Grid item xs={12}>
                  <CustomTextArea
                    name='shipAddress'
                    label={labels.shipTo}
                    value={formik.values.shipAddress}
                    rows={3}
                    maxLength='100'
                    maxAccess={maxAccess}
                    onChange={e => formik.setFieldValue('shipAddress', e.target.value)}
                    onClear={() => formik.setFieldValue('shipAddress', '')}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextArea
                    name='BillAddress'
                    label='bill to'
                    value={formik.values.billAddress}
                    rows={3}
                    maxLength='100'
                    maxAccess={maxAccess}
                    onChange={e => formik.setFieldValue('BillAddress', e.target.value)}
                    onClear={() => formik.setFieldValue('BillAddress', '')}
                  />
                </Grid>
              </Grid>
            </Grid>
            {/* 3rd row */}
            <Grid
              container
              xs={12}
              direction='row'
              spacing={2}
              sx={{ overflow: 'hidden', flexWrap: 'nowrap', pt: '5px' }}
            >
              <Grid item xs={12}>
                <ResourceLookup
                  endpointId={SaleRepository.Client.snapshot}
                  valueField='reference'
                  displayField='name'
                  name='clientId'
                  label={labels.client}
                  form={formik}
                  required
                  readOnly={isPosted || editMode}
                  displayFieldWidth={2}
                  valueShow='clientRef'
                  secondValueShow='clientName'
                  maxAccess={maxAccess}
                  editMode={editMode}
                  onChange={async (event, newValue) => {}}
                  errorCheck={'clientId'}
                />
              </Grid>
              <Grid item xs={2}>
                <FormControlLabel
                  control={<Checkbox name='vat' checked={formik.values?.isVattable} onChange={formik.handleChange} />}
                  label='VAT'
                />
              </Grid>
              <Grid item xs={6}>
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
              <Grid item xs={6}>
                <ResourceComboBox
                  endpointId={InventoryRepository.Site.qry}
                  name='siteId'
                  readOnly={isPosted}
                  label={labels.site}
                  columnsInDropDown={[
                    { key: 'reference', value: 'Reference' },
                    { key: 'name', value: 'Name' }
                  ]}
                  values={formik.values}
                  valueField='recordId'
                  displayField={['reference', 'name']}
                  required
                  maxAccess={maxAccess}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('siteId', newValue ? newValue.recordId : null)
                  }}
                  error={formik.touched.siteId && Boolean(formik.errors.siteId)}
                />
              </Grid>
              <Grid item xs={6}>
                <ResourceComboBox
                  endpointId={SaleRepository.SalesZone.qry}
                  parameters={`_startAt=0&_pageSize=1000&_sortField="recordId"&_filter=`}
                  name='szId'
                  label={labels.saleZone}
                  columnsInDropDown={[{ key: 'name', value: 'Name' }]}
                  valueField='recordId'
                  displayField='name'
                  values={formik.values}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('szId', newValue ? newValue.recordId : null)
                  }}
                  error={formik.touched.szId && Boolean(formik.errors.szId)}
                />
              </Grid>
              <Grid item xs={4}>
                <FormControlLabel
                  control={<Checkbox name='exWorks' checked={formik.values?.exWorks} onChange={formik.handleChange} />}
                  label={labels.exWorks}
                />
              </Grid>
            </Grid>
          </Grid>
        </Fixed>

        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('itemRows', value)}
            value={formik.values.itemRows}
            error={formik.errors.itemRows}
            columns={columns}
          />
        </Grow>

        <Fixed>
          <Grid container rowGap={1} xs={12}>
            {/* First Column (moved to the left) */}
            <Grid container rowGap={1} xs={6} style={{ marginTop: '10px' }}>
              <Grid item xs={12} sx={{ pr: '5px' }}>
                <CustomTextArea
                  name='description'
                  label='notes'
                  value={formik.values.description}
                  rows={3}
                  editMode={editMode}
                  maxAccess={maxAccess}
                  onChange={e => formik.setFieldValue('description', e.target.value)}
                  onClear={() => formik.setFieldValue('description', '')}
                  error={formik.touched.description && Boolean(formik.errors.description)}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox name='overdraft' checked={formik.values?.overdraft} onChange={formik.handleChange} />
                  }
                  label={labels.overdraft}
                />
              </Grid>
            </Grid>

            {/* Second Column  */}
            <Grid
              container
              direction='row'
              xs={6}
              spacing={2}
              sx={{ overflow: 'hidden', flexWrap: 'nowrap', pt: '5px' }}
            >
              {/* First Column */}
              <Grid container item xs={6} direction='column' spacing={2} sx={{ px: 2, mt: 1 }}>
                <Grid item>
                  <CustomNumberField name='totalQTY' label={labels.totQty} value={totalQty} readOnly />
                </Grid>
                <Grid item>
                  <CustomNumberField
                    name='totVolume'
                    maxAccess={maxAccess}
                    label={labels.totVolume}
                    value={totalVolume}
                    readOnly
                  />
                </Grid>
                <Grid item>
                  <CustomNumberField
                    name='totWeight'
                    maxAccess={maxAccess}
                    label={labels.totWeight}
                    value={totalWeight}
                    readOnly
                  />
                </Grid>
              </Grid>

              {/* Second Column */}
              <Grid container item xs={6} direction='column' spacing={2} sx={{ px: 2, mt: 1 }}>
                <Grid item>
                  <CustomNumberField
                    name='subTotal'
                    maxAccess={maxAccess}
                    label={labels.subtotal}
                    value={formik.values.subtotal}
                    readOnly
                  />
                </Grid>
                <Grid item>
                  <CustomNumberField
                    name='discount'
                    maxAccess={maxAccess}
                    label={labels.discount}
                    value={formik.values.tdValue}
                    readOnly
                  />
                </Grid>
                <Grid item>
                  <CustomNumberField
                    name='misc'
                    maxAccess={maxAccess}
                    label={labels.misc}
                    value={formik.values.miscAmount}
                    readOnly
                  />
                </Grid>
                <Grid item>
                  <CustomNumberField
                    name='vat'
                    maxAccess={maxAccess}
                    label={labels.VAT}
                    value={formik.values.vatAmount}
                    readOnly
                  />
                </Grid>
                <Grid item>
                  <CustomNumberField
                    name='net'
                    maxAccess={maxAccess}
                    label={labels.net}
                    value={formik.values.amount}
                    readOnly
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}
