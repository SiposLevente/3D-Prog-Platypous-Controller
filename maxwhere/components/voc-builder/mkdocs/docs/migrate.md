# Migrate

This page discusses how to include the VoC and the gizmo to another project.

## How to include the VoC-Builder into another Where?

1. Copy the component folder from the example app on the `./components/voc-builder` to your app\`s `./components` folder.
2. Register the component by editing the `where.json` file. In the file\`s `components` object add the following property `"voc-builder": "./components/voc-builder/component.json"`
3. Create an instance of the VoC-Builder by inculding it in the `index.jsx` file.
   Example: `<voc-builder userDir="userDir" flowFile="./../../myVoc/exampleFlows.json" resources="./../../myVoc/resources"/>`
   Where the `userDir` property sets the folder where the user-specific files are written, the `resources` property sets the resource folder where the mesh and material files are stored and the `flowFile` property sets the flow file which should be used. If the file does not exists, a new empty file is created.
   The `userDir`, `resources` and `flowFile` path can be either absolute or relative.

## How to include the Gizmo into another Where?

1. Copy the component folder from the example app on the `./components/threejs-gizmo` to your app\`s `./components` folder.
2. Register the component by editing the `where.json` file. In the file\`s `components` object add the following property `"threejs-gizmo": "./components/threejs-gizmo/component.json"`
3. Create an instance of the VoC-Builder by inculding it in the `index.jsx` file.
   Example: `<threejs-gizmo />`
