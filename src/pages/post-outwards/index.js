import { useState, useEffect, useContext } from 'react'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'
import Table from 'src/components/Shared/Table'
import { useResourceQuery } from 'src/hooks/resource'
import * as yup from 'yup'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useForm } from 'src/hooks/form'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { DataSets } from 'src/resources/DataSets'

const Postoutwards = () => {
  const [data, setData] = useState([])
  const { getRequest } = useContext(RequestsContext)

  const { labels: _labels, access } = useResourceQuery({
    endpointId: RemittanceOutwardsRepository.Postoutwards.qry,
    datasetId: ResourceIds.PUPaymentTerms
  })

  const { formik } = useForm({
    initialValues: {
      countryId: '',
      currencyId: '',
      corId: '',
      dispersalType: ''
    },
    access,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      countryId: yup.string().required(),
      currencyId: yup.string().required(),
      corId: yup.string().required(),
      dispersalType: yup.string().required()
    })
  })

  const rowColumns = [
    {
      field: 'clientName',
      headerName: _labels.name,
      flex: 2
    }
  ]

  const fetchRemittanceData = (countryId, currencyId, corId, dispersalType) => {
    if (!countryId) return

    getRequest({
      extension: RemittanceOutwardsRepository.Postoutwards.qry,
      parameters: `_countryId=${countryId}&_currencyId=${currencyId || 0}&_corId=${corId || 0}&_dispersalType=${
        dispersalType || 0
      }`
    })
      .then(response => {
        setData(response.list || [])
      })
      .catch(error => {})
  }

  useEffect(() => {
    const { countryId, currencyId, corId, dispersalType } = formik.values
    if (countryId) {
      fetchRemittanceData(countryId, currencyId, corId, dispersalType)
    }
  }, [formik.values.countryId, formik.values.currencyId, formik.values.corId, formik.values.dispersalType])

  return (
    <VertLayout>
      <Fixed>
        <ResourceComboBox
          endpointId={SystemRepository.Country.qry}
          name='countryId'
          label={_labels.country}
          columnsInDropDown={[
            { key: 'reference', value: 'Reference' },
            { key: 'name', value: 'Name' }
          ]}
          values={formik.values}
          valueField='recordId'
          displayField='name'
          required
          maxAccess={access}
          onChange={(event, newValue) => {
            const selectedCountryId = newValue?.recordId
            formik.setFieldValue('countryId', selectedCountryId)
            fetchRemittanceData(selectedCountryId)
          }}
          error={formik.touched.countryId && Boolean(formik.errors.countryId)}
        />
        <ResourceComboBox
          endpointId={SystemRepository.Currency.qry}
          name='currencyId'
          label={_labels.currency}
          valueField='recordId'
          displayField={['reference', 'name']}
          columnsInDropDown={[
            { key: 'reference', value: 'Reference' },
            { key: 'name', value: 'Name' },
            { key: 'flName', value: 'Foreign Language Name' }
          ]}
          displayFieldWidth={0.8}
          values={formik.values}
          maxAccess={access}
          onChange={(event, newValue) => {
            formik.setFieldValue('currencyId', newValue?.recordId || null)
          }}
          error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
        />
        <ResourceLookup
          endpointId={RemittanceSettingsRepository.Correspondent.snapshot}
          valueField='reference'
          displayField='name'
          name='corId'
          label={_labels.corName}
          form={formik}
          displayFieldWidth={2}
          valueShow='corRef'
          secondValueShow='corName'
          maxAccess={access}
          onChange={(event, newValue) => {
            formik.setFieldValue('corId', newValue ? newValue.recordId : '')
            formik.setFieldValue('corName', newValue ? newValue.name : '')
            formik.setFieldValue('corRef', newValue ? newValue.reference : '')
          }}
        />
        <ResourceComboBox
          name='dispersalType'
          label={_labels.dispersal}
          datasetId={DataSets.RT_Dispersal_Type}
          valueField='key'
          displayField='value'
          values={formik.values}
          onChange={(event, newValue) => {
            formik.setFieldValue('dispersalType', newValue?.key)
          }}
        />
      </Fixed>
      <Grow>
        <Table
          columns={rowColumns}
          gridData={{ list: data }}
          setData={setData}
          rowId={['recordId']}
          isLoading={false}
          maxAccess={access}
          pagination={false}
          checkTitle={_labels.active}
          showCheckboxColumn={true}
          viewCheckButtons={true}
        />
      </Grow>
    </VertLayout>
  )
}

export default Postoutwards
