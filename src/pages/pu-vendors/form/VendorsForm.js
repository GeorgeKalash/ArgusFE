import { Grid, FormControlLabel, Checkbox } from '@mui/material'
import { useContext, useEffect } from 'react'
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
import { ControlContext } from 'src/providers/ControlContext'
import { FinancialRepository } from 'src/repositories/FinancialRepository'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { DataSets } from 'src/resources/DataSets'
import { PurchaseRepository } from 'src/repositories/PurchaseRepository'
import { useFieldBehavior } from 'src/hooks/useFieldBehaviors'
import CustomCheckBox from 'src/components/Inputs/CustomCheckBox'

export default function VendorsForm({ labels, maxAccess: access, recordId, setStore }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: PurchaseRepository.Vendor.page
  })

  const { maxAccess, changeDT } = useFieldBehavior({
    access: access,
    editMode: !!recordId
  })

  const { formik } = useForm({
    initialValues: {
      recordId: recordId,
      reference: '',
      name: '',
      flName: '',
      currencyId: '',
      paymentMethod: '',
      tradeDiscount: '',
      keywords: '',
      groupId: '',
      status: '',
      taxId: '',
      taxRef: '',
      isInactive: false,
      isTaxable: false
    },
    maxAccess,
    enableReinitialize: true,
    validateOnChange: true,
    validate: values => {
      const errors = {}

      if (values.isTaxable && !values.taxRef) {
        errors.taxRef = ' '
      }

      return errors
    },
    validationSchema: yup.object().shape({
      name: yup.string().required()
    }),
    onSubmit: async obj => {
      try {
        const response = await postRequest({
          extension: PurchaseRepository.Vendor.set,
          record: JSON.stringify(obj)
        })

        if (!obj.recordId) {
          setStore({
            recordId: response.recordId,
            name: obj.name
          })
          formik.setFieldValue('recordId', response.recordId)
          getData(response.recordId)
          toast.success(platformLabels.Added)
        } else toast.success(platformLabels.Edited)

        invalidate()
      } catch (e) {}
    }
  })

  const editMode = !!formik.values.recordId

  const actions = [
    {
      key: 'RecordRemarks',
      condition: true,
      onClick: 'onRecordRemarks',
      disabled: !editMode
    }
  ]

  useEffect(() => {
    ;(async function () {
      await getData(recordId)
    })()
  }, [])

  const getData = async recordId => {
    try {
      if (recordId) {
        const res = await getRequest({
          extension: PurchaseRepository.Vendor.get,
          parameters: `_recordId=${recordId}`
        })
        setStore({
          recordId: res.record.recordId,
          name: res.record.name
        })
        formik.setValues(res.record)
      }
    } catch (exception) {}
  }

  return (
    <FormShell
      resourceId={ResourceIds.PuVendors}
      form={formik}
      actions={actions}
      maxAccess={maxAccess}
      editMode={editMode}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={PurchaseRepository.VendorGroups.qry}
                name='groupId'
                label={labels.vendorGroup}
                valueField='recordId'
                displayField={['reference', 'name']}
                readOnly={!!editMode}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('groupId', newValue ? newValue.recordId : '')
                  changeDT(newValue)
                }}
                error={formik.touched.taxId && Boolean(formik.errors.taxId)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='reference'
                label={labels.reference}
                value={formik.values.reference}
                onChange={formik.handleChange}
                maxLength='10'
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('reference', '')}
                error={formik.touched.reference && Boolean(formik.errors.reference)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='name'
                label={labels.name}
                value={formik.values.name}
                onChange={formik.handleChange}
                maxAccess={maxAccess}
                required
                onClear={() => formik.setFieldValue('name', '')}
                error={formik.touched.name && Boolean(formik.errors.name)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='keywords'
                label={labels.keyWords}
                value={formik.values.keywords}
                maxLength='30'
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('keyWord', '')}
                error={formik.touched.keyWord && Boolean(formik.errors.keyWord)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={FinancialRepository.Account.snapshot}
                name='accountId'
                label={labels.accountRef}
                valueField='reference'
                displayField='name'
                valueShow='accountRef'
                secondValueShow='accountName'
                form={formik}
                onChange={(event, newValue) => {
                  formik.setFieldValue('accountId', newValue?.recordId || '')
                  formik.setFieldValue('accountRef', newValue?.reference || '')
                  formik.setFieldValue('accountName', newValue?.name || '')
                }}
                error={formik.touched.accountId && Boolean(formik.errors.accountId)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='flName'
                label={labels.flName}
                value={formik.values.flName}
                maxLength='50'
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('flName', '')}
                error={formik.touched.flName && Boolean(formik.errors.flName)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomCheckBox
                name='isTaxable'
                value={formik.values?.isTaxable}
                onChange={event => formik.setFieldValue('isTaxable', event.target.checked)}
                label={labels.tax}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='taxRef'
                label={labels.taxRef}
                value={formik.values.taxRef}
                onChange={formik.handleChange}
                maxLength='10'
                readOnly={!formik.values?.isTaxable}
                required={formik.values?.isTaxable}
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('taxRef', '')}
                error={formik.touched.taxRef && Boolean(formik.errors.taxRef)}
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
              <ResourceComboBox
                datasetId={DataSets.PAYMENT_METHOD}
                name='paymentMethod'
                label={labels.payment}
                valueField='key'
                displayField='value'
                values={formik.values}
                onChange={async (event, newValue) => {
                  formik.setFieldValue('paymentMethod', newValue?.key)
                }}
                error={formik.touched.paymentMethod && Boolean(formik.errors.paymentMethod)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='tradeDiscount'
                maxLength={4}
                decimalScale={2}
                label={labels.tradeDiscount}
                value={formik.values.tradeDiscount}
                onChange={e => formik.setFieldValue('tradeDiscount', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomCheckBox
                name='isInactive'
                value={formik.values?.isInactive}
                onChange={event => formik.setFieldValue('isInactive', event.target.checked)}
                label={labels.inactive}
                maxAccess={maxAccess}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
