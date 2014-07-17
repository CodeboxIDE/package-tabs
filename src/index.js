define([
    "src/views/manager",
    "less!src/stylesheets/main.less"
], function(TabsManager) {
    var hr = codebox.require("hr/hr");
    var manager = new TabsManager();

    // Add tabs to grid
    codebox.app.grid.addView(manager);

    // Add a view
    manager.add(hr.View, {}, {
        title: "Test"
    });

    manager.on("tabs:opennew", function() {
        manager.add(hr.View, {}, {
            title: "Test"
        });
    });

    // Render the tabs manager
    manager.render();
});