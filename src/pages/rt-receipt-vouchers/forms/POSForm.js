import { Grid, FormControlLabel, RadioGroup, Radio } from '@mui/material'
import { useContext, useEffect } from 'react'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import FormShell from 'src/components/Shared/FormShell'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SaleRepository } from 'src/repositories/SaleRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import { SystemFunction } from 'src/resources/SystemFunction'
import { useForm } from 'src/hooks/form'

export default function POSForm({ labels, form, maxAccess, amount }) {
  const { getRequestFullEndPoint, getRequest, postRequest } = useContext(RequestsContext)

  const { formik } = useForm({
    maxAccess: maxAccess,
    enableReinitialize: false,
    validateOnChange: true,
    initialValues: {
      msgid: null,
      ecrno: null,
      ecR_RCPT: form?.values?.header?.reference,
      amount: amount * 100,
      a1: 'E',
      a2: null,
      a3: null,
      a4: null,
      a5: null,
      ipaddressOrPort: process.env.NEXT_PUBLIC_POS_PORT,
      log: 1,
      posSelected: 1
    },
    onSubmit: async obj => {}
  })

  const actions = [
    {
      key: 'Received',
      condition: true,
      onClick: () => {}
    },
    {
      key: 'Cancel',
      condition: true,
      onClick: () => {}
    }
  ]
  useEffect(() => {
    ;(async function () {
      // const response = await getRequestFullEndPoint({
      //   endPoint: 'checkDevice?_port=' + process.env.NEXT_PUBLIC_POS_PORT
      // })
      // if (response.data) {
      // }
    })()
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.POSPayment}
      form={formik}
      isCleared={false}
      isInfo={false}
      isSaved={false}
      actions={actions}
    >
      <Grow>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <CustomTextField
              name='reference'
              readOnly
              label={labels?.reference}
              maxAccess={maxAccess}
              value={form?.values?.header?.reference}
            />
          </Grid>
          <Grid item container spacing={2}>
            <Grid item xs={6}>
              <CustomTextField
                name='clientName'
                readOnly
                label={labels?.client}
                value={form?.values?.header?.clientName}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomTextField
                name='beneficiaryName'
                readOnly
                label={labels?.beneficiary}
                value={form?.values?.header?.beneficiaryName}
                maxAccess={maxAccess}
              />
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <RadioGroup row value={formik.values.posSelected} defaultValue={1}>
              <FormControlLabel value={1} control={<Radio />} label={labels.manualPOS} />
              <FormControlLabel value={2} control={<Radio />} label={labels.apiPOS} />
            </RadioGroup>
          </Grid>
          <Grid item xs={12}>
            <ResourceLookup
              endpointId={SaleRepository.Client.snapshot}
              valueField='reference'
              displayField='name'
              name='posAccountId'
              label={labels.posAccount}
              form={formik}
              required
              displayFieldWidth={6}
              valueShow='posAccountRef'
              secondValueShow='posAccountName'
              editMode={true}
              maxAccess={maxAccess}
              errorCheck={'posAccountId'}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomNumberField
              name='amount'
              label={labels.amount}
              value={formik?.values?.amount}
              maxAccess={maxAccess}
              readOnly
              error={formik.touched?.amount && Boolean(formik.errors?.amount)}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='posRef'
              label={labels?.posRef}
              value={formik?.posRef}
              maxAccess={maxAccess}
              error={formik.touched.posRef && Boolean(formik.errors.posRef)}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextArea
              name='remarks'
              label={labels.remarks}
              value={formik.values.remarks}
              rows={3}
              maxAccess={maxAccess}
              editMode={true}
              onChange={e => formik.setFieldValue('remarks', e.target.value)}
              onClear={() => formik.setFieldValue('remarks', '')}
              error={formik.touched?.remarks && Boolean(formik.errors.remarks)}
            />
          </Grid>
        </Grid>
      </Grow>
    </FormShell>
  )
}
