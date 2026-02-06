import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { LoanManagementRepository } from '@argus/repositories/src/repositories/LoanManagementRepository'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { EmployeeRepository } from '@argus/repositories/src/repositories/EmployeeRepository'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'

export default function LmObaForm({ labels, maxAccess, obj }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: LoanManagementRepository.OpeningBalances.page
  })

  const { formik } = useForm({
    initialValues: {
      fiscalYear: null,
      employeeId: null,
      lsId: null,
      days: null
    },
    maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      fiscalYear: yup.number().required(),
      employeeId: yup.number().required(),
      lsId: yup.number().required(),
      days: yup.number().required().min(0).max(999)
    }),
    onSubmit: async obj => {
      await postRequest({
        extension: LoanManagementRepository.OpeningBalances.set,
        record: JSON.stringify(obj)
      })

      toast.success(obj.recordId ? platformLabels.Edited : platformLabels.Added)
      if (!obj.recordId) {
        formik.setFieldValue('recordId', String(obj.employeeId * 100) + String(obj.fiscalYear * 10) + String(obj.lsId))
      }
      invalidate()
    }
  })
  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (obj?.employeeId && obj?.fiscalYear && obj?.lsId) {
        const { record } = await getRequest({
          extension: LoanManagementRepository.OpeningBalances.get,
          parameters: `_employeeId=${obj.employeeId}&_fiscalYear=${obj.fiscalYear}&_lsId=${obj.lsId}`
        })

        formik.setValues({
          ...record,
          recordId: String(record.employeeId * 100) + String(record.fiscalYear * 10) + String(record.lsId)
        })
      }
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.LMOpeningBalances} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.FiscalYears.qry}
                name='fiscalYear'
                label={labels.fiscalYear}
                values={formik.values}
                valueField='fiscalYear'
                displayField='fiscalYear'
                readOnly={editMode}
                required
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('fiscalYear', newValue?.fiscalYear || null)
                }}
                error={formik.touched.fiscalYear && Boolean(formik.errors.fiscalYear)}
              />
            </Grid>

            <Grid item xs={12}>
              <ResourceLookup
                endpointId={EmployeeRepository.Employee.snapshot}
                parameters={{ _branchId: 0 }}
                valueField='reference'
                displayField='fullName'
                name='employeeId'
                readOnly={editMode}
                label={labels.employee}
                form={formik}
                required
                displayFieldWidth={2}
                valueShow='employeeRef'
                secondValueShow='employeeName'
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('employeeName', newValue.fullName || '')
                  formik.setFieldValue('employeeRef', newValue?.reference || '')
                  formik.setFieldValue('employeeId', newValue?.recordId || null)
                }}
                errorCheck='employeeId'
              />
            </Grid>

            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={LoanManagementRepository.LeaveScheduleFilters.qry}
                name='lsId'
                label={labels.leaveSchedule}
                values={formik.values}
                valueField='recordId'
                displayField={['reference', 'name']}
                readOnly={editMode}
                required
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('lsId', newValue?.recordId || null)
                }}
                error={formik.touched.lsId && Boolean(formik.errors.lsId)}
              />
            </Grid>

            <Grid item xs={12}>
              <CustomNumberField
                name='days'
                label={labels.days}
                value={formik.values.days}
                onChange={formik.handleChange}
                required
                maxLength={5}
                allowNegative={false}
                maxAccess={maxAccess}
                error={formik.touched.days && Boolean(formik.errors.days)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
