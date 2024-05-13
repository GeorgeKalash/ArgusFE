import { Box } from '@mui/material'
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

const UsersTab = ({ labels, maxAccess, recordId }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)

  //const [allUsers, setAllUsers] = useState([])
  const [selectedUsers, setSelectedUsers] = useState([])
  const { stack } = useWindow()

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
    onSubmit: values => {
      postUsers()
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
    endpointId: AccessControlRepository.SecurityGroup.qry,
    datasetId: ResourceIds.SecurityGroup
  })

  async function fetchGridData() {
    return await getRequest({
      extension: AccessControlRepository.SecurityGroupUser.qry,
      parameters: `_userId=0&_filter=&_sgId=${recordId}`
    })
  }

  const handleListsDataChange = (allData, selectedData) => {
    // Update the state in the parent component when the child component data changes
    //  setAllUsers(allData)
    //setSelectedUsers(selectedData)
  }

  const postUsers = async () => {
    console.log('selectedUsers ', initialSelectedListData)

    /*const selectedItems = []
    initialSelectedListData.forEach(item => {
      selectedItems.push({ sgId: recordId, userId: item.id })
    })

    const data = {
      sgId: recordId,
      userId: 0,
      groups: selectedItems
    }

    const res = await postRequest({
      extension: AccessControlRepository.SecurityGroupUser.set2,
      record: JSON.stringify(data)
    })
    if (res.recordId) {
      invalidate()
      toast.success('Record Updated Successfully')
    }*/
  }

  const del = async obj => {
    await postRequest({
      extension: AccessControlRepository.SecurityGroupUser.del,
      record: JSON.stringify(obj)
    })
    toast.success('Record Deleted Successfully')
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

      //setSelectedUsers(selectedList)

      // Remove items from allList that have the same sgId and userId as items in selectedList
      const filteredAllList = allList.filter(item => {
        return !selectedList.some(selectedItem => selectedItem.id === item.id && selectedItem.id === item.id)
      })

      //setAllUsers(filteredAllList)

      stack({
        Component: ItemSelectorWindow,
        props: {
          itemSelectorLabels: _labels,
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
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}
      >
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
      </Box>
    </>
  )
}

export default UsersTab
