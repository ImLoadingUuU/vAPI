const cheerio = require("cheerio")
let panelLink = "http://cpanel.epizy.com"
var axios = require('axios');
var qs = require('qs');
module.exports = (req,res) => {

var data = qs.stringify({
    'DomainName': req.body.DomainName || ""
});
var config = {
  method: 'post',
  url: panelLink + "/panel/indexpl.php?option=domains_add",
  headers: { 
    'Cookie': 'PHPSESSID=' + req.body.phpseessid || "",
    'Accept-Encoding': 'gzip, deflate', 
    'Referer': panelLink, 
    'User-Agent': 'Mozilla/5.0 (X11; Linux 386; rv:108.0) Gecko/20100101 Firefox/108.0'
  },
  data : data
};

axios(config)
.then(function (response) {
 let $ = cheerio.load(response)
 let text = $("#content .body-content")
 res.json({
    message: text.text() || "Unknown Erorr | Session may not working or invalid",
 })
})
.catch(function (error) {
  res.json({
    message: "Failed",
  })
});

}