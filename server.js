const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");

const app = express();
app.use(cors());
app.use(express.json());

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

app.listen(process.env.PORT || 5000);
