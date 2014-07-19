define([
    "src/views/manager",
    "less!src/stylesheets/main.less"
], function(TabsManager) {
    var hr = codebox.require("hr/hr");
    var commands = codebox.require("core/commands");

    var manager = new TabsManager();

    // Add tabs to grid
    codebox.app.grid.addView(manager);

    // Change commands context
    manager.on("active", function(tab) {
        commands.setContext(tab.get("type"), tab.view);
    });

    // Render the tabs manager
    manager.render();

    // Make the tab manager global
    codebox.tabs = manager;
});