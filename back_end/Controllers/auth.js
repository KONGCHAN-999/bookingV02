const User = require('../Models/Users')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { token } = require('morgan')

exports.register = async (req, res) => {
    try {
        // 1. Check if user exists
        const { email, password } = req.body
        let user = await User.findOne({ email })
        if (user) {
            return res.status(400).send('User Already Exists!!!')
        }
        // 2. Encrypt password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        user = new User({
            email,
            password: hashedPassword
        })
        // 3. Save user
        await user.save()
        res.send('Register Success!!')
    } catch (err) {
        console.log(err)
        res.status(500).send('Server Error')
    }
}
exports.login = async (req, res) => {
    try {
        //code
        // 1. Check User
        const { email, password } = req.body
        var user = await User.findOneAndUpdate({ email }, { new: true })
        console.log(user)
        if (user) {
            const isMatch = await bcrypt.compare(password, user.password)

            if (!isMatch) {
                return res.status(400).send('Password Invalid!!!')
            }
            // 2. Payload
            var payload = {
                user: {
                    email: user.email
                }
            }
            // 3. Generate
            jwt.sign(payload, 'jwtsecret', { expiresIn: 120 }, (err, token) => {
                if (err) throw err;
                res.json({ token, payload })
            })
        } else {
            return res.status(400).send('User not found!!!')
        }

    } catch (err) {
        //code
        console.log(err)
        res.status(500).send('Server Error')
    }
}