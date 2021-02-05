var sinon = require('sinon');
var should = require("should");
var itParam = require('mocha-param');
var helper = require("./testHelper.js");
var HeaterController = require('../nodes/heater/heater');
var tempRising = [];
for (var i = 10.5; i < 30; i = i + 0.5) {
    tempRising.push(i);
}
describe("Functions", function () {
    var RED = helper.getMockedRED();;
    var hc;
    const sandbox = sinon.createSandbox();

    beforeEach(() => {
        sandbox.spy(RED);
        var HeaterController = helper.getMockedHeaterController(require('../nodes/heater/heater'));
        sandbox.spy(HeaterController);
    })
    afterEach(function () {
        sandbox.restore();
    });
    describe('Other', () => {
        beforeEach(() => {
            helper.setMockedDate('2021-01-31T08:00:00.000');//Sunday
            hc = new HeaterController(RED, {
                group: 'someGroup',
                calendar: JSON.stringify(helper.calendar),
                threshold: 0.5
            });
        });
        var offSetData = [
        ];
        itParam("Testing getScheduleOffSet", offSetData, (testSetting) => {
            // console.log(JSON.stringify(testSetting))
            helper.setMockedDate(testSetting.currentTime);//Sunday
            var ret = hc.getScheduleOffSet(testSetting.offSet);
            ret.time.length.should.be.equal(5);
            ret.time.should.match(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, "Incorrect time format: " + JSON.stringify(testSetting));

            ret.should.have.property("day").which.is.type("string", "day attribute is not a string: " + JSON.stringify(testSetting));
            ret.should.have.property("temp").which.is.type("number", "temp attribute is not number: " + JSON.stringify(testSetting));
            ret.should.have.property("time").which.is.type("string", "time attribute is not a string: " + JSON.stringify(testSetting));;

            ret.should.have.keys("day", "time", "temp");
            ret.should.be.deepEqual(testSetting.expected, 'Not expected object: ' + JSON.stringify(testSetting));
        });
    });
});