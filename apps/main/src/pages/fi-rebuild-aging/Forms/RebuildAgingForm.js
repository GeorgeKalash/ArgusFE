import { Grid, Typography } from '@mui/material'
import * as yup from 'yup'
import { useContext } from 'react'
import FormShell from '@argus/shared-ui/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/providers/RequestsContext'
import { ResourceIds } from '@argus/shared-domain/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/components/Layouts/Grow'
import { useForm } from '@argus/shared-hooks/hooks/form'
import { ResourceLookup } from '@argus/shared-ui/components/Shared/ResourceLookup'
import { FinancialRepository } from '@argus/repositories/repositories/FinancialRepository'
import { ControlContext } from '@argus/shared-providers/providers/ControlContext'
import CustomTextField from '@argus/shared-ui/components/Inputs/CustomTextField'
import { useWindow } from '@argus/shared-providers/providers/windows'
import { ThreadProgress } from '@argus/shared-ui/components/Shared/ThreadProgress'

export default function RebuildAgingForm({ _labels, access, values }) {
  const { postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  const { formik } = useForm({
    initialValues: {
      rebuild: '',
      accountId: values?.accountId || 0,
      accountRef: values?.accountRef || '',
      accountName: values?.accountName || '',
      recordId: 'N/A'
    },
    maxAccess: access,
    validateOnChange: true,
    validationSchema: yup.object({
      rebuild: yup
        .string()
        .test(
          'is-rebuild',
          'Value must be "rebuild"',
          value => typeof value === 'string' && value.toLowerCase() === 'rebuild'
        )
        .required()
    }),
    onSubmit: async obj => {
      const { recordId, ...rest } = obj

      const res = await postRequest({
        extension: FinancialRepository.AgingDoc.rebuild,
        record: JSON.stringify(rest)
      })

      stack({
        Component: ThreadProgress,
        props: {
          recordId: res.recordId
        },
        closable: false
      })

      toast.success(platformLabels.rebuild)
    }
  })

  const actions = [
    {
      key: 'Rebuild',
      condition: true,
      onClick: formik.handleSubmit,
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
                  formik.setFieldValue('accountId', newValue?.recordId || 0)
                  formik.setFieldValue('accountRef', newValue?.reference || '')
                  formik.setFieldValue('accountName', newValue?.name || '')
                }}
                readOnly={values?.accountId}
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

RebuildAgingForm.height = 460
