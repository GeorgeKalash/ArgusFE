// ** React Imports
import { useEffect, useState, useContext } from 'react'

// ** MUI Imports
import { Box } from '@mui/material'

// ** Custom Imports
import ErrorWindow from 'src/components/Shared/ErrorWindow'

// ** 3rd Party Imports
import axios from 'axios'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'

const DocumentTypes = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)

  //stores
  const [reportData, setReportData] = useState([])
  const [reportTemplate, setReportTemplate] = useState([])

  //states
  const [errorMessage, setErrorMessage] = useState(null)

  const getReportData = () => {
    getRequest({
      extension: 'RG.BP.asmx/BP101',
      parameters: '_params='
    })
      .then(res => {
        console.log({ res })

        // setReportData()
      })
      .catch(error => {
        setErrorMessage(error.response.data)
      })
  }

  const getReportTemplate = () => {
    return axios({
      method: 'GET',
      url: 'http://localhost:3000/api/dllReader/',
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }).then(async res => {
      console.log({ data: res.data })

      //setReportTemplate(res.data.message)
    })
  }

  useEffect(() => {
    getReportTemplate()

    // getReportData()
  }, [])

  return (
    <VertLayout>
      {reportTemplate}
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </VertLayout>
  )
}

export default DocumentTypes
