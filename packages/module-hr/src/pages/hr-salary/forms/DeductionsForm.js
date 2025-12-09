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
import { EmployeeRepository } from '@argus/repositories/src/repositories/EmployeeRepository'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import { calculateFixed } from '@argus/shared-utils/src/utils/Payroll'
import Form from '@argus/shared-ui/src/components/Shared/Form'

export default function DeductionsForm({
  labels,
  maxAccess,
  seqNumbers,
  salaryInfo,
  refetchSalaryTab,
  fixedAmount,
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
        .test(function (value) {
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
              label={labels.deduction}
              valueField='recordId'
              displayField='name'
              values={formik.values}
              filter={item => item.type == 2}
              onChange={(event, newValue) => formik.setFieldValue('edId', newValue?.recordId || null)}
              maxAccess={maxAccess}
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
                formik.setFieldValue('pctOf', 1)
                if (event.target.checked) formik.setFieldValue('fixedAmount', 0)
                else formik.setFieldValue('pct', 0)
                formik.setFieldValue('isPct', event.target.checked)
              }}
              label={labels.isPct}
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              datasetId={DataSets.APPLY_TO_SALARY}
              name='pctOf'
              label={labels.pctOf}
              valueField='key'
              displayField='value'
              values={formik.values}
              maxAccess={maxAccess}
              readOnly={!formik.values.isPct}
              onChange={(_, newValue) => formik.setFieldValue('pctOf', newValue?.key || null)}
              error={formik.touched.pctOf && Boolean(formik.errors.pctOf)}
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
                formik.setFieldValue('fixedAmount', parseFloat(amount || 0).toFixed(2))
                formik.setFieldValue('pct', pctValue)
              }}
              allowNegative={false}
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
              required
              allowNegative={false}
              maxAccess={maxAccess}
              readOnly={formik.values.isPct}
              onClear={() => formik.setFieldValue('fixedAmount', null)}
              error={formik.touched.fixedAmount && Boolean(formik.errors.fixedAmount)}
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
              onChange={(_, newValue) => formik.setFieldValue('edCalcType', newValue?.key || null)}
              error={formik.touched.edCalcType && Boolean(formik.errors.edCalcType)}
            />
          </Grid>
        </Grid>
      </VertLayout>
    </Form>
  )
}
