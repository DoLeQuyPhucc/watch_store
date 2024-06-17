const express = require("express");
const router = express.Router();
const publicController = require("../controllers/publicController");
const { ensureAuthenticated } = require("../middleware/auth");

router.get("/", publicController.getAllWatches);
router.get("/profile/:id", ensureAuthenticated, publicController.getProfile);
router.post(
  "/watch/:id/comments",
  ensureAuthenticated,
  publicController.postComment
);
router.post(
  "/profile/:id/edit",
  ensureAuthenticated,
  publicController.updateProfile
);
router.post(
  "/profile/:id/change-password",
  ensureAuthenticated,
  publicController.changePassword
);
router.get("/watch/:id", publicController.getWatch);
router.get("/filter", publicController.getFilter);
router.get("/search", publicController.getSearch);

module.exports = router;
