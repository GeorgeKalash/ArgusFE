import { Grid } from '@mui/material'
import { FormControlLabel, Checkbox } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useForm } from 'src/hooks/form'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { ControlContext } from 'src/providers/ControlContext'
import { useInvalidate } from 'src/hooks/resource'
import { SCRepository } from 'src/repositories/SCRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SystemRepository } from 'src/repositories/SystemRepository'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import { DataSets } from 'src/resources/DataSets'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { SaleRepository } from 'src/repositories/SaleRepository'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'
import { SystemFunction } from 'src/resources/SystemFunction'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import WorkFlow from 'src/components/Shared/WorkFlow'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import { useWindow } from 'src/windows'

export default function CycleCountsForm({ labels, maxAccess: access, setStore, store, plantId }) {
  const { recordId } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  const editMode = !!store.recordId

  const invalidate = useInvalidate({
    endpointId: SCRepository.StockCount.qry
  })

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.StockCount,
    access,
    hasDT: false
  })

  const { formik } = useForm({
    initialValues: {
      recordId: recordId || null,
      reference: null,
      dtId: documentType?.dtId,
      date: new Date(),
      plantId: parseInt(plantId),
      notes: '',
      type: 1,
      clientId: null,
      currencyId: null,
      genVar: 1,
      wip: 1,
      status: 1,
      disableItemDuplicate: false
    },
    maxAccess,
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      genVar: yup.string().required(),
      plantId: yup.number().required(),
      clientId: yup
        .string()
        .nullable()
        .test('', function (value) {
          const { type } = this.parent
          if (type === 2 || type === '2') {
            return !!value
          }

          return true
        }),
      currencyId: yup
        .string()
        .nullable()
        .test('', function (value) {
          const { type } = this.parent
          if (type === 2 || type === '2') {
            return !!value
          }

          return true
        })
    }),
    onSubmit: async obj => {
      const response = await postRequest({
        extension: SCRepository.StockCount.set,
        record: JSON.stringify(obj)
      })

      if (!obj.recordId) {
        setStore(prevStore => ({
          ...prevStore,
          recordId: response.recordId
        }))
        toast.success(platformLabels.Added)
        formik.setFieldValue('recordId', response.recordId)
        const res2 = await getData(response.recordId)

        formik.setValues({
          ...res2.record,
          date: formatDateFromApi(res2.record.date)
        })
      } else toast.success(platformLabels.Edited)

      invalidate()
    }
  })

  const onWorkFlowClick = async () => {
    stack({
      Component: WorkFlow,
      props: {
        functionId: SystemFunction.StockCount,
        recordId: formik.values.recordId
      },
      width: 950,
      title: 'Workflow'
    })
  }

  async function getData(recordId) {
    return await getRequest({
      extension: SCRepository.StockCount.get,
      parameters: `_recordId=${recordId}`
    })
  }

  async function refetchForm(recordId) {
    const res2 = await getData(recordId)
    res2.record.date = formatDateFromApi(res2.record.date)

    return res2
  }

  const isClosed = formik.values.wip === 2
  const isPosted = formik.values.status === 3

  const onClose = async recId => {
    const res = await postRequest({
      extension: SCRepository.StockCount.close,
      record: JSON.stringify({ recordId: recId })
    })

    toast.success(platformLabels.Closed)
    invalidate()
    const res2 = await refetchForm(res.recordId)
    formik.setValues(res2.record)
    setStore(prevStore => ({
      ...prevStore,
      isClosed: res2.record.wip === 2
    }))
  }

  async function onReopen() {
    const res = await postRequest({
      extension: SCRepository.StockCount.reopen,
      record: JSON.stringify(formik.values)
    })

    toast.success(platformLabels.Reopened)
    invalidate()
    const res2 = await refetchForm(res.recordId)
    formik.setValues(res2.record)
    setStore(prevStore => ({
      ...prevStore,
      isClosed: res2.record.wip === 2
    }))
  }

  const onPost = async () => {
    const copy = { ...formik.values }
    copy.date = formatDateToApi(copy.date)

    const res = await postRequest({
      extension: SCRepository.StockCount.post,
      record: JSON.stringify(copy)
    })

    toast.success(platformLabels.Posted)
    invalidate()
    const res2 = await refetchForm(res.recordId)
    formik.setValues(res2.record)
    setStore(prevStore => ({
      ...prevStore,
      isPosted: res2.record.status === 3
    }))
  }

  const onUnpost = async () => {
    const copy = { ...formik.values }
    copy.date = formatDateToApi(copy.date)

    const res = await postRequest({
      extension: SCRepository.StockCount.unpost,
      record: JSON.stringify(copy)
    })

    toast.success(platformLabels.Unposted)
    invalidate()
    const res2 = await refetchForm(res.recordId)
    formik.setValues(res2.record)
    setStore(prevStore => ({
      ...prevStore,
      isPosted: res2.record.status !== 3
    }))
  }

  const actions = [
    {
      key: 'WorkFlow',
      condition: true,
      onClick: onWorkFlowClick,
      disabled: !editMode
    },
    {
      key: 'Close',
      condition: !isClosed,
      onClick: () => onClose(formik.values.recordId),
      disabled: isPosted || isClosed || !editMode
    },
    {
      key: 'Reopen',
      condition: isClosed,
      onClick: onReopen,
      disabled: !isClosed || isPosted
    },
    {
      key: 'Unlocked',
      condition: !isPosted,
      onClick: onPost,
      disabled: !editMode || !isClosed
    },
    {
      key: 'Locked',
      condition: isPosted,
      onClick: 'onUnpostConfirmation',
      onSuccess: onUnpost,
      disabled: !editMode || !isClosed
    }
  ]

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getData(recordId)

        setStore(prevStore => ({
          ...prevStore,
          isPosted: res.record.status === 3,
          isClosed: res.record.wip === 2
        }))

        formik.setValues({
          ...res.record,
          date: formatDateFromApi(res.record.date)
        })
      }
    })()
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.StockCounts}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      actions={actions}
      disabledSubmit={isPosted || isClosed}
      disableSubmitAndClear={isPosted || isClosed}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.DocumentType.qry}
                parameters={`_startAt=0&_pageSize=1000&_dgId=${SystemFunction.StockCount}`}
                name='dtId'
                readOnly={editMode || isPosted || isClosed}
                label={labels.documentType}
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
                value={formik?.values?.reference}
                maxAccess={!editMode && maxAccess}
                maxLength='30'
                readOnly={editMode || isPosted || isClosed}
                onChange={formik.handleChange}
                error={formik.touched.reference && Boolean(formik.errors.reference)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='date'
                label={labels.date}
                value={formik.values?.date}
                onChange={formik.setFieldValue}
                onClear={() => formik.setFieldValue('date', '')}
                readOnly={editMode || isPosted || isClosed}
                error={formik.touched.date && Boolean(formik.errors.date)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.Plant.qry}
                name='plantId'
                label={labels.plant}
                required
                valueField='recordId'
                readOnly={editMode || isPosted || isClosed}
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('plantId', newValue ? newValue?.recordId : null)
                }}
                error={formik.touched.plantId && Boolean(formik.errors.plantId)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextArea
                name='notes'
                type='text'
                label={labels.notes}
                value={formik.values?.notes}
                rows={3}
                readOnly={isPosted || isClosed}
                maxAccess={maxAccess}
                onChange={e => formik.setFieldValue('notes', e.target.value)}
                onClear={() => formik.setFieldValue('notes', '')}
                error={formik.touched.notes && Boolean(formik.errors.notes)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.SC_TYPE}
                name='type'
                label={labels.type}
                values={formik.values}
                valueField='key'
                displayField='value'
                readOnly={editMode || isPosted || isClosed}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik && formik.setFieldValue('type', newValue ? newValue.key : '')
                }}
                error={formik.touched.type && Boolean(formik.errors.type)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={SaleRepository.Client.snapshot}
                parameters={{
                  _category: 0
                }}
                valueField='reference'
                displayField='name'
                name='clientId'
                label={labels.client}
                form={formik}
                readOnly={editMode || isPosted || isClosed || formik.values.type === '1' || formik.values.type === 1}
                required={formik.values.type === '2' || formik.values.type === 2}
                displayFieldWidth={2}
                valueShow='clientRef'
                secondValueShow='clientName'
                maxAccess={maxAccess}
                columnsInDropDown={[
                  { key: 'reference', value: 'Ref.' },
                  { key: 'name', value: 'Name' }
                ]}
                onChange={async (event, newValue) => {
                  formik.setFieldValue('clientId', newValue ? newValue.recordId : '')
                  formik.setFieldValue('clientName', newValue ? newValue.name : '')
                  formik.setFieldValue('clientRef', newValue ? newValue.reference : '')
                }}
                errorCheck={'clientId'}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.Currency.qry}
                name='currencyId'
                label={labels.currency}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                readOnly={editMode || isPosted || isClosed || formik.values.type === '1' || formik.values.type === 1}
                required={formik.values.type === '2' || formik.values.type === 2}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('currencyId', newValue?.recordId || 0)
                }}
                error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.GENERATE_VARIATIONS}
                name='genVar'
                label={labels.generateVariations}
                values={formik.values}
                valueField='key'
                displayField='value'
                readOnly={editMode || isPosted || isClosed}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik && formik.setFieldValue('genVar', newValue ? newValue.key : '')
                }}
                required
                error={formik.touched.genVar && Boolean(formik.errors.genVar)}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name='disableItemDuplicate'
                    maxAccess={maxAccess}
                    checked={formik.values?.disableItemDuplicate}
                    onChange={formik.handleChange}
                    disabled={isClosed}
                  />
                }
                label={labels.disableItemDuplicate}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
