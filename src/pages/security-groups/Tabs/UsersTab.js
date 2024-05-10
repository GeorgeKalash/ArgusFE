// ** MUI Imports
import { Box } from '@mui/material'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'

const UsersTab = ({ usersGridData, labels, maxAccess }) => {
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

  const usersValidation = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({}),
    initialValues: {
      sgId: '',
      fullName: '',
      userId: ''
    },
    onSubmit: values => {
      postUsers()
    }
  })

  const getUsersGridData = sgId => {
    setUsersGridData([])
    const defaultParams = `_userId=0&_filter=&_sgId=${sgId}`
    var parameters = defaultParams

    getRequest({
      extension: AccessControlRepository.SecurityGroupUser.qry,
      parameters: parameters
    })
      .then(res => {
        setUsersGridData(res)
      })
      .catch(error => {})
  }

  const handleListsDataChange = (allData, selectedData) => {
    // Update the state in the parent component when the child component data changes
    setAllUsers(allData)
    setSelectedUsers(selectedData)
  }

  const postUsers = () => {
    const sgId = groupInfoValidation.values.recordId
    const selectedItems = []

    //initialSelectedListData returns an array that contain id, where id is userId
    //so we add selectedItems array that loops on initialSelectedListData & pass sgId beside userId to each object (this new array will be sent to set2GUS)
    initialSelectedListData.forEach(item => {
      selectedItems.push({ sgId: sgId, userId: item.id })
    })

    const data = {
      sgId: sgId,
      userId: 0,
      groups: selectedItems
    }

    postRequest({
      extension: AccessControlRepository.SecurityGroupUser.set2,
      record: JSON.stringify(data)
    })
      .then(res => {
        getUsersGridData(sgId)
        if (!res.recordId) {
          toast.success('Record Added Successfully')
        } else {
          toast.success('Record Edited Successfully')
        }
      })
      .catch(error => {})
  }

  const delUsers = obj => {
    const sgId = groupInfoValidation.values.recordId

    postRequest({
      extension: AccessControlRepository.SecurityGroupUser.del,
      record: JSON.stringify(obj)
    })
      .then(res => {
        toast.success('Record Deleted Successfully')
        getUsersGridData(sgId)
      })
      .catch(error => {})
  }

  const addUsers = () => {
    try {
      setAllUsers([])
      setSelectedUsers([])

      const sgId = groupInfoValidation.values.recordId
      const defaultParams = `_filter=&_size=100&_startAt=0&_userId=0&_pageSize=50&_sgId=${sgId}`
      const usersDefaultParams = `_startAt=${0}&_pageSize=${50}&_size=${50}&_filter=&_sortBy=fullName`
      var parameters = defaultParams

      const USRequest = getRequest({
        extension: SystemRepository.Users.qry,
        parameters: usersDefaultParams
      })

      const GUSRequest = getRequest({
        extension: AccessControlRepository.SecurityGroupUser.qry,
        parameters: parameters
      })

      Promise.all([USRequest, GUSRequest]).then(([resUSFunction, resGUSTemplate]) => {
        const allList = resUSFunction.list.map(x => {
          const n = {
            id: x.recordId,
            name: x.fullName
          }

          return n
        })

        const selectedList = resGUSTemplate.list.map(x => {
          const n2 = {
            id: x.userId,
            name: x.fullName
          }

          return n2
        })
        setSelectedUsers(selectedList)

        // Remove items from allList that have the same sgId and userId as items in selectedList
        const filteredAllList = allList.filter(item => {
          return !selectedList.some(selectedItem => selectedItem.id === item.id && selectedItem.id === item.id)
        })
        setAllUsers(filteredAllList)
      })
    } catch (error) {
      return Promise.reject(error) // You can choose to reject the promise if an error occurs
    }
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
        <GridToolbar onAdd={addUsers} maxAccess={maxAccess} />
        <Table
          columns={columns}
          gridData={usersGridData}
          rowId={['userId']}
          api={getUsersGridData}
          onDelete={delUsers}
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
