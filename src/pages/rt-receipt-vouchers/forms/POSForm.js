import { Grid, FormControlLabel, RadioGroup, Radio } from '@mui/material'
import { useContext, useEffect } from 'react'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import FormShell from 'src/components/Shared/FormShell'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useForm } from 'src/hooks/form'
import { CashBankRepository } from 'src/repositories/CashBankRepository'
import { ControlContext } from 'src/providers/ControlContext'
import axios from 'axios'

export default function POSForm({ labels, form, maxAccess, amount }) {
  const { getRequestFullEndPoint, getRequest } = useContext(RequestsContext)
  const { platformLabels, userDefaultsData } = useContext(ControlContext)
  const cashAccountId = parseInt(userDefaultsData?.list?.find(obj => obj.key === 'cashAccountId')?.value)

  const { formik } = useForm({
    maxAccess: maxAccess,
    enableReinitialize: false,
    validateOnChange: true,
    initialValues: {
      msgid: null,
      ecrno: process.env.NEXT_PUBLIC_ECRNO,
      ecR_RCPT: form?.values?.header?.reference,
      amount: amount * 100,
      a1: 'E',
      a2: null,
      a3: null,
      a4: null,
      a5: null,
      ipaddressOrPort: process.env.NEXT_PUBLIC_POS_PORT,
      log: 1,
      posSelected: 1,
      cashAccountId: null,
      cashAccountRef: null,
      cashAccountName: null
    },
    onSubmit: async obj => {}
  })

  const actions = [
    {
      key: 'Received',
      condition: true,
      onClick: onReceived
    },
    {
      key: 'Cancel',
      condition: true,
      onClick: onCancel
    }
  ]
  async function onReceived() {
    axios.post(`${process.env.NEXT_PUBLIC_POS_URL}/start_PUR`, {
      record: JSON.stringify(formik.values)
    })
  }
  async function onCancel() {
    await axios.get(`${process.env.NEXT_PUBLIC_POS_URL}/cancelTransaction`)
  }

  async function fillCashAccount() {
    if (!cashAccountId) return

    const res = await getRequest({
      extension: CashBankRepository.CashAccount.get,
      parameters: `_recordId=${cashAccountId}`
    })
    formik.setFieldValue('cashAccountId', cashAccountId)
    formik.setFieldValue('cashAccountRef', res?.record?.reference)
    formik.setFieldValue('cashAccountName', res?.record?.name)
  }
  useEffect(() => {
    ;(async function () {
      await fillCashAccount()

      const response = await getRequestFullEndPoint({
        endPoint: `${process.env.NEXT_PUBLIC_POS_URL}/checkDevice?_port=${process.env.NEXT_PUBLIC_POS_PORT}`
      })
      formik.setFieldValue('posSelected', response?.data ? 2 : 1)
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
              <FormControlLabel
                value={1}
                control={<Radio />}
                label={labels.manualPOS}
                disabled={formik.values.posSelected == 2}
              />
              <FormControlLabel
                value={2}
                control={<Radio />}
                label={labels.apiPOS}
                disabled={formik.values.posSelected == 2}
              />
            </RadioGroup>
          </Grid>
          <Grid item xs={12}>
            <ResourceLookup
              endpointId={CashBankRepository.CashAccount.snapshot}
              parameters={{
                _type: 2
              }}
              valueField='reference'
              displayField='name'
              name='cashAccountId'
              label={labels.posAccount}
              form={formik}
              readOnly={formik.values.posSelected == 2}
              displayFieldWidth={6}
              valueShow='cashAccountRef'
              secondValueShow='cashAccountName'
              editMode={true}
              maxAccess={maxAccess}
              errorCheck={'cashAccountId'}
              onChange={(event, newValue) => {
                formik.setFieldValue('cashAccountId', newValue?.recordId)
                formik.setFieldValue('cashAccountRef', newValue?.reference)
                formik.setFieldValue('cashAccountName', newValue?.name)
              }}
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
              readOnly={formik.values.posSelected == 2}
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
