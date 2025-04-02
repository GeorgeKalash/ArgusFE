import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { SystemFunction } from 'src/resources/SystemFunction'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { useError } from 'src/error'
import { PurchaseRepository } from 'src/repositories/PurchaseRepository'

export default function GenerateInvoiceForm({ labels, maxAccess: access, recordId, form, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels, defaultsData } = useContext(ControlContext)

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.PurchaseInvoice,
    access,
    enabled: !recordId
  })

  const defCurrencyId = parseInt(defaultsData?.list?.find(obj => obj.key === 'PUCurrencyId')?.value)

  const { formik } = useForm({
    documentType: { key: 'dtId', value: documentType?.dtId },
    initialValues: {
      reference: form?.values?.header?.reference,
      plantId: form?.values?.header?.plantId,
      vendorId: form?.values?.header?.vendorId,
      vendorRef: form?.values?.header?.vendorRef,
      vendorName: form?.values?.header?.vendorName,
      date: new Date(),
      dtId: null,
      currency: null,
      currencyId: defCurrencyId,
      dtName: '',
      plantName: form?.values?.header?.plantName,
      description: '',
      shipments: [form?.values?.recordId]
    },
    maxAccess,
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      plantId: yup.string().required(),
      date: yup.string().required()
    }),
    onSubmit: async obj => {
      await postRequest({
        extension: PurchaseRepository.PurchaseInvoiceHeader.generate,
        record: JSON.stringify(obj)
      }).then(res => {
        toast.success(platformLabels.Saved)
        form.setFieldValue('header.invoiceId', res.recordId)
        window.close()
      })
    }
  })

  const actions = [
    {
      key: 'Generate Invoice',
      condition: true,
      onClick: () => formik.handleSubmit()
    }
  ]

  useEffect(() => {
    ;(async function () {
      if (formik?.values?.currencyId) {
        const currency = await getRequest({
          extension: SystemRepository.Currency.get,
          parameters: `_recordId=${formik?.values?.currencyId}`
        })
        formik.setFieldValue('currencyName', currency.record.name)
      }
    })()
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.Shipments}
      form={formik}
      maxAccess={maxAccess}
      functionId={SystemFunction.Shipment}
      actions={actions}
      isSaved={false}
      isInfo={false}
      isCleared={false}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.DocumentType.qry}
                parameters={`_dgId=${SystemFunction.PurchaseInvoice}&_startAt=${0}&_pageSize=${1000}`}
                name='dtId'
                label={labels.docType}
                valueField='recordId'
                displayField='name'
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('dtId', newValue?.recordId || '')
                  changeDT(newValue)
                }}
                error={formik.touched.dtId && Boolean(formik.errors.dtId)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='date'
                label={labels.date}
                value={formik.values?.date}
                required
                onChange={formik.setFieldValue}
                onClear={() => formik.setFieldValue('date', '')}
                error={formik.touched.header?.date && Boolean(formik.errors.header?.date)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.Plant.qry}
                name='plantId'
                label={labels.plant}
                valueField='recordId'
                displayField={['reference', 'name']}
                values={formik.values}
                readOnly
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={PurchaseRepository.Vendor.snapshot}
                filter={{ isInactive: false }}
                valueField='reference'
                displayField='name'
                secondFieldLabel={labels.vendor}
                name='vendorId'
                label={labels.vendor}
                form={formik}
                required
                readOnly
                valueShow='vendorRef'
                secondValueShow='vendorName'
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='currencyName'
                label={labels.currency}
                value={formik.values.currencyName}
                readOnly
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField name='reference' label={labels.shipmentRef} value={formik.values.reference} readOnly />
            </Grid>
            <Grid item xs={12}>
              <CustomTextArea
                name='description'
                label={labels.description}
                value={formik.values.description}
                maxAccess={maxAccess}
                onChange={e => formik.setFieldValue('description', e.target.value)}
                onClear={() => formik.setFieldValue('description', '')}
                error={formik.touched.description && Boolean(formik.errors.description)}
              />
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}
