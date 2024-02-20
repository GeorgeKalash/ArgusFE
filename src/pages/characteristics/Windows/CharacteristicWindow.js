// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'

// **Tabs
import CharacteristicTab from 'src/pages/characteristics/Tabs/CharacteristicTab'
import ValueTab from 'src/pages/characteristics/Tabs/ValueTab'

const CharacteristicWindow = ({
  onClose,
  onSave,
  characteristicValidation,
  width,
  height,
  _labels,
  editMode,
  maxAccess,
  tabs,
  activeTab,
  setActiveTab,

  //value tab
  valueGridData,
  getValueGridData,
  addValue,
  delValue,
  editValue
}) => {
  return (
    <Window id='CharacteristicWindow' Title={_labels.characteristic} onClose={onClose} width={width} height={height} onSave={onSave} tabs={tabs}
    activeTab={activeTab}
    setActiveTab={setActiveTab}>
      <CustomTabPanel index={0} value={activeTab}>
        <CharacteristicTab characteristicValidation={characteristicValidation} _labels={_labels} maxAccess={maxAccess}
        editMode={editMode} />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab}>
       <ValueTab
          valueGridData={valueGridData}
          getValueGridData={getValueGridData}
          addValue={addValue}
          delValue={delValue}
          editValue={editValue}
          maxAccess={maxAccess}
          _labels={_labels}
        />
      </CustomTabPanel>
    </Window>
  )
}

export default CharacteristicWindow
