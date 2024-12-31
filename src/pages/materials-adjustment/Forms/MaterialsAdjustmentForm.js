import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import { Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
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
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { SystemFunction } from 'src/resources/SystemFunction'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'

export default function MaterialsAdjustmentForm({ labels, maxAccess, recordId, window }) {
  const [isPosted, setIsPosted] = useState(false)
  const [editMode, setEditMode] = useState(!!recordId)
  const { getRequest, postRequest } = useContext(RequestsContext)

  const [initialValues, setInitialData] = useState({
    recordId: null,
    dtId: '',
    reference: '',
    plantId: '',
    siteId: '',
    description: '',
    date: null,
    rows: [
      {
        id: 1,
        itemId: '',
        sku: '',
        itemName: '',
        qty: '',
        totalCost: '',
        totalQty: '',
        muQty: '',
        qtyInBase: '',
        notes: '',
        seqNo: ''
      }
    ]
  })

  const invalidate = useInvalidate({
    endpointId: InventoryRepository.MaterialsAdjustment.qry
  })

  const { formik } = useForm({
    maxAccess,
    initialValues,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      siteId: yup.string().required(),
      date: yup.date().required(),
      rows: yup
        .array()
        .of(
          yup.object().shape({
            sku: yup.string().required(),
            qty: yup.number().required()
          })
        )
        .required()
    }),
    onSubmit: async obj => {
      const copy = { ...obj }
      copy.date = formatDateToApi(copy.date)

      const updatedRows = formik.values.rows.map((adjDetail, index) => {
        const seqNo = index + 1
        let muQty = adjDetail.muQty || 1

        return {
          ...adjDetail,
          qtyInBase: muQty * adjDetail.qty,
          seqNo: seqNo
        }
      })

      if (updatedRows.length == 1 && updatedRows[0].itemId == '') {
        throw new Error('Grid not filled. Please fill the grid before saving.')
      }

      const resultObject = {
        header: obj,
        items: updatedRows,
        serials: [],
        lots: []
      }

      const res = await postRequest({
        extension: InventoryRepository.MaterialsAdjustment.set2,
        record: JSON.stringify(resultObject)
      })
      toast.success('Record Updated Successfully')
      invalidate()
      setEditMode(true)
      formik.setFieldValue('recordId', res.recordId)
      handlePost()
      window.close()
    }
  })

  const totalQty = formik.values?.rows?.reduce((qtySum, row) => {
    const qtyValue = parseFloat(row.qty) || 0

    return qtySum + qtyValue
  }, 0)

  const handlePost = async () => {
    const values = { ...formik.values }
    values.date = formatDateToApi(values.date)

    await postRequest({
      extension: InventoryRepository.MaterialsAdjustment.post,
      record: JSON.stringify(values)
    })
    invalidate()
    setIsPosted(true)
  }

  const onUnpost = async () => {
    const values = { ...formik.values }
    values.date = formatDateToApi(values.date)

    await postRequest({
      extension: InventoryRepository.MaterialsAdjustment.unpost,
      record: JSON.stringify(values)
    })
    toast.success(platformLabels.Unposted)

    setIsPosted(false)

    invalidate()
  }

  const columns = [
    {
      component: 'resourcelookup',
      label: labels[7],
      name: 'sku',
      props: {
        endpointId: InventoryRepository.Item.snapshot,
        valueField: 'recordId',
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
      }
    },
    {
      component: 'textfield',
      label: labels[8],
      name: 'itemName',
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      name: 'qty',
      label: labels[9],
      props: {
        readOnly: isPosted
      }
    },
    {
      component: 'textfield',
      label: labels[6],
      name: 'notes'
    }
  ]

  const fillDetailsGrid = async adjId => {
    var parameters = `_filter=&_adjustmentId=${adjId}`

    const res = await getRequest({
      extension: InventoryRepository.MaterialsAdjustmentDetail.qry,
      parameters: parameters
    })

    return res
  }

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: InventoryRepository.MaterialsAdjustment.get,
          parameters: `_recordId=${recordId}`
        })
        const res2 = await fillDetailsGrid(recordId)

        const modifiedList = res2?.list?.map((item, index) => ({
          ...item,
          id: index + 1,
          totalCost: item.unitCost * item.qty
        }))

        formik.setValues({
          ...res.record,
          date: formatDateFromApi(res.record.date),
          rows: modifiedList
        })

        setIsPosted(res.record.status === 3 ? true : false)
      }
    })()
  }, [])

  const actions = [
    {
      key: 'RecordRemarks',
      condition: true,
      onClick: 'onRecordRemarks',
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
      onClick: handlePost,
      disabled: !editMode
    }
  ]

  return (
    <FormShell
      resourceId={ResourceIds.MaterialsAdjustment}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      isPosted={isPosted}
      postVisible={true}
      actions={actions}
      previewReport={editMode}
      disabledSubmit={isPosted}
    >
      <VertLayout>
        <Fixed>
          <Grid container xs={12} sx={{ overflow: 'hidden', pt: 1 }}>
            {/* First Column */}
            <Grid container rowGap={1} xs={6}>
              <Grid item xs={12}>
                <ResourceComboBox
                  endpointId={SystemRepository.DocumentType.qry}
                  parameters={`_startAt=0&_pageSize=1000&_dgId=${SystemFunction.MaterialAdjustment}`}
                  name='dtId'
                  label={labels[2]}
                  columnsInDropDown={[
                    { key: 'reference', value: 'Reference' },
                    { key: 'name', value: 'Name' }
                  ]}
                  readOnly={isPosted}
                  valueField='recordId'
                  displayField={['reference', 'name']}
                  values={formik.values}
                  maxAccess={!editMode && maxAccess}
                  onChange={(event, newValue) => {
                    formik && formik.setFieldValue('dtId', newValue?.recordId || null)
                  }}
                  error={formik.touched.dtId && Boolean(formik.errors.dtId)}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  name='reference'
                  label={labels[12]}
                  value={formik?.values?.reference}
                  maxAccess={!editMode && maxAccess}
                  maxLength='30'
                  readOnly={isPosted}
                  onChange={formik.handleChange}
                  onClear={() => formik.setFieldValue('reference', '')}
                  error={formik.touched.reference && Boolean(formik.errors.reference)}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomDatePicker
                  name='date'
                  label={labels[3]}
                  readOnly={isPosted}
                  value={formik?.values?.date}
                  onChange={formik.setFieldValue}
                  required
                  maxAccess={maxAccess}
                  onClear={() => formik.setFieldValue('date', null)}
                  error={formik.touched.date && Boolean(formik.errors.date)}
                />
              </Grid>
              <Grid item xs={12}>
                <ResourceComboBox
                  endpointId={SystemRepository.Plant.qry}
                  name='plantId'
                  label={labels[4]}
                  readOnly={isPosted}
                  columnsInDropDown={[
                    { key: 'reference', value: 'Reference' },
                    { key: 'name', value: 'Name' }
                  ]}
                  values={formik.values}
                  valueField='recordId'
                  displayField={['reference', 'name']}
                  maxAccess={maxAccess}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('plantId', newValue?.recordId)
                  }}
                  error={formik.touched.plantId && Boolean(formik.errors.plantId)}
                />
              </Grid>
            </Grid>
            <Grid container rowGap={1} xs={6} sx={{ px: 2 }}>
              <Grid item xs={12}>
                <ResourceComboBox
                  endpointId={InventoryRepository.Site.qry}
                  name='siteId'
                  readOnly={isPosted}
                  label={labels[5]}
                  columnsInDropDown={[
                    { key: 'reference', value: 'Reference' },
                    { key: 'name', value: 'Name' }
                  ]}
                  values={formik.values}
                  valueField='recordId'
                  displayField={['reference', 'name']}
                  required
                  maxAccess={maxAccess}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('siteId', newValue?.recordId)
                  }}
                  error={formik.touched.siteId && Boolean(formik.errors.siteId)}
                />
              </Grid>
              <Grid item xs={12} sx={{ pb: 6 }}>
                <CustomTextArea
                  name='description'
                  label={labels[13]}
                  value={formik?.values?.description}
                  rows={4}
                  readOnly={isPosted}
                  maxAccess={maxAccess}
                  onChange={formik.handleChange}
                  onClear={() => formik.setFieldValue('description', '')}
                  error={formik.touched.description && Boolean(formik.errors.description)}
                />
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
          />
        </Grow>
        <Fixed>
          <Grid container rowGap={1} xs={6}>
            <CustomTextField
              name='totalQty'
              label={labels[15]}
              maxAccess={maxAccess}
              value={totalQty}
              maxLength='30'
              readOnly={true}
              error={formik.touched.reference && Boolean(formik.errors.reference)}
            />
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}
