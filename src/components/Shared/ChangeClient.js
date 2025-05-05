import { Grid } from '@mui/material'
import { ResourceIds } from 'src/resources/ResourceIds'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { useResourceQuery } from 'src/hooks/resource'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import FormShell from 'src/components/Shared/FormShell'
import * as yup from 'yup'
import CustomTextField from '../Inputs/CustomTextField'
import CustomDatePicker from '../Inputs/CustomDatePicker'
import CustomTextArea from '../Inputs/CustomTextArea'
import { ResourceLookup } from './ResourceLookup'
import { FinancialRepository } from 'src/repositories/FinancialRepository'
import { SaleRepository } from 'src/repositories/SaleRepository'
import CustomCheckBox from '../Inputs/CustomCheckBox'
import { useForm } from 'src/hooks/form'

export default function ChangeClient({ form, window }) {
  const { labels, access } = useResourceQuery({
    datasetId: ResourceIds.ChangeClient
  })

  const { formik } = useForm({
    maxAccess: access,
    initialValues: { changetoId: null, changeToRef: '', changeToName: '' },
    validateOnChange: true,
    validationSchema: yup.object({
      changetoId: yup.string().required()
    }),
    onSubmit: async values => {
      if (values.changetoId) {
        form.setFieldValue('clientId', values.changetoId)
        form.setFieldValue('clientName', values.changeToName)
        form.setFieldValue('clientRef', values.changeToRef)
        window.close()
      }
    }
  })

  return (
    <FormShell form={formik} isInfo={false} isCleared={false}>
      <VertLayout>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <CustomTextField
              name='reference'
              label={labels.reference}
              value={form?.values?.reference}
              maxAccess={access}
              readOnly
            />
          </Grid>
          <Grid item xs={12}>
            <CustomDatePicker name='date' label={labels.date} value={form?.values?.date} readOnly maxAccess={access} />
          </Grid>
          <Grid item xs={12}>
            <CustomTextArea
              name='billAddress'
              label={labels.billAddress}
              value={form.values.billAddress}
              rows={3}
              maxLength='100'
              readOnly
              maxAccess={access}
            />
          </Grid>
          <Grid item xs={9}>
            <CustomCheckBox
              name='isVattable'
              value={form.values?.isVattable}
              label={labels.vat}
              disabled={true}
              maxAccess={access}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={FinancialRepository.TaxSchedules.qry}
              name='taxId'
              label={labels.taxSchedule}
              valueField='recordId'
              displayField={['reference', 'name']}
              readOnly
              values={form.values}
              maxAccess={access}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceLookup
              endpointId={SaleRepository.Client.snapshot}
              valueField='reference'
              displayField='name'
              secondFieldLabel={labels.name}
              name='clientId'
              label={labels.client}
              form={form}
              readOnly
              displayFieldWidth={4}
              valueShow='clientRef'
              secondValueShow='clientName'
              maxAccess={access}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceLookup
              endpointId={SaleRepository.Client.snapshot}
              valueField='reference'
              displayField='name'
              secondFieldLabel={labels.name}
              name='changetoId'
              label={labels.changeTo}
              form={formik}
              displayFieldWidth={3}
              valueShow='changeToRef'
              secondValueShow='changeToName'
              maxAccess={access}
              columnsInDropDown={[
                { key: 'reference', value: 'Reference' },
                { key: 'name', value: 'Name' },
                { key: 'flName', value: 'FlName' },
                { key: 'keywords', value: 'Keywords' },
                { key: 'cgName', value: 'Client Group' }
              ]}
              required
              onChange={async (event, newValue) => {
                formik.setFieldValue('changetoId', newValue?.recordId)
                formik.setFieldValue('changeToName', newValue?.name)
                formik.setFieldValue('changeToRef', newValue?.reference)
              }}
              errorCheck={'changetoId'}
            />
          </Grid>
        </Grid>
      </VertLayout>
    </FormShell>
  )
}
