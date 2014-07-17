define([
    "src/models/tab"
], function(Tab) {
    var _ = codebox.require("hr/utils");
    var hr = codebox.require("hr/hr");

    var Tabs = hr.Collection.extend({
        model: Tab,

        // Return current active tab
        getActive: function() {
            return this.find(function(tab) {
                return tab.get("active");
            });
        },
    });

    return Tabs;
});