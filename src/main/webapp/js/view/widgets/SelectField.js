/**
 * Backbone view to encapsulate the text field widget
 */
AQCU.view.SelectField = Backbone.View.extend({
	/**
	 * Handlebars template
	 */
	template: Handlebars.compile("<div class='row field-container'> \
		{{#if displayName}}\
		<div class='col-sm-5 col-md-5 col-lg-5'>\
			<label for='{{fieldName}}'>{{displayName}}&nbsp;&nbsp;\
			{{#if description}}\
				<i class='fa fa-question-circle category-tip-target' title='{{description}}'></i>\
			{{/if}}\
		</label><br/></div> {{/if}}\
			<input type='hidden' name='{{fieldName}}' class='aqcu_field aqcu_field_{{fieldName}}'/> \
		<div class='{{#if displayName}}col-sm-7 col-md-7 col-lg-7{{else}}col-sm-12 col-md-12 col-lg-12{{/if}}'>\
		<select class='aqcu_field aqcu_select_field_{{fieldName}}'>\
		</select>\
		</div> \
		</div>"),
	/**
	 * Backbone events object. See backbone documentation
	 */
	events: {
	},
	/**
	 * Will create and render a text field using a fieldConfig options defined in NWIS Search Models.
	 */
	initialize: function(options) {
		this.options = options
		this.data = []
		this.router = this.options.router; //NWIS Vision Router
		this.fieldConfig = this.options.fieldConfig;
		this.renderTo = this.options.renderTo;
		this.hideNotSelect = this.options.hideNotSelect;
		this.model = this.options.model;
		
		this.filterRequired = this.options.filterRequired;
		this.events = {};
		
		Backbone.View.prototype.initialize.apply(this, arguments);
		this.render();

		this.$(".aqcu_field_" + this.fieldConfig.fieldName).val(this.model.get(this.fieldConfig.fieldName));
		this.updateSelectedOption();
		var _this = this;
		this.$(".aqcu_field_" + this.fieldConfig.fieldName).change(function() { _this.updateSelectedOption(); });
		this.$(".aqcu_select_field_" + this.fieldConfig.fieldName).change(function() { _this.setHiddenValue(); });
	},
	render: function() {
		var newDom = this.template(this.fieldConfig); //new DOM elements created from templates
		this.$el.append(newDom);
		this.renderTo.append(this.el);
	},
	/**
	 * The HTML that is generated here can be bound using Backbone stickit with the following
	 * config attributes.
	 * @returns JSON object containing a single config for this element
	 */
	getBindingConfig: function() {
		var binding = {};
		var _this = this;
		binding[".aqcu_field_" + this.fieldConfig.fieldName] = {
			observe: this.fieldConfig.fieldName,
			afterUpdate: function(el, val) {
				_this.updateSelectedOption();
			}
		};
		return binding;
	},
	/**
	 * Triggers an ajax call to load the select
	 * @param params
	 */
	loadOptions: function(params) {
		if (this.filterRequired && this.fieldConfig.lookupType && !params) {
			this.fieldContainer.clearInputs();
			this.fieldContainer.set_values([]); //make sure to blank out values
			return;
		}

		this.removeSelectOptions();

		$.ajax({
			url: AQCU.constants.serviceEndpoint + "/reference/list/" + this.fieldConfig.lookupType + "/json",
			timeout: 120000,
			dataType: "json",
			data: params,
			context: this,
			success: this.setSelectOptions,
			error: $.proxy(this.router.unknownErrorHandler, this.router)
		});
	},
	
	removeSelectOptions: function() {
		this.$el.find('option').each(function() {
			$(this).remove();
		});
	},
	
	setSelectOptions: function(data) {
		this.data = data;
		var selectField = this.$(".aqcu_select_field_" + this.fieldConfig.fieldName);
		selectField.html("");
		if(!this.hideNotSelect) {
			selectField.append('<option value="">Not selected</option>');
		}
		for (var i = 0; i < data.length; i++) {
			selectField.append('<option value="' + data[i]["KeyValue"] + '">' + data[i]["DisplayValue"] + '</option>');
		}
		this.updateSelectedOption();
	},
	
	getOptionDisplayValue : function(value) {
		var result;
		for(var i = 0; i < this.data.length; i++) {
			if(this.data[i]["KeyValue"] == value) {
				result = this.data[i]["DisplayValue"];
				break;
			}
		}
		return result;
	},
	
	getDisplayValue: function(value) {
		return this.$(".aqcu_select_field_" + this.fieldConfig.fieldName).find("option[value='"+value+"']").html()
	},
	
	showLoader: function() {
		this.$(".aqcu_select_field_" + this.fieldConfig.fieldName).addClass("aqcu-loading-indicator")
	},
	
	hideLoader: function() {
		this.$(".aqcu_select_field_" + this.fieldConfig.fieldName).removeClass("aqcu-loading-indicator")
	},
	
	/**
	 * Helper function to sync up the hidden value with the two date fields
	 */
	updateSelectedOption: function() {
		var value = this.$(".aqcu_field_" + this.fieldConfig.fieldName).val();
		this.$(".aqcu_select_field_" + this.fieldConfig.fieldName).val(value);
	},
	/**
	 * Helper function, when when either display values are updated, the hidden value is updated
	 */
	setHiddenValue: function() {
		var oldVal = this.$(".aqcu_field_" + this.fieldConfig.fieldName).val();
		var newVal = this.$(".aqcu_select_field_" + this.fieldConfig.fieldName).val();
		this.$(".aqcu_field_" + this.fieldConfig.fieldName).val(newVal);
		if (oldVal !== newVal) {
			this.$(".aqcu_field_" + this.fieldConfig.fieldName).change();
		}
	}
});
