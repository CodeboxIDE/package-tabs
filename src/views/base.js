define(function() {
    var _ = codebox.require("hr/utils");
    var $ = codebox.require("hr/dom");
    var hr = codebox.require("hr/hr");
    var DragDrop = codebox.require("utils/dragdrop");
    var keyboard = codebox.require("utils/keyboard");

    /**
     * Tab body base view
     *
     * @class
     * @constructor
     */
    var TabPanelView = hr.View.extend({
        className: "component-tab-panel",
        events: {
            "click": "openTab"
        },

        /**
         * Title in the menu bar
         */
        menuTitle: "Tab",

        initialize: function() {
            TabPanelView.__super__.initialize.apply(this, arguments);

            this.tabs = this.parent;
            this.tab = this.options.tab;

            // Bind tab event
            this.listenTo(this.tab.manager, "active", function(tab) {
                var state = tab.id == this.tab.id;

                this.trigger("tab:state", state);
            });
            this.on("tab:close", function() {
                this.menu.destroy();
            }, this);

            return this;
        },

        /**
         * Close this tab
         */
        closeTab: function(e, force) {
            if (e != null) e.preventDefault();
            this.tab.close(force);
        },

        /**
         * Set this tab as active
         */
        openTab: function(e) {
            this.tab.active();
        },

        /**
         * Set tab title
         *
         * @param {string} title new title to set
         */
        setTabTitle: function(title) {
            this.tab.set("title", title);
            return this;
        },

        /**
         * Set a tab state, states are used to signal
         * for example that the file is loading, ...
         *
         * @param {string} state state id to define
         * @param {boolean} value value for this state
         */
        setTabState: function(state, value) {
            var states = (this.tab.get("state") || "").split(" ");

            if (value == null)  state = !_.contains(states, state);
            if (value) {
                states.push(state);
            } else {
                states = _.without(states, state);
            }
            this.tab.set("state", _.uniq(states).join(" "));
            return this;
        },

        /**
         * Set tab id
         *
         * @param {string} id new id for this tab
         */
        setTabId: function(id) {
            this.tab.set("id", id);
            return this;
        },

        /**
         * Check if the tab is active
         *
         * @return {boolean}
         */
        isActiveTab: function() {
            return this.tab.manager.isActiveTab(this.tab);
        },

        /**
         * Check if the tab can be closed,
         * this method can be overided
         *
         * @return {boolean}
         */
        tabCanBeClosed: function() {
            return true;
        }
    });

    return TabPanelView;
});