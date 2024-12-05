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
import { DeliveryRepository } from 'src/repositories/DeliveryRepository'
import { SaleRepository } from 'src/repositories/SaleRepository'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { useError } from 'src/error'

export default function GenerateInvoiceForm({ labels, maxAccess: access, recordId, form }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels, defaultsData } = useContext(ControlContext)
  const { stack: stackError } = useError()

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.SalesInvoice,
    access,
    enabled: !recordId
  })

  const getDataResult = () => {
    const myObject = {}

    const filteredList = defaultsData?.list?.filter(obj => {
      return obj.key === 'currencyId' || obj.key === 'PUCurrencyId'
    })
    filteredList?.forEach(obj => (myObject[obj.key] = obj.value ? parseInt(obj.value) : null))

    if (myObject.currencyId !== -1 && myObject.PUCurrencyId !== -1) {
      formik.setFieldValue('currencyId', myObject.currencyId)
    } else {
      stackError({
        message: labels.puSettingError
      })
    }
  }

  useEffect(() => {
    getDataResult()
  }, [])

  const { formik } = useForm({
    initialValues: {
      reference: form?.values?.reference,
      plantId: form?.values?.plantId,
      clientId: form?.values?.clientId,
      applyVAT: false,
      spId: form?.values?.spId,
      clientRef: form?.values?.clientRef,
      clientName: form?.values?.clientName,
      date: new Date(),
      dtId: documentType?.dtId,
      currency: null,
      dtName: '',
      ptId: null,
      plantName: form?.values?.plantName,
      description: '',
      deliveryOrderId: form?.values?.recordId
    },
    maxAccess,
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      plantId: yup.number().required()
    }),
    onSubmit: async obj => {
      const res = await postRequest({
        extension: DeliveryRepository.DeliveriesOrders.generate,
        record: JSON.stringify(obj)
      })

      !res.recordId ? toast.success(platformLabels.Added) : toast.success(platformLabels.Edited)
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
          parameters: `_recordId=${formik?.values?.currencyId}&_doId=${formik?.values?.deliveryOrderId}`
        })
        formik.setFieldValue('currencyName', currency.record.name)
      }
    })()
  }, [formik?.values?.currencyId])

  useEffect(() => {
    if (documentType?.dtId) formik.setFieldValue('dtId', documentType.dtId)
  }, [documentType?.dtId])

  return (
    <FormShell
      resourceId={ResourceIds.DeliveriesOrders}
      form={formik}
      maxAccess={maxAccess}
      functionId={SystemFunction.DeliveryTrip}
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
                parameters={`_dgId=${SystemFunction.SalesInvoice}&_startAt=${0}&_pageSize=${1000}`}
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
              <CustomDatePicker name='date' label={labels.date} value={formik.values?.date} readOnly />
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
                endpointId={SaleRepository.Client.snapshot}
                valueField='reference'
                displayField='name'
                secondFieldLabel={labels.client}
                name='clientId'
                label={labels.client}
                form={formik}
                required
                readOnly
                valueShow='clientRef'
                secondValueShow='clientName'
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
              <CustomTextField
                name='reference'
                label={labels.deliveryOrderReference}
                value={formik.values.reference}
                readOnly
              />
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
