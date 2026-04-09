import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import CustomCheckBox from '@argus/shared-ui/src/components/Inputs/CustomCheckBox'
import CustomTextArea from '@argus/shared-ui/src/components/Inputs/CustomTextArea'
import { EmployeeRepository } from '@argus/repositories/src/repositories/EmployeeRepository'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import { calculateFixed } from '@argus/shared-utils/src/utils/Payroll'
import Form from '@argus/shared-ui/src/components/Shared/Form'
import { TimeAttendanceRepository } from '@argus/repositories/src/repositories/TimeAttendanceRepository'
import { PayrollRepository } from '@argus/repositories/src/repositories/PayrollRepository'

export default function EntitlementForm({
  labels,
  maxAccess,
  seqNumbers,
  salaryInfo,
  fixedAmount,
  refetchSalaryTab,
  window
}) {
  const { platformLabels } = useContext(ControlContext)
  const { getRequest, postRequest } = useContext(RequestsContext)
  const salaryId = salaryInfo?.header.recordId

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
      edCalcType: null,
      dayTypeId: null,
      isFormula: false,
      formulaId: null
    },
    validationSchema: yup.object({
      edId: yup
        .number()
        .nullable()
        .test(function (value) {
          const { isFormula } = this.parent
          return isFormula ? true : !!value
        }),
      fixedAmount: yup
        .number()
        .min(0)
        .nullable()
        .test(function (value) {
          const { isPct, isFormula } = this.parent
          return isFormula || isPct ? true : value !== null && value !== undefined
        }),
      edCalcType: yup
        .number()
        .nullable()
        .test(function (value) {
          const { isFormula } = this.parent
          return isFormula ? true : !!value
        }),
      dayTypeId: yup
        .number()
        .nullable()
        .test(function (value) {
          const { edCalcType, isFormula } = this.parent
          return isFormula || edCalcType != 2 ? true : !!value
        }),
      pct: yup
        .number()
        .min(0)
        .max(100)
        .nullable()
        .test(function (value) {
          const { isPct, isFormula } = this.parent
          return isFormula || !isPct ? true : value !== null && value !== undefined
        }),
      formulaId: yup
        .number()
        .nullable()
        .test(function (value) {
          const { isFormula } = this.parent
          return isFormula ? !!value : true
        }),
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
      toast.success(obj.salaryId ? platformLabels.Edited : platformLabels.Added)
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
          fixedAmount: parseFloat(fixedAmount || 0).toFixed(2) || parseFloat(res?.record?.fixedAmount || 0).toFixed(2),
          isPct: res?.record?.pct > 0
        })
      }
    })()
  }, [])

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={EmployeeRepository.EmployeeDeduction.qry}
              name='edId'
              label={labels.entitlement}
              valueField='recordId'
              displayField='name'
              values={formik.values}
              filter={item => item.type == 1}
              onChange={(_, newValue) => formik.setFieldValue('edId', newValue?.recordId || null)}
              required
              maxAccess={maxAccess}
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
              name='isTaxable'
              value={formik.values?.isTaxable}
              onChange={event => formik.setFieldValue('isTaxable', event.target.checked)}
              label={labels.isTaxable}
              maxAccess={maxAccess}
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
              name='isFormula'
              value={formik.values?.isFormula}
              onChange={e => formik.setFieldValue('isFormula', e.target.checked)}
              label={labels.isFormula}
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={PayrollRepository.Formula.qry}
              name='formulaId'
              label={labels.formula}
              displayField='name'
              valueField='recordId'
              values={formik.values}
              readOnly={!formik.values?.isFormula}
              required={formik.values?.isFormula}
              onChange={(_, newValue) => formik.setFieldValue('formulaId', newValue?.recordId || null)}
              maxAccess={maxAccess}
              error={formik.touched.formulaId && Boolean(formik.errors.formulaId)}
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
              readOnly={formik.values?.isFormula}
              label={labels.isPct}
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomNumberField
              name='pct'
              label={labels.pct}
              value={formik.values.pct}
              readOnly={!formik.values.isPct || formik.values?.isFormula}
              required={formik.values.isPct}
              allowNegative={false} 
              onBlur={e => {
                let pctValue = Number(e.target.value)
                const amount = calculateFixed(pctValue, 1, salaryInfo.header.basicAmount, salaryInfo.header.eAmount)
                formik.setFieldValue('fixedAmount', parseFloat(amount || 0).toFixed(2))
                formik.setFieldValue('pct', pctValue)
              }}
              maxAccess={maxAccess}
              onClear={() => formik.setFieldValue('pct', 0)}
              error={formik.touched.pct && Boolean(formik.errors.pct)}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomNumberField
              name='fixedAmount'
              label={labels.amount}
              value={formik.values.fixedAmount}
              onBlur={e => formik.setFieldValue('fixedAmount', parseFloat(e?.target?.value || 0).toFixed(2))}
              required={!formik.values?.isFormula}
              allowNegative={false}
              maxAccess={maxAccess}
              readOnly={formik.values.isPct || formik.values?.isFormula}
              onClear={() => formik.setFieldValue('fixedAmount', null)}
              error={formik.touched.fixedAmount && Boolean(formik.errors.fixedAmount)}
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
              required={!formik.values?.isFormula}
              readOnly={formik.values?.isFormula}
              onChange={(_, newValue) => {
                formik.setFieldValue('dayTypeId', null)
                formik.setFieldValue('edCalcType', newValue?.key || null)
              }}
              error={formik.touched.edCalcType && Boolean(formik.errors.edCalcType)}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={TimeAttendanceRepository.DayTypes.qry}
              name='dayTypeId'
              label={labels.dayType}
              valueField='recordId'
              displayField='name'
              values={formik.values}
              maxAccess={maxAccess}
              readOnly={formik.values?.edCalcType != 2 || formik.values?.isFormula}
              required={formik.values?.edCalcType == 2}
              onChange={(_, newValue) => formik.setFieldValue('dayTypeId', newValue?.recordId || null)}
              error={formik.touched.dayTypeId && Boolean(formik.errors.dayTypeId)}
            />
          </Grid>
        </Grid>
      </VertLayout>
    </Form>
  )
}
