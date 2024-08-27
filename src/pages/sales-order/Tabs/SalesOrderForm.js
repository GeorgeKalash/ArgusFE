import InlineEditGrid from 'src/components/Shared/InlineEditGrid'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import { Grid, Box } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { useFormik } from 'formik'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useWindowDimensions } from 'src/lib/useWindowDimensions'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { SystemFunction } from 'src/resources/SystemFunction'

export default function SalesOrderForm({ labels, maxAccess, recordId, expanded, window }) {
  //   const { height } = useWindowDimensions()
  //   const [isLoading, setIsLoading] = useState(false)
  //   const [isPosted, setIsPosted] = useState(false)
  const [itemStore, setItemStore] = useState([])

  const isPosted = true
  const editMode = true

  //   const [editMode, setEditMode] = useState(!!recordId)
  //   const { getRequest, postRequest } = useContext(RequestsContext)

  const [initialValues, setInitialData] = useState({
    recordId: null,
    dtId: '',
    reference: '',
    plantId: '',
    siteId: '',
    description: '',
    date: null
  })

  //   const invalidate = useInvalidate({
  //     endpointId: InventoryRepository.MaterialsAdjustment.qry
  //   })

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      siteId: yup.string().required('This field is required')
    }),
    onSubmit: async obj => {
      const copy = { ...obj }
      copy.date = formatDateToApi(copy.date)

      const updatedRows = detailsFormik.values.rows.map((adjDetail, index) => {
        const seqNo = index + 1
        if (adjDetail.muQty === null) {
          return {
            ...adjDetail,
            qtyInBase: 0,
            seqNo: seqNo
          }
        } else {
          return {
            ...adjDetail,
            qtyInBase: adjDetail.muQty * adjDetail.qty,
            seqNo: seqNo
          }
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

      //invalidate()
      setEditMode(true)
      formik.setFieldValue('recordId', res.recordId)
      handlePost()
      window.close()
    }
  })

  const detailsFormik = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    initialValues: {
      rows: [
        {
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
    },
    validationSchema: yup.object({
      itemId: yup.string().required('This field is required')
    })
  })

  const totalQty = detailsFormik.values.rows.reduce((qtySum, row) => {
    // Parse qty as a number, assuming it's a numeric value
    const qtyValue = parseFloat(row.qty) || 0

    return qtySum + qtyValue
  }, 0)

  //   const handlePost = async () => {
  //     const values = { ...formik.values }
  //     values.date = formatDateToApi(values.date)

  //     await postRequest({
  //       extension: InventoryRepository.MaterialsAdjustment.post,
  //       record: JSON.stringify(values)
  //     })
  //     invalidate()
  //     setIsPosted(true)
  //   }

  const lookupSKU = async searchQry => {
    setItemStore([])

    if (searchQry) {
      var parameters = `_filter=${searchQry}&_categoryId=0&_msId=0&_startAt=0&_size=1000`
      await getRequest({
        extension: InventoryRepository.Item.snapshot,
        parameters: parameters
      })
      setItemStore(res.list)
    }
  }

  const columns = [
    {
      field: 'lookup',
      header: labels[7],
      nameId: 'itemId',
      name: 'sku',
      mandatory: true,
      store: itemStore,
      valueField: 'recordId',
      displayField: 'sku',
      widthDropDown: 400,
      readOnly: isPosted,
      fieldsToUpdate: [
        { from: 'recordId', to: 'itemId' },
        { from: 'sku', to: 'sku' },
        { from: 'name', to: 'itemName' }
      ],
      columnsInDropDown: [
        { key: 'sku', value: 'SKU' },
        { key: 'name', value: 'Item Name' }
      ],
      onLookup: lookupSKU,
      width: 150
    },
    {
      field: 'textfield',
      header: labels[8],
      name: 'itemName',
      readOnly: true,
      width: 350
    },
    {
      field: 'textfield',
      header: labels[9],
      name: 'qty',
      mandatory: true,
      readOnly: isPosted,
      width: 100
    },
    {
      field: 'textfield',
      header: labels[16],
      name: 'totalCost',
      readOnly: true,
      hidden: true,
      width: 100
    },
    {
      field: 'textfield',
      header: labels[6],
      name: 'notes',
      readOnly: isPosted,
      width: 300
    }
  ]

  //   const fillDetailsGrid = async adjId => {
  //     var parameters = `_filter=&_adjustmentId=${adjId}`

  //     const res = await getRequest({
  //       extension: InventoryRepository.MaterialsAdjustmentDetail.qry,
  //       parameters: parameters
  //     })

  //     // Create a new list by modifying each object in res.list
  //     const modifiedList = res.list.map(item => ({
  //       ...item,
  //       totalCost: item.unitCost * item.qty // Modify this based on your calculation
  //     }))
  //     detailsFormik.setValues({
  //       ...detailsFormik.values,
  //       rows: modifiedList
  //     })
  //   }

  //   useEffect(() => {}, [height])

  //   useEffect(() => {
  //     ;(async function () {
  //       if (recordId) {
  //         setIsLoading(true)
  //         fillDetailsGrid(recordId)

  //         const res = await getRequest({
  //           extension: InventoryRepository.MaterialsAdjustment.get,
  //           parameters: `_recordId=${recordId}`
  //         })
  //         setIsPosted(res.record.status === 3 ? true : false)
  //         res.record.date = formatDateFromApi(res.record.date)
  //         setInitialData(res.record)
  //       }
  //     })()
  //     // eslint-disable-next-line react-hooks/exhaustive-deps
  //   }, [])

  //   const actions = [
  //     {
  //       key: 'RecordRemarks',
  //       condition: true,
  //       onClick: 'onRecordRemarks',
  //       disabled: !editMode
  //     }
  //   ]

  return (
    <FormShell resourceId={ResourceIds.MaterialsAdjustment} form={formik} maxAccess={maxAccess}>
      <Grid container>
        <Grid container xs={12} style={{ overflow: 'hidden' }}>
          {/* First Column */}
          <Grid container rowGap={1} xs={3} style={{ marginTop: '10px' }}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.DocumentType.qry}
                parameters={`_startAt=0&_pageSize=1000&_dgId=${SystemFunction.MaterialAdjustment}`}
                name='dtId'
                label='dt'
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                readOnly={isPosted}
                valueField='recordId'
                displayField={['reference', 'name']}
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik && formik.setFieldValue('dtId', newValue?.recordId)
                }}
                error={formik.touched.dtId && Boolean(formik.errors.dtId)}
                helperText={formik.touched.dtId && formik.errors.dtId}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='reference'
                label='ref'
                value={formik?.values?.reference}
                maxAccess={maxAccess}
                maxLength='30'
                readOnly={isPosted}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('reference', '')}
                error={formik.touched.reference && Boolean(formik.errors.reference)}
                helperText={formik.touched.reference && formik.errors.reference}
              />
            </Grid>
          </Grid>
          {/* 2nd Column */}
          <Grid container rowGap={1} xs={3} sx={{ px: 2 }} style={{ marginTop: '10px' }}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.Plant.qry}
                name='plantId'
                label='sale per'
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
            <Grid item xs={12}>
              <CustomDatePicker
                name='date'
                label='date'
                readOnly={isPosted}
                value={formik?.values?.date}
                onChange={formik.handleChange}
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('date', '')}
                error={formik.touched.date && Boolean(formik.errors.date)}
                helperText={formik.touched.date && formik.errors.date}
              />
            </Grid>
          </Grid>
          {/* 3rd Column */}
          <Grid container rowGap={1} xs={3} sx={{ px: 2 }} style={{ marginTop: '10px' }}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.Plant.qry}
                name='plantId'
                label='currency'
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
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.Plant.qry}
                name='plantId'
                label='plant'
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
          {/* 4rth Column */}
          <Grid container rowGap={1} xs={3} sx={{ px: 2 }} style={{ marginTop: '10px' }}>
            <Grid item xs={12}>
              <CustomTextArea
                name='details'
                label='ship to'
                value={formik.values.details}
                rows={3}
                maxLength='100'
                readOnly={editMode}
                editMode={editMode}
                maxAccess={maxAccess}
                onChange={e => formik.setFieldValue('details', e.target.value)}
                onClear={() => formik.setFieldValue('details', '')}
              />
            </Grid>
          </Grid>
          {/* 5th Column */}
          <Grid container rowGap={1} xs={3} sx={{ px: 2 }} style={{ marginTop: '10px' }}>
            <Grid item xs={12}>
              <CustomTextArea
                name='details'
                label='bill to'
                value={formik.values.details}
                rows={3}
                maxLength='100'
                readOnly={editMode}
                editMode={editMode}
                maxAccess={maxAccess}
                onChange={e => formik.setFieldValue('details', e.target.value)}
                onClear={() => formik.setFieldValue('details', '')}
              />
            </Grid>
          </Grid>
        </Grid>

        <Grid container sx={{ pt: 2 }} xs={12}>
          <Box sx={{ width: '100%' }}>
            <InlineEditGrid
              gridValidation={detailsFormik}
              columns={columns}
              defaultRow={{
                itemId: '',
                sku: '',
                itemName: '',
                qty: '',
                totalCost: '',
                muQty: '',
                qtyInBase: '',
                notes: '',
                seqNo: ''
              }}
              allowDelete={!isPosted}
              allowAddNewLine={!isPosted}
              scrollable={true}
              scrollHeight={`${expanded ? height - 430 : 200}px`}
            />
          </Box>
        </Grid>
        <Grid container rowGap={1} xs={6} style={{ marginTop: '5px' }}>
          <CustomTextField
            name='reference'
            label={labels[15]}
            maxAccess={maxAccess}
            value={totalQty}
            maxLength='30'
            readOnly={true}
            error={formik.touched.reference && Boolean(formik.errors.reference)}
            helperText={formik.touched.reference && formik.errors.reference}
          />
        </Grid>
      </Grid>
    </FormShell>
  )
}
