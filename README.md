# playwright-stimulation

This project uses Playwright to visit webpages. Works well with Elastic Synthetic Recorder to generate load for demos / POCs.

Refer and run test.js for more info.

```npm install```

```node test.js```

For this specific project, code is for Konakart.
https://github.com/2gavy/konakart-simulation

Creates workers and iterate: Visit site, login dynamically, add item to cart, check out.

Change numWorkers, maxIterations, interval if necessary.