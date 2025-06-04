import { Grid, FormControlLabel, RadioGroup, Radio } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
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
import { useWindow } from 'src/windows'
import PopupDialog from 'src/components/Shared/PopupDialog'
import * as yup from 'yup'
import { useError } from 'src/error'

export default function POSForm({ labels, form, maxAccess, amount }) {
  const { getRequestFullEndPoint, getRequest } = useContext(RequestsContext)
  const { userDefaultsData } = useContext(ControlContext)
  const cashAccountId = parseInt(userDefaultsData?.list?.find(obj => obj.key === 'cashAccountId')?.value)
  const [isSubmitting, setSubmitting] = useState(false)
  const { stack } = useWindow()
  const { stack: stackError } = useError()

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      msgid: null,
      ecrno: process.env.NEXT_PUBLIC_ECRNO,
      ecR_RCPT: form?.values?.header?.reference,
      amount: (amount * 100).toString(),
      a1: 'E',
      a2: '',
      a3: '',
      a4: '',
      a5: '',
      ipaddressOrPort: process.env.NEXT_PUBLIC_POS_PORT,
      log: 1,
      posSelected: 1,
      cashAccountId: null,
      cashAccountRef: null,
      cashAccountName: null
    },
    validateOnChange: true,
    validationSchema: yup.object({
      cashAccountId: yup.number().required(),
      posRef: yup.string().required()
    })
  })

  const actions = [
    {
      key: 'Received',
      condition: true,
      onClick: onReceived,
      viewLoader: isSubmitting
    },
    {
      key: 'Cancel',
      condition: true,
      onClick: onCancel
    }
  ]
  async function onReceived() {
    try {
      const errors = await formik.validateForm()
      formik.setTouched({ cashAccountId: true, posRef: true })
      if (Object.keys(errors).length > 0) {
        return
      }
      setSubmitting(true)
      const res = await axios.post(`${process.env.NEXT_PUBLIC_POS_URL}/api/Ingenico/start_PUR`, formik.values)
      if (res.data) {
        setSubmitting(false)

        const formattedText = res.data.replace(/ /g, '\n')

        stack({
          Component: PopupDialog,
          props: {
            DialogText: formattedText
          },
          width: 550,
          height: 250,
          expandable: false,
          closable: false
        })
      }
    } catch (error) {
      setSubmitting(false)
      stackError({
        message: error?.message
      })
    }
  }
  async function onCancel() {
    try {
      const errors = await formik.validateForm()
      formik.setTouched({ cashAccountId: true, posRef: true })
      if (Object.keys(errors).length > 0) {
        return
      }
      setSubmitting(false)
      await axios.get(`${process.env.NEXT_PUBLIC_POS_URL}/api/Ingenico/cancelTransaction`)
    } catch (error) {
      stackError({
        message: error?.message
      })
    }
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
        endPoint: `${process.env.NEXT_PUBLIC_POS_URL}/api/Ingenico/checkDevice?_port=${process.env.NEXT_PUBLIC_POS_PORT}`
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
                disabled={formik.values.posSelected == 1}
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
              displayFieldWidth={2}
              valueShow='cashAccountRef'
              secondValueShow='cashAccountName'
              editMode={true}
              maxAccess={maxAccess}
              errorCheck={'cashAccountId'}
              onChange={(event, newValue) => {
                formik.setFieldValue('cashAccountRef', newValue?.reference)
                formik.setFieldValue('cashAccountName', newValue?.name)
                formik.setFieldValue('cashAccountId', newValue?.recordId || null)
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
              onChange={formik.handleChange}
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
