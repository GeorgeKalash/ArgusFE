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
import { useError } from 'src/error'
import { ControlContext } from 'src/providers/ControlContext'
import useSetWindow from 'src/hooks/useSetWindow'
import { useContext } from 'react'

export default function ChangeClient({ form, window }) {
  const { stack: stackError } = useError()
  const { platformLabels } = useContext(ControlContext)

  useSetWindow({ title: platformLabels.ChangeClient, window })

  const { labels, access } = useResourceQuery({
    datasetId: ResourceIds.ChangeClient
  })

  const { formik } = useForm({
    maxAccess: access,
    initialValues: {
      changeToId: null,
      changeToRef: '',
      changeToName: '',
      changeBillAddressId: null,
      changeBill: '',
      changeSzId: null
    },
    validateOnChange: true,
    validationSchema: yup.object({
      changeToId: yup.string().required()
    }),
    onSubmit: async values => {
      if (values.changeToId) {
        form.setFieldValue('clientId', values.changeToId)
        form.setFieldValue('clientName', values.changeToName)
        form.setFieldValue('clientRef', values.changeToRef)
        form.setFieldValue('billAddressId', values.changeBillAddressId)
        form.setFieldValue('billAddress', values.changeBill)
        form.setFieldValue('szId', values.changeSzId)
        window.close()
      }
    }
  })

  function isValidClient(values) {
    if (form.plId != values.plId) {
      stackError({
        message: labels.mismatchPrice
      })

      return false
    } else if (form.isVattable != values.IsSubjectToVat) {
      stackError({
        message: labels.mismatchVat
      })

      return false
    } else if (form.taxId != values.taxId) {
      stackError({
        message: labels.mismatchTax
      })

      return false
    } else if (form.maxDiscount <= values.maxDiscount) {
      stackError({
        message: labels.mismatchDiscount
      })

      return false
    }

    return true
  }

  return (
    <FormShell resourceId={ResourceIds.ChangeClient} form={formik} isInfo={false} isCleared={false} maxAccess={access}>
      <VertLayout>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <CustomTextField name='reference' label={labels.reference} value={form?.values?.reference} readOnly />
          </Grid>
          <Grid item xs={12}>
            <CustomDatePicker name='date' label={labels.date} value={form?.values?.date} readOnly />
          </Grid>
          <Grid item xs={12}>
            <CustomTextArea
              name='billAddress'
              label={labels.billAddress}
              value={form.values.billAddress}
              rows={3}
              maxLength='100'
              readOnly
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={SaleRepository.PriceLevel.qry}
              name='plId'
              label={labels.priceLevel}
              readOnly
              valueField='recordId'
              displayField={['reference', 'name']}
              values={form.values}
            />
          </Grid>
          <Grid item xs={9}>
            <CustomCheckBox name='isVattable' value={form.values?.isVattable} label={labels.vat} disabled={true} />
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
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceLookup
              endpointId={SaleRepository.Client.snapshot}
              filter={{ isInactive: false }}
              valueField='reference'
              displayField='name'
              secondFieldLabel={labels.name}
              name='changeToId'
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
                const isValid = isValidClient(newValue)

                formik.setFieldValue('changeToId', isValid ? newValue?.recordId : null)
                formik.setFieldValue('changeToName', isValid ? newValue?.name : '')
                formik.setFieldValue('changeToRef', isValid ? newValue?.reference : null)
                formik.setFieldValue('changeBillId', isValid ? newValue?.billAddressId : null)
                formik.setFieldValue('changeBill', isValid ? newValue?.billAddress : '')
                formik.setFieldValue('changeSzId', isValid ? newValue?.szId : null)
              }}
              errorCheck={'changeToId'}
            />
          </Grid>
        </Grid>
      </VertLayout>
    </FormShell>
  )
}

ChangeClient.width = 500
ChangeClient.height = 570
