import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useContext, useEffect, useState } from 'react'
import AddressGridTab from 'src/components/Shared/AddressGridTab'
import { useWindow } from 'src/windows'
import { ControlContext } from 'src/providers/ControlContext'
import ClientsAddressForm from './ClientsAddressForm'
import { SaleRepository } from 'src/repositories/SaleRepository'

const AddressTab = ({ store, maxAccess, labels, editMode, ...props }) => {
  const { recordId } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const [addressGridData, setAddressGridData] = useState([])
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)

  const getAddressGridData = recordId => {
    setAddressGridData([])

    const defaultParams = `_params=1|${recordId}`
    var parameters = defaultParams

    getRequest({
      extension: SaleRepository.Address.qry,
      parameters: parameters
    }).then(res => {
      res.list = res.list.map(row => (row = row.address))
      setAddressGridData(res)
    })
  }

  const delAddress = obj => {
    const clientId = recordId
    obj.clientId = clientId
    obj.addressId = obj.recordId
    postRequest({
      extension: SaleRepository.Address.del,
      record: JSON.stringify(obj)
    }).then(res => {
      toast.success(platformLabels.Deleted)
      getAddressGridData(clientId)
    })
  }

  function addAddress() {
    openForm()
  }

  function openForm(id) {
    stack({
      Component: ClientsAddressForm,
      props: {
        _labels: labels,
        maxAccess,
        editMode,
        recordId: id,
        clientId: recordId,
        getAddressGridData: getAddressGridData
      },
      width: 600,
      height: 500,
      title: labels.address
    })
  }

  const editAddress = obj => {
    openForm(obj.recordId)
  }

  useEffect(() => {
    recordId && getAddressGridData(recordId)
  }, [recordId])

  const columns = [
    {
      field: 'city',
      headerName: labels.city,
      flex: 1
    },
    {
      field: 'street1',
      headerName: labels.street1,
      flex: 1
    }
  ]

  return (
    <AddressGridTab
      addressGridData={addressGridData}
      addAddress={addAddress}
      delAddress={delAddress}
      editAddress={editAddress}
      labels={labels}
      columns={columns}
      maxAccess={maxAccess}
      {...props}
    />
  )
}

export default AddressTab
