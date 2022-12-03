import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import morganBody from "morgan-body";
import bodyParser from "body-parser";
import {MongoClient, ObjectId} from  "mongodb";
// import { compileSolidityCode, findTopMatches ,buildTxPayload, getDiamondFacetsAndFunctions, getDiamondLogs, generateSelectorsData} from "./utils/utils";
// import { Providers } from "./utils/providers";
const cors = require("cors");
const nodeMailer = require('nodemailer');

dotenv.config();
const corsOptions = {
  origin: "http://localhost:3000",// TODO : Add custom domain
  optionsSuccessStatus: 200,
};



const app: Express = express();
const port = process.env.PORT || 9000;

// parse JSON and others

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// log all requests and responses
morganBody(app, { logAllReqHeader: true, maxBodyLength: 5000 });

//connect to db 

let cachedClient = null;
let cachedDb:any = null;

const connectToDb = async () => {

  if(cachedDb) return cachedDb;

  const client = await MongoClient.connect(process.env.DATABASE_URL!,{})

  const db = client.db("hidemelol");
  cachedDb = db;
  cachedClient = client;

  return db

}

let transporter = nodeMailer.createTransport({
  host: 'mail.privateemail.com',
  port: 587,
  secureConnection: true,
  auth: {
      user: process.env.SENDER_EMAIL,
      pass: process.env.SENDER_EMAIL_PWD
  }
});

transporter.verify((error:any) => {
  error ? console.log(`There was an error for the email connection: ${error}`) : console.log('Ready to send email')
});



app.post("/register-user", async (req : Request, res : Response)=>{

  try {
    const {address, email} = req.body;
    const db = await connectToDb();
    const exist = await db.collection("users").findOne({address:
      { $regex: new RegExp("^" + address.toLowerCase(), "i") }});

    if(!exist) db.collection("users").insertOne({address,email});

    res.status(200).send({
      msg : "Registered succesfully"
    })
  } catch (e) {
    console.log(e);
    res.status(500).end()
  }
})

app.post("/send-create-form-email", async (req : Request, res : Response)=>{

  try {
    const {address, payload} = req.body;
    const db = await connectToDb();
    const item = await db.collection("users").findOne({address:
      { $regex: new RegExp("^" + address.toLowerCase(), "i") }})
    
    const toEmail = item.email;
    
    const info = await transporter.sendMail({
      from : process.env.SENDER_EMAIL,
      to : toEmail,
      subject : payload.title,
      text : payload.body
    })

    console.log(`Message sent: ${info.messageId}`)

    res.status(200).send({
      msg : "Notification sent succesfully"
    })
    
  } catch (e) {
    console.log(e);
    res.status(500).end()
  }
})


// app.post("/add-facet", async (req : Request, res : Response) => {

//   try {
//     const {name, abi, address, description} = req.body;
//     // parse src to abi
//     // const abi = JSON.stringify(compileSolidityCode(name,src));
//     const selectorsData = generateSelectorsData(JSON.parse(abi),address,name);
//     const timesUsed = 0;
//     const audited = false;
//     const db = await connectToDb();
//     const exist = await db.collection("facets").findOne({address:
//       { $regex: new RegExp("^" + address.toLowerCase(), "i") }})
  
//     if(!exist){
//       db.collection("facets").insertOne({name,address,description, abi, timesUsed,audited});
//       db.collection("selectors").insertMany(selectorsData);
//     }
//     res.status(200).end();
//   }catch (e) {

//     console.error(e);
//     res.status(500).end();
//   }
  
// })

// app.get("/facets", async (req : Request, res: Response) => {

//   try {

//     const {searchStr, size} = req.body;

//     const db = await connectToDb();
//     let facets = await db.collection("facets").find({}).toArray();

//     if(searchStr && searchStr != ""){
//       facets = findTopMatches(facets,searchStr);
//     }

//     if(size){
//       facets = facets.slice(0,size);
//     }

//     res.status(200).send({
//       facets
//     })

//   }catch (e) {
//     console.log(e);
//     res.status(500).send();
//   }
  
// })

// app.post("/get-facet-selectors", async (req : Request , res : Response) => {
//   try {
//     const {facetAddr} = req.body;
//     const db = await connectToDb();
//     const selectors = await db.collection("selectors").find({facetAddr}).toArray();
//     res.status(200).send({
//       selectors
//     })
//   }catch (e){
//     console.log(e);
//     res.status(500).end();
//   }
// })

// app.post("/update-diamond", async (req : Request , res: Response) => {

//   try {
//     const {facetAddr, diamondAddr, action, funcList } = req.body;

//     const db = await connectToDb()
//     // const facet = await db.collection("facets").findOne({"_id" : new ObjectId(facetId)})
//     const facet = await db.collection("facets").findOne({"address" : facetAddr}); 

//     if(facet && action.toLowerCase() == "add"){
//       await db.collection("facets").findOneAndUpdate({"address" : facetAddr},{$set:{"timesUsed" : (facet.timesUsed + 1)}}, {new:true});
//     }

//     // const payload = await buildTxPayload(facet.abi,facet.address,funcList,action,diamondAddr,Providers["80001"]);
//     const payload = buildTxPayload(facet.abi,facet.address,funcList,action);
//     res.status(200).send(
//       {
//         payload
//       }
//     )

//   } catch (e) {
//     console.log(e);
//     res.status(500).end();
//   }  

// })
app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
