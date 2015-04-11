var Tab = require("../models/tab");
var Tabs = require("../collections/tabs");
var TabView = require("./tab");
var TabsSectionView = require("./section");
var TabPanelView = require("./base");
var TabHtmlPanel = require("./html");

var Q = codebox.require("q");
var _ = codebox.require("hr.utils");
var $ = codebox.require("jquery");
var storage = codebox.require("hr.storage");
var View = codebox.require("hr.view");
var dnd = codebox.require("hr.dnd");
var GridView = codebox.require("hr.gridview");
var keyboard = codebox.require("utils/keyboard");

// Complete tabs system
var TabsView = View.extend({
    className: "component-tabs-manager",
    defaults: {
        // Base layout
        layout: null,

        // Available layouts
        layouts: {
            "Auto Grid": 0,
            "Columns: 1": 1,
            "Columns: 2": 2,
            "Columns: 3": 3,
            "Columns: 4": 4
        },

        // Enable tab menu
        tabMenu: true,

        // Enable open new tab
        newTab: true,

        // Max number of tabs per sections (-1 for unlimited)
        maxTabsPerSection: -1,

        // Tabs are draggable
        draggable: true,

        // Enable keyboard shortcuts
        keyboardShortcuts: true,
    },
    events: {},

    // Constructor
    initialize: function(options) {
        var that = this;
        TabsView.__super__.initialize.apply(this, arguments);

        this.Panel = TabPanelView;
        this.HtmlPanel = TabHtmlPanel;

        // Current active tab id
        this.activeTab = null;
        this.activeSection = 0;

        // Has been restored
        this._restored = false;

        // Current layout
        this.layout = this.options.layout; // null: mode auto
        this.grid = new GridView({}, this);
        this.grid.$el.appendTo(this.$el);

        // Drag and drop of tabs
        this.drag = new dnd.DraggableType();
        this.drag.toggle(this.options.draggable);
        this.drag.on("drop", function(section, tab) {
            if (!section && tab) tab.splitSection();
        });

        // Tabs collection
        this.tabs = new Tabs();

        // Restorer
        this.restorer = {};

        // Set base layout
        this.setLayout(this.layout);
        return this;
    },

    // Return a tab by its id
    getById: function(id) {
        return this.tabs.get(id);
    },

    // Return a section by its id
    getSection: function(id, opts) {
        opts = _.defaults(opts || {}, {
            at: undefined
        });

        var s = _.find(this.grid.views, function(section) {
            return section.sectionId == id;
        });

        if (!s) {
            s = new TabsSectionView({
                sectionId: id
            }, this);
            this.grid.addView(s, opts);
        }

        return s;
    },

    // Remove a section
    removeSection: function(id) {
        var s = this.getSection(id);
        this.grid.removeView(s);
        return this;
    },

    // Render all tabs
    render: function() {
        return this.ready();
    },

    /*
     *  Add a tab
     *  @V : view class
     *  @constructor : contructor options
     *  @options : options
     */
    add: function(V, construct, options) {
        var tab = null;

        options = _.defaults(options || {}, {
            // Tab type
            type: "tab",

            // Don't trigger event
            silent: false,

            // Open after creation
            open: true,

            // Base title
            title: "untitled",

            // Base icon
            icon: "",

            // Unique id for this tab
            uniqueId: null,

            // Base section id
            section: this.activeSection,

            // Position for the new section
            at: undefined
        });

        if (options.uniqueId) {
            tab = this.tabs.get(options.uniqueId)
        } else {
            options.uniqueId = _.uniqueId("tab");
        }

        if (!tab) {
            tab = new Tab({
                'manager': this
            }, {
                'type': options.type,
                'id': options.uniqueId,
                'title': options.title,
                'icon': options.icon
            });

            // Create tab object
            this.tabs.add(tab);

            // Create content view
            tab.view = new V(_.extend(construct || {}, {
                "tab": tab,
            }), this);
            tab.view.update();

            // Add to section
            var sectionId = options.section;
            for (;;) {
                var section = this.getSection(sectionId, { at: options.at });
                if (this.options.maxTabsPerSection > 0 && section.tabs.size() >= this.options.maxTabsPerSection) {
                    sectionId = _.uniqueId("tabSection");
                } else {
                    section.addTab(tab);
                    break;
                }
            }
        }

        if (options.open) tab.active();
        this.saveTabs();

        return tab.view;
    },

    // Open default new tab
    openDefault: function() {
        this.trigger("tabs:opennew");
    },

    // Define tabs layout
    setLayout: function(l) {
        if (!_.contains(_.values(this.options.layouts), l)) return;

        this.grid.setLayout(l);
        this.trigger("layout", l);
        this.saveTabs();
    },

    // Check if tab is the active tab
    isActiveTab: function(tab) {
        return this.activeTab == tab.id;
    },

    // Check sections
    // -> check that there is no empty sections
    checkSections: function() {
        _.each(this.grid.views, function(section) {
            // If empty remove it
            if (section.tabs.size() == 0) {
                this.grid.removeView(section);
                return;
            }

            // If no active tab
            if (section.tabs.getActive() == null) {
                section.tabs.first().active();
            }

        }, this);

        this.saveTabs();
    },

    // Change tab section
    changeTabSection: function(tab, section, options) {
        if (_.isString(tab)) tab = this.tabs.get(tab);
        if (!tab) return false;

        section = this.getSection(section);

        // Check limit
        if (this.options.maxTabsPerSection > 0 && section.tabs.size() >= this.options.maxTabsPerSection) return false;

        // Remove from old section
        tab.section.remove(tab);

        // Add to new section
        section.addTab(tab, options);

        // Active
        tab.active();

        // Check sections to remove empty one
        this.checkSections();

        return true;
    },

    // Save tabs
    saveTabs: function() {
        if (!this._restored) return;

        var state = {};

        // Snapshot sections and tabs
        state.sections = _.map(this.grid.views, function(section) {
            return {
                'id': section.sectionId,
                'tabs': section.tabs.map(function(tab) {
                    return tab.snapshot();
                })
            };
        });

        // Snapshot layout
        state.layout = this.grid.columns;
        storage.set("tabs", state);
    },

    // Add a restorer for tabs
    addRestorer: function(type, handler) {
        this.restorer[type] = handler;
        return this;
    },

    // Load tabs saved in last session (return number of tabs restored)
    restoreTabs: function(state) {
        var n = 0, that = this;

        state = state || storage.get("tabs") || {};

        // Set layout
        this.setLayout(state.layout);

        // Restore tabs
        return Q.all(
            _.chain(state.sections || [])
            .map(function(section) {
                that.getSection(section.id);
                return section.tabs;
            })
            .flatten()
            .map(function(tab) {
                // Restore tab
                return Q()
                .then(function() {
                    if (!that.restorer[tab.type]) return;

                    return Q(that.restorer[tab.type](tab));
                })
                .then(function(_tab) {
                    if (!_tab) return;

                    // restore in right section
                    _tab.changeSection(tab.section);
                    n = n + 1;
                })
                .fail(function() {
                    return Q();
                });
            })
            .value()
        )
        .then(function() {
            that._restored = true;
            that.checkSections();
            return n;
        });
    }
}, {
    Panel: TabPanelView
});

module.exports = TabsView;
