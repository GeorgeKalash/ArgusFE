import { Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'

export default function LotForm({ labels, maxAccess, form }) {
  const { platformLabels } = useContext(ControlContext)
  const { getRequest, postRequest } = useContext(RequestsContext)
  const [validationSchema, setValidationSchema] = useState(() => yup.object({}))
  const [dynamicLabels, setDynamicLabels] = useState({})

  const { formik } = useForm({
    initialValues: {
      recordId: form?.recordId,
      lotId: 0,
      reference: '',
      name: '',
      itemId: form?.itemId,
      LSku: form?.sku,
      LItem: form?.itemName,
      LlotCategory: form?.lotCategoryName,
      udd1: null,
      udd2: null,
      udt1: null,
      udt2: null,
      udn1: null,
      udn2: null
    },
    maxAccess,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema,
    onSubmit: async obj => {
      const res = await postRequest({
        extension: InventoryRepository.Lot.set,
        record: JSON.stringify(obj)
      })

      const { record: lotInfo } = await getRequest({
        extension: InventoryRepository.Lot.get,
        parameters: `_itemId=${form?.itemId}$_lotId=${res?.recordId}`
      })

      await postRequest({
        extension: ManufacturingRepository.AssemblyLot.set,
        record: JSON.stringify({ assemblyId: form.recordId, itemId: lotInfo.itemId, lotId: lotInfo.lotId })
      })

      toast.success(obj.lotId ? platformLabels.Edited : platformLabels.Added)
      formik.setFieldValue('lotId', lotInfo?.lotId)
      formik.setFieldValue('reference', lotInfo?.reference)
    }
  })
  const editMode = !!form.recordId
  useEffect(() => {
    ;(async function () {
      if (!form.lotCategoryId) return

      const { record: lotCategory } = await getRequest({
        extension: InventoryRepository.LotCategory.get,
        parameters: `_recordId=${form.lotCategoryId}`
      })

      setDynamicLabels({
        udd1: lotCategory?.udd1 || 'N/A',
        udd2: lotCategory?.udd2 || 'N/A',
        udt1: lotCategory?.udt1 || 'N/A',
        udt2: lotCategory?.udt2 || 'N/A',
        udn1: lotCategory?.udn1 || 'N/A',
        udn2: lotCategory?.udn2 || 'N/A'
      })

      const dynamicSchema = yup.object({
        udd1: lotCategory?.udd1 ? yup.string().required('udd1 is required') : yup.string().nullable(),
        udd2: lotCategory?.udd2 ? yup.string().required('udd2 is required') : yup.string().nullable(),
        udt1: lotCategory?.udt1 ? yup.string().required('udt1 is required') : yup.string().nullable(),
        udt2: lotCategory?.udt2 ? yup.string().required('udt2 is required') : yup.string().nullable(),
        udn1: lotCategory?.udn1 ? yup.string().required('udn1 is required') : yup.string().nullable(),
        udn2: lotCategory?.udn2 ? yup.string().required('udn2 is required') : yup.string().nullable()
      })

      setValidationSchema(dynamicSchema)

      const { record: assemblyLot } = await getRequest({
        extension: ManufacturingRepository.AssemblyLot.get,
        parameters: `_assemblyId=${form.recordId}`
      })

      if (assemblyLot) {
        const { record: lotInfo } = await getRequest({
          extension: InventoryRepository.Lot.get,
          parameters: `_itemId=${assemblyLot.itemId}$_lotId=${assemblyLot.lotId}`
        })

        formik.setValues({
          ...formik.values,
          ...(lotInfo || {})
        })
      }
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
                onChange={formik.handleChange}
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
                displayField='LSku'
                valueShow='LSku'
                secondValueShow='LItem'
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
                label={dynamicLabels.udd1}
                value={formik?.values?.udd1}
                onChange={formik.setFieldValue}
                editMode={editMode}
                maxAccess={maxAccess}
                readOnly={dynamicLabels.udd1 == 'N/A'}
                onClear={() => formik.setFieldValue('udd1', null)}
                error={formik.touched.udd1 && Boolean(formik.errors.udd1)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='udd2'
                required
                readOnly={dynamicLabels.udd2 == 'N/A'}
                label={dynamicLabels.udd2}
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
                label={dynamicLabels.udt1}
                value={formik?.values?.udt1}
                readOnly={dynamicLabels.udt1 == 'N/A'}
                maxAccess={maxAccess}
                error={formik.touched.udt1 && Boolean(formik.errors.udt1)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='udt2'
                label={dynamicLabels.udt2}
                value={formik?.values?.udt2}
                maxAccess={maxAccess}
                readOnly={dynamicLabels.udt2 == 'N/A'}
                error={formik.touched.udt2 && Boolean(formik.errors.udt2)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='udn1'
                label={dynamicLabels.udn1}
                value={formik?.values?.udn1}
                maxAccess={maxAccess}
                readOnly={dynamicLabels.udn1 == 'N/A'}
                error={formik.touched.udn1 && Boolean(formik.errors.udn1)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='udn2'
                label={dynamicLabels.udn2}
                value={formik?.values?.udn2}
                readOnly={dynamicLabels.udn2 == 'N/A'}
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
