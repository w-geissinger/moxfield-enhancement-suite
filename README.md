# Moxfield Enhancement Suite

Hi! Welcome to the code. Moxfield Enhancement Suite is intended to be a small set of tools to improve the user experience of [Moxfield](https://moxfield.com/). This project is currently in the **early stages of development.** There is a closed beta starting soon, so if you're interested in the features listed below, reach out and you will be whitelisted for the beta!

Once this project is publicly available on the chrome store, I'll be sure to add a link here.

## Features

There's a small set of features that I have been dreaming about, and I wanted them enough that I chose to build my own extension. With that being said, this is by no means a definitive list, and I am always happy to hear (reasonably achievable) ideas for new features.

### Features in progress
- **Conversion of CSV formats** that Moxfield does not support (currently, **TCGPlayer** is my focus)
- **Bulk-import of CSVs** from other sites/apps (currently, **TCGPlayer** is my focus)

### Features in planning
- **Saving and reloading searches** in your collection and other search pages
- An improved set of **advanced filtering controls** for searching in your collection and other search pages

# Dev Stuff
Want to tinker, or maybe even make a PR? Below are the things you'll need to get the extension up and running in a development environment.

## Getting Started

### Prerequisites:
- Have [`pnpm`](https://pnpm.io/installation) installed
- Have [Google Chrome](https://www.google.com/chrome/dr/download/) installed (wider browser support in planning)

### Getting Started

Once you've cloned the repo for the first time, you'll need to make sure to run `pnpm install` within the project's root directory. After that, you should be able to `pnpm run dev` to spin up the development server!

The first time you go to use the extension, you'll need to install the built extension located in `/moxfield-enhancement-suite/dist`. 

To do this:
-  visit `chrome://extensions/` in Chrome
- enable "Developer Mode" in the top right of the page
- Click **load unpacked**
- Choose the `/moxfield-enhancement-suite/dist` directory and the extension should be installed!

Now, you should be ready to visit Moxfield. Currently, the only place where the extension will add anything to the page is on your [collection](https://moxfield.com/collection/) page.

This extension uses [vite](https://vite.dev/), which enables the extension to update its contents as you save files within the project. Whenever you've made a change, simply reloading the page you're working in should be enough to see updated UI.