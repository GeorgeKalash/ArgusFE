import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { LoanManagementRepository } from 'src/repositories/LoanManagementRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SystemFunction } from 'src/resources/SystemFunction'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'
import { formatDateForGetApI, formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import CustomButton from 'src/components/Inputs/CustomButton'
import { DataGrid } from 'src/components/Shared/DataGrid'
import Table from 'src/components/Shared/Table'

export default function EarnedLeavesForm({ labels, access, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: LoanManagementRepository.EarnedLeave.page
  })

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.EarnedLeaves,
    access,
    enabled: !recordId
  })

  const { formik } = useForm({
    documentType: { key: 'dtId', value: documentType?.dtId },
    initialValues: {
      recordId,
      dtId: null,
      reference: null,
      date: new Date(),
      lsId: null,
      status: 1,
      items: []
    },
    maxAccess,
    validateOnChange: true,
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
      formik.setFieldValue('recordId', response.recordId)

      invalidate()
    }
  })

  const editMode = !!formik.values.recordId
  const isPosted = formik.values.status === 3

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: LoanManagementRepository.EarnedLeave.get2,
          parameters: `_recordId=${recordId}`
        })

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
    })()
  }, [])

  const onPost = async () => {
    const res = await postRequest({
      extension: LoanManagementRepository.EarnedLeave.post,
      record: JSON.stringify(formik.values)
    })

    toast.success(platformLabels.Posted)
    invalidate()
    refetchForm(res?.recordId)
  }

  const columns = [
    {
      field: 'employee',
      headerName: labels.employee,
      flex: 1
    },
    {
      field: 'days',
      headerName: labels.days,
      type: 'number',
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

    // formik.setFieldValue('items', { list: items?.record })
  }

  async function refetchForm(recordId) {
    const res = await getRequest({
      extension: LoanManagementRepository.EarnedLeave.get2,
      parameters: `_recordId=${recordId}`
    })

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

    return res?.record
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
                readOnly={isPosted}
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
                onClear={() => formik.setFieldValue('reference', null)}
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
                readOnly={isPosted}
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
