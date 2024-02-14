// ** MUI Imports
import InlineEditGrid from 'src/components/Shared/InlineEditGrid'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'

// ** MUI Imports
import { Grid, Box, FormControlLabel, Checkbox, RadioGroup, Radio } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { useFormik } from 'formik'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useWindowDimensions } from 'src/lib/useWindowDimensions'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { CTTRXrepository } from 'src/repositories/CTTRXRepository'
import { SystemFunction } from 'src/resources/SystemFunction'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'

export default function CreditOrderForm({ labels, maxAccess, recordId, setErrorMessage, expanded }) {
  const { height } = useWindowDimensions()
  const [isLoading, setIsLoading] = useState(false)
  const [currencyStore, setCurrencyStore] = useState([])
  const [rateType, setRateType] = useState(null)
  const [editMode, setEditMode] = useState(!!recordId)

  const [initialValues, setInitialData] = useState({
    recordId: null,
    date: '',
    reference: '',
    plantId: '',
    corId: '',
    corRef: '',
    corName: '',
    purchase: false,
    sale: false,
    notes: '',
    isOnPostClicked: false
  })
  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: CTTRXrepository.CreditOrder.qry
  })

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      date: yup.string().required('This field is required'),
      reference: yup.string().required('This field is required'),
      plantId: yup.string().required('This field is required'),
      corId: yup.string().required('This field is required')
    }),
    onSubmit: async obj => {
      try {
        /*  const copy = { ...obj }
        copy.date = formatDateToApi(copy.date)

        const updatedRows = detailsFormik.values.rows.map((adjDetail, index) => {
          const seqNo = index + 1 // Adding 1 to make it 1-based index
          if (adjDetail.muQty === null) {
            // If muQty is null, set qtyInBase to 0

            return {
              ...adjDetail,
              qtyInBase: 0,
              seqNo: seqNo
            }
          } else {
            // If muQty is not null, calculate qtyInBase

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
          extension: CTTRXRepository.CreditOrder.set2,
          record: JSON.stringify(resultObject)
        })
        toast.success('Record Updated Successfully')
        invalidate()
        formik.setFieldValue('recordId', res.recordId)*/
        setEditMode(true)
        invalidate()
      } catch (error) {
        setErrorMessage(error)
      }
    }
  })

  const detailsFormik = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    initialValues: {
      rows: [
        {
          orderId: '',
          seqNo: '',
          currencyId: '',
          qty: '',
          rateCalcMethod: '',
          exRate: '',
          amount: ''
        }
      ]
    },
    validationSchema: yup.object({
      currencyId: yup.string().required('This field is required'),
      qty: yup.string().required('This field is required'),
      exRate: yup.string().required('This field is required'),
      amount: yup.string().required('This field is required')
    })
  })

  /*const totalQty = detailsFormik.values.rows.reduce((qtySum, row) => {
    // Parse qty as a number, assuming it's a numeric value
    const qtyValue = parseFloat(row.qty) || 0

    return qtySum + qtyValue
  }, 0)*/

  const fillCurrencyStore = () => {
    var parameters = `_filter=`
    getRequest({
      extension: SystemRepository.Currency.qry,
      parameters: parameters
    })
      .then(res => {
        setCurrencyStore(res)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const columns = [
    {
      field: 'combobox',
      header: labels[8],
      nameId: 'currencyId',
      name: 'currencyRef',
      mandatory: true,
      store: currencyStore.list,
      valueField: 'recordId',
      displayField: 'reference',
      widthDropDown: '200',
      fieldsToUpdate: [{ from: 'name', to: 'currencyName' }],
      columnsInDropDown: [
        { key: 'reference', value: 'Reference' },
        { key: 'name', value: 'Name' }
      ],
      width: 230
    },
    {
      field: 'textfield',
      header: labels[9],
      name: 'currencyName',
      readOnly: true,
      width: 300
    },
    {
      field: 'combobox',
      header: labels[8],
      nameId: 'currencyId',
      name: 'currencyRef',
      mandatory: true,
      store: currencyStore.list,
      valueField: 'recordId',
      displayField: 'reference',
      widthDropDown: '200',
      fieldsToUpdate: [{ from: 'name', to: 'currencyName' }],
      columnsInDropDown: [
        { key: 'reference', value: 'Reference' },
        { key: 'name', value: 'Name' }
      ],
      width: 230
    },
    {
      field: 'combobox',
      header: labels[18],
      nameId: 'rateTypeId',
      name: 'rateTypeName',
      mandatory: true,
      store: currencyStore.list,
      valueField: 'recordId',
      displayField: 'reference',
      widthDropDown: '200',
      fieldsToUpdate: [{ from: 'name', to: 'rateTypeName' }],
      columnsInDropDown: [
        { key: 'reference', value: 'Reference' },
        { key: 'name', value: 'Name' }
      ],
      width: 230
    },
    {
      field: 'textfield',
      header: labels[14],
      name: 'qty',
      mandatory: true,
      width: 100
    },
    {
      field: 'textfield',
      header: labels[15],
      name: 'exRate',
      mandatory: true,
      width: 100
    },
    {
      field: 'textfield',
      header: labels[10],
      name: 'amount',
      mandatory: true,
      width: 100
    }
  ]

  const fillItemsGrid = orderId => {
    var parameters = `_filter=&_adjustmentId=${orderId}`
    getRequest({
      extension: CTTRXrepository.CreditOrderItem.qry,
      parameters: parameters
    })
      .then(res => {
        // Create a new list by modifying each object in res.list
        /* const modifiedList = res.list.map(item => ({
          ...item,
          totalCost: item.unitCost * item.qty // Modify this based on your calculation
        }))

        detailsFormik.setValues({
          ...detailsFormik.values,
          rows: modifiedList
        })*/
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }
  async function setOperationType(type) {
    console.log('typeValue ', type)
    if (type === '3504' || type === '3505') {
      const res = await getRequest({
        extension: 'SY.asmx/getDE',
        parameters:
          type === '3504'
            ? '_key=ct_credit_purchase_ratetype_id'
            : type === '3505'
            ? '_key=ct_credit_sales_ratetype_id'
            : ''
      })
      setRateType(res.record.value)
      formik.setFieldValue('functionId', type)
    }
  }
  useEffect(() => {}, [height])

  useEffect(() => {
    ;(async function () {
      try {
        fillCurrencyStore()
        setOperationType(formik.values?.functionId)
        if (recordId) {
          setIsLoading(true)
          fillItemsGrid(recordId)

          const res = await getRequest({
            extension: CTTRXrepository.CreditOrder.get,
            parameters: `_recordId=${recordId}`
          })
          res.record.date = formatDateFromApi(res.record.date)
          setInitialData(res.record)
        }
      } catch (error) {
        setErrorMessage(error)
      } finally {
        setIsLoading(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <FormShell resourceId={ResourceIds.CreditOrder} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <Grid container>
        <Grid container xs={12}>
          {/* First Column */}
          <Grid container rowGap={1} xs={4} style={{ marginTop: '10px' }}>
            <Grid item xs={12}>
              <CustomDatePicker
                name='date'
                required
                label={labels[2]}
                value={formik?.values?.date}
                onChange={formik.handleChange}
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('date', '')}
                error={formik.touched.date && Boolean(formik.errors.date)}
                helperText={formik.touched.date && formik.errors.date}
              />
            </Grid>
          </Grid>
          {/* Second Column */}
          <Grid container rowGap={1} xs={4} sx={{ px: 2 }} style={{ marginTop: '10px' }}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.Plant.qry}
                name='plantId'
                label={labels[3]}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                readOnly={true}
                values={formik.values}
                valueField='recordId'
                displayField={['reference', 'name']}
                required
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('plantId', newValue?.recordId)
                }}
                error={formik.touched.plantId && Boolean(formik.errors.plantId)}
              />
            </Grid>
          </Grid>
          {/* Third Column */}
          <Grid container rowGap={1} xs={4} sx={{ px: 2 }} style={{ marginTop: '10px' }}>
            <Grid item xs={12}>
              <CustomTextField
                name='reference'
                label={labels[4]}
                value={formik?.values?.reference}
                maxAccess={maxAccess}
                maxLength='30'
                readOnly={true}
                required
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('reference', '')}
                error={formik.touched.reference && Boolean(formik.errors.reference)}
                helperText={formik.touched.reference && formik.errors.reference}
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid container xs={12}>
          {/* First Column */}
          <Grid container rowGap={1} xs={4} style={{ marginTop: '10px' }}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={RemittanceSettingsRepository.Correspondent.qry}
                name='corId'
                label={labels[16]}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                valueField='recordId'
                displayField={'reference'}
                required
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('corId', newValue?.recordId)
                  formik.setFieldValue('corName', newValue?.name || '')
                }}
                error={formik.touched.corId && Boolean(formik.errors.corId)}
              />
            </Grid>
          </Grid>
          {/* Second Column */}
          <Grid container rowGap={1} xs={8} sx={{ px: 2 }} style={{ marginTop: '10px' }}>
            <Grid item xs={12}>
              <CustomTextField
                name='corName'
                label={labels[17]}
                value={formik.values?.corName}
                maxAccess={maxAccess}
                required
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('corName', '')}
                error={formik.touched.corName && Boolean(formik.errors.corName)}
                helperText={formik.touched.corName && formik.errors.corName}
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid container xs={12}>
          <RadioGroup row value={formik.values.functionId} onChange={e => setOperationType(e.target.value)}>
            <FormControlLabel value={'3504'} control={<Radio />} label={labels[6]} />
            <FormControlLabel value={'3505'} control={<Radio />} label={labels[7]} />
          </RadioGroup>
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
              allowDelete={true}
              allowAddNewLine={true}
              scrollable={true}
              scrollHeight={`${expanded ? height - 430 : 200}px`}
            />
          </Box>
        </Grid>
        <Grid
          container
          rowGap={1}
          xs={12}
          style={{ marginTop: '5px' }}
          sx={{ flexDirection: 'row', flexWrap: 'nowrap' }}
        >
          {/* First Column (moved to the left) */}
          <Grid container rowGap={1} xs={8} style={{ marginTop: '10px' }}>
            <CustomTextArea
              name='notes'
              label={labels[11]}
              value={formik.values.notes}
              rows={3}
              maxAccess={maxAccess}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('notes', '')}
              error={formik.touched.notes && Boolean(formik.errors.notes)}
              helperText={formik.touched.notes && formik.errors.notes}
            />
          </Grid>
          {/* Second Column  */}
          <Grid container rowGap={1} xs={4} sx={{ px: 2 }} style={{ marginTop: '10px' }}>
            <Grid item xs={12}>
              <CustomTextField name='totalCUR' label={labels[12]} value={formik.values?.totalCUR} readOnly={true} />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField name='totalLocal' label={labels[13]} value={formik.values?.totalLocal} readOnly={true} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </FormShell>
  )
}
