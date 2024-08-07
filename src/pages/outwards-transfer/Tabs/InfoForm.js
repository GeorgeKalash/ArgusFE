import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import FormShell from 'src/components/Shared/FormShell'
import { RequestsContext } from 'src/providers/RequestsContext'
import { CurrencyTradingSettingsRepository } from 'src/repositories/CurrencyTradingSettingsRepository'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceIds } from 'src/resources/ResourceIds'

export default function InfoForm({ labels, formik }) {
  const { getRequest } = useContext(RequestsContext)
  async function getCorrespondantCurrencyRef() {
    try {
      const res = await getRequest({
        extension: RemittanceSettingsRepository.Correspondent.get,
        parameters: `_recordId=${formik.values.corId}`
      })
      formik.setFieldValue('corCurrencyRef', res.record.currencyRef)
    } catch (error) {}
  }
  async function getDefaultCurrency() {
    try {
      const res = await getRequest({
        extension: SystemRepository.Defaults.get,
        parameters: `_filter=&_key=baseCurrencyId`
      })

      return parseInt(res.record.value)
    } catch (error) {}
  }
  async function getCorrespondentEvalRate() {
    try {
      const baseCurrency = await getDefaultCurrency()

      const res = await getRequest({
        extension: CurrencyTradingSettingsRepository.ExchangeMap.get,
        parameters: `_plantId=${formik.values.plantId}&_currencyId=${
          formik.values.currencyId
        }&_raCurrencyId=${baseCurrency}&_rateTypeId=${150}`
      })
      formik.setFieldValue('corCurrencyEval', '')
    } catch (error) {}
  }
  useEffect(() => {
    ;(async function () {
      try {
        getCorrespondantCurrencyRef()
        getCorrespondentEvalRate()
      } catch (error) {}
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.OutwardsTransfer} form={formik} isCleared={false} isInfo={false} isSaved={false}>
      <Grid container spacing={2}>
        <Grid item xs={12} sx={{ mx: 5, mt: 2 }}>
          <CustomTextField
            name='corCurrencyRef'
            readOnly
            label={labels.corCurrency}
            value={formik.values.corCurrencyRef}
          />
        </Grid>
        <Grid item xs={12} sx={{ mx: 5 }}>
          <CustomTextField name='corCurrencyRate' readOnly label={labels.corCurrencyRate} value={''} />
        </Grid>
        <Grid item xs={12} sx={{ mx: 5 }}>
          <CustomTextField name='corCurrencyEval' readOnly label={labels.corCurrencyEval} value={''} />
        </Grid>
        <Grid item xs={12} sx={{ mx: 5 }}>
          <CustomTextField name='taxPct' readOnly label={labels.TaxPct} value={formik.values.vatRate} />
        </Grid>
        <Grid item xs={12} sx={{ mx: 5 }}>
          <CustomTextField name='corComission' readOnly label={labels.corComission} value={''} />
          {/* fees */}
        </Grid>
        <Grid item xs={12} sx={{ mx: 5 }}>
          <CustomTextField name='netPayable' readOnly label={labels.netPayable} value={''} />
        </Grid>
        <Grid item xs={12} sx={{ mx: 5 }}>
          <CustomTextField name='netBase' readOnly label={labels.netBase} value={''} />
        </Grid>
        <Grid item xs={12} sx={{ mx: 5 }}>
          <CustomTextField name='grossProfit' readOnly label={labels.grossProfit} value={''} />
        </Grid>
        <Grid item xs={12} sx={{ mx: 5 }}>
          <CustomTextField name='netCommission' readOnly label={labels.netCommission} value={''} />
        </Grid>
        <Grid item xs={12} sx={{ mx: 5 }}>
          <CustomTextField name='commissionPayable' readOnly label={labels.commissionPayable} value={''} />
        </Grid>
        <Grid item xs={12} sx={{ mx: 5 }}>
          <CustomTextField name='commissionBase' readOnly label={labels.commissionBase} value={''} />
        </Grid>
      </Grid>
    </FormShell>
  )
}
