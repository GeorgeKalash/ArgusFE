import { useContext } from 'react'
import Table from 'src/components/Shared/Table'
import WindowToolbar from 'src/components/Shared/WindowToolbar'
import { DataSets } from 'src/resources/DataSets'
import { CommonContext } from 'src/providers/CommonContext'
import { useResourceQuery } from 'src/hooks/resource'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'

export default function FlagsForm({ recordId, fsId, labels, maxAccess }) {
  const { getAllKvsByDataset } = useContext(CommonContext)

  async function getAllFlags() {
    return new Promise((resolve, reject) => {
      getAllKvsByDataset({
        _dataset: DataSets.GLFS_FLAGS,
        callback: result => {
          if (result) resolve(result)
          else reject()
        }
      })
    })
  }

  const {
    query: { data }
  } = useResourceQuery({
    queryFn: getAllFlags
  })

  const columns = [
    {
      field: 'isChecked',
      headerName: '',
      type: 'checkbox',
      editable: true
    },
    {
      field: 'value',
      headerName: labels.name,
      flex: 1
    }
  ]

  const handleSubmit = () => {}

  const actions = [
    {
      key: 'Ok',
      condition: true,
      onClick: () => handleSubmit()
    }
  ]

  return (
    <VertLayout>
      <Grow>
        <Table
          columns={columns}
          gridData={{ list: data }}
          rowId={['key']}
          isLoading={false}
          maxAccess={maxAccess}
          pagination={false}
        />
      </Grow>
      <Fixed>
        <WindowToolbar actions={actions} />
      </Fixed>
    </VertLayout>
  )
}
