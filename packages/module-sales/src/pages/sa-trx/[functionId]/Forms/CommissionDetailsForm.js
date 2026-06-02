import { Grid } from '@mui/material'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'

export default function CommissionDetailsForm({ labels, maxAccess, header }) {
  return (
    <VertLayout>
      <Grow>
        <Grid container spacing={3} p={2}>
          <Grid item xs={12}>
            <CustomNumberField
              name='baseAmount'
              value={header?.baseAmount || 0}
              label={labels.baseAmount}
              readOnly
              maxAccess={maxAccess}
            />
          </Grid>

          <Grid item xs={12}>
            <CustomNumberField
              name='balanceAmount'
              value={header?.balance || 0}
              label={labels.balance}
              readOnly
              maxAccess={maxAccess}
            />
          </Grid>

          <Grid item xs={12}>
            <CustomNumberField
              name='returnedAmount'
              value={header?.returnedAmount || 0}
              label={labels.returnedAmount}
              readOnly
              maxAccess={maxAccess}
            />
          </Grid>

          <Grid item xs={12}>
            <CustomNumberField
              name='amountSubjectToCommission'
              value={parseFloat(header?.baseAmount || 0) - parseFloat(header?.returnedAmount || 0)}
              label={labels.amountSubjectToCommission}
              readOnly
              maxAccess={maxAccess}
            />
          </Grid>
        </Grid>
      </Grow>
    </VertLayout>
  )
}