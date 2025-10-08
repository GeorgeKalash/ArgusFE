import Table from 'src/components/Shared/Table'
import { Button, Grid } from '@mui/material'
import { useForm } from 'src/hooks/form'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useContext, useEffect, useState } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { SaleRepository } from 'src/repositories/SaleRepository'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { ControlContext } from 'src/providers/ControlContext'
import useSetWindow from 'src/hooks/useSetWindow'
import Form from './Form'

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
  const [data, setData] = useState([])
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

  const LoadShipAddresses = async () => {
    if (formik.values.search) {
      const res = await getRequest({
        extension: SaleRepository.FilterAddress.snapshot,
        parameters: `_countryId=${formik.values.countryId}&_cityId=${formik.values.cityId}&_clientId=${
          form.clientId
        }&_filter=${formik.values.search || ''}`
      })
      if (res?.list?.length > 0) {
        const formattedAddressList = await Promise.all(
          res.list.map(async item => {
            return {
              addressId: item.recordId,
              address: `${item.name || ''}, ${item.street1 || ''}, ${item.street2 || ''}, ${item.city || ''}, ${
                item.phone || ''
              },${item.phone2 || ''},${item.email1 || ''}`,
              checked: false
            }
          })
        )
        setData({ list: formattedAddressList })
      } else setData({ list: [] })
    } else await LoadAllAddresses()
  }

  const LoadAllAddresses = async () => {
    const res = await getRequest({
      extension: SaleRepository.Address.qry,
      parameters: `_params=1|${form.clientId}`
    })

    if (res?.list?.length > 0) {
      const formattedAddressList = await Promise.all(
        res.list.map(async item => {
          const res2 = await getRequest({
            extension: SystemRepository.Address.format,
            parameters: `_addressId=${item.addressId}`
          })
          const formattedAddress = res2.record.formattedAddress.replace(/[\r\n]+/g, ',').replace(/,$/, '')

          return { addressId: item.addressId, address: formattedAddress }
        })
      )
      setData({ list: formattedAddressList })

      if (checkedAddressId) {
        const matchingAddress = formattedAddressList.find(address => address.addressId === checkedAddressId)
        matchingAddress.checked = true
      }
    }
  }

  async function getDefaultCountry() {
    const res = await getRequest({
      extension: SystemRepository.Defaults.get,
      parameters: `_filter=&_key=countryId`
    })
    formik.setFieldValue('countryId', parseInt(res?.record?.value))
  }

  useEffect(() => {
    ;(async function () {
      await LoadAllAddresses()
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
                onChange={formik.handleChange}
              />
            </Grid>

            <Grid item xs={2}>
              <Button
                variant='contained'
                onClick={LoadShipAddresses}
                disabled={!(formik.values.countryId && formik.values.cityId)}
              >
                {labels.apply}
              </Button>
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <Table
            columns={rowColumns}
            gridData={data}
            rowId={['recordId']}
            isLoading={false}
            pagination={false}
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
