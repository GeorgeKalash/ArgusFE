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
import { DataGrid } from 'src/components/Shared/DataGrid'

const SmsFunctionTemplate = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { height } = useWindowDimensions()

  //states
  const [errorMessage, setErrorMessage] = useState(null)



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
        var count = 1
          smsFunctionTemplatesValidation.setValues({
            ...smsFunctionTemplatesValidation.values,
            rows: finalList?.map(
          ({ templateId, templateName,  ...rest }) => ({
            id : count++,
            template:{
              recordId: templateId,
              name: templateName
            },
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





  const columns = [
    {
      component: 'textfield',
      label: _labels[1],
      name: 'functionId',

      // width: 200,
        props: {
   readOnly: true
      }
    },
    {
      component: 'textfield',
      label: _labels[2],
      name: 'functionName',
      props: {
   readOnly: true
      },

      // width: 300
    },{
      component: 'resourcelookup',
      label: _labels[3],
      name: 'template',
      props: {
        endpointId: SystemRepository.SMSTemplate.snapshot,
        displayField: 'name',
        valueField: 'name',
        columnsInDropDown: [
          { key: "reference", value: "Reference" },
          { key: "name", value: "Name" },
        ],
      },

      // width: 500
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
    const obj = {
      smsFunctionTemplates: smsFunctionTemplatesValidation.values.rows.map(({ functionId, template }) => ({ functionId,
          templateId : template.recordId ,  templateName : template.name}))
          .filter(row => row.templateId != null)


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
              <Grid sx={{ width: '100%'  }}>
                <Box sx={{ width: '100%'  }}>
                  <DataGrid
                   height={height-150}
                   onChange={value => smsFunctionTemplatesValidation.setFieldValue('rows', value)}
                   value={smsFunctionTemplatesValidation.values.rows}
                   error={smsFunctionTemplatesValidation.errors.rows}
                   columns={columns}
                   allowDelete={false}
                   allowAddNewLine={false}
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
