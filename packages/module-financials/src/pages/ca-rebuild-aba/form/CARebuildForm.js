import { Grid } from '@mui/material'
import * as yup from 'yup'
import { useContext } from 'react'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { CashBankRepository } from '@argus/repositories/src/repositories/CashBankRepository'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'

export default function CARebuildAccountBalance({ _labels, access }) {
  const { postRequest } = useContext(RequestsContext)

  const { formik } = useForm({
    initialValues: { fiscalYear: '', cashAccountId: 0, recordId: 'N/A' },
    maxAccess: access,
    validateOnChange: true,

    validationSchema: yup.object({
      fiscalYear: yup.string().required()
    }),
    onSubmit: async obj => {
      const { recordId, ...rest } = obj

      await postRequest({
        extension: CashBankRepository.AccountBalance.rebuild,
        record: JSON.stringify(rest)
      })

      toast.success('Record Success')
      formik.setValues({
        ...obj
      })

      invalidate()
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
          <Grid container spacing={2}>
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
              <ResourceComboBox
                endpointId={CashBankRepository.CashAccount.qry}
                parameters={`_type=2`}
                name='cashAccountId'
                label={_labels.account}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                maxAccess={access}
                onChange={(_, newValue) => {
                  formik.setFieldValue('cashAccountId', newValue?.recordId || 0)
                }}
                error={formik.touched.cashAccountId && Boolean(formik.errors.cashAccountId)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
