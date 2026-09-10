import { FinancialRepository } from "@argus/repositories/src/repositories/FinancialRepository"
import { ResourceIds } from "@argus/shared-domain/src/resources/ResourceIds"
import { SystemFunction } from "@argus/shared-domain/src/resources/SystemFunction"
import { useDocumentType } from "@argus/shared-hooks/src/hooks/documentReferenceBehaviors"
import { useForm } from "@argus/shared-hooks/src/hooks/form"
import { useInvalidate } from "@argus/shared-hooks/src/hooks/resource"
import useResourceParams from "@argus/shared-hooks/src/hooks/useResourceParams"
import useSetWindow from "@argus/shared-hooks/src/hooks/useSetWindow"
import { ControlContext } from "@argus/shared-providers/src/providers/ControlContext"
import { RequestsContext } from "@argus/shared-providers/src/providers/RequestsContext"
import { useWindow } from "@argus/shared-providers/src/providers/windows"
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { formatDateFromApi, formatDateToApi } from "@argus/shared-domain/src/lib/date-helper"
import WorkFlow from "@argus/shared-ui/src/components/Shared/WorkFlow"
import FormShell from "@argus/shared-ui/src/components/Shared/FormShell"
import { VertLayout } from "@argus/shared-ui/src/components/Layouts/VertLayout"
import { Fixed } from "@argus/shared-ui/src/components/Layouts/Fixed"
import ResourceComboBox from "@argus/shared-ui/src/components/Shared/ResourceComboBox"
import { SystemRepository } from "@argus/repositories/src/repositories/SystemRepository"
import CustomTextField from "@argus/shared-ui/src/components/Inputs/CustomTextField"
import CustomDatePicker from "@argus/shared-ui/src/components/Inputs/CustomDatePicker"
import { ResourceLookup } from "@argus/shared-ui/src/components/Shared/ResourceLookup"
import CustomTextArea from "@argus/shared-ui/src/components/Inputs/CustomTextArea"
import { useContext, useEffect } from 'react'
import { Grid } from '@mui/material'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import AccountSummary from '@argus/shared-ui/src/components/Shared/AccountSummary'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'

