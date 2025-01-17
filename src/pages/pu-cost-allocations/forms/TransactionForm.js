import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import { SystemRepository } from 'src/repositories/SystemRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { useForm } from 'src/hooks/form'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { ControlContext } from 'src/providers/ControlContext'
import { CostAllocationRepository } from 'src/repositories/CostAllocationRepository'
import { DataSets } from 'src/resources/DataSets'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { FinancialRepository } from 'src/repositories/FinancialRepository'
import { useInvalidate } from 'src/hooks/resource'

export default function TransactionForm({ labels, maxAccess, recordId, seqNo, caId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: CostAllocationRepository.TrxCostType.qry
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      costTypeId: null,
      caId: caId,
      currencyId: null,
      accountId: null,
      functionId: null,
      baseAmount: 0.0,
      reference: '',
      seqNo: seqNo || null,
      amount: 0.0
    },
    enableReinitialize: false,
    validateOnChange: false,
    validationSchema: yup.object({
      baseAmount: yup.number().required(),
      costTypeId: yup.number().required(),
      reference: yup.string().test('is-reference-required', 'reference is required', function (value) {
        if (formik.values.functionId) {
          return !!value
        }

        return true
      })
    }),
    onSubmit: async obj => {
      await postRequest({
        extension: CostAllocationRepository.TrxCostType.set,
        record: JSON.stringify(obj)
      }).then(res => {
        if (!obj.recordId) {
          toast.success(platformLabels.Added)
          formik.setFieldValue('recordId', res.recordId)
        } else {
          toast.success(platformLabels.Edited)
        }
        invalidate()
      })
    }
  })
  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: CostAllocationRepository.TrxCostType.get,
          parameters: `_caId=${recordId}&_seqNo=${seqNo}`
        })

        formik.setValues(res.record)
      }
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.PuCostAllocation} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={6}>
              <ResourceComboBox
                endpointId={CostAllocationRepository.CACostTypes.qry}
                name='costTypeId'
                label={labels.costType}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'plant Ref' },
                  { key: 'name', value: 'Name' }
                ]}
                required
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('costTypeId', newValue?.recordId || '')
                }}
                error={formik.touched.costTypeId && Boolean(formik.errors.costTypeId)}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomNumberField
                name='baseAmount'
                type='text'
                label={labels.baseAmount}
                value={formik.values.baseAmount}
                required
                readOnly={formik.values.functionId}
                maxAccess={maxAccess}
                onChange={e => formik.setFieldValue('baseAmount', e.target.value)}
                onClear={() => formik.setFieldValue('baseAmount', '')}
                error={formik.touched.baseAmount && Boolean(formik.errors.baseAmount)}
                maxLength={10}
              />
            </Grid>
            <Grid item xs={6}>
              <ResourceComboBox
                datasetId={DataSets.CA_FNCTN}
                name='functionId'
                label={labels.function}
                valueField='key'
                displayField='value'
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  newValue
                    ? formik.setFieldValue('functionId', newValue?.key)
                    : formik.setValues({
                        ...formik.values,
                        reference: '',
                        currencyId: null,
                        baseAmount: '',
                        amount: '',
                        accountId: null,
                        accountName: '',
                        accountRef: '',
                        functionId: ''
                      })
                }}
                error={formik.touched.functionId && Boolean(formik.errors.functionId)}
              />
            </Grid>
            <Grid item xs={6}>
              <ResourceComboBox
                endpointId={SystemRepository.Currency.qry}
                name='currencyId'
                label={labels.currency}
                valueField='recordId'
                displayField={['reference', 'name']}
                readOnly
                values={formik.values}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={6}>
              <ResourceLookup
                endpointId={FinancialRepository.AgingDoc.snapshot}
                parameters={{
                  _functionId: formik.values.functionId
                }}
                readOnly={!formik.values.functionId}
                required={formik.values.functionId}
                valueField='reference'
                displayField='reference'
                name='reference'
                label={labels.reference}
                form={formik}
                secondDisplayField={false}
                onChange={(event, newValue) => {
                  formik.setValues({
                    ...formik.values,
                    accountId: newValue?.accountId || null,
                    accountName: newValue?.accountName || '',
                    accountRef: newValue?.accountRef || '',
                    reference: newValue?.reference || '',
                    currencyId: newValue?.currencyId || null,
                    baseAmount: newValue?.baseAmount || null,
                    amount: newValue?.amount || null
                  })
                }}
                error={formik.touched.reference && Boolean(formik.errors.reference)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomNumberField
                name='amount'
                label={labels.amount}
                value={formik.values.amount}
                maxAccess={maxAccess}
                readOnly
                maxLength={10}
                decimalScale={2}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={FinancialRepository.Account.snapshot}
                name='accountId'
                label={labels.accountRef}
                valueField='reference'
                displayField='name'
                valueShow='accountRef'
                secondValueShow='accountName'
                readOnly={editMode}
                form={formik}
                onChange={(event, newValue) => {
                  formik.setFieldValue('accountId', newValue?.recordId || '')
                  formik.setFieldValue('accountRef', newValue?.reference || '')
                  formik.setFieldValue('accountName', newValue?.name || '')
                }}
                error={formik.touched.accountId && Boolean(formik.errors.accountId)}
                maxAccess={maxAccess}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
