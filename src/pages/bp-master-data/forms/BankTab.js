import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { useContext, useState } from 'react'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { BusinessPartnerRepository } from 'src/repositories/BusinessPartnerRepository'
import { useWindow } from 'src/windows'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import BankForm from './BankForm'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'

export default function BankTab({ store, labels, maxAccess }) {
  const { recordId } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()
  const [maxSeqNo, setMaxSeqNo] = useState(0)

  const {
    query: { data },
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    enabled: Boolean(recordId),
    endpointId: BusinessPartnerRepository.Bank.qry,
    datasetId: ResourceIds.BPMasterData
  })

  async function fetchGridData() {
    if (!recordId) return { list: [] }

    const response = await getRequest({
      extension: BusinessPartnerRepository.Bank.qry,
      parameters: `_bpId=${recordId}`
    })

    const maxSeq = response?.list?.length ? Math.max(...response?.list?.map(r => r.seqNo ?? 0)) : 0
    setMaxSeqNo(maxSeq)

    return response
  }

  const columns = [
    {
      field: 'bankName',
      headerName: labels.bank,
      flex: 1
    },
    {
      field: 'accNo',
      headerName: labels.accNo,
      flex: 1
    },
    {
      field: 'accName',
      headerName: labels.accName,
      flex: 1
    },
    {
      field: 'swiftCode',
      headerName: labels.swiftCode,
      flex: 1
    },
    {
      field: 'countryName',
      headerName: labels.countryName,
      flex: 1
    }
  ]

  const add = () => {
    openForm()
  }

  const edit = obj => {
    openForm(obj?.seqNo)
  }

  const openForm = seqNo => {
    stack({
      Component: BankForm,
      props: {
        labels,
        maxAccess,
        recordId,
        seqInfo: { seqNo, maxSeqNo }
      },
      width: 500,
      height: 400,
      title: labels.bank
    })
  }

  const del = async obj => {
    await postRequest({
      extension: BusinessPartnerRepository.Bank.del,
      record: JSON.stringify(obj)
    })

    toast.success(platformLabels.Deleted)
    invalidate()
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={add} maxAccess={maxAccess} />
      </Fixed>
      <Grow>
        <Table
          name='bankTable'
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          maxAccess={maxAccess}
          pagination={false}
        />
      </Grow>
    </VertLayout>
  )
}
