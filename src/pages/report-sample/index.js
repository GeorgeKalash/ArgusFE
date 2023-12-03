import { useState, useContext, useEffect } from 'react'
import { Button } from '@mui/material'
import ReportViewer from 'src/components/Shared/ReportViewer'
import { RequestsContext } from 'src/providers/RequestsContext'

const ReportSample = () => {
  const { getRequest } = useContext(RequestsContext)

  const [showReport, setShowReport] = useState(false)
  const [reportData, setReportData] = useState(null)
  const [reportTemplate, setReportTemplate] = useState(null)

  console.log({ reportData })
  console.log({ reportTemplate })

  const mockupData = [
    {
      documentRef: 'INV23-1701-0059',
      date: new Date(1700265600000),
      subtotal: 217.39,
      taxAmount: 0.0,
      amount: 250.0,
      amountBeforeTax: 217.39,
      avgMetalPrice: 536.76543209876536,
      pureMetalWeight: 0.405,
      metalRef: 'G18',
      metalWeight: 0.54,
      paymentTypes: 'Bank Cash '
    },
    {
      documentRef: 'INV23-1701-0060',
      date: new Date(1700352000000),
      subtotal: 3608.7,
      taxAmount: 0.0,
      amount: 4150.0,
      amountBeforeTax: 3608.7,
      avgMetalPrice: 270.08700533258491,
      pureMetalWeight: 13.361249999999998,
      metalRef: 'G21',
      metalWeight: 11.36,
      paymentTypes: 'Bank'
    },
    {
      documentRef: 'INV23-1701-0060',
      date: new Date(1700352000000),
      subtotal: 3608.7,
      taxAmount: 0.0,
      amount: 4150.0,
      amountBeforeTax: 3608.7,
      avgMetalPrice: 270.08700533258491,
      pureMetalWeight: 13.361249999999998,
      metalRef: 'G21',
      metalWeight: 2.53,
      paymentTypes: 'Bank'
    }
  ]

  const getReportData = () => {
    // getRequest({
    //   extension: 'RT.asmx/RT311',
    //   parameters: '_params=1|20230727^2|20230728'
    // })
    //   .then(res => {
    //     console.log({ res })
    //   })
    //   .catch(error => {
    //     console.log(error)
    //   })

    setTimeout(() => {
      const sampleData = mockupData
      setReportData(sampleData)
    }, 200)
  }

  const openReport = () => {
    setShowReport(true)
  }

  const closeReport = () => {
    setShowReport(false)
  }

  useEffect(() => {
    // Read the sample XML file for the report template
    fetch('/xmls/sample.xml')
      .then(response => {
        return response.text()
      })
      .then(template => {
        console.log({ template })
        setReportTemplate(template)
        getReportData()
      })
      .catch(error => {
        console.error('Error reading XML file:', error)
      })
  }, [])

  return (
    <div>
      <Button onClick={() => openReport()}>Show Report</Button>
      <Button onClick={() => closeReport()}>Close Report</Button>
      {showReport && reportData && reportTemplate && (
        <ReportViewer reportData={reportData} reportTemplate={reportTemplate} />
      )}
      {/* {showReport && <ReportViewer />} */}
    </div>
  )
}

export default ReportSample
