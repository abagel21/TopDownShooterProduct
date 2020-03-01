let sock = io();
//sign in
const a = '';
let signDiv = document.getElementById('signwrap');
let signDivUsername = document.getElementById('username');
let signDivSignIn = document.getElementById('signin');
let signDivSignUp = document.getElementById('signup');
let signDivPassword = document.getElementById('password');
let gamewrap = document.getElementById('gamewrap')
const WIDTH = 1800;
const HEIGHT = 800;

signDivSignIn.onclick = (event) => {
    event.preventDefault();
    console.log('actually sent')
    sock.emit('signIn', { username: signDivUsername.value, password: signDivPassword.value })
}

sock.on('signInResponse', (data) => {
    if (data.success) {
        signDiv.style.display = 'none';
        gamewrap.style.display = 'inline-block';
    } else {
        alert('Credentials Incorrect')
    }
})

signDivSignUp.onclick = (event) => {
    event.preventDefault();
    console.log('actually sent')
    sock.emit('signUp', { username: signDivUsername.value, password: signDivPassword.value })
}

sock.on('signUpResponse', (data) => {
    if (data.success) {
        alert('Successfully registered')
    } else {
        alert('Username Taken')
    }
})


//game
const ctx = document.getElementById('ctx').getContext('2d');
ctx.font = '30px Arial';

const writeMessage = (text) => {
    console.log(text)
    const c = document.getElementById('chatList');
    const a = document.createElement('li');
    a.innerHTML = text;
    c.appendChild(a);

}

const chatForm = document.querySelector('#chatForm')

chatForm.addEventListener('submit', (event) => {
    event.preventDefault();
    console.log('submit invoked');

    const input = document.querySelector('#chatInput');
    const text = input.value;
    input.value = '';
    sock.emit('message', text);
})

let map = new Image();
map.src = 'src/mapfinal.png';

sock.on('newPositions', (data) => {
    if (!selfId)
        return;
    else {
        ctx.clearRect(0, 0, 1800, 800);
        drawMap();
        for (let i = 0; i < data.player.length; i++) {
            ctx.fillText('p', data.player[i].x, data.player[i].y)
        }
        for (let i = 0; i < data.bullet.length; i++) {
            ctx.fillRect(data.bullet[i].x - 5, data.bullet[i].y - 5, 10, 10)
        }
    }
})

let drawMap = () => {
    let x = WIDTH / 2 - playerList[selfId].x;
    let y = HEIGHT / 2 - playerList[selfId].y
    ctx.drawImage(map, x, y);
}

sock.on('message', (text) => {
    writeMessage(`[${sock.id}]${text}`)
})

sock.on('serverMessage', (text) => {
    console.log(`[Server]${text}`)
    writeMessage(text);
})

document.onkeydown = function(event) {
    if (event.keyCode === 68) {
        sock.emit('keyPress', { inputID: 'right', state: true });
        console.log('right')
    } else if (event.keyCode === 83) {
        sock.emit('keyPress', { inputID: 'down', state: true });
        console.log('down')
    } else if (event.keyCode === 65) {
        sock.emit('keyPress', { inputID: 'left', state: true });
        console.log('left')
    } else if (event.keyCode === 87) {
        sock.emit('keyPress', { inputID: 'up', state: true });
        console.log('up')
    }
}

document.onkeyup = function(event) {
    if (event.keyCode === 68)
        sock.emit('keyPress', { inputID: 'right', state: false });
    else if (event.keyCode === 83)
        sock.emit('keyPress', { inputID: 'down', state: false });
    else if (event.keyCode === 65)
        sock.emit('keyPress', { inputID: 'left', state: false });
    else if (event.keyCode === 87)
        sock.emit('keyPress', { inputID: 'up', state: false });
}

document.onmousedown = (event) => {
    sock.emit('keyPress', { inputID: 'attack', state: true })
    console.log('mouse down registered')
}

document.onmouseup = (event) => {
    sock.emit('keyPress', { inputID: 'attack', state: false })
}

document.onmousemove = () => {
    let x = event.clientX;
    let y = event.clientY;
    sock.emit('keyPress', { inputID: 'mouseAngle', state: { x, y } })
}