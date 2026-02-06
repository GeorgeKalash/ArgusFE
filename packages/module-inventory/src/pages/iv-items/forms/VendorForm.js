import { useContext } from 'react'
import { Grid } from '@mui/material'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useEffect } from 'react'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { PurchaseRepository } from '@argus/repositories/src/repositories/PurchaseRepository'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import CustomCheckBox from '@argus/shared-ui/src/components/Inputs/CustomCheckBox'

const VendorForm = ({ labels, editMode, maxAccess, store, record }) => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: PurchaseRepository.PriceList.qry
  })

  const { recordId: itemId } = store

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      itemId,
      vendorId: record?.vendorId || '',
      currencyId: record?.currencyId || '',
      baseLaborPrice: '',
      priceList: '',
      markdown: '',
      sku: '',
      isPreferred: false,
      deliveryLeadDays: ''
    },
    validateOnChange: true,
    validationSchema: yup.object({
      vendorId: yup.string().required(),
      currencyId: yup.string().required(),
      baseLaborPrice: yup.string().required(),
      priceList: yup.string().required()
    }),
    onSubmit: async obj => {
      const vendorId = formik.values.vendorId
      const currencyId = formik.values.currencyId

      const submitData = {
        ...obj,
        markdown: obj.markdown || 0
      }

      const response = await postRequest({
        extension: PurchaseRepository.PriceList.set,
        record: JSON.stringify(submitData)
      })

      if (!vendorId && !currencyId) {
        toast.success(platformLabels.Added)
      } else {
        toast.success(platformLabels.Edited)
      }

      formik.setValues(submitData)

      invalidate()
    }
  })

  useEffect(() => {
    const fetchData = async () => {
      if (record && record.currencyId && record.vendorId) {
        const res = await getRequest({
          extension: PurchaseRepository.PriceList.get,
          parameters: `_itemId=${itemId}&_vendorId=${formik.values.vendorId}&_currencyId=${formik.values.currencyId}`
        })

        if (res.record) {
          formik.setValues(res.record)
        }
      }
    }

    fetchData()
  }, [record])

  return (
    <FormShell
      form={formik}
      isInfo={false}
      resourceId={ResourceIds.PriceList}
      maxAccess={maxAccess}
      editMode={editMode}
      isCleared={false}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={PurchaseRepository.Vendor.snapshot}
                name='vendorId'
                label={labels.vendor}
                form={formik}
                displayFieldWidth={2}
                valueField='vendorRef'
                displayField='name'
                required
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                valueShow='vendorRef'
                secondValueShow='vendorName'
                onChange={(event, newValue) => {
                  formik.setFieldValue('vendorId', newValue.recordId || '')
                  formik.setFieldValue('vendorName', newValue.name || '')
                  formik.setFieldValue('vendorRef', newValue.reference || '')
                }}
                maxAccess={maxAccess}
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
                  formik.setFieldValue('currencyId', newValue?.recordId || null)
                }}
                error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='baseLaborPrice'
                label={labels.baseLabor}
                value={formik.values.baseLaborPrice}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('baseLaborPrice', '')}
                required
                error={formik.touched.baseLaborPrice && Boolean(formik.errors.baseLaborPrice)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='priceList'
                label={labels.priceList}
                value={formik.values.priceList}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('priceList', '')}
                required
                error={formik.touched.priceList && Boolean(formik.errors.priceList)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='markdown'
                label={labels.markdown}
                value={formik.values.markdown}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('markdown', '')}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='sku'
                label={labels.sku}
                value={formik.values.sku}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('sku', '')}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomCheckBox
                name='isPreferred'
                value={formik.values?.isPreferred}
                onChange={event => formik.setFieldValue('isPreferred', event.target.checked)}
                label={labels.isPreffered}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='deliveryLeadDays'
                label={labels.dld}
                value={formik.values.deliveryLeadDays}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('deliveryLeadDays', '')}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default VendorForm
