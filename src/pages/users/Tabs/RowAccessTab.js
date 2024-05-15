import CustomComboBox from 'src/components/Inputs/CustomComboBox'
import Table from 'src/components/Shared/Table'
import { Grid, Box, Button } from '@mui/material'

const RowAccessTab = ({ maxAccess, labels }) => {
  onst[(moduleStore, setModuleStore)] = useState([])
  const [rowGridData, setRowGridData] = useState([])

  const rowColumns = [
    {
      field: 'name',
      headerName: '',
      flex: 2
    }
  ]

  const rowAccessValidation = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({}),
    initialValues: {
      recordId: '',
      name: '',
      hasAccess: false
    },
    onSubmit: values => {
      postRowAccess()
    }
  })

  const handleRowAccessSubmit = () => {
    if (rowAccessValidation) {
      rowAccessValidation.handleSubmit()
    }
  }

  const handleCheckedRows = checkedRows => {
    console.log('hanle checked rows ', checkedRows)
  }

  const getRowAccessGridData = classId => {
    setRowGridData([])
    console.log('rowAccessUser class ', classId)

    classId = classId || 20110
    const userId = currentRecord

    console.log('rowAccessUser userId ', userId)

    const plantRequestPromise = getRequest({
      extension: SystemRepository.Plant.qry,
      parameters: '_filter='
    })

    const cashAccountRequestPromise = getRequest({
      extension: CashBankRepository.CashAccount.qry,
      parameters: '_filter=&_type=0'
    })

    const salesPersonRequestPromise = getRequest({
      extension: SaleRepository.SalesPerson.qry,
      parameters: '_filter='
    })

    const rowAccessUserPromise = getRequest({
      extension: AccessControlRepository.RowAccessUserView.qry,
      parameters: `_resourceId=${classId}&_userId=${userId}`
    })

    let rar = {
      recordId: null,
      name: null,
      hasAccess: false,
      classId: null
    }

    Promise.all([cashAccountRequestPromise, plantRequestPromise, salesPersonRequestPromise, rowAccessUserPromise]).then(
      ([cashAccountRequest, plantRequest, salesPersonRequest, rowAccessUser]) => {
        //Plant
        if (classId == 20110 || classId === 'undefined') {
          // Use map to transform each item in res.list
          rar = plantRequest.list.map(item => {
            // Create a new object for each item
            return {
              recordId: item.recordId,
              name: item.name,
              hasAccess: false
            }
          })
        }

        //Cash account
        else if (classId == 33102) {
          // Use map to transform each item in res.list
          rar = cashAccountRequest.list.map(item => {
            // Create a new object for each item
            return {
              recordId: item.recordId,
              name: item.name,
              hasAccess: false
            }
          })
        }

        //Sales Person
        else if (classId == 51201) {
          // Use map to transform each item in res.list
          rar = salesPersonRequest.list.map(item => {
            // Create a new object for each item
            return {
              recordId: item.recordId,
              name: item.name,
              hasAccess: false
            }
          })
        }

        console.log('rowAccessUser list ', rowAccessUser.list)
        if (classId !== 'undefined') {
          for (let i = 0; i < rar.length; i++) {
            let rowId = rar[i].recordId
            rowAccessUser.list.forEach(storedItem => {
              let storedId = storedItem.recordId.toString()
              if (storedId == rowId) {
                rar[i].hasAccess = true
              }
            })
          }

          let resultObject = { list: rar }
          setRowGridData(resultObject)
        }
      }
    )
  }

  const fillModuleStore = () => {
    getAllKvsByDataset({
      _dataset: DataSets.ROW_ACCESS,
      callback: setModuleStore
    })
  }

  const postRowAccess = () => {}

  return (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <Grid container spacing={2} alignItems='center'>
          <Grid item xs={6}>
            <CustomComboBox
              label={labels.rowAccess}
              valueField='key'
              displayField='value'
              store={moduleStore}
              name='classId'
              value={
                (Array.isArray(moduleStore) &&
                  moduleStore.filter(item => item.key === rowAccessValidation.values?.classId)[0]) ||
                moduleStore[0]
              } // Select the first value if there's no match
              maxAccess={maxAccess}
              onChange={(event, newValue) => {
                rowAccessValidation.setFieldValue('classId', newValue?.key)
                getRowAccessGridData(newValue?.key)
              }}
              error={rowAccessValidation.touched.classId && Boolean(rowAccessValidation.errors.classId)}
              helperText={rowAccessValidation.touched.classId && rowAccessValidation.errors.classId}
            />
          </Grid>
          <Grid item xs={6} container spacing={1} alignItems='center' justifyContent='flex-start'>
            <Button variant='contained' color='primary'>
              Check All
            </Button>
            <Button variant='contained' color='secondary' sx={{ marginLeft: 2 }}>
              Uncheck All
            </Button>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12} sx={{ pt: 2 }}>
        <Box>
          <Table
            columns={rowColumns}
            gridData={rowGridData}
            rowId={['recordId']}
            isLoading={false}
            maxAccess={maxAccess}
            pagination={false}
            height={300}
            handleCheckedRows={handleCheckedRows}
            checkTitle={labels.active}
            showCheckboxColumn={true}
          />
        </Box>
      </Grid>
    </Grid>
  )
}

export default RowAccessTab
