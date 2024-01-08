// ** React Imports
import { useEffect, useState } from 'react'
import IconButton from '@mui/material/IconButton'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

// ** Custom Imports
import Window from 'src/components/Shared/Window'

const SecurityGrpWindow = ({
  onClose,
  onSave,
  securityGrpALLData,
  securityGrpSelectedData,
  labels,
  handleSecurityGrpDataChange
}) => {
  const [selected, setSelected] = useState([])
  const [allItems, setAllItems] = useState([])
  const [newSelected, setNewSelected] = useState([])
  const [newAll, setNewAll] = useState([])

  useEffect(() => {
    console.log('useEffect fires')

    // Loop through securityGrpALLData and assign each object to allItems
    if (Array.isArray(securityGrpALLData)) {
      const updatedAllItems = securityGrpALLData.map(item => ({
        sgId: item.sgId,
        sgName: item.sgName,
        userId: item.userId
      }))
      setAllItems(updatedAllItems)
    }

    if (Array.isArray(securityGrpSelectedData)) {
      const updatedSelectedItems = securityGrpSelectedData.map(item => ({
        sgId: item.sgId,
        sgName: item.sgName,
        userId: item.userId
      }))

      // Update the selected state with the new array
      setSelected(updatedSelectedItems)
    }

    //handleSecurityGrpDataChange(allItems,selected);
  }, [securityGrpALLData, securityGrpSelectedData])

  const handleToggle = value => {
    const isChecked = document.getElementById(value.sgId).checked

    if (selected.includes(value)) {
      if (isChecked === false) {
        // Remove the item from newAll
        setNewAll(prevSelected => prevSelected.filter(selectedItem => selectedItem.sgId !== value.sgId))

        // Add the item to newSelectedList
        setNewSelected(prevSelected => {
          // Check if prevSelected contains an object with the same sgId
          if (!prevSelected.some(item => item.sgId === value.sgId)) {
            return [...prevSelected, value]
          }

          // Default return when the condition is not met
          return prevSelected
        })
      } else {
        // add the item to newAllList
        setNewAll(prevSelected => {
          // Check if prevSelected contains an object with the same sgId
          if (!prevSelected.some(item => item.sgId === value.sgId)) {
            return [...prevSelected, value]
          }

          // Default return when the condition is not met
          return prevSelected
        })
      }
    } else {
      if (isChecked === false) {
        // Remove the item from newSelected
        setNewSelected(prevSelected => prevSelected.filter(selectedItem => selectedItem.sgId !== value.sgId))

        // Add the item to newAllList
        setNewAll(prevSelected => {
          // Check if prevSelected contains an object with the same sgId
          if (!prevSelected.some(item => item.sgId === value.sgId)) {
            return [...prevSelected, value]
          }

          // Default return when the condition is not met
          return prevSelected
        })
      } else {
        // add the item to newSelectedList
        setNewSelected(prevSelected => {
          // Check if prevSelected contains an object with the same sgId
          if (!prevSelected.some(item => item.sgId === value.sgId)) {
            return [...prevSelected, value]
          }

          // Default return when the condition is not met
          return prevSelected
        })
      }
    }

    // Toggle the checked state for the specific item in the "All" list
    setAllItems(prevItems =>
      prevItems.map(item => (item.sgId === value.sgId ? { ...item, checked: !item.checked } : item))
    )

    // Toggle the checked state for the specific item in the "Selected" list
    setSelected(prevItems =>
      prevItems.map(item => (item.sgId === value.sgId ? { ...item, checked: !item.checked } : item))
    )
  }

  const handleMoveLeft = () => {
    // Move selected items from selected to the all
    setAllItems(prevItems => {
      const uniqueNewAll = newAll.filter(newAllItem => !prevItems.some(prevItem => prevItem.sgId === newAllItem.sgId))

      return prevItems.concat(uniqueNewAll)
    })

    //remove item from selected list
    setSelected(prevItems => prevItems.filter(item => !newAll.some(selectedItem => selectedItem.sgId === item.sgId)))
    setNewAll([])
  }

  const handleMoveRight = () => {
    // Move selected items from all to the selected
    setSelected(prevSelected => {
      // Filter out items from newAll that already exist in prevSelected
      const uniqueNewSelected = newSelected.filter(
        newSelectedItem => !prevSelected.some(prevSelectedItem => prevSelectedItem.sgId === newSelectedItem.sgId)
      )

      return prevSelected.concat(uniqueNewSelected)
    })

    //remove item from all list
    setAllItems(prevItems =>
      prevItems.filter(item => !newSelected.some(selectedItem => selectedItem.sgId === item.sgId))
    )
    setNewSelected([])
  }

  return (
    <Window width={600} height={400} onClose={onClose} onSave={onSave} Title={labels.securityGrp}>
      {/* Empty Toolbar*/}
      <div style={{ backgroundColor: 'transparent', padding: '8px', textAlign: 'center' }}></div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {/* Left List */}
        <div
          style={{
            border: '1px solid #ccc',
            padding: '10px',
            marginLeft: '30px',
            width: '200px',
            textAlign: 'center',
            minWidth: '250px'
          }}
        >
          <div style={{ margin: 'auto' }}>
            <div style={{ backgroundColor: 'black' }}>
              <h3 style={{ margin: '0', color: 'white' }}>{labels.all}</h3>
            </div>
            <ul style={{ listStyleType: 'none', padding: 0 }}>
              {allItems.map(item => (
                <li key={item.sgId} style={{ margin: '0', padding: '0', borderBottom: '1px solid transparent' }}>
                  <label style={{ display: 'flex', alignItems: 'center', padding: '10px' }}>
                    <input
                      id={item.sgId}
                      type='checkbox'
                      onChange={() => handleToggle(item)}
                      checked={item.checked || false}
                      style={{ marginRight: '8px' }}
                    />
                    {item.sgName}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Centered Arrows */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <IconButton onClick={handleMoveRight}>
            <ArrowForwardIcon />
          </IconButton>
          <IconButton onClick={handleMoveLeft}>
            <ArrowBackIcon />
          </IconButton>
        </div>

        {/* Right List */}
        <div
          style={{
            border: '1px solid #ccc',
            padding: '10px',
            marginRight: '30px',
            width: '200px',
            textAlign: 'center',
            minWidth: '250px'
          }}
        >
          <div style={{ margin: 'auto' }}>
            <div style={{ backgroundColor: 'black' }}>
              <h3 style={{ margin: '0', color: 'white' }}>{labels.selected}</h3>
            </div>
            <ul style={{ listStyleType: 'none', padding: 0 }}>
              {selected.map(item => (
                <li key={item.sgId} style={{ margin: '0', padding: '0', borderBottom: '1px solid transparent' }}>
                  <label style={{ display: 'flex', alignItems: 'center', padding: '10px' }}>
                    <input
                      id={item.sgId}
                      type='checkbox'
                      onChange={() => handleToggle(item)}
                      checked={item.checked || false}
                      style={{ marginRight: '8px' }}
                    />
                    {item.sgName}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Window>
  )
}

export default SecurityGrpWindow
