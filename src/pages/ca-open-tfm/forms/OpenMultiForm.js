import { Grid } from '@mui/material'
import { useContext } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'
import { CashBankRepository } from 'src/repositories/CashBankRepository'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'

export default function OpenMultiForm({ labels, maxAccess, recordId, plId }) {
  const { postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  console.log(plId, 'plantId2')

  const invalidate = useInvalidate({
    endpointId: CashBankRepository.OpenMultiCurrencyCashTransfer.open
  })

  const { formik } = useForm({
    initialValues: {
      recordId: recordId,
      cashAccountId: '',
      cashAccountRef: '',
      cashAccountName: ''
    },
    maxAccess,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      cashAccountId: yup.string().required()
    }),
    onSubmit: async obj => {
      const response = await postRequest({
        extension: CashBankRepository.OpenMultiCurrencyCashTransfer.set,
        record: JSON.stringify(obj)
      })
      toast.success(platformLabels.Submit)

      invalidate()
    }
  })

  return (
    <FormShell
      resourceId={ResourceIds.OpenMultiCurrencyCashTransfer}
      form={formik}
      maxAccess={maxAccess}
      infoVisible={false}
      isCleared={false}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={CashBankRepository.CashAccount.snapshot}
                parameters={{
                  _type: 0
                }}
                required
                name='cashAccountId'
                label={labels.cashAccount}
                valueField='reference'
                displayField='name'
                valueShow='cashAccountRef'
                secondValueShow='cashAccountName'
                form={formik}
                onChange={(event, newValue) => {
                  formik.setFieldValue('cashAccountId', newValue?.recordId || '')
                  formik.setFieldValue('cashAccountRef', newValue?.reference || '')
                  formik.setFieldValue('cashAccountName', newValue?.name || '')
                }}
                error={formik.touched.cashAccountId && Boolean(formik.errors.cashAccountId)}
                maxAccess={maxAccess}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
