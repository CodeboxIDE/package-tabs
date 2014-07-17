define([
    "less!src/stylesheets/main.less"
], function() {
    var hr = codebox.require("hr/hr");
    var manager = new hr.View();

    // Add tabs to grid
    codebox.app.grid.addView(manager);

    // Render the tabs manager
    manager.render();
});