import { Box, Grid } from '@mui/material'
import { useContext, useState } from 'react'
import { useResourceQuery } from 'src/hooks/resource'
import { RequestsContext } from 'src/providers/RequestsContext'
import Table from 'src/components/Shared/Table'

import { ResourceIds } from 'src/resources/ResourceIds'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { AuthContext } from 'src/providers/AuthContext'
import { DataSets } from 'src/resources/DataSets'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'

const SmsRequestLog = () => {
  const { getRequest } = useContext(RequestsContext)
  const { user } = useContext(AuthContext)
  const languageId = user.languageId
  const datasetId = DataSets.MODULE

  const [values, setValues] = useState({
    moduleId: '10',
    resourceId: ''
  })

  async function fetchWithFilter({ filters }) {
    const resourceId = filters?.resourceId
    if (!filters || !filters?.resourceId) {
      return { list: [] }
    } else {
      return await getRequest({
        extension: SystemRepository.SMSRequest.qry,
        parameters: `_filter=&_resourceId=${resourceId}`
      })
    }
  }

  const {
    query: { data },
    refetch,
    labels: labels,
    filterBy,
    access,
    filters
  } = useResourceQuery({
    datasetId: ResourceIds.SmsRequestLog,
    filter: {
      endpointId: SystemRepository.SMSRequest.qry,
      filterFn: fetchWithFilter
    }
  })

  const onChange = value => {
    if (value) filterBy('resourceId', value)
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar
          maxAccess={access}
          onSearch={value => {
            filterBy('qry', value)
          }}
          labels={labels}
          leftSection={
            <Grid container sx={{ width: '700px', m: 1 }} spacing={2}>
              <Grid item xs={5}>
                <ResourceComboBox
                  endpointId={SystemRepository.KeyValueStore}
                  parameters={`_dataset=${datasetId}&_language=${languageId}`}
                  label={labels.Module}
                  name='moduleId'
                  values={values}
                  valueField='key'
                  displayField='value'
                  required
                  onChange={(event, newValue) => {
                    setValues({ moduleId: newValue?.key || '10', resourceId: '' })
                  }}
                  sx={{ pr: 2 }}
                />
              </Grid>
              <Grid item xs={6}>
                <ResourceComboBox
                  endpointId={SystemRepository.ModuleClassRES.qry}
                  parameters={`_moduleId=${values.moduleId}&_filter=`}
                  label={labels.ResourceId}
                  name='resourceId'
                  values={values}
                  required
                  valueField='key'
                  displayField='value'
                  onChange={(event, newValue) => {
                    onChange(newValue?.key || '')
                    setValues({ ...values, resourceId: newValue?.key || '' })
                  }}
                />
              </Grid>
            </Grid>
          }
        />
      </Fixed>
      <Grow>
        <Table
          columns={[
            {
              field: 'masterRef',
              headerName: labels.MasterRef
            },

            {
              field: 'smsRequestDate',
              headerName: labels.SmsRequestDate,
              type: 'date'
            },
            {
              field: 'reference',
              headerName: labels.Reference
            },
            {
              field: 'mobileNo',
              headerName: labels.MobileNo
            },
            {
              field: 'smsBody',
              headerName: labels.SmsBody,
              wrapText: true,
              autoHeight: true,
              flex: 1
            },
            {
              field: 'smsStatusName',
              headerName: labels.SmsStatus
            }
          ]}
          gridData={data && filters?.resourceId ? data : { list: [] }}
          rowId={['recordId']}
          isLoading={false}
          pageSize={50}
          maxAccess={access}
          refetch={refetch}
          paginationType='client'
        />
      </Grow>
    </VertLayout>
  )
}

export default SmsRequestLog
