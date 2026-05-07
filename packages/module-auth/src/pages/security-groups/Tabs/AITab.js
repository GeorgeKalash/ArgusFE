import { useState, useContext, useEffect } from 'react'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { AccessControlRepository } from '@argus/repositories/src/repositories/AccessControlRepository'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import toast from 'react-hot-toast'
import { CommonContext } from '@argus/shared-providers/src/providers/CommonContext'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import Form from '@argus/shared-ui/src/components/Shared/Form'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'

const AITab = ({ labels, maxAccess, recordId }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { getAllKvsByDataset } = useContext(CommonContext)
  const { platformLabels } = useContext(ControlContext)
  const [data, setData] = useState([])

  const handleSubmit = async () => {
    const resultObject = {
      sgId: recordId,
      items: data
        .filter(row => row.checked)
        .map(row => ({
          sgId: recordId,
          agentId: Number(row.agentId)
        }))
    }

    await postRequest({
      extension: AccessControlRepository.SecurityGroup.set2,
      record: JSON.stringify(resultObject)
    })

    toast.success(platformLabels.Updated)
  }

  async function getAllAgents() {
    return new Promise((resolve, reject) => {
      getAllKvsByDataset({
        _dataset: DataSets.AI_AGENT,
        callback: result => {
          if (result) resolve(result)
          else reject()
        }
      })
    })
  }

  useEffect(() => {
    ;(async function () {
      const agentsData = await getAllAgents()

      const resCheckedAgent = await getRequest({
        extension: AccessControlRepository.SecurityGroupAI.qry,
        parameters: `_filter=&_sgId=${recordId}`
      })

      const checkedIds = new Set(
        (resCheckedAgent?.list || []).map(item => Number(item.agentId))
      )

      const mergedData = agentsData.map(agent => ({
        agentId: Number(agent.key),
        agentName: agent.value,
        checked: checkedIds.has(Number(agent.key))
      }))

      setData(mergedData)
    })()
  }, [recordId])

  const columns = [
    {
      field: 'agentName',
      headerName: labels.agentName,
      flex: 1
    }
  ]

  return (
    <Form onSave={handleSubmit} maxAccess={maxAccess} fullSize>
      <VertLayout>
        <Grow>
          <Table
            columns={columns}
            gridData={{ list: data }}
            rowId={['agentId']}
            maxAccess={maxAccess}
            showCheckboxColumn={true}
            pagination={false}
            showSelectAll={false}
          />
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default AITab
