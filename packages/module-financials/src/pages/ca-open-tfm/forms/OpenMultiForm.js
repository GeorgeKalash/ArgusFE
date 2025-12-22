import { Grid } from '@mui/material'
import { useContext } from 'react'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { CashBankRepository } from '@argus/repositories/src/repositories/CashBankRepository'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import Form from '@argus/shared-ui/src/components/Shared/Form'

export default function OpenMultiForm({ labels, maxAccess, recordId, plId, window }) {
  const { postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

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
    validateOnChange: true,
    validationSchema: yup.object({
      cashAccountId: yup.string().required()
    }),
    onSubmit: async obj => {
      await postRequest({
        extension: CashBankRepository.OpenMultiCurrencyCashTransfer.set,
        record: JSON.stringify(obj)
      })
      toast.success(platformLabels.Submit)
      window.close()

      invalidate()
    }
  })

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
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
                filter={{ plantId: plId }}
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
    </Form>
  )
}
