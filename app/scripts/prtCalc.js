/**
 * @author Joe Sangiorgio
 * JS Backend for PRT Calculator
 */

var verbose = false;
var isDev = false;

var lastInput = "";
var First1 = "";
var Display1 = "";
var currField = "";
var inputObj = {}
var dollarObj = {}
var percentObj = {}
var onInputPage = false;
var lastButton = "";
var lastNavButton = "";
var lastWorking;
var unChangedInputs = {};
var savedSliders = {};
var didSubmit = false;
var firstToggle = true;
var onDisclaimer = false;
var firstOverallRun = true;
var tempInObj = {};

var pensionCalc = (function () {
    var pensionCalc = {}
    pensionCalc.inputBtnArr = ["pboActivesBtn", "pboVestedsBtn", "pboRetireesBtn", "pboAssetsBtn", "pboTotalWorthBtn"]
    pensionCalc.reachedScenario = false
    //    console.log('setting REACHEDSCENARIO FALSE1')
    pensionCalc.reachedParticipants = false
    pensionCalc.inputz = ["pboAssetsFakeBtn", "pboAssets", "pboAssetsBtn", "pboActivesFakeBtn", "pboActives", "pboActivesBtn", "pboVestedsFakeBtn", "pboVesteds", "pboVestedsBtn", "pboRetireesFakeBtn", "pboRetirees", "pboRetireesBtn", "pboTotalWorthFakeBtn", "pboTotalWorth", "pboTotalWorthBtn"];
    pensionCalc.pboFieldArr = ["pboTotalWorth", "pboActives", "pboVesteds", "pboRetirees", "pboAssets"]
    pensionCalc.partFieldArr = ["participantActives", "participantTerm", "participantRetirees"]
    pensionCalc.advFieldArr = ["PBGC", "activesCosts", "vestedsCosts", "retireesCosts", "activesLongRate", "vestedsLongRate", "retireesLongRate"]
    pensionCalc.advFieldzArr = ["PBGCFakeBtn", "activesCostsFakeBtn", "vestedsCostsFakeBtn", "retireesCostsFakeBtn", "activesLongRateFakeBtn", "vestedsLongRateFakeBtn", "retireesLongRateFakeBtn", "PBGCBtn", "activesCostsBtn", "vestedsCostsBtn", "retireesCostsBtn", "activesLongRateBtn", "vestedsLongRateBtn", "retireesLongRateBtn"]
    pensionCalc.advFieldArr2 = ["advSettingsSubmitBtn", "advSettingsUberResetBtn", "advSettingsResetBtn"]
    //scenario datastores
    pensionCalc.scenarioObj = {
        "pboActives": ["pboActivesTV", "pboActivesPA", "pboActivesB"],
        "pboVesteds": ["pboVestedsTV", "pboVestedsPA", "pboVestedsB"],
        "pboRetirees": ["pboRetireesTV", "pboRetireesPA", "pboRetireesB"],
        "pboTotalwFee": ["pboTotalwFeeTV", "pboTotalwFeePA", "pboTotalwFeeB"]
    }
    pensionCalc.sNum = -1;
    pensionCalc.scenarioRef = ["TV", "PA", "B"]
    pensionCalc.scenarioHeights = {
        "TV": "135px",
        "PA": "225px",
        "B": "225px",
        "NA": "36px"
    }
    pensionCalc.scenarioDDObj = {
        "TV": false,
        "PA": false,
        "B": false
    }

    function init(doClear) {

        //TODO: figure out when to use doClear -- not init arrays and whatnot

        if (doClear) {

            //arrs
            ELast = '-1';
            RALast = '-1';
            RELast = '-1';
            console.log('CLEARING -- ')
            savedSliders = {};
            pensionCalc.BOIndex = 1.08;
            //            pensionCalc.discountRate = 1.0;
            pensionCalc.retireeTransferPercent = 0.0;
            pensionCalc.TVTransferPercent = 0.0;
            pensionCalc.PBGCArr = [];
            pensionCalc.varArr = [];
            pensionCalc.adminArr = [];
            pensionCalc.otherArr = [];
            pensionCalc.totalArr = [];
            pensionCalc.longevityArr = [];
            pensionCalc.longevityNums = [];
            pensionCalc.tenYearArr = [];
            pensionCalc.adminCostsArr = [30, 30, 30];
            pensionCalc.otherCostsArr = [.05, .05, .05];
            pensionCalc.longRateArr = [0.025, 0.025, 0.025];


        } else {
            //first inputs init
            pensionCalc.pboActives = -1;
            pensionCalc.pboVesteds = -1;
            pensionCalc.pboRetirees = -1;
            pensionCalc.pboAssets = -1;


            //vesteds stuff
            pensionCalc.pboVestedsAfter = -1;
            pensionCalc.pboAssetsVestedsAfter = -1;
            pensionCalc.pboAssetsVestedsAfter2 = -1;
            pensionCalc.pboVestedsAddlCostsAfter = -1;
            pensionCalc.pboVestedAssetsAfterTotal = -1;
            pensionCalc.pboAssetsAfterTotal = -1;
            pensionCalc.pboVestedFundedStatus = -1;

            //second inputs
            pensionCalc.participantActives = -1;
            pensionCalc.participantTerm = -1;
            pensionCalc.participantRetirees = -1;
            pensionCalc.participantTotal = -1;

            //third inputs?
            pensionCalc.BOIndex = -1;
            pensionCalc.discountRate = -1;
            pensionCalc.retireeTransferPercent = -1;
            pensionCalc.TVTransferPercent = -1;

            //CONSTANTS / advanced options

            //TODO: Change this for testing hardcoding purposes
            pensionCalc.PBGC = 50;
            pensionCalc.ADMIN_COSTS = 30;
            pensionCalc.MORTALITY_IMPACT = 0.025;

            //     BUYOUT_INDEX = 1.08;
            //     PERCENT_LIABILITY = 0.5;
            pensionCalc.VAR_CONST = 0.018;
            pensionCalc.MULT_CONST = 100000;
            pensionCalc.DIV_CONST = 1000000;

            //arrs to make life easy
            pensionCalc.firstInArr = [];
            pensionCalc.secondInArr = [];
            pensionCalc.thirdInArr = [];

            //outputs
            pensionCalc.PBGCTotalCosts = 0;
            pensionCalc.pboInDollars = true;

            pensionCalc.pboTotalWorth = -1;
            pensionCalc.participantActives = -1;
            pensionCalc.participantTerm = -1;
            pensionCalc.participantRetirees = -1;
            pensionCalc.inputs = {};
            pensionCalc.inputs2 = {};
            inputObj = {}
            dollarObj = {}
            percentObj = {}


            pensionCalc.pboTotal = -1;
            pensionCalc.pboDeficit = -1;
            pensionCalc.pboAddlCost = -1;
            pensionCalc.pboFundedStatus = -1;
            pensionCalc.pboTotalwFee = -1;
            pensionCalc.pboRetireesAfter = -1;
            pensionCalc.assetsRetireesAfter = -1;


            pensionCalc.assetsRetireesAfter2 = -1;
            pensionCalc.pboRetireesAddlCostsAfter = -1;
            pensionCalc.pboAssetsBeforePercent = -1;
            pensionCalc.pboAfterTotal = -1;
            pensionCalc.pboAssetsAfter = -1;
            pensionCalc.pboAssetsAfterPercent = -1;


            //TODO: Change this for testing hardcoding purposes

            //            first inputs
            //TODO: COmment back , change to return false commented out
//                        pensionCalc.pboActives = 123;
//                        pensionCalc.pboVesteds = 567;
//                        pensionCalc.pboRetirees = 890;
//                        pensionCalc.pboAssets = 1000;
//
//                        //second inputs
//                        pensionCalc.participantActives = 500;
//                        pensionCalc.participantTerm = 50;
//                        pensionCalc.participantRetirees = 20;

            //TODO: Comment back in
            //            pensionCalc.pboActives = 100;
            //            pensionCalc.pboVesteds = 100;
            //            pensionCalc.pboRetirees = 100;
            //            pensionCalc.pboAssets = 275;
            //
            //            //second inputs
            //            pensionCalc.participantActives = 1000;
            //            pensionCalc.participantTerm = 1000;
            //            pensionCalc.participantRetirees = 1000;


            //third inputs
            pensionCalc.BOIndex = 1.08;
            pensionCalc.discountRate = 1.0;
            pensionCalc.retireeTransferPercent = 0.0;
            pensionCalc.TVTransferPercent = 0.0;

            //aux stuff for slider and asst
            pensionCalc.sliderWidth = "15px";
            //        console.log(pensionCalc.pboTotal + " : " + pensionCalc.participantTotal)


            //globals
            lastInput = "";
            First1 = "";
            Display1 = "";
            currField = "";
            inputObj = {}
            dollarObj = {}
            percentObj = {}
            onInputPage = false;
            lastButton = "";
            lastNavButton = "";
            lastWorking;
            unChangedInputs = {};
            didSubmit = false;
            firstToggle = true;
            pensionCalc.inputBtnArr = ["pboActivesBtn", "pboVestedsBtn", "pboRetireesBtn", "pboAssetsBtn", "pboTotalWorthBtn"
            ]
            pensionCalc.reachedScenario = false
            //            console.log('setting REACHEDSCENARIO FALSE')
            pensionCalc.reachedParticipants = false


            //TODO: CHANGE TO REturn false --- REMOVE THIS - Change only for testing purposes
//                        pensionCalc.pboActives = 500;
//                        pensionCalc.pboVesteds = 500;
//                        pensionCalc.pboRetirees = 500;
//                        pensionCalc.pboAssets = 1615;
//
//                        //second inputs
//                        pensionCalc.participantActives = 5000;
//                        pensionCalc.participantTerm = 5000;
//                        pensionCalc.participantRetirees = 5000;


            pensionCalc.PBGC = 50;
            pensionCalc.ADMIN_COSTS = 30;
            pensionCalc.MORTALITY_IMPACT = 0.025;
            pensionCalc.adminCostsArr = [30, 30, 30];
            pensionCalc.otherCostsArr = [.05, .05, .05];
            pensionCalc.longRateArr = [0.025, 0.025, 0.025];


        }
        pensionCalc.varTotal = 0;
        pensionCalc.adminTotal = 0;
        pensionCalc.otherTotal = 0;
        pensionCalc.participantTotal = 0;
        pensionCalc.fullTotal = 0;
        pensionCalc.tenYearTotal = 0;
        pensionCalc.longevityTotal = 0;
        pensionCalc.outputStr = "";


    }

    init();

    function calcPBGC() {

        //adding clear stuff here because if this function is called you should have all new numbers anyway
        pensionCalc.PBGCTotalCosts = 0;
        pensionCalc.adminTotal = 0;
        pensionCalc.otherTotal = 0;
        pensionCalc.varTotal = 0;
        pensionCalc.tenYearTotal = 0;
        pensionCalc.longevityTotal = 0;
        pensionCalc.PBGCArr = [];
        pensionCalc.varArr = [];
        pensionCalc.adminArr = [];
        pensionCalc.otherArr = [];
        pensionCalc.totalArr = [];
        pensionCalc.tenYearArr = [];
        pensionCalc.longevityArr = [];

        if (verbose) {
            console.log("--------------------PBGC INPUTS-----------------------")
            pensionCalc.outputStr += "--------------------PBGC INPUTS-----------------------" + "\r\n"
            console.log("pensionCalc.TVTransferPercent: " + pensionCalc.TVTransferPercent)
            console.log("pensionCalc.BOIndex: " + pensionCalc.BOIndex)
            console.log("pensionCalc.retireeTransferPercent: " + pensionCalc.retireeTransferPercent)


            console.log("--------------------PBGC CALCS-----------------------")
            pensionCalc.outputStr += "--------------------PBGC CALCS-----------------------" + "\r\n"

        } else {
        }

        var max = Math.max(0, (pensionCalc.pboTotal - pensionCalc.pboAssets));
        //            pensionCalc.PBGCTotalCosts = 0;
        for (var i = 0; i < pensionCalc.secondInArr.length; i++) {

            pensionCalc.PBGCArr.push(pensionCalc.PBGC * pensionCalc.secondInArr[i])
            pensionCalc.PBGCTotalCosts += (pensionCalc.PBGC * pensionCalc.secondInArr[i])

            pensionCalc.adminArr.push(pensionCalc.adminCostsArr[i] * pensionCalc.secondInArr[i])
            pensionCalc.adminTotal += (pensionCalc.adminCostsArr[i] * pensionCalc.secondInArr[i])

            pensionCalc.otherArr.push(pensionCalc.otherCostsArr[i] * pensionCalc.firstInArr[i])
            pensionCalc.otherTotal += (pensionCalc.otherCostsArr[i] * pensionCalc.firstInArr[i])

            var varz = Math.round(pensionCalc.VAR_CONST * (max * pensionCalc.firstInArr[i] / pensionCalc.pboTotal * pensionCalc.MULT_CONST))
            //TODO: Comment this in to remove varz entirely?
            var varz = 0;
            pensionCalc.varArr.push(varz)
            pensionCalc.varTotal += varz;

            pensionCalc.totalArr.push(pensionCalc.PBGCArr[i] + pensionCalc.adminArr[i] + pensionCalc.varArr[i])

            //TODO: CO2
            if (i == 2) {
                pensionCalc.tenYearArr.push((pensionCalc.totalArr[i] * 10) / pensionCalc.DIV_CONST)
            } else {
                pensionCalc.tenYearArr.push((pensionCalc.totalArr[i] * 20) / pensionCalc.DIV_CONST)
            }


            pensionCalc.tenYearTotal += pensionCalc.tenYearArr[i];

            pensionCalc.longevityArr.push(pensionCalc.longRateArr[i] * pensionCalc.firstInArr[i])
            pensionCalc.longevityTotal += (pensionCalc.longRateArr[i] * pensionCalc.firstInArr[i])

        }

        pensionCalc.fullTotal = pensionCalc.totalArr[0] + pensionCalc.totalArr[1] + pensionCalc.totalArr[2]
        pensionCalc.pboAddlCost = pensionCalc.tenYearTotal + pensionCalc.longevityTotal + pensionCalc.otherTotal
        pensionCalc.pboTotalwFee = pensionCalc.pboTotal + pensionCalc.pboAddlCost;
        pensionCalc.participantTotal = pensionCalc.PBGCTotalCosts + pensionCalc.varTotal + pensionCalc.adminTotal;


        if (verbose) {

            console.log("pensionCalc.PBGCTotalCosts: " + pensionCalc.PBGCTotalCosts)
            console.log("pensionCalc.varTotal: " + pensionCalc.varTotal)
            console.log("pensionCalc.adminTotal: " + pensionCalc.adminTotal)
            console.log("pensionCalc.otherTotal: " + pensionCalc.otherTotal)
            console.log("pensionCalc.participantTotal: " + pensionCalc.participantTotal)
            console.log("pensionCalc.fullTotal: " + pensionCalc.fullTotal)
            console.log("pensionCalc.tenYearTotal: " + pensionCalc.tenYearTotal)
            console.log("pensionCalc.longevityTotal: " + pensionCalc.longevityTotal)
            console.log("pboTotalwFee" + pensionCalc.pboTotalwFee)

            console.log("PBGCArr: " + pensionCalc.PBGCArr)
            console.log("varArr: " + pensionCalc.varArr)
            console.log("adminArr: " + pensionCalc.adminArr)
            console.log("otherArr: " + pensionCalc.otherArr)
            console.log("totalArr: " + pensionCalc.totalArr)
            console.log("tenYearArr: " + pensionCalc.tenYearArr)
            console.log("longevityArr: " + pensionCalc.longevityArr)


            //                =SUM(H27:I28)+(SUM(H29:I29)*(1-C20))

            //            =(SUM(H27:I28)+SUM(K27:K28))+((SUM(H29:I29)+K29)*(1-C20))


            pensionCalc.outputStr += "pensionCalc.PBGCTotalCosts: " + pensionCalc.PBGCTotalCosts + "\r\n"
            pensionCalc.outputStr += "pensionCalc.varTotal: " + pensionCalc.varTotal + "\r\n"
            pensionCalc.outputStr += "pensionCalc.adminTotal: " + pensionCalc.adminTotal + "\r\n"
            pensionCalc.outputStr += "pensionCalc.otherTotal: " + pensionCalc.otherTotal + "\r\n"
            pensionCalc.outputStr += "pensionCalc.participantTotal: " + pensionCalc.participantTotal + "\r\n"
            pensionCalc.outputStr += "pensionCalc.tenYearTotal: " + pensionCalc.tenYearTotal + "\r\n"
            pensionCalc.outputStr += "pensionCalc.longevityTotal: " + pensionCalc.longevityTotal + "\r\n"
            pensionCalc.outputStr += "pboTotalwFee" + pensionCalc.pboTotalwFee + "\r\n"

            pensionCalc.outputStr += "PBGCArr: " + pensionCalc.PBGCArr + "\r\n"
            pensionCalc.outputStr += "varArr: " + pensionCalc.varArr + "\r\n"
            pensionCalc.outputStr += "adminArr: " + pensionCalc.adminArr + "\r\n"
            pensionCalc.outputStr += "otherArr: " + pensionCalc.otherArr + "\r\n"
            pensionCalc.outputStr += "totalArr: " + pensionCalc.totalArr + "\r\n"
            pensionCalc.outputStr += "tenYearArr: " + pensionCalc.tenYearArr + "\r\n"
            pensionCalc.outputStr += "longevityArr: " + pensionCalc.longevityArr + "\r\n"
        } else {
        }

    }

    function calcPBO() {

        console.log("--------------------PBO CALCS-----------------------")
        pensionCalc.outputStr += "--------------------PBO CALCS-----------------------" + "\r\n"
        //        alert(pboActives)

        pensionCalc.pboRetireesAfter = pensionCalc.pboRetirees - (pensionCalc.pboRetirees * pensionCalc.retireeTransferPercent)
        pensionCalc.assetsRetireesAfter = -pensionCalc.pboRetireesAfter * pensionCalc.BOIndex
        pensionCalc.assetsRetireesAfter2 = pensionCalc.pboRetirees + pensionCalc.assetsRetireesAfter

        //TODO: CO2
        //        pensionCalc.pboRetireesAddlCostsAfter = (pensionCalc.tenYearArr[0] + pensionCalc.tenYearArr[1] + pensionCalc.longevityArr[0] + pensionCalc.longevityArr[1]) + ((pensionCalc.tenYearArr[2] + pensionCalc.longevityArr[2])) * (1 - pensionCalc.retireeTransferPercent)
        //        //TODO: Ask why trunc, check following line
        //        pensionCalc.pboRetireesAddlCostsAfter = pensionCalc.pboRetireesAddlCostsAfter | 0

        //=(SUM(H27:I28)+SUM(K27:K28))+((SUM(H29:I29)+K29)*(1-C20))

        pensionCalc.pboRetireesAddlCostsAfter = ((pensionCalc.tenYearArr[0] + pensionCalc.tenYearArr[1] + pensionCalc.longevityArr[0] + pensionCalc.longevityArr[1]) + (pensionCalc.otherArr[0] + pensionCalc.otherArr[1])) +
            ((pensionCalc.tenYearArr[2] + pensionCalc.longevityArr[2]) + pensionCalc.otherArr[2]) * (1 - pensionCalc.retireeTransferPercent)


        pensionCalc.pboAssetsBeforePercent = pensionCalc.pboAssets / pensionCalc.pboTotalwFee;
        pensionCalc.pboAssetsBeforePercent = Math.round(pensionCalc.pboAssetsBeforePercent * 100) / 100;
        pensionCalc.pboAfterTotal = pensionCalc.pboActives + pensionCalc.pboVesteds + pensionCalc.pboRetireesAfter + pensionCalc.pboRetireesAddlCostsAfter
        pensionCalc.pboAssetsAfter = pensionCalc.pboAssets - pensionCalc.assetsRetireesAfter2;
        pensionCalc.pboAssetsAfterPercent = pensionCalc.pboAssetsAfter / pensionCalc.pboAfterTotal
        pensionCalc.pboAssetsAfterPercent = Math.round(pensionCalc.pboAssetsAfterPercent * 100) / 100;
        pensionCalc.pboVestedsAfter = pensionCalc.pboVesteds - pensionCalc.pboVesteds * pensionCalc.TVTransferPercent
        pensionCalc.pboAssetsVestedsAfter = -(pensionCalc.pboVesteds - pensionCalc.pboVestedsAfter) * pensionCalc.discountRate
        pensionCalc.pboAssetsVestedsAfter2 = pensionCalc.pboVesteds + pensionCalc.pboAssetsVestedsAfter


        //TODO: CO2
        //        pensionCalc.pboVestedsAddlCostsAfter = (pensionCalc.tenYearArr[0] + pensionCalc.tenYearArr[2] + pensionCalc.longevityArr[0] + pensionCalc.longevityArr[2]) + (pensionCalc.tenYearArr[1] + pensionCalc.longevityArr[1]) * (1 - pensionCalc.TVTransferPercent)

        //            =H27+I27+H29+I29+SUM(H28:I28)*(1-C21)

        //            =(((H27+I27+K27)+H29+K29)+I29)+((SUM(H28:I28)+K28)*(1-C21))
        pensionCalc.pboVestedsAddlCostsAfter = (((pensionCalc.tenYearArr[0] + pensionCalc.longevityArr[0] + pensionCalc.otherArr[0]) + pensionCalc.tenYearArr[2] + pensionCalc.otherArr[2] ) + pensionCalc.longevityArr[2] ) +
            ((pensionCalc.tenYearArr[1] + pensionCalc.longevityArr[1]) + pensionCalc.otherArr[1] ) * (1 - pensionCalc.TVTransferPercent)


        //TODO: needed? trunk?
        pensionCalc.pboVestedsAddlCostsAfter = Math.ceil(pensionCalc.pboVestedsAddlCostsAfter)
        pensionCalc.pboVestedAssetsAfterTotal = pensionCalc.pboActives + pensionCalc.pboVestedsAfter + pensionCalc.pboRetirees + pensionCalc.pboVestedsAddlCostsAfter
        pensionCalc.pboAssetsAfterTotal = pensionCalc.pboAssets - pensionCalc.pboAssetsVestedsAfter2
        pensionCalc.pboVestedFundedStatus = pensionCalc.pboAssetsAfterTotal / pensionCalc.pboVestedAssetsAfterTotal
        pensionCalc.pboVestedFundedStatus = Math.round(pensionCalc.pboVestedFundedStatus * 100) / 100;
        pensionCalc.pboFundedStatus = (pensionCalc.pboAssets / pensionCalc.pboTotal).toFixed(2);


        //REDOING SCENARIO MOD, keeping original but renaming more logically
        pensionCalc.pboActivesPA = pensionCalc.pboActives;
        pensionCalc.pboVestedsPA = pensionCalc.pboVesteds;
        pensionCalc.pboRetireesPA = pensionCalc.pboRetireesAfter;
        //            pensionCalc.pboRetireesPA = -(pensionCalc.pboRetirees - pensionCalc.pboRetirees*pensionCalc.retireeTransferPercent) * pensionCalc.BOIndex
        pensionCalc.pboAddlCostPA = pensionCalc.pboRetireesAddlCostsAfter;
        //        alert(pensionCalc.pboAddlCostPA)

        pensionCalc.pboTotalwFeePA = pensionCalc.pboAfterTotal;
        //            var z = -(pensionCalc.pboRetirees - pensionCalc.pboRetireesPA)*pensionCalc.BOIndex
        //            console.log(z)
        pensionCalc.pboAssetsPA = pensionCalc.pboAssets + (-((pensionCalc.pboRetirees - pensionCalc.pboRetireesPA) * pensionCalc.BOIndex));


        pensionCalc.pboActivesTV = pensionCalc.pboActives;
        pensionCalc.pboVestedsTV = pensionCalc.pboVestedsAfter;
        pensionCalc.pboRetireesTV = pensionCalc.pboRetirees;
        pensionCalc.pboAddlCostTV = pensionCalc.pboVestedsAddlCostsAfter;
        //        alert(pensionCalc.pboAddlCostTV)
        pensionCalc.pboTotalwFeeTV = pensionCalc.pboVestedAssetsAfterTotal;
        pensionCalc.pboAssetsTV = pensionCalc.pboAssets + pensionCalc.pboAssetsVestedsAfter;


        pensionCalc.pboActivesB = pensionCalc.pboActives;
        var c82 = pensionCalc.pboVesteds - (pensionCalc.pboVesteds * pensionCalc.TVTransferPercent)
        var d82 = -(pensionCalc.pboVesteds - c82) * pensionCalc.discountRate
        pensionCalc.pboVestedsB = pensionCalc.pboVesteds + d82

        var c84 = pensionCalc.pboRetirees - (pensionCalc.pboRetirees * pensionCalc.retireeTransferPercent)
        var d84 = -(pensionCalc.pboRetirees - c84) * pensionCalc.BOIndex
        pensionCalc.pboRetireesB = pensionCalc.pboRetirees + d84;

        //        =(H27+I27)+((H28+I28)*(1-C76))+((H29+I29)*(1-C79))
        //        =((H27+I27+K27)+((H28+I28+K28)*(1-C76)))+((H29+I29+K29)*(1-C79))
        //        pensionCalc.pboAddlCostB = (pensionCalc.tenYearArr[0] + pensionCalc.longevityArr[0]) +
        //            ((pensionCalc.tenYearArr[1] + pensionCalc.longevityArr[1]) * (1 - pensionCalc.TVTransferPercent)) +
        //            ((pensionCalc.tenYearArr[2] + pensionCalc.longevityArr[2]) * (1 - pensionCalc.retireeTransferPercent));

        //TODO: CO2
        pensionCalc.pboAddlCostB = (pensionCalc.tenYearArr[0] + pensionCalc.longevityArr[0] + pensionCalc.otherArr[0]) +
            ((pensionCalc.tenYearArr[1] + pensionCalc.longevityArr[1] + pensionCalc.otherArr[1]) * (1 - pensionCalc.TVTransferPercent)) +
            ((pensionCalc.tenYearArr[2] + pensionCalc.longevityArr[2] + pensionCalc.otherArr[2]) * (1 - pensionCalc.retireeTransferPercent));
        pensionCalc.pboTotalwFeeB = c82 + c84 + pensionCalc.pboActivesB + pensionCalc.pboAddlCostB;
        pensionCalc.pboAssetsB = pensionCalc.pboAssets + d82 + d84;

        //        console.log(c82 + " -- " + d82 + " -- " + pensionCalc.pboVestedsB + " -- " + c84 + " -- " + d84 + " -- " + pensionCalc.pboRetireesB + " -- " + pensionCalc.pboAddlCostB + " -- " + pensionCalc.pboTotalwFeeB)
        console.log("d82: " + d82 + " d84: " + d84 + " c82: " + c82 + " c84: " + c84)


        //TODO: Most likely this is where the issues are
        //ignoring the rest, calc what i need
        pensionCalc.activesPBGCAfterTV = pensionCalc.activesPBGCAfterB = pensionCalc.activesPBGCAfterPA = pensionCalc.activesPBGCBefore = pensionCalc.activesPBGCAfter = Math.round(pensionCalc.participantActives * pensionCalc.PBGC);
        pensionCalc.activesAdminAfterTV = pensionCalc.activesAdminAfterPA = pensionCalc.activesAdminAfterB = pensionCalc.activesAdminBefore = pensionCalc.activesAdminAfter = Math.round(pensionCalc.participantActives * pensionCalc.adminCostsArr[0]);
        pensionCalc.vestedsPBGCBefore = Math.round(pensionCalc.participantTerm * pensionCalc.PBGC);
        pensionCalc.vestedsAdminBefore = Math.round(pensionCalc.participantTerm * pensionCalc.adminCostsArr[1]);

        pensionCalc.vestedsPBGCAfter = (pensionCalc.participantTerm * (1 - pensionCalc.TVTransferPercent)) * pensionCalc.PBGC
        pensionCalc.vestedsAdminAfter = (pensionCalc.participantTerm * (1 - pensionCalc.TVTransferPercent) * pensionCalc.adminCostsArr[1])

        pensionCalc.retireesPBGCAfter = Math.round(pensionCalc.participantRetirees * (1 - pensionCalc.retireeTransferPercent) * pensionCalc.PBGC);
        pensionCalc.retireesAdminAfter = Math.round(pensionCalc.participantRetirees * (1 - pensionCalc.retireeTransferPercent) * pensionCalc.adminCostsArr[2]);


        //        alert(pensionCalc.retireesPBGCAfter + "--" + pensionCalc.retireesAdminAfter)
        pensionCalc.retireesSemiTotal = pensionCalc.retireesPBGCAfter + pensionCalc.retireesAdminAfter
        pensionCalc.retireesPBGCBefore = pensionCalc.PBGC * pensionCalc.participantRetirees
        pensionCalc.retireesAdminBefore = pensionCalc.adminCostsArr[2] * pensionCalc.participantRetirees

        //totals after
        pensionCalc.PBGCTotalBefore = pensionCalc.activesPBGCBefore + pensionCalc.vestedsPBGCBefore + pensionCalc.retireesPBGCBefore
        pensionCalc.adminTotalBefore = pensionCalc.activesAdminBefore + pensionCalc.vestedsAdminBefore + pensionCalc.retireesAdminBefore
        pensionCalc.totalTotalBefore = pensionCalc.PBGCTotalBefore + pensionCalc.adminTotalBefore

        //totals after
        pensionCalc.PBGCTotalAfter = pensionCalc.activesPBGCAfter + pensionCalc.vestedsPBGCAfter + pensionCalc.retireesPBGCAfter
        pensionCalc.adminTotalAfter = pensionCalc.activesAdminAfter + pensionCalc.vestedsAdminAfter + pensionCalc.retireesAdminAfter
        pensionCalc.totalTotalAfter = pensionCalc.PBGCTotalAfter + pensionCalc.adminTotalAfter;

        pensionCalc.activesLong = pensionCalc.pboActives * pensionCalc.longRateArr[0]
        pensionCalc.vestedsLong = pensionCalc.pboVesteds * pensionCalc.longRateArr[1]
        pensionCalc.retireesLong = pensionCalc.pboRetirees * pensionCalc.longRateArr[2]
        pensionCalc.retireesLongA = pensionCalc.pboRetirees * (1 - pensionCalc.retireeTransferPercent) * pensionCalc.longRateArr[2]

        pensionCalc.activesOther = pensionCalc.activesOtherA = pensionCalc.pboActives * pensionCalc.otherCostsArr[0]
        pensionCalc.vestedsOther = pensionCalc.vestedsOtherA = pensionCalc.pboVesteds * pensionCalc.otherCostsArr[1]
        pensionCalc.retireesOther = pensionCalc.pboRetirees * pensionCalc.otherCostsArr[2]
        pensionCalc.retireesOtherA = pensionCalc.pboRetirees * (1 - pensionCalc.retireeTransferPercent) * pensionCalc.otherCostsArr[2]


        //todo: this is new stuff comment out if guess is wrong - check both scneario
        pensionCalc.vestedsPBGCAfterB = pensionCalc.vestedsPBGCAfterTV = (pensionCalc.participantTerm * (1 - pensionCalc.TVTransferPercent)) * pensionCalc.PBGC;
        pensionCalc.vestedsAdminAfterB = pensionCalc.vestedsAdminAfterTV = (pensionCalc.participantTerm * (1 - pensionCalc.TVTransferPercent) * pensionCalc.adminCostsArr[1]);

        pensionCalc.retireesPBGCAfterTV = Math.round(pensionCalc.participantRetirees * pensionCalc.PBGC)
        pensionCalc.retireesAdminAfterTV = Math.round(pensionCalc.participantRetirees * pensionCalc.adminCostsArr[2])

        pensionCalc.PBGCTotalAfterTV = pensionCalc.activesPBGCAfterTV + pensionCalc.vestedsPBGCAfterTV + pensionCalc.retireesPBGCAfterTV;
        pensionCalc.adminTotalAfterTV = pensionCalc.activesAdminAfterTV + pensionCalc.vestedsAdminAfterTV + pensionCalc.retireesAdminAfterTV;
        pensionCalc.totalTotalAfterTV = pensionCalc.PBGCTotalAfterTV + pensionCalc.adminTotalAfterTV;


        //PA
        pensionCalc.vestedsPBGCAfterPA = pensionCalc.pboActives;
        pensionCalc.vestedsAdminAfterPA = pensionCalc.pboVestedsAfter;

        pensionCalc.retireesPBGCAfterB = pensionCalc.retireesPBGCAfterPA = Math.round(pensionCalc.participantRetirees * (1 - pensionCalc.retireeTransferPercent) * pensionCalc.PBGC)
        pensionCalc.retireesAdminAfterB = pensionCalc.retireesAdminAfterPA = Math.round(pensionCalc.participantRetirees * (1 - pensionCalc.retireeTransferPercent) * pensionCalc.adminCostsArr[2])

        pensionCalc.PBGCTotalAfterPA = pensionCalc.activesPBGCAfterPA + pensionCalc.vestedsPBGCAfterPA + pensionCalc.retireesPBGCAfterPA;
        pensionCalc.adminTotalAfterPA = pensionCalc.activesAdminAfterPA + pensionCalc.vestedsAdminAfterPA + pensionCalc.retireesAdminAfterPA;
        pensionCalc.totalTotalAfterPA = pensionCalc.PBGCTotalAfterPA + pensionCalc.adminTotalAfterPA;

        //B - see above
        pensionCalc.PBGCTotalAfterB = pensionCalc.activesPBGCAfterB + pensionCalc.vestedsPBGCAfterB + pensionCalc.retireesPBGCAfterB;
        pensionCalc.adminTotalAfterB = pensionCalc.activesAdminAfterB + pensionCalc.vestedsAdminAfterB + pensionCalc.retireesAdminAfterB;
        pensionCalc.totalTotalAfterB = pensionCalc.PBGCTotalAfterB + pensionCalc.adminTotalAfterB;


        if (verbose) {
            console.log("---------- GRAPH NUMBERS ARE AS FOLLOWS [PA] : ------------")
            console.log("pensionCalc.pboActivesPA: " + pensionCalc.pboActivesPA)
            console.log("pensionCalc.pboVestedsPA: " + pensionCalc.pboVestedsPA)
            console.log("pensionCalc.pboRetireesPA: " + pensionCalc.pboRetireesPA)
            console.log("pensionCalc.pboAddlCostPA: " + pensionCalc.pboAddlCostPA)
            console.log("pensionCalc.pboTotalwFeePA: " + pensionCalc.pboTotalwFeePA)
            console.log("pensionCalc.pboAssetsPA: " + pensionCalc.pboAssetsPA)
            console.log("--------------END PA ----------------------------")

            console.log("---------- GRAPH NUMBERS ARE AS FOLLOWS [TV] : ------------")
            console.log("pensionCalc.pboActivesTV: " + pensionCalc.pboActivesTV)
            console.log("pensionCalc.pboVestedsTV: " + pensionCalc.pboVestedsTV)
            console.log("pensionCalc.pboRetireesTV: " + pensionCalc.pboRetireesTV)
            console.log("pensionCalc.pboAddlCostTV: " + pensionCalc.pboAddlCostTV)
            console.log("pensionCalc.pboTotalwFeeTV: " + pensionCalc.pboTotalwFeeTV)
            console.log("pensionCalc.pboAssetsTV: " + pensionCalc.pboAssetsTV)
            console.log("--------------END TV ----------------------------")

            console.log("---------- GRAPH NUMBERS ARE AS FOLLOWS [B] : ------------")
            console.log("pensionCalc.pboActivesB: " + pensionCalc.pboActivesB)
            console.log("pensionCalc.pboVestedsB: " + pensionCalc.pboVestedsB)
            console.log("pensionCalc.pboRetireesB: " + pensionCalc.pboRetireesB)
            console.log("pensionCalc.pboAddlCostB: " + pensionCalc.pboAddlCostB)
            console.log("pensionCalc.pboTotalwFeeB: " + pensionCalc.pboTotalwFeeB)
            console.log("pensionCalc.pboAssetsB: " + pensionCalc.pboAssetsB)
            console.log("--------------END B ----------------------------")


            console.log("pensionCalc.activesAdminAfter" + pensionCalc.activesAdminAfter)
            console.log("pensionCalc.vestedsAdminAfter: " + pensionCalc.vestedsAdminAfter)
            console.log("pensionCalc.retireesAdminAfter" + pensionCalc.retireesAdminAfter)
            console.log("----------------------")

            console.log("pensionCalc.activesPBGCAfter: " + pensionCalc.activesPBGCAfter)
            console.log("pensionCalc.vestedsPBGCAfter: " + pensionCalc.vestedsPBGCAfter)
            console.log("pensionCalc.retireesPBGCAfter: " + pensionCalc.retireesPBGCAfter)
            console.log("----------------------")

            console.log("pensionCalc.PBGCTotalAfter" + pensionCalc.PBGCTotalAfter)
            console.log("pensionCalc.adminTotalAfter" + pensionCalc.adminTotalAfter)
            console.log("pensionCalc.retireesPBGCAfter: " + pensionCalc.totalTotalAfter)
            console.log("----------------------")

            console.log("pensionCalc.PBGCTotalBefore" + pensionCalc.PBGCTotalBefore)
            console.log("pensionCalc.adminTotalBefore" + pensionCalc.adminTotalBefore)
            console.log("pensionCalc.totalTotalBefore" + pensionCalc.totalTotalBefore)
            console.log("----------------------")


            console.log("pboAfterTotal: " + pensionCalc.pboAfterTotal)
            console.log("pboAssetsAfter: " + pensionCalc.pboAssetsAfter)
            console.log("pboAssetsAfterPercent: " + pensionCalc.pboAssetsAfterPercent)
            console.log("pboVestedsAfter: " + pensionCalc.pboVestedsAfter)
            console.log("pboAssetsVestedsAfter: " + pensionCalc.pboAssetsVestedsAfter)
            console.log("pboAssetsVestedsAfter2: " + pensionCalc.pboAssetsVestedsAfter2)
            console.log("pboVestedsAddlCostsAfter: " + pensionCalc.pboVestedsAddlCostsAfter)
            console.log("pboVestedAssetsAfterTotal: " + pensionCalc.pboVestedAssetsAfterTotal)
            console.log("pboAssetsAfterTotal: " + pensionCalc.pboAssetsAfterTotal)
            console.log("pboVestedFundedStatus: " + pensionCalc.pboVestedFundedStatus)
            console.log("pboFundedStatus: " + pensionCalc.pboFundedStatus)
        } else {
        }
        //        pensionCalc.outputStr += "pboRetireesAfter: " + pboRetireesAfter + "\r\n"
        //        pensionCalc.outputStr += "assetsRetireesAfter: " + assetsRetireesAfter + "\r\n"
        //        pensionCalc.outputStr += "assetsRetireesAfter2: " + assetsRetireesAfter2 + "\r\n"
        //        pensionCalc.outputStr += "pboRetireesAddlCostsAfter: " + pboRetireesAddlCostsAfter + "\r\n"
        //        pensionCalc.outputStr += "pboAssetsBeforePercent: " + pboAssetsBeforePercent + "\r\n"
        //        pensionCalc.outputStr += "pboAfterTotal: " + pboAfterTotal + "\r\n"
        //        pensionCalc.outputStr += "pboAssetsAfter: " + pboAssetsAfter + "\r\n"
        //        pensionCalc.outputStr += "pboAssetsAfterPercent: " + pboAssetsAfterPercent + "\r\n"
        //        pensionCalc.outputStr += "pboVestedsAfter: " + pboVestedsAfter + "\r\n"
        //        pensionCalc.outputStr += "pboAssetsVestedsAfter: " + pboAssetsVestedsAfter + "\r\n"
        //        pensionCalc.outputStr += "pboAssetsVestedsAfter2: " + pboAssetsVestedsAfter2 + "\r\n"
        //        pensionCalc.outputStr += "pboVestedsAddlCostsAfter: " + pboVestedsAddlCostsAfter + "\r\n"
        //        pensionCalc.outputStr += "pboVestedAssetsAfterTotal: " + pboVestedAssetsAfterTotal + "\r\n"
        //        pensionCalc.outputStr += "pboAssetsAfterTotal: " + pboAssetsAfterTotal + "\r\n"
        //        pensionCalc.outputStr += "pboVestedFundedStatus: " + pboVestedFundedStatus + "\r\n"


        console.log("--------------------END PBO CALCS-----------------------")
        borg.setText("output", pensionCalc.outputStr);


    }

    pensionCalc.calcAllCosts = function (gotInputs, fromScenario, fromAdv) {
        console.log("calcAllCosts -- gotinputs; " + gotInputs + "fromScenario; " + fromScenario)

        if (fromScenario && Object.keys(pensionCalc.beforeObj).length == 0) {

            console.log('storing beforeObj in calcallCOsts')
            pensionCalc.beforeObj['PBGCTotalCosts'] = pensionCalc.PBGCTotalCosts
            pensionCalc.beforeObj['adminTotal'] = pensionCalc.adminTotal
            pensionCalc.beforeObj['participantTotal'] = pensionCalc.participantTotal
        } else {
        }

        if (verbose) {
            console.log("pensionCalc.adminTotal: " + pensionCalc.PBGC)
            console.log("pensionCalc.adminCostsArr: " + JSON.stringify(pensionCalc.adminCostsArr))
            console.log("pensionCalc.longRateArr: " + JSON.stringify(pensionCalc.longRateArr))
        } else {

        }


        pensionCalc.pboTotal = pensionCalc.pboActives + pensionCalc.pboVesteds + pensionCalc.pboRetirees;
        pensionCalc.pboDeficit = pensionCalc.pboTotal - pensionCalc.pboAssets;
        pensionCalc.pboTotalwFee = pensionCalc.pboTotal + (pensionCalc.tenYearTotal + pensionCalc.longevityTotal);
        pensionCalc.firstInArr = [pensionCalc.pboActives, pensionCalc.pboVesteds, pensionCalc.pboRetirees, pensionCalc.pboAssets]

        pensionCalc.participantTotal = pensionCalc.participantActives + pensionCalc.participantTerm + pensionCalc.participantRetirees;
        pensionCalc.secondInArr = [pensionCalc.participantActives, pensionCalc.participantTerm, pensionCalc.participantRetirees]

        if (gotInputs) {
            calcPBGC();
            calcPBO();
            if (fromAdv) {
                console.log('storing beforeObj in calcallCOsts because of adv')
                pensionCalc.beforeObj['PBGCTotalCosts'] = pensionCalc.PBGCTotalCosts
                pensionCalc.beforeObj['adminTotal'] = pensionCalc.adminTotal
                pensionCalc.beforeObj['participantTotal'] = pensionCalc.participantTotal
            } else {
            }

        } else {
            console.log('odd else calcAllCostss')
            //todo: fix
            calcPBGC();
            calcPBO();
            if (fromAdv) {
                console.log('storing beforeObj in calcallCOsts because of adv')
                pensionCalc.beforeObj['PBGCTotalCosts'] = pensionCalc.PBGCTotalCosts
                pensionCalc.beforeObj['adminTotal'] = pensionCalc.adminTotal
                pensionCalc.beforeObj['participantTotal'] = pensionCalc.participantTotal
            } else {
            }

        }
    }

    pensionCalc.beforeObj = {}
    ELast = '-1';
    RALast = '-1';
    RELast = '-1';
    var movedUpAlready = false;
    //need to submit participant info before using scenario modeller
    //TODO: use this to gray out buttons
    pensionCalc.submittedParticipants = false;

    //aux functions
    pensionCalc.set = function (name, field) {
        this[name] = field
    }
    pensionCalc.keyboardInit = function () {
        //TODO: comment back in and fix toggle actions

        if (onInputPage) {
            performAction([
                {
                    "action": "#spawn",
                    "data": {
                        "overlayId": "dollarToggle3",
                        "x": "469px",
                        "y": "267px"
                    }
                },
                {
                    "action": "#spawn",
                    "data": {
                        "overlayId": "percentToggle3",
                        "x": "572px",
                        "y": "267px"
                    }
                }
            ])
            if (pensionCalc.pboInDollars) {
                moreBorg.toggle('dollarToggle3', 'on');
                borg.runAction(
                    {
                        "action": "#spawn",
                        "data": {
                            "overlayId": "submitMagicButton",
                            "x": "490px",
                            "y": "497px"
                        }
                    })

            } else {
                moreBorg.toggle('percentToggle3', 'on');
                borg.runAction(
                    {
                        "action": "#spawn",
                        "data": {
                            "overlayId": "submitMagicButton",
                            "x": "490px",
                            "y": "568px"
                        }
                    })

            }
            //            alert('zz')
        } else {

        }
    }
    pensionCalc.keyboardClose = function () {

        if (onInputPage) {
            firstToggle = true;
            performAction([
                {
                    "action": "close",
                    "targets": ["percentToggle3", "dollarToggle3"]
                }
            ])

        } else {

        }
    }
    pensionCalc.getPBOInputs = function () {
        //        console.log(JSON.stringify(pensionCalc))
        console.log("getPBOinputs" + JSON.stringify(pensionCalc.inputs))

        borg.setText('output', '');

        //error checking on first input page
        if (pensionCalc.pboInDollars) {

            //TODO: This is fix for mercer ticket 66
            //            if ((pensionCalc.inputs["pboActives"] && pensionCalc.inputs["pboVesteds"] && pensionCalc.inputs["pboRetirees"] && pensionCalc.inputs["pboAssets"]) && jQuery.isEmptyObject(percentObj)) {
            if ((pensionCalc.inputs.hasOwnProperty("pboActives") && pensionCalc.inputs.hasOwnProperty("pboVesteds") && pensionCalc.inputs.hasOwnProperty("pboRetirees") && pensionCalc.inputs.hasOwnProperty("pboAssets")) && jQuery.isEmptyObject(percentObj)) {
                //                    if (JSON.stringify(pensionCalc.inputs["pboActives"]) =="''" || JSON.stringify(pensionCalc.inputs["pboVesteds"])=="''" || JSON.stringify(pensionCalc.inputs["pboRetirees"]) == "''") {


                if (pensionCalc.inputs["pboActives"] == "0" || pensionCalc.inputs["pboVesteds"] == "0" || pensionCalc.inputs["pboRetirees"] == "0") {

                    if (isNaN(Number(pensionCalc.inputs["pboActives"])) || isNaN(Number(pensionCalc.inputs["pboVesteds"])) || isNaN(Number(pensionCalc.inputs["pboRetirees"]))) {

                        //                            console.log("111 --- "+JSON.stringify(pensionCalc.inputs) )
                        borg.runAction({
                            action: "gotoURLAction",
                            trigger: "now",
                            target: "#systemPage",
                            data: {
                                failureTitle: "Input Error",
                                failureMessage: "Enter All Fields",
                                url: "alert://localhost/"
                            }
                        });
                        return false;
                    }


                } else {
                    //deleted one or more pbo cell
                    //                        console.log("222 --- "+JSON.stringify(pensionCalc.inputs) )
                    if (pensionCalc.inputs["pboActives"] == "" || pensionCalc.inputs["pboVesteds"] == "" || pensionCalc.inputs["pboRetirees"] == "") {
                        borg.runAction({
                            action: "gotoURLAction",
                            trigger: "now",
                            target: "#systemPage",
                            data: {
                                failureTitle: "Input Error",
                                failureMessage: "Enter All Fields",
                                url: "alert://localhost/"
                            }
                        });
                        return false;
                    }
                }

                //TODO: adding new error messaging per jennee
                if (Number(pensionCalc.inputs["pboActives"]) + Number(pensionCalc.inputs["pboVesteds"]) + Number(pensionCalc.inputs["pboRetirees"]) <= 0) {
                    borg.runAction({
                        action: "gotoURLAction",
                        trigger: "now",
                        target: "#systemPage",
                        data: {
                            failureTitle: "Input Error",
                            failureMessage: "Total PBO Must Exceed 0",
                            url: "alert://localhost/"
                        }
                    });
                    return false;
                }
                if (Number(pensionCalc.inputs["pboAssets"]) <= 0) {
                    borg.runAction({
                        action: "gotoURLAction",
                        trigger: "now",
                        target: "#systemPage",
                        data: {
                            failureTitle: "Input Error",
                            failureMessage: "Assets Must Exceed 0",
                            url: "alert://localhost/"
                        }
                    });
                    return false;
                }

            }
            else if (!dollarObj["pboActives"] || !dollarObj["pboVesteds"] || !dollarObj["pboRetirees"] || !dollarObj["pboAssets"]) {
                console.log("333 --- " + JSON.stringify(pensionCalc.inputs))
                borg.runAction({
                    action: "gotoURLAction",
                    trigger: "now",
                    target: "#systemPage",
                    data: {
                        failureTitle: "Input Error",
                        failureMessage: "Enter All Fields",
                        url: "alert://localhost/"
                    }
                });
                return false;

            }
            else if (!jQuery.isEmptyObject(percentObj)) {
                //toggled and input fields without submitting so clear out garbage

                console.log("after dude1p " + JSON.stringify(percentObj))
                for (var i in percentObj) {
                    pensionCalc.inputs[i] = unChangedInputs[i]
                    inputObj[i] = unChangedInputs[i]
                    delete percentObj[i]
                }
                for (var i in dollarObj) {
                    pensionCalc.inputs[i] = dollarObj[i]
                }
                console.log("after dude " + JSON.stringify(pensionCalc.inputs))
            }

            else {
                console.log("444 --- " + JSON.stringify(pensionCalc.inputs))
                borg.runAction({
                    action: "gotoURLAction",
                    trigger: "now",
                    target: "#systemPage",
                    data: {
                        failureTitle: "Input Error",
                        failureMessage: "Enter All Fields",
                        url: "alert://localhost/"
                    }
                });
                return false;
            }
            for (var i in pensionCalc.inputs) {
                pensionCalc.set(i, Number(pensionCalc.inputs[i]))
            }
            console.log("set inputs in pboindallors pboinputs" + JSON.stringify(pensionCalc.inputs))
            pensionCalc.firstInArr = [pensionCalc.pboActives, pensionCalc.pboVesteds, pensionCalc.pboRetirees, pensionCalc.pboAssets]
            lastWorking = true
            didSubmit = true
            return true;

        } else {
            pensionCalc.pboTotalWorth = (pensionCalc.inputs['pboTotalWorth']) ? pensionCalc.inputs['pboTotalWorth'] : -1;


            console.log("validating percent - percentObj " + JSON.stringify(percentObj))
            //                for (var i in pensionCalc.inputs) {
            //                    pensionCalc.set(i, Number(pensionCalc.inputs[i]))
            //                }
            for (var i in percentObj) {
                pensionCalc.set(i, Number(percentObj[i]))
                pensionCalc.inputs[i] = percentObj[i]
            }

            console.log("PERCENT: inputs after setting" + JSON.stringify(pensionCalc.inputs))
            //not all have been entered
            if (!percentObj["pboActives"] || !percentObj["pboVesteds"] || !percentObj["pboRetirees"] || !percentObj["pboAssets"] || !percentObj["pboTotalWorth"]) {
                //                    alert('enter all fields')

                var errMsg = (!percentObj["pboTotalWorth"] && (percentObj["pboActives"] && percentObj["pboVesteds"] && percentObj["pboRetirees"] && percentObj["pboAssets"] )) ? "Enter Total Amount" : "Enter All Fields"
                //                alert('zzzz')
                borg.runAction({
                    action: "gotoURLAction",
                    trigger: "now",
                    target: "#systemPage",
                    data: {
                        failureTitle: "Input Error",
                        failureMessage: errMsg,
                        url: "alert://localhost/"
                    }
                });


                return false;
            }

            else if ((Number(percentObj.pboActives) > 100 || Number(percentObj.pboVesteds) > 100 || Number(percentObj.pboRetirees) > 100) || (Number(Number(percentObj.pboActives) + Number(percentObj.pboVesteds) + Number(percentObj.pboRetirees) > 100))) {
                //alert('Cannot have percentage over 100')
                borg.runAction({
                    action: "gotoURLAction",
                    trigger: "now",
                    target: "#systemPage",
                    data: {
                        failureTitle: "Input Error",
                        failureMessage: "Cannot Have Percentage Over 100",
                        url: "alert://localhost/"
                    }
                });
                return false;

            }

            else if (Number(Number(percentObj.pboActives) + Number(percentObj.pboVesteds) + Number(percentObj.pboRetirees) != 100)) {
                //                    alert('Enter percentages that add up to 100')
                borg.runAction({
                    action: "gotoURLAction",
                    trigger: "now",
                    target: "#systemPage",
                    data: {
                        failureTitle: "Input Error",
                        failureMessage: "Enter Percentage Values for Actives, Terminated Vesteds and Retirees That Add Up to 100",
                        url: "alert://localhost/"
                    }
                });
                return false;
            }

            //entered zero for total value
            else if (percentObj.pboTotalWorth == 0) {
                //                    alert('Enter percentages that add up to 100')
                borg.runAction({
                    action: "gotoURLAction",
                    trigger: "now",
                    target: "#systemPage",
                    data: {
                        failureTitle: "Input Error",
                        failureMessage: "Total Amount Must Exceed 0",
                        url: "alert://localhost/"
                    }
                });
                return false;
            }

            //TODO: adding new error messaging per jennee
            else if (Number(percentObj["pboAssets"]) <= 0) {
                borg.runAction({
                    action: "gotoURLAction",
                    trigger: "now",
                    target: "#systemPage",
                    data: {
                        failureTitle: "Input Error",
                        failureMessage: "Assets Must Exceed 0",
                        url: "alert://localhost/"
                    }
                });
                return false;

            }

            //working at this point
            else {
                console.log("TOP INPUTS ARE" + JSON.stringify(pensionCalc.inputs))
                console.log("TOP UNCHANGED INPUTS ARE" + JSON.stringify(unChangedInputs))
                for (var i in pensionCalc.inputs) {
                    if (String(i) == "pboAssets" || String(i) == "pboTotalWorth" || String(i) == "participantActives" || String(i) == "participantTerm" || String(i) == "participantRetirees") {
                        pensionCalc.set(i, Number((pensionCalc.inputs[i])))
                    } else {
                        pensionCalc.set(i, Math.round(Number((pensionCalc.inputs[i] * .01) * this.pboTotalWorth)))
                        pensionCalc.inputs[i] = Math.round(Number((pensionCalc.inputs[i] * .01) * this.pboTotalWorth))
                    }
                }

                console.log("SET PERCENTAGES INPUTS ARE " + JSON.stringify(pensionCalc.inputs))
                //                    lastPercentInputs = pensionCalc.inputs;
                didSubmit = true
                lastWorking = false
                return true;
            }


        }
    }
    pensionCalc.getPartInputs = function () {
        //            console.log("getPartInputs" + JSON.stringify(pensionCalc))
        console.log("getPartInputs" + JSON.stringify(pensionCalc.inputs2))

        borg.setText('output', '');

        //        alert("getPart " + JSON.stringify(pensionCalc.inputs))

        if (!pensionCalc.inputs.hasOwnProperty("participantActives") || !pensionCalc.inputs.hasOwnProperty("participantTerm") || !pensionCalc.inputs.hasOwnProperty("participantRetirees")) {
            //TODO: COmment back , change to return false
            borg.runAction({
                action: "gotoURLAction",
                trigger: "now",
                target: "#systemPage",
                data: {
                    failureTitle: "Input Error",
                    failureMessage: "Enter All Participant Fields",
                    url: "alert://localhost/"
                }
            });
            performAction([
                {
                    "action": "close",
                    "delay": 1.0,
                    "targets": ["optionsContBlocker"]
                }
            ]);
            return false;
        } else {
        }
        //TODO: added for ticket 53

        if (pensionCalc.inputs["participantActives"] == "" || pensionCalc.inputs["participantTerm"] == "" || pensionCalc.inputs["participantRetirees"] == "") {
            //TODO: COmment back , change to return false

            if (!$.isNumeric((pensionCalc.inputs["participantActives"])) || !$.isNumeric(pensionCalc.inputs["participantTerm"]) || !$.isNumeric(pensionCalc.inputs["participantRetirees"])) {

                borg.runAction({
                    action: "gotoURLAction",
                    trigger: "now",
                    target: "#systemPage",
                    data: {
                        failureTitle: "Input Error",
                        failureMessage: "Enter All Participant Fields",
                        url: "alert://localhost/"
                    }
                });
                performAction([
                    {
                        "action": "close",
                        "delay": 1.0,
                        "targets": ["optionsContBlocker"]
                    }
                ]);
                return false;

            } else {

            }
        }
        //TODO: added for ticket 65
        if (pensionCalc.inputs["participantActives"] == -1 || pensionCalc.inputs["participantTerm"] == -1 || pensionCalc.inputs["participantRetirees"] == -1) {
            //TODO: COmment back , change to return false
            borg.runAction({
                action: "gotoURLAction",
                trigger: "now",
                target: "#systemPage",
                data: {
                    failureTitle: "Input Error",
                    failureMessage: "Enter All Participant Fields",
                    url: "alert://localhost/"
                }
            });
            performAction([
                {
                    "action": "close",
                    "delay": 1.0,
                    "targets": ["optionsContBlocker"]
                }
            ]);
            return false;
        }
        for (var i in pensionCalc.inputs) {
            pensionCalc.set(i, Number(pensionCalc.inputs[i]))
        }
        console.log("set inputs in getpartinputs" + JSON.stringify(pensionCalc.inputs))
        pensionCalc.secondInArr = [pensionCalc.participantActives, pensionCalc.participantTerm, pensionCalc.participantRetirees]

        return true;

    }
    pensionCalc.getAdvInputs = function () {

        //        console.log("getAdvInputs" + JSON.stringify(pensionCalc))
        console.log("advbefore : " + JSON.stringify(pensionCalc.inputs2))

        pensionCalc.PBGC = (pensionCalc.inputs2['PBGC']) ? Number(pensionCalc.inputs2['PBGC']) : 50;

        pensionCalc.adminCostsArr[0] = (pensionCalc.inputs2['activesCosts']) ? Number(pensionCalc.inputs2['activesCosts']) : 30;
        pensionCalc.adminCostsArr[1] = (pensionCalc.inputs2['vestedsCosts']) ? Number(pensionCalc.inputs2['vestedsCosts']) : 30;
        pensionCalc.adminCostsArr[2] = (pensionCalc.inputs2['retireesCosts']) ? Number(pensionCalc.inputs2['retireesCosts']) : 30;

        pensionCalc.longRateArr[0] = (pensionCalc.inputs2['activesLongRate']) ? 0.01 * Number(pensionCalc.inputs2['activesLongRate']) : 0.025;
        pensionCalc.longRateArr[1] = (pensionCalc.inputs2['vestedsLongRate']) ? 0.01 * Number(pensionCalc.inputs2['vestedsLongRate']) : 0.025;
        pensionCalc.longRateArr[2] = (pensionCalc.inputs2['retireesLongRate']) ? 0.01 * Number(pensionCalc.inputs2['retireesLongRate']) : 0.025;

        pensionCalc.firstInArr = [pensionCalc.pboActives, pensionCalc.pboVesteds, pensionCalc.pboRetirees, pensionCalc.pboAssets]
        pensionCalc.secondInArr = [pensionCalc.participantActives, pensionCalc.participantTerm, pensionCalc.participantRetirees]

        console.log("advafter : " + JSON.stringify(pensionCalc.inputs2))

        return true;

    }

    //toggling and nav based functions
    pensionCalc.toggleLast = function () {

        //open last tab
        console.log("toggleLast: " + lastButton)
        //        alert(lastButton)
        if (lastButton != "-1") {
            borg.runAction({
                "action": "toggleButtonOn",
                "target": lastButton
            });
        }

    }
    pensionCalc.toggleNav = function (inBtn) {
        //        alert(JSON.stringify(pensionCalc.inputs))
        performAction([
            {
                "action": "#spawn",
                "data": {
                    "overlayId": "optionsContBlocker"
                }
            },
            {
                "action": "close",
                "delay": 1.0,
                "targets": ["optionsContBlocker"]
            }
        ]);
        //open last tab
        console.log("toggleNav: " + lastNavButton + "!!!!ZZ!!!" + didSubmit + "!!!!ZZ!!!" + inBtn)

        //
        if (lastNavButton == inBtn && !movedUpAlready) {
            var contName = inBtn.substr(0, inBtn.indexOf('Btn')) + "Cont"
            //            alert(contName)
            var animName;
            if (inBtn == "advSettingsBtn") {
                animName = "navAdvContUp"
                borg.runAction(
                    {
                        "action": "close",
                        "targets": pensionCalc.advFieldArr
                    })
                borg.runAction(
                    {
                        "action": "close",
                        "targets": pensionCalc.advFieldzArr
                    })
                borg.runAction(
                    {
                        "action": "close",
                        "targets": pensionCalc.advFieldArr2
                    })
                setTimeout(function () {
                    graphObj.pboAfterAdv();
                }, 501);

            } else if (inBtn == "scenarioOptionsBtn") {
                pensionCalc.closeAdvSettings()
                animName = "navContUp"
                performAction([
                    {
                        "action": "setAlphaAction",
                        "targets": ["scenarioBtnContTV", "scenarioBtnContPA", "scenarioCoverUp", "scenarioCoverUp2"],
                        "data": {
                            "alpha": 0
                        }
                    },
                    {
                        "action": "close",
                        "delay": 0.55,
                        "trigger": "toggleOn",
                        "targets": ["scenarioBtnContTV", "scenarioBtnContPA", "scenarioCoverUp", "scenarioCoverUp2"]
                    },


                    {
                        "//action": "runScriptAction",
                        "target": "#jsBridge",
                        "data": {
                            "script": "lastNavButton='NA';pensionCalc.calcAllCosts(true,true);"
                        }
                    },
                    {
                        "//action": "bringToFront",
                        "target": "optionsCont"
                    },
                    {
                        "//action": "animate",
                        "targets": ["scenarioOptionsCont"],
                        "data": {
                            "animationId": "navContUp"
                        }
                    },
                    {
                        "//action": "close",
                        "delay": 0.51,
                        "targets": ["scenarioOptionsCont"]
                    },
                    {
                        "//action": "close",
                        "targets": ["scenarioBtnContTV", "scenarioBtnContPA", "scenarioCoverUp", "scenarioCoverUp2"]
                    }


                ]);

            } else {
                pensionCalc.closeAdvSettings()
                animName = "navContUp"
            }
            //                alert(animName)
            performAction([
                {
                    "action": "animate",
                    "targets": [contName],
                    "data": {
                        "animationId": animName
                    }
                },
                {
                    "action": "close",
                    "delay": 0.51,
                    "targets": [contName]
                }
            ]);
            movedUpAlready = true;

            //                pensionCalc.scenarioDDObj = {
            //                    "TV": false,
            //                    "PA": false,
            //                    "B": false
            //                }
            performAction([
                {
                    "action": "setAlphaAction",
                    "targets": ["scenarioBtnContTV", "scenarioBtnContPA", "scenarioCoverUp", "scenarioCoverUp2"],
                    "data": {
                        "alpha": 0
                    }
                },
                {
                    "action": "close",
                    "delay": 0.55,
                    "targets": ["scenarioBtnContTV", "scenarioBtnContPA", "scenarioCoverUp", "scenarioCoverUp2"]
                }
            ]);

            //TODO: this line might mess wierd thing sup
            setTimeout(function () {
                pensionCalc.killScenario()
            }, 501);
        }
        else {
            if (inBtn == "scenarioOptionsBtn") {

                //                    alert('zzelse')
                performAction([
                    {
                        "action": "#spawnOnce",
                        "delay": 0.36,
                        "trigger": "toggleOn",
                        "data": {
                            "overlayId": "scenarioBtnContTV",
                            "persistence": "package",
                            "x": "21px",
                            "y": "82px"
                        }
                    },
                    {
                        "action": "#spawnOnce",
                        "delay": 0.361,
                        "trigger": "toggleOn",
                        "data": {
                            "overlayId": "scenarioBtnContPA",
                            "persistence": "package",
                            "x": "521px",
                            "y": "82px"
                        }
                    }
                ]);

                moreBorg.containerSpawn({"overlayId": "scenarioOptionsSubmitBtn"}, 'optionsCont', true)
            }
            pensionCalc.closeAdvSettings()
            movedUpAlready = false;
        }

        lastNavButton = inBtn;

        performAction([
            {
                "action": "close",
                "trigger": "touchUpInside",
                "targets": ["calcKeyboard_container_modal"]
            },
            {
                "action": "runScriptAction",
                "target": "#jsBridge",
                "data": {
                    "script": "First1='';Display1='';pensionCalc.keyboardClose();"
                }
            }
        ])

    }
    pensionCalc.removeJunk = function (inBtn) {


        //TODO: start here if they request dropdowns to spawn the way they were
        //        pensionCalc.scenarioDDObj = {
        //            "TV": false,
        //            "PA": false,
        //            "B": false
        //        }

        performAction([
            {
                "action": "#spawn",
                "data": {
                    "overlayId": "optionsContBlocker"
                }
            },
            {
                "action": "close",
                "delay": 1.0,
                "targets": ["optionsContBlocker"]
            }
        ]);
        //open last tab
        console.log("removeJunk: " + lastNavButton + "!!!!ZZ!!!" + didSubmit + "!!!!ZZ!!!" + inBtn)
        //
        if (lastNavButton == inBtn && !movedUpAlready) {
            var contName = inBtn.substr(0, inBtn.indexOf('Btn')) + "Cont"
            //            alert(contName)
            var animName;
            if (inBtn == "advSettingsBtn") {
                animName = "navAdvContUp"
                borg.runAction(
                    {
                        "action": "close",
                        "targets": pensionCalc.advFieldArr
                    })
                borg.runAction(
                    {
                        "action": "close",
                        "targets": pensionCalc.advFieldzArr
                    })

            } else if (inBtn == "scenarioOptionsBtn") {
                pensionCalc.closeAdvSettings()
                animName = "navContUp"
                performAction([
                    {
                        "action": "setAlphaAction",
                        "targets": ["scenarioBtnContTV", "scenarioBtnContPA", "scenarioCoverUp", "scenarioCoverUp2"],
                        "data": {
                            "alpha": 0
                        }
                    },
                    {
                        "action": "close",
                        "delay": 0.55,
                        "trigger": "toggleOn",
                        "targets": ["scenarioBtnContTV", "scenarioBtnContPA", "scenarioCoverUp", "scenarioCoverUp2"]
                    }
                ]);

            } else {
                pensionCalc.closeAdvSettings()
                animName = "navContUp"
            }
            //                alert(animName)
            performAction([
                {
                    "action": "animate",
                    "targets": [contName],
                    "data": {
                        "animationId": animName
                    }
                },
                {
                    "action": "close",
                    "delay": 0.51,
                    "targets": [contName]
                }
            ]);
            movedUpAlready = true;

            //                pensionCalc.scenarioDDObj = {
            //                    "TV": false,
            //                    "PA": false,
            //                    "B": false
            //                }
            performAction([
                {
                    "action": "setAlphaAction",
                    "targets": ["scenarioBtnContTV", "scenarioBtnContPA", "scenarioCoverUp", "scenarioCoverUp2"],
                    "data": {
                        "alpha": 0
                    }
                },
                {
                    "action": "close",
                    "delay": 0.55,
                    "targets": ["scenarioBtnContTV", "scenarioBtnContPA", "scenarioCoverUp", "scenarioCoverUp2"]
                }
            ]);
        }
        else {
            if (inBtn == "scenarioOptionsBtn") {

                //                    alert('zzelse')
                performAction([
                    {
                        "action": "#spawnOnce",
                        "delay": 0.36,
                        "trigger": "toggleOn",
                        "data": {
                            "overlayId": "scenarioBtnContTV",
                            "persistence": "package",
                            "x": "21px",
                            "y": "82px"
                        }
                    },
                    {
                        "action": "#spawnOnce",
                        "delay": 0.361,
                        "trigger": "toggleOn",
                        "data": {
                            "overlayId": "scenarioBtnContPA",
                            "persistence": "package",
                            "x": "521px",
                            "y": "82px"
                        }
                    }
                ]);
            }

            pensionCalc.closeAdvSettings()
            movedUpAlready = false;
        }


    }
    pensionCalc.toggleDRs = function () {
        if (pensionCalc.discountRate == 1) {
            moreBorg.toggle("discountRateToggle2", "on")
        } else if (pensionCalc.discountRate == 0.95) {
            moreBorg.toggle("discountRateToggle1", "on")
        } else {
            moreBorg.toggle("discountRateToggle3", "on")
        }
    }
    pensionCalc.spawnAdvSettings = function () {

        performAction([
            {
                "action": "setAlphaAction",
                "targets": ["scenarioBtnContTV", "scenarioBtnContPA", "scenarioCoverUp", "scenarioCoverUp2"],
                "data": {
                    "alpha": 0
                }
            },
            {
                "action": "close",
                "delay": 0.55,
                "trigger": "toggleOn",
                "targets": ["scenarioBtnContTV", "scenarioBtnContPA", "scenarioCoverUp", "scenarioCoverUp2"]
            }
        ]);
        if (!movedUpAlready) {

            performAction([
                {
                    "action": "close",
                    "targets": ["pboAssetsFakeBtn", "pboAssets", "pboAssetsBtn", "pboTotalWorthFakeBtn", "pboTotalWorth", "pboTotalWorthBtn"]
                }
            ])
            var inputz = ["PBGCFakeBtn", "PBGC", "PBGCBtn", "activesCostsFakeBtn", "activesCosts", "activesCostsBtn", "vestedsCostsFakeBtn", "vestedsCosts", "vestedsCostsBtn", "retireesCostsFakeBtn", "retireesCosts", "retireesCostsBtn", "activesLongRateFakeBtn", "activesLongRate", "activesLongRateBtn", "vestedsLongRateFakeBtn", "vestedsLongRate", "vestedsLongRateBtn", "retireesLongRateFakeBtn", "retireesLongRate", "retireesLongRateBtn"];
            var xz = ["20px", "30px", "20px", "20px", "30px", "20px", "20px", "30px", "20px", "20px", "30px", "20px", "358px", "368px", "358px", "358px", "368px", "358px", "358px", "368px", "358px"];
            var yz = ["176.5px", "185px", "178px",
                "317px", "325px", "318px",
                "398px", "407px", "399px",
                "486px", "495px", "487px",

                "316px", "325px", "318px",
                "397px", "407px", "399px",
                "485px", "495px", "487px" ];
            var inputz2 = ["advSettingsSubmitBtn", "advSettingsUberResetBtn", "advSettingsResetBtn"]
            var x2 = ["895px", "26px", "672px"]
            var y2 = ["558px", "558px", "558px"]

            setTimeout(function () {

                for (var i = 0; i < inputz.length; i++) {
                    moreBorg.spawn({
                        "overlayId": inputz[i],
                        "x": xz[i],
                        "y": yz[i],
                        "width": "155px",
                        "height": "44px"

                    }, true)
                }
                for (var i = 0; i < inputz2.length; i++) {
                    moreBorg.spawn({
                        "overlayId": inputz2[i],
                        "x": x2[i],
                        "y": y2[i]

                    }, true)
                }

            }, 501);
        } else {

        }


    }
    pensionCalc.closeAdvSettings = function () {

        //                alert('3zzz')
        borg.runAction(
            {
                "action": "close",
                "targets": pensionCalc.advFieldArr
            })
        borg.runAction(
            {
                "action": "close",
                "targets": pensionCalc.advFieldzArr
            })
        borg.runAction(
            {
                "action": "close",
                "targets": pensionCalc.advFieldArr2
            })
    }
    pensionCalc.openLastScen = function () {

        if (pensionCalc.scenarioDDObj["B"]) {
            pensionCalc.expandScenario("TV")
            pensionCalc.expandScenario("PA")
        } else {


            var lastScen = -1
            for (var i in pensionCalc.scenarioDDObj) {
                //            alert(pensionCalc.scenarioDDObj[i])
                if (lastScen != -1) {
                    break
                } else {
                    lastScen = (pensionCalc.scenarioDDObj[i] == true) ? i : -1
                }
            }

            if (lastScen == -1) {
                return
            } else {
                pensionCalc.expandScenario(lastScen)
            }


        }

    }
    pensionCalc.expandScenario = function (currDD, trueTap) {


        console.log("expand scenario-- DDOBJ AT START" + JSON.stringify(pensionCalc.scenarioDDObj) + " -- sNum  -- " + pensionCalc.sNum + " -- usedTV2 -- " + pensionCalc.usedTV2)
        //        console.log("pensionCalc.sNum" + JSON.stringify(pensionCalc.sNum))
        //        console.log("pensionCalc.usedTV2" + JSON.stringify(pensionCalc.usedTV2))

        //if truetap is false, this function is being called oninit of the scenario container (to remember last used state)
        if (trueTap) {
            pensionCalc.scenarioDDObj[currDD] = !pensionCalc.scenarioDDObj[currDD]
        } else {
            setTimeout(function () {
                performAction([
                    {
                        "action": "animate",
                        "targets": ["arrow" + currDD],
                        "data": {
                            "animationId": "rotArrowDown"
                        }
                    }
                ])

            }, 750);
        }

        if (pensionCalc.scenarioDDObj["TV"] == true && pensionCalc.scenarioDDObj["PA"] == true) {
            pensionCalc.scenarioDDObj["B"] = true
        } else {
            pensionCalc.scenarioDDObj["B"] = false
        }

        var myScen = pensionCalc.scenarioDDObj["B"]

        if (myScen) {
            myScen = "B"
            pensionCalc.sNum = 2
        } else {
            if (pensionCalc.scenarioDDObj["TV"]) {
                myScen = "TV"
                pensionCalc.sNum = 0
            } else if (pensionCalc.scenarioDDObj["PA"]) {
                myScen = "PA"
                pensionCalc.sNum = 1
            } else {
                myScen = "NA"
            }
        }

        //myScen = which of the three scenarios dropdown is currently on
        //scenToUse = checker for second dropdown placement
        console.log(JSON.stringify(pensionCalc.scenarioDDObj) + myScen)

        var scenToUse = currDD;
        if ((currDD == "TV" && myScen == "B")) {
            console.log("ON TV2")
            scenToUse = "TV2"
            pensionCalc.usedTV2 = true
        } else if (currDD == "PA" && myScen == "B") {
            scenToUse = currDD
            pensionCalc.usedTV2 = true
            //            alert("1")
            performAction([
                {
                    "action": "setHiddenAction",
                    "target": "scenario" + "TV" + "Cont",
                    "data": {
                        "hidden": true
                    }
                },
                {
                    "action": "animate",
                    "target": "scenario" + "TV" + "Cont",
                    "data": {
                        "animationIds": [
                            "alphaOut"
                        ]
                    }
                },
                {
                    "action": "setHiddenAction",
                    "target": "scenario" + "TV2" + "Cont",
                    "data": {
                        "hidden": false
                    }
                },
                {
                    "action": "animate",
                    "target": "scenario" + "TV2" + "Cont",
                    "data": {
                        "animationIds": [
                            "alphaIn"
                        ]
                    }
                }
            ])

        } else {
            scenToUse = currDD
            pensionCalc.usedTV2 = false
        }

        console.log("------------------------------")
        if (pensionCalc.scenarioDDObj[currDD]) {
            //OPENING whichever container

            //            console.log("OPENING --" + "myScen: " + myScen + " scenToUse: " + scenToUse + " usedTV2: " + pensionCalc.usedTV2 +" E,RE,RA" + ELast+" , "+ RELast+" , "+ RALast)

            //adding support for savestates on sliders
            if (myScen == "TV") {
                pensionCalc.TVTransferPercent = (savedSliders["TVTransferPercent"]) ? savedSliders["TVTransferPercent"] : 0;

            } else if (myScen == "PA") {
                pensionCalc.retireeTransferPercent = (savedSliders["retireeTransferPercent"]) ? savedSliders["retireeTransferPercent"] : 0
                pensionCalc.BOIndex = (savedSliders["BOIndex"]) ? savedSliders["BOIndex"] : 1.08

            } else {
                pensionCalc.TVTransferPercent = (savedSliders["TVTransferPercent"]) ? savedSliders["TVTransferPercent"] : 0
                pensionCalc.retireeTransferPercent = (savedSliders["retireeTransferPercent"]) ? savedSliders["retireeTransferPercent"] : 0
                pensionCalc.BOIndex = (savedSliders["BOIndex"]) ? savedSliders["BOIndex"] : 1.08
            }
            console.log("OPENING --" + myScen + " : " + JSON.stringify(savedSliders))


            if (!pensionCalc.scenarioDDObj["TV"]) {
                //                alert('NOT TV')
                performAction([
                    {
                        "action": "setHiddenAction",
                        "target": "scenario" + "TV" + "Cont",
                        "data": {
                            "hidden": true
                        }
                    }
                ])
            }

            //            alert("2")
            performAction([
                {
                    "action": "#spawn",
                    "data": {
                        "overlayId": "scenarioCoverUp"
                    }
                },
                {
                    "action": "#spawn",
                    "data": {
                        "overlayId": "scenarioCoverUp2"
                    }
                },
                {
                    "action": "animate",
                    "targets": ["arrow" + currDD],
                    "data": {
                        "animationId": "rotArrowDown"
                    }
                },
                {
                    "action": "setHiddenAction",
                    "target": "scenario" + scenToUse + "Cont",
                    "data": {
                        "hidden": false
                    }
                },
                {
                    "action": "animate",
                    "target": "scenario" + scenToUse + "Cont",
                    "data": {
                        "animationIds": [
                            "alphaIn"
                        ]
                    }
                }
            ])

        } else {
            //CLOSING whichever container
            var allClosed = (pensionCalc.scenarioDDObj['TV'] == false && pensionCalc.scenarioDDObj['PA'] == false && pensionCalc.scenarioDDObj['B'] == false) ? true : false

            if (!allClosed) {
                savedSliders["TVTransferPercent"] = pensionCalc.TVTransferPercent
                savedSliders["retireeTransferPercent"] = pensionCalc.retireeTransferPercent
                savedSliders["BOIndex"] = pensionCalc.BOIndex
            } else {
            }

            if (currDD == "TV") {
                console.log("CLOSING -- TV" + JSON.stringify(savedSliders) + allClosed)
                pensionCalc.TVTransferPercent = 0
                scenToUse = (pensionCalc.usedTV2 && currDD == "TV") ? "TV" : "TV2";

            } else {
                console.log("CLOSING -- PA" + JSON.stringify(savedSliders) + allClosed)
                pensionCalc.retireeTransferPercent = 0
                pensionCalc.BOIndex = 1.08

                if (myScen != "NA") {
                    console.log("CLOSING -- NA" + JSON.stringify(savedSliders) + allClosed)
                    //                    alert('NA CLOSING')

                    //                    alert("3")
                    performAction([
                        {
                            "action": "setHiddenAction",
                            "target": "scenario" + "TV" + "Cont",
                            "data": {
                                "hidden": false
                            }
                        },
                        {
                            "action": "animate",
                            "target": "scenario" + "TV" + "Cont",
                            "data": {
                                "animationIds": [
                                    "alphaIn"
                                ]
                            }
                        }
                    ])
                }
            }
            //            alert(scenToUse)

            //            console.log("CLOSING--" + "myScen: " + myScen + " scenToUse: " + scenToUse + " usedTV2: " + pensionCalc.usedTV2)


            //            alert("4")
            performAction([
                {
                    "action": "animate",
                    "targets": ["arrow" + currDD],
                    "data": {
                        "animationId": "rotArrowUp"
                    }
                },
                {
                    "action": "setHiddenAction",
                    "delay": 0.36,
                    "target": "scenario" + scenToUse + "Cont",
                    "data": {
                        "hidden": true
                    }
                },
                {
                    "action": "animate",
                    "target": "scenario" + scenToUse + "Cont",
                    "data": {
                        "animationIds": [
                            "alphaOut"
                        ]
                    }
                }
            ])
        }

        performAction([
            {
                "action": "animate",
                "targets": ["scenarioOptionsCont"],
                "data": {
                    "animationId": "down" + myScen
                }
            }
        ])

        //        if (pensionCalc.scenarioDDObj['TV'] == false &&pensionCalc.scenarioDDObj['B'] == false && pensionCalc.scenarioDDObj['PA'] == false ) {
        //            console.log('ALL COLLAPSED TIME TO RESET')
        //            pensionCalc.resetSliders();
        //        } else {}

        pensionCalc.calcAllCosts();
        graphObj.pboAfterScenario();
        chartObj.setUpAfterScenario();

        console.log("expand scenario-- DDOBJ AT END" + JSON.stringify(pensionCalc.scenarioDDObj) + " -- sNum  -- " + pensionCalc.sNum + " -- usedTV2 -- " + pensionCalc.usedTV2)
        //        console.log("pensionCalc.sNum" + JSON.stringify(pensionCalc.sNum))
        //        console.log("pensionCalc.usedTV2" + JSON.stringify(pensionCalc.usedTV2))

    }
    pensionCalc.killScenario = function () {
        performAction([
            {
                "action": "close",
                "trigger": "touchUpInside",
                "targets": ["scenarioOptionsCont", "scenarioTV2Cont", "scenarioTVCont", "scenarioBtnContTV", "scenarioPACont", "scenarioBtnContPA", "scenarioOptionsResetBtn", "scenarioOptionsSubmitBtn", "scenarioCoverUp", "scenarioCoverUp2"]
            }
        ])
    }
    pensionCalc.advSettingsSubmit = function () {
        moreBorg.spawn("advSettingsBtnBlocker")
        lastNavButton = 'NA';
        var d = pensionCalc.getAdvInputs();
        pensionCalc.calcAllCosts(d, false, true);
        setTimeout(function () {
            graphObj.pboAfterAdv();
        }, 351);
        setTimeout(function () {
            moreBorg.close("advSettingsBtnBlocker")
        }, 2300);
        pensionCalc.closeAdvSettings();
    }

    //sliders
    //1) pensionCalc.TVTransferPercent 2)pensionCalc.BOIndex 3)pensionCalc.retireeTransferPercent
    pensionCalc.sliderE = function () {
        //        alert('slsssideree')
        //        console.log('inslidere')

        //might not be necessary?
        moreBorg.close("sliderDotE")
        moreBorg.containerSpawn([
            {
                "overlayId": "sliderDotE"
            }
        ], 'sliderContE', false);
        borg.runAction({
            "action": "bringToFront",
            "trigger": "now",
            "target": "sliderContE"

        });
        borg.runAction({
            "action": "bringToFront",
            "trigger": "now",
            "target": "sliderDotE"

        });

        //check if was opened already
        if (ELast != "-1") {
            //            console.log('ealas')
            borg.moveOverlay("sliderDotE", ELast + "px", "70px")
        }

        borg.getOverlayById("sliderDotE").onTouchMoved = function (info) {
            //            console.log(info.overlay.x)
            if (info.overlay.x >= 25 && info.overlay.x <= 535) {
                if (info.screenX >= 25 && info.screenX <= 500) {
                    borg.moveOverlay("sliderDotE", info.screenX + "px", "70px");
                }
            }
        };
        //for snapping
        borg.getOverlayById("sliderDotE").onTouchUp = function (info) {
            if (info.overlay.x >= 0 && info.overlay.x <= 600) {
                //                    var multPoint = Math.round(info.overlay.x/46)
                var ceil = Math.ceil(info.overlay.x / 46)
                var floor = Math.floor(info.overlay.x / 46)
                var diff1 = Math.abs((ceil * 46 - 12) - info.overlay.x)
                var diff2 = Math.abs((floor * 46 - 12) - info.overlay.x)
                var moveTo = (diff1 < diff2) ? ceil * 46 - 12 : floor * 46 - 12;
                var multPoint = (diff1 < diff2) ? ceil : floor;

                pensionCalc.TVTransferPercent = .1 * (multPoint - 1)
                console.log(info.overlay.x + "::" + multPoint + " : " + moveTo + " : " + pensionCalc.TVTransferPercent)
                savedSliders["TVTransferPercent"] = pensionCalc.TVTransferPercent;
                borg.moveOverlay("sliderDotE", moveTo + "px", "70px");
                ELast = moveTo;
                pensionCalc.calcAllCosts(false, true);
                graphObj.pboAfterScenario();
                chartObj.setUpAfterScenario();
            }

        };

        //37,83,128,174,218,262,307,350,396,442,487


    }
    pensionCalc.sliderRA = function () {

        //        console.log('insliderRA')

        lastButton = "scenarioOptionsRetireesBtn";
        //might not be necessary?
        moreBorg.close("sliderDotRA")
        moreBorg.containerSpawn([
            {"overlayId": "sliderDotRA"}
        ], 'sliderContRA', false);
        borg.runAction({
            "action": "bringToFront",
            "trigger": "now",
            "target": "sliderContRA"

        });
        borg.runAction({
            "action": "bringToFront",
            "trigger": "now",
            "target": "sliderDotRA"

        });

        if (RALast != "-1") {
            //            console.log('RALast')
            borg.moveOverlay("sliderDotRA", RALast + "px", "70px")
        } else {
            //            console.log('else in RALAST -- no value to start w')
            borg.moveOverlay("sliderDotRA", 264 + "px", "70px")
            pensionCalc.BOIndex = 1.08;

        }

        borg.getOverlayById("sliderDotRA").onTouchMoved = function (info) {

            if (info.screenX >= 537 && info.screenX <= 1000) {
                borg.moveOverlay("sliderDotRA", info.screenX - 512 + "px", "70px");
            }
        };


        //for snapping
        borg.getOverlayById("sliderDotRA").onTouchUp = function (info) {
            if (info.overlay.x >= 0 && info.overlay.x <= 600) {
                //                    var multPoint = Math.round(info.overlay.x/46)
                var ceil = Math.ceil(info.overlay.x / 46)
                var floor = Math.floor(info.overlay.x / 46)
                var diff1 = Math.abs((ceil * 46 - 12) - info.overlay.x)
                var diff2 = Math.abs((floor * 46 - 12) - info.overlay.x)
                var moveTo = (diff1 < diff2) ? ceil * 46 - 12 : floor * 46 - 12;
                var multPoint = (diff1 < diff2) ? ceil : floor;

                pensionCalc.BOIndex = .01 * (114 - multPoint)
                console.log(info.overlay.x + "::" + multPoint + " : " + moveTo + " : " + pensionCalc.BOIndex)
                savedSliders["BOIndex"] = pensionCalc.BOIndex
                borg.moveOverlay("sliderDotRA", moveTo + "px", "70px");
                RALast = moveTo;

                pensionCalc.calcAllCosts(false, true);
                graphObj.pboAfterScenario();
                chartObj.setUpAfterScenario();
            }

        };


    }
    pensionCalc.sliderRE = function () {


        moreBorg.close("sliderDotRE")
        moreBorg.containerSpawn([
            {
                "overlayId": "sliderDotRE"
            }
        ], 'sliderContRE', false);
        borg.runAction({
            "action": "bringToFront",
            "trigger": "now",
            "target": "sliderContRE"

        });
        borg.runAction({
            "action": "bringToFront",
            "trigger": "now",
            "target": "sliderDotRE"

        });

        if (RELast != "-1") {
            //            console.log('RELast')
            borg.moveOverlay("sliderDotRE", RELast + "px", "70px")
        }


        borg.getOverlayById("sliderDotRE").onTouchMoved = function (info) {
            //                console.log(info.overlay.x + "---" + info.screenX)
            if (info.screenX >= 537 && info.screenX <= 1000) {
                borg.moveOverlay("sliderDotRE", info.screenX - 512 + "px", "70px");
            }
        };

        //for snapping
        borg.getOverlayById("sliderDotRE").onTouchUp = function (info) {
            console.log('touchip' + info.overlay.x + "  " + info.screenX)
            if (info.overlay.x >= 0 && info.overlay.x <= 600) {
                //                console.log('if')
                //                    var multPoint = Math.round(info.overlay.x/46)
                var ceil = Math.ceil(info.overlay.x / 46)
                var floor = Math.floor(info.overlay.x / 46)
                var diff1 = Math.abs((ceil * 46 - 12) - info.overlay.x)
                var diff2 = Math.abs((floor * 46 - 12) - info.overlay.x)
                var moveTo = (diff1 < diff2) ? ceil * 46 - 12 : floor * 46 - 12;
                var multPoint = (diff1 < diff2) ? ceil : floor;

                pensionCalc.retireeTransferPercent = .1 * (multPoint - 1)
                console.log("RE" + info.overlay.x + "::" + multPoint + " : " + moveTo + " : " + pensionCalc.retireeTransferPercent)
                savedSliders["retireeTransferPercent"] = pensionCalc.retireeTransferPercent
                borg.moveOverlay("sliderDotRE", moveTo + "px", "70px");
                RELast = moveTo;
                lastSliderOpened = "RA";
                pensionCalc.calcAllCosts(false, true);
                graphObj.pboAfterScenario();
                chartObj.setUpAfterScenario();

            }

        };

        //37,83,128,174,218,262,307,350,396,442,487


    }

    //validation functions
    pensionCalc.validatePBO = function (isFirst) {
        //        pensionCalc.clear();
        //TODO: Bugfix for saving scenario modeller stuff

        pensionCalc.PBGCArr = [];
        pensionCalc.varArr = [];
        pensionCalc.adminArr = [];
        pensionCalc.otherArr = [];
        pensionCalc.totalArr = [];
        pensionCalc.longevityArr = [];
        pensionCalc.longevityNums = [];
        pensionCalc.tenYearArr = [];
        if (onInputPage) {
            pensionCalc.adminCostsArr = [30, 30, 30];
            pensionCalc.otherCostsArr = [.05, .05, .05];
            pensionCalc.longRateArr = [0.025, 0.025, 0.025];
        } else {
        }
        pensionCalc.varTotal = 0;
        pensionCalc.adminTotal = 0;
        pensionCalc.otherTotal = 0;
        pensionCalc.participantTotal = 0;
        pensionCalc.fullTotal = 0;
        pensionCalc.tenYearTotal = 0;
        pensionCalc.longevityTotal = 0;
        pensionCalc.outputStr = "";

        var d = pensionCalc.getPBOInputs();

        if (!d) {
            //todo: remove
            //            lastNavButton = 'NA';
            //            pensionCalc.calcAllCosts(d);
            //            graphObj.initPBOgraph();
            //            chartObj.setUpInitialPBO();
            //            performAction([
            //                {
            //                    "action": "close",
            //                    "targets": ["pboActives", "pboActivesBtn", "pboVesteds", "pboVestedsBtn", "pboRetirees", "pboRetireesBtn", "pboTotalWorth", "pboTotalWorthBtn"]
            //                },
            //                {
            //                    "action": "bringToFront",
            //                    "trigger": "toggleOn",
            //                    "target": "optionsCont"
            //                },
            //                {
            //                    "action": "animate",
            //                    "trigger": "touchUpInside",
            //                    "targets": ["pboOptionsCont"],
            //                    "data": {
            //                        "animationId": "navContUp"
            //                    }
            //                },
            //                {
            //                    "action": "close",
            //                    "delay": 0.51,
            //                    "trigger": "touchUpInside",
            //                    "targets": ["pboOptionsCont"]
            //                }
            //            ])

            return false
        } else {

            //TODO: This is mercer space ticket 53


            if (pensionCalc.reachedParticipants) {
                //                if (JSON.stringify(pensionCalc.inputs["participantActives"]) === "" ||JSON.stringify(pensionCalc.inputs["participantTerm"]) === "" ||JSON.stringify(pensionCalc.inputs["participantRetirees"]) === ""){
                if (pensionCalc.inputs["participantActives"] === "" || pensionCalc.inputs["participantTerm"] === "" || pensionCalc.inputs["participantRetirees"] === "") {


                    if (!$.isNumeric((pensionCalc.inputs["participantActives"])) || !$.isNumeric(pensionCalc.inputs["participantTerm"]) || !$.isNumeric(pensionCalc.inputs["participantRetirees"])) {

                        //TODO: COmment back , change to return false
                        borg.runAction({
                            action: "gotoURLAction",
                            trigger: "now",
                            target: "#systemPage",
                            data: {
                                failureTitle: "Input Error",
                                failureMessage: "Enter All Participant Fields",
                                url: "alert://localhost/"
                            }
                        });
                        borg.runAction({
                            action: "gotoURLAction",
                            trigger: "now",
                            target: "#systemPage",
                            data: {
                                failureTitle: "Input Error",
                                failureMessage: "Fix Errors In Participant Tab",
                                url: "alert://localhost/"
                            }
                        });

                        performAction([
                            {
                                "action": "close",
                                "delay": 1.0,
                                "targets": ["optionsContBlocker"]
                            }
                        ]);
                        return false;

                    } else {

                    }


                }

            } else {
            }

            console.log(JSON.stringify(dollarObj) + " -- " + JSON.stringify(percentObj))
            if (isFirst) {
                borg.runAction(
                    {
                        "action": "#goToPage",
                        "trigger": "now",
                        "data": {
                            "pageId": "initialPBO",
                            "transitionType": "slide",
                            "transitionDuration": 0.5
                        }
                    })

            } else {

            }
            lastNavButton = 'NA';
            pensionCalc.calcAllCosts(d);

            //TODO: check if they want to go backwards if so comment this stuff out
            if (pensionCalc.reachedScenario) {

                //                performAction([
                //                    {
                //                        "action": "close",
                //                        "targets": ["graphContLeft", "graphContRight"]
                //                    }
                //                ])

                //                graphObj.initPBOgraph();
                //                    chartObj.setUpInitialPBO();

                graphObj.pboAfterScenario();
                chartObj.setUpAfterScenario();

            } else if (pensionCalc.reachedParticipants) {

                graphObj.pboAfterParticipants();
                chartObj.setUpAfterParticipants();

            } else {
                graphObj.initPBOgraph();
                chartObj.setUpInitialPBO();
                //                unChangedInputs = {}
                //                for (var i in pensionCalc.inputs) {
                //                    unChangedInputs[i] = pensionCalc.inputs[i]
                //                }
            }
            //TODO: this is new bugfix comment above back in if breaks
            unChangedInputs = {}
            for (var i in pensionCalc.inputs) {
                unChangedInputs[i] = pensionCalc.inputs[i]
            }
            //                        console.log("11enddz --- "+JSON.stringify(pensionCalc.inputs) )

            //            console.log("1unchanged" + JSON.stringify(unChangedInputs))
            //            console.log("1inputs" + JSON.stringify(pensionCalc.inputs))
            //TODO: SAVESTATE
            //            inputObj = {}
            //            if(pensionCalc.pboInDollars){
            //                percentObj = {}
            //            }else{
            //                dollarObj = {}
            //            }

            performAction([
                {
                    "action": "close",
                    "targets": pensionCalc.inputz
                },
                {
                    "action": "bringToFront",
                    "trigger": "toggleOn",
                    "target": "optionsCont"
                },
                {
                    "action": "animate",
                    "trigger": "touchUpInside",
                    "targets": ["pboOptionsCont"],
                    "data": {
                        "animationId": "navContUp"
                    }
                },
                {
                    "action": "close",
                    "delay": 0.51,
                    "trigger": "touchUpInside",
                    "targets": ["pboOptionsCont"]
                },
                {
                    "action": "close",
                    "trigger": "touchUpInside",
                    "targets": ["calcKeyboard_container_modal"]
                },
                {
                    "action": "runScriptAction",
                    "target": "#jsBridge",
                    "data": {
                        "script": "First1='';Display1='';"
                    }
                },
                {
                    "action": "#spawn",
                    "data": {
                        "overlayId": "advSettingsBtnBlocker"
                    }
                },
                {
                    "action": "close",
                    "delay": 1.5,
                    "targets": ["advSettingsBtnBlocker"]
                }
            ])
            pensionCalc.killScenario();

            //            console.log("midsz --- "+JSON.stringify(pensionCalc.inputs) )

            //TODO: Fix for mercer space ticket 53 - watch out for unchanged though
            for (var i in pensionCalc.partFieldArr) {
                pensionCalc.inputs[pensionCalc.partFieldArr[i]] = unChangedInputs[pensionCalc.partFieldArr[i]] = pensionCalc[pensionCalc.partFieldArr[i]]
            }
            for (var i in pensionCalc.pboFieldArr) {
                pensionCalc.inputs[pensionCalc.pboFieldArr[i]] = unChangedInputs[pensionCalc.pboFieldArr[i]] = pensionCalc[pensionCalc.pboFieldArr[i]]
            }

            //                        console.log("enddz --- "+JSON.stringify(pensionCalc.inputs) )
            return true
        }


    }
    pensionCalc.validateParticipants = function () {
        pensionCalc.clear(true);
        //TODO: Bugfix for saving scenario modeller stuff
        //        pensionCalc.PBGCArr = [];
        //        pensionCalc.varArr = [];
        //        pensionCalc.adminArr = [];
        //        pensionCalc.totalArr = [];
        //        pensionCalc.longevityArr = [];
        //        pensionCalc.longevityNums = [];
        //        pensionCalc.tenYearArr = [];
        //        pensionCalc.varTotal = 0;
        //        pensionCalc.adminTotal = 0;
        //        pensionCalc.participantTotal = 0;
        //        pensionCalc.fullTotal = 0;
        //        pensionCalc.tenYearTotal = 0;
        //        pensionCalc.longevityTotal = 0;
        //        pensionCalc.outputStr = "";

        var d = pensionCalc.getPartInputs();
        //        alert(d)
        if (!d) {
            return "partFail"
        } else {
            lastNavButton = 'NA';
            pensionCalc.submittedParticipants = true;

            //TODO: COmment back , change to return false
            var zz = pensionCalc.getPBOInputs();

//                        var zz = true;
//                        if (isDev) {
//                            pensionCalc.adminCostsArr = [30, 30, 30];
//                            pensionCalc.otherCostsArr = [.05, .05, .05];
//                            pensionCalc.longRateArr = [0.025, 0.025, 0.025];
//                        } else {
//                        }


            if (zz) {

                performAction([
                    {
                        "action": "#spawn",
                        "data": {
                            "overlayId": "optionsContBlocker"
                        }
                    },
                    {
                        "action": "close",
                        "delay": 1.0,
                        "targets": ["optionsContBlocker"]
                    }
                ]);

                pensionCalc.calcAllCosts(d);

                //TODO: THis is fix for mercer space ticket 22
                pensionCalc.beforeObj['PBGCTotalCosts'] = pensionCalc.PBGCTotalCosts
                pensionCalc.beforeObj['adminTotal'] = pensionCalc.adminTotal
                pensionCalc.beforeObj['participantTotal'] = pensionCalc.participantTotal


                //            console.log("VALIDATEPARTICIPANTS" + pensionCalc.reachedScenario)
                if (pensionCalc.reachedScenario) {
                    graphObj.pboAfterScenario();
                    chartObj.setUpAfterScenario();

                } else {
                    graphObj.pboAfterParticipants();
                    chartObj.setUpAfterParticipants();
                }
                performAction([
                    {
                        "action": "bringToFront",
                        "trigger": "toggleOn",
                        "target": "optionsCont"
                    },
                    {
                        "action": "animate",
                        "trigger": "touchUpInside",
                        "targets": ["participantOptionsCont"],
                        "data": {
                            "animationId": "navContUp"
                        }
                    },
                    {
                        "action": "close",
                        "delay": 0.51,
                        "trigger": "touchUpInside",
                        "targets": ["participantOptionsCont"]
                    },
                    {
                        "action": "close",
                        "trigger": "touchUpInside",
                        "targets": ["calcKeyboard_container_modal", "scenarioOptionsCont", "scenarioTV2Cont", "scenarioTVCont", "scenarioBtnContTV", "scenarioPACont", "scenarioBtnContPA", "scenarioOptionsResetBtn", "scenarioOptionsSubmitBtn"]
                    },
                    {
                        "action": "runScriptAction",
                        "target": "#jsBridge",
                        "data": {
                            "script": "First1='';Display1='';"
                        }
                    },
                    {
                        "action": "#spawn",
                        "data": {
                            "overlayId": "optionsContBlocker"
                        }
                    },
                    {
                        "action": "close",
                        "delay": 1.0,
                        "targets": ["optionsContBlocker"]
                    },
                    {
                        "action": "#spawn",
                        "data": {
                            "overlayId": "advSettingsBtnBlocker"
                        }
                    },
                    {
                        "action": "close",
                        "delay": 1.5,
                        "targets": ["advSettingsBtnBlocker"]
                    }
                ])
                pensionCalc.killScenario();

                //                alert("AZZZZ --- "+JSON.stringify(pensionCalc.inputs) )

                //TODO: Fix for mercer space ticket 53 - watch out for unchanged though
                for (var i in pensionCalc.partFieldArr) {
                    pensionCalc.inputs[pensionCalc.partFieldArr[i]] = unChangedInputs[pensionCalc.partFieldArr[i]] = pensionCalc[pensionCalc.partFieldArr[i]]
                }
                for (var i in pensionCalc.pboFieldArr) {
                    pensionCalc.inputs[pensionCalc.pboFieldArr[i]] = unChangedInputs[pensionCalc.pboFieldArr[i]] = pensionCalc[pensionCalc.pboFieldArr[i]]
                }

                //                alert("AZZZZ222222 --- "+JSON.stringify(pensionCalc.inputs) )


                return true
            } else {
                borg.runAction({
                    action: "gotoURLAction",
                    trigger: "now",
                    target: "#systemPage",
                    data: {
                        failureTitle: "Input Error",
                        failureMessage: "Fix Errors In PBO Tab",
                        url: "alert://localhost/"
                    }
                });
                performAction([
                    {
                        "action": "close",
                        "delay": 1.0,
                        "targets": ["optionsContBlocker"]
                    }
                ]);
                pensionCalc.submittedParticipants = false;
                return false;
            }
        }


    }


    //for toggling btwn percent and dollar
    pensionCalc.toggleInitialInputs = function (inDollars) {
        pensionCalc.inputs = {}
        var inputz = ["pboAssetsFakeBtn", "pboAssets", "pboAssetsBtn", "pboActivesFakeBtn", "pboActives", "pboActivesBtn", "pboVestedsFakeBtn", "pboVesteds", "pboVestedsBtn", "pboRetireesFakeBtn", "pboRetirees", "pboRetireesBtn"];
        var xz = ["326px", "341px", "331px", "254px", "254px", "254px", "437px", "437px", "437px", "620px", "620px", "620px"];
        var yz = ["495px", "503px", "503px", "355px", "432px", "432px", "355px", "432px", "432px", "355px", "432px", "432px" ];
        console.log('toggleinitialinputs')
        if (inDollars) {
            performAction([
                {
                    "action": "close",
                    "targets": inputz
                },
                {
                    "action": "bringToFront",
                    "target": "midInputCont"
                },
                {
                    "action": "bringToFront",
                    "target": "bottomInputCont"
                },
                {
                    "action": "bringToFront",
                    "target": "pboAssetsBtn"
                },
                {
                    "action": "close",
                    "targets": ["pboTotalWorth", "pboTotalWorthBtn", "pboTotalWorthFakeBtn"]
                },
                {
                    "action": "animate",
                    "target": "bottomInputCont",
                    "data": {
                        "animationIds": [
                            "inputUp"
                        ]
                    }
                },
                {
                    "action": "animate",
                    "target": "midInputImg2",
                    "data": {
                        "animationIds": [
                            "alphaOut"
                        ]
                    }
                },
                {
                    "action": "animate",
                    "target": "midInputImg",
                    "data": {
                        "animationIds": [
                            "alphaIn"
                        ]
                    }
                },
                {
                    "action": "setPositionAction",
                    "target": "submitMagicButton",
                    "data": {
                        "x": "490px",
                        "y": "497px"
                    }
                }
            ])
            setTimeout(function () {

                for (var i = 0; i < inputz.length; i++) {
                    moreBorg.spawn({
                        "overlayId": inputz[i],
                        "persistence": "package",
                        "//borderWidth": "1px",
                        "x": xz[i],
                        "y": yz[i],
                        "width": "155px",
                        "height": "44px",
                        "alpha": 0
                    }, false)
                }
                //                alert('zzz')
                moreBorg.setImages('midInputImg', "img/00_landingpage_dollarFields.png")
                borg.moveOverlay("pboAssetsFakeBtn", "327px", "495px");
                borg.moveOverlay("pboAssets", "341px", "501px");
                borg.moveOverlay("pboAssetsBtn", "331px", "503px");

                borg.moveOverlay("pboActivesFakeBtn", "328px", "372px");
                borg.moveOverlay("pboActives", "341px", "377px");
                borg.moveOverlay("pboActivesBtn", "331px", "372px");
                borg.moveOverlay("pboVestedsFakeBtn", "511px", "372px");
                borg.moveOverlay("pboVesteds", "524px", "377px");
                borg.moveOverlay("pboVestedsBtn", "514px", "372px");
                borg.moveOverlay("pboRetireesFakeBtn", "692px", "372px");
                borg.moveOverlay("pboRetirees", "707px", "377px");
                borg.moveOverlay("pboRetireesBtn", "697px", "372px");
                borg.moveOverlay("midInputImg", "304px", "62px");


            }, 200);
            setTimeout(function () {
                performAction([
                    {
                        "action": "setAlphaAction",
                        "targets": inputz,
                        "data": {
                            "alpha": 1
                        }
                    }
                ])
            }, 205);

        } else {
            inputz = ["pboAssetsFakeBtn", "pboAssets", "pboAssetsBtn", "pboActivesFakeBtn", "pboActives", "pboActivesBtn", "pboVestedsFakeBtn", "pboVesteds", "pboVestedsBtn", "pboRetireesFakeBtn", "pboRetirees", "pboRetireesBtn", "pboTotalWorthFakeBtn", "pboTotalWorth", "pboTotalWorthBtn"];
            xz = ["249px", "264px", "254px", "249px", "264px", "254px", "432px", "447px", "437px", "614px", "630px", "620px", "249px", "264px", "254px"];
            yz = ["542px", "552px", "552px", "423px", "432px", "432px", "423px", "432px", "432px", "423px", "432px", "432px", "338px", "346px", "346px"];
            performAction([
                    {
                        "action": "close",
                        "targets": inputz
                    },
                    {
                        "action": "setAlphaAction",
                        "target": "pboActives",
                        "data": {
                            "alpha": 0
                        }
                    },
                    {
                        "action": "#spawnOnce",
                        "data": {
                            "overlayId": "midInputImg2",
                            "alpha": 0
                        }
                    },
                    {
                        "action": "bringToFront",
                        "target": "midInputCont"
                    },
                    {
                        "action": "bringToFront",
                        "target": "bottomInputCont"
                    },
                    {
                        "action": "bringToFront",
                        "target": "pboAssetsBtn"
                    },
                    {
                        "action": "animate",
                        "target": "bottomInputCont",
                        "data": {
                            "animationIds": [
                                "inputDown"
                            ]
                        }
                    },
                    {
                        "action": "animate",
                        "target": "midInputImg",
                        "data": {
                            "animationIds": [
                                "alphaOut"
                            ]
                        }
                    },
                    {
                        "action": "animate",
                        "target": "midInputImg2",
                        "data": {
                            "animationIds": [
                                "alphaIn"
                            ]
                        }
                    },
                    {
                        "action": "setPositionAction",
                        "target": "submitMagicButton",
                        "data": {
                            "x": "490px",
                            "y": "568px"
                        }
                    }
                ]
            )
            setTimeout(function () {

                for (var i = 0; i < inputz.length; i++) {

                    moreBorg.spawn({
                        "overlayId": inputz[i],
                        "persistence": "package",
                        "x": xz[i],
                        "y": yz[i],
                        "width": "155px",
                        "height": "44px",
                        "alpha": 0

                    }, false)


                    //                    moreBorg.containerSpawn({"overlayId": inputz[i]}, 'midInputCont', true)
                }


                //                borg.moveOverlay("midInputImg", "304px", "97px");
                //                borg.moveOverlay("pboActives", "121px", "148px");
                //                borg.moveOverlay("pboActivesBtn", "121px", "148px");
                //                borg.moveOverlay("pboVesteds", "304px", "148px");
                //                borg.moveOverlay("pboVestedsBtn", "304px", "148px");
                //                borg.moveOverlay("pboRetirees", "486px", "148px");
                //                borg.moveOverlay("pboRetireesBtn", "486px", "148px");
            }, 200);
            setTimeout(function () {
                performAction([
                    {
                        "action": "setAlphaAction",
                        "targets": inputz,
                        "data": {
                            "alpha": 1
                        }
                    }
                ])
            }, 205);
        }

        //TODO: added for shelf bugs
        setTimeout(function () {
            (firstOverallRun) ? moreBorg.spawn('initialBlocker',true) : false
            firstOverallRun = false;
            borg.runAction({
                "action": "bringToFront",
                "trigger": "now",
                "target": "initialBlocker"

            });
        }, 205);

    }
    pensionCalc.popInit = function (inDollars, inDropdown) {
        //TODO: SAVESTATE
        //        var time = (inDropdown) ? 100 : 505
        //        setTimeout(function () {
        //            for (var i = 0; i < pensionCalc.pboFieldArr.length; i++) {
        //                var currVal;
        //                if (inDollars) {
        //                    currVal = (dollarObj[pensionCalc.pboFieldArr[i]]) ? dollarObj[pensionCalc.pboFieldArr[i]] : "";
        //                } else {
        //                    currVal = (percentObj[pensionCalc.pboFieldArr[i]]) ? percentObj[pensionCalc.pboFieldArr[i]] : "";
        //                }
        //                borg.setText(pensionCalc.pboFieldArr[i], addCommas(String(currVal)));
        //                inputObj[pensionCalc.pboFieldArr[i]]= currVal;
        //                if (currVal != '') {
        //                    pensionCalc.inputs[pensionCalc.pboFieldArr[i]] = currVal
        //                    console.log(JSON.stringify(pensionCalc.inputs))
        //                } else {
        //                }
        //                console.log(currVal + addCommas(String(pensionCalc.pboFieldArr[i])))
        //            }
        //
        //        }, time);
    }
    pensionCalc.popCurrFields = function (currDropdown) {
        var currArr = pensionCalc[currDropdown + "FieldArr"]
        //        console.log("currarraaa" + JSON.stringify(currArr))
        console.log("pensionCalc.inputs at top popcurrfields" + JSON.stringify(pensionCalc.inputs))
        console.log("inputObj at top popcurrfields" + JSON.stringify(inputObj))

        //        console.log("3unchanged" + JSON.stringify(unChangedInputs))
        //        console.log("3inputs" + JSON.stringify(pensionCalc.inputs))
        //        unChangedInputs = {}
        //        for (var i in pensionCalc.inputs) {
        //            unChangedInputs[i] = pensionCalc.inputs[i]
        //        }
        //        console.log("unchanged" + JSON.stringify(unChangedInputs))
        //        unChangedInputs = pensionCalc.inputs

        firstOpened = true;

        setTimeout(function () {

            //fixing bug that allows participants to be submitted without actually being in
            if (!pensionCalc.submittedParticipants && currDropdown == 'part') {
                for (i in currArr) {
                    delete pensionCalc.inputs[currArr[i]]
                    delete inputObj[currArr[i]]
                    borg.setText(currArr[i], "");
                }

                console.log("pensionCalc.inputs aftezr popcurrfields" + JSON.stringify(pensionCalc.inputs))
                console.log("inputObj afterz" + JSON.stringify(inputObj))


            } else {
            }

            for (var i in currArr) {
                if (pensionCalc.inputs[currArr[i]] && currDropdown == "pbo") {
                    //                    console.log("setinputs first if" + JSON.stringify(pensionCalc.inputs))

                    //entered but then toggled nav, clear out garbage
                    if (pensionCalc.inputs[currArr[i]] != unChangedInputs[currArr[i]]) {
                        console.log(currArr[i] + " UC IS " + unChangedInputs[currArr[i]])
                        pensionCalc.inputs[currArr[i]] = unChangedInputs[currArr[i]]
                    } else {
                    }

                    if (pensionCalc.pboInDollars) {
                        borg.setText(currArr[i], addCommas(pensionCalc.inputs[currArr[i]]));

                    } else {
                        borg.setText(currArr[i], addCommas(percentObj[currArr[i]]));
                    }
                }
                //Participant DD
                else if (pensionCalc.reachedParticipants && currDropdown == 'part') {

                    //TODO: This is mercer space ticket 53
                    if (pensionCalc.inputs[currArr[i]] === "") {
                        continue

                    } else {
                        borg.setText(currArr[i], addCommas(pensionCalc[currArr[i]]))
                        pensionCalc.inputs[currArr[i]] = pensionCalc[currArr[i]]
                    }

                }
                //Adv Settings DD
                else if (pensionCalc.inputs2[currArr[i]]) {
                    //                    alert("setexting"+ currArr[i] + "to" +pensionCalc.inputs2[currArr[i]] )
                    if (i == 0 || i == 1 || i == 2 || i == 3) {
                        borg.setText(currArr[i], addCommas(pensionCalc.inputs2[currArr[i]]));
                    } else {
                        borg.setText(currArr[i], pensionCalc.inputs2[currArr[i]]);
                    }

                } else if (currArr == pensionCalc["advFieldArr"] && !pensionCalc.inputs2[currArr[i]]) {
                    //                    console.log('nothing here using defaults' + currArr[i])
                    //                    borg.setText(currArr[i], pensionCalc.inputs2[currArr[i]]);

                } else {
                    //                    console.log('else' + currArr[i])
                }
            }
        }, 602);

    }
    pensionCalc.popToggleObjSuper = function (inDollars) {
        var checker;
        var myArr;
        if (firstOpened) {
            checker = pensionCalc.pboInDollars
            myArr = pensionCalc.inputs;
        } else {
            checker = inDollars
            myArr = inputObj;
        }
        //        console.log("poptoggleobj" + JSON.stringify(inputObj) + checker)
        //        console.log("poptoggleobzzzzzzzj" + JSON.stringify(pensionCalc.inputs) + checker)
        //        console.log("inputs"+JSON.stringify(pensionCalc.inputs))
        for (i in myArr) {
            if (checker) {
                dollarObj[i] = myArr[i]
            } else {
                percentObj[i] = myArr[i]
            }
        }
        //        console.log("dollarPOP" + JSON.stringify(dollarObj))
        //        console.log("percentPOP" + JSON.stringify(percentObj))
    }
    pensionCalc.deletePBOArrSuper = function (inDollars) {

        //        console.log("dleetepboarr firstopended"+firstOpened)
        //        if (firstOpened){
        //            firstOpened = false;
        //            return
        //        }

        First1 = ""
        console.log(JSON.stringify(inputObj) + onInputPage)
        if (onInputPage) {
            pensionCalc.inputs = {};
        } else {
        }

        for (var i = 0; i < pensionCalc.pboFieldArr.length; i++) {
            //            delete pensionCalc.inputs[pensionCalc.pboFieldArr[i]]
            console.log('deleting inputobj')
            delete inputObj[pensionCalc.pboFieldArr[i]]
            borg.setText(pensionCalc.pboFieldArr[i], "");
        }

        if (inDollars) {
            for (var k in dollarObj) {
                //                console.log("setting " + k + " to " + dollarObj[k])
                borg.setText(k, addCommas(dollarObj[k]));
            }
        } else {
            for (var k in percentObj) {
                //                console.log("Psetting " + k + " to " + percentObj[k])
                borg.setText(k, addCommas(percentObj[k]));
            }
        }
        console.log("dollarObjAFz" + JSON.stringify(dollarObj))
        console.log("percentObjAFz" + JSON.stringify(percentObj))
        firstOpened = false;
    }
    pensionCalc.deletePBOArr = function (inDollars) {

        First1 = ""
        var currVal = "";
        for (var i = 0; i < pensionCalc.pboFieldArr.length; i++) {

            //                currVal = (pensionCalc.inputs[pensionCalc.pboFieldArr[i]]) ? pensionCalc.inputs[pensionCalc.pboFieldArr[i]] : ""
            if (inDollars) {
                currVal = (dollarObj[pensionCalc.pboFieldArr[i]]) ? dollarObj[pensionCalc.pboFieldArr[i]] : "";
            } else {
                currVal = (percentObj[pensionCalc.pboFieldArr[i]]) ? percentObj[pensionCalc.pboFieldArr[i]] : "";
            }

            borg.setText(pensionCalc.pboFieldArr[i], addCommas(currVal));
            delete inputObj[pensionCalc.pboFieldArr[i]]
        }
    }
    pensionCalc.storeNewPBO = function () {
        console.log(JSON.stringify("storenewpbo"))

        if (pensionCalc.pboInDollars) {
            for (var i in percentObj) {
                delete percentObj[i];
            }

        } else {
            for (var i in dollarObj) {
                delete dollarObj[i];
            }
        }
        firstOpened = true;

    }
    pensionCalc.inputPageToggle = function (isDollarToggle) {
        //        console.log("inputpage toggle new")
        if (isDollarToggle) {
            pensionCalc.pboInDollars = true;
            checkIfPercent(true);
            pensionCalc.toggleInitialInputs(true);
            pensionCalc.deletePBOArr(true);

            pensionCalc.inputs = {};
            inputObj = {}
            dollarObj = {}
            percentObj = {}
            //            pensionCalc.reset();
            //            pensionCalc.clear();

        } else {
            pensionCalc.pboInDollars = false;
            checkIfPercent(true);
            pensionCalc.toggleInitialInputs(false);
            pensionCalc.deletePBOArr(false);

            pensionCalc.inputs = {};
            inputObj = {}
            dollarObj = {}
            percentObj = {}

            //            pensionCalc.reset();
            //            pensionCalc.clear();
        }
    }
    pensionCalc.dropDownToggle = function (isDollarToggle) {
        //        console.log("ddToggle new")
        if (isDollarToggle) {
            pensionCalc.pboInDollars = true;
            checkIfPercent(true);
            pensionCalc.deletePBOArr(true);

        } else {
            pensionCalc.pboInDollars = false;
            checkIfPercent(true);
            pensionCalc.deletePBOArr(false);
        }
    }

    //clearing and resetting functions
    pensionCalc.clear = function (isAdv) {

        if (isAdv) {

            pensionCalc.PBGCArr = [];
            pensionCalc.varArr = [];
            pensionCalc.adminArr = [];
            pensionCalc.otherArr = [];
            pensionCalc.totalArr = [];
            pensionCalc.longevityArr = [];
            pensionCalc.longevityNums = [];
            pensionCalc.tenYearArr = [];
            pensionCalc.varTotal = 0;
            pensionCalc.adminTotal = 0;
            pensionCalc.otherTotal = 0;
            pensionCalc.participantTotal = 0;
            pensionCalc.fullTotal = 0;
            pensionCalc.tenYearTotal = 0;
            pensionCalc.longevityTotal = 0;
            pensionCalc.outputStr = "";


        } else {
            init(true);
        }
    }
    pensionCalc.reset = function () {
        init();

        pensionCalc.scenarioDDObj = {
            "TV": false,
            "PA": false,
            "B": false
        }
    }
    pensionCalc.resetSliders = function () {

        //        alert(ELast + ":" + RALast + ":" + RELast)
        pensionCalc.TVTransferPercent = 0
        ELast = 34;
        borg.moveOverlay("sliderDotE", 34 + "px", "70px");
        RELast = 34;
        pensionCalc.BOIndex = 1.08
        borg.moveOverlay("sliderDotRA", 264 + "px", "70px");
        pensionCalc.retireeTransferPercent = 0
        RALast = 264;
        borg.moveOverlay("sliderDotRE", 34 + "px", "70px");
        pensionCalc.calcAllCosts(false, true);

        console.log('CLEARING -- ')
        savedSliders = {};
        graphObj.pboAfterScenario();
        chartObj.setUpAfterScenario();


    }
    pensionCalc.resetAdvSettings = function () {

        pensionCalc.inputs2 = {};
        pensionCalc.PBGC = 50;
        pensionCalc.discountRate = 1;
        moreBorg.toggle('discountRateToggle2', 'on');
        pensionCalc.adminCostsArr = [30, 30, 30];
        pensionCalc.otherCostsArr = [.05, .05, .05];
        pensionCalc.longRateArr = [0.025, 0.025, 0.025];
        var bigArr = pensionCalc.adminCostsArr.concat(pensionCalc.longRateArr)
        for (var i = 0; i < pensionCalc.advFieldArr.length; i++) {
            delete inputObj[pensionCalc.advFieldArr[i]]
            borg.setText(pensionCalc.advFieldArr[i], "");
        }

        var d = pensionCalc.getAdvInputs();
        pensionCalc.calcAllCosts(d, false, true);
        //        graphObj.pboAfterAdv();

    }
    pensionCalc.uberReset = function () {
        lastNavButton = 'NA';
        //        pensionCalc.TVTransferPercent, pensionCalc.BOIndex, pensionCalc.retireeTransferPercent
        //
        //        ELast = '-1';
        //        RALast = '-1';
        //        RELast = '-1';

        onInputPage = true;

        pensionCalc.scenarioDDObj = {
            "TV": false,
            "PA": false,
            "B": false
        }
        pensionCalc.sNum = -1;

        pensionCalc.closeAdvSettings();
        pensionCalc.reset();
        pensionCalc.clear();
        pensionCalc.beforeObj = {};
        performAction([
            {
                "action": "animate",
                "trigger": "touchUpInside",
                "targets": ["advSettingsCont"],
                "data": {
                    "animationId": "navAdvContUp"
                }
            },
            {
                "action": "close",
                "trigger": "touchUpInside",
                "targets": ["advSettingsCont", "optionsCont" ]
            },
            {
                "action": "#goToPage",
                "delay": 0.01,
                "trigger": "touchUpInside",
                "data": {
                    "pageId": "firstInputs",
                    "transitionType": "slideback",
                    "transitionDuration": 0.5
                }
            }

        ])

    }
    pensionCalc.backToShelf = function () {
        performAction([
            {
                "action": "close",
                "targets": pensionCalc.inputz
            },
            {
                "action": "close",
                "targets": pensionCalc.advFieldzArr
            },
            {
                "action": "close",
                "targets": pensionCalc.partFieldArr
            }
        ])
    }

    return pensionCalc;
}());

