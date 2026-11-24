import { memo, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Color, DoubleSide, MathUtils, MeshBasicMaterial, MeshStandardMaterial, Object3D, OrthographicCamera, PlaneGeometry, Vector3 } from 'three'
import type { Group, InstancedMesh, Mesh } from 'three'
import { bunGeometry, cheeseGeometry, domeHeight, grainTexture, lettuceGeometry, pattyGeometry, randomFrom, shadowTexture, sliceGeometry } from './burgerModel'

type SceneProps = {
  track: React.RefObject<HTMLElement | null>
  pin: React.RefObject<HTMLDivElement | null>
  stage: React.RefObject<HTMLDivElement | null>
  onReady: () => void
  onFailure: () => void
}

const layers = [
  { name: 'Bottom bun', y: -2.49, x: -0.11, tilt: 0.065, turn: -0.12, end: -2.57, startAt: 0, endAt: 0.26 },
  { name: 'Patty', y: -1.72, x: 0.15, tilt: -0.04, turn: 0.27, end: -2.43, startAt: 0.08, endAt: 0.43 },
  { name: 'Cheddar', y: -0.96, x: -0.14, tilt: 0.03, turn: 0.12, end: -2.28, startAt: 0.16, endAt: 0.54 },
  { name: 'Pickles', y: -0.29, x: 0.16, tilt: 0.13, turn: -0.26, end: -2.213, startAt: 0.24, endAt: 0.65 },
  { name: 'Tomato', y: 0.40, x: -0.14, tilt: 0.04, turn: 0.27, end: -2.104, startAt: 0.31, endAt: 0.75 },
  { name: 'Lettuce', y: 1.13, x: 0.14, tilt: -0.025, turn: 0.34, end: -1.97, startAt: 0.39, endAt: 0.84 },
  { name: 'Top bun', y: 1.88, x: -0.07, tilt: 0.045, turn: -0.31, end: -1.88, startAt: 0.46, endAt: 0.91 },
]
const topBun = layers[layers.length - 1]
const contactSurfaces = [0.026, 0.156, 0.03, 0.047, 0.087, 0.07]
const pickleSlices = [[-0.65, 0.008, 0.22, -0.26], [0.002, -0.023, -0.39, 0.6], [0.63, 0.014, 0.30, 0.19]]

function landing(progress: number, layer: (typeof layers)[number]) {
  return MathUtils.smootherstep(progress, layer.startAt, layer.endAt)
}

function cameraZoom(width: number, height: number, progress: number) {
  const framing = MathUtils.lerp(6.18, 4.45, landing(progress, topBun))
  const push = MathUtils.smootherstep(progress, topBun.endAt, 0.985)
  return Math.min(width / 3.76, height / framing) * (1 + push * 0.075)
}

function Toppings({ seeds }: { seeds: boolean }) {
  const mesh = useRef<InstancedMesh>(null)
  const count = seeds ? 79 : 430

  useLayoutEffect(() => {
    if (!mesh.current) return
    const random = randomFrom(seeds ? 433 : 719)
    const piece = new Object3D()
    const color = new Color()

    for (let index = 0; index < count; index++) {
      const angle = index * 2.39996 + random() * 0.24
      if (seeds) {
        const radius = 1.24 * Math.sqrt((index + random()) / count)
        const y = domeHeight(radius) + 0.008
        piece.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius)
        const slope = (domeHeight(Math.min(radius + 0.01, 1.33)) - domeHeight(radius)) / 0.01
        const normal = new Vector3(-slope * Math.cos(angle), 1, -slope * Math.sin(angle)).normalize()
        piece.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), normal)
        piece.rotateY(random() * Math.PI)
        piece.scale.set(0.043 + random() * 0.023, 0.013, 0.016 + random() * 0.008)
        color.set(random() < 0.22 ? '#dba860' : '#ffe2a5')
      } else {
        const rim = index < count * 0.66
        const ripple = 0.032 * Math.sin(angle * 17) + 0.026 * Math.cos(angle * 33)
        const radius = rim ? (1.27 + random() * 0.074) * (1 + ripple) : 1.24 * Math.sqrt(random())
        const y = rim ? (random() - 0.48) * 0.245 : 0.133 + random() * 0.015
        piece.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius)
        piece.rotation.set(random() * 3, random() * 3, random() * 3)
        const size = 0.017 + random() ** 1.8 * 0.038
        piece.scale.set(size * 1.35, size * 0.78, size)
        color.set(random() > 0.53 ? '#985035' : '#4b2214').multiplyScalar(0.7 + random() * 0.6)
      }
      piece.updateMatrix()
      mesh.current.setMatrixAt(index, piece.matrix)
      mesh.current.setColorAt(index, color)
    }

    mesh.current.instanceMatrix.needsUpdate = true
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true
  }, [count, seeds])

  return <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
    <sphereGeometry args={[1, seeds ? 9 : 6, 6]} />
    <meshStandardMaterial roughness={seeds ? 0.56 : 0.89} />
  </instancedMesh>
}

