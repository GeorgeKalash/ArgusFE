// ** MUI Imports
import InlineEditGrid from 'src/components/Shared/InlineEditGrid'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'

// ** MUI Imports
import { Grid, Box, FormControlLabel, Checkbox, RadioGroup, Radio } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { useError } from 'src/error'
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
import { SystemFunction } from 'src/resources/SystemFunction'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { CTTRXrepository } from 'src/repositories/CTTRXRepository'
import { CurrencyTradingSettingsRepository } from 'src/repositories/CurrencyTradingSettingsRepository'

export default function CreditOrderForm({ labels, maxAccess, recordId, setErrorMessage, expanded, plantId }) {
  const { height } = useWindowDimensions()
  const [isLoading, setIsLoading] = useState(false)
  const [currencyStore, setCurrencyStore] = useState([])
  const [rateType, setRateType] = useState(SystemFunction.CurrencyCreditOrderPurchase)
  const [editMode, setEditMode] = useState(!!recordId)
  const { stack: stackError } = useError()

  const [initialValues, setInitialData] = useState({
    recordId: recordId || null,
    date: new Date(),
    deliveryDate: new Date(),
    reference: '',
    plantId: plantId,
    corId: '',
    corRef: '',
    corName: '',
    notes: ''
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
      plantId: yup.string().required('This field is required'),
      corId: yup.string().required('This field is required')
    }),
    onSubmit: async obj => {
      try {
        const copy = { ...obj }
        copy.date = formatDateToApi(copy.date)
        copy.deliveryDate = formatDateToApi(copy.deliveryDate)

        const updatedRows = detailsFormik.values.rows.map((orderDetail, index) => {
          const seqNo = index + 1 // Adding 1 to make it 1-based index

          return {
            ...orderDetail,
            seqNo: seqNo
          }
        })

        if (updatedRows.length == 1 && updatedRows[0].currencyId == '') {
          throw new Error('Grid not filled. Please fill the grid before saving.')
        }

        const resultObject = {
          header: obj,
          items: updatedRows
        }

        const res = await postRequest({
          extension: CTTRXrepository.CreditOrder.set2,
          record: JSON.stringify(resultObject)
        })
        toast.success('Record Updated Successfully')
        invalidate()
        formik.setFieldValue('recordId', res.recordId)
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
          baseAmount: '',
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
      name: 'currencyId',
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
      width: 230,
      async onChange(row) {
        if (row?.newValue > 0) {
          const exchange = await fetchRate({
            currencyId: row.newValue
          })
          formik.setFieldValue(`rows[${row.rowIndex}].currencyId`, row.newValue)
          formik.setFieldValue(`rows[${row.rowIndex}].exRate`, exchange?.rate)
          formik.setFieldValue(`rows[${row.rowIndex}].amount`, exchange?.amount)
          formik.setFieldValue(`rows[${row.rowIndex}].baseAmount`, exchange?.baseAmount)
        } else {
          formik.setFieldValue(`rows[${row.rowIndex}].currencyId`, '')
          formik.setFieldValue(`rows[${row.rowIndex}].exRate`, 0)
          formik.setFieldValue(`rows[${row.rowIndex}].amount`, 0)
          formik.setFieldValue(`rows[${row.rowIndex}].baseAmount`, 0)

          return
        }
      }
    },
    {
      field: 'textfield',
      header: labels[9],
      name: 'currencyName',
      readOnly: true,
      width: 300
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
      header: 'baseAmount',
      name: 'baseAmount',
      mandatory: true,
      width: 100,
      hidden: true
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
    if (type == SystemFunction.CurrencyCreditOrderPurchase || type == SystemFunction.CurrencyCreditOrderSale) {
      const res = await getRequest({
        extension: 'SY.asmx/getDE',
        parameters:
          type == SystemFunction.CurrencyCreditOrderPurchase
            ? '_key=ct_credit_purchase_ratetype_id'
            : type == SystemFunction.CurrencyCreditOrderSale
            ? '_key=ct_credit_sales_ratetype_id'
            : ''
      })
      setRateType(res.record.value)
      formik.setFieldValue('functionId', type)
    }
  }
  async function fetchRate({ currencyId }) {
    const response = await getRequest({
      extension: CurrencyTradingSettingsRepository.ExchangeMap.get2,
      parameters: `_plantId=${plantId}&_currencyId=${currencyId}&_rateTypeId=${rateType}`
    })

    return response.record
  }

  useEffect(() => {
    ;(async function () {
      try {
        fillCurrencyStore()
        setOperationType(rateType)
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
  }, [height])

  return (
    <FormShell resourceId={ResourceIds.CreditOrder} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <Grid container>
        <Grid container xs={12}>
          {/* First Column */}
          <Grid container rowGap={1} xs={3} style={{ marginTop: '10px' }}>
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
          <Grid container rowGap={1} xs={6} sx={{ px: 2 }} style={{ marginTop: '10px' }}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.Plant.qry}
                name='plantId'
                label={labels[3]} //readOnly={true}
                values={formik.values}
                valueField='recordId'
                displayField={'reference'}
                required
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik && formik.setFieldValue('plantId', newValue?.recordId)
                }}
                error={formik.touched.plantId && Boolean(formik.errors.plantId)}
              />
            </Grid>
          </Grid>
          {/* Third Column */}
          <Grid container rowGap={1} xs={3} sx={{ px: 2 }} style={{ marginTop: '10px' }}>
            <Grid item xs={12}>
              <CustomTextField
                name='reference'
                label={labels[4]}
                value={formik?.values?.reference}
                maxAccess={maxAccess}
                maxLength='30'
                readOnly={true}
                required
                error={formik.touched.reference && Boolean(formik.errors.reference)}
                helperText={formik.touched.reference && formik.errors.reference}
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid container xs={12}>
          {/* First Column */}
          <Grid container rowGap={1} xs={3} style={{ marginTop: '10px' }}>
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
          <Grid container rowGap={1} xs={6} sx={{ px: 2 }} style={{ marginTop: '10px' }}>
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
          {/* Third Column */}
          <Grid container rowGap={1} xs={3} sx={{ px: 2 }} style={{ marginTop: '10px' }}>
            <Grid item xs={12}>
              <CustomDatePicker
                name='deliveryDate'
                label={labels[18]}
                value={formik?.values?.deliveryDate}
                onChange={formik.handleChange}
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('deliveryDate', '')}
                error={formik.touched.deliveryDate && Boolean(formik.errors.deliveryDate)}
                helperText={formik.touched.deliveryDate && formik.errors.deliveryDate}
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid container xs={12}>
          <RadioGroup
            row
            value={formik.values.functionId}
            defaultValue={SystemFunction.CurrencyCreditOrderPurchase}
            onChange={e => setOperationType(e.target.value)}
          >
            <FormControlLabel
              value={SystemFunction.CurrencyCreditOrderPurchase}
              control={<Radio />}
              label={labels[6]}
              disabled={detailsFormik?.values?.rows[0]?.currencyId != '' ? true : false}
            />
            <FormControlLabel
              value={SystemFunction.CurrencyCreditOrderSale}
              control={<Radio />}
              label={labels[7]}
              disabled={detailsFormik?.values?.rows[0]?.currencyId != '' ? true : false}
            />
          </RadioGroup>
        </Grid>
        <Grid container sx={{ pt: 2 }} xs={12}>
          <Box sx={{ width: '100%' }}>
            <InlineEditGrid
              gridValidation={detailsFormik}
              columns={columns}
              background={
                formik.values.functionId &&
                (formik.values.functionId != SystemFunction.CurrencyCreditOrderPurchase
                  ? '#C7F6C7'
                  : 'rgb(245, 194, 193)')
              }
              defaultRow={{
                orderId: '',
                seqNo: '',
                currencyId: '',
                qty: '',
                rateCalcMethod: '',
                exRate: '',
                baseAmount: '',
                amount: ''
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
