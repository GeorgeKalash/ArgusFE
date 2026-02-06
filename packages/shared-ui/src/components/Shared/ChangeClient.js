import { Grid } from '@mui/material'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import * as yup from 'yup'
import CustomTextField from '../Inputs/CustomTextField'
import CustomDatePicker from '../Inputs/CustomDatePicker'
import CustomTextArea from '../Inputs/CustomTextArea'
import { ResourceLookup } from './ResourceLookup'
import { FinancialRepository } from '@argus/repositories/src/repositories/FinancialRepository'
import { SaleRepository } from '@argus/repositories/src/repositories/SaleRepository'
import CustomCheckBox from '../Inputs/CustomCheckBox'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { useError } from '@argus/shared-providers/src/providers/error'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'
import { useContext } from 'react'

export default function ChangeClient({ formValues, onSubmit, window }) {
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
        const fields = {
          clientId: values.changeToId,
          clientName: values.changeToName,
          clientRef: values.changeToRef,
          billAddressId: values.changeBillAddressId,
          billAddress: values.changeBill,
          szId: values.changeSzId
        }

        onSubmit(fields)
        window.close()
      }
    }
  })

  function isValidClient(values) {
    if (formValues?.plId != values?.plId) {
      stackError({
        message: labels.mismatchPrice
      })

      return false
    } else if (formValues?.isVattable != values?.isSubjectToVAT) {
      stackError({
        message: labels.mismatchVat
      })

      return false
    } else if (formValues?.taxId != values?.taxId) {
      stackError({
        message: labels.mismatchTax
      })

      return false
    } else if ((formValues?.maxDiscount || 0) < (values?.maxDiscount || 0)) {
      stackError({ message: labels.mismatchDiscount })

      return false
    }

    return true
  }

  return (
    <FormShell resourceId={ResourceIds.ChangeClient} form={formik} isInfo={false} isCleared={false} maxAccess={access}>
      <VertLayout>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <CustomTextField name='reference' label={labels.reference} value={formValues?.reference} readOnly />
          </Grid>
          <Grid item xs={12}>
            <CustomDatePicker name='date' label={labels.date} value={formValues?.date} readOnly />
          </Grid>
          <Grid item xs={12}>
            <CustomTextArea
              name='billAddress'
              label={labels.billAddress}
              value={formValues?.billAddress}
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
              values={formValues}
            />
          </Grid>
          <Grid item xs={9}>
            <CustomCheckBox name='isVattable' value={formValues?.isVattable} label={labels.vat} disabled={true} />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={FinancialRepository.TaxSchedules.qry}
              name='taxId'
              label={labels.taxSchedule}
              valueField='recordId'
              displayField={['reference', 'name']}
              readOnly
              values={formValues}
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
              form={{ values: formValues }}
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
              onChange={(event, newValue) => {
                const isValid = newValue ? isValidClient(newValue) : null

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
