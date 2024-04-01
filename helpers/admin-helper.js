var db = require('../config/connection')
var collName = require("../config/collections")
const promise = require('promise')
const bcrypt = require('bcrypt')

module.exports = {
    adminLogin: (loginData) => {
        adminrespo = {}
        return new promise((resolve, reject) => {
            console.log(loginData)
            db.get().collection(collName.admin_collection).findOne({ admincode: loginData.admincode }).then((status) => {
                adminrespo.admin = status
                if (status) {
                    adminrespo.stat = true
                    resolve(adminrespo)
                } else {
                    resolve({ stat: false })
                }
            })
        })
    },
    addHod: (hodData) => {
        return new promise((resolve, reject) => {
            hodData.password = bcrypt.hashSync(hodData.password, 10)
            hodData.role = "hod"
            db.get().collection(collName.hod_collection).insertOne(hodData).then((res) => {
                console.log(res, "response data")
                if (res) {
                    resolve(res)
                } else {
                    reject({ stat: false })
                }
            })
        })
    },

    getAllComplaints: () => {
        return new promise(async (resolve, reject) => {
            let complaint = await db.get().collection(collName.complaint_collection).find().toArray()
            resolve(complaint)
        })
    },
    getAllEventRequest: () => {
        return new promise(async (resolve, reject) => {
            let event = await db.get().collection(collName.events_collection).find({ accepted: "false", category: "college" }).toArray()
            console.log(event, "event data in repo")
            resolve(event)
        })
    },
    getAllEvents: () => {
        return new promise(async (resolve, reject) => {
            let event = await db.get().collection(collName.events_collection).find({ accepted: "true" }).toArray()
            console.log("call camed", event)
            resolve(event)
        })
    },
}