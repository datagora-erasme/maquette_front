// User layers ("Mes données"): GeoJSON file + optional SLD style, imported in the browser (kept in memory only)
import { markRaw } from 'vue'
import { parseSld, getSldStyle } from './sldStyle'

// CRS known by both viewers (proj4 definitions in OLViewer & ItownsViewer)
export const USER_LAYER_CRS = ['EPSG:4326', 'EPSG:3857', 'EPSG:2154', 'EPSG:3946']

// Style used when no SLD file is given (blue of the app)
const DEFAULT_STYLE = {
  fill: 'rgba(25,118,211,0.35)',
  stroke: 'rgba(25,118,211,1)',
  strokeWidth: 1.5,
  pointRadius: 5,
}

let userLayerCount = 0

// Error with a message that can be shown to the user
class UserLayerError extends Error {}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new UserLayerError(`Impossible de lire le fichier ${file.name}`))
    reader.readAsText(file)
  })
}

// CRS of a GeoJSON: 'crs' member (old GeoJSON spec, used by QGIS exports), else WGS84 (RFC 7946)
function readGeoJsonCrs(geojson) {
  const crsName = geojson.crs && geojson.crs.properties && geojson.crs.properties.name
  if (!crsName || /CRS84$/i.test(crsName)) {
    return 'EPSG:4326'
  }
  // 'EPSG:2154', 'urn:ogc:def:crs:EPSG::2154', ...
  const epsgCode = crsName.match(/EPSG:+(\d+)$/i)
  const crs = epsgCode ? 'EPSG:' + epsgCode[1] : crsName
  if (!USER_LAYER_CRS.includes(crs)) {
    throw new UserLayerError(`Projection ${crs} non gérée (projections acceptées : ${USER_LAYER_CRS.join(', ')})`)
  }
  return crs
}

function parseGeoJson(text) {
  let geojson
  try {
    geojson = JSON.parse(text)
  } catch (e) {
    throw new UserLayerError("Le fichier GeoJSON n'est pas un JSON valide")
  }
  // A single feature is accepted as a collection of one feature
  if (geojson && geojson.type === 'Feature') {
    geojson = { type: 'FeatureCollection', crs: geojson.crs, features: [geojson] }
  }
  if (!geojson || geojson.type !== 'FeatureCollection' || !Array.isArray(geojson.features)) {
    throw new UserLayerError('Le fichier doit contenir une FeatureCollection GeoJSON')
  }
  if (!geojson.features.some(feature => feature && feature.geometry)) {
    throw new UserLayerError('Le fichier GeoJSON ne contient aucune géométrie')
  }
  return geojson
}

function parseSldFile(text) {
  let sldRules
  try {
    sldRules = parseSld(text)
  } catch (e) {
    throw new UserLayerError("Le fichier SLD n'est pas un XML valide")
  }
  if (!sldRules.length) {
    throw new UserLayerError('Aucune règle de style exploitable dans le fichier SLD')
  }
  return sldRules
}

// Read & check the files of the import form => user layer definition, shared by Aside and both viewers
// 'id' is given when an existing layer is edited (same id in the viewers)
export async function createUserLayer(name, geojsonFile, sldFile, id = null) {
  const geojson = parseGeoJson(await readFileAsText(geojsonFile))
  const crs = readGeoJsonCrs(geojson)
  const sldRules = sldFile ? parseSldFile(await readFileAsText(sldFile)) : null

  if (!id) {
    userLayerCount++
  }
  // Never made reactive by Vue: the GeoJSON can be big, and viewers need the raw objects
  return markRaw({
    id: id || 'User_Layer_' + userLayerCount,
    name,
    // Files kept to fill the edit form
    geojsonFile,
    sldFile,
    geojson,
    crs,
    sldRules,
  })
}

export function isUserLayerError(error) {
  return error instanceof UserLayerError
}

// Style of a feature of a user layer: SLD rules if given (null = not drawn), else the default style
export function getUserLayerStyle(userLayer, properties) {
  return userLayer.sldRules ? getSldStyle(userLayer.sldRules, properties || {}) : DEFAULT_STYLE
}
