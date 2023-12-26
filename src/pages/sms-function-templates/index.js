// ** React Imports
import { useEffect, useState, useContext } from 'react'

// ** MUI Imports
import {Box } from '@mui/material'

// ** Third Party Imports
import { useFormik } from 'formik'
import * as yup from 'yup'
import toast from 'react-hot-toast'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ControlContext } from 'src/providers/ControlContext'
import { getNewSmsFunctionTemplate, populateSmsFunctionTemplate } from 'src/Models/System/SMSFunctionTemplate'

// ** Helpers
import ErrorWindow from 'src/components/Shared/ErrorWindow'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'

const SmsFunctionTemplate = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { getLabels, getAccess } = useContext(ControlContext)

  //stores
  const [gridData, setGridData] = useState([])

  //states
  const [windowOpen, setWindowOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  //control
  const [labels, setLabels] = useState(null)
  const [access, setAccess] = useState(null)

  const _labels = {
    functionId: labels && labels.find(item => item.key === 1).value,
    name: labels && labels.find(item => item.key === 2).value,
    smsTemplate: labels && labels.find(item => item.key === 3).value
  }

  const columns = [
    {
      field: 'funtionId',
      headerName: _labels.functionId,
      flex: 1
    },
    {
      field: 'name',
      headerName: _labels.name,
      flex: 1
    },
    {
      field: 'templateId',
      headerName: _labels.templateId,
      flex: 1
    }
  ]

  const smsFunctionTemplatesValidation = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    onSubmit: values => {
        postSmsFunctionTemplates(values)
    }
  })

  const handleSubmit = () => {
    smsFunctionTemplatesValidation.handleSubmit()
  }

  const getGridData = async () => {
    try {
      var parameters = ``;
  
      const resSystemFunction = await getRequest({
        extension: SystemRepository.SystemFunction.qry,
        parameters: parameters
      })
  
      const resSmsFunctionTemplate = await getRequest({
        extension: SystemRepository.SMSFunctionTemplate.qry,
        parameters: parameters
      })
  
      var finalList = [];
  
      resSystemFunction.list.forEach(x => {
        var n = {
          functionId: parseInt(x.functionId),
          templateId: null,
          functionName: x.sfName,
          templateName: null
        }
  
        resSmsFunctionTemplate.list.forEach(y => {
          if (n.functionId == y.functionId) {
            n.templateId = y.templateId
            n.templateName = y.templateName
          }
        });
  
        finalList.push(n)
      })

      // Casting finalList to the desired model
      const castedList = finalList.map((item) => populateSmsFunctionTemplate(item))
      console.log(castedList)
      setGridData(castedList)
    }   
    catch (error) {
      setErrorMessage(error.res);

      return [];
    }
  };
  
  const postSmsFunctionTemplates = obj => {
   /* const recordId = obj.recordId
    postRequest({
      extension: SystemRepository.SMSTemplate.set,
      record: JSON.stringify(obj)
    })
      .then(res => {
        getGridData({})
        setWindowOpen(false)
        if (!recordId) toast.success('Record Added Successfully')
        else toast.success('Record Edited Successfully')
      })
      .catch(error => {
        setErrorMessage(error)
      })*/
  }

  useEffect(() => {
    if (!access) getAccess(ResourceIds.SmsTemplates, setAccess)
    else {
      if (access.record.maxAccess > 0) {
        getGridData()
        getLabels(ResourceIds.SmsTemplates, setLabels)
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
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}
      >
        <Table
          columns={columns}
          gridData={gridData}
          rowId={['functionId']}
          api={getGridData}
          isLoading={false}
          maxAccess={access}
          pagination={false}
        />
      </Box>
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default SmsFunctionTemplate
