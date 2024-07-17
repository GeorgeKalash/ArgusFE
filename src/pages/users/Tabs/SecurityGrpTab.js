import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useWindow } from 'src/windows'
import ItemSelectorWindow from 'src/components/Shared/ItemSelectorWindow'
import { useContext, useState } from 'react'
import { AccessControlRepository } from 'src/repositories/AccessControlRepository'
import { RequestsContext } from 'src/providers/RequestsContext'
import toast from 'react-hot-toast'
import { ControlContext } from 'src/providers/ControlContext'

const SecurityGrpTab = ({ labels, maxAccess, storeRecordId, window }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const [initialAllListData, setSecurityGrpALLData] = useState([])
  const [initialSelectedListData, setSecurityGrpSelectedData] = useState([])
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)

  const columns = [
    {
      field: 'sgName',
      headerName: labels.group,
      flex: 1
    }
  ]

  const { formik } = useForm({
    enableReinitialize: true,
    validateOnChange: true,
    initialValues: {
      sgId: '',
      sgName: '',
      userId: ''
    },
    onSubmit: async values => {
      const selectedItems = []
      initialSelectedListData.forEach(item => {
        selectedItems.push({ userId: storeRecordId, sgId: item.id })
      })

      const data = {
        sgId: 0,
        userId: storeRecordId,
        groups: selectedItems
      }

      await postRequest({
        extension: AccessControlRepository.SecurityGroupUser.set2,
        record: JSON.stringify(data)
      })
      invalidate()
      toast.success(platformLabels.Added)
      window.close()
    }
  })

  const invalidate = useInvalidate({
    endpointId: AccessControlRepository.SecurityGroupUser.qry
  })

  const {
    query: { data },
    labels: _labels
  } = useResourceQuery({
    queryFn: fetchGridData,
    enabled: Boolean(storeRecordId),
    endpointId: AccessControlRepository.SecurityGroupUser.qry,
    datasetId: ResourceIds.Users
  })

  async function fetchGridData() {
    if (!storeRecordId) {
      return { list: [] }
    }

    return await getRequest({
      extension: AccessControlRepository.SecurityGroupUser.qry,
      parameters: `_userId=${storeRecordId}&_filter=&_sgId=0`
    })
  }

  const handleListsDataChange = (allData, selectedData) => {
    setSecurityGrpALLData(allData)
    setSecurityGrpSelectedData(selectedData)
  }

  const add = () => {
    const GrpRequest = getRequest({
      extension: AccessControlRepository.SecurityGroup.qry,
      parameters: `_filter=&_size=100&_startAt=0&_userId=${storeRecordId}&_pageSize=50&_sgId=0`
    })

    const GUSRequest = getRequest({
      extension: AccessControlRepository.SecurityGroupUser.qry,
      parameters: `_filter=&_size=100&_startAt=0&_userId=${storeRecordId}&_pageSize=50&_sgId=0`
    })

    Promise.all([GrpRequest, GUSRequest]).then(([resGRPFunction, resGUSFunction]) => {
      const allList = resGRPFunction.list.map(x => {
        const n = {
          id: x.recordId,
          name: x.name
        }

        return n
      })

      const selectedList = resGUSFunction.list.map(x => {
        const n2 = {
          id: x.sgId,
          name: x.sgName
        }

        return n2
      })

      const filteredAllList = allList.filter(item => {
        return !selectedList.some(selectedItem => selectedItem.id === item.id && selectedItem.id === item.id)
      })
      setSecurityGrpSelectedData(selectedList)
      setSecurityGrpALLData(filteredAllList)

      stack({
        Component: ItemSelectorWindow,
        props: {
          itemSelectorLabels: { title1: _labels.all, title2: _labels.selected },
          initialAllListData: filteredAllList,
          initialSelectedListData: selectedList,
          handleListsDataChange: handleListsDataChange,
          formik: formik
        },
        width: 600,
        height: 600,
        title: _labels.securityGroups
      })
    })
  }

  const del = async obj => {
    await postRequest({
      extension: AccessControlRepository.SecurityGroupUser.del,
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
          columns={columns}
          gridData={data ? data : { list: [] }}
          rowId={['sgId']}
          onDelete={del}
          isLoading={false}
          maxAccess={maxAccess}
          pagination={false}
        />
      </Grow>
    </VertLayout>
  )
}

export default SecurityGrpTab
