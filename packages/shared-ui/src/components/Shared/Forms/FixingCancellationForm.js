import { Grid} from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import { formatDateFromApi, formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import { useDocumentType } from '@argus/shared-hooks/src/hooks/documentReferenceBehaviors'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { BrokerageTradingRepository } from '@argus/repositories/src/repositories/BrokerageTradingRepository'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'
import useResourceParams from '@argus/shared-hooks/src/hooks/useResourceParams'
import { useRecordLock } from '@argus/shared-hooks/src/hooks/useRecordLock'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { ResourceLookup } from '../ResourceLookup'

export default function FixingCancellationForm({ recordId, functionId, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const getResourceId = functionId => {
    switch (functionId) {
      case SystemFunction.FixingSalesCancellation:
        return ResourceIds.FixingSalesCancellation
      case SystemFunction.FixingPurchaseCancellation:
        return ResourceIds.FixingPurchaseCancellation
      default:
        return null
    }
  }

  const { labels, access } = useResourceParams({
    datasetId: ResourceIds.FixingSalesCancellation,
    DatasetIdAccess: getResourceId(parseInt(functionId)),
    editMode: !!recordId
  })
  useSetWindow({ title: SystemFunction.FixingPurchaseCancellation == functionId ? labels.fixingPurchaseCancellation : labels.fixingSalesCancellation, window })

  const BrokerageTradingRepositories = {
    [SystemFunction.FixingPurchaseCancellation]: BrokerageTradingRepository.FixingPurchaseCancellation,
    [SystemFunction.FixingSalesCancellation]: BrokerageTradingRepository.FixingSalesCancellation
  }
  const getEndpoint = (functionId) => BrokerageTradingRepositories[Number(functionId)] ?? null
  const snapshotInfo = {
    [SystemFunction.FixingSalesCancellation]: {
      snapshot: BrokerageTradingRepository.FixingSales.snapshot,
      functionId: SystemFunction.FixingSales
    },
    [SystemFunction.FixingPurchaseCancellation]: {
      snapshot: BrokerageTradingRepository.FixingPurchases.snapshot,
      functionId: SystemFunction.FixingPurchases
    }
  }
  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId,
    access,
    enabled: !recordId
  })

  const invalidate = useInvalidate({
    endpointId: getEndpoint(functionId).page
  })


  const { formik } = useForm({
    behavior: { key: 'dtId', value: documentType?.dtId, fieldBehavior: documentType?.reference },
    initialValues: {
      recordId: null,
      functionId,
      date: new Date(),
      dtId: null,
      reference: '',
      fixId: null,
      fixReference: '',
      status: 1,
    },
    maxAccess,
    validationSchema: yup.object({
      date: yup.date().required(),
      fixId: yup.string().required()
    }),
    onSubmit: async obj => {
      const response = await postRequest({
        extension: getEndpoint(functionId).set,
        record: JSON.stringify({ ...obj, date: formatDateToApi(obj?.date)})
      })
      toast.success(editMode ? platformLabels.Edited : platformLabels.Added)
      refetchForm(response?.recordId)
      invalidate()
    }
  })

  const editMode = !!formik.values?.recordId
  const isPosted = formik.values.status == 3

  const { releaseLock } = useRecordLock({
    recordId: recordId,
    reference: formik?.values?.reference,
    resourceId: getResourceId(parseInt(functionId)),
    enabled: !!recordId && !isPosted
  })

  async function refetchForm(recordId) {
    if (!recordId) return

    const res = await getRequest({
      extension: getEndpoint(functionId).get,
      parameters: `_recordId=${recordId}`
    })

    formik.resetForm({
      values: {
        ...res?.record,
        date: formatDateFromApi(res?.record?.date),
        currencyId_metalId:
          res?.record?.currencyId && res?.record?.metalId
            ? `${res.record.currencyId}${res.record.metalId}`
            : null
      }
    })
  }

  const onPost = async () => {
    await postRequest({
      extension: getEndpoint(functionId).post,
      record: JSON.stringify({ ...formik.values, date: formatDateToApi(formik.values.date) })
    })

    toast.success(platformLabels.Posted)
    await releaseLock()
    invalidate()
    refetchForm(formik.values.recordId)
  }

  const actions = [
    {
      key: 'Locked',
      condition: isPosted,
      disabled: true
    },
    {
      key: 'Unlocked',
      condition: !isPosted,
      onClick: onPost,
      disabled: !editMode 
    }
  ]
  
  useEffect(() => { refetchForm(recordId) }, [])

  return (
    <FormShell
      resourceId={getResourceId(parseInt(functionId))}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      functionId={functionId}
      disabledSubmit={isPosted}
      actions={actions}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.DocumentType.qry}
                parameters={`_startAt=0&_pageSize=1000&_dgId=${functionId}`}
                filter={!editMode ? item => item.activeStatus === 1 : undefined}
                name='dtId'
                label={labels.docType}
                readOnly={editMode}
                valueField='recordId'
                displayField='name'
                values={formik.values}
                onChange={(_, newValue) => {
                  changeDT(newValue)
                  
                  formik.setFieldValue('dtId', newValue?.recordId || null)
                }}
                error={formik.touched.dtId && Boolean(formik.errors.dtId)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='reference'
                label={labels.reference}
                value={formik.values.reference}
                readOnly={editMode}
                maxAccess={!editMode && maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('reference', '')}
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
                readOnly={isPosted}
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('date', null)}
                error={formik.touched.date && Boolean(formik.errors.date)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={snapshotInfo[Number(functionId)].snapshot}
                parameters= {{
                  _functionId: `${snapshotInfo[Number(functionId)].functionId}`
                }}
                name='fixId'
                label={labels.fixingRef}
                form={formik}
                valueField='reference'
                displayField='reference'
                valueShow='fixReference'
                readOnly={isPosted}
                required
                secondDisplayField={false}
                onChange={(_, newValue) => {
                  formik.setFieldValue('fixReference', newValue?.fixingRef || '')
                  formik.setFieldValue('fixId', newValue?.recordId || null)
                }}
                errorCheck={'fixId'}
                maxAccess={maxAccess}
              />
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}

FixingCancellationForm.width = 500
FixingCancellationForm.height = 400
