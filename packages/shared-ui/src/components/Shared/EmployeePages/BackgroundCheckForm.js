import { Grid } from '@mui/material'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import toast from 'react-hot-toast'
import { useContext, useEffect, useRef } from 'react'
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
import Form from '@argus/shared-ui/src/components/Shared/Form'
import CustomTextField from '../../Inputs/CustomTextField'
import CustomButton from '../../Inputs/CustomButton'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useError } from '@argus/shared-providers/src/providers/error'

const BackgroundCheckForm = ({ recordId, employeeId, labels, maxAccess, window, isActive }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const hiddenInputRef = useRef()
  const { stack: stackError } = useError()
  
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
      remarks: '',
      fileUrl: null,
      attachment: '',
      file: null
    },
    validationSchema: yup.object({
      ctId: yup.number().required(),
      date: yup.date().required(),
      expiryDate: yup.date().required()
    }),
    onSubmit: async values => { 
     const response = await postRequest({
        extension: EmployeeRepository.EmployeeBackgroundCheck.set,
        record: JSON.stringify({...values,
           expiryDate: formatDateToApi(values?.expiryDate),
           date: values?.date ? formatDateToApi(values.date) : null }),
           fileUrl: values.attachment
      })

      if(values.attachment)
        await postRequest({
          extension: SystemRepository.Attachment.set,
          record: JSON.stringify({
            classId: ResourceIds.BackgroundCheck,
            resourceId: ResourceIds.BackgroundCheck,
            recordId: response.recordId,
            seqNo: 0,
            fileName: values.attachment,
            date: new Date()
        })
      })

      toast.success(values.recordId ? platformLabels.Edited : platformLabels.Added)

      window.close()
      invalidate()
    }
  })

  const editMode = !!formik.values.recordId

  const getData = async recordId => {
    let attachment = null
    const res = await getRequest({
      extension: EmployeeRepository.EmployeeBackgroundCheck.get,
      parameters: `_recordId=${recordId}`
    })

    if (res.record?.fileUrl){
      const resImage = await getRequest({
        extension: SystemRepository.Attachment.get,
        parameters: `_resourceId=${ResourceIds.EmployeeFilter}&_seqNo=0&_recordId=${recordId}`
      })
      attachment = resImage?.record?.fileName || ''
    }

    formik.setValues({
      ...res.record,
      expiryDate: formatDateFromApi(res.record?.expiryDate),
      date: res.record?.date ? formatDateFromApi(res.record.date) : null,
      attachment
    })
  }

  useEffect(() => {
    if (recordId) getData(recordId)
  }, [])

  const handleBrowseClick = () => {
    hiddenInputRef.current.click()
  }

  const handleFileChange = event => {
    const selectedFile = event?.target?.files?.[0]
    if (!selectedFile) return

    if (selectedFile.size > 800000) {
        stackError({ message: labels.maxFileSize })
        event.target.value = ''
        return
    }

    formik.setFieldValue('file', selectedFile)
    formik.setFieldValue('attachment', selectedFile.name)
    formik.setFieldValue('fileUrl', selectedFile.name)

    event.target.value = ''
  }

  return (
    <Form onSave={formik.handleSubmit} disabledSubmit={!isActive} maxAccess={maxAccess} editMode={editMode}>
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
            <Grid item xs={10}>
              <CustomTextField
                name='attachment'
                label={labels.attachment}
                value={formik.values.attachment}
                maxAccess={maxAccess}
                readOnly
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('attachment', '')}
                error={formik.touched.attachment && Boolean(formik.errors.attachment)}
              />
            </Grid>
            <Grid item xs={2}>
              <input
                hidden
                type='file'
                ref={hiddenInputRef}
                onChange={handleFileChange}
              />
              <CustomButton
                onClick={handleBrowseClick}
                label={platformLabels.Browse}
                color='#050505'
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default BackgroundCheckForm