const http = require("http")
const fs = require("fs")
const path = require("path")

const port = 3000

const server =  http.createServer((request, response)=>{
    const pathFile =  path.join(__dirname, request.url === "/" ? "index.html" : request.url)
    const extName = String(path.extname(pathFile)).toLowerCase()
    const mimeType = {
        ".html" : "text/html",
        ".css" : "text/css",
        ".js" : "text/js"
    }
   const contentType =  mimeType[extName] || "application/octet-stream"
   fs.readFile(pathFile , (err, content)=>{
    if(err){
        if(err.code === "ENOENT"){
            response.writeHead(404 , {"content-Type": "text/html"})
            response.end("404 , Page not Found")
        }
    }
    else{
        response.writeHead(200,{"content-Type" : contentType} ) // status code 200 and a object where the i am serving the content from respone 
        response.end(content, "utf-8"); 
    }
   })
});

server.listen(port,()=>{
    console.log("server is listening");
    
})