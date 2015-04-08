var Tab = require("../models/tab");
var _ = codebox.require("hr.utils");
var Collection = codebox.require("hr.collection");

var Tabs = Collection.extend({
    model: Tab,

    // Return current active tab
    getActive: function() {
        return this.find(function(tab) {
            return tab.get("active");
        });
    },
});

module.exports = Tabs;
