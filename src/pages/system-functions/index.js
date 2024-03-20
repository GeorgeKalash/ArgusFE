// ** React Imports
import { useState, useContext } from 'react'


// ** MUI Imports
import { Box, Grid } from '@mui/material'

// ** Third Party Imports
import { useFormik } from 'formik'
import toast from 'react-hot-toast'
import FormShell from 'src/components/Shared/FormShell'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'

// ** Helpers
import {useResourceQuery } from 'src/hooks/resource'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'
import { DataGrid } from 'src/components/Shared/DataGrid'

const SystemFunction = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)

  //states
  const [initialValues, setData] = useState({rows :[]})


  const getGridData = async () => {
    const resSystemFunction = await getRequest({
      extension: SystemRepository.SystemFunction.qry,
      parameters: `_filter=`
    })
    console.log(resSystemFunction);
    formik.setValues({
      ...formik.values,
      rows: resSystemFunction.list.map(({nraId, nraRef, batchNRAId, batchNRARef, ...rest }, index) => ({
        id: index + 1,
        nra: {
          recordId: nraId,
          reference: nraRef
        },
        batchNRA: {
          recordId: batchNRAId,
          reference: batchNRARef
        },
        ...rest
      }))
    });
  }

  const {
    labels: labels,
  } = useResourceQuery({
    queryFn: getGridData,
    endpointId: SystemRepository.SystemFunction.qry,
    datasetId: ResourceIds.SystemFunction
  })


  const columns = [
    {
      component: 'numberfield',
      label: labels.functionId,
      name: 'functionId',
      props: {
      readOnly: true
      }
    },
    {
      component: 'textfield',
      label: labels.name,
      name: 'sfName',
      props: {
        readOnly: true
        }
    },
    {
      component: 'resourcelookup',
      label: labels.numberRange,
      name: 'nra',
      props: {
        endpointId: SystemRepository.NumberRange.snapshot,
        displayField: 'reference',
        valueField: 'reference',
        columnsInDropDown: [
          { key: "reference", value: "Reference" },
          { key: "name", value: "Name" },
        ]
      },
      onChange({ row: { update, newRow } }) {
        update({
          nraId : newRow?.nra?.recordId,
          nraRef:  newRow?.nra?.reference,
        })
      },
    },
    {
      component: 'resourcelookup',
      label: labels.batchNumberRange,
      name: 'batchNRA',
      props: {
        endpointId: SystemRepository.NumberRange.snapshot,
        displayField: 'reference',
        valueField: 'reference',
        columnsInDropDown: [
          { key: "reference", value: "Reference" },
          { key: "name", value: "Name" },
        ]
      },
      onChange({ row: { update, newRow } }) {
        update({
          batchNRAId : newRow?.batchNRA?.recordId,
          batchNRARef:  newRow?.batchNRA?.reference,
        })
      },
    }
  ]

  const formik = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    initialValues,

    onSubmit: async values => {

      console.log(values.rows)

      const resultObject = {
        systemFunctionMappings: values.rows
        .map(({functionId, nra, batchNRA }) => ({functionId,
          nraId : nra?.recordId ,  nraRef : nra?.reference, batchNRAId: batchNRA?.recordId, batchNRARef : batchNRA?.reference}))
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

  return (
    <>
     <Box sx={{height: `calc(100vh - 50px)` , display: 'flex',flexDirection: 'column' , zIndex:1}}>
          <FormShell 
            form={formik} 
            infoVisible={false} 
            visibleClear={false}
            isCleared={false}
          >
            
            <Grid container>
              <Grid sx={{ width: '100%'  }}>
                <Box sx={{ width: '100%'  }}>
                  <DataGrid
                   height={`calc(100vh - 150px)`}
                   onChange={value => { console.log(value); formik.setFieldValue('rows', value)}}
                   value={formik.values.rows}
                   error={formik.errors.rows}
                   columns={columns}
                   allowDelete={false}
                   allowAddNewLine={false}
                  />
                </Box>
              </Grid>
            </Grid>
          </FormShell>
          </Box>
    </>
  )
}

export default SystemFunction