var graphObj = {
    maxHeight: 260,
    maxHeightTC: 190,
    perPixel: -1,
    width: 97,
    widthTC: 124,
    pboActivesHeight: -1,
    pboVestedsHeight: -1,
    pboRetireesHeight: -1,
    pboAssetsHeight: -1,
    pboAddCostsHeight: -1,

    oldPboActivesHeight: -1,
    oldPboVestedsHeight: -1,
    oldPboRetireesHeight: -1,
    oldPboAssetsHeight: -1,
    oldPboAddCostsHeight: -1,
    onScenario: -1,


    initPBOgraph: function () {

        if (pensionCalc.reachedScenario) {
            graphObj.animateFacets(false, 0)

            setTimeout(function () {
                graphObj.animateFacets(true, 0)
            }, 700);
            return;
        } else {

        }

        moreBorg.setImages('graphLegend', "img/01_pbo_legend.png")
        borg.moveOverlay("graphLegend", "501px", "127px");
        //pensionCalc.pboTotal = pensionCalc.pboActives + pensionCalc.pboVesteds + pensionCalc.pboRetirees;
        //        console.log(JSON.stringify(pensionCalc.inputs))

        var divBy = 0;
        if (pensionCalc.pboDeficit < 0) {
            //            alert('SURPLUS')

            setTimeout(function () {
                moreBorg.setImages('chart1Img', "img/01_pbo_table_surplus.png")
                //                moreBorg.close('chart1Img')
                //                alert('zzzz')
            }, 1250);
            divBy = Math.abs(pensionCalc.pboAssets)


        } else {
            divBy = pensionCalc.pboTotal
        }

        var perPixel = graphObj.maxHeight / divBy;

        console.log("initPBOGraph divBy" + divBy + "!")
        console.log("initPBOGraph perPixel" + perPixel + "!!!!")

        this.oldPboActivesHeight = this.pboActivesHeight = Math.round(perPixel * ((pensionCalc.pboActives / divBy) * divBy))
        this.oldPboVestedsHeight = this.pboVestedsHeight = Math.round(perPixel * ((pensionCalc.pboVesteds / divBy) * divBy)) + this.pboActivesHeight
        this.oldPboRetireesHeight = this.pboRetireesHeight = Math.round(perPixel * ((pensionCalc.pboRetirees / divBy) * divBy)) + this.pboVestedsHeight

        this.oldPboAssetsHeight = this.pboAssetsHeight = Math.round(perPixel * ((pensionCalc.pboAssets / divBy) * divBy))


        //        alert(pensionCalc.pboTotal + "" + perPixel + " "+this.pboActivesHeight + " " + this.pboVestedsHeight + " " + this.pboRetireesHeight + " " + this.pboAssetsHeight)

        var graphArr = [];

        graphArr.push(
            {
                "overlayId": "retireesGraphCont",
                "width": graphObj.width + "px",
                "height": graphObj.pboRetireesHeight + "px",
                "y": 280 - graphObj.pboRetireesHeight + "px"
            },
            {
                "overlayId": "vestedsGraphCont",
                "width": graphObj.width + "px",
                "height": graphObj.pboVestedsHeight + "px",
                "y": 280 - graphObj.pboVestedsHeight + "px"
            },
            {
                "overlayId": "activesGraphCont",
                "width": graphObj.width + "px",
                "height": graphObj.pboActivesHeight + "px",
                "y": 280 - graphObj.pboActivesHeight + "px"
            },
            {
                "overlayId": "assetsGraphCont",
                "width": graphObj.width + "px",
                "height": graphObj.pboAssetsHeight + "px",
                "y": 280 - graphObj.pboAssetsHeight + "px",
                "x": "384px"
            }
        )

        moreBorg.replaceOverlays('graphCont', graphArr)
        moreBorg.close("graphLabel1")
        moreBorg.spawn("graphLabel1", true)
        moreBorg.spawn("graphLabel2", true)
        graphObj.animateFacets(false, 0)

        setTimeout(function () {
            graphObj.animateFacets(true, 0)
        }, 700);
        this.onScenario = false;

        //        alert(this.pboActivesHeight + " " + this.pboVestedsHeight + " " + this.pboRetireesHeight + " " + this.pboAssetsHeight)
    },
    pboAfterParticipants: function () {

        pensionCalc.reachedParticipants = true;
        if (pensionCalc.reachedScenario) {
            graphObj.animateFacets(false, 1)

            setTimeout(function () {
                graphObj.animateFacets(true, 1)
            }, 700);
            return;
        } else {
        }

        moreBorg.setImages('graphLegend', "img/02_participant_legend.png")
        borg.moveOverlay("graphLegend", "500px", "155px");
        moreBorg.close("graphCont")
        moreBorg.spawn("graphCont", true)
        //        console.log(JSON.stringify(pensionCalc.inputs))

        var divBy = 0;
        //        var adMax = Math.max.apply(null, pensionCalc.adminCostsArr)

        //get the max of all these arrays
        var tenMax = Math.max.apply(null, pensionCalc.tenYearArr)
        var longMax = Math.max.apply(null, pensionCalc.longRateArr)
        var allMax = Math.max.apply(null, [longMax, tenMax])

        console.log(pensionCalc.pboTotalwFee + " -- " + Math.abs(allMax))

        //TODO: Following line is bugfix 93 in mercer space
        pensionCalc.pboDeficit = pensionCalc.pboTotalwFee - pensionCalc.pboAssets
        if (pensionCalc.pboDeficit < 0) {
            console.log('SURPLUS2 -- after partcipants if ')
            setTimeout(function () {
                moreBorg.setImages('chart2Img', "img/03_participant_table_surplus.png")

            }, 1250);

            //TODO: this is fix for bug 9213 - if it messes things up uncomment line below and comment out if structure
            //            divBy = (pensionCalc.pboAssets > allMax) ? Math.abs(pensionCalc.pboAssets) : Math.abs(allMax)

            if (pensionCalc.pboTotalwFee > pensionCalc.pboAssets) {
                divBy = Math.abs(pensionCalc.pboTotalwFee)
            }
            else if (pensionCalc.pboAssets > allMax) {
                divBy = Math.abs(pensionCalc.pboAssets)
            } else {
                divBy = Math.abs(allMax);
            }

        } else {
            console.log('else -  after partcipants else ')
            console.log(pensionCalc.pboTotalwFee + " -- " + Math.abs(allMax))
            divBy = (pensionCalc.pboTotalwFee > allMax) ? Math.abs(pensionCalc.pboTotalwFee) : Math.abs(allMax)
        }

        //        alert(pensionCalc.pboAddlCost)
        //        alert(allMax)
        //        alert(divBy)

        var perPixel = graphObj.maxHeight / divBy;

        //        console.log(divBy + "!")
        //        console.log(perPixel + "!!!!")

        this.oldPboActivesHeight = this.pboActivesHeight = Math.round(perPixel * ((pensionCalc.pboActives / divBy) * divBy))
        this.oldPboVestedsHeight = this.pboVestedsHeight = Math.round(perPixel * ((pensionCalc.pboVesteds / divBy) * divBy)) + this.pboActivesHeight
        this.oldPboRetireesHeight = this.pboRetireesHeight = Math.round(perPixel * ((pensionCalc.pboRetirees / divBy) * divBy)) + this.pboVestedsHeight
        this.oldPboAddCostsHeight = this.pboAddCostsHeight = Math.round(perPixel * (((pensionCalc.tenYearTotal + pensionCalc.longevityTotal) / divBy) * divBy)) + this.pboRetireesHeight

        this.oldPboAssetsHeight = this.pboAssetsHeight = Math.round(perPixel * ((pensionCalc.pboAssets / divBy) * divBy))

        pensionCalc.pboFundedStatus = pensionCalc.pboAssets / pensionCalc.pboTotalwFee;
        pensionCalc.pboDeficit = pensionCalc.pboTotalwFee - pensionCalc.pboAssets;
        //        alert(pensionCalc.pboFundedStatus)

        //        alert(pensionCalc.pboTotalwFee + " "
        //            + this.pboActivesHeight + " " + this.pboVestedsHeight + " "
        //            + this.pboRetireesHeight + " " + this.pboAssetsHeight + " " + this.pboAddCostsHeight)

        var graphArr = [];

        graphArr.push(
            {
                "overlayId": "addCostGraphCont",
                "width": graphObj.width + "px",
                "height": graphObj.pboAddCostsHeight + "px",
                "y": 280 - graphObj.pboAddCostsHeight + "px"
            },
            {
                "overlayId": "retireesGraphCont",
                "width": graphObj.width + "px",
                "height": graphObj.pboRetireesHeight + "px",
                "y": 280 - graphObj.pboRetireesHeight + "px"
            },
            {
                "overlayId": "vestedsGraphCont",
                "width": graphObj.width + "px",
                "height": graphObj.pboVestedsHeight + "px",
                "y": 280 - graphObj.pboVestedsHeight + "px"
            },
            {
                "overlayId": "activesGraphCont",
                "width": graphObj.width + "px",
                "height": graphObj.pboActivesHeight + "px",
                "y": 280 - graphObj.pboActivesHeight + "px"
            },
            {
                "overlayId": "assetsGraphCont",
                "width": graphObj.width + "px",
                "height": graphObj.pboAssetsHeight + "px",
                "y": 280 - graphObj.pboAssetsHeight + "px",
                "x": "384px"
            }
        )

        //        console.log(JSON.stringify(this.oldPboRetireesHeight))
        moreBorg.replaceOverlays('graphCont', graphArr)

        moreBorg.close("graphLabel1")
        borg.runAction({
                "action": "#spawnOnce",
                "trigger": "toggleOn",
                "data": {
                    "overlayId": "graphLabel1",
                    "x": "300px",
                    "images": ["img/02_participant_label_truecosts.png"]
                }
            }
        )
        moreBorg.spawn("graphLabel2", true)

        //        alert(this.pboActivesHeight + " " + this.pboVestedsHeight + " " + this.pboRetireesHeight + " " + this.pboAssetsHeight)
        graphObj.animateFacets(false, 1)

        setTimeout(function () {
            graphObj.animateFacets(true, 1)
        }, 700);
        this.onScenario = false;
        moreBorg.close("scenarioFakeBtn")
        moreBorg.containerSpawn({"overlayId": "scenarioBtn"}, 'optionsCont', true)

        if (Object.keys(pensionCalc.beforeObj).length == 0) {
            pensionCalc.beforeObj['PBGCTotalCosts'] = pensionCalc.PBGCTotalCosts
            pensionCalc.beforeObj['adminTotal'] = pensionCalc.adminTotal
            pensionCalc.beforeObj['participantTotal'] = pensionCalc.participantTotal

            console.log('Storing BEFOREOBJ : ' + JSON.stringify(pensionCalc.beforeObj))
        } else {
        }


    },
    pboAfterScenario: function () {
        //TODO: 0=Lump Sums to TV 1=Purchase Annuties 4 Retirees 2= Both
        pensionCalc.reachedScenario = true;


        //sliders are:
        //        pensionCalc.TVTransferPercent, pensionCalc.BOIndex, pensionCalc.retireeTransferPercent

        if (!pensionCalc.submittedParticipants) {
            borg.runAction({
                action: "gotoURLAction",
                trigger: "now",
                target: "#systemPage",
                data: {
                    failureTitle: "Error",
                    failureMessage: "Didnt Submit Participant Info",
                    url: "alert://localhost/"
                }
            });
            //            alert('didnt submit participant info')
            return;
        } else {
        }


        var divBy = 0;
        var adMax = Math.max.apply(null, pensionCalc.adminCostsArr)
        var tenMax = Math.max.apply(null, pensionCalc.tenYearArr)
        var longMax = Math.max.apply(null, pensionCalc.longRateArr)
        var allMax = Math.max.apply(null, [longMax, tenMax])

        var currTot
        if (pensionCalc.TVTransferPercent == 0 && pensionCalc.BOIndex == 1.08 && pensionCalc.retireeTransferPercent == 0) {
            currTot = pensionCalc.pboTotalwFee
        } else {
            currTot = pensionCalc["pboTotalwFee" + pensionCalc.scenarioRef[pensionCalc.sNum]];
        }
        var currAss = pensionCalc["pboAssets" + pensionCalc.scenarioRef[pensionCalc.sNum]];
        var currFund = currAss / currTot;
        var currDef = currTot - currAss;
        var oldDef = Math.round(pensionCalc.pboTotalwFee - pensionCalc.pboAssets)

                        console.log("oldDef:: "+oldDef + " ::currDef " + currDef)


        if (oldDef < 0) {
            //            alert('surplus3')
            setTimeout(function () {
                moreBorg.setImages('chart3Img', "img/04_scenario_table_surplus.png")
                //                moreBorg.close('chart1Img')
                //                alert('zzzz')
            }, 1250);

            //TODO: this is fix for bug 9213 - if it messes things up uncomment line below and comment out if structure
            //            divBy = (pensionCalc.pboAssets > allMax) ? Math.abs(pensionCalc.pboAssets) : Math.abs(allMax)

            if (pensionCalc.pboTotalwFee > pensionCalc.pboAssets) {
                console.log('divBy If')
                divBy = Math.abs(pensionCalc.pboTotalwFee)
            }
            else if (pensionCalc.pboAssets > allMax) {
                console.log('divBy ELSE IF')
                divBy = Math.abs(pensionCalc.pboAssets)
            } else {
                console.log('divBy ELSE')
                divBy = Math.abs(allMax);
            }


        }
        else {
            divBy = (pensionCalc.pboTotalwFee > allMax) ? Math.abs(pensionCalc.pboTotalwFee) : Math.abs(allMax)
            console.log('divBy ENDING ELSE  ' + pensionCalc.pboTotalwFee +" -- "+allMax + "  "+ divBy)

            if ((oldDef > 0 && currDef < 0)||(oldDef < 0 && currDef > 0)) {
                //get rid of falsh
            } else {
                setTimeout(function () {
                    moreBorg.setImages('chart3Img', "img/04_scenario_table.png")
                    //                moreBorg.close('chart1Img')
                    //                alert('zzzz')
                }, 300);
            }

        }
        //TODO: added for ticket 65
//                alert("OLD "+oldDef+" CURR "+currDef)
        if (oldDef < 0 && currDef > 0) {
            setTimeout(function () {
                moreBorg.setImages('chart3Img', "img/04_scenario_table_both.png")
                borg.moveOverlay("chart3Img", "512px", "105.5px");

            }, 1250);

            //TODO: new image set here
        } else if(oldDef > 0 && currDef < 0){
            setTimeout(function () {
                moreBorg.setImages('chart3Img', "img/04_scenario_table_bothDS.png")
            }, 1250);
        }
        else {
        }


        var perPixel = graphObj.maxHeight / divBy;

        //        console.log("divBy1 is  " + divBy + "!")
        //        console.log("perPixel  " + perPixel + "!!!!")


        //        var perPixel = graphObj.maxHeight / pensionCalc.pboTotalwFee;
        //        alert(perPixel)

        this.oldPboActivesHeight = this.pboActivesHeight = Math.round(perPixel * ((pensionCalc.pboActives / divBy) * divBy))
        this.oldPboVestedsHeight = this.pboVestedsHeight = Math.round(perPixel * ((pensionCalc.pboVesteds / divBy) * divBy)) + this.pboActivesHeight
        this.oldPboRetireesHeight = this.pboRetireesHeight = Math.round(perPixel * ((pensionCalc.pboRetirees / divBy) * divBy)) + this.pboVestedsHeight
        this.oldPboAddCostsHeight = this.pboAddCostsHeight = Math.round(perPixel * (((pensionCalc.pboAddlCost) / divBy) * divBy)) + this.pboRetireesHeight

        //        this.oldPboAssetsHeight = this.pboAssetsHeight = Math.round(perPixel * (pensionCalc.pboFundedStatus * pensionCalc.pboTotalwFee))
        this.oldPboAssetsHeight = this.pboAssetsHeight = Math.round(perPixel * ((pensionCalc.pboAssets / divBy) * divBy))
        console.log("this.oldPboActivesHeight   "+ this.oldPboActivesHeight + "--- this.oldPboVestedsHeight    "+ this.oldPboVestedsHeight + "-----this.oldPboRetireesHeight    " + this.oldPboRetireesHeight+ "-----this.oldPboAddCostsHeight    "+ this.oldPboAddCostsHeight+ "-----this.oldPboAssetsHeight   "+ this.oldPboAssetsHeight)


        var graphArr = [];
        var graphArr2 = [];


        var stablizer = 1;
        //TODO: change if after graph isnt working right
        if (pensionCalc.pboDeficit < 0) {

            //TODO: this is fix for bug 9213 - if it messes things up uncomment line below and comment out if structure
            //            divBy = (pensionCalc["pboAssets" + pensionCalc.scenarioRef[pensionCalc.sNum]] > allMax) ? Math.abs(pensionCalc["pboAssets" + pensionCalc.scenarioRef[pensionCalc.sNum]]) : Math.abs(allMax)

            var currAssets = pensionCalc["pboAssets" + pensionCalc.scenarioRef[pensionCalc.sNum]]
            var scenName = pensionCalc.scenarioRef[pensionCalc.sNum]
            var divByTot = Math.abs(pensionCalc["pboActives" + scenName] + pensionCalc["pboVesteds" + scenName] + pensionCalc["pboRetirees" + scenName] + pensionCalc["pboAddlCost" + scenName])


            if (divByTot > currAssets) {
                divBy = Math.abs(divByTot)
            }
            else if (currAssets > allMax) {
                divBy = Math.abs(currAssets)
            } else {
                divBy = Math.abs(allMax);
            }


            //            console.log("DIVBY IF : " + divBy)
        } else {
            var scenName = pensionCalc.scenarioRef[pensionCalc.sNum]
            var divByTot = Math.abs(pensionCalc["pboActives" + scenName] + pensionCalc["pboVesteds" + scenName] + pensionCalc["pboRetirees" + scenName] + pensionCalc["pboAddlCost" + scenName])
            console.log(divBy + " or --  or " + divByTot)

            if (divBy > divByTot) {
                console.log("using normal divBy")
                stablizer = 1;

            } else if (isNaN(divByTot)) {
                console.log("using normal divBy because of isnan")
                stablizer = 1;

            } else {
                //                divBy = divByTot
                stablizer = pensionCalc["pboTotalwFee" + pensionCalc.scenarioRef[pensionCalc.sNum]] / divByTot
                console.log("using Big divBy stablizer is : " + stablizer)
            }
        }

        var perPixel2 = graphObj.maxHeight / divBy;

        //TODO: change if after graph isnt working right
        //        var perPixel2 = perPixel;

                console.log("stablizer-- " + stablizer + " --divBy-- " + divBy+ " --perPixel-- " + perPixel+ " --perPixel2-- " + perPixel2)
        //TODO: 0=Lump Sums to TV 1=Purchase Annuties 4 Retirees 2= Both


        //TODO: Added for MErcer space 95 jennes special case
        var myTot = pensionCalc["pboActives" + pensionCalc.scenarioRef[pensionCalc.sNum]] + pensionCalc["pboVesteds" + pensionCalc.scenarioRef[pensionCalc.sNum]]+ pensionCalc["pboRetirees" + pensionCalc.scenarioRef[pensionCalc.sNum]]+pensionCalc["pboAddlCost" + pensionCalc.scenarioRef[pensionCalc.sNum]]
        if (pensionCalc.sNum == 2 && myTot < pensionCalc["pboTotalwFee" + pensionCalc.scenarioRef[pensionCalc.sNum]] ) {
            var diff = pensionCalc["pboTotalwFee" + pensionCalc.scenarioRef[pensionCalc.sNum]]-myTot
            console.log("diff " +diff + " myTot "+ myTot + " pensionwscenario "+ pensionCalc["pboTotalwFee" + pensionCalc.scenarioRef[pensionCalc.sNum]])

            var aRatio = pensionCalc["pboActives" + pensionCalc.scenarioRef[pensionCalc.sNum]] / myTot
            var vRatio = pensionCalc["pboVesteds" + pensionCalc.scenarioRef[pensionCalc.sNum]] / myTot
            var rRatio = pensionCalc["pboRetirees" + pensionCalc.scenarioRef[pensionCalc.sNum]] / myTot
            var aAlloc = diff * aRatio
            var vAlloc = diff * vRatio
            var rAlloc = diff * rRatio

            aAlloc = (isFinite(aAlloc)) ? aAlloc : 0
            vAlloc = (isFinite(vAlloc)) ? vAlloc : 0
            rAlloc = (isFinite(rAlloc)) ? rAlloc : 0


        } else {
            aAlloc = 0
            vAlloc = 0
            rAlloc = 0
        }
        console.log(aAlloc + " "+vAlloc + " "+rAlloc )

        //TODO: Following lines are bugfix 95 in mercer space (perpixel2 to perpixel)
        var activesH = Math.round(stablizer * perPixel * (((pensionCalc["pboActives" + pensionCalc.scenarioRef[pensionCalc.sNum]]+aAlloc )/ divBy) * divBy))
        var vestedsH = Math.round(stablizer * perPixel * (((pensionCalc["pboVesteds" + pensionCalc.scenarioRef[pensionCalc.sNum]]+ vAlloc) / divBy) * divBy)) + activesH
        var retireesH = Math.round(stablizer * perPixel * (((pensionCalc["pboRetirees" + pensionCalc.scenarioRef[pensionCalc.sNum]]+rAlloc ) / divBy) * divBy)) + vestedsH
        var addlCostsH = Math.round(stablizer * perPixel * (((pensionCalc["pboAddlCost" + pensionCalc.scenarioRef[pensionCalc.sNum]]) / divBy) * divBy)) + retireesH
        var assetsH = Math.round(stablizer * perPixel * ((pensionCalc["pboAssets" + pensionCalc.scenarioRef[pensionCalc.sNum]] / divBy) * divBy))

        if (activesH < 0) {
            activesH = 0
        }
        if (vestedsH < 0) {
            vestedsH = 0
        }
        if (retireesH < 0) {
            retireesH = 0
        }
        if (addlCostsH < 0) {
            addlCostsH = 0
        }
        if (assetsH < 0) {
            assetsH = 0
        }

//        console.log("activesH   "+ activesH + "--- vestedsH    "+ vestedsH + "-----retireesH    " + retireesH+ "-----addlCostsH    "+ addlCostsH+ "-----assetsH   "+ assetsH + ":::::::::"+ pensionCalc["pboTotalwFee" + pensionCalc.scenarioRef[pensionCalc.sNum]])
//        console.log("activesH   "+ pensionCalc["pboActives" + pensionCalc.scenarioRef[pensionCalc.sNum]] + "--- vestedsH    "+ pensionCalc["pboVesteds" + pensionCalc.scenarioRef[pensionCalc.sNum]] + "-----retireesH    " + pensionCalc["pboRetirees" + pensionCalc.scenarioRef[pensionCalc.sNum]]+ "-----addlCostsH    "+ pensionCalc["pboAddlCost" + pensionCalc.scenarioRef[pensionCalc.sNum]]+ "-----assetsH   "+ pensionCalc["pboAssets" + pensionCalc.scenarioRef[pensionCalc.sNum]] + ":::::::::"+ pensionCalc["pboTotalwFee" + pensionCalc.scenarioRef[pensionCalc.sNum]])

        var assetsOv;

        if (assetsH <= 0 || !isFinite(assetsH)) {
            assetsOv = {
                "overlayId": "negAssetsImg"
            }

        } else {
            assetsOv = {
                "overlayId": "assetsGraphContAfter",
                "//onTouchUp": "alert('" + assetsH + "')",
                "width": graphObj.width + "px",
                "height": assetsH + "px",
                "y": 290 - assetsH + "px",
                "x": "252px"
            }
        }

        graphArr.push(
            {
                "overlayId": "addCostGraphCont",
                "//onTouchUp": "alert('" + graphObj.oldPboAddCostsHeight + "')",
                "width": graphObj.width + "px",
                "height": graphObj.oldPboAddCostsHeight + "px",
                "y": 290 - graphObj.oldPboAddCostsHeight + "px",
                "x": "80px"
            },
            {
                "overlayId": "retireesGraphCont",
                "//onTouchUp": "alert('" + graphObj.oldPboRetireesHeight + "')",
                "width": graphObj.width + "px",
                "height": graphObj.oldPboRetireesHeight + "px",
                "y": 290 - graphObj.oldPboRetireesHeight + "px",
                "x": "80px"
            },
            {
                "overlayId": "vestedsGraphCont",
                "//onTouchUp": "alert('" + graphObj.oldPboVestedsHeight + "')",
                "width": graphObj.width + "px",
                "height": graphObj.oldPboVestedsHeight + "px",
                "y": 290 - graphObj.oldPboVestedsHeight + "px",
                "x": "80px"
            },
            {
                "overlayId": "activesGraphCont",
                "//onTouchUp": "alert('" + graphObj.oldPboActivesHeight + "')",
                "width": graphObj.width + "px",
                "height": graphObj.oldPboActivesHeight + "px",
                "y": 290 - graphObj.oldPboActivesHeight + "px",
                "x": "80px"
            },
            {
                "overlayId": "assetsGraphCont",
                "//onTouchUp": "alert('" + graphObj.oldPboAssetsHeight + "')",
                "width": graphObj.width + "px",
                "height": graphObj.oldPboAssetsHeight + "px",
                "y": 290 - graphObj.oldPboAssetsHeight + "px",
                "x": "252px"
            }
        )
        graphArr2.push({
                "overlayId": "afterLabel"
            },
            {
                "overlayId": "addCostGraphContAfter",
                "//onTouchUp": "alert('" + addlCostsH + "')",
                "width": graphObj.width + "px",
                "height": addlCostsH + "px",
                "y": 290 - addlCostsH + "px",
                "x": "80px"
            },
            {
                "overlayId": "retireesGraphContAfter",
                "//onTouchUp": "alert('" + "RETIREES MOFO" + "')",
                "width": graphObj.width + "px",
                "height": retireesH + "px",
                "y": 290 - retireesH + "px",
                "x": "80px"
            },
            {
                "overlayId": "vestedsGraphContAfter",
                "//onTouchUp": "alert('" + vestedsH + "')",
                "width": graphObj.width + "px",
                "height": vestedsH + "px",
                "y": 290 - vestedsH + "px",
                "x": "80px"
            },
            {
                "overlayId": "activesGraphContAfter",
                "//onTouchUp": "alert('" + activesH + "')",
                "width": graphObj.width + "px",
                "height": activesH + "px",
                "y": 290 - activesH + "px",
                "x": "80px"
            },
            assetsOv
        )

        //        console.log(JSON.stringify(graphArr2))

        performAction([
                {
                    "action": "#spawnOnce",
                    "data": {
                        "overlayId": "graphContLeft",
                        "alpha": 0
                    }
                },
                {
                    "action": "#spawnOnce",
                    "data": {
                        "overlayId": "graphContRight",
                        "alpha": 0
                    }
                },
                {
                    "action": "#spawnOnce",
                    "data": {
                        "overlayId": "graphContBothBG",
                        "alpha": 0
                    }
                }
            ]
        )
        moreBorg.containerSpawn(graphArr, 'graphContLeft', true)
        //        moreBorg.close("graphContRight")
        //        moreBorg.spawn("graphContRight")

        if (!this.onScenario) {
            moreBorg.containerSpawn(graphArr, 'graphContLeft', true)
            moreBorg.containerSpawn(graphArr2, 'graphContRight', true)

        } else {
            moreBorg.replaceOverlays('graphContLeft', graphArr)
            moreBorg.replaceOverlays('graphContRight', graphArr2)

        }

        //        moreBorg.containerSpawn(graphArr2, 'graphContRight', true)
        //        moreBorg.replaceOverlays('graphContBoth', graphArr)

        //        alert(this.pboActivesHeight + " " + this.pboVestedsHeight + " " + this.pboRetireesHeight + " " + this.pboAssetsHeight)


        performAction([
                {
                    "action": "bringToFront",
                    "target": "graphCont"
                },
                {
                    "action": "animate",
                    "target": "graphContLeft",
                    "data": {
                        "animationIds": [
                            "leftGraphIn"
                        ]
                    }
                },
                {
                    "action": "animate",
                    "target": "graphContRight",
                    "data": {
                        "animationIds": [
                            "rightGraphIn"
                        ]
                    }
                },
                {
                    "action": "animate",
                    "target": "graphContBothBG",
                    "data": {
                        "animationIds": [
                            "bigGraphFadeIn"
                        ]
                    }
                },
                {
                    "action": "animate",
                    "target": "graphContRight",
                    "data": {
                        "animationIds": [
                            "bigGraphFadeIn"
                        ]
                    }
                },
                {
                    "action": "animate",
                    "target": "graphCont",
                    "data": {
                        "animationIds": [
                            "bigGraphFadeOut"
                        ]
                    }
                },
                {
                    "action": "close",
                    "delay": 0.51,
                    "targets": ["graphCont"]
                },
                {
                    "action": "bringToFront",
                    "target": "graphContLeft"
                },
                {
                    "action": "bringToFront",
                    "target": "graphContRight"
                }
            ]
        )

        if (!this.onScenario) {
            performAction([

                {
                    "action": "close",
                    "targets": ["graphLabel1", "graphLabel2"]
                },
                {
                    "action": "#spawn",
                    "data": {
                        "overlayId": "graphLabel1",
                        "images": ["img/02_participant_label_truecosts.png"],
                        "alpha": 0,
                        "x": "110px",
                        "y": "483px"
                    }
                },
                {
                    "action": "#spawn",
                    "data": {
                        "overlayId": "graphLabel2",
                        "alpha": 0,
                        "x": "318px",
                        "y": "483px"
                    }
                },
                {
                    "action": "#spawn",
                    "data": {
                        "overlayId": "graphLabel1",
                        "images": ["img/02_participant_label_truecosts.png"],
                        "alpha": 0,
                        "x": "575px",
                        "y": "483px"
                    }
                },
                {
                    "action": "#spawn",
                    "data": {
                        "overlayId": "graphLabel2",
                        "alpha": 0,
                        "x": "786px",
                        "y": "483px"
                    }
                },
                {
                    "action": "animate",
                    "targets": ["graphContLeft", "graphLabel1", "graphLabel2"],
                    "data": {
                        "animationIds": [
                            "bigGraphFadeIn"
                        ]
                    }
                }

            ])

        } else {
            moreBorg.replaceOverlays('graphContRight', graphArr2)

        }
        moreBorg.close(["chartCont1", "chartCont2"])

        if (!this.onScenario) {
            graphObj.animateFacets(false, 2)

            setTimeout(function () {
                graphObj.animateFacets(true, 2)
            }, 700);
            this.onScenario = true;
        } else {

        }
    },
    pboAfterAdv: function () {
        if (pensionCalc.reachedScenario) {
            graphObj.pboAfterScenario();
            chartObj.setUpAfterScenario();
        } else if (pensionCalc.reachedParticipants) {
            graphObj.pboAfterParticipants();
            chartObj.setUpAfterParticipants()
        } else {
            graphObj.initPBOgraph();
            chartObj.setUpInitialPBO()
        }

    },
    trueCostsz: function () {
        this.onScenario = false;
        console.log("----------TRUECOSTS-----------")

        var graphArr = [];


        // i :: actives, vesteds, retirees
        // j :: pbgc, admin, longevity
        for (var i = 0; i < graphObj.TCinputs.length; i++) {
            console.log("LOLZ" + pensionCalc.longRateArr[i])
            for (var j = 0; j < graphObj.TCinputs[i].length; j++) {
                if (i == 2) {
                    if (j == 0) {
                        this.TCoutputs2[i][j] = (pensionCalc.retireesSemiTotal * 8) / 1000000
                    } else if (j == 1) {
                        this.TCoutputs2[i][j] = (pensionCalc.retireesAdminAfter * 8) / 1000000
                    } else {
                        //TODO: change when understand what long adjustments are
                        console.log("LOLZ222" + pensionCalc.longRateArr[i])
                        this.TCoutputs2[i][j] = (pensionCalc.pboRetirees * (1 - pensionCalc.retireeTransferPercent) * pensionCalc.longRateArr[i])
                    }
                } else {
                    this.TCoutputs2[i][j] = (pensionCalc[graphObj.TCinputs2[i][j]] * 8) / 1000000;
                }

                if (j == 2) {
                    console.log(this.TCinputs2[i][j])

                    //                    //TODO: change when understand what long adjustments are
                    this.TCoutputs[i][j] = (pensionCalc[graphObj.TCinputs[i][j]] )
                    if ((i == 0) || (i == 1)) {
                        this.TCoutputs2[i][j] = pensionCalc[graphObj.TCinputs2[i][j]]
                    } else {
                    }
                    this.TCoutputs[i][j] = this.TCoutputs2[i][j]

                    //TODO: This is fix for bug asd
                    this.TCoutputs[i][j] = pensionCalc.firstInArr[i] * pensionCalc.longRateArr[i]

                } else {
                    this.TCoutputs[i][j] = (pensionCalc[graphObj.TCinputs[i][j]] * 8) / 1000000;
                }
                borg.setText(this.loopObjTCLabels[i][j], addCommas(String(Math.round(this.TCoutputs[i][j] * 1000000))));
            }
            this.TCoutputSums[i] = this.TCoutputs[i][0] + this.TCoutputs[i][1] + this.TCoutputs[i][2]
            this.TCoutputSums2[i] = this.TCoutputs2[i][0] + this.TCoutputs2[i][1] + this.TCoutputs2[i][2]
        }


        this.totalTCBefore = this.TCoutputSums[0] + this.TCoutputSums[1] + this.TCoutputSums[2]
        this.totalTCAfter = this.TCoutputSums2[0] + this.TCoutputSums2[1] + this.TCoutputSums2[2]

        if (verbose) {
            console.log(JSON.stringify(this.TCoutputs))
            console.log("sums" + JSON.stringify(this.TCoutputSums))
            console.log("totalsum" + JSON.stringify(this.totalTCBefore))

            console.log(JSON.stringify(this.TCoutputs2))
            console.log("sums2" + JSON.stringify(this.TCoutputSums2))
            console.log("totalsum2" + JSON.stringify(this.totalTCAfter))

        } else {

        }

        var graphArr = [];

        // i :: actives, vesteds, retirees
        // j :: pbgc, admin, longevity
        for (var i = 0; i < this.TCoutputs.length; i++) {

            var currX;
            if (i == 0) {
                currX = 125;
            } else if (i == 1) {
                currX = 442;
            } else {
                currX = 776;
            }

            var perPixel = graphObj.maxHeightTC / this.TCoutputSums[i]
            var divBy = this.TCoutputSums[i]
            var lastHeight = 0;
            for (var j = 0; j < this.TCoutputs[i].length; j++) {

                lastHeight = this.loopObjTC[i][j] = Math.round(perPixel * ((this.TCoutputs[i][j] / divBy) * divBy)) + lastHeight
                console.log("i: " + i + " j: " + j + " height is " + lastHeight + "px ")
                graphArr.push(
                    {
                        "overlayId": this.loopObjTCOv[i][j],
                        "width": graphObj.widthTC + "px",
                        "height": this.loopObjTC[i][j] + "px",
                        "y": 333 - this.loopObjTC[i][j] + "px",
                        "x": currX + "px"
                    }
                )

            }

        }

        if (verbose) {
            console.log(JSON.stringify(this))
            console.log(JSON.stringify(graphArr))
        } else {
        }
        graphArr.reverse()
        moreBorg.containerSpawn(graphArr, 'trueCostsCont', true)

        //adding surplus label for TC Page
        if (pensionCalc.pboDeficit < 0) {
            console.log("SuRPlus in TC")
            //            var z = {
            //                "overlayId": "TCSurplusLabel",
            //                "x": "587px",
            //                "y": "612px"
            //            }
            //            moreBorg.containerSpawn(z, 'trueCostsCont', true)

            moreBorg.setImages('chart4Img', "img/05_truecost_table_surplus.png")
            borg.moveOverlay("chart4Img", "520.5px", "73px");

        } else {
        }

        console.log("----------END TRUECOSTS END-----------")
    },


    //truecosts data objects
    TCinputs: [
        ["activesPBGCBefore", "activesAdminBefore", "activesLong", "activesOther"],
        ["vestedsPBGCBefore", "vestedsAdminBefore", "vestedsLong", "vestedsOther"],
        ["retireesPBGCBefore", "retireesAdminBefore", "retireesLong", "retireesOther"]
    ],
    TCinputs2: [
        ["activesPBGCAfter", "activesAdminAfter", "activesLong", "pensionCalc.activesOtherA"],
        ["vestedsPBGCAfter", "vestedsAdminAfter", "vestedsLong", "pensionCalc.vestedsOtherA"],
        ["retireesPBGCAfter", "retireesAdminAfter", "retireesLong", "pensionCalc.retireesOtherA"]
    ],
    TCoutputs: [
        [-1, -1, -1, -1],
        [-1, -1, -1, -1],
        [-1, -1, -1, -1]
    ],
    TCoutputSums: [
        [-1, -1, -1, -1]
    ],
    TCoutputs2: [
        [-1, -1, -1, -1],
        [-1, -1, -1, -1],
        [-1, -1, -1, -1]
    ],
    TCoutputSums2: [
        [-1, -1, -1, -1]
    ],
    //these will populate with the correct values
    loopObjTC: [
        ["activesPBGCHeight", "activesAdminHeight", "activesLongHeight", "activesOtherHeight"],
        ["vestedsPBGCHeight", "vestedsAdminHeight", "vestedsLongHeight", "vestedsOtherHeight" ],
        ["retireesPBGCHeight", "retireesAdminHeight", "retireesLongHeight", "retireesOtherHeight"]
    ],
    //names of graph overlays to be spawned
    loopObjTCOv: [
        ["activesPBGCGraphCont", "activesAdminGraphCont", "activesLongGraphCont", "activesOtherGraphCont"],
        ["vestedsPBGCGraphCont", "vestedsAdminGraphCont", "vestedsLongGraphCont", "vestedsOtherGraphCont"],
        ["retireesPBGCGraphCont", "retireesAdminGraphCont", "retireesLongGraphCont", "retireesOtherGraphCont"]
    ],
    //number labels for TC legend
    loopObjTCLabels: [
        ["activesPBGCTC", "activesAdminTC", "activesLongTC", "activesOtherTC"],
        ["vestedsPBGCTC", "vestedsAdminTC", "vestedsLongTC", "vestedsOtherTC"],
        ["retireesPBGCTC", "retireesAdminTC", "retireesLongTC", "retireesOtherTC"]
    ],

    spawnDisclaimer: function () {

        onDisclaimer = true;
        //        moreBorg.spawn("trueCostsNavBlocker")
        //        moreBorg.spawn("trueCostsOtherBlocker")
        //        moreBorg.spawn("trueCostsOtherBlocker2")

        setTimeout(function () {
            console.log('bringing')

            moreBorg.spawn("disclaimerCloseBtnXMagic")

        }, 100);

    },
    closeDisclaimer: function () {

        onDisclaimer = false;


        //        borg.runAction()
    },
    trueCosts: function () {

        moreBorg.spawn("trueCostsNavBlocker")
        moreBorg.spawn("trueCostsOtherBlocker")
        moreBorg.spawn("trueCostsOtherBlocker2")
        //        moreBorg.spawn("trueCostsCloseBtn")
        this.onScenario = false;
        console.log("----------TRUECOSTS-----------")

        var graphArr = [];


        // i :: actives, vesteds, retirees
        // j :: pbgc, admin, longevity, other
        for (var i = 0; i < graphObj.TCinputs.length; i++) {
            console.log("LOLZ" + pensionCalc.longRateArr[i])
            for (var j = 0; j < graphObj.TCinputs[i].length; j++) {

                //RETIREES
                if (i == 2) {
                    if (j == 0) {
                        this.TCoutputs2[i][j] = (pensionCalc.retireesSemiTotal * 8) / 1000000
                    } else if (j == 1) {
                        this.TCoutputs2[i][j] = (pensionCalc.retireesAdminAfter * 8) / 1000000
                    } else if (j == 2) {
                        //TODO: change when understand what long adjustments are
                        console.log("LOLZ222" + pensionCalc.longRateArr[i])
                        this.TCoutputs2[i][j] = (pensionCalc.pboRetirees * (1 - pensionCalc.retireeTransferPercent) * pensionCalc.longRateArr[i])
                    } else {
                        this.TCoutputs2[i][j] = pensionCalc.retireesOtherA
                    }
                } else {
                    this.TCoutputs2[i][j] = (pensionCalc[graphObj.TCinputs2[i][j]] * 8) / 1000000;
                }

                //LONGEVITY
                if (j == 2) {
                    console.log(this.TCinputs2[i][j])
                    //                    //TODO: change when understand what long adjustments are
                    this.TCoutputs[i][j] = (pensionCalc[graphObj.TCinputs[i][j]] )
                    if ((i == 0) || (i == 1)) {
                        this.TCoutputs2[i][j] = pensionCalc[graphObj.TCinputs2[i][j]]
                    } else {
                    }
                    this.TCoutputs[i][j] = this.TCoutputs2[i][j]

                    //TODO: This is fix for bug asd
                    this.TCoutputs[i][j] = pensionCalc.firstInArr[i] * pensionCalc.longRateArr[i]

                } else {
                    this.TCoutputs[i][j] = (pensionCalc[graphObj.TCinputs[i][j]] * 8) / 1000000;
                }

                //OTHER
                if (j == 3) {
                    this.TCoutputs[i][j] = pensionCalc.firstInArr[i] * pensionCalc.otherCostsArr[i]
                    if (i == 2) {
                        this.TCoutputs2[i][j] = pensionCalc.retireesOtherA
                    } else {
                    }
                } else {

                }
                borg.setText(this.loopObjTCLabels[i][j], addCommas(String(Math.round(this.TCoutputs[i][j] * 1000000))));
            }
            this.TCoutputSums[i] = this.TCoutputs[i][0] + this.TCoutputs[i][1] + this.TCoutputs[i][2] + this.TCoutputs[i][3]
            this.TCoutputSums2[i] = this.TCoutputs2[i][0] + this.TCoutputs2[i][1] + this.TCoutputs2[i][2] + this.TCoutputs2[i][3]
        }


        this.totalTCBefore = this.TCoutputSums[0] + this.TCoutputSums[1] + this.TCoutputSums[2]
        this.totalTCAfter = this.TCoutputSums2[0] + this.TCoutputSums2[1] + this.TCoutputSums2[2]

        if (verbose) {
            console.log(JSON.stringify(this.TCoutputs))
            console.log("sums" + JSON.stringify(this.TCoutputSums))
            console.log("totalsum" + JSON.stringify(this.totalTCBefore))

            console.log(JSON.stringify(this.TCoutputs2))
            console.log("sums2" + JSON.stringify(this.TCoutputSums2))
            console.log("totalsum2" + JSON.stringify(this.totalTCAfter))

        } else {

        }

        var graphArr = [];

        // i :: actives, vesteds, retirees
        // j :: pbgc, admin, longevity, other
        for (var i = 0; i < this.TCoutputs.length; i++) {

            var currX;
            if (i == 0) {
                currX = 125;
            } else if (i == 1) {
                currX = 442;
            } else {
                currX = 776;
            }

            var perPixel = graphObj.maxHeightTC / this.TCoutputSums[i]
            var divBy = this.TCoutputSums[i]
            var lastHeight = 0;
            for (var j = 0; j < this.TCoutputs[i].length; j++) {

                lastHeight = this.loopObjTC[i][j] = Math.round(perPixel * ((this.TCoutputs[i][j] / divBy) * divBy)) + lastHeight
                console.log("i: " + i + " j: " + j + " height is " + lastHeight + "px ")
                graphArr.push(
                    {
                        "overlayId": this.loopObjTCOv[i][j],
                        "width": graphObj.widthTC + "px",
                        "height": this.loopObjTC[i][j] + "px",
                        "y": 314 - this.loopObjTC[i][j] + "px",
                        "x": currX + "px"
                    }
                )

            }

        }

        if (verbose) {
            console.log(JSON.stringify(this))
            console.log(JSON.stringify(graphArr))
        } else {
        }
        graphArr.reverse()
        moreBorg.containerSpawn(graphArr, 'trueCostsCont', true)

        //adding surplus label for TC Page

//        console.log("Deficit is in TC " + pensionCalc.pboDeficit)
        //TODO: Following line is bugfix 93 in mercer space

        //TODO: Following line is bugfix 93 in mercer space
        pensionCalc.pboDeficit = pensionCalc.pboTotalwFee - pensionCalc.pboAssets

        if (pensionCalc.pboDeficit < 0) {
            console.log("SuRPlus in TC")
            //            var z = {
            //                "overlayId": "TCSurplusLabel",
            //                "x": "587px",
            //                "y": "612px"
            //            }
            //            moreBorg.containerSpawn(z, 'trueCostsCont', true)

            moreBorg.setImages('chart4Img', "img/05_truecost_table_surplus.png")
            borg.moveOverlay("chart4Img", "500.5px", "73px");

        } else {
        }

        console.log("----------END TRUECOSTS END-----------")

        setTimeout(function () {
            console.log('bringing')

            moreBorg.spawn("trueCostsCloseBtnMagic")

        }, 100);

    },

    animateFacets: function (up, currChartNum) {
        //        alert("chartCont"+(currChartNum+1))
        performAction([
            {
                "action": "setAlphaAction",
                "target": "chartCont" + (currChartNum + 1),
                "data": {
                    "alpha": 0
                }
            }
        ]);
        var backFacet = (currChartNum == 3) ? "purpleFacetBack" : "greenFacetBack";
        var frontFacet = (currChartNum == 3) ? "purpleFacetFront" : "greenFacetFront";
        var innerCont = "";
        if (currChartNum == 3) {
            innerCont = "chartInnerContTC"
        } else {
            innerCont = "chartInnerCont" + (currChartNum + 1)
        }
        if (up) {

            //            moreBorg.close("greenFacetBack")
            //            moreBorg.close("greenFacetFront")
            performAction([
                {
                    "action": "#spawnOnce",
                    "data": {
                        "overlayId": backFacet,
                        "y": "1000px"
                    }
                },
                {
                    "action": "#spawnOnce",
                    "data": {
                        "overlayId": frontFacet,
                        "y": "1000px"
                    }
                },
                {
                    "action": "animate",
                    "targets": [frontFacet],
                    "data": {
                        "animationId": "frontFacetUp"
                    }
                },
                {
                    "//action": "animate",
                    "targets": [backFacet],
                    "data": {
                        "animationId": "backFacetUp"
                    }
                },
                {
                    "action": "animate",
                    "targets": [backFacet],
                    "data": {
                        "animationId": "backFacetRotIn"
                    }
                },
                {
                    "action": "animate",
                    "targets": [backFacet],
                    "data": {
                        "animationId": "backFacetUp"
                    }
                }
            ]);
        } else {

            moreBorg.close(innerCont)
            performAction([
                {
                    "action": "animate",
                    "targets": [frontFacet],
                    "data": {
                        "animationId": "frontFacetDown"
                    }
                },
                {
                    "//action": "animate",
                    "targets": [backFacet],
                    "data": {
                        "animationId": "backFacetDown"
                    }
                },
                {
                    "action": "animate",
                    "targets": [backFacet],
                    "data": {
                        "animationId": "backFacetRotOut"
                    }
                },
                {
                    "action": "animate",
                    "targets": [backFacet],
                    "data": {
                        "animationId": "backFacetDown"
                    }
                }
            ]);
            setTimeout(function () {

                //                moreBorg.close(backFacet)
                //                moreBorg.close(frontFacet)
                //                moreBorg.spawn("chartCont"+(currChartNum+1))
                performAction([
                    {
                        "action": "#spawn",
                        "data": {
                            "overlayId": "chartCont" + (currChartNum + 1),
                            "alpha": 0
                        }
                    }
                ]);
            }, 1210);

        }

    }

}

