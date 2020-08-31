# Stroke Order Image

This web server utilizes the images from the [Wikimedia Commons Stroke Order Project](https://commons.wikimedia.org/wiki/Commons:Stroke_Order_Project) to pull out either an animated or non-animated picture of the stroke order of a given Kanji character (assuming that the Stroke Order Project has the stroke order for the character.)

# Usage
This is meant to be a drop-in module of a Modular type Express Server, as used in the [Express Server Templates](https://github.com/ChlodAlejandro/express-server-templates/tree/master/modular).

This module requires [`fs-jetpack`](https://www.npmjs.com/package/fs-jetpack) and [`axios`](https://www.npmjs.com/package/axios).

Simply put, put the `kanji-resolver.js` file into your `modules` folder. You may choose to configure the module by modifying the declared variables in the same file. After that, put the contents of `images` in a static folder, and make sure that the `placeholderImagesPath` constant in `kanji-resolver.js` refers to the correct path.

## Security
If you are able to find security issues, please disclose them in an email to [chlod@chlod.net](mailto:chlod@chlod.net).