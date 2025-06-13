import { Grid } from '@mui/material'
import * as yup from 'yup'
import { useContext } from 'react'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { ControlContext } from 'src/providers/ControlContext'
import { useWindow } from 'src/windows'
import { ThreadProgress } from 'src/components/Shared/ThreadProgress'
import { formatDateToISO } from 'src/lib/date-helper'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { SystemFunction } from 'src/resources/SystemFunction'

export default function SyncPurchaseTrx({ _labels, access }) {
  const { postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  const { formik } = useForm({
    initialValues: {
      startDate: null,
      endDate: null,
      batchId: 0,
      batchRef: '',
      batchName: ''
    },
    maxAccess: access,
    validateOnChange: true,
    validationSchema: yup.object({
      startDate: yup
        .date()
        .required()
        .test(function (value) {
          const { endDate } = this.parent

          return endDate === null ? true : value.getTime() <= endDate?.getTime()
        }),
      endDate: yup
        .date()
        .required()
        .test(function (value) {
          const { startDate } = this.parent

          return startDate === null ? true : value.getTime() >= startDate?.getTime()
        })
    }),
    onSubmit: async obj => {
      const res = await postRequest({
        extension: ManufacturingRepository.MFJobOrder.sync,
        record: JSON.stringify({
          ...obj,
          startDate: formatDateToISO(new Date(obj.startDate)),
          endDate: formatDateToISO(new Date(obj.endDate))
        })
      })

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

      toast.success(platformLabels.Added)
      formik.setValues(obj)

      invalidate()
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
    <FormShell form={formik} actions={actions} isSaved={false} editMode={true} isInfo={false} isCleared={false}>
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <CustomDatePicker
                name='startDate'
                label={_labels.startDate}
                max={formik.values.endDate}
                value={formik.values?.startDate}
                required
                maxAccess={access}
                onChange={formik.setFieldValue}
                onClear={() => formik.setFieldValue('startDate', null)}
                error={formik.touched.startDate && Boolean(formik.errors.startDate)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='endDate'
                label={_labels.endDate}
                value={formik.values?.endDate}
                min={formik.values.startDate}
                required
                onChange={formik.setFieldValue}
                maxAccess={access}
                onClear={() => formik.setFieldValue('endDate', null)}
                error={formik.touched.endDate && Boolean(formik.errors.endDate)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={SystemRepository.Batch.snapshot}
                parameters={{
                  _sortBy: 'recordId desc',
                  _functionId: SystemFunction.PurchaseInvoice
                }}
                name='batchId'
                label={platformLabels.batch}
                valueField='reference'
                displayFieldWidth={2}
                displayField='name'
                valueShow='batchRef'
                secondValueShow='batchName'
                form={formik}
                onChange={(event, newValue) => {
                  formik.setFieldValue('batchRef', newValue?.reference || '')
                  formik.setFieldValue('batchName', newValue?.name || '')
                  formik.setFieldValue('batchId', newValue?.recordId || 0)
                }}
                error={formik.touched.batchId && Boolean(formik.errors.batchId)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
