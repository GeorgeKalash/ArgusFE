import { useFormik } from 'formik'
import * as yup from 'yup'
import { useEffect, useState, useContext } from 'react'
import toast from 'react-hot-toast'

// ** Custom Imports
import InlineEditGrid from 'src/components/Shared/InlineEditGrid'
import { SaleRepository } from 'src/repositories/SaleRepository'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import { Box } from '@mui/material'
import { useInvalidate } from 'src/hooks/resource'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'

export default function TargetForm({ labels, maxAccess, recordId, setErrorMessage }) {
  console.log('enter target')
  const { getRequest, postRequest } = useContext(RequestsContext)

  const [isLoading, setIsLoading] = useState(false)

  const invalidate = useInvalidate({
    endpointId: SaleRepository.Target.qry
  })

  const formik = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    initialValues: {
      rows: [
        {
          spId: recordId,
          fiscalYear: '',
          targetAmount: ''
        }
      ]
    },
    onSubmit: async obj => {
      // Create the resultObject
      const resultObject = {
        spId: recordId,
        items: obj.rows
      }

      const response = await postRequest({
        extension: SaleRepository.Target.set2,
        record: JSON.stringify(resultObject)
      })

      if (!recordId) {
        toast.success('Record Added Successfully')
        setInitialData({
          ...obj, // Spread the existing properties
          recordId: response.recordId // Update only the recordId field
        })
      } else toast.success('Record Edited Successfully')

      invalidate()
    }
  })

  const columns = [
    {
      field: 'textfield',
      header: labels[10],
      name: 'fiscalYear',
      mandatory: true,
      readOnly: true
    },
    {
      field: 'numberfield',
      header: labels[9],
      name: 'targetAmount'
    }
  ]

  useEffect(() => {
    console.log('enter target2')
    ;(async function () {
      try {
        if (recordId) {
          setIsLoading(true)

          const fiscalRes = await getRequest({
            extension: SystemRepository.FiscalYears.qry,
            parameters: '_filter='
          })

          const res = await getRequest({
            extension: SaleRepository.Target.qry,
            parameters: `_spId=${recordId}`
          })

          if (fiscalRes.list.length > 0) {
            const newRows = fiscalRes.list.map(fiscalYearObj => {
              const correspondingTarget = res.list.find(targetObj => targetObj.fiscalYear === fiscalYearObj.fiscalYear)

              return {
                spId: recordId,
                fiscalYear: String(fiscalYearObj.fiscalYear), // Convert to string
                targetAmount: correspondingTarget ? correspondingTarget.targetAmount : 0
              }
            })

            formik.setValues({ rows: newRows })
          }
        }
      } catch (error) {
        setErrorMessage(error)
      }
      setIsLoading(false)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <FormShell resourceId={ResourceIds.SalesPerson} form={formik} height={300} editMode={true} maxAccess={maxAccess}>
      <Box sx={{ width: '100%' }}>
        <InlineEditGrid
          gridValidation={formik}
          maxAccess={maxAccess}
          columns={columns}
          defaultRow={{
            spId: recordId,
            targetAmount: '',
            fiscalYear: ''
          }}
          scrollHeight={500}
          allowAddNewLine={false}
          allowDelete={false}
        />
      </Box>
    </FormShell>
  )
}
