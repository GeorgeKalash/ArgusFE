import React, { useContext, useState } from 'react'
import CustomTextField from '../Inputs/CustomTextField'
import WindowToolbar from './WindowToolbar'
import { useInvalidate } from 'src/hooks/resource'
import { RequestsContext } from 'src/providers/RequestsContext'
import toast from 'react-hot-toast'

const DeleteConfirmation = ({ recordId, invalidateEndpoint, deleteEndpoint, window }) => {
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [isDeleteDisabled, setIsDeleteDisabled] = useState(true)
  const { getRequest, postRequest } = useContext(RequestsContext)

  const handleChange = event => {
    const value = event.target.value
    setDeleteConfirmation(value)
    setIsDeleteDisabled(value.toLowerCase() !== 'delete')
  }

  const handleClear = () => {
    setDeleteConfirmation('')
    setIsDeleteDisabled(true)
  }

  const handleSubmit = async () => {
    if (deleteConfirmation.toLowerCase() === 'delete') {
      const obj = { recordId }
      await del(obj)
      window.close()
    }
  }

  const invalidate = useInvalidate({
    endpointId: invalidateEndpoint
  })

  const del = async obj => {
    await postRequest({
      extension: deleteEndpoint,
      record: JSON.stringify(obj)
    })
    invalidate()

    toast.success('Record Deleted Successfully')
  }

  const actions = [
    {
      key: 'deleteConfirmation',
      condition: true,
      onClick: handleSubmit,
      disabled: isDeleteDisabled
    }
  ]

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        justifyContent: 'space-between',
        padding: '20px',
        background: '#fff',
        borderRadius: '9px'
      }}
    >
      <div>
        <p style={{ fontWeight: 'bold' }}>
          Are you sure?
          <br />
          You are about to delete this record.
        </p>
        <p>Type "Delete" to confirm:</p>
        <CustomTextField
          name='deleteConfirmation'
          value={deleteConfirmation}
          onChange={handleChange}
          onClear={handleClear}
          placeholder="Type 'Delete' here"
          style={{
            borderRadius: '4px',
            padding: '10px',
            width: 'calc(100% - 20px)',
            marginBottom: '10px'
          }}
        />
      </div>

      <div>
        <WindowToolbar actions={actions} smallBox={true} />
      </div>
    </div>
  )
}

export default DeleteConfirmation
