import { useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { GeneralLedgerRepository } from '@argus/repositories/src/repositories/GeneralLedgerRepository'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { Grid } from '@mui/material'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import SegmentForm from './form/SegmentForm'
import CustomComboBox from '@argus/shared-ui/src/components/Inputs/CustomComboBox'
import { useError } from '@argus/shared-providers/src/providers/error'

const Segments = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const [data, setData] = useState([])
  const [store, setStore] = useState([])
  const { stack: stackError } = useError()

  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    if (formik.values.segmentId !== null && formik.values.segmentId !== undefined) {
      const { _startAt = 0, _pageSize = 50 } = options

      const response = await getRequest({
        extension: GeneralLedgerRepository.Segments.qry,
        parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_segmentId=${formik.values.segmentId}`
      })

      setData(response)
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
    validateOnChange: true
  })

  useEffect(() => {
    fetchGridData()
  }, [formik.values.segmentId])

  const columns = [
    {
      field: 'reference',
      headerName: _labels.reference,
      flex: 1
    },
    {
      field: 'name',
      headerName: _labels.segment,
      flex: 1
    }
  ]

  const del = async obj => {
    await postRequest({
      extension: GeneralLedgerRepository.Segments.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  const edit = obj => {
    openForm(obj)
  }

  const add = () => {
    openForm()
  }

  function openForm(obj) {
    if (formik.values.segmentId === null || formik.values.segmentId === undefined) {
      stackError({ message: _labels.chooseSegmentError })
    } else {
      stack({
        Component: SegmentForm,
        props: {
          labels: _labels,
          obj,
          maxAccess: access,
          formikSegmentId: formik.values.segmentId,
          fetchGridData
        },
        width: 500,
        height: 260,
        title: _labels.segment
      })
    }
  }

  useEffect(() => {
    ;(async function () {
      const res = await getRequest({
        extension: SystemRepository.Defaults.qry,
        parameters: '_filter=GLACSeg'
      })

      if (res && res.list) {
        const filteredList = res.list
          .filter(item => item.key.startsWith('GLACSegName') && item.value !== null)
          .map(item => {
            const segKey = item.key.replace('Name', '')
            const matchingSeg = res.list.find(seg => seg.key === segKey && seg.value !== null)
            if (matchingSeg) {
              return {
                key: item.value,
                value: item.key.split('GLACSegName')[1]
              }
            }

            return null
          })
          .filter(Boolean)

        setStore(filteredList)

        if (filteredList.length > 0) {
          formik.setFieldValue('segmentName', filteredList[0].key)
          formik.setFieldValue('segmentId', filteredList[0].value)
        }
      }
    })()
  }, [])

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar
          onAdd={add}
          maxAccess={access}
          labels={_labels}
          middleSection={
            <Grid item sx={{ display: 'flex', mr: 2 }}>
              <CustomComboBox
                endpointId={SystemRepository.Defaults.qry}
                parameters={`_filter=GLACSeg`}
                sx={{ width: 450 }}
                name='segmentName'
                label={_labels.segment}
                valueField='key'
                displayField='key'
                store={store}
                value={formik.values.segmentName}
                required
                onChange={(event, newValue) => {
                  formik.setFieldValue('segmentName', newValue?.key)
                  formik.setFieldValue('segmentId', newValue?.value)
                }}
                error={!formik.values.segmentName}
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
