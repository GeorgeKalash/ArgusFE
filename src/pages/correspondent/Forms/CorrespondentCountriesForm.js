import { Box } from '@mui/material'
import { useFormik } from 'formik'
import { useContext, useEffect } from 'react'
import { DataGrid } from 'src/components/Shared/DataGrid'
import FormShell from 'src/components/Shared/FormShell'

// ** Custom Imports
import { RequestsContext } from 'src/providers/RequestsContext'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceIds } from 'src/resources/ResourceIds'

const CorrespondentCountriesForm = ({
  store,
  setStore,
  maxAccess,
  labels,
  editMode
}) => {
  const {recordId} = store
  const { getRequest, postRequest } = useContext(RequestsContext)

    // COUNTRIES TAB
    const formik = useFormik({
      enableReinitialize: true,
      validateOnChange: true,

      validate: values => {
        const isValid = values.countries.every(row => !!row.country)

        return isValid ? {} : { countries: Array(values.countries.length).fill({ countryId: 'Country ID is required' }) }
      },
      initialValues: {
        countries: [
          {
            id: 1,
            corId: recordId,
            country: '',
            countryId: '',
            countryRef: '',
            countryName: '',
            flName: ''
          }
        ]
      },
      onSubmit: values => {
        postCorrespondentCountries(values)
      }
    })

 const postCorrespondentCountries = obj => {

    const correspondentCountries= obj?.countries?.map(
      ({ country, corId }) => ({
         countryId: country.recordId,
         countryName: country.name,
         countryRef: country.reference,
         flName: country.flName,
         corId,
      })
    )


    const data = {
      corId: recordId,
       correspondentCountries
    }

    postRequest({
      extension: RemittanceSettingsRepository.CorrespondentCountry.set2,
      record: JSON.stringify(data)
    })
      .then(res => {

        setStore(prevStore => ({
          ...prevStore,
            countries: correspondentCountries
        }));

        if (!res.recordId) {
          toast.success('Record Added Successfully')
        } else {
          toast.success('Record Edited Successfully')
        }
      })
      .catch(error => {

      })
  }

  useEffect(()=>{
      console.log('obj.recordId')
      const defaultParams = `_corId=${recordId}`
      var parameters = defaultParams
      recordId &&   getRequest({
        extension: RemittanceSettingsRepository.CorrespondentCountry.qry,
        parameters: parameters
      })
        .then(res => {
          if (res.list.length > 0) {
            const correspondentCountries = res.list

            formik.setValues({ countries: correspondentCountries.map(
              ({ countryId,  countryRef, ...rest } , index) => ({
                 id : index,
                 country : { recordId: countryId,
                //  name: countryName,
                 reference: countryRef,
                },  ...rest


              }) )})
              setStore(prevStore => ({
                ...prevStore,
                  countries: correspondentCountries
              }));
          } else {
            formik.setValues({
              rows: [
                {
                  corId: recordId,
                  countryId: '',
                  countryRef: '',
                  countryName: '',
                  flName: ''
                }
              ]
            })
          }
        })
        .catch(error => {
          setErrorMessage(error)
        })


  },[recordId])

return (
    <>
        <FormShell
          form={formik}
          resourceId={ResourceIds.Correspondent}
          maxAccess={maxAccess}
          editMode={editMode} >
        <DataGrid
            onChange={value => formik.setFieldValue('countries', value)}
            value={formik.values.countries}
            error={formik.errors.countries}
            columns={[
              {
                component: 'resourcecombobox',
                name: 'country',
                label: labels.country,
                props: {
                  endpointId: SystemRepository.Country.qry,
                  valueField: 'recordId',
                  displayField: 'reference',
                  fieldsToUpdate: [{ from: 'name', to: 'countryName' }],
                  columnsInDropDown: [
                    { key: 'reference', value: 'Reference' },
                    { key: 'name', value: 'Name' },
                  ]
                }
              },
              {
                component: 'textfield',
                label: labels?.name,
                name: 'countryName'
              }

            ]}

        />
      </FormShell>
    </>
  )
}

export default CorrespondentCountriesForm
