// In some component or service file
import {
  PhysicalPropertyCalculator,
  PhysicalPropertyCalculatorCtrl,
  getPhysicalProperties,
  DIRTYFIELD_LENGTH,
  SHAPE_CUBIC
} from './PhysicalPropertyCalc' // Adjust path as needed

// 1) Create a calculator instance
const calculator = new PhysicalPropertyCalculator(
  DIRTYFIELD_LENGTH, // dirtyField
  SHAPE_CUBIC, // shape
  10, // length
  5, // width
  2, // depth
  0, // diameter
  0, // volume
  0, // weight
  0 // density
)

// 2) Option A: Use the Controller directly
const ctrl = new PhysicalPropertyCalculatorCtrl()
const updatedCalc = ctrl.recalc(calculator)
console.log('Updated calc using controller:', updatedCalc)

// 3) Option B: Use the helper function
const updatedCalc2 = getPhysicalProperties(calculator)
console.log('Updated calc using helper function:', updatedCalc2)
