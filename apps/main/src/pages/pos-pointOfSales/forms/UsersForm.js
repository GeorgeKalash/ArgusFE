import { useFormik } from 'formik'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'

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

const UsersForm = ({ store, labels, maxAccess }) => {
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
          spName: '',
          spRef: ''
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
    }).then(res => {
      toast.success(platformLabels.Edited)
      getData()
    })
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
        displayField: ['name', 'spRef'],

        valueField: 'recordId',
        mapping: [
          { from: 'recordId', to: 'spId' },
          { from: 'name', to: 'spName' },
          { from: 'spRef', to: 'spRef' }
        ],
        columnsInDropDown: [
          { key: 'name', value: 'Name' },
          { key: 'spRef', value: 'Reference' }
        ]
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
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess} isParentWindow={false}>
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

export default UsersForm
