const ADMIN_USER = "admin";
const ADMIN_PASS = "peoplegrid123";





const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

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
// app.use("/uploads", express.static("uploads"));

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

app.post("/worker", upload.single("resume"), async (req,res)=>{
  const uploadResult = await cloudinary.uploader.upload(req.file.path, {
    resource_type: "raw",
    folder: "peoplegrid_resumes"
  });

  const w = new Worker({
    ...req.body,
    resume: uploadResult.secure_url
  });

  await w.save();
  res.send("Worker registered");
});


app.post("/employer", async (req,res)=>{
  const e = new Employer(req.body);
  await e.save();
  res.send("Employer request received");
});

app.get("/workers", async(req,res)=>{
  res.json(await Worker.find());
});

app.get("/employers", async(req,res)=>{
  res.json(await Employer.find());
});

app.get("/", (req,res)=>{
  res.send("PeopleGrid API is running");
});
app.get("/admin/workers", adminAuth, async(req,res)=>{
  res.json(await Worker.find());
});

app.get("/admin/employers", adminAuth, async(req,res)=>{
  res.json(await Employer.find());
});
// app.get("/admin/resume/:file", adminAuth, (req,res)=>{
//   const filePath = path.join(__dirname, "uploads", req.params.file);
//   res.download(filePath);
// });


app.listen(process.env.PORT || 5000);





