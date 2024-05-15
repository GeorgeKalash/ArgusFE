// ** MUI Imports
import { Box } from '@mui/material'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'

const SecurityGrpTab = ({ labels, maxAccess }) => {
  const [securityGrpWindowOpen, setSecurityGrpWindowOpen] = useState(false)
  const [securityGrpGridData, setSecurityGrpGridData] = useState([])
  const [initialAllListData, setSecurityGrpALLData] = useState([])
  const [initialSelectedListData, setSecurityGrpSelectedData] = useState([])

  const securityGrpValidation = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({}),
    initialValues: {
      sgId: '',
      sgName: '',
      userId: ''
    },
    onSubmit: values => {
      postSecurityGrp()
    }
  })

  const columns = [
    {
      field: 'sgName',
      headerName: labels.group,
      flex: 1
    }
  ]

  const handleSecurityGrpSubmit = () => {
    if (securityGrpValidation) {
      securityGrpValidation.handleSubmit()
    }
  }

  const getSecurityGrpGridData = userId => {
    setSecurityGrpGridData([])
    const defaultParams = `_userId=${userId}&_filter=&_sgId=0`
    var parameters = defaultParams

    getRequest({
      extension: AccessControlRepository.SecurityGroupUser.qry,
      parameters: parameters
    })
      .then(res => {
        setSecurityGrpGridData(res)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const addSecurityGrp = () => {
    try {
      setSecurityGrpALLData([])
      setSecurityGrpSelectedData([])

      const userId = usersValidation.values.recordId
      const defaultParams = `_filter=&_size=100&_startAt=0&_userId=${userId}&_pageSize=50&_sgId=0`
      var parameters = defaultParams

      const GrpRequest = getRequest({
        extension: AccessControlRepository.SecurityGroup.qry,
        parameters: parameters
      })

      const GUSRequest = getRequest({
        extension: AccessControlRepository.SecurityGroupUser.qry,
        parameters: parameters
      })

      Promise.all([GrpRequest, GUSRequest]).then(([resGRPFunction, resGUSTemplate]) => {
        const allList = resGRPFunction.list.map(x => {
          const n = {
            id: x.recordId,
            name: x.name
          }

          return n
        })

        const selectedList = resGUSTemplate.list.map(x => {
          const n2 = {
            id: x.sgId,
            name: x.sgName
          }

          return n2
        })
        setSecurityGrpSelectedData(selectedList)

        // Remove items from allList that have the same sgId and userId as items in selectedList
        const filteredAllList = allList.filter(item => {
          return !selectedList.some(selectedItem => selectedItem.id === item.id && selectedItem.id === item.id)
        })
        setSecurityGrpALLData(filteredAllList)
      })
      setSecurityGrpWindowOpen(true)
    } catch (error) {
      setErrorMessage(error.res)

      return Promise.reject(error) // You can choose to reject the promise if an error occurs
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleListsDataChange = (allData, selectedData) => {
    // Update the state in the parent component when the child component data changes
    setSecurityGrpALLData(allData)
    setSecurityGrpSelectedData(selectedData)
  }

  const postSecurityGrp = () => {
    const userId = usersValidation.values.recordId
    const selectedItems = []

    //initialSelectedListData returns an array that contain id, where id is sgId
    //so we add selectedItems array that loops on initialSelectedListData & pass userId beside sgId to each object (this new array will be sent to set2GUS)
    initialSelectedListData.forEach(item => {
      selectedItems.push({ userId: userId, sgId: item.id })
    })

    const data = {
      sgId: 0,
      userId: userId,
      groups: selectedItems
    }

    postRequest({
      extension: AccessControlRepository.SecurityGroupUser.set2,
      record: JSON.stringify(data)
    })
      .then(res => {
        setSecurityGrpWindowOpen(false)
        getSecurityGrpGridData(userId)
        if (!res.recordId) {
          toast.success('Record Added Successfully')
        } else {
          toast.success('Record Edited Successfully')
        }
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const delSecurityGrp = obj => {
    const userId = usersValidation.values.recordId

    postRequest({
      extension: AccessControlRepository.SecurityGroupUser.del,
      record: JSON.stringify(obj)
    })
      .then(res => {
        toast.success('Record Deleted Successfully')
        getSecurityGrpGridData(userId)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={addSecurityGrp} maxAccess={maxAccess} />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={securityGrpGridData}
          rowId={['sgId']}
          api={getSecurityGrpGridData}
          onEdit={popupSecurityGrp}
          onDelete={delSecurityGrp}
          isLoading={false}
          maxAccess={maxAccess}
          pagination={false}
        />
      </Grow>
    </VertLayout>
  )
}

export default SecurityGrpTab
