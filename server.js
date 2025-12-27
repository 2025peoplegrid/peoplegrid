const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
// require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const ADMIN_USER = "admin";
const ADMIN_PASS = "peoplegrid123";

function adminAuth(req,res,next){
  const auth = req.headers.authorization;
  if(!auth) return res.sendStatus(401);
  const [user,pass] = Buffer.from(auth.split(" ")[1],'base64').toString().split(":");
  if(user===ADMIN_USER && pass===ADMIN_PASS) next();
  else res.sendStatus(403);
}

/* ---------- Cloudinary ---------- */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "peoplegrid_resumes",
    resource_type: "raw",
    public_id: (req, file) => Date.now() + "-" + file.originalname
  }
});

const upload = multer({ storage });

/* ---------- MongoDB ---------- */
mongoose.connect(process.env.MONGO_URL);

const Worker = mongoose.model("Worker", {
  name: String,
  phone: String,
  email: String,
  skill: String,
  experience: String,
  city: String,
  availability: String,
  resume: String
});

const Employer = mongoose.model("Employer", {
  company: String,
  name: String,
  phone: String,
  email: String,
  job: String,
  city: String,
  workers: Number
});

/* ---------- Routes ---------- */

app.post("/worker", upload.single("resume"), async (req,res)=>{
  try{
    const w = new Worker({
      ...req.body,
      resume: req.file.path   // Cloudinary URL
    });

    await w.save();
    res.send("Worker registered");
  }catch(e){
    console.error(e);
    res.status(500).send("Upload failed");
  }
});

app.post("/employer", async (req,res)=>{
  const e = new Employer(req.body);
  await e.save();
  res.send("Employer request received");
});

app.get("/admin/workers", adminAuth, async(req,res)=>{
  res.json(await Worker.find());
});

app.get("/admin/employers", adminAuth, async(req,res)=>{
  res.json(await Employer.find());
});

app.get("/", (req,res)=>{
  res.send("PeopleGrid API is running");
});

app.listen(process.env.PORT || 5000);

