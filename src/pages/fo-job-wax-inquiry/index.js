import { useContext, useState } from 'react'
import Table from 'src/components/Shared/Table'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { FoundryRepository } from 'src/repositories/FoundryRepository'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { Grid } from '@mui/material'

const JobWaxInquiry = () => {
  const { getRequest } = useContext(RequestsContext)

  const [values, setValues] = useState({})

  const {
    query: { data },
    labels,
    filterBy,
    access
  } = useResourceQuery({
    endpointId: FoundryRepository.JobWaxInquiry.qry2,
    datasetId: ResourceIds.JobWaxInquiry,
    filter: {
      endpointId: FoundryRepository.JobWaxInquiry.qry2,
      filterFn: fetchWithFilter
    }
  })

  async function fetchWithFilter({ filters }) {
    console.log('filters?.qry', filters?.qry)
    if (filters?.qry)
      return await getRequest({
        extension: FoundryRepository.JobWaxInquiry.qry2,
        parameters: `_jobId=${filters?.qry}`
      })
    else return { list: [] }
  }

  const columns = [
    {
      field: 'waxRef',
      headerName: labels.waxRef,
      flex: 1
    },
    {
      field: 'sku',
      headerName: labels.sku,
      flex: 1
    },
    {
      field: 'itemName',
      headerName: labels.item,
      flex: 1
    },
    {
      field: 'designRef',
      headerName: labels.designRef,
      flex: 1
    },
    {
      field: 'classRef',
      headerName: labels.classRef,
      flex: 1
    },
    {
      field: 'standardRef',
      headerName: labels.standardRef,
      flex: 1
    },
    {
      field: 'rmWgt',
      headerName: labels.rmWeight,
      flex: 1,
      type: 'number'
    },
    {
      field: 'pieces',
      headerName: labels.pieces,
      flex: 1,
      type: 'number'
    }
  ]

  return (
    <VertLayout>
      <Fixed>
        <Grid container xs={12} padding={2}>
          <Grid item xs={4}>
            <ResourceLookup
              endpointId={ManufacturingRepository.MFJobOrder.snapshot}
              name='jobId'
              label={labels.jobOrder}
              valueField='reference'
              displayField='name'
              displayFieldWidth={1}
              secondDisplayField={false}
              form={{ values: values }}
              maxAccess={access}
              onChange={(event, newValue) => {
                if (newValue) filterBy('qry', newValue?.recordId)
                else filterBy('qry', 0)
                setValues({ jobRef: newValue?.reference, jobId: newValue?.recordId })
              }}
            />
          </Grid>
        </Grid>
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['waxId']}
          isLoading={false}
          pagination={false}
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default JobWaxInquiry