var chartObj = {

    setUpInitialPBO: function (isTC) {
        if (isTC) {

        } else {
            moreBorg.close(["chartCont2", "chartCont3"])
            //            moreBorg.spawn("chartCont1", true)
        }

        //        console.log(pensionCalc.pboAssets)
        borg.setText('chartPboTotal', "$" + addCommas(String(pensionCalc.pboTotal)));
        borg.setText('chartPboAssets', "$" + addCommas(String(pensionCalc.pboAssets)));
        //TODO: check this
        //        borg.setText('chartPboDeficit', pensionCalc.pboAssetsVestedsAfter2);
        borg.setText('chartPboDeficit', "$" + addCommas(String(Math.abs(Math.round(pensionCalc.pboDeficit)))));
        borg.setText('chartPboFundedStatus', addCommas(String(Math.round(pensionCalc.pboFundedStatus * 100))));
        performAction([
            {
                "action": "setAlphaAction",
                "target": "chartCont1",
                "data": {
                    "alpha": 1
                }
            }
        ]);

    },
    setUpAfterParticipants: function () {

        //        alert('asd')n
        moreBorg.close(["chartCont1", "chartCont3"])
        //        moreBorg.spawn("chartCont2", true)

        borg.setText('chartPboTotal', addCommas(String(Math.round(pensionCalc.pboTotalwFee))));
        borg.setText('chartPboAssets', addCommas(String(pensionCalc.pboAssets)));
        borg.setText('chartPboDeficit', addCommas(String(Math.abs(Math.round(pensionCalc.pboDeficit)))));
        //        borg.setText('chartPboFundedStatus', Math.round(pensionCalc.pboFundedStatus * 100) + "P");
        borg.setText('chartPboFundedStatus', Math.round(pensionCalc.pboFundedStatus * 100));


        borg.setText('chartActivesPBGC', addCommas(String(pensionCalc.PBGCArr[0])));
        borg.setText('chartVestedsPBGC', addCommas(String(pensionCalc.PBGCArr[1])));
        borg.setText('chartRetireesPBGC', addCommas(String(pensionCalc.PBGCArr[2])));
        borg.setText('chartTotalPBGC', addCommas(String(pensionCalc.PBGCTotalCosts)));


        borg.setText('chartActivesAdmin', addCommas(String(pensionCalc.adminArr[0])));
        borg.setText('chartVestedsAdmin', addCommas(String(pensionCalc.adminArr[1])));
        borg.setText('chartRetireesAdmin', addCommas(String(pensionCalc.adminArr[2])));
        borg.setText('chartTotalAdmin', addCommas(String(pensionCalc.adminTotal)));


        borg.setText('chartActivesTotal', addCommas(String(pensionCalc.totalArr[0])));
        borg.setText('chartVestedsTotal', addCommas(String(pensionCalc.totalArr[1])));
        borg.setText('chartRetireesTotal', addCommas(String(pensionCalc.totalArr[2])));
        borg.setText('chartTotalTotal', addCommas(String(pensionCalc.participantTotal)));
        performAction([
            {
                "action": "setAlphaAction",
                "target": "chartCont2",
                "data": {
                    "alpha": 1
                }
            }
        ]);
    },
    setUpAfterScenario: function () {
        //TODO: 0=Lump Sums to TV 1=Purchase Annuties 4 Retirees 2= Both
        //        console.log('setupafterscneariossszzz')

        var currTot
        if (pensionCalc.TVTransferPercent == 0 && pensionCalc.BOIndex == 1.08 && pensionCalc.retireeTransferPercent == 0) {
            currTot = pensionCalc.pboTotalwFee
        } else {
            currTot = pensionCalc["pboTotalwFee" + pensionCalc.scenarioRef[pensionCalc.sNum]];
        }


        moreBorg.close(["chartCont1", "chartCont2"])
        //        moreBorg.spawn("chartCont3", true)

        //        pensionCalc.pboDeficit = pensionCalc.pboTotalwFee - pensionCalc.pboAssets;
        borg.setText('chartPboTotal', addCommas(String(Math.round(pensionCalc.pboTotalwFee))));
        borg.setText('chartPboAssets', addCommas(String(Math.round(pensionCalc.pboAssets))));
        borg.setText('chartPboDeficit', addCommas(String(Math.abs(Math.round(pensionCalc.pboTotalwFee - pensionCalc.pboAssets)))));
        borg.setText('chartPboFundedStatus', Math.round((pensionCalc.pboAssets / pensionCalc.pboTotalwFee) * 100));


        //moved to if for bugfix
        //        var currTot = pensionCalc["pboTotalwFee" + pensionCalc.scenarioRef[pensionCalc.sNum]];
        var currAss = pensionCalc["pboAssets" + pensionCalc.scenarioRef[pensionCalc.sNum]];
        var currFund = currAss / currTot;
        var currDef = currTot - currAss;

        currFund = (isFinite(currFund)) ? currFund : 0
        //        alert(currFund)

        var currPBGCA = pensionCalc["PBGCTotalAfter" + pensionCalc.scenarioRef[pensionCalc.sNum]]
        var currAdminA = pensionCalc["adminTotalAfter" + pensionCalc.scenarioRef[pensionCalc.sNum]]
        var currTotalA = pensionCalc["totalTotalAfter" + pensionCalc.scenarioRef[pensionCalc.sNum]]

        borg.setText('chartPboTotalAfter', addCommas(String(Math.round(currTot))));
        borg.setText('chartPboAssetsAfter', addCommas(String(Math.round(currAss))));
        //todo: double check both of these
        //        borg.setText('chartPboDeficitAfter', addCommas(String(Math.round(pensionCalc.pboAssetsVestedsAfter2))));
        borg.setText('chartPboDeficitAfter', addCommas(String(Math.round(Math.abs(currDef)))));

        //        borg.setText('chartPboFundedStatusAfter', Math.round(pensionCalc.pboAssetsAfterPercent * 100) + "P");
        borg.setText('chartPboFundedStatusAfter', Math.round(currFund * 100));

        borg.setText('chartTotalPBGC', addCommas(String(Math.round(pensionCalc.beforeObj['PBGCTotalCosts']))));
        borg.setText('chartTotalAdmin', addCommas(String(Math.round(pensionCalc.beforeObj['adminTotal']))));
        borg.setText('chartTotalTotal', addCommas(String(Math.round(pensionCalc.beforeObj['participantTotal']))));

        //TODO: Comment back in if guess is wrong
        borg.setText('chartTotalPBGCAfter', addCommas(String(Math.round(pensionCalc.PBGCTotalAfter))));
        borg.setText('chartTotalAdminAfter', addCommas(String(Math.round(pensionCalc.adminTotalAfter))));
        borg.setText('chartTotalTotalAfter', addCommas(String(Math.round(pensionCalc.totalTotalAfter))));

        borg.setText('chartTotalPBGCDiff', addCommas(String((Math.round(pensionCalc.beforeObj['PBGCTotalCosts'] - pensionCalc.PBGCTotalAfter)))));
        borg.setText('chartTotalAdminDiff', addCommas(String((Math.round(pensionCalc.beforeObj['adminTotal'] - pensionCalc.adminTotalAfter)))));
        borg.setText('chartTotalTotalDiff', addCommas(String((Math.round(pensionCalc.beforeObj['participantTotal'] - pensionCalc.totalTotalAfter)))));


        //        borg.setText('chartTotalPBGCAfter', addCommas(String(Math.round(currPBGCA))));
        //        borg.setText('chartTotalAdminAfter', addCommas(String(Math.round(currAdminA))));
        //        borg.setText('chartTotalTotalAfter', addCommas(String(Math.round(currTotalA))));
        //
        //        borg.setText('chartTotalPBGCDiff', addCommas(String((Math.round(pensionCalc.beforeObj['PBGCTotalCosts'] - currPBGCA)))));
        //        borg.setText('chartTotalAdminDiff', addCommas(String((Math.round(pensionCalc.beforeObj['adminTotal'] - currAdminA)))));
        //        borg.setText('chartTotalTotalDiff', addCommas(String((Math.round(pensionCalc.beforeObj['participantTotal'] - currTotalA)))));


        performAction([
            {
                "action": "setAlphaAction",
                "target": "chartCont3",
                "data": {
                    "alpha": 1
                }
            }
        ]);
    },
    trueCosts: function () {

        //                alert('zzz')
        //        moreBorg.close(["chartCont1", "chartCont2"])
        //        moreBorg.spawn("chartCont3", true)
        //TODO: this is bugfix 63
        pensionCalc.pboDeficit = pensionCalc.pboTotalwFee - pensionCalc.pboAssets
        pensionCalc.pboFundedStatus = pensionCalc.pboAssets / pensionCalc.pboTotalwFee


        //TODO: this is cell b4 on feedback
        borg.setText('chartPboTotalTC', "$" + addCommas(String(Math.round(pensionCalc.pboTotalwFee))));
        borg.setText('chartPboAssetsTC', "$" + addCommas(String(pensionCalc.pboAssets)));
        borg.setText('chartPboDeficitTC', "$" + addCommas(String(Math.abs(Math.round(pensionCalc.pboDeficit)))));
        borg.setText('chartPboFundedStatusTC', Math.round(pensionCalc.pboFundedStatus * 100));
        //        borg.setText('chartPboFundedStatus', Math.round(pensionCalc.pboFundedStatus * 100) + "P");

        //        borg.setText('chartPboTotalAfter', addCommas(String(pensionCalc.pboAfterTotal)));
        //        borg.setText('chartPboAssetsAfter', addCommas(String(pensionCalc.pboAssetsAfter)));
        //        borg.setText('chartPboDeficitAfter', addCommas(String(Math.round(pensionCalc.pboAssetsVestedsAfter2))));
        //        //        borg.setText('chartPboFundedStatusAfter', Math.round(pensionCalc.pboVestedFundedStatus * 100) + "P");
        //        borg.setText('chartPboFundedStatusAfter', Math.round(pensionCalc.pboVestedFundedStatus * 100));
        //
        //        borg.setText('chartTotalPBGC', addCommas(String(pensionCalc.beforeObj['PBGCTotalCosts'])));
        //        borg.setText('chartTotalAdmin', addCommas(String(pensionCalc.beforeObj['adminTotal'])));
        //        borg.setText('chartTotalTotal', addCommas(String(pensionCalc.beforeObj['participantTotal'])));
        //
        //        borg.setText('chartTotalPBGCAfter', addCommas(String(pensionCalc.PBGCTotalCosts)));
        //        borg.setText('chartTotalAdminAfter', addCommas(String(pensionCalc.adminTotal)));
        //        borg.setText('chartTotalTotalAfter', addCommas(String(pensionCalc.participantTotal)));
        //
        //        borg.setText('chartTotalPBGCDiff', addCommas(String((pensionCalc.beforeObj['PBGCTotalCosts'] - pensionCalc.PBGCTotalCosts))));
        //        borg.setText('chartTotalAdminDiff', addCommas(String((pensionCalc.beforeObj['adminTotal'] - pensionCalc.adminTotal))));
        //        borg.setText('chartTotalTotalDiff', addCommas(String((pensionCalc.beforeObj['participantTotal'] - pensionCalc.participantTotal))));


    }

}

