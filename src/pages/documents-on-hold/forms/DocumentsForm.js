import { Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { useFormik } from 'formik'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import ApprovalsDialog from 'src/components/Shared/ApprovalsDialog.js'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { DocumentReleaseRepository } from 'src/repositories/DocumentReleaseRepository'
import { formatDateToApi, formatDateFromApi } from 'src/lib/date-helper'
import { CTDRRepository } from 'src/repositories/CTDRRepository'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useWindow } from 'src/windows'
import { getSystemFunctionModule } from 'src/resources/SystemFunction'
import { Module } from 'src/resources/Module'
import { ControlContext } from 'src/providers/ControlContext'

export default function DocumentsForm({ labels, maxAccess, functionId, seqNo, recordId, setWindowOpen }) {
  const [isLoading, setIsLoading] = useState(false)
  const [responseValue, setResponseValue] = useState(null)
  const { platformLabels } = useContext(ControlContext)

  const [initialValues, setInitialData] = useState({
    recordId: null,
    reference: '',
    functionId: '',
    seqNo: '',
    thirdParty: '',
    functionName: '',
    date: '',
    notes: '',
    responseDate: '',
    strategyName: ''
  })
  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: DocumentReleaseRepository.DocumentsOnHold.qry
  })
  const { stack } = useWindow()

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
      try {
        const checkModule = getSystemFunctionModule(functionId)
        if (checkModule === Module.CurrencyTrading || checkModule === Module.Remittance) {
          await postRequest({
            extension: CTDRRepository.DocumentsOnHold.set,
            record: JSON.stringify(data)
          })
        } else {
          await postRequest({
            extension: DocumentReleaseRepository.DocumentsOnHold.set,
            record: JSON.stringify(data)
          })
        }

        if (!functionId && !seqNo && !recordId && responseValue !== null) {
          toast.success(platformLabels.Added)
        } else {
          toast.success(platformLabels.Edited)
        }
        setWindowOpen(false)
        invalidate()
      } catch (error) {}
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
      } catch (exception) {}
      setIsLoading(false)
    })()
  }, [])

  function openConfirmation(responseValue) {
    setResponseValue(responseValue)
    stack({
      Component: ApprovalsDialog,
      props: {
        fullScreen: false,
        responseValue: responseValue,
        onConfirm: () => {
          formik.submitForm()
        }
      },
      width: 450,
      height: 170,
      title: 'Confirmation'
    })
  }

  const actions = [
    {
      key: 'Reject',
      condition: true,
      onClick: () => {
        openConfirmation(-1)
      },
      disabled: false
    },
    {
      key: 'Approve',
      condition: true,
      onClick: () => {
        openConfirmation(2)
      },
      disabled: false
    }
  ]

  return (
    <FormShell
      actions={actions}
      resourceId={ResourceIds.DocumentsOnHold}
      form={formik}
      maxAccess={maxAccess}
      isCleared={false}
      isInfo={false}
      isSaved={false}
    >
      <VertLayout>
        <Grow>
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
              <CustomTextField
                name='strategyName'
                label={labels.strategy}
                value={formik.values.strategyName}
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
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
