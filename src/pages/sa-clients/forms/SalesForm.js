import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { useForm } from 'src/hooks/form'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { ControlContext } from 'src/providers/ControlContext'
import { SaleRepository } from 'src/repositories/SaleRepository'
import { useInvalidate } from 'src/hooks/resource'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'

export default function SalesForm({ labels, maxAccess, recordId, store }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: SaleRepository.ClientGroups.page
  })

  const { formik } = useForm({
    initialValues: {
      ...store.record
    },
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      tdPct: yup
        .number()
        .nullable()
        .transform((value, originalValue) => (originalValue === '' ? null : value))
        .test(function (value) {
          const { maxDiscount } = this.parent
          if (value != null && maxDiscount != null) {
            return value < maxDiscount
          }

          return true
        }),
      maxDiscount: yup
        .number()
        .max(100)
        .nullable()
        .transform((value, originalValue) => (originalValue === '' ? null : value))
    }),
    onSubmit: async obj => {
      const response = await postRequest({
        extension: SaleRepository.Client.set,
        record: JSON.stringify(obj)
      })
      if (!obj.recordId) {
        toast.success(platformLabels.Added)
        formik.setFieldValue('recordId', response.recordId)
      } else toast.success(platformLabels.Edited)
      invalidate()
    }
  })
  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      try {
        if (recordId) {
          const res = await getRequest({
            extension: SaleRepository.ClientGroups.get,
            parameters: `_recordId=${recordId}`
          })

          formik.setValues(res.record)
        }
      } catch (error) {}
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.ClientGroups} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SaleRepository.PaymentTerms.qry}
                name='ptId'
                label={labels.paymentTerm}
                valueField='recordId'
                displayField={['reference', 'name']}
                displayFieldWidth={1}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik?.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('ptId', newValue?.recordId)
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                values={formik.values}
                endpointId={SystemRepository.Currency.qry}
                name='currencyId'
                label={labels.currency}
                valueField='recordId'
                displayField={'name'}
                onChange={(event, newValue) => {
                  formik.setFieldValue('currencyId', newValue?.recordId || '')
                }}
                error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
                maxAccess={maxAccess}
              />
            </Grid>

            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SaleRepository.PriceLevel.qry}
                name='plId'
                label={labels.priceLevel}
                valueField='recordId'
                displayField={['reference', 'name']}
                displayFieldWidth={1}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik?.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('plId', newValue?.recordId)
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='tdPct'
                label={labels.discount + ' %'}
                value={formik.values.tdPct}
                maxAccess={maxAccess}
                onChange={e => {
                  formik.handleChange(e)
                }}
                onBlur={e => {
                  if (!formik.values.maxDiscount) {
                    formik.setFieldValue('maxDiscount', e.target.value)
                  }
                }}
                onClear={() => formik.setFieldValue('tdPct', '')}
                error={formik.touched.tdPct && Boolean(formik.errors.tdPct)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='maxDiscount'
                label={labels.maxDiscount}
                value={formik.values.maxDiscount}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('maxDiscount', '')}
                error={formik.touched.maxDiscount && Boolean(formik.errors.maxDiscount)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
