var User = require('../models/user.js')
var jwt = require('jwt-simple')
var config = require('../config/dbconfig')

var functions = {
    addNew: function (req, res) {
        if ((!req.body.name) || (!req.body.password) || (!req.body.registration_number)) {
            res.json({ success: false, msg: 'Enter all fields' })
        }
        else {
            var username = req.body.name.toUpperCase();
            var role = 'student';
            var registration_number = req.body.registration_number.replace(/\s+/g, '');
            User.findOne({ name: username }, function (err, existingUser) {
                if (err) {
                    res.json({ success: false, msg: 'Database error' })
                }
                else if (existingUser) {
                    res.json({ success: false, msg: 'Username already exists' })
                }
                else {
                    User.findOne({ registration_number: registration_number }, function (err, existingRegNo) {
                        if (err) {
                            res.json({ success: false, msg: 'Database error' })
                        }
                        else if (existingRegNo) {
                            res.json({ success: false, msg: 'Registeration number already exists' })
                        }
                        else if (!/^\d{5}$/.test(registration_number.trim())) {
                            res.json({ success: false, msg: 'Invalid registration number' });
                        }
                        else {
                            var newUser = User({
                                name: username,
                                password: req.body.password,
                                registration_number: registration_number,
                                role: role
                            })
                            newUser.save(function (err, newUser) {
                                if (err) {
                                    res.json({ success: false, msg: 'Failed to save' })
                                }
                                else {
                                    res.json({ success: true, msg: 'Successfully saved' })
                                }
                            })
                        }
                    })
                }
            });
        }
    },
    authenticate: function (req, res) {
        User.findOne({
            name: req.body.name.toUpperCase()
        }, function (err, user) {
            if (err) throw err
            if (!user) {
                res.status(403).send({ success: false, msg: 'Authentication Failed, User not found' })
            }

            else {
                user.comparePassword(req.body.password, function (err, isMatch) {
                    if (isMatch && !err) {
                        var token = jwt.encode(user, config.secret)
                        res.json({ success: true, token: token })
                    }
                    else {
                        return res.status(403).send({ success: false, msg: 'Authentication failed, wrong password' })
                    }
                })
            }
        }
        )
    },
    login: function (req, res) {
        User.findOne({
            registration_number: req.body.registration_number
        }, function (err, user) {
            if (err) throw err
            if (!user) {
                res.status(403).send({ success: false, msg: 'Authentication Failed, User not found' })
            }
            else {
                if (user.role !== 'teacher') {
                    return res.status(403).send({ success: false, msg: 'Unauthorized not a teacher' })
                }
                else {
                    user.comparePassword(req.body.password, function (err, isMatch) {
                        if (isMatch && !err) {
                            var token = jwt.encode(user, config.secret)
                            res.cookie('token', token, {
                                httpOnly: true,
                                secure: process.env.NODE_ENV === 'production',
                                sameSite: 'strict',
                            });
                            res.json({ success: true, token: token })
                        }
                        else {
                            return res.status(403).send({ success: false, msg: 'Authentication failed, wrong password' })
                        }
                    })
                }
            }
        })
    },
    getinfo: function (req, res) {
        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
            var token = req.headers.authorization.split(' ')[1]
            var decodedtoken = jwt.decode(token, config.secret)
            return res.json({ success: true, msg: 'Hello ' + decodedtoken.name })
        }
        else {
            return res.json({ success: false, msg: 'No Headers' })
        }
    },
    authenticateTeacher: function (req, res) {
        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
            // console.log(req.headers.authorization);
            var token = req.headers.authorization.split(' ')[1]
            // console.log(token);
            if (token !== 'undefined') {
                var decodedtoken = jwt.decode(token, config.secret)
                return res.json({ success: true, msg: decodedtoken.role })
            } else {
                // console.log('token undefined');
                return res.json({ success: false, msg: 'No token' })
            }
        }
        else {
            return res.json({ success: false, msg: 'No Headers' })
        }

    }
}

module.exports = functions