import { useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { useWindow } from 'src/windows'
import { useResourceQuery } from 'src/hooks/resource'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { GeneralLedgerRepository } from 'src/repositories/GeneralLedgerRepository'
import { useForm } from 'src/hooks/form'
import { Grid } from '@mui/material'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SystemRepository } from 'src/repositories/SystemRepository'
import SegmentForm from './form/SegmentForm'

const Segments = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const [data, setData] = useState([])

  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    if (formik.values.segmentId) {
      const { _startAt = 0, _pageSize = 50 } = options

      const response = await getRequest({
        extension: GeneralLedgerRepository.Segments.qry,
        parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_segmentId=${formik.values.segmentId}`
      })

      setData(response)
    } else {
      setData([])
    }
  }

  const {
    labels: _labels,
    paginationParameters,
    invalidate,
    refetch,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: GeneralLedgerRepository.Segments.qry,
    datasetId: ResourceIds.Segments
  })

  const { formik } = useForm({
    initialValues: {
      segmentName: null
    },
    maxAccess: access,
    enableReinitialize: true,
    validateOnChange: true
  })

  useEffect(() => {
    fetchGridData()
  }, [formik.values.segmentId])

  const columns = [
    {
      field: 'name',
      headerName: _labels.segment,
      flex: 1
    },
    {
      field: 'reference',
      headerName: _labels.reference,
      flex: 1
    }
  ]

  const del = async obj => {
    try {
      await postRequest({
        extension: GeneralLedgerRepository.Segments.del,
        record: JSON.stringify(obj)
      })
      invalidate()
      toast.success(platformLabels.Deleted)
    } catch (error) {}
  }

  const edit = obj => {
    openForm(obj)
  }

  const add = () => {
    openForm()
  }

  function openForm(obj) {
    stack({
      Component: SegmentForm,
      props: {
        labels: _labels,
        obj,
        maxAccess: access
      },
      width: 500,
      height: 460,
      title: _labels.cities
    })
  }

  useEffect(() => {
    ;(async function () {
      const res = await getRequest({
        extension: SystemRepository.Defaults.qry,
        parameters: '_filter=GLACSeg'
      })

      console.log(res, 'segggggggggg')
    })()
  }, [formik.values])

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar
          onAdd={add}
          maxAccess={access}
          labels={_labels}
          middleSection={
            <Grid item sx={{ display: 'flex', mr: 2 }}>
              <ResourceComboBox
                endpointId={SystemRepository.Defaults.qry}
                parameters={`_filter=GLACSeg`}
                sx={{ width: 450 }}
                name='segmentName'
                label={_labels.segment}
                valueField='key'
                displayField='value'
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('segmentName', newValue ? newValue.key : 0)
                  formik.setFieldValue('segmentId', newValue ? newValue.value : 0)
                }}
                maxAccess={access}
                filter={item => item.value !== ''}
              />
            </Grid>
          }
        />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['segmentId']}
          refetch={refetch}
          onEdit={edit}
          onDelete={del}
          maxAccess={access}
          pageSize={50}
          paginationParameters={paginationParameters}
          paginationType='api'
        />
      </Grow>
    </VertLayout>
  )
}

export default Segments
