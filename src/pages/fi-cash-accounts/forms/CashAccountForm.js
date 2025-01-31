import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { CashBankRepository } from 'src/repositories/CashBankRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { DataSets } from 'src/resources/DataSets'
import { FinancialRepository } from 'src/repositories/FinancialRepository'
import { MasterSource } from 'src/resources/MasterSource'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'
import { useInvalidate } from 'src/hooks/resource'
import { ControlContext } from 'src/providers/ControlContext'

export default function CashAccountForm({ labels, recordId, maxAccess }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: CashBankRepository.CashAccount.qry
  })

  const { formik } = useForm({
    initialValues: {
      recordId: recordId || null,
      name: '',
      reference: '',
      accountNo: '',
      currencyId: null,
      plantId: null,
      activeStatus: null,
      groupId: null,
      accountName: '',
      accountRef: '',
      accountId: null,
      type: 2
    },
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      name: yup.string().required(' '),
      reference: yup.string().required(' '),
      activeStatus: yup.string().required(' ')
    }),
    onSubmit: async obj => {
      try {
        const recordId = obj.recordId
        obj.accountNo = obj.reference

        const response = await postRequest({
          extension: CashBankRepository.CashBox.set,
          record: JSON.stringify(obj)
        })

        if (!recordId) {
          toast.success(platformLabels.Added)
          formik.setValues({
            ...obj,
            recordId: response.recordId
          })
        } else toast.success(platformLabels.Edited)
        invalidate()
      } catch (error) {}
    }
  })
  const editMode = !!recordId || !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      try {
        if (recordId) {
          const res = await getRequest({
            extension: CashBankRepository.CashAccount.get,
            parameters: `_recordId=${recordId}`
          })

          formik.setValues(res.record)
        }
      } catch (exception) {}
    })()
  }, [])

  const actions = [
    {
      key: 'Integration Account',
      condition: true,
      onClick: 'onClickGIA',
      masterSource: MasterSource.CashAccount,
      disabled: !editMode
    },
    {
      key: 'RecordRemarks',
      condition: true,
      onClick: 'onRecordRemarks',
      disabled: !editMode
    },
    {
      key: 'RecordRemarks',
      condition: true,
      onClick: 'onRecordRemarks',
      disabled: !editMode
    }
  ]

  return (
    <FormShell
      resourceId={ResourceIds.CashAccounts}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      actions={actions}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <CustomTextField
                name='name'
                label={labels.name}
                value={formik.values.name}
                required
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('name', '')}
                maxLength='40'
                maxAccess={maxAccess}
                error={formik.touched.name && Boolean(formik.errors.name)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='reference'
                label={labels.reference}
                value={formik.values.reference}
                required
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('reference', '')}
                maxLength='10'
                maxAccess={maxAccess}
                error={formik.touched.reference && Boolean(formik.errors.reference)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.Currency.qry}
                name='currencyId'
                label={labels.currency}
                valueField='recordId'
                displayField='name'
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('currencyId', '')}
                onChange={(event, newValue) => {
                  formik && formik.setFieldValue('currencyId', newValue?.recordId)
                }}
                error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.Plant.qry}
                name='plantId'
                label={labels.plant}
                valueField='recordId'
                displayField='name'
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('plantId', '')}
                onChange={(event, newValue) => {
                  formik && formik.setFieldValue('plantId', newValue?.recordId)
                }}
                error={formik.touched.plantId && Boolean(formik.errors.plantId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.ACTIVE_STATUS}
                name='activeStatus'
                label={labels.activeStatus}
                required
                valueField='key'
                displayField='value'
                values={formik.values}
                onClear={() => formik.setFieldValue('activeStatus', '')}
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
                label={labels.groupId}
                valueField='recordId'
                displayField='name'
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('groupId', '')}
                onChange={(event, newValue) => {
                  formik && formik.setFieldValue('groupId', newValue?.recordId)
                }}
                error={formik.touched.groupId && Boolean(formik.errors.groupId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={FinancialRepository.Account.snapshot}
                valueField='reference'
                displayField='name'
                name='accountRef'
                label={labels.account}
                form={formik}
                secondDisplayField={true}
                firstValue={formik.values.accountRef}
                secondValue={formik.values.accountName}
                errorCheck={'accountId'}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('accountId', newValue?.recordId || '')
                  formik.setFieldValue('accountRef', newValue?.reference || '')
                  formik.setFieldValue('accountName', newValue?.name || '')
                }}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
