import { useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import GridToolbar from 'src/components/Shared/GridToolbar'
import Table from 'src/components/Shared/Table'
import { RequestsContext } from 'src/providers/RequestsContext'
import ValueForm from '../forms/ValueForm'
import { DocumentReleaseRepository } from 'src/repositories/DocumentReleaseRepository'
import { useWindow } from 'src/windows'
import { ControlContext } from 'src/providers/ControlContext'

const ValueFormList = ({ labels, store, maxAccess }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const [maxSeqNo, setMaxSeqNo] = useState(0)
  const [valueGridData, setValueGridData] = useState()
  const { stack } = useWindow()
  const { recordId } = store

  const columns = [
    {
      field: 'value',
      headerName: labels.value,
      flex: 1
    }
  ]

  function openForm(recordId, seqNo) {
    stack({
      Component: ValueForm,
      props: {
        labels: labels,
        chId: store.recordId,
        recordId: recordId,
        seqNo: seqNo,
        maxAccess: maxAccess,
        getValueGridData: getValueGridData
      },
      width: 400,
      height: 400,
      title: labels.values
    })
  }

  const delValue = obj => {
    postRequest({
      extension: DocumentReleaseRepository.CharacteristicsValues.del,
      record: JSON.stringify(obj)
    }).then(res => {
      getValueGridData(recordId)
      toast.success(platformLabels.Deleted)
    })
  }

  const addValue = () => {
    openForm('', maxSeqNo + 1)
  }

  const editValue = obj => {
    openForm(obj?.chId, obj?.seqNo)
  }

  const getValueGridData = chId => {
    const defaultParams = `_chId=${chId}`
    var parameters = defaultParams
    getRequest({
      extension: DocumentReleaseRepository.CharacteristicsValues.qry,
      parameters: parameters
    }).then(res => {
      setValueGridData(res)
      const maxSeq = Math.max(...res.list.map(item => item.seqNo), 0)
      setMaxSeqNo(maxSeq)
    })
  }

  useEffect(() => {
    recordId && getValueGridData(recordId)
  }, [recordId])

  return (
    <>
      <GridToolbar onAdd={addValue} maxAccess={maxAccess} />
      <Table
        columns={columns}
        gridData={valueGridData}
        rowId={['seqNo']}
        onEdit={editValue}
        onDelete={delValue}
        isLoading={false}
        maxAccess={maxAccess}
        pagination={false}
      />
    </>
  )
}

export default ValueFormList
