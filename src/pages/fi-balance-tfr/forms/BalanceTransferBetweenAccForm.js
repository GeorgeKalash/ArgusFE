import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ControlContext } from 'src/providers/ControlContext'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { FinancialRepository } from 'src/repositories/FinancialRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'
import { useInvalidate } from 'src/hooks/resource'
import { SaleRepository } from 'src/repositories/SaleRepository'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { formatDateForGetApI, formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import { MultiCurrencyRepository } from 'src/repositories/MultiCurrencyRepository'
import { RateDivision } from 'src/resources/RateDivision'
import { DIRTYFIELD_RATE, getRate } from 'src/utils/RateCalculator'
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'
import { useError } from 'src/error'
import { SystemFunction } from 'src/resources/SystemFunction'
import { ResourceIds } from 'src/resources/ResourceIds'
import FieldSet from 'src/components/Shared/FieldSet'

export default function BalanceTransferForm({ labels, access, recordId, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels, userDefaultsData } = useContext(ControlContext)
  const { stack: stackError } = useError()

  //check hidden fields
  const invalidate = useInvalidate({
    endpointId: FinancialRepository.BalanceTransfer.page
  })

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.BalanceTransfer,
    access,
    enabled: !recordId
  })

  const defaultPlant = userDefaultsData?.list?.find(({ key }) => key === 'plantId')?.value
  const defaultSP = userDefaultsData?.list?.find(({ key }) => key === 'spId')?.value

  const { formik } = useForm({
    documentType: { key: 'dtId', value: documentType?.dtId },
    initialValues: {
      recordId,
      dtId: null,
      reference: '',
      date: new Date(),
      plantId: parseInt(defaultPlant),
      spId: parseInt(defaultSP),
      fromAccountId: null,
      toAccountId: null,
      fromCurrencyId: null,
      fromBaseAmount: null, //0 not null
      fromAmount: null,
      fromExRate: null,
      status: 1,
      notes: '',
      fromRateCalcMethod: null,
      functionId: SystemFunction.BalanceTransfer
    },
    maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      date: yup.date().required(),
      plantId: yup.number().required(),
      fromAccountId: yup.number().required(),
      toAccountId: yup.number().required(),
      fromCurrencyId: yup.number().required(),
      fromAmount: yup.number().required()
    }),
    onSubmit: async obj => {
      const { fromAccountName, fromAccountRef, toAccountRef, toAccountName, templateId, ...rest } = obj

      if (obj.fromAccountId === obj.toAccountId) {
        stackError({ message: `${labels.duplicateAccount}` })

        return
      }

      const response = await postRequest({
        extension: FinancialRepository.BalanceTransfer.set,
        record: JSON.stringify({
          ...rest,
          date: formatDateToApi(rest.date),
          toCurrencyId: rest.fromCurrencyId,
          toExRate: rest.fromExRate,
          toAmount: rest.fromAmount,
          toBaseAmount: rest.fromBaseAmount,
          toRateCalcMethod: rest.fromRateCalcMethod
        })
      })

      !rest.recordId ? platformLabels.Added : platformLabels.Edited
      refetchForm(response.recordId)
      invalidate()
    }
  })
  const editMode = !!formik.values.recordId
  const isPosted = formik.values.status === 3

  const refetchForm = async recordId => {
    const { record } = await getRequest({
      extension: FinancialRepository.BalanceTransfer.get,
      parameters: `_recordId=${recordId || formik.values.recordId}`
    })

    /* const updatedRateRow = getRate({
      amount: record.fromAmount,
      exRate: record?.fromExRate,
      baseAmount: record?.fromBaseAmount,
      rateCalcMethod: record?.fromRateCalcMethod,
      dirtyField: DIRTYFIELD_RATE
    }) */

    formik.setValues({ ...record, date: formatDateFromApi(record.date) })
  }

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        await refetchForm()
      } //else onSelectionChange(defaultCurrency, formik.values?.date)
    })()
  }, [])

  const onPost = async () => {
    await postRequest({
      extension: FinancialRepository.BalanceTransfer.post,
      record: JSON.stringify({
        ...rest,
        date: formatDateToApi(rest.date),
        toCurrencyId: rest.fromCurrencyId,
        toExRate: rest.fromExRate,
        toAmount: rest.fromAmount,
        toBaseAmount: rest.fromBaseAmount,
        toRateCalcMethod: rest.fromRateCalcMethod
      })
    })

    toast.success(platformLabels.Posted)
    invalidate()
    window.close()
  }

  const onUnpost = async () => {
    await postRequest({
      extension: FinancialRepository.BalanceTransfer.unpost,
      record: JSON.stringify({ ...rest, date: formatDateToApi(rest.date) })
    })

    toast.success(platformLabels.Unposted)
    refetchForm()
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

  const onSelectionChange = async (currencyId, date, amount) => {
    const rate = await getRates(currencyId, date)

    formik.setFieldValue(`fromExRate`, rate?.exRate?.toFixed(2))
    formik.setFieldValue(`fromRateCalcMethod`, rate?.rateCalcMethod)

    const updatedRateRow = getRate({
      amount: amount || 0,
      exRate: rate?.exRate.toFixed(2),
      baseAmount: 0, //from base amount
      rateCalcMethod: rate?.rateCalcMethod,
      dirtyField: DIRTYFIELD_RATE
    })

    formik.setFieldValue(`$fromBaseAmount`, parseFloat(updatedRateRow?.baseAmount).toFixed(2))
    formik.setFieldValue(`$fromAmount`, parseFloat(updatedRateRow?.amount).toFixed(2))
  }

  const actions = [
    {
      key: 'GL',
      condition: true,
      onClick: 'onClickGL',
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
    }
  ]

  useEffect(() => {
    formik.setFieldValue('templateId', '')
  }, [formik.values.notes])

  return (
    <FormShell
      resourceId={ResourceIds.FIBalanceTfr}
      functionId={SystemFunction.BalanceTransfer}
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
                    parameters={`_startAt=0&_pageSize=1000&_dgId=${SystemFunction.BalanceTransfer}`}
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
                      formik.setFieldValue('dtId', newValue?.recordId || null)
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
                      onSelectionChange(formik.values.fromCurrencyId, newValue, formik.values.amount)
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
                    required
                    label={labels.plant}
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

            <Grid item xs={6}>
              <FieldSet title={labels.fromAccount}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <ResourceComboBox
                      endpointId={FinancialRepository.Group.qry}
                      name='fromGroupId'
                      displayFieldWidth={2}
                      label={labels.fromGroup}
                      columnsInDropDown={[
                        { key: 'reference', value: 'Reference' },
                        { key: 'name', value: 'Name' }
                      ]}
                      valueField='recordId'
                      displayField={['reference', 'name']}
                      values={formik.values}
                      onChange={(event, newValue) => {
                        formik.setFieldValue('fromGroupId', newValue?.recordId || null)
                      }}
                      readOnly={isPosted}
                      maxAccess={maxAccess}
                      error={formik.touched.fromGroupId && Boolean(formik.errors.fromGroupId)}
                    />
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
                </Grid>
              </FieldSet>
            </Grid>
            <Grid item xs={6}>
              <FieldSet title={labels.toAccount}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <ResourceComboBox
                      endpointId={FinancialRepository.Group.qry}
                      name='toGroupId'
                      displayFieldWidth={2}
                      label={labels.toGroup}
                      columnsInDropDown={[
                        { key: 'reference', value: 'Reference' },
                        { key: 'name', value: 'Name' }
                      ]}
                      valueField='recordId'
                      displayField={['reference', 'name']}
                      values={formik.values}
                      onChange={(event, newValue) => {
                        formik.setFieldValue('toGroupId', newValue?.recordId || null)
                      }}
                      readOnly={isPosted}
                      maxAccess={maxAccess}
                      error={formik.touched.toGroupId && Boolean(formik.errors.toGroupId)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <ResourceLookup
                      endpointId={FinancialRepository.Account.snapshot}
                      name='toAccountId'
                      filter={{ isInactive: val => val !== true }}
                      required
                      label={labels.account}
                      valueField='reference'
                      displayField='name'
                      valueShow='toAccountRef'
                      secondValueShow='toAccountName'
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
                          toAccountId: newValue?.recordId || null,
                          toAccountRef: newValue?.reference || '',
                          toAccountName: newValue?.name || ''
                        })
                      }}
                      readOnly={isPosted}
                      errorCheck='toAccountId'
                      maxAccess={maxAccess}
                    />
                  </Grid>
                </Grid>
              </FieldSet>
            </Grid>
            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SystemRepository.Currency.qry}
                    name='fromCurrencyId'
                    label={labels.currency}
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
                      onSelectionChange(newValue?.recordId, formik.values?.date, formik.values.fromAmount)
                    }}
                    readOnly={isPosted}
                    error={formik.touched.fromCurrencyId && Boolean(formik.errors.fromCurrencyId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='fromAmount'
                    label={labels.amount}
                    value={formik.values.fromAmount}
                    onChange={e => {
                      formik.handleChange(e)

                      //calcFromBA

                      /* const updatedRateRow = getRate({
                        amount: e.target.value ?? 0,
                        exRate: formik.values?.fromExRate,
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
                      formik.setFieldValue('toBaseAmount', parseFloat(updatedRateRowTo?.baseAmount).toFixed(2) || 0) */
                    }}
                    onClear={() => formik.setFieldValue('fromAmount', '')}
                    required
                    readOnly={isPosted}
                    error={formik.touched.fromAmount && Boolean(formik.errors.fromAmount)}
                    maxAccess={maxAccess}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={FinancialRepository.DescriptionTemplate.qry}
                    name='templateId'
                    label={labels.descriptionTemplate}
                    valueField='recordId'
                    displayField='name'
                    values={formik.values}
                    onChange={(event, newValue) => {
                      let notes = formik.values.notes || ''
                      notes += newValue?.name && notes && '\n'
                      notes += newValue?.name

                      notes && formik.setFieldValue('notes', notes)
                      newValue?.name && formik.setFieldValue('templateId', newValue?.recordId || null)
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
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
