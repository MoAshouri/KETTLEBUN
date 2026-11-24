import {
  BufferGeometry, CanvasTexture, Color, Float32BufferAttribute, LatheGeometry,
  MathUtils, RepeatWrapping, Vector2,
} from 'three'

const turn = Math.PI * 2

export function randomFrom(seed: number) {
  return () => {
    seed = (Math.imul(1664525, seed) + 1013904223) >>> 0
    return seed / 4294967296
  }
}

function paint(geometry: BufferGeometry, getColor: (x: number, y: number, z: number) => Color) {
  const position = geometry.getAttribute('position')
  const colors = new Float32Array(position.count * 3)
  for (let index = 0; index < position.count; index++) {
    getColor(position.getX(index), position.getY(index), position.getZ(index)).toArray(colors, index * 3)
  }
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3))
  return geometry
}

export function grainTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 256
  const ctx = canvas.getContext('2d')!
  const image = ctx.createImageData(canvas.width, canvas.height)
  const random = randomFrom(43)
  for (let index = 0; index < image.data.length; index += 4) {
    const noise = Math.floor(90 + 160 * random() ** 1.8)
    image.data[index] = image.data[index + 1] = image.data[index + 2] = noise
    image.data[index + 3] = 255
  }
  ctx.putImageData(image, 0, 0)
  const texture = new CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = RepeatWrapping
  return texture
}

const bunRadius = 1.34

export function domeHeight(radius: number) {
  const angle = Math.acos(MathUtils.clamp((radius / bunRadius) ** (1 / 0.87), 0, 1))
  return 0.10 + 0.65 * Math.sin(angle) ** 1.07
}

export function bunGeometry(top: boolean) {
  const profile = top
    ? [[0, 0.035], [0.5, 0.035], [1.05, 0.027], [1.22, 0.018], [1.31, 0.04], [bunRadius, 0.10]]
    : [[0, -0.29], [0.57, -0.29], [0.99, -0.282], [1.14, -0.265], [1.23, -0.23], [1.30, -0.166], [1.34, -0.09], [1.34, -0.045], [1.31, -0.007], [1.27, 0.014], [1.21, 0.022], [1.08, 0.016], [0.90, 0.009], [0.55, 0.008], [0, 0.01]]

  if (top) {
    for (let index = 1; index <= 30; index++) {
      const angle = index / 30 * Math.PI / 2
      const radius = index === 30 ? 0 : bunRadius * Math.cos(angle) ** 0.87
      profile.push([radius, domeHeight(radius)])
    }
  }

  const geometry = new LatheGeometry(profile.map(([x, y]) => new Vector2(x, y)), 144)
  const gold = new Color('#d7872e')
  const glaze = new Color('#a95013')
  const toast = new Color('#87350e')
  const crumb = new Color('#f4c17a')
  const shade = new Color()
  return paint(geometry, (x, y, z) => {
    const radius = Math.hypot(x, z)
    const noise = Math.sin(x * 24 + Math.sin(z * 30)) * Math.sin(z * 21 + y * 11)
    const blister = Math.sin(x * 7.6 + Math.cos(z * 9)) * Math.cos(z * 14 + y * 11)
    if (top) {
      const height = MathUtils.smoothstep(y, 0.07, 0.74)
      if (y < 0.045) {
        shade.copy(crumb).lerp(toast, MathUtils.smoothstep(radius, 1.07, 1.31) * 0.86)
      } else {
        const seam = (1 - MathUtils.smoothstep(y, 0.055, 0.16)) * (0.72 + 0.08 * blister)
        shade.copy(gold).lerp(glaze, height * 0.76).lerp(toast, seam)
      }
    } else if (y >= 0.005) {
      shade.copy(crumb).lerp(toast, MathUtils.smoothstep(radius, 0.78, 1.30) * 0.88)
    } else {
      shade.copy(gold).lerp(glaze, MathUtils.smoothstep(-y, 0.02, 0.3) * 0.72)
    }
    return shade.multiplyScalar(1 + noise * 0.115 + blister * 0.07)
  })
}

