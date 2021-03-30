const Schools = require('../models/Schools');
const Faculties = require('../models/Faculties');


module.exports = (app) => {
    const express = require('express');
    const dotenv = require('dotenv').config();
    const bcrypt = require('bcryptjs');
    // const expressValidator = require('express-validator');
    // const mysql = require('mysql');
    const bodyParser = require('body-parser');
    const Joi = require('joi');
    const nodemailer = require('nodemailer');
    const jwt = require('jsonwebtoken');
    const multer = require('multer');
    const path = require('path');
    const db = require('../connection');
    const Users = require('../models/Users');
    const Schools = require('../models/Schools');
    const mailer = require('../helpers/mailer');
    const randomstring = require("randomstring");
    const moment = require('moment'); // require
    const tokenCheck = require('../helpers/verifyToken');

     

    // --------------------- Create schools ------------------------

    app.post('/faculty/create', tokenCheck.verifyToken, (req, res) => {
        //check token
        jwt.verify(req.token, process.env.JWT_SECRET_TOKEN, async(err, results) => {
            if(err){
                res.sendStatus(403)
            }
            else{
                // start
                // validate
                const schema = Joi.object({ 
                    school: Joi.string().required().min(5),
                    faculty: Joi.string().required(),
                    // Authorization: Joi.string().required()
                });

                const {value, error} = schema.validate(req.body);
                if(error && error.details){
                    // return res.status(406).json({message: error.details[0].message});
                    return res.json({message: error.message});
                }
                else{
                    const findUser = await Schools.findOne({ where: { school_name: req.body.school } });
                    if (findUser) {
                        return res.status(200).json({
                            message: 'School Already Exist',
                            status: 'error'
                        }) 
                    } 
                    else { 
            
                        let data = {
                            school_name: req.body.school,
                            aka: req.body.aka,
                            city: req.body.city,              
                        }

                        const addSchool = await Schools.create(data); //add user

                        if(addSchool){            
                            return res.status(200).json({
                                message: 'School Created',
                                status: 'success'
                            });
                            }
                        else{
                            return res.status(400).json({
                                message: 'An Error Occured',
                                status: 'error'
                            })
                        }
                    }
                }
            }
        })
    });

    // --------------------------------- Get All schools------------------------------------------------------------

    app.get('/faculty/getAll', tokenCheck.verifyToken, (req, res) => {
        jwt.verify(req.token, process.env.JWT_SECRET_TOKEN, async(err, results) => {
            if(err){
                res.sendStatus(403)
            }
            else{
                const getFaculties = await Faculties.findAndCountAll();
                if(getFaculties){
                    return res.status(200).json(
                        {
                            data: getFaculties,
                            status: 'success'
                        }
                    )
                }
                else{
                    return res.status(200).json(
                        {
                            status: 'error'
                        }
                    )
                }
            }
        })
    })

     // --------------------------------- Delete schools------------------------------------------------------------

     app.delete('/school/deleteSchool', tokenCheck.verifyToken, (req, res) => {
        jwt.verify(req.token, process.env.JWT_SECRET_TOKEN, async(err, results) => {
            if(err){
                res.sendStatus(403)
            }
            else{
                // return res.json(req.body.school_id);

                const deleteSchool = await Schools.destroy({
                    where: {
                        school_id: req.body.school_id
                    }
                  });
                  
                if(deleteSchool){
                    return res.status(200).json(
                        {
                            status: 'success',
                            message: 'School successfully deleted'
                        }
                    )
                }
                else{
                    return res.status(200).json(
                        { 
                            status: 'error',
                            message: 'Opps! An Error occured'
                        }
                    )
                }
            }
        })
    })

    // --------------------- Update school ------------------------

    app.put('/school/editSchool', tokenCheck.verifyToken, (req, res) => {
        //check token
        jwt.verify(req.token, process.env.JWT_SECRET_TOKEN, async(err, results) => {
            if(err){
                res.sendStatus(403)
            }
            else{
                // validate
                const schema = Joi.object({ 
                    school_id: Joi.string().required(),
                    school: Joi.string().required().min(5),
                    aka: Joi.string().required(),
                    city: Joi.string().required(),
                    Authorization: Joi.string().required()
                });

                const {value, error} = schema.validate(req.body);
                if(error && error.details){
                    // return res.status(406).json({message: error.details[0].message});
                    return res.json({message: error.message});
                }
                else{
                    let data = {
                        school_name: req.body.school,
                        aka: req.body.aka,
                        city: req.body.city,              
                    }

                    console.log(data);
                    const updateSchool = await Schools.update(data,{
                        where: {
                            school_id: req.body.school_id
                        }
                    }); 

                    if(updateSchool){            
                        return res.status(200).json({
                            message: 'School Updated Successfully',
                            status: 'success',
                            data: updateSchool
                        });
                        }
                    else{
                        return res.status(400).json({
                            message: 'An Error Occured',
                            status: 'error'
                        })
                    }
                }
            }
        })
    });
}
