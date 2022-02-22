ckan.module("harvest-change-source-type", function ($, _) {
    "use strict";
    return {
        options: {},

        initialize: function () {
            this.client = this.sandbox.client;
            this.preview = ".harvest-checkup-preview";
            this.harvest_types = $(".harvest-types");

            this._check_source(this._get_selected_type());

            $(".harvest-types input").change(function (e) {
                this._check_source(e.target.value);
            }.bind(this))

            $("#field-url").on("blur", function () {
                this._check_source(this._get_selected_type());
            }.bind(this))
        },

        _check_source: function (source_name) {
            var that = this;
            var source_url = that._get_source_url();
            var config = that._get_source_config();

            $(that.preview).removeClass("new error");
            this._add_pending_state();

            that.client.call('POST', 'harvest_basket_check_source', {
                source_name: source_name,
                source_url: source_url,
                config: config
            }, function (response) {
                that._show_check_result(response.result)
                that._remove_pending_state();
            }, function (response) {
                var err_msg = response.responseJSON.error.message
                console.warn(err_msg);
                that._show_check_result(err_msg)
                $(that.preview).toggleClass("error");
                that._remove_pending_state();
            });

        },

        _show_check_result: function (check_result) {
            var that = this;

            $(that.preview + " .preview-field").text(
                $.type(check_result) == "string" ? check_result : JSON.stringify(check_result, undefined, 2)
            )

            $(that.preview).toggleClass("new");
        },

        _get_selected_type: function () {
            var that = this;
            return that.harvest_types.find("input:checked").val()
        },

        _add_pending_state: function () {
            var that = this;
            that.harvest_types.addClass("pending");
        },

        _remove_pending_state: function () {
            var that = this;
            that.harvest_types.removeClass("pending");
        },

        _get_source_url: function () {
            return $("#field-url").val();
        },

        _get_source_config: function () {
            return $("#field-config").val();
        }
    };
});