import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { CashBankRepository } from '@argus/repositories/src/repositories/CashBankRepository'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import { formatDateFromApi, formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'

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
      issueDate: null
    },
    maxAccess,
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
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={CashBankRepository.CashAccount.qry}
                parameters={`_type=0`}
                name='bankAccountId'
                label={labels.bank}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                required
                maxAccess={maxAccess}
                onChange={(_, newValue) => {
                  formik.setFieldValue('bankAccountId', newValue?.recordId || null)
                }}
                error={formik.touched.bankAccountId && Boolean(formik.errors.bankAccountId)}
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
