window.onload = function() {
    var chat = new Chat();
    chat.init();
}

var Chat = function() {
    this.socket = null;
}

Chat.prototype = {
    init: function() {
        var that = this,
            info =  $id('#info'),
            nickWrapper =  $id('#nickWrapper'),
            loginWrapper = $id('#loginWrapper'),
            nickNameInput = $id('#nickNameInput'),
            messageInput = $id('#messageInput'),
            historyMsg = $id('#historyMsg'),
            status = $id('#status');

        that.socket = io.connect();
        that.socket.on('connect', function() {
            info.textContent = '你的昵称 :';
            nickWrapper.style.display = 'block';
            nickNameInput.focus();
        });

        $id('#loginBtn').addEventListener('click', function() {
            var nickName = nickNameInput.value;
            if (nickName.trim().length != 0) {
                that.socket.emit('login', nickName);
            } else {
                nickNameInput.focus();
            }
        });

        that.socket.on('nickExisted', function() {
            info.textContent = '用户名已被占用'
        });

        that.socket.on('loginSuccess', function() {
            document.title = 'HiChat | ' + nickNameInput.value;
            loginWrapper.style.display = 'none';
            messageInput.focus();
        });

        that.socket.on('system', function(nickName, userCount, type) {
            var msg = nickName + (type == 'login' ? ' 进入' : ' 离开');
            that._displayNewMsg('系统', msg, 'red');
            status.textContent = userCount + ' 人在线';
        });

        $id('#sendBtn').addEventListener('click', function() {
            var msg = messageInput.value;
            messageInput.value = '';
            messageInput.focus();
            if (msg.trim().length != 0) {
                that.socket.emit('postMsg', msg);
                that._displayNewMsg('me', msg);
            }
        });

        that.socket.on('newMsg', function(user, msg) {
            that._displayNewMsg(user, msg);
        });

        $id('#sendImage').addEventListener('change', function() {
            if (this.files.length != 0) {
                var file = this.files[0],
                    reader = new FileReader();
                if (!reader) {
                    that._displayNewMsg('系统', '你的浏览器不支持原生文件上传', 'red');
                    this.value = '';
                    return false;
                }
                reader.onload = function(e) {
                    this.value = '';
                    that.socket.emit('img', e.target.result);
                    that._displayImage('me', e.target.result);
                };
                reader.readAsDataURL(file);
            }
        });

        that.socket.on('newImg', function(user, img) {
            that._displayImage(user, img);
        });

        that._initiaEmoji();
        $id('#emoji').addEventListener('click', function(e) {
            var emojiWrapper = $id('#emojiWrapper');
            emojiWrapper.style.display = 'block';
            e.stopPropagation();
        });
        document.body.addEventListener('click', function(e) {
            var emojiWrapper = $id('#emojiWrapper');
            if (e.target != emojiWrapper) {
                emojiWrapper.style.display = 'none';
            }
        });
    },
    _displayNewMsg: function(user, msg, color) {
        var container = $id('#historyMsg'),
            msgToDisplay = document.createElement('p'),
            date = new Date().toTimeString().substr(0 ,8);
        msgToDisplay.style.color = color || '#000';
        msgToDisplay.innerHTML = user + ' <span class="timespan">('+ date +')</span>：' + msg;
        container.appendChild(msgToDisplay);
        container.scrollTop = container.scrollHeight;
    },
    _displayImage: function(user, imgData, color) {
        var container = $id('#historyMsg'),
            msgToDisplay = document.createElement('p'),
            date = new Date().toTimeString().substr(0 ,8);
         msgToDisplay.style.color = color || '#000';
        msgToDisplay.innerHTML = user + ' <span class="timespan">('+ date +')</span>：<br/>' + '<a href="' + imgData + '" target="_blank"><img src="' + imgData + '"/></a>';
        container.appendChild(msgToDisplay);
        container.scrollTop = container.scrollHeight;
    },
    _initiaEmoji: function() {
        var emojiContainer = $id('#emojiWrapper'),
            docFragment = document.createDocumentFragment();
        for (var i = 16; i > 0; i--) {
            var emojiItem = document.createElement('img');
            emojiItem.src = '../resource/emoji/' + i + '.gif';
            emojiItem.title = i;
            docFragment.appendChild(emojiItem);
        }
        emojiContainer.appendChild(docFragment);
    }
}

function $id(id) {
    return document.querySelector(id);
}