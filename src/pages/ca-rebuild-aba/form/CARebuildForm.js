import { Grid } from '@mui/material'
import * as yup from 'yup'
import { useContext } from 'react'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'
import { CashBankRepository } from 'src/repositories/CashBankRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'

export default function CARebuildAccountBalance({ _labels, access }) {
  const { postRequest } = useContext(RequestsContext)

  const { formik } = useForm({
    initialValues: { fiscalYear: '', cashAccountId: 0, recordId: 'N/A' },
    enableReinitialize: true,
    maxAccess: access,
    validateOnChange: true,

    validationSchema: yup.object({
      fiscalYear: yup.string().required(' ')
    }),
    onSubmit: async obj => {
      try {
        const { recordId, ...rest } = obj

        const response = await postRequest({
          extension: CashBankRepository.AccountBalance.rebuild,
          record: JSON.stringify(rest)
        })

        toast.success('Record Success')
        formik.setValues({
          ...obj
        })

        invalidate()
      } catch (error) {}
    }
  })

  const rebuild = () => {
    formik.handleSubmit()
  }

  const actions = [
    {
      key: 'Rebuild',
      condition: true,
      onClick: () => {
        rebuild()
      },
      disabled: false
    }
  ]

  return (
    <FormShell
      resourceId={ResourceIds.CARebuildAccountBalance}
      form={formik}
      actions={actions}
      maxAccess={access}
      isSaved={false}
      editMode={true}
      isSavedClear={false}
      isCleared={false}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.FiscalYears.qry}
                name='fiscalYear'
                label={_labels.fiscalYear}
                valueField='fiscalYear'
                displayField='fiscalYear'
                values={formik.values}
                required
                maxAccess={access}
                onChange={(event, newValue) => {
                  formik && formik.setFieldValue('fiscalYear', newValue?.fiscalYear)
                }}
                error={formik.touched.fiscalYear && Boolean(formik.errors.fiscalYear)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={CashBankRepository.CashAccount.snapshot}
                parameters={{
                  _type: 2
                }}
                name='cashAccountId'
                label={_labels.account}
                valueField='reference'
                displayField='name'
                valueShow='cashAccountRef'
                secondValueShow='cashAccountName'
                form={formik}
                onChange={(event, newValue) => {
                  formik.setFieldValue('cashAccountId', newValue ? newValue.recordId : 0)
                  formik.setFieldValue('cashAccountRef', newValue ? newValue.reference : '')
                  formik.setFieldValue('cashAccountName', newValue ? newValue.name : '')
                }}
                maxAccess={access}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
