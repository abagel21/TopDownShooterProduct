let sock = io();
//sign in
const a = '';
let signDiv = document.getElementById('signwrap');
let signDivUsername = document.getElementById('username');
let signDivSignIn = document.getElementById('signin');
let signDivSignUp = document.getElementById('signup');
let signDivPassword = document.getElementById('password');
let gamewrap = document.getElementById('gamewrap')
let map = new Image();
map.src = 'src/OMAP.png'
const WIDTH = 1800;
const HEIGHT = 800;
const TILE_SIZE = 16;

//another one

signDivSignIn.onclick = (event) => {
    event.preventDefault();
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
    const c = document.getElementById('chatList');
    const a = document.createElement('li');
    a.innerHTML = text;
    c.appendChild(a);

}

const chatForm = document.querySelector('#chatForm')

chatForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const input = document.querySelector('#chatInput');
    const text = input.value;
    input.value = '';
    sock.emit('message', text);
})

let Animation = function(frame_set, delay) {
    this.count = 0;
    this.delay = delay;
    this.frame = 0;
    this.frame_index = 0;
    this.frame_set = frame_set;
};

let username = '';
sock.on('usernameData', function(data) {
    username = data.id;
});
let image = document.createElement('img');
image.src = "img/cubeSpritesheetpurple.png";

let connection = false;

sock.on('playerConnected', (data) => {
    console.log('player success')
    connection = true;
})

sock.on('newPositions', (data) => {
    if (!connection) {
        return;
    } else {
        for (let i = 0; i < data.player.length; i++) {
            console.log('on position is ' + isPositionWall(data.player[i].x, data.player[i].y))
        }
        ctx.clearRect(0, 0, 1800, 800);
        for (let i = 0; i < data.player.length; i++) {
            drawMap(data.player[i].x - 25, data.player[i].y - 25)
        }
        for (let a = 0; a < data.player.length; a++) {
            if (isPositionWall(data.player[a].x, data.player[a].y)) {
                sock.emit('collision', 'txt');
                for (let i = 0; i < data.player.length; i++) {
                    if (data.player[i].direction === -1) {
                        //image.classList.add("img-hor");
                    }
                    if (data.player[i].direction === 1) {
                        //image.classList.remove("img-hor");
                    }
                    if (data.player[i].team === "green") {
                        image.src = "img/cubeSpritesheetpurple.png";
                    } else {
                        image.src = "img/cubeSpritesheetred.png";
                    }
                    console.log('x = ' + data.player[i].x + ' and y = ' + data.player[i].y)
                    console.log('oldx = ' + data.player[i].oldx + ' and oldy = ' + data.player[i].oldy)
                    ctx.drawImage(image, data.player[i].imgX, data.player[i].imgY, 24, 24, data.player[i].oldx, data.player[i].oldy, 50, 50);
                    ctx.font = '15px Arial';
                    ctx.fillText(data.player[i].hp, data.player[i].oldx - 10, data.player[i].oldy + 40);
                    ctx.font = '30px Arial';
                    if (data.player[i].id === username) {
                        document.getElementById('hp').innerHTML = 'HP: ' + data.player[i].hp;
                    }
                }
                for (let i = 0; i < data.bullet.length; i++) {
                    ctx.fillRect(data.bullet[i].x - 5, data.bullet[i].y - 5, 10, 10)
                }
            } else {
                for (let i = 0; i < data.player.length; i++) {
                    if (data.player[i].direction === -1) {
                        //image.classList.add("img-hor");
                    }
                    if (data.player[i].direction === 1) {
                        //image.classList.remove("img-hor");
                    }
                    if (data.player[i].team === "green") {
                        image.src = "img/cubeSpritesheetpurple.png";
                    } else {
                        image.src = "img/cubeSpritesheetred.png";
                    }
                    ctx.drawImage(image, data.player[i].imgX, data.player[i].imgY, 24, 24, data.player[i].x, data.player[i].y, 50, 50);
                    ctx.font = '15px Arial';
                    ctx.fillText(data.player[i].hp, data.player[i].x - 10, data.player[i].y + 40);
                    ctx.font = '30px Arial';
                    if (data.player[i].id === username) {
                        document.getElementById('hp').innerHTML = 'HP: ' + data.player[i].hp;
                    }
                }
                for (let i = 0; i < data.bullet.length; i++) {
                    ctx.fillRect(data.bullet[i].x - 5, data.bullet[i].y - 5, 10, 10)
                }
            }
        }
    }
})


