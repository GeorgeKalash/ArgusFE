import React, { useContext } from 'react'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import CustomTextArea from '../../Inputs/CustomTextArea'
import { Box } from '@mui/material'
import toast from 'react-hot-toast'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { formatDateDefault, formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import CustomButton from '@argus/shared-ui/src/components/Inputs/CustomButton'
import styles from './ResourceRecordRemarks.module.css'

const RecordRemarksForm = ({ seqNo, userId, resourceId, data, maxAccess, masterRef, labels, window }) => {
  const { postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: SystemRepository.RecordRemarks.qry
  })

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      seqNo: data?.seqNo ?? seqNo,
      masterRef: data?.masterRef ?? masterRef,
      notes: data?.notes ?? null,
      resourceId: data?.resourceId ?? resourceId,
      eventDate: data?.eventDate,
      userId: data?.userId ?? userId
    },
    enableReinitialize: true,
    validateOnChange: true,
    onSubmit: async values => {
      const date = new Date()
      values.eventDate = formatDateToApi(date)

      await postRequest({
        extension: SystemRepository.RecordRemarks.set,
        record: JSON.stringify(values)
      })
      if (data) {
        toast.success('Record Edited Successfully')
        window.close()
      } else {
        toast.success('Record Add Successfully')
        formik.setFieldValue('notes', '')
      }
      invalidate()
    }
  })
  const disabled = (data?.userId && data?.userId !== userId) || !formik.values.notes

  return (
    <Box  className={styles.form}>
      {data?.userName && (
        <Box
        className={styles.username}
        >
          <Box fontWeight='bold'>{data.userName}</Box> - <Box>{formatDateDefault(data.eventDate)}</Box>
        </Box>
      )}
      <Box className={styles.textareaContent}>
        <CustomTextArea
          name='notes'
          label={labels.note}
          value={formik.values.notes}
          rows={5}
          maxLength='500'
          paddingRight={formik.values.userId !== userId ? 45 : 15}
          readOnly={formik.values.userId !== userId}
          editMode={disabled}
          maxAccess={maxAccess}
          onChange={e => formik.setFieldValue('notes', e.target.value)}
          onClear={() => formik.setFieldValue('notes', '')}
        />
        <Box className={styles.customButton}>
        <CustomButton
          label={data?.seqNo ? 'Edit' : 'Add'}
          disabled={disabled}
          onClick={() => formik.handleSubmit()}
        />
        </Box>
      </Box>
    </Box>
  )
}

export default RecordRemarksForm
