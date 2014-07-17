define([
    "src/views/manager",
    "less!src/stylesheets/main.less"
], function(TabsManager) {
    var manager = new TabsManager();

    // Add tabs to grid
    codebox.app.grid.addView(manager);

    // Render the tabs manager
    manager.render();
});