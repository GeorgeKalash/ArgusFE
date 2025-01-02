import { Checkbox, FormControlLabel, Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
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

  console.log(formatDateFromApi(date), 'datttttttttteeeeeeeee')

  const { platformLabels } = useContext(ControlContext)

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
      if (!obj.recordId) {
        obj.baseAmount = obj.amount
        obj.status = 1
        obj.rateCalcMethod = 1
        obj.exRate = 1
      }

      const response = await postRequest({
        extension: getEndpoint(parseInt(formik.values.functionId)),
        record: JSON.stringify(obj)
      })

      if (!obj.recordId) {
        toast.success(platformLabels.Added)
        formik.setValues({
          ...obj,
          baseAmount: obj.amount,

          recordId: response.recordId
        })
      } else {
        toast.success(platformLabels.Edited)
      }

      try {
        const res = await getRequest({
          extension: FinancialRepository.MetalReceiptVoucher.get,
          parameters: `_recordId=${response.recordId}`
        })

        formik.setFieldValue('reference', res.record.reference)
      } catch (error) {}
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
        console.log(res.list, 'ressssss')

        formik.setFieldValue('items', res.list)
        formik.setValues({
          ...formik.values,
          ...res2.record,
          date: formatDateFromApi(res2.record.date)
        })
      }
    })()
  }, [])

  console.log(formik.values, 'aaaaaa')

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
          { from: 'name', to: 'purcRateTypeName' },
          { from: 'reference', to: 'purcRateTypeRef' },
          { from: 'recordId', to: 'purcRateTypeId' }
        ]
      }
    },
    {
      component: 'textfield',
      label: labels.controlName,
      name: 'name',
      props: {
        readOnly: true
      }
    }
  ]

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
            {/* <DataGrid
              onChange={value => formik.setFieldValue('items', value)}
              value={formik.values.items}
              error={formik.errors.items}
              name='items'
              maxAccess={maxAccess}
              columns={columns}
            /> */}
          </Grow>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
