import React, { useContext, useState } from 'react'
import CustomTextField from '../Inputs/CustomTextField'
import WindowToolbar from './WindowToolbar'

const DeleteConfirmation = ({ window, props, obj }) => {
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [isDeleteDisabled, setIsDeleteDisabled] = useState(true)

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
      props.onDeleteConfirmation(obj)
      window.close()
    }
  }

  const actions = [
    {
      key: 'Delete',
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