function getTextFieldText(ovName) {
    borg.getOverlayById(ovName).onChange = function (info) {
        pensionCalc.inputs[ovName] = Number(info.text);
    };
}

function getTextFieldTextAdv(ovName) {

    borg.getOverlayById(ovName).onChange = function (info) {
        pensionCalc.inputs2[ovName] = Number(info.text);
    };

}

function checkIfPercent(inDropdown) {

    //    if (pensionCalc.pboInDollars && onInputPage) {
    //        performAction([
    //            {
    //                "action": "close",
    //                "trigger": "touchUpInside",
    //                "targets": ["submitMagicButton"  ]
    //            },
    //            {
    //                "action": "#spawn",
    //                "data": {
    //                    "overlayId": "submitMagicButton",
    //                    "x": "490px",
    //                    "y": "503px"
    //                }
    //            }
    //        ])
    //    } else if(!pensionCalc.pboInDollars && onInputPage){
    //        performAction([
    //            {
    //                "action": "close",
    //                "trigger": "touchUpInside",
    //                "targets": ["submitMagicButton"  ]
    //            },
    //            {
    //                "action": "#spawn",
    //                "data": {
    //                    "overlayId": "submitMagicButton",
    //                    "x": "490px",
    //                    "y": "576px"
    //                }
    //            }
    //        ])
    //
    //    }else{}

    console.log('checkifperecent ' + inDropdown)
    if (pensionCalc.pboInDollars) {

        var x = 0;
        var y = 0;

        if (inDropdown) {

            borg.runAction({
                "action": "spawnOnce",
                "target": "pboOptionsCont",
                "data": {
                    "overlayId": "pboCoverUp",
                    "x": "128px",
                    "y": "17px"
                }
            })

        } else {
            moreBorg.close('pboTotalWorth');
        }

    } else {

        if (inDropdown) {
            x = "140px";
            y = "80px";

            moreBorg.close('pboCoverUp');
            borg.runAction({
                "action": "spawnOnce",
                "target": "pboOptionsCont",
                "data": {
                    "overlayId": "pboTotalWorthFakeBtn",
                    "images": [
                        "img/01_pbo_field_transparent.png"
                    ],
                    "imagesDown": [
                        "img/01_pbo_field_tap.png"
                    ],
                    "x": "140px",
                    "y": "78px",
                    "width": "115px",
                    "height": "44px"
                }
            })
            borg.runAction({
                "action": "spawnOnce",
                "target": "pboOptionsCont",
                "data": {
                    "overlayId": "pboTotalWorth",
                    "x": "150px",
                    "y": "83px",
                    "width": "115px",
                    "height": "44px"
                }
            })
            borg.runAction({
                "action": "spawnOnce",
                "target": "pboOptionsCont",
                "data": {
                    "overlayId": "pboTotalWorthBtn",
                    "x": "140px",
                    "y": "78px",
                    "width": "115px",
                    "height": "44px"
                }
            })

        } else {
            moreBorg.spawn("pboTotalWorth", true);

        }

    }


}

