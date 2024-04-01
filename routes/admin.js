var express = require('express');
const async = require('hbs/lib/async');
const { response } = require('../app');
const adminHelper = require('../helpers/admin-helper');
var router = express.Router();
var productHelpers = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers');
const verifyLogin = (req, res, next) => {
  if (req.session.admin) {
    next()
  } else {
    res.redirect('/admin/admin-login')
  }
}

router.get('/', verifyLogin, function (req, res) {
  if (req.session.loggeIn) {
    let admin = req.session.admin
    productHelpers.getallProducts().then((hod) => {

      res.render('admi/admin-index', { admin, hod });
    })

  } else {
    res.render('admi/admin-login')
  }
});

router.get("/admin-login", (req, res) => {
  res.render('admi/admin-login')
})
router.get("/add-hod", (req, res) => {
  res.render('admi/add-hod')
})
router.post("/add-hod", (req, res) => {
  console.log(req.body, "body data")
  adminHelper.addHod(req.body).then((respo) => {
    console.log(respo)
    res.redirect('/admin')
  })
})

router.post("/admin-login", (req, res) => {
  adminHelper.adminLogin(req.body).then((adminres) => {
    if (adminres.stat) {
      req.session.loggeIn = true
      req.session.admin = adminres.admin
      res.redirect('/admin')
    } else {
      res.render('admi/admin-login')
    }
  })
})

router.get('/delete-products/:id', (req, res) => {
  let proId = req.params.id
  productHelpers.deleteProduct(proId).then((response) => {
    res.redirect('/admin')
  })
})

router.get('/view-complaints', (req, res) => {
  adminHelper.getAllComplaints().then((complaint) => {
    console.log(complaint, "complaint data")
    if (complaint.length > 0) {
      res.render('admi/complaints', { admin, complaint })
    } else {
      res.render('admi/complaints', { admin: true, complaint: false })
    }
  })
})
router.get('/view-complaints', (req, res) => {
  adminHelper.getAllComplaints().then((complaint) => {
    console.log(complaint, "complaint data")
    if (complaint.length > 0) {
      res.render('admi/complaints', { admin, complaint })
    } else {
      res.render('admi/complaints', { admin: true, complaint: false })
    }
  })
})
router.get('/view-event-requests', (req, res) => {
  adminHelper.getAllEventRequest().then((events) => {
    console.log(events, "events data in controller")
    if (events.length > 0) {
      res.render('admi/events-approve', { admin: true, events })
    } else {
      res.render('admi/events-approve', { admin: true, events: false })
    }
  })
})
router.get('/view-events', (req, res) => {
  adminHelper.getAllEvents().then((events) => {
    if (events.length > 0) {
      res.render('admi/view-events', { admin:true, events })
    } else {
      res.render('admi/view-events', { admin: true, events: false })
    }
  })
})


router.get('/approve-req/', (req, res) => {
  let eventId = req.query.id
  productHelpers.approveReq(eventId).then((response) => {
    res.redirect('/admin/view-event-requests')
  })
})


router.get('/admin-logout', (req, res) => {
  req.session.admin = null
  req.session.loggeIn = null
  res.redirect('/admin')
})

router.post('/edit-products/:id', (req, res) => {
  productHelpers.updateProduct(req.params.id, req.body).then(() => {
    res.redirect('/admin')
    if (req.files.image) {
      let id = req.params.id
      let image = req.files.image
      image.mv('./public/images/' + id + '.jpg')
    }
  })
})



router.get('/delete-req/:id', (req, res) => {
  let collegeDeleteId = req.params.id
  productHelpers.deleteReq(collegeDeleteId).then((response) => {
    res.redirect('/admin/event-request')
  })
})

router.get('/all-users', verifyLogin, async (req, res) => {
  let users = await productHelpers.getAllUsers()
  res.render('admi/all-users', { users, admin: true })
})




module.exports = router;
