const observableModule = require("tns-core-modules/data/observable");

function HomeItemsViewModel() {
    const viewModel = observableModule.fromObject({
        items: [],
        query: ""
    });

    return viewModel;
}

module.exports = HomeItemsViewModel;
