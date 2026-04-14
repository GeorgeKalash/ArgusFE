import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import { useDocumentType } from '@argus/shared-hooks/src/hooks/documentReferenceBehaviors'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { formatDateFromApi, formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'
import { ManufacturingRepository } from '@argus/repositories/src/repositories/ManufacturingRepository'
import CustomTextArea from '@argus/shared-ui/src/components/Inputs/CustomTextArea'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'

export default function StandardCostForm({ labels, access, recordId, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const functionId = SystemFunction.StandardCost

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId,
    access,
    enabled: !recordId,
    objectName: 'header'
  })

  const invalidate = useInvalidate({
    endpointId: ManufacturingRepository.StandardCost.page
  })

  const { formik } = useForm({
    documentType: { key: 'header.dtId', value: documentType?.dtId, reference: documentType?.reference },
    initialValues: {
      recordId: recordId || null,
      header: {
        recordId,
        functionId: SystemFunction.PurityAdjustment,
        date: new Date(),
        dtId: null,
        itemGroupId: null,
        reference: '',
        status: 1,
        itemCategoryId: null,
        collectionId: null,
        productionLineId: null,
        amount: null,
        notes: '',
        wip: 1,
      },
      items: [
        {
          id: 1,
          trxId: recordId || 0,
          seqNo: 1,
          scpId: null,
          value: null
        }
      ]
    },
    maxAccess,
    validationSchema: yup.object({
      header: yup.object({
        date: yup.date().required(),
        itemGroupId: yup.number().required(),
        itemCategoryId: yup.number().required(),
        collectionId: yup.number().required(),
        productionLineId: yup.number().required(),
        amount: yup.number().required(),
      }),
      items: yup.array().of(yup.object({
        value: yup.number().required()
      }))
    }),
    onSubmit: async obj => {
      const response = await postRequest({
        extension: ManufacturingRepository.StandardCost.set2,
        record: JSON.stringify({
          header: {
            ...obj.header,
            date: formatDateToApi(obj.header.date)
          },
          items: (obj?.items || [])
            .map((item, index) => ({
              ...item,
              trxId: obj?.recordId || 0,
              seqNo: index + 1,
            }))
        })
      })
      toast.success(obj.recordId ? platformLabels.Edited : platformLabels.Added)
      refetchForm(response?.recordId)
      invalidate()
    }
  })

  const editMode = !!formik.values?.header.recordId
  const isPosted = formik.values.header.status === 3
  const isClosed = formik.values.header.wip == 2

  const onPost = async () => {
    await postRequest({
      extension: ManufacturingRepository.StandardCost.post,
      record: JSON.stringify({ ...formik.values?.header, date: formatDateToApi(formik.values.header.date) })
    })

    toast.success(platformLabels.Posted)
    invalidate()
    window.close()
  }

  const onUnpost = async () => {
    const res = await postRequest({
      extension: ManufacturingRepository.StandardCost.unpost,
      record: JSON.stringify({ ...formik.values?.header, date: formatDateToApi(formik.values.header.date) })
    })

    toast.success(platformLabels.Unposted)
    refetchForm(res?.recordId)
    invalidate()
  }

  const onClose = async () => {
    const res = await postRequest({
      extension: ManufacturingRepository.StandardCost.close,
      record: JSON.stringify({ ...formik.values?.header, date: formatDateToApi(formik.values.header.date) })
    })

    toast.success(platformLabels.Closed)
    invalidate()
    refetchForm(res.recordId)
  }

  const onReopen = async () => {
    const res = await postRequest({
      extension: ManufacturingRepository.StandardCost.reopen,
      record: JSON.stringify({ ...formik.values?.header, date: formatDateToApi(formik.values.header.date) })
    })

    toast.success(platformLabels.Reopened)
    invalidate()
    refetchForm(res.recordId)
  }

  async function refetchForm(recordId) {
    if (!recordId) return

    const { record } = await getRequest({
      extension: ManufacturingRepository.StandardCost.get2,
      parameters: `_recordId=${recordId}`
    })

    formik.setValues({
      recordId: record?.header?.recordId,
      header: {
        ...(record?.header || {}),
        date: formatDateFromApi(record?.header?.date),
      },
      items: []
    })

    await loadStandardCostParameters(record?.items || [])
  }

  const columns = [
    {
      component: 'textfield',
      label: labels.name,
      name: 'scpName',
      readOnly: true
    },
    {
      component: 'numberfield',
      label: labels.value,
      name: 'value',
      props: {
        maxLength: 15,
        decimalScale: 2
      }
    }
  ]

  async function loadStandardCostParameters(recordItems = []) {
    const response = await getRequest({
      extension: ManufacturingRepository.StandardCost.pack,
      parameters: ``
    })

    const list = response?.record?.standardCostParameters || []

    const items = list.map((param, index) => {
      const existingItem = (recordItems || []).find(item => item.scpId === param.recordId)

      return {
        id: index + 1,
        trxId: recordId || 0,
        seqNo: index + 1,
        scpId: param.recordId,
        scpName: param.name,
        value: existingItem?.value ?? null
      }
    })

    formik.setFieldValue('items', items)
  }

  const actions = [
    {
      key: 'Locked',
      condition: isPosted,
      onClick: 'onUnpostConfirmation',
      onSuccess: onUnpost,
      disabled: !isClosed
    },
    {
      key: 'Unlocked',
      condition: !isPosted,
      onClick: onPost,
      disabled: !editMode || !isClosed
    },
    {
      key: 'Close',
      condition: !isClosed,
      onClick: onClose,
      disabled: isClosed || !editMode
    },
    {
      key: 'Reopen',
      condition: isClosed,
      onClick: onReopen,
      disabled: !isClosed || !editMode || isPosted
    },
  ]

  useEffect(() => {
    if (recordId) {
      refetchForm(recordId)
    } else {
      loadStandardCostParameters()
    }
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.StandardCost}
      form={formik}
      maxAccess={maxAccess}
      actions={actions}
      previewReport={editMode}
      editMode={editMode}
      functionId={functionId}
      disabledSubmit={isClosed}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={ManufacturingRepository.StandardCost.pack}
                    reducer={response => response?.record?.documentTypes}
                    filter={!editMode ? item => item.activeStatus === 1 : undefined}
                    name='header.dtId'
                    label={labels.docType}
                    readOnly={editMode}
                    valueField='recordId'
                    displayField='name'
                    values={formik.values.header}
                    onChange={(_, newValue) => {
                      changeDT(newValue)
                      formik.setFieldValue('header.dtId', newValue?.recordId || null)
                    }}
                    error={formik.touched.header?.dtId && Boolean(formik.errors.header?.dtId)}
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='header.reference'
                    label={labels.reference}
                    value={formik.values.header.reference}
                    readOnly={editMode}
                    maxAccess={!editMode && maxAccess}
                    maxLength='15'
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('header.reference', '')}
                    error={formik.touched.header?.reference && Boolean(formik.errors.header?.reference)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomDatePicker
                    name='header.date'
                    required
                    readOnly={isClosed}
                    label={labels.date}
                    value={formik.values.header.date}
                    onChange={formik.setFieldValue}
                    maxAccess={maxAccess}
                    onClear={() => formik.setFieldValue('header.date', null)}
                    error={formik.touched.header?.date && Boolean(formik.errors.header?.date)}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={4}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={ManufacturingRepository.StandardCost.pack}
                    reducer={response => response?.record?.itemGroups}
                    values={formik.values.header}
                    name='header.itemGroupId'
                    label={labels.itemGroup}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    displayFieldWidth={1}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    required
                    readOnly={isClosed}
                    maxAccess={maxAccess}
                    onChange={(_, newValue) => formik.setFieldValue('header.itemGroupId', newValue?.recordId || null)}
                    error={formik.touched.header?.itemGroupId && Boolean(formik.errors.header?.itemGroupId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={ManufacturingRepository.StandardCost.pack}
                    reducer={response => response?.record?.categories}
                    values={formik.values.header}
                    name='header.itemCategoryId'
                    label={labels.category}
                    valueField='recordId'
                    displayField='name'
                    required
                    readOnly={isClosed}
                    maxAccess={maxAccess}
                    onChange={(_, newValue) => formik.setFieldValue('header.itemCategoryId', newValue?.recordId || null)}
                    error={formik.touched.header?.itemCategoryId && Boolean(formik.errors.header?.itemCategoryId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={ManufacturingRepository.StandardCost.pack}
                    reducer={response => response?.record?.collections}
                    name='header.collectionId'
                    label={labels.collection}
                    valueField='recordId'
                    readOnly={isClosed}
                    displayField={['reference', 'name']}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    required
                    maxAccess={maxAccess}
                    values={formik.values.header}
                    onChange={(_, newValue) => {
                      formik.setFieldValue('header.collectionId', newValue?.recordId || null)
                    }}
                    error={formik.touched.header?.collectionId && Boolean(formik.errors.header?.collectionId)}
                  />
                </Grid>
              </Grid>
            </Grid>
             <Grid item xs={4}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={ManufacturingRepository.StandardCost.pack}
                    reducer={response => response?.record?.productionLines}
                    values={formik.values.header}
                    name='header.productionLineId'
                    label={labels.productionLine}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    displayFieldWidth={1}
                    readOnly={isClosed}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    required
                    maxAccess={maxAccess}
                    onChange={(_, newValue) => {
                      formik.setFieldValue('header.productionLineId', newValue?.recordId || null)
                    }}
                    error={formik.touched.header?.productionLineId && Boolean(formik.errors.header?.productionLineId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='header.amount'
                    label={labels.amount}
                    value={formik.values.header.amount}
                    maxAccess={maxAccess}
                    onChange={e => formik.setFieldValue('header.amount', e.target.value)}
                    onClear={() => formik.setFieldValue('header.amount', '')}
                    error={formik.touched.header?.amount && Boolean(formik.errors.header?.amount)}
                    maxLength={15}
                    readOnly={isClosed}
                    required
                    decimalScale={2}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextArea
                    name='header.notes'
                    label={labels.notes}
                    value={formik.values.header.notes}
                    rows={3}
                    maxAccess={maxAccess}
                    readOnly={isClosed}
                    onChange={e => formik.setFieldValue('header.notes', e.target.value)}
                    onClear={() => formik.setFieldValue('header.notes', '')}
                    error={formik.touched.header?.notes && Boolean(formik.errors.header?.notes)}
                  />
                </Grid>
              </Grid>
             </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <DataGrid
              onChange={(value) => {
              formik.setFieldValue('items', value)
            }}
            value={formik.values?.items}
            error={formik.errors?.items}
            name='items'
            columns={columns}
            maxAccess={maxAccess}
            disabled={isClosed}
            allowDelete={false}
            allowAddNewLine={false}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
