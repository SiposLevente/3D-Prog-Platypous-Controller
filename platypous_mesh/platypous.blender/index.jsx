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
    position={{ x: 38.509647369384766, y: 16.515653610229492, z: -0.0 }}
    orientation={{ w: 1.0, x: 0.0, y: 0.0, z: -0.0 }}
    scale={{ x: 0.001674557919614017, y: 0.001674557919614017, z: 0.001674557919614017 }}>
    <mesh
      {...{ url: 'Body.mesh' }}
      physical={{ raycast: true }}
      done={ m => {m.addPhysicalShape({shape: 'mesh', mesh: 'Body_phy.obj', mass: 1 })  } }>
    </mesh>
  </node>
</root>
