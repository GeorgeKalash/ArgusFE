import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useContext } from 'react'
import AddressGridTab from '@argus/shared-ui/src/components/Shared/AddressGridTab'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { PurchaseRepository } from '@argus/repositories/src/repositories/PurchaseRepository'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import AddressForm from '@argus/shared-ui/src/components/Shared/AddressForm'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'

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
        datasetId: ResourceIds.ADDPuVendors,
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

  const addressGridData = { ...data, list: (data?.list || []).map(row => row.address) }

  return (
    <AddressGridTab
      addressGridData={addressGridData}
      paginationParameters={paginationParameters}
      addAddress={addAddress}
      delAddress={delAddress}
      editAddress={editAddress}
      datasetId={ResourceIds.ADDPuVendors}
      refetch={refetch}
      {...props}
    />
  )
}

export default VendorsAddressGrid
