import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import Table from 'src/components/Shared/Table'
import { useContext, useEffect, useState } from 'react'
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

const PhysicalCountItem = () => {
  const { getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const [data, setData] = useState([])
  const [siteStore, setSiteStore] = useState([])
  const [filteredItems, setFilteredItems] = useState([])
  const [editMode, setEditMode] = useState(false)

  const {
    labels: _labels,
    refetch,
    maxAccess
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: SCRepository.StockCountSerialSum.qry,
    datasetId: ResourceIds.PhysicalCountSerialSummary
  })

  const { formik } = useForm({
    initialValues: {
      stockCountId: '',
      siteId: '',
      totalCountedPcs: '',
      totalWeight: ''
    },
    maxAccess,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      stockCountId: yup.string().required(),
      siteId: yup.string().required()
    })
  })

  async function fetchGridData() {
    if (!formik.values.stockCountId || !formik.values.siteId) return

    const res = await getRequest({
      extension: SCRepository.StockCountSerialSum.qry,
      parameters: `_stockCountId=${formik.values.stockCountId}&_siteId=${formik.values.siteId}`
    })

    let sumPcs = 0
    let sumWeight = 0

    const updatedList = res.list.map(item => {
      sumPcs += item.countedPcs || 0
      sumWeight += item.weight || 0

      return {
        ...item,
        netWeight: item.weight * item.countedPcs,
        varianceWght: item.weight * item.variancePcs
      }
    })

    formik.setFieldValue('totalCountedPcs', sumPcs)
    formik.setFieldValue('totalWeight', sumWeight)

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
      setSiteStore(res.list)
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
      field: 'netWeight',
      headerName: 'Net Weight',
      flex: 1,
      type: 'number'
    },
    {
      field: 'varianceWght',
      headerName: 'Variance Weight',
      flex: 1,
      type: 'number'
    }
  ]

  useEffect(() => {
    ;(async function () {
      await fetchGridData()
    })()
  }, [formik.values.stockCountId, formik.values.siteId])

  const clearGrid = () => {
    formik.resetForm({
      values: formik.initialValues
    })

    setData({ list: [] })
    setSiteStore([])
    setFilteredItems([])
    setEditMode(false)
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
                  formik.setFieldValue('siteId', '')

                  if (!newValue) {
                    setSiteStore([])
                    setFilteredItems([])
                    clearGrid()
                  } else {
                    fillSiteStore(newValue?.recordId)
                  }
                }}
                error={formik.touched.stockCountId && Boolean(formik.errors.stockCountId)}
              />
            </Grid>
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
            <Grid item xs={2}>
              <Button
                onClick={clearGrid}
                sx={{
                  backgroundColor: '#f44336',
                  '&:hover': {
                    backgroundColor: '#f44336',
                    opacity: 0.8
                  },
                  ml: 2
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
            gridData={data ?? { list: [] }}
            rowId={['recordId']}
            setData={setData}
            isLoading={false}
            paginationType='api'
            pagination={false}
            maxAccess={maxAccess}
            textTransform={true}
          />
        </Grow>
        <Fixed>
          <Grid container justifyContent='flex-end' spacing={2} sx={{ pt: 5 }}>
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
                name='totalWeight'
                label={_labels.totalWeight}
                value={formik.values.totalWeight}
                readOnly={true}
                hidden={!(formik.values.stockCountId && formik.values.siteId)}
              />
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}

export default PhysicalCountItem
