import { Grid } from '@mui/material'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import toast from 'react-hot-toast'
import { useContext, useEffect } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import * as yup from 'yup'
import { formatDateFromApi, formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import CustomTextArea from '@argus/shared-ui/src/components/Inputs/CustomTextArea'
import { EmployeeRepository } from '@argus/repositories/src/repositories/EmployeeRepository'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import FormShell from '../FormShell'

const BackgroundCheckForm = ({ recordId, employeeId, labels, maxAccess, window, isActive }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  
  const invalidate = useInvalidate({
    endpointId: EmployeeRepository.EmployeeBackgroundCheck.qry
  })

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      recordId,
      employeeId,
      ctId: null,
      date: null,
      expiryDate: null,
      remarks: ''
    },
    validationSchema: yup.object({
      ctId: yup.number().required(),
      date: yup.date().required(),
      expiryDate: yup.date().required()
    }),
    onSubmit: async values => { 
     await postRequest({
        extension: EmployeeRepository.EmployeeBackgroundCheck.set,
        record: JSON.stringify({...values,
           expiryDate: formatDateToApi(values?.expiryDate),
           date: values?.date ? formatDateToApi(values.date) : null })
      })

      toast.success(values.recordId ? platformLabels.Edited : platformLabels.Added)
      window.close()
      invalidate()
    }
  })

  const editMode = !!formik.values.recordId

  const getData = async recordId => {
    const res = await getRequest({
      extension: EmployeeRepository.EmployeeBackgroundCheck.get,
      parameters: `_recordId=${recordId}`
    })

    formik.setValues({
      ...res.record,
      expiryDate: formatDateFromApi(res.record?.expiryDate),
      date: res.record?.date ? formatDateFromApi(res.record.date) : null
    })
  }

  const actions = [
    {
      key: 'Attachment',
      condition: true,
      onClick: 'onClickAttachment',
      disabled: !editMode || !isActive
    }
  ]

  useEffect(() => {
    if (recordId) getData(recordId)
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.BackgroundCheck}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      actions={actions}
      isInfo={false}
      isCleared={false}
      disabledSubmit={!isActive}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={EmployeeRepository.CheckType.qry}
                name='ctId'
                label={labels.checkType}
                valueField='recordId'
                displayField='name'
                required
                values={formik?.values}
                onChange={async (_, newValue) => formik.setFieldValue('ctId', newValue?.recordId || null)}
                error={formik.touched.ctId && Boolean(formik.errors.ctId)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='date'
                label={labels.issueDate}
                value={formik.values.date}
                onChange={formik.setFieldValue}
                maxAccess={maxAccess}
                required
                max={formik.values.expiryDate}
                readOnly={!isActive}
                onClear={() => formik.setFieldValue('date', null)}
                error={formik.touched.date && Boolean(formik.errors.date)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='expiryDate'
                label={labels.expiryDate}
                value={formik.values.expiryDate}
                onChange={formik.setFieldValue}
                maxAccess={maxAccess}
                readOnly={!isActive}
                required
                min={formik.values.date}
                onClear={() => formik.setFieldValue('expiryDate', null)}
                error={formik.touched.expiryDate && Boolean(formik.errors.expiryDate)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextArea
                name='remarks'
                label={labels.remarks}
                value={formik?.values?.remarks}
                maxLength='255'
                readOnly={!isActive}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('remarks', '')}
                error={formik.touched.remarks && Boolean(formik.errors.remarks)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default BackgroundCheckForm