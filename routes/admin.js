const express = require("express");
const router = express.Router();
const { ensureAuthenticated, ensureAdmin } = require("../middleware/auth");
const adminController = require("../controllers/adminController");

// Ensure admin routes
router.use(ensureAuthenticated);
router.use(ensureAdmin);

// Admin routes for accounts
router.get("/accounts", adminController.getAccounts);

// Brands CRUD operations
router.get("/brands", adminController.getBrands);
router.post("/brands", adminController.postBrand);
router.get("/brands/:brandId/editBrand", adminController.getBrandById);
router.put("/brands/:brandId", adminController.updateBrand);
router.delete("/brands/:brandId", adminController.deleteBrand);

// Watches CRUD operations
router.get("/watches", adminController.getWatches);
router.get("/watches/addWatch", adminController.getAddWatch);
router.post("/watches", adminController.postWatch);
router.get("/watches/:watchId/editWatch", adminController.getWatchById);
router.put("/watches/:watchId", adminController.updateWatch);
router.delete("/watches/:watchId", adminController.deleteWatch);

module.exports = router;
