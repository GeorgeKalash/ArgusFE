import React, { useContext } from 'react'
import { SystemRepository } from 'src/repositories/SystemRepository'
import CustomTextArea from '../../Inputs/CustomTextArea'
import { Box, Button } from '@mui/material'
import toast from 'react-hot-toast'
import { useForm } from 'src/hooks/form'
import * as yup from 'yup'
import { formatDateDefault, formatDateToApi } from 'src/lib/date-helper'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'

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
    <Box sx={{ px: 5 }}>
      {data?.userName && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'left', // Align children vertically to the start
            fontSize: 14
          }}
          fontSize={14}
        >
          <Box fontWeight='bold'>{data.userName}</Box> - <Box sx={{ mx: 1 }}>{formatDateDefault(data.eventDate)}</Box>
        </Box>
      )}
      <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
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
        <Button disabled={disabled} variant='contained' sx={{ mt: -10 }} onClick={() => formik.handleSubmit()}>
          {data?.seqNo ? 'Edit' : 'Add'}
        </Button>
      </Box>
    </Box>
  )
}

export default RecordRemarksForm
