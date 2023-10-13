const express = require("express");
const cors = require("cors");
const multer = require('multer');
const app = express();


app.use(cors());

// parse requests of content-type - application/json
app.use(express.json({ limit: "50mb" }));

app.use(express.urlencoded({ extended: true }));

const db = require("./app/models");
db.mongoose
  .connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch(err => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to fleeso" });
});

require("./app/routes/loan.routes")(app);
require("./app/routes/user.routes")(app);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname + "/app/public/images");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});


const upload = multer({storage})

app.post('/upload', upload.single('file'),(req, res)=>{
        console.log(req.body)
        console.log(req.file)
})


// set port, listen for requests
const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
