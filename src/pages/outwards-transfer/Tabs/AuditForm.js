import { Box, Grid, Typography } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { RequestsContext } from 'src/providers/RequestsContext'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'

export default function AuditForm({ labels, formik }) {
  const { getRequest } = useContext(RequestsContext)
  const [owiFields, setowiFieldsIFields] = useState({})
  const [baseCurSymbol, setBaseCurSymbol] = useState('')
  const [corCurSymbol, setCorCurSymbol] = useState('')

  async function getDefaultBaseCurrency() {
    const res = await getRequest({
      extension: SystemRepository.Defaults.get,
      parameters: `_filter=&_key=baseCurrencyId`
    })

    return res?.record?.value
  }
  async function getCurrencySymbol(currencyId) {
    const res = await getRequest({
      extension: SystemRepository.Currency.get,
      parameters: `_recordId=${currencyId}`
    })

    return res?.record?.symbol
  }
  async function getBaseCurrencySymbol() {
    const getBaseCurId = await getDefaultBaseCurrency()
    const symbol = await getCurrencySymbol(getBaseCurId)
    setBaseCurSymbol(symbol)
  }
  async function getCorCurrencySymbol() {
    const symbol = await getCurrencySymbol(formik.values.corCurrencyId)
    setCorCurSymbol(symbol)
  }

  useEffect(() => {
    ;(async function () {
      const res = await getRequest({
        extension: RemittanceOutwardsRepository.OutwardGLInformation.get,
        parameters: `_recordId=${formik.values?.recordId}`
      })
      res.record.corExRate = parseFloat(res.record.corExRate).toFixed(5)
      res.record.corEvalExRate = parseFloat(res.record.corEvalExRate).toFixed(5)
      res.record.netCommissionRevenue = parseFloat(res.record.netCommissionRevenue).toFixed(2)
      res.record.baseCorCommission = parseFloat(res.record.baseCorCommission).toFixed(2)
      res.record.grossProfit = parseFloat(res.record.grossProfit).toFixed(2)
      res.record.corBaseAmount = parseFloat(res.record.corBaseAmount).toFixed(2)
      setowiFieldsIFields(res.record)

      await getBaseCurrencySymbol()
      await getCorCurrencySymbol()
    })()
  }, [])

  return (
    <VertLayout>
      <Grow>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <CustomTextField
              name='corCurrencyRef'
              readOnly
              label={labels.corCurrency}
              value={owiFields?.corCurrencyRef}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomNumberField
              name='corExRate'
              readOnly
              label={labels.corCurrencyRate}
              value={owiFields?.corExRate}
              decimalScale={5}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='corEvalExRate'
              readOnly
              label={labels.corCurrencyEval}
              InputProps={{
                startAdornment: (
                  <Box component='span'>
                    <Typography component='span'>{owiFields?.corEvalExRate}</Typography>
                    <Typography
                      component='span'
                      sx={{
                        color: 'red',
                        ml: 1
                      }}
                    >
                      {corCurSymbol}
                    </Typography>
                  </Box>
                )
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomNumberField name='taxPercent' readOnly label={labels.TaxPct} value={owiFields?.taxPercent} />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='corAmount'
              readOnly
              label={labels.corAmount}
              InputProps={{
                startAdornment: (
                  <Box component='span'>
                    <Typography component='span'>{owiFields?.corAmount}</Typography>
                    <Typography
                      component='span'
                      sx={{
                        color: 'red',
                        ml: 1
                      }}
                    >
                      {corCurSymbol}
                    </Typography>
                  </Box>
                )
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <CustomTextField
              name='corComission'
              readOnly
              label={labels.corComission}
              InputProps={{
                startAdornment: (
                  <Box component='span'>
                    <Typography component='span'>{owiFields?.corCommission}</Typography>
                    <Typography
                      component='span'
                      sx={{
                        color: 'red',
                        ml: 1
                      }}
                    >
                      {corCurSymbol}
                    </Typography>
                  </Box>
                )
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='corBaseAmount'
              readOnly
              label={labels.corBaseAmount}
              InputProps={{
                startAdornment: (
                  <Box component='span'>
                    <Typography component='span'>{owiFields?.corBaseAmount}</Typography>
                    <Typography
                      component='span'
                      sx={{
                        color: 'red',
                        ml: 1
                      }}
                    >
                      {baseCurSymbol}
                    </Typography>
                  </Box>
                )
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='grossProfitFromExRate'
              readOnly
              label={labels.grossProfit}
              InputProps={{
                startAdornment: (
                  <Box component='span'>
                    <Typography component='span'>{owiFields?.grossProfit}</Typography>
                    <Typography
                      component='span'
                      sx={{
                        color: 'red',
                        ml: 1
                      }}
                    >
                      {baseCurSymbol}
                    </Typography>
                  </Box>
                )
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='netCommssionCost'
              readOnly
              label={labels.netCommission}
              InputProps={{
                startAdornment: (
                  <Box component='span'>
                    <Typography component='span'>{owiFields?.baseCorCommission}</Typography>
                    <Typography
                      component='span'
                      sx={{
                        color: 'red',
                        ml: 1
                      }}
                    >
                      {baseCurSymbol}
                    </Typography>
                  </Box>
                )
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='netCommissionRevenue'
              readOnly
              label={labels.netCommissionRevenue}
              InputProps={{
                startAdornment: (
                  <Box component='span'>
                    <Typography component='span'>{owiFields?.netCommissionRevenue}</Typography>
                    <Typography
                      component='span'
                      sx={{
                        color: 'red',
                        ml: 1
                      }}
                    >
                      {baseCurSymbol}
                    </Typography>
                  </Box>
                )
              }}
            />
          </Grid>
        </Grid>
      </Grow>
    </VertLayout>
  )
}