function Burger({ track, pin, stage, onReady, onFailure }: SceneProps) {
  const burgerFrame = useRef<Group>(null)
  const layerGroups = useRef<Array<Group | null>>([])
  const floorShadow = useRef<MeshBasicMaterial>(null)
  const contactShadows = useRef<Array<Mesh | null>>([])
  const pickles = useRef<InstancedMesh>(null)
  const target = useRef(0)
  const progress = useRef(0)
  const moving = useRef(false)
  const visible = useRef(false)
  const { camera, gl, invalidate, size } = useThree()
  const assets = useMemo(() => {
    const grain = grainTexture()
    return {
      base: bunGeometry(false),
      patty: pattyGeometry(),
      cheese: cheeseGeometry(),
      pickle: sliceGeometry('pickle'),
      pickleMaterial: new MeshStandardMaterial({ vertexColors: true, roughness: 0.47, bumpMap: grain, bumpScale: 0.017 }),
      tomato: sliceGeometry('tomato'),
      leaf: lettuceGeometry(0.34),
      secondLeaf: lettuceGeometry(0.98),
      dome: bunGeometry(true),
      grain,
      shadowPlane: new PlaneGeometry(1, 1),
      shadow: shadowTexture(),
    }
  }, [])

  useEffect(() => () => Object.values(assets).forEach((asset) => asset.dispose()), [assets])

  useLayoutEffect(() => {
    if (!(camera instanceof OrthographicCamera)) return
    camera.zoom = cameraZoom(size.width, size.height, progress.current)
    camera.lookAt(0, 0.035, 0)
    camera.updateProjectionMatrix()
  }, [camera, size.width, size.height])

  useLayoutEffect(() => {
    const mesh = pickles.current
    if (!mesh) return
    const chip = new Object3D()
    pickleSlices.forEach(([x, y, z, rotation], index) => {
      chip.position.set(x, y, z)
      chip.rotation.set(0, rotation, 0.04 * (index - 1))
      chip.updateMatrix()
      mesh.setMatrixAt(index, chip.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
  }, [])

  useEffect(() => {
    const element = track.current
    const sticky = pin.current
    const panel = stage.current
    if (!element || !sticky || !panel) return

    const update = () => {
      if (!visible.current) return
      const rect = element.getBoundingClientRect()
      const stickyTop = Number.parseFloat(getComputedStyle(sticky).top) || 0
      const distance = Math.max(1, element.offsetHeight - sticky.offsetHeight)
      target.current = MathUtils.clamp((stickyTop - rect.top) / distance, 0, 1)
      invalidate()
    }

    const observer = new IntersectionObserver(([entry]) => {
      visible.current = entry.isIntersecting
      if (entry.isIntersecting) update()
      else moving.current = false
    })
    const onContextLost = (event: Event) => {
      event.preventDefault()
      onFailure()
    }

    const bounds = panel.getBoundingClientRect()
    visible.current = bounds.bottom > 0 && bounds.top < window.innerHeight
    update()
    progress.current = target.current
    observer.observe(panel)
    gl.domElement.addEventListener('webglcontextlost', onContextLost)
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    onReady()

    return () => {
      observer.disconnect()
      gl.domElement.removeEventListener('webglcontextlost', onContextLost)
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [gl, invalidate, onFailure, onReady, pin, stage, track])

  useFrame((_, dt) => {
    if (!visible.current) return
    const remaining = Math.abs(target.current - progress.current)
    // In a demand-rendered canvas the first delta can include the whole idle period.
    const delta = Math.min(dt, moving.current ? 0.1 : 1 / 30)
    moving.current = remaining >= 0.00008
    progress.current = moving.current ? MathUtils.damp(progress.current, target.current, 13, delta) : target.current
    const progressValue = progress.current
    const topLanding = landing(progressValue, topBun)
    if (burgerFrame.current) burgerFrame.current.position.y = (topBun.y - topBun.end) * 0.51 * topLanding

    for (let index = 0; index < layers.length; index++) {
      const group = layerGroups.current[index]
      if (!group) continue
      const layer = layers[index]
      const settled = landing(progressValue, layer)
      const drift = 1 - settled
      group.position.set(layer.x * drift * (1 + settled), MathUtils.lerp(layer.y, layer.end, settled), layer.x * drift * 0.4)
      group.rotation.set(layer.tilt * drift, MathUtils.lerp(layer.turn, layer.name === 'Cheddar' ? -0.20 : 0, settled), layer.x * 0.45 * drift)
    }
    for (let index = 0; index < contactSurfaces.length; index++) {
      const shadow = contactShadows.current[index]
      const lower = layerGroups.current[index]
      const upper = layerGroups.current[index + 1]
      if (!shadow || !(shadow.material instanceof MeshBasicMaterial) || !lower || !upper) continue
      const gap = upper.position.y - lower.position.y - (layers[index + 1].end - layers[index].end)
      shadow.material.opacity = 0.46 * (1 - MathUtils.smoothstep(gap, 0, 0.28))
      shadow.visible = shadow.material.opacity > 0
    }
    if (floorShadow.current) floorShadow.current.opacity = 0.37 + 0.48 * topLanding
    if (camera instanceof OrthographicCamera) {
      const zoom = cameraZoom(size.width, size.height, progressValue)
      if (camera.zoom !== zoom) {
        camera.zoom = zoom
        camera.updateProjectionMatrix()
      }
    }
    if (moving.current) invalidate()
  })

  const shapes = [
    <mesh geometry={assets.base}>
      <meshStandardMaterial vertexColors roughness={0.57} bumpMap={assets.grain} bumpScale={0.024} />
    </mesh>,
    <>
      <mesh geometry={assets.patty}>
        <meshStandardMaterial vertexColors roughness={0.92} bumpMap={assets.grain} bumpScale={0.039} />
      </mesh>
      <Toppings seeds={false} />
    </>,
    <mesh geometry={assets.cheese}>
      <meshStandardMaterial vertexColors side={DoubleSide} roughness={0.43} bumpMap={assets.grain} bumpScale={0.008} />
    </mesh>,
    <instancedMesh ref={pickles} args={[assets.pickle, assets.pickleMaterial, pickleSlices.length]} />,
    <mesh geometry={assets.tomato}>
      <meshStandardMaterial vertexColors roughness={0.38} bumpMap={assets.grain} bumpScale={0.009} />
    </mesh>,
    <>
      <mesh geometry={assets.leaf}>
        <meshStandardMaterial vertexColors side={DoubleSide} roughness={0.59} bumpMap={assets.grain} bumpScale={0.026} />
      </mesh>
      <mesh geometry={assets.secondLeaf} position={[0.025, -0.06, -0.015]} scale={[0.92, 0.67, 0.92]}>
        <meshStandardMaterial vertexColors side={DoubleSide} roughness={0.66} bumpMap={assets.grain} bumpScale={0.02} />
      </mesh>
    </>,
    <>
      <mesh geometry={assets.dome}>
        <meshStandardMaterial vertexColors roughness={0.44} bumpMap={assets.grain} bumpScale={0.024} />
      </mesh>
      <Toppings seeds />
    </>,
  ]

  return <>
    <hemisphereLight args={['#fff4dd', '#e4a275', 1.45]} />
    <directionalLight position={[-3.4, 5.2, 4.3]} color="#fff0ce" intensity={2.7} />
    <directionalLight position={[3.8, 2, -4]} color="#ffaf70" intensity={1.7} />
    <directionalLight position={[3, 1.2, 5]} color="#ffe5c4" intensity={0.55} />
    <group ref={burgerFrame}>
      <mesh geometry={assets.shadowPlane} position={[0, -2.91, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[3.38, 2.6, 1]}>
        <meshBasicMaterial ref={floorShadow} map={assets.shadow} transparent opacity={0.37} depthWrite={false} />
      </mesh>
      {layers.map((layer, index) => <group key={layer.name} position={[layer.x, layer.y, 0]} ref={(group) => { layerGroups.current[index] = group }}>
        {shapes[index]}
        {index < contactSurfaces.length && <mesh ref={(mesh) => { contactShadows.current[index] = mesh }} geometry={assets.shadowPlane} position={[0, contactSurfaces[index], 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[2.55, 2.1, 1]} visible={false}>
          <meshBasicMaterial map={assets.shadow} transparent opacity={0} depthWrite={false} />
        </mesh>}
      </group>)}
    </group>
  </>
}

export default memo(function BurgerScene(props: SceneProps) {
  return <Canvas orthographic dpr={[1, 1.5]} frameloop="demand" resize={{ scroll: false }} camera={{ position: [2.65, 1.36, 10], near: 0.1, far: 35 }} gl={{ antialias: true, alpha: true }}>
    <Burger {...props} />
  </Canvas>
})
