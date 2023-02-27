const Router = require("express").Router()
let panelLink = "http://cpanel.epizy.com/"
Router.post('/vpanel/execute',(req,res) => {
    if (!req.body.type){
        res.json({
            successful: false,
            message: "Type is missing (Like addonDomain, createMysql, etc.))"
        })
    }
  if (req.body.type == "addonDomain") {
    require("./vcontrols/addonDomain")(req,res)
  }
} )