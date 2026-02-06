import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { Grid } from '@mui/material'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import Form from '@argus/shared-ui/src/components/Shared/Form'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { BusinessPartnerRepository } from '@argus/repositories/src/repositories/BusinessPartnerRepository'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { PurchaseRepository } from '@argus/repositories/src/repositories/PurchaseRepository'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import CustomCheckBox from '@argus/shared-ui/src/components/Inputs/CustomCheckBox'

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
