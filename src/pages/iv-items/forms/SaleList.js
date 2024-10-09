import { useContext, useEffect } from 'react'
import { useWindow } from 'src/windows'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { SaleRepository } from 'src/repositories/SaleRepository'
import { useForm } from 'src/hooks/form.js'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { Grid } from '@mui/material'
import SalesForm from './SalesForm'
import FormShell from 'src/components/Shared/FormShell'

const SalesList = ({ store, labels, maxAccess, formikInitial }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { recordId } = store

  const { platformLabels } = useContext(ControlContext)

  const { stack } = useWindow()

  const { formik } = useForm({
    initialValues: {
      currencyId: '',
      defSaleMUId: store.measurementId || '',
      pgId: store.priceGroupId || '',
      returnPolicyId: store.returnPolicy || ''
    },

    enableReinitialize: true,
    validateOnChange: true,
    onSubmit: async obj => {
      const submissionData = {
        ...formikInitial,
        defSaleMUId: formik.values.defSaleMUId,
        returnPolicyId: formik.values.returnPolicyId
      }

      await postRequest({
        extension: InventoryRepository.Items.set,
        record: JSON.stringify(submissionData)
      })
    }
  })

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const response = await getRequest({
          extension: InventoryRepository.Currency.qry,
          parameters: `&_itemId=${recordId}`
        })
        if (response.list && response.list.length > 0) {
          formik.setFieldValue('currencyId', response.list[0].currencyId)
        }
      }
    })()
  }, [])

  async function fetchGridData() {
    if (formik.values.currencyId) {
      return await getRequest({
        extension: SaleRepository.Sales.qry,
        parameters: `&_itemId=${recordId}&_currencyId=${formik.values.currencyId}`
      })
    }
  }

  const {
    query: { data },
    labels: _labels,
    invalidate,
    refetch
  } = useResourceQuery({
    enabled: !!recordId,
    datasetId: ResourceIds.SalesList,
    queryFn: fetchGridData,
    endpointId: SaleRepository.Sales.qry
  })

  useEffect(() => {
    if (formik.values.currencyId) {
      ;(async () => {
        await fetchGridData(formik.values.currencyId)

        refetch()
      })()
    }
  }, [formik.values.currencyId])

  const columns = [
    {
      field: 'plName',
      headerName: labels.priceLevel,
      flex: 1
    },
    {
      field: 'ptName',
      headerName: labels.priceType,
      flex: 1
    },
    {
      field: 'vtName',
      headerName: labels.valueType,
      flex: 1
    },
    {
      field: 'value',
      headerName: labels.price,
      flex: 1
    },
    {
      field: 'priceWithVat',
      headerName: labels.priceList,
      flex: 1
    },
    {
      field: 'minPrice',
      headerName: labels.minPrice,
      flex: 1
    }
  ]

  const add = () => {
    if (formik.values.currencyId) {
      openForm()
    }
  }

  const edit = obj => {
    openForm(obj)
  }

  function openForm(record) {
    stack({
      Component: SalesForm,
      props: {
        labels: labels,
        record: record,
        maxAccess,
        cId: formik.values.currencyId,

        store
      },

      title: labels.price
    })
  }

  const del = async obj => {
    await postRequest({
      extension: SaleRepository.Sales.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  return (
    <FormShell form={formik} resourceId={ResourceIds.Items} maxAccess={maxAccess} infoVisible={false} isCleared={false}>
      <VertLayout>
        <Fixed>
          <GridToolbar onAdd={add} maxAccess={maxAccess} />
          <Grid container spacing={2} sx={{ pl: 25, mt: -12 }}>
            <Grid item xs={4}>
              <ResourceComboBox
                endpointId={store._msId ? InventoryRepository.MeasurementUnit.qry : ''}
                parameters={`_msId=${store._msId}`}
                name='defSaleMUId'
                label={labels.measure}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                valueField='recordId'
                displayField={['reference', 'name']}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('defSaleMUId', newValue?.recordId || '')
                }}
              />
            </Grid>
            <Grid item xs={4}>
              <ResourceComboBox
                endpointId={SaleRepository.PriceGroups.qry}
                name='pgId'
                label={labels.priceGroups}
                valueField='recordId'
                displayField='name'
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('pgId', newValue?.recordId || '')
                }}
                onClear={() => formik.setFieldValue('pgId', '')}
              />
            </Grid>
            <Grid item xs={4.01}>
              <ResourceComboBox
                endpointId={InventoryRepository.Currency.qry}
                parameters={recordId ? `_itemId=${recordId}` : ''}
                name='currencyId'
                label={labels.currency}
                valueField='currencyId'
                displayField={['currencyName']}
                columnsInDropDown={[{ key: 'currencyName', value: 'Name' }]}
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('currencyId', newValue?.currencyId || '')
                }}
                onClear={() => formik.setFieldValue('currencyId', '')}
                error={!formik.values.currencyId}
              />
            </Grid>

            <Grid item xs={4}>
              <ResourceComboBox
                endpointId={SaleRepository.ReturnPolicy.qry}
                name='returnPolicyId'
                label={labels.returnPolicy}
                valueField='recordId'
                displayField='name'
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('returnPolicyId', newValue?.recordId || '')
                }}
                onClear={() => formik.setFieldValue('returnPolicyId', '')}
              />
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <Table
            columns={columns}
            gridData={data}
            rowId={['plId', 'currencyId']}
            isLoading={false}
            pageSize={50}
            onEdit={edit}
            onDelete={del}
            pagination={false}
            maxAccess={maxAccess}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default SalesList
