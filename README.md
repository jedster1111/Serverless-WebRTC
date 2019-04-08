# Serverless-WebRTC

## What?

This repo provides [React Hooks](https://reactjs.org/docs/hooks-intro.html) to help you quickly set up connections between browsers with minimum code and infrastructure setup. This is achieved using [WebRTC](https://webrtc.org/) and Google provided STUN servers (by default). Connections are made are passed between hosts and clients by copy pasting strings.

## Dev Commands

In the project directory, you can run:  
- `yarn` - Install dev dependencies.
- `yarn start` - Start the dev server. Project will open at [`localhost:3000`](http://localhost:3000)
- `yarn test` - Will run tests in watch mode.
- `yarn test:ci` - Will run the tests and exit with an error code if there are failures.
- `yarn lint` - Will check linting of  `.ts`, `.tsx` and `.css` files and report errors.
- `yarn lint:fix`- Will lint `.ts`, `.tsx` and `.css` files.
- `yarn build` - Creates a production build of the react project. Can be found in `build` directory.
