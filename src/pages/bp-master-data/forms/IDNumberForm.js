import { Box } from '@mui/material'
import FormShell from 'src/components/Shared/FormShell'
import { useFormik } from 'formik'
import * as yup from 'yup'
import toast from 'react-hot-toast'

// ** Custom Imports
import InlineEditGrid from 'src/components/Shared/InlineEditGrid'
import { RequestsContext } from 'src/providers/RequestsContext'

const IDNumberTab = ({ recordId, idNumberValidation, idNumberGridColumn, maxAccess }) => {
  const { postRequest } = useContext(RequestsContext)

  const formik = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    initialValues: {
      rows: [
        {
          bpId: selectedRecordId || '',
          incId: '',
          idNum: '',
          incName: ''
        }
      ]
    },
    onSubmit: values => {
      postIdNumber(values.rows)
    }
  })

  const postIdNumber = obj => {
    const recordId = bpMasterDataValidation.values.recordId

    const postBody = Object.entries(obj).map(([key, value]) => {
      return postRequest({
        extension: BusinessPartnerRepository.MasterIDNum.set,
        record: JSON.stringify(value)
      })
    })
    Promise.all(postBody)
      .then(() => {
        if (!recordId) {
          toast.success('Record Added Successfully')
        } else {
          toast.success('Record Edited Successfully')
        }
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

return (
    <FormShell>
      <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <InlineEditGrid
          gridValidation={formik}
          maxAccess={maxAccess}
          columns={idNumberGridColumn}
          defaultRow={{
            bpId: recordId || '',
            incId: '',
            incName: '',
            idNum: ''
          }}
          scrollHeight={350}
          width={750}
          allowDelete={false}
        />
      </Box>
    </FormShell>
  )
}

export default IDNumberTab
