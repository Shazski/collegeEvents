var db = require('../config/connection')
var collName = require("../config/collections")
const bcrypt = require('bcrypt')
const promise = require('promise')
const { ObjectId } = require('mongodb')
var nodemailer = require('nodemailer');

module.exports = {
    doSignup: (userData) => {
        return new promise(async (resolve, reject) => {

            let respo = {}
            userData.password = await bcrypt.hash(userData.password, 10)
            db.get().collection(collName.user_collection).findOne({ $or: [{ email: userData.email }, { Username: userData.Username }] }).then((status) => {
                if (status) {
                    respo.status = true
                    resolve(respo)
                } else {
                    db.get().collection(collName.user_collection).insertOne(userData)
                    resolve({ status: false })
                }
            })

        })


    },


    doLogin: (loginData) => {
        return new promise(async (resolve, reject) => {
            let Status = false
            let response = {}
            let user = await db.get().collection(collName.user_collection).findOne({ email: loginData.email })
            if (user) {

                bcrypt.compare(loginData.password, user.password).then((status) => {

                    if (status) {
                        response.user = user
                        response.status = true
                        resolve(response)

                    } else {
                        resolve({ status: false })
                    }

                })
            } else {
                console.log("login failed");
                resolve({ status: false })
            }
        })
    },
    hodLogin: (loginData) => {
        return new promise(async (resolve, reject) => {
            let Status = false
            let response = {}
            let user = await db.get().collection(collName.hod_collection).findOne({ email: loginData.email })
            if (user) {

                bcrypt.compare(loginData.password, user.password).then((status) => {

                    if (status) {
                        response.user = user
                        response.status = true
                        resolve(response)

                    } else {
                        resolve({ status: false })
                    }

                })
            } else {
                console.log("login failed");
                resolve({ status: false })
            }
        })
    },
    teacherLogin: (loginData) => {
        return new promise(async (resolve, reject) => {
            let Status = false
            let response = {}
            let user = await db.get().collection(collName.teacher_collection).findOne({ email: loginData.email })
            if (user) {

                bcrypt.compare(loginData.password, user.password).then((status) => {

                    if (status) {
                        response.user = user
                        response.status = true
                        resolve(response)

                    } else {
                        resolve({ status: false })
                    }

                })
            } else {
                console.log("login failed");
                resolve({ status: false })
            }
        })
    },


    getSearchedCollege: (district, food) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collName.events_collection).find({ district: district, food: food, permission: "true" }).toArray().then((response) => {
                resolve(response)
            })
        });
    },

    addEvent: (eventData) => {
        return new promise(async (resolve, reject) => {
            let respo = {}
            eventData.password = await bcrypt.hash(eventData.password, 10)
            db.get().collection(collName.events_collection).findOne({ $or: [{ email: eventData.email }, { eventName: eventData.eventName }] }).then((status) => {
                if (status) {
                    respo.status = true
                    resolve(respo)
                } else if (eventData.permission === 'false') {

                    db.get().collection(collName.events_collection).insertOne(eventData).then((response) => {
                        resolve(response.insertedId)
                    })

                } else {
                    respo.reg = "false"
                    resolve(respo)
                }


            })


        })


    },



    eventLogin: (eventLoginData) => {
        return new promise(async (resolve, reject) => {
            let Status = false
            let response = {}
            let event = await db.get().collection(collName.events_collection).findOne({ email: eventLoginData.email })
            if (event) {

                bcrypt.compare(eventLoginData.password, event.password).then((status) => {

                    if (status && event.permission === "true") {
                        response.event = event
                        response.status = true
                        resolve(response)

                    } else {
                        resolve({ status: false })
                    }

                })
            } else {
                console.log("login failed");
                resolve({ status: false })
            }
        })
    },

    getRequest: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collName.events_collection).find({ permission: "false" }).toArray().then((response) => {
                resolve(response)
            })
        });
    },
    acceptRequest: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collName.events_collection).updateOne({ _id: ObjectId(id) }, { $set: { accepted: "true" } }).then((response) => {
                resolve(response)
            })
        });
    },

    getAllAssignedEvents: (teacherId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collName.events_collection).find({ inCharge: teacherId }).toArray().then((response) => {
                resolve(response)
            })
        })
    },
    getAllDepartmentEventRequest: (department) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collName.events_collection).find({ category: "department", accepted: "false" }).toArray().then((response) => {
                resolve(response)
            })
        })
    },

    addEmployee: (details) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collName.employee_collection).insertOne(details).then((response) => {
                resolve(response)
            })
        });
    },
    addTeacher: (details) => {
        return new Promise((resolve, reject) => {
            details.password = bcrypt.hashSync(details.password, 10)
            db.get().collection(collName.teacher_collection).insertOne(details).then((response) => {
                resolve(response)
            })
        });
    },
    proposeEvent: (details) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collName.events_collection).insertOne(details).then((response) => {
                resolve(response)
            })
        });
    },
    proposeDepartmentEvent: (details) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collName.events_collection).insertOne(details).then((response) => {
                resolve(response)
            })
        });
    },
    assignTeacher: (teacherId, eventId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collName.events_collection).updateOne({ _id: ObjectId(eventId) }, { $set: { inCharge: teacherId } }).then((response) => {
                resolve(response)
            })
        });
    },
    addWinner: (winnerName, eventId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collName.events_collection).updateOne({ _id: ObjectId(eventId) }, { $set: { winner: winnerName } }).then((response) => {
                resolve(response)
            })
        });
    },
    addVacancy: (details) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collName.vacancy_collection).insertOne(details).then((response) => {
                resolve(response)
            })
        });
    },

    getVacancy: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collName.vacancy_collection).find({ status: "open" }).toArray().then((response) => {
                resolve(response)
            })
        });
    },
    getAllDepartmentTeachers: (department) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collName.teacher_collection).find({ department: department }).toArray().then((response) => {
                resolve(response)
            })
        });
    },
    getEventVacancy: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collName.vacancy_collection).find({ eventId: id }).toArray().then((response) => {
                resolve(response)
            })
        });
    },
    getRecruitment: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collName.employee_collection).find({ eventId: id, status: "sent" }).toArray().then((response) => {
                resolve(response)
            })
        });
    },


    deleteVacancy: (id) => {
        console.log(id);
        return new Promise((resolve, reject) => {
            db.get().collection(collName.vacancy_collection).deleteOne({ _id: ObjectId(id) }).then((response) => {
                resolve(response)
            })
        });
    },


    accept: (id, email) => {
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'ecommerce1419@gmail.com',
                pass: 'iqtyaldszzgoweap'
            }
        });

        var mailOptions = {
            from: 'ecommerce1419@gmail.com',
            to: email,
            subject: 'Vacancy accepted notice',
            text: 'Your are recruited for the work!reach by sharp 10 am on then given address'
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        })
        db.get().collection(collName.employee_collection).updateOne({ _id: ObjectId(id) }, {
            $set: {
                status: "accepted"
            }
        })

    },

    getEmployees: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collName.employee_collection).find({ eventId: id, status: "accepted" }).toArray().then((response) => {
                resolve(response)
            })
        });
    },
    reject: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collName.employee_collection).updateOne({ _id: ObjectId(id) }, {
                $set: {
                    status: "rejected"
                }
            })
        });
    },

    getUserEvents: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collName.events_collection).find({
                accepted: "true",
                "participants._id": { $nin: [userId] }
            }).toArray().then((events) => {
                resolve(events)
            })
        })
    },
    getInCharge: (inCharge) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collName.teacher_collection).find().toArray().then((events) => {
                resolve(events)
            })
        })
    },
    participateUser: (userData, eventId) => {
        userData.accepted = false
        return new Promise((resolve, reject) => {
            db.get().collection(collName.events_collection).updateOne({ _id: ObjectId(eventId) }, { $addToSet: { participants: userData } }).then((response) => {
                resolve(response)
            })
        })
    },
    acceptStudentRequest: (userId, eventId, email) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collName.events_collection).updateOne({ _id: ObjectId(eventId), "participants._id": userId }, { $set: { "participants.$.accepted": "true" } }).then((response) => {
                var transporter = nodemailer.createTransport({
                    secure: true,
                    port: 465,
                    service: 'gmail',
                    auth: {
                        user: "ecommerce1419@gmail.com",
                        pass: "iqtyaldszzgoweap"
                    }
                });

                var mailOptions = {
                    from: 'ecommerce1419@gmail.com',
                    to: email,
                    subject: 'You Have been approved for the event you have been registered',
                    html: `<h1>Your Unique Code will be ${userId} </h1>`
                };

                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                        resolve('mail not sent')
                    } else {
                        console.log('Email sent: ' + info.response);
                        resolve(response)
                    }
                });
            })
        })
    },
    deleteStudentRequest: (userId, eventId, email) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collName.events_collection)
                .updateOne(
                    { _id: ObjectId(eventId) },
                    { $pull: { participants: { _id: userId } } }
                )
                .then((response) => {
                    var transporter = nodemailer.createTransport({
                        secure: true,
                        port: 465,
                        service: 'gmail',
                        auth: {
                            user: "ecommerce1419@gmail.com",
                            pass: "iqtyaldszzgoweap"
                        }
                    });
    
                    var mailOptions = {
                        from: 'ecommerce1419@gmail.com',
                        to: email,
                        subject: 'Rejected',
                        html: `<h1 style="color:red">You Have been Rejected from the event Rejestered </h1>`
                    };
    
                    transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            console.log(error);
                            resolve('mail not sent')
                        } else {
                            console.log('Email sent: ' + info.response);
                            resolve(response)
                        }
                    });
                })
                .catch((error) => {
                    reject(error);
                });
        });
    },
    getEventsById: (eventId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collName.events_collection).findOne({ _id: ObjectId(eventId) }).then((response) => {
                resolve(response)
            })
        })
    }





}
