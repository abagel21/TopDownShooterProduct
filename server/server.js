const express = require('express')
const app = express()
const http = require('http')
const socketio = require('socket.io')
const mongojs = require('mongojs')


// const URI = "mongodb+srv://abagel21:Alexbaby6414159@cluster0-wykae.mongodb.net/test?retryWrites=true&w=majority";
// const db = mongojs(process.env.MONGODB_URI, ['account ', 'progress '])
// db.account.insert({ username: "alex", password: "nagel" })
// db.account.find({ username: "alex" })



// app.get('/', (req, res) => {
//     res.sendFile(`${clientPath}/index.html`)
// })


const clientPath = `${__dirname}/../client`;
console.log(`serving static from ${clientPath}`);
app.use(express.static(clientPath));


const server = http.createServer(app);

const io = socketio(server);

let socket_list = {};
let spawnInt = Math.floor(Math.random() * 8) + 1

let Entity = () => {
    let self = {
        x: 250,
        y: 250,
        id: '',
        spdX: 0,
        spxY: 0,
    }
    self.update = () => {
        self.updatePosition()
    }
    self.updatePosition = () => {
        self.x += self.spdX;
        self.y += self.spdY;
    }
    self.getDistance = function(pt) {
        return Math.sqrt(Math.pow(self.x - pt.x, 2) + Math.pow(self.y - pt.y, 2));
    }
    return self;
}

var Player = function(id) {
    var self = Entity();
    self.id = id;
    self.number = "" + Math.floor(10 * Math.random());
    self.pressingRight = false;
    self.pressingLeft = false;
    self.pressingUp = false;
    self.pressingDown = false;
    self.pressingAttack = false;
    self.mouseAngle = 0;
    self.maxSpd = 10;

    var super_update = self.update;
    self.update = function() {
        self.updateSpd();
        super_update();

        if (self.pressingAttack) {
            self.shootBullet(self.mouseAngle);

            // for(let i = -1; i <1; i++) {
            //     self.shootBullet(i*10 + self.mouseAngle)
            // }
        }
    }
    self.shootBullet = function(angle) {
        var b = Bullet(self.id, angle);
        b.x = self.x;
        b.y = self.y;
    }


    self.updateSpd = function() {
        if (self.pressingRight)
            self.spdX = self.maxSpd;
        else if (self.pressingLeft)
            self.spdX = -self.maxSpd;
        else
            self.spdX = 0;

        if (self.pressingUp)
            self.spdY = -self.maxSpd;
        else if (self.pressingDown)
            self.spdY = self.maxSpd;
        else
            self.spdY = 0;
    }

    Player.list[id] = self;
    return self;
}
Player.list = {};
Player.onConnect = (sock) => {
    let player = Player(sock.id)
    sock.on('keyPress', function(data) {
        if (data.inputID === 'left') {
            player.pressingLeft = data.state;
        } else if (data.inputID === 'right') {
            player.pressingRight = data.state;
        } else if (data.inputID === 'up') {
            player.pressingUp = data.state;
        } else if (data.inputID === 'down') {
            player.pressingDown = data.state;
        } else if (data.inputID === 'mouseAngle' && (data.state.x - player.x) > 0) {
            player.mouseAngle = Math.atan((data.state.y - player.y) / (data.state.x - player.x))
        } else if (data.inputID === 'mouseAngle' && (data.state.x - player.x) < 0) {
            player.mouseAngle = -1 * (Math.PI / 2 + (Math.PI / 2 - Math.atan((data.state.y - player.y) / (data.state.x - player.x))))
        } else if (data.inputID === 'attack') {
            player.pressingAttack = data.state;
        }
    })
}

Player.onDisconnect = (sock) => {
    delete Player.list[sock.id];
}

Player.update = () => {
    let pack = [];
    for (let i in Player.list) {
        let player = Player.list[i];
        player.update();
        pack.push({
            x: player.x,
            y: player.y
        })
    }
    return pack;
}

let Bullet = (parent, angle) => {
    var self = Entity();
    self.id = Math.random();
    self.spdX = Math.cos(angle) * 10;
    self.spdY = Math.sin(angle) * 10;
    self.parent = parent;
    self.timer = 0;
    self.toRemove = false;
    var super_update = self.update;
    self.update = function() {
        if (self.timer++ > 100)
            self.toRemove = true;
        super_update();

        for (let i in Player.list) {
            let p = Player.list[i];
            if (self.getDistance(p) < 32 && self.parent !== p.id) {
                //handle collision. ex: hp--;
                self.toRemove = true;
            }
        }
    }
    Bullet.list[self.id] = self;
    return self;
}
Bullet.list = {};

Bullet.update = () => {
    let pack = [];
    for (let i in Bullet.list) {
        let bullet = Bullet.list[i];
        bullet.update();
        if (bullet.toRemove)
            delete Bullet.list[i]
        pack.push({
            x: bullet.x,
            y: bullet.y,
        })
    }
    return pack;
}

var USERS = {
    "alex": "nagel",
    "hello": "sir"
}

var isValidPassword = function(data, cb) {
    return cb(true)
    db.account.find({ account: data.username, password: data.password }, function(err, res) {
        console.log('isvalid reached')
        if (res.length > 0) {
            cb(true)
        } else {
            cb(false)
        }
    });
}
var isUsernameTaken = function(data, cb) {
    return cb(false)
    db.account.find({ account: data.username }, function(err, res) {
        console.log('isusername reached')
        if (res.length > 0) {
            cb(true)
        } else {
            cb(false)
        }
    });
}
var addUser = function(data, cb) {
    return cb()
    db.account.insert({ account: data.username, password: data.password }, function(err, res) {
        cb();
    });
}

io.on('connection', (sock) => {
    socket_list[sock.id] = sock;
    sock.on('signIn', function(data) {
        isValidPassword(data, function(res) {
            if (res) {
                Player.onConnect(sock);
                sock.emit('signInResponse', { success: true });
            } else {
                sock.emit('signInResponse', { success: false });
            }
        });
    });
    sock.on('signUp', function(data) {
        isUsernameTaken(data, function(res) {
            if (res) {
                sock.emit('signUpResponse', { success: false });
            } else {
                addUser(data, function() {
                    sock.emit('signUpResponse', { success: true });
                });
            }
        });
    });
    switch (spawnInt) {
        case 1:
            sock.x = 0;
            sock.y = 0;
            break;
        case 2:
            sock.x = 0;
            sock.y = 0;
            break;
        case 3:
            sock.x = 0;
            sock.y = 0;
            break;
        case 4:
            sock.x = 0;
            sock.y = 0;
            break;
        case 5:
            sock.x = 0;
            sock.y = 0;
            break;
        case 6:
            sock.x = 0;
            sock.y = 0;
            break;
        case 7:
            sock.x = 0;
            sock.y = 0;
            break;
        case 8:
            sock.x = 0;
            sock.y = 0;
            break;
    }
    sock.emit('serverMessage', 'New player connected')

    console.log('Someone connected')

    sock.on('message', (text) => {
        io.emit('message', text);
    })

    sock.on('disconnect', () => {
        delete socket_list[sock.id];
        Player.onDisconnect(sock);
    })

})

setInterval(() => {
    let pack = {
        player: Player.update(),
        bullet: Bullet.update(),
    }
    for (let i in socket_list) {
        let sock = socket_list[i];
        sock.emit('newPositions', pack);
    }
}, 250 / 25)

server.on('error', (err) => {
    console.error('Server error: ' + err)
})

server.listen(process.env.PORT || 8080, () => {
    console.log('Server initialized')
})