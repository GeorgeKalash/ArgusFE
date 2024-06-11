import { Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import { MultiCurrencyRepository } from 'src/repositories/MultiCurrencyRepository'
import { useForm } from 'src/hooks/form'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { useInvalidate } from 'src/hooks/resource'

export default function MultiCurrencyForm({ labels, maxAccess, currencyId, rateTypeId, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const editMode = !!currencyId && !!rateTypeId

  const invalidate = useInvalidate({
    endpointId: MultiCurrencyRepository.McExchangeMap.page
  })

  const { formik } = useForm({
    initialValues: {
      currencyId: currencyId || null,
      rateTypeId: rateTypeId || null,
      exId: null
    },
    maxAccess: maxAccess,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      currencyId: yup.string().required(' '),
      rateTypeId: yup.string().required(' '),
      exId: yup.string().required(' ')
    }),
    onSubmit: async obj => {
      const response = await postRequest({
        extension: MultiCurrencyRepository.McExchangeMap.set,
        record: JSON.stringify(obj)
      })

      if (!currencyId && !rateTypeId) {
        toast.success('Record Added Successfully')
      } else {
        toast.success('Record Edited Successfully')
      }

      invalidate()
    }
  })
  useEffect(() => {
    ;(async function () {
      try {
        if (rateTypeId && currencyId) {
          const res = await getRequest({
            extension: MultiCurrencyRepository.McExchangeMap.get,
            parameters: `_currencyId=${currencyId}&_rateTypeId=${rateTypeId}`
          })
          formik.setValues({
            ...res.record
          })
        }
      } catch (e) {}
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.MultiCurrencyMapping} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <ResourceComboBox
                readOnly={editMode}
                endpointId={SystemRepository.Currency.qry}
                name='currencyId'
                label={labels.currency}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Currency Ref' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                required
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik && formik.setFieldValue('currencyId', newValue?.recordId)
                }}
                error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={MultiCurrencyRepository.RateType.qry}
                name='rateTypeId'
                label={labels.rateType}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: ' Ref' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                required
                maxAccess={maxAccess}
                readOnly={editMode}
                onChange={(event, newValue) => {
                  formik && formik.setFieldValue('rateTypeId', newValue?.recordId)
                }}
                error={formik.touched.rateTypeId && Boolean(formik.errors.rateTypeId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={MultiCurrencyRepository.ExchangeTable.qry}
                name='exId'
                label={labels.exchangeTable}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Ref' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                required
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('exId', newValue?.recordId || null)
                }}
                error={formik.touched.exId && Boolean(formik.errors.exId)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
