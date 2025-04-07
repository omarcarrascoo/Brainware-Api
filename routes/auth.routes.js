const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js")
const jwt = require ("jsonwebtoken");
require("dotenv").config();
//REGISTER
router.post("/register", async (req,res)=>{
    const newUser = new User({
        username: req.body.username.toLowerCase(),
        companyCode: req.body.companyCode,
        email: req.body.email.toLowerCase(),
        password: CryptoJS.AES.encrypt(req.body.password, process.env.PASS_SEC).toString()
    });
    console.log(newUser);
    try {
        const savedUser = await newUser.save()
        res.status(201).json(savedUser)
    }
    catch(err){
        res.status(500).json(err);
    }
    
});

//LOGIN

router.post("/login", async (req,res)=>{
    // try {
    //     const user = await User.findOne({ username: req.body.username });

    //     !user && res.status(401).json("Wrong credentials!")

    //     const hashedPass = CryptoJS.AES.decrypt(user.password, process.env.PASS_SEC);
    //     const originalPassword = hashedPass.toString(CryptoJS.enc.Utf8);
    //     originalPassword !== req.body.password && res.status(401).json("Wrong credentials!");
    //     const accessToken = jwt.sign({id:user._id, isAdmin:user.isAdmin },process.env.JWT_SEC,{expiresIn:"3d"});
    //     const {password, ...others } = user._doc;
    //     res.status(200).json({...others, accessToken});

    // } catch (error) {
    //     res.status(500).json(error + process.env.JWT_SEC);
    // }
    try {
        const user = await User.findOne({ username: req.body.username.toLowerCase() });
        console.log(user);
    
        if (!user) {
          console.log("No user");
          return res.status(401).json("User doesn't exist!");
        }
    
        const hashedPass = CryptoJS.AES.decrypt(user.password, process.env.PASS_SEC);
        const originalPassword = hashedPass.toString(CryptoJS.enc.Utf8);
  
        if (originalPassword !== req.body.password) {
          console.log("Wrong password!");
          return res.status(401).json("Wrong password!");
          
        }
    
        const accessToken = jwt.sign(
          { id: user._id, isAdmin: user.isAdmin },
          process.env.JWT_SEC,
          { expiresIn: "3d" }
        );
    
        const { password, ...others } = user._doc; 
  
        console.log({ ...others, accessToken });
          
        return res.status(200).json({ ...others, accessToken });
      } catch (error) {
        console.log(error);
        return res.status(500).json(error);
      }
})

module.exports = router;