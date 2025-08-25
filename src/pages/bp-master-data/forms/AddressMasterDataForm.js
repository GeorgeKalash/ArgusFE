import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useContext } from 'react'
import { BusinessPartnerRepository } from 'src/repositories/BusinessPartnerRepository'
import AddressGridTab from 'src/components/Shared/AddressGridTab'
import { useWindow } from 'src/windows'
import { ControlContext } from 'src/providers/ControlContext'
import AddressForm from 'src/components/Shared/AddressForm'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useResourceQuery } from 'src/hooks/resource'

const AddressMasterDataForm = ({ store, editMode, ...props }) => {
  const { recordId } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)

  const fetchGridData = async (options = {}) => {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: BusinessPartnerRepository.BPAddress.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_bpId=${recordId}`
    })

    return { ...response, _startAt }
  }

  const {
    query: { data, refetch },
    paginationParameters
  } = useResourceQuery({
    enabled: !!recordId,
    queryFn: fetchGridData,
    endpointId: BusinessPartnerRepository.BPAddress.page,
    datasetId: ResourceIds.Address
  })

  const delAddress = obj => {
    const bpId = recordId
    obj.bpId = bpId
    obj.addressId = obj.recordId
    postRequest({
      extension: BusinessPartnerRepository.BPAddress.del,
      record: JSON.stringify(obj)
    }).then(res => {
      toast.success(platformLabels.Deleted)

      refetch()
    })
  }

  function addAddress() {
    openForm()
  }

  async function openForm(addressId) {
    stack({
      Component: AddressForm,
      props: {
        recordId: addressId,
        isSavedClear: false,
        datasetId: ResourceIds.ADDBPMasterData,
        editMode,
        onSubmit: async (obj, window) => {
          obj.bpId = recordId
          await postRequest({
            extension: BusinessPartnerRepository.BPAddress.set,
            record: JSON.stringify(obj)
          })

          toast.success(!addressId ? platformLabels.Added : platformLabels.Edited)
          refetch()
          window.close()
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
      datasetId={ResourceIds.ADDBPMasterData}
      refetch={refetch}
      {...props}
    />
  )
}

export default AddressMasterDataForm
