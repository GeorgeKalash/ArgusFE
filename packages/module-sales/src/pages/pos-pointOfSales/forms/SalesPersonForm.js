import { useFormik } from 'formik'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useContext, useEffect } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { PointofSaleRepository } from '@argus/repositories/src/repositories/PointofSaleRepository'
import { SaleRepository } from '@argus/repositories/src/repositories/SaleRepository'
import Form from '@argus/shared-ui/src/components/Shared/Form'

const SalesPersonForm = ({ store, labels, maxAccess }) => {
  const { recordId } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const formik = useFormik({
    validateOnChange: true,
    validationSchema: yup.object({
      pOSUser: yup
        .array()
        .of(
          yup.object().shape({
            spId: yup.string().required('spId  is required')
          })
        )
        .required('userId array is required')
    }),
    initialValues: {
      pOSUser: [
        {
          id: 1,
          posId: recordId,
          spId: '',
          isInactive: false,
          spName: ''
        }
      ]
    },
    onSubmit: values => {
      postPOSUser(values)
    }
  })

  const postPOSUser = obj => {
    const pOSUser = obj?.pOSUser?.map(({ posId, ...rest }) => ({
      posId: recordId,

      ...rest
    }))

    const data = {
      posId: recordId,
      users: pOSUser
    }
    postRequest({
      extension: PointofSaleRepository.SalesPerson.set2,
      record: JSON.stringify(data)
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
      label: labels.salePerson,
      name: 'spId',
      props: {
        endpointId: SaleRepository.SalesPerson.qry,
        parameters: `_filter=`,
        displayField: 'name',
        valueField: 'recordId',
        mapping: [
          { from: 'recordId', to: 'spId' },
          { from: 'name', to: 'spName' }
        ],
        columnsInDropDown: [
          { key: 'spRef', value: 'Reference' },
          { key: 'name', value: 'Name' }
        ]
      }
    },
    {
      component: 'checkbox',
      label: labels.isInactive,
      name: 'isInactive'
    }
  ]

  function getData() {
    getRequest({
      extension: PointofSaleRepository.SalesPerson.qry,
      parameters: `_posId=${recordId}`
    })
      .then(res => {
        const modifiedList = res.list?.map((user, index) => ({
          ...user,
          id: index + 1
        }))
        formik.setValues({ pOSUser: modifiedList })
      })
      .catch(error => {})
  }

  useEffect(() => {
    if (recordId) {
      getData()
    }
  }, [recordId])

  return (
    <Form form={formik} resourceId={ResourceIds.PointOfSale} maxAccess={maxAccess} isParentWindow={false}>
      <VertLayout>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('pOSUser', value)}
            value={formik.values.pOSUser || []}
            error={formik.errors.pOSUser}
            columns={columns}
          />
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default SalesPersonForm
