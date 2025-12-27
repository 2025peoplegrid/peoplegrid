const ADMIN_USER = "admin";
const ADMIN_PASS = "peoplegrid123";

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

const app = express();

app.use(cors());
app.use(express.json());

function adminAuth(req,res,next){
  const auth = req.headers.authorization;
  if(!auth) return res.sendStatus(401);
  const [user,pass] = Buffer.from(auth.split(" ")[1],'base64').toString().split(":");
  if(user===ADMIN_USER && pass===ADMIN_PASS) next();
  else res.sendStatus(403);
}

// MongoDB
mongoose.connect(process.env.MONGO_URL);

// Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cloudinary storage for resumes
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "peoplegrid-resumes",
    resource_type: "raw",
    allowed_formats: ["pdf", "doc", "docx"]
  }
});

const upload = multer({ storage });

// Models
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


// ============ ROUTES ============

// Worker with resume
app.post("/worker", upload.single("resume"), async (req,res)=>{
  const w = new Worker({
    ...req.body,
    resume: req.file.path   // Cloudinary URL
  });

  await w.save();
  res.send("Worker registered");
});

// Employer
app.post("/employer", async (req,res)=>{
  const e = new Employer(req.body);
  await e.save();
  res.send("Employer request received");
});

// Public
app.get("/workers", async(req,res)=>{
  res.json(await Worker.find());
});

app.get("/employers", async(req,res)=>{
  res.json(await Employer.find());
});

app.get("/", (req,res)=>{
  res.send("PeopleGrid API is running");
});

// Admin
app.get("/admin/workers", adminAuth, async(req,res)=>{
  res.json(await Worker.find());
});

app.get("/admin/employers", adminAuth, async(req,res)=>{
  res.json(await Employer.find());
});

// Download resume
app.get("/admin/resume/:id", adminAuth, async (req,res)=>{
  const worker = await Worker.findById(req.params.id);
  if (!worker) return res.sendStatus(404);
  res.redirect(worker.resume);   // Cloudinary file
});

// Server
app.listen(process.env.PORT || 5000);
