import { Box } from '@mui/material'
import { useFormik } from 'formik'
import * as yup from 'yup'
import { useEffect, useState, useContext } from 'react'
import toast from 'react-hot-toast'

import InlineEditGrid from 'src/components/Shared/InlineEditGrid'

import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { SaleRepository } from 'src/repositories/SaleRepository'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'

const BracketsTab = ({ labels, maxAccess, recordId, setErrorMessage, setSelectedRecordIds }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)

  const [isLoading, setIsLoading] = useState(false)

  const invalidate = useInvalidate({
    endpointId: SaleRepository.CommissionScheduleBracket.qry
  })

  const formik = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      rows: yup.array().of(
        yup.object({
          minAmount: yup.string().required('Minimum amount is required'),
          maxAmount: yup.string().required('Maximum amount is required')
        })
      )
    }),
    initialValues: {
      recordId: recordId,
      rows: [
        {
          commissionScheduleId: recordId || '',
          seqNo: '',
          minAmount: '',
          maxAmount: '',
          pct: ''
        }
      ]
    },
    onSubmit: async obj => {
      const updatedRows = formik.values.rows.map((adjDetail, index) => {
        const seqNo = index + 1 // Adding 1 to make it 1-based index

        return {
          ...adjDetail,
          commissionScheduleId: recordId,
          seqNo: seqNo
        }
      })

      const resultObject = {
        commissionScheduleId: recordId,
        items: updatedRows
      }

      console.log('updated rows ', resultObject)

      const response = await postRequest({
        extension: SaleRepository.CommissionSchedule.set2,
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
      field: 'numberfield',
      header: labels[4],
      name: 'minAmount',
      mandatory: true
    },
    {
      field: 'numberfield',
      header: labels[5],
      name: 'maxAmount',
      mandatory: true
    },
    {
      field: 'numberfield',
      header: labels[6],
      name: 'pct',
      mandatory: true
    }
  ]

  useEffect(() => {
    ;(async function () {
      try {
        if (recordId) {
          setIsLoading(true)

          const res = await getRequest({
            extension: SaleRepository.CommissionScheduleBracket.qry,
            parameters: `_commissionScheduleId=${recordId}`
          })

          if (res.list.length > 0) {
            formik.setValues({ recordId: recordId, rows: res.list })
          } else {
            formik.setValues({
              recordId: recordId,
              rows: [
                {
                  commissionScheduleId: recordId || '',
                  seqNo: '',
                  minAmount: '',
                  maxAmount: '',
                  pct: ''
                }
              ]
            })
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
    <FormShell resourceId={ResourceIds.CommissionSchedule} form={formik} editMode={true} maxAccess={maxAccess}>
      <VertLayout>
        <Grow>
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', marginTop: -5 }}>
            <InlineEditGrid
              gridValidation={formik}
              maxAccess={maxAccess}
              columns={columns}
              defaultRow={{
                commissionScheduleId: recordId || '',
                seqNo: '',
                minAmount: '',
                maxAmount: '',
                pct: ''
              }}
              width={500}
            />
          </Box>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default BracketsTab
