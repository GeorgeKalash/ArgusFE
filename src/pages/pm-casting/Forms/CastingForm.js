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
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { SystemFunction } from 'src/resources/SystemFunction'
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { ProductModelingRepository } from 'src/repositories/ProductModelingRepository'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import ThreeDPrintForm from 'src/pages/pm-3d-printing/Forms/ThreeDPrintForm'
import { useWindow } from 'src/windows'
import { KVSRepository } from 'src/repositories/KVSRepository'
import { DataSets } from 'src/resources/DataSets'

export default function CastingForm({ labels, maxAccess: access, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()
  const systemFunction = SystemFunction.ModellingCasting

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: systemFunction,
    access,
    enabled: !recordId
  })

  const invalidate = useInvalidate({
    endpointId: ProductModelingRepository.Casting.page
  })

  const { formik } = useForm({
    documentType: { key: 'dtId', value: documentType?.dtId },
    initialValues: {
      recordId: null,
      reference: '',
      dtId: null,
      date: new Date(),
      threeDPId: null,
      productionLineId: null,
      castingType: null,
      laborId: null,
      mould: '',
      setPcs: null,
      weight: null,
      notes: '',
      status: 1
    },
    maxAccess,
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      date: yup.date().required(),
      threeDPId: yup.number().required(),
      laborId: yup.number().required(),
      castingType: yup.number().required(),
      productionLineId: yup.number().required(),
      setPcs: yup.number().nullable().min(0).max(1000)
    }),
    onSubmit: async values => {
      const data = { ...values, date: formatDateToApi(values?.date) }

      const res = await postRequest({
        extension: ProductModelingRepository.Casting.set,
        record: JSON.stringify(data)
      })

      await getData(res.recordId)
      invalidate()

      toast.success(!values.recordId ? platformLabels.Added : platformLabels.Edited)
    }
  })

  async function getLabels(datasetId) {
    const res = await getRequest({
      extension: KVSRepository.getLabels,
      parameters: `_dataset=${datasetId}`
    })

    return res.list ? Object.fromEntries(res.list.map(({ key, value }) => [key, value])) : {}
  }

  const isPosted = formik.values.status === 3
  const editMode = !!formik.values.recordId

  async function getData(recordId) {
    const res = await getRequest({
      extension: ProductModelingRepository.Casting.get,
      parameters: `_recordId=${recordId}`
    })

    formik.setValues({
      ...res.record,
      date: formatDateFromApi(res?.record?.date)
    })
  }

  const onPost = async () => {
    const header = { ...formik.values, date: formatDateToApi(formik.values?.date) }

    await postRequest({
      extension: ProductModelingRepository.Casting.post,
      record: JSON.stringify(header)
    })

    await getData(formik.values.recordId)
    toast.success(platformLabels.Posted)
    invalidate()
  }

  const actions = [
    {
      key: 'Locked',
      condition: true,
      onClick: onPost,
      disabled: !editMode || isPosted
    },
    {
      key: 'threeDPrinting',
      condition: true,
      onClick: async () => {
        stack({
          Component: ThreeDPrintForm,
          props: {
            recordId: formik.values?.threeDPId
          }
        })
      },
      disabled: !formik.values.threeDPId
    }
  ]

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        await getData(recordId)
      }
    })()
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.Casting}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      actions={actions}
      functionId={systemFunction}
      disabledSubmit={isPosted}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.DocumentType.qry}
                parameters={`_dgId=${systemFunction}&_startAt=0&_pageSize=50`}
                filter={!editMode ? item => item.activeStatus === 1 : undefined}
                name='dtId'
                label={labels.documentType}
                readOnly={editMode}
                valueField='recordId'
                displayField='name'
                values={formik?.values}
                onChange={async (event, newValue) => {
                  formik.setFieldValue('dtId', newValue?.recordId || null)
                  changeDT(newValue)

                  formik.setFieldValue('productionLineId', null)

                  if (newValue?.recordId) {
                    const { record } = await getRequest({
                      extension: ProductModelingRepository.DocumentTypeDefault.get,
                      parameters: `_dtId=${newValue?.recordId}`
                    })

                    formik.setFieldValue('productionLineId', record?.productionLineId)
                  } else {
                    formik.setFieldValue('productionLineId', null)
                  }
                }}
                error={formik.touched.dtId && Boolean(formik.errors.dtId)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='reference'
                label={labels.reference}
                value={formik?.values?.reference}
                readOnly={editMode}
                maxAccess={!editMode && maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('reference', '')}
                error={formik.touched.reference && Boolean(formik.errors.reference)}
              />
            </Grid>

            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={ManufacturingRepository.ProductionLine.qry}
                parameters={`_startAt=0&_pageSize=1000&_dtId=${formik.values.dtId}`}
                values={formik.values}
                name='productionLineId'
                label={labels.productionLine}
                valueField='recordId'
                displayField={['reference', 'name']}
                displayFieldWidth={1}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                required
                readOnly
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('productionLineId', newValue?.recordId || null)
                }}
                error={formik.touched.productionLineId && formik.errors.productionLineId}
              />
            </Grid>

            <Grid item xs={12}>
              <ResourceLookup
                endpointId={ProductModelingRepository.Printing.snapshot2}
                parameters={{ _productionLineId: formik.values.productionLineId || 0 }}
                valueField='reference'
                name='threeDPId'
                label={labels.threeDP}
                form={formik}
                secondDisplayField={false}
                valueShow='threeDPRef'
                formObject={formik.values}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'date', value: 'date', type: 'date' },
                  { key: 'designerRef', value: 'designer Ref' },
                  { key: 'designerName', value: 'designer Name' }
                ]}
                readOnly={isPosted}
                required
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('threeDPId', newValue?.recordId || null)
                  formik.setFieldValue('threeDPRef', newValue?.reference || '')
                }}
                errorCheck={'threeDPId'}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='date'
                label={labels.date}
                value={formik?.values?.date}
                required
                onChange={formik.setFieldValue}
                onClear={() => formik.setFieldValue('date', null)}
                readOnly={isPosted}
                error={formik.touched.date && Boolean(formik.errors.date)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={ManufacturingRepository.Labor.qry}
                parameters={`_startAt=0&_pageSize=200&_params=`}
                name='laborId'
                required
                readOnly={isPosted}
                label={labels.labor}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                valueField='recordId'
                displayField={['reference', 'name']}
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('laborId', newValue?.recordId || null)
                }}
                error={formik.touched.laborId && Boolean(formik.errors.laborId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.CASTING_TYPE}
                name='castingType'
                required
                label={labels.castingType}
                valueField='key'
                readOnly={isPosted}
                displayField='value'
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('castingType', newValue?.key || null)
                }}
                error={formik.touched.castingType && Boolean(formik.errors.castingType)}
              />
            </Grid>

            <Grid item xs={12}>
              <CustomTextField
                name='mould'
                label={labels.mould}
                value={formik.values.mould}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                readOnly={isPosted}
                onClear={() => formik.setFieldValue('mould', '')}
                error={formik.touched.mould && Boolean(formik.errors.mould)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='setPcs'
                label={labels.pieces}
                value={formik.values.setPcs}
                maxAccess={maxAccess}
                readOnly={isPosted}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('setPcs', null)}
                error={formik.touched.setPcs && Boolean(formik.errors.setPcs)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='weight'
                label={labels.weight}
                value={formik.values.weight}
                maxAccess={maxAccess}
                readOnly={isPosted}
                onChange={formik.handleChange}
                maxLength={8}
                decimalScale={2}
                onClear={() => formik.setFieldValue('weight', null)}
                error={formik.touched.weight && Boolean(formik.errors.weight)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextArea
                name='notes'
                type='text'
                label={labels.notes}
                value={formik.values.notes}
                readOnly={isPosted}
                rows={3}
                maxAccess={maxAccess}
                onChange={e => formik.setFieldValue('notes', e.target.value || null)}
                onClear={() => formik.setFieldValue('notes', '')}
                error={formik.touched.notes && Boolean(formik.errors.notes)}
              />
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}
