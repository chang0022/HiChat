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

        that.socket.on('newMsg', function(user, msg, color) {
            that._displayNewMsg(user, msg, color);
        });

        that.socket.on('newImg', function(user, img, color) {
            that._displayImage(user, img, color);
        });

        $id('#loginBtn').addEventListener('click', function() {
            var nickName = nickNameInput.value;
            if (nickName.trim().length != 0) {
                that.socket.emit('login', nickName);
            } else {
                nickNameInput.focus();
            }
        });

        $id('#sendBtn').addEventListener('click', function() {
            var msg = messageInput.value,
                color = $id('#colorStyle').value;
            messageInput.value = '';
            messageInput.focus();
            if (msg.trim().length != 0) {
                that.socket.emit('postMsg', msg, color);
                that._displayNewMsg('me', msg, color);
                return true;
            }
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

        $id('#emojiWrapper').addEventListener('click', function(e) {
            var target = e.target;
            if (target.nodeName.toLowerCase() == 'img') {
                messageInput.focus();
                messageInput.value = messageInput.value + '[emoji:' + target.title+ ']';
            }
        });

        nickNameInput.addEventListener('keyup', function(e) {
            if (e.keyCode == 13) {
                var nickName = nickNameInput.value;
                if (nickName.trim().length != 0) {
                    that.socket.emit('login', nickName);
                }
            }
        });

        messageInput.addEventListener('keyup', function(e) {
            var msg = messageInput.value,
                color = $id('#colorStyle').value;
            if (e.keyCode == 13 && msg.trim().length != 0) {
                messageInput.value = '';
                that.socket.emit('postMsg', msg, color);
                that._displayNewMsg('me', msg, color);
                return true;
            }
        });

        $id('#clearBtn').addEventListener('click', function() {
            historyMsg.innerHTML = '';
        });
    },
    _displayNewMsg: function(user, msg, color) {
        var container = $id('#historyMsg'),
            msgToDisplay = document.createElement('p'),
            date = new Date().toTimeString().substr(0 ,8),
            msg = this._showEmoji(msg);
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
        msgToDisplay.innerHTML = user + ' <span class="timespan">('+ date +')</span>：' + '<a href="' + imgData + '" target="_blank"><img src="' + imgData + '"/></a>';
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
    },
    _showEmoji: function(msg) {
        var match, result = msg,
            reg = /\[emoji:\d+\]/g,
            emojiIndex,
            totalEmojiNum = $id('#emojiWrapper');
        while (match = reg.exec(msg)) {
            emojiIndex = match[0].slice(7, -1);
            if (emojiIndex > totalEmojiNum) {
                result = result.replace(match[0], '[X]');
            } else {
                result = result.replace(match[0], '<img class="emoji" src="../resource/emoji/' + emojiIndex + '.gif" />');
            }
        }
        return result;
    }
}

function $id(id) {
    return document.querySelector(id);
}