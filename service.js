/* jshint node: true */
/* jshint esversion: 6 */
'use strict';

// console.log('Debug: ', process.env);

const http     = require('http'),
      srv_port = 3000;

let server = http.createServer( (req, res) => {

  const url = require('url');
  let query   = url.parse(req.url).query,
      options = {
        host: 'www.alibaba.com',
        port: 80,
        path: `/trade/search?fsb=y&IndexArea=product_en&CatId=&SearchText=${query}`,
        method: 'GET'
      };

  http.request(options, (result) => {

    // Monitor only for my node server
    console.log('STATUS: ' + result.statusCode);
    console.log(options.path);

    result.setEncoding('utf8');

    // Capture raw output
    var html_data='';
    result.on('data', (chunk) => { html_data += chunk; });

    result.on('end', () => {

      // Select only relevant output
      let capture=0;
      let object_text='';
      html_data.split("\n").forEach( (line) => {

        if(/"normalList":\[/.test(line)){
          capture=1;
        }

        if(/"relatedSearch":\{/.test(line)){
          capture=0;
        }

        if(capture==1){
          object_text+=line;
        }

      });

      // Create object
      let list=JSON.parse( '{' + object_text.slice(0, -1) + '}' );

      // Output result
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-cache, no-store');
      res.writeHead(result.statusCode);
      res.end(JSON.stringify(list));

    });

  }).end();

});

// server.listen(process.env.PORT || process.env.NODE_PORT || srv_port, process.env.NODE_IP || 'walmartapi.scm.azurewebsites.net', () => {
server.listen(3000, 'localhost', () => {
  console.log(`Application worker ${process.pid} started on port ${srv_port} ...`);
});