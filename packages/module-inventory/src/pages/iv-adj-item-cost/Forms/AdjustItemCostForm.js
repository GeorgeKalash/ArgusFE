import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import { formatDateFromApi, formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'
import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import CustomTextArea from '@argus/shared-ui/src/components/Inputs/CustomTextArea'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { useDocumentType } from '@argus/shared-hooks/src/hooks/documentReferenceBehaviors'

export default function AdjustItemCostForm({ labels, access, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.AdjustmentCost,
    access,
    enabled: !recordId
  })

  const invalidate = useInvalidate({
    endpointId: InventoryRepository.AdjustItemCost.page
  })

  const { formik } = useForm({
    maxAccess,
    documentType: { key: 'header.dtId', value: documentType?.dtId },
    initialValues: {
      recordId,
      header: {
        recordId: null,
        dtId: null,
        reference: '',
        plantId: null,
        notes: '',
        date: new Date(),
        status: 1
      },
      rows: [
        {
          id: 1,
          acoId: recordId,
          sku: '',
          itemName: '',
          unitCost: 0,
          notes: '',
          seqNo: ''
        }
      ]
    },
    validateOnChange: true,
    validationSchema: yup.object({
      header: yup.object({
        date: yup.date().required()
      }),
      rows: yup
        .array()
        .of(
          yup.object().shape({
            sku: yup.string().required(),
            itemName: yup.string().required(),
            unitCost: yup.number().required()
          })
        )
        .required()
    }),
    onSubmit: async obj => {
      const data = {
        header: {
          ...obj.header,
          date: formatDateToApi(obj.header.date)
        },
        items: formik.values.rows.map((details, index) => {
          return {
            ...details,
            acoId: obj.recordId ?? 0,
            seqNo: index + 1
          }
        })
      }

      const res = await postRequest({
        extension: InventoryRepository.AdjustItemCost.set2,
        record: JSON.stringify(data)
      })
      formik.setFieldValue('recordId', res.recordId)
      formik.setFieldValue('header.recordId', res.recordId)

      toast.success(!obj.recordId ? platformLabels.Added : platformLabels.Edited)
      invalidate()
      refetchForm(res?.recordId)
    }
  })

  const editMode = !!formik.values.recordId
  const isPosted = formik.values.header.status === 3

  async function onPost() {
    const res = await postRequest({
      extension: InventoryRepository.AdjustItemCost.post,
      record: JSON.stringify({
        ...formik.values.header,
        date: formatDateToApi(formik.values.header.date)
      })
    })

    if (res?.recordId) {
      toast.success(platformLabels.Posted)
      invalidate()
      refetchForm(res?.recordId)
    }
  }

  async function getDTD(dtId) {
    if (dtId) {
      const res = await getRequest({
        extension: InventoryRepository.DocumentTypeDefaults.get,
        parameters: `_dtId=${dtId}`
      })

      formik.setFieldValue(
        'header.plantId',
        res?.record?.plantId ? res?.record?.plantId : formik?.values?.header?.plantId
      )

      return res
    }
  }

  useEffect(() => {
    getDTD(formik?.values?.header?.dtId)
  }, [formik.values?.header?.dtId])

  const getUnitCost = async itemId => {
    const res = await getRequest({
      extension: InventoryRepository.CurrentCost.get,
      parameters: '_itemId=' + itemId
    })

    return res?.record?.currentCost
  }

  const columns = [
    {
      component: 'resourcelookup',
      label: labels.sku,
      name: 'sku',
      props: {
        endpointId: InventoryRepository.Item.snapshot,
        valueField: 'sku',
        displayField: 'sku',
        mapping: [
          { from: 'recordId', to: 'itemId' },
          { from: 'sku', to: 'sku' },
          { from: 'name', to: 'itemName' }
        ],
        columnsInDropDown: [
          { key: 'sku', value: 'SKU' },
          { key: 'name', value: 'Name' }
        ],
        displayFieldWidth: 3
      },
      async onChange({ row: { update, newRow } }) {
        if (!newRow?.itemId) {
          return
        }
        const unitCost = (await getUnitCost(newRow?.itemId)) ?? 0

        update({
          unitCost
        })
      }
    },
    {
      component: 'textfield',
      label: labels.itemName,
      name: 'itemName',
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      name: 'unitCost',
      label: labels.unitCost
    },
    {
      component: 'textfield',
      label: labels.notes,
      name: 'notes'
    }
  ]

  const onUnpost = async () => {
    const res = await postRequest({
      extension: InventoryRepository.AdjustItemCost.unpost,
      record: JSON.stringify(formik.values.header)
    })

    if (res?.recordId) {
      toast.success(platformLabels.Unposted)
      invalidate()
      refetchForm(res?.recordId)
    }
  }

  async function refetchForm(recordId) {
    const res = await getRequest({
      extension: InventoryRepository.AdjustItemCost.get2,
      parameters: `_recordId=${recordId}`
    })

    if (res?.record?.header) {
      const modifiedList = res?.record?.items?.map((item, index) => ({
        ...item,
        id: index + 1
      }))

      formik.setValues({
        recordId: res.record.header.recordId,
        header: {
          ...res.record.header,
          date: formatDateFromApi(res?.record?.header?.date)
        },
        rows: modifiedList
      })

      return res?.record
    }
  }

  useEffect(() => {
    if (recordId) refetchForm(recordId)
  }, [])

  const actions = [
    {
      key: 'GL',
      condition: true,
      onClick: 'onClickGL',
      datasetId: ResourceIds.GLAdjustItemCost,
      valuesPath: formik.values.header,
      disabled: !editMode
    },
    {
      key: 'Locked',
      condition: isPosted,
      onClick: 'onUnpostConfirmation',
      onSuccess: onUnpost,
      disabled: !editMode
    },
    {
      key: 'Unlocked',
      condition: !isPosted,
      onClick: onPost,
      disabled: !editMode
    },
    {
      key: 'IV',
      condition: true,
      onClick: 'onInventoryTransaction',
      disabled: !editMode || !isPosted
    }
  ]

  return (
    <FormShell
      resourceId={ResourceIds.AdjustItemCost}
      functionId={SystemFunction.AdjustmentCost}
      form={formik}
      maxAccess={maxAccess}
      actions={actions}
      editMode={editMode}
      previewReport={editMode}
      disabledSubmit={isPosted}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SystemRepository.DocumentType.qry}
                    parameters={`_startAt=0&_pageSize=1000&_dgId=${SystemFunction.AdjustmentCost}`}
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
                  <CustomTextField
                    name='header.reference'
                    label={labels.reference}
                    value={formik?.values?.header?.reference}
                    maxAccess={!editMode && maxAccess}
                    maxLength='30'
                    readOnly={isPosted}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('header.reference', '')}
                    error={formik.touched.header?.reference && Boolean(formik.errors.header?.reference)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomDatePicker
                    name='header.date'
                    label={labels.date}
                    readOnly={isPosted}
                    value={formik?.values?.header.date}
                    onChange={formik.setFieldValue}
                    required
                    maxAccess={maxAccess}
                    onClear={() => formik.setFieldValue('header.date', null)}
                    error={formik?.touched?.header?.date && Boolean(formik?.errors?.header?.date)}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SystemRepository.Plant.qry}
                    name='header.plantId'
                    label={labels.plant}
                    readOnly={isPosted}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik.values.header}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('header.plantId', newValue?.recordId || null)
                    }}
                    error={formik?.touched?.header?.plantId && Boolean(formik?.errors?.header?.plantId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextArea
                    name='header.notes'
                    label={labels.description}
                    value={formik.values.header?.notes}
                    readOnly={isPosted}
                    maxAccess={maxAccess}
                    onChange={formik.handleChange}
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
            onChange={value => formik.setFieldValue('rows', value)}
            value={formik.values.rows}
            error={formik.errors.rows}
            name='rows'
            maxAccess={maxAccess}
            columns={columns}
            allowAddNewLine={!isPosted}
            allowDelete={!isPosted}
            disabled={isPosted}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