let drawMap = (x, y) => {
        let xl = WIDTH / 2 - 4 * x;
        let yl = HEIGHT / 2 - 4 * y;
        ctx.drawImage(map, xl, yl, map.height * 2.5, map.width * 2.5);
    }
    // sock.on('damaged', function(data){
    //     ctx.fillStyle = "#b94646";
    //     setTimeout(function(){
    //         ctx.fillStyle = "#ffffff";
    //     }, 5);
    // });
let socketId = "";
sock.on('death', (data) => {
    socketId = data;
    $('canvas').hide();
    $('#hp').hide();
    document.getElementById('death-screen').style.display = 'inline-block';
    document.getElementById('death').classList.add('death-animation');
    document.getElementById('respawn-button').classList.add('death-animation');

});
document.getElementById('respawn-button').addEventListener('click', e => {
    $('canvas').show();
    $('#hp').show();
    document.getElementById('death-screen').style.display = 'none';
    sock.emit('signIn', { username: signDivUsername.value, password: signDivPassword.value });
    sock.emit('re-connect', { id: socketId });
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
    } else if (event.keyCode === 83) {
        sock.emit('keyPress', { inputID: 'down', state: true });
    } else if (event.keyCode === 65) {
        sock.emit('keyPress', { inputID: 'left', state: true });
    } else if (event.keyCode === 87) {
        sock.emit('keyPress', { inputID: 'up', state: true });
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
}

document.onmouseup = (event) => {
    sock.emit('keyPress', { inputID: 'attack', state: false })
}

document.onmousemove = () => {
    let x = event.clientX;
    let y = event.clientY;
    sock.emit('keyPress', { inputID: 'mouseAngle', state: { x, y } });
}

let isPositionWall = (x, y) => {
    let gridX = Math.floor((x - 180) / TILE_SIZE) - 1;
    let gridY = Math.floor((y - 80) / TILE_SIZE) - 1;
    console.log('x is ' + gridX + ' and y is ' + gridY)
    console.log(gridX + 40 * (gridY) - 1 + ':0')
    console.log(grid.includes(gridX + 40 * (gridY) - 1 + ':0'))
    if (gridX < 0 || gridY < 0 || grid.includes(gridX + 40 * (gridY) + ':1') || grid.includes(gridX + 40 * (gridY) + ':0')) {
        return true;
    } else {
        return false;
    }
}

let grid = [
    "1346:1",
    "0:0",
    "1347:1",
    "1:0",
    "2:0",
    "3:1",
    "4:1",
    "678:1",
    "5:1",
    "679:0",
    "6:1",
    "680:0",
    "7:0",
    "681:0",
    "8:0",
    "682:1",
    "9:0",
    "683:1",
    "10:0",
    "11:0",
    "1358:1",
    "12:0",
    "1359:1",
    "13:0",
    "1360:1",
    "14:0",
    "1361:1",
    "15:0",
    "16:0",
    "17:1",
    "18:1",
    "19:1",
    "20:1",
    "21:0",
    "22:0",
    "23:1",
    "24:1",
    "1371:1",
    "25:1",
    "1372:0",
    "26:1",
    "27:0",
    "1373:0",
    "28:0",
    "1374:0",
    "29:0",
    "1375:0",
    "702:1",
    "30:0",
    "1376:0",
    "703:1",
    "31:1",
    "1377:1",
    "704:0",
    "32:1",
    "1378:1",
    "705:0",
    "33:1",
    "1379:1",
    "706:0",
    "34:1",
    "707:0",
    "1380:1",
    "35:1",
    "708:0",
    "1381:1",
    "36:0",
    "709:1",
    "37:1",
    "710:1",
    "38:0",
    "39:0",
    "40:0",
    "41:1",
    "42:1",
    "43:1",
    "717:1",
    "718:1",
    "45:1",
    "719:0",
    "46:1",
    "720:0",
    "47:1",
    "721:0",
    "48:1",
    "722:1",
    "49:0",
    "50:0",
    "51:0",
    "1398:1",
    "52:0",
    "1399:1",
    "53:0",
    "1400:0",
    "54:0",
    "1401:1",
    "55:0",
    "56:0",
    "57:0",
    "58:0",
    "59:0",
    "60:1",
    "61:1",
    "62:1",
    "63:1",
    "1411:1",
    "1412:1",
    "66:1",
    "67:1",
    "1413:1",
    "68:1",
    "1414:1",
    "69:1",
    "1415:0",
    "70:1",
    "1416:0",
    "743:1",
    "71:1",
    "1417:0",
    "744:1",
    "1418:0",
    "745:0",
    "1419:1",
    "746:0",
    "747:0",
    "1420:1",
    "75:1",
    "748:0",
    "76:0",
    "749:1",
    "77:1",
    "750:1",
    "78:1",
    "79:0",
    "80:0",
    "81:1",
    "757:1",
    "758:0",
    "759:0",
    "760:0",
    "761:1",
    "88:1",
    "762:1",
    "89:1",
    "90:1",
    "91:0",
    "1438:1",
    "92:0",
    "1439:1",
    "93:0",
    "1440:0",
    "94:0",
    "1441:1",
    "95:0",
    "1442:1",
    "96:0",
    "97:0",
    "98:0",
    "99:0",
    "100:1",
    "1454:1",
    "1455:1",
    "1456:1",
    "1457:1",
    "784:1",
    "1458:1",
    "785:1",
    "1459:1",
    "786:1",
    "787:1",
    "115:1",
    "788:1",
    "116:1",
    "789:1",
    "117:0",
    "790:1",
    "118:1",
    "119:0",
    "120:0",
    "121:1",
    "797:1",
    "798:0",
    "799:0",
    "800:1",
    "801:1",
    "130:1",
    "1477:1",
    "131:0",
    "1478:1",
    "132:0",
    "1479:0",
    "133:0",
    "1480:0",
    "134:0",
    "1481:0",
    "135:0",
    "1482:1",
    "136:0",
    "1483:1",
    "137:0",
    "138:0",
    "812:1",
    "139:0",
    "813:1",
    "140:1",
    "814:1",
    "815:1",
    "816:1",
    "817:1",
    "818:1",
    "819:1",
    "156:1",
    "157:1",
    "1503:1",
    "158:1",
    "1504:1",
    "159:1",
    "1505:1",
    "1506:1",
    "160:0",
    "1507:1",
    "161:1",
    "1508:1",
    "836:1",
    "1509:1",
    "837:1",
    "1510:1",
    "838:1",
    "1511:1",
    "839:0",
    "1513:1",
    "840:1",
    "1514:1",
    "1515:1",
    "1516:1",
    "170:1",
    "1517:1",
    "171:1",
    "1518:0",
    "172:1",
    "1519:0",
    "173:0",
    "1520:0",
    "174:0",
    "1521:0",
    "175:0",
    "1522:0",
    "176:0",
    "1523:1",
    "177:0",
    "1524:1",
    "851:1",
    "178:0",
    "1525:1",
    "852:1",
    "179:0",
    "1526:1",
    "853:1",
    "180:1",
    "1527:1",
    "854:1",
    "1528:1",
    "855:1",
    "1529:1",
    "856:1",
    "1530:1",
    "857:1",
    "1531:1",
    "858:1",
    "1532:1",
    "859:1",
    "860:1",
    "1542:1",
    "197:1",
    "1543:1",
    "198:0",
    "1544:1",
    "199:1",
    "1545:1",
    "1546:1",
    "200:0",
    "1547:1",
    "201:1",
    "875:1",
    "1548:1",
    "876:1",
    "1549:1",
    "877:0",
    "1550:1",
    "878:1",
    "1551:1",
    "879:0",
    "1552:1",
    "1553:1",
    "880:1",
    "1554:0",
    "1555:0",
    "1556:0",
    "1557:0",
    "1558:0",
    "212:1",
    "1559:0",
    "213:1",
    "1560:0",
    "214:0",
    "1561:0",
    "215:0",
    "1562:0",
    "216:0",
    "1563:0",
    "890:1",
    "217:0",
    "1564:0",
    "891:1",
    "218:0",
    "1565:0",
    "892:0",
    "219:0",
    "1566:0",
    "893:0",
    "220:1",
    "1567:0",
    "894:0",
    "1568:0",
    "895:0",
    "1569:0",
    "896:0",
    "1570:0",
    "897:0",
    "1571:0",
    "898:0",
    "1572:1",
    "899:0",
    "1573:1",
    "900:1",
    "1574:1",
    "901:1",
    "1575:1",
    "902:1",
    "1576:1",
    "1577:1",
    "1578:1",
    "1579:1",
    "1580:1",
    "1581:1",
    "1582:1",
    "237:1",
    "1583:0",
    "238:1",
    "1584:1",
    "239:1",
    "1585:1",
    "1586:1",
    "240:0",
    "914:1",
    "1587:1",
    "241:1",
    "915:1",
    "1588:1",
    "242:1",
    "916:0",
    "1589:1",
    "917:0",
    "1590:0",
    "918:1",
    "1591:0",
    "919:0",
    "1592:0",
    "1593:0",
    "920:1",
    "1594:0",
    "1595:0",
    "1596:0",
    "1597:0",
    "1598:0",
    "1599:0",
    "253:1",
    "254:1",
    "255:0",
    "929:1",
    "256:0",
    "930:1",
    "257:0",
    "931:1",
    "258:0",
    "932:1",
    "259:1",
    "933:1",
    "260:1",
    "934:1",
    "935:1",
    "936:1",
    "937:1",
    "938:1",
    "939:0",
    "940:0",
    "941:0",
    "942:1",
    "943:1",
    "944:1",
    "945:1",
    "278:1",
    "279:1",
    "280:0",
    "954:1",
    "281:0",
    "955:1",
    "282:1",
    "956:0",
    "957:0",
    "958:1",
    "959:0",
    "960:1",
    "294:1",
    "295:1",
    "969:1",
    "296:1",
    "970:1",
    "297:1",
    "971:1",
    "298:1",
    "299:1",
    "978:1",
    "979:1",
    "980:1",
    "308:1",
    "981:0",
    "309:1",
    "982:0",
    "983:0",
    "984:1",
    "985:1",
    "986:1",
    "987:1",
    "988:1",
    "318:1",
    "319:1",
    "320:0",
    "321:0",
    "995:1",
    "322:1",
    "996:1",
    "323:1",
    "997:1",
    "998:1",
    "999:0",
    "1000:1",
    "1001:1",
    "347:1",
    "1020:1",
    "348:1",
    "1021:1",
    "349:1",
    "1022:0",
    "350:1",
    "1023:0",
    "1024:0",
    "1025:1",
    "1026:1",
    "1027:1",
    "1028:1",
    "1029:1",
    "358:1",
    "359:1",
    "360:0",
    "361:0",
    "362:0",
    "363:1",
    "1037:1",
    "364:1",
    "1038:1",
    "365:1",
    "1039:1",
    "366:1",
    "1040:1",
    "1041:1",
    "385:1",
    "386:1",
    "387:1",
    "388:0",
    "1061:1",
    "389:0",
    "1062:1",
    "390:1",
    "1063:0",
    "391:1",
    "1064:0",
    "392:1",
    "1065:0",
    "1066:0",
    "1067:1",
    "1068:0",
    "1069:1",
    "399:1",
    "400:0",
    "401:0",
    "402:0",
    "403:0",
    "404:0",
    "1078:1",
    "405:0",
    "1079:1",
    "406:1",
    "1080:1",
    "424:1",
    "425:1",
    "426:1",
    "427:0",
    "428:0",
    "429:0",
    "1102:1",
    "430:0",
    "1103:1",
    "431:0",
    "1104:0",
    "432:1",
    "1105:0",
    "1106:0",
    "1107:0",
    "1108:0",
    "1109:1",
    "1110:1",
    "439:1",
    "440:0",
    "441:0",
    "442:0",
    "443:0",
    "444:0",
    "1118:1",
    "445:1",
    "1119:1",
    "446:1",
    "1120:1",
    "1121:1",
    "452:1",
    "453:1",
    "464:1",
    "465:0",
    "466:1",
    "467:0",
    "468:0",
    "469:0",
    "470:0",
    "1143:1",
    "471:0",
    "1144:0",
    "472:1",
    "1145:0",
    "1146:0",
    "1147:0",
    "1148:0",
    "1149:0",
    "1150:1",
    "479:1",
    "480:0",
    "481:0",
    "482:0",
    "483:0",
    "484:1",
    "485:1",
    "1159:1",
    "1160:0",
    "1161:1",
    "490:1",
    "491:1",
    "492:1",
    "493:1",
    "494:1",
    "1173:1",
    "1174:1",
    "1175:1",
    "1176:1",
    "503:1",
    "1177:1",
    "504:1",
    "1178:1",
    "505:0",
    "506:1",
    "507:1",
    "508:0",
    "509:0",
    "510:0",
    "1183:1",
    "511:0",
    "1184:1",
    "512:1",
    "1185:0",
    "1186:0",
    "1187:0",
    "1188:0",
    "1189:0",
    "1190:1",
    "519:1",
    "520:0",
    "521:0",
    "522:0",
    "523:0",
    "524:1",
    "1200:1",
    "1201:1",
    "530:1",
    "531:1",
    "532:1",
    "533:1",
    "534:1",
    "535:1",
    "536:1",
    "1213:1",
    "1214:0",
    "1215:1",
    "1216:0",
    "543:1",
    "1217:0",
    "544:0",
    "1218:1",
    "545:0",
    "1219:1",
    "546:0",
    "547:1",
    "548:1",
    "549:0",
    "550:0",
    "551:0",
    "1224:1",
    "552:1",
    "1225:0",
    "1226:0",
    "1227:0",
    "1228:0",
    "1229:1",
    "1230:1",
    "558:1",
    "559:1",
    "560:0",
    "561:0",
    "562:0",
    "563:0",
    "564:1",
    "1239:1",
    "1240:1",
    "570:1",
    "571:1",
    "572:1",
    "573:1",
    "574:1",
    "575:1",
    "576:1",
    "1252:1",
    "1253:1",
    "1254:0",
    "1255:1",
    "582:1",
    "1256:1",
    "583:1",
    "1257:1",
    "584:0",
    "1258:0",
    "585:0",
    "1259:1",
    "586:0",
    "587:0",
    "1260:1",
    "588:1",
    "589:0",
    "590:0",
    "591:1",
    "1264:1",
    "592:1",
    "1265:1",
    "1266:0",
    "1267:0",
    "1268:0",
    "1269:1",
    "598:1",
    "599:0",
    "600:0",
    "601:0",
    "602:0",
    "603:1",
    "604:1",
    "1279:1",
    "1280:1",
    "611:1",
    "612:1",
    "613:1",
    "614:1",
    "615:1",
    "1292:1",
    "1293:0",
    "1294:0",
    "621:1",
    "1295:0",
    "622:1",
    "1296:0",
    "623:0",
    "1297:1",
    "624:0",
    "1298:0",
    "625:0",
    "1299:0",
    "626:0",
    "627:0",
    "1300:1",
    "628:1",
    "1301:1",
    "629:0",
    "630:1",
    "631:1",
    "1305:1",
    "1306:1",
    "1307:1",
    "1308:1",
    "1309:1",
    "638:1",
    "639:0",
    "640:0",
    "641:0",
    "642:0",
    "643:1",
    "1318:1",
    "1319:1",
    "1320:1",
    "652:1",
    "653:1",
    "654:1",
    "1331:1",
    "1332:1",
    "1333:0",
    "661:1",
    "1334:0",
    "1335:0",
    "662:1",
    "1336:0",
    "663:0",
    "1337:1",
    "664:0",
    "1338:0",
    "665:0",
    "1339:0",
    "666:0",
    "667:0",
    "1340:0",
    "668:1",
    "1341:1",
    "669:1",
    "670:1"
]