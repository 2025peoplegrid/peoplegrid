const ADMIN_USER = "admin";
const ADMIN_PASS = "peoplegrid123";

const path = require("path");
app.use("/uploads", express.static("uploads"));


const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
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

const upload = multer({ dest: "uploads/" });

app.post("/worker", upload.single("resume"), async (req,res)=>{
  const w = new Worker({...req.body, resume:req.file.filename});
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
app.get("/admin/resume/:file", adminAuth, (req,res)=>{
  res.sendFile(path.join(__dirname,"uploads",req.params.file));
});

app.listen(process.env.PORT || 5000);


