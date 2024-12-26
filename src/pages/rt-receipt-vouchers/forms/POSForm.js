import { Box, Grid, Typography } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import FormShell from 'src/components/Shared/FormShell'
import { RequestsContext } from 'src/providers/RequestsContext'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceIds } from 'src/resources/ResourceIds'

export default function POSForm({ labels, formik }) {
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

  return (
    <FormShell resourceId={ResourceIds.OutwardsOrder} form={formik} isCleared={false} isInfo={false} isSaved={false}>
      <Grid container spacing={2}>
        <Grid item xs={12} sx={{ mx: 5, mt: 2 }}>
          <CustomTextField
            name='corCurrencyRef'
            readOnly
            label={labels?.corCurrency}
            value={owiFields?.corCurrencyRef}
          />
        </Grid>
        <Grid item xs={12} sx={{ mx: 5 }}>
          <CustomNumberField
            name='corExRate'
            readOnly
            label={labels?.corCurrencyRate}
            value={owiFields?.corExRate}
            decimalScale={5}
          />
        </Grid>
        <Grid item xs={12} sx={{ mx: 5 }}>
          <CustomTextField
            name='corEvalExRate'
            readOnly
            label={labels?.corCurrencyEval}
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
        <Grid item xs={12} sx={{ mx: 5 }}>
          <CustomNumberField name='taxPercent' readOnly label={labels.TaxPct} value={owiFields?.taxPercent} />
        </Grid>
        <Grid item xs={12} sx={{ mx: 5 }}>
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

        <Grid item xs={12} sx={{ mx: 5 }}>
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
        <Grid item xs={12} sx={{ mx: 5 }}>
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
        <Grid item xs={12} sx={{ mx: 5 }}>
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
        <Grid item xs={12} sx={{ mx: 5 }}>
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
        <Grid item xs={12} sx={{ mx: 5 }}>
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
    </FormShell>
  )
}
