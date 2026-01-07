import { useContext, useState } from 'react'
import toast from 'react-hot-toast'
import * as yup from 'yup'
import { Grid, Box } from '@mui/material'

import Table from '@argus/shared-ui/src/components/Shared/Table'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'

import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { useWindow } from '@argus/shared-providers/src/providers/windows'

import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { useForm } from '@argus/shared-hooks/src/hooks/form'

import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'

import BarcodesForm from '@argus/shared-ui/src/components/Shared/Forms/BarcodesForm'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import CustomButton from '@argus/shared-ui/src/components/Inputs/CustomButton'

const IvBarcodes = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  const [skuValue, setSku] = useState(null)

  const { formik } = useForm({
    initialValues: { itemId: null },
    validateOnChange: true,
    validationSchema: yup.object({
      itemId: yup.string().required()
    })
  })

  /* ===================== DATA ===================== */

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: InventoryRepository.Barcodes.qry,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=&filter=&_itemId=${skuValue || 0}`
    })

    return { ...response, _startAt }
  }

  async function fetchWithSearch({ options = {}, qry }) {
    const { _startAt = 0, _size = 50 } = options

    return getRequest({
      extension: InventoryRepository.Barcodes.snapshot,
      parameters: `_filter=${qry}&_startAt=${_startAt}&_size=${_size}`
    })
  }

  const {
    query: { data },
    labels: _labels,
    paginationParameters,
    refetch,
    access,
    search,
    clear,
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: InventoryRepository.Barcodes.qry,
    datasetId: ResourceIds.Barcodes,
    search: {
      endpointId: InventoryRepository.Barcodes.snapshot,
      searchFn: fetchWithSearch
    }
  })

  /* ===================== GRID ===================== */

  const columns = [
    { field: 'barcode', headerName: _labels.barcode, flex: 1 },
    { field: 'sku', headerName: _labels.sku, flex: 1 },
    { field: 'itemName', headerName: _labels.itemName, flex: 1 },
    { field: 'muName', headerName: _labels.msUnit, flex: 1 },
    { field: 'defaultQty', headerName: _labels.defaultQty, flex: 1 },
    { field: 'scaleDescription', headerName: _labels.scaleDescription, flex: 1 },
    { field: 'posDescription', headerName: _labels.posDescription, flex: 1 }
  ]

  /* ===================== ACTIONS ===================== */

  const openForm = obj => {
    stack({
      Component: BarcodesForm,
      props: {
        labels: _labels,
        recordId: obj?.recordId,
        barcode: obj?.barcode,
        msId: obj?.msId,
        maxAccess: access
      },
      title: _labels.Barcodes
    })
  }

  const add = () => openForm()

  const edit = obj => openForm(obj)

  const del = async obj => {
    await postRequest({
      extension: InventoryRepository.Barcodes.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar
          onAdd={add}
          maxAccess={access}
          onSearch={search}
          onSearchClear={clear}
          labels={_labels}
          inputSearch
          refetch={refetch}
          middleSection={
            <Grid item sx={{ display: 'flex', mr: 2 }}>
              <Grid
                container
                alignItems="center"
                spacing={2}
                wrap="nowrap"
                sx={{ mr: 2 }}
              >
                <Grid item sx={{ minWidth: 280 }}>
                  <ResourceLookup
                    endpointId={InventoryRepository.Item.snapshot}
                    name="itemId"
                    label={_labels?.sku}
                    valueField="recordId"
                    displayField="sku"
                    valueShow="itemRef"
                    secondValueShow="itemName"
                    form={formik}
                    columnsInDropDown={[
                      { key: 'sku', value: 'SKU' },
                      { key: 'name', value: 'Name' }
                    ]}
                    onChange={(_, newValue) => {
                      formik.setFieldValue('itemId', newValue?.recordId)
                      setSku(newValue?.recordId)
                    }}
                    displayFieldWidth={2}
                    maxAccess={access}
                  />
                </Grid>

                <Grid item>
                  <CustomButton
                    label={platformLabels.Apply}
                    onClick={refetch}
                  />
                </Grid>
              </Grid>
            </Grid>
          }
        />
      </Fixed>

      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          deleteConfirmationType="strict"
          isLoading={false}
          pageSize={50}
          paginationType="api"
          paginationParameters={paginationParameters}
          refetch={refetch}
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default IvBarcodes
