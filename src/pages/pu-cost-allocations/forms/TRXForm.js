import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useForm } from 'src/hooks/form'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { CostAllocationRepository } from 'src/repositories/CostAllocationRepository'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import { SystemRepository } from 'src/repositories/SystemRepository'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { SystemFunction } from 'src/resources/SystemFunction'

export default function TRXForm({ labels, maxAccess, setStore, store }) {
  const { platformLabels } = useContext(ControlContext)
  const { recordId } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const functionId = SystemFunction.CostAllocation

  const invalidate = useInvalidate({
    endpointId: CostAllocationRepository.PuCostAllocations.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      plantId: null,
      baseAmount: 0.0,
      notes: '',
      wip: 1,
      dtId: null,
      reference: '',
      status: 1,
      releaseStatus: null,
      date: new Date()
    },
    maxAccess,
    enableReinitialize: false,
    validateOnChange: false,
    validationSchema: yup.object({
      reference: yup.string().required(),
      date: yup.string().required()
    }),
    onSubmit: async obj => {
      const data = {
        ...obj,
        date: formatDateToApi(obj.date)
      }

      await postRequest({
        extension: CostAllocationRepository.PuCostAllocations.set,
        record: JSON.stringify(data)
      }).then(res => {
        if (!recordId) {
          setStore(prevStore => ({
            ...prevStore,
            recordId: res.recordId
          }))
          formik.setFieldValue('recordId', res.recordId)
          toast.success(platformLabels.Added)
        } else {
          toast.success(platformLabels.Edited)
        }
        invalidate()
      })
    }
  })

  const isPosted = formik.values.status === 3
  const editMode = !!recordId || formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: CostAllocationRepository.PuCostAllocations.get,
          parameters: `_recordId=${recordId}`
        })

        formik.setValues({
          ...res.record,
          date: formatDateFromApi(res.record.date)
        })

        setStore(prevStore => ({
          ...prevStore,
          data: {
            ...res.record,
            date: formatDateFromApi(res.record.date)
          }
        }))
      }
    })()
  }, [])

  const onPost = async () => {
    const data = {
      ...formik.values,
      date: formatDateToApi(formik.values.date)
    }

    const res = await postRequest({
      extension: CostAllocationRepository.PuCostAllocations.post,
      record: JSON.stringify(data)
    })

    if (res?.recordId) {
      toast.success(platformLabels.Posted)
      invalidate()

      const getRes = await getRequest({
        extension: CostAllocationRepository.PuCostAllocations.get,
        parameters: `_recordId=${formik.values.recordId}`
      })

      getRes.record.date = formatDateFromApi(getRes.record.date)
      formik.setValues(getRes.record)
    }
  }

  const actions = [
    {
      key: 'GL',
      condition: true,
      onClick: 'onClickGL',
      disabled: !editMode
    },
    {
      key: 'IV',
      condition: true,
      onClick: 'onInventoryTransaction',
      disabled: !editMode || !isPosted
    },
    {
      key: 'Post',
      condition: true,
      onClick: onPost,
      disabled: !editMode || formik.values.status !== 1
    },
    {
      key: 'Attachment',
      condition: true,
      onClick: 'onClickAttachment',
      disabled: !editMode
    }
  ]

  return (
    <FormShell
      resourceId={ResourceIds.PuCostAllocation}
      functionId={SystemFunction.CostAllocation}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      actions={actions}
      disabledSubmit={isPosted}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <ResourceComboBox
                endpointId={SystemRepository.DocumentType.qry}
                parameters={`_startAt=0&_pageSize=1000&_dgId=${functionId}`}
                name='dtId'
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
                  formik.setFieldValue('dtId', newValue?.recordId || '')
                }}
                error={formik.touched.dtId && Boolean(formik.errors.dtId)}
              />
            </Grid>
            <Grid item xs={6}>
              <ResourceComboBox
                endpointId={SystemRepository.Plant.qry}
                name='plantId'
                label={labels.plant}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'plant Ref' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('plantId', newValue?.recordId || '')
                }}
                error={formik.touched.plantId && Boolean(formik.errors.plantId)}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomTextField
                name='reference'
                label={labels.reference}
                value={formik.values.reference}
                required
                rows={2}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('reference', '')}
                error={formik.touched.reference && Boolean(formik.errors.reference)}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomNumberField
                name='baseAmount'
                required
                label={labels.amount}
                value={formik.values.baseAmount}
                maxAccess={maxAccess}
                onChange={e => formik.setFieldValue('baseAmount', e.target.value)}
                onClear={() => formik.setFieldValue('baseAmount', '')}
                error={formik.touched.baseAmount && Boolean(formik.errors.baseAmount)}
                maxLength={10}
                decimalScale={2}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomDatePicker
                name='date'
                required
                label={labels.date}
                value={formik?.values?.date}
                onChange={formik.setFieldValue}
                editMode={editMode}
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('date', '')}
                error={formik.touched.date && Boolean(formik.errors.date)}
                helperText={formik.touched.date && formik.errors.date}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomTextArea
                name='notes'
                label={labels.notes}
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
