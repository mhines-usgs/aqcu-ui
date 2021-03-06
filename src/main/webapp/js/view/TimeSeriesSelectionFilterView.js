/**
 */
AQCU.view.TimeSeriesSelectionFilterView = AQCU.view.BaseView.extend({
	templateName: 'time-series-selection-filter',
	
	bindings: {
	},

	events: {
	},

	initialize: function() {
		AQCU.view.BaseView.prototype.initialize.apply(this, arguments);
		
		this.router = this.options.router;
		
		this.parentModel = this.options.parentModel;
		this.model = this.options.model || new Backbone.Model({
			//timeSeriesList: this.parentModel.get("timeSeriesList"), //this gets set by select,
			filter: this.parentModel.get("filter"),
			onlyPublish: true,
			onlyPrimary: true,
			computationFilter: [],
			periodFilter: [],
			unitFilter: [],
			parameterFilter: [],
			identifierFilter: []
		});
		var filter = this.model.get("filter");
		
		if(filter != null){
			this.model.set("onlyPublish", filter.onlyPublish);
			this.model.set("onlyPrimary", filter.onlyPrimary);
			this.model.set("computationFilter", filter.computationFilter);
			this.model.set("periodFilter", filter.periodFilter);
			this.model.set("parameterFilter", filter.identifierFilter);
		}
		
		this.parentModel.bind("change:site", this.render, this);
		
		//Stickit doesn't work well with default backbone model nested bindings
		//so we need to update each filter param individually
		this.model.bind("change:onlyPublish", this.updateFilter, this);
		this.model.bind("change:onlyPrimary", this.updateFilter, this);
		this.model.bind("change:computationFilter", this.updateFilter, this);
		this.model.bind("change:periodFilter", this.updateFilter, this);
		this.model.bind("change:parameterFilter", this.updateFilter, this);
		this.parentModel.bind("change:timeSeriesList", this.createParameterFilter, this);
	},
	
	/*override*/
	preRender: function() {
		this.context = {
			site : this.parentModel.get("site")
		};
	},
	
	afterRender: function () {
		this.createPublishPrimaryFilters();
		this.createComputationFilter();
		this.createPeriodFilter();
		this.stickit();
	},
	
	createPublishPrimaryFilters: function() {
		var publishFilter = new AQCU.view.CheckBoxField({
			router: this.router,
			model: this.model,
			fieldConfig: {
				fieldName : "onlyPublish",
				displayName : "Publish",
				description : "Publish Only"
			},
			el: '.publishFilter',
			immediateUpdate: true,
			startHidden: false
		});
		
		var primaryFilter = new AQCU.view.CheckBoxField({
			router: this.router,
			model: this.model,
			fieldConfig: {
				fieldName : "onlyPrimary",
				displayName : "Primary",
				description : "Primary Only"
			},
			el: '.primaryFilter',
			immediateUpdate: true,
			startHidden: false
		});
		
		$.extend(this.bindings, publishFilter.getBindingConfig());
		$.extend(this.bindings, primaryFilter.getBindingConfig());
	},
	
	createComputationFilter: function() {	
		$.ajax({
			url: AQCU.constants.serviceEndpoint +
					"/service/lookup/computations",
			timeout: 30000,
			dataType: "json",
			context: this,
			success: function (data) {			
				this.computationFilter = new AQCU.view.MultiselectField({
					el: '.computationFilter',
					model : this.model,
					fieldConfig: {
						fieldName: "computationFilter",
						displayName: "Filter Computations",
						description: "The list of time series below will be limited to the selected computations.",
						placeholder: "Filter by Computations"
					},
					data: data,
					initialSelection: this.model.get("computationFilter")
				});
			},
			error: function (a, b, c) {
				$.proxy(this.router.unknownErrorHandler, this.router)(a, b, c)
			}
	    });
	},
	
	createPeriodFilter: function() {		
		$.ajax({
			url: AQCU.constants.serviceEndpoint +
					"/service/lookup/periods",
			timeout: 30000,
			dataType: "json",
			context: this,
			success: function (data) {
				this.periodFilter = new AQCU.view.MultiselectField({
					el: '.periodFilter',
					model : this.model,
					fieldConfig: {
						fieldName: "periodFilter",
						displayName: "Filter Periods",
						description: "The list of time series below will be limited to the selected periods.",
						placeholder: "Filter by Periods"
					},
					data: data,
					initialSelection: this.model.get("periodFilter")
				});
			},
			error: function (a, b, c) {
				$.proxy(this.router.unknownErrorHandler, this.router)(a, b, c)
			}
		});
	},
	
	createParameterFilter: function() {
		var parameterSiteList = _.clone(this.parentModel.get("timeSeriesList"));
		if (parameterSiteList){
			var parameterList = [];
			parameterList = _.pluck(parameterSiteList, 'parameter');
			uniqueParameterList = _.uniq(parameterList);
			sortedParameterList = uniqueParameterList.sort(function (a, b) {
				return a.toLowerCase().localeCompare(b.toLowerCase());
			});
			this.parameterFilter = new AQCU.view.MultiselectField({
				el: '.parameterFilter',
				model : this.model,
				fieldConfig: {
					fieldName: "parameterFilter",
					displayName: "Filter Parameters",
					description: "The list of time series below will be limited to the selected parameter.",
					placeholder: "Filter by Parameters"
				},
				data: sortedParameterList,
				initialSelection: null
			});
		}
	},
	
	updateFilter: function() {
		//Need to deep-copy the filter object into a new object to trigger the 
		//backbone 'change' event
		var filter = JSON.parse(JSON.stringify(this.model.get("filter")));
		filter.onlyPublish = this.model.get("onlyPublish");
		filter.onlyPrimary = this.model.get("onlyPrimary");
		filter.computationFilter = this.model.get("computationFilter");
		filter.periodFilter = this.model.get("periodFilter");
		filter.parameterFilter = this.model.get("parameterFilter");
		this.model.set("filter", filter);
		this.parentModel.set("filter", filter);
	}
});
