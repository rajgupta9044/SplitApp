var dotenv = require('dotenv')
var express = require('express')
var logger = require('./helper/logger')
var requestLogger = require('./helper/requestLogger')
var apiAuth = require('./helper/apiAuthentication')
var cors = require('cors')

const path = require('path');
dotenv.config()

var usersRouter = require('./routes/userRouter')
var groupRouter = require('./routes/groupRouter')
var expenseRouter = require('./routes/expenseRouter')

var app = express()
app.use(cors())
app.use(express.json())
app.use(requestLogger)

app.use('/api/users', usersRouter)
app.use('/api/group', apiAuth.validateToken, groupRouter)
app.use('/api/expense', apiAuth.validateToken, expenseRouter)

// Serve static React frontend
app.use(express.static(path.join(__dirname, 'client/build')));

// Fallback to React index.html for SPA routing
app.get('*', (req, res) => {
    // Don't serve HTML for API routes that don't exist (let them fall through to error handler)
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, 'client/build/index.html'));
    } else {
        // Invalid API route
        logger.error(`[Invalid Route] ${req.originalUrl}`)
        res.status(404).json({
            status: 'fail',
            message: 'Invalid path'
        })
    }
});

const port = process.env.PORT || 3001
app.listen(port, (err) => {
    console.log(`Server started in PORT | ${port}`)
    logger.info(`Server started in PORT | ${port}`)
})
