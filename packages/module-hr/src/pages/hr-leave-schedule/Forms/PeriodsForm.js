import { Grid, Typography } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { LoanManagementRepository } from '@argus/repositories/src/repositories/LoanManagementRepository'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import Form from '@argus/shared-ui/src/components/Shared/Form'

export default function PeriodsForm({ labels, maxAccess, recordId, seqNo, window }) {
  const { platformLabels } = useContext(ControlContext)

  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: LoanManagementRepository.LeavePeriod.qry
  })

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      recordId,
      lsId: recordId,
      startAt: '',
      period: '',
      amount: null,
      accumulation: '',
      maxAmount: 0,
      carryOver: null,
      carryOverMax: null,
      accrualActivation: null
    },
    validateOnChange: true,
    validationSchema: yup.object({
      startAt: yup.string().required(),
      period: yup.string().required(),
      amount: yup.number().required(),
      accumulation: yup.number().required(),
      carryOver: yup.number().required(),
      accrualActivation: yup.number().required(),
      carryOverMax: yup.number().when('carryOver', {
        is: value => value != 1,
        then: schema => schema.required(),
        otherwise: schema => schema.nullable()
      })
    }),
    onSubmit: async values => {
      let seqNoToUse = values.seqNo

      if (!values.lsId && !values.seqNo) {
        const listRes = await getRequest({
          extension: LoanManagementRepository.LeavePeriod.qry,
          parameters: `_lsId=${recordId}`
        })

        if (listRes.list?.length) {
          const lastSeq = listRes.list[listRes.list.length - 1].seqNo
          seqNoToUse = (lastSeq && lastSeq > 0 ? lastSeq : 0) + 1
        } else {
          seqNoToUse = 1
        }
      } else {
        seqNoToUse = values.seqNo
      }

      postRequest({
        extension: LoanManagementRepository.LeavePeriod.set,
        record: JSON.stringify({
          ...values,
          lsId: recordId,
          seqNo: seqNoToUse
        })
      }).then(res => {
        formik.setFieldValue('recordId', res.recordId)
        formik.setFieldValue('seqNo', seqNoToUse)

        toast.success(!values.recordId ? platformLabels.Added : platformLabels.Edited)

        invalidate()
        window.close()
      })
    }
  })

  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      const listRes = await getRequest({
        extension: LoanManagementRepository.LeavePeriod.qry,
        parameters: `_lsId=${recordId}`
      })

      let newSeqNo = 1
      if (listRes.list?.length) {
        const lastSeq = listRes.list[listRes.list.length - 1].seqNo
        newSeqNo = (lastSeq && lastSeq > 0 ? lastSeq : 0) + 1
      }

      if (recordId && seqNo) {
        const res = await getRequest({
          extension: LoanManagementRepository.LeavePeriod.get,
          parameters: `_lsId=${recordId}&_seqNo=${seqNo}`
        })
        formik.setValues({
          ...res.record,
          lsId: recordId,
          seqNo: res?.record?.seqNo ?? newSeqNo
        })
      } else {
        formik.setFieldValue('seqNo', newSeqNo)
      }
    })()
  }, [recordId])

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess} editMode={editMode}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant='body2'>{labels.start}</Typography>
        </Grid>
        <Grid container spacing={2} alignItems='center'>
          <Grid item xs={3}>
            <CustomNumberField
              name='startAt'
              value={formik.values.startAt}
              required
              maxLength={4}
              decimalScale={0}
              allowNegative={false}
              maxAccess={maxAccess}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('startAt', '')}
              error={formik.touched.startAt && Boolean(formik.errors.startAt)}
            />
          </Grid>
          <Grid item xs={4}>
            <ResourceComboBox
              datasetId={DataSets.ACCRUAL_PERIOD}
              name='period'
              values={formik.values}
              valueField='key'
              displayField='value'
              required
              maxAccess={maxAccess}
              onChange={(event, newValue) => {
                formik.setFieldValue('period', newValue?.key || null)
              }}
              error={formik.touched.period && Boolean(formik.errors.period)}
            />
          </Grid>
          <Typography variant='body2' pl={2}>{labels.afterHireDate}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant='body2'>{labels.AccruedHours}</Typography>
        </Grid>
        <Grid container spacing={2} alignItems='center'>
          <Grid item xs={3}>
            <CustomNumberField
              name='amount'
              value={formik.values.amount}
              required
              maxLength={10}
              decimalScale={5}
              allowNegative={false}
              maxAccess={maxAccess}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('amount', '')}
              error={formik.touched.amount && Boolean(formik.errors.amount)}
            />
          </Grid>
          <Grid item xs={4}>
            <ResourceComboBox
              datasetId={DataSets.ACCRUAL_ACCUMULATION}
              name='accumulation'
              values={formik.values}
              valueField='key'
              displayField='value'
              required
              maxAccess={maxAccess}
              onChange={(event, newValue) => {
                formik.setFieldValue('accumulation', newValue?.key || null)
              }}
              error={formik.touched.accumulation && Boolean(formik.errors.accumulation)}
            />
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Typography variant='body2'>{labels.MaxAccrualHours}</Typography>
        </Grid>
        <Grid container spacing={2} alignItems='center'>
          <Grid item xs={3}>
            <CustomNumberField
              name='maxAmount'
              value={formik.values.maxAmount}
              required
              maxLength={4}
              decimalScale={0}
              allowNegative={false}
              maxAccess={maxAccess}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('maxAmount', '')}
              error={formik.touched.maxAmount && Boolean(formik.errors.maxAmount)}
            />
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Typography variant='body2'>{labels.CarryOver}</Typography>
        </Grid>
        <Grid container spacing={2} alignItems='center'>
          <Grid item xs={4}>
            <ResourceComboBox
              datasetId={DataSets.ACCRUAL_CARRY_OVER}
              name='carryOver'
              values={formik.values}
              valueField='key'
              displayField='value'
              required
              maxAccess={maxAccess}
              onChange={(event, newValue) => {
                formik.setFieldValue('carryOverMax', null)
                formik.setFieldValue('carryOver', newValue?.key || null)
              }}
              error={formik.touched.carryOver && Boolean(formik.errors.carryOver)}
            />
          </Grid>
          <Grid item xs={2}></Grid>
          <Grid item xs={3}>
            <CustomNumberField
              name='carryOverMax'
              value={formik.values.carryOverMax}
              maxAccess={maxAccess}
              maxLength={4}
              allowNegative={false}
              decimalScale={0}
              readOnly={formik.values.carryOver == 1}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('carryOverMax', '')}
              error={formik.touched.carryOverMax && Boolean(formik.errors.carryOverMax)}
            />
          </Grid>
          <Grid item xs={3}>
            <Typography variant='body2'>{labels.hoursPerYear}</Typography>
          </Grid>
        </Grid>
        <Grid container spacing={2} alignItems='center' paddingTop={2}>
          <Grid item xs={3}>
            <Typography variant='body2'>{labels.accrualActivation}</Typography>
          </Grid>
          <Grid item xs={6}>
            <ResourceComboBox
              datasetId={DataSets.ACCRUAL_ACTIVATION}
              name='accrualActivation'
              values={formik.values}
              valueField='key'
              displayField='value'
              required
              maxAccess={maxAccess}
              onChange={(event, newValue) => {
                formik.setFieldValue('accrualActivation', newValue?.key || null)
              }}
              error={formik.touched.accrualActivation && Boolean(formik.errors.accrualActivation)}
            />
          </Grid>
        </Grid>
      </Grid>
    </Form>
  )
}
