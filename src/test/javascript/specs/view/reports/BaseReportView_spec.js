describe("BaseReportView.js", function() {
	var thisTemplate;
	var thisParentModel;
	var savedReportsControllerSpy;
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
	var thisDateSelection = {lastMonths: 12};
	var thisDefaultFormat = "html";
	var testParams = {baseField: true,
			requestId: "testIdentifier",
			display: "First Downchain Stat Derived Time Series",
			direction: "downchain",
			parameter: "Discharge",
			defaultComputation: "Mean",
			publish: 'true',
			period: 'Daily',
			dynamicParameter: 'true'
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
				}
	};	
	var testDerivationChain = ["1234", "abcdefg", "a1b1c1d1", "a2b3c4d5"];
	var testIdentifierFullListPruned;
	
	beforeEach(function() {
		thisTemplate = jasmine.createSpy('thisTemplate');
		savedReportsControllerSpy = jasmine.createSpy('savedReportsControllerSpy');		
		
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
			savedReportsController: savedReportsControllerSpy,
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
			var publishedFlag = true;
			var primaryFlag = true;
			view = new AQCU.view.BaseReportView({
				template : thisTemplate,
				savedReportsController: savedReportsControllerSpy,
				selectedTimeSeries: thisSelectedTimeSeries,
				selectorIdentifier: "testIdentifier",
				testIdentifierFullList: testIdentifierFullList,
				parentModel : new Backbone.Model({
					site: '1234',
					selectedTimeSeries: thisSelectedTimeSeries,
					dateSelection: thisDateSelection,
					format: thisDefaultFormat
				})
			});			
			view.model.set(testParams.requestId + "FullList", testIdentifierFullList);
			view.setRelatedTimeseries(testParams.requestId,testDerivationChain);
			testFilteredDerivationChain = view.model.get(testParams.requestId);
			
			expect(testFilteredDerivationChain).toEqual("1234");
			
		});
		
		xit("Expects the derivation chain time series that is selected to be one where primary=false, publish=true, if it exists and primary=true, publish=true does not exist", function(){
			testIdentifierFullListPruned = _.omit(testIdentifierFullList,'1234');
			
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
			view.setRelatedTimeseries(testParams.requestId,testDerivationChain);
			testFilteredDerivationChain = view.model.get(testParams.requestId);
			
			expect(testFilteredDerivationChain).toEqual("a2b3c4d5");
			
		});
		
		xit("Expects the derivation chain time series that is selected to be one where primary=true publish=false, if it exists and primary=true, publish=true does not exist and primary=false, publish=true does not exist", function(){
			testIdentifierFullListPruned = _.chain(testIdentifierFullList).omit(testIdentifierFullList, 'a2b3c4d5').omit(testIdentifierFullList,'1234').value();
			
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
			view.setRelatedTimeseries(testParams.requestId,testDerivationChain);
			testFilteredDerivationChain = view.model.get(testParams.requestId);
			
			expect(testFilteredDerivationChain).toEqual("a1b1c1d1");
			
		});
		
		xit("Expects the derivation chain time series that is selected to be one where primary=false, publish=false, if it exists and primary=true, publish=true does not exist and primary=true, publish=false does not exist and primary=false, publish=true does not exist", function(){
			testIdentifierFullListPruned = _.chain(testIdentifierFullList).omit(testIdentifierFullList, 'a1b1c1d1').omit(testIdentifierFullList,'1234').omit(testIdentifierFullList,'a2b3c4d5').value();
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
			view.setRelatedTimeseries(testParams.requestId,testDerivationChain);
			testFilteredDerivationChain = view.model.get(testParams.requestId);
			
			expect(testFilteredDerivationChain).toEqual("abcdefg");
			
		});
	});
});