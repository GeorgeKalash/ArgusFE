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

  const { formik } = useForm({
    maxAccess,
    behavior: { key: 'dtId', value: documentType?.dtId, fieldBehavior: documentType?.reference },
    initialValues: {
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
    validationSchema: yup.object({
      date: yup.date().required(),
      accountId: yup.number().required(),
      validUntil: yup
        .date()
        .required()
    }),
    onSubmit: async obj => {
      const res = await postRequest({
        extension: FinancialRepository.CreditLimitHold.set,
        record: JSON.stringify({
          ...obj,
          date: formatDateToApi(obj.date),
          validUntil: formatDateToApi(obj.validUntil)
        })
      })
      toast.success(obj.recordId ? platformLabels.Edited : platformLabels.Added)

      refetchForm(res.recordId)
      invalidate()
    }
  })

  const editMode = !!formik.values.recordId
  const isClosed = formik.values.wip === 2

  async function refetchForm(recordId) {
    const { record } = await getRequest({
      extension: FinancialRepository.CreditLimitHold.get,
      parameters: `_recordId=${recordId}`
    })

    formik.resetForm({
      values: {
        ...record,
        date: formatDateFromApi(record?.date),
        validUntil: formatDateFromApi(record?.validUntil)
      }
    })
  }

  useEffect(() => {
    if (recordId) refetchForm(recordId)
  }, [])

  async function onWorkFlow() {
    stack({
      Component: WorkFlow,
      props: {
        functionId: SystemFunction.CreditLimitHold,
        recordId: formik.values.recordId
      }
    })
  }

  async function onReopen() {
    await postRequest({
      extension: FinancialRepository.CreditLimitHold.reopen,
      record: JSON.stringify({ recordId: formik.values.recordId })
    })

    toast.success(platformLabels.Reopened)
    invalidate()
    refetchForm(formik.values.recordId)
  }

  async function onClose() {
    await postRequest({
      extension: FinancialRepository.CreditLimitHold.close,
      record: JSON.stringify({ recordId: formik.values.recordId })
    })
    toast.success(platformLabels.Closed)
    invalidate()
    refetchForm(formik.values.recordId)
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
    }
  ]

  const maxValidUntil = formik.values.date
  ? new Date(
      new Date(formik.values.date).setDate(
        new Date(formik.values.date).getDate() + 30
      )
    )
  : null

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
                    name='dtId'
                    label={labels.documentType}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    readOnly={editMode}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    values={formik.values}
                    maxAccess={maxAccess}
                    onChange={(_, newValue) => {
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
                    value={formik?.values?.reference}
                    maxAccess={!editMode && maxAccess}
                    readOnly={editMode}
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
                    readOnly={isClosed}
                    required
                    onChange={(name, value) => {
                      formik.setFieldValue(name, value)
                    }}
                    onClear={() => formik.setFieldValue('date', null)}
                    error={formik.touched.date && Boolean(formik.errors.date)}
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomDatePicker
                    name='validUntil'
                    label={labels.validUntil}
                    value={formik.values?.validUntil}
                    readOnly={isClosed}
                    required
                    onChange={formik.setFieldValue}
                    onClear={() => formik.setFieldValue('validUntil', null)}
                    error={formik.touched.validUntil && Boolean(formik.errors.validUntil)}
                    maxAccess={maxAccess}
                    min={formik.values.date}
                    max={maxValidUntil}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceLookup
                    endpointId={FinancialRepository.Account.snapshot}
                    name='accountId'
                    label={labels.account}
                    valueField='reference'
                    displayField='name'
                    valueShow='accountRef'
                    secondValueShow='accountName'
                    form={formik}
                    required
                    maxAccess={maxAccess}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    displayFieldWidth={2}
                    onChange={(_, newValue) => {
                      formik.setFieldValue('accountName', newValue?.name || '')
                      formik.setFieldValue('accountRef', newValue?.reference || '')
                      
                      formik.setFieldValue('accountId', newValue?.recordId || null)
                    }}
                    errorCheck={'accountId'}
                    />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={6}>
              <CustomTextArea
                name='notes'
                label={labels.notes}
                value={formik.values.notes}
                rows={5}
                readOnly={isClosed}
                maxLength={50}
                maxAccess={maxAccess}
                onChange={e => formik.setFieldValue('notes', e.target.value)}
                onClear={() => formik.setFieldValue('notes', '')}
                error={formik.touched.notes && Boolean(formik.errors.notes)}
              />
            </Grid>
          </Grid>
        </Fixed>
        <Grow />
      </VertLayout>
    </FormShell>
  )
}

CreditLimitHoldForm.width = 800
CreditLimitHoldForm.height = 420

export default CreditLimitHoldForm