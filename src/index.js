require("./stylesheets/main.less");
var TabsManager = require("./views/manager");
var _ = codebox.require("hr.utils");
var commands = codebox.require("core/commands");

var manager = new TabsManager();

// Add tabs to grid
codebox.app.grid.addView(manager);

// Change commands context
manager.on("active", function(tab) {
    var ctx = {
        tab: tab
    };
    ctx[tab.get("type")] = tab.view;

    commands.setContext(_.extend(ctx, tab.get("context")));
});

// Render the tabs manager
manager.render();

// Make the tab manager global
codebox.tabs = manager;
codebox.tabs.Manager = TabsManager;


// Commands
commands.register({
    id: "tab.close",
    title: "Tab: Close",
    shortcuts: [
        "alt+w"
    ],
    run: function() {
        manager.tabs.get(manager.activeTab).close();
    }
});

commands.register({
    id: "tab.goto.previous",
    title: "Tab: Goto Previous",
    shortcuts: [
        "alt+shift+tab"
    ],
    run: function() {
        manager.tabs.get(manager.activeTab).gotoPrevious();
    }
});

commands.register({
    id: "tab.goto.next",
    title: "Tab: Goto Next",
    shortcuts: [
        "alt+tab"
    ],
    run: function() {
        manager.tabs.get(manager.activeTab).gotoNext();
    }
});