export function pattyGeometry() {
  const profile = [new Vector2(0, -0.155)]
  for (let index = 1; index < 44; index++) {
    const angle = index / 44 * Math.PI - Math.PI / 2
    profile.push(new Vector2(1.32 * Math.cos(angle) ** 0.28, 0.15 * Math.sin(angle)))
  }
  profile.push(new Vector2(0, 0.147))
  const geometry = new LatheGeometry(profile, 178)
  const position = geometry.attributes.position
  for (let index = 0; index < position.count; index++) {
    const x = position.getX(index)
    const y = position.getY(index)
    const z = position.getZ(index)
    const angle = Math.atan2(z, x)
    const edge = 0.032 * Math.sin(angle * 17) + 0.026 * Math.cos(angle * 33 + y * 38) + 0.018 * Math.sin(angle * 69 + y * 92)
    const topography = 0.013 * Math.sin(x * 39 + y * 22) * Math.cos(z * 55 - x * 8)
    position.setXYZ(index, x * (1 + edge), y + topography, z * (1 + edge))
  }
  geometry.computeVertexNormals()

  const browned = new Color('#7f3419')
  const char = new Color('#35160b')
  const crust = new Color('#ba6536')
  const shade = new Color()
  return paint(geometry, (x, y, z) => {
    const coarse = Math.sin(x * 31 + z * 13 + y * 29) * Math.sin(z * 26 + y * 32)
    const grill = MathUtils.smoothstep(Math.sin((x + z * 0.43) * 16.0), 0.62, 0.91) * MathUtils.smoothstep(y, 0.08, 0.15)
    return shade.copy(browned).lerp(coarse > 0.15 ? crust : char, Math.abs(coarse) * 0.75).lerp(char, grill * 0.61)
  })
}

type SurfaceVertex = (u: number, angle: number) => [number, number, number]