function checkIfPercentz(inDropdown) {

    //TODO: fix this with input page
    //    if (pensionCalc.pboInDollars && onInputPage) {
    //        performAction([
    //            {
    //                "action": "close",
    //                "trigger": "touchUpInside",
    //                "targets": ["submitMagicButton"  ]
    //            },
    //            {
    //                "action": "#spawn",
    //                "data": {
    //                    "overlayId": "submitMagicButton",
    //                    "x": "490px",
    //                    "y": "503px"
    //                }
    //            }
    //        ])
    //    } else if (!pensionCalc.pboInDollars && onInputPage) {
    //        performAction([
    //            {
    //                "action": "close",
    //                "trigger": "touchUpInside",
    //                "targets": ["submitMagicButton"  ]
    //            },
    //            {
    //                "action": "#spawn",
    //                "data": {
    //                    "overlayId": "submitMagicButton",
    //                    "x": "490px",
    //                    "y": "576px"
    //                }
    //            }
    //        ])
    //
    //    } else {
    //    }
    //TODO: SAVE STATE
    //    var inputz = ["pboAssetsFakeBtn", "pboAssets", "pboAssetsBtn", "pboActivesFakeBtn", "pboActives", "pboActivesBtn", "pboVestedsFakeBtn", "pboVesteds", "pboVestedsBtn", "pboRetireesFakeBtn", "pboRetirees", "pboRetireesBtn"];
    //    console.log('toggleotherinputs')
    //
    //    if (pensionCalc.pboInDollars) {
    //
    //        var x = 0;
    //        var y = 0;
    //
    //        if (inDropdown) {
    //
    //            borg.runAction({
    //                "action": "spawnOnce",
    //                "target": "pboOptionsCont",
    //                "data": {
    //                    "overlayId": "pboCoverUp",
    //                    "x": "128px",
    //                    "y": "17px"
    //                }
    //            })
    //
    //        } else {
    //            moreBorg.close('pboTotalWorth');
    //        }
    //        performAction([
    //            {
    //                "//action": "close",
    //                "targets": inputz
    //            },
    //            {
    //                "action": "bringToFront",
    //                "target": "pboAssetsBtn"
    //            },
    //            {
    //                "action": "close",
    //                "targets": ["pboTotalWorth", "pboTotalWorthBtn", "pboTotalWorthFakeBtn"]
    //            },
    //            {
    //                "action": "setAlphaAction",
    //                "targets": inputz,
    //                "data": {
    //                    "alpha": 0
    //                }
    //            }
    //        ])
    //        setTimeout(function () {
    //            performAction([
    //                {
    //                    "action": "setAlphaAction",
    //                    "targets": inputz,
    //                    "data": {
    //                        "alpha": 1
    //                    }
    //                }
    //            ])
    //        }, 150);
    //
    //
    //    } else {
    //
    //        if (inDropdown) {
    //            x = "140px";
    //            y = "80px";
    //
    //            moreBorg.close('pboCoverUp');
    //            borg.runAction({
    //                "action": "spawnOnce",
    //                "target": "pboOptionsCont",
    //                "data": {
    //                    "overlayId": "pboTotalWorthFakeBtn",
    //                    "images": [
    //                        "img/01_pbo_field_transparent.png"
    //                    ],
    //                    "imagesDown": [
    //                        "img/01_pbo_field_tap.png"
    //                    ],
    //                    "x": "140px",
    //                    "y": "78px",
    //                    "width": "115px",
    //                    "height": "44px"
    //                }
    //            })
    //            borg.runAction({
    //                "action": "spawnOnce",
    //                "target": "pboOptionsCont",
    //                "data": {
    //                    "overlayId": "pboTotalWorth",
    //                    "x": "150px",
    //                    "y": "78px",
    //                    "width": "115px",
    //                    "height": "44px"
    //                }
    //            })
    //            borg.runAction({
    //                "action": "spawnOnce",
    //                "target": "pboOptionsCont",
    //                "data": {
    //                    "overlayId": "pboTotalWorthBtn",
    //                    "x": "140px",
    //                    "y": "78px",
    //                    "width": "115px",
    //                    "height": "44px"
    //                }
    //            })
    //
    //        } else {
    //            moreBorg.spawn("pboTotalWorth", true);
    //
    //        }
    //        inputz = ["pboAssetsFakeBtn", "pboAssets", "pboAssetsBtn", "pboActivesFakeBtn", "pboActives", "pboActivesBtn", "pboVestedsFakeBtn", "pboVesteds", "pboVestedsBtn", "pboRetireesFakeBtn", "pboRetirees", "pboRetireesBtn", "pboTotalWorthFakeBtn", "pboTotalWorth", "pboTotalWorthBtn"];
    //        performAction([
    //            {
    //                "//action": "close",
    //                "targets": inputz
    //            },
    //            {
    //                "action": "setAlphaAction",
    //                "targets": inputz,
    //                "data": {
    //                    "alpha": 0
    //                }
    //            }
    //        ]
    //        )
    //        setTimeout(function () {
    //            performAction([
    //                {
    //                    "action": "setAlphaAction",
    //                    "targets": inputz,
    //                    "data": {
    //                        "alpha": 1
    //                    }
    //                }
    //            ])
    //        }, 150);
    //
    //    }


}

