import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import Table from 'src/components/Shared/Table'
import { useContext, useEffect, useMemo, useState } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Button, Grid } from '@mui/material'
import { ControlContext } from 'src/providers/ControlContext'
import { useResourceQuery } from 'src/hooks/resource'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SCRepository } from 'src/repositories/SCRepository'
import FormShell from 'src/components/Shared/FormShell'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { useForm } from 'src/hooks/form'
import * as yup from 'yup'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { formatDateFromApi } from 'src/lib/date-helper'
import { useWindow } from 'src/windows'
import ClearGridConfirmation from 'src/components/Shared/ClearGridConfirmation'

const PhysicalCountSerial = () => {
  const { getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const [data, setData] = useState([])
  const [siteStore, setSiteStore] = useState([])
  const [filteredItems, setFilteredItems] = useState([])
  const [editMode, setEditMode] = useState(false)
  const { stack } = useWindow()

  const { labels: _labels, maxAccess } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: SCRepository.StockCountSerialSum.qry,
    datasetId: ResourceIds.PhysicalCountSerialSummary
  })

  const { formik } = useForm({
    initialValues: {
      stockCountId: null,
      siteId: null,
      totalCountedPcs: null,
      totalWeight: null,
      totalSystemPcs: null,
      totalVariancePcs: null,
      totalVarianceWeight: null,
      date: '',
      reference: '',
      search: ''
    },
    maxAccess,
    enableReinitialize: false,
    validateOnChange: true
  })

  const handleSearchChange = event => {
    const { value } = event.target
    formik.setFieldValue('search', value)
  }

  async function fetchGridData() {
    if (!formik.values.stockCountId || !formik.values.siteId) return

    const res = await getRequest({
      extension: SCRepository.StockCountSerialSum.qry,
      parameters: `_stockCountId=${formik.values.stockCountId}&_siteId=${formik.values.siteId}`
    })

    const updatedList = res.list.map(item => {
      return {
        ...item,
        netWeight: item.weight * item.countedPcs,
        varianceWght: item.weight * item.variancePcs
      }
    })

    let sumPcs = 0
    let sumWeight = 0
    let sumSystemPcs = 0
    let sumVariancePcs = 0
    let sumVarianceWght = 0

    updatedList.forEach(item => {
      sumPcs += item.countedPcs || 0
      sumWeight += item.netWeight || 0
      sumSystemPcs += item.systemPcs || 0
      sumVariancePcs += item.variancePcs || 0
      sumVarianceWght += item.varianceWght || 0
    })

    formik.setFieldValue('totalCountedPcs', sumPcs)
    formik.setFieldValue('totalWeight', sumWeight)
    formik.setFieldValue('totalSystemPcs', sumSystemPcs)
    formik.setFieldValue('totalVariancePcs', sumVariancePcs)
    formik.setFieldValue('totalVarianceWeight', sumVarianceWght)

    setData({ list: updatedList })
    handleClick(updatedList)
  }

  const fillSiteStore = stockCountId => {
    setSiteStore([])
    var parameters = `_stockCountId=${stockCountId}`
    getRequest({
      extension: SCRepository.Sites.qry,
      parameters: parameters
    }).then(res => {
      setSiteStore(res.list.filter(site => site.isChecked == true))
    })
  }

  const columns = [
    {
      field: 'srlNo',
      headerName: _labels.srlNo,
      flex: 1
    },
    {
      field: 'sku',
      headerName: _labels.sku,
      flex: 1
    },
    {
      field: 'itemName',
      headerName: _labels.name,
      flex: 1
    },
    {
      field: 'countedPcs',
      headerName: _labels.countedPcs,
      flex: 1,
      type: 'number'
    },
    {
      field: 'systemPcs',
      headerName: _labels.systemPcs,
      flex: 1,
      type: 'number'
    },
    {
      field: 'variancePcs',
      headerName: _labels.variancePcs,
      flex: 1,
      type: 'number'
    },
    {
      field: 'weight',
      headerName: _labels.weight,
      flex: 1,
      type: 'number'
    },

    {
      field: 'varianceWght',
      headerName: _labels.varW,
      flex: 1,
      type: 'number'
    },
    {
      field: 'netWeight',
      headerName: _labels.netWeight,
      flex: 1,
      type: 'number'
    }
  ]

  useEffect(() => {
    ;(async function () {
      await fetchGridData()
    })()
  }, [formik.values.siteId])

  function openClear() {
    stack({
      Component: ClearGridConfirmation,
      props: {
        open: { flag: true },
        fullScreen: false,
        dialogText: platformLabels.ClearFormGrid,
        onConfirm: () => {
          formik.resetForm()
          setData({ list: [] })
          setSiteStore([])
          setFilteredItems([])
          setEditMode(false)
        }
      },
      width: 570,
      height: 170,
      title: platformLabels.Clear
    })
  }

  const handleClick = async dataList => {
    setFilteredItems([])

    const filteredItemsList = dataList
      .filter(item => item.metalId && item.metalId.toString().trim() !== '')
      .map(item => ({
        qty: item.countedQty,
        metalRef: null,
        metalId: item.metalId,
        metalPurity: item.metalPurity,
        weight: item.weight,
        priceType: item.priceType
      }))
    setFilteredItems(filteredItemsList)
    setEditMode(dataList.length > 0)
  }

  const filtered = useMemo(
    () => ({
      ...data,
      list: data?.list?.filter(
        item =>
          (item.sku && item.sku.toString().toLowerCase().includes(formik.values.search.toLowerCase())) ||
          (item.srlNo && item.srlNo.toLowerCase().includes(formik.values.search.toLowerCase())) ||
          (item.weight && item.weight.toString().toLowerCase().includes(formik.values.search.toLowerCase()))
      )
    }),
    [formik.values.search, data]
  )

  return (
    <FormShell
      form={formik}
      isInfo={false}
      isSaved={false}
      isCleared={false}
      isSavedClear={false}
      maxAccess={maxAccess}
      resourceId={ResourceIds.PhysicalCountSerialSummary}
      filteredItems={filteredItems}
      previewReport={editMode}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={2}>
              <ResourceComboBox
                endpointId={SCRepository.StockCount.qry}
                parameters={`_startAt=0&_pageSize=1000&_params=`}
                name='stockCountId'
                label={_labels.stockCount}
                valueField='recordId'
                displayField='reference'
                values={formik.values}
                required
                readOnly={formik.values.siteId}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('stockCountId', newValue?.recordId)
                  formik.setFieldValue('reference', newValue?.reference)
                  formik.setFieldValue('date', formatDateFromApi(newValue?.date))
                  formik.setFieldValue('siteId', '')

                  if (!newValue) {
                    setSiteStore([])
                    setFilteredItems([])
                    formik.setFieldValue('date', '')
                    formik.setFieldValue('reference', '')
                    openClear()
                  } else {
                    fillSiteStore(newValue?.recordId)
                  }
                }}
                error={formik.touched.stockCountId && Boolean(formik.errors.stockCountId)}
              />
            </Grid>
            <Grid item xs={2}>
              <CustomDatePicker
                name='date'
                label={_labels.date}
                value={formik.values.date}
                readOnly={true}
                error={false}
              />
            </Grid>
            <Grid item xs={2}>
              <CustomTextField
                name='reference'
                label={_labels.reference}
                value={formik.values.reference}
                readOnly={true}
                error={false}
              />
            </Grid>
            <Grid item xs={6}></Grid>
            <Grid item xs={2}>
              <ResourceComboBox
                name='siteId'
                store={siteStore}
                label={_labels.site}
                valueField='siteId'
                displayField={['siteRef', 'siteName']}
                columnsInDropDown={[
                  { key: 'siteRef', value: 'Reference' },
                  { key: 'siteName', value: 'Name' }
                ]}
                values={formik.values}
                required
                readOnly={formik.values.siteId}
                onChange={(event, newValue) => {
                  formik.setFieldValue('siteId', newValue?.siteId)
                }}
                error={formik.touched.siteId && Boolean(formik.errors.siteId)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={10}></Grid>
            <Grid item xs={2}>
              <CustomTextField
                name='search'
                value={formik.values.search}
                label={_labels.search}
                onClear={() => {
                  formik.setFieldValue('search', '')
                }}
                onChange={handleSearchChange}
                readOnly={data?.list?.length === 0 || data?.length === 0}
              />
            </Grid>
            <Grid item xs={2}>
              <Button
                onClick={openClear}
                sx={{
                  backgroundColor: '#f44336',
                  '&:hover': {
                    backgroundColor: '#f44336',
                    opacity: 0.8
                  }
                }}
                variant='contained'
              >
                <img src='/images/buttonsIcons/clear.png' alt={platformLabels.Clear} />
              </Button>
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <Table
            columns={columns}
            gridData={filtered ?? { list: [] }}
            rowId={['recordId']}
            //setData={setData}
            isLoading={false}
            paginationType='api'
            pagination={false}
            maxAccess={maxAccess}
            textTransform={true}
          />
        </Grow>
        <Fixed>
          <Grid container spacing={2} sx={{ pt: 3 }}>
            <Grid item xs={4}></Grid>
            <Grid item xs={8}>
              <Grid container spacing={2}>
                <Grid item xs={2}>
                  <CustomNumberField
                    name='totalCountedPcs'
                    label={_labels.totalCountedPcs}
                    value={formik.values.totalCountedPcs}
                    readOnly={true}
                    hidden={!(formik.values.stockCountId && formik.values.siteId)}
                  />
                </Grid>
                <Grid item xs={2}>
                  <CustomNumberField
                    name='totalSystemPcs'
                    label={_labels.totalSys}
                    value={formik.values.totalSystemPcs}
                    readOnly={true}
                    hidden={!(formik.values.stockCountId && formik.values.siteId)}
                  />
                </Grid>
                <Grid item xs={2}>
                  <CustomNumberField
                    name='totalVariancePcs'
                    label={_labels.tPv}
                    value={formik.values.totalVariancePcs}
                    readOnly={true}
                    hidden={!(formik.values.stockCountId && formik.values.siteId)}
                  />
                </Grid>
                <Grid item xs={2}>
                  <CustomNumberField
                    name='totalWeight'
                    label={_labels.totalWeight}
                    value={formik.values.totalWeight}
                    readOnly={true}
                    hidden={!(formik.values.stockCountId && formik.values.siteId)}
                  />
                </Grid>
                <Grid item xs={2}>
                  <CustomNumberField
                    name='totalVarianceWeight'
                    label={_labels.tVw}
                    value={formik.values.totalVarianceWeight}
                    readOnly={true}
                    hidden={!(formik.values.stockCountId && formik.values.siteId)}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}

export default PhysicalCountSerial
