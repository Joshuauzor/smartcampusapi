const  sequelize  = require('sequelize');
const db = require('../connection');

const Faculties = db.define('tbl_faculties',{
    faculty_id	: {
        type: sequelize.STRING,
        primaryKey: true
    },
    faculty_name: {
        type: sequelize.STRING,
        allowNull: false,
    },
    school_id: {
        type: sequelize.STRING
    }
});

Faculties.sync({false: true})

module.exports = Faculties;