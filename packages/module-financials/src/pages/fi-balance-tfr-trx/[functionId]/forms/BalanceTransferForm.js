import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { FinancialRepository } from '@argus/repositories/src/repositories/FinancialRepository'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { SaleRepository } from '@argus/repositories/src/repositories/SaleRepository'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import CustomTextArea from '@argus/shared-ui/src/components/Inputs/CustomTextArea'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import { formatDateForGetApI, formatDateFromApi, formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'
import { MultiCurrencyRepository } from '@argus/repositories/src/repositories/MultiCurrencyRepository'
import { RateDivision } from '@argus/shared-domain/src/resources/RateDivision'
import { DIRTYFIELD_RATE, getRate } from '@argus/shared-utils/src/utils/RateCalculator'
import { useDocumentType } from '@argus/shared-hooks/src/hooks/documentReferenceBehaviors'
import AccountSummary from '@argus/shared-ui/src/components/Shared/AccountSummary'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'

export default function BalanceTransferForm({
  labels,
  access,
  recordId,
  functionId,
  resourceId,
  getGLResourceId,
  window
}) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels, defaultsData, userDefaultsData } = useContext(ControlContext)
  const { stack } = useWindow()

  const invalidate = useInvalidate({
    endpointId: FinancialRepository.BalanceTransfer.page
  })

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId,
    access,
    enabled: !recordId
  })

  const defaultCurrency = defaultsData?.list?.find(({ key }) => key === 'baseCurrencyId')?.value
  const defaultPlant = userDefaultsData?.list?.find(({ key }) => key === 'plantId')?.value

  const { formik } = useForm({
    documentType: { key: 'dtId', value: documentType?.dtId, reference: documentType?.reference },
    initialValues: {
      recordId,
      dtId: null,
      reference: '',
      date: new Date(),
      plantId: parseInt(defaultPlant),
      spId: null,
      fromAccountId: null,
      fromCurrencyId: null,
      toCurrencyId: parseInt(defaultCurrency),
      fromBaseAmount: null,
      fromAmount: null,
      fromExRate: null,
      status: 1,
      notes: '',
      toAmount: null,
      toExRate: null,
      toBaseAmount: null,
      fromRateCalcMethod: null,
      toRateCalcMethod: null,
      functionId
    },
    maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      date: yup.date().required(),
      fromAccountId: yup.number().required(),
      fromCurrencyId: yup.number().required(),
      fromAmount: yup.number().required(),
      fromBaseAmount: yup.number().required(),
      fromExRate: yup.number().required()
    }),
    onSubmit: async obj => {
      const { fromAccountName, fromAccountRef, templateId, ...rest } = obj

      const response = await postRequest({
        extension:
          resourceId === ResourceIds.BalanceTransferPurchase
            ? FinancialRepository.BalanceTransferPurchases.set
            : FinancialRepository.BalanceTransferSales.set,
        record: JSON.stringify({ ...rest, date: formatDateToApi(rest.date), toAccountId: rest.fromAccountId })
      })

      toast.success(!rest.recordId ? platformLabels.Added : platformLabels.Edited)

      refetchForm(response.recordId)
      invalidate()
    }
  })

  const editMode = !!formik.values.recordId
  const isPosted = formik.values.status === 3

  const refetchForm = async recordId => {
    const { record } = await getRequest({
      extension: FinancialRepository.BalanceTransfer.get,
      parameters: `_recordId=${recordId}`
    })

    const updatedRateRow = getRate({
      amount: record.fromAmount,
      exRate: record?.fromExRate,
      baseAmount: record?.fromBaseAmount,
      rateCalcMethod: record?.fromRateCalcMethod,
      dirtyField: DIRTYFIELD_RATE
    })
    formik.setValues({ ...record, date: formatDateFromApi(record.date), fromAmount: updatedRateRow.amount })
  }

  useEffect(() => {
    if (recordId) {
      refetchForm(recordId)
    } else onSelectionChange('to', defaultCurrency, formik.values?.date)
  }, [])

  const { fromAccountName, fromAccountRef, templateId, ...rest } = formik.values

  const onPost = async () => {
    await postRequest({
      extension: FinancialRepository.BalanceTransfer.post,
      record: JSON.stringify({ ...rest, date: formatDateToApi(rest.date) })
    })

    toast.success(platformLabels.Posted)
    invalidate()
    window.close()
  }

  const onUnpost = async () => {
    await postRequest({
      extension: FinancialRepository.BalanceTransfer.unpost,
      record: JSON.stringify({ ...rest, date: formatDateToApi(rest.date), toAccountId: rest.fromAccountId })
    })

    toast.success(platformLabels.Unposted)
    refetchForm(recordId)
    invalidate()
  }

  async function getRates(currencyId, date) {
    if (currencyId && date) {
      const { record } = await getRequest({
        extension: MultiCurrencyRepository.Currency.get,
        parameters: `_currencyId=${currencyId}&_date=${formatDateForGetApI(date)}&_rateDivision=${
          RateDivision.FINANCIALS
        }`
      })

      return record
    }
  }

  const onSelectionChange = async (type, currencyId, date, amount) => {
    const rate = await getRates(currencyId, date)

    formik.setFieldValue(`${type}ExRate`, rate?.exRate ? rate?.exRate?.toFixed(2) : '')
    formik.setFieldValue(`${type}RateCalcMethod`, rate?.rateCalcMethod)

    const updatedRateRow = getRate({
      amount: amount || 0,
      exRate: rate?.exRate.toFixed(2),
      baseAmount: 0,
      rateCalcMethod: rate?.rateCalcMethod,
      dirtyField: DIRTYFIELD_RATE
    })

    formik.setFieldValue(`${type}BaseAmount`, parseFloat(updatedRateRow?.baseAmount).toFixed(2))
    formik.setFieldValue(`${type}Amount`, parseFloat(updatedRateRow?.amount).toFixed(2))
  }

  const actions = [
    {
      key: 'GL',
      condition: true,
      onClick: 'onClickGL',
      datasetId: getGLResourceId(functionId),
      disabled: !editMode
    },
    {
      key: 'Unlocked',
      condition: !isPosted,
      onClick: onPost,
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
      key: 'AccountSummary',
      condition: true,
      onClick: () => {
        stack({
          Component: AccountSummary,
          props: {
            accountId: parseInt(formik.values.fromAccountId),
            date: formik.values.date
          }
        })
      },
      disabled: !formik.values.fromAccountId
    }
  ]

  const onChangeValue = (exRate, amount) => {
    const updatedRateRow = getRate({
      amount: amount ?? 0,
      exRate,
      baseAmount: 0,
      rateCalcMethod: formik.values?.fromRateCalcMethod,
      dirtyField: DIRTYFIELD_RATE
    })

    formik.setFieldValue('fromBaseAmount', parseFloat(updatedRateRow?.baseAmount).toFixed(2) || 0)

    const updatedRateRowTo = getRate({
      amount: updatedRateRow?.baseAmount || 0,
      exRate: formik.values?.toExRate,
      baseAmount: formik.values?.toBaseAmount,
      rateCalcMethod: formik.values?.toRateCalcMethod,
      dirtyField: DIRTYFIELD_RATE
    })

    formik.setFieldValue('toAmount', parseFloat(updatedRateRowTo?.amount).toFixed(2) || 0)
    formik.setFieldValue('toBaseAmount', parseFloat(updatedRateRowTo?.baseAmount).toFixed(2) || 0)
  }

  return (
    <FormShell
      resourceId={resourceId}
      functionId={functionId}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      actions={actions}
      disabledSubmit={isPosted}
      previewReport={editMode}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SystemRepository.DocumentType.qry}
                    parameters={`_startAt=0&_pageSize=1000&_dgId=${functionId}`}
                    name='dtId'
                    label={labels.docType}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    readOnly={editMode}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    values={formik.values}
                    maxAccess={!editMode && maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('dtId', newValue?.recordId)
                      changeDT(newValue)
                    }}
                    error={formik.touched.dtId && Boolean(formik.errors.dtId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='reference'
                    label={labels.reference}
                    value={formik.values.reference}
                    readOnly={editMode}
                    maxLength='10'
                    maxAccess={!editMode && maxAccess}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('reference', '')}
                    error={formik.touched.reference && Boolean(formik.errors.reference)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomDatePicker
                    name='date'
                    label={labels.date}
                    value={formik.values?.date}
                    required
                    onChange={(name, newValue) => {
                      formik.setFieldValue('date', newValue || null)
                      onSelectionChange('to', formik.values.toCurrencyId, newValue, formik.values.amount)
                      onSelectionChange('from', formik.values.fromCurrencyId, newValue, formik.values.amount)
                    }}
                    readOnly={isPosted}
                    onClear={() => formik.setFieldValue('date', null)}
                    error={formik.touched.date && Boolean(formik.errors.date)}
                    maxAccess={maxAccess}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SystemRepository.Plant.qry}
                    name='plantId'
                    label={platformLabels.plant}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    columnsInDropDown={[
                      { key: 'reference', value: 'plant Ref' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik.values}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('plantId', newValue?.recordId || null)
                      !newValue?.recordId && formik.setFieldValue('spId', null)
                    }}
                    readOnly={isPosted}
                    error={formik.touched.plantId && Boolean(formik.errors.plantId)}
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SaleRepository.SalesPerson.qry}
                    filter={item => item.plantId === formik.values.plantId}
                    name='spId'
                    label={labels.salesPerson}
                    columnsInDropDown={[
                      { key: 'spRef', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    valueField='recordId'
                    displayField='name'
                    values={formik.values}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('spId', newValue?.recordId || null)
                    }}
                    readOnly={isPosted || !formik.values.plantId}
                    error={formik.touched.spId && Boolean(formik.errors.spId)}
                    maxAccess={maxAccess}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={FinancialRepository.Account.snapshot}
                name='fromAccountId'
                filter={{ isInactive: val => val !== true }}
                required
                label={labels.account}
                valueField='reference'
                displayField='name'
                valueShow='fromAccountRef'
                secondValueShow='fromAccountName'
                displayFieldWidth={2}
                form={formik}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' },
                  { key: 'keywords', value: 'keywords' },
                  { key: 'groupName', value: 'account Group' }
                ]}
                onChange={(event, newValue) => {
                  formik.setValues({
                    ...formik.values,
                    fromAccountId: newValue?.recordId || null,
                    fromAccountRef: newValue?.reference || '',
                    fromAccountName: newValue?.name || ''
                  })
                }}
                readOnly={isPosted}
                errorCheck='fromAccountId'
                maxAccess={maxAccess}
              />
            </Grid>

            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SystemRepository.Currency.qry}
                    filter={item => item.currencyType === 2}
                    name='fromCurrencyId'
                    label={labels.fromCurrency}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Currency Ref' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik.values}
                    required
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('fromCurrencyId', newValue?.recordId || null)
                      onSelectionChange('from', newValue?.recordId, formik.values?.date, formik.values.fromAmount)
                    }}
                    readOnly={isPosted}
                    error={formik.touched.fromCurrencyId && Boolean(formik.errors.fromCurrencyId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SystemRepository.Currency.qry}
                    filter={item => item.currencyType === 1}
                    name='toCurrencyId'
                    label={labels.toCurrency}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Currency Ref' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik.values}
                    maxAccess={maxAccess}
                    readOnly
                    error={formik.touched.toCurrencyId && Boolean(formik.errors.toCurrencyId)}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='fromAmount'
                    label={labels.amount}
                    value={formik.values.fromAmount}
                    maxLength={15}
                    decimalScale={2}
                    onChange={e => {
                      formik.handleChange(e)
                      onChangeValue(formik.values?.fromExRate, e.target.value)
                    }}
                    onClear={() => formik.setFieldValue('fromAmount', '')}
                    required
                    readOnly={isPosted}
                    error={formik.touched.fromAmount && Boolean(formik.errors.fromAmount)}
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='fromBaseAmount'
                    label={labels.baseAmount}
                    value={formik.values.fromBaseAmount}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('fromBaseAmount', null)}
                    readOnly
                    required
                    error={formik.touched.fromBaseAmount && Boolean(formik.errors.fromBaseAmount)}
                    maxAccess={maxAccess}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={6}>
              <CustomNumberField
                name='fromExRate'
                label={labels.rate}
                value={formik.values.fromExRate}
                maxLength={14}
                decimalScale={2}
                onChange={e => {
                  formik.setFieldValue('fromExRate', e.target.value || null)

                  onChangeValue(e.target.value, formik.values.fromAmount)
                }}
                readOnly={isPosted}
                onClear={() => formik.setFieldValue('fromExRate', '')}
                required
                error={formik.touched.fromExRate && Boolean(formik.errors.fromExRate)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                neverPopulate={true}
                endpointId={FinancialRepository.DescriptionTemplate.qry}
                name='templateId'
                label={labels.descriptionTemplate}
                valueField='recordId'
                displayField='name'
                values={formik.values}
                onChange={(_, newValue) => {
                  const notes = formik.values.notes || ''
                  if (newValue?.name) formik.setFieldValue('notes', notes === '' ? newValue.name : `${notes}\n${newValue.name}`)
                  formik.setFieldValue('templateId',newValue?.recordId || null)
                }}
                readOnly={isPosted}
                error={formik.touched.templateId && Boolean(formik.errors.templateId)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextArea
                name='notes'
                type='text'
                label={labels.notes}
                value={formik.values.notes}
                rows={3}
                readOnly={isPosted}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('notes', '')}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
