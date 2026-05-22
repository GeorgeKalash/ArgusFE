import { Grid } from '@mui/material'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import * as yup from 'yup'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import { FinancialRepository } from '@argus/repositories/src/repositories/FinancialRepository'
import CustomCheckBox from '@argus/shared-ui/src/components/Inputs/CustomCheckBox'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { useError } from '@argus/shared-providers/src/providers/error'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'
import { useContext } from 'react'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import { PurchaseRepository } from '@argus/repositories/src/repositories/PurchaseRepository'

export default function ChangeVendor({ formValues, onSubmit, window }) {
  const { stack: stackError } = useError()
  const { platformLabels } = useContext(ControlContext)
  useSetWindow({ title: platformLabels.ChangeVendor, window })
  const { labels, access } = useResourceQuery({
    datasetId: ResourceIds.ChangeVendor
  })

  const { formik } = useForm({
    maxAccess: access,
    initialValues: {
      changeToId: null,
      changeToRef: '',
      changeToName: '',
      changeTdAmount: 0
    },
    validationSchema: yup.object({
      changeToId: yup.string().required()
    }),
    onSubmit: async values => {
      if (values.changeToId) {
        const fields = {
          vendorId: values.changeToId,
          vendorName: values.changeToName,
          vendorRef: values.changeToRef,
          tdAmount: formValues.tdType == 2 ? parseFloat(values.changeTdAmount) : parseFloat(formValues.subtotal) * ( parseFloat(values.changeTdAmount) / 100 )
        }

        onSubmit(fields)
        window.close()
      }
    }
  })

  function isValidateVendor(values) {
    if (formValues?.isVattable != values?.isTaxable) {
      stackError({
        message: labels.mismatchVat
      })

      return false
    } else if (formValues?.taxId != values?.taxId) {
      stackError({
        message: labels.mismatchTax
      })

      return false
    }

    return true
  }

  return (
    <FormShell resourceId={ResourceIds.ChangeVendor} form={formik} isInfo={false} isCleared={false} maxAccess={access}>
      <VertLayout>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <CustomTextField name='reference' label={labels.reference} value={formValues?.reference} readOnly />
          </Grid>
          <Grid item xs={12}>
            <CustomDatePicker name='date' label={labels.date} value={formValues?.date} readOnly />
          </Grid>
          <Grid item xs={9}>
            <CustomCheckBox name='isVattable' value={formValues?.isVattable} label={labels.vat} readOnly />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              datasetId={DataSets.PAYMENT_METHOD}
              name='paymentMethod'
              label={labels.paymentMethod}
              valueField='key'
              displayField='value'
              values={formValues}
              readOnly
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
              values={formValues}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceLookup
              endpointId={PurchaseRepository.Vendor.snapshot}
              valueField='reference'
              displayField='name'
              name='vendorId'
              label={labels.vendor}
              form={{ values: formValues }}
              readOnly
              displayFieldWidth={4}
              valueShow='vendorRef'
              secondValueShow='vendorName'
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceLookup
              endpointId={PurchaseRepository.Vendor.snapshot}
              filter={{ isInactive: value => !value }}
              valueField='reference'
              displayField='name'
              name='changeToId'
              label={labels.changeTo}
              form={formik}
              displayFieldWidth={2}
              valueShow='changeToRef'
              secondValueShow='changeToName'
              maxAccess={access}
              columnsInDropDown={[
                { key: 'reference', value: 'Reference' },
                { key: 'name', value: 'Name' },
                { key: 'flName', value: 'FlName' }
              ]}
              required
              onChange={(_, newValue) => {
                const isValid = newValue ? isValidateVendor(newValue) : null

                formik.setFieldValue('changeToId', isValid ? newValue?.recordId : null)
                formik.setFieldValue('changeToName', isValid ? newValue?.name : '')
                formik.setFieldValue('changeToRef', isValid ? newValue?.reference : '' )
                formik.setFieldValue('changeTdAmount', isValid && newValue?.tradeDiscount != 0 ? newValue?.tradeDiscount : null)

                if (!isValid) {
                  setTimeout(() => {
                    formik.setFieldValue('changeToRef', null)
                  }, 0)
                }
              }}
              errorCheck={'changeToId'}
            />
          </Grid>
        </Grid>
      </VertLayout>
    </FormShell>
  )
}

ChangeVendor.width = 520
ChangeVendor.height = 570
