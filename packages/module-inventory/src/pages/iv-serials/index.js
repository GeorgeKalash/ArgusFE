import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import { Grid } from '@mui/material'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import SerialsWindow from './Windows/SerialsWindow'
import CustomButton from '@argus/shared-ui/src/components/Inputs/CustomButton'

const IvSerials = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { stack } = useWindow()

  const { formik } = useForm({
    initialValues: {
      itemId: null,
      srlNo: ''
    }
  })

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    if (formik.values.itemId || formik.values.srlNo) {
      const response = await getRequest({
        extension: InventoryRepository.Serial.qry,
        parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=&filter=&_itemId=${
          formik.values.itemId || 0
        }&_srlNo=${formik.values.srlNo || 0}`
      })

      return { ...response, _startAt: _startAt }
    } else {
      return []
    }
  }

  const {
    query: { data },
    labels: labels,
    paginationParameters,
    refetch,
    access,
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: InventoryRepository.Serial.qry,
    datasetId: ResourceIds.IVSerials
  })

  const columns = [
    {
      field: 'srlNo',
      headerName: labels.srlNo,
      flex: 1
    },
    {
      field: 'sku',
      headerName: labels.sku,
      flex: 1
    },
    {
      field: 'itemName',
      headerName: labels.itemName,
      flex: 1
    },
    {
      field: 'statusName',
      headerName: labels.status,
      flex: 1
    },
    {
      field: 'weight',
      headerName: labels.weight,
      flex: 1,
      type: 'number'
    }
  ]

  const edit = obj => {
    openForm(obj?.srlNo)
  }

  function openForm(recordId) {
    stack({
      Component: SerialsWindow,
      props: {
        labels,
        recordId,
        maxAccess: access
      },
      width: 850,
      height: 470,
      title: labels.Serials
    })
  }

  const add = () => {
    openForm()
  }

  const del = async obj => {
    await postRequest({
      extension: InventoryRepository.Serial.del,
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
          labels={labels}
          refetch={refetch}
          middleSection={
            <Grid item>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <CustomTextField
                    name='srlNo'
                    label={labels.srlNo}
                    value={formik.values.srlNo}
                    maxLength='20'
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('srlNo', null)}
                    maxAccess={access}
                  />
                </Grid>
                <Grid item xs={7}>
                  <ResourceLookup
                    endpointId={InventoryRepository.Item.snapshot}
                    filter={{ trackBy: 1 }}
                    name='itemId'
                    label={labels.sku}
                    valueField='recordId'
                    displayField='name'
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
                    }}
                    displayFieldWidth={2}
                    maxAccess={access}
                  />
                </Grid>
                <Grid item xs={1}>
                  <CustomButton
                    onClick={refetch}
                    label={platformLabels.Apply}
                    color='#231F20'
                    image='go.png'
                    disabled={!formik.values.itemId && !formik.values.srlNo}
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

export default IvSerials
