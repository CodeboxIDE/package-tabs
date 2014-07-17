define([
    "hr/hr",
    "less!src/stylesheets/main.less"
], function(hr) {
    var manager = new hr.View();

    // Add tabs to grid
    codebox.app.grid.addView(manager);

    // Render the tabs manager
    manager.render();
});