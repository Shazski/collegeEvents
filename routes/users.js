var express = require('express');
const res = require('express/lib/response');
const async = require('hbs/lib/async');
const { response, render } = require('../app');
var router = express.Router();
var productHelper = require('../helpers/product-helpers')
var userHelper = require('../helpers/user-helpers');
const { route } = require('./admin');
const adminHelper = require('../helpers/admin-helper');
const { Db } = require('mongodb');
const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next()
  } else {
    res.redirect('/login')
  }
}
const hodverify = (req, res, next) => {
  if (req.session.hodLogin) {
    next()
  } else {
    res.redirect('/hod-login')
  }
}
const teacherVerify = (req, res, next) => {
  if (req.session.teacherLogin) {
    next()
  } else {
    res.redirect('/teacher-login')
  }
}


router.get('/', verifyLogin, async function (req, res, next) {
  let user = req.session.user
  userName = req.session.user.Username
  res.render('user/index', { admin: false, user, userName });
});

router.get('/login', (req, res) => {
  if (req.session.loggedIn) {
    res.redirect('/')

  } else {
    res.render('user/user-login', { 'loginerror': req.session.loginErr })
    req.session.loginErr = false
  }

})

router.get('/signup', (req, res) => {
  if (req.session.loggedIn) {
    res.redirect('/')
  } else {
    res.render('user/user-signup')

  }
})
router.get('/hod-login', (req, res) => {
  if (req.session.loggedIn) {
    res.redirect('/')
  } else {
    res.render('hod/hod-login')

  }
})
router.get('/hod/add-teacher', hodverify, (req, res) => {
  res.render('hod/add-teacher', { hod: true, department: req.session.user.department })
})
router.get('/hod/propose-event', hodverify, (req, res) => {
  res.render('hod/propose-events', { hod: true, proposedBy: req.session.user })
})
router.post('/hod/propose-event', hodverify, (req, res) => {
  userHelper.proposeEvent(req.body).then((response) => {
    res.redirect('/hod')
  })
})

router.post('/teacher/propose-department-event', teacherVerify, (req, res) => {
  userHelper.proposeDepartmentEvent(req.body).then((response) => {
    res.redirect('/teacher')
  })
})

router.get('/hod/hod-logout', (req, res) => {
  req.session.user = null
  req.session.hodLogin = null
  res.redirect('/hod')
})
router.get('/teacher/teacher-logout', (req, res) => {
  req.session.user = null
  req.session.teacherLogin = null
  res.redirect('/teacher')
})
router.post('/hod/add-teacher', hodverify, (req, res) => {
  userHelper.addTeacher(req.body).then((response) => {
    if (response) {
      res.redirect('/hod')
    } else {
      res.redirect('/hod/add-teacher')
    }
  })
})
router.post('/hod-login', (req, res) => {
  userHelper.hodLogin(req.body).then((response) => {
    if (response.status) {
      req.session.hodLogin = true
      req.session.user = response.user
      res.redirect('/hod')
    } else {
      req.session.loginErr = "Invalid username or password!please check it"
      res.redirect('/hod-login')
    }
  })
})
router.post('/teacher-login', (req, res) => {
  userHelper.teacherLogin(req.body).then((response) => {
    if (response.status) {
      req.session.teacherLogin = true
      req.session.user = response.user
      res.redirect('/teacher')
    } else {
      req.session.loginErr = "Invalid username or password!please check it"
      res.redirect('/teacher-login')
    }
  })
})

router.get('/teacher-login', (req, res) => {
  res.render('teacher/teacher-login')
})
router.get('/teacher/event-winner/:winnerName/:eventId', (req, res) => {
  userHelper.addWinner(req.params.winnerName, req.params.eventId).then((respo) => {
    res.redirect('/teacher')
  })
})

router.get('/teacher', teacherVerify, (req, res) => {
  userHelper.getAllAssignedEvents(req.session.user._id).then((events) => {
    console.log(events, "events data in controller")
    if (events.length > 0) {
      console.log(events, "events")
      res.render('teacher/teacher-index', { events, teacher: req.session.user })
    } else {
      res.render('teacher/teacher-index', { events: false, teacher: req.session.user })
    }
  })
})

router.get('/teacher/propose-department-event', teacherVerify, (req, res) => {
  res.render('teacher/propose-department-event', { proposedBy: req.session.user, teacher: req.session.user })
})
router.get('/hod/approve-req', hodverify, (req, res) => {
  const id = req.query.id
  userHelper.acceptRequest(id).then((response) => {
    res.redirect('/hod')
  })
})


router.get('/hod/department-event-request', hodverify, async (req, res) => {
  const eventRequest = await userHelper.getAllDepartmentEventRequest(req.session.user.department)
  if (eventRequest.length > 0) {
    res.render('hod/view-department-event-request', { eventRequest, hod: req.session.user })
  } else {
    res.render('hod/view-department-event-request', { eventRequest: false, hod: req.session.user })
  }
})


router.post('/signup', (req, res) => {
  userHelper.doSignup(req.body).then((respo) => {
    console.log(respo);
    if (respo.status) {
      emailExits = "Email or Username already taken.Try different username or email"
      res.render('user/user-signup', { emailExits })
    } else {
      res.redirect('/login')
    }
  })
})




router.post('/login', (req, res) => {
  userHelper.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.loggedIn = true
      req.session.user = response.user
      res.redirect('/')
    } else {
      req.session.loginErr = "Invalid username or password!please check it"
      res.redirect('/login')
    }
  })
})

