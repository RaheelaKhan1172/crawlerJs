'use strict';

//requires
const https = require('https'),
    http = require('http');

// constants
const domain = 'https://www.google.com';
const reg = new RegExp('href="(.*?)"',"g");
const sub = "www.google.com";
function getPage(page) {
  return new Promise((resolve,reject) => {
    protocol.get(page,(res) => {
      var dataRecieved = '';
      res.on('data', (d) => dataRecieved += d)
        .on('end', () => resolve(dataRecieved))
        .on('error', (e) => reject(e));
    });
  });
}

function extractLinks(htmlContent,cb) {
  var links = [];
  var matchArray = [];
  while ((matchArray = reg.exec(htmlContent)) !== null) {
    links.push(matchArray[1]); //match array contains link at the first position
  }
  return new Promise((resolve,reject) => {
    resolve(links);
  });
}

function getTheProtocol(url) {
  return (url.startsWith('http:') ? 'http' : 'https');
}

function filterLinks(links, cb) {
    return new Promise((resolve,reject) => {
    var theLinks =  links.filter((link,index) => {
      if (link.includes(sub) || (!link.startsWith('http') && !link.startsWith('https'))) {
        return link;
      }
    });
    resolve(theLinks);
  });
}

function formatUrl(link) {
  if (link.startsWith('http')|| link.startsWith('https')) {
    return link;
  } else {
    return domain + "/"+link;
  }
}


function after(link,linksSeen,q,currL) {
  var l = formatUrl(link);
  handleRest(l,linksSeen,q,currL);
}


function done(data) {
  console.log(data);
}


function bfs(startURL) {
  var q = [], linksSeen = [];
  var currentLink,l;
  var links;
  q.push(startURL);


  function handleRest(a) {
    if (!linksSeen.includes(a) && !q.includes(a)) {
      q.push(a);
    }
  return q;
  }

  function searchTheLinks(links) {
    return new Promise((resolve,reject) => {
        links.forEach(function(a,i) {
          if (!linksSeen.includes((a)) && !q.includes(a)) {
            handleRest(a);
          }
      });
      resolve();
    });
  }

  function pushToSeen() {
    return new Promise((resolve,reject) => {
      if(!linksSeen.includes(currentLink)) {
         linksSeen.push(currentLink);
      }
       resolve();
    });
  }

  function startSearch(q) {
    if(q.length) {
      currentLink = q.shift();
      getPage(formatUrl(currentLink)).then((content) => extractLinks(content)).then((extracted) => filterLinks(extracted)).then((links) => searchTheLinks(links)).then(() =>  pushToSeen())
            .then(() => {
              startSearch(q);
            });
    } else {
      return done(linksSeen);
    }
  }
  startSearch(q);
}

var protocol = (function() {
  try {
    let url = process.argv[2];
    let p = url.startsWith('http') ? https :
      url.startsWith('https') ? http :
      undefined;
    if (!p) throw 'Url must begin with http or https';
    return p;
  } catch(e) {
    console.log(e);
    process.exit(-1);
  }
})()

bfs(process.argv[2]);

exports.getPage = getPage;
exports.extractLinks = extractLinks;
exports.bfs = bfs;
