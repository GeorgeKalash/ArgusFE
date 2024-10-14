import { useState, useEffect, useContext } from 'react'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import GridToolbar from 'src/components/Shared/GridToolbar'
import Table from 'src/components/Shared/Table'
import { useResourceQuery } from 'src/hooks/resource'
import { Grid } from '@mui/material'
import * as yup from 'yup'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useForm } from 'src/hooks/form'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import toast from 'react-hot-toast'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { useWindow } from 'src/windows'
import { CashBankRepository } from 'src/repositories/CashBankRepository'
import OpenMultiForm from './forms/OpenMultiForm'

const OpenMultiCurrencyCashTransfer = () => {
  const [data, setData] = useState([])
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  const fetchData = async () => {
    if (!formik.values.plantId) {
      setData([])

      return
    }

    try {
      const response = await getRequest({
        extension: CashBankRepository.OpenMultiCurrencyCashTransfer.open,
        parameters: `_plantId=${formik.values.plantId}`
      })

      setData(response || [])
    } catch (error) {}
  }

  const {
    labels: _labels,
    access,
    invalidate,
    refetch
  } = useResourceQuery({
    queryFn: fetchData,
    endpointId: CashBankRepository.OpenMultiCurrencyCashTransfer.open,
    datasetId: ResourceIds.OpenMultiCurrencyCashTransfer
  })

  const { formik } = useForm({
    initialValues: {
      plantId: ''
    },
    access,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      plantId: yup.string().required()
    })
  })

  const rowColumns = [
    {
      field: 'reference',
      headerName: _labels.reference,
      flex: 1
    },
    {
      field: 'date',
      headerName: _labels.date,
      flex: 1,
      type: 'date'
    },
    {
      field: 'fromPlantName',
      headerName: _labels.fromPlant,
      flex: 1
    },
    {
      field: 'toPlantName',
      headerName: _labels.toPlant,
      flex: 1
    },
    {
      field: 'fromCAName',
      headerName: _labels.fromCashAcc,
      flex: 1
    },
    {
      field: 'toCAName',
      headerName: _labels.toCashAcc,
      flex: 1
    },

    {
      field: 'rsName',
      headerName: _labels.releaseStatus,
      flex: 1
    },
    {
      field: 'statusName',
      headerName: _labels.status,
      flex: 1
    },
    {
      field: 'wipName',
      headerName: _labels.wip,
      flex: 1
    }
  ]

  function openForm(recordId) {
    stack({
      Component: OpenMultiForm,
      props: {
        labels: _labels,
        recordId: recordId,
        maxAccess: access
      },
      width: 500,
      height: 270,
      title: _labels.openmulti
    })
  }

  const edit = obj => {
    openForm(obj?.recordId)
  }

  const del = async obj => {
    try {
      await postRequest({
        extension: InventoryRepository.Dimension.del,
        record: JSON.stringify(obj)
      })
      invalidate()
      toast.success(platformLabels.Deleted)
    } catch (error) {}
  }

  useEffect(() => {
    fetchData()
  }, [formik.values.plantId])

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar maxAccess={access} />
        <Grid container spacing={3} sx={{ pl: 15, mb: 2 }}>
          <Grid item xs={4}>
            <ResourceComboBox
              endpointId={SystemRepository.Plant.qry}
              name='plantId'
              label={_labels.plant}
              valueField='recordId'
              displayField='name'
              columnsInDropDown={[
                { key: 'reference', value: 'Reference' },
                { key: 'name', value: 'Name' }
              ]}
              values={formik.values}
              maxAccess={access}
              onClear={() => formik.setFieldValue('plantId', '')}
              onChange={(event, newValue) => {
                formik && formik.setFieldValue('plantId', newValue?.recordId)
              }}
              error={!formik.values.plantId}
            />
          </Grid>
        </Grid>
      </Fixed>
      <Grow>
        <Table
          columns={rowColumns}
          gridData={data || []}
          rowId={['id']}
          pageSize={50}
          onEdit={edit}
          paginationType='client'
          refetch={refetch}
          isLoading={false}
          onDelete={del}
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default OpenMultiCurrencyCashTransfer