function addCommas(nStr) {
    nStr += '';
    var x = nStr.split('.');
    var x1 = x[0];
    var x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
    //return nStr
}

function addDec(nStr) {
    return nStr / 100
}

function remDec(nStr) {
    return nStr * 100
}

function subtractPercentage() {
    var currMax = 4;
    if (Number(First1) < 1) {

        First1 = parseFloat(Number(First1)).toFixed(2);
    }

    else {
        // First1 = Number(First1)
    }
    //   var aa = '0055656'
    var aa = String(First1)
    First1 = String(aa).replace(/^(0+)/g, '');
    //   console.log("zasdas "+zz)


    console.log('FIRST FONE ' + First1)
    if (String(First1).length - 1 > currMax) {

        console.log('TOO LONG' + First1)

    }
    else if (First1.indexOf('.') != -1) {
        var decInd = First1.indexOf('.')
        var end = First1.slice(decInd + 1)
        var start = First1.slice(0, decInd)

        //             console.log('Start: ' + start + "end: "+end)
        First1 = start + end
        //             console.log('removed decimal' + First1)
        First1 = First1.slice(0, -1);
        Display1 = addDec(First1);

    } else if (String(First1).length == 1) {
        First1 = 0
        Display1 = addDec(First1);

    } else {
        First1 = First1.slice(0, -1);
        Display1 = addDec(First1);
    }

    return First1
    console.log("store" + First1)
    console.log(Display1)


}

