let sock = io();
//sign in
let signDiv = document.getElementById('signwrap');
let signDivUsername = document.getElementById('username');
let signDivSignIn = document.getElementById('signin');
let signDivSignUp = document.getElementById('signup');
let signDivPassword = document.getElementById('password');
let gamewrap = document.getElementById('gamewrap')

signDivSignIn.onclick = (event) => {
    event.preventDefault();
    console.log('actually sent')
    sock.emit('signIn', { username: signDivUsername.value, password: signDivPassword.value })
}

sock.on('signInResponse', (data) => {
    if (data.success) {
        console.log('fired');
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
let c = document.getElementById('ctx')
let ctx = c.getContext('2d');
ctx.font = '30px Arial';
ctx.fillStyle = 'white';

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

let Animation = function(frame_set, delay){
    this.count = 0;
    this.delay = delay;
    this.frame = 0;
    this.frame_index = 0;
    this.frame_set = frame_set;
};

let username = '';
sock.on('usernameData', function(data){
    console.log(data.id);
    username = data.id;
});
let image = document.createElement('img');
image.src = "img/cubeSpritesheetpurple.png";


sock.on('newPositions', (data) => {
    ctx.clearRect(0, 0, 1800, 800);
    for (let i = 0; i < data.player.length; i++) {
        if(data.player[i].direction === -1){
            //image.classList.add("img-hor");
        }
        if(data.player[i].direction === 1){
            //image.classList.remove("img-hor");
        }
        if(data.player[i].team === "green"){
            image.src = "img/cubeSpritesheetpurple.png";
        } else {
            image.src = "img/cubeSpritesheetred.png";
        }
        ctx.drawImage(image, data.player[i].imgX, data.player[i].imgY, 24, 24, data.player[i].x-25, data.player[i].y-25, 50, 50);
        ctx.font = '15px Arial';
        ctx.fillText(data.player[i].hp, data.player[i].x -10, data.player[i].y+40);
        ctx.font = '30px Arial';
        if(data.player[i].id === username){
            document.getElementById('hp').innerHTML = 'HP: ' + data.player[i].hp;
        }
    }
    for (let i = 0; i < data.bullet.length; i++) {
        ctx.fillRect(data.bullet[i].x - 5, data.bullet[i].y - 5, 10, 10)
    }

})
// sock.on('damaged', function(data){
//     ctx.fillStyle = "#b94646";
//     setTimeout(function(){
//         ctx.fillStyle = "#ffffff";
//     }, 5);
// });
let socketId = "";
sock.on('death', (data) =>{
    console.log(ctx);
    console.log(ctx.parentElement);
    socketId = data;
    $('canvas').hide();
    $('#hp').hide();
    document.getElementById('death-screen').style.display = 'inline-block';
    document.getElementById('death').classList.add('death-animation');
    document.getElementById('respawn-button').classList.add('death-animation');

});
document.getElementById('respawn-button').addEventListener('click', e =>{
    $('canvas').show();
    $('#hp').show();
    document.getElementById('death-screen').style.display = 'none';
    console.log(signDivUsername.value, signDivPassword.value);
    sock.emit('signIn', { username: signDivUsername.value, password: signDivPassword.value });
    sock.emit('re-connect', {id: socketId});
});
sock.on('test-message', function(data){
    console.log(data);
});
sock.on('message', (text) => {
    writeMessage(`[${sock.id}]${text}`)
})

sock.on('serverMessage', (text) => {
    // console.log(`[Server]${text}`)
    writeMessage(text);
})

document.onkeydown = function(event) {
    if (event.keyCode === 68) {
        sock.emit('keyPress', { inputID: 'right', state: true });
        // console.log('right')
    } else if (event.keyCode === 83) {
        sock.emit('keyPress', { inputID: 'down', state: true });
        // console.log('down')
    } else if (event.keyCode === 65) {
        sock.emit('keyPress', { inputID: 'left', state: true });
        // console.log('left')
    } else if (event.keyCode === 87) {
        sock.emit('keyPress', { inputID: 'up', state: true });
        // console.log('up')
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
    sock.emit('keyPress', { inputID: 'mouseAngle', state: { x, y } });
}

