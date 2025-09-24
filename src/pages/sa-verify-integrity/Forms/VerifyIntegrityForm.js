import { Grid } from '@mui/material'
import { useContext } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'
import CustomCheckBox from 'src/components/Inputs/CustomCheckBox'
import { SaleRepository } from 'src/repositories/SaleRepository'
import { useWindow } from 'src/windows'
import SuccessDialog from 'src/components/Shared/SuccessDialog'
import Form from 'src/components/Shared/Form'

export default function VerifyIntegrityForm({ _labels, maxAccess }) {
  const { platformLabels } = useContext(ControlContext)

  const { getRequest } = useContext(RequestsContext)
  const { stack } = useWindow()

  const { formik } = useForm({
    initialValues: {
      verifyQTN: false,
      verifyORD: false,
      verifyIVC: false
    },
    maxAccess,
    onSubmit: async () => {
      const res = await getRequest({
        extension: SaleRepository.VerifyIntegrity.check,
        parameters: `_verifyQTN=${formik.values.verifyQTN ? 1 : 0}&_verifyORD=${
          formik.values.verifyORD ? 1 : 0
        }&_verifyIVC=${formik.values.verifyIVC ? 1 : 0}`
      })

      if (res?.response?.data?.error) {
        return
      }

      if (!res.list) {
        stack({
          Component: SuccessDialog,
          props: {
            open: true,
            fullScreen: false,
            message: platformLabels.EverythingIsOk
          }
        })
      }
    }
  })

  const actions = [
    {
      key: 'Run',
      condition: true,
      onClick: () => formik.handleSubmit(),
      disabled: false
    }
  ]

  return (
    <Form actions={actions} isSaved={false} inSave={formik.handleSubmit} maxAccess={maxAccess}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomCheckBox
                name='verifyQTN'
                value={formik.values?.verifyQTN}
                onChange={event => formik.setFieldValue('verifyQTN', event.target.checked)}
                label={_labels.verifyQTN}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomCheckBox
                name='verifyORD'
                value={formik.values?.verifyORD}
                onChange={event => formik.setFieldValue('verifyORD', event.target.checked)}
                label={_labels.verifyORD}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomCheckBox
                name='verifyIVC'
                value={formik.values?.verifyIVC}
                onChange={event => formik.setFieldValue('verifyIVC', event.target.checked)}
                label={_labels.verifyIVC}
                maxAccess={maxAccess}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </Form>
  )
}
