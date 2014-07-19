define([
    "src/views/base"
], function(TabPanelView) {
    var HtmlPanel = TabPanelView.extend({
        render: function() {
            this.$el.attr("class", this.options.className);
            this.$el.html(this.options.content || "")
        }
    })

    return HtmlPanel;
});