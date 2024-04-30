// ** MUI Imports
import { Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { useFormik } from 'formik'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'

import { FinancialRepository } from 'src/repositories/FinancialRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { useForm } from 'src/hooks/form'

export default function FiOpeningBalancesForms({ labels, maxAccess, recordId }) {
  const [isLoading, setIsLoading] = useState(false)
  const [editMode, setEditMode] = useState(!!recordId)

  const [initialValues, setInitialData] = useState({
    recordId: null,
    accountId: null,
    fiscalYear: null,
    amount: null,
    baseAmount: null,
    currencyId: null,
    plantId: null
  })

  const { getRequest, postRequest } = useContext(RequestsContext)

  //const editMode = !!recordId

  const invalidate = useInvalidate({
    endpointId: FinancialRepository.FiOpeningBalance.qry
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      accountId: null,
      fiscalYear: null,
      amount: null,
      baseAmount: null,
      currencyId: null,
      plantId: null
    },
    maxAccess: maxAccess,

    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      fiscalYear: yup.string().required(' '),
      accountId: yup.string().required(' '),
      currencyId: yup.string().required(' '),
      amount: yup.string().required(' '),
      baseAmount: yup.string().required(' ')
    }),
    onSubmit: async obj => {
      const recordId = obj.recordId

      const response = await postRequest({
        extension: FinancialRepository.FiOpeningBalance.set,
        record: JSON.stringify(obj)
      })

      if (!recordId) {
        toast.success('Record Added Successfully')
        setInitialData({
          ...obj, // Spread the existing properties
          recordId: response.recordId // Update only the recordId field
        })
      } else toast.success('Record Edited Successfully')
      setEditMode(true)

      invalidate()
    }
  })

  useEffect(() => {
    ;(async function () {
      try {
        if (recordId) {
          setIsLoading(true)

          const res = await getRequest({
            extension: FinancialRepository.FiOpeningBalance.get,
            parameters: `_recordId=${recordId}`
          })

          setInitialData(res.record)
        }
      } catch (exception) {
        setErrorMessage(error)
      }
      setIsLoading(false)
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.FiOpeningBalances} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <ResourceComboBox
            endpointId={SystemRepository.FiscalYears.qry}
            name='fiscalYear'
            label={labels.fiscalYear}
            valueField='fiscalYear'
            displayField='fiscalYear'
            values={formik.values}
            required
            readOnly={editMode}
            maxAccess={maxAccess}
            onChange={(event, newValue) => {
              formik.setFieldValue('fiscalYear', newValue?.fiscalYear)
            }}
            error={formik.touched.fiscalYear && Boolean(formik.errors.fiscalYear)}
          />
        </Grid>

        <Grid item xs={12}>
          <ResourceLookup
            endpointId={FinancialRepository.Account.snapshot}
            parameters={{
              _countryId: formik.values.accountId,
              _stateId: 0
            }}
            valueField='recordId'
            displayField='name'
            name='reference'
            label={labels.accountName}
            required
            readOnly={editMode}
            form={formik}
            secondDisplayField={true}
            firstValue={formik.values.accountRef}
            secondValue={formik.values.accountName}
            onChange={(event, newValue) => {
              if (newValue) {
                formik.setFieldValue('accountId', newValue?.recordId)
                formik.setFieldValue('accountRef', newValue?.reference)
                formik.setFieldValue('accountName', newValue?.name)
              } else {
                formik.setFieldValue('accountId', '')
                formik.setFieldValue('accountRef', null)
                formik.setFieldValue('accountName', null)
              }
            }}
            errorCheck={'accountId'}
            maxAccess={maxAccess}
          />
        </Grid>

        <Grid item xs={12}>
          <ResourceComboBox
            endpointId={SystemRepository.Currency.qry}
            name='currencyId'
            label={labels.currencyName}
            valueField='currencyId'
            displayField='name'
            columnsInDropDown={[
              { key: 'reference', value: 'Reference' },
              { key: 'name', value: 'Name' }
            ]}
            values={formik.values}
            required
            readOnly={editMode}
            maxAccess={maxAccess}
            onChange={(event, newValue) => {
              formik.setFieldValue('currencyId', newValue?.currencyId)
            }}
            error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
          />
        </Grid>

        <Grid item xs={12}>
          <ResourceComboBox
            endpointId={SystemRepository.Plant.qry}
            name='plantId'
            label={labels.plant}
            valueField='plantId'
            displayField='name'
            columnsInDropDown={[
              { key: 'reference', value: 'Reference' },
              { key: 'name', value: 'Name' }
            ]}
            values={formik.values}
            maxAccess={maxAccess}
            onChange={(event, newValue) => {
              formik.setFieldValue('plantId', newValue?.plantId)
            }}
            error={formik.touched.plantId && Boolean(formik.errors.plantId)}
          />
        </Grid>

        <Grid item xs={12}>
          <CustomTextField
            name='amount'
            label={labels.amount}
            value={formik.values.amount}
            required
            maxLength='15'
            maxAccess={maxAccess}
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('amount', '')}
            type='number'
            error={formik.touched.amount && Boolean(formik.errors.amount)}
          />
        </Grid>

        <Grid item xs={12}>
          <CustomTextField
            name='baseAmount'
            label={labels.baseAmount}
            value={formik.values.baseAmount}
            required
            maxLength='15'
            maxAccess={maxAccess}
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('baseAmount', '')}
            type='number'
            error={formik.touched.baseAmount && Boolean(formik.errors.baseAmount)}
          />
        </Grid>
      </Grid>
    </FormShell>
  )
}
