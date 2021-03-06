const express = require('express')
const router = express.Router();
const auth = require('../../middleware/auth')
const User = require('../../models/User')
const config = require('config')
const { check, validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
//  @route    GET api/auth 
//  @desc     Test route
//  @access   Public
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password')
        console.log("auth",user)
        res.json(user)
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server error')
    }
})


//  @route    POST api/auth 
//  @desc     Authenticate user and get token
//  @access   Public
router.post('/', [

    check('email', 'Please include a valid email').isEmail(),
    check('password',
        'Password is required').exists()
],
    async (req, res) => {
        return new Promise((resolve)=>{
        const { name, email, password } = req.body
        console.log("qwdasdqs",req.body)
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        User.findOne({email})
            .exec(async (err, data)=>{
                if(err || !data){
                    return resolve(res.status(400).json({ errors: [{msg: 'Invalid Credentials'}] }))
                }
                let isMatch = await bcrypt.compare(password, data.password) 
                if(!isMatch){
                    return resolve(res.status(400).json({ errors: [{msg: 'Invalid Credentials'}] }))   
                }
                const payload = {
                    user: {
                        id: data.id,
                        email: data.email,
                        name:  name
                    }
                }
                jwt.sign(payload,
                    config.get('jwtSecret'),
                    { expiresIn: '1d' },
                    (err, token) => {
                        if (err) throw err
                        return resolve(res.json({ token }))
                    })

            })
        
        })
    })

        module.exports = router

    //     console.log("innnnnnnnnnnnnnnnnnnnn")
    //     const { name, email, password } = req.body
    //     console.log(req.body)
    //     const errors = validationResult(req)
    //     if (!errors.isEmpty()) {
    //         return res.status(400).json({ errors: errors.array() });
    //     }

    //     // See if the user exists
    //     const user = await User.findOne({ email })
    //     console.log("1212", user)
    //     if (!user) {
    //         return res
    //             .status(400)
    //             .json({ errors: [{ msg: 'Invalid Credentials ' }] })
    //     }

    //     let isMatch = await bcrypt.compare(password, user.password)

    //     if (!isMatch) {
    //         return res
    //             .status(400)
    //             .json({ errors: [{ msg: "Invalid Credentials" }] })
    //     }

    //     const payload = {
    //         user: {
    //             id: user.id,
    //             email: user.email,
    //             name: user.name
    //         }
    //     }
    //     jwt.sign(payload,
    //         config.get('jwtSecret'),
    //         { expiresIn: '1d' },
    //         (err, token) => {
    //             if (err) throw err
    //             res.json({ token })
    //         })
    // })