import { Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { CashBankRepository } from 'src/repositories/CashBankRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { useForm } from 'src/hooks/form'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { DataSets } from 'src/resources/DataSets'
import { FinancialRepository } from 'src/repositories/FinancialRepository'

export default function CbBankAccountsForm({ labels, maxAccess, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const editMode = !!recordId

  const invalidate = useInvalidate({
    endpointId: CashBankRepository.CbBankAccounts.page
  })

  const { formik } = useForm({
    initialValues: {
      name: null,
      accountNo: null,
      currencyId: null,
      activeStatus: null,
      groupId: null,
      accountId: null,
      accountName: null,
      IBAN: null,
      bankId: null,
      type: 1,
      bankName: null
    },
    maxAccess: maxAccess,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      name: yup.string().required(' '),
      accountNo: yup.string().required(' '),
      currencyId: yup.string().required(' '),
      activeStatus: yup.string().required(' '),
      bankId: yup.string().required(' ')
    }),
    onSubmit: async obj => {
      const recordId = obj.recordId

      const response = await postRequest({
        extension: CashBankRepository.CbBankAccounts.set,
        record: JSON.stringify(obj)
      })
      if (!recordId) {
        toast.success('Record Added Successfully')
        formik.setValues({
          ...obj,
          recordId: response.recordId
        })
      } else toast.success('Record Edited Successfully')

      invalidate()
    }
  })
  useEffect(() => {
    ;(async function () {
      try {
        if (recordId) {
          const res = await getRequest({
            extension: CashBankRepository.CbBankAccounts.get,
            parameters: `_recordId=${recordId}&_type=1`
          })
          formik.setValues(res.record)
        }
      } catch (e) {}
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.CbBankAccounts} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <CustomTextField
            name='name'
            label={labels.name}
            value={formik.values.name}
            required
            maxAccess={maxAccess}
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('name', '')}
            error={formik.touched.name && Boolean(formik.errors.name)}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomNumberField
            name='accountNo'
            label={labels.accountNo}
            value={formik.values.accountNo}
            required
            maxAccess={maxAccess}
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('accountNo', '')}
            error={formik.touched.accountNo && Boolean(formik.errors.accountNo)}
          />
        </Grid>
        <Grid item xs={12}>
          <ResourceComboBox
            endpointId={SystemRepository.Currency.qry}
            name='currencyId'
            label={labels.currencyName}
            valueField='recordId'
            displayField={['name']}
            columnsInDropDown={[{ key: 'name', value: 'name' }]}
            values={formik.values}
            required
            maxAccess={maxAccess}
            onChange={(event, newValue) => {
              formik.setFieldValue('currencyId', newValue?.recordId || null)
            }}
            error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
          />
        </Grid>
        <Grid item xs={12}>
          <ResourceComboBox
            datasetId={DataSets.ACTIVE_STATUS}
            name='activeStatus'
            label={labels.activeStatus}
            valueField='key'
            displayField='value'
            values={formik.values}
            required
            maxAccess={maxAccess}
            onChange={(event, newValue) => {
              formik.setFieldValue('activeStatus', newValue?.key)
            }}
            error={formik.touched.activeStatus && Boolean(formik.errors.activeStatus)}
          />
        </Grid>
        <Grid item xs={12}>
          <ResourceComboBox
            endpointId={CashBankRepository.CbCashGroup.qry}
            name='groupId'
            label={labels.groupName}
            valueField='recordId'
            displayField='name'
            columnsInDropDown={[{ key: 'name', value: 'name' }]}
            values={formik.values}
            maxAccess={maxAccess}
            onChange={(event, newValue) => {
              if (newValue) {
                formik.setFieldValue('groupId', newValue?.recordId)
              } else {
                formik.setFieldValue('groupId', '')
              }
            }}
            error={formik.touched.groupId && Boolean(formik.errors.groupId)}
          />
        </Grid>
        <Grid item xs={12}>
          <ResourceLookup
            endpointId={FinancialRepository.Account.snapshot}
            valueField='recordId'
            displayField='name'
            name='reference'
            secondValueShow='name'
            label={labels.accountName}
            form={formik}
            firstValue={formik.values.accountRef}
            secondValue={formik.values.accountName}
            columnsInDropDown={[
              { key: 'reference', value: 'Reference' },
              { key: 'name', value: 'Name' }
            ]}
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
          <CustomNumberField
            name='IBAN'
            label={labels.IBAN}
            value={formik.values.IBAN}
            required
            maxAccess={maxAccess}
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('IBAN', '')}
            error={formik.touched.IBAN && Boolean(formik.errors.IBAN)}
          />
        </Grid>
        <Grid item xs={12}>
          <ResourceComboBox
            endpointId={CashBankRepository.CbBank.qry}
            name='bankId'
            label={labels.bankName}
            valueField='recordId'
            displayField='name'
            columnsInDropDown={[{ key: 'name', value: 'name' }]}
            values={formik.values}
            required
            maxAccess={maxAccess}
            onChange={(event, newValue) => {
              if (newValue) {
                formik.setFieldValue('bankId', newValue?.recordId), formik.setFieldValue('bankName', newValue?.name)
              } else {
                formik.setFieldValue('bankId', ''), formik.setFieldValue('bankName', '')
              }
            }}
            error={formik.touched.bankId && Boolean(formik.errors.bankId)}
          />
        </Grid>
      </Grid>
    </FormShell>
  )
}
