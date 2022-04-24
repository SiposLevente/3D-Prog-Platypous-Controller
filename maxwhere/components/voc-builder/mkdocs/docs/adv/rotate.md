# rotate

## Usage

Rotates the input quaternion with the specified values.

## Configuration

- `Orientation type` Type of orientation.
  - `quaternion` Offset rotation is set as quaternion
    - `x` `y` `z` `w` values of quaternion
  - `angle-axis` Offset rotation is set as angle axis
    - `x` `y` `z` axis of rotation
    - `angle` angle of rotation in degrees

## Input

- `msg.payload` is used as a quaterion. Example: `{x:0.707,y:0,z:0, w: 0.707}`

## Output

A quaterion which holds the value of the input quaterion rotated by the offset quaternion which sent in the `msg.payload` property.
