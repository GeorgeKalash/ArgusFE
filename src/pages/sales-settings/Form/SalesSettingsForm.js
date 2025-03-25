import { Grid } from '@mui/material'
import * as yup from 'yup'
import { useContext, useEffect } from 'react'
import { FormControlLabel, Checkbox } from '@mui/material'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SaleRepository } from 'src/repositories/SaleRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { DataSets } from 'src/resources/DataSets'
import FieldSet from 'src/components/Shared/FieldSet'
import CustomCheckBox from 'src/components/Inputs/CustomCheckBox'

export default function SalesSettingsForm({ _labels, access }) {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const arrayAllow = [
    'plId',
    'ptId',
    'currencyId',
    'siteId',
    'maxReturnDays',
    'SAFIIntegration',
    'sdpClientName',
    'sdpItemName',
    'sdpUnitPrice',
    'allowSalesNoLinesTrx',
    'salesTD'
  ]

  const { formik } = useForm({
    initialValues: {
      plId: null,
      ptId: null,
      currencyId: null,
      siteId: null,
      maxReturnDays: null,
      SAFIIntegration: null,
      sdpClientName: false,
      sdpItemName: false,
      sdpUnitPrice: false,
      allowSalesNoLinesTrx: false,
      salesTD: false
    },
    enableReinitialize: false,
    maxAccess: access,
    validateOnChange: true,
    validationSchema: yup.object({
      maxReturnDays: yup.number().min(0, 'min').max(9999, 'max')
    }),
    onSubmit: async obj => {
      try {
        var data = []

        Object.entries(obj).forEach(([key, value]) => {
          if (arrayAllow.includes(key)) {
            let processedValue = value

            if (typeof value === 'string' && value.startsWith('on')) {
              processedValue = Boolean(value)

            }
            

            const newObj = { key: key, value: processedValue }
            data.push(newObj)
          }
        })

        const response = await postRequest({
          extension: SystemRepository.Defaults.set,
          record: JSON.stringify({ sysDefaults: data })
        })

        if (response) {
          toast.success(platformLabels.Edited)
        }
      } catch (error) {}
    }
  })

  useEffect(() => {
    ;(async function () {
      try {
        const response = await getRequest({
          extension: SystemRepository.Defaults.qry,
          parameters: `_filter=`
        })

        response.list.forEach(obj => {
          if (arrayAllow.includes(obj.key)) {
            let value = obj.value

            if (value === 'true') {
              value = true
            } else if (value === 'false' || value === null) {
              value = false
            } else {
              value = parseInt(value)
            }

            formik.setFieldValue(obj.key, value)
          }
        })
      } catch (error) {}
    })()
  }, [])

  return (
    <FormShell form={formik} isInfo={false} isCleared={false}>
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
          <Grid item xs={11.5}>
            <FieldSet title={_labels.salesDefaultValues}>
              <Grid item xs={12}>
                <ResourceComboBox
                  endpointId={SaleRepository.PriceLevel.qry}
                  name='plId'
                  label={_labels.priceLevel}
                  valueField='recordId'
                  displayField={['reference', 'name']}
                  displayFieldWidth={1}
                  columnsInDropDown={[
                    { key: 'reference', value: 'Reference' },
                    { key: 'name', value: 'Name' }
                  ]}
                  values={formik?.values}
                  maxAccess={access}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('plId', newValue?.recordId)
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <ResourceComboBox
                  endpointId={SaleRepository.PaymentTerms.qry}
                  name='ptId'
                  label={_labels.paymentTerm}
                  valueField='recordId'
                  displayField={['reference', 'name']}
                  displayFieldWidth={1}
                  columnsInDropDown={[
                    { key: 'reference', value: 'Reference' },
                    { key: 'name', value: 'Name' }
                  ]}
                  values={formik?.values}
                  maxAccess={access}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('ptId', newValue?.recordId)
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <ResourceComboBox
                  endpointId={SystemRepository.Currency.qry}
                  name='currencyId'
                  label={_labels.currencyName}
                  valueField='recordId'
                  displayField={['reference', 'name', 'flName']}
                  columnsInDropDown={[
                    { key: 'reference', value: 'Reference' },
                    { key: 'name', value: 'Name' },
                    { key: 'flName', value: 'FL Name' }
                  ]}
                  values={formik?.values}
                  maxAccess={access}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('currencyId', newValue?.recordId)
                  }}
                  error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
                />
              </Grid>
              <Grid item xs={12}>
                <ResourceComboBox
                  endpointId={InventoryRepository.Site.qry}
                  name='siteId'
                  label={_labels.site}
                  values={formik?.values}
                  displayField='name'
                  maxAccess={access}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('siteId', newValue?.recordId)
                  }}
                  error={formik.touched.siteId && Boolean(formik.errors.siteId)}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomNumberField
                  name='maxReturnDays'
                  label={_labels.maxReturnDays}
                  value={formik?.values?.maxReturnDays}
                  onChange={formik.handleChange}
                  onClear={() => formik.setFieldValue('maxReturnDays', '')}
                  error={formik.touched.maxReturnDays && Boolean(formik.errors.maxReturnDays)}
                />
              </Grid>
              <Grid item xs={12}>
                <ResourceComboBox
                  datasetId={DataSets.SA_FI_INTEGRATION}
                  name='SAFIIntegration'
                  label={_labels.SAFIIntegration}
                  values={formik?.values}
                  valueField='key'
                  displayField='value'
                  maxAccess={access}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('SAFIIntegration', newValue ? newValue.key : '')
                  }}
                  error={formik.touched.SAFIIntegration && Boolean(formik.errors.SAFIIntegration)}
                />
              </Grid>
            </FieldSet>
            </Grid>
            <Grid item xs={11.5}>
            <FieldSet title={_labels.salesColumnsDisabled}>
              <Grid item xs={12}>
                <CustomCheckBox
                  name='sdpClientName'
                  value={formik.values?.sdpClientName}
                  onChange={event => formik.setFieldValue('sdpClientName', event.target.checked)}
                  label={_labels.sdpClientName}
                  maxAccess={access}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomCheckBox
                  name='sdpItemName'
                  value={formik.values?.sdpItemName}
                  onChange={event => formik.setFieldValue('sdpItemName', event.target.checked)}
                  label={_labels.sdpItemName}
                  maxAccess={access}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomCheckBox
                  name='sdpUnitPrice'
                  value={formik.values?.sdpUnitPrice}
                  onChange={event => formik.setFieldValue('sdpUnitPrice', event.target.checked)}
                  label={_labels.sdpUnitPrice}
                  maxAccess={access}
                />
              </Grid>
            </FieldSet>
            </Grid>
            <Grid item xs={12}>
              <CustomCheckBox
                name='allowSalesNoLinesTrx'
                value={formik.values?.allowSalesNoLinesTrx}
                onChange={event => formik.setFieldValue('allowSalesNoLinesTrx', event.target.checked)}
                label={_labels.allowSalesNoLinesTrx}
                maxAccess={access}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomCheckBox
                name='salesTD'
                value={formik.values?.salesTD}
                onChange={event => formik.setFieldValue('salesTD', event.target.checked)}
                label={_labels.salesTD}
                maxAccess={access}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
