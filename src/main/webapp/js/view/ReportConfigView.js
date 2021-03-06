/**
 * Extends BaseView.js, see for full documentation of class functions.
 */
AQCU.view.ReportConfigView = AQCU.view.BaseView.extend({
	templateName: 'report-config',

	/**
	* Used by Backbone Stickit to bind HTML input elements to Backbone models.
	* This will be built up in the initialize function.
	*/
	bindings: {},

	events: {
	},
	
	initialize: function() {
		AQCU.view.BaseView.prototype.initialize.apply(this, arguments);
		
		this.savedReportsController = this.options.savedReportsController;
		
		this.parentModel = this.options.parentModel;
		var site = this.parentModel.get("site");
		
		this.model = this.options.model || new Backbone.Model({
			site: this.parentModel.get("site"),
			timeSeriesList: this.parentModel.get("timeSeriesList"),
			filteredList: this.parentModel.get("filteredList"),
			dateSelection: this.parentModel.get("dateSelection"),
			selectedTimeSeries: this.parentModel.get("selectedTimeSeries"), 
			requestParams: null,
			filter: {
				onlyPrimary: true,
				onlyPublish: true,
				computationFilter: [
					"Instantaneous",
					"Decumulated"
				],
				periodFilter: [
					"Points"
				],
				identifierFilter:[],
				parameterFilter: [],
				unitFilter: []
			}
		});
		
		this.parentModel.bind("change:selectedSite", this.siteUpdated, this);
		this.model.bind("change:requestParams", this.launchReport, this);
	},
	
	/*override*/
	preRender: function() {
		this.context = {
			site : this.model.get("site")
		};
	},
	
	afterRender: function () {		
		this.ajaxCalls = {}; //used to cancel in progress ajax calls if needed

		this.reportParamsHeader = new AQCU.view.ReportConfigParamsView({
			parentModel: this.model,
			router: this.router,
			el: this.$(".report-config-params-container")
		});
		
		this.reportConfigHeader = new AQCU.view.ReportConfigHeaderView({
			parentModel: this.model,
			router: this.router,
			el: this.$(".report-config-header-container")
		});
		
		this.filterView = new AQCU.view.TimeSeriesSelectionFilterView({
			parentModel: this.model,
			router: this.router,
			el: this.$(".time-series-selection-filter-container")
		});

		this.selectionGrid = new AQCU.view.TimeSeriesSelectionGridView({
			parentModel: this.model,
			router: this.router,
			savedReportsController: this.savedReportsController,
			el: this.$(".time-series-selection-grid-container")
		});
		
		this.stickit();
	},

	
	siteUpdated: function() {
		this.model.set("requestParams", null);
		this.model.set("site", this.parentModel.get("selectedSite"));
	},
	
	launchReport: function() {
		var requestParams = this.model.get("requestParams");
		var reportOptions = this.model.get("reportOptions");
		if(requestParams) {
			//get parameters from all sources, combine into one request config and launch report
			this.router.startDownload(AQCU.constants.serviceEndpoint + "/service/reports/" + reportOptions.reportType + (!reportOptions.isHtml ? "/download" : ""), requestParams, "");
			this.model.set("requestParams", null);
		}
	}
});