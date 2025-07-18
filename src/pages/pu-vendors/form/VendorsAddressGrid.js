import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useContext } from 'react'
import AddressGridTab from 'src/components/Shared/AddressGridTab'
import { useWindow } from 'src/windows'
import { PurchaseRepository } from 'src/repositories/PurchaseRepository'
import { ControlContext } from 'src/providers/ControlContext'
import AddressForm from 'src/components/Shared/AddressForm'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'

const VendorsAddressGrid = ({ store, labels, editMode, ...props }) => {
  const { recordId } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)

  const fetchGridData = async (options = {}) => {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: PurchaseRepository.Address.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_vendorId=${recordId}`
    })

    return { ...response, _startAt }
  }

  const {
    query: { data, refetch },
    paginationParameters
  } = useResourceQuery({
    enabled: !!recordId,
    queryFn: fetchGridData,
    endpointId: PurchaseRepository.Address.page,
    datasetId: ResourceIds.Address
  })

  const delAddress = async obj => {
    const vendorId = recordId
    obj.vendorId = vendorId
    obj.addressId = obj.recordId
    await postRequest({
      extension: PurchaseRepository.Address.del,
      record: JSON.stringify(obj)
    })

    toast.success(platformLabels.Deleted)
    refetch()
  }

  function addAddress() {
    openForm('')
  }

  function openForm(recordId) {
    stack({
      Component: AddressForm,
      props: {
        recordId,
        isCleared: false,
        onSubmit: async (obj, window) => {
          if (obj) {
            const data = {
              vendorId: store.recordId,
              address: obj,
              addressId: obj.recordId
            }

            await postRequest({
              extension: PurchaseRepository.Address.set,
              record: JSON.stringify(data)
            })

            toast.success(obj.recordId ? platformLabels.Edited : platformLabels.Added)
            refetch()
            window.close()
          }
        }
      }
    })
  }

  const editAddress = obj => {
    openForm(obj.recordId)
  }

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

  const addressGridData = { ...data, list: (data?.list || []).map(row => row.address) }

  return (
    <AddressGridTab
      addressGridData={addressGridData}
      paginationParameters={paginationParameters}
      addAddress={addAddress}
      delAddress={delAddress}
      editAddress={editAddress}
      refetch={refetch}
      columns={columns}
      {...props}
    />
  )
}

export default VendorsAddressGrid
