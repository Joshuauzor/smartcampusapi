// module.exports = (app) => {
    const express = require('express');
    const dotenv = require('dotenv').config();
    const bcrypt = require('bcryptjs');
    // const expressValidator = require('express-validator');
    // const mysql = require('mysql');
    // const bodyParser = require('body-parser');
    const Joi = require('joi');
    const nodemailer = require('nodemailer');
    const jwt = require('jsonwebtoken');
    const multer = require('multer');
    const path = require('path');
    const db = require('../connection');
    const Users = require('../models/Users');
    const mailer = require('../helpers/mailer');
    const randomstring = require("randomstring");
    const moment = require('moment'); // require
     

    // --------------------------------------------- 
 
   let register = async (req, res) => {
        // validate
        const schema = Joi.object({ 
            name: Joi.string().required().messages({
                'string.base': `"name" should be a type of 'text'`,
                'string.empty': `"name" cannot be an empty field`,
                'string.min': `"firstname should have a minimum length of {#limit}`,
                'any.required': `"name" is a required`,
            }),
            reg_no: Joi.string().required().min(6),
            email: Joi.string().min(6).required().email(),
            gender: Joi.string().required(),
            role: Joi.string().required(),
            status: Joi.number().required(),
            school_id: Joi.string().required(),
            level_id: Joi.string().required(),
            semester_id: Joi.string().required(),
            password: Joi.string().min(5).required(),  
            confirm_pass: Joi.string().min(5).required().valid(Joi.ref('password'))
        });

        const {value, error} = schema.validate(req.body);
        if(error && error.details){
            // return res.status(406).json({message: error.details[0].message});
            return res.json({message: error.message});
        }
        else{
            const findUser = await Users.findOne({ where: { email: req.body.email } });
            if (findUser) {
                return res.status(200).json({
                    message: 'User Already Exist',
                }) 
            } else { 
                let hashedPassword = await bcrypt.hash(req.body.password, 8);
                // generate random string
                let uuid = randomstring.generate(24);

                let data = {
                    name: req.body.name,
                    email: req.body.email,
                    uuid: uuid,
                    reg_no: req.body.reg_no,
                    gender: req.body.gender,
                    role: req.body.role,
                    status: req.body.status,
                    school_id: req.body.school_id,
                    level_id: req.body.level_id,
                    semester_id: req.body.semester_id,
                    password: hashedPassword
                }

                const addUser = await Users.create(data); //add user

                if(addUser){
                    let sendMail = await mailer.registerMail(req.body.email, req.body.name, req.body.reg_no); //send mail to user
                    
                    if(sendMail){
                        return res.status(200).json({
                            message: 'User Created and Mail sent'
                        });
                    }
                    else{
                        return res.status(200).json({
                            message: 'User Created'
                        });
                    }
                }
                else{
                    return res.status(400).json({
                        message: 'An Error Occured'
                    })
                }
            }
        }
    }

    // ---------------------------------------------------------------------------------------------


    let login = async (req, res) => {
        const schema = Joi.object({ 
            email: Joi.string().trim().min(6).required().email(),
            password: Joi.string().min(5).required(),  
        });

        const {value, error} = schema.validate(req.body);
        if(error && error.details){
            // return res.status(406).json({message: error.details[0].message});
            return res.json({message: error.message});
        }
        else{
            const user = await Users.findOne({ where: { email: req.body.email } });
            if (!user) {
                return res.json({
                    message: 'Incorrect Email and/or Password',
                    status: 'error'
                }) 
            }
            try {
                const checkPassword = await bcrypt.compare(req.body.password, user.password);
                if(checkPassword){
                    //set session
                    let userData = {
                        'id' : user.id,
                        'name' : user.name,
                        'email' : user.email,
                        'uuid' : user.uuid,
                        'reg_no' : user.reg_no,
                        'school_id' : user.school_id, 
                        'level_id' : user.level_id,
                        'semester_id': user.semester_id
                    }
                    const accessToken = generateAccessToken(userData);
                    // var expires = moment().add(5, 'minutes').format();
                    // console.log(expires);
                    return res.json({
                        data: userData,
                        token: accessToken,
                        status: 'success',
                        message: 'Login successful'
                    });
                }
                else{
                    return res.json({
                        message: 'Incorrect Email and/or Password',
                        status: 'error'
                    });
                }
            }
            catch{
                return res.status(500);
            }
        }
    };

    // ----------- generate access token -------------------

    function generateAccessToken(user){
        return jwt.sign({user}, process.env.JWT_SECRET_TOKEN, {expiresIn: '1200s'}); 
    }

//}

module.exports = {login, register}