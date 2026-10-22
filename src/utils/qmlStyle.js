// Read a QGIS style file (.qml) with a categorized renderer of simple fills (polygons)
// Only what is needed to draw it in OL / iTowns is kept: fill + outline of each category

// QGIS sizes are in millimeters by default (screen at 96 dpi)
const MM_TO_PX = 96 / 25.4

// QGIS color 'r,g,b,a' (0-255) => CSS 'rgba()'
function qgisColorToCss(qgisColor, symbolAlpha) {
  const [r, g, b, a = 255] = qgisColor.split(',').map(Number)
  return `rgba(${r},${g},${b},${(a / 255) * symbolAlpha})`
}

// Symbol layer property: <Option name="..."> (QGIS >= 3.10) or <prop k="..."> (older versions)
function readSymbolLayerProp(symbolLayer, name) {
  const option = symbolLayer.querySelector(`:scope > Option > Option[name="${name}"]`)
  if (option) {
    return option.getAttribute('value')
  }
  const prop = symbolLayer.querySelector(`:scope > prop[k="${name}"]`)
  return prop ? prop.getAttribute('v') : null
}

function readFillSymbol(symbol) {
  const symbolAlpha = parseFloat(symbol.getAttribute('alpha') || '1')
  const fillLayer = symbol.querySelector(':scope > layer[class="SimpleFill"]')
  if (!fillLayer) {
    return null
  }

  const fillStyle = readSymbolLayerProp(fillLayer, 'style')
  const outlineStyle = readSymbolLayerProp(fillLayer, 'outline_style')
  const outlineWidth = parseFloat(readSymbolLayerProp(fillLayer, 'outline_width') || '0')
  const outlineUnit = readSymbolLayerProp(fillLayer, 'outline_width_unit')

  return {
    fill: fillStyle === 'no' ? null : qgisColorToCss(readSymbolLayerProp(fillLayer, 'color'), symbolAlpha),
    stroke: outlineStyle === 'no' ? null : qgisColorToCss(readSymbolLayerProp(fillLayer, 'outline_color'), symbolAlpha),
    // QGIS 'hairline' (0) is drawn with 1px
    strokeWidth: Math.max(1, outlineUnit === 'Pixel' ? outlineWidth : outlineWidth * MM_TO_PX),
  }
}

export function parseCategorizedQml(qmlText) {
  const doc = new DOMParser().parseFromString(qmlText, 'application/xml')
  const renderer = doc.querySelector('renderer-v2')
  if (!renderer || renderer.getAttribute('type') !== 'categorizedSymbol') {
    throw new Error('QML style: only categorized renderers are supported')
  }

  // Symbols of the categories, by name ('source-symbol' is only the template used by QGIS)
  const symbols = {}
  renderer.querySelectorAll(':scope > symbols > symbol').forEach(symbol => {
    symbols[symbol.getAttribute('name')] = readFillSymbol(symbol)
  })

  const categories = {}
  renderer.querySelectorAll(':scope > categories > category').forEach(category => {
    if (category.getAttribute('render') !== 'false') {
      categories[category.getAttribute('value')] = symbols[category.getAttribute('symbol')]
    }
  })

  return {
    attribute: renderer.getAttribute('attr'),
    categories,
  }
}

// Style of a feature (from its properties), or null if its category isn't drawn
export function getQmlCategoryStyle(qmlStyle, properties) {
  const value = properties[qmlStyle.attribute]
  const key = value === null || value === undefined ? '' : String(value)
  // Empty value = 'all other values' category in QGIS
  return qmlStyle.categories[key] || qmlStyle.categories[''] || null
}
