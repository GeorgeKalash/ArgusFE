import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { CashBankRepository } from '@argus/repositories/src/repositories/CashBankRepository'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import { formatDateForGetApI, formatDateFromApi } from '@argus/shared-domain/src/lib/date-helper'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import CustomTextArea from '@argus/shared-ui/src/components/Inputs/CustomTextArea'
import { useDocumentType } from '@argus/shared-hooks/src/hooks/documentReferenceBehaviors'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import WorkFlow from '@argus/shared-ui/src/components/Shared/WorkFlow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { MultiCurrencyRepository } from '@argus/repositories/src/repositories/MultiCurrencyRepository'
import MultiCurrencyRateForm from '@argus/shared-ui/src/components/Shared/MultiCurrencyRateForm'
import { DIRTYFIELD_RATE, getRate } from '@argus/shared-utils/src/utils/RateCalculator'
import { RateDivision } from '@argus/shared-domain/src/resources/RateDivision'
import CustomButton from '@argus/shared-ui/src/components/Inputs/CustomButton'
import { DefaultsContext } from '@argus/shared-providers/src/providers/DefaultsContext'

export default function CAadjustmentForm({ labels, access, recordId, functionId }) {
  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: functionId,
    access: access,
    enabled: !recordId
  })
  const { platformLabels } = useContext(ControlContext)
  const { systemDefaults, userDefaults } = useContext(DefaultsContext)

  const { stack } = useWindow()
  const cashAccountId = parseInt(userDefaults?.list?.find(obj => obj.key === 'cashAccountId')?.value)
  const plantId = parseInt(userDefaults?.list?.find(obj => obj.key === 'plantId')?.value)

  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: CashBankRepository.CAadjustment.page
  })

  const { formik } = useForm({
    documentType: { key: 'dtId', value: documentType?.dtId },
    initialValues: {
      recordId: recordId || null,
      reference: '',
      name: '',
      dtId: null,
      plantId,
      date: new Date(),
      currencyId: parseInt(getDefaultsData()?.currencyId),
      currencyName: '',
      status: 1,
      cashAccountId: cashAccountId || null,
      amount: '',
      baseAmount: '',
      exRate: 1,
      rateCalcMethod: 1,
      functionId: functionId,
      notes: ''
    },
    maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      amount: yup.string().required(),
      currencyId: yup.string().required(),
      cashAccountId: yup.string().required(),
      dtId: yup.string().required(),
      date: yup.string().required()
    }),
    onSubmit: async obj => {
      const recordId = obj.recordId
      if (!recordId) {
        obj.status = 1
        obj.rateCalcMethod = 1
      }

      const response = await postRequest({
        extension: CashBankRepository.CAadjustment.set,
        record: JSON.stringify(obj)
      })

      if (!recordId) {
        toast.success(platformLabels.Added)
        formik.setValues({
          ...obj,
          baseAmount: !formik.values.baseAmount ? obj.amount : formik.values.baseAmount,

          recordId: response.recordId
        })
      } else {
        toast.success(platformLabels.Edited)
      }

      const res = await getRequest({
        extension: CashBankRepository.CAadjustment.get,
        parameters: `_recordId=${response.recordId}`
      })

      formik.setFieldValue('reference', res.record.reference)
      invalidate()
    }
  })
  const editMode = !!formik.values.recordId || !!recordId
  const isPosted = formik.values.status === 3

  function openMCRForm(data) {
    stack({
      Component: MultiCurrencyRateForm,
      props: {
        DatasetIdAccess: ResourceIds.MCRIncreaseDecreaseAdj,
        data,
        onOk: childFormikValues => {
          formik.setValues(prevValues => ({
            ...prevValues,
            ...childFormikValues
          }))
        }
      }
    })
  }

  async function getMultiCurrencyFormData(currencyId, date, rateType, amount) {
    if (currencyId && date && rateType) {
      const res = await getRequest({
        extension: MultiCurrencyRepository.Currency.get,
        parameters: `_currencyId=${currencyId}&_date=${formatDateForGetApI(date)}&_rateDivision=${rateType}`
      })

      const updatedRateRow = getRate({
        amount: amount === 0 ? 0 : amount ?? formik.values.amount,
        exRate: res.record?.exRate,
        baseAmount: 0,
        rateCalcMethod: res.record?.rateCalcMethod,
        dirtyField: DIRTYFIELD_RATE
      })

      formik.setFieldValue('baseAmount', parseFloat(updatedRateRow?.baseAmount).toFixed(2) || 0)
      formik.setFieldValue('exRate', res.record?.exRate)
      formik.setFieldValue('rateCalcMethod', res.record?.rateCalcMethod)
    }
  }

  async function getDTD(dtId) {
    if (dtId) {
      const res = await getRequest({
        extension: CashBankRepository.DocumentTypeDefault.get,
        parameters: `_dtId=${dtId}`
      })

      const cashAccountValue = res?.record?.cashAccountId ? res?.record?.cashAccountId : cashAccountId

      formik.setFieldValue('cashAccountId', cashAccountValue || null)
      getCashAccount(cashAccountValue)

      formik.setFieldValue('plantId', res?.record?.plantId ? res?.record?.plantId : plantId)

      return res
    }
  }

  const getCashAccount = async cashAccountId => {
    if (cashAccountId) {
      const { record: cashAccountResult } = await getRequest({
        extension: CashBankRepository.CbBankAccounts.get,
        parameters: `_recordId=${cashAccountId}`
      })

      formik.setFieldValue('cashAccountRef', cashAccountResult.reference)
      formik.setFieldValue('cashAccountName', cashAccountResult.name)
    }
  }

  useEffect(() => {
    if (formik.values.dtId && !recordId) getDTD(formik?.values?.dtId)
  }, [formik.values.dtId])

  function getDefaultsData() {
    const myObject = {}

    const filteredList = systemDefaults?.list?.filter(obj => {
      return obj.key === 'currencyId'
    })

    filteredList.forEach(obj => (myObject[obj.key] = obj.value ? parseInt(obj.value) : null))

    return myObject
  }

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: CashBankRepository.CAadjustment.get,
          parameters: `_recordId=${recordId}`
        })

        formik.setValues({
          ...res.record,
          date: formatDateFromApi(res.record.date)
        })
      } else {
        const cashAccountId = formik.values.cashAccountId
        if (cashAccountId) {
          getCashAccount(cashAccountId)
        }
      }
      if (!editMode) getDefaultsData()
    })()
  }, [])

  const onPost = async () => {
    const res = await postRequest({
      extension: CashBankRepository.CAadjustment.post,
      record: JSON.stringify(formik.values)
    })

    if (res?.recordId) {
      toast.success(platformLabels.Posted)
      invalidate()

      const getRes = await getRequest({
        extension: CashBankRepository.CAadjustment.get,
        parameters: `_recordId=${formik.values.recordId}`
      })

      getRes.record.date = formatDateFromApi(getRes.record.date)
      formik.setValues(getRes.record)
    }
  }

  const onUnpost = async () => {
    const res = await postRequest({
      extension: CashBankRepository.CAadjustment.unpost,
      record: JSON.stringify(formik.values)
    })

    if (res?.recordId) {
      toast.success(platformLabels.Unposted)
      invalidate()

      const getRes = await getRequest({
        extension: CashBankRepository.CAadjustment.get,
        parameters: `_recordId=${formik.values.recordId}`
      })

      getRes.record.date = formatDateFromApi(getRes.record.date)
      formik.setValues(getRes.record)
    }
  }

  const onWorkFlowClick = async () => {
    stack({
      Component: WorkFlow,
      props: {
        functionId: formik.values.functionId,
        recordId: formik.values.recordId
      }
    })
  }

  const actions = [
    {
      key: 'RecordRemarks',
      condition: true,
      onClick: 'onRecordRemarks',
      disabled: !editMode
    },
    {
      key: 'GL',
      condition: true,
      onClick: 'onClickGL',
      datasetId: ResourceIds.GLIncreaseDecreaseAdj,
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
      key: 'WorkFlow',
      condition: true,
      onClick: onWorkFlowClick,
      disabled: !editMode
    },
    {
      key: 'Cash Transaction',
      condition: true,
      onClick: 'transactionClicked',
      disabled: !editMode
    }
  ]

  return (
    <FormShell
      resourceId={ResourceIds.IncreaseDecreaseAdj}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      actions={actions}
      functionId={functionId}
      previewReport={editMode}
      disabledSubmit={isPosted}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.DocumentType.qry}
                parameters={`_startAt=0&_pageSize=1000&_dgId=${formik.values.functionId}`}
                name='dtId'
                readOnly={editMode}
                label={labels.doctype}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                valueField='recordId'
                displayField={['reference', 'name']}
                values={formik.values}
                maxAccess={maxAccess}
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
                rows={2}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('reference', '')}
                error={formik.touched.reference && Boolean(formik.errors.reference)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.Plant.qry}
                name='plantId'
                label={labels.plant}
                readOnly={isPosted}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'plant Ref' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  const plantId = newValue?.recordId || ''
                  formik.setFieldValue('plantId', plantId)
                }}
                error={formik.touched.plantId && Boolean(formik.errors.plantId)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='date'
                label={labels.date}
                readOnly={isPosted}
                value={formik.values.date}
                onChange={async (e, newValue) => {
                  formik.setFieldValue('date', newValue)
                  await getMultiCurrencyFormData(formik.values.currencyId, newValue, RateDivision.FINANCIALS)
                }}
                required
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('date', null)}
                error={formik.touched.date && Boolean(formik.errors.date)}
              />
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={1} alignItems='center'>
                <Grid item xs={8}>
                  <ResourceComboBox
                    endpointId={SystemRepository.Currency.qry}
                    filter={item => item.currencyType === 1}
                    name='currencyId'
                    label={labels.currency}
                    readOnly={isPosted}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik.values}
                    required
                    maxAccess={maxAccess}
                    onChange={async (event, newValue) => {
                      await getMultiCurrencyFormData(newValue?.recordId, formik.values.date, RateDivision.FINANCIALS)
                      formik.setFieldValue('currencyId', newValue?.recordId || null)
                      formik.setFieldValue('currencyName', newValue?.name)
                    }}
                    error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
                  />
                </Grid>
                <Grid item xs={4}>
                  <CustomButton
                    onClick={() => openMCRForm(formik.values)}
                    disabled={
                      !formik.values.currencyId ||
                      formik.values.currencyId === getDefaultsData()?.currencyId
                    }
                    tooltipText={platformLabels.add}
                    image={'popup.png'}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={CashBankRepository.CashAccount.qry}
                parameters={`_type=0`}
                name='cashAccountId'
                readOnly={isPosted}
                required
                label={labels.cashAccount}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(_, newValue) => {
                  formik.setFieldValue('cashAccountId', newValue?.recordId || null)
                }}
                error={formik.touched.cashAccountId && Boolean(formik.errors.cashAccountId)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='amount'
                type='text'
                label={labels.amount}
                value={formik.values.amount}
                readOnly={isPosted}
                required
                maxAccess={maxAccess}
                thousandSeparator={false}
                onChange={async e => {
                  formik.setFieldValue('amount', e.target.value)

                  const updatedRateRow = getRate({
                    amount: e.target.value ?? 0,
                    exRate: formik.values?.exRate,
                    baseAmount: 0,
                    rateCalcMethod: formik.values?.rateCalcMethod,
                    dirtyField: DIRTYFIELD_RATE
                  })
                  formik.setFieldValue('baseAmount', parseFloat(updatedRateRow?.baseAmount).toFixed(2) || 0)
                }}
                onClear={async () => {
                  formik.setFieldValue('amount', 0)
                }}
                error={formik.touched.amount && Boolean(formik.errors.amount)}
                maxLength={10}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextArea
                name='notes'
                label={labels.notes}
                readOnly={isPosted}
                value={formik.values.notes}
                maxLength='100'
                rows={2}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('notes', '')}
                error={formik.touched.notes && Boolean(formik.errors.notes)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
