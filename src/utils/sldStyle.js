// Read a SLD style file (e.g. QGIS export): rules with optional filters on attributes, and polygon / line / point symbolizers
// Only what is needed to draw it in OL / iTowns is kept: fill, outline and point radius of each rule

// Element of the SLD by local name, whatever its namespace (sld:, se:, ogc:)
function findChild(parent, localName) {
  return parent ? parent.getElementsByTagNameNS('*', localName)[0] || null : null
}

// <se:SvgParameter name="..."> (SLD 1.1) or <CssParameter name="..."> (SLD 1.0)
function readParameter(parent, name) {
  if (!parent) {
    return null
  }
  const params = [...parent.getElementsByTagNameNS('*', 'SvgParameter'), ...parent.getElementsByTagNameNS('*', 'CssParameter')]
  const param = params.find(p => p.getAttribute('name') === name)
  return param ? param.textContent.trim() : null
}

// '#rrggbb' + opacity => CSS 'rgba()'
function hexToCss(hexColor, opacity) {
  const hex = hexColor.replace('#', '')
  const [r, g, b] = [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16))
  return `rgba(${r},${g},${b},${opacity === null ? 1 : parseFloat(opacity)})`
}

function readFillAndStroke(parent) {
  const fill = findChild(parent, 'Fill')
  const stroke = findChild(parent, 'Stroke')
  const fillColor = readParameter(fill, 'fill')
  const strokeColor = readParameter(stroke, 'stroke')
  return {
    fill: fillColor ? hexToCss(fillColor, readParameter(fill, 'fill-opacity')) : null,
    stroke: strokeColor ? hexToCss(strokeColor, readParameter(stroke, 'stroke-opacity')) : null,
    // SLD widths are in pixels
    strokeWidth: parseFloat(readParameter(stroke, 'stroke-width') || '1'),
  }
}

// Style of a rule: the first symbolizer found (polygon, then line, then point)
function readSymbolizer(rule) {
  const polygon = findChild(rule, 'PolygonSymbolizer')
  if (polygon) {
    return readFillAndStroke(polygon)
  }
  const line = findChild(rule, 'LineSymbolizer')
  if (line) {
    return { ...readFillAndStroke(line), fill: null }
  }
  const point = findChild(rule, 'PointSymbolizer')
  if (point) {
    // Drawn as a circle, whatever the well known name of the mark
    const size = parseFloat((findChild(point, 'Size') || {}).textContent || '6')
    return { ...readFillAndStroke(findChild(point, 'Mark')), pointRadius: size / 2 }
  }
  return null
}

// --- Filters (OGC Filter Encoding): comparison operators combined with And / Or / Not ---
// Three-valued logic like QGIS / SQL: a comparison with an empty attribute is unknown (null), and a rule applies only if its filter is true
const COMPARISONS = {
  PropertyIsEqualTo: order => order === 0,
  PropertyIsNotEqualTo: order => order !== 0,
  PropertyIsLessThan: order => order < 0,
  PropertyIsLessThanOrEqualTo: order => order <= 0,
  PropertyIsGreaterThan: order => order > 0,
  PropertyIsGreaterThanOrEqualTo: order => order >= 0,
}

function isEmpty(value) {
  return value === null || value === undefined || value === ''
}

// Order of 2 values: as numbers if both are numbers, else as strings
function compareValues(a, b) {
  const [numA, numB] = [Number(a), Number(b)]
  if (!isNaN(numA) && !isNaN(numB)) {
    return numA - numB
  }
  return String(a) < String(b) ? -1 : String(a) > String(b) ? 1 : 0
}

// Filter element => function(properties) returning true / false / null (unknown). Throws if not supported
function buildFilter(element) {
  const operator = element.localName
  const children = [...element.children]

  if (COMPARISONS[operator]) {
    const property = findChild(element, 'PropertyName').textContent.trim()
    const literal = findChild(element, 'Literal').textContent.trim()
    return properties => isEmpty(properties[property]) ? null : COMPARISONS[operator](compareValues(properties[property], literal))
  }
  if (operator === 'PropertyIsNull') {
    const property = findChild(element, 'PropertyName').textContent.trim()
    return properties => properties[property] === null || properties[property] === undefined
  }
  if (operator === 'And' || operator === 'Or') {
    const filters = children.map(buildFilter)
    // And: false wins over unknown, Or: true wins over unknown
    const decisive = operator === 'Or'
    return properties => {
      const results = filters.map(f => f(properties))
      if (results.includes(decisive)) {
        return decisive
      }
      return results.includes(null) ? null : !decisive
    }
  }
  if (operator === 'Not') {
    const filter = buildFilter(children[0])
    return properties => {
      const result = filter(properties)
      return result === null ? null : !result
    }
  }
  throw new Error(`SLD filter <${operator}> not supported`)
}

export function parseSld(sldText) {
  const doc = new DOMParser().parseFromString(sldText, 'application/xml')
  if (doc.getElementsByTagName('parsererror').length) {
    throw new Error('SLD style: invalid XML')
  }

  const rules = []
  for (const rule of doc.getElementsByTagNameNS('*', 'Rule')) {
    const style = readSymbolizer(rule)
    if (!style) {
      continue
    }
    if (findChild(rule, 'ElseFilter')) {
      rules.push({ isElse: true, style })
      continue
    }
    const filterElement = findChild(rule, 'Filter')
    try {
      rules.push({ filter: filterElement ? buildFilter(filterElement.children[0]) : null, style })
    } catch (e) {
      console.warn(e.message + ', rule ignored', rule)
    }
  }
  return rules
}

// Style of a feature (from its properties): first matching rule, else the <ElseFilter> rule, or null
export function getSldStyle(sldRules, properties) {
  const matchingRule = sldRules.find(rule => !rule.isElse && (!rule.filter || rule.filter(properties) === true))
  const elseRule = sldRules.find(rule => rule.isElse)
  return (matchingRule || elseRule || {}).style || null
}
