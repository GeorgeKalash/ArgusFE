import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { useContext, useEffect, useMemo, useState } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grid } from '@mui/material'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { SCRepository } from '@argus/repositories/src/repositories/SCRepository'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import { formatDateFromApi } from '@argus/shared-domain/src/lib/date-helper'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import ClearGridConfirmation from '@argus/shared-ui/src/components/Shared/ClearGridConfirmation'
import Form from '@argus/shared-ui/src/components/Shared/Form'
import CustomButton from '@argus/shared-ui/src/components/Inputs/CustomButton'

const PhysicalCountSerial = () => {
  const { getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const [data, setData] = useState([])
  const [siteStore, setSiteStore] = useState([])
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
        }
      }
    })
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
    <Form
      isSaved={false}
      maxAccess={maxAccess}
      resourceId={ResourceIds.PhysicalCountSerialSummary}
      previewReport={data?.list?.length > 0}
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
                onChange={(_, newValue) => {
                  formik.setFieldValue('stockCountId', newValue?.recordId)
                  formik.setFieldValue('reference', newValue?.reference)
                  formik.setFieldValue('date', formatDateFromApi(newValue?.date))
                  formik.setFieldValue('siteId', '')

                  if (!newValue) {
                    setSiteStore([])
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
                onChange={(_, newValue) => {
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
            <CustomButton
              image='clear.png'
              tooltipText={platformLabels.Clear}
              onClick={openClear}
              style={{
                backgroundColor: '#f44336',
              }}
            />
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <Table
            columns={columns}
            gridData={filtered ?? { list: [] }}
            rowId={['recordId']}
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
    </Form>
  )
}

export default PhysicalCountSerial
