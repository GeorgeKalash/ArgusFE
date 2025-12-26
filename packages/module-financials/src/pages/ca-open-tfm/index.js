import { useState, useEffect, useContext } from 'react'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { Grid, Box, IconButton } from '@mui/material'
import * as yup from 'yup'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import toast from 'react-hot-toast'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { CashBankRepository } from '@argus/repositories/src/repositories/CashBankRepository'
import OpenMultiForm from './forms/OpenMultiForm'
import { getStorageData } from '@argus/shared-domain/src/storage/storage'
import Icon from '@argus/shared-core/src/@core/components/icon'
import CashTransferTab from '@argus/shared-ui/src/components/Shared/Forms/CashTransferTab'

const OpenMultiCurrencyCashTransfer = () => {
  const [data, setData] = useState([])
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()
  const userData = getStorageData('userData')

  const _userId = userData.userId

  const fetchData = async () => {
    if (!formik.values.plantId) {
      setData([])

      return
    }

    const response = await getRequest({
      extension: CashBankRepository.OpenMultiCurrencyCashTransfer.open,
      parameters: `_plantId=${formik.values.plantId}`
    })

    setData(response || [])
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
    validateOnChange: true,
    validationSchema: yup.object({
      plantId: yup.string().required()
    })
  })

  useEffect(() => {
    ;(async function () {
      const res = await getRequest({
        extension: SystemRepository.UserDefaults.get,
        parameters: `_userId=${_userId}&_key=plantId`
      })

      formik.setFieldValue('plantId', parseInt(res.record.value) || '')
    })()
  }, [])

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
    },
    {
      field: '',
      cellRenderer: row => (
        <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
          <IconButton
            size='small'
            onClick={() => {
              stack({
                Component: CashTransferTab,
                props: {
                  recordId: row?.data?.recordId,
                  refetch: () => {
                    refetch()
                  }
                }
              })
            }}
          >
            <Icon icon='mdi:application-edit-outline' fontSize={18} />
          </IconButton>
        </Box>
      )
    }
  ]

  function openForm(recordId, plantId) {
    stack({
      Component: OpenMultiForm,
      props: {
        labels: _labels,
        recordId: recordId,
        maxAccess: access,
        plId: plantId
      },
      width: 500,
      height: 270,
      title: _labels.openmulti
    })
  }

  const edit = obj => {
    openForm(obj?.recordId, formik.values.plantId)
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
        <Grid container spacing={2} sx={{ pl: 5, mb: 2 }}>
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
