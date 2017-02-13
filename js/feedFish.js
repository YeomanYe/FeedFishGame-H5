window.onload = game;

function game() {
    init();
    gameloop();
}
//果实对时间影响的因子
var IMPACT_TIME_RATE = 2,
    //果实对分数影响的因子
    IMPACT_SCORE_RATE = 100,
    //果实同时存在数量
    FRUIT_NUM = 30,
    //默认特效圆最大半径
    DEFAULT_MAXR = 100,
    //果实最大半径
    FRUIT_MAXR = 18;

var lastTime, deltaTime;
var ctx1, ctx2;
var canvas1, canvas2;

var mom;
var mouseX, mouseY;

function init() {
    //鱼食物
    canvas1 = document.getElementById("canvas1");
    ctx1 = canvas1.getContext("2d");
    //用于画背景海葵
    canvas2 = document.getElementById("canvas2");
    ctx2 = canvas2.getContext("2d");

    lastTime = Date.now();

    aneO = new aneObj();
    aneO.init();

    fruit = new fruitObj();
    fruit.init();

    mom = new momObj();
    mom.init();

    baby = new babyObj();
    baby.init();

    data = new dataObj();
    data.reset();
    bgImg.src = "src/background.jpg";
    bgImg.onload = function() {
        drawBackground();

        aneO.draw();
    };

    mouseX = canWidth * 0.5;
    mouseY = canHeight * 0.5;
    canvas1.addEventListener("mousemove", mouseMove, false);



}
var fruit;
//游戏结束标志位 
var isOver = false;
//特效圆数组
var effectCircleArr = [];

function gameloop() {
    canHeight = getWindowSize().height;
    canWidth = getWindowSize().width;
    if (canWidth > canHeight * 4 / 3)
        canWidth = canHeight * 4 / 3;
    else if (canWidth * 3 / 4 < canHeight) canHeight = canWidth * 3 / 4;
    canvas1.height = canHeight;
    canvas1.width = canWidth;
    canvas2.height = canHeight;
    canvas2.width = canWidth;
    //根据机器性,绘画数量,能动态设置执行间隔时间
    // if (isOver) return;
    requestAnimFrame(gameloop);
    var now = Date.now();
    if (deltaTime > 40) deltaTime = 40;
    deltaTime = now - lastTime;
    lastTime = now;
    fruit.draw();
    fruitMonitor();

    mom.draw();
    baby.draw();
    data.draw();
    if (!isOver) {
        momFruitsCollision();
        momBabyCollision();
    } else {
        gameover();
    }

    for (var i = 0; i < effectCircleArr.length; i++) {
        var circle = effectCircleArr[i];
        circle.draw();
        if (circle.r >= circle.endR) {
            effectCircleArr.shift();
        }
    }

    ctx2Draw();
}

var bgImg = new Image();
var canWidth = 800,
    canHeight = 600;

function drawBackground() {
    ctx2.drawImage(bgImg, 0, 0, canWidth, canHeight);
}

function ctx2Draw() {
    ctx2.clearRect(0, 0, canWidth, canHeight);
    drawBackground();
    aneO.draw();
}

/*海葵相关的函数*/
var aneObj = function() {
    this.x = [];
    this.len = [];
    this.arc = 0;
    this.dir = 1;
    this.headX = [];
};

aneObj.prototype.num = 50;
aneObj.prototype.init = function() {
    for (var i = 0; i < this.num; i++) {
        this.x[i] = i * 20 + Math.random() * 20;
        this.len[i] = 200 + Math.random() * 50;
        this.headX[i] = this.x[i];
    }
};

aneObj.prototype.draw = function() {
    ctx2.save();
    ctx2.globalAlpha = 0.6;
    ctx2.lineWidth = 20;
    ctx2.lineCap = 'round';
    ctx2.strokeStyle = "purple";
    ctx2.transform(1, 0, 0, 1, 0, 0);
    for (var i = 0; i < this.num; i++) {
        ctx2.beginPath();
        ctx2.moveTo(this.x[i], canHeight);
        this.headX[i] = this.x[i] + this.arc;
        ctx2.quadraticCurveTo(this.x[i], canHeight - this.len[i] + 20, this.headX[i], canHeight - this.len[i]);

        ctx2.stroke();
    }
    ctx2.restore();

    this.arc += this.dir;
    if (this.arc == 50) {
        this.dir = -1;
    } else if (this.arc == -50) {
        this.dir = 1;
    }
};

/*果实相关的函数*/

var fruitObj = function() {
    this.alive = []; //bool
    this.x = [];
    this.y = [];
    this.l = [];
    this.aneId = [];
    this.lastL = [];
    this.spd = [];
    this.fruitType = []; //orange,blue
    this.orange = new Image();
    this.blue = new Image();

};

fruitObj.prototype.num = FRUIT_NUM;

