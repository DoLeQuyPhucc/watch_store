const Watch = require("../models/Watch");
const Brand = require("../models/Brand");
const Comment = require("../models/Comment");
const Member = require("../models/Member");

class PublicController {
  getAllWatches = async (req, res) => {
    const brands = await Brand.find();
    const watches = await Watch.find().populate("brand");

    const brandsWithWatches = brands.map((brand) => {
      const brandWatches = watches.filter(
        (watch) => watch.brand._id.toString() === brand._id.toString()
      );
      return {
        ...brand._doc,
        watches: brandWatches,
        color: "red",
      };
    });

    res.render("index", { watches, brands: brandsWithWatches });
  };

  getProfile = async (req, res) => {
    try {
      const userId = req.params.id;
      const user = await Member.findById(userId);

      if (!user) {
        return res.status(404).send("User not found");
      }

      res.render("profile", { user });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .send("An error occurred while trying to fetch the user profile.");
    }
  };

  updateProfile = async (req, res) => {
    const userId = req.params.id;
    const { membername, name, email, YOB } = req.body;

    try {
      const currentUser = await Member.findById(userId);

      if (!currentUser) {
        return res.status(404).send("User not found");
      }

      if (membername !== currentUser.membername) {
        const existingMembername = await Member.findOne({ membername });
        if (
          existingMembername &&
          existingMembername._id.toString() !== userId
        ) {
          return res.status(400).send("Username already exists");
        }
      }

      if (name !== currentUser.name) {
        const existingName = await Member.findOne({ name });
        if (existingName && existingName._id.toString() !== userId) {
          return res.status(400).send("Name already exists");
        }
      }

      if (email !== currentUser.email) {
        const existingEmail = await Member.findOne({ email });
        if (existingEmail && existingEmail._id.toString() !== userId) {
          return res.status(400).send("Email already exists");
        }
      }

      if (YOB !== currentUser.YOB) {
        const existingYOB = await Member.findOne({ YOB });
        if (existingYOB && existingYOB._id.toString() !== userId) {
          return res.status(400).send("Year of Birth already exists");
        }
      }

      // Update the user
      currentUser.membername = membername;
      currentUser.name = name;
      currentUser.email = email;
      currentUser.YOB = YOB;

      await currentUser.save();

      req.flash("success_msg", "Profile updated successfully");
      res.redirect(`/profile/${userId}`);
    } catch (error) {
      console.error("Error updating profile:", error);
      req.flash("error_msg", "Error updating profile");
      res.redirect("back");
    }
  };

  changePassword = async (req, res) => {
    try {
      const userId = req.params.id;
      const { currentPassword, newPassword } = req.body;

      const user = await Member.findById(userId);
      if (!user) {
        return res.render("profile", {
          user: req.user,
          errorMessage: "User not found",
        });
      }

      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res.render("profile", {
          user: req.user,
          error: "Password incorrect",
        });
      }

      user.password = newPassword;
      await user.save();
      res.render("profile", {
        user: req.user,
        successMessage: "Password changed successfully",
      });
    } catch (error) {
      console.error(error);
      res.render("profile", {
        user: req.user,
        errorMessage: "An error occurred while changing the password",
      });
    }
  };

  getWatch = async (req, res) => {
    const watch = await Watch.findById(req.params.id).populate([
      { path: "brand" },
      {
        path: "comments",
        populate: {
          path: "author",
          model: "Member",
        },
      },
    ]);
    res.render("watch", { watch });
  };

  postComment = async (req, res) => {
    try {
      const watchId = req.params.id;
      const { rating, comment } = req.body;

      // Find the watch
      const watch = await Watch.findById(watchId);

      // Create a new comment
      const newComment = new Comment({
        rating,
        content: comment,
        author: req.user._id,
      });

      // Save the comment
      await newComment.save();

      // Add the comment to the watch's comments
      watch.comments.push(newComment);

      // Save the watch
      await watch.save();

      // Redirect back to the watch page
      res.redirect(`/watch/${watchId}`);
    } catch (error) {
      req.flash("error_msg", "Error posting comment");
      res.redirect("back");
    }
  };

  // Filter by brand
  getFilter = async (req, res) => {
    const { brand } = req.query;
    const brands = await Brand.find();

    let watches = [];
    let brandsWithWatches = brands.map((brandItem) => ({
      ...brandItem._doc,
      watches: [],
    }));

    if (brand) {
      watches = await Watch.find({ brand }).populate("brand");

      brandsWithWatches = brands.map((brandItem) => {
        if (brandItem._id.toString() === brand) {
          return {
            ...brandItem._doc,
            watches: watches,
          };
        } else {
          return {
            ...brandItem._doc,
            watches: [],
          };
        }
      });
    } else {
      watches = await Watch.find().populate("brand");

      brandsWithWatches = brands.map((brandItem) => {
        return {
          ...brandItem._doc,
          watches: watches.filter(
            (watch) => watch.brand._id.toString() === brandItem._id.toString()
          ),
        };
      });
    }

    res.render("index", {
      watches,
      brands: brandsWithWatches,
      allBrands: brands,
      hasResults: watches.length > 0,
      isFiltered: !!brand,
    });
  };

  getSearch = async (req, res) => {
    const { searchQuery } = req.query;
    const brands = await Brand.find();
    let watches = [];

    if (searchQuery) {
      watches = await Watch.find({
        watchName: new RegExp(searchQuery, "i"),
      }).populate("brand");
    }

    const brandsWithWatches = brands.map((brand) => ({
      ...brand._doc,
      watches: watches.filter(
        (watch) => watch.brand._id.toString() === brand._id.toString()
      ),
    }));

    res.render("index", {
      watches,
      brands: brandsWithWatches,
      allBrands: brands,
      hasResults: watches.length > 0,
      isFiltered: true,
      searchQuery,
    });
  };
}

module.exports = new PublicController();
