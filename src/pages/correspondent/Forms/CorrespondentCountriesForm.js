import { useFormik } from 'formik'
import { useContext, useEffect } from 'react'
import { DataGrid } from 'src/components/Shared/DataGrid'
import FormShell from 'src/components/Shared/FormShell'

// ** Custom Imports
import { RequestsContext } from 'src/providers/RequestsContext'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { useWindowDimensions } from 'src/lib/useWindowDimensions'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { MultiCurrencyRepository } from 'src/repositories/MultiCurrencyRepository'

const CorrespondentCountriesForm = ({ store, setStore, maxAccess, labels, expanded, editMode }) => {
  const { recordId } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { height } = useWindowDimensions()
  const { platformLabels } = useContext(ControlContext)

  const formik = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      countries: yup
        .array()
        .of(
          yup.object().shape({
            countryId: yup.string().required('currency  is required')
          })
        )
        .required('Operations array is required')
    }),

    initialValues: {
      countries: [
        {
          id: 1,
          corId: recordId || null,
          country: '',
          countryId: '',
          countryRef: '',
          countryName: '',
          flName: '',
          purcRateTypeId: null,
          saleRateTypeId: null,
          isInactive: false
        }
      ]
    },
    onSubmit: async values => {
      await postCorrespondentCountries(values)
    }
  })

  const postCorrespondentCountries = async obj => {
    const correspondentCountries = obj?.countries

    const data = {
      corId: recordId,
      correspondentCountries: correspondentCountries.map(({ country, corId, ...rest }) => ({
        corId: recordId,
        ...rest
      }))
    }

    await postRequest({
      extension: RemittanceSettingsRepository.CorrespondentCountry.set2,
      record: JSON.stringify(data)
    }).then(res => {
      setStore(prevStore => ({
        ...prevStore,
        countries: correspondentCountries
      }))
      toast.success(platformLabels.Edited)
    })
  }

  useEffect(() => {
    const defaultParams = `_corId=${recordId}`
    var parameters = defaultParams
    recordId &&
      getRequest({
        extension: RemittanceSettingsRepository.CorrespondentCountry.qry,
        parameters: parameters
      }).then(res => {
        if (res?.list?.length > 0) {
          const correspondentCountries = res.list

          formik.setValues({
            countries: correspondentCountries.map(({ ...rest }, index) => ({
              id: index + 1,
              ...rest
            }))
          })
          setStore(prevStore => ({
            ...prevStore,
            countries: correspondentCountries
          }))
        } else {
          formik.setValues({
            countries: [
              {
                id: 1,
                corId: '',
                countryId: '',
                countryRef: '',
                countryName: '',
                flName: '',
                purcRateTypeId: null,
                saleRateTypeId: null,
                isInactive: false
              }
            ]
          })
        }
      })
  }, [recordId])

  return (
    <>
      <FormShell
        form={formik}
        resourceId={ResourceIds.Correspondent}
        maxAccess={maxAccess}
        infoVisible={false}
        editMode={editMode}
        isSavedClear={false}
      >
        <VertLayout>
          <Grow>
            <DataGrid
              onChange={value => formik.setFieldValue('countries', value)}
              value={formik.values.countries}
              error={formik.errors.countries}
              columns={[
                {
                  component: 'resourcecombobox',
                  name: 'countryId',
                  label: labels.country,
                  props: {
                    endpointId: SystemRepository.Country.qry,
                    valueField: 'recordId',
                    displayField: 'reference',
                    mapping: [
                      { from: 'recordId', to: 'countryId' },
                      { from: 'name', to: 'countryName' },
                      { from: 'reference', to: 'countryRef' }
                    ],
                    columnsInDropDown: [
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]
                  }
                },
                {
                  component: 'textfield',
                  label: labels?.name,
                  name: 'countryName',
                  props: { readOnly: true }
                },
                {
                  component: 'resourcecombobox',
                  label: labels.saleRateType,
                  name: 'saleRateTypeId',
                  props: {
                    endpointId: MultiCurrencyRepository.RateType.qry,
                    valueField: 'recordId',
                    displayField: 'name',
                    displayFieldWidth: 1.5,
                    mapping: [
                      { from: 'name', to: 'saleRateTypeName' },
                      { from: 'reference', to: 'saleRateTypeRef' },
                      { from: 'recordId', to: 'saleRateTypeId' }
                    ],
                    columnsInDropDown: [
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]
                  }
                },
                {
                  component: 'resourcecombobox',
                  label: labels.purcRateType,
                  name: 'purcRateTypeId',
                  props: {
                    endpointId: MultiCurrencyRepository.RateType.qry,
                    valueField: 'recordId',
                    displayField: 'name',
                    displayFieldWidth: 1.5,
                    mapping: [
                      { from: 'name', to: 'purcRateTypeName' },
                      { from: 'reference', to: 'purcRateTypeRef' },
                      { from: 'recordId', to: 'purcRateTypeId' }
                    ],
                    columnsInDropDown: [
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]
                  }
                },
                {
                  component: 'checkbox',
                  label: labels.isInActive,
                  name: 'isInactive'
                }
              ]}
              height={`${expanded ? height - 280 : 380}px`}
            />
          </Grow>
        </VertLayout>
      </FormShell>
    </>
  )
}

export default CorrespondentCountriesForm
