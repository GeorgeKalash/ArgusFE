import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useForm } from 'src/hooks/form'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { ControlContext } from 'src/providers/ControlContext'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import { useError } from 'src/error'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'

export default function SerialsForm({ labels, maxAccess, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack: stackError } = useError()

  const invalidate = useInvalidate({
    endpointId: InventoryRepository.Serial.qry
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      srlNo: '',
      sizeId: null,
      itemId: null,
      weight: null,
      admissionDate: null,
      siteId: null,
      warrantyStartDate: null,
      warrantyEndDate: null,
      productionDate: null,
      expirationDate: null,
      designId: null,
      metalRef: null,
      metalPurity: null,
      mfrSrlNo: null
    },
    maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      srlNo: yup.string().required(),
      itemId: yup.string().required()
    }),
    onSubmit: async values => {
      const data = {
        ...values,
        productionDate: values?.productionDate ? formatDateToApi(values?.productionDate) : null,
        admissionDate: values?.admissionDate ? formatDateToApi(values?.admissionDate) : null,
        warrantyStartDate: values?.warrantyStartDate ? formatDateToApi(values?.warrantyStartDate) : null,
        warrantyEndDate: values?.warrantyEndDate ? formatDateToApi(values?.warrantyEndDate) : null,
        expirationDate: values?.expirationDate ? formatDateToApi(values?.expirationDate) : null
      }

      await postRequest({
        extension: InventoryRepository.Serial.set,
        record: JSON.stringify(data)
      })

      toast.success(!values.recordId ? platformLabels.Added : platformLabels.Edited)

      invalidate()
      await fetchData(values.srlNo)
    }
  })

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        await fetchData(recordId)
      }
    })()
  }, [])

  async function fetchData(recordId) {
    if (recordId) {
      const res = await getRequest({
        extension: InventoryRepository.Serial.get,
        parameters: `_srlNo=${recordId}`
      })

      formik.setValues({
        ...res.record,
        recordId: res.record.srlNo,
        productionDate: formatDateFromApi(res?.record?.productionDate),
        admissionDate: formatDateFromApi(res?.record?.admissionDate),
        warrantyStartDate: formatDateFromApi(res?.record?.warrantyStartDate),
        warrantyEndDate: formatDateFromApi(res?.record?.warrantyEndDate),
        expirationDate: formatDateFromApi(res?.record?.expirationDate)
      })
    }
  }

  const editMode = !!formik.values.recordId

  async function getMetal(itemId) {
    if (itemId) {
      const res = await getRequest({
        extension: InventoryRepository.Physical.get,
        parameters: `_itemId=${itemId}`
      })
      formik.setFieldValue('metalRef', res?.record?.metalRef || '')
      formik.setFieldValue('metalPurity', res?.record?.metalPurity || '')
    }
  }

  async function checkSrlNo(srlNo) {
    const res = await getRequest({
      extension: InventoryRepository.Serial.get,
      parameters: `_srlNo=${srlNo}`
    })

    if (res.record) {
      stackError({
        message: platformLabels.serialsNoAlreadyExists
      })
    }
  }

  return (
    <FormShell resourceId={ResourceIds.IVSerials} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <CustomTextField
                name='srlNo'
                label={labels.srlNo}
                value={formik.values?.srlNo}
                required
                readOnly={editMode}
                maxAccess={maxAccess}
                onChange={e => {
                  formik.handleChange(e)
                }}
                onBlur={e => {
                  if (e.target.value && !editMode) {
                    checkSrlNo(e.target.value)
                  }
                }}
                onClear={() => formik.setFieldValue('srlNo', '')}
                error={formik.touched.srlNo && Boolean(formik.errors.srlNo)}
                maxLength={20}
              />
            </Grid>
            <Grid item xs={6}>
              <ResourceComboBox
                endpointId={InventoryRepository.ItemSizes.qry}
                name='sizeId'
                label={labels.size}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                valueField='recordId'
                displayField={['reference', 'name']}
                maxAccess={maxAccess}
                onChange={(_, newValue) => {
                  formik.setFieldValue('sizeId', newValue?.recordId || null)
                }}
                error={formik.touched.sizeId && Boolean(formik.errors.sizeId)}
              />
            </Grid>
            <Grid item xs={6}>
              <ResourceLookup
                endpointId={InventoryRepository.Item.snapshot}
                name='itemId'
                label={labels.sku}
                readOnly={editMode}
                valueField='sku'
                displayField='name'
                valueShow='sku'
                displayFieldWidth={2}
                secondValueShow='itemName'
                form={formik}
                required
                columnsInDropDown={[
                  { key: 'sku', value: 'SKU' },
                  { key: 'name', value: 'Name' }
                ]}
                onChange={(_, newValue) => {
                  formik.setFieldValue('itemId', newValue?.recordId || null)
                  formik.setFieldValue('itemName', newValue?.name || '')
                  formik.setFieldValue('sku', newValue?.sku || '')
                  getMetal(newValue?.recordId)
                }}
                errorCheck={'itemId'}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomDatePicker
                name='productionDate'
                label={labels.productionDate}
                value={formik.values.productionDate}
                onChange={formik.setFieldValue}
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('productionDate', null)}
                error={formik.touched.productionDate && Boolean(formik.errors.productionDate)}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomNumberField
                name='weight'
                label={labels.weight}
                value={formik.values.weight}
                maxAccess={maxAccess}
                readOnly={editMode}
                maxLength={10}
                decimalScale={3}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('weight', 0)}
                error={formik.touched.weight && Boolean(formik.errors.weight)}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomDatePicker
                name='admissionDate'
                label={labels.admissionDate}
                value={formik.values.admissionDate}
                onChange={formik.setFieldValue}
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('admissionDate', null)}
                error={formik.touched.admissionDate && Boolean(formik.errors.admissionDate)}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomTextField
                name='siteName'
                label={labels.site}
                value={formik.values?.siteName}
                readOnly
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomDatePicker
                name='warrantyStartDate'
                label={labels.warrantyStartDate}
                value={formik.values.warrantyStartDate}
                onChange={formik.setFieldValue}
                maxAccess={maxAccess}
                max={formik.values.warrantyEndDate}
                onClear={() => formik.setFieldValue('warrantyStartDate', null)}
                error={formik.touched.warrantyStartDate && Boolean(formik.errors.warrantyStartDate)}
              />
            </Grid>
            <Grid item xs={6}>
              <ResourceLookup
                endpointId={ManufacturingRepository.Design.snapshot}
                valueField='reference'
                displayField='name'
                displayFieldWidth={2}
                name='designId'
                label={labels.design}
                form={formik}
                secondDisplayField={true}
                firstValue={formik.values.designRef}
                secondValue={formik.values.designName}
                errorCheck={'designId'}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('designId', newValue?.recordId || null)
                  formik.setFieldValue('designRef', newValue?.reference || '')
                  formik.setFieldValue('designName', newValue?.name || '')
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomDatePicker
                name='warrantyEndDate'
                label={labels.warrantyEndDate}
                min={formik.values.warrantyStartDate}
                value={formik.values.warrantyEndDate}
                onChange={formik.setFieldValue}
                onClear={() => formik.setFieldValue('warrantyEndDate', null)}
                error={formik.touched.warrantyEndDate && Boolean(formik.errors.warrantyEndDate)}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomTextField
                name='metalRef'
                label={labels.metal}
                value={formik.values?.metalRef}
                readOnly
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomDatePicker
                name='expirationDate'
                label={labels.expirationDate}
                value={formik.values.expirationDate}
                maxAccess={maxAccess}
                onChange={formik.setFieldValue}
                onClear={() => formik.setFieldValue('expirationDate', null)}
                error={formik.touched.expirationDate && Boolean(formik.errors.expirationDate)}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomTextField
                name='metalPurity'
                label={labels.metalPurity}
                value={formik.values?.metalPurity}
                maxAccess={maxAccess}
                readOnly
              />
            </Grid>
            <Grid item xs={6}>
              <CustomTextField
                name='mfrSrlNo'
                label={labels.producerSerialNo}
                value={formik.values?.mfrSrlNo}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('mfrSrlNo', '')}
                error={formik.touched.mfrSrlNo && Boolean(formik.errors.mfrSrlNo)}
                maxLength={20}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
