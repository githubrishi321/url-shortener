const rateLimit = require('express-rate-limit');

// General API rate limiter - 100 requests per 15 minutes
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Strict rate limiter for URL creation - 20 URLs per hour
const urlCreationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // Limit each IP to 20 URL creations per hour
    message: {
        error: 'Too many URLs created from this IP, please try again after an hour',
        limit: 20,
        windowMinutes: 60
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Custom handler for rate limit exceeded
    handler: (req, res) => {
        return res.status(429).render('home', {
            urls: [],
            user: req.user,
            id: null,
            error: 'Rate limit exceeded! You can only create 20 short URLs per hour. Please try again later.'
        });
    }
});

// Authentication rate limiter - 5 attempts per 15 minutes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login/signup attempts per 15 minutes
    message: 'Too many authentication attempts from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful requests
});

// QR Code generation limiter - 50 per hour
const qrCodeLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // Limit each IP to 50 QR code generations per hour
    message: {
        error: 'Too many QR codes generated, please try again after an hour'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    apiLimiter,
    urlCreationLimiter,
    authLimiter,
    qrCodeLimiter,
};
