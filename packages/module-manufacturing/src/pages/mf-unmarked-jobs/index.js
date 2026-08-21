import { useContext, useState, useRef, useEffect } from 'react'
import { Grid } from '@mui/material'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { ManufacturingRepository } from '@argus/repositories/src/repositories/ManufacturingRepository'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'

export default function UnmarkedJobs() {
  const { getRequest } = useContext(RequestsContext)
  const [unmarkedJobIds, setUnmarkedJobIds] = useState([])
  const [checkedIds, setCheckedIds] = useState([])
  const workCenterIdRef = useRef(null)

  async function fetchGridData() {
    const wcId = workCenterIdRef.current

    if (!wcId) return { list: [] }

    return await getRequest({
      extension: ManufacturingRepository.MFJobOrder.qry4,
      parameters: `_workCenterId=${wcId}`
    })

  }

  const {
    query: { data },
    labels,
    refetch,
    access: maxAccess
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: ManufacturingRepository.MFJobOrder.qry4,
    datasetId: ResourceIds.UnmarkedJobs
  })

  async function checkUnmarkedJobs(ids) {
    if (!ids.length) {
      setUnmarkedJobIds([])
      return
    }

    const res = await getRequest({
      extension: ManufacturingRepository.MFJobOrder.qryUnmarked,
      parameters: `_jobIds=${ids.join(',')}`
    })

    setUnmarkedJobIds(res?.record?.jobIds || [])
  }

  function onRowCheck(rowOrRows, checked) {
    const rowIds = (Array.isArray(rowOrRows) ? rowOrRows : [rowOrRows]).map(r => r.recordId)

    setCheckedIds(prev => {
      const updated = checked
        ? Array.from(new Set([...prev, ...rowIds]))
        : prev.filter(id => !rowIds.includes(id))

      checkUnmarkedJobs(updated)

      return updated
    })
  }

  const { formik } = useForm({
    maxAccess,
    initialValues: { workCenterId: null }
  })

  const columns = [
    { 
      field: 'reference', 
      headerName: labels?.reference, 
      flex: 1 
    },
    { 
      field: 'date', 
      headerName: labels?.date, 
      flex: 1, 
      type: 'date' 
    },
    { 
      field: 'designRef',
      headerName: labels?.design, 
      flex: 1 
    },
    { 
      field: 'sku', 
      headerName: labels?.sku, 
      flex: 1 
    },
    { 
      field: 'itemName', 
      headerName: labels?.item, 
      flex: 1 
    },
    { 
      field: 'className', 
      headerName: labels?.productionClass, 
      flex: 1 
    },
    { 
      field: 'standardRef', 
      headerName: labels?.productionStandard, 
      flex: 1 
    },
    { 
      field: 'pcs', 
      headerName: labels?.pcs, 
      flex: 1, 
      type: 'number' 
    },
    { 
      field: 'qty', 
      headerName: labels?.qty, 
      flex: 1, 
      type: 'number' 
    },
    { 
      field: 'startingDT', 
      headerName: labels?.startingDate, 
      flex: 1, 
      type: 'date' 
    }
  ]

  const rows = (data?.list || []).map((job, index) => ({
    ...job,
    id: index + 1,
    checked: checkedIds.includes(job.recordId)
  }))

  return (
    <VertLayout>
      <Fixed>
        <Grid container spacing={2} padding={2}>
          <Grid item xs={4}>
            <ResourceLookup
              endpointId={ManufacturingRepository.WorkCenter.snapshot}
              name='workCenterId'
              label={labels?.workCenter}
              valueField='reference'
              displayField='name'
              valueShow='wcRef'
              secondValueShow='wcName'
              displayFieldWidth={2}
              form={formik}
              maxAccess={maxAccess}
              onChange={(_, newValue) => {
                const wcId = newValue?.recordId || null

                formik.setFieldValue('workCenterId', wcId)
                formik.setFieldValue('wcRef', newValue?.reference || '')
                formik.setFieldValue('wcName', newValue?.name || '')

                workCenterIdRef.current = wcId
                setCheckedIds([])
                setUnmarkedJobIds([])
                refetch()
              }}
              error={formik.touched.workCenterId && Boolean(formik.errors.workCenterId)}
            />
          </Grid>
        </Grid>
      </Fixed>
      <Grow>
        <Table
          name='table'
          columns={columns}
          gridData={{ list: rows }}
          rowId={['recordId']}
          maxAccess={maxAccess}
          pagination={false}
          showCheckboxColumn={true}
          handleCheckboxChange={onRowCheck}
          highlightRow={{
            condition: row => unmarkedJobIds.includes(row.recordId) && !row.checked,
            color: () => '#f28b82'
          }}
        />
      </Grow>
    </VertLayout>
  )
}