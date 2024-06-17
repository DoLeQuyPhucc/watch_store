const Member = require("../models/Member");
const Watch = require("../models/Watch");
const Brand = require("../models/Brand");

class AdminController {
  // Admin can get all members
  getAccounts = async (req, res) => {
    const members = await Member.find();
    res.render("admin/accounts", { members });
  };

  // Admin CRUD operations for brands
  getBrands = async (req, res) => {
    const brands = await Brand.find();
    res.render("admin/brands", { brands });
  };

  postBrand = async (req, res) => {
    const brand = new Brand(req.body);
    await brand.save();
    res.redirect("/admin/brands");
  };

  // Update brand, delete brand
  getBrandById = async (req, res) => {
    const brand = await Brand.findById(req.params.brandId);
    res.render("admin/editBrand", { brand });
  };

  updateBrand = async (req, res) => {
    try {
      const { brandName } = req.body;
      const brandId = req.params.brandId;

      // Check for duplicate brand name
      const existingBrand = await Brand.findOne({
        brandName,
        _id: { $ne: brandId },
      });
      if (existingBrand) {
        return res.status(400).json({ error: "Brand name already exists." });
      }

      // Update the brand
      await Brand.findByIdAndUpdate(brandId, req.body);
      res.redirect("/admin/brands");
    } catch (error) {
      console.error(error);
      res.status(500).send("An error occurred while updating the brand.");
    }
  };

  deleteBrand = async (req, res) => {
    await Brand.delete({ _id: req.params.brandId });
    res.redirect("/admin/brands");
  };

  // Admin CRUD operations for watches
  getWatches = async (req, res) => {
    const watches = await Watch.find().populate("brand");
    res.render("admin/watches", { watches });
  };

  getAddWatch = async (req, res) => {
    const brands = await Brand.find();
    res.render("admin/newWatches", { brands });
  };

  postWatch = async (req, res) => {
    const watch = new Watch(req.body);
    await watch.save();
    res.redirect("/admin/watches");
  };

  // Update watch, delete watch
  getWatchById = async (req, res) => {
    const watch = await Watch.findById(req.params.watchId).populate("brand");
    const brands = await Brand.find();
    res.render("admin/editWatch", { watch, brands });
  };

  updateWatch = async (req, res) => {
    try {
      if (req.body.Automatic === "on") {
        req.body.Automatic = true;
      } else {
        req.body.Automatic = false;
      }

      await Watch.findByIdAndUpdate(req.params.watchId, req.body);

      res.redirect("/admin/watches");
    } catch (error) {
      console.error("Error updating watch:", error);
      res.status(500).send("Server Error");
    }
  };

  deleteWatch = async (req, res) => {
    await Watch.delete({ _id: req.params.watchId });
    res.redirect("/admin/watches");
  };
}

module.exports = new AdminController();
