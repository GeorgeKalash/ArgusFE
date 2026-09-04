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
import CustomTextField from '../../Inputs/CustomTextField'
import FormShell from '../FormShell'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'

const RightToWorkForm = ({ recordId, employeeId, labels, maxAccess, window, isActive }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: EmployeeRepository.EmployeeRightToWork.qry
  })

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      recordId,
      employeeId,
      dtId: null,
      documentRef: '',
      issueDate: null,
      expiryDate: null,
      remarks: '',
      hijriCal: false
    },
    validationSchema: yup.object({
      dtId: yup.number().required(),
      documentRef: yup.string().required(),
      expiryDate: yup.date().required()
    }),
    onSubmit: async values => {
      await postRequest({
        extension: EmployeeRepository.EmployeeRightToWork.set,
        record: JSON.stringify({...values,
           expiryDate: formatDateToApi(values?.expiryDate),
           issueDate: values?.issueDate ? formatDateToApi(values.issueDate) : null })
      })

      toast.success(values.recordId ? platformLabels.Edited : platformLabels.Added)
      window.close()
      invalidate()
    }
  })

  const editMode = !!formik.values.recordId

  const getData = async recordId => {
    const res = await getRequest({
      extension: EmployeeRepository.EmployeeRightToWork.get,
      parameters: `_recordId=${recordId}`
    })

    formik.setValues({
      ...res.record,
      expiryDate: formatDateFromApi(res.record?.expiryDate),
      issueDate: res.record?.issueDate ? formatDateFromApi(res.record.issueDate) : null,
      isInActive: !isActive
    })
  }

  const actions = [
    {
      key: 'Attachment',
      condition: true,
      onClick: 'onClickAttachment',
      disabled: !editMode
    }
  ]

  useEffect(() => {
    if (recordId) getData(recordId)
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.RightToWork}
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
                endpointId={EmployeeRepository.HRDocTypeFilters.qry}
                name='dtId'
                label={labels.dtName}
                valueField='recordId'
                displayField='name'
                required
                readOnly={!isActive}
                values={formik?.values}
                onChange={async (_, newValue) => formik.setFieldValue('dtId', newValue?.recordId || null)}
                error={formik.touched.dtId && Boolean(formik.errors.dtId)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='documentRef'
                label={labels.dtRef}
                value={formik.values.documentRef}
                required
                maxLength='20'
                readOnly={!isActive}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('documentRef', '')}
                error={formik.touched.documentRef && Boolean(formik.errors.documentRef)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='issueDate'
                label={labels.issueDate}
                value={formik.values.issueDate}
                onChange={formik.setFieldValue}
                maxAccess={maxAccess}
                readOnly={!isActive}
                max={formik.values.expiryDate}
                onClear={() => formik.setFieldValue('issueDate', null)}
                error={formik.touched.issueDate && Boolean(formik.errors.issueDate)}
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
                min={formik.values.issueDate}
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

export default RightToWorkForm