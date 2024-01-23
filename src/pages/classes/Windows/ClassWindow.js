// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'

// **Tabs
import ClassTab from 'src/pages/classes/Tabs/ClassTab'
import CharacteristicTab from 'src/pages/classes/Tabs/CharacteristicTab'
import FunctionTab from 'src/pages/classes/Tabs/FunctionTab'

const ClassWindow = ({
  onClose,
  onSave,
  classValidation,
  width,
  height,
  _labels,
  editMode,
  maxAccess,
  tabs,
  activeTab,
  setActiveTab,
  charOperatorComboStore,

  //characteristic tab
  characteristicGridData,
  getCharacteristicGridData,
  addCharacteristic,
  delCharacteristic,

  //Function tab (grid)
  functionGridData,
  getFunctionGridData,
  addFunction,
  delFunction,
  editFunction
}) => {
  return (
    <Window id='ClassWindow' Title={_labels.class} onClose={onClose} width={width} height={height} onSave={onSave} tabs={tabs}
    activeTab={activeTab}
    setActiveTab={setActiveTab}>
      <CustomTabPanel index={0} value={activeTab}>
        <ClassTab classValidation={classValidation} _labels={_labels} maxAccess={maxAccess} editMode={editMode} charOperatorComboStore={charOperatorComboStore} />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab}>
       <CharacteristicTab
          characteristicGridData={characteristicGridData}
          getCharacteristicGridData={getCharacteristicGridData}
          addCharacteristic={addCharacteristic}
          delCharacteristic={delCharacteristic}
          maxAccess={maxAccess}
          _labels={_labels}
        />
      </CustomTabPanel>
      <CustomTabPanel index={2} value={activeTab}>
       <FunctionTab
          functionGridData={functionGridData}
          getFunctionGridData={getFunctionGridData}
          addFunction={addFunction}
          delFunction={delFunction}
          editFunction={editFunction}
          maxAccess={maxAccess}
          _labels={_labels}
        />
      </CustomTabPanel>
    </Window>
  )
}

export default ClassWindow
