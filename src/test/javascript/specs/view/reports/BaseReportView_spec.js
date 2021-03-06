describe("BaseReportView.js", function() {
	var thisTemplate;
	var thisParentModel;
	var savedReportsControllerSpy, constructDisplayValuesMapSpy, builtSelectorFieldsSpy, savedReportsControllerSpyObj;
	var view;
	var thisSelectedTimeSeries = {
			computation: "Mean",
			description: "fake time series for testing view",
			identifier: "fake time series 1",
			parameter: "Discharge",
			period: "Daily",
			primary: true,
			publish: true,
			uid: "br549",
			units: "ft^3/s"
		};
	var timeseriesGageHeight = {
			computation: "Mean",
			description: "fake time series for testing view",
			identifier: "fake time series 1",
			parameter: "Gage Height",
			period: "Daily",
			primary: true,
			publish: true,
			uid: "br549",
			units: "ft^3/s"
		};
	var thisDateSelection = {lastMonths: 12};
	var thisDefaultFormat = "html";
	var testParams = {baseField: true,
			requestId: "testIdentifier",
			display: "Stat Derived Time Series 1",
			direction: "downchain",
			parameter: "Discharge",
			defaultComputation: "Mean",
			publish: 'true',
			period: 'Daily',
			dynamicParameter: 'true'
		};
		//Param setting that checks that the autofilled timeseries have the same parameter
	var testParamsSameUnit = {baseField: true,
			requestId: "testIdentifier",
			display: "Stat Derived Time Series 1",
			direction: "downchain",
			parameter: "Gage Height",
			defaultComputation: "Mean",
			publish: 'true',
			period: 'Daily',
			dynamicParameter: 'true',
			autofillWithSameUnits: "true"
		};
	var testIdentifierFullList = {
			1234 :{
				computation: "Mean",
				description: "DD002,00060,ft^3/s,00003",
				identifier: "Discharge.ft^3/s.Mean@01047200",
				parameter: "Discharge",
				period: 'Daily',
				primary: true,
				publish: true,
				uid: "1234",
				units: "ft^3/s"
				},
			abcdefg: {
				computation: "Mean",
				description: "REF,DD002,00060,ft^3/s,00003,finl",
				identifier: "Discharge.ft^3/s.Mean.finl.ref@01047200",
				parameter: "Discharge",
				period: 'Daily',
				primary: false,
				publish: false,
				uid: "abcdefg",
				units: "ft^3/s"
				},
			a1b1c1d1: {
				computation: "Mean",
				description: "primary true, publish false",
				identifier: "Discharge.ft^3/s.Mean.finl.ref@01047200",
				parameter: "Discharge",
				period: 'Daily',
				primary: true,
				publish: false,
				uid: "a1b1c1d1",
				units: "ft^3/s"
				},
			a2b3c4d5: {
				computation: "Mean",
				description: "primary false, publish true",
				identifier: "Discharge.ft^3/s.Mean.finl.ref@01047200",
				parameter: "Discharge",
				period: 'Daily',
				primary: false,
				publish: true,
				uid: "a2b3c4d5",
				units: "ft^3/s"
				},			
			parameterGageHeight :{
				computation: "Mean",
				description: "DD002,00060,ft^3/s,00003",
				identifier: "GageHeight.Mean@01047200",
				parameter: "Gage Height",
				period: 'Daily',
				primary: true,
				publish: true,
				uid: "parameterGageHeight",
				units: "ft^3/s"
				}
	};	
	var testDerivationChain = ["1234", "abcdefg", "a1b1c1d1", "a2b3c4d5", "parameterGageHeight"];
	var testIdentifierFullListPruned;
	
	beforeEach(function() {
		thisTemplate = jasmine.createSpy('thisTemplate');
		savedReportsControllerSpy = jasmine.createSpy('savedReportsControllerSpy');	
		savedReportsControllerSpyObj = jasmine.createSpyObj('savedReportsControllerSpyObj', ['saveReport']);
		builtSelectorFieldsSpy = jasmine.createSpy('builtSelectorFieldsSpy' );
		
	});
	
	it('Expects the appropriate properties to be defined after instantiation', function() {
		view = new AQCU.view.BaseReportView({
			template : thisTemplate,
			savedReportsController: savedReportsControllerSpy,
			selectedTimeSeries: thisSelectedTimeSeries,
			parentModel : new Backbone.Model({
				site: '1234',
				selectedTimeSeries: thisSelectedTimeSeries,
				dateSelection: thisDateSelection,
				format: thisDefaultFormat
			})
		});
		
		expect(view.savedReportsController).toBeDefined();
		expect(view.ajaxCalls).toBeDefined();
		expect(view.bindings).toBeDefined();
		expect(view.parentModel).toBeDefined();
		expect(view.model).toBeDefined();
		
	});
	
	it('Expects view\'s model attributes to be the same as the parentModel attributes', function() {
		view = new AQCU.view.BaseReportView({
			template : thisTemplate,
			selectedTimeSeries: thisSelectedTimeSeries,
			parentModel : new Backbone.Model({
				site: '1234',
				selectedTimeSeries: thisSelectedTimeSeries,
				dateSelection: thisDateSelection,
				format: thisDefaultFormat
			})
		});
		
		expect(view.model.site).toEqual(view.parentModel.site);
		expect(view.model.selectedTimeSeries).toEqual(view.parentModel.selectedTimeSeries);
		expect(view.model.dateSelection).toEqual(view.parentModel.dateSelection);
		expect(view.model.format).toEqual(view.parentModel.format);
	});
	
	describe("Tests for setFilteredDerivationChain", function() {
	
		it("Expects the derivation chain time series that is selected to be one where primary=true, publish=true, if it exists", function(){
			 //test when Published Only and Primary Only are both true
			 //omit parameterGageHeight because otherwise it supersedes 1234 as it is the last "true,true" in testIdentifierFullList
			testIdentifierFullListPruned = _.chain(testIdentifierFullList).omit(testIdentifierFullList,'parameterGageHeight').value();
			var publishedFlag = true;
			var primaryFlag = true;
			view = new AQCU.view.BaseReportView({
				template : thisTemplate,
				savedReportsController: savedReportsControllerSpy,
				selectedTimeSeries: thisSelectedTimeSeries,
				selectorIdentifier: "testIdentifier",
				testIdentifierFullList: testIdentifierFullListPruned,
				parentModel : new Backbone.Model({
					site: '1234',
					selectedTimeSeries: thisSelectedTimeSeries,
					dateSelection: thisDateSelection,
					format: thisDefaultFormat
				})
			});			
			view.model.set(testParams.requestId + "FullList", testIdentifierFullListPruned);
			view.setRelatedTimeseries(testParams,testDerivationChain);
			testFilteredDerivationChain = view.model.get(testParams.requestId);
			
			expect(testFilteredDerivationChain).toEqual("1234");
			
		});
		
		it("Expects the derivation chain time series not to be selected if it is not primary=true, publish=true", function(){
			testIdentifierFullListPruned = _.chain(testIdentifierFullList).omit(testIdentifierFullList,'1234').omit(testIdentifierFullList, 'parameterGageHeight').value();
			
			view = new AQCU.view.BaseReportView({
				template : thisTemplate,
				savedReportsController: savedReportsControllerSpy,
				selectedTimeSeries: thisSelectedTimeSeries,
				selectorIdentifier: "testIdentifier",
				testIdentifierFullList: testIdentifierFullListPruned,
				parentModel : new Backbone.Model({
					site: '1234',
					selectedTimeSeries: thisSelectedTimeSeries,
					dateSelection: thisDateSelection,
					format: thisDefaultFormat
				})
			});
			view.model.set(testParams.requestId + "FullList", testIdentifierFullListPruned);
			view.setRelatedTimeseries(testParams,testDerivationChain);
			testFilteredDerivationChain = view.model.get(testParams.requestId);
			
			expect(testFilteredDerivationChain).toBe(null);
			
			testIdentifierFullListPruned = _.chain(testIdentifierFullList).omit(testIdentifierFullList, 'a2b3c4d5').omit(testIdentifierFullList,'1234').omit(testIdentifierFullList, 'parameterGageHeight').value();
			
			view = new AQCU.view.BaseReportView({
				template : thisTemplate,
				savedReportsController: savedReportsControllerSpy,
				selectedTimeSeries: thisSelectedTimeSeries,
				selectorIdentifier: "testIdentifier",
				testIdentifierFullList: testIdentifierFullListPruned,
				parentModel : new Backbone.Model({
					site: '1234',
					selectedTimeSeries: thisSelectedTimeSeries,
					dateSelection: thisDateSelection,
					format: thisDefaultFormat
				})
			});
			
			view.model.set(testParams.requestId + "FullList", testIdentifierFullListPruned);
			view.setRelatedTimeseries(testParams,testDerivationChain);
			testFilteredDerivationChain = view.model.get(testParams.requestId);
			
			expect(testFilteredDerivationChain).toBe(null);
			
			testIdentifierFullListPruned = _.chain(testIdentifierFullList).omit(testIdentifierFullList, 'a1b1c1d1').omit(testIdentifierFullList,'1234').omit(testIdentifierFullList,'a2b3c4d5').omit(testIdentifierFullList, 'parameterGageHeight').value();
			view = new AQCU.view.BaseReportView({
				template : thisTemplate,
				savedReportsController: savedReportsControllerSpy,
				selectedTimeSeries: thisSelectedTimeSeries,
				selectorIdentifier: "testIdentifier",
				testIdentifierFullList: testIdentifierFullListPruned,
				parentModel : new Backbone.Model({
					site: '1234',
					selectedTimeSeries: thisSelectedTimeSeries,
					dateSelection: thisDateSelection,
					format: thisDefaultFormat
				})
			});
			
			view.model.set(testParams.requestId + "FullList", testIdentifierFullListPruned);
			view.setRelatedTimeseries(testParams,testDerivationChain);
			testFilteredDerivationChain = view.model.get(testParams.requestId);
			
			expect(testFilteredDerivationChain).toBe(null);
		});
		
		it("Expects the derivation chain to be chosen if it is measured in the same units and direction is sameParameter", function(){
			 //test when Published Only and Primary Only are both true
			testIdentifierFullListPruned = _.chain(testIdentifierFullList).omit(testIdentifierFullList, 'a1b1c1d1').omit(testIdentifierFullList,'a2b3c4d5').omit(testIdentifierFullList,'abcdefg').value();

			view = new AQCU.view.BaseReportView({
				template : thisTemplate,
				savedReportsController: savedReportsControllerSpy,
				selectedTimeSeries: thisSelectedTimeSeries,
				selectorIdentifier: "testIdentifier",
				testIdentifierFullList: testIdentifierFullListPruned,
				parentModel : new Backbone.Model({
					site: '1234',
					selectedTimeSeries: thisSelectedTimeSeries,
					dateSelection: thisDateSelection,
					format: thisDefaultFormat
				})
			});			
			view.model.set(testParams.requestId + "FullList", testIdentifierFullListPruned);
			
			//Test to see if parameter "Gage Height" forces it to choose parameterGageHeight
			view.setRelatedTimeseries(testParamsSameUnit, testDerivationChain, "Gage Height");
			testFilteredDerivationChain = view.model.get(testParams.requestId);
			expect(testFilteredDerivationChain).toEqual("parameterGageHeight");
			
			//Test to see if parameter "Discharge" forces it to choose 1234
			view.setRelatedTimeseries(testParamsSameUnit, testDerivationChain, "Discharge");
			testFilteredDerivationChain = view.model.get(testParams.requestId);
			expect(testFilteredDerivationChain).toEqual("1234");
			
			//Test to see if parameter "Dominator" returns nothing
			view.setRelatedTimeseries(testParamsSameUnit, testDerivationChain, "Dominator");
			testFilteredDerivationChain = view.model.get(testParams.requestId);
			expect(testFilteredDerivationChain).toEqual(null);
			
			//If no parameter is specified to match, want to look at the timeseries and 
			//find the parameter from there. thisSelectedTimeSeries is Discharge, so 1234 is chosen.
			view.setRelatedTimeseries(testParamsSameUnit, testDerivationChain);
			testFilteredDerivationChain = view.model.get(testParams.requestId);
			expect(testFilteredDerivationChain).toEqual("1234");
		});
	});
	
	describe("Tests for saveReport", function() {
		
		it("Expects that savedReportsController is called when a report is saved", function(){
			view = new AQCU.view.BaseReportView({
				template : thisTemplate,
				selectedTimeSeries: thisSelectedTimeSeries,
				savedReportsController: savedReportsControllerSpyObj,
				selectorIdentifier: "testIdentifier",
				testIdentifierFullList: testIdentifierFullList,
				parentModel : new Backbone.Model({
					site: {siteName: 'Test Site', siteNumber: '1234'},
					selectedTimeSeries: thisSelectedTimeSeries,
					dateSelection: thisDateSelection,
					format: thisDefaultFormat
				})
			});	
			
		view.constructDisplayValuesMap = jasmine.createSpy('constructDisplayValuesMapSpy');
		view.model.set(testParams.requestId + "FullList", testIdentifierFullList);
		view.setRelatedTimeseries(testParams.requestId,testDerivationChain);
		view.saveReport();
		
		expect(savedReportsControllerSpyObj.saveReport).toHaveBeenCalled();
		});
		
	});
});