<root>
  <ts-skeleton />
  {/* <mw-powerup /> */}
  {/* <osm /> */}
  <node
    position={{
      x: -49.51930236816406,
      y: 0,
      z: 179.03160095214844,
    }}
    orientation={{
      w: 0.0,
      x: 0.0,
      y: 0.7071068286895752,
      z: 0.7071068286895752,
    }}
    scale={{ x: 250.0, y: 250.0, z: 250.0 }}
  >
    <mesh
      {...{ url: 'terrain.mesh' }}
      physical={{ raycast: true, collision: true, 'link-type': 'kinematic' }}
      autophysical={true}
    />
  </node>
  <node
    position={{
      x: -38.401222229003906,
      y: -0.010370822623372078,
      z: 179.09011840820312,
    }}
    orientation={{
      w: 0.0,
      x: 0.0,
      y: 0.7071068286895752,
      z: 0.7071068286895752,
    }}
    scale={{ x: 250.0, y: 250.0, z: 250.0 }}
  >
    <mesh
      {...{ url: 'Plane.029.mesh' }}
      physical={{ raycast: true }}
      done={(m) => {
        m.addPhysicalShape({
          shape: 'mesh',
          mesh: 'Plane.029.mesh_phy.obj',
          mass: 1,
        });
      }}
    />
  </node>
</root>;
