# set material

## Usage

Sets the material of the selected mesh.

## Configuration

- `Mesh ID` ID of MaxWhere mesh where material should be set.
- `Subvisual` Index of subvisual to set material.
- `Material` Material to set.
- `Display name` Name of the node in the editor.

## Input

- input triggers the node, but `msg` content is not used.

## Output

- After material is set an object is sent containing the selected node in the `msg.payload` property
