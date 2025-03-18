import { Grid, Typography } from '@mui/material'
import * as yup from 'yup'
import { useContext } from 'react'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { FinancialRepository } from 'src/repositories/FinancialRepository'
import { ControlContext } from 'src/providers/ControlContext'
import CustomTextField from 'src/components/Inputs/CustomTextField'

export default function RebuildAgingForm({ _labels, access }) {
  const { postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { formik } = useForm({
    initialValues: { rebuild: '', accountId: 0, recordId: 'N/A' },
    enableReinitialize: true,
    maxAccess: access,
    validateOnChange: true,
    validationSchema: yup.object({
      rebuild: yup
        .string()
        .test(
          'is-rebuild',
          'Value must be "rebuild"',
          value => typeof value === 'string' && value.toLowerCase() === 'rebuild'
        ).required()
    }),
    onSubmit: async obj => {
      const { recordId, ...rest } = obj

      await postRequest({
        extension: FinancialRepository.RebuildAging.rebuild,
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
      resourceId={ResourceIds.RebuildAging}
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
              <Typography variant='body1'>{_labels.infoText}</Typography>
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='rebuild'
                required
                label={_labels.rebuild}
                value={formik.values.rebuild}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('rebuild', '')}
                error={formik.touched.rebuild && Boolean(formik.errors.rebuild)}
                maxAccess={access}
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
                displayFieldWidth={2}
                secondValueShow='accountName'
                form={formik}
                onChange={(event, newValue) => {
                  formik.setFieldValue('accountId', newValue?.recordId || null)
                  formik.setFieldValue('accountRef', newValue?.reference || '')
                  formik.setFieldValue('accountName', newValue?.name || '')
                }}
                error={formik.touched.accountId && Boolean(formik.errors.accountId)}
                maxAccess={access}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
