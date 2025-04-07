
const router = require("express").Router()

const { sendMail, sendMailEra } = require('../mail/nodeMailer');

//CREATE
router.post("/send", async (req, res)=>{
    const data = req.body
    // console.log(data);
    sendMail(data.email, data.name, data.message)
    res.status(200).json("Correcto")
})

router.post("/startProject", async (req, res)=>{
    const data = req.body
    // console.log(data);
    sendMailEra(data.email, data.name, data.message)
    res.status(200).json("Correcto")
})

module.exports = router;