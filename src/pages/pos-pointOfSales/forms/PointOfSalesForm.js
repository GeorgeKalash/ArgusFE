import { Grid } from '@mui/material'
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

const PointOfSalesForm = ({ labels, maxAccess, setStore, store }) => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { recordId } = store

  const invalidate = useInvalidate({
    endpointId: PointofSaleRepository.PointOfSales.qry
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
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({}),
    onSubmit: async obj => {
      const response = await postRequest({
        extension: PointofSaleRepository.PointOfSales.set,
        record: JSON.stringify(obj)
      })

      if (!obj.recordId) {
        toast.success(platformLabels.Added)

        formik.setFieldValue('recordId', response.recordId)
        setStore(prevStore => ({
          ...prevStore,
          recordId: response.recordId
        }))
      } else toast.success(platformLabels.Edited)
      invalidate()
    }
  })
  const editMode = !!recordId

  useEffect(() => {
    ;(async function () {
      try {
        if (recordId) {
          const res = await getRequest({
            extension: PointofSaleRepository.PointOfSales.get,
            parameters: `_recordId=${recordId}`
          })

          formik.setValues(res.record)
        }
      } catch (error) {}
    })()
  }, [])

  return (
    <FormShell form={formik} resourceId={ResourceIds.PointOfSales} maxAccess={maxAccess} editMode={editMode}>
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
            onChange={(event, newValue) => {
              if (newValue?.recordId) {
                formik.setFieldValue('plantId', newValue?.recordId)
              } else {
                delete formik?.values?.plantId
              }
            }}
            error={formik.touched.plantId && Boolean(formik.errors.plantId)}
          />
        </Grid>
        <Grid item xs={12}>
          <ResourceComboBox
            endpointId={InventoryRepository.Site.qry}
            name='siteId'
            readOnly={editMode}
            label={labels.site}
            values={formik.values}
            displayField='name'
            maxAccess={maxAccess}
            onChange={(event, newValue) => {
              formik.setFieldValue('siteId', newValue?.recordId)
            }}
            error={formik.touched.siteId && Boolean(formik.errors.siteId)}
          />
        </Grid>

        <Grid item xs={12}>
          <ResourceComboBox
            endpointId={SystemRepository.DocumentType.qry}
            parameters={`_startAt=0&_pageSize=1000&_dgId=${SystemFunction.RetailInvoice}`}
            name='dtId'
            label={labels[2]}
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
            helperText={formik.touched.dtId && formik.errors.dtId}
          />
        </Grid>
        <Grid item xs={12}>
          <ResourceComboBox
            endpointId={SaleRepository.PriceLevel.qry}
            name='plId'
            label={labels.priceLevel}
            valueField='recordId'
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
      </Grid>
    </FormShell>
  )
}

export default PointOfSalesForm
