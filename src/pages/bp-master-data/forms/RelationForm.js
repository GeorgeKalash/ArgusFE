
// ** MUI Imports
import {Box} from '@mui/material'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { useContext, useEffect, useState } from 'react'
import { useFormik } from 'formik'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { BusinessPartnerRepository } from 'src/repositories/BusinessPartnerRepository'

const RelationForm = ({ store , popupRelation, labels, maxAccess }) => {

const { recordId } = store
const [relationGridData, setRelationGridData] = useState([])
const { getRequest, postRequest } = useContext(RequestsContext)


  //Relation Tab
  const formik = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      toBPId: yup.string().required('This field is required'),
      relationId: yup.string().required('This field is required')
    }),
    onSubmit: values => {
      console.log('relation values ' + JSON.stringify(values))
      postRelation(values)
    }
  })

useEffect(()=>{
  getRelationGridData(recordId)
},[recordId])

  const getRelationGridData = bpId => {
    setRelationGridData([])
    const defaultParams = `_bpId=${bpId}`
    var parameters = defaultParams

    getRequest({
      extension: BusinessPartnerRepository.Relation.qry,
      parameters: parameters
    })
      .then(res => {
        setRelationGridData(res)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const postRelation = obj => {
    const bpId = recordId
    obj.fromBPId = bpId
    postRequest({
      extension: BusinessPartnerRepository.Relation.set,
      record: JSON.stringify(obj)
    })
      .then(res => {
        if (!recordId) {
          toast.success('Record Added Successfully')
        } else toast.success('Record Editted Successfully')

        setRelationWindowOpen(false)
        getRelationGridData(bpId)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const getRelationById = obj => {
    const _recordId = obj.recordId
    const defaultParams = `_recordId=${_recordId}`
    var parameters = defaultParams
    getRequest({
      extension: BusinessPartnerRepository.Relation.get,
      parameters: parameters
    })
      .then(res => {
        console.log('get ' + JSON.stringify())
        relationValidation.setValues(populateRelation(res.record))
        setRelationWindowOpen(true)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }



  const delRelation = obj => {
    const bpId = recordId
    postRequest({
      extension: BusinessPartnerRepository.Relation.del,
      record: JSON.stringify(obj)
    })
      .then(res => {
        toast.success('Record Deleted Successfully')
        getRelationGridData(bpId)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const columns = [
    {
      field: 'relationName',
      headerName: labels.relation,
      flex: 1
    },
    {
      field: 'toBPName',
      headerName: labels.businessPartner,
      flex: 1
    },
    {
      field: 'startDate',
      headerName: labels.from,
      flex: 1
    },
    {
      field: 'endDate',
      headerName: labels.to,
      flex: 1
    }
  ]

  const addRelation = () => {
    relationValidation.setValues(getNewRelation(bpMasterDataValidation.values.recordId))

  }

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}
      >
        <GridToolbar onAdd={addRelation} maxAccess={maxAccess} />
        <Table
          columns={columns}
          gridData={relationGridData}
          rowId={['recordId']}
          api={getRelationGridData}
          onEdit={popupRelation}
          onDelete={delRelation}
          isLoading={false}
          maxAccess={maxAccess}
          pagination={false}
          height={200}
        />
      </Box>
    </>
  )
}

export default RelationForm
