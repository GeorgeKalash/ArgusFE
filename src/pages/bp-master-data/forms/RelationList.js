import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { BusinessPartnerRepository } from 'src/repositories/BusinessPartnerRepository'
import { useWindow } from 'src/windows'
import RelationForm from './RelationForm'
import { formatDateDefault } from 'src/lib/date-helper'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'

const RelationList = ({ store , labels, editMode, maxAccess }) => {

const { recordId } = store
const [relationGridData, setRelationGridData] = useState([])
const { getRequest, postRequest } = useContext(RequestsContext)
const { stack } = useWindow()


useEffect(()=>{
  recordId && getRelationGridData(recordId)
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
      flex: 1,
      valueGetter: ({ row }) => formatDateDefault(row?.startDate)

    },
    {
      field: 'endDate',
      headerName: labels.to,
      flex: 1,
      valueGetter: ({ row }) =>  formatDateDefault(row?.endDate)

    }
  ]

  const addRelation = () => {
    openForm('')
  }

  const editRelation = (obj) => {
    openForm(obj?.recordId)
  }

  const openForm = (id) => {
    stack({
      Component:  RelationForm,
      props: {
            labels: labels,
            maxAccess: maxAccess,
            editMode : editMode,
            recordId :  id,
            bpId : recordId,
            getRelationGridData : getRelationGridData
      },
      width: 500,
      title: labels.relation
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={addRelation} maxAccess={maxAccess} />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={relationGridData}
          rowId={['recordId']}
          api={getRelationGridData}
          onEdit={editRelation}
          onDelete={delRelation}
          isLoading={false}
          maxAccess={maxAccess}
          pagination={false}
        /> 
      </Grow> 
    </VertLayout>
  )
}

export default RelationList
