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
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { RepairAndServiceRepository } from '@argus/repositories/src/repositories/RepairAndServiceRepository'
import { useDocumentType } from '@argus/shared-hooks/src/hooks/documentReferenceBehaviors'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import { formatDateFromApi, formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import CustomTextArea from '@argus/shared-ui/src/components/Inputs/CustomTextArea'

export default function RepairRequestForm({ labels, access, recordId, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: RepairAndServiceRepository.RepairRequest.page
  })

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.RepairRequest,
    access,
    enabled: !recordId
  })

  const { formik } = useForm({
    maxAccess,
    documentType: { key: 'dtId', value: documentType?.dtId },
    initialValues: {
      recordId: null,
      dtId: null,
      reference: '',
      employeeId: null,
      equipmentId: null,
      repairNameId: null,
      dueDate: new Date(),
      date: new Date(),
      repairTypeId: null,
      priority: null,
      description: '',
      status: 1
    },
    validationSchema: yup.object({
      employeeId: yup.number().required(),
      equipmentId: yup.number().required(),
      repairNameId: yup.number().required(),
      dueDate: yup.date().required(),
      date: yup.date().required(),
      repairTypeId: yup.number().required()
    }),
    onSubmit: async obj => {
      const response = await postRequest({
        extension: RepairAndServiceRepository.RepairRequest.set,
        record: JSON.stringify({
          ...obj,
          date: formatDateToApi(obj.date),
          dueDate: formatDateToApi(obj.dueDate)
        })
      })

      toast.success(!obj.recordId ? platformLabels.Added : platformLabels.Edited)
      formik.setFieldValue('recordId', response.recordId)

      invalidate()
      window.close()
    }
  })

  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: RepairAndServiceRepository.RepairRequest.get,
          parameters: `_recordId=${recordId}`
        })

        formik.setValues({
          ...res.record,
          date: formatDateFromApi(res.record.date),
          dueDate: formatDateFromApi(res.record.dueDate)
        })
      }
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.RepairRequest} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.DocumentType.qry}
                parameters={`_startAt=0&_pageSize=1000&_dgId=${SystemFunction.RepairRequest}`}
                name='dtId'
                label={labels.docType}
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
                  await changeDT(newValue)
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
                onClear={() => formik.setFieldValue('reference', '')}
                error={formik.touched.reference && Boolean(formik.errors.reference)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={RepairAndServiceRepository.Employee.snapshot}
                valueField='reference'
                displayField='name'
                name='employeeId'
                label={labels.employee}
                form={formik}
                required
                firstFieldWidth={4}
                displayFieldWidth={3}
                valueShow='employeeRef'
                secondValueShow='employeeName'
                maxAccess={maxAccess}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'firstName', value: 'First Name' },
                  { key: 'lastName', value: 'Last Name' }
                ]}
                onChange={async (_, newValue) => {
                  formik.setFieldValue('employeeName', newValue ? newValue.firstName + ' ' + newValue.lastName : '')
                  formik.setFieldValue('employeeRef', newValue?.reference || '')
                  formik.setFieldValue('employeeId', newValue?.recordId || null)
                }}
                errorCheck={'employeeId'}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={RepairAndServiceRepository.Equipment.snapshot}
                valueField='reference'
                displayField='name'
                name='equipmentId'
                label={labels.equipment}
                form={formik}
                required
                firstFieldWidth={4}
                displayFieldWidth={3}
                valueShow='equipmentRef'
                secondValueShow='equipmentName'
                maxAccess={maxAccess}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'description', value: 'Description' }
                ]}
                onChange={async (event, newValue) => {
                  formik.setFieldValue('equipmentName', newValue?.description || '')
                  formik.setFieldValue('equipmentRef', newValue?.reference || '')
                  formik.setFieldValue('equipmentId', newValue?.recordId || null)
                }}
                errorCheck={'equipmentId'}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={RepairAndServiceRepository.RepairName.qry}
                name='repairNameId'
                label={labels.repair}
                valueField='recordId'
                maxAccess={maxAccess}
                displayField='name'
                values={formik.values}
                required
                onChange={(_, newValue) => {
                  formik.setFieldValue('repairNameId', newValue?.recordId || null)
                }}
                error={formik.touched.repairNameId && Boolean(formik.errors.repairNameId)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='date'
                required
                label={labels.date}
                value={formik?.values?.date}
                onChange={formik.setFieldValue}
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('date', null)}
                error={formik.touched.date && Boolean(formik.errors.date)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='dueDate'
                required
                label={labels.dueBy}
                value={formik?.values?.dueDate}
                onChange={formik.setFieldValue}
                maxAccess={maxAccess}
                readOnly
                onClear={() => formik.setFieldValue('dueDate', null)}
                error={formik.touched.dueDate && Boolean(formik.errors.dueDate)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={RepairAndServiceRepository.RepairType.qry}
                name='repairTypeId'
                label={labels.repairType}
                valueField='recordId'
                maxAccess={maxAccess}
                displayField='name'
                required
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('repairTypeId', newValue?.recordId || null)
                }}
                error={formik.touched.repairTypeId && Boolean(formik.errors.repairTypeId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.RS_PRIORITY}
                name='priority'
                label={labels.priority}
                valueField='key'
                displayField='value'
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('priority', newValue?.key || null)
                }}
                maxAccess={maxAccess}
                error={formik.touched.priority && Boolean(formik.errors.priority)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextArea
                name='description'
                label={labels.notes}
                value={formik.values.description}
                maxAccess={maxAccess}
                rows={3}
                onChange={e => formik.setFieldValue('description', e.target.value)}
                onClear={() => formik.setFieldValue('description', '')}
                error={formik.touched.description && Boolean(formik.errors.description)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
