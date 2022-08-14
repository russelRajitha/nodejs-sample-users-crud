const mysql = require('mysql');
const http = require('http');
const express = require('express');
const validate = require('validate.js');
const app = express();
const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "crud_users",
});
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'avatars/')
    },
    filename: function (req, file, cb) {
        if (typeof file !== "object") {
            return cb(null, '')
        }
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, `${file.fieldname}-${uniqueSuffix}-${file.originalname}`)
    }
})
const avatarsUploader = multer({storage})
con.connect(function (err) {
    if (err) throw err;
});

const statusCodes = {
    success: 'success',
    error: 'error',
}

app.get('/', (req, res) => {
    res.json({
        status: statusCodes.success,
        message: 'API Servers Works!!!',
        data: {},
        errors: {}
    });
});

app.get('/users', (req, res) => {
    con.query(`SELECT *,concat('http://localhost:2500/avatars/',avatar) as avatar FROM users`, function (err, result, fields) {
        if (err) {
            return res.json({
                status: statusCodes.error,
                message: err.sqlMessage,
                data: {},
                errors: {}
            });
        }
        return res.json({
            status: statusCodes.success,
            message: 'Users fetched successfully',
            data: result,
            errors: {}
        });
    });

});

app.post('/user', avatarsUploader.single('avatar'), (req, res) => {
    const errors = validate(
        {
            ...req.body,
            avatar: req.file ? req.file.filename : undefined,
        },
        {
            name: {
                presence: {
                    allowEmpty: false
                }
            },
            avatar: {
                presence: {
                    allowEmpty: false,
                    message: "is required"
                }
            },
            email: {
                email: true,
                presence: {
                    allowEmpty: false,
                },
            },
        });
    if (typeof errors === "object"){
        return res.json({
            status: statusCodes.error,
            message: 'User Creation failed!!!',
            data: {},
            errors
        });
    }
    con.query(`Insert into users (name, email, avatar)
               values ('${req.body.name}', '${req.body.email}', '${req.file.filename}')`, function (err, result) {
        if (err) {
            return res.json({
                status: statusCodes.error,
                message: err.sqlMessage,
                data: {},
                errors: {}
            });
        }
        res.json({
            status: statusCodes.success,
            message: 'User Created successfully!!!',
            data: {},
            errors: {}
        });
    });
});

http.createServer(app).listen(2500);


