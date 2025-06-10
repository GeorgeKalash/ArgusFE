import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useContext, useEffect, useState } from 'react'
import AddressGridTab from 'src/components/Shared/AddressGridTab'
import { useWindow } from 'src/windows'
import { ControlContext } from 'src/providers/ControlContext'
import ClientsAddressForm from './ClientsAddressForm'
import { SaleRepository } from 'src/repositories/SaleRepository'
import useResourceParams from 'src/hooks/useResourceParams'
import { ResourceIds } from 'src/resources/ResourceIds'
import useSetWindow from 'src/hooks/useSetWindow'

const AddressTab = ({ store, window, editMode, setStore, ...props }) => {
  const { recordId } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const [addressGridData, setAddressGridData] = useState([])
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)

  const { labels: labels, access: maxAccess } = useResourceParams({
    datasetId: ResourceIds.Address
  })

  useSetWindow({ title: labels.salesOrder, window })

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

  function openForm(recordId) {
    stack({
      Component: ClientsAddressForm,
      props: {
        _labels: labels,
        maxAccess,
        editMode,
        addressId: recordId,
        store,
        setStore,
        getAddressGridData
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
