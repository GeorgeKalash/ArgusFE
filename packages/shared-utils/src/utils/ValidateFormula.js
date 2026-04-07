import { parse } from 'mathjs';

const validateFormula = (value, variables = [], constants = []) => {
  const constantKeys = constants.map(c => c.reference);

  const allowedKeys = [...variables, ...constantKeys];

  if (!value || value.trim() === '') {
    return 'Formula is required';
  }

  // prevent dot between variables
  if (/[a-zA-Z]\.[a-zA-Z]/.test(value)) {
    return 'Invalid use of "." between variables';
  }

  // prevent missing operator (e.g. ")a" or "2a")
  if (/[)\d][a-zA-Z]/.test(value)) {
    return 'Missing operator between values';
  }

  try {
    const node = parse(value);
    const usedVars = [];

    node.traverse((n) => {
      if (n.isSymbolNode) {
        usedVars.push(n.name);
      }
    });

    const invalid = usedVars.filter(v => !allowedKeys.includes(v));

    if (invalid.length > 0) {
      return `Unknown variables: ${invalid.join(', ')}`;
    }

    return undefined;
  } catch {
    return 'Invalid syntax';
  }
};

const cleanFormula = (value) => {
  return value
    // LaTeX → plain math
    .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '($1/$2)')
    .replace(/\\cdot/g, '*')
    .replace(/\\left/g, '')
    .replace(/\\right/g, '')
    .replace(/\$\$/g, '')

    // Normalize symbols
    .replace(/∗|×|⋅|·/g, '*')
    .replace(/÷/g, '/')

    // Prevent exponent misuse
    .replace(/\*\*/g, '*')

    // Remove spaces
    .replace(/\s+/g, '')

    .trim();
};

export { validateFormula, cleanFormula };