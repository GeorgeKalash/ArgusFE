// ** Custom Imports
import CustomComboBox from 'src/components/Inputs/CustomComboBox'
import CustomLookup from 'src/components/Inputs/CustomLookup'

// ** MUI Imports
import { Grid } from '@mui/material'

const DefaultsTab = ({ labels, maxAccess }) => {
  const [siteStore, setSiteStore] = useState([])
  const [plantStore, setPlantStore] = useState([])
  const [cashAccStore, setCashAccStore] = useState([])
  const [salesPersonStore, setSalesPersonStore] = useState([])

  const defaultsValidation = useFormik({
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({}),
    initialValues: {
      siteId: '',
      plantId: '',
      spId: '',
      cashAccountId: '',
      cashAccountRef: '',
      cashAccountName: ''
    },
    onSubmit: values => {
      postDefaults(values)
    }
  })

  const postDefaults = obj => {
    const recordId = usersValidation.values.recordId
    const fields = ['cashAccountId', 'plantId', 'siteId', 'spId']

    const postField = field => {
      const request = {
        key: field,
        value: obj[field] !== null ? obj[field].toString() : null,
        userId: recordId
      }
      postRequest({
        extension: SystemRepository.UserDefaults.set,
        record: JSON.stringify(request)
      })
        .then(res => {})
        .catch(error => {
          setErrorMessage(error)
        })
    }
    fields.forEach(postField)
    getGridData({})
    setWindowOpen(true)
    if (!recordId) toast.success('Record Added Successfully')
    else toast.success('Record Edited Successfully')
  }

  const getDefaultsById = async obj => {
    try {
      const _recordId = obj.recordId
      const defaultParams = `_userId=${_recordId}`
      const parameters = defaultParams

      const res = await getRequest({
        extension: SystemRepository.UserDefaults.qry,
        parameters: parameters
      })

      const UserDocObject = {
        plantId: null,
        siteId: null,
        cashAccountId: null,
        cashAccountRef: null,
        cashAccountName: null,
        spId: null
      }

      await Promise.all(
        res.list.map(async x => {
          switch (x.key) {
            case 'plantId':
              UserDocObject.plantId = x.value ? parseInt(x.value) : null
              break
            case 'siteId':
              UserDocObject.siteId = x.value ? parseInt(x.value) : null
              break
            case 'cashAccountId':
              UserDocObject.cashAccountId = x.value ? parseInt(x.value) : null
              await getACC(UserDocObject.cashAccountId, UserDocObject)
              break
            case 'spId':
              UserDocObject.spId = x.value ? parseInt(x.value) : null
              break
            default:
              break
          }
        })
      )

      await defaultsValidation.setValues(UserDocObject)
    } catch (error) {
      setErrorMessage(error)
    }
  }

  const getACC = async (cashAccId, UserDocObject) => {
    if (cashAccId != null) {
      try {
        const defaultParams = `_recordId=${cashAccId}`
        const parameters = defaultParams

        const res = await getRequest({
          extension: CashBankRepository.CashAccount.get,
          parameters: parameters
        })
        UserDocObject.cashAccountRef = res.record.accountNo
        UserDocObject.cashAccountName = res.record.name

        return UserDocObject
      } catch (error) {
        setErrorMessage(error)
      }
    }
  }

  const fillSiteStore = () => {
    var parameters = `_filter=`
    getRequest({
      extension: InventoryRepository.Site.qry,
      parameters: parameters
    })
      .then(res => {
        setSiteStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error.response.data)
      })
  }

  const fillPlantStore = () => {
    var parameters = `_filter=`
    getRequest({
      extension: SystemRepository.Plant.qry,
      parameters: parameters
    })
      .then(res => {
        setPlantStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error.response.data)
      })
  }

  const fillSalesPersonStore = () => {
    var parameters = `_filter=`
    getRequest({
      extension: SaleRepository.SalesPerson.qry,
      parameters: parameters
    })
      .then(res => {
        setSalesPersonStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error.response.data)
      })
  }

  const lookupCashAcc = searchQry => {
    var parameters = `_size=50&_startAt=0&_filter=${searchQry}&_type=0`
    getRequest({
      extension: CashBankRepository.CashAccount.snapshot,
      parameters: parameters
    })
      .then(res => {
        setCashAccStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  return (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <CustomComboBox
          name='siteId'
          label={labels.site}
          valueField='recordId'
          displayField='name'
          columnsInDropDown={[
            { key: 'reference', value: 'Reference' },
            { key: 'name', value: 'Name' }
          ]}
          store={siteStore}
          value={siteStore.filter(item => item.recordId === defaultsValidation.values?.siteId)[0]}
          maxAccess={maxAccess}
          onChange={(event, newValue) => {
            defaultsValidation.setFieldValue('siteId', newValue?.recordId)
          }}
          error={defaultsValidation.touched.siteId && Boolean(defaultsValidation.errors.siteId)}
          helperText={defaultsValidation.touched.siteId && defaultsValidation.errors.siteId}
        />
      </Grid>
      <Grid item xs={12}>
        <CustomComboBox
          name='plantId'
          label={labels.plant}
          valueField='recordId'
          displayField='name'
          columnsInDropDown={[
            { key: 'reference', value: 'Reference' },
            { key: 'name', value: 'Name' }
          ]}
          store={plantStore}
          value={plantStore.filter(item => item.recordId === defaultsValidation.values?.plantId)[0]}
          maxAccess={maxAccess}
          onChange={(event, newValue) => {
            defaultsValidation.setFieldValue('plantId', newValue?.recordId)
          }}
          error={defaultsValidation.touched.plantId && Boolean(defaultsValidation.errors.plantId)}
          helperText={defaultsValidation.touched.plantId && defaultsValidation.errors.plantId}
        />
      </Grid>
      <Grid item xs={12}>
        <CustomLookup
          name='cashAccountId'
          value={defaultsValidation.values?.cashAccountId}
          label={labels.cashAcc}
          valueField='accountNo'
          displayField='name'
          store={cashAccStore}
          setStore={setCashAccStore}
          firstValue={defaultsValidation.values?.cashAccountRef}
          secondValue={defaultsValidation.values?.cashAccountName}
          onLookup={lookupCashAcc}
          onChange={(event, newValue) => {
            if (newValue) {
              defaultsValidation.setFieldValue('cashAccountId', newValue?.recordId)
              defaultsValidation.setFieldValue('cashAccountRef', newValue?.accountNo)
              defaultsValidation.setFieldValue('cashAccountName', newValue?.name)
            } else {
              defaultsValidation.setFieldValue('cashAccountId', null)
              defaultsValidation.setFieldValue('cashAccountRef', null)
              defaultsValidation.setFieldValue('cashAccountName', null)
            }
          }}
          error={defaultsValidation.touched.cashAccountId && Boolean(defaultsValidation.errors.cashAccountId)}
          helperText={defaultsValidation.touched.cashAccountId && defaultsValidation.errors.cashAccountId}
          maxAccess={maxAccess}
        />
      </Grid>
      <Grid item xs={12}>
        <CustomComboBox
          name='spId'
          label={labels.salesPerson}
          valueField='recordId'
          displayField='name'
          columnsInDropDown={[
            { key: 'spRef', value: 'Reference' },
            { key: 'name', value: 'Name' }
          ]}
          store={salesPersonStore}
          value={salesPersonStore.filter(item => item.recordId === defaultsValidation.values.spId)[0]}
          maxAccess={maxAccess}
          onChange={(event, newValue) => {
            defaultsValidation.setFieldValue('spId', newValue?.recordId)
          }}
          error={defaultsValidation.touched.spId && Boolean(defaultsValidation.errors.spId)}
          helperText={defaultsValidation.touched.spId && defaultsValidation.errors.spId}
        />
      </Grid>
    </Grid>
  )
}

export default DefaultsTab
