import { Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import FormShell from 'src/components/Shared/FormShell'
import { RequestsContext } from 'src/providers/RequestsContext'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'
import { ResourceIds } from 'src/resources/ResourceIds'

export default function InfoForm({ labels, formik }) {
  const { getRequest } = useContext(RequestsContext)
  const [owiFields, setowiFieldsIFields] = useState({})

  useEffect(() => {
    ;(async function () {
      try {
        const res = await getRequest({
          extension: RemittanceOutwardsRepository.OutwardGLInformation.get,
          parameters: `_recordId=${formik.values?.recordId}`
        })
        res.record.corExRate = parseFloat(res.record.corExRate).toFixed(5)
        res.record.corEvalExRate = parseFloat(res.record.corEvalExRate).toFixed(5)
        setowiFieldsIFields(res.record)
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
            value={owiFields?.corCurrencyRef}
          />
        </Grid>
        <Grid item xs={12} sx={{ mx: 5 }}>
          <CustomNumberField
            name='corExRate'
            readOnly
            label={labels.corCurrencyRate}
            value={owiFields?.corExRate}
            decimalScale={5}
          />
        </Grid>
        <Grid item xs={12} sx={{ mx: 5 }}>
          <CustomNumberField
            name='corEvalExRate'
            readOnly
            label={labels.corCurrencyEval}
            value={owiFields?.corEvalExRate}
            decimalScale={5}
          />
        </Grid>
        <Grid item xs={12} sx={{ mx: 5 }}>
          <CustomNumberField name='taxPercent' readOnly label={labels.TaxPct} value={owiFields?.taxPercent} />
        </Grid>

        <Grid item xs={12} sx={{ mx: 5 }}>
          <CustomNumberField name='corAmount' readOnly label={labels.corAmount} value={owiFields?.corAmount} />
        </Grid>
        <Grid item xs={12} sx={{ mx: 5 }}>
          <CustomNumberField
            name='corComission'
            readOnly
            label={labels.corComission}
            value={owiFields?.corCommission}
          />
        </Grid>
        <Grid item xs={12} sx={{ mx: 5 }}>
          <CustomNumberField
            name='corBaseAmount'
            readOnly
            label={labels.corBaseAmount}
            value={owiFields?.corBaseAmount}
          />
        </Grid>
        <Grid item xs={12} sx={{ mx: 5 }}>
          <CustomNumberField
            name='grossProfitFromExRate'
            readOnly
            label={labels.grossProfit}
            value={owiFields?.grossProfit}
          />
        </Grid>
        <Grid item xs={12} sx={{ mx: 5 }}>
          <CustomNumberField
            name='netCommssionCost '
            readOnly
            label={labels.netCommission}
            value={owiFields?.baseCorCommission}
          />
        </Grid>
        <Grid item xs={12} sx={{ mx: 5 }}>
          <CustomNumberField
            name='netCommissionRevenue'
            readOnly
            label={labels.netCommissionRevenue}
            value={owiFields?.netCommissionRevenue}
          />
        </Grid>
      </Grid>
    </FormShell>
  )
}
