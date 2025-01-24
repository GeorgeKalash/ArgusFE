import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { useForm } from 'src/hooks/form'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import CustomNumberField from '../Inputs/CustomNumberField'
import { DIRTYFIELD_BASE_AMOUNT_MCR, DIRTYFIELD_RATE, getRate } from 'src/utils/RateCalculator'
import { RequestsContext } from 'src/providers/RequestsContext'
import { MultiCurrencyRepository } from 'src/repositories/MultiCurrencyRepository'
import { formatDateForGetApI } from 'src/lib/date-helper'
import { RateDivision } from 'src/resources/RateDivision'

export default function MultiCurrencyRateForm({ labels, maxAccess, data, onOk, window }) {
  const { getRequest } = useContext(RequestsContext)

  const { formik } = useForm({
    initialValues: {
      currencyId: data?.currencyId,
      currencyName: data?.currencyName,
      exchangeId: data?.exchangeId,
      exchangeName: data?.exchangeName,
      rateCalcMethod: data?.rateCalcMethod,
      rateCalcMethodName: data?.rateCalcMethodName,
      rateTypeId: data?.rateTypeId,
      exRate: data?.exRate || null,
      amount: data?.amount || 0,
      baseAmount: data?.baseAmount,
      rateTypeName: data?.rateTypeName
    },
    maxAccess,
    enableReinitialize: false,
    validateOnChange: true
  })

  async function getMultiCurrencyFormData() {
    if (data?.currencyId && data?.date) {
      const res = await getRequest({
        extension: MultiCurrencyRepository.Currency.get,
        parameters: `_currencyId=${data?.currencyId}&_date=${formatDateForGetApI(data?.date)}&_rateDivision=${
          RateDivision.FINANCIALS
        }`
      })
      formik.setFieldValue('rateCalcMethod', res.record?.rateCalcMethod)
      formik.setFieldValue('rateCalcMethodName', res.record?.rateCalcMethodName)
      formik.setFieldValue('exchangeId', res.record?.exchangeId)
      formik.setFieldValue('exchangeName', res.record?.exchangeName)
      formik.setFieldValue('rateTypeName', res.record?.rateTypeName)
    }
  }

  useEffect(() => {
    ;(async function () {
      await getMultiCurrencyFormData()
    })()
  }, [])

  const actions = [
    {
      key: 'Ok',
      condition: true,
      onClick: () => {
        if (onOk) {
          const updatedValues = {
            ...formik.values,
            exRate: formik.values.exRate,
            baseAmount: formik.values.baseAmount,
            amount: formik.values.amount
          }
          onOk(updatedValues)
          window.close()
        }
      },
      disabled: false
    }
  ]

  return (
    <FormShell
      resourceId={ResourceIds.MultiCurrencyRate}
      form={formik}
      actions={actions}
      maxAccess={maxAccess}
      editMode={false}
      isSaved={false}
      isInfo={false}
      isCleared={false}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <CustomTextField
                name='currencyName'
                value={formik?.values?.currencyName}
                label={labels.currency}
                readOnly
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='rateTypeName'
                value={formik?.values?.rateTypeName}
                label={labels.rateType}
                readOnly
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='exchangeName'
                value={formik?.values?.exchangeName}
                label={labels.exchangeTable}
                readOnly
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='rateCalcMethodName'
                value={formik?.values?.rateCalcMethodName}
                label={labels.rateCalcMethod}
                readOnly
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='exRate'
                value={formik?.values?.exRate}
                label={labels.rate}
                readOnly={formik?.values?.amount == 0}
                onClear={() => {
                  formik.setFieldValue('baseAmount', '')
                  formik.setFieldValue('exRate', '')
                }}
                decimalScale={7}
                onChange={e => {
                  const inputValue = e.target.value

                  if (!inputValue) {
                    formik.setFieldValue('exRate', '')
                    formik.setFieldValue('baseAmount', '')

                    return
                  }

                  formik.setFieldValue('exRate', inputValue)

                  const updatedRateRow = getRate({
                    amount: data?.amount || 0,
                    exRate: inputValue,
                    baseAmount: parseFloat(formik?.values?.baseAmount || 0).toFixed(2),
                    rateCalcMethod: formik?.values?.rateCalcMethod,
                    dirtyField: DIRTYFIELD_RATE
                  })

                  formik.setValues({
                    ...formik.values,
                    ...updatedRateRow,
                    baseAmount: parseFloat(updatedRateRow.baseAmount).toFixed(2)
                  })
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField name='amount' value={formik?.values?.amount} label={labels.amount} readOnly />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='baseAmount'
                value={formik?.values?.baseAmount}
                label={labels.baseAmount}
                readOnly={formik?.values?.amount == 0}
                onClear={() => {
                  formik.setFieldValue('baseAmount', '')
                  formik.setFieldValue('exRate', '')
                }}
                onChange={e => {
                  const inputValue = e.target.value
                  if (!inputValue) {
                    formik.setFieldValue('baseAmount', '')
                    formik.setFieldValue('exRate', '')

                    return
                  }

                  formik.setFieldValue('baseAmount', inputValue)

                  const updatedRateRow = getRate({
                    amount: data?.amount || 0,
                    exRate: formik?.values?.exRate,
                    baseAmount: parseFloat(inputValue || 0).toFixed(2),
                    rateCalcMethod: formik?.values?.rateCalcMethod,
                    dirtyField: DIRTYFIELD_BASE_AMOUNT_MCR
                  })

                  formik.setValues({
                    ...formik.values,
                    ...updatedRateRow
                  })
                }}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
