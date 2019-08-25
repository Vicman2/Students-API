const http = require('http');
const  { parse } = require('url');
const  stringDecoder = require('string_decoder').StringDecoder;
const configuration = require('./lib/config.js')
const crudeOperations = require('./lib/crud.js');
const validateUserInput = require('./lib/validateUserInput.js')


const server = http.createServer((req, res) => {

    //Get the url and parse it 
    var parsedurl = parse(req.url, true);
    var pathname = parsedurl.pathname;
    //trim the parsed url
    var trimedPath = pathname.replace(/^\/+|\/+$/g, "");
    //get the query string from the url
    var queryString = parsedurl.query;

    // This will be for a post request

    // This is gong to be our chosen handler

    const choosenHandler =typeof(router[trimedPath]) !== 'undefined' ?  router[trimedPath] :
    handler.notFound;

    // When the user make a post request
    if(req.method == 'POST'){
        var decoder = new stringDecoder('utf-8'); // To help us convert the buffer to readable strings
        var buffer = "";
        req.on('data', (dataChunks) => {
           buffer += decoder.write(dataChunks);
        })
        req.on('end', () => {
            decoder.end(); //End after conversion
            let dataToUse = JSON.parse(buffer); 
            let validData = false;
            if(dataToUse.name && !isNaN(dataToUse.age) && validateUserInput(dataToUse.regNo) && !isNaN(dataToUse["G.P"]) && dataToUse.faculty){
                validData = true;
            }
            if(validData){
                choosenHandler(dataToUse, (statusObject) => {
                    crudeOperations.crud.create(dataToUse, (isTrue, statObject) => {
                        if(isTrue == true){
                            res.end(statObject.statusMessage)
                            console.log(statObject.statusMessage)
                        }else{
                            res.writeHead(statObject.statusCode);
                            res.end(statObject.statusMessage)
                        }
                        
                    })
                })
            }else{
                res.end("Invalid Data, check out the data you are storing, make sure you are storing the correct key value pair of that student")
            }
            
        

        })
    }


    // This gets both the whole students and individual student, to get the individual student, parse the regNo of the
    // student in the query string like localhost:7000/students?regNo=2016524099
    if(req.method == 'GET'){
       if(trimedPath == 'students' && validateUserInput(queryString.regNo)){
          crudeOperations.crud.read(false, queryString.regNo, (bol, statObject, value) => {
              if(bol == true){
                  res.setHeader('Content-Type', 'application/json');
                  res.writeHead(statObject.statusCode);
                  res.end(value);
              }else{
                res.setHeader('Content-Type', 'Text');
                res.writeHead(statObject.statusCode);
                res.end(statObject.statusMessage);
              }
          })
       }else if(trimedPath == 'students'){
           crudeOperations.crud.read(true, false, (bol, statObject, value) => {
               if(bol == true){
                res.setHeader('Content-Type', 'application/json');
                res.writeHead(statObject.statusCode);
                res.end(value);
               }else{
                res.setHeader('Content-Type', 'Text');
                res.writeHead(statObject.statusCode);
                res.end(statObject.statusMessage);
               }
           })
       }

    }

    // If the user makes a Put request, this is what you it should look like

    if(req.method == 'PUT'){
        if(trimedPath == 'students' && validateUserInput(queryString.regNo)){
            crudeOperations.crud.update(queryString.regNo, queryString, (statObject)=> {
                res.setHeader('Content-Type', 'Text');
                res.writeHead(statObject.statusCode);
                res.end(statObject.statusMessage);
            })
        }else{
            res.setHeader('Content-Type', 'Text');
            res.writeHead(404);
            res.end("Check Out Your route handler");
        }
    }

    if(req.method == 'DELETE'){
        if(trimedPath == 'students' && validateUserInput(queryString.regNo)){
            crudeOperations.crud.delete(queryString.regNo , (statObject) => {
                res.setHeader('Content-Type', 'Text');
                res.writeHead(statObject.statusCode);
                res.end(statObject.statusMessage);
            })
        }else{
            res.setHeader('Content-Type', 'Text');
            res.writeHead(404);
            res.end("Check Out Your route handler");
        }
    }



})



var ourHandler = {};

ourHandler.students = (data, callback) => {
    callback({statusCode: 200, statusMessage: "Successful Operation"});
}

ourHandler.notFound = (data, callback) => {
    callback({statusCode: 404, statusMessage: "router: Not found"});
}


var router = {
    "students": ourHandler.students
};
server.listen(configuration.port, () => {
    console.log(`Server is live on port  ${configuration.port}`)
})


 