import { Box } from '@mui/material'
import { useContext, useState } from 'react'
import { useResourceQuery } from 'src/hooks/resource'
import { RequestsContext } from 'src/providers/RequestsContext'
import Table from 'src/components/Shared/Table'
import ErrorWindow from 'src/components/Shared/ErrorWindow'

import { ResourceIds } from 'src/resources/ResourceIds'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { useWindow } from 'src/windows'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { AuthContext } from 'src/providers/AuthContext'
import { DataSets } from 'src/resources/DataSets'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { useFormik } from 'formik'
import * as yup from 'yup'

const SmsRequestLog = () => {
  const { getRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const [errorMessage, setErrorMessage] = useState(null)
  const { user } = useContext(AuthContext)
  const languageId = user.languageId
  const datasetId = DataSets.MODULE

  const [initialValues, setInitialData] = useState({
    moduleId: '10',
    resourceId: ''
  })

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      moduleId: yup.string().required('This field is required'),
      resourceId: yup.string().required('This field is required')
    })
  })

  async function fetchWithFilter({ filters }) {
    const resourceId = filters?.resourceId || '0'

    return await getRequest({
      extension: SystemRepository.SMSRequest.qry,
      parameters: `_filter=&_resourceId=${resourceId}`
    })
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
    <>
      <Box>
        <div style={{ display: 'flex' }}>
          <GridToolbar
            maxAccess={access}
            onSearch={value => {
              filterBy('qry', value)
            }}
            onSearchClear={() => {
              clearFilter('qry')
            }}
            labels={labels}
          >
            <Box sx={{ display: 'flex', width: '700px', justifyContent: 'flex-start', pt: 2, pl: 2, pb: 2 }}>
              <ResourceComboBox
                endpointId={SystemRepository.KeyValueStore}
                parameters={`_dataset=${datasetId}&_language=${languageId}`}
                labels={labels[2]}
                name='moduleId'
                values={formik.values}
                valueField='key'
                displayField='value'
                required
                onChange={(event, newValue) => {
                  if (newValue) formik.setFieldValue('moduleId', newValue?.key)
                }}
                sx={{ pr: 2 }}
              />
              <ResourceComboBox
                endpointId={SystemRepository.ModuleResources.qry}
                parameters={`_moduleId=${formik.values.moduleId}&_filter=`}
                labels={labels[2]}
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
        </div>
        <Table
          columns={[
            {
              field: 'masterRef',
              headerName: labels[4],
              flex: 1
            },
            {
              field: 'smsRequestDate',
              headerName: labels[5],
              flex: 1
            },
            {
              field: 'reference',
              headerName: labels[6],
              flex: 1
            },
            {
              field: 'mobileNo',
              headerName: labels[7],
              flex: 1
            },
            {
              field: 'smsBody',
              headerName: labels[8],
              flex: 2
            },
            {
              field: 'smsStatusName',
              headerName: labels[9],
              flex: 1
            }
          ]}
          gridData={data ?? { list: [] }}
          rowId={['recordId']}
          isLoading={false}
          pageSize={50}
          maxAccess={access}
          refetch={refetch}
          paginationParameters={paginationParameters}
          paginationType='client'
        />
      </Box>

      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default SmsRequestLog
