import { Checkbox, FormControlLabel, Grid } from '@mui/material'
import { useContext, useEffect, useRef, useState } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'
import { SystemRepository } from 'src/repositories/SystemRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { formatDateFromApi } from 'src/lib/date-helper'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import { FinancialRepository } from 'src/repositories/FinancialRepository'
import { SystemFunction } from 'src/resources/SystemFunction'
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'
import { ControlContext } from 'src/providers/ControlContext'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { LogisticsRepository } from 'src/repositories/LogisticsRepository'
import { DataGrid } from 'src/components/Shared/DataGrid'

export default function MetalTrxFinancialForm({ labels, access, recordId, functionId, date }) {
  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: functionId,
    access: access,
    enabled: !recordId
  })

  const { platformLabels, defaultsData } = useContext(ControlContext)
  const [baseMetalId, setBaseMetalId] = useState(null)
  const [g22, setG22] = useState({})

  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: FinancialRepository.MetalReceiptVoucher.qry
  })

  const getEndpoint = functionId => {
    switch (functionId) {
      case SystemFunction.MetalReceiptVoucher:
        return FinancialRepository.MetalReceiptVoucher.set2R
      case SystemFunction.MetalPaymentVoucher:
        return FinancialRepository.MetalReceiptVoucher.set2P

      default:
        return null
    }
  }

  const { formik } = useForm({
    initialValues: {
      accountId: null,
      accountName: '',
      totalG22: null,
      totalLabor: null,
      totalQty: null,
      accountRef: '',
      batchId: null,
      collectorId: null,
      contactId: null,
      creditAmount: null,
      date: '',
      description: '',
      dtId: null,
      dtName: '',
      functionId: null,
      functionName: '',
      isVerified: null,
      plantId: null,
      plantName: '',
      plantRef: '',
      qty: null,
      recordId: null,
      reference: '',
      releaseStatus: null,
      siteId: null,
      siteName: '',
      siteRef: '',
      status: null,
      statusName: '',
      items: [
        {
          id: 1,
          baseMetalQty: null,
          creditAmount: null,
          stdPurity: null,
          itemId: null,
          itemName: '',
          metalId: null,
          metalRef: '',
          purity: null,
          qty: null,
          seqNo: null,
          sku: '',
          stdPurity: null,
          totalCredit: null,
          trackBy: null,
          trxId: null
        }
      ]
    },
    maxAccess,
    enableReinitialize: false,
    validateOnChange: true,

    onSubmit: async obj => {
      const { items, ...header } = obj

      const payload = {
        header,
        items: items.map(({ id, itemName, metalRef, ...rest }) => rest)
      }

      const response = await postRequest({
        extension: getEndpoint(parseInt(formik.values.functionId)),
        record: JSON.stringify(payload)
      })

      if (!obj.recordId) {
        toast.success(platformLabels.Added)
        formik.setValues({
          ...obj,
          recordId: response.recordId
        })
      } else {
        toast.success(platformLabels.Edited)
      }

      invalidate()
    }
  })
  const editMode = !!formik.values.recordId || !!recordId

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: FinancialRepository.MetalReceiptVoucher.get,
          parameters: `_trxId=${recordId}&_functionId=${functionId}`
        })

        const res2 = await getRequest({
          extension: FinancialRepository.MetalReceiptVoucher.get2,
          parameters: `_recordId=${recordId}&_functionId=${functionId}`
        })

        const modifiedList = res?.list?.map((item, index) => ({
          ...item,
          purity: item.purity && item.purity <= 1 ? item.purity * 1000 : item.purity,
          g22Value: (item.qty * item.purity) / (g22.purity * 1000) || null,

          id: index + 1
        }))

        formik.setValues({ ...res2.record, items: modifiedList })
      }

      const getDataResult = () => {
        const myObject = {}

        const filteredList = defaultsData?.list?.filter(obj => {
          return obj.key === 'baseSalesMetalId'
        })
        filteredList?.forEach(obj => (myObject[obj.key] = obj.value ? parseInt(obj.value) : null))
        setBaseMetalId(myObject.baseSalesMetalId)
      }
      getDataResult()
    })()
  }, [])

  const getResourceId = functionId => {
    switch (functionId) {
      case SystemFunction.MetalReceiptVoucher:
        return ResourceIds.MetalReceiptVoucher
      case SystemFunction.MetalPaymentVoucher:
        return ResourceIds.MetalPaymentVoucher

      default:
        return null
    }
  }
  const [allMetals, setAllMetals] = useState([])
  const filteredCreditCard = useRef()

  function getFilteredMetal(metalId) {
    if (!metalId) return []

    const array = allMetals.filter(metal => {
      return metal.metalId === metalId
    })

    return array
  }

  console.log(baseMetalId, 'baseMetalId')

  useEffect(() => {
    getRequest({
      extension: InventoryRepository.Scrap.qry,
      parameters: '_metalId=0'
    }).then(res => {
      setAllMetals(res.list)
      const matchedItem = res?.list.find(item => item.metalId === baseMetalId)
      console.log(matchedItem, 'G22matchedItem')

      if (matchedItem) {
        setG22(matchedItem)
      }
    })
  }, [baseMetalId])
  console.log(g22, 'G222')

  useEffect(() => {
    if (formik && formik.values && Array.isArray(formik.values.items)) {
      const items = formik.values.items

      const parseNumber = value => {
        const number = parseFloat(value)

        return isNaN(number) ? 0 : number
      }

      const totalQty = items.reduce((sum, item) => sum + parseNumber(item.qty), 0)
      const totalLabor = items.reduce((sum, item) => sum + parseNumber(item.totalCredit), 0)

      formik.setValues(prevValues => ({
        ...prevValues,
        totalLabor,
        totalQty
      }))
    }
  }, [formik.values.items])

  const columns = [
    {
      component: 'resourcecombobox',
      label: labels.metalId,
      name: 'metalId',
      props: {
        endpointId: InventoryRepository.Metals.qry,
        valueField: 'recordId',
        displayField: 'reference',
        displayFieldWidth: 1.5,
        mapping: [
          { from: 'reference', to: 'metalRef' },
          { from: 'recordId', to: 'metalId' },
          { from: 'purity', to: 'purity' },
          { from: 'purity', to: 'stdPurity' }
        ]
      },
      onChange: async ({ row: { update, newRow } }) => {
        filteredCreditCard.current = newRow.metalId

        if (newRow.purity) {
          update({ purity: newRow.purity * 1000, stdPurity: newRow.stdPurity * 1000 })
        }
      }
    },
    {
      component: 'resourcecombobox',
      label: labels.sku,
      name: 'sku',
      props: {
        store: getFilteredMetal(filteredCreditCard?.current),
        valueField: 'metalId',
        displayField: 'sku',
        mapping: [
          { from: 'itemName', to: 'itemName' },
          { from: 'metalId', to: 'itemId' },
          { from: 'sku', to: 'sku' },
          { from: 'purity', to: 'purity' },
          { from: 'laborValuePerGram', to: 'creditAmount' }
        ]
      },
      propsReducer({ row, props }) {
        return { ...props, store: getFilteredMetal(filteredCreditCard?.current) }
      },
      onChange: ({ row: { update, newRow } }) => {
        if (newRow.purity) {
          const totalCredit = newRow.purity
            ? newRow.qty * newRow.creditAmount
            : newRow.qty * newRow.creditAmount * (newRow.purity / newRow.stdPurity)
          update({ purity: newRow.purity * 1000, totalCredit })
        }
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
      component: 'textfield',
      label: labels.name,
      name: 'itemName',
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      name: 'purity',
      label: labels.purity,
      props: { readOnly: true },
      defaultValue: 0,
      onChange: ({ row: { update, newRow } }) => {
        const baseSalesMetalValue = (newRow.qty * newRow.purity) / (App.currentMetalPurity.getValue() * 1000)

        const totalCredit = newRow.purity
          ? newRow.qty * newRow.creditAmount
          : newRow.qty * newRow.creditAmount * (newRow.purity / newRow.stdPurity)

        update({ baseSalesMetalValue, totalCredit })
      }
    },
    {
      component: 'numberfield',
      name: 'qty',
      label: labels.qty,
      props: { allowNegative: false },
      defaultValue: 0,
      onChange: ({ row: { update, newRow } }) => {
        const totalCredit = newRow.purity
          ? newRow.qty * newRow.creditAmount
          : newRow.qty * newRow.creditAmount * (newRow.purity / newRow.stdPurity)
        update({ totalCredit })
        if (g22 && Object.keys(g22).length > 0) {
          const g22Value = (newRow.qty * newRow.purity) / (g22.purity * 1000)
          update({ g22Value: g22Value })
        }
      }
    },
    {
      component: 'numberfield',
      name: 'creditAmount',
      label: 'labor',
      props: { allowNegative: false, readOnly: true }
    },
    {
      component: 'numberfield',
      name: 'totalCredit',
      label: 'totalLabor',
      props: { allowNegative: false, readOnly: true }
    }
  ]
  if (g22.sku) {
    const qtyIndex = columns.findIndex(col => col.name === 'qty')
    if (qtyIndex !== -1) {
      columns.splice(qtyIndex + 1, 0, {
        component: 'numberfield',
        label: g22.sku,
        name: 'g22Value',
        props: {
          readOnly: true
        }
      })
    }
  }

  return (
    <FormShell
      resourceId={getResourceId(parseInt(formik.values.functionId))}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      functionId={formik.values.functionId}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={4}>
            <Grid item xs={4}>
              <ResourceComboBox
                endpointId={SystemRepository.DocumentType.qry}
                parameters={`_startAt=0&_pageSize=1000&_dgId=${functionId}`}
                name='dtId'
                readOnly={editMode}
                label={labels.doctype}
                valueField='recordId'
                displayField={['reference', 'name']}
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  changeDT(newValue)
                  formik && formik.setFieldValue('items.dtId', newValue?.recordId)
                }}
                error={formik.touched.dtId && Boolean(formik.errors.dtId)}
              />
            </Grid>
            <Grid item xs={2}>
              <ResourceComboBox
                endpointId={SystemRepository.Plant.qry}
                name='plantId'
                label={labels.plant}
                values={formik.values}
                valueField='recordId'
                displayField='reference'
                columnsInDropDown={[
                  { key: 'reference', value: 'Ref.' },
                  { key: 'name', value: 'Name' }
                ]}
                displayFieldWidth={3}
                required
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('plantId', newValue?.recordId || null)
                  formik.setFieldValue('plantName', newValue?.name || '')
                }}
                error={formik.touched.plantId && Boolean(formik.errors.plantId)}
              />
            </Grid>
            <Grid item xs={3}>
              <CustomTextField readOnly={true} name='plantName' value={formik.values.plantName} />
            </Grid>
            <Grid item xs={3}>
              <ResourceComboBox
                endpointId={formik.values?.accountId && FinancialRepository.Contact.qry}
                parameters={formik.values?.accountId && `_accountId=${formik.values?.accountId}`}
                name='contactId'
                readOnly={false}
                label={labels.contact}
                valueField='recordId'
                displayField={'name'}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('contactId', newValue?.recordId || null)
                }}
                error={formik.touched.contactId && Boolean(formik.errors.contactId)}
              />
            </Grid>
            <Grid item xs={4}>
              <CustomTextField
                name='reference'
                label={labels.reference}
                value={formik.values.reference}
                required
                readOnly={editMode}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('reference', '')}
                error={formik.touched.reference && Boolean(formik.errors.reference)}
              />
            </Grid>
            <Grid item xs={2}>
              <ResourceComboBox
                endpointId={InventoryRepository.Site.qry}
                name='siteId'
                label={labels.site}
                values={formik.values}
                valueField='recordId'
                displayField='reference'
                columnsInDropDown={[
                  { key: 'reference', value: 'Ref.' },
                  { key: 'name', value: 'Name' }
                ]}
                displayFieldWidth={3}
                required
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('siteId', newValue?.recordId || null)
                  formik.setFieldValue('siteName', newValue?.name || '')
                }}
                error={formik.touched.siteId && Boolean(formik.errors.siteId)}
              />
            </Grid>
            <Grid item xs={3}>
              <CustomTextField readOnly={true} name='siteName' value={formik.values.siteName} />
            </Grid>
            <Grid item xs={3}>
              <ResourceComboBox
                endpointId={LogisticsRepository.LoCollector.qry}
                name='collectorId'
                label={labels.collector}
                valueField='recordId'
                displayField='reference'
                values={formik.values}
                onChange={async (event, newValue) => {
                  formik.setFieldValue('collectorId', newValue?.recordId || '')
                }}
                error={formik.touched.collectorId && Boolean(formik.errors.collectorId)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={4}>
              <CustomDatePicker
                name='date'
                label={labels.date}
                value={formik.values.date}
                onChange={formik.setFieldValue}
                onClear={() => formik.setFieldValue('date', '')}
                error={false}
              />
            </Grid>
            <Grid item xs={2}>
              <ResourceLookup
                endpointId={FinancialRepository.Account.snapshot}
                name='accountId'
                readOnly={editMode}
                label={labels.accountReference}
                valueField='reference'
                displayField='reference'
                valueShow='accountRef'
                form={formik}
                secondDisplayField={false}
                filter={{ type: formik.values.accountType }}
                onChange={(event, newValue) => {
                  formik.setFieldValue('accountId', newValue?.recordId || '')
                  formik.setFieldValue('accountRef', newValue?.reference || '')
                  formik.setFieldValue('accountName', newValue?.name || '')
                }}
                error={formik.touched.accountId && Boolean(formik.errors.accountId)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={3}>
              <CustomTextField name='accountName' value={formik.values.accountName} readOnly={true} />
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <Grow>
            <DataGrid
              onChange={value => formik.setFieldValue('items', value)}
              value={formik.values.items}
              error={formik.errors.items}
              name='items'
              maxAccess={maxAccess}
              columns={columns}
            />
          </Grow>
        </Grow>
        <Fixed>
          <Grid container spacing={4}>
            <Grid item xs={2}>
              <CustomTextField label='totalQty' value={formik.values.totalQty} readOnly />
            </Grid>
            <Grid item xs={2}>
              <CustomTextField label='totalLabor' value={formik.values.totalLabor} readOnly />
            </Grid>
            <Grid item xs={2}>
              <CustomTextField label='totalG22' value={formik.values.totalG22} readOnly />
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}
