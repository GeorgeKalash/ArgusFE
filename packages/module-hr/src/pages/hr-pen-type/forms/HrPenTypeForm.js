import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { PayrollRepository } from '@argus/repositories/src/repositories/PayrollRepository'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'

export default function HrPenTypeForm({ labels, maxAccess, setStore, store }) {
  const { recordId } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const editMode = !!recordId

  const invalidate = useInvalidate({
    endpointId: PayrollRepository.PenaltyType.page
  })

  const { formik } = useForm({
    initialValues: { recordId: null, name: '', reason: null, timeBase: null, timeCode: null, from: null, to: null },
    maxAccess,
    validationSchema: yup.object({
      name: yup.string().required(),
      reason: yup.number().required(),
      timeBase: yup.number().required(),
      timeCode: yup.number().when('reason', {
        is: 1,
        then: schema => schema.required(),
        otherwise: schema => schema.notRequired()
      }),
      from: yup
        .number()
        .nullable()
        .max(32767)
        .test(function (value) {
          const { reason, to } = this.parent

          return (reason === 1 && (value != null || to != null) && value <= to) || (value == null && to == null)
        }),
      to: yup
        .number()
        .nullable()
        .max(32767)
        .test(function (value) {
          const { reason, from } = this.parent

          return (reason === 1 && (value != null || from != null) && value >= from) || (value == null && from == null)
        })
    }),
    onSubmit: async obj => {
      const response = await postRequest({
        extension: PayrollRepository.PenaltyType.set,
        record: JSON.stringify(obj)
      })

      if (!recordId) {
        setStore(prevStore => ({
          ...prevStore,
          recordId: response.recordId
        }))
        formik.setFieldValue('recordId', response.recordId)
      }
      toast.success(!obj.recordId ? platformLabels.Added : platformLabels.Edited)
      invalidate()
    }
  })

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: PayrollRepository.PenaltyType.get,
          parameters: `_recordId=${recordId}`
        })

        formik.setValues(res.record)
      }
    })()
  }, [])

  const disabled = formik.values.timeCode == 41 || formik.values.timeCode == 20 || formik.values.timeCode == 21

  return (
    <FormShell resourceId={ResourceIds.PenaltyType} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomTextField
                name='name'
                label={labels.name}
                value={formik.values.name}
                required
                maxAccess={maxAccess}
                maxLength='30'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('name', '')}
                error={formik.touched.name && Boolean(formik.errors.name)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                name='reason'
                label={labels.reason}
                datasetId={DataSets.REASON}
                values={formik.values}
                valueField='key'
                displayField='value'
                maxAccess={maxAccess}
                required
                onChange={(event, newValue) => {
                  formik.setValues({
                    ...formik.values,
                    timeCode: null,
                    from: null,
                    to: null,
                    reason: newValue?.key || null
                  })
                }}
                error={formik.touched.reason && Boolean(formik.errors.reason)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                name='timeBase'
                label={labels.timeBase}
                datasetId={DataSets.TIME_BASE}
                values={formik.values}
                valueField='key'
                displayField='value'
                required
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('timeBase', newValue?.key || null)
                }}
                error={formik.touched.timeBase && Boolean(formik.errors.timeBase)}
              />
            </Grid>

            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={PayrollRepository.TimeCodes.qry}
                name='timeCode'
                label={labels.timeVariationType}
                values={formik.values}
                valueField='timeCode'
                displayField='name'
                required={formik.values.reason == 1}
                readOnly={formik.values.reason != 1}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('timeCode', newValue.timeCode || null)
                }}
                error={formik.touched.timeCode && Boolean(formik.errors.timeCode)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='from'
                label={labels.from}
                value={formik.values.from}
                maxAccess={maxAccess}
                maxLength={7}
                decimalScale={0}
                readOnly={disabled}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('from', null)}
                error={formik.touched.from && Boolean(formik.errors.from)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='to'
                label={labels.to}
                value={formik.values.to}
                maxAccess={maxAccess}
                maxLength={7}
                decimalScale={0}
                readOnly={disabled}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('to', null)}
                error={formik.touched.to && Boolean(formik.errors.to)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
