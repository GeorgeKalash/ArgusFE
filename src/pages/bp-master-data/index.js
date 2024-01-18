// ** React Importsport
import { useEffect, useState, useContext } from 'react'

// ** MUI Imports
import { Box } from '@mui/material'

// ** Third Party Imports
import { useFormik } from 'formik'
import * as yup from 'yup'
import toast from 'react-hot-toast'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'
import { BusinessPartnerRepository } from 'src/repositories/BusinessPartnerRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { getNewRelation, populateRelation } from 'src/Models/BusinessPartner/Relation'
import { getNewAddress, populateAddress } from 'src/Models/System/Address'
import { ResourceIds } from 'src/resources/ResourceIds'
import { ControlContext } from 'src/providers/ControlContext'

// ** Windows
import BPMasterDataWindow from './Windows/BPMasterDataWindow'
import BPRelationWindow from './Windows/BPRelationWindow'
import AddressWindow from 'src/components/Shared/AddressWindow'

// ** Helpers
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import useResourceParams from 'src/hooks/useResourceParams'

const BPMasterData = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)

  //What should be placed for most pages
  const [tableData, setTableData] = useState([])
  const [selectedRecordId, setSelectedRecordId] = useState(null)

  const { labels: _labels, access } = useResourceParams({
    datasetId: ResourceIds.BPMasterData
  })

  const columns = [
    {
      field: 'reference',
      headerName: _labels.reference,
      flex: 1
    },
    {
      field: 'groupName',
      headerName: _labels.group,
      flex: 1
    },
    ,
    {
      field: 'name',
      headerName: _labels.name,
      flex: 1
    },
    {
      field: 'flName',
      headerName: _labels.foreignLanguage,
      flex: 1
    },
    {
      field: 'nationalityRef',
      headerName: _labels.nationalityRef,
      flex: 1
    },
    {
      field: 'nationalityName',
      headerName: _labels.nationalityName,
      flex: 1
    },
    {
      field: 'legalStatus',
      headerName: _labels.legalStatus,
      flex: 1
    }
  ]

  const add = () => {
    setWindowOpen(true)
  }

  const edit = obj => {
    setSelectedRecordId(obj.recordId)
    setWindowOpen(true)
  }

  const del = obj => {
    postRequest({
      extension: BusinessPartnerRepository.MasterData.del,
      record: JSON.stringify(obj)
    })
      .then(res => {
        getGridData({})
        toast.success('Record Deleted Successfully')
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  useEffect(() => {
    if (access?.record?.maxAccess > 0) {
      getGridData({ _startAt: 0, _pageSize: 50 })
    }
  }, [access])

  // End

  //stores
  const [relationGridData, setRelationGridData] = useState([])

  const [addressGridData, setAddressGridData] = useState([]) //for address tab
  //states
  const [windowOpen, setWindowOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [defaultValue, setdefaultValue] = useState(null)

  const [relationWindowOpen, setRelationWindowOpen] = useState(false)

  const [addressWindowOpen, setAddressWindowOpen] = useState(false)
  const [addressEditMode, setAddressEditMode] = useState(false)

  const getGridData = ({ _startAt = 0, _pageSize = 50 }) => {
    const defaultParams = `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=&_sortBy=reference desc`
    var parameters = defaultParams

    getRequest({
      extension: BusinessPartnerRepository.MasterData.qry,
      parameters: parameters
    })
      .then(res => {
        setTableData(res)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const filterIdCategory = async categId => {
    try {
      const res = await getRequest({
        extension: BusinessPartnerRepository.CategoryID.qry,
        parameters: `_startAt=0&_pageSize=1000`
      })

      return categId
        ? res.list.filter(
            item => (categId === 1 && item.person) || (categId === 2 && item.org) || (categId === 3 && item.group)
          )
        : []
    } catch (error) {
      setErrorMessage(error.res)

      return []
    }
  }

  const getDefault = obj => {
    const bpId = obj.recordId
    const incId = obj.defaultInc
    var parameters = `_bpId=${bpId}&_incId=${incId}`

    getRequest({
      extension: BusinessPartnerRepository.MasterIDNum.get,
      parameters: parameters
    })
      .then(res => {
        if (res.record && res.record.idNum != null) {
          setdefaultValue(res.record.idNum)
        }
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  // IDNumber TAB
  const idNumberGridColumn = [
    {
      field: 'textfield',
      header: _labels.idCategory,
      name: 'incName',
      readOnly: true
    },
    {
      id: 1,
      field: 'textfield',
      header: _labels.idNumber,
      name: 'idNum'
    }
  ]

  const idNumberValidation = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    initialValues: {
      rows: [
        {
          bpId: selectedRecordId || '',
          incId: '',
          idNum: '',
          incName: ''
        }
      ]
    },
    onSubmit: values => {
      postIdNumber(values.rows)
    }
  })

  const postIdNumber = obj => {
    const recordId = bpMasterDataValidation.values.recordId

    const postBody = Object.entries(obj).map(([key, value]) => {
      return postRequest({
        extension: BusinessPartnerRepository.MasterIDNum.set,
        record: JSON.stringify(value)
      })
    })
    Promise.all(postBody)
      .then(() => {
        if (!recordId) {
          toast.success('Record Added Successfully')
        } else {
          toast.success('Record Edited Successfully')
        }
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const resetIdNumber = id => {
    idNumberValidation.resetForm()
    idNumberValidation.setValues({
      rows: [
        {
          bpId: id ? id : bpMasterDataValidation.values ? bpMasterDataValidation.values.recordId : '',
          incId: '',
          incName: '',
          idNum: ''
        }
      ]
    })
  }

  const fillIdNumberStore = async obj => {
    try {
      const _recordId = obj.recordId
      const defaultParams = `_bpId=${_recordId}`
      var parameters = defaultParams

      const res = await getRequest({
        extension: BusinessPartnerRepository.MasterIDNum.qry,
        parameters: parameters
      })
      const list = await filterIdCategory(obj.category)

      var listMIN = res.list.filter(y => {
        return list.some(x => x.name === y.incName)
      })

      if (listMIN.length > 0) {
        idNumberValidation.setValues({ rows: listMIN })
      } else {
        idNumberValidation.setValues({
          rows: [
            {
              bpId: _recordId,
              incId: '',
              incName: '',
              idNum: ''
            }
          ]
        })
      }
    } catch (error) {
      setErrorMessage(error)
    }
  }

  //Relation Tab
  const relationValidation = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      toBPId: yup.string().required('This field is required'),
      relationId: yup.string().required('This field is required')
    }),
    onSubmit: values => {
      console.log('relation values ' + JSON.stringify(values))
      postRelation(values)
    }
  })

  const addRelation = () => {
    relationValidation.setValues(getNewRelation(bpMasterDataValidation.values.recordId))
    setRelationWindowOpen(true)
  }

  const popupRelation = obj => {
    getRelationById(obj)
  }

  const getRelationGridData = bpId => {
    setRelationGridData([])
    const defaultParams = `_bpId=${bpId}`
    var parameters = defaultParams

    getRequest({
      extension: BusinessPartnerRepository.Relation.qry,
      parameters: parameters
    })
      .then(res => {
        setRelationGridData(res)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const postRelation = obj => {
    const recordId = obj.recordId
    const bpId = obj.bpId ? obj.bpId : bpMasterDataValidation.values.recordId
    obj.fromBPId = bpId
    postRequest({
      extension: BusinessPartnerRepository.Relation.set,
      record: JSON.stringify(obj)
    })
      .then(res => {
        if (!recordId) {
          toast.success('Record Added Successfully')
        } else toast.success('Record Editted Successfully')

        setRelationWindowOpen(false)
        getRelationGridData(bpId)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const getRelationById = obj => {
    const _recordId = obj.recordId
    const defaultParams = `_recordId=${_recordId}`
    var parameters = defaultParams
    getRequest({
      extension: BusinessPartnerRepository.Relation.get,
      parameters: parameters
    })
      .then(res => {
        console.log('get ' + JSON.stringify())
        relationValidation.setValues(populateRelation(res.record))
        setRelationWindowOpen(true)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const handleRelationSubmit = () => {
    relationValidation.handleSubmit()
  }

  const delRelation = obj => {
    const bpId = obj.bpId ? obj.bpId : bpMasterDataValidation.values.recordId
    postRequest({
      extension: BusinessPartnerRepository.Relation.del,
      record: JSON.stringify(obj)
    })
      .then(res => {
        toast.success('Record Deleted Successfully')
        getRelationGridData(bpId)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  useEffect(() => {
    if (access?.record?.maxAccess > 0) {
      getGridData({ _startAt: 0, _pageSize: 50 })
    }
  }, [access])

  // Address Tab

  const addressValidation = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      name: yup.string().required('This field is required'),
      countryId: yup.string().required('This field is required'),
      stateId: yup.string().required('This field is required'),
      street1: yup.string().required('This field is required'),
      phone: yup.string().required('This field is required'),
      cityId: yup.string().required('This field is required')
    }),
    onSubmit: values => {
      console.log('addressVal:')
      console.log(values)
      postAddress(values)
    }
  })

  const postAddress = obj => {
    console.log(obj)
    const bpId = bpMasterDataValidation.values.recordId
    postRequest({
      extension: SystemRepository.Address.set,
      record: JSON.stringify(obj)
    })
      .then(res => {
        console.log(res.recordId)
        obj.recordId = res.recordId
        addressValidation.setFieldValue('recordId', obj.recordId)
        setAddressWindowOpen(false)

        //post BPAddress
        const object = obj //we add bill to and ship to to validation
        object.addressId = addressValidation.values.recordId
        object.bpId = bpId
        console.log('object')
        console.log(object)
        postRequest({
          extension: BusinessPartnerRepository.BPAddress.set,
          record: JSON.stringify(object)
        })
          .then(bpResponse => {
            getAddressGridData(bpId)
          })
          .catch(error => {
            setErrorMessage(error)
          })

        //bill to and ship to are with formik (hidden or not from security grps)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const getAddressGridData = bpId => {
    setAddressGridData([])
    const defaultParams = `_bpId=${bpId}`
    var parameters = defaultParams
    getRequest({
      extension: BusinessPartnerRepository.BPAddress.qry,
      parameters: parameters
    })
      .then(res => {
        console.log('grid')
        console.log(res) //address is complex object so data are not appearing in grid setAddressGridData(res).. should find solution
        res.list = res.list.map(row => (row = row.address)) //sol
        console.log(res)
        setAddressGridData(res)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const delAddress = obj => {
    //talk about problem of getting only address body: create empty object or keep this full body??
    console.log(obj)
    const bpId = bpMasterDataValidation.values.recordId
    obj.bpId = bpId
    obj.addressId = obj.recordId
    console.log(obj)
    postRequest({
      extension: BusinessPartnerRepository.BPAddress.del,
      record: JSON.stringify(obj)
    })
      .then(res => {
        toast.success('Record Deleted Successfully')
        getAddressGridData(bpId)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const addAddress = () => {
    addressValidation.setValues(getNewAddress) //bpId is then added to object on save..
    setAddressWindowOpen(true)
  }

  const editAddress = obj => {
    console.log(obj)
    getAddressById(obj)
  }

  const getAddressById = obj => {
    const _bpId = bpMasterDataValidation.values.recordId

    const defaultParams = `_recordId=${obj.recordId}` //addressId the object i am getting was the bpAddress
    // after modifying list it is normal address so i send obj.recordId
    const bpAddressDefaultParams = `_addressId=${obj.recordId}&_bpId=${_bpId}`
    var parameters = defaultParams
    getRequest({
      extension: SystemRepository.Address.get,
      parameters: parameters
    })
      .then(res => {
        console.log(res.record)
        addressValidation.setValues(populateAddress(res.record))
        setAddressEditMode(true)
        setAddressWindowOpen(true)

        getRequest({
          extension: BusinessPartnerRepository.BPAddress.get,
          parameters: bpAddressDefaultParams
        })
          .then(res => {
            console.log(res.record)

            //addressValidation.setValues(populateAddress(res.record)) put in address validation shipto and billto
            //buttons
          })
          .catch(error => {
            setErrorMessage(error)
          })
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const handleAddressSubmit = () => {
    addressValidation.handleSubmit()
  }

  return (
    <>
      <Box>
        <GridToolbar onAdd={add} maxAccess={access} />
        <Table
          columns={columns}
          gridData={tableData}
          rowId={['recordId']}
          api={getGridData}
          onEdit={edit}
          onDelete={del}
          isLoading={false}
          pageSize={50}
          paginationType='client'
          maxAccess={access}
        />
      </Box>
      {windowOpen && (
        <BPMasterDataWindow
          onClose={() => {
            setWindowOpen(false)
            setSelectedRecordId(null)
          }}
          recordId={selectedRecordId}
          labels={_labels}
          maxAccess={access}
          defaultValue={defaultValue}
          idNumberGridColumn={idNumberGridColumn}
          idNumberValidation={idNumberValidation}
          relationGridData={relationGridData}
          getRelationGridData={getRelationGridData}
          delRelation={delRelation}
          addRelation={addRelation}
          popupRelation={popupRelation}
          addressGridData={addressGridData}
          getAddressGridData={getAddressGridData}
          addAddress={addAddress}
          delAddress={delAddress}
          editAddress={editAddress}
        />
      )}

      {relationWindowOpen && (
        <BPRelationWindow
          onClose={() => setRelationWindowOpen(false)}
          onSave={handleRelationSubmit}
          relationValidation={relationValidation}
          labels={_labels}
          maxAccess={access}
        />
      )}
      {addressWindowOpen && (
        <AddressWindow
          onClose={() => setAddressWindowOpen(false)}
          onSave={handleAddressSubmit}
          addressValidation={addressValidation}
          maxAccess={access}
          labels={_labels}
          width={600}
          height={400}
        />
      )}

      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default BPMasterData
