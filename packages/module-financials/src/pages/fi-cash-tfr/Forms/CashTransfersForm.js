import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import CustomTextArea from '@argus/shared-ui/src/components/Inputs/CustomTextArea'
import { useDocumentType } from '@argus/shared-hooks/src/hooks/documentReferenceBehaviors'
import { formatDateForGetApI, formatDateFromApi, formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'
import { CashBankRepository } from '@argus/repositories/src/repositories/CashBankRepository'
import { useError } from '@argus/shared-providers/src/providers/error'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import { MultiCurrencyRepository } from '@argus/repositories/src/repositories/MultiCurrencyRepository'
import { RateDivision } from '@argus/shared-domain/src/resources/RateDivision'
import { DIRTYFIELD_RATE, getRate } from '@argus/shared-utils/src/utils/RateCalculator'
import MultiCurrencyRateForm from '@argus/shared-ui/src/components/Shared/MultiCurrencyRateForm'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import CustomButton from '@argus/shared-ui/src/components/Inputs/CustomButton'
import { DefaultsContext } from '@argus/shared-providers/src/providers/DefaultsContext'

export default function CashTransfersForm({ labels, maxAccess: access, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { systemDefaults } = useContext(DefaultsContext)
  const { stack: stackError } = useError()
  const { stack } = useWindow()

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.CashTransfers,
    access,
    enabled: !recordId
  })

  const initialValues = {
    recordId: recordId || null,
    currencyId: parseInt(getDefaultsData()?.currencyId),
    currencyRef: '',
    currencyName: '',
    exRate: 1,
    rateCalcMethod: 1,
    fromCashAccountId: null,
    toCashAccountId: null,
    amount: '',
    baseAmount: '',
    dtName: null,
    notes: '',
    statusName: '',
    functionId: SystemFunction.CashTransfers,
    reference: '',
    dtId: null,
    date: new Date(),
    status: 1,
    releaseStatus: 1,
    plantId: null,
    printStatus: null
  }

  const invalidate = useInvalidate({
    endpointId: CashBankRepository.CashTransfers.qry
  })

  async function getCurrencyId() {
    const currencyId = systemDefaults?.list?.find(({ key }) => key === 'baseCurrencyId')?.value

    if (currencyId) {
      formik.setFieldValue('currencyId', parseInt(currencyId))
    } else {
      stackError({
        message: labels.errorMessageNoCurrency
      })
    }

    return currencyId
  }

  const { formik } = useForm({
    initialValues,
    maxAccess,
    documentType: { key: 'dtId', value: documentType?.dtId },
    validateOnChange: true,
    validationSchema: yup.object({
      date: yup.date().required(),
      fromCashAccountId: yup.number().required(),
      toCashAccountId: yup.number().required(),
      amount: yup.number().required()
    }),
    onSubmit: async values => {
      const copy = { ...values }
      copy.date = !!copy.date ? formatDateToApi(copy.date) : null

      if (values.fromCashAccountId === values.toCashAccountId) {
        stackError({
          message: labels.errorMessage
        })

        throw { silent: true }
      }

      const res = await postRequest({
        extension: CashBankRepository.CashTransfers.set,
        record: JSON.stringify(copy)
      })

      if (!values.recordId) {
        toast.success(platformLabels.Added)
        formik.setFieldValue('recordId', res.recordId)

        await refetchForm(res.recordId)
      } else toast.success(platformLabels.Edited)

      invalidate()
    }
  })

  function getDefaultsData() {
    const myObject = {}

    const filteredList = systemDefaults?.list?.filter(obj => {
      return obj.key === 'currencyId'
    })

    filteredList.forEach(obj => (myObject[obj.key] = obj.value ? parseInt(obj.value) : null))

    return myObject
  }

  async function openMCRForm(data) {
    stack({
      Component: MultiCurrencyRateForm,
      props: {
        DatasetIdAccess: ResourceIds.MCRCashTransfers,
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

  const isPosted = formik.values.status === 3
  const editMode = !!formik.values.recordId

  async function getData(recordId) {
    const res = await getRequest({
      extension: CashBankRepository.CashTransfers.get,
      parameters: `_recordId=${recordId}`
    })

    res.record.date = formatDateFromApi(res?.record?.date)

    return res
  }

  const onPost = async () => {
    const copy = { ...formik.values }
    copy.date = !!copy.date ? formatDateToApi(copy.date) : null

    await postRequest({
      extension: CashBankRepository.CashTransfers.post,
      record: JSON.stringify(copy)
    })

    toast.success(platformLabels.Posted)
    invalidate()
    await refetchForm(formik.values.recordId)
  }

  const onUnpost = async () => {
    const copy = { ...formik.values }
    copy.date = !!copy.date ? formatDateToApi(copy.date) : null

    await postRequest({
      extension: CashBankRepository.CashTransfers.unpost,
      record: JSON.stringify(copy)
    })

    toast.success(platformLabels.Unposted)
    invalidate()
    await refetchForm(formik.values.recordId)
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

  useEffect(() => {
    ;(async function () {
      await getCurrencyId()
      if (recordId) {
        refetchForm(recordId)
      }
      getDefaultsData()
    })()
  }, [])

  async function refetchForm(recordId) {
    const res = await getData(recordId)

    formik.setValues({
      ...res.record,
      recordId
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
      datasetId: ResourceIds.GLCashTransfers,
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
    }
  ]

  return (
    <FormShell
      resourceId={ResourceIds.CashTransfers}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      previewReport={editMode}
      actions={actions}
      functionId={SystemFunction.CashTransfers}
      disabledSubmit={isPosted}
    >
      <VertLayout>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={SystemRepository.DocumentType.qry}
              parameters={`_dgId=${SystemFunction.CashTransfers}&_startAt=${0}&_pageSize=${50}`}
              filter={!editMode ? item => item.activeStatus === 1 : undefined}
              name='dtId'
              label={labels.documentType}
              readOnly={isPosted}
              valueField='recordId'
              displayField='name'
              values={formik?.values}
              onChange={async (event, newValue) => {
                formik.setFieldValue('dtId', newValue?.recordId || '')
                changeDT(newValue)
              }}
              error={formik.touched.dtId && Boolean(formik.errors.dtId)}
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='reference'
              label={labels.reference}
              value={formik?.values?.reference}
              readOnly={isPosted || editMode}
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
              value={formik?.values?.date}
              required
              autoFocus={!editMode}
              onChange={async (e, newValue) => {
                formik.setFieldValue('date', newValue)
                await getMultiCurrencyFormData(formik.values.currencyId, newValue, RateDivision.FINANCIALS)
              }}
              onClear={() => formik.setFieldValue('date', null)}
              readOnly={isPosted}
              error={formik.touched.date && Boolean(formik.errors.date)}
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={SystemRepository.Plant.qry}
              name='plantId'
              label={labels.plant}
              readOnly={isPosted}
              valueField='recordId'
              displayField='name'
              columnsInDropDown={[
                { key: 'reference', value: 'Reference' },
                { key: 'name', value: 'Name' }
              ]}
              values={formik?.values}
              maxAccess={maxAccess}
              onClear={() => formik.setFieldValue('plantId', '')}
              onChange={(event, newValue) => {
                formik.setFieldValue('plantId', newValue?.recordId || null)
              }}
              error={formik.touched.plantId && Boolean(formik.errors.plantId)}
            />
          </Grid>

          <Grid item xs={8}>
            <Grid container spacing={1} alignItems='center'>
              <Grid item xs={8}>
                <ResourceComboBox
                  endpointId={SystemRepository.Currency.qry}
                  name='currencyId'
                  label={labels.currency}
                  filter={item => item.currencyType === 1}
                  readOnly={formik.values.status == '3'}
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
              name='fromCashAccountId'
              label={labels.from}
              valueField='recordId'
              displayField={['reference', 'name']}
              columnsInDropDown={[
                { key: 'reference', value: 'Reference' },
                { key: 'name', value: 'Name' }
              ]}
              values={formik.values}
              required
              maxAccess={maxAccess}
              onChange={(_, newValue) => {
                formik.setFieldValue('fromCashAccountId', newValue?.recordId || null)
              }}
              error={formik.touched.fromCashAccountId && Boolean(formik.errors.fromCashAccountId)}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={CashBankRepository.CashAccount.qry}
              parameters={`_type=0`}
              name='toCashAccountId'
              label={labels.to}
              valueField='recordId'
              displayField={['reference', 'name']}
              columnsInDropDown={[
                { key: 'reference', value: 'Reference' },
                { key: 'name', value: 'Name' }
              ]}
              values={formik.values}
              required
              maxAccess={maxAccess}
              onChange={(_, newValue) => {
                formik.setFieldValue('toCashAccountId', newValue?.recordId || null)
              }}
              error={formik.touched.toCashAccountId && Boolean(formik.errors.toCashAccountId)}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomNumberField
              name='amount'
              required
              label={labels.amount}
              value={formik.values.amount}
              maxAccess={maxAccess}
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
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextArea
              name='notes'
              label={labels.notes}
              value={formik?.values?.notes}
              readOnly={isPosted}
              maxLength='200'
              maxAccess={maxAccess}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('notes', '')}
              error={formik.touched.notes && Boolean(formik.errors.notes)}
            />
          </Grid>
        </Grid>
      </VertLayout>
    </FormShell>
  )
}
