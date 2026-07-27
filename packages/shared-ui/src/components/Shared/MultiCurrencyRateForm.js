import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import CustomNumberField from '../Inputs/CustomNumberField'
import { DIRTYFIELD_BASE_AMOUNT_MCR, DIRTYFIELD_RATE, getRate } from '@argus/shared-utils/src/utils/RateCalculator'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { MultiCurrencyRepository } from '@argus/repositories/src/repositories/MultiCurrencyRepository'
import { formatDateForGetApI } from '@argus/shared-domain/src/lib/date-helper'
import { RateDivision } from '@argus/shared-domain/src/resources/RateDivision'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import Form from './Form'
import { roundTo } from '@argus/shared-domain/src/lib/numberField-helper'

export default function MultiCurrencyRateForm({ data, onOk, DatasetIdAccess, window }) {
  const { getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  useSetWindow({ title: platformLabels.MultiCurrencyRate, window })

  const { labels, access: maxAccess } = useResourceQuery({
    endpointId: MultiCurrencyRepository.Currency.get,
    DatasetIdAccess,
    datasetId: ResourceIds.MultiCurrencyRate
  })

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

      const nextValues = {
        ...formik.values,
        rateCalcMethod: res.record?.rateCalcMethod,
        rateCalcMethodName: res.record?.rateCalcMethodName,
        exchangeId: res.record?.exchangeId,
        exchangeName: res.record?.exchangeName,
        rateTypeId: res.record?.rateTypeId,
        rateTypeName: res.record?.rateTypeName
      }

      formik.resetForm({
        values: nextValues
      })
    }
  }

  useEffect(() => {
    ;(async function () {
      await getMultiCurrencyFormData()
    })()
  }, [])

  const ok = () => {
    const current = formik.values

    const hasChange =
      (current.exRate ?? 0) !== (formik?.initialValues?.exRate ?? 0) ||
      (current.baseAmount ?? 0) !== (formik?.initialValues?.baseAmount ?? 0)

    if (!hasChange) {
      window.close()
      return
    }

    onOk?.({
      exRate: roundTo(current.exRate),
      baseAmount: roundTo(current.baseAmount),
      rateCalcMethod: current.rateCalcMethod
    })

    window.close()
  }

  const actions = [
    {
      key: 'Ok',
      condition: true,
      onClick: ok,
      disabled: false
    }
  ]

  return (
    <Form onSave={ok} actions={actions} maxAccess={maxAccess} editMode={false} isSaved={false}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
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
            <Grid item xs={6}>
              <CustomTextField
                name='rateCalcMethodName'
                value={formik?.values?.rateCalcMethodName}
                label={labels.rateCalcMethod}
                readOnly
              />
            </Grid>
            <Grid item xs={6}>
              <CustomNumberField
                name='exRate'
                value={formik?.values?.exRate}
                label={labels.rate}
                readOnly={formik?.values?.amount == 0}
                maxAccess={maxAccess}
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
                    baseAmount: roundTo(formik?.values?.baseAmount || 0),
                    rateCalcMethod: formik?.values?.rateCalcMethod,
                    dirtyField: DIRTYFIELD_RATE
                  })

                  formik.setValues({
                    ...formik.values,
                    ...updatedRateRow,
                    baseAmount: roundTo(updatedRateRow.baseAmount)
                  })
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomNumberField name='amount' value={formik?.values?.amount} label={labels.amount} readOnly />
            </Grid>
            <Grid item xs={6}>
              <CustomNumberField
                name='baseAmount'
                value={formik?.values?.baseAmount}
                label={labels.baseAmount}
                readOnly={formik?.values?.amount == 0}
                onClear={() => {
                  formik.setFieldValue('baseAmount', '')
                  formik.setFieldValue('exRate', '')
                }}
                maxAccess={maxAccess}
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
                    baseAmount: roundTo(inputValue || 0),
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
    </Form>
  )
}

MultiCurrencyRateForm.width = 600
MultiCurrencyRateForm.height = 400
