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
const mongoURI = `mongodb+srv://Ranjha:Maddy123@cluster0.4pzor98.mongodb.net/reminderAppDB`;
mongoose
  .connect(mongoURI, {
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
                            // const accountSid = process.env.ACCOUNT_SID 
                            // const authToken = process.env.AUTH_TOKEN
                            // const client = require('twilio')(accountSid, authToken); 
                            // client.messages 
                            //     .create({ 
                            //         body: reminder.reminderMsg, 
                            //         from: 'whatsapp:+14155238886',       
                            //         to: 'whatsapp:+918888888888' //YOUR PHONE NUMBER INSTEAD OF 8888888888
                            //     }) 
                            //     .then(message => console.log(message.sid)) 
                            //     .done()

                            
                                const accountSid = 'AC5e807deec0ebebe0d9ad9b8b68deaac9'; 
                                const authToken = '674d0ee703c062326d1d1e01a14b1e9c'; 
                                const client = require('twilio')(accountSid, authToken); 
                                
                                client.messages 
                                .create({ 
                                    body: 'Your appointment is coming up on July 21 at 3PM', 
                                    from: 'whatsapp:+14155238886',       
                                    to: 'whatsapp:+919878627770' 
                                }) 
                                .then(message => console.log(message.sid)) 
                                .done();

                                                       

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