const CreditLimitHoldForm = ({ recordId, window }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  const { labels, access } = useResourceParams({
    datasetId: ResourceIds.CreditLimitHold,
    editMode: !!recordId
  })

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.CreditLimitHold,
    access,
    enabled: !recordId
  })

  useSetWindow({ title: labels.CreditLimitHold, window })

  const invalidate = useInvalidate({
    endpointId: FinancialRepository.CreditLimitHold.page
  })

  const initialValues = {
    recordId: recordId || null,
    header: {
      recordId: recordId || null,
      dtId: null,
      reference: '',
      date: new Date(),
      validUntil: null,
      accountId: null,
      accountRef: '',
      accountName: '',
      notes: '',
      status: 1,
      wip: 1
    },
    items: []
  }

  const { formik } = useForm({
    maxAccess,
    behavior: { key: 'header.dtId', value: documentType?.dtId, fieldBehavior: documentType?.reference },
    initialValues,
    validationSchema: yup.object({
      header: yup.object({
        date: yup.date().required(),
        accountId: yup.number().required(),
        validUntil: yup.date().required()
      }),
    }),
    onSubmit: async obj => {
      const updatedItems = obj.items
        .filter(row => row?.limit > 0)
        .map(({ id, currencyName, ...rest }) => ({
          ...rest,
          recordId: obj.header.recordId || 0
        }))

      const res = await postRequest({
        extension: FinancialRepository.CreditLimitHold.set2,
        record: JSON.stringify({
          header: {
            ...obj.header,
            date: formatDateToApi(obj.header.date),
            validUntil: formatDateToApi(obj.header.validUntil)
          },
          items: updatedItems
        })
      })
      toast.success(obj.header.recordId ? platformLabels.Edited : platformLabels.Added)

      refetchForm(res.recordId)
      invalidate()
    }
  })

  const editMode = !!formik.values.header.recordId
  const isClosed = formik.values.header.wip === 2

  async function getCurrencies() {
    const res = await getRequest({
      extension: SystemRepository.Currency.qry,
      parameters: `_startAt=0&_pageSize=1000&_filter=`
    })

    return res?.list || []
  }

  async function buildItemsFromCurrencies(existingItems = []) {
    const currencies = await getCurrencies()

    return currencies.map((currency, index) => {
      const existing = existingItems.find(item => item.currencyId === currency.recordId)

      return {
        id: index + 1,
        currencyId: currency.recordId,
        currencyRef: currency.reference,
        currencyName: currency.name,
        limit: existing?.limit ?? 0
      }
    })
  }

  async function refetchForm(recordId) {
    const { record } = await getRequest({
      extension: FinancialRepository.CreditLimitHold.get2,
      parameters: `_recordId=${recordId}`
    })

    const items = await buildItemsFromCurrencies(record?.items || [])

    formik.resetForm({
      values: {
        ...formik.values,
        recordId: record?.header?.recordId,
        header: {
          ...record?.header,
          date: formatDateFromApi(record?.header?.date),
          validUntil: formatDateFromApi(record?.header?.validUntil)
        },
        items
      }
    })
  }

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        await refetchForm(recordId)
      } else {
        const items = await buildItemsFromCurrencies()
        formik.setFieldValue('items', items)
      }
    })()
  }, [])

  async function onWorkFlow() {
    stack({
      Component: WorkFlow,
      props: {
        functionId: SystemFunction.CreditLimitHold,
        recordId: formik.values.header.recordId
      }
    })
  }

  async function onReopen() {
    await postRequest({
      extension: FinancialRepository.CreditLimitHold.reopen,
      record: JSON.stringify({ recordId: formik.values.header.recordId })
    })

    toast.success(platformLabels.Reopened)
    invalidate()
    refetchForm(formik.values.header.recordId)
  }

  async function onClose() {
    await postRequest({
      extension: FinancialRepository.CreditLimitHold.close,
      record: JSON.stringify({ recordId: formik.values.header.recordId })
    })
    toast.success(platformLabels.Closed)
    invalidate()
    refetchForm(formik.values.header.recordId)
  }

  const actions = [
    {
      key: 'Reopen',
      condition: isClosed,
      onClick: onReopen,
      disabled: !isClosed
    },
    {
      key: 'Close',
      condition: !isClosed,
      onClick: onClose,
      disabled: isClosed || !editMode
    },
    {
      key: 'RecordRemarks',
      condition: true,
      onClick: 'onRecordRemarks',
      disabled: !editMode
    },
    {
      key: 'WorkFlow',
      condition: true,
      onClick: onWorkFlow,
      disabled: !editMode
    },
    {
      key: 'Approval',
      condition: true,
      onClick: 'onApproval',
      disabled: !isClosed
    },
    {
      key: 'AccountSummary',
      condition: true,
      onClick: () => {
        stack({
          Component: AccountSummary,
          props: {
            accountId: parseInt(formik.values.header.accountId),
            date: formik.values.header.date
          }
        })
      },
      disabled: !formik.values.header.accountId || !formik.values.header.date
    }
  ]

  const maxValidUntil = formik.values.header.date
  ? new Date(
      new Date(formik.values.header.date).setDate(
        new Date(formik.values.header.date).getDate() + 30
      )
    )
  : null

  const itemColumns = [
    {
      component: 'textfield',
      label: labels.currency,
      name: 'currencyName',
      flex: 1,
      props: { readOnly: true }
    },
    {
      component: 'numberfield',
      label: labels.CreditLimits,
      name: 'limit',
      flex: 1,
      props: { 
        maxLength: 12, 
        decimalScale: 2, 
        allowNegative: false 
      }
    }
  ]

  return (
    <FormShell
      resourceId={ResourceIds.CreditLimitHold}
      functionId={SystemFunction.CreditLimitHold}
      form={formik}
      maxAccess={maxAccess}
      actions={actions}
      editMode={editMode}
      previewReport={editMode}
      disabledSubmit={isClosed}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SystemRepository.DocumentType.qry}
                    parameters={`_startAt=0&_pageSize=1000&_dgId=${SystemFunction.CreditLimitHold}`}
                    filter={!editMode ? item => item.activeStatus === 1 : undefined}
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
                    onChange={(_, newValue) => {
                      formik.setFieldValue('header.dtId', newValue?.recordId || null)
                      changeDT(newValue)
                    }}
                    error={formik.touched.header?.dtId && Boolean(formik.errors.header?.dtId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='header.reference'
                    label={labels.reference}
                    value={formik?.values?.header?.reference}
                    maxAccess={!editMode && maxAccess}
                    readOnly={editMode}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('header.reference', '')}
                    error={formik.touched.header?.reference && Boolean(formik.errors.header?.reference)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomDatePicker
                    name='header.date'
                    label={labels.date}
                    value={formik.values?.header?.date}
                    readOnly={isClosed}
                    required
                    onChange={(name, value) => {
                      formik.setFieldValue(name, value)
                    }}
                    onClear={() => formik.setFieldValue('header.date', null)}
                    error={formik.touched.header?.date && Boolean(formik.errors.header?.date)}
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomDatePicker
                    name='header.validUntil'
                    label={labels.validUntil}
                    value={formik.values?.header?.validUntil}
                    readOnly={isClosed}
                    required
                    onChange={formik.setFieldValue}
                    onClear={() => formik.setFieldValue('header.validUntil', null)}
                    error={formik.touched.header?.validUntil && Boolean(formik.errors.header?.validUntil)}
                    maxAccess={maxAccess}
                    min={formik.values.header.date}
                    max={maxValidUntil}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceLookup
                    endpointId={FinancialRepository.Account.snapshot}
                    name='header.accountId'
                    label={labels.account}
                    valueField='reference'
                    displayField='name'
                    valueShow='accountRef'
                    secondValueShow='accountName'
                    formObject={formik.values.header}
                    form={formik}
                    required
                    maxAccess={maxAccess}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    displayFieldWidth={2}
                    onChange={(_, newValue) => {
                      formik.setFieldValue('header.accountName', newValue?.name || '')
                      formik.setFieldValue('header.accountRef', newValue?.reference || '')
                      formik.setFieldValue('header.accountId', newValue?.recordId || null)
                    }}
                    errorCheck={'header.accountId'}
                    />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextArea
                    name='header.notes'
                    label={labels.notes}
                    value={formik.values.header.notes}
                    rows={5}
                    readOnly={isClosed}
                    maxLength={50}
                    maxAccess={maxAccess}
                    onChange={e => formik.setFieldValue('header.notes', e.target.value)}
                    onClear={() => formik.setFieldValue('header.notes', '')}
                    error={formik.touched.header?.notes && Boolean(formik.errors.header?.notes)}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('items', value)}
            value={formik.values.items}
            error={formik.errors.items}
            columns={itemColumns}
            name='items'
            maxAccess={maxAccess}
            allowDelete={false}
            allowAddNewLine={false}
            disabled={isClosed}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

CreditLimitHoldForm.width = 900
CreditLimitHoldForm.height = 560

export default CreditLimitHoldForm