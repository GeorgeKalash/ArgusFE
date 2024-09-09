import { useFormik } from 'formik'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { SystemRepository } from 'src/repositories/SystemRepository'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useContext, useEffect } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { PointofSaleRepository } from 'src/repositories/PointofSaleRepository'
import { SaleRepository } from 'src/repositories/SaleRepository'

const CurrencyForm = ({ store, labels, maxAccess }) => {
  const { recordId } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const formik = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      pOSUser: yup
        .array()
        .of(
          yup.object().shape({
            userId: yup.string().required()
          })
        )
        .required()
    }),
    initialValues: {
      pOSUser: [
        {
          id: 1,
          posId: recordId,
          userId: '',
          spId: '',
          email: '',
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
      extension: PointofSaleRepository.PosUsers.set2,
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
      name: 'userId',
      label: labels.user,
      props: {
        endpointId: SystemRepository.Users.qry,
        parameters: `_filter=&_size=50&_startAt=0&_sortBy=fullName`,
        valueField: 'recordId',

        displayField: 'email',
        mapping: [
          { from: 'email', to: 'email' },
          { from: 'recordId', to: 'userId' }
        ],
        columnsInDropDown: [{ key: 'email', value: 'Email' }]
      }
    },
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
        columnsInDropDown: [{ key: 'name', value: 'Name' }]
      }
    }
  ]

  function getData() {
    getRequest({
      extension: PointofSaleRepository.PosUsers.qry,
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
    <FormShell
      form={formik}
      resourceId={ResourceIds.PointOfSale}
      isCleared={false}
      infoVisible={false}
      maxAccess={maxAccess}
    >
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
    </FormShell>
  )
}

export default CurrencyForm
