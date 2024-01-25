# playwright-simulation

This project uses Playwright to visit webpages. Works well with Elastic Synthetic Recorder to generate load for demos / POCs. Copy, paste your synthetic code, customise if you want, then just run.

Refer test.js for a sample. 

Creates workers and iterate: Visit site, login dynamically, add item to cart, check out.

```npm install```

```node test.js```

For this specific project, code is for Konakart.
https://github.com/2gavy/konakart-simulation

Change these variables:
- numWorkers
- maxIterations
- interval