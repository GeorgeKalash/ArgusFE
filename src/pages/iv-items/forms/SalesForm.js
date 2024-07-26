import { useState, useContext } from 'react'
import { Form, useFormik } from 'formik'
import { Grid, FormControlLabel, Checkbox } from '@mui/material'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { RequestsContext } from 'src/providers/RequestsContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useEffect } from 'react'

import * as yup from 'yup'
import toast from 'react-hot-toast'
import { useForm } from 'src/hooks/form'
import { useInvalidate } from 'src/hooks/resource'
import { PurchaseRepository } from 'src/repositories/PurchaseRepository'
import { ControlContext } from 'src/providers/ControlContext'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { SystemRepository } from 'src/repositories/SystemRepository'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { SaleRepository } from 'src/repositories/SaleRepository'

const SalesForm = ({ labels, editMode, maxAccess, store, record }) => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: PurchaseRepository.PriceList.qry
  })

  const { recordId: itemId } = store

  const validationSchema = yup.object({})

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      itemId,

      ...record
    },
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema,
    onSubmit: async obj => {
      const response = await postRequest({
        extension: SaleRepository.Sales.set,
        record: JSON.stringify(obj)
      })

      if (!vendorId && !currencyId) {
        toast.success(platformLabels.Added)
      } else toast.success(platformLabels.Edited)

      formik.setValues(obj)

      invalidate()
    }
  })

  useEffect(() => {
    const fetchData = async () => {
      if (record) {
        try {
          const res = await getRequest({
            extension: SaleRepository.Sales.get,
            parameters: `_itemId=${itemId}}`
          })

          if (res.record) {
            formik.setValues(res.record)
          }
        } catch (error) {}
      }
    }

    fetchData()
  }, [record])

  console.log(formik.values)

  return (
    <FormShell
      form={formik}
      infoVisible={false}
      resourceId={ResourceIds.PriceList}
      maxAccess={maxAccess}
      editMode={editMode}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={4}></Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default SalesForm