fruitObj.prototype.init = function() {
    for (var i = 0; i < this.num; i++) {
        this.alive[i] = false; //bool
        this.x[i] = 0;
        this.y[i] = 0;
        this.aneId[i] = 0;
        this.lastL[i] = 0;
        this.fruitType[i] = "";
        this.orange.src = "./src/fruit.png";
        this.blue.src = "./src/blue.png";
    }
};

fruitObj.prototype.update = function() {
    var num = 0;
    for (var i = 0; i < this.num; i++) {
        if (this.alive[i]) num++;
    }
};

fruitObj.prototype.born = function(i) {
    var aneId = Math.floor(Math.random() * aneObj.prototype.num);
    this.x[i] = aneO.x[aneId];
    this.aneId[i] = aneId;
    this.y[i] = canHeight - aneO.len[aneId];
    this.l[i] = 0;
    this.alive[i] = true;
    this.spd[i] = Math.random() * 0.1 + 0.003;
    if (0.03 < Math.random()) {
        this.fruitType[i] = "orange";
    } else {
        this.fruitType[i] = "blue";
    }
};

fruitObj.prototype.dead = function(i) {
    this.alive[i] = false;
};

fruitObj.prototype.draw = function() {
    ctx1.clearRect(0, 0, canWidth, canHeight);
    for (var i = 0; i < this.num; i++) {
        if (this.alive[i]) {
            var pic = "";
            if (this.fruitType[i] == "blue") {
                pic = this.blue;
            } else {
                pic = this.orange;
            }
            if (this.l[i] <= FRUIT_MAXR) {
                //记录果实上次的大小
                this.lastL[i] = this.l[i];

                this.l[i] += this.spd[i] * deltaTime;
                //大于果实最大半径时,设为最大半径
                if (this.l[i] > FRUIT_MAXR)
                    this.l[i] = FRUIT_MAXR + 1;
            } else {
                this.lastL[i] = this.l[i];
                this.y[i] -= this.spd[i] * 2 * deltaTime;
            }

            if (this.l[i] != this.lastL[i]) {
                //果实处于成才状态
                this.x[i] = aneO.headX[this.aneId[i]];
            }
            ctx1.drawImage(pic, this.x[i] - this.l[i] * 0.5, this.y[i] - this.l[i] * 0.5, this.l[i], this.l[i]);
            if (this.y[i] < 1) {
                this.alive[i] = false;
            }
        }
    }

};

function fruitMonitor() {
    var num = 0;
    for (var i = 0; i < fruit.num; i++) {
        if (fruit.alive[i]) num++;
    }
    if (num < 15) {
        sendFruit();
        return;
    }
}

function sendFruit() {
    for (var i = 0; i < fruit.num; i++) {
        if (!fruit.alive[i]) {
            fruit.born(i);
            return;
        }
    }
}

/*定义鱼妈妈*/
var momObj = function() {
    this.x;
    this.y;
    this.angle;
    this.bigEye = new Array(2);
    this.bigBodyBlue = new Array(8);
    this.bigBodyOrange = new Array(8);
    this.bigTail = new Array(8);

    this.bigEyeTime;
    this.bigEyeCount;
    this.bigInterval;
    this.bigTailTime;
    this.bigTailCount;
    this.bigBodyCount;
};

momObj.prototype.init = function() {
    this.x = canWidth * 0.5;
    this.y = canHeight * 0.5;
    this.angle = 0;

    for (var i = 0; i < this.bigEye.length; i++) {
        this.bigEye[i] = new Image();
        this.bigEye[i].src = "./src/bigEye" + i + ".png";
    }

    for (i = 0; i < this.bigTail.length; i++) {
        this.bigTail[i] = new Image();
        this.bigTail[i].src = "./src/bigTail" + i + ".png";
    }

    for (i = 0; i < this.bigBodyOrange.length; i++) {
        this.bigBodyOrange[i] = new Image();
        this.bigBodyBlue[i] = new Image();

        this.bigBodyOrange[i].src = "./src/bigSwim" + i + ".png";
        this.bigBodyBlue[i].src = "./src/bigSwimBlue" + i + ".png";
    }

    this.bigEyeTime = 0;
    this.bigEyeCount = 0;
    this.bigInterval = 1000;
    this.bigTailTime = 0;
    this.bigTailCount = 0;
    this.bigBodyCount = 0;
};

