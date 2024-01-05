// ** React Imports
import { useEffect, useState } from 'react'

import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import Checkbox from '@mui/material/Checkbox'
import IconButton from '@mui/material/IconButton'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

// ** Custom Imports
import Window from 'src/components/Shared/Window'

const SecurityGrpWindow = ({ onClose, onSave, securityGrpALLData, securityGrpSelectedData,  labels, handleSecurityGrpDataChange }) => {
  const [selected, setSelected] = useState([])
  const [allItems, setAllItems] = useState([]);
  const [newSelected, setNewSelected] = useState([])
  const [newAll, setNewAll] = useState([])

  useEffect(() => {
    console.log('useEffect fires')

    // Loop through securityGrpALLData and assign each object to allItems
    if (Array.isArray(securityGrpALLData)) {
      const updatedAllItems = securityGrpALLData.map((item) => ({
        sgId: item.sgId,
        sgName: item.sgName,
        userId: item.userId
      }));
      setAllItems(updatedAllItems);
    }

    if (Array.isArray(securityGrpSelectedData)) {
      const updatedSelectedItems = securityGrpSelectedData.map((item) => ({
        sgId: item.sgId,
        sgName: item.sgName,
        userId: item.userId
      }));

      // Update the selected state with the new array
      setSelected(updatedSelectedItems);
    }
    
    //handleSecurityGrpDataChange(allItems,selected);
    
  }, [securityGrpALLData, securityGrpSelectedData]);

  const handleToggle = value => () => {
    if (selected.includes(value)) {

      //add the item to newAllList
      setNewAll(prevSelected => [...prevSelected, value])
    } else {

      //add the item to newSelectedList
      setNewSelected(prevSelected => [...prevSelected, value])
    }
  }

  const handleMoveLeft = () => {
    // Move selected items from selected to the all
    setAllItems(prevItems => prevItems.concat(newAll))

    // Remove all items in newAll from setNewSelected
    setSelected(prevItems => prevItems.filter(item => !newAll.includes(item)))

    setNewAll([])
  }

  const handleMoveRight = () => {
    // Move selected items from all to the selected
    setSelected(prevItems => prevItems.concat(newSelected))

    // Remove all items in newSelected from setAllItems
    setAllItems(prevItems => prevItems.filter(item => !newSelected.includes(item)))

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
            <List>
              {allItems.map(item => (
                <ListItem key={item.id} onClick={handleToggle(item)} style={{ margin: '0px 0', padding: '0px' }}>
                  <Checkbox
                    tabIndex={-1}
                  />
                  {item.sgName}
                </ListItem>
              ))}
            </List>
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
            <List>
              {selected.map(item => (
                <ListItem key={item.id} onClick={handleToggle(item)} style={{ margin: '0px 0', padding: '0px' }}>
                  <Checkbox
                    tabIndex={-1}
                  />
                  {item.sgName}
                </ListItem>
              ))}
            </List>
          </div>
        </div>
      </div>
    </Window>
  )
}

export default SecurityGrpWindow
