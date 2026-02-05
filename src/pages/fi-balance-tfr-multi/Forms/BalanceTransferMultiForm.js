import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { SystemFunction } from 'src/resources/SystemFunction'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'
import { FinancialRepository } from 'src/repositories/FinancialRepository'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { SaleRepository } from 'src/repositories/SaleRepository'
import AccountSummary from 'src/components/Shared/AccountSummary'
import { useWindow } from 'src/windows'

export default function BalanceTransferMultiForm({ labels, access, recordId, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels, userDefaultsData } = useContext(ControlContext)
  const { stack } = useWindow()

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.BalanceTransferMultiAccount,
    access,
    enabled: !recordId,
    objectName: 'header'
  })

  const invalidate = useInvalidate({
    endpointId: FinancialRepository.BalanceTransferMultiAccounts.page
  })

  const plantId = parseInt(userDefaultsData?.list?.find(obj => obj.key === 'plantId')?.value)
  const spId = parseInt(userDefaultsData?.list?.find(obj => obj.key === 'spId')?.value)

  const { formik } = useForm({
    maxAccess,
    documentType: { key: 'header.dtId', value: documentType?.dtId },
    initialValues: {
      recordId,
      header: {
        recordId: null,
        reference: '',
        dtId: null,
        accountId: null,
        currencyId: null,
        amount: null,
        exRate: 1,
        rateCalcMethod: 1,
        baseAmount: 0,
        plantId,
        spId,
        notes: '',
        date: new Date(),
        status: 1
      },
      rows: [
        {
          id: 1,
          transferId: recordId,
          baseAmount: 0,
          amount: 0,
          notes: '',
          seqNo: 1,
          accountId: null
        }
      ]
    },
    validateOnChange: true,
    validationSchema: yup.object({
      header: yup.object({
        plantId: yup.number().required(),
        accountId: yup.string().required(),
        currencyId: yup.number().required(),
        date: yup.date().required(),
        amount: yup.number().required()
      }),
      rows: yup
        .array()
        .of(
          yup.object().shape({
            accountRef: yup.string().required()
          })
        )
        .required()
    }),
    onSubmit: async obj => {
      const data = {
        header: {
          ...obj.header,
          date: formatDateToApi(obj.header.date)
        },
        list: formik.values.rows.map((details, index) => {
          return {
            ...details,
            acoId: obj.recordId ?? 0,
            seqNo: index + 1
          }
        })
      }

      const res = await postRequest({
        extension: FinancialRepository.BalanceTransferMultiAccounts.set2,
        record: JSON.stringify(data)
      })

      toast.success(!obj.recordId ? platformLabels.Added : platformLabels.Edited)
      invalidate()
      refetchForm(res?.recordId)
    }
  })

  const editMode = !!formik.values.recordId
  const isPosted = formik.values.header.status === 3

  async function onPost() {
    await postRequest({
      extension: FinancialRepository.BalanceTransferMultiAccounts.post,
      record: JSON.stringify({
        ...formik.values.header,
        date: formatDateToApi(formik.values.header.date)
      })
    })

    toast.success(platformLabels.Posted)
    window.close()
    invalidate()
  }

  async function onValidationRequired() {
    const errors = await formik.validateForm()

    if (errors.header && Object.keys(errors.header).length) {
      const touchedFields = {
        header: { ...formik.touched.header }
      }

      Object.keys(errors.header).forEach(key => {
        if (!formik.touched.header || !formik.touched.header[key]) {
          touchedFields.header[key] = true
        }
      })

      formik.setTouched(touchedFields, true)
    }
  }

  async function getDTD(dtId) {
    if (dtId) {
      const { record } = await getRequest({
        extension: FinancialRepository.FIDocTypeDefaults.get,
        parameters: `_dtId=${dtId}`
      })
      formik.setFieldValue('header.plantId', record?.plantId || plantId)
      formik.setFieldValue('header.spId', record?.spId || spId)
    }
  }

  useEffect(() => {
    if (formik.values.header.dtId && !recordId) getDTD(formik?.values?.header?.dtId)
  }, [formik.values.header.dtId])

  const columns = [
    {
      component: 'resourcelookup',
      label: labels.toAccount,
      name: 'accountRef',
      props: {
        endpointId: FinancialRepository.Account.snapshot,
        valueField: 'recordId',
        displayField: 'reference',
        displayFieldWidth: 2,
        mapping: [
          { from: 'name', to: 'accountName' },
          { from: 'reference', to: 'accountRef' },
          { from: 'groupName', to: 'fromGroup' },
          { from: 'recordId', to: 'accountId' }
        ],
        columnsInDropDown: [
          { key: 'reference', value: 'Reference' },
          { key: 'name', value: 'Name' }
        ]
      }
    },
    {
      component: 'textfield',
      label: labels.accountName,
      name: 'accountName',
      props: { readOnly: true }
    },
    {
      component: 'textfield',
      label: labels.group,
      name: 'fromGroup',
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      name: 'amount',
      label: labels.amount,
      props: {
        maxLength: 15,
        decimalScale: 2
      }
    },
    {
      component: 'textfield',
      label: labels.notes,
      name: 'notes'
    }
  ]

  const onUnpost = async () => {
    const res = await postRequest({
      extension: FinancialRepository.BalanceTransferMultiAccounts.unpost,
      record: JSON.stringify(formik.values.header)
    })
    toast.success(platformLabels.Unposted)
    invalidate()
    refetchForm(res?.recordId)
  }

  async function refetchForm(recordId) {
    const res = await getRequest({
      extension: FinancialRepository.BalanceTransferMultiAccounts.get2,
      parameters: `_recordId=${recordId}`
    })

    const modifiedList =
      res.record.list.length > 0
        ? res.record.list.map((item, index) => ({
            ...item,
            fromGroup: item.accountGroupName,
            id: index + 1
          }))
        : formik.values.rows

    formik.setValues({
      recordId: res?.record?.header?.recordId,
      header: {
        ...res?.record?.header,
        fromGroup: res?.record?.header?.accountGroupName,
        date: formatDateFromApi(res?.record?.header?.date)
      },
      rows: modifiedList
    })

    return res?.record
  }

  useEffect(() => {
    if (recordId) refetchForm(recordId)
  }, [])

  const actions = [
    {
      key: 'GL',
      condition: true,
      onClick: 'onClickGL',
      valuesPath: formik.values.header,
      datasetId: ResourceIds.GLBalanceTransferMultiAccounts,
      disabled: !editMode
    },
    {
      key: 'FI Trx',
      condition: true,
      onClick: 'onClickIT',
      disabled: !editMode
    },
    {
      key: 'Locked',
      condition: isPosted,
      onClick: 'onUnpostConfirmation',
      onSuccess: onUnpost,
      disabled: !editMode
    },
    {
      key: 'Unlocked',
      condition: !isPosted,
      onClick: onPost,
      disabled: !editMode
    },
    {
      key: 'AccountSummary',
      condition: true,
      onClick: () => {
        stack({
          Component: AccountSummary,
          props: {
            accountId: parseInt(formik.values.header.accountId),
            moduleId: 1,
            date: formik.values.header.date
          }
        })
      },
      disabled: !formik.values.header.accountId
    }
  ]

  const totalAmount = formik.values?.rows?.reduce((amount, row) => {
    const amountValue = parseFloat(row.amount?.toString().replace(/,/g, '')) || 0

    return amount + amountValue
  }, 0)

  return (
    <FormShell
      resourceId={ResourceIds.BalanceTransferMultiAccounts}
      functionId={SystemFunction.BalanceTransferMultiAccount}
      form={formik}
      maxAccess={maxAccess}
      actions={actions}
      editMode={editMode}
      previewReport={editMode}
      disabledSubmit={isPosted}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <ResourceComboBox
                endpointId={SystemRepository.DocumentType.qry}
                parameters={`_startAt=0&_pageSize=1000&_dgId=${SystemFunction.BalanceTransferMultiAccount}`}
                name='header.dtId'
                label={labels.documentType}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                readOnly={editMode}
                valueField='recordId'
                displayField={['reference', 'name']}
                values={formik.values.header}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('header.dtId', newValue?.recordId || null)
                  changeDT(newValue)
                }}
                error={formik.touched.header?.dtId && Boolean(formik.errors.header?.dtId)}
              />
            </Grid>
            <Grid item xs={6}>
              <ResourceComboBox
                endpointId={SystemRepository.Plant.qry}
                name='header.plantId'
                label={labels.plant}
                readOnly={isPosted}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values.header}
                required
                valueField='recordId'
                displayField={['reference', 'name']}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('header.plantId', newValue?.recordId || null)
                }}
                error={formik?.touched?.header?.plantId && Boolean(formik?.errors?.header?.plantId)}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomTextField
                name='header.reference'
                label={labels.reference}
                value={formik?.values?.header?.reference}
                maxAccess={!editMode && maxAccess}
                maxLength='30'
                readOnly={editMode}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('header.reference', '')}
                error={formik.touched.header?.reference && Boolean(formik.errors.header?.reference)}
              />
            </Grid>
            <Grid item xs={6}>
              <ResourceComboBox
                endpointId={SaleRepository.SalesPerson.qry}
                name='header.spId'
                label={labels.salesPerson}
                filter={item => item.plantId === formik.values.header.plantId}
                readOnly={!formik.values.header.plantId || isPosted}
                valueField='recordId'
                columnsInDropDown={[
                  { key: 'spRef', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                displayField={['spRef', 'name']}
                values={formik.values.header}
                onChange={(event, newValue) => {
                  formik.setFieldValue('header.spId', newValue?.recordId || null)
                }}
                error={formik?.touched?.header?.spId && Boolean(formik?.errors?.header?.spId)}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomDatePicker
                name='header.date'
                label={labels.date}
                readOnly={isPosted}
                value={formik?.values?.header.date}
                onChange={formik.setFieldValue}
                required
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('header.date', null)}
                error={formik?.touched?.header?.date && Boolean(formik?.errors?.header?.date)}
              />
            </Grid>
            <Grid item xs={6}></Grid>
            <Grid item xs={6}>
              <ResourceLookup
                endpointId={FinancialRepository.Account.snapshot}
                name='header.accountId'
                label={labels.accountName}
                valueField='reference'
                displayField='name'
                valueShow='accountRef'
                secondValueShow='accountName'
                formObject={formik.values.header}
                form={formik}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                onChange={(event, newValue) => {
                  formik.setFieldValue('header.accountRef', newValue?.reference || '')
                  formik.setFieldValue('header.accountName', newValue?.name || '')
                  formik.setFieldValue('header.fromGroup', newValue?.groupName || '')
                  formik.setFieldValue('header.accountId', newValue?.recordId || null)
                }}
                errorCheck={'header.accountId'}
                secondFieldName={'header.accountName'}
                maxAccess={maxAccess}
                required
                readOnly={isPosted}
                displayFieldWidth={3}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomTextField
                name='header.fromGroup'
                value={formik?.values?.header?.fromGroup}
                label={labels.fromGroup}
                readOnly
              />
            </Grid>
            <Grid item xs={6}>
              <ResourceComboBox
                endpointId={SystemRepository.Currency.qry}
                name='header.currencyId'
                label={labels.currency}
                valueField='recordId'
                readOnly={editMode}
                required
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values.header}
                maxAccess={maxAccess}
                onChange={(_, newValue) => {
                  formik.setFieldValue('header.currencyId', newValue?.recordId || null)
                }}
                error={formik?.touched?.header?.currencyId && Boolean(formik?.errors?.header?.currencyId)}
              />
            </Grid>
            <Grid item xs={6}></Grid>
            <Grid item xs={6}>
              <CustomNumberField
                name='header.amount'
                required
                label={labels.amount}
                value={formik?.values?.header?.amount}
                maxAccess={maxAccess}
                readOnly={isPosted}
                onChange={e => formik.setFieldValue('header.amount', e.target.value)}
                onClear={() => formik.setFieldValue('header.amount', '')}
                error={formik?.touched?.header?.amount && Boolean(formik?.errors?.header?.amount)}
                maxLength={15}
                decimalScale={2}
              />
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('rows', value)}
            value={formik.values.rows}
            error={formik.errors.rows}
            name='rows'
            maxAccess={maxAccess}
            columns={columns}
            allowAddNewLine={!isPosted}
            allowDelete={!isPosted}
            disabled={isPosted || Object.entries(formik?.errors || {}).filter(([key]) => key !== 'rows').length > 0}
            onValidationRequired={onValidationRequired}
          />
        </Grow>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <ResourceComboBox
                endpointId={FinancialRepository.DescriptionTemplate.qry}
                name='header.templateId'
                label={labels.descriptionTemplate}
                readOnly={isPosted}
                valueField='recordId'
                displayField='name'
                values={formik.values.header}
                onChange={(_, newValue) => {
                  let notes = formik.values.header.notes
                  notes += newValue?.name && formik.values.header.notes && '\n'
                  notes += newValue?.name

                  notes && formik.setFieldValue('header.notes', notes)
                }}
                error={formik?.touched?.header?.templateId && Boolean(formik?.errors?.header?.templateId)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomTextField
                name='header.totalAmount'
                label={labels.totalAmount}
                value={totalAmount.toFixed(2)}
                maxAccess={maxAccess}
                readOnly
              />
            </Grid>
            <Grid item xs={6}>
              <CustomTextArea
                name='header.notes'
                label={labels.notes}
                value={formik?.values?.header?.notes}
                readOnly={isPosted}
                rows={3}
                maxAccess={maxAccess}
                onChange={e => formik.setFieldValue('header.notes', e.target.value)}
                onClear={() => formik.setFieldValue('header.notes', '')}
                error={formik?.touched?.header?.notes && Boolean(formik?.errors?.header?.notes)}
              />
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}
