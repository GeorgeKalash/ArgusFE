// ** React Imports
import { useEffect, useState, useContext } from 'react'

// ** MUI Imports
import { Box } from '@mui/material'

// ** Third Party Imports
import { useFormik } from 'formik'
import * as yup from 'yup'
import toast from 'react-hot-toast'

import FormShell from 'src/components/Shared/FormShell'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import WindowToolbar from 'src/components/Shared/WindowToolbar'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import InlineEditGrid from 'src/components/Shared/InlineEditGrid'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'

// ** Helpers
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'
import { useWindowDimensions } from 'src/lib/useWindowDimensions'
import { useWindow } from 'src/windows'
import useResourceParams from 'src/hooks/useResourceParams'
import { SystemRepository } from 'src/repositories/SystemRepository'

const SystemFunction = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)

  const [numberRangeStore, setNumberRangeStore] = useState([])
  const [batchNumberRangeStore, setBatchNumberRangeStore] = useState([])

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
    labels: _labels,
    refetch,
    access
  } = useResourceQuery({
    queryFn: getGridData,
    endpointId: SystemRepository.SystemFunction.qry,
    datasetId: ResourceIds.SystemFunction
  })

  /*const { labels: _labelsADJ, access: accessADJ } = useResourceParams({
    datasetId: ResourceIds.SystemFunction
  })*/

  const invalidate = useInvalidate({
    endpointId: SystemRepository.SystemFunction.qry
  })

  const lookupNumberRange = inp => {
    const input = inp

    if (input) {
      var parameters = `_filter=${input}`

      getRequest({
        extension: SystemRepository.NumberRange.snapshot,
        parameters: parameters
      })
        .then(res => {
          setNumberRangeStore(res.list)
        })
        .catch(error => {
          setErrorMessage(error)
        })
    }
  }

  const lookupBatchNumberRange = inp => {
    const input = inp

    if (input) {
      var parameters = `_filter=${input}`

      getRequest({
        extension: SystemRepository.NumberRange.snapshot,
        parameters: parameters
      })
        .then(res => {
          setBatchNumberRangeStore(res.list)
        })
        .catch(error => {
          setErrorMessage(error)
        })
    }
  }

  const columns = [
    {
      field: 'numberfield',
      header: labels.functionId,
      name: 'functionId',
      mandatory: false,
      hidden: false,
      readOnly: true
    },
    {
      field: 'textfield',
      header: labels.name,
      name: 'sfName',
      mandatory: false,
      hidden: false,
      readOnly: true
    },
    {
      field: 'lookup',
      header: labels.numberRange,
      nameId: 'nraId',
      name: 'nraRef',
      mandatory: false,
      store: numberRangeStore,
      valueField: 'recordId',
      displayField: 'reference',
      widthDropDown: 200,
      fieldsToUpdate: [{ from: 'reference', to: 'nraRef' }],
      columnsInDropDown: [
        { key: 'reference', value: 'Reference' },
        { key: 'description', value: 'Description' }
      ],
      onLookup: lookupNumberRange
    },
    {
      field: 'lookup',
      header: labels.batchNR,
      nameId: 'batchNRAId',
      name: 'batchNRARef',
      mandatory: false,
      store: batchNumberRangeStore,
      valueField: 'recordId',
      displayField: 'reference',
      widthDropDown: 200,
      fieldsToUpdate: [{ from: 'reference', to: 'nraRef' }],
      columnsInDropDown: [
        { key: 'reference', value: 'Reference' },
        { key: 'description', value: 'Description' }
      ],
      onLookup: lookupBatchNumberRange
    }
  ]

  const formik = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({}),
    initialValues: {
      rows: [{}]

      /*rows: [
        {
          functionId: '',
          sfName: '',
          nraId: '',
          batchNRAId:'',
          nraRef: '',
          batchNRARef:''
        }
      ]*/
    },
    onSubmit: async obj => {
      const resultObject = {
        systemFunctionMappings: formik.values.rows
      }

      console.log('rows ', resultObject)

      const response = await postRequest({
        extension: SystemRepository.SystemFunction.set2,
        record: JSON.stringify(resultObject)
      })

      if (!recordId) {
        toast.success('Record Added Successfully')
        setInitialData({
          ...obj, // Spread the existing properties
          //recordId: response.recordId // Update only the recordId field
        })
      } else toast.success('Record Edited Successfully')

      invalidate()
    }
  })


  /*const handleSubmit = () => {
    gateKeeperValidation.handleSubmit()
  }*/

  return (
    <FormShell
    resourceId={ResourceIds.SystemFunction}
    form={formik}
    maxAccess={access}
  >
    <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', marginTop: -5 }}>
    <InlineEditGrid
            gridValidation={formik}
            maxAccess={access}
            columns={columns}
            defaultRow={{}}

            //scrollHeight={250}
            //width={500}
          />
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </Box>
    </FormShell>
  )
}

export default SystemFunction
