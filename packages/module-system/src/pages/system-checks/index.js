import { useContext, useState } from 'react'
import toast from 'react-hot-toast'
import { Grid } from '@mui/material'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import { CommonContext } from '@argus/shared-providers/src/providers/CommonContext'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import Form from '@argus/shared-ui/src/components/Shared/Form'

const SystemChecks = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { getAllKvsByDataset } = useContext(CommonContext)
  const { platformLabels } = useContext(ControlContext)

  const [search, setSearch] = useState('')

  async function getAllSystems() {
    return new Promise((resolve, reject) => {
      getAllKvsByDataset({
        _dataset: DataSets.SYSTEM_CHECKS,
        callback: result => {
          if (result) resolve(result)
          else reject()
        }
      })
    })
  }

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
    const systemCheckData = await getAllSystems()

    const checkedSystems = await getRequest({
      extension: SystemRepository.SystemChecks.qry,
      parameters: `_scope=1`
    })

    const mergedSYCheckedList = systemCheckData.map(systemCheckItem => {
      const item = {
        checkId: systemCheckItem.key,
        checkName: systemCheckItem.value,
        checked: false,
        value: false
      }
      const matchingTemplate = checkedSystems.list.find(y => item.checkId == y.checkId)
      matchingTemplate && (item.checked = true)
      matchingTemplate && (item.value = true)

      return item
    })

    return { list: mergedSYCheckedList }
  }

  const columns = [
    {
      field: 'checkId',
      headerName: _labels.checkId,
      flex: 1
    },
    {
      field: 'checkName',
      headerName: _labels.checkName,
      flex: 1
    }
  ]

  const filteredData = search
    ? data?.list?.filter(
        item =>
          item.checkId.toString().includes(search.toLowerCase()) ||
          (item.checkName && item.checkName.toLowerCase().includes(search.toLowerCase()))
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
    checkedObjects.forEach(obj => {
      obj.scope = 1
      obj.masterId = 0
      obj.value = true
    })

    const resultObject = {
      scope: 1,
      masterId: 0,
      items: checkedObjects
    }

    await postRequest({
      extension: SystemRepository.SystemChecks.set,
      record: JSON.stringify(resultObject)
    }).then(() => {
      toast.success(platformLabels.Updated)
    })
  }

  return (
    <Form onSave={handleSubmit} maxAccess={access} fullSize>
      <VertLayout>
        <Fixed>
          <Grid container xs={12} m={1}>
            <Grid item xs={3}>
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
            rowId={['checkId']}
            isLoading={false}
            maxAccess={access}
            showCheckboxColumn={true}
            handleCheckedRows={() => {}}
            pagination={false}
          />
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default SystemChecks