momObj.prototype.draw = function() {
    var deltaX = mouseX - this.x,
        deltaY = mouseY - this.y,
        beta = Math.atan2(deltaY, deltaX) + Math.PI;
    if (!isOver) {
        this.x = lerpDistance(mouseX, this.x, 0.97);
        this.y = lerpDistance(mouseY, this.y, 0.97);
        this.angle = lerpAngle(beta, this.angle, 0.7);
    }

    // 大鱼眼睛动画
    this.bigEyeTime += deltaTime;
    if (this.bigEyeTime > this.bigInterval) {
        this.bigEyeCount = (this.bigEyeCount + 1) % 2;
        this.bigEyeTime = this.bigEyeTime % this.bigInterval;

        if (!this.bigEyeCount) {
            this.bigInterval = (Math.random() + 3) * 1000;
        } else {
            this.bigInterval = Math.random() * 200;
        }
    }

    //大鱼尾巴动画
    this.bigTailTime += deltaTime;
    if (this.bigTailTime > 100) {
        this.bigTailTime %= 100;
        this.bigTailCount = (this.bigTailCount + 1) % 8;
    }

    var bigBody = null;
    if (data.dou != 1) {
        bigBody = this.bigBodyBlue[this.bigBodyCount];
    } else {
        bigBody = this.bigBodyOrange[this.bigBodyCount];
    }

    ctx1.save();
    ctx1.translate(this.x, this.y);
    ctx1.rotate(this.angle);


    ctx1.drawImage(this.bigTail[this.bigTailCount], -this.bigTail[this.bigTailCount].width * 0.5 + 30, -this.bigTail[this.bigTailCount].height * 0.5);
    ctx1.drawImage(bigBody, -bigBody.width * 0.5, -bigBody.height * 0.5);
    ctx1.drawImage(this.bigEye[this.bigEyeCount], -this.bigEye[this.bigEyeCount].width * 0.5, -this.bigEye[this.bigEyeCount].height * 0.5);

    ctx1.restore();
};

function mouseMove(event) {
    mouseX = event.offsetX || event.layerX;
    mouseY = event.offsetY || event.layerY;
}

/*大鱼与果实碰撞检测*/
function momFruitsCollision() {
    for (var i = 0; i < fruit.num; i++) {
        if (fruit.alive[i]) {
            var dist = calLength2(fruit.x[i], fruit.y[i], mom.x, mom.y);
            if (dist < 300) {
                var circle = new effectCircleObj(fruit.x[i], fruit.y[i], "white");
                effectCircleArr.push(circle);
                fruit.dead(i);
                data.num++;
                mom.bigBodyCount++;
                if (mom.bigBodyCount >= 8) {
                    mom.bigBodyCount = 7;
                }
                if (fruit.fruitType[i] == "blue") {
                    data.dou += 1;
                }
            }
        }
    }
}

/*小鱼,妈妈碰撞检测*/
function momBabyCollision() {
    var dist = calLength2(baby.x, baby.y, mom.x, mom.y);
    if (dist < 300 && mom.bigBodyCount) {
        //产生特效圆
        var effectCircle = new effectCircleObj(baby.x, baby.y, "orange");
        effectCircleArr.push(effectCircle);
        //分值更新
        baby.babyBodyCount -= IMPACT_TIME_RATE * mom.bigBodyCount;
        data.score += data.dou * data.num;
        data.num = 0;
        data.dou = 1;

        if (baby.babyBodyCount < 0) {
            baby.babyBodyCount = 0;
        }
        mom.bigBodyCount = 0;
    }
}

/*小鱼*/
var baby;
var babyObj = function() {
    this.x;
    this.y;
    this.angle;

    this.babyTailTime;
    this.babyTailCount;
    this.babyEyeTime;
    this.babyEyeCount;
    this.babyEyeInterval;
    this.babyBodyTime;
    this.babyBodyCount;

    this.babyEye = new Array(2);
    this.babyBody = new Array(20);
    this.babyTail = new Array(8);
};

babyObj.prototype.init = function() {
    this.x = canWidth / 2 + 100;
    this.y = canHeight / 2 + 100;
    this.angle = 0;

    for (var i = 0; i < this.babyEye.length; i++) {
        this.babyEye[i] = new Image();
        this.babyEye[i].src = "./src/babyEye" + i + ".png";
    }

    for (i = 0; i < this.babyTail.length; i++) {
        this.babyTail[i] = new Image();
        this.babyTail[i].src = "./src/babyTail" + i + ".png";
    }

    for (i = 0; i < this.babyBody.length; i++) {
        this.babyBody[i] = new Image();
        this.babyBody[i].src = "./src/babyFade" + i + ".png";
    }
    this.babyTailTime = 0;
    this.babyTailCount = 0;
    this.babyEyeCount = 0;
    this.babyEyeTime = 0;
    this.babyEyeInterval = 1000;
    this.babyBodyCount = 0;
    this.babyBodyTime = 0;
};

