import { Grid } from '@mui/material'
import * as yup from 'yup'
import { useContext, useEffect } from 'react'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useFormik } from 'formik'
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
  const { postRequest } = useContext(RequestsContext)
  const { platformLabels, defaultsData } = useContext(ControlContext)

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

  const formik = useFormik({
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
      maxReturnDays: yup
        .number()
        .nullable()
        .test('is-empty-or-valid', 'Value must be between 0 and 9999', value => {
          if (value == '' || value == null) return true

          return typeof value === 'number' && value >= 0 && value <= 9999
        })
    }),
    onSubmit: async obj => {
      var data = []

      Object.entries(obj).forEach(([key, value]) => {
        data.push({ key: key, value: value })
      })

      arrayAllow.forEach(key => {
        if (!data.some(item => item.key === key)) {
          data.push({ key: key })
        }
      })

      const response = await postRequest({
        extension: SystemRepository.Defaults.set,
        record: JSON.stringify({ sysDefaults: data })
      })

      if (response) toast.success(platformLabels.Edited)
    }
  })

  useEffect(() => {
    const mapValuesToMyObject = obj => {
      switch (obj.value?.toLowerCase()) {
        case 'true':
          return true
        case 'false':
          return false
        default:
          return obj.value ? parseInt(obj.value) : null
      }
    }

    const filteredList = defaultsData?.list?.filter(obj => arrayAllow.includes(obj.key))

    const myObject = filteredList?.reduce((acc, obj) => {
      acc[obj.key] = mapValuesToMyObject(obj)

      return acc
    }, {})
    if (myObject) formik.setValues(myObject)
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
