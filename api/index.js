const express = require("express");
const cors = require("cors");
const { Sequelize, DataTypes } = require("sequelize");
const sizeOf = require("image-size");
var multer = require("multer");
var fs = require("fs");
const path = require("path");
const uploadFolder = path.join(__dirname, "uploads");
const app = express();
app.use(cors());
const IP = "localhost";
const PORT = "3000";
 
// root is the username for the database
// rootroot is the password for the database
// final_project is the name of the database
/*const sequelize = new Sequelize("final_project", "root", "rootroot", {
  // host is the IP for database
  host: "localhost",
  // dialect can be mysql, postgres, sqlserver
  dialect: "mysql",
});*/
const sequelize = new Sequelize("final_project", "root", null, {
  // host is the IP for database
  host: "localhost",
  // dialect can be mysql, postgres, sqlserver
  dialect: "mysql",
});


(async () => {
  try {
    //connect db
    await sequelize.authenticate();

    // initialize Image table in database
    sequelize.define("Image", {
      filePath: {
        type: DataTypes.BLOB("long"),
        allowNull: false,
      },
    });
    // refreshes the database
    await sequelize.sync();
    console.log("Connection has been established successfully.");
    // Express Server
    app.listen(PORT, IP, () => {
      console.log(`Image API listening at http://${IP}:${PORT}`);
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
})();

// create upload folder if does not exist
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder);
}

// set destination for server to save images
var storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, __dirname + "/uploads/"),
  // specify a custom filename for uploaded photo
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}${path.extname(file.originalname)}`),
});
var upload = multer({
  storage: storage,
  // ony allow file with .png, .jpg, .gif, .jpeg extension
  fileFilter: (req, file, cb) => {
    var ext = path.extname(file.originalname);
    if (ext !== ".png" && ext !== ".jpg" && ext !== ".gif" && ext !== ".jpeg") {
      return cb("Only media content i.e images are allowed to upload", false);
    }
    cb(null, true);
  },
  // photo is the form input name
}).single("photo");

// static folder for serving images requests
app.use("/static", express.static(path.join(__dirname, "uploads")));

// POST endpoint for image uploading
app.post("/images", (req, res) => {
  upload(req, req, async (err) => {
    if (err instanceof multer.MulterError) {
      res.sendStatus(500);
    } else if (err) {
      res.status(400).send(err);
    } else {
      const imagePath = path.join(uploadFolder, req.file.filename);
      // check width and height of uploaded image
      const { width, height } = sizeOf(imagePath);

      // check image constraints
      // if it fails delete the image
      if (width > 2080) {
        fs.unlinkSync(imagePath);
        res.status(400).send("image Width is too large");
      } else if (height > 2080) {
        fs.unlinkSync(imagePath);
        res.status(400).send("image Height is too large");
      } else {
        // insert the image path to the database

        let result = await sequelize
          .model("Image")
          .create({ filePath: fs.readFileSync(imagePath) });
        // delete image
        fs.unlinkSync(imagePath);
        if (result) res.sendStatus(200);
        else res.sendStatus(500);
      }
    }
  });
});

app.get("/images", async (req, res) => {
  const files = [];
  const imageModel = sequelize.model("Image");
  const images = await imageModel.findAll();
  // return all the image paths with server address
  images.forEach((file) => {
    files.push(file.filePath.toString("base64"));
  });
  res.send(files);
});
