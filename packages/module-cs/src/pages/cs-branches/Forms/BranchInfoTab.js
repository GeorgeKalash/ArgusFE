import { Grid } from '@mui/material'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import * as yup from 'yup'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { useContext, useEffect } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { companyStructureRepository } from '@argus/repositories/src/repositories/companyStructureRepository'
import { TimeAttendanceRepository } from '@argus/repositories/src/repositories/TimeAttendanceRepository'
import { EmployeeRepository } from '@argus/repositories/src/repositories/EmployeeRepository'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import toast from 'react-hot-toast'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import CustomCheckBox from '@argus/shared-ui/src/components/Inputs/CustomCheckBox'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'

const BranchInfoTab = ({ labels, maxAccess, store, setStore }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { recordId } = store

  const invalidate = useInvalidate({
    endpointId: companyStructureRepository.Branches.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: recordId || null,
      branchRef: '',
      name: '',
      scId: null,
      scName: '',
      caId: null,
      caName: '',
      isInactive: false,
      supervisorId: null,
      supervisorName: '',
      parentId: null,
      type: null,
      timeZone: 0
    },
    maxAccess,
    validationSchema: yup.object({
      branchRef: yup.string().required(),
      name: yup.string().required()
    }),
    onSubmit: async obj => {
      const res = await postRequest({
        extension: companyStructureRepository.Branches.set,
        record: JSON.stringify({
          ...obj,
          activeStatus: obj.isInactive ? 1 : -1
        })
      })

      if (!obj.recordId) formik.setFieldValue('recordId', res?.recordId)

      setStore(prevStore => ({
        ...prevStore,
        branch: obj,
        recordId: res.recordId
      }))
      toast.success(!obj.recordId ? platformLabels.Added : platformLabels.Edited)
      invalidate()
    }
  })

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: companyStructureRepository.Branches.get,
          parameters: `_recordId=${recordId}`
        })
        formik.setValues(res.record)
        setStore(prevStore => ({
          ...prevStore,
          recordId: res.record.recordId,
          branch: res.record
        }))
      }
    })()
  }, [])

  const editMode = !!recordId 

  return (
    <FormShell
      resourceId={ResourceIds.Branches}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomTextField
                name='branchRef'
                label={labels.reference}
                value={formik.values.branchRef}
                required
                maxLength='10'
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('branchRef', '')}
                error={formik.touched.branchRef && Boolean(formik.errors.branchRef)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='name'
                label={labels.name}
                value={formik.values.name}
                required
                maxLength='30'
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('name', '')}
                error={formik.touched.name && Boolean(formik.errors.name)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={TimeAttendanceRepository.Schedule.qry}
                name='scId'
                label={labels.attendanceSchedule}
                valueField='recordId'
                displayField='name'
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('scId', newValue?.recordId || null)
                  formik.setFieldValue('scName', newValue?.name || '')
                }}
                error={formik.touched.scId && Boolean(formik.errors.scId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={TimeAttendanceRepository.Calendar.qry}
                name='caId'
                label={labels.workingCalendar}
                valueField='recordId'
                displayField='name'
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(_, newValue) => {
                  formik.setFieldValue('caId', newValue?.recordId || null)
                  formik.setFieldValue('caName', newValue?.name || '')
                }}
                error={formik.touched.caId && Boolean(formik.errors.caId)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomCheckBox
                name='isInactive'
                value={formik.values.isInactive}
                onChange={event => formik.setFieldValue('isInactive', event.target.checked)}
                label={labels.isInactive}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={EmployeeRepository.Employee.snapshot}
                parameters={{
                  _startAt: 0,
                  _branchId: 0
                }}
                name='managerId'
                label={labels.manager}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'firstName', value: 'Name' }
                ]}
                valueField='managerRef'
                displayField='name'
                maxAccess={maxAccess}
                readOnly={!editMode}
                displayFieldWidth={2}
                form={formik}
                valueShow='managerRef'
                secondValueShow='managerName'
                onChange={(_, newValue) => {
                  formik.setFieldValue('managerRef', newValue.reference || '')
                  formik.setFieldValue('managerName', newValue.fullName || '')
                  formik.setFieldValue('managerId', newValue.recordId || null)
                }}
                errorCheck={'managerId'}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default BranchInfoTab