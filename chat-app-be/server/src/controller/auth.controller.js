const bcrypt = require("bcrypt");
const User = require("../models/User")
const jwt = require("jsonwebtoken")
const signup = async (req,res) => {
   try{
      const { name, email, password } = req.body;

      if(!name || !email || !password){
        return res.status(401).json({
          success : false,
          message : "All fields are required..."
        })
      }

      const existingUser = await User.findOne({email});

      if(existingUser){
        return res.status(401).json({
          success : false,
          message : "User Already Exists..."
        })
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        name,
        email,
        password : hashedPassword
      })
      res.status(200).json({
        success : true,
        message : "User Created Successfully....",
        user
      })
   } catch(error){
      console.log(error.message)
      res.status(500).json({
      success : false,
      message : "Server Error"
     })
   }
}

const login = async (req, res) => {
  try {
    const { email , password } = req.body;
    if(!email || !password){
      return res.status(401).json({
        success : false,
        message : "Both Email and Password are required..."
      })
    }
   
    const user = await User.findOne({email});
    if(!user){
      return res.status(401).json({
        success : false,
        message : "User does not found..."
      })
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if(!passwordMatch){
      return res.status(401).json({
        success : false,
        message : "Wrong Password.."
      })
    }

    const token = jwt.sign({
      userId : user._id
    },process.env.JWT_SECRET,
  {
    expiresIn: "7d",
  })

   res.status(200).json({
    success : true,
    message : "Login Successfull....",
    token
   })
  }catch(error){
  console.log(error.message);
  res.status(500).json({
    success: false,
    message : "Server Error"
  })
}
} 
module.exports = { signup, login }