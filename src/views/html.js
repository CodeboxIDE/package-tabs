var TabPanelView = require("./base");

var HtmlPanel = TabPanelView.extend({
    render: function() {
        this.$el.attr("class", this.options.className);
        this.$el.html(this.options.content || "")
    }
});

module.exports = HtmlPanel;
