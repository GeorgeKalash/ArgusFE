import { useContext, useState } from 'react'
import toast from 'react-hot-toast'
import { Grid } from '@mui/material'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { Module } from '@argus/shared-domain/src/resources/Module'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { AccessControlRepository } from '@argus/repositories/src/repositories/AccessControlRepository'
import { getStorageData } from '@argus/shared-domain/src/storage/storage'
import Form from '@argus/shared-ui/src/components/Shared/Form'

const UserDashboard = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const userData = getStorageData('userData')
  const _userId = userData.userId
  const { platformLabels } = useContext(ControlContext)

  const [search, setSearch] = useState('')

  const {
    query: { data },
    labels,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    datasetId: ResourceIds.UserDashboard
  })

  async function fetchGridData() {
    const appletsData = await getRequest({
      extension: AccessControlRepository.ModuleClass.qry2,
      parameters: `_moduleId=${Module.Dashboard}`
    })

    const checkedApplets = await getRequest({
      extension: SystemRepository.DynamicDashboard.qry,
      parameters: `_userId=${_userId}`
    })

    const mergedList = appletsData.list.map(appletItem => {
      const item = {
        appletId: appletItem.key,
        appletName: appletItem.value,
        checked: false,
        value: false
      }
      const matchingTemplate = checkedApplets.list.find(y => item.appletId == y.appletId)
      matchingTemplate && (item.checked = true)
      matchingTemplate && (item.value = true)

      return item
    })

    return { list: mergedList }
  }

  const columns = [
    {
      field: 'appletId',
      headerName: labels.appletId,
      flex: 1
    },
    {
      field: 'appletName',
      headerName: labels.appletName,
      flex: 3
    }
  ]

  const filteredData = search
    ? data?.list?.filter(
        item =>
          item.appletId.toString().includes(search.toLowerCase()) ||
          (item.appletName && item.appletName.toLowerCase().includes(search.toLowerCase()))
      )
    : data?.list

  const handleSearchChange = event => {
    setSearch(event?.target?.value ?? '')
  }

  const handleSubmit = async () => {
    var seqNo = 0

    const mergedSYCheckedList = data.list
      .filter(obj => obj.checked)
      .map(appletItem => {
        const item = {
          ...appletItem,
          seqNo: ++seqNo,
          userId: _userId
        }

        return item
      })

    postRequest({
      extension: SystemRepository.DynamicDashboard.set2,
      record: JSON.stringify({
        userId: _userId,
        applets: mergedSYCheckedList
      })
    }).then(() => {
      toast.success(platformLabels.Updated)
    })
  }

  return (
    <Form onSave={handleSubmit} maxAccess={access} fullSize>
      <VertLayout>
        <Fixed>
          <Grid container xs={12} p={2}>
            <Grid item xs={3}>
              <CustomTextField
                name='search'
                value={search}
                label={platformLabels.Search}
                onClear={() => setSearch('')}
                onChange={handleSearchChange}
                onSearch={e => setSearch(e)}
                search={true}
              />
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <Table
            columns={columns}
            gridData={{ list: filteredData }}
            rowId={['appletId']}
            maxAccess={access}
            showCheckboxColumn={true}
            pagination={false}
          />
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default UserDashboard
