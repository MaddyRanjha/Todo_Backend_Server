require('dotenv').config();
const express = require("express");
const mongoose =require("mongoose");
const cors = require("cors");

//App config
const app= express();
app.use(express.json());
app.use(express.urlencoded());
app.use(cors());

//DB Config

// mongoose.connect('mongodb://localhost:27017/reminderAppDB',{
//     useNewUrlParse: true,
//     useUnifiedTopology: true
// },()=> console.log("DB Connected"))

//connection with
mongoose.set("strictQuery", false);
const MONGO_URI = process.env.MONGO_URI;
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((res) => {
    console.log("Connect to DB successfully");
  })
  .catch((err) => {
    console.log("Failed to connect", err);
  });


const reminderSchema = new mongoose.Schema({
    reminderMsg: String,
    remindAt: String,
    isReminded: Boolean
})

const Reminder = new mongoose.model("reminder", reminderSchema)

//Whatsapp reminding Functionality

setInterval(() => {
    Reminder.find({}, (err, reminderList) => {
        if(err) {
            console.log(err)
        }
        if(reminderList){
            reminderList.forEach(reminder => {
                if(!reminder.isReminded){
                    const now = new Date()
                    if((new Date(reminder.remindAt) - now) < 0) {
                        Reminder.findByIdAndUpdate(reminder._id, {isReminded: true}, (err, remindObj)=>{
                            if(err){
                                console.log(err)
                            }
                            
                                const ACCOUNT_SID = process.env.ACCOUNT_SID; 
                                const AUTH_TOKEN = process.env.AUTH_TOKEN; 
                                const client = require('twilio')(ACCOUNT_SID, AUTH_TOKEN); 
                                
                                client.messages 
                                    .create({ 
                                        body: `${reminder.reminderMsg} + ${reminder.remindAt}`, 
                                        from: 'whatsapp:+14155238886',       
                                        to: 'whatsapp:+919878627770' 
                                    }) 
                                    .then(message => console.log(message.sid))
                        })
                    }
                }
            })
        }
    })
},10000)
;



 
      

//API routes
app.get("/getAllReminder", (req, res) => {
    Reminder.find({}, (err, reminderList) => {
        if(err){
            console.log(err)
        }
        if(reminderList){
            res.send(reminderList)
        }
    })
})
app.post("/addReminder", (req, res) => {
    const { reminderMsg, remindAt } = req.body
    const reminder = new Reminder({
        reminderMsg,
        remindAt,
        isReminded: false
    })
    reminder.save(err => {
        if(err){
            console.log(err)
        }
        Reminder.find({}, (err, reminderList) => {
            if(err){
                console.log(err)
            }
            if(reminderList){
                res.send(reminderList)
            }
        })
    })

})

app.post("/deleteReminder", (req, res) => {
    Reminder.deleteOne({_id: req.body.id}, () => {
        Reminder.find({}, (err, reminderList) => {
            if(err){
                console.log(err)
            }
            if(reminderList){
                res.send(reminderList)
            }
        })
    })
})

app.get("/",(req,res)=>{
    res.send("Response from BackEnd")
})

app.listen(9000, () => console.log("Be started"))
