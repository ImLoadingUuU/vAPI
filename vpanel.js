const router = require("express").Router()
var axios = require('axios');
var qs = require('qs');
var useragent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"
const cheerio = require("cheerio")
router.post('/vpanel/auth',(req,res) => {
  // User-Agent Is Required
  if (!req.body.uname || !req.body.passwd) return  res.json({
    successful: false,
    message: "Username or Password is missing"
   })

  
    var data = qs.stringify({
      'uname': req.body.uname || "", 
      'passwd': req.body.passwd  || "",
      'theme': 'PaperLantern',
      'seeesurf': req.body.seeesurf || '555930360198781056',
      'login': '' 
    });
    var config = {
      method: 'post',
      url: 'http://cpanel.epizy.com/login.php',
      headers: { 
        'User-Agent': useragent, 
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data : data
    };
    
    axios(config)
    .then(function (response) {
      let docu = cheerio.load(response.data)
      if (docu("#forms script").html()) {
        console.log(response.headers["set-cookie"])
      res.setHeader("cookie",response.headers["set-cookie"])
      res.send({
        message: "Success",
        successful: true,
        authID: docu("#forms script").text().replace(`document.location.href = '`).slice(0,-1).replace("undefined","").replace("panel/indexpl.php?id=",""),
        cookie: response.headers["set-cookie"][1].split(";")[0].split("=")[1],

      })
      } else {
      res.send({
         successful: false,
        message: docu("#login-sub #forms").text(),
        cookie: response.headers["set-cookie"][0].split(";")[0].split("=")[1],
      })
      }
      
    })
    .catch(function (error) {
      console.log(error);
    });
    
})
router.post('/vpanel/activate',(req,res) => {
  console.log(req.body)
var config = {
  method: 'get',
  url: 'http://cpanel.epizy.com/panel/indexpl.php?id=' + req.body.authID,
  headers: { 
    'Cookie': 'PHPSESSID=' + req.body.phpsessid, 
    'Accept-Encoding': 'gzip, deflate', 
    'Referer': 'http://cpanel.epizy.com/login.php', 
    'User-Agent':useragent
  }
};

axios(config)
.then(function (response) {
  if (response.data.search("You are not logged in...1") != -1){
    return res.json({
      successful: false,
      message: "Invalid Cookie or Session ID",
    })
  }
  return res.json({
    successful: true,
    message: "Activated",
  })
})
.catch(function (error) {
  console.log(error);
});

})
router.post('/vpanel/getStats',(req,res) => {
  axios({
    method: 'get',
    url: 'http://cpanel.epizy.com/panel/indexpl.php',
    headers: { 
      'Cookie': 'PHPSESSID=' + req.body.phpsessid, 
      'Accept-Encoding': 'gzip, deflate', 
      'Referer': 'http://cpanel.epizy.com/', 
      'User-Agent':useragent
    }
  }).then((response) => {
    if (response.data.search("You are not logged in...1") != -1){
      return res.json({
        successful: false,
        message: "Invalid Cookie or Session ID",
      })
    }

    let $ = cheerio.load(response.data)
    let statsSelections = $("#stats #statsSection")
    let stats = statsSelections[0]
    let accountstats = statsSelections[1]
    const plan = $('#stats tr td.stats_left:contains("Plan:")').next().text();
    const ftpAccounts = $('#stats tr td.stats_left:contains("FTP accounts:")').next().text();
    const subDomains = $('#stats tr td.stats_left:contains("Sub-Domains:")').next().text();
    const addonDomain = $('#stats tr td.stats_left:contains("Add-on Domains:")').next().text();
    const mysqls = $('#stats tr td.stats_left:contains("MySQL Databases:")').next().text();
    const diskQuota = $('#stats tr td.stats_left:contains("Disk Quota:")').next().text().replace(/\s+/g, '');
    const diskUsed = $('#stats tr td.stats_left:contains("Disk Space Used:")').next().text().replace(/\s+/g, '').replace('0', '');

    const Bandwidth = $('#stats tr td.stats_left:contains("Bandwidth:")').next().text().replace(/\s+/g, '');
    const BandwidthUsed = $('#stats tr td.stats_left:contains("Bandwidth used:")').next().text().replace(/\s+/g, '')
    const [ftpnow, ftpmax] = ftpAccounts.split('/').map(x => x.trim());  
    const [subnow, submax] = subDomains.split('/').map(x => x.trim());  
    const [addnow, addmax] = addonDomain.split('/').map(x => x.trim());
    const [mysqnow, mysqmax] = mysqls.split('/').map(x => x.trim());
    return res.json({
      successful: true,
      ftpAccounts: {
        now: ftpnow,
        max: ftpmax
      },
      subDomains: {
        now: subnow,
        max: submax
      },
      addonDomain: {
        now: addnow,
        max: addmax
      },
      mysqls: {
        now: mysqnow,

        max: mysqmax
      },
    disk: {
      now: diskUsed,
      max: diskQuota
    },

    bandwidth: {
      now: BandwidthUsed,
      max: Bandwidth
    },
    })

  
  })

})
module.exports = router