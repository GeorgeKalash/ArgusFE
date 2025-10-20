import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import CustomCheckBox from 'src/components/Inputs/CustomCheckBox'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import { EmployeeRepository } from 'src/repositories/EmployeeRepository'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { DataSets } from 'src/resources/DataSets'
import { calculateFixed } from 'src/utils/Payroll'

export default function EntitlementForm({
  labels,
  maxAccess,
  salaryId,
  seqNumbers,
  salaryInfo,
  refetchSalaryTab,
  fixedAmount,
  window
}) {
  const { platformLabels } = useContext(ControlContext)
  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: EmployeeRepository.SalaryDetails.qry
  })

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      salaryId,
      seqNo: seqNumbers?.current,
      includeInTotal: false,
      edId: null,
      isPct: false,
      fixedAmount: null,
      pct: 0,
      comments: '',
      isTaxable: false,
      edCalcType: null
    },
    validationSchema: yup.object({
      edId: yup.number().required(),
      fixedAmount: yup.number().min(0).required(),
      edCalcType: yup.number().required(),
      pct: yup
        .number()
        .min(0)
        .max(100)
        .test('pct-required', 'Percentage is required', function (value) {
          const { isPct } = this.parent

          return isPct ? !!value : true
        })
    }),
    onSubmit: async obj => {
      const newObj = {
        ...obj,
        seqNo: seqNumbers?.current || (seqNumbers?.maxSeqNo || 0) + 1
      }
      const updatedDetails = [...(salaryInfo?.details || []).filter(d => d.seqNo !== newObj.seqNo), newObj]

      await postRequest({
        extension: EmployeeRepository.SalaryDetails.set2,
        record: JSON.stringify({
          salary: salaryInfo?.header,
          salaryDetails: updatedDetails
        })
      })
      refetchSalaryTab.current = true
      const actionMessage = obj.salaryId ? platformLabels.Edited : platformLabels.Added
      toast.success(actionMessage)
      window.close()
      invalidate()
    }
  })

  const editMode = !!formik.values.salaryId

  useEffect(() => {
    ;(async function () {
      if (salaryId && seqNumbers?.current) {
        const res = await getRequest({
          extension: EmployeeRepository.SalaryDetails.get,
          parameters: `_salaryId=${salaryId}&_seqNo=${seqNumbers?.current}`
        })
        formik.setValues({
          ...res?.record,
          fixedAmount: fixedAmount || res?.record?.fixedAmount,
          isPct: res?.record?.pct > 0
        })
      }
    })()
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.Salaries}
      form={formik}
      maxAccess={maxAccess}
      isCleared={false}
      isInfo={false}
      editMode={editMode}
    >
      <VertLayout>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={EmployeeRepository.EmployeeDeduction.qry}
              name='edId'
              label={labels.entitlement}
              valueField='recordId'
              displayField='name'
              values={formik.values}
              filter={item => item.type == 1}
              onChange={(event, newValue) => {
                formik.setFieldValue('edId', newValue?.recordId || null)
              }}
              required
              error={formik.touched.edId && Boolean(formik.errors.edId)}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomCheckBox
              name='includeInTotal'
              value={formik.values?.includeInTotal}
              onChange={event => formik.setFieldValue('includeInTotal', event.target.checked)}
              label={labels.includeInTotal}
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomCheckBox
              name='isPct'
              value={formik.values?.isPct}
              onChange={event => {
                if (event.target.checked) formik.setFieldValue('fixedAmount', 0)
                else formik.setFieldValue('pct', 0)
                formik.setFieldValue('isPct', event.target.checked)
              }}
              label={labels.isPct}
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomNumberField
              name='pct'
              label={labels.pct}
              value={formik.values.pct}
              readOnly={!formik.values.isPct}
              required={formik.values.isPct}
              onBlur={e => {
                let pctValue = Number(e.target.value)
                const amount = calculateFixed(pctValue, 1, salaryInfo.header.basicAmount, salaryInfo.header.eAmount)
                formik.setFieldValue('fixedAmount', amount)
                formik.setFieldValue('pct', pctValue)
              }}
              onClear={() => formik.setFieldValue('pct', 0)}
              error={formik.touched.pct && Boolean(formik.errors.pct)}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomNumberField
              name='fixedAmount'
              label={labels.amount}
              value={formik.values.fixedAmount}
              onChange={formik.handleChange}
              required
              readOnly={formik.values.isPct}
              onClear={() => formik.setFieldValue('fixedAmount', null)}
              error={formik.touched.fixedAmount && Boolean(formik.errors.fixedAmount)}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextArea
              name='comments'
              label={labels.comments}
              value={formik.values.comments}
              maxLength='100'
              rows={2}
              maxAccess={maxAccess}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('comments', '')}
              error={formik.touched.comments && Boolean(formik.errors.comments)}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomCheckBox
              name='isTaxable'
              value={formik.values?.isTaxable}
              onChange={event => formik.setFieldValue('isTaxable', event.target.checked)}
              label={labels.isTaxable}
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              datasetId={DataSets.ED_CALC_TYPE}
              name='edCalcType'
              label={labels.calculationType}
              valueField='key'
              displayField='value'
              values={formik.values}
              maxAccess={maxAccess}
              required
              onChange={(event, newValue) => {
                formik.setFieldValue('edCalcType', newValue?.key || null)
              }}
              error={formik.touched.edCalcType && Boolean(formik.errors.edCalcType)}
            />
          </Grid>
        </Grid>
      </VertLayout>
    </FormShell>
  )
}
