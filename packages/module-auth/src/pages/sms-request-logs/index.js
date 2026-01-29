import { Grid } from '@mui/material'
import { useContext, useState } from 'react'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { AuthContext } from '@argus/shared-providers/src/providers/AuthContext'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'

const SmsRequestLog = () => {
  const { getRequest } = useContext(RequestsContext)
  const { user } = useContext(AuthContext)
  const languageId = user.languageId
  const datasetId = DataSets.MODULE

  const [values, setValues] = useState({
    moduleId: '10',
    resourceId: ''
  })

  async function fetchWithFilter({ filters, pagination }) {
    if (!filters || !filters?.resourceId) {
      return { list: [] }
    } else {
      const response = await getRequest({
        extension: SystemRepository.SMSRequest.page,
        parameters: `_resourceId=${filters?.resourceId}&_startAt=${pagination?._startAt || 0}&_pageSize=50`
      })

      return { ...response, _startAt: pagination?._startAt || 0 }
    }
  }

  const {
    query: { data },
    refetch,
    labels: labels,
    filterBy,
    access,
    filters,
    paginationParameters
  } = useResourceQuery({
    datasetId: ResourceIds.SmsRequestLog,
    filter: {
      endpointId: SystemRepository.SMSRequest.page,
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
            <Grid item xs={7}>
              <Grid container spacing={2}>
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
                <Grid item xs={7}>
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
          pageSize={50}
          maxAccess={access}
          refetch={refetch}
          paginationParameters={paginationParameters}
          paginationType='api'
        />
      </Grow>
    </VertLayout>
  )
}

export default SmsRequestLog
