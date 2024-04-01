var db = require('../config/connection')
var nodemailer = require('nodemailer')
var collName = require("../config/collections")
var promise = require("promise")
const { resolve, reject } = require('promise')
const { response } = require('express')
const async = require('hbs/lib/async')
var objectId = require('mongodb').ObjectId

module.exports = {

    addProducts: (product, callback) => {
        db.get().collection('adminpro').insertOne(product).then((data) => {
            callback(data.insertedId)
        })
    },
    getallProducts: () => {
        return new promise(async (resolve, reject) => {
            let product = await db.get().collection(collName.hod_collection).find().toArray()
            resolve(product)
        })
    },
    deleteProduct: (hodId) => {
        return new promise((resolve, reject) => {
            db.get().collection(collName.hod_collection).deleteOne({ _id: objectId(hodId) }).then((response) => {
                resolve(response)
            })
        })
    },


    getAllUsers: () => {
        return new promise((resolve, reject) => {
            db.get().collection(collName.user_collection).find().toArray().then((response) => {
                resolve(response)
            })
        })
    },

    deleteReq: (collegeDeleteId) => {
        return new promise((resolve, reject) => {
            db.get().collection(collName.events_collection).updateOne({ _id: objectId(collegeDeleteId) }, {
                $set: {
                    permission: "rejected"
                }
            }).then((response) => {
                resolve(response)
            })
        })
    },
    approveReq: (eventId) => {
        return new promise((resolve, reject) => {
            console.log(eventId,"eventId")
            db.get().collection(collName.events_collection).updateOne({ _id: objectId(eventId) }, {
                $set: {
                    accepted: "true"
                }
            }).then((response) => {
                resolve(response)
            })

        });
    },
}