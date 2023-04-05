const fs = require('fs');
const puppeteer = require('puppeteer');
const ejs = require('ejs');
const postcss = require('postcss');
const tailwind = require('tailwindcss');
const tailwindcss = require('@catppuccin/tailwindcss');
const path = require("path");

// import { renderFile } from 'ejs';
// import tailwind from "tailwindcss";
// import postcss from "postcss";
// import tailwindcss from "@catppuccin/tailwindcss";
// import puppeteer from "puppeteer";
// import fs from "fs";
// import path from "path";

/**
 * @typedef {Object} Bind
 * @property {string} description - The description of the keybind.
 * @property {string} key - The key bind.
 */


/**
 * @typedef {Object} Category
 * @property {string} name - The category name.
 * @property {Bind[]} binds - The key binds of this category
 */

/**
 * @typedef {Object} Config
 * @property {string} theme - The theme of the cheatsheet.
 * @property {string} title - The title of the cheatsheet.
 * @property {number} columns - Number of columns wide.
 * @property {number} width - Width in pixels of the output.
 * @property {Category[]} categories - An array of categories.
 */


/**
 * Generates a cheatsheet HTML string from the given data object.
 *
 * @param {Config} options - The config object to use for generating the cheatsheet.
 * @returns {Promise<string>} - A Promise that resolves to the generated HTML string.
 */
const generate = async (options) => {
    const cheatsheet = await ejs.renderFile(path.join(__dirname, "/cheatsheet.ejs"), options);

    // @ts-ignore
    const result = await postcss([
        // @ts-ignore
        tailwind({
            content: [{ raw: cheatsheet, extension: "html" }],
            plugins: [
                tailwindcss({
                  defaultFlavour: options.theme
                }),
              ],
              theme: {
                fontFamily: {
                    mono: ['"Space Mono"']
                }
              }
        }),
    ]).process(`@tailwind base;@tailwind components;@tailwind utilities;`, {
        from: undefined,
    });

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Space+Mono&display=swap" rel="stylesheet">
        <style>${result.css}</style>
    </head>
    <body>
        ${cheatsheet}
    </body>
    </html>
    `;

    return html;
}

/**
 * Generates a screenshot of a cheatsheet based off the provided config.
 *
 * @param {Config} options - The config object to use for generating the cheatsheet.
 * @returns {Promise<void>} Image is saved as a side-effect.
 */
const screenshot = async (options) => {
    const html = await generate(options);
    const selector = '#sheet';
  
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
  
    // Set the HTML content of the page
    await page.setContent(html);

    await page.setViewport({ width: options.width, height: 600, deviceScaleFactor: 10 });
    
    // Wait for the selector and fonts to load
    await page.waitForSelector(selector);
    await page.evaluateHandle('document.fonts.ready');
  
    // Get the bounding box of the element
    const element = await page.$(selector);
    const box = await element.boundingBox();
  
    // Take a screenshot of the element
    await page.screenshot({
      clip: {
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height,
      },
      path: 'output.png',
    });
  
    await browser.close();
}

/**
 * Extracts config object from a provided JSON file path.
 *
 * @returns {Config} - Image is saved as a side-effect.
 */
const process_args = () => {
    // Get the command-line arguments
    const args = process.argv.slice(2);

    // Check if a filename was passed
    if (args.length !== 1) {
        console.error('Please provide a JSON file for generation');
        process.exit(1);
    }

    // Read the file contents as a string
    const filename = args[0];
    const fileContents = fs.readFileSync(filename, 'utf8');

    // TODO: Check/verify config properties...

    // Parse and return the JSON data
    return JSON.parse(fileContents);
}

module.exports = { generate, screenshot, process_args };
// export = { generate, screenshot, process_args };
