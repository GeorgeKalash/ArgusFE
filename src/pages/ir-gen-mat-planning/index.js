import { Box, Grid } from '@mui/material'
import { useContext, useState } from 'react'
import { useResourceQuery } from 'src/hooks/resource'
import { RequestsContext } from 'src/providers/RequestsContext'
import Table from 'src/components/Shared/Table'
import { ResourceIds } from 'src/resources/ResourceIds'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { AuthContext } from 'src/providers/AuthContext'
import { DataSets } from 'src/resources/DataSets'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import RPBGridToolbar from 'src/components/Shared/RPBGridToolbar'
import { IVReplenishementRepository } from 'src/repositories/IVReplenishementRepository'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import WindowToolbar from 'src/components/Shared/WindowToolbar'
import { ControlContext } from 'src/providers/ControlContext'

const GenerateMaterialPlaning = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const [values, setValues] = useState({
    searchValue: '',
    search: false,
    mrpId: ''
  })

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params } = options

    return await getRequest({
      extension: IVReplenishementRepository.materialPlaning.preview,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=${params || ''}`
    })
  }

  async function fetchWithFilter({ filters, pagination }) {
    return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params, show: true })
  }

  const {
    query: { data },
    labels,
    filterBy,
    access
  } = useResourceQuery({
    datasetId: ResourceIds.GenerateMRPs,
    endpointId: IVReplenishementRepository.materialPlaning.preview,
    queryFn: fetchGridData,
    filter: {
      filterFn: fetchWithFilter
    }
  })

  const columns = [
    { field: 'sku', headerName: labels.sku, width: 130 },
    { field: 'name', headerName: labels.name, width: 150 },
    { field: 'onhand', headerName: labels.onHand, width: 130 },
    { field: 'openPr', headerName: labels.openPR, width: 130 },
    { field: 'openPO', headerName: labels.openPo, width: 130 },
    { field: 'leadTime', headerName: labels.leadTime, width: 130 },
    { field: 'safetyStock', headerName: labels.safetyStock, width: 130 },
    { field: 'reorderPoint', headerName: labels.reorderPoint, width: 130 },
    { field: 'minStock', headerName: labels.min, width: 130 },
    { field: 'maxStock', headerName: labels.max, width: 130 },
    { field: 'amcShortTerm', headerName: labels.amcShortTerm, width: 130 },
    { field: 'amcLongTerm', headerName: labels.amcLongTerm, width: 130 },
    { field: 'siteCoverageStock', headerName: labels.siteCoverageStock, width: 130 },
    { field: 'totalStockCoverage', headerName: labels.totalCoverageStock, width: 130 },
    { field: 'msRef', headerName: labels.mu, width: 130 },
    { field: 'unitCost', headerName: labels.unitCost, width: 130 },
    { field: 'totalCost', headerName: labels.totalCost, width: 130 },
    { field: 'suggestedPRQty', headerName: labels.sugQty, width: 130 },
    { field: 'qty', headerName: labels.reqQty, width: 130 }
  ]

  const add = async () => {
    await postRequest({
      extension: IVReplenishementRepository.MatPlanningItem.append,
      record: JSON.stringify({ mrpId: values.mrpId, items: data.list.filter(item => item?.checked) })
    })

    toast.success(platformLabels.Generated)
  }

  const actions = [
    {
      key: 'add',
      condition: true,
      onClick: add,
      disabled: !values.mrpId
    }
  ]

  const result =
    values.search &&
    data?.list?.filter(
      item =>
        item?.sku?.toLowerCase()?.includes(values?.searchValue?.toLowerCase()) ||
        item?.name?.toLowerCase().includes(values?.searchValue?.toLowerCase())
    )

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar
          maxAccess={access}
          reportName={'previewMRP'}
          filterBy={filterBy}
          hasSearch={false}
          middleSection={
            <Grid item xs={3}>
              <CustomTextField
                name='search'
                label={labels.search}
                value={values.searchValue}
                search
                onChange={e =>
                  setValues(prev => ({
                    ...prev,
                    searchValue: e.target.value,
                    search: false
                  }))
                }
                onSearch={value =>
                  setValues(prev => ({
                    ...prev,
                    search: true
                  }))
                }
                onClear={() =>
                  setValues(prev => ({
                    ...prev,
                    searchValue: '',
                    search: true
                  }))
                }
                maxAccess={access}
              />
            </Grid>
          }
          rightSection={
            <ResourceComboBox
              endpointId={IVReplenishementRepository.MatPlanning.qry}
              filter={item => item.status === 1}
              label={labels.matReqPlan}
              name='moduleId'
              values={values}
              valueField='recordId'
              displayField='reference'
              onChange={(event, newValue) => {
                setValues(prev => ({
                  ...prev,
                  mrpId: newValue?.recordId || null
                }))
              }}
              maxAccess={access}
            />
          }
        />
      </Fixed>
      <Grow>
        <Table
          name='table'
          columns={columns}
          gridData={values?.search ? { list: result } : data}
          rowId={['recordId']}
          isLoading={false}
          pageSize={50}
          maxAccess={access}
          pagination={false}
          showCheckboxColumn={true}
        />
      </Grow>
      <Fixed>
        <WindowToolbar smallBox={true} actions={actions} />
      </Fixed>
    </VertLayout>
  )
}

export default GenerateMaterialPlaning
