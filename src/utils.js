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

const generate = async (options) => {
    const cheatsheet = await ejs.renderFile(path.join(__dirname, "/cheatsheet.ejs"), options);

    const result = await postcss([
        tailwind({
            content: [{ raw: cheatsheet, extension: "html" }],
            plugins: [
                tailwindcss({
                  defaultFlavour: 'macchiato'
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

const screenshot = async (options) => {
    const html = await generate(options);
    const selector = '#sheet';
  
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
  
    // Set the HTML content of the page
    await page.setContent(html);

    await page.setViewport({ width: 800, height: 600, deviceScaleFactor: 10 });
    
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
      path: 'screenshot.png',
    });
  
    await browser.close();
}

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

    // Parse and return the JSON data
    return JSON.parse(fileContents);
}

module.exports = { generate, screenshot, process_args };
// export = { generate, screenshot, process_args };
