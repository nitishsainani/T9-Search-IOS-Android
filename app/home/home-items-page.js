const HomeItemsViewModel = require("./home-items-view-model");
var app = require("application");
var contacts = require("nativescript-contacts");
var utils = require("tns-core-modules/utils/utils");
const phone = require("nativescript-phone");
const timerModule = require("tns-core-modules/timer")

var contactFields = ["name", "phoneNumbers"];
var homeViewModel;
var queryCombinations = [];
const KEY_MAP_ALPHABETS = {
    '1': [],
    '2': ['A', 'B', 'C'],
    '3': ['D', 'E', 'F'],
    '4': ['G', 'H', 'I'],
    '5': ['J', 'K', 'L'],
    '6': ['M', 'N', 'O'],
    '7': ['P', 'Q', 'R', 'S'],
    '8': ['T', 'U', 'V'],
    '9': ['W', 'X', 'Y', 'Z'],
    '0': []
}
var contactsList;

var searchWithNumberOnly = false;

function onNavigatingTo(args) {
    const component = args.object;
    homeViewModel = new HomeItemsViewModel()
    component.bindingContext = homeViewModel;
    contacts.getAllContacts(contactFields).then(
        function (args) {
            //console.log("getAllContacts Complete");
            contactsList = [];
            var setNumbers = new Set();
            for (var i = 0; i < args.data.length; ++i) {
                for (var j = 0; j < args.data[i]['phoneNumbers'].length; ++j) {
                    if (!setNumbers.has(args.data[i]['phoneNumbers'][j].value)) {
                        contactsList.push({
                            "name": args.data[i].name.prefix + args.data[i].name.given + args.data[i].name.middle + args.data[i].name.family + args.data[i].name.suffix,
                            "mobile": args.data[i]['phoneNumbers'][j].value
                        });
                        setNumbers.add(args.data[i]['phoneNumbers'][j].value);
                    }
                }
            }
            //console.log(Array.from(setNumbers));
            homeViewModel.items = contactsList;
            //console.log(contacts);
            /// Returns args:
            /// args.data: Generic cross platform JSON object, null if no contacts were found.
            /// args.reponse: "fetch"
        },
        function (err) {
            //console.log("Error: " + err);
        }
    );
}

async function onItemTap(args) {
    const view = args.view;
    const page = view.page;
    const tappedItem = view.bindingContext;
    await phone.requestCallPermission();
    var phoneNumber = tappedItem["mobile"].replace(/\s/g, '-');
    phone.dial(phoneNumber + "", false);
    return;
    utils.openUrl("tel://" + tappedItem["mobile"]);
    return;
    page.frame.navigate({
        moduleName: "home/home-item-detail/home-item-detail-page",
        context: tappedItem,
        animated: true,
        transition: {
            name: "slide",
            duration: 200,
            curve: "ease"
        }
    });
}

function buttonTapped(args) {
    var buttonPressed = args.object.parent.sup;
    homeViewModel.query += buttonPressed;
    //console.log(buttonPressed + KEY_MAP_ALPHABETS[buttonPressed].length);
    if (buttonPressed == '0' || buttonPressed == '1') {
        searchWithNumberOnly = true;
    } else {
        if (queryCombinations.length == 0) {
            //console.log("empty true");
            queryCombinations = KEY_MAP_ALPHABETS[buttonPressed];
        } else {
            tmpList = []
            for (var j = 0; j < KEY_MAP_ALPHABETS[buttonPressed].length; ++j) {
                for (var i = 0; i < queryCombinations.length; ++i) {

                    tmpList.push(queryCombinations[i] + KEY_MAP_ALPHABETS[buttonPressed][j]);
                }
            }
            queryCombinations = tmpList;
        }
        //console.log(queryCombinations);
    }
    updateViewModel();
    return;
}

function updateViewModel() {
    var nowBind = homeViewModel.items;
    var res = [];
    var setNumbers = new Set();
    for (var i = 0; i < nowBind.length; ++i) {
        if (!setNumbers.has(nowBind[i]['mobile'])) {
            if (nowBind[i]['mobile'].replace(/\D+/g, "").includes(homeViewModel.query)) {
                res.push(nowBind[i]);
                setNumbers.add(nowBind[i]['mobile']);
            }
        }
    }
    //console.log(Array.from(setNumbers));
    //console.log(res);
    var newQueries = [];
    if (!searchWithNumberOnly) {
        const setQuery = new Set(queryCombinations);
        for (var i = 0; i < nowBind.length; ++i) {
            if (!setNumbers.has(nowBind[i]['mobile'])) {
                for (var j = 0; j < nowBind[i].name.length; ++j) {
                    for (var k = j; k < nowBind[i].name.length; ++k) {
                        if (setQuery.has(nowBind[i].name.substring(j, k).toUpperCase())) {
                            newQueries.push(nowBind[i].name.substring(j, k).toUpperCase());
                            res.push(nowBind[i]);
                            setNumbers.add(nowBind[i]['mobile']);
                        }
                    }
                }
            }
        }
    }
    homeViewModel.items = res;
    queryCombinations = newQueries;
}

function animeButton(args) {
    //console.log(args.object.backgroundColor);
    if (args.object.backgroundColor == "#808080") {
        args.object.backgroundColor = "#CECECE";
        timerModule.setTimeout(() => { args.object.backgroundColor = "#808080" }, 150);
    }
    return;
}

function clear() {
    homeViewModel.query = "";
    searchWithNumberOnly = false;
    homeViewModel.items = contactsList;
    queryCombinations = [];
    return;
}

exports.clear = clear;
exports.animeButton = animeButton;
exports.buttonTapped = buttonTapped;
exports.onItemTap = onItemTap;
exports.onNavigatingTo = onNavigatingTo;
