const nodemailer = require ('nodemailer')
require('dotenv').config()

let mailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth:{
        user: process.env.Mail,
        pass:"ahiqezzzpfsfqdme"
    }
})
// let details = {
//     from: process.env.Mail,
//     to:  "omar@eradigitalsolution.com",
//     subject: "Se ha registrado una Usuario",
//     text: "Se ha registrado un usuario"
// }

function sendMail(mail, name, message){
    console.log(mail);
    console.log(name);
    console.log(message);
    let details = {
        from: process.env.Mail,
        to:  'ivanatovillaart@gmail.com',
        subject: "New Message from Ivanatovillaart.com",
        text: `${message}
        Nombre: ${name}
        Correo: ${mail}
        `
    }
    mailTransporter.sendMail(details,(err)=>{
        if (err) {
            console.error(err);
        }
        else{
            console.log("email has sent")
        }
    })
}
function sendMailEra(mail, name, message){
    console.log(mail);
    console.log(name);
    console.log(message);
    let details = {
        from: process.env.Mail,
        to:  'omar@eradigitalsolution.com',
        subject: "New Message from EraDigitalSolutions.com",
        text: `${message}
        Nombre: ${name}
        Correo: ${mail}
        `
    }
    mailTransporter.sendMail(details,(err)=>{
        if (err) {
            console.error(err);
        }
        else{
            console.log("email has sent")
        }
    })
}

function sendMailBuying(art){
    console.log(art);
    let details = {
        from: process.env.Mail,
        to:  'omar@eradigitalsolution.com',
        subject: "You have a new sale in your store",
        text: `
        Art Sold: ${art}
        `
    }
    mailTransporter.sendMail(details,(err)=>{
        if (err) {
            console.error(err);
        }
        else{
            console.log("email has sent")
        }
    })
}

module.exports={
    sendMail,
    mailTransporter,
    sendMailBuying,
    sendMailEra
}