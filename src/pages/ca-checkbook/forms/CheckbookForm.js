import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { CashBankRepository } from 'src/repositories/CashBankRepository'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'

export default function CheckbookForm({ labels, maxAccess, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: CashBankRepository.CACheckbook.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      bankAccountId: null,
      size: '',
      firstCheckNo: '',
      lastCheckNo: '',
      issueDate: null,
      bankAccountRef: null,
      bankAccountName: null
    },
    maxAccess,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      bankAccountId: yup.string().required(),
      size: yup.number().required(),
      firstCheckNo: yup.string().required(),
      lastCheckNo: yup.string().required(),
      issueDate: yup.string().required()
    }),
    onSubmit: async obj => {
      const data = {
        ...obj,
        issueDate: formatDateToApi(obj.issueDate)
      }

      const response = await postRequest({
        extension: CashBankRepository.CACheckbook.set,
        record: JSON.stringify(data)
      })

      !recordId ? toast.success(platformLabels.Added) : toast.success(platformLabels.Edited)
      formik.setValues({
        ...obj,
        recordId: response.recordId
      })

      invalidate()
    }
  })

  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: CashBankRepository.CACheckbook.get,
          parameters: `_recordId=${recordId}`
        })

        formik.setValues({
          ...res.record,
          issueDate: formatDateFromApi(res.record.issueDate)
        })
      }
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.Checkbook} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={CashBankRepository.CashAccount.snapshot}
                parameters={{
                  _type: 0
                }}
                required
                name='bankAccountId'
                label={labels.bank}
                valueField='reference'
                displayField='name'
                valueShow='bankAccountRef'
                secondValueShow='bankAccountName'
                form={formik}
                onChange={(event, newValue) => {
                  formik.setFieldValue('bankAccountId', newValue?.recordId || '')
                  formik.setFieldValue('bankAccountRef', newValue?.reference || '')
                  formik.setFieldValue('bankAccountName', newValue?.name || '')
                }}
                error={formik.touched.bankAccountId && Boolean(formik.errors.bankAccountId)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='firstCheckNo'
                label={labels.firstCheckNo}
                value={formik.values.firstCheckNo}
                required
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('firstCheckNo', '')}
                error={formik.touched.firstCheckNo && Boolean(formik.errors.firstCheckNo)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='lastCheckNo'
                label={labels.lastCheckNo}
                value={formik.values.lastCheckNo}
                required
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('lastCheckNo', '')}
                error={formik.touched.lastCheckNo && Boolean(formik.errors.lastCheckNo)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='size'
                required
                label={labels.size}
                value={formik.values.size}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('size', '')}
                error={formik.touched.size && Boolean(formik.errors.size)}
                maxLength={2}
                decimalScale={0}
                allowNegative={false}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='issueDate'
                label={labels.issueDate}
                value={formik.values?.issueDate}
                required
                onChange={formik.setFieldValue}
                onClear={() => formik.setFieldValue('issueDate', '')}
                error={formik.touched.issueDate && Boolean(formik.errors.issueDate)}
                maxAccess={maxAccess}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
