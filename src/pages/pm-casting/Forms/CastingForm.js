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
      laborId: null,
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
      threeDPId: yup.string().required(),
      productionLineId: yup.string().required(),
      laborId: yup.string().required(),
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
      key: 'Post',
      condition: true,
      onClick: onPost,
      disabled: !editMode || isPosted
    },
    {
      key: 'threeDPrinting',
      condition: true,
      onClick: async () => {
        const threeDFormLabels = await getLabels(ResourceIds.Printing)
        stack({
          Component: ThreeDPrintForm,
          props: {
            recordId: formik.values?.threeDPId,
            labels: threeDFormLabels
          },
          width: 750,
          height: 650,
          title: threeDFormLabels.ThreeDPrint
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
              <ResourceLookup
                endpointId={ProductModelingRepository.Printing.snapshot}
                valueField='reference'
                name='threeDPId'
                label={labels.threeDP}
                form={formik}
                secondDisplayField={false}
                valueShow='threeDPRef'
                formObject={formik.values}
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
              <ResourceLookup
                endpointId={ManufacturingRepository.Labor.qry}
                parameters={{
                  _startAt: 0,
                  _pageSize: 1000,
                  _params: ''
                }}
                valueField='reference'
                displayField='name'
                name='laborId'
                label={labels.labor}
                form={formik}
                readOnly={isPosted}
                required
                valueShow='laborRef'
                secondValueShow='laborName'
                maxAccess={maxAccess}
                displayFieldWidth={2}
                columnsInDropDown={[
                  { key: 'reference', value: 'Ref.' },
                  { key: 'name', value: 'Name' }
                ]}
                onChange={(event, newValue) => {
                  formik.setFieldValue('laborId', newValue?.recordId || null)
                  formik.setFieldValue('laborName', newValue?.name || '')
                  formik.setFieldValue('laborRef', newValue?.reference || '')
                }}
                errorCheck={'laborId'}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={ManufacturingRepository.ProductionLine.qry}
                parameters='_startAt=0&_pageSize=1000'
                values={formik.values}
                name='productionLineId'
                required
                label={labels.productionLine}
                valueField='recordId'
                displayField={['reference', 'name']}
                displayFieldWidth={1}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                readOnly={isPosted}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('productionLineId', newValue?.recordId || null)
                }}
                error={formik.touched.productionLineId && formik.errors.productionLineId}
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