function MyClick($key) {

    console.log("lastInput : " + lastInput + " currField : " + currField)
    var currMax = 0;

    switch (currField) {
        case contains(currField, "Costs"):
            currMax = 3
            break;
        case contains(currField, "Rate"):
            currMax = 4
            break;
        case contains(currField, "PBGC"):
            currMax = 3
            break;
        default :
            currMax = 5
    }

    if (lastInput != currField) {
        First1 = '';
        Display1 = '';
        //                console.log('inputOBj MYCLICK' + inputObj[currField])

        if (currField == "pboActives" || currField == "pboVesteds" || currField == "pboRetirees" || currField == "pboAssets" || currField == "pboTotalWorth") {
            if (pensionCalc.pboInDollars) {
                inputObj[currField] = dollarObj[currField]
            } else {
                inputObj[currField] = percentObj[currField]
            }
        } else {
        }

        First1 = (inputObj[currField]) ? inputObj[currField] : "";

        //        console.log('new field and first1 is ' + First1)

    } else {
        //        console.log('ELSEEZZZZ' + JSON.stringify(inputObj))

        if (currField == "pboActives" || currField == "pboVesteds" || currField == "pboRetirees" || currField == "pboAssets" || currField == "pboTotalWorth") {
            if (pensionCalc.pboInDollars) {
                inputObj[currField] = dollarObj[currField]
            } else {
                inputObj[currField] = percentObj[currField]
            }
            First1 = (inputObj[currField]) ? inputObj[currField] : "";
        } else {
            First1 = (inputObj[currField]) ? inputObj[currField] : "";
        }
    }

    if ($key === "x") {

        //        console.log("ERASING First1 is: " + First1)
        if (currField == "activesLongRate" || currField == "vestedsLongRate" || currField == "retireesLongRate") {

            //            First1 = String(addDec(First1));
            //            First1 = Number(First1).toFixed(2);
            //            console.log('FIRST FONE ' + First1)
            //            var decInd = First1.indexOf('.')
            //            var end = First1.slice(decInd+1)
            //            var start = First1.slice(0,decInd)
            //
            //            console.log('Start: ' + start + "end: "+end)
            //            First1 = start+end
            //            console.log('removed decimal' + First1)
            //            First1 = First1.slice(0, -1);
            //            Display1 = addDec(First1);
            First1 = subtractPercentage();
            //            console.log('removed decimal' + First1)
        } else {
            First1 = First1.replace(/,/g, '');
            First1 = First1.slice(0, -1);
            Display1 = addCommas(First1);
        }

        inputObj[currField] = First1;
        borg.setText(currField, Display1);
        if (currField == "activesCosts" || currField == "vestedsCosts" || currField == "retireesCosts" || currField == "PBGC") {
            pensionCalc.inputs2[currField] = First1;
        }
        else if (currField == "pboActives" || currField == "pboVesteds" || currField == "pboRetirees" || currField == "pboAssets" || currField == "pboTotalWorth") {
            pensionCalc.inputs[currField] = First1
            if (pensionCalc.pboInDollars) {
                dollarObj[currField] = First1
            } else {
                percentObj[currField] = First1
            }
        }
        else if (currField == "activesLongRate" || currField == "vestedsLongRate" || currField == "retireesLongRate") {
            Display1 = addDec(First1);
            inputObj[currField] = First1;
            //            console.log('erased and ' + First1)
            borg.setText(currField, Display1);
            pensionCalc.inputs2[currField] = First1;
        }
        else {
            pensionCalc.inputs[currField] = First1;
        }
        //TODO: This is bugfix 9141 take out if breaks
        lastInput = currField;
    }
    else {
        //adding support for percent maximums
        if ((currField == "pboActives" || currField == "pboVesteds" || currField == "pboRetirees") && !pensionCalc.pboInDollars) {
            currMax = 3
        } else {

        }

        var aa = String(First1)
        First1 = String(aa).replace(/^(0+)/g, '');
        if (String(First1).length + 1 > currMax) {
            var errorMessagezz = {
                action: "gotoURLAction",
                trigger: "now",
                target: "#systemPage",
                data: {
                    failureTitle: "Error",
                    failureMessage: "You have reached the maximum character limit for this field",
                    url: "alert://localhost/"
                }
            };
            lastInput = currField;

            borg.runAction(errorMessagezz);
            return
        }
        //adv options
        else if (currField == "activesCosts" || currField == "vestedsCosts" || currField == "retireesCosts" || currField == "PBGC") {

            First1 = (inputObj[currField]) ? inputObj[currField] : ""

            if (String(First1).length + 1 > currMax) {
                var errorMessagezz = {
                    action: "gotoURLAction",
                    trigger: "now",
                    target: "#systemPage",
                    data: {
                        failureTitle: "Error",
                        failureMessage: "You have reached the maximum character limit for this field",
                        url: "alert://localhost/"
                    }
                };
                lastInput = currField;

                borg.runAction(errorMessagezz);
                return
            }

            //            console.log("costs First1: " + First1)
            First1 = First1.replace(/,/g, '');
            First1 = First1 + $key;

            //TODO: Bugfix for multiple zeros
            First1 = (First1 == 0) ? 0 : First1

            pensionCalc.inputs2[currField] = First1;
            Display1 = addCommas(First1);
            borg.setText(currField, Display1);
            lastInput = currField;
            inputObj[currField] = First1;

        }
        //long rate is a percentage
        else if (currField == "activesLongRate" || currField == "vestedsLongRate" || currField == "retireesLongRate") {
            First1 = First1.replace(/,/g, '');
            First1 = First1 + $key;
            pensionCalc.inputs2[currField] = addDec(First1);
            Display1 = addDec(First1);
            borg.setText(currField, Display1);
            lastInput = currField;
            inputObj[currField] = First1;
            //            console.log('normal rate set to ' + First1)


        }
        else if (currField == "pboActives" || currField == "pboVesteds" || currField == "pboRetirees" || currField == "pboAssets" || currField == "pboTotalWorth") {
            First1 = First1.replace(/,/g, '');
            First1 = First1 + $key;
            pensionCalc.inputs[currField] = First1;
            //            console.log("setting pensionCalc.inputs IN PBO STORAGE -- : " + currField + " to " + First1)

            Display1 = addCommas(First1);
            borg.setText(currField, Display1);
            lastInput = currField;

            inputObj[currField] = First1;
            if (pensionCalc.pboInDollars) {
                dollarObj[currField] = First1
            } else {
                percentObj[currField] = First1
            }

        }
        //other input fields
        else {
            //            whichTextField = 'assetsText';

            First1 = First1.replace(/,/g, '');
            First1 = First1 + $key;
            pensionCalc.inputs[currField] = First1;
            //            console.log("setting pensionCalc.inputs -- : " + currField + " to " + First1)
            //            alert('setting' + First1)
            //            calc.assets = First1;
            Display1 = addCommas(First1);
            borg.setText(currField, Display1);
            lastInput = currField;
            inputObj[currField] = First1;
        }
    }

    //    console.log("input at end of myclick: "+JSON.stringify(inputObj))
    //    console.log("dollar: "+JSON.stringify(dollarObj))
}

function performAction(actions) {
    try {
        for (var i = 0; i < actions.length; i++) {
            borg.runAction(actions[i]);
        }
    }
    catch (e) {
    }
}

function contains(test, str) {
    if (test.indexOf(str) != -1) {
        return test
    } else {
        return false
    }

}

String.prototype.endsWith = function (suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

var fixedBug = false;
function gtz(inPage) {
    //    alert('zz')
    if (isDev && !fixedBug) {
        borg.gotoPage(inPage)
        fixedBug = true;
    } else {

    }

}