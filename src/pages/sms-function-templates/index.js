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

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'
import InlineEditGrid from 'src/components/Shared/InlineEditGrid'

const SmsFunctionTemplate = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { getLabels, getAccess } = useContext(ControlContext)
  const { height } = useWindowDimensions()

  //states
  const [errorMessage, setErrorMessage] = useState(null)
  const [templateStore, setTemplateStore] = useState([])

  //control
  const [labels, setLabels] = useState(null)
  const [access, setAccess] = useState(null)

  const _labels = {
    functionId: labels && labels.find(item => item.key === '1').value,
    name: labels && labels.find(item => item.key === '2').value,
    templateName: labels && labels.find(item => item.key === '3').value
  }

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

  const columns = [
    {
      field: 'textfield',
      header: _labels.functionId,
      name: 'functionId',
      mandatory: true,
      readOnly: true,
      width: 150
    },
    {
      field: 'textfield',
      header: _labels.name,
      name: 'functionName',
      mandatory: true,
      readOnly: true,
      width: 300
    },
    {
      field: 'lookup',
      header: _labels.templateName,
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

  const smsFunctionTemplatesValidation = useFormik({
    enableReinitialize: false,
    validateOnChange: true,
    validate: values => {},
    initialValues: {
      rows: [
        {
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

          smsFunctionTemplatesValidation.setValues({
            ...smsFunctionTemplatesValidation.values,
            rows: finalList
          })
        }
      )
    } catch (error) {
      setErrorMessage(error.res)

      return Promise.reject(error) // You can choose to reject the promise if an error occurs
    }
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
        getGridData({})
        toast.success('Record Updated Successfully')
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  useEffect(() => {
    if (!access) getAccess(ResourceIds.SmsFunctionTemplates, setAccess)
    else {
      if (access.record.maxAccess > 0) {
        getGridData()
        getLabels(ResourceIds.SmsFunctionTemplates, setLabels)
      } else {
        setErrorMessage({ message: "YOU DON'T HAVE ACCESS TO THIS SCREEN" })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [access])

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
              <Grid xs={12}>
                <Box sx={{ width: '100%' }}>
                  <InlineEditGrid
                    gridValidation={smsFunctionTemplatesValidation}
                    columns={columns}
                    allowDelete={false}
                    allowAddNewLine={false}
                    scrollable={true}
                    scrollHeight={`${height - 130}px`}
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
