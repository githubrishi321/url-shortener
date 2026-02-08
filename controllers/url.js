const shortid = require("shortid");
const URLModel = require("../models/url");
const QRCode = require("qrcode");

// Reserved routes that cannot be used as custom aliases
const RESERVED_ROUTES = [
  'url', 'user', 'login', 'signup', 'logout',
  'api', 'admin', 'analytics', 'static', 'db-status'
];

// URL validation helper function
function isValidURL(urlString) {
  console.log("Validating URL:", urlString);
  try {
    const url = new URL(urlString);
    console.log("URL parsed successfully. Protocol:", url.protocol);
    // Only allow http and https protocols
    const isValid = url.protocol === "http:" || url.protocol === "https:";
    console.log("Is valid?", isValid);
    return isValid;
  } catch (err) {
    console.log("URL validation error:", err.message);
    return false;
  }
}

// Custom alias validation function
function isValidCustomAlias(alias) {
  // Check if alias is alphanumeric with hyphens and underscores only
  const validPattern = /^[a-zA-Z0-9_-]+$/;

  if (!validPattern.test(alias)) {
    return { valid: false, error: "Custom alias can only contain letters, numbers, hyphens, and underscores" };
  }

  // Check minimum length
  if (alias.length < 3) {
    return { valid: false, error: "Custom alias must be at least 3 characters long" };
  }

  // Check maximum length
  if (alias.length > 50) {
    return { valid: false, error: "Custom alias must be less than 50 characters" };
  }

  // Check if it's a reserved route
  if (RESERVED_ROUTES.includes(alias.toLowerCase())) {
    return { valid: false, error: "This alias is reserved and cannot be used" };
  }

  return { valid: true };
}

async function handleGenerateNewShortURL(req, res) {
  const body = req.body;
  if (!body.url) {
    return res.render("home", {
      urls: await URLModel.find({ createdBy: req.user?._id }),
      user: req.user,
      id: null,
      error: "URL is required"
    });
  }

  // Validate URL format
  if (!isValidURL(body.url)) {
    return res.render("home", {
      urls: await URLModel.find({ createdBy: req.user?._id }),
      user: req.user,
      id: null,
      error: "Invalid URL format. Please enter a valid URL (e.g., https://example.com)"
    });
  }

  let shortID;

  // Check if user provided a custom alias
  if (body.customAlias && body.customAlias.trim()) {
    const customAlias = body.customAlias.trim();

    // Validate custom alias format
    const validation = isValidCustomAlias(customAlias);
    if (!validation.valid) {
      return res.render("home", {
        urls: await URLModel.find({ createdBy: req.user?._id }),
        user: req.user,
        id: null,
        error: validation.error
      });
    }

    // Check if custom alias already exists
    const existingURL = await URLModel.findOne({ shortId: customAlias });
    if (existingURL) {
      return res.render("home", {
        urls: await URLModel.find({ createdBy: req.user?._id }),
        user: req.user,
        id: null,
        error: `The alias "${customAlias}" is already taken. Please choose another one.`
      });
    }

    shortID = customAlias;
  } else {
    // Generate random short ID
    shortID = shortid();
  }

  // Calculate expiration date if provided
  let expiresAt = null;
  if (body.expiresIn && body.expiresIn.trim()) {
    const hoursToExpire = parseInt(body.expiresIn);
    if (!isNaN(hoursToExpire) && hoursToExpire > 0) {
      expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + hoursToExpire);
    }
  }

  await URLModel.create({
    shortId: shortID,
    redirectURL: body.url,
    visitHistory: [],
    createdBy: req.user?._id,
    expiresAt: expiresAt,
  });

  //Redirect instead of rendering directly (PRG pattern)
  return res.redirect("/dashboard?shortId=" + shortID);
}

async function handleGetAnalytics(req, res) {
  const shortId = req.params.shortId;
  const result = await URLModel.findOne({ shortId });

  return res.json({
    totalClicks: result.visitHistory.length,
    analytics: result.visitHistory,
  });
}

async function handleDeleteURL(req, res) {
  try {
    const { id } = req.params;

    // Find the URL and check ownership
    const url = await URLModel.findById(id);

    if (!url) {
      return res.status(404).json({ error: "URL not found" });
    }

    // Authorization check: ensure user owns this URL
    if (url.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized: You can only delete your own URLs" });
    }

    await URLModel.findByIdAndDelete(id);
    return res.redirect("/dashboard?deleted=true");
  } catch (err) {
    console.error("Delete failed:", err);
    return res.status(500).json({ error: "Failed to delete URL" });
  }
}

async function handleUpdateURL(req, res) {
  try {
    const { id } = req.params;
    const { redirectURL, expiresIn } = req.body;

    // Find the URL and check ownership
    const url = await URLModel.findById(id);

    if (!url) {
      return res.status(404).json({ error: "URL not found" });
    }

    // Authorization check: ensure user owns this URL
    if (url.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized: You can only edit your own URLs" });
    }

    // Validate new redirect URL if provided
    if (redirectURL && !isValidURL(redirectURL)) {
      return res.status(400).json({ error: "Invalid URL format" });
    }

    // Calculate new expiration if provided
    let expiresAt = url.expiresAt; // Keep existing expiration by default
    if (expiresIn !== undefined) {
      if (expiresIn === "" || expiresIn === "never") {
        expiresAt = null; // Remove expiration
      } else {
        const hoursToExpire = parseInt(expiresIn);
        if (!isNaN(hoursToExpire) && hoursToExpire > 0) {
          expiresAt = new Date();
          expiresAt.setHours(expiresAt.getHours() + hoursToExpire);
        }
      }
    }

    // Update the URL
    await URLModel.findByIdAndUpdate(id, {
      redirectURL: redirectURL || url.redirectURL,
      expiresAt: expiresAt,
    });

    return res.redirect("/dashboard?updated=true");
  } catch (err) {
    console.error("Update failed:", err);
    return res.status(500).json({ error: "Failed to update URL" });
  }
}

async function handleGenerateQRCode(req, res) {
  try {
    const { shortId } = req.params;

    // Construct full short URL
    const protocol = req.protocol;
    const host = req.get('host');
    const shortURL = `${protocol}://${host}/${shortId}`;

    // Generate QR code as data URL
    const qrCodeDataURL = await QRCode.toDataURL(shortURL, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    return res.json({
      success: true,
      qrCode: qrCodeDataURL,
      shortURL: shortURL
    });
  } catch (err) {
    console.error("QR code generation failed:", err);
    return res.status(500).json({ error: "Failed to generate QR code" });
  }
}

module.exports = {
  handleGenerateNewShortURL,
  handleGetAnalytics,
  handleDeleteURL,
  handleUpdateURL,
  handleGenerateQRCode,
};
