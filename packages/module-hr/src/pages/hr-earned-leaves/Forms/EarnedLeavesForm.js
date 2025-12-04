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
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { LoanManagementRepository } from '@argus/repositories/src/repositories/LoanManagementRepository'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { useDocumentType } from '@argus/shared-hooks/src/hooks/documentReferenceBehaviors'
import { formatDateForGetApI, formatDateFromApi, formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import CustomButton from '@argus/shared-ui/src/components/Inputs/CustomButton'
import Table from '@argus/shared-ui/src/components/Shared/Table'

export default function EarnedLeavesForm({ labels, access, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: LoanManagementRepository.EarnedLeave.page
  })

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.EarnedLeaves,
    access
  })

  const { formik } = useForm({
    documentType: { key: 'dtId', value: documentType?.dtId },
    initialValues: {
      recordId,
      dtId: null,
      reference: '',
      date: new Date(),
      lsId: null,
      status: 1,
      items: []
    },
    maxAccess,
    validationSchema: yup.object({
      date: yup.date().required(),
      lsId: yup.number().required()
    }),
    onSubmit: async obj => {
      const copy = {
        ...obj,
        date: formatDateToApi(obj.date)
      }
      delete copy.items

      const updatedRows = obj.items.map((itemDetails, index) => {
        return {
          ...itemDetails,
          seqNo: index + 1
        }
      })

      const itemsGridData = {
        header: copy,
        items: updatedRows
      }

      const response = await postRequest({
        extension: LoanManagementRepository.EarnedLeave.set2,
        record: JSON.stringify(itemsGridData)
      })

      toast.success(!obj.recordId ? platformLabels.Added : platformLabels.Edited)

      getData(response.recordId)
      invalidate()
    }
  })

  const editMode = !!formik.values.recordId
  const isPosted = formik.values.status === 3
  const preview = formik.values.items.length > 0

  const getData = async recordId => {
    const res = await getRequest({
      extension: LoanManagementRepository.EarnedLeave.get2,
      parameters: `_recordId=${recordId}`
    })

    formik.setFieldValue('items', [])
    formik.setValues({
      recordId: res?.record?.header?.recordId,
      ...res?.record?.header,
      date: res?.record?.header?.date ? formatDateFromApi(res?.record?.header.date) : null,
      items:
        res?.record?.items?.map((item, index) => ({
          id: index + 1,
          ...item
        })) || []
    })
  }

  useEffect(() => {
      if (recordId) {
        getData(recordId)
      }
  }, [])

  const onPost = async () => {
    const res = await postRequest({
      extension: LoanManagementRepository.EarnedLeave.post,
      record: JSON.stringify(formik.values)
    })

    toast.success(platformLabels.Posted)
    invalidate()
    getData(res?.recordId)
  }

  const columns = [
    {
      field: 'employeeName',
      headerName: labels.employee,
      flex: 1
    },
    {
      field: 'effectiveDate',
      headerName: labels.days,
      type: 'date',
      flex: 1
    }
  ]

  const onPreview = async () => {
    if (!formik.values.lsId && !formik.values.date) {
      return
    }

    const items = await getRequest({
      extension: LoanManagementRepository.EarnedLeave.preview,
      parameters: `_lsId=${formik.values.lsId || 0}&_asOfDate=${formatDateForGetApI(formik.values.date)}`
    })

    formik.setFieldValue(
      'items',
      items?.list.map((item, index) => ({
        id: index + 1,
        ...item
      })) || []
    )
  }

  const actions = [
    {
      key: 'Unlocked',
      condition: !isPosted,
      onClick: onPost,
      disabled: !editMode
    },
    {
      key: 'Locked',
      condition: isPosted,
      onClick: 'onUnpostConfirmation',
      disabled: true
    }
  ]

  return (
    <FormShell
      resourceId={ResourceIds.EarnedLeave}
      functionId={SystemFunction.EarnedLeaves}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      actions={actions}
      disabledSubmit={isPosted}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <ResourceComboBox
                endpointId={SystemRepository.DocumentType.qry}
                parameters={`_startAt=0&_pageSize=1000&_dgId=${SystemFunction.EarnedLeaves}`}
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
                onChange={async (event, newValue) => {
                  await changeDT(newValue)

                  formik.setFieldValue('dtId', newValue?.recordId || null)
                }}
                error={formik.touched.dtId && Boolean(formik.errors.dtId)}
              />
            </Grid>

            <Grid item xs={6}>
              <CustomDatePicker
                name='date'
                required
                label={labels.date}
                value={formik.values.date}
                onChange={formik.setFieldValue}
                maxAccess={maxAccess}
                readOnly={isPosted || preview}
                onClear={() => formik.setFieldValue('date', null)}
                error={formik.touched.date && Boolean(formik.errors.date)}
              />
            </Grid>
            <Grid item xs={6}>
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
            <Grid item xs={6}>
              <ResourceComboBox
                endpointId={LoanManagementRepository.LeaveScheduleFilters.qry}
                name='lsId'
                label={labels.leaveSchedule}
                values={formik.values}
                valueField='recordId'
                displayField={['reference', 'name']}
                required
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                readOnly={isPosted || preview}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('lsId', newValue?.recordId || null)
                }}
                error={formik.touched.lsId && Boolean(formik.errors.lsId)}
              />
            </Grid>
            <Grid item xs={4}>
              <CustomButton
                onClick={onPreview}
                image={'preview.png'}
                tooltipText={platformLabels.Preview}
                disabled={isPosted}
              />
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <Table
            name='earnedLeaves'
            columns={columns}
            gridData={{ list: formik.values.items }}
            rowId={['recordId']}
            pagination={false}
            maxAccess={maxAccess}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
