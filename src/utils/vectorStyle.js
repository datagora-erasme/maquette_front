// Basemaps from a MapLibre / Mapbox GL style (vector tiles, EPSG:3857), shared by OL and iTowns

// Loaded styles, by style URL
const loadedStyles = {}

function fetchJson(url) {
  return fetch(url).then(response => {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} for ${url}`)
    }
    return response.json()
  })
}

// Style keeping only its vector tiles source 'sourceId' (and the layers using it), with the tiles URL resolved from the TileJSON
// (the URL of the tiles is versioned by some servers, like OpenFreeMap: it must not be hard coded)
// => Promise of { style, tileUrl, maxZoom }. Each call gets its own copy of the style (viewers modify it)
export function loadVectorStyle(styleUrl, sourceId) {
  if (!loadedStyles[styleUrl]) {
    loadedStyles[styleUrl] = fetchJson(styleUrl)
      .then(style => {
        const glSource = style.sources[sourceId]
        if (!glSource || glSource.type !== 'vector') {
          throw new Error(`No vector source '${sourceId}' in style ${styleUrl}`)
        }
        return (glSource.url ? fetchJson(glSource.url) : Promise.resolve(glSource)).then(tileJson => {
          const maxZoom = tileJson.maxzoom !== undefined ? tileJson.maxzoom : 14
          return {
            style: {
              ...style,
              sources: {
                [sourceId]: { type: 'vector', tiles: tileJson.tiles, minzoom: tileJson.minzoom || 0, maxzoom: maxZoom },
              },
              layers: style.layers.filter(layer => layer.type === 'background' || layer.source === sourceId),
            },
            tileUrl: tileJson.tiles[0],
            maxZoom,
          }
        })
      })
      .catch(e => {
        // Not cached: a new try will be done next time
        delete loadedStyles[styleUrl]
        throw e
      })
  }
  return loadedStyles[styleUrl].then(loaded => ({ ...loaded, style: JSON.parse(JSON.stringify(loaded.style)) }))
}
