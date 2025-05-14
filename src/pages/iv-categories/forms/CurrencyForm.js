import { DataGrid } from 'src/components/Shared/DataGrid'
import { SystemRepository } from 'src/repositories/SystemRepository'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useContext, useEffect, useState } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { useForm } from 'src/hooks/form'

const CurrencyForm = ({ store, labels, maxAccess }) => {
  const { recordId } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const [numRows, setNumRows] = useState(0)

  const { formik } = useForm({
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      data: yup
        .array()
        .of(
          yup.object().shape({
            currencyId: yup.string().test(function (value) {
              if (numRows > 1) {
                return !!value
              }

              return true
            })
          })
        )
        .required()
    }),
    initialValues: {
      data: [
        {
          id: 1,
          categoryId: recordId,
          decimals: 0,
          currencyId: '',
          currencyName: ''
        }
      ]
    },
    onSubmit: values => {
      const { data } = values

      if (data.length === 1 && !data[0].currencyId && data[0].decimals !== 0) {
        data[0].decimals = 0
      }

      if (data.length === 1 && isRowEmpty(data[0])) {
        formik.setValues({ data: [] })
        postdata([])
      } else {
        postdata(values)
      }
    }
  })

  const isRowEmpty = row => {
    return !row.currencyId && !row.decimals
  }

  const postdata = obj => {
    const data = obj?.data?.map(({ categoryId, ...rest }) => ({
      categoryId: recordId,
      ...rest
    }))

    const list = {
      categoryId: recordId,
      data: data || []
    }

    postRequest({
      extension: InventoryRepository.CategoryCurrency.set2,
      record: JSON.stringify(list)
    })
      .then(res => {
        toast.success(platformLabels.Edited)
        getData()
      })
      .catch(error => {})
  }

  const columns = [
    {
      component: 'resourcecombobox',
      name: 'currencyId',
      label: labels.currency,
      props: {
        endpointId: SystemRepository.Currency.qry,
        valueField: 'recordId',
        displayField: 'name',
        mapping: [
          { from: 'recordId', to: 'currencyId' },
          { from: 'name', to: 'currencyName' }
        ]
      }
    },
    {
      component: 'numberfield',
      name: 'decimals',
      label: labels.decimals,
      props: {
        allowNegative: false
      },
      onChange: ({ row: { update, newRow } }) => {
        if (newRow.decimals == '' || newRow.decimals == null) {
          update({
            decimals: 0
          })
        } else {
          const newValue = Math.min(parseInt(newRow.decimals), 5)
          update({ decimals: newValue })
        }
      }
    }
  ]
  function getData() {
    getRequest({
      extension: InventoryRepository.CategoryCurrency.qry,
      parameters: `_categoryId=${recordId}`
    })
      .then(res => {
        const modifiedList = res.list?.map((category, index) => ({
          ...category,
          id: index + 1
        }))
        formik.setValues({ data: modifiedList })
      })
      .catch(error => {})
  }
  useEffect(() => {
    if (recordId) {
      getData()
    }
  }, [recordId])

  useEffect(() => {
    setNumRows(formik.values.data.length)
  }, [formik.values.data])

  return (
    <FormShell
      form={formik}
      resourceId={ResourceIds.Category}
      isCleared={false}
      infoVisible={false}
      maxAccess={maxAccess}
    >
      <VertLayout>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('data', value)}
            value={formik.values.data || []}
            initialValues={formik?.initialValues?.data?.[0]}
            error={formik.errors.data}
            columns={columns}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default CurrencyForm
