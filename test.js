const cluster = require('cluster');
const { chromium } = require('playwright');
const userAgent = require('user-agents');

const numWorkers = 10; // Adjust the number of workers per iteration as needed
let completedWorkers = 0;

let iteration = 0;
const maxIterations = 10; // Set the maximum number of iterations

const interval = 0.3 * 60 * 1000; // 1 minute in milliseconds

const createWorkers = () => {
    for (let j = 0; j < numWorkers; j++) {
        const worker = cluster.fork();

        // Listen for messages from workers
        worker.on('message', (message) => {
            if (message.msg === 'workerFinished') {
                console.log(`Worker ${worker.process.pid} completed its tasks.`);
                completedWorkers++;

                if (completedWorkers === numWorkers) {
                    // All workers have finished in this iteration
                    iteration++;
                    completedWorkers = 0;
                    console.log(`Starting iteration ${iteration}...`);

                    if (iteration < maxIterations) {
                        // Send 'shutdown' message to all workers to stop them
                        Object.values(cluster.workers).forEach((worker) => {
                            worker.send({ msg: 'shutdown' });
                        });
                        createWorkers(); // Start the next set of workers
                    } else {
                        console.log('Max iterations reached. Exiting...');
                        process.exit(); // Exit the master process after all iterations
                    }
                }
            }
        });
    }
};

if (cluster.isMaster) {
    // Initial creation of workers
    createWorkers();

    // Schedule the creation of workers
    setInterval(() => {
        console.log('Creating new workers...');
        createWorkers();
    }, interval);
} else {
    process.on('message', (message) => {
        if (message.msg === 'shutdown') {
            console.log(`Worker ${process.pid} shutting down...`);
            try {
                process.send({ msg: 'shutdown' });
            } catch (error) {
                // Handle the error (EPIPE) when sending a message to a closed pipe
                console.error(`Error sending shutdown message: ${error.message}`);
            } finally {
                process.exit();
            }
        }
    });

    // Worker process code
    (async () => {
        const browser = await chromium.launch({ headless: true });

        const context = await browser.newContext({
            userAgent: userAgent.random().toString()
        });

        const page = await context.newPage();
        await page.goto('http://localhost:8780/konakart/LogIn.action');
        await page.locator('#loginUsername').click();

        //  Adding random users
        var users = ["Jimmy@gmail.com", "Zing@gmail.com", "Sam@gmail.com"]

        await page.locator('#loginUsername').fill(users[Math.floor(Math.random() * users.length)]);
        await page.locator('#loginUsername').press('Tab');
        await page.locator('#password').fill('ZingZingZing');
        await page.locator('#continue-button').click();
        await page.locator('#logo-1').click();
        await page.locator('#banner-' + (Math.floor(Math.random() * 3) + 1).toString()).click();

        const elements = await page.$$('.item-title');
        if (elements.length > 0) {
            const randomIndex = Math.floor(Math.random() * elements.length);
            await page.locator('.item-title').locator('nth=' + randomIndex.toString()).click();
            await page.locator('#AddToCartForm').getByText('Add to Cart').click();
            await page.getByText('Checkout').click();
            await page.getByText('Confirm Order').click();
            await page.locator('#logo-1').click();
        }

        await browser.close();
        process.send({ msg: 'workerFinished' });
    })();
}
