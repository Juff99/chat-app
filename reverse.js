var linkify = require('linkifyjs');//Procura hyperlinks na string
var linkifyStr = require('linkifyjs/string');//Converte o hyperlink para html tags
const metaScraper = require('meta-scraper').default; //Para fazer Web Scraping, procurar opengraph e meta tags

const fs = require('fs');
const multer = require('multer');
const path = require('path');
const uuid = require('uuid/v1');
var express = require('express');
var app = express();

app.use(express.static('public'));

var server = app.listen(3000, function () {
    var host = server.address().address
    var port = server.address().port
    console.log("Example app listening at http://%s:%s", host, port);
});

const storage = multer.diskStorage({
    destination: './public/uploads',
    filename: (req,file,callback) => {
        callback(null,file.fieldname+'-'+ Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits:{fileSize:8000000}
}).single('myImage');

// route
app.get('/', (req, res) => {
    res.render('index.html');
});

app.post('/upload', (req, res) => {
    upload(req, res, (err) => {
        if(err){
            res.send(err);
        }else{
            console.log(req.file);
            res.send(req.file);
        }
    });
});

var io = require('socket.io')(server);

var users = [];
var nUsers=0;
var joinLeftLog = './logs/joinleflog.txt';
var chatLog = './logs/chatlog';
var d = new Date();
var day = d.getDate();

//Functions
async function findHypertext(texto){
    var embed = [];
    var emb = {type: '',title: '',image: '',video: '',description:'', color:'#272727', url:''};
    var msgTexto = '';
    var urlresult = linkify.find(texto);

    msgTexto = linkifyStr(texto,{/*...*/});

    if (urlresult.length == 0) {
        return {error:'hyperlink nao encontrado', urlListLen:urlresult.length, msgTexto:msgTexto};
    }else{
        for (let i=0;i<urlresult.length;i++) {
            emb = await metaScraper(urlresult[i].href)
                .then((data) => {
                    if (data.error == true) {
                        var em = {};
                        em.type = urlresult[i].type;
                        em.url = urlresult[i].href;
                        return em;
                    }else{
                        var em = {};
                        em.url = urlresult[i].href;
                        if (data.hasOwnProperty('title')) {
                            em.title = data.title;
                        }
                        if (data.hasOwnProperty('pageTitle')) {
                            em.title = data.pageTitle;
                        }
                        for (let j=0;j<data.allTags.length;j++) {
            
                            if(data.allTags[j].name == "title"){
                                em.title = data.allTags[j].content;
                            }
                            if(data.allTags[j].name == "description"){
                                em.description = data.allTags[j].content;
                            }
                            if(data.allTags[j].name == "theme-color"){
                                em.color = data.allTags[j].content;
                            }
                            if(data.allTags[j].property == "og:video:url"){
                                em.type = 'video';
                                em.video = data.allTags[j].content;
                            }
                            if(data.allTags[j].property == "og:image"){
                                em.image = data.allTags[j].content;
                            }
                        }
                        return em;
                    }
                });
            embed.push(emb);
        }
    }
    return {error:false,msgTexto:msgTexto,embeds:embed};
}

function readFile(file){
    try {
        if (fs.existsSync(file)) {
            var rawData = fs.readFileSync(file);
            return rawData;
        }else{
            return '';
        }
    } catch(err) {
        console.error(err);
    }
}

function writeFile(file,data){
    fs.writeFileSync(file,data);
}

function writeDailyLog(day,message) {
    var d = new Date();
    if (day < d.getDate()) {
        day++;
        writeFile(chatLog+getData(0)+'.txt',message);
    }else if(day == d.getDate()){
        var rData = readFile(chatLog+getData(0)+'.txt');
        rData += message;
        writeFile(chatLog+getData(0)+'.txt',rData);
    }
}

function getData(x){
    if(x == 0){
        var date = new Date();
        var day = date.getDate();
        var month = date.getMonth()+1;
        var year = date.getFullYear();
        return day+"-"+('0'+month).slice(-2)+"-"+year;
    }else if(x == 1){
        var date = new Date();
        var time_h = date.getHours();
        var time_m = date.getMinutes();
        var time_s = date.getSeconds();
        return ("0" + time_h).slice(-2) + ":" + ("0" + time_m).slice(-2) + ":" + ("0" + time_s).slice(-2);
    }
}

io.on('connection', (socket) => {
    console.log("Socket connected: ", socket.id);

    socket.on('chat_message', (data) => {
        var fromname = '';
        var tousername = '';
        var msg = data.message;

        findHypertext(msg)
            .then((embedInfo) => {
                if(embedInfo.error == false){//A mensagem tem hyperlink
                    if(msg.substr(0,1) === '@'){//Mensagem Privada
                        tousername = msg.substring(msg.lastIndexOf("@")+1,msg.lastIndexOf(":"));
                        for (let i=0;i<users.length;i++) {
                            if(users[i].username === tousername){
                                fromname = data.from.substring(data.from.lastIndexOf("@")+1,data.from.lastIndexOf("#"));
                                msg = msg.substring(msg.indexOf(":")+1);
                                io.sockets.connected[users[i].id].emit('private',{type:"private_message", hasEmbed:true, from:{name:fromname, username:data.from, imageurl:data.imageurl}, time:data.time, message:msg, embed:embedInfo});
                                writeDailyLog(day,"{type:'private_message',hasEmbed:true,from:{username:'"+data.from+"',imageurl:'"+data.imageurl+"'}, to:{username:'"+users[i].username+"',imageurl:'"+users[i].imageurl+"'},time:'"+data.time+"',message:'"+msg+"'}\n");
                            }
                        }
                    }else{//Mensagem Publica
                        /*socket.broadcast*/io.emit('broadcast_message',{hasEmbed:true, message:data.message, embed:embedInfo, username:socket.username, imageurl:data.imageurl, time:data.time});
                        writeDailyLog(day,"{type:'public_message',hasEmbed:true,from:{username:'"+data.from+"',imageurl:'"+data.imageurl+"'},time:'"+data.time+"',message:'"+msg+"'}\n");
                    }

                }else{//A mensagem não tem nenhum hyperlink
                    if(msg.substr(0,1) === '@'){//Mensagem Privada
                        tousername = msg.substring(msg.lastIndexOf("@")+1,msg.lastIndexOf(":"));
                        for (let i=0;i<users.length;i++) {
                            if(users[i].username === tousername){
                                fromname = data.from.substring(data.from.lastIndexOf("@")+1,data.from.lastIndexOf("#"));
                                msg = msg.substring(msg.indexOf(":")+1);
                                io.sockets.connected[users[i].id].emit('private',{type:"private_message", hasEmbed:false, from:{name:fromname, username:data.from, imageurl:data.imageurl}, time:data.time, message:msg});
                                writeDailyLog(day,"{type:'private_message',hasEmbed:false,from:{username:'"+data.from+"',imageurl:'"+data.imageurl+"'}, to:{username:'"+users[i].username+"',imageurl:'"+users[i].imageurl+"'},time:'"+data.time+"',message:'"+msg+"'}\n");
                            }
                        }
                    }else{//Mensagem Publica
                        io.emit('broadcast_message',{hasEmbed:false, message:data.message, username:socket.username, imageurl:data.imageurl, time:data.time});
                        writeDailyLog(day,"{type:'public_message',hasEmbed:false,from:{username:'"+data.from+"',imageurl:'"+data.imageurl+"'},time:'"+data.time+"',message:'"+msg+"'}\n");
                    }
                }
            });
    });

    socket.on('new_user', (data, callback) => {
        callback(true);
        var rData = '';
        var uid = uuid();
        nUsers++;
        socket.username = data.username;
        users.push({id: socket.id, name:socket.username, username:socket.username+"#"+uid, imageurl: data.imageurl});
        io.emit('users',{usersOnline:{nUsers:nUsers,users:users}, user:{id:socket.id, name:socket.username, username:socket.username+"#"+uid, imageurl:data.imageurl,inChannel:true, changeSettings:false}});
        io.sockets.connected[socket.id].emit('private', {type:'settings',user:{id:socket.id, name:socket.username, uuid:uid, username:socket.username+"#"+uid, imageurl: data.imageurl}});
        rData = readFile(joinLeftLog);
        rData+=('Username: '+socket.username+"#"+uid+' entrou do chat. Data: '+getData(0)+' Hora: '+getData(1)+'\n');
        writeFile(joinLeftLog,rData);
    });

    socket.on('user_update', (data) => {
        var oldName = '';
        for (let i=0;i<users.length;i++) {
            if (users[i].username == socket.username+'#'+data.uuid) {
                oldName = users[i].name;
                socket.username = data.name;
                users[i].name = data.name;
                users[i].username = data.name+'#'+data.uuid;
                io.emit('users',{usersOnline:{nUsers:nUsers,users:users},user:{id:socket.id, name:users[i].name, username:users[i].username, imageurl:users[i].imageurl, inChannel:true, changeSettings:true, oldName:oldName}});
                io.sockets.connected[socket.id].emit('private',{type:'settings',user:{id:socket.id, name:users[i].name, uuid:data.uuid, username:users[i].username, imageurl:users[i].imageurl}});
            }
        }
    });

    socket.on('disconnect', (data) => {
        console.log("Socket disconnected:",data,"\n",socket.id);
        for (let i=0;i<users.length;i++) {
            if(users[i].id == socket.id){
                var rData = '';
                var oldUser = {id:socket.id, name:users[i].name, username:users[i].username,inChannel:false};
                nUsers--;
                users.splice(i,i+1);
                socket.broadcast.emit('users', {usersOnline:{nUsers:nUsers,users:users}, user:oldUser});
                rData = readFile(joinLeftLog);
                rData+=('Username: '+oldUser.username+' saiu do chat. Data: '+getData(0)+' Hora: '+getData(1)+'\n');
                writeFile(joinLeftLog,rData);
            }
        }
    });

});
