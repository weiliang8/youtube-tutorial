const fs = require('fs'); //return the fs module and store in fs as obj
const http = require('http');
const url = require('url');
const slugify = require('slugify');
const replaceTemplate = require('./modules/replaceTemplate');
const { toUnicode } = require('punycode');

//////////////////////////////////////////
//Shortcut
//////////////////////////////////////////

//Ctrl+C to stop terminal
//Ctrl+L to clear terminal
//Ctrl+D to exit node terminal

//////////////////////////////////////////
//1.Files
//////////////////////////////////////////

//Blocking, synchronous way
// const textIn= fs.readFileSync('./txt/input.txt','utf-8');
// console.log(textIn);
// const textOut = `This is what we know about avocado: ${textIn}.\nCreated on ${Date.now()}`;
// fs.writeFileSync('./txt/output.txt',textOut);
// console.log("File written!");

//Non-Blocking, asynchronous way using callback function
//Read start.txt to get file name =>
//Read filename.txt and store in data2 =>
//Read append.txt and store in data3 =>
//Write data2 & data3 into final.txt

// fs.readFile('./txt/start.txt', 'utf-8', (err, data1) => {
//     if(err) return console.log("Error!");

//     fs.readFile(`./txt/${data1}.txt`, 'utf-8', (err, data2) => {
//         console.log(data2);
//         fs.readFile('./txt/append.txt', 'utf-8', (err, data3) => {
//             console.log(data3);
//             fs.writeFile('./txt/final.txt', `${data2}\n${data3}`, 'utf-8', err => {
//                 console.log('Your file has been written');
//             })
//         });
//     });
// });
// console.log("will read file");

//////////////////////////////////////////
//2.Server
//////////////////////////////////////////

const tempOverview = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  'utf-8'
); //executed only once
const tempCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  'utf-8'
);
const tempProduct = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  'utf-8'
);

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const dataObj = JSON.parse(data); // arr of num of prod obj

const slugs = dataObj.map((el) => slugify(el.productName, { lower: true }));
console.log(slugs);

const server = http.createServer((req, res) => {
  //request, response

  //console.log(req.url);////product?id=0
  //console.log(url.parse(req.url,true));//true parse the query string from the url(aft ?) url?id=0 result os query:{id:0}
  const { query, pathname } = url.parse(req.url, true); //create variable with the exact property name return by the obj

  //Overview page
  if (pathname === '/' || pathname === '/overview') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    //Loop dataObj arr that hold all the product, in each iteration, it will replace template card (tempCard) with current product (el)
    //cardsHtml will store the array with the 5 final product card html
    const cardsHtml = dataObj
      .map((el) => replaceTemplate(tempCard, el))
      .join(''); //el hold the obj
    const output = tempOverview.replace('{%PRODUCT_CARDS%}', cardsHtml);

    res.end(output);

    //Product page
  } else if (pathname === '/product') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    const product = dataObj[query.id];
    const output = replaceTemplate(tempProduct, product);
    res.end(output);

    //API
  } else if (pathname === '/api') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(data); //need to send back a string

    //Not found
  } else {
    res.writeHead(404, {
      //Http header
      'Content-Type': 'text/html',
      'my-own-header': 'hello-world',
    });
    res.end('<h1>Page not found!</h1>');
  }
});

//local host ip 127.0.0.1
server.listen(8000, '127.0.0.1', () => {
  console.log('Listening to requests on port 8000');
});
