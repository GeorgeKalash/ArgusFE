import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import { formatDateFromApi, formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import { useDocumentType } from '@argus/shared-hooks/src/hooks/documentReferenceBehaviors'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { ManufacturingRepository } from '@argus/repositories/src/repositories/ManufacturingRepository'
import { FoundryRepository } from '@argus/repositories/src/repositories/FoundryRepository'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'

export default function CuttingForm({ labels, access, setStore, store }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { recordId } = store

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.Cutting,
    access,
    enabled: !recordId
  })

  const invalidate = useInvalidate({
    endpointId: FoundryRepository.Cutting.page
  })

  const { formik } = useForm({
    behavior: { key: 'dtId', value: documentType?.dtId, fieldBehavior: documentType?.reference },
    initialValues: {
      recordId,
      dtId: null,
      reference: '',
      date: new Date(),
      castingId: null,
      laborId: null,
      status: 1
    },
    maxAccess,
    validationSchema: yup.object({
      date: yup.date().required(),
      castingId: yup.string().required(),
      laborId: yup.string().required()
    }),
    onSubmit: async obj => {
      const res = await postRequest({
        extension: FoundryRepository.Cutting.set,
        record: JSON.stringify({
          ...obj,
          date: formatDateToApi(obj.date)
        })
      })

      toast.success(recordId ? platformLabels.Edited : platformLabels.Added)
      refetchForm(res?.recordId)
      invalidate()
    }
  })

  const editMode = !!formik.values.recordId
  const isPosted = formik.values.status == 3

  function applyCastingToStore(source) {
    setStore(prevStore => ({
      ...prevStore,
      castingId: source?.castingId || null,
      metalInfo: {
        metalId: source?.metalId || null,
        metalColorId: source?.metalColorId || null
      },
      castingInfo: {
        ...prevStore.castingInfo,
        outputWgt: source?.outputWgt ?? 0,
        inputWgt: source?.inputWgt ?? 0,
        scrapWgt: source?.scrapWgt ?? 0,
        loss: source?.loss ?? 0,
      }
    }))
  }

  async function refetchForm(recordId) {
    const res = await getRequest({
      extension: FoundryRepository.Cutting.get,
      parameters: `_recordId=${recordId}`
    })

    formik.resetForm({
      values: {
        ...res.record,
        date: formatDateFromApi(res?.record?.date)
      }
    })

    setStore(prevStore => ({
      ...prevStore,
      recordId: res?.record?.recordId,
      isPosted: res?.record?.status === 3
    }))

    applyCastingToStore(res?.record)
  }

  async function onPost() {
    const res = await postRequest({
      extension: FoundryRepository.Cutting.post,
      record: JSON.stringify({
        ...formik.values,
        date: formatDateToApi(formik.values.date)
      })
    })
    toast.success(platformLabels.Posted)
    invalidate()
    refetchForm(res.recordId)
  }

  async function onUnpost() {
    const res = await postRequest({
      extension: FoundryRepository.Cutting.unpost,
      record: JSON.stringify({
        ...formik.values,
        date: formatDateToApi(formik.values.date)
      })
    })
    toast.success(platformLabels.Unposted)
    invalidate()
    refetchForm(res.recordId)
  }

  const actions = [
    {
      key: 'Locked',
      condition: isPosted,
      onClick: onUnpost,
      disabled: !editMode
    },
    {
      key: 'Unlocked',
      condition: !isPosted,
      onClick: onPost,
      disabled: !editMode
    }
  ]

  useEffect(() => {
    if (recordId) refetchForm(recordId)
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.FoCuttings}
      functionId={SystemFunction.Cutting}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      previewReport={editMode}
      actions={actions}
      disabledSubmit={isPosted}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.DocumentType.qry}
                parameters={`_startAt=0&_pageSize=1000&_dgId=${SystemFunction.Cutting}`}
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
                onChange={async (_, newValue) => {
                  changeDT(newValue)
                  formik.setFieldValue('dtId', newValue?.recordId || null)
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
                onClear={() => formik.setFieldValue('reference', null)}
                error={formik.touched.reference && Boolean(formik.errors.reference)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='date'
                required
                label={labels.date}
                value={formik.values.date}
                onChange={formik.setFieldValue}
                maxAccess={maxAccess}
                readOnly={isPosted}
                onClear={() => formik.setFieldValue('date', null)}
                error={formik.touched.date && Boolean(formik.errors.date)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={FoundryRepository.Casting.snapshot2}
                name='castingId'
                label={labels.casting}
                secondDisplayField={false}
                valueField='reference'
                displayField='reference'
                required
                valueShow='castingRef'
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'date', value: 'Date', type: 'date' },
                  { key: 'metalRef', value: 'Metal' }
                ]}
                form={formik}
                readOnly={isPosted}
                onChange={(_, newValue) => {
                  formik.setFieldValue('castingRef', newValue?.reference || null)
                  
                  formik.setFieldValue('castingId', newValue?.recordId || null)
                }}
                errorCheck={'castingId'}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={ManufacturingRepository.Labor.qry}
                parameters={`_startAt=0&_pageSize=10000&_params=`}
                name='laborId'
                required
                readOnly={isPosted}
                label={labels.labor}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                valueField='recordId'
                displayField={['reference', 'name']}
                values={formik.values}
                onChange={(_, newValue) => {
                  formik.setFieldValue('laborId', newValue?.recordId || null)
                }}
                error={formik.touched.laborId && Boolean(formik.errors.laborId)}
                maxAccess={maxAccess}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}