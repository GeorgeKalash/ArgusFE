import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import { companyStructureRepository } from '@argus/repositories/src/repositories/companyStructureRepository'
import Form from '@argus/shared-ui/src/components/Shared/Form'
import { formatDateFromApi, formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'

export default function LegalReferenceForm({ labels, maxAccess, branchId, record, window, invalidate }) {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { formik } = useForm({
    initialValues: {
      goId: record?.goId || null,
      branchId,
      goName: record?.goName || '',
      reference: '',
      releaseDate: null,
      expiryDate: null
    },
    maxAccess,
    validationSchema: yup.object({
      goName: yup.string().required(),
      reference: yup.string().required(),
      releaseDate: yup.date().required(),
      expiryDate: yup.date().required(),
    }),
    onSubmit: async obj => {
      await postRequest({
        extension: companyStructureRepository.BranchLegalRef.set,
        record: JSON.stringify({
          ...obj,
          releaseDate: obj.releaseDate ? formatDateToApi(obj.releaseDate) : null,
          expiryDate: obj.expiryDate ? formatDateToApi(obj.expiryDate) : null
        })
      })
      toast.success(obj.goId ? platformLabels.Edited : platformLabels.Added)
      invalidate()
      window.close()
    }
  })

  useEffect(() => {
    ;(async function () {
      if (record?.goId) {
        const res = await getRequest({
          extension: companyStructureRepository.BranchLegalRef.get,
          parameters: `_branchId=${branchId}&_goId=${record.goId}`
        })

        if (res?.record) {
          formik.setValues({
            ...res.record,
            releaseDate: formatDateFromApi(res.record.releaseDate),
            expiryDate: formatDateFromApi(res.record.expiryDate)
          })
        }
      }
    })()
  }, [record?.goId])

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess} editMode={!!record?.goId}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomTextField
                name='goName'
                label={labels.name}
                value={formik.values.goName}
                readOnly
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('goName', '')}
                error={formik.touched.goName && Boolean(formik.errors.goName)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='reference'
                label={labels.reference}
                value={formik.values.reference}
                required
                maxLength='20'
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('reference', '')}
                error={formik.touched.reference && Boolean(formik.errors.reference)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='releaseDate'
                label={labels.releaseDate}
                value={formik.values.releaseDate}
                required
                onChange={formik.setFieldValue}
                onClear={() => formik.setFieldValue('releaseDate', null)}
                error={formik.touched.releaseDate && Boolean(formik.errors.releaseDate)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='expiryDate'
                label={labels.expiryDate}
                value={formik.values.expiryDate}
                onChange={formik.setFieldValue}
                required
                onClear={() => formik.setFieldValue('expiryDate', null)}
                error={formik.touched.expiryDate && Boolean(formik.errors.expiryDate)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </Form>
  )
}