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
      genVar: yup.string().required()
    }),
    onSubmit: async obj => {
      try {
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
        } else toast.success(platformLabels.Edited)

        invalidate()
      } catch (error) {}
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

  async function getCycleCounts(recordId) {
    return await getRequest({
      extension: SCRepository.StockCount.get,
      parameters: `_recordId=${recordId}`
    })
  }

  async function refetchForm(recordId) {
    const res2 = await getCycleCounts(recordId)
    res2.record.date = formatDateFromApi(res2.record.date)

    return res2;
  }

  const isClosed = formik.values.wip === 2
  const isPosted = formik.values.status === 3

  const onClose = async recId => {
    try {
      const res = await postRequest({
        extension: SCRepository.StockCount.close,
        record: JSON.stringify({ recordId: recId })
      })

      if (res.recordId) {
        toast.success(platformLabels.Closed)
        invalidate()
        await refetchForm(res.recordId)
      }
    } catch (error) {}
  }

  async function onReopen() {
    try {
      const res = await postRequest({
        extension: SCRepository.StockCount.reopen,
        record: JSON.stringify(formik.values)
      })

      if (res.recordId) {
        toast.success(platformLabels.Reopened)
        invalidate()
        await refetchForm(res.recordId)
      }
    } catch (error) {}
  }

  const onPost = async () => {
    try {
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

      window.close()
    } catch (error) {}
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
      onClick: () => {
        onClose(formik.values.recordId)
      },
      disabled: isClosed || !editMode
    },
    {
      key: 'Reopen',
      condition: isClosed,
      onClick: onReopen,
      disabled: !isClosed || !editMode
    },
    {
      key: 'Post',
      condition: true,
      onClick: onPost,
      disabled: !isPosted
    }
  ]

  useEffect(() => {
    ;(async function () {
      try {
        if (recordId) {
          const res = await getRequest({
            extension: SCRepository.StockCount.get,
            parameters: `_recordId=${recordId}`
          })

          formik.setValues({
            ...res.record,
            date: formatDateFromApi(res.record.date)
          })
        }
      } catch (error) {}
    })()
  }, [])

  const disable = isPosted || isClosed

  return (
    <FormShell
      resourceId={ResourceIds.StockCounts}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      actions={actions}
      disabledSubmit={disable}
      disableSubmitAndClear={disable}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.DocumentType.qry}
                parameters={`_startAt=0&_pageSize=1000&_dgId=${SystemFunction.StockCount}`}
                name='dtId'
                readOnly={editMode || disable}
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
                readOnly={editMode || disable}
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
                readOnly={editMode || disable}
                error={formik.touched.date && Boolean(formik.errors.date)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.Plant.qry}
                name='plantId'
                label={labels.plant}
                valueField='recordId'
                readOnly={editMode || disable}
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('plantId', newValue ? newValue?.recordId : '')
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
                readOnly={disable}
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
                readOnly={editMode || disable}
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
                readOnly={editMode || disable}
                displayFieldWidth={2}
                valueShow='clientRef'
                secondValueShow='clientName'
                maxAccess={maxAccess}
                columnsInDropDown={[
                  { key: 'reference', value: 'Ref.' },
                  { key: 'name', value: 'Name' }
                ]}
                onChange={async (event, newValue) => {
                  if (newValue?.status == -1) {
                    stackError({
                      message: `Chosen Client Must Be Active.`
                    })

                    return
                  }
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
                readOnly={editMode || disable}
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
                readOnly={editMode || disable}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik && formik.setFieldValue('genVar', newValue ? newValue.key : '')
                }}
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
