import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { useContext, useEffect, useState } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grid } from '@mui/material'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { SCRepository } from '@argus/repositories/src/repositories/SCRepository'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import * as yup from 'yup'
import ClearGridConfirmation from '@argus/shared-ui/src/components/Shared/ClearGridConfirmation'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import CustomButton from '@argus/shared-ui/src/components/Inputs/CustomButton'

const PhysicalCountItem = () => {
  const { getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const [data, setData] = useState([])
  const [siteStore, setSiteStore] = useState([])
  const { stack } = useWindow()

  const {
    labels: _labels,
    refetch,
    access
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
    maxAccess: access,
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

    res.list.map(item => {
      sumCost += item.currentCost || 0
      sumWeight += item.weight || 0
    })

    formik.setFieldValue('totalCostPrice', sumCost)
    formik.setFieldValue('totalWeight', sumWeight)
    setData(res || { list: [] })
  }

  const editMode = data?.list?.length > 0

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
      await fetchGridData()
    })()
  }, [formik.values.stockCountId, formik.values.siteId])

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
        }
      }
    })
  }

  const handleMetalClick = async () => {
    const metalItemsList = data?.list
      ?.filter(item => item.metalId)
      .map(item => ({
        qty: item.countedQty,
        metalRef: '',
        metalId: item.metalId,
        metalPurity: item.metalPurity,
        weight: item.weight,
        priceType: item.priceType
      }))

    return metalItemsList || []
  }

  const actions = [
    {
      key: 'Metals',
      condition: true,
      onClick: 'onClickMetal',
      handleMetalClick
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
      maxAccess={access}
      resourceId={ResourceIds.IVPhysicalCountItem}
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
                maxAccess={access}
                onChange={(_, newValue) => {
                  formik.setFieldValue('stockCountId', newValue?.recordId)
                  formik.setFieldValue('siteId', '')

                  if (!newValue) {
                    setSiteStore([])
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
                maxAccess={access}
              />
            </Grid>
            <Grid item xs={2}>
              <CustomButton
                image='clear.png'
                tooltipText={platformLabels.Clear}
                onClick={openClear}
                style={{
                  backgroundColor: '#f44336'
                }}
              />
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <Table
            columns={columns}
            gridData={data ?? { list: [] }}
            rowId={['recordId']}
            isLoading={false}
            pageSize={50}
            refetch={refetch}
            paginationType='api'
            pagination={false}
            maxAccess={access}
            textTransform={true}
          />
        </Grow>
        <Fixed>
          <Grid container justifyContent='flex-end' spacing={2} sx={{ pt: 5 }}>
            <Grid item xs={2}>
              <CustomNumberField
                name='totalCostPrice'
                label={_labels.totalCostPrice}
                value={formik.values.totalCostPrice}
                readOnly={true}
                hidden={!(formik.values.stockCountId && formik.values.siteId)}
                maxAccess={access}
              />
            </Grid>
            <Grid item xs={2}>
              <CustomNumberField
                name='totalWeight'
                label={_labels.totalWeight}
                value={formik.values.totalWeight}
                readOnly={true}
                hidden={!(formik.values.stockCountId && formik.values.siteId)}
                maxAccess={access}
              />
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}

export default PhysicalCountItem
