import { Grid } from '@mui/material'
import { useContext } from 'react'
import FormShell from 'src/components/Shared/FormShell'
import { RequestsContext } from 'src/providers/RequestsContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'
import CustomCheckBox from 'src/components/Inputs/CustomCheckBox'
import { ResourceIds } from 'src/resources/ResourceIds'
import { SaleRepository } from 'src/repositories/SaleRepository'
import { useWindow } from 'src/windows'
import { ThreadProgress } from 'src/components/Shared/ThreadProgress'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { useError } from 'src/error'

export default function SyncSalesTransactionForm({ _labels, maxAccess }) {
  const { platformLabels } = useContext(ControlContext)
  const { stack: stackError } = useError()
  const { postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()

  const { formik } = useForm({
    initialValues: {
      startDate: new Date(),
      endDate: new Date(),
      syncTRX: false,
      syncRET: false,
      syncPOS: false
    },
    maxAccess,
    enableReinitialize: true,
    onSubmit: async data => {
      const res = await postRequest({
        extension: SaleRepository.SalesSyncTrx.sync,
        record: JSON.stringify(data)
      })

      if (!data.syncTRX && !data.syncRET && !data.syncPOS) {
        stackError({
          message: _labels.errorMessage
        })
        
        return
      }

      if (res.recordId) {
        stack({
          Component: ThreadProgress,
          props: {
            recordId: res.recordId
          },
          width: 500,
          height: 450,
          closable: false,
          title: platformLabels.Progress
        })
      }
    }
  })

  const actions = [
    {
      key: 'Rebuild',
      condition: true,
      onClick: () => formik.handleSubmit(),
      disabled: false
    }
  ]

  return (
    <FormShell
      resourceId={ResourceIds.SyncSalesTrx}
      actions={actions}
      isSaved={false}
      isInfo={false}
      isSavedClear={false}
      isCleared={false}
      form={formik}
      maxAccess={maxAccess}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomDatePicker
                name='startDate'
                label={_labels.startDate}
                onChange={formik.setFieldValue}
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('startDate', null)}
                value={formik.values?.startDate}
                error={formik.errors?.startDate && Boolean(formik.errors?.startDate)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='endDate'
                label={_labels.endDate}
                onChange={formik.setFieldValue}
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('endDate', null)}
                value={formik.values?.endDate}
                error={formik.errors?.endDate && Boolean(formik.errors?.endDate)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomCheckBox
                name='syncTRX'
                value={formik.values?.syncTRX}
                onChange={event => formik.setFieldValue('syncTRX', event.target.checked)}
                label={_labels.syncTRX}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomCheckBox
                name='syncRET'
                value={formik.values?.syncRET}
                onChange={event => formik.setFieldValue('syncRET', event.target.checked)}
                label={_labels.syncRET}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomCheckBox
                name='syncPOS'
                value={formik.values?.syncPOS}
                onChange={event => formik.setFieldValue('syncPOS', event.target.checked)}
                label={_labels.syncPOS}
                maxAccess={maxAccess}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
