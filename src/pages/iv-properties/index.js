import { useState, useEffect, useContext } from 'react'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'
import Table from 'src/components/Shared/Table'
import { useResourceQuery } from 'src/hooks/resource'
import { Grid } from '@mui/material'
import * as yup from 'yup'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useForm } from 'src/hooks/form'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import FormShell from 'src/components/Shared/FormShell'
import { ControlContext } from 'src/providers/ControlContext'
import toast from 'react-hot-toast'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { useWindow } from 'src/windows'
import PropertiesForm from './forms/PropertiesForm'

const Postoutwards = () => {
  const [data, setData] = useState([])
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const [dimNum, setDimNum] = useState(0)
  const { stack } = useWindow()

  const fetchData = async () => {
    const dimensionNumber = formik.values?.dimValue?.match(/\d+$/)?.[0]
    setDimNum(dimensionNumber)
    if (!dimensionNumber) return

    try {
      const response = await getRequest({
        extension: InventoryRepository.Dimension.qry,
        parameters: `_dimension=${dimensionNumber}`
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
    endpointId: InventoryRepository.Dimension.qry,
    datasetId: ResourceIds.IVDimension
  })

  const { formik } = useForm({
    initialValues: {
      dimValue: ''
    },
    access,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      dimValue: yup.string().required()
    })
  })

  const rowColumns = [
    {
      field: 'id',
      headerName: _labels.id,
      flex: 1
    },
    {
      field: 'name',
      headerName: _labels.name,
      flex: 1
    }
  ]

  function openForm(id) {
    stack({
      Component: PropertiesForm,
      props: {
        labels: _labels,
        id: id,
        maxAccess: access,
        dimNum
      },
      width: 500,
      height: 270,
      title: _labels.properties
    })
  }

  const add = () => {
    openForm()
  }

  const edit = obj => {
    openForm(obj?.id)
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
  }, [formik.values.dimValue])

  useEffect(() => {
    ;(async function () {
      try {
        const res = await getRequest({
          extension: SystemRepository.Defaults.qry,
          parameters: `_filter=ivtDimension`
        })
        console.log(res, 'ress')

        const firstValidKey = res.list.find(item => item.value !== '')?.key
        if (firstValidKey) {
          formik.setFieldValue('dimValue', firstValidKey)
        }
      } catch (exception) {}
    })()
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.PostOutwards}
      form={formik}
      maxAccess={access}
      isCleared={false}
      isSavedClear={false}
      infoVisible={false}
    >
      <VertLayout>
        <Fixed>
          <Grid item xs={10}>
            <ResourceComboBox
              endpointId={SystemRepository.Defaults.qry}
              parameters={`_filter=ivtDimension`}
              name='dimValue'
              label={_labels.dimValue}
              valueField='key'
              displayField='value'
              values={formik.values}
              onChange={(event, newValue) => {
                formik.setFieldValue('dimValue', newValue ? newValue.key : '')
              }}
              maxAccess={access}
              filter={item => item.value !== ''}
            />
          </Grid>
        </Fixed>
        <Grow>
          <Table
            columns={rowColumns}
            gridData={data}
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
    </FormShell>
  )
}

export default Postoutwards
