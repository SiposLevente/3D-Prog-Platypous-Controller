<root>
  <node
    position={{ x: 407.6245422363281, y: 590.38623046875, z: -100.54539489746094 }}
    orientation={{ w: 0.5709474682807922, x: 0.16907577216625214, y: 0.7558804154396057, z: -0.27217140793800354 }}>
    <light
      {...{ lighttype: 'point' }}
      direction={{ x: 0, y: -1, z: 0 }}
      diffuse={{ r: 1.0, g: 1.0, b: 1.0 }}
      specular={{ r: 1.0, g: 1.0, b: 1.0 }}>
    </light>
  </node>
  <node
    position={{ x: 120.00000762939453, y: 22.5, z: -5.9138983488082886e-06 }}
    orientation={{ w: 1.0, x: 0.0, y: 0.0, z: -0.0 }}
    scale={{ x: 0.004999999888241291, y: 0.004999999888241291, z: 0.004999999888241291 }}>
    <mesh
      {...{ url: 'Body001.mesh' }}
      physical={{ raycast: true }}
      done={ m => {m.addPhysicalShape({shape: 'mesh', mesh: 'Body001_phy.obj', mass: 1 })  } }>
    </mesh>
  </node>
  <node
    position={{ x: 120.00000762939453, y: 28.5, z: -0.0 }}
    orientation={{ w: 1.0, x: 0.0, y: 0.0, z: -0.0 }}
    scale={{ x: 0.004999999888241291, y: 0.004999999888241291, z: 0.004999999888241291 }}>
    <mesh
      {...{ url: 'Wheel_holder.mesh' }}
      physical={{ raycast: true }}
      done={ m => {m.addPhysicalShape({shape: 'mesh', mesh: 'Wheel_holder_phy.obj', mass: 1 })  } }>
    </mesh>
  </node>
  <node
    position={{ x: 0.0, y: 50.0, z: -0.0 }}
    orientation={{ w: 1.0, x: 0.0, y: 0.0, z: -0.0 }}
    scale={{ x: 0.004999999888241291, y: 0.004999999888241291, z: 0.004999999888241291 }}>
    <mesh
      {...{ url: 'Body.mesh' }}
      physical={{ raycast: true }}
      done={ m => {m.addPhysicalShape({shape: 'mesh', mesh: 'Body_phy.obj', mass: 1 })  } }>
    </mesh>
  </node>
</root>
