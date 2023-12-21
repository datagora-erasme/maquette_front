<p align="center">
    <img src="https://upload.wikimedia.org/wikipedia/fr/thumb/b/b8/Logo_M%C3%A9tropole_Lyon_-_2022.svg/1200px-Logo_M%C3%A9tropole_Lyon_-_2022.svg.png" width="250">
    <img src="https://upload.wikimedia.org/wikipedia/fr/7/77/Logo_Universit%C3%A9_de_Lyon.png" width="250">
    <img src="https://images.exo-dev.fr/Logo_DatAgora.png" width="100">
    <img src="https://images.exo-dev.fr/white_creation_exo_dev.png" width="150">
</p>

# About this project

The augmented mockup project was born during an experiment as part of the MAM project: Mediation and Augmented Modeling. Various workshops were organized in collaboration with LabEx IMU, ERASME Urban Lab and the École Urbaine de Lyon.

The project consists of a model of a city district made from Lego and created from a web platform. This model is intended to be installed in public places and used in the context of mediation or neighborhood council.

# About this repository

This project aims to provide an interactive and immersive experience for creating and visualizing LEGO-based models using 3D cartographic data. Here's an overview of the key functionalities of the frontend project:

- **3D Map Visualization**: The application allows users to visualize a 3D map of the world, offering a realistic representation of the geographical environment, including buildings and structures rendered in three dimensions directly on the map.

- **LEGO Plate Selection**: Users can select the number of LEGO plates (32x32) they intend to use for assembling the model. This selection determines the size of the portion of the map that can be easily chosen.

- **Interactive Region Selection**: Depending on the number of plates chosen, a smaller or larger portion of the map can be interactively selected. This feature enables users to define the specific area they want to focus on.

- **[Voxelization](#voxelisation) of Buildings**: Upon validating the selection, the buildings within the chosen area are [voxelized](#voxelisation). This process is carried out using [the maquette_back_erasme project](https://github.com/datagora-erasme/maquette_back).

- **LEGO Assembly Guide Generation**: After voxelization, users can generate a LEGO assembly guide for the model. This guide is provided in the form of a heightmap in CSV format, facilitating the process of constructing the LEGO model.

- **3D Model Visualization**: Users have the option to view the assembled LEGO model in a 3D format directly within the application. This visualization provides an accurate representation of the model's appearance.

- **Projection Mode**: The application offers a projection mode that allows users to go full-screen and center their view on the selected area from a top-down perspective. This mode is particularly useful for projecting the selected area and relevant data onto LEGO plates.

Sure, here's a mini guide for installing and running the project based on the provided commands:

## Voxelisation

Voxelization is the process of converting a continuous 3D object into a grid of discrete volumetric elements known as voxels, allowing representation of complex shapes in a grid-based structure. Further details on voxelization can be found in [the maquette_back project's description](https://github.com/datagora-erasme/maquette_back/blob/main/README.md#voxelization-).

## Selection of the area

![Selection](https://i.imgur.com/oYZk0ZP.png)

## LEGO Assembly guide (CSV)


![CSV](https://i.imgur.com/ugwL2c0.png)


## Project Setup

### Prerequisites
This project run in Node 16.19.1

You need to install Node and NPM first
https://docs.npmjs.com/downloading-and-installing-node-js-and-npm

Then install Yarn
```
npm install --global yarn
```

### Install node modules
```
yarn install
```

This command will install the necessary dependencies required for the project.

### Compiles and Hot-Reloads for Development
```
yarn serve
```

This command compiles the project and sets up a development server with hot-reloading. This means that any changes you make to the code will automatically be reflected in the browser without having to manually refresh the page.

### Compiles and Minifies for Production
```
yarn build
```

This command compiles and minifies the project for production. The output will be optimized and ready for deployment.

### Lints and Fixes Files
```
yarn lint
```

Running this command will perform linting on your code and automatically fix any fixable issues according to the linting rules you've set up for the project. This helps ensure code quality and consistency.

Remember to execute these commands in your project's root directory using a command-line interface like the terminal or command prompt.

## Project dependencies

Here are the main dependencies used in the project. The complete list can be found in [the package.json file](./package.json).

- **vue**: The core library for building user interfaces in the project.
- **vuex**: Manages the state of the application and enables state management across components.
- **itowns**: Provides 3D visualization tools for mapping and rendering geographic data.
- **three**: Enables rendering and manipulation of 3D scenes.
- **proj4**: Handles coordinate transformations and projections for mapping.
- **gsap**: Offers animation capabilities to enhance user interactions.
- **axios**: Facilitates making HTTP requests to external resources, mainly to [the maquette_back project](https://github.com/datagora-erasme/maquette_back/).
- **vuetify** and **@mdi/font**: These dependencies work together to integrate Material Design components, styles, and icons, enhancing the user interface with a consistent and visually appealing design.
- **@kyvg/vue3-notification**: Enables notifications to provide user feedback.
- **core-js**: Offers polyfills for modern JavaScript features to ensure compatibility.
- **dotenv**: Allows the use of environment variables for configuration.
- **universal-cookie**: Simplifies working with cookies for storing data on the client side.

## Others details that might be useful

### Colors used in the project

- **Green** : #1B5E20 (green-darken-4 in vuetify)

- **Purple** : #414288

- **Beaver** : #37474F

- **Red (black bean)** : #3F0D12

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
