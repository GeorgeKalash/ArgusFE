// ** MUI Imports
import { Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { useFormik } from 'formik'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'

import { DocumentReleaseRepository } from 'src/repositories/DocumentReleaseRepository'
import ConfirmationDialog from 'src/components/ConfirmationDialog'
import {
  formatDateToApi,
  formatDateToApiFunction,
  formatDateFromApi,
  formatDateDefault,
  formatDateFromApiInline
} from 'src/lib/date-helper'
import { CTDRRepository } from 'src/repositories/CTDRRepository'

export default function DocumentsForm({ labels, maxAccess, functionId, seqNo, recordId, onClose, setWindowOpen }) {
  const [isLoading, setIsLoading] = useState(false)

  const [confirmationWindowOpen, setConfirmationWindowOpen] = useState(false)
  const [responseValue, setResponseValue] = useState(null)

  const [initialValues, setInitialData] = useState({
    recordId: null,
    reference: '',
    functionId: '',
    seqNo: '',
    thirdParty: '',
    functionName: '',
    date: '',
    notes: '',
    responseDate: ''
  })

  const { getRequest, postRequest } = useContext(RequestsContext)

  //const editMode = !!recordId

  const invalidate = useInvalidate({
    endpointId: DocumentReleaseRepository.DocumentsOnHold.qry
  })

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validateOnChange: true,

    onSubmit: async obj => {
      const data = {
        ...obj,
        date: formatDateToApi(obj.date),
        functionId: initialValues.functionId,
        seqNo: initialValues.seqNo,
        recordId: initialValues.recordId,
        response: responseValue
      }

      // obj.response = responseValue

      // obj.date = formatDateToApi(obj.date)

      try {
        const response = await postRequest({
          extension: CTDRRepository.DocumentsOnHold.set,
          record: JSON.stringify(data)
        })

        if (!functionId && !seqNo && !recordId && responseValue !== null) {
          toast.success('Record Added Successfully')
        } else {
          toast.success('Record Edited Successfully')
        }
        setWindowOpen(false)
        invalidate()
      } catch (error) {
        toast('Something went wrong')
      }
    }
  })

  useEffect(() => {
    ;(async function () {
      try {
        setIsLoading(true)

        const res = await getRequest({
          extension: DocumentReleaseRepository.DocumentsOnHold.get,
          parameters: `_functionId=${functionId}&_seqNo=${seqNo}&_recordId=${recordId}`
        })

        setInitialData({
          ...res.record,

          date: formatDateFromApi(res.record.date)
        })
      } catch (exception) {
        setErrorMessage(error)
      }
      setIsLoading(false)
    })()
  }, [])

  const actions = [
    {
      key: 'Reject',
      condition: true,
      onClick: () => {
        setConfirmationWindowOpen(true)
        setResponseValue(-1)
      },
      disabled: false
    },
    {
      key: 'Approve',
      condition: true,
      onClick: () => {
        setConfirmationWindowOpen(true)
        setResponseValue(2)
      },
      disabled: false
    }
  ]

  return (
    <>
      <ConfirmationDialog
        DialogText={`Are you sure you want to ${responseValue === 2 ? 'approve' : 'reject'} this document`}
        cancelButtonAction={() => setConfirmationWindowOpen(false)}
        openCondition={confirmationWindowOpen}
        okButtonAction={() => {
          formik.submitForm()
          setConfirmationWindowOpen(false)
        }}
      />
      <FormShell
        actions={actions}
        resourceId={ResourceIds.DocumentsOnHold}
        form={formik}
        height={300}
        maxAccess={maxAccess}
        isCleared={false}
        isInfo={false}
        isSaved={false}
      >
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <CustomTextField
              name='reference'
              label={labels.reference}
              value={formik.values.reference}
              readOnly={true}
              maxAccess={maxAccess}
              maxLength='30'
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='thirdParty'
              label={labels.thirdParty}
              value={formik.values.thirdParty}
              readOnly={true}
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomDatePicker
              name='date'
              label={labels.date}
              onChange={formik.setFieldValue}
              value={formik.values.date}
              readOnly={true}
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextArea
              name='notes'
              label={labels.notes}
              value={formik.values.notes}
              maxLength='100'
              rows={2}
              maxAccess={maxAccess}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('notes', '')}
              error={formik.touched.notes && Boolean(formik.errors.notes)}
            />
          </Grid>
        </Grid>
      </FormShell>
    </>
  )
}
