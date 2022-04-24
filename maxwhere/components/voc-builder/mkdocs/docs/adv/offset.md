# offset

## Usage

Offsets a vector by the specified values.
Can be used to offset a position or scale vector.

## Configuration

- `Offset vector`Value of offset vector which is added to the input.

## Input

- `msg.payload` is used as a vector. Example: `{x:10,y:10,z:0}`

## Output

A vector which holds the value of the input vector offsetted by the offset vector which sent in the `msg.payload` property.