babyObj.prototype.draw = function() {
    this.x = lerpDistance(mom.x, this.x, 0.97);
    this.y = lerpDistance(mom.y, this.y, 0.97);

    // 小鱼尾部动画
    this.babyTailTime += deltaTime;
    if (this.babyTailTime > 50) {
        this.babyTailTime %= 50;
        this.babyTailCount = (this.babyTailCount + 1) % 8;
    }

    //小鱼眼睛动画
    this.babyEyeTime += deltaTime;
    if (this.babyEyeTime > this.babyEyeInterval) {
        this.babyEyeTime = (this.babyEyeTime) % this.babyEyeInterval;
        this.babyEyeCount = (this.babyEyeCount + 1) % 2;

        if (this.babyEyeCount == 1) {
            this.babyEyeInterval = Math.random() * 500;
        } else {
            this.babyEyeInterval = (Math.random() + 3) * 1000;
        }
    }

    //小鱼身体动画
    this.babyBodyTime += deltaTime;
    if (this.babyBodyTime > 500) {
        this.babyBodyTime = this.babyBodyTime % 500;
        this.babyBodyCount++;
        if (this.babyBodyCount >= 19) {
            isOver = true;
            this.babyBodyCount = 19;
        }
    }

    var deltaX = mom.x - this.x,
        deltaY = mom.y - this.y,
        delta = Math.atan2(deltaY, deltaX) + Math.PI;
    this.angle = lerpAngle(delta, this.angle, 0.7);

    ctx1.save();
    ctx1.translate(this.x, this.y);
    ctx1.rotate(this.angle);
    ctx1.drawImage(this.babyTail[this.babyTailCount], -this.babyTail[this.babyTailCount].width * 0.5 + 20, -this.babyTail[this.babyTailCount].height * 0.5);
    ctx1.drawImage(this.babyBody[this.babyBodyCount], -this.babyBody[this.babyBodyCount].width * 0.5, -this.babyBody[this.babyBodyCount].height * 0.5);
    ctx1.drawImage(this.babyEye[this.babyEyeCount], -this.babyEye[this.babyEyeCount].width * 0.5, -this.babyEye[this.babyEyeCount].height * 0.5);
    ctx1.restore();
};

/*数据原型*/
var data;
var dataObj = function() {
    this.num;
    this.dou;
    this.score;
};

dataObj.prototype.reset = function() {
    this.num = 0;
    this.dou = 1;
    this.score = 0;
};

dataObj.prototype.draw = function() {
    ctx1.fillStyle = "white";
    ctx1.font = "30px 微软雅黑";
    ctx1.fillText("Score " + (data.score * IMPACT_SCORE_RATE), canWidth * 0.5 - 15 * 4, 30);
    ctx1.fillText("Time:" + (19 - baby.babyBodyCount), canWidth - 15 * 9, 30);
};

/*游戏结束*/
function gameover() {
    ctx1.fillStyle = "white";
    ctx1.font = "50px 微软雅黑";
    ctx1.fillText("Game Over", canWidth * 0.5 - 15 * 8, canHeight * 0.4);
    ctx1.fillText("Click to restart", canWidth * 0.5 - 15 * 10, canHeight * 0.6);

    //点击,游戏重开
    var canvas1 = document.getElementById("canvas1");
    canvas1.style.cursor = "pointer";
    canvas1.onclick = function() {
        this.style.cursor = "default";
        init();
        isOver = false;
        this.onclick = null;
    };
}

/*特效*/
var effectCircleObj = function(x, y, color) {
    if (!color) {
        color = "orange";
    }
    this.r = 10;
    this.endR = DEFAULT_MAXR;
    this.color = color;
    this.centerX = x;
    this.centerY = y;
};

effectCircleObj.prototype.draw = function() {
    ctx1.strokeStyle = this.color;
    ctx1.beginPath();
    ctx1.arc(this.centerX, this.centerY, this.r, 0, 2 * Math.PI);
    ctx1.closePath();
    ctx1.stroke();
    this.r++;
};

/*工具函数*/
//根据机子自适应刷新率
window.requestAnimFrame = (function() {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
        function(callback) {
            return window.setTimeout(callback, 1000 / 60);
        };
})();

//不断趋向于aim
function lerpDistance(aim, cur, ratio) {
    var delta = cur - aim;
    return aim + delta * ratio;
}
//不断趋向于角度
function lerpAngle(a, b, t) {
    var d = b - a;
    if (d > Math.PI) d = d - 2 * Math.PI;
    if (d < -Math.PI) d = d + 2 * Math.PI;
    return a + d * t;
}
//获取两点之间的距离
function calLength2(x1, y1, x2, y2) {
    return Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2);
}

//产生一个从0到参数的随机整数,不包含参数 
function rand(range) {
    return Math.floor(Math.random() * range);
}

//获取屏幕可视区域宽高
function getWindowSize() {
    var cHeight = document.documentElement.clientHeight || document.body.clientHeight,
        cWidth = document.documentElement.clientWidth || document.body.clientWidth,
        obj = {
            width: cWidth,
            height: cHeight
        };
    return obj;
}
