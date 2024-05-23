import { Grid, FormControlLabel, Checkbox } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { ResourceLookup } from 'src/components/Shared//ResourceLookup'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { EmployeeRepository } from 'src/repositories/EmployeeRepository'
import { useForm } from 'src/hooks/form'

export default function LaborsForm({ labels, maxAccess, recordId }) {
  const [editMode, setEditMode] = useState(!!recordId)

  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: ManufacturingRepository.Labor.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      reference: '',
      name: '',
      workCenterId: '',
      operationId: '',
      hourRateCurrencyId: '',
      canSignIn: false,
      userId: '',
      hourRate: '',
      groupId: '',
      employeeName: '',
      employeeRef: '',
      employeeId: null
    },
    maxAccess,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      reference: yup.string().required(' '),
      name: yup.string().required(' '),

      hourRateCurrencyId: yup.string().test({
        test: function (value) {
          const hourRate = this.parent.hourRate

          return hourRate != null && hourRate !== '' && hourRate !== undefined
            ? value !== undefined && value !== null && value !== ''
            : true
        }
      })
    }),
    onSubmit: async obj => {
      const recordId = obj.recordId

      const response = await postRequest({
        extension: ManufacturingRepository.Labor.set,
        record: JSON.stringify(obj)
      })

      if (!recordId) {
        toast.success('Record Added Successfully')
        formik.setValues({
          ...obj,
          recordId: response.recordId
        })
      } else toast.success('Record Edited Successfully')

      setEditMode(true)
      invalidate()
    }
  })

  useEffect(() => {
    ;(async function () {
      try {
        if (recordId) {
          const res = await getRequest({
            extension: ManufacturingRepository.Labor.get,
            parameters: `_recordId=${recordId}`
          })

          formik.setValues(res.record)
        }
      } catch (exception) {}
    })()
  }, [])

  useEffect(() => {
    const { canSignIn } = formik.values
    if (canSignIn == false) {
      formik.setValues({ ...formik.values, userId: '' })
    }
  }, [formik.values.canSignIn])

  return (
    <FormShell resourceId={ResourceIds.Labor} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <Grid container spacing={4}>
        <Grid item rowSpacing={4} xs={6}>
          <Grid item sx={{ pb: '10px' }} xs={12}>
            <CustomTextField
              name='reference'
              label={labels.reference}
              value={formik.values.reference}
              required
              maxAccess={maxAccess}
              maxLength='6'
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('reference', '')}
              error={formik.touched.reference && Boolean(formik.errors.reference)}
            />
          </Grid>
          <Grid item sx={{ pb: '10px' }} xs={12}>
            <CustomTextField
              name='name'
              label={labels.name}
              value={formik.values.name}
              maxLength='40'
              required
              maxAccess={maxAccess}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('name', '')}
              error={formik.touched.name && Boolean(formik.errors.name)}
            />
          </Grid>
          <Grid item sx={{ pb: '10px' }} xs={12}>
            <ResourceComboBox
              endpointId={ManufacturingRepository.WorkCenter.qry}
              parameters={`_startAt=0&_pageSize=100`}
              name='workCenterId'
              label={labels.workCenter}
              columnsInDropDown={[
                { key: 'reference', value: 'Reference' },
                { key: 'name', value: 'Name' }
              ]}
              valueField='recordId'
              displayField={['reference', 'name']}
              values={formik.values}
              maxAccess={maxAccess}
              onChange={(event, newValue) => {
                formik && formik.setFieldValue('workCenterId', newValue?.recordId)
              }}
              error={formik.touched.workCenterId && Boolean(formik.errors.workCenterId)}
            />
          </Grid>
          <Grid item sx={{ pb: '10px' }} xs={12}>
            <ResourceComboBox
              endpointId={ManufacturingRepository.Operation.qry}
              parameters={`_workCenterId=0&_startAt=0&_pageSize=100&`}
              name='operationId'
              label={labels.operation}
              columnsInDropDown={[
                { key: 'reference', value: 'Reference' },
                { key: 'name', value: 'Name' }
              ]}
              valueField='recordId'
              displayField={['reference', 'name']}
              values={formik.values}
              maxAccess={maxAccess}
              onChange={(event, newValue) => {
                formik && formik.setFieldValue('operationId', newValue?.recordId)
              }}
              error={formik.touched.operationId && Boolean(formik.errors.operationId)}
            />
          </Grid>
          <Grid item sx={{ pb: '10px' }} xs={12}>
            <CustomTextField
              name='hourRate'
              label={labels.hourRate}
              value={formik.values.hourRate}
              type='number'
              numberField={true}
              onChange={formik.handleChange}
              onClear={() => {
                formik.setFieldValue('hourRate', '')
                formik.setFieldValue('hourRateCurrencyId', '')
              }}
              error={formik.touched.hourRate && Boolean(formik.errors.hourRate)}
            />
          </Grid>
          <Grid item sx={{ pb: '10px' }} xs={12}>
            <ResourceComboBox
              endpointId={SystemRepository.Currency.qry}
              parameters={`_startAt=0&_pageSize=100&_filter=`}
              name='hourRateCurrencyId'
              label={labels.hourRateCurrency}
              readOnly={!!!formik.values.hourRate}
              columnsInDropDown={[
                { key: 'reference', value: 'Reference' },
                { key: 'name', value: 'Name' }
              ]}
              valueField='recordId'
              displayField={['reference', 'name']}
              values={formik.values}
              maxAccess={maxAccess}
              onChange={(event, newValue) => {
                formik && formik.setFieldValue('hourRateCurrencyId', newValue?.recordId)
              }}
              required={!!formik.values.hourRate}
              error={
                !!formik.values.hourRate &&
                !formik.values.hourRateCurrencyId &&
                Boolean(formik.errors.hourRateCurrencyId)
              }
            />
          </Grid>
        </Grid>
        <Grid item xs={6}>
          <Grid item sx={{ pb: '10px' }} xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  name='canSignIn'
                  maxAccess={maxAccess}
                  checked={formik.values?.canSignIn}
                  onChange={formik.handleChange}
                />
              }
              label={labels.canSignIn}
            />
          </Grid>
          <Grid item sx={{ pb: '10px' }} xs={12}>
            <ResourceComboBox
              endpointId={SystemRepository.Users.qry}
              parameters={`_startAt=0&_pageSize=100&_size=50&_sortBy=fullName&_filter=`}
              name='userId'
              label={labels.user}
              readOnly={!!!formik.values.canSignIn}
              valueField='recordId'
              displayField='fullName'
              values={formik.values}
              maxAccess={maxAccess}
              onChange={(event, newValue) => {
                formik && formik.setFieldValue('userId', newValue?.recordId)
              }}
              error={formik.touched.userId && Boolean(formik.errors.userId)}
            />
          </Grid>
          <Grid item sx={{ pb: '10px' }} xs={12}>
            <ResourceComboBox
              endpointId={ManufacturingRepository.LaborGroup.qry}
              parameters={`_startAt=0&_pageSize=100&_filter=`}
              name='groupId'
              label={labels.laborGroup}
              columnsInDropDown={[
                { key: 'reference', value: 'Reference' },
                { key: 'name', value: 'Name' }
              ]}
              valueField='recordId'
              displayField={['reference', 'name']}
              values={formik.values}
              maxAccess={maxAccess}
              onChange={(event, newValue) => {
                formik && formik.setFieldValue('groupId', newValue?.recordId)
              }}
              error={formik.touched.groupId && Boolean(formik.errors.groupId)}
            />
          </Grid>
          <Grid item sx={{ pb: '10px' }} xs={12}>
            <ResourceLookup
              endpointId={EmployeeRepository.Employee.snapshot}
              parameters={{
                _branchId: 0
              }}
              form={formik}
              valueField='reference'
              displayField='fullName'
              name='employeeRef'
              label={labels.employee}
              secondDisplayField={true}
              secondValue={formik.values.employeeName}
              onChange={(event, newValue) => {
                if (newValue) {
                  formik.setFieldValue('employeeId', newValue?.recordId)
                  formik.setFieldValue('employeeRef', newValue?.reference)
                  formik.setFieldValue('employeeName', newValue?.fullName)
                } else {
                  formik.setFieldValue('employeeId', null)
                  formik.setFieldValue('employeeRef', '')
                  formik.setFieldValue('employeeName', '')
                }
              }}
              error={formik.touched.employeeId && Boolean(formik.errors.employeeId)}
            />
          </Grid>
        </Grid>
      </Grid>
    </FormShell>
  )
}
