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
import { useForm } from 'src/hooks/form'
import * as yup from 'yup'

const SmsRequestLog = () => {
  const { getRequest } = useContext(RequestsContext)
  const { user } = useContext(AuthContext)
  const languageId = user.languageId
  const datasetId = DataSets.MODULE

  const { formik } = useForm({
    initialValues: {
      moduleId: '10',
      resourceId: ''
    },
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      moduleId: yup.string().required(' '),
      resourceId: yup.string().required(' ')
    })
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
    paginationParameters,
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
        >
          <Grid container style={{ width: '700px' }} padding={1}>
            <Grid xs={5}>
              <ResourceComboBox
                endpointId={SystemRepository.KeyValueStore}
                parameters={`_dataset=${datasetId}&_language=${languageId}`}
                label={labels.Module}
                name='moduleId'
                values={formik.values}
                valueField='key'
                displayField='value'
                required
                onChange={(event, newValue) => {
                  if (newValue) formik.setFieldValue('moduleId', newValue?.key)
                  formik.setFieldValue('resourceId', '')
                  filters.resourceId = ''
                  fetchWithFilter(filters)
                }}
                sx={{ pr: 2 }}
              />
            </Grid>
            <Grid xs={6}>
              {' '}
              <ResourceComboBox
                endpointId={SystemRepository.ModuleClassRES.qry}
                parameters={`_moduleId=${formik.values.moduleId}&_filter=`}
                label={labels.ResourceId}
                name='resourceId'
                values={formik.values}
                required
                valueField='key'
                displayField='value'
                onChange={(event, newValue) => {
                  if (newValue) {
                    onChange(newValue?.key)
                    formik.setFieldValue('resourceId', newValue?.key)
                  }
                }}
              />
            </Grid>
          </Grid>
        </GridToolbar>
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
