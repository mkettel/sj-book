/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Author: araghon007 (https://sketchfab.com/araghon007)
License: CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
Source: https://sketchfab.com/3d-models/disco-ball-e4c3b485680843c7a7a827d04ac28743
Title: Disco Ball
*/

import React, { useRef, useEffect } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { Vector3 } from 'three'

export function Disco(props) {
  const group = useRef()
  const { nodes, materials, animations } = useGLTF('/3d-model/disco-ball.glb')
  const { actions } = useAnimations(animations, group)

  const startPosition = new Vector3(props.position[0], props.position[1] + 3.5, props.position[2])
  const endPosition = new Vector3().fromArray(props.position)
  const lerpFactor = 0.012

  useEffect(() => {
    if (group.current) {
      group.current.position.copy(startPosition)
    }
  }, [])

  useFrame((state, delta) => {
    if (group.current) {
      // Lerp the position
      group.current.position.lerp(endPosition, lerpFactor)
      
      // Rotate the disco ball
      group.current.rotation.y += delta * 0.3
    }
  })

  return (
    <group ref={group} {...props} dispose={null}>
      <group name="Sketchfab_Scene">
        <group name="Sketchfab_model" rotation={[-Math.PI / 2, 0, 0]} scale={0.004}>
          <group name="77ca7a1964844b17856a50fc4602567dfbx" rotation={[Math.PI / 2, 0, 0]}>
            <group name="Object_2">
              <group name="RootNode">
                <group name="Sphere001" rotation={[-Math.PI / 2, 0, 0]} scale={2.54}>
                  <mesh
                    name="Sphere001_02_-_Default_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['Sphere001_02_-_Default_0'].geometry}
                    material={materials['02_-_Default']}
                  />
                  <mesh
                    name="Sphere001_01_-_Default_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['Sphere001_01_-_Default_0'].geometry}
                    material={materials['01_-_Default']}
                  />
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  )
}

useGLTF.preload('/3d-model/disco-ball.glb')
