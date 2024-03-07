// ** React Imports
import { useEffect, useState, useContext } from 'react'

// ** React ImportsCustomLookup
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import WindowToolbar from 'src/components/Shared/WindowToolbar'

// ** MUI Imports
import { Box, Grid } from '@mui/material'

// ** Third Party Imports
import { useFormik } from 'formik'
import * as yup from 'yup'
import toast from 'react-hot-toast'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ControlContext } from 'src/providers/ControlContext'
import { useWindowDimensions } from 'src/lib/useWindowDimensions'

// ** Helpers
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'
import { DataGrid } from 'src/components/Shared/DataGrid'

const SystemFunction = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { height } = useWindowDimensions()

  //states
  const [errorMessage, setErrorMessage] = useState(null)


  async function getGridData() {
    return await getRequest({
      extension: SystemRepository.SystemFunction.qry,
      parameters: `_filter=`
    })
  }

  const {
    query: { data },
    labels: labels,
    access
  } = useResourceQuery({
    queryFn: getGridData,
    endpointId: SystemRepository.SystemFunction.qry,
    datasetId: ResourceIds.SystemFunction
  })


  const columns = [
    {
      component: 'numberfield',
      header: labels.functionId,
      name: 'functionId',
      mandatory: false,
      hidden: false,
      readOnly: true
    },
    {
      component: 'textfield',
      header: labels.name,
      name: 'sfName',
      mandatory: false,
      hidden: false,
      readOnly: true
    },
    {
      component: 'resourcelookup',
      header: labels.numberRange,
      nameId: 'nraId',
      name: 'nraRef',
      endpointId: SystemRepository.NumberRange.snapshot,
      mandatory: false,
      valueField: 'recordId',
      displayField: 'reference',
      widthDropDown: 200,
      fieldsToUpdate: [{ from: 'reference', to: 'nraRef' }],
      columnsInDropDown: [
        { key: 'reference', value: 'Reference' },
        { key: 'description', value: 'Description' }
      ]
    },
    {
      component: 'resourcelookup',
      header: labels.batchNR,
      nameId: 'batchNRAId',
      name: 'batchNRARef',
      endpointId: SystemRepository.NumberRange.snapshot,
      mandatory: false,
      valueField: 'recordId',
      displayField: 'reference',
      widthDropDown: 200,
      fieldsToUpdate: [{ from: 'reference', to: 'nraRef' }],
      columnsInDropDown: [
        { key: 'reference', value: 'Reference' },
        { key: 'description', value: 'Description' }
      ]
    }
  ]

  const formik = useFormik({
    enableReinitialize: false,
    validateOnChange: true,
    validate: values => {},
    initialValues: {
      rows: [
        {
          id:1,
          functionId: '',
          sfName: '',
          nraId: '',
          batchNRAId:'',
          nraRef: '',
          batchNRARef:''
        }
      ]
    },
    onSubmit: async obj => {
      const resultObject = {
        systemFunctionMappings: formik.values.rows
      }

      console.log('rows ', resultObject)

      postRequest({
        extension: SystemRepository.SystemFunction.set2,
        record: JSON.stringify(resultObject)
      })
        .then(res => {
          toast.success('Record Updated Successfully')
        })
        .catch(error => {
          setErrorMessage(error)
        })
    }
  })

  const handleSubmit = () => {
    formik.handleSubmit()
  }

  return (
    <>
      <Box
        sx={{
          height: `${height - 80}px`
        }}
      >
        <CustomTabPanel index={0} value={0}>
          <Box>
            <Grid container>
              <Grid sx={{ width: '100%' }}>
                <Box sx={{ width: '100%' }}>
                  <DataGrid
                    height={height - 150}
                    onChange={value => formik.setFieldValue('rows', value)}
                    value={formik.values.rows}
                    error={formik.errors.rows}
                    columns={columns}
                    allowDelete={false}
                    allowAddNewLine={false}
                    maxAccess={access}
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>

          <Box
            sx={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              width: '100%',
              margin: 0
            }}
          >
            <WindowToolbar onSave={handleSubmit} />
          </Box>
        </CustomTabPanel>
      </Box>

      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default SystemFunction
