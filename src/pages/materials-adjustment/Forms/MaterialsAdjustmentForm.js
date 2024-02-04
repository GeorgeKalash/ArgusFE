// ** MUI Imports
import Table from 'src/components/Shared/Table'
import InlineEditGrid from 'src/components/Shared/InlineEditGrid'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'

// ** MUI Imports
import { Grid, Box, Button } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { useFormik } from 'formik'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { EnumSystemFunction } from 'src/resources/EnumSystemFunction'
import { useWindowDimensions } from 'src/lib/useWindowDimensions'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { TrendingUp } from '@mui/icons-material'

export default function MaterialsAdjustmentForm({ labels, maxAccess, recordId, setErrorMessage }) {
  const { height } = useWindowDimensions()

  const [isLoading, setIsLoading] = useState(false)
  const [isPosted, setIsPosted] = useState(false)
  const [dtStore, setDtStore] = useState([])
  const [plantStore, setPlantStore] = useState([])
  const [siteStore, setSiteStore] = useState([])
  const [itemStore, setItemStore] = useState([])
  const [editMode, setEditMode] = useState(!!recordId)

  const [initialValues, setInitialData] = useState({
    recordId: null,
    dtId: '',
    reference: '',
    plantId: '',
    siteId: '',
    description: '',
    date: null,
    isOnPostClicked: false
  })

  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: InventoryRepository.MaterialsAdjustment.qry
  })

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      siteId: yup.string().required('This field is required')
    }),
    onSubmit: async obj => {
      console.log('formik.values.isOnPostClicked ', formik.values.isOnPostClicked)
      if (formik.values.isOnPostClicked) {
        handlePost(obj)
        formik.setFieldValue('isOnPostClicked', false)
      } else {
        postItemsGrid()
        if (!recordId) {
          toast.success('Record Added Successfully')
          setInitialData({
            ...obj,
            recordId: response.recordId
          })
        } else {
          toast.success('Record Edited Successfully')
        }
      }
      setEditMode(true)
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

  const handlePost = obj => {
    postRequest({
      extension: InventoryRepository.MaterialsAdjustment.post,
      record: JSON.stringify(obj)
    })
      .then(res => {
        console.log({ res })
        getGridData({})
        toast.success('Record Deleted Successfully')
      })
      .catch(error => {
        //setErrorMessage(error)
      })
  }

  const postItemsGrid = () => {
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

    const resultObject = {
      header: formik.values.rows,
      items: updatedRows,
      serials: [],
      lots: []
    }
    postRequest({
      extension: InventoryRepository.MaterialsAdjustment.set2,
      record: JSON.stringify(resultObject)
    })
      .then(res => {
        console.log({ res })
        getGridData({})
        toast.success('Record Deleted Successfully')
      })
      .catch(error => {
        //setErrorMessage(error)
      })
  }

  const lookupSKU = searchQry => {
    setItemStore([])

    if (searchQry) {
      var parameters = `_filter=${searchQry}&_categoryId=0&_msId=0&_startAt=0&_size=1000`
      getRequest({
        extension: InventoryRepository.Item.snapshot,
        parameters: parameters
      })
        .then(res => {
          setItemStore(res.list)
          console.log('lookup ', res.list)
        })
        .catch(error => {
          setErrorMessage(error)
        })
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
      width: 100
    },
    {
      field: 'textfield',
      header: labels[8],
      name: 'itemName',
      readOnly: true,
      width: 300
    },
    {
      field: 'textfield',
      header: labels[9],
      name: 'qty',
      mandatory: true,
      readOnly: false,
      width: 100
    },
    {
      field: 'textfield',
      header: labels[16],
      name: 'totalCost',
      mandatory: true,
      readOnly: true,
      width: 100
    },
    {
      field: 'textfield',
      header: labels[6],
      name: 'notes',
      width: 300
    }
  ]

  const fillDtStore = () => {
    console.log('ressss 1 ', res.list)

    /*const dg = EnumSystemFunction.SystemFunction.MaterialAdjustment
    const defaultParams = `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
    var parameters = defaultParams + `&_dgId=${dg}`
    getRequest({
      extension: SystemRepository.DocumentType.qry,
      parameters: parameters
    })
      .then(res => {
        setDtStore(res.list)
        console.log('ressss 2 ', res.list)
      })
      .catch(error => {
        // setErrorMessage(error.response.data)
      })*/
  }

  const fillSiteStore = () => {
    var parameters = `_filter=`
    getRequest({
      extension: InventoryRepository.Site.qry,
      parameters: parameters
    })
      .then(res => {
        setSiteStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const fillPlantStore = () => {
    var parameters = `_filter=`
    getRequest({
      extension: SystemRepository.Plant.qry,
      parameters: parameters
    })
      .then(res => {
        setPlantStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const fillDetailsGrid = adjId => {
    var parameters = `_filter=&_adjustmentId=${adjId}`
    getRequest({
      extension: InventoryRepository.MaterialsAdjustmentDetail.qry,
      parameters: parameters
    })
      .then(res => {
        // Create a new list by modifying each object in res.list
        const modifiedList = res.list.map(item => ({
          ...item,
          totalCost: item.unitCost * item.qty // Modify this based on your calculation
        }))

        console.log('response ', modifiedList)

        detailsFormik.setValues({
          ...detailsFormik.values,
          rows: modifiedList
        })
        console.log('detailsFormik ', detailsFormik.values.rows)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  useEffect(() => {
    ;(async function () {
      try {
        if (recordId) {
          setIsLoading(true)
          fillSiteStore()
          fillPlantStore()

          // fillDtStore()
          fillDetailsGrid(recordId)

          const res = await getRequest({
            extension: InventoryRepository.MaterialsAdjustment.get,
            parameters: `_recordId=${recordId}`
          })
          setIsPosted(res.record.status === 3 ? true : false)
          setInitialData(res.record)
          formik.setValues({
            ...formik.values,
            rows: res.record
          })
          console.log('check ', formik.values)
        }
      } catch (exception) {
        setErrorMessage(exception.message)
      } finally {
        setIsLoading(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.MaterialsAdjustment}
      form={formik}
      height={450}
      maxAccess={maxAccess}
      editMode={editMode}
      isPosted={isPosted}
    >
      <Box>
        <Grid container>
          {/* First Column */}
          <Grid container rowGap={1} xs={6}>
            <Grid item xs={12}>
              <CustomComboBox
                label={labels[2]}
                valueField='recordId'
                displayField='name'
                store={dtStore}
                name='dtId'
                value={dtStore.filter(item => item.recordId === formik.values?.dtId)[0]}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('dtId', newValue?.recordId)
                }}
                error={formik.touched.dtId && Boolean(formik.errors.dtId)}
                helperText={formik.touched.dtId && formik.errors.dtId}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='reference'
                label={labels[12]}
                value={formik?.values?.reference}
                maxAccess={maxAccess}
                maxLength='30'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('reference', '')}
                error={formik.touched.reference && Boolean(formik.errors.reference)}
                helperText={formik.touched.reference && formik.errors.reference}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='date'
                label={labels[3]}
                value={formik?.values?.date}
                onChange={formik.handleChange}
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('date', '')}
                error={formik.touched.date && Boolean(formik.errors.date)}
                helperText={formik.touched.date && formik.errors.date}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomComboBox
                label={labels[4]}
                valueField='recordId'
                displayField='name'
                store={plantStore}
                name='plantId'
                value={dtStore.filter(item => item.recordId === formik.values?.plantId)[0]}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('plantId', newValue?.recordId)
                }}
                error={formik.touched.plantId && Boolean(formik.errors.plantId)}
                helperText={formik.touched.plantId && formik.errors.plantId}
              />
            </Grid>
          </Grid>
          <Grid container rowGap={1} xs={6} sx={{ px: 2 }}>
            <Grid item xs={12}>
              <CustomComboBox
                label={labels[5]}
                valueField='recordId'
                displayField='name'
                store={siteStore}
                name='siteId'
                required
                value={dtStore.filter(item => item.recordId === formik.values?.siteId)[0]}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('siteId', newValue?.recordId)
                }}
                error={formik.touched.siteId && Boolean(formik.errors.siteId)}
                helperText={formik.touched.siteId && formik.errors.siteId}
              />
            </Grid>
            <Grid item xs={12} sx={{ pb: 6 }}>
              <CustomTextArea
                name='description'
                label={labels[13]}
                value={formik?.values?.description}
                rows={4}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('description', '')}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
              />
            </Grid>
          </Grid>
        </Grid>
      </Box>
      <Box sx={{ pt: 2 }}>
        <Grid container>
          <Grid xs={12}>
            <Box sx={{ width: '100%', height: `${height - 530}px`, overflowY: 'hidden' }}>
              <InlineEditGrid
                gridValidation={detailsFormik}
                columns={columns}
                allowDelete={true}
                allowAddNewLine={TrendingUp}
                scrollable={true}
                scrollHeight={`${height - 530}px`}
              />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </FormShell>
  )
}
