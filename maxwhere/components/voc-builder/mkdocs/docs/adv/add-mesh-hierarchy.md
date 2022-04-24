# add mesh hierarchy

![add light](../img/add-mesh-hierarchy-node.png)

## Usage

Adds a collection of meshes to the Where, with the specified hierarchy.

## Hierarchy tree

On the top of the editor the hierarchy tree can be built.

- `Add child` Click on a element to select it and then click on the `Add` button to add a child mesh to it.
- `Remove a mesh` Click on a element to select it and then click on the `Remove` button to remove it from the tree.
- `Rename the element` Click on a element to select it and then click on the `Rename` button to rename the element on the tree.

## Configuration

### Edit confguration of a mesh.

Click on the selected mesh and edit the configuration of the given mesh.

#### Mesh Configuration

- `Node id` ID of MaxWhere node to be set.
- `Mesh file` Name of the mesh file to use
- `Position` The Node's position in 3d scene. Default is {x: 0.0, y: 0.0, z: 0.0}.
- `Orientation` {x, y, z, w} - Node's orientation in 3d scene. Default is {w: 1.0, x: 0.0, y: 0.0, z: 0.0}
- `Scale` {x, y, z} | Number - The Node's scale along axes. Default is {x: 1.0, y: 1.0, z: 1.0}.
- `Physical`
  - `autophysical` Whether to generate a simple physical shape for the Node.
  - `raycast` Whether the physical is pointable by mouse.

### Node Configuration

- `Create on` Sets whether the mesh is created on `initialization` or `input`
  - `Initialization` The mesh is added to the Where when the flow is started/deployed
  - `Input`: A mesh is added when the node gets an input. The input `msg.payload` content can overwrite properties of the mesh to create. [`Here`](https://github.com/MaxWhere/mxw-devguide/blob/master/docs/api/mesh.md#new-meshoptions) you can see the options.
- `Save` If turned on the runtime changes made to the `position`, `orientation` and `scale` are saved when the `Ctrl + S` key combination is used. Currently only supported if `Create on` is set to `Initialization`.
- `Display name` Name of the node in the editor.

## Input

If `Create on` is set to `input` it adds a mesh hierartchy and `msg.payload` overwrites provided `options`.

## Output

After mesh hierarchy is created a message is added to `msg.payload`.