router.get('/logout', (req, res) => {
  req.session.user = null
  req.session.loggedIn = null
  res.redirect('/')
})

router.post('/view-events', verifyLogin, (req, res) => {
  req.session.district = req.body.district
  req.session.food = req.body.food
  res.redirect('/view-events')
})

router.get('/hod', hodverify, async (req, res) => {
  let events = await adminHelper.getAllEvents()
  console.log(req.session.user)
  let teacher = await userHelper.getAllDepartmentTeachers(req.session.user.department)
  console.log(teacher, "teacher data")
  if (events.length > 0) {
    res.render('hod/hod-index', { events, hod: req.session.user, teacher: teacher })
    console.log(req.session.user,"name");
  } else {
    res.render('hod/hod-index', { hod: req.session.user, events: false })
  }
})



router.get('/event-login', (req, res) => {
  res.render('user/event-login', { loginerr: req.session.loginErrr })
})
router.post('/event-login', (req, res) => {
  userHelper.eventLogin(req.body).then((response) => {
    if (response.status) {
      req.session.eventLogin = true
      req.session.event = response.event
      res.redirect('/event-index')
    } else {
      req.session.loginErrr = "Your event is not approved By admin"
      res.redirect('/event-login')
    }
  })
})


router.get('/apply/', verifyLogin, async (req, res) => {
  let vacancyId = req.query.id
  let eventId = req.query.event
  res.render('user/apply', { vacancyId, eventId })
})

router.get('/hod/assign-teacher/:id/:eventId', (req, res) => {
  userHelper.assignTeacher(req.params.id, req.params.eventId).then((respo) => {
    res.redirect('/hod')
  })
})

router.post('/apply', verifyLogin, (req, res) => {
  userHelper.addEmployee(req.body).then((response) => {
    image = req.files.image
    image.mv('./public/jobpic/' + response.insertedId + ".jpg")
  })
  res.redirect('/see-vacancy')
})
// router.get('/add-vacancy', eventverify, async (req, res) => {
//   eventName = req.session.event.eventName
//   district = req.session.event.district
//   eventId = req.session.event._id
//   res.render('user/vacancy', { event: true, eventName, district, eventId })
// })
// router.post('/add-vacancy', (req, res) => {
//   userHelper.addVacancy(req.body).then((response) => {
//     res.redirect('/event-index')
//   })
// })

router.get('/see-vacancy', verifyLogin, async (req, res) => {

  let vacancy = await userHelper.getVacancy()
  res.render('user/see-vacancy', { vacancy })
})
// router.get('/view-vacancy', eventverify, async (req, res) => {
//   eventName = req.session.event.eventName
//   let vacancy = await userHelper.getEventVacancy(req.session.event._id)
//   res.render('user/view-vacancy', { vacancy, event: true, eventName })
// })

// router.get('/vacancy-delete/:id', eventverify, (req, res) => {
//   userHelper.deleteVacancy(req.params.id).then((response) => {
//     res.redirect('/view-vacancy')
//   })
// })

// router.get('/view-recruitment', eventverify, async (req, res) => {
//   eventName = req.session.event.eventName
//   let vacancy = await userHelper.getRecruitment(req.session.event._id)
//   res.render('user/view-recruitment', { vacancy, event: true, eventName })
// })

router.get("/accept/", (req, res) => {
  userHelper.accept(req.query.id, req.query.email)
  res.redirect("/view-recruitment")

})
router.get("/reject/:id", (req, res) => {
  userHelper.reject(req.params.id)
  res.redirect("/view-recruitment")

})
// router.get("/view-employees", eventverify, async (req, res) => {
//   eventName = req.session.event.eventName
//   let employees = await userHelper.getEmployees(req.session.event._id)
//   res.render('user/view-employees', { employees, event: true, eventName })

// })

router.get('/see-events', verifyLogin, async (req, res) => {
  const events = await userHelper.getUserEvents(req.session.user._id)
  const inCharge = await userHelper.getInCharge(events.inCharge)
  const userDetails = req.session.user
  res.render('user/view-events', { events, inCharge, userDetails })
})

router.get('/participate/:id', verifyLogin, (req, res) => {
  const eventId = req.params.id
  const userData = req.session.user
  userHelper.participateUser(userData, eventId).then((response) => {
    console.log(response, "respons Data")
    res.redirect('/see-events')
  })
})

router.get('/teacher/view-student-request/:id', teacherVerify, (req, res) => {
  userHelper.getEventsById(req.params.id).then((events) => {
    console.log(events._id, "events data in upper")
    const eventId = events._id.toString()
    console.log(eventId, "event id")
    if (events?.participants?.length > 0) {
      res.render('teacher/view-student-request', { events: events.participants, teacher: req.session.user, eventId })
    } else {
      res.render('teacher/view-student-request', { events: false, teacher: req.session.user })
    }
  })
})
router.get('/teacher/approve-req', teacherVerify, (req, res) => {
  console.log(req.query.eventId, "event ID")
  userHelper.acceptStudentRequest(req.query.id.toString(), req.query.eventId.toString(), req.query.email).then((events) => {
    res.redirect(`/teacher/view-student-request/${req.query.eventId}`)
  })
})
router.get('/teacher/delete-req', teacherVerify, (req, res) => {
  userHelper.deleteStudentRequest(req.query.id.toString(), req.query.eventId.toString(), req.query.email).then((events) => {
    res.redirect(`/teacher/view-student-request/${req.query.eventId}`)
  })
})



module.exports = router