function polarSurface(vertex: SurfaceVertex) {
  const rings = 26
  const segments = 168
  const positions = [0, ...vertex(0, 0).slice(1)]
  const uvs = [0.5, 0.5]
  const indices: number[] = []

  for (let ring = 1; ring <= rings; ring++) {
    const u = ring / rings
    for (let segment = 0; segment < segments; segment++) {
      const angle = segment / segments * turn
      const [x, y, z] = vertex(u, angle)
      positions.push(x, y, z)
      uvs.push(x / 3 + 0.5, z / 3 + 0.5)

      const current = (ring - 1) * segments + segment + 1
      const next = (ring - 1) * segments + (segment + 1) % segments + 1
      if (ring === 1) indices.push(0, next, current)
      else indices.push(current - segments, next, current, current - segments, next - segments, next)
    }
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}

export function lettuceGeometry(offset: number) {
  const emerald = new Color('#376e16')
  const leaf = new Color('#62982a')
  const fringe = new Color('#a7bc3f')
  const shade = new Color()

  const geometry = polarSurface((u, angle) => {
    const a = angle + offset
    const scallop = 0.18 * Math.sin(a * 7) + 0.12 * Math.sin(a * 13 + 0.42) + 0.07 * Math.cos(a * 26 - 0.3)
    const radius = u * (1.37 + scallop * u ** 4)
    const ripples = Math.sin(a * 21 + u * 5) * 0.089 + Math.cos(a * 13 - u * 9) * 0.082 + Math.sin(a * 34 + u * 12) * 0.047
    const y = 0.026 * Math.sin(u * 19 + a * 9) * u + ripples * u ** 4
    return [radius * Math.cos(angle), y, radius * Math.sin(angle)]
  })

  return paint(geometry, (x, y, z) => {
    const radius = Math.hypot(x, z)
    const angle = Math.atan2(z, x) + offset
    const veins = Math.max(0, Math.cos(angle * 16 + radius * 4)) ** 14
    return shade.copy(emerald).lerp(leaf, MathUtils.smoothstep(radius, 0.25, 1.1))
      .lerp(fringe, MathUtils.smoothstep(y, -0.045, 0.16) * 0.65 + veins * 0.17)
  })
}

export function cheeseGeometry() {
  const geometry = polarSurface((u, angle) => {
    const cornerRadius = 1.15 / (Math.abs(Math.cos(angle)) ** 6 + Math.abs(Math.sin(angle)) ** 6) ** (1 / 6)
    const fall = MathUtils.smoothstep(u * cornerRadius, 1.04, 1.54)
    const fold = Math.sin(angle * 5 + u * 8) * fall * 0.024
    const y = 0.014 + 0.028 * u * Math.sin(angle * 4 + 0.2) - fall * 0.177 + fold
    return [u * cornerRadius * Math.cos(angle), y, u * cornerRadius * Math.sin(angle)]
  })
  const cheddar = new Color('#ffaf29')
  const edges = new Color('#da7220')
  const shade = new Color()
  return paint(geometry, (x, y, z) => shade.copy(cheddar).lerp(edges, MathUtils.smoothstep(-y, -0.032, 0.2) * 0.56 + 0.07 * Math.sin(x * 10 - z * 14)))
}

export function sliceGeometry(kind: 'pickle' | 'tomato') {
  const pickle = kind === 'pickle'
  const radius = pickle ? 0.58 : 1.26
  const thickness = pickle ? 0.049 : 0.086
  const profile = [[0, -0.83], [0.45, -0.89], [0.83, -0.95], [0.96, -0.93], [1, -0.52], [1, 0.56], [0.96, 0.91], [0.9, 1], [0.82, 0.97], [0.74, 0.89], [0.63, 0.82], [0.51, 0.83], [0.4, 0.91], [0.31, 0.93], [0.2, 0.87], [0.1, 0.84], [0, 0.87]]
  const geometry = new LatheGeometry(profile.map(([r, y]) => new Vector2(r * radius, y * thickness)), pickle ? 80 : 128)
  const position = geometry.attributes.position

  for (let index = 0; index < position.count; index++) {
    const x = position.getX(index)
    const y = position.getY(index)
    const z = position.getZ(index)
    const angle = Math.atan2(z, x)
    const ripple = pickle ? 0.047 * Math.sin(angle * 15) + 0.032 * Math.cos(angle * 4) : 0.035 * Math.sin(angle * 6) + 0.018 * Math.cos(angle * 11)
    const edge = Math.min(1, Math.hypot(x, z) / radius)
    position.setXYZ(index, x * (1 + ripple), y + edge * 0.015 * Math.sin(angle * (pickle ? 11 : 6)), z * (1 + ripple) * (pickle ? 0.84 : 0.95))
  }
  geometry.computeVertexNormals()

  const rind = new Color(pickle ? '#426126' : '#b72c22')
  const flesh = new Color(pickle ? '#c4c577' : '#ed6242')
  const pulp = new Color(pickle ? '#8ba545' : '#bb321f')
  const seeds = new Color(pickle ? '#eee1a2' : '#f8bb62')
  const shade = new Color()
  return paint(geometry, (x, y, z) => {
    const across = z / (pickle ? 0.84 : 0.95)
    const span = Math.hypot(x, across) / radius
    const angle = Math.atan2(across, x)
    const chamber = Math.max(0, Math.sin(angle * (pickle ? 6 : 5) + span * 0.7))
    const interior = MathUtils.smoothstep(span, 0.17, 0.34) * (1 - MathUtils.smoothstep(span, 0.65, 0.88))
    const seed = MathUtils.smoothstep(chamber, 0.79, 0.99) * Math.max(0, Math.cos(span * 44 + angle * 3)) ** 9
    const skin = MathUtils.smoothstep(span, 0.82, 1.01) * (y > thickness * 0.57 ? 0.75 : 1)
    return shade.copy(flesh).lerp(pulp, interior * chamber * 0.8).lerp(seeds, seed * interior * 0.72).lerp(rind, skin)
  })
}

export function shadowTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 64
  const ctx = canvas.getContext('2d')!
  const gradient = ctx.createRadialGradient(32, 32, 2, 32, 32, 32)
  gradient.addColorStop(0, 'rgba(56, 17, 7, .72)')
  gradient.addColorStop(0.45, 'rgba(56, 17, 7, .43)')
  gradient.addColorStop(1, 'rgba(56, 17, 7, 0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 64, 64)
  return new CanvasTexture(canvas)
}
