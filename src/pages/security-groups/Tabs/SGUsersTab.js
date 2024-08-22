import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'
import { useForm } from 'src/hooks/form'
import * as yup from 'yup'
import { useContext, useState } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { AccessControlRepository } from 'src/repositories/AccessControlRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { useWindow } from 'src/windows'
import ItemSelectorWindow from 'src/components/Shared/ItemSelectorWindow'
import toast from 'react-hot-toast'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { ControlContext } from 'src/providers/ControlContext'

const SGUsersTab = ({ labels, maxAccess, storeRecordId }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const recordId = storeRecordId
  const [allUsers, setAllUsers] = useState([])
  const [selectedUsers, setSelectedUsers] = useState([])
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)

  const columns = [
    {
      field: 'fullName',
      headerName: labels.name,
      flex: 1
    },
    {
      field: 'email',
      headerName: labels.email,
      flex: 1
    }
  ]

  const { formik } = useForm({
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({}),
    initialValues: {
      sgId: recordId || 0,
      fullName: '',
      userId: ''
    },
    onSubmit: async values => {
      const selectedItems = []
      selectedUsers.forEach(item => {
        selectedItems.push({ sgId: recordId, userId: item.id })
      })

      const data = {
        sgId: recordId,
        userId: 0,
        groups: selectedItems
      }

      await postRequest({
        extension: AccessControlRepository.SecurityGroupUser.set2,
        record: JSON.stringify(data)
      })
      invalidate()
      toast.success(platformLabels.Added)
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
    enabled: Boolean(recordId),
    endpointId: AccessControlRepository.SecurityGroupUser.qry,
    datasetId: ResourceIds.SecurityGroup
  })

  async function fetchGridData() {
    if (!recordId) {
      return { list: [] }
    }

    return await getRequest({
      extension: AccessControlRepository.SecurityGroupUser.qry,
      parameters: `_userId=0&_filter=&_sgId=${recordId}`
    })
  }

  const handleListsDataChange = (allData, selectedData) => {
    setAllUsers(allData)
    setSelectedUsers(selectedData)
  }

  const del = async obj => {
    await postRequest({
      extension: AccessControlRepository.SecurityGroupUser.del,
      record: JSON.stringify(obj)
    })
    toast.success(platformLabels.Deleted)
    invalidate()
  }

  const add = () => {
    const USRequest = getRequest({
      extension: SystemRepository.Users.qry,
      parameters: `_startAt=${0}&_pageSize=${50}&_size=${50}&_filter=&_sortBy=fullName`
    })

    const GUSRequest = getRequest({
      extension: AccessControlRepository.SecurityGroupUser.qry,
      parameters: `_filter=&_size=100&_startAt=0&_userId=0&_pageSize=50&_sgId=${recordId}`
    })

    Promise.all([USRequest, GUSRequest]).then(([resUSFunction, resGUSFunction]) => {
      const allList = resUSFunction.list.map(x => {
        const n = {
          id: x.recordId,
          name: x.fullName
        }

        return n
      })

      const selectedList = resGUSFunction.list.map(x => {
        const n2 = {
          id: x.userId,
          name: x.fullName
        }

        return n2
      })

      const filteredAllList = allList.filter(item => {
        return !selectedList.some(selectedItem => selectedItem.id === item.id && selectedItem.id === item.id)
      })

      setSelectedUsers(selectedList)
      setAllUsers(filteredAllList)

      stack({
        Component: ItemSelectorWindow,
        props: {
          itemSelectorLabels: { title1: _labels.all, title2: _labels.inGroup },
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

  return (
    <VertLayout>
      <Grow>
        <GridToolbar onAdd={add} maxAccess={maxAccess} />
        <Table
          columns={columns}
          gridData={data ? data : { list: [] }}
          rowId={['userId']}
          onDelete={del}
          isLoading={false}
          maxAccess={maxAccess}
          pagination={false}
          height={300}
        />
      </Grow>
    </VertLayout>
  )
}

export default SGUsersTab
