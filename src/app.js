const { screenshot, process_args } = require("./utils.js");
// import { screenshot, process_args } from './utils.js';

const options = process_args();
console.log(options);

(async () => {
    await screenshot(options);
})();