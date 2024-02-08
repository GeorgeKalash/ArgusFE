import { Box } from '@mui/material'
import { useFormik } from 'formik'
import * as yup from 'yup'
import { useEffect, useState ,useContext} from 'react'

// ** Custom Imports
import InlineEditGrid from 'src/components/Shared/InlineEditGrid'

import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { SaleRepository } from 'src/repositories/SaleRepository'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'

const BracketsTab = ({labels, maxAccess, recordId ,setErrorMessage}) => {
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
              maxAmount: yup.string().required('Maximum amount is required'),
            })
          ),
          }),
          initialValues:{
            rows: [
              {
                seqNo: '',
                minAmount: '',
                maxAmount:''}]
          },
        onSubmit: async obj => {

          const updatedRows =formik.values.rows.map((adjDetail, index) => {
            const seqNo = index + 1 // Adding 1 to make it 1-based index
            
              return {
                ...adjDetail,
                seqNo: seqNo
            }
          })
          
          const resultObject = {
            commissionScheduleId : recordId,
            items: updatedRows,
          }

          console.log('updated rows ',resultObject)
    
          const response = await postRequest({
            extension: SaleRepository.CommissionScheduleBracket.set,
            record: JSON.stringify(resultObject)
          })
    
          if (!recordId) {
            toast.success('Record Added Successfully')
            setInitialData({
              ...obj, // Spread the existing properties
              recordId: response.recordId // Update only the recordId field
            })
          } else toast.success('Record Edited Successfully')
          setEditMode(true)
    
          invalidate()
        }
      })

      const columns = [
        {
          field: 'numberfield',
          header:  labels[4],
          name: 'minAmount',
          mandatory: true
        },
        {
          field: 'numberfield',
          header: labels[5],
          name: 'maxAmount',
          mandatory: true
        },
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
            }
          } catch (error) {
            setErrorMessage(error)
          }
          setIsLoading(false)
        })()
      }, [])
      
  return (
    <>
     <FormShell
      resourceId={ResourceIds.CommissionSchedule}
      form={formik}
      height={300}
      editMode={true}
      maxAccess={maxAccess}
    >
      <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <InlineEditGrid
          gridValidation={formik}
          maxAccess={maxAccess}
          columns={columns}
          defaultRow={{
            seqNo: '',
            minAmount: '',
            maxAmount:''
          }}
          scrollHeight={320}
          width={500}
        />
      </Box>
      </FormShell>
    </>
  )
}

export default BracketsTab