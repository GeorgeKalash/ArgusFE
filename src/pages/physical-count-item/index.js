import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import Table from 'src/components/Shared/Table'
import { useContext, useEffect, useState } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Button, Grid } from '@mui/material'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { ControlContext } from 'src/providers/ControlContext'
import { useResourceQuery } from 'src/hooks/resource'
import { useWindow } from 'src/windows'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SCRepository } from 'src/repositories/SCRepository'
import FormShell from 'src/components/Shared/FormShell'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { useForm } from 'src/hooks/form'
import * as yup from 'yup'

const PhysicalCountItem = () => {
  const { stack } = useWindow()
  const { getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const [data, setData] = useState([])
  const [siteStore, setSiteStore] = useState([])

  const {
    //query: { data },
    labels: _labels,
    refetch,
    maxAccess
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: SCRepository.StockCountItem.qry,
    datasetId: ResourceIds.IVPhysicalCountItem
  })

  const { formik } = useForm({
    initialValues: {
      stockCountId: '',
      siteId: '',
      totalCostPrice: '',
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
      extension: SCRepository.StockCountItem.qry,
      parameters: `_stockCountId=${formik.values?.stockCountId}&_siteId=${formik.values?.siteId}`
    })

    let sumCost = 0
    let sumWeight = 0

    const updatedList = res.list.map(item => {
      /* let decimalValue = 0
      if (item.countedQty != null && item.currentCost != null) {
        decimalValue = Math.round(item.countedQty * item.currentCost * 100) / 100 
      } */

      sumCost += item.currentCost || 0
      sumWeight += item.weight || 0

      /* return {
        ...item,
        costValue: decimalValue
      } */
    })
    formik.setFieldValue('totalCostPrice', sumCost)
    formik.setFieldValue('totalWeight', sumWeight)

    console.log(res)

    console.log(updatedList)

    //return res.list
    setData(res ?? { list: [] })

    //return { ...response }
  }

  const fillSiteStore = stockCountId => {
    var parameters = `_stockCountId=${stockCountId}`
    getRequest({
      extension: SCRepository.Sites.qry,
      parameters: parameters
    })
      .then(res => {
        setSiteStore(res.list)
      })
      .catch(error => {})
  }

  const columns = [
    {
      field: 'sku',
      headerName: _labels.sku,
      flex: 1
    },
    {
      field: 'itemName',
      headerName: _labels.itemName,
      flex: 1
    },
    {
      field: 'countedQty',
      headerName: _labels.qty,
      flex: 1
    },
    {
      field: 'systemQty',
      headerName: _labels.system,
      flex: 1
    },
    {
      field: 'varianceQty',
      headerName: _labels.variation,
      flex: 1
    },
    {
      field: 'currentCost',
      headerName: _labels.costPrice,
      flex: 1
    },
    {
      field: 'weight',
      headerName: _labels.weight,
      flex: 1
    }
  ]

  useEffect(() => {
    ;(async function () {
      try {
        await fetchGridData()
      } catch (error) {}
    })()
  }, [formik.values.stockCountId, formik.values.siteId])

  const clearGrid = () => {
    formik.resetForm({
      values: formik.initialValues
    })

    setData({ list: [] })
    setSiteStore([])
  }

  const handleClick = async () => {
    try {
      /* const convertedData = getImportData(parsedFileContent, columns)

      const data = {
        [objectName]: convertedData
      }

      try {
        const res = await postRequest({
          extension: endPoint,
          record: JSON.stringify(data)
        })

        stack({
          Component: ThreadProgress,
          props: {
            recordId: res.recordId,
            access
          },
          width: 500,
          height: 450,
          closable: false,
          title: platformLabels.Progress
        })

        toast.success(platformLabels.Imported)
      } catch (exception) {} */
    } catch (error) {}
  }

  const actions = [
    {
      key: 'Import',
      condition: true,
      onClick: () => handleClick()
    }
  ]

  return (
    <FormShell
      form={formik}
      isInfo={false}
      isSaved={false}
      isCleared={false}
      isSavedClear={false}
      actions={actions}
      maxAccess={maxAccess}
      resourceId={ResourceIds.IVPhysicalCountItem}
      previewReport={true}
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
                //filter={item => item.isChecked}
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
            //rowId={['recordId']}

            setData={setData}
            isLoading={false}
            pageSize={50}
            refetch={refetch}
            paginationType='api'
            pagination={false}
            maxAccess={maxAccess}
            textTransform={true}
          />
        </Grow>
        <Fixed>
          {/*  <WindowToolbar smallBox={true} actions={actions} /> */}
          <Grid container justifyContent='flex-end' spacing={2} sx={{ pt: 5 }}>
            <Grid item xs={2}>
              <CustomNumberField
                name='totalCostPrice'
                label={_labels.totalCostPrice}
                value={formik.values.totalCostPrice}
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
