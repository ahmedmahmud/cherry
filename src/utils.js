import { renderFile } from 'ejs';
import tailwind from "tailwindcss";
import postcss from "postcss";
import tailwindcss from "@catppuccin/tailwindcss";
import puppeteer from 'puppeteer';

const generate = async () => {
    const cheatsheet = await renderFile("src/cheatsheet.ejs", {
        title: "Hyprland Cheatsheet",
        blocks: [
            {
                title: "general",
                binds: [
                    {
                        description: "enter command mode",
                        key: ";"
                    },
                    {
                        description: "move window",
                        key: "ctrl+arrow"
                    },
                    {
                        description: "enter command mode",
                        key: ";"
                    },
                ]
            },
            {
                title: "wow",
                binds: [
                    {
                        description: "enter command mode",
                        key: ";"
                    },
                ]
            },
            {
                title: "general",
                binds: [
                    {
                        description: "enter command mode",
                        key: ";"
                    },
                ]
            },
        ]
    });

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

const screenshot = async () => {
    const html = await generate();
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

export { generate, screenshot };