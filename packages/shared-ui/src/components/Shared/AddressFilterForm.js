import Table from '@argus/shared-ui/src/components/Shared/Table'
import { Button, Grid } from '@mui/material'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useContext, useEffect } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { SaleRepository } from '@argus/repositories/src/repositories/SaleRepository'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'
import Form from './Form'
import CustomButton from '@argus/shared-ui/src/components/Inputs/CustomButton'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'

export default function AddressFilterForm({
  labels,
  shipment = false,
  bill = false,
  deliveryOrder = false,
  form,
  handleAddressValues,
  checkedAddressId,
  window
}) {
  const { getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  useSetWindow({ title: platformLabels.AddressFilter, window })

  const { formik } = useForm({
    initialValues: { search: '', cityId: null, countryId: null },
    validateOnChange: true,
    onSubmit: async () => {
      const checkedADD = data?.list?.find(obj => obj.checked)
      if (!checkedADD?.addressId) {
        handleAddressValues({ shipAddress: '', BillAddress: '', address: '' })
        window.close()

        return
      }

      if (shipment || bill || deliveryOrder) {
        const address = await getAddress(checkedADD?.addressId)
        if (shipment)
          handleAddressValues({
            shipAddress: address,
            shipAddressId: checkedADD?.addressId,
            shipToAddressId: checkedADD?.addressId
          })

        if (bill)
          handleAddressValues({
            billAddress: address,
            billAddressId: checkedADD?.addressId,
            billToAddressId: checkedADD?.addressId
          })

        if (deliveryOrder) {
          handleAddressValues({
            address: address,
            addressId: checkedADD?.addressId
          })
        }
      }

      window.close()
    }
  })

  async function getAddress(addressId) {
    if (!addressId) return

    const res = await getRequest({
      extension: SystemRepository.Address.format,
      parameters: `_addressId=${addressId}`
    })

    return res?.record?.formattedAddress.replace(/(\r\n|\r|\n)+/g, '\r\n')
  }

  const rowColumns = [
    {
      field: 'address',
      headerName: '',
      flex: 6
    }
  ]

  const LoadAllAddresses = async (options = {}) => {
    const { _startAt = 0, _pageSize = 50 } = options

    const canSearch = !!formik.values.search && !!formik.values.countryId && !!formik.values.cityId && !!form.clientId

    const response = await getRequest({
      extension: canSearch ? SaleRepository.FilterAddress.snapshot : SaleRepository.Address.page,
      parameters: canSearch
        ? `_countryId=${formik.values.countryId}&_cityId=${formik.values.cityId}&_clientId=${form.clientId}&_filter=${formik.values.search}`
        : `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=1|${form.clientId}`
    })

    const list =
      response?.list?.map(item => ({
        addressId: item.addressId || item.recordId,
        address:
          item.formattedAddress ??
          `${item.name || ''}, ${item.street1 || ''}, ${item.street2 || ''}, ${item.city || ''}, ${item.phone || ''},${
            item.phone2 || ''
          },${item.email1 || ''}`,
        checked: (item.addressId || item.recordId) === checkedAddressId
      })) || []

    return {
      list,
      _startAt,
      count: list.length
    }
  }

  const {
    query: { data },
    paginationParameters,
    refetch
  } = useResourceQuery({
    queryFn: LoadAllAddresses,
    endpointId: SaleRepository.Address.page,
    datasetId: ResourceIds.Address
  })

  async function getDefaultCountry() {
    const res = await getRequest({
      extension: SystemRepository.Defaults.get,
      parameters: `_filter=&_key=countryId`
    })
    formik.setFieldValue('countryId', parseInt(res?.record?.value))
  }

  useEffect(() => {
    ;(async function () {
      await getDefaultCountry()
    })()
  }, [])

  return (
    <Form onSave={formik.handleSubmit}>
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.Country.qry}
                name='countryId'
                label={labels.country}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('cityId', '')
                  formik.setFieldValue('countryId', newValue?.recordId || null)
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <ResourceLookup
                endpointId={SystemRepository.City.snapshot}
                parameters={{
                  _countryId: formik.values.countryId,
                  _stateId: 0
                }}
                valueField='name'
                displayField='name'
                name='city'
                label={labels.city}
                form={formik}
                secondDisplayField={false}
                onChange={(event, newValue) => {
                  formik.setFieldValue('cityId', newValue?.recordId || null)
                  formik.setFieldValue('city', newValue?.name || null)
                }}
              />
            </Grid>

            <Grid item xs={6}>
              <CustomTextField
                name='search'
                value={formik.values.search}
                label={labels.search}
                onClear={() => {
                  formik.setFieldValue('search', '')
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    e.stopPropagation()
                  }
                }}
                onChange={formik.handleChange}
              />
            </Grid>

            <Grid item xs={2}>
              <CustomButton
                label={labels.apply}
                onClick={refetch}
                disabled={!(formik.values.countryId && formik.values.cityId)}
              />
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <Table
            name="addressFilterTable"
            columns={rowColumns}
            gridData={data}
            rowId={['addressId']}
            pageSize={50}
            paginationType='api'
            paginationParameters={paginationParameters}
            checkTitle={''}
            checkboxFlex={1}
            rowSelection='single'
            showCheckboxColumn={true}
            viewCheckButtons={true}
          />
        </Grow>
      </VertLayout>
    </Form>
  )
}

AddressFilterForm.width = 950
AddressFilterForm.height = 600
