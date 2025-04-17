import { Grid } from '@mui/material'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useContext, useEffect } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { useForm } from 'src/hooks/form'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { SaleRepository } from 'src/repositories/SaleRepository'
import { DataSets } from 'src/resources/DataSets'

const ClientPriceListForm = ({ labels, maxAccess, recordId, record }) => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: SaleRepository.ClientPriceList.page
  })

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      recordId,
      clientId: null,
      sku: '',
      itemId: null,
      itemName: '',
      currencyId: null,
      priceType: null,
      unitPrice: null
    },
    validateOnChange: true,
    validationSchema: yup.object({
      clientId: yup.number().required(),
      itemId: yup.number().required(),
      currencyId: yup.number().required(),
      priceType: yup.number().required(),
      unitPrice: yup.number().required()
    }),
    onSubmit: async obj => {
      await postRequest({
        extension: SaleRepository.ClientPriceList.set,
        record: JSON.stringify(obj)
      })

      !formik.values.currencyId && !formik.values.clientId && !formik.values.itemId && !formik.values.priceType
        ? toast.success(platformLabels.Added)
        : toast.success(platformLabels.Edited)

      formik.setFieldValue(
        'recordId',
        String(obj.itemId * 1000) + String(obj.clientId * 100) + String(obj.currencyId * 10) + String(obj.priceType)
      )

      invalidate()
    }
  })

  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (record && record.itemId && record.clientId && record.currencyId && record.priceType && recordId) {
        const res = await getRequest({
          extension: SaleRepository.ClientPriceList.get,
          parameters: `_itemId=${record.itemId}&_clientId=${record.clientId}&_currencyId=${record.currencyId}&_priceType=${record.priceType}`
        })

        formik.setValues({
          ...res.record,
          recordId:
            String(res.record.itemId * 1000) +
            String(res.record.clientId * 100) +
            String(res.record.currencyId * 10) +
            String(res.record.priceType)
        })
      }
    })()
  }, [])

  return (
    <FormShell form={formik} resourceId={ResourceIds.ClientPriceLists} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={SaleRepository.Client.snapshot}
                valueField='reference'
                displayField='name'
                secondFieldLabel={labels.name}
                name='clientId'
                label={labels.client}
                readOnly={editMode}
                form={formik}
                required
                displayFieldWidth={2}
                valueShow='clientRef'
                secondValueShow='clientName'
                maxAccess={maxAccess}
                editMode={editMode}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                onChange={async (event, newValue) => {
                  formik.setFieldValue('clientId', newValue?.recordId || null)
                  formik.setFieldValue('clientName', newValue?.name || '')
                  formik.setFieldValue('clientRef', newValue?.reference || '')
                }}
                errorCheck={'clientId'}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={InventoryRepository.Item.snapshot}
                name='itemId'
                label={labels.sku}
                valueField='sku'
                displayField='name'
                readOnly={editMode}
                valueShow='sku'
                secondValueShow='itemName'
                form={formik}
                required
                columnsInDropDown={[
                  { key: 'sku', value: 'SKU' },
                  { key: 'name', value: 'Name' }
                ]}
                onChange={(event, newValue) => {
                  formik.setFieldValue('itemId', newValue?.recordId || null)
                  formik.setFieldValue('itemName', newValue?.name || '')
                  formik.setFieldValue('sku', newValue?.sku || '')
                }}
                errorCheck={'itemId'}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.Currency.qry}
                name='currencyId'
                label={labels.currency}
                valueField='recordId'
                readOnly={editMode}
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
                datasetId={DataSets.PRICE_TYPE}
                name='priceType'
                label={labels.priceType}
                readOnly={editMode}
                valueField='key'
                displayField='value'
                required
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('priceType', newValue?.key || null)
                }}
                error={formik.touched.priceType && Boolean(formik.errors.priceType)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='unitPrice'
                label={labels.unitPrice}
                required
                value={formik?.values?.unitPrice}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('unitPrice', '')}
                decimalScale={3}
                error={formik.touched.unitPrice && Boolean(formik.errors.unitPrice)}
                allowNegative={false}
                maxLength={12}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default ClientPriceListForm
