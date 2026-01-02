import { BusinessPartnerRepository } from '@argus/repositories/src/repositories/BusinessPartnerRepository'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { useContext, useState } from 'react'
import toast from 'react-hot-toast'
import BankForm from './BankForm'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import Table from '@argus/shared-ui/src/components/Shared/Table'

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
    datasetId: ResourceIds.BPMasterData,
    params: { disabledReqParams: true, maxAccess }
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
