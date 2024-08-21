import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SystemFunction } from 'src/resources/SystemFunction'
import { DataSets } from 'src/resources/DataSets'
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'
import toast from 'react-hot-toast'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { SystemRepository } from 'src/repositories/SystemRepository'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'

export default function OutwardsReturnForm({ labels, maxAccess: access, recordId, plantId, dtId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { maxAccess } = useDocumentType({
    functionId: SystemFunction.OutwardsReturn,
    access,
    enabled: !recordId
  })

  const invalidate = useInvalidate({
    endpointId: RemittanceOutwardsRepository.OutwardsReturn.qry
  })

  async function getOutwardsReturn(recordId) {
    try {
      return await getRequest({
        extension: RemittanceOutwardsRepository.OutwardsReturn.get,
        parameters: `_recordId=${recordId}`
      })
    } catch (error) {}
  }

  const { formik } = useForm({
    initialValues: {
      recordId: recordId || null,
      dtId: dtId || null,
      reference: '',
      outwardId: '',
      outwardRef: '',
      requestedBy: null,
      date: new Date(),
      currencyId: null,
      fcAmount: null,
      corId: '',
      clientId: null,
      cashAccountId: null,
      wip: 1,
      status: 1,
      corReplyStatus: null,
      plantName: null,
      plantRef: null,
      currencyName: null,
      currencyRef: null,
      corName: null,
      corRef: null,
      plantId: plantId,
      cashAccountName: null,
      cashAccountRef: null
    },
    maxAccess,
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      date: yup.string().required(),
      outwardId: yup.number().required(),
      outwardRef: yup.string().required(),
      requestedBy: yup.string().required(),
      currencyId: yup.string().required(),
      fcAmount: yup.string().required(),
      clientId: yup.number().required()
    }),
    onSubmit: async obj => {
      try {
        const copy = { ...obj }
        copy.date = formatDateToApi(copy.date)

        const response = await postRequest({
          extension: RemittanceOutwardsRepository.OutwardsReturn.set,
          record: JSON.stringify(copy)
        })

        if (response.recordId) {
          toast.success(platformLabels.Added)
          formik.setFieldValue('recordId', response.recordId)
          const res2 = await getOutwardsReturn(response.recordId)

          formik.setFieldValue('reference', res2.record.reference)
        } else toast.success(platformLabels.Edited)

        invalidate()
      } catch (error) {}
    }
  })

  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      try {
        if (recordId) {
          const res = await getRequest({
            extension: RemittanceOutwardsRepository.OutwardsReturn.get,
            parameters: `_recordId=${recordId}`
          })

          formik.setValues({
            ...res.record,
            date: formatDateFromApi(res.record.date)
          })
        }
      } catch (exception) {}
    })()
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.OutwardsReturn}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      functionId={SystemFunction.OutwardsReturn}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <CustomTextField
                name='reference'
                label={labels.reference}
                value={formik?.values?.reference}
                maxAccess={!editMode && maxAccess}
                maxLength='30'
                readOnly={editMode}
                onChange={formik.handleChange}
                error={formik.touched.reference && Boolean(formik.errors.reference)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='date'
                label={labels.date}
                value={formik.values?.date}
                required={true}
                onChange={formik.setFieldValue}
                onClear={() => formik.setFieldValue('date', '')}
                error={formik.touched.date && Boolean(formik.errors.date)}
                helperText={formik.touched.date && formik.errors.date}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={RemittanceOutwardsRepository.OutwardsTransfer.snapshot}
                valueField='reference'
                displayField='reference'
                name='outwardRef'
                secondDisplayField={false}
                required
                label={labels.outwards}
                form={formik}
                onChange={(event, newValue) => {
                  formik.setFieldValue('outwardId', newValue ? newValue.recordId : '')
                  formik.setFieldValue('outwardRef', newValue ? newValue.reference : '')
                  formik.setFieldValue('clientId', newValue ? newValue.clientId : '')
                  formik.setFieldValue('clientName', newValue ? newValue.clientName : '')
                  formik.setFieldValue('clientRef', newValue ? newValue.clientRef : '')
                  formik.setFieldValue('currencyId', newValue ? newValue.currencyId : '')
                  formik.setFieldValue('currencyName', newValue ? newValue.currencyName : '')
                  formik.setFieldValue('currencyRef', newValue ? newValue.currencyRef : '')
                  formik.setFieldValue('fcAmount', newValue ? newValue.fcAmount : '')
                  formik.setFieldValue('corId', newValue ? newValue.corId : '')
                  formik.setFieldValue('corName', newValue ? newValue.corName : '')
                  formik.setFieldValue('corRef', newValue ? newValue.corRef : '')
                }}
                error={formik.touched.outwardRef && Boolean(formik.errors.outwardRef)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.REQUESTED_BY}
                name='requestedBy'
                label={labels.requestedBy}
                valueField='key'
                displayField='value'
                values={formik.values}
                required
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('requestedBy', newValue?.key)
                }}
                error={formik.touched.requestedBy && Boolean(formik.errors.requestedBy)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.Currency.qry}
                name='currencyId'
                label={labels.currency}
                valueField='recordId'
                displayField={['reference', 'name']}
                values={formik.values}
                readOnly
                maxAccess={maxAccess}
                error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='fcAmount'
                label={labels.fcAmount}
                value={formik.values.fcAmount}
                required
                readOnly
                maxAccess={maxAccess}
                onChange={e => formik.setFieldValue('fcAmount', e.target.value)}
                error={formik.touched.lcAmount && Boolean(formik.errors.lcAmount)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                valueField='reference'
                displayField='name'
                name='corId'
                label={labels.correspondent}
                form={formik}
                required
                valueShow='corRef'
                secondValueShow='corName'
                readOnly
                maxAccess={maxAccess}
                errorCheck={'corId'}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                readOnly
                valueField='reference'
                displayField='name'
                name='clientId'
                label={labels.client}
                form={formik}
                required
                displayFieldWidth={2}
                valueShow='clientRef'
                secondValueShow='clientName'
                maxAccess={maxAccess}
                errorCheck={'clientId'}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
