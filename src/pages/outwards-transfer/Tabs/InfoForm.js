import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import FormShell from 'src/components/Shared/FormShell'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'

export default function InfoForm({ labels, formik }) {
  const { getRequest } = useContext(RequestsContext)

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
          <CustomTextField name='corExRate' readOnly label={labels.corCurrencyRate} value={formik.values.corExRate} />
        </Grid>
        <Grid item xs={12} sx={{ mx: 5 }}>
          <CustomTextField
            name='corEvalExRate'
            readOnly
            label={labels.corCurrencyEval}
            value={formik.values.corEvalExRate}
          />
        </Grid>
        <Grid item xs={12} sx={{ mx: 5 }}>
          <CustomTextField name='taxPercent' readOnly label={labels.TaxPct} value={formik.values.vatRate} />
        </Grid>

        <Grid item xs={12} sx={{ mx: 5 }}>
          <CustomTextField name='corAmount' readOnly label={labels.corAmount} value={formik.values.corAmount} />
        </Grid>
        <Grid item xs={12} sx={{ mx: 5 }}>
          <CustomTextField
            name='corFCCommission'
            readOnly
            label={labels.commissionPayable}
            value={formik.values.corFCCommission}
          />
        </Grid>
        <Grid item xs={12} sx={{ mx: 5 }}>
          <CustomTextField
            name='corComission'
            readOnly
            label={labels.corComission}
            value={formik.values.corCommission}
          />
          {/* fees */}
        </Grid>
        <Grid item xs={12} sx={{ mx: 5 }}>
          <CustomTextField
            name='corBaseAmount'
            readOnly
            label={labels.corBaseAmount}
            value={formik.values.corBaseAmount}
          />
        </Grid>
        <Grid item xs={12} sx={{ mx: 5 }}>
          <CustomTextField
            name='grossProfitFromExRate'
            readOnly
            label={labels.grossProfit}
            value={formik.values.grossProfitFromExRate}
          />
        </Grid>
        <Grid item xs={12} sx={{ mx: 5 }}>
          <CustomTextField
            name='netCommssionCost '
            readOnly
            label={labels.netCommission}
            value={formik.values.etCommssionCost}
          />
        </Grid>
        <Grid item xs={12} sx={{ mx: 5 }}>
          <CustomTextField
            name='netCommissionRevenue'
            readOnly
            label={labels.netCommissionRevenue}
            value={formik.values.netCommissionRevenue}
          />
        </Grid>
      </Grid>
    </FormShell>
  )
}
