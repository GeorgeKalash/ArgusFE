import { useContext } from 'react'
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
import { Grid } from '@mui/material'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { useForm } from 'src/hooks/form'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import SerialsForm from './Forms/SerialsForm'
import CustomButton from 'src/components/Inputs/CustomButton'
import { useError } from 'src/error'

const IvSerials = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack: stackError } = useError()

  const { stack } = useWindow()

  const { formik } = useForm({
    initialValues: {
      itemId: null,
      srlNo: ''
    },
    validateOnChange: true,
    validationSchema: yup.object({
      itemId: yup.string().required()
    })
  })

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    if (formik.values.itemId || formik.values.srlNo) {
      const response = await getRequest({
        extension: InventoryRepository.Serial.qry,
        parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=&filter=&_itemId=${formik.values.itemId || 0}&_srlNo=${
          formik.values.srlNo || 0
        }`
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
      field: 'siteRef',
      headerName: labels.siteReference,
      flex: 1
    },
    {
      field: 'siteName',
      headerName: labels.siteName,
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
      Component: SerialsForm,
      props: {
        labels,
        recordId,
        maxAccess: access
      },
      width: 750,
      height: 420,
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

  const go = () => {
    if (!formik.values.itemId && !formik.values.srlNo) {
      stackError({
        message: platformLabels.FillAtLeastOneField
      })
    } else {
      refetch()
    }
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
            <Grid item sx={{ display: 'flex', mr: 2 }}>
              <Grid item xs={4} sx={{ ml: 2 }}>
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
              <Grid item xs={8} sx={{ ml: 2 }}>
                <ResourceLookup
                  endpointId={InventoryRepository.Item.snapshot}
                  filter={{ trackBy: 1 }}
                  name='itemId'
                  label={labels?.sku}
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
              <Grid item xs={1} sx={{ ml: 2 }}>
                <CustomButton
                  onClick={go}
                  label={platformLabels.Apply}
                  color='#231F20'
                  image='go.png'
                />
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
