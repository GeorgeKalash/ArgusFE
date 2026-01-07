import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import CustomCheckBox from '@argus/shared-ui/src/components/Inputs/CustomCheckBox'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { EmployeeRepository } from '@argus/repositories/src/repositories/EmployeeRepository'

export default function HrSponsorForm({ labels, maxAccess, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: EmployeeRepository.SponsorFilters.page
  })

  const validationSchema = yup.object({
    name: yup.string().required(),
    address: yup.string().required(),
    mobile: yup
      .number()
      .integer()
      .positive()
      .min(10000000)
      .max(99999999)
      .nullable()
      .transform((value, originalValue) => (originalValue === '' ? null : value)),
    phone: yup.string().max(8).nullable(),
    isSupplier: yup.boolean(),
    email: yup.string().email().required()
  })

  const { formik } = useForm({
    initialValues: {
      name: '',
      idRef: '',
      rtwRef: '',
      address: '',
      city: '',
      mobile: '',
      phone: '',
      email: '',
      fax: '',
      isSupplier: false
    },
    maxAccess,
    validateOnChange: true,
    validationSchema,
    onSubmit: async obj => {
      const response = await postRequest({
        extension: EmployeeRepository.SponsorFilters.set,
        record: JSON.stringify(obj)
      })

      toast.success(obj.recordId ? platformLabels.Edited : platformLabels.Added)
      if (!obj.recordId) {
        formik.setFieldValue('recordId', response.recordId)
      }
      invalidate()
    }
  })

  const editMode = !!formik?.values?.recordId

  useEffect(() => {
    if (recordId) {
      ;(async function () {
        const res = await getRequest({
          extension: EmployeeRepository.SponsorFilters.get,
          parameters: `_recordId=${recordId}`
        })
        formik.setValues(res?.record)
      })()
    }
  }, [])

  return (
    <FormShell resourceId={ResourceIds.SponsorFilter} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomTextField
                name='name'
                label={labels.name}
                value={formik.values.name}
                required
                maxAccess={maxAccess}
                maxLength='70'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('name', '')}
                error={formik.touched.name && Boolean(formik.errors.name)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='idRef'
                label={labels.ref}
                value={formik.values.idRef}
                maxAccess={maxAccess}
                maxLength='20'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('idRef', '')}
                error={formik.touched.idRef && Boolean(formik.errors.idRef)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='rtwRef'
                label={labels.rightt}
                value={formik.values.rtwRef}
                maxAccess={maxAccess}
                maxLength='20'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('rtwRef', '')}
                error={formik.touched.rtwRef && Boolean(formik.errors.rtwRef)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='address'
                label={labels.address}
                value={formik.values.address}
                required
                maxAccess={maxAccess}
                maxLength='50'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('address', '')}
                error={formik.touched.address && Boolean(formik.errors.address)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='city'
                label={labels.city}
                value={formik.values.city}
                maxAccess={maxAccess}
                maxLength='50'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('city', '')}
                error={formik.touched.city && Boolean(formik.errors.city)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='mobile'
                label={labels.mobile}
                value={formik.values.mobile}
                maxLength='8'
                phone={true}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('mobile', '')}
                error={formik.touched.mobile && Boolean(formik.errors.mobile)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='phone'
                label={labels.phone}
                value={formik.values.phone}
                maxLength='8'
                phone={true}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('phone', '')}
                error={formik.touched.phone && Boolean(formik.errors.phone)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='email'
                label={labels.email}
                value={formik.values.email}
                type='email'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('email', '')}
                error={formik.touched.email && Boolean(formik.errors.email)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='fax'
                label={labels.fax}
                value={formik.values.fax}
                maxAccess={maxAccess}
                maxLength='50'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('fax', '')}
                error={formik.touched.fax && Boolean(formik.errors.fax)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomCheckBox
                name='isSupplier'
                label={labels.supplier}
                value={formik.values.isSupplier}
                onChange={e => formik.setFieldValue('isSupplier', e.target.checked)}
                maxAccess={maxAccess}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
