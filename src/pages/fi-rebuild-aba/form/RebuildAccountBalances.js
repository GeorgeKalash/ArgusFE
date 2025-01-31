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
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { FinancialRepository } from 'src/repositories/FinancialRepository'
import { ControlContext } from 'src/providers/ControlContext'

export default function RebuildAccountBalances({ _labels, access }) {
  const { postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { formik } = useForm({
    initialValues: { fiscalYear: '', groupId: 0, recordId: 'N/A', accountId: 0 },
    enableReinitialize: true,
    maxAccess: access,
    validateOnChange: true,

    validationSchema: yup.object({
      fiscalYear: yup.string().required()
    }),
    onSubmit: async obj => {
      const { recordId, ...rest } = obj

      await postRequest({
        extension: FinancialRepository.AccountCreditBalance.rebuild,
        record: JSON.stringify(rest)
      })

      toast.success(platformLabels.rebuild)
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
      resourceId={ResourceIds.RebuildAccountBalances}
      form={formik}
      actions={actions}
      maxAccess={access}
      isSaved={false}
      isCleared={false}
      editMode={true}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.FiscalYears.qry}
                name='fiscalYear'
                label={_labels.year}
                valueField='fiscalYear'
                displayField='fiscalYear'
                values={formik.values}
                required
                maxAccess={access}
                onChange={(event, newValue) => {
                  formik.setFieldValue('fiscalYear', newValue?.fiscalYear || null)
                }}
                error={formik.touched.fiscalYear && Boolean(formik.errors.fiscalYear)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={FinancialRepository.Account.snapshot}
                name='accountId'
                label={_labels.account}
                valueField='reference'
                displayField='name'
                valueShow='accountRef'
                secondValueShow='accountName'
                form={formik}
                onChange={(event, newValue) => {
                  formik.setFieldValue('accountId', newValue?.recordId || '')
                  formik.setFieldValue('accountRef', newValue?.reference || '')
                  formik.setFieldValue('accountName', newValue?.name || '')
                }}
                error={formik.touched.accountId && Boolean(formik.errors.accountId)}
                maxAccess={access}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={FinancialRepository.Group.qry}
                name='groupId'
                label={_labels.accountGroup}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                valueField='recordId'
                displayField='name'
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('groupId', newValue?.recordId || null)
                }}
                maxAccess={access}
                error={formik.touched.groupId && Boolean(formik.errors.groupId)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
