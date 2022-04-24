# mesh animator

## Usage

Starts or stops given animator on mesh

## Configuration

- `Mesh ID` ID of MaxWhere mesh where animator should be used.
- `Animator` Names of available animators on mesh.
- `Display name` Name of the node in the editor.

## Input

If `msg.payload` is truthy value then, set aimator is started.
If `msg.payload` is falsy value then, set animator is stopped.

## Output

After animator is set a message is sent on the output.
