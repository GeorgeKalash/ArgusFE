import { Box } from '@mui/material'
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
          <Box sx={{ display: 'flex', width: '700px', justifyContent: 'flex-start', pt: 2, pl: 2, pb: 2 }}>
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
          </Box>
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
              autoHeight: true
            },
            {
              field: 'smsStatusName',
              headerName: labels.SmsStatus
            }
          ]}
          gridData={data && filters?.resourceId ? data : { list: [] }}
          rowId={['recordId']}
          isLoading={false}
          pageSize={data?.list?.length}
          maxAccess={access}
          refetch={refetch}
          paginationParameters={paginationParameters}
          paginationType='client'
        />
      </Grow>
    </VertLayout>
  )
}

export default SmsRequestLog
