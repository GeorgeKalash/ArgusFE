import { Box } from '@mui/material'
import FormShell from 'src/components/Shared/FormShell'
import { useFormik } from 'formik'
import * as yup from 'yup'
import toast from 'react-hot-toast'

// ** Custom Imports
import InlineEditGrid from 'src/components/Shared/InlineEditGrid'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useContext, useEffect } from 'react'
import { ResourceIds } from 'src/resources/ResourceIds'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { BusinessPartnerRepository } from 'src/repositories/BusinessPartnerRepository'

const IDNumberForm = ({ store, maxAccess, labels , editMode }) => {
  const {recordId} = store
  const { getRequest, postRequest } = useContext(RequestsContext)

  const formik = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    initialValues: {
      rows: [
        { id: 1,
          bpId:  recordId,
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

  const columns = [
    {
      component: 'textfield',
      label: labels?.idCategory,
      name: 'incName',
      readOnly: true
    },
    {
      id: 1,
      component: 'textfield',
      label: labels?.idNumber,
      name: 'idNum'
    }
  ]

  const postIdNumber = obj => {

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
      })
  }

//   const filterIdCategory = async categId => {
//     console.log("res")
//     try {
//       console.log("res")

//       const res = await getRequest({
//         extension: BusinessPartnerRepository.CategoryID.qry,
//         parameters: `_startAt=0&_pageSize=1000`
//       })
// console.log(res)

// return categId
//         ? res.list.filter(
//             item => (categId === 1 && item.person) || (categId === 2 && item.org) || (categId === 3 && item.group)
//           )
//         : []
//     } catch (error) {

//       return []
//     }
//   }
useEffect(()=>{
  console.log("list")
  ;(async function () {

    const defaultParams = `_bpId=${recordId}`
    var parameters = defaultParams

    const res =  await getRequest({
      extension: BusinessPartnerRepository.MasterIDNum.qry,
      parameters: parameters
    })
    console.log("list" , res)
    const list = await store.category
console.log("list" , list, res.list )

    var listMIN =  res.list?.filter(y => {
      return list?.some(x => x.name === y.incName)
    })

    console.log('some', listMIN)
    if (listMIN?.length > 0) {

      const result =    listMIN.map(
        ({  ...rest } , index) => ({
           id: index,
           ...rest
        }))
      formik.setValues({ rows: result })

    } else {
      formik.setValues({
        rows: [
          { id : 1,
            bpId: recordId,
            incId: '',
            incName: '',
            idNum: ''
          }
        ]
      })
    }
  })()
},[recordId])

return (
    <FormShell
    resourceId={ResourceIds.BPMasterData}
    form={formik}
    maxAccess={maxAccess}
    editMode={editMode}>
      <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <DataGrid
           onChange={value => formik.setFieldValue('rows', value)}
           value={formik.values.rows}
           error={formik.errors.rows}
           columns={columns}
          scrollHeight={350}
          width={750}
          allowDelete={false}
        />
      </Box>
    </FormShell>
  )
}

export default IDNumberForm
