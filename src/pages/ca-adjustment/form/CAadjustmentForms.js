import { Button, Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'
import { CashBankRepository } from 'src/repositories/CashBankRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { formatDateForGetApI, formatDateFromApi } from 'src/lib/date-helper'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'
import { useWindow } from 'src/windows'
import WorkFlow from 'src/components/Shared/WorkFlow'
import { ControlContext } from 'src/providers/ControlContext'
import { MultiCurrencyRepository } from 'src/repositories/MultiCurrencyRepository'
import MultiCurrencyRateForm from 'src/components/Shared/MultiCurrencyRateForm'
import { DIRTYFIELD_RATE, getRate } from 'src/utils/RateCalculator'
import { RateDivision } from 'src/resources/RateDivision'

export default function CAadjustmentForm({ labels, access, recordId, functionId }) {
  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: functionId,
    access: access,
    enabled: !recordId
  })
  const { platformLabels, defaultsData } = useContext(ControlContext)
  const [defaultsDataState, setDefaultsDataState] = useState(null)

  const { stack } = useWindow()

  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: CashBankRepository.CAadjustment.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: recordId || null,
      reference: '',
      name: '',
      dtId: documentType?.dtId,
      plantId: '',
      date: new Date(),
      currencyId: '',
      currencyName: '',
      status: 1,
      cashAccountId: '',
      amount: '',
      baseAmount: '',
      exRate: '',
      rateCalcMethod: '',
      functionId: functionId,
      notes: ''
    },
    maxAccess,
    enableReinitialize: false,
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
        obj.baseAmount = obj.amount
        obj.status = 1
        obj.rateCalcMethod = 1
        obj.exRate = 1
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

      try {
        const res = await getRequest({
          extension: CashBankRepository.CAadjustment.get,
          parameters: `_recordId=${response.recordId}`
        })

        formik.setFieldValue('reference', res.record.reference)
      } catch (error) {}
      invalidate()
    }
  })
  const editMode = !!formik.values.recordId || !!recordId

  const { labels: _labels, access: MRCMaxAccess } = useResourceQuery({
    endpointId: MultiCurrencyRepository.Currency.get,
    datasetId: ResourceIds.MultiCurrencyRate
  })

  async function getDefaultsData() {
    const myObject = {}

    const filteredList = defaultsData?.list?.filter(obj => {
      return obj.key === 'currencyId'
    })

    filteredList.forEach(obj => (myObject[obj.key] = obj.value ? parseInt(obj.value) : null))
    setDefaultsDataState(myObject)

    return myObject
  }

  function openMCRForm(data) {
    stack({
      Component: MultiCurrencyRateForm,
      props: {
        labels: _labels,
        maxAccess: MRCMaxAccess,
        data,
        onOk: childFormikValues => {
          formik.setValues(prevValues => ({
            ...prevValues,
            ...childFormikValues
          }))
        }
      },
      width: 500,
      height: 500,
      title: _labels.MultiCurrencyRate
    })
  }

  async function getMultiCurrencyFormData(currencyId, date, rateType, amount) {
    if (currencyId && date && rateType) {
      const res = await getRequest({
        extension: MultiCurrencyRepository.Currency.get,
        parameters: `_currencyId=${currencyId}&_date=${date}&_rateDivision=${rateType}`
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
      try {
        if (recordId) {
          const res = await getRequest({
            extension: CashBankRepository.CAadjustment.get,
            parameters: `_recordId=${recordId}`
          })

          formik.setValues({
            ...res.record,
            date: formatDateFromApi(res.record.date)
          })
        }
        await getDefaultsData()
      } catch (exception) {}
    })()
  }, [])

  const onPost = async () => {
    try {
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
    } catch (error) {}
  }

  const onWorkFlowClick = async () => {
    stack({
      Component: WorkFlow,
      props: {
        functionId: formik.values.functionId,
        recordId: formik.values.recordId
      },
      width: 950,
      title: 'Workflow'
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
      disabled: !editMode
    },

    {
      key: 'Post',
      condition: true,
      onClick: onPost,
      disabled: !editMode || formik.values.status !== 1
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

  useEffect(() => {
    if (!editMode) formik.setFieldValue('currencyId', parseInt(defaultsDataState?.currencyId))
  }, [defaultsDataState])

  return (
    <FormShell
      resourceId={ResourceIds.IncreaseDecreaseAdj}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      actions={actions}
      functionId={functionId}
      previewReport={editMode}
      disabledSubmit={formik.values.status !== 1}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
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
                  changeDT(newValue)
                  formik && formik.setFieldValue('dtId', newValue?.recordId)
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
                readOnly={formik.values.status == '3'}
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
                readOnly={formik.values.status == '3'}
                value={formik.values.date}
                onChange={async (e, newValue) => {
                  formik.setFieldValue('date', newValue.date)
                  await getMultiCurrencyFormData(
                    formik.values.currencyId,
                    formatDateForGetApI(formik.values.date),
                    RateDivision.FINANCIALS
                  )
                }}
                required
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('date', '')}
                error={formik.touched.date && Boolean(formik.errors.date)}
              />
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={1} alignItems='center'>
                <Grid item xs={8}>
                  <ResourceComboBox
                    endpointId={SystemRepository.Currency.qry}
                    name='currencyId'
                    label={labels.currency}
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
                      await getMultiCurrencyFormData(
                        newValue?.recordId,
                        formatDateForGetApI(formik.values.date),
                        RateDivision.FINANCIALS
                      )
                      formik.setFieldValue('currencyId', newValue?.recordId || null)
                      formik.setFieldValue('currencyName', newValue?.name)
                    }}
                    error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
                  />
                </Grid>
                <Grid item xs={4}>
                  <Button
                    variant='contained'
                    size='small'
                    onClick={() => openMCRForm(formik.values)}
                    disabled={formik.values.currencyId === defaultsDataState?.currencyId}
                  >
                    <img src='/images/buttonsIcons/popup.png' alt={platformLabels.add} />
                  </Button>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={CashBankRepository.CashAccount.snapshot}
                parameters={{
                  _type: 2
                }}
                readOnly={formik.values.status == '3'}
                valueField='reference'
                displayField='name'
                name='cashAccountId'
                maxAccess={maxAccess}
                required
                label={labels.cashAccount}
                form={formik}
                valueShow='cashAccountRef'
                secondValueShow='cashAccountName'
                onChange={(event, newValue) => {
                  if (newValue) {
                    formik.setFieldValue('cashAccountId', newValue?.recordId)
                    formik.setFieldValue('cashAccountRef', newValue?.reference)
                    formik.setFieldValue('cashAccountName', newValue?.name)
                  } else {
                    formik.setFieldValue('cashAccountId', null)
                    formik.setFieldValue('cashAccountRef', null)
                    formik.setFieldValue('cashAccountName', null)
                  }
                }}
                errorCheck={'cashAccountId'}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='amount'
                type='text'
                label={labels.amount}
                value={formik.values.amount}
                readOnly={formik.values.status == '3'}
                required
                maxAccess={maxAccess}
                onChange={async e => {
                  if (e.target.value) {
                    await getMultiCurrencyFormData(
                      formik.values.currencyId,
                      formatDateForGetApI(formik.values.date),
                      RateDivision.FINANCIALS,
                      Number(e.target.value.replace(/,/g, ''))
                    )
                    formik.setFieldValue('amount', Number(e.target.value.replace(/,/g, '')))
                  }
                }}
                onClear={async () => {
                  await getMultiCurrencyFormData(
                    formik.values.currencyId,
                    formatDateForGetApI(formik.values.date),
                    RateDivision.FINANCIALS,
                    0
                  )
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
                readOnly={formik.values.status == '3'}
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
