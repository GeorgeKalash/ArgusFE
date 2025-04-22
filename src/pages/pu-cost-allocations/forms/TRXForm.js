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
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'

export default function TRXForm({ labels, access, setStore, store }) {
  const { platformLabels, userDefaultsData } = useContext(ControlContext)
  const { recordId } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const functionId = SystemFunction.CostAllocation

  async function getDefaultPlant() {
    const defaultPlant = userDefaultsData?.list?.find(({ key }) => key === 'plantId')

    return defaultPlant?.value ? parseInt(defaultPlant.value) : null
  }

  const invalidate = useInvalidate({
    endpointId: CostAllocationRepository.PuCostAllocations.page
  })

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: functionId,
    access: access,
    enabled: !recordId
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
    documentType: { key: 'dtId', value: documentType?.dtId },
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
            recordId: res?.recordId,
            isPosted: res?.status == 3
          }))
          formik.setFieldValue('recordId', res.recordId)
          fetchData(res.recordId)
        }
        toast.success(editMode ? platformLabels.Edited : platformLabels.Added)
        invalidate()
      })
    }
  })

  const editMode = !!recordId || formik.values.recordId
  const isClosed = formik.values.wip === 2
  const isPosted = formik.values.status === 3

  useEffect(() => {
    const fetchDataAndSetPlant = async () => {
      if (recordId) {
        await fetchData(recordId)
      } else {
        const defaultPlant = await getDefaultPlant()
        formik.setFieldValue('plantId', defaultPlant)
      }
    }

    fetchDataAndSetPlant()
  }, [])

  async function fetchData(recordId) {
    await getRequest({
      extension: CostAllocationRepository.PuCostAllocations.get,
      parameters: `_recordId=${recordId}`
    }).then(res => {
      setStore(prevStore => ({
        ...prevStore,
        isPosted: res?.record?.status === 3,
        isClosed: res?.record?.wip === 2
      }))
      formik.setValues({
        ...res.record,
        date: formatDateFromApi(res?.record?.date)
      })
    })
  }

  const onPost = async () => {
    const data = {
      ...formik.values,
      date: formatDateToApi(formik.values.date)
    }
    await postRequest({
      extension: CostAllocationRepository.PuCostAllocations.post,
      record: JSON.stringify(data)
    }).then(async () => {
      await fetchData(data.recordId)
      toast.success(platformLabels.Posted)
      invalidate()
    })
  }

  const onUnpost = async () => {
    const data = {
      ...formik.values,
      date: formatDateToApi(formik.values.date)
    }

    await postRequest({
      extension: CostAllocationRepository.PuCostAllocations.unpost,
      record: JSON.stringify(data)
    }).then(async res => {
      await fetchData(res.recordId)
      toast.success(platformLabels.Unposted)
      invalidate()
    })
  }

  async function onClose() {
    const data = {
      ...formik.values,
      date: formatDateToApi(formik.values.date)
    }

    await postRequest({
      extension: CostAllocationRepository.PuCostAllocations.close,
      record: JSON.stringify(data)
    }).then(async res => {
      await fetchData(res.recordId)
      toast.success(platformLabels.Closed)
      invalidate()
    })
  }

  async function onReopen() {
    const data = {
      ...formik.values,
      date: formatDateToApi(formik.values.date)
    }

    await postRequest({
      extension: CostAllocationRepository.PuCostAllocations.reopen,
      record: JSON.stringify(data)
    }).then(async res => {
      await fetchData(res.recordId)
      toast.success(platformLabels.Reopened)
      invalidate()
    })
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
      key: 'Close',
      condition: !isClosed,
      onClick: onClose,
      disabled: !editMode || isPosted
    },
    {
      key: 'Reopen',
      condition: isClosed,
      onClick: onReopen,
      disabled: !editMode || isPosted
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
      functionId={functionId}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      actions={actions}
      disabledSubmit={isClosed}
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
                  formik.setFieldValue('dtId', newValue?.recordId || ''), changeDT(newValue)
                }}
                readOnly={editMode}
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
                readOnly={isClosed}
                error={formik.touched.plantId && Boolean(formik.errors.plantId)}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomTextField
                name='reference'
                label={labels.reference}
                value={formik.values.reference}
                rows={2}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                readOnly={editMode}
                onClear={() => formik.setFieldValue('reference', '')}
                error={formik.touched.reference && Boolean(formik.errors.reference)}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomNumberField
                name='baseAmount'
                label={labels.amount}
                value={formik.values.baseAmount}
                maxAccess={maxAccess}
                readOnly
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
                onClear={() => formik.setFieldValue('date', null)}
                readOnly={isClosed}
                error={formik.touched.date && Boolean(formik.errors.date)}
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
                readOnly={isClosed}
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
