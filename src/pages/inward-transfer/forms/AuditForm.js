import { Box, Grid, Typography } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import FormShell from 'src/components/Shared/FormShell'
import { RequestsContext } from 'src/providers/RequestsContext'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceIds } from 'src/resources/ResourceIds'

export default function AuditForm({ labels, formik }) {
  const { getRequest } = useContext(RequestsContext)
  const [iwiFields, setiwiFieldsIFields] = useState({})
  const [baseCurSymbol, setBaseCurSymbol] = useState('')
  const [corCurSymbol, setCorCurSymbol] = useState('')

  async function getDefaultBaseCurrency() {
    try {
      const res = await getRequest({
        extension: SystemRepository.Defaults.get,
        parameters: `_filter=&_key=baseCurrencyId`
      })

      return res?.record?.value
    } catch (error) {}
  }

  async function getBaseCurrencySymbol() {
    try {
      const getBaseCurId = await getDefaultBaseCurrency()
      const symbol = await getCurrencySymbol(getBaseCurId)
      setBaseCurSymbol(symbol)
    } catch (error) {}
  }

  async function getCorCurrencySymbol(corCurrencyId) {
    try {
      const symbol = await getCurrencySymbol(corCurrencyId)
      setCorCurSymbol(symbol)
    } catch (error) {}
  }

  async function getCurrencySymbol(currencyId) {
    try {
      const res = await getRequest({
        extension: SystemRepository.Currency.get,
        parameters: `_recordId=${currencyId}`
      })

      return res?.record?.symbol
    } catch (error) {}
  }

  useEffect(() => {
    ;(async function () {
      try {
        const res = await getRequest({
          extension: RemittanceOutwardsRepository.InwardGLInformation.get,
          parameters: `_recordId=${formik.values?.recordId}`
        })

        res.record.corExRate = parseFloat(res.record.corExRate).toFixed(5)
        res.record.corEvalExRate = parseFloat(res.record.corEvalExRate).toFixed(2)
        res.record.corCommission = parseFloat(res.record.corCommission).toFixed(2)
        res.record.corBaseAmount = parseFloat(res.record.corBaseAmount).toFixed(2)
        res.record.corAmount = parseFloat(res.record.corAmount).toFixed(2)
        res.record.amount = parseFloat(res.record.amount).toFixed(2)
        res.record.baseCorCommission = parseFloat(res.record.baseCorCommission).toFixed(2)
        res.record.commission = parseFloat(res.record.commission).toFixed(2)
        res.record.exRate = parseFloat(res.record.exRate).toFixed(5)
        res.record.netCommissionRevenue = parseFloat(res.record.netCommissionRevenue).toFixed(2)
        res.record.taxAmount = parseFloat(res.record.taxAmount).toFixed(2)

        setiwiFieldsIFields(res.record)
        await getBaseCurrencySymbol()
        await getCorCurrencySymbol(res?.record?.corCurrencyId)
      } catch (error) {}
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.InwardTransfer} form={formik} isCleared={false} isInfo={false} isSaved={false}>
      <Grid container spacing={2}>
        <Grid item xs={12} sx={{ mx: 5, mt: 2 }}>
          <CustomTextField
            name='corCurrencyRef'
            readOnly
            label={labels.corCurrency}
            value={iwiFields?.corCurrencyRef}
          />
        </Grid>
        <Grid item xs={12} sx={{ mx: 5 }}>
          <CustomNumberField
            name='corExRate'
            readOnly
            label={labels.corExRate}
            value={iwiFields?.corExRate}
            decimalScale={5}
          />
        </Grid>
        <Grid item xs={12} sx={{ mx: 5 }}>
          <CustomTextField
            name='corEvalExRate'
            readOnly
            label={labels.corEvalExRate}
            InputProps={{
              startAdornment: (
                <Box component='span'>
                  <Typography component='span'>{iwiFields?.corEvalExRate}</Typography>
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
          <CustomNumberField
            name='taxAmount'
            readOnly
            label={labels.taxAmount}
            value={iwiFields?.taxAmount}
            decimalScale={2}
          />
        </Grid>
        <Grid item xs={12} sx={{ mx: 5 }}>
          <CustomTextField
            name='corAmount'
            readOnly
            label={labels.corAmount}
            InputProps={{
              startAdornment: (
                <Box component='span'>
                  <Typography component='span'>{iwiFields?.corAmount}</Typography>
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
            name='corCommission'
            readOnly
            label={labels.corComission}
            InputProps={{
              startAdornment: (
                <Box component='span'>
                  <Typography component='span'>{iwiFields?.corCommission}</Typography>
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
            name='baseCorCommission'
            readOnly
            label={labels.baseCorCommission}
            InputProps={{
              startAdornment: (
                <Box component='span'>
                  <Typography component='span'>{iwiFields?.baseCorCommission}</Typography>
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
            name='corBaseAmount'
            readOnly
            label={labels.corBaseAmount}
            InputProps={{
              startAdornment: (
                <Box component='span'>
                  <Typography component='span'>{iwiFields?.corBaseAmount}</Typography>
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
          <CustomNumberField name='exRate' readOnly label={labels.exRate} value={iwiFields?.exRate} decimalScale={5} />
        </Grid>
        <Grid item xs={12} sx={{ mx: 5 }}>
          <CustomTextField
            name='amount'
            readOnly
            label={labels.amount}
            InputProps={{
              startAdornment: (
                <Box component='span'>
                  <Typography component='span'>{iwiFields?.amount}</Typography>
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
            name='commission'
            readOnly
            label={labels.commission}
            InputProps={{
              startAdornment: (
                <Box component='span'>
                  <Typography component='span'>{iwiFields?.commission}</Typography>
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
                  <Typography component='span'>{iwiFields?.netCommissionRevenue}</Typography>
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
