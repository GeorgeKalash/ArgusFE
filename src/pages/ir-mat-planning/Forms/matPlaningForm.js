import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { SystemFunction } from 'src/resources/SystemFunction'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'
import { useWindow } from 'src/windows'
import { IVReplenishementRepository } from 'src/repositories/IVReplenishementRepository'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import WorkFlow from 'src/components/Shared/WorkFlow'

export default function MatPlaningForm({ labels, access, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.MatPlaning,
    access,
    enabled: !recordId,
    objectName: 'header'
  })

  const invalidate = useInvalidate({
    endpointId: IVReplenishementRepository.MatPlanning.page
  })

  const { formik } = useForm({
    maxAccess,
    documentType: { key: 'header.dtId', value: documentType?.dtId },
    initialValues: {
      recordId,
      header: {
        recordId,
        dtId: null,
        reference: '',
        date: new Date(),
        notes: '',
        status: 1,
        releaseStatus: null,
        wip: 1
      },
      items: []
    },
    validateOnChange: true,
    validationSchema: yup.object({
      header: yup.object({
        date: yup.date().required()
      }),
      items: yup.array().of(
        yup.object({
          qty: yup.string().required()
        })
      )
    }),
    onSubmit: async obj => {
      const res = await postRequest({
        extension: IVReplenishementRepository.MatPlanning.set2,
        record: JSON.stringify({
          header: { ...obj.header, date: formatDateToApi(obj.header.date) },
          items: obj.items
        })
      })
      toast.success(obj.recordId ? platformLabels.Edited : platformLabels.Added)

      await refetchForm(res.recordId)
      invalidate()
    }
  })

  const editMode = !!formik.values.recordId
  const isReleased = formik.values.header.status == 4
  const isClosed = formik.values.header.wip === 2

  async function refetchForm(requestId) {
    const { record } = await getRequest({
      extension: IVReplenishementRepository.MatPlanning.get,
      parameters: `_requestId=${requestId}`
    })

    const { list } = await getRequest({
      extension: IVReplenishementRepository.MatPlanningItem.qry,
      parameters: `_mrpId=${requestId}`
    })

    formik.setValues({
      recordId: record.recordId,
      header: {
        ...record,
        date: formatDateFromApi(record?.date)
      },
      items: list?.map((item, index) => {
        return {
          ...item,
          id: index + 1,
          seqNo: index + 1,
          date: formatDateFromApi(item.date)
        }
      })
    })
  }

  async function onWorkFlow() {
    stack({
      Component: WorkFlow,
      props: {
        functionId: SystemFunction.MatPlaning,
        recordId: formik.values.recordId
      },
      width: 950,
      height: 600,
      title: labels.workflow
    })
  }

  async function onReopen() {
    await postRequest({
      extension: IVReplenishementRepository.MatPlanning.reopen,
      record: JSON.stringify({ ...formik.values.header, date: formatDateToApi(formik.values.header.date) })
    })

    toast.success(platformLabels.Reopened)
    invalidate()
    refetchForm(formik.values.recordId)
  }

  async function onClose() {
    await postRequest({
      extension: IVReplenishementRepository.MatPlanning.close,
      record: JSON.stringify({ ...formik.values.header, date: formatDateToApi(formik.values.header.date) })
    })
    toast.success(platformLabels.Closed)
    invalidate()
    refetchForm(formik.values.recordId)
  }

  const onGenerate = async () => {
    await postRequest({
      extension: IVReplenishementRepository.MatPlanning.generate,
      record: JSON.stringify({ ...formik.values.header, date: formatDateToApi(formik.values.header.date) })
    })

    toast.success(platformLabels.Generated)
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
    },
    {
      key: 'generate',
      condition: true,
      onClick: onGenerate,
      disabled: !editMode || (editMode && !isReleased)
    }
  ]

  useEffect(() => {
    if (recordId) {
      refetchForm(recordId)
    }
  }, [])

  const columns = [
    {
      component: 'textfield',
      label: labels.sku,
      name: 'sku',
      width: 100,
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      label: labels.name,
      name: 'itemName',
      width: 150,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.onHand,
      name: 'onhand',
      width: 100,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.openPr,
      name: 'openPR',
      width: 100,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.openPo,
      name: 'openPO',
      width: 100,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.leadTime,
      name: 'leadTime',
      width: 100,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.safetyStock,
      name: 'safetyStock',
      width: 100,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.reorderPoint,
      name: 'reorderPoint',
      width: 100,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.min,
      name: 'minStock',
      width: 100,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.max,
      name: 'maxStock',
      width: 100,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.amcShortTerm,
      name: 'amcShortTerm',
      width: 100,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.amcLongTerm,
      name: 'amcLongTerm',
      width: 100,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.siteCoverageStock,
      name: 'siteCoverageStock',
      width: 100,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.totalCoverageStock,
      name: 'totalStockCoverage',
      width: 100,
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      label: labels.mu,
      name: 'msRef',
      width: 100,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.unitCost,
      name: 'unitCost',
      width: 100,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.totalCost,
      name: 'totalCost',
      width: 100,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.sugQty,
      name: 'suggestedPRQty',
      width: 100,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.reqQty,
      name: 'qty',
      width: 100,
      props: {
        decimalScale: 2
      }
    }
  ]

  return (
    <FormShell
      resourceId={ResourceIds.MaterialReqPlannings}
      functionId={SystemFunction.MatPlaning}
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
            <Grid item xs={4}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SystemRepository.DocumentType.qry}
                    parameters={`_startAt=0&_pageSize=1000&_dgId=${SystemFunction.MatPlaning}`}
                    name='header.dtId'
                    label={labels.documentType}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    readOnly={editMode}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    values={formik.values.header}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('header.dtId', newValue?.recordId || null)
                      changeDT(newValue)
                    }}
                    error={formik.touched.header?.dtId && Boolean(formik.errors.header?.dtId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomDatePicker
                    name='header.date'
                    label={labels.date}
                    value={formik.values?.header.date}
                    readOnly={isClosed}
                    required
                    onChange={formik.setFieldValue}
                    onClear={() => formik.setFieldValue('header.date', null)}
                    error={formik.touched.header?.date && Boolean(formik.errors.header?.date)}
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='header.reference'
                    label={labels.reference}
                    value={formik?.values?.header.reference}
                    maxAccess={!editMode && maxAccess}
                    readOnly={editMode}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('header.reference', '')}
                    error={formik.touched.header?.reference && Boolean(formik.errors.header?.reference)}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={4}>
              <CustomTextArea
                name='header.notes'
                label={labels.notes}
                value={formik.values.header.notes}
                rows={3}
                readOnly={isClosed}
                maxAccess={maxAccess}
                onChange={e => formik.setFieldValue('header.notes', e.target.value)}
                onClear={() => formik.setFieldValue('header.notes', '')}
                error={formik.touched.header?.notes && Boolean(formik.errors.header?.notes)}
              />
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <DataGrid
            onChange={value => {
              formik.setFieldValue('items', value)
            }}
            value={formik?.values?.items}
            error={formik?.errors?.items}
            columns={columns}
            maxAccess={maxAccess}
            name='items'
            allowDelete={!isClosed}
            allowAddNewLine={false}
            disabled={isClosed}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
