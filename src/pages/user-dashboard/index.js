import { useContext, useState } from 'react'
import toast from 'react-hot-toast'
import { Grid } from '@mui/material'
import Table from 'src/components/Shared/Table'
import WindowToolbar from 'src/components/Shared/WindowToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { useResourceQuery } from 'src/hooks/resource'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { AccessControlRepository } from 'src/repositories/AccessControlRepository'
import { getStorageData } from 'src/storage/storage'

const UserDashboard = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const userData = getStorageData('userData')
  const _userId = userData.userId
  const { platformLabels } = useContext(ControlContext)

  const [search, setSearch] = useState('')

  const {
    query: { data },
    labels: _labels,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: SystemRepository.SystemChecks.qry,
    datasetId: ResourceIds.SystemChecks
  })

  async function fetchGridData() {
    const appletsData = await getRequest({
      extension: AccessControlRepository.ModuleClass.qry2,
      parameters: `_moduleId=60`
    })

    const checkedApplets = await getRequest({
      extension: SystemRepository.DynamicDashboard.qry,
      parameters: `_userId=${_userId}`
    })

    //console.log(appletsData, checkedApplets)

    const mergedSYCheckedList = appletsData.list.map(systemCheckItem => {
      const item = {
        appletId: systemCheckItem.key,
        appletName: systemCheckItem.value,
        checked: false,
        value: false
      }
      console.log(item)
      const matchingTemplate = checkedApplets.list.find(y => item.appletId == y.appletId)
      console.log(matchingTemplate)
      matchingTemplate && (item.checked = true)
      matchingTemplate && (item.value = true)

      return item
    })

    //console.log(mergedSYCheckedList)

    return { list: mergedSYCheckedList }
  }

  const columns = [
    {
      field: 'appletId',
      headerName: _labels.appletId,
      flex: 1
    },
    {
      field: 'appletName',
      headerName: _labels.appletName,
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

  const handleSubmit = () => {
    postChecks()
  }

  const postChecks = async () => {
    const checkedObjects = data.list.filter(obj => obj.checked)
    console.log(checkedObjects)

    // checkedObjects.forEach(obj => {
    //   obj.scope = 1
    //   obj.masterId = 0
    //   obj.value = true
    // })
    // const resultObject = {
    //   scope: 1,
    //   masterId: 0,
    //   items: checkedObjects
    // }
    // await postRequest({
    //   extension: SystemRepository.SystemChecks.set,
    //   record: JSON.stringify(resultObject)
    // }).then(() => {
    //   toast.success(platformLabels.Updated)
    // })
  }

  return (
    <VertLayout>
      <Fixed>
        <Grid container xs={12}>
          <Grid item xs={3} sx={{ m: 2 }}>
            <CustomTextField
              name='search'
              value={search}
              label={platformLabels.Search}
              onClear={() => {
                setSearch('')
              }}
              onChange={handleSearchChange}
              onSearch={e => setSearch(e)}
              search={true}
              height={35}
            />
          </Grid>
        </Grid>
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={{ list: filteredData }}
          rowId={['appletId']}
          isLoading={false}
          maxAccess={access}
          showCheckboxColumn={true}
          handleCheckedRows={() => {}}
          pagination={false}
        />
      </Grow>
      <Fixed>
        <WindowToolbar isSaved={true} onSave={handleSubmit} smallBox={true} />
      </Fixed>
    </VertLayout>
  )
}

export default UserDashboard
