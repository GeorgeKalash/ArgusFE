import { useEffect, useState, useContext } from 'react'

// ** React ImportsCustomLookup
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import WindowToolbar from 'src/components/Shared/WindowToolbar'

// ** MUI Imports
import { Box, Grid } from '@mui/material'

// ** Third Party Imports
import { useFormik } from 'formik'
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
import InlineEditGrid from 'src/components/Shared/InlineEditGrid'
import { DataGrid } from 'src/components/Shared/DataGrid'

const SmsFunctionTemplate = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { height } = useWindowDimensions()

  //states
  const [errorMessage, setErrorMessage] = useState(null)
  const [templateStore, setTemplateStore] = useState([])

  const getGridData = () => {
    try {
      const parameters = ''

      const resSystemFunctionPromise = getRequest({
        extension: SystemRepository.SystemFunction.qry,
        parameters: parameters
      })

      const resSmsFunctionTemplatePromise = getRequest({
        extension: SystemRepository.SMSFunctionTemplate.qry,
        parameters: parameters
      })

      Promise.all([resSystemFunctionPromise, resSmsFunctionTemplatePromise]).then(
        ([resSystemFunction, resSmsFunctionTemplate]) => {
          const finalList = resSystemFunction.list.map(x => {
            const n = {
              functionId: parseInt(x.functionId),
              templateId: null,
              functionName: x.sfName,
              templateName: null
            }

            const matchingTemplate = resSmsFunctionTemplate.list.find(y => n.functionId === y.functionId)

            if (matchingTemplate) {
              n.templateId = matchingTemplate.templateId
              n.templateName = matchingTemplate.templateName
            }

            return n
          })
var count =1
          smsFunctionTemplatesValidation.setValues({
            ...smsFunctionTemplatesValidation.values,
            rows: finalList?.map(
          ({  ...rest }) => ({
            id : count++,

           ...rest
          })
            )
          })
        }
      )
    } catch (error) {
      setErrorMessage(error.res)

      return Promise.reject(error) // You can choose to reject the promise if an error occurs
    }
  }


  const {
    query: { data },
    labels: _labels,
    access
  } = useResourceQuery({
    queryFn: getGridData,
    datasetId: ResourceIds.SmsFunctionTemplates
  })

  console.log('labels ',_labels)

  const lookupTemplate = searchQry => {
    setTemplateStore([])

    if (searchQry) {
      var parameters = `_filter=${searchQry}`
      getRequest({
        extension: SystemRepository.SMSTemplate.snapshot,
        parameters: parameters
      })
        .then(res => {
          setTemplateStore(res.list)
        })
        .catch(error => {
          setErrorMessage(error)
        })
    }
  }

  const columns1 = [
    {
      field: 'textfield',
      header: _labels[1],
      name: 'functionId',
      mandatory: true,
      readOnly: true,
      width: 150
    },
    {
      field: 'textfield',
      header: _labels[2],
      name: 'functionName',
      mandatory: true,
      readOnly: true,
      width: 300
    },
    {
      field: 'lookup',
      header: _labels[3],
      nameId: 'templateId',
      name: 'templateName',
      mandatory: false,
      store: templateStore,
      valueField: 'recordId',
      displayField: 'name',
      fieldsToUpdate: [
        { from: 'recordId', to: 'templateId' },
        { from: 'name', to: 'templateName' }
      ],
      columnsInDropDown: [{ key: 'name', value: 'name' }],
      onLookup: lookupTemplate
    }
  ]

  const columns = [
    {
      component: 'textfield',
      label: _labels[1],
      name: 'functionId',
      width: 150
    },
    {
      component: 'textfield',
      label: _labels[2],
      name: 'functionName',

      width: 400
    },{
      component: 'resourcelookup',
      name: 'templateName',
      props: {
        endpointId: SystemRepository.SMSTemplate.snapshot,
        parameters: {
          _countryId: 1,
          _stateId: 0
        },
        displayField: 'name',
        valueField: 'name'
      },
      width: 850
    },
  ]

  const smsFunctionTemplatesValidation = useFormik({
    enableReinitialize: false,
    validateOnChange: true,
    validate: values => {},
    initialValues: {
      rows: [
        { id: 1,
          functionId: ''
        }
      ]
    },
    onSubmit: values => {
      postSmsFunctionTemplates()
    }
  })

  const handleSubmit = () => {
    smsFunctionTemplatesValidation.handleSubmit()
  }


  const postSmsFunctionTemplates = () => {
    //After filtering the objects where templateId is not null, then map operation transforms the filtered array, extracting only the functionId and templateId properties from each object and creating a new object with these properties.
    const obj = {
      smsFunctionTemplates: smsFunctionTemplatesValidation.values.rows
        .filter(row => row.templateId != null)
        .map(({ functionId, templateId }) => ({ functionId, templateId }))
    }

    postRequest({
      extension: SystemRepository.SMSFunctionTemplate.set,
      record: JSON.stringify(obj)
    })
      .then(res => {
        toast.success('Record Updated Successfully')
      })
      .catch(error => {
        setErrorMessage(error)
      })
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
              <Grid>
                <Box sx={{ width: '100%' }}>
                  {/* <InlineEditGrid
                    gridValidation={smsFunctionTemplatesValidation}
                    columns={columns1}
                    allowDelete={false}
                    allowAddNewLine={false}
                    scrollable={true}
                    scrollHeight={`${height - 130}px`}
                  /> */}

                  <DataGrid
                   onChange={value => smsFunctionTemplatesValidation.setFieldValue('rows', value)}
                   value={smsFunctionTemplatesValidation.values.rows}
                   error={smsFunctionTemplatesValidation.errors.rows}
                   columns={columns}
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

export default SmsFunctionTemplate
