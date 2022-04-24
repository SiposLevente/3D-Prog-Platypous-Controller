# set skybox

## Usage

Sets the skybox material of the Where.

## Configuration

- `Set on` Sets whether the skbox is set on `initialization` or `input`
  - `Initialization` The skybox is set when the Where starts.
  - `Input`:The skybox is set on input.
- `Material` Material to set as skybox.

- `Distance` Distance of skybox

- `Display name` Name of the node in the editor.

## Input

- if `Set on` is set to `Input` then input triggers the node, but `msg` content is not used.

## Output

After skybox is set a message is added to `msg.payload`
