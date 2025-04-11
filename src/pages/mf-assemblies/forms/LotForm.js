import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { BusinessPartnerRepository } from 'src/repositories/BusinessPartnerRepository'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { InventoryRepository } from 'src/repositories/InventoryRepository'

export default function LotForm({ labels, maxAccess, recordId }) {
  const { platformLabels } = useContext(ControlContext)
  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: BusinessPartnerRepository.LegalStatus.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      reference: '',
      name: ''
    },
    maxAccess,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      udd1: yup.string().required(),
      udd2: yup.string().required()
    }),
    onSubmit: async obj => {
      //   const response = await postRequest({
      //     extension: BusinessPartnerRepository.LegalStatus.set,
      //     record: JSON.stringify(obj)
      //   })
      //   if (!obj.recordId) {
      //     toast.success(platformLabels.Added)
      //     formik.setFieldValue('recordId', response.recordId)
      //   } else toast.success(platformLabels.Edited)
      //   invalidate()
    }
  })

  const editMode = !!recordId

  useEffect(() => {
    ;(async function () {
      //   if (recordId) {
      //     const res = await getRequest({
      //       extension: BusinessPartnerRepository.LegalStatus.get,
      //       parameters: `_recordId=${recordId}`
      //     })
      //     formik.setValues(res.record)
      //   }
    })()
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.LegalStatus}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      isInfo={false}
      isSavedClear={false}
      isCleared={false}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <CustomTextField
                name='LlotCategory'
                label={labels.lotCategory}
                value={formik?.values?.LlotCategory}
                maxAccess={maxAccess}
                readOnly
                error={formik.touched.reference && Boolean(formik.errors.reference)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='reference'
                label={labels.reference}
                value={formik?.values?.reference}
                maxAccess={maxAccess}
                readOnly
                error={formik.touched.name && Boolean(formik.errors.name)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={InventoryRepository.Item.snapshot}
                name='itemId'
                label={labels?.sku}
                valueField='recordId'
                displayField='sku'
                valueShow='sku'
                secondValueShow='itemName'
                displayFieldWidth={2}
                form={formik}
                readOnly
                maxAccess={maxAccess}
                errorCheck={'itemId'}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='udd1'
                required
                label={labels.startDate}
                value={formik?.values?.udd1}
                onChange={formik.setFieldValue}
                editMode={editMode}
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('udd1', null)}
                error={formik.touched.udd1 && Boolean(formik.errors.udd1)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='udd2'
                required
                readOnly
                label={labels.endDate}
                value={formik?.values?.udd2}
                onChange={formik.setFieldValue}
                editMode={editMode}
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('udd2', null)}
                error={formik.touched.udd2 && Boolean(formik.errors.udd2)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='udt1'
                label={labels.notKnown}
                value={formik?.values?.udt1}
                readOnly
                maxAccess={maxAccess}
                error={formik.touched.udt1 && Boolean(formik.errors.udt1)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='udt2'
                label={labels.notKnown}
                value={formik?.values?.udt2}
                maxAccess={maxAccess}
                readOnly
                error={formik.touched.udt2 && Boolean(formik.errors.udt2)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='udn1'
                label={labels.notKnown}
                value={formik?.values?.udn1}
                maxAccess={maxAccess}
                readOnly
                error={formik.touched.udn1 && Boolean(formik.errors.udn1)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='udn2'
                label={labels.notKnown}
                value={formik?.values?.udn2}
                readOnly
                maxAccess={maxAccess}
                error={formik.touched.udn2 && Boolean(formik.errors.udn2)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
