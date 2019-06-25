function privateMessage(id){
    console.log("PrivateMessage Clicked");
    $("#message").val('@'+id+': ');
}
function playnotif() {
    var notifsound = document.getElementById("notifsound");
    notifsound.play();
} 
$(function () {

    var socket = io.connect();
    socket.on('connect', function(){
        console.log('Connected');
        $(".alert").remove();
    });
    socket.on('disconnect', function () {
        console.log('Disconnected');
        username.val('Disconnected');
        $("#alert").html('<div class="alert alert-danger" role="alert">Connection Lost</div>');
    });

    //Self
    var nNotif = 0;
    var notifmsgs = [];
    var uuid = '';
    var usernameUUID = '';
    var name = '';
    var imageUrl = '';

    //Btns and Inputs
    var pagina = window;

    var privatemsgsbtn = $("#private_btn");
    var nPrivateNotif = $("#privatemsg");
    var notiflist = $("#notifList");

    var imageformbtn = $("#goimageform");

    var settingsbtn = $("#settings_btn");

    var userForm = $("#userForm");
    var username = $("#username");
    var imageurl = $("#imageurl");
    var senduser = $("#senduser");

    var updatename = $("#updatename");
    var updatebtn = $("#updateuser");

    var membersbtn = $("#members_btn");
    var userslist = $("#usersList");
    var nUsersOnline = $("#nUsersOnline");

    var messageform = $("#f_message");
    var messageText = $("#message");
    var sendMessage = $("#send_message");
    var chat = $("#chat");

    //functions
    function getTime() {
        var date = new Date();
        var time_h = date.getHours();
        var time_m = date.getMinutes();
        var time_s = date.getSeconds();
        return ("0" + time_h).slice(-2) + ":" + ("0" + time_m).slice(-2) + ":" + ("0" + time_s).slice(-2);
    }

    senduser.click((e) => {
        e.preventDefault();
        console.log("click");
        if (username.val().length != 0 && imageurl.val().length != 0) {
            socket.emit('new_user',
                {
                    username: username.val(),
                    imageurl: imageurl.val()
                }
                ,
                (data) => {
                    if (data) {
                        userForm.hide();
                        membersbtn.show();
                        privatemsgsbtn.show();
                        settingsbtn.show();
                        chat.show();
                        messageform.show();
                        imageformbtn.show();
                    }
                }
            );
        } else {
            username.val('Anonymous');
            imageurl.val('https://www.timeshighereducation.com/sites/default/files/byline_photos/anonymous-user-gravatar_0.png');
            socket.emit('new_user',
                {
                    username: username.val(),
                    imageurl: imageurl.val()
                }
                ,
                (data) => {
                    if (data) {
                        userForm.hide();
                        membersbtn.show();
                        privatemsgsbtn.show();
                        settingsbtn.show();
                        chat.show();
                        messageform.show();
                        imageformbtn.show();
                    }
                }
            );
        }
    });

    messageform.submit((e) => {
        e.preventDefault();
        console.log("enter");
        if (messageText.val().length != 0) {
            time = getTime();
            if(messageText.val().substr(0,1) === '@'){
                var uname = messageText.val().substring(messageText.val().lastIndexOf("@")+1,messageText.val().lastIndexOf(":"));
                var msg = messageText.val().substring(messageText.val().indexOf(":")+1);
                chat.append($('<li class="list-group-item text-light bg-dark"><div class="media" style="float: left"><img src="'+imageUrl+'" style="height: 75px; padding: 10px; border-radius: 50px"></div><div style="width: 100%"><div class="card-body"><h5 class="card-title">'+name+'</h5><h6 class="card-subtitle mb-2 text-muted">Sent at '+time+'</h6><p class="card-text"><div class="umention">'+uname+'</div>'+msg+'</p></div></div></li>'));
                pagina.scrollTo(0, $(document).height());
                socket.emit('chat_message',
                    {
                        message: messageText.val(),
                        from: usernameUUID,
                        imageurl: imageUrl,
                        time: time
                    }
                );
                messageText.val('');
            }else{
                //chat.append($('<li class="list-group-item text-light bg-dark"><div class="media" style="float: left"><img src="'+imageUrl+'" style="height: 75px; padding: 10px; border-radius: 50px"></div><div style="width: 100%"><div class="card-body"><h5 class="card-title">'+name+'</h5><h6 class="card-subtitle mb-2 text-muted">Sent at '+time+'</h6><p class="card-text">'+messageText.val()+'</p></div></div></li>'));
                pagina.scrollTo(0, $(document).height());
                socket.emit('chat_message',
                    {
                        message: messageText.val(),
                        from: usernameUUID,
                        imageurl: imageUrl,
                        time: time
                    }
                );
                messageText.val('');
            }
        }
    });

    sendMessage.click((e) => {
        e.preventDefault();
        console.log("clicked");
        if (messageText.val().length != 0) {
            time = getTime();
            if(messageText.val().substr(0,1) === '@'){
                var uname = messageText.val().substring(messageText.val().lastIndexOf("@")+1,messageText.val().lastIndexOf(":"));
                var msg = messageText.val().substring(messageText.val().indexOf(":")+1);
                chat.append($('<li class="list-group-item text-light bg-dark"><div class="media" style="float: left"><img src="'+imageUrl+'" style="height: 75px; width:75px; padding: 10px; border-radius: 50px"></div><div style="width: 100%"><div class="card-body"><h5 class="card-title">'+name+'</h5><h6 class="card-subtitle mb-2 text-muted">Sent at '+time+'</h6><p class="card-text"><div class="umention">'+uname+'</div>'+msg+'</p></div></div></li>'));
                pagina.scrollTo(0, $(document).height());
                socket.emit('chat_message',
                    {
                        message: messageText.val(),
                        from: usernameUUID,
                        imageurl: imageUrl,
                        time: time
                    }
                );
                messageText.val('');
            }else{
                //chat.append($('<li class="list-group-item text-light bg-dark"><div class="media" style="float: left"><img src="'+imageUrl+'" style="height: 75px; width:75px; padding: 10px; border-radius: 50px"></div><div style="width: 100%"><div class="card-body"><h5 class="card-title">'+name+'</h5><h6 class="card-subtitle mb-2 text-muted">Sent at '+time+'</h6><p class="card-text">'+messageText.val()+'</p></div></div></li>'));
                pagina.scrollTo(0, $(document).height());
                socket.emit('chat_message',
                    {
                        message: messageText.val(),
                        from: usernameUUID,
                        imageurl: imageUrl,
                        time: time
                    }
                );
                messageText.val('');
            }
        }
    });

    socket.on('broadcast_message', (data) => {
        console.log("data:");
        console.log(data);

        if(data.hasEmbed){
            for (let i=0;i<data.embed.embeds.length;i++) {
                if (data.embed.embeds[i].hasOwnProperty('type')) {
                    if(data.embed.embeds[i].type == 'video'){//Video Embed
                        chat.append($('<li class="list-group-item text-light bg-dark"><div class="media" style="float: left"><img src="'+data.imageurl+'"style="height: 75px; padding: 10px; border-radius: 50px"></div><div style="width: 100%"><div class="card-body"><h5 class="card-title">'+data.username+'</h5><h6 class="card-subtitle mb-2 text-muted">Sent at '+data.time+'</h6><div><p class="card-text">'+data.embed.msgTexto+'</p></div><br><div class="mention" style="border-left: 5px solid '+data.embed.embeds[i].color+'; background-color:#35363B; display:flex; width: 450px;"><div><h6 class="card-subtitle mb-2 text-muted" style="margin-top: 5px"><a style="color: rgb(45, 171, 255)" href="'+data.embed.embeds[i].url+'" target="_blank">'+data.embed.embeds[i].title+'</a></h6><iframe width="427" height="240" src="'+data.embed.embeds[i].video+'" style="border:0; border-radius:3px;"></iframe></div></div></div></div></li>'));
                    }else if(data.embed.embeds[i].type == 'image'){
                        chat.append($('<li class="list-group-item text-light bg-dark"><div class="media" style="float: left"><img src="'+data.imageurl+'" style="height: 75px; width:75px; padding: 10px; border-radius: 50px"></div><div style="width: 100%"><div class="card-body"><h5 class="card-title">'+data.username+'</h5><h6 class="card-subtitle mb-2 text-muted">Sent at '+data.time+'</h6><p class="card-text">'+data.embed.msgTexto+'</p>'+data.embed.embeds[i].imageHtml+'</div></div></li>'));
                    }else if(data.embed.embeds[i].type == 'upimage'){
                        chat.append($('<li class="list-group-item text-light bg-dark"><div class="media" style="float: left"><img src="'+data.imageurl+'" style="height: 75px; width:75px; padding: 10px; border-radius: 50px"></div><div style="width: 100%"><div class="card-body"><h5 class="card-title">'+data.username+'</h5><h6 class="card-subtitle mb-2 text-muted">Sent at '+data.time+'</h6><p class="card-text">'+data.embed.msgTexto+'</p>'+data.embed.embeds[0].imageHtml+'</div></div></li>'));
                    }
                }else{
                    //Normal Embed
                    if(data.embed.embeds[i].hasOwnProperty('description') && data.embed.embeds[i].hasOwnProperty('image') && data.embed.embeds[i].hasOwnProperty('title') && data.embed.embeds[i].hasOwnProperty('url')){
                        chat.append($('<li class="list-group-item text-light bg-dark"><div class="media" style="float: left"><img src="'+data.imageurl+'"style="height: 75px; padding: 10px; border-radius: 50px"></div><div style="width: 100%"><div class="card-body"><h5 class="card-title">'+data.username+'</h5><h6 class="card-subtitle mb-2 text-muted">Sent at '+data.time+'</h6><div><p class="card-text">'+data.embed.msgTexto+'</p></div><br><div class="mention" style="border-left: 5px solid '+data.embed.embeds[i].color+'; background-color:#35363B; display:flex; width: 700px;"><div><h6 class="card-subtitle mb-2 text-muted" style="margin-top: 5px"><a style="color: rgb(45, 171, 255)" href="'+data.embed.embeds[i].url+'" target="_blank">'+data.embed.embeds[i].title+'</a></h6><p class="card-text" style="width: 450px">'+data.embed.embeds[i].description+'</p></div><img src="'+data.embed.embeds[i].image+'" style="width:auto; height:100px; float:right; margin-left: 100px;"></div></div></div></li>'));
                    }else{//Apenas mostra o hyperlink, pela falta de keys
                        console.log("entra min embed");
                        chat.append($('<li class="list-group-item text-light bg-dark"><div class="media" style="float: left"><img src="'+data.imageurl+'" style="height: 75px; padding: 10px; border-radius: 50px"></div><div style="width: 100%"><div class="card-body"><h5 class="card-title">'+data.username+'</h5><h6 class="card-subtitle mb-2 text-muted">Sent at '+data.time+'</h6><p class="card-text">'+data.embed.msgTexto+'</p></div></div></li>'));
                    }
                }
            }
        }else{//Normal Text Message
            chat.append($('<li class="list-group-item text-light bg-dark"><div class="media" style="float: left"><img src="'+data.imageurl+'" style="height: 75px; width:75px; padding: 10px; border-radius: 50px"></div><div style="width: 100%"><div class="card-body"><h5 class="card-title">'+data.username+'</h5><h6 class="card-subtitle mb-2 text-muted">Sent at '+data.time+'</h6><p class="card-text">'+data.message+'</p></div></div></li>'));
        }

        pagina.scrollTo(0, $(document).height());
    });

    socket.on('users', (data) => {
        var html='';

        for (let i=0;i<data.usersOnline.users.length;i++) {
            html+='<li class="list-group-item text-light bg-dark"><div class="media" style="float: left"><img src="'+data.usersOnline.users[i].imageurl+'"style="height: 75px; width:75px; padding: 10px; border-radius: 50px"></div><div style="width: 100%"><div class="card-body"><button id="'+data.usersOnline.users[i].username+'" type="button" class="btn btn-secondary" onclick="privateMessage(this.id)" style="float: right">@Private</button><h5 class="card-title" style="padding-top: 5px">'+data.usersOnline.users[i].name+'</h5></div></div></li>';
        }

        if(data.user.inChannel){
            if(data.user.changeSettings){
                chat.append($('<li class="list-group-item text-light bg-dark"><p class="card-text text-center text-muted">User '+data.user.oldName+' changed name to '+data.user.name+'</p></li>'));
                pagina.scrollTo(0, $(document).height());
                nUsersOnline.html(data.usersOnline.nUsers);
                userslist.html(html);
            }else{
                chat.append($('<li class="list-group-item text-light bg-dark"><p class="card-text text-center text-muted">User '+data.user.name+' joined the #channel</p></li>'));
                pagina.scrollTo(0, $(document).height());
                nUsersOnline.html(data.usersOnline.nUsers);
                userslist.html(html);
            }
        }else{
            chat.append($('<li class="list-group-item text-light bg-dark"><p class="card-text text-center text-muted">User '+data.user.name+' left the #channel</p></li>'));
            pagina.scrollTo(0, $(document).height());
            nUsersOnline.html(data.usersOnline.nUsers);
            userslist.html(html);
        }

    });

    updatebtn.click((e) => {
        if (updatename.val().length != 0) {
            if(updatename.val() != name){
                socket.emit('user_update',
                    {
                        uuid: uuid,
                        name: updatename.val()
                    }
                );
            }
        } else {
            updatename.val('Anonymous');
            socket.emit('user_update',
                {
                    uuid: uuid,
                    name: username.val()
                }
            );
        }
    })

    privatemsgsbtn.click((e)=>{
        console.log("clear notif");
        nNotif=0;
        nPrivateNotif.html('');
    });

    socket.on('private', (data) => {
        if(data.type === 'settings'){
            //console.log(data);
            usernameUUID = data.user.username;
            uuid = data.user.uuid;
            name = data.user.name;
            imageUrl = data.user.imageurl;
            //console.log(usernameUUID,uuid,name,imageUrl);
        }

        if(data.type === 'private_message'){
            console.log(data);
            var html = '';
            nNotif++;

            if(data.hasEmbed){
                for (let i=0;i<data.embed.embeds.length;i++) {
                    if (data.embed.embeds[0].hasOwnProperty('type')) {
                        if(data.embed.embeds[0].type == 'video'){//Video Embed
                            chat.append($('<li class="list-group-item text-light bg-dark"><div class="media" style="float: left"><img src="'+data.from.imageurl+'" style="height:75px; width:75px; padding: 10px; border-radius: 50px"></div><div style="width: 100%"><div class="card-body"><h5 class="card-title">'+data.from.name+'</h5><h6 class="card-subtitle mb-2 text-muted">Sent at '+data.time+'</h6><div class="mention"><p class="card-text">'+data.embed.msgTexto+'</p></div><br><div class="mention" style="border-left: 5px solid '+data.embed.embeds[0].color+'; background-color:#35363B; display:flex; width: 450px;"><div><h6 class="card-subtitle mb-2 text-muted" style="margin-top: 5px"><a style="color: rgb(45, 171, 255)" href="'+data.embed.embeds[0].url+'" target="_blank">'+data.embed.embeds[0].title+'</a></h6><iframe width="427" height="240" src="'+data.embed.embeds[0].video+'" style="border:0; border-radius:3px;"></iframe></div></div></div></div></li>'));
                        }else if(data.embed.embeds[i].type == 'image'){
                            chat.append($('<li class="list-group-item text-light bg-dark"><div class="media" style="float: left"><img src="'+data.from.imageurl+'" style="height: 75px; padding: 10px; border-radius: 50px"></div><div style="width: 100%"><div class="card-body"><h5 class="card-title">'+data.from.name+'</h5><h6 class="card-subtitle mb-2 text-muted">Sent at '+data.time+'</h6><div class="mention"><p class="card-text">'+data.embed.msgTexto+'</p>'+data.embed.embeds[i].imageHtml+'</div></div></div></li>'));
                        }
                    }else{
                        //Normal Embed
                        if(data.embed.embeds[0].hasOwnProperty('color') && data.embed.embeds[0].hasOwnProperty('description') && data.embed.embeds[0].hasOwnProperty('image') && data.embed.embeds[0].hasOwnProperty('title') && data.embed.embeds[0].hasOwnProperty('url')){
                            chat.append($('<li class="list-group-item text-light bg-dark"><div class="media" style="float: left"><img src="'+data.from.imageurl+'" style="height: 75px; padding: 10px; border-radius: 50px"></div><div style="width: 100%"><div class="card-body"><h5 class="card-title">'+data.from.name+'</h5><h6 class="card-subtitle mb-2 text-muted">Sent at '+data.time+'</h6><div class="mention"><p class="card-text">'+data.embed.msgTexto+'</p></div><br><div class="mention" style="border-left: 5px solid '+data.embed.embeds[i].color+'; background-color:#35363B; display:flex; width: 700px;"><div><h6 class="card-subtitle mb-2 text-muted" style="margin-top: 5px"><a style="color: rgb(45, 171, 255)" href="'+data.embed.embeds[i].url+'" target="_blank">'+data.embed.embeds[i].title+'</a></h6><p class="card-text" style="width: 450px">'+data.embed.embeds[i].description+'</p></div><img src="'+data.embed.embeds[i].image+'" style="width:auto; height:100px; float:right; margin-left: 100px;"></div></div></div></li>'));
                        }else{//Apenas mostra o hyperlink, pela falta de keys
                            chat.append($('<li class="list-group-item text-light bg-dark"><div class="media" style="float: left"><img src="'+data.from.imageurl+'" style="height: 75px; padding: 10px; border-radius: 50px"></div><div style="width: 100%"><div class="card-body"><h5 class="card-title">'+data.from.name+'</h5><h6 class="card-subtitle mb-2 text-muted">Sent at '+data.time+'</h6><div class="mention"><p class="card-text">'+data.embed.msgTexto+'</p></div></div></div></li>'));
                        }
                    }
                }
                notifmsgs.push('<li class="list-group-item text-light bg-dark"><div class="media" style="float: left"><img src="'+data.from.imageurl+'" style="height: 75px; padding: 10px; border-radius: 50px"></div><div style="width: 100%"><div class="card-body"><h5 class="card-title">'+data.from.name+'</h5><h6 class="card-subtitle mb-2 text-muted">Sent at '+data.time+'</h6><div class="mention"><p class="card-text">'+data.embed.msgTexto+'</p></div></div></div></li>');
            }else{//Normal Text Message
                chat.append($('<li class="list-group-item text-light bg-dark"><div class="media" style="float: left"><img src="'+data.from.imageurl+'" style="height: 75px; padding: 10px; border-radius: 50px"></div><div style="width: 100%"><div class="card-body"><h5 class="card-title">'+data.from.name+'</h5><h6 class="card-subtitle mb-2 text-muted">Sent at '+data.time+'</h6><div class="mention"><p class="card-text">'+data.message+'</p></div></div></div></li>'));
                notifmsgs.push('<li class="list-group-item text-light bg-dark"><div class="media" style="float: left"><img src="'+data.from.imageurl+'" style="height: 75px; padding: 10px; border-radius: 50px"></div><div style="width: 100%"><div class="card-body"><h5 class="card-title">'+data.from.name+'</h5><h6 class="card-subtitle mb-2 text-muted">Sent at '+data.time+'</h6><div class="mention"><p class="card-text">'+data.message+'</p></div></div></div></li>');
            }

            playnotif();
            pagina.scrollTo(0, $(document).height());
            nPrivateNotif.html(''+nNotif+'');
            for (let i=notifmsgs.length-1;i>=0;i--) {
                html+=notifmsgs[i];
            }
            notiflist.html(html);
        }
    });

});
