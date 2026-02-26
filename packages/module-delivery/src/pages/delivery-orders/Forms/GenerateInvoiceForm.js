import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import CustomTextArea from '@argus/shared-ui/src/components/Inputs/CustomTextArea'
import { useDocumentType } from '@argus/shared-hooks/src/hooks/documentReferenceBehaviors'
import { DeliveryRepository } from '@argus/repositories/src/repositories/DeliveryRepository'
import { SaleRepository } from '@argus/repositories/src/repositories/SaleRepository'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import { useError } from '@argus/shared-providers/src/providers/error'
import Form from '@argus/shared-ui/src/components/Shared/Form'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'

export default function GenerateInvoiceForm({ labels, maxAccess: access, recordId, form, refetchForm, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels, defaultsData } = useContext(ControlContext)
  const { stack: stackError } = useError()

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.SalesInvoice,
    access,
    enabled: !recordId
  })

  const invalidate = useInvalidate({
    endpointId: DeliveryRepository.DeliveriesOrders.qry
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
    documentType: { key: 'dtId', value: documentType?.dtId },
    initialValues: {
      reference: form?.values?.reference,
      plantId: form?.values?.plantId,
      clientId: form?.values?.clientId,
      applyVAT: false,
      spId: form?.values?.spId,
      clientRef: form?.values?.clientRef,
      clientName: form?.values?.clientName,
      date: new Date(),
      dtId: null,
      currency: null,
      dtName: '',
      ptId: null,
      plantName: form?.values?.plantName,
      description: '',
      deliveryOrderId: form?.values?.recordId
    },
    maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      plantId: yup.number().required()
    }),
    onSubmit: async obj => {
      const res = await postRequest({
        extension: DeliveryRepository.Invoice.generate,
        record: JSON.stringify(obj)
      })

      await refetchForm(recordId)
      invalidate()
      window.close()

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
  }, [])

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess} actions={actions} isSaved={false}>
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
    </Form>
  )
}
