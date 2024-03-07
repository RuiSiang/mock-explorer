const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const serve = require('koa-static');
const fs = require('fs');
const path = require('path');

const app = new Koa();
const router = new Router();

// Load transactions from JSON file
const transactions = JSON.parse(fs.readFileSync('transactions.json', 'utf-8'));

// Middleware
app.use(bodyParser());

// Serve static files from the public directory
app.use(serve(path.join(__dirname, 'public')));

// Routes
// Get all transactions
router.get('/transactions', ctx => {
  ctx.body = transactions;
});

// Get a single transaction by ID
router.get('/transaction/:id', ctx => {
  const transaction = transactions.find(tx => tx.txid === ctx.params.id);
  if (transaction) {
    ctx.body = transaction;
  } else {
    ctx.status = 404;
    ctx.body = 'Transaction not found';
  }
});

// Apply the routes to the app
app.use(router.routes()).use(router.allowedMethods());

const port = 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
