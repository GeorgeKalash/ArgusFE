import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useContext, useEffect } from 'react'
import { AccessControlRepository } from 'src/repositories/AccessControlRepository'
import { RequestsContext } from 'src/providers/RequestsContext'
import toast from 'react-hot-toast'
import { ControlContext } from 'src/providers/ControlContext'
import { DataGrid } from 'src/components/Shared/DataGrid'
import FormShell from 'src/components/Shared/FormShell'

const SecurityGrpTab = ({ labels, maxAccess, storeRecordId }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { formik } = useForm({
    enableReinitialize: true,
    validateOnChange: true,
    initialValues: {
      groups: [
        {
          id: 1,
          sgId: '',
          sgName: '',
          userId: storeRecordId
        }
      ]
    },
    onSubmit: async values => {
      await postGroups(values)
    }
  })

  const postGroups = async obj => {
    const groups = obj?.groups?.length
      ? obj.groups
          .filter(item => item.sgId)
          .map(item => ({
            sgId: item.sgId,
            userId: storeRecordId
          }))
      : []

    const data = {
      userId: storeRecordId,
      sgId: 0,
      groups
    }

    await postRequest({
      extension: AccessControlRepository.SecurityGroupUser.set2,
      record: JSON.stringify(data)
    }).then(() => {
      toast.success(platformLabels.Updated)
    })
  }
  useEffect(() => {
    if (storeRecordId) {
      getRequest({
        extension: AccessControlRepository.SecurityGroupUser.qry,
        parameters: `_userId=${storeRecordId}&_filter=&_sgId=0`
      }).then(res => {
        if (res?.list?.length > 0) {
          const items = res.list.map((item, index) => ({
            ...item,
            id: index + 1
          }))
          formik.setValues({ groups: items })
        }
      })
    }
  }, [])

  return (
    <>
      <FormShell
        form={formik}
        resourceId={ResourceIds.Users}
        maxAccess={maxAccess}
        infoVisible={false}
        editMode={!!storeRecordId}
      >
        <VertLayout>
          <Grow>
            <DataGrid
              onChange={value => formik.setFieldValue('groups', value)}
              value={formik.values.groups}
              error={formik.errors.groups}
              columns={[
                {
                  component: 'resourcecombobox',
                  name: 'sgId',
                  label: labels.group,
                  props: {
                    endpointId: AccessControlRepository.SecurityGroup.qry,
                    parameters: '_startAt=0&_pageSize=1000',
                    valueField: 'recordId',
                    displayField: 'name',
                    mapping: [
                      { from: 'recordId', to: 'sgId' },
                      { from: 'name', to: 'sgName' }
                    ]
                  }
                }
              ]}
            />
          </Grow>
        </VertLayout>
      </FormShell>
    </>
  )
}

export default SecurityGrpTab
