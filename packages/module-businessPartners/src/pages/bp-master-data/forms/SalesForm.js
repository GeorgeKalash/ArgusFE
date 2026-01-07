import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { Grid } from '@mui/material'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { BusinessPartnerRepository } from '@argus/repositories/src/repositories/BusinessPartnerRepository'
import Form from '@argus/shared-ui/src/components/Shared/Form'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { SaleRepository } from '@argus/repositories/src/repositories/SaleRepository'
import CustomCheckBox from '@argus/shared-ui/src/components/Inputs/CustomCheckBox'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'

export default function SalesForm({ store, labels, maxAccess }) {
  const { recordId } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      bpId: null,
      cgId: null,
      clientId: null,
      clientRef: '',
      clientName: '',
      generateClient: true,
      isSubjectToVAT: false,
      maxDiscount: null,
      discount: null,
      szId: null,
      currencyId: null,
      plId: null,
      ptId: null,
      spId: null,
      disableGeneration: false
    },
    validationSchema: yup.object({
      cgId: yup.number().required(),
      clientId: yup
        .number()
        .nullable()
        .test(function (value) {
          if (!this.parent.generateClient) {
            return value
          }

          return true
        }),
      discount: yup.number().nullable().max(100),
      maxDiscount: yup.number().nullable().max(100)
    }),
    onSubmit: async obj => {
      await postRequest({
        extension: BusinessPartnerRepository.MasterSales.set,
        record: JSON.stringify({ ...obj, bpId: recordId || null })
      })
      toast.success(platformLabels.Edited)
    }
  })

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: BusinessPartnerRepository.MasterSales.get,
          parameters: `_bpId=${recordId}`
        })
        if (!res?.record) return
        const hasFields = Object.keys(res?.record || {}).length > 0
        formik.setValues({
          ...(res?.record || {}),
          disableGeneration: hasFields
        })
      }
    })()
  }, [recordId])

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <CustomTextField name='bpRef' label={labels.bpRef} value={store?.bp?.ref} readOnly />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField name='bpName' label={labels.bpName} value={store?.bp?.name} readOnly />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SaleRepository.ClientGroups.qry}
                    name='cgId'
                    maxAccess={maxAccess}
                    required
                    label={labels.clientGrp}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik.values}
                    onChange={(_, newValue) => formik.setFieldValue('cgId', newValue?.recordId || '')}
                    error={formik.touched.cgId && Boolean(formik.errors.cgId)}
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
                  <CustomCheckBox
                    name='generateClient'
                    value={formik.values?.generateClient}
                    onChange={event => formik.setFieldValue('generateClient', event.target.checked)}
                    label={labels.generateClient}
                    maxAccess={maxAccess}
                    readOnly={formik.values.disableGeneration}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceLookup
                    endpointId={SaleRepository.Client.snapshot}
                    valueField='reference'
                    displayField='name'
                    name='clientId'
                    label={labels.client}
                    form={formik}
                    displayFieldWidth={2}
                    valueShow='clientRef'
                    secondValueShow='clientName'
                    maxAccess={maxAccess}
                    required={!formik.values.generateClient}
                    readOnly={formik.values.generateClient || formik.values.disableGeneration}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    onChange={async (_, newValue) => {
                      formik.setFieldValue('clientName', newValue?.name || '')
                      formik.setFieldValue('clientRef', newValue?.reference || '')
                      formik.setFieldValue('clientId', newValue?.recordId || null)
                    }}
                    errorCheck={'clientId'}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SaleRepository.SalesZone.qry}
                    parameters={`_startAt=0&_pageSize=1000&_sortField="recordId"&_filter=`}
                    name='szId'
                    label={labels.salesZone}
                    valueField='recordId'
                    displayField={['szRef', 'name']}
                    columnsInDropDown={[
                      { key: 'szRef', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik.values}
                    maxAccess={maxAccess}
                    onChange={(_, newValue) => formik.setFieldValue('szId', newValue?.recordId || null)}
                    error={formik.touched.szId && Boolean(formik.errors.szId)}
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
                    endpointId={SaleRepository.PriceLevel.qry}
                    name='plId'
                    label={labels.priceLevel}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik.values}
                    maxAccess={maxAccess}
                    onChange={(_, newValue) => formik.setFieldValue('plId', newValue?.recordId || '')}
                    error={formik.touched.plId && Boolean(formik.errors.plId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SaleRepository.PaymentTerms.qry}
                    name='ptId'
                    label={labels.paymentTerm}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik?.values}
                    maxAccess={maxAccess}
                    onChange={(_, newValue) => formik.setFieldValue('ptId', newValue?.recordId || null)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SaleRepository.SalesPerson.qry}
                    name='spId'
                    label={labels.salesPerson}
                    columnsInDropDown={[
                      { key: 'spRef', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    valueField='recordId'
                    displayField='name'
                    values={formik.values}
                    onChange={(_, newValue) => formik.setFieldValue('spId', newValue?.recordId || null)}
                    error={formik.touched.spId && Boolean(formik.errors.spId)}
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='discount'
                    label={labels.discount}
                    value={formik.values.discount}
                    maxAccess={maxAccess}
                    allowNegative={false}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('discount', '')}
                    error={formik.touched.discount && Boolean(formik.errors.discount)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='maxDiscount'
                    label={labels.maxDiscount}
                    value={formik.values.maxDiscount}
                    maxAccess={maxAccess}
                    allowNegative={false}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('maxDiscount', '')}
                    error={formik.touched.maxDiscount && Boolean(formik.errors.maxDiscount)}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </Form>
  )
}
