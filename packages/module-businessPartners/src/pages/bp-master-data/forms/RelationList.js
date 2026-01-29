import Table from '@argus/shared-ui/src/components/Shared/Table'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { BusinessPartnerRepository } from '@argus/repositories/src/repositories/BusinessPartnerRepository'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import RelationForm from './RelationForm'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'

const RelationList = ({ store, labels, maxAccess }) => {
  const { recordId } = store
  const [relationGridData, setRelationGridData] = useState([])
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()
  const editMode = !!store.recordId

  const getRelationGridData = async bpId => {
    const res = await getRequest({
      extension: BusinessPartnerRepository.Relation.qry,
      parameters: `_bpId=${bpId}`
    })

    setRelationGridData(res)
  }

  const delRelation = async obj => {
    await postRequest({
      extension: BusinessPartnerRepository.Relation.del,
      record: JSON.stringify(obj)
    })

    toast.success(platformLabels.Deleted)
    await getRelationGridData(recordId)
  }

  const columns = [
    {
      field: 'relationName',
      headerName: labels.relation,
      flex: 1
    },
    {
      field: 'toBPRef',
      headerName: labels.reference,
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
      type: 'date'
    },
    {
      field: 'endDate',
      headerName: labels.to,
      flex: 1,
      type: 'date'
    }
  ]

  const addRelation = () => {
    openForm()
  }

  const editRelation = obj => {
    openForm(obj?.recordId)
  }

  const openForm = id => {
    stack({
      Component: RelationForm,
      props: {
        labels: labels,
        maxAccess: maxAccess,
        editMode: editMode,
        recordId: id,
        bpId: recordId,
        getRelationGridData: getRelationGridData
      },
      width: 500,
      height: 400,
      title: labels.relation
    })
  }
  useEffect(() => {
    recordId && getRelationGridData(recordId)
  }, [recordId])

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
