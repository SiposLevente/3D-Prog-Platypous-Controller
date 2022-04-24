# animate

## Usage

Animates the Node by changing the specified attribute of its transformation. Animation will change the attribute according to the specified option parameters step by step.

## Configuration

- `Node ID` selects the node on which the trasformation applied
- `Attribute` Transformation type. Possible values are `position`, `scale`, `orientation`.
- `To` Values of the animated attribute for every step. The length of array should be equal to number of animation steps.
- `Duration` Duration of animation steps in seconds.
- `Repeat` Repeat the animation for ever. Default is false.
- `Loop` Loop the animation for ever. Animation will be played, then played backwards and repeated (overrides repeat if given contradictory). Default is false.
- `Cubic` The cubic easing function of the animation which defines the curve of temporal run.
- `Reference` Reference of the attribute adjustment. Possible values are: absolute (default), relative.
- `Space` Space the attribute adjustment is applied in. Possible values are: local, parent (default), world
- `Display name` Name of the node in the editor.

## Input

- Input triggers the node, but `msg` content is not used.

## Output

- After animation is completed object is sent containing the selected node in the `msg.payload` property
