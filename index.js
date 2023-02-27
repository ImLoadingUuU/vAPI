const cheerio = require("cheerio")
const express = require("express")
const axios = require("axios")
const bp = require("body-parser")
const cors = require("cors")
let app = express()
const corsOptions = {
    origin: "*",
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization'],
  };
  app.use(cors(corsOptions));
app.use(bp.json())
app.use(require("./vpanel"))
app.post('/register',(req,res) => {
    let body = req.body
    let resellerDomain = "byet.host"
    if (body.resellerDomain == undefined) {
        resellerDomain = req.body.resellerDomain
    }
    console.log(body)
 
    var qs = require('qs');
    var data = qs.stringify({
      'email': body.clientEmail,
      'username': body.clientDomain,
      'password': body.clientPassword,
      'PlanName': body.clientPlan || "Starter",
      'number': body.code || '61499' 
    });
    var config = {
      method: 'post',
      url: 'https://ifastnet.com/register2.php',
      headers: { 
        'Referer': "https://" + resellerDomain + "/", 
        'Content-Type': 'application/x-www-form-urlencoded', 
        'Cookie': 'PHPSESSID=kd21fl4v5p7tpf0pl9t8gvko74'
      },
      data : data
    }
    axios(config).then((response) => {
        console.log("Responsed")
        var page = cheerio.load(response.data)
        page("style").remove()
        page("link").remove()
        page("head").remove()
        
        res.json({
            message: page("body").text(),
        })
    }).catch((err) => {
        res.json({
            message: "error"
        })
    })
})


app.listen(80)