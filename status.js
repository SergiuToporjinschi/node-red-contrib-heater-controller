function Status() {
    var privateStatus = {};
    return {
        set currentTemp(val) {
            // var changed = privateStatus.currentTemp != val;
            privateStatus.currentTemp = val;
            privateStatus.time = new Date().toLocaleString();
            //if (changed) { node.context().set('status', privateStatus); }
        },
        get currentTemp() {
            return privateStatus.currentTemp;
        },
        set targetValue(val) {
            var changed = privateStatus.targetValue != val;
            privateStatus.targetValue = val;
            privateStatus.time = new Date().toLocaleString();
            //if (changed) { node.context().set('status', privateStatus); }
        },
        set isUserCustom(val) {
            privateStatus.isUserCustom = val;
            privateStatus.time = new Date().toLocaleString();
            //node.context().set('status', privateStatus);
        },
        set isUserCustomLocked(val) {
            privateStatus.isUserCustomLocked = val;
            privateStatus.time = new Date().toLocaleString();
            //node.context().set('status', privateStatus);
        },
        set userTargetValue(val) {
            privateStatus.targetValue = val;
            privateStatus.time = new Date().toLocaleString();
            // node.context().set('status', privateStatus);
        },
        set currentSchedule(val) {
            privateStatus.currentSchedule = val;
            privateStatus.time = new Date().toLocaleString();
            //node.context().set('status', privateStatus);
        },
        set nextSchedule(val) {
            privateStatus.nextSchedule = val;
            privateStatus.time = new Date().toLocaleString();
            //node.context().set('status', privateStatus);
        },
        set currentHeaterStatus(val) {
            privateStatus.currentHeaterStatus = val;
            privateStatus.time = new Date().toLocaleString();
            //node.context().set('status', privateStatus);
        }

    }
}


var x = Status('test');
x.currentTemp = 22;
console.log(x);
console.log(JSON.stringify(x));
console.log(x.currentTemp);
