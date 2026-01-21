import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import { RequestsContext } from 'src/providers/RequestsContext'
import { BusinessPartnerRepository } from 'src/repositories/BusinessPartnerRepository'
import toast from 'react-hot-toast'
import { Grid } from '@mui/material'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { SystemRepository } from 'src/repositories/SystemRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'
import CustomCheckBox from 'src/components/Inputs/CustomCheckBox'
import Form from 'src/components/Shared/Form'
import { PurchaseRepository } from 'src/repositories/PurchaseRepository'
import { DataSets } from 'src/resources/DataSets'

export default function PurchaseForm({ store, labels, maxAccess }) {
  const { recordId } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      bpId: null,
      vgId: null,
      currencyId: null,
      paymentMethod: null,
      isSubjectToVAT: false,
      vendorRef: ''
    },
    validationSchema: yup.object({
      vgId: yup.number().required()
    }),
    onSubmit: async obj => {
      await postRequest({
        extension: BusinessPartnerRepository.MasterPurchase.set,
        record: JSON.stringify({ ...obj, bpId: recordId || null })
      })
      toast.success(platformLabels.Edited)
      refetchForm()
    }
  })

  async function refetchForm() {
    if (!recordId) return

    const res = await getRequest({
      extension: BusinessPartnerRepository.MasterPurchase.get,
      parameters: `_bpId=${recordId}`
    })
    if (res?.record) formik.setValues(res?.record)
  }

  useEffect(() => {
    if (recordId) refetchForm()
  }, [recordId])

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomTextField name='bpRef' label={labels.bpRef} value={store?.bp?.ref} readOnly />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField name='bpName' label={labels.bpName} value={store?.bp?.name} readOnly />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={PurchaseRepository.VendorGroups.qry}
                name='vgId'
                maxAccess={maxAccess}
                required
                label={labels.vendorGrp}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                onChange={(_, newValue) => formik.setFieldValue('vgId', newValue?.recordId || '')}
                error={formik.touched.vgId && Boolean(formik.errors.vgId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.Currency.qry}
                name='currencyId'
                label={labels.currency}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(_, newValue) => formik.setFieldValue('currencyId', newValue?.recordId || null)}
                error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.PAYMENT_METHOD}
                name='paymentMethod'
                label={labels.paymentMethod}
                valueField='key'
                displayField='value'
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(_, newValue) => formik.setFieldValue('paymentMethod', newValue?.key || null)}
                error={formik.touched.paymentMethod && Boolean(formik.errors.paymentMethod)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomCheckBox
                name='isSubjectToVAT'
                value={formik.values?.isSubjectToVAT}
                onChange={event => formik.setFieldValue('isSubjectToVAT', event.target.checked)}
                label={labels.taxable}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='vendorRef'
                label={labels.vendorRef}
                value={formik.values?.vendorRef}
                readOnly
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('vendorRef', '')}
                error={formik.touched.vendorRef && Boolean(formik.errors.vendorRef)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </Form>
  )
}
