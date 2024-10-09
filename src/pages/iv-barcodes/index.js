import { useContext, useState } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import * as yup from 'yup'
import { useWindow } from 'src/windows'
import { ControlContext } from 'src/providers/ControlContext'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import BarcodesForm from './Forms/BarcodesForm'
import { Box, Button, Grid } from '@mui/material'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { useForm } from 'src/hooks/form'

const IvBarcodes = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const [skuValue, setSku] = useState('')

  const { stack } = useWindow()

  const { formik } = useForm({
    initialValues: {
      itemId: null
    },
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      itemId: yup.string().required()
    })
  })

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: InventoryRepository.Barcodes.qry,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=&filter=&_itemId=${skuValue || 0}`
    })

    return { ...response, _startAt: _startAt }
    
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

  async function fetchWithSearch({ options = {}, qry }) {
    const { _startAt = 0, _size = 50 } = options

    const response = await getRequest({
      extension: InventoryRepository.Barcodes.snapshot,
      parameters: `_filter=${qry}&_startAt=${_startAt}&_size=${_size}`
    })

    return response
  }

  const columns = [
    {
      field: 'barcode',
      headerName: _labels.barcode,
      flex: 1
    },
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
      field: 'muName',
      headerName: _labels.measurementUnit,
      flex: 1
    },
    {
      field: 'defaultQty',
      headerName: _labels.defaultQty,
      flex: 1
    }
  ]

  const edit = obj => {
    openForm(obj)
  }

  function openForm(obj) {
    stack({
      Component: BarcodesForm,
      props: {
        labels: _labels,
        recordId: obj?.recordId,
        barcode: obj?.barcode,
        msId: obj?.msId,
        maxAccess: access
      },
      width: 600,
      height: 500,
      title: _labels.Barcodes
    })
  }

  const add = () => {
    openForm()
  }

  const del = async obj => {
    await postRequest({
      extension: InventoryRepository.Items.del,
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
          inputSearch={true}
          refetch={refetch}
          middleSection={
            <Grid item sx={{ display: 'flex', mr: 2 }}>
              <ResourceLookup
                endpointId={InventoryRepository.Item.snapshot}
                name='itemId'
                label={_labels?.sku}
                valueField='recordId'
                displayField='sku'
                valueShow='itemRef'
                secondValueShow='itemName'
                form={formik}
                columnsInDropDown={[
                  { key: 'sku', value: 'SKU' },
                  { key: 'name', value: 'Name' }
                ]}
                onChange={(event, newValue) => {
                  formik.setFieldValue('itemId', newValue?.recordId)
                  formik.setFieldValue('itemName', newValue?.name)
                  formik.setFieldValue('sku', newValue?.sku)
                  formik.setFieldValue('itemRef', newValue?.sku)
                  setSku(newValue?.recordId)
                }}
                displayFieldWidth={2}
                maxAccess={access}
              />
              <Button
                sx={{ minWidth: '90px !important', pr: 2, ml: 2, height: 35 }}
                variant='contained'
                size='small'
                onClick={refetch}
              >
                {platformLabels.Apply}
              </Button>
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
          deleteConfirmationType={'strict'}
          isLoading={false}
          pageSize={50}
          paginationType='api'
          paginationParameters={paginationParameters}
          refetch={refetch}
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default IvBarcodes
