import { useState, useContext, useEffect } from 'react'
import { useWindow } from 'src/windows'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
import * as yup from 'yup'

import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { PurchaseRepository } from 'src/repositories/PurchaseRepository'
import VendorForm from './VendorForm'
import { SaleRepository } from 'src/repositories/SaleRepository'
import { useForm } from 'src/hooks/form.js'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { Grid } from '@mui/material'
import SalesForm from './SalesForm'

const SalesList = ({ store, labels, maxAccess }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { recordId } = store
  const { platformLabels } = useContext(ControlContext)
  useState

  const { stack } = useWindow()

  const [initialValues, setInitialValues] = useState({
    currencyId: ''
  })

  const [check, setCheck] = useState(false)

  const { formik } = useForm({
    initialValues,
    validationSchema: yup.object({
      currencyId: yup.string().required(' ')
    }),
    enableReinitialize: true,
    validateOnChange: true
  })

  useEffect(() => {
    ;(async () => {
      const response = await getRequest({
        extension: InventoryRepository.Currency.qry,
        parameters: `&_itemId=${recordId}`
      })
      if (response.list && response.list.length > 0) {
        const firstCurrency = response.list[0]
        setInitialValues({
          currencyId: firstCurrency.currencyId
        })
        formik.setFieldValue('currencyId', firstCurrency.currencyId)
      }
    })()
  }, [recordId])

  console.log(formik.values.currencyId, 'currencyId')

  async function fetchGridData() {
    const response = await getRequest({
      extension: SaleRepository.Sales.qry,
      parameters: `&_itemId=${recordId}&_currencyId=${formik.values.currencyId}`
    })

    return response
  }

  console.log(formik, 'formik')

  const {
    query: { data },
    labels: _labels,

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
        const data = await fetchGridData(formik.values.currencyId)

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

  const delVendor = async obj => {
    await postRequest({
      extension: PurchaseRepository.PriceList.del,
      record: JSON.stringify(obj)
    })
    refetch()

    toast.success(platformLabels.Deleted)
  }

  const add = () => {
    if (!formik.values.currencyId) {
      setCheck(true)
    } else {
      openForm()
      setCheck(false)
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
        recordId: recordId ? recordId : null,
        record: record,
        maxAccess,

        store
      },

      title: labels.vendor
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={add} maxAccess={maxAccess} />
        <Grid container spacing={2} ml={40} mt={-13}>
          <Grid item xs={3}>
            <ResourceComboBox
              endpointId={InventoryRepository.Currency.qry}
              parameters={`_itemId=${recordId}`}
              name='currencyId'
              label={labels.currency}
              valueField='currencyId'
              displayField={['currencyName']}
              columnsInDropDown={[{ key: 'currencyName', value: 'Name' }]}
              values={formik.values}
              required
              maxAccess={maxAccess}
              onChange={(event, newValue) => {
                formik.setFieldValue('currencyId', newValue?.currencyId || '')
              }}
              onClear={() => formik.setFieldValue('currencyId', '')}
              error={!formik.values.currencyId && check}
            />
          </Grid>
        </Grid>
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['vendorId', 'currencyId']}
          isLoading={false}
          pageSize={50}
          onEdit={edit}
          pagination={false}
          onDelete={delVendor}
          maxAccess={maxAccess}
          height={200}
        />
      </Grow>
    </VertLayout>
  )
}

export default SalesList
