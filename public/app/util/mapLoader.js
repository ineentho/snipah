import fetch from 'fetch'

const getMapConfig = (map) => {
  return fetch(`/maps/${map}/map.json`).then(resp => {
    return resp.json()
  })
}

const loadLayer = (map, layer) => {
  const url = `/maps/${map}/${layer}`

  const img = new window.Image()
  img.src = url

  return new Promise((resolve, reject) => {
    img.addEventListener('error', reject)
    img.addEventListener('load', () => {
      resolve(img)
    })
  })
}

export function loadMap (map) {
  return getMapConfig(map).then(config => {
    return Promise.all(config.layers.map(layer => {
      return loadLayer(map, layer.image).then(image => {
        layer.image = image
        return layer
      })
    })).then(layers => {
      config.layers = layers
      return config
    })
  })
}
