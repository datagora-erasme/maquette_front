// Read a SLD style file (QGIS export) with polygon rules filtered on an attribute value
// Only what is needed to draw it in OL / iTowns is kept: fill + outline of each rule

// Element of the SLD by local name, whatever its namespace (sld:, se:, ogc:)
function findChild(parent, localName) {
  return parent.getElementsByTagNameNS('*', localName)[0] || null
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

function readPolygonSymbolizer(symbolizer) {
  const fill = findChild(symbolizer, 'Fill')
  const stroke = findChild(symbolizer, 'Stroke')
  const fillColor = readParameter(fill, 'fill')
  const strokeColor = readParameter(stroke, 'stroke')
  return {
    fill: fillColor ? hexToCss(fillColor, readParameter(fill, 'fill-opacity')) : null,
    stroke: strokeColor ? hexToCss(strokeColor, readParameter(stroke, 'stroke-opacity')) : null,
    // SLD widths are in pixels
    strokeWidth: parseFloat(readParameter(stroke, 'stroke-width') || '1'),
  }
}

function readFilter(rule) {
  if (findChild(rule, 'ElseFilter')) {
    return { isElse: true }
  }
  const filter = findChild(rule, 'Filter')
  if (!filter) {
    return null
  }
  const isEqualTo = findChild(filter, 'PropertyIsEqualTo')
  if (!isEqualTo || filter.children.length !== 1) {
    console.warn('SLD style: only <PropertyIsEqualTo> filters are supported, rule ignored', rule)
    return { unsupported: true }
  }
  return {
    property: findChild(isEqualTo, 'PropertyName').textContent.trim(),
    value: findChild(isEqualTo, 'Literal').textContent.trim(),
  }
}

export function parseSld(sldText) {
  const doc = new DOMParser().parseFromString(sldText, 'application/xml')
  const rules = []
  for (const rule of doc.getElementsByTagNameNS('*', 'Rule')) {
    const symbolizer = findChild(rule, 'PolygonSymbolizer')
    const filter = readFilter(rule)
    if (symbolizer && !(filter && filter.unsupported)) {
      rules.push({ filter, style: readPolygonSymbolizer(symbolizer) })
    }
  }
  return rules
}

// Style of a feature (from its properties): first matching rule, else the <ElseFilter> rule, or null
export function getSldStyle(sldRules, properties) {
  const matchingRule = sldRules.find(rule => !rule.filter || (!rule.filter.isElse && String(properties[rule.filter.property]) === rule.filter.value))
  const elseRule = sldRules.find(rule => rule.filter && rule.filter.isElse)
  return (matchingRule || elseRule || {}).style || null
}
