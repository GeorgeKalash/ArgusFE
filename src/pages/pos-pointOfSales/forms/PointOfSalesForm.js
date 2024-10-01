import { Checkbox, FormControlLabel, Grid } from '@mui/material'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useContext, useEffect } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { ControlContext } from 'src/providers/ControlContext'
import { useForm } from 'src/hooks/form'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { PointofSaleRepository } from 'src/repositories/PointofSaleRepository'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { SystemFunction } from 'src/resources/SystemFunction'
import { SaleRepository } from 'src/repositories/SaleRepository'
import { GeneralLedgerRepository } from 'src/repositories/GeneralLedgerRepository'
import { FinancialRepository } from 'src/repositories/FinancialRepository'
import { DataSets } from 'src/resources/DataSets'
import dayjs from 'dayjs'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import CustomTimePicker from 'src/components/Inputs/CustomTimePicker'

const PointOfSalesForm = ({ labels, maxAccess, setStore, store }) => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { recordId } = store

  const invalidate = useInvalidate({
    endpointId: PointofSaleRepository.PointOfSales.page
  })

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      recordId: null,
      reference: '',
      currencyId: '',
      plantId: '',
      siteId: '',
      dtId: '',
      plId: '',
      ccId: '',
      taxId: '',
      applyTaxIVC: false,
      applyTaxPUR: false,
      applyTaxRET: false,
      isInactive: false,
      onlineStore: false,
      nextDayExtend: false,
      maxEndTime: '',
      status: ''
    },
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      currencyId: yup.string().required(),
      reference: yup.string().required(),
      plantId: yup.string().required(),
      maxEndTime: yup.string().required(),
      status: yup.string().required(),
      plId: yup.string().required(),
      siteId: yup
        .string()
        .nullable()
        .test('siteId-required', 'Site ID is required when not an online store', function (value) {
          const { onlineStore } = this.parent

          return !!onlineStore || (!!value && value !== '')
        })
    }),
    onSubmit: async obj => {
      try {
        // Format maxEndTime to hh:mm
        const date = new Date(obj.maxEndTime)
        const hours = date.getUTCHours().toString().padStart(2, '0')
        const minutes = date.getUTCMinutes().toString().padStart(2, '0')
        const formattedMaxEndTime = `${hours}:${minutes}`

        // Update the object with the formatted time
        const updatedObj = {
          ...obj,
          maxEndTime: formattedMaxEndTime
        }

        const response = await postRequest({
          extension: PointofSaleRepository.PointOfSales.set,
          record: JSON.stringify(updatedObj)
        })

        if (!obj.recordId) {
          toast.success(platformLabels.Added)

          formik.setFieldValue('recordId', response.recordId)
          setStore(prevStore => ({
            ...prevStore,
            recordId: response.recordId
          }))
        } else {
          toast.success(platformLabels.Edited)
        }

        invalidate()
      } catch (error) {}
    }
  })
  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      try {
        if (recordId) {
          const res = await getRequest({
            extension: PointofSaleRepository.PointOfSales.get,
            parameters: `_recordId=${recordId}`
          })

          const [hours, minutes] = res.record.maxEndTime.split(':')

          const transformedMaxEndTime = dayjs()
            .set('hour', parseInt(hours, 10))
            .set('minute', parseInt(minutes, 10))
            .set('second', 0)
            .set('millisecond', 0)

          formik.setValues({
            ...res.record,
            onlineStore: Boolean(res.record.onlineStore),
            maxEndTime: transformedMaxEndTime
          })
        }
      } catch (error) {
        // Handle errors here
        console.error('Error fetching data:', error)
      }
    })()
  }, [recordId])

  return (
    <FormShell form={formik} resourceId={ResourceIds.PointOfSale} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={6.01}>
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
            <Grid item xs={6.01}>
              <ResourceComboBox
                endpointId={SystemRepository.Currency.qry}
                name='currencyId'
                label={labels.currency}
                readOnly={formik.values.status == '3'}
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
                  formik.setFieldValue('currencyId', newValue?.recordId || null)
                }}
                error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.Plant.qry}
                name='plantId'
                label={platformLabels.plant}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'plant Ref' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                required
                onChange={(event, newValue) => {
                  formik.setFieldValue('plantId', newValue?.recordId || '')
                }}
                error={formik.touched.plantId && Boolean(formik.errors.plantId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={InventoryRepository.Site.qry}
                name='siteId'
                filter={item => item.plantId === formik.values.plantId}
                readOnly={!!formik.values.onlineStore || !!!formik.values.plantId}
                required={!formik.values.onlineStore}
                label={labels.invSite}
                values={formik.values}
                displayField='name'
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('siteId', newValue?.recordId || '')
                }}
                error={formik.touched.siteId && Boolean(formik.errors.siteId) && Boolean(!formik.values.onlineStore)}
              />
            </Grid>

            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.DocumentType.qry}
                parameters={`_startAt=0&_pageSize=1000&_dgId=${SystemFunction.RetailInvoice}`}
                name='dtId'
                label={labels.docType}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                valueField='recordId'
                displayField={['reference', 'name']}
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik && formik.setFieldValue('dtId', newValue?.recordId)
                }}
                error={formik.touched.dtId && Boolean(formik.errors.dtId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SaleRepository.PriceLevel.qry}
                name='plId'
                label={labels.pL}
                valueField='recordId'
                required
                displayField={'name'}
                displayFieldWidth={1}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('plId', newValue?.recordId || '')
                }}
                error={formik.touched.plId && Boolean(formik.errors.plId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={GeneralLedgerRepository.CostCenter.qry}
                parameters={`_params=&_startAt=0&_pageSize=200`}
                name='ccId'
                label={labels.costCenter}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                valueField='recordId'
                displayField={'name'}
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik && formik.setFieldValue('ccId', newValue?.recordId)
                }}
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
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    name='applyTaxIVC'
                    maxAccess={maxAccess}
                    checked={formik.values?.applyTaxIVC}
                    onChange={formik.handleChange}
                  />
                }
                label={labels.tOi}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    name='nextDayExtend'
                    maxAccess={maxAccess}
                    checked={formik.values?.nextDayExtend}
                    onChange={formik.handleChange}
                  />
                }
                label={labels.nDe}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    name='applyTaxPUR'
                    maxAccess={maxAccess}
                    checked={formik.values?.applyTaxPUR}
                    onChange={formik.handleChange}
                  />
                }
                label={labels.tOp}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomTimePicker
                label={labels.maxEndTime}
                name='maxEndTime'
                value={formik.values?.maxEndTime}
                onChange={formik.setFieldValue}
                onClear={() => formik.setFieldValue('maxEndTime', '')}
                error={formik.touched.maxEndTime && Boolean(formik.errors.maxEndTime)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    name='applyTaxRET'
                    maxAccess={maxAccess}
                    checked={formik.values?.applyTaxRET}
                    onChange={formik.handleChange}
                  />
                }
                label={labels.tOr}
              />
            </Grid>
            <Grid item xs={6}>
              <ResourceComboBox
                name='status'
                label={labels.status}
                datasetId={DataSets.POS_STATUS}
                values={formik.values}
                required
                valueField='key'
                displayField='value'
                onChange={(event, newValue) => {
                  if (newValue) {
                    formik.setFieldValue('status', newValue?.key || '')
                  }
                }}
                error={formik.touched.status && Boolean(formik.errors.status)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={6.01}>
              <FormControlLabel
                control={
                  <Checkbox
                    name='isInactive'
                    maxAccess={maxAccess}
                    checked={formik.values?.isInactive}
                    onChange={formik.handleChange}
                  />
                }
                label={labels.isInactive}
              />
            </Grid>
            <Grid item xs={6.01}>
              <FormControlLabel
                control={
                  <Checkbox
                    name='onlineStore'
                    maxAccess={maxAccess}
                    checked={formik.values?.onlineStore}
                    onChange={formik.handleChange}
                    disabled={!!formik.values.siteId}
                    readOnly={!!formik.values.siteId}
                  />
                }
                label={labels.onlineStore}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default PointOfSalesForm
