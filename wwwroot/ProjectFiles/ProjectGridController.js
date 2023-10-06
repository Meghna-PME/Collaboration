"use strict";  
var KendoPApp = angular.module("KendoProjectApp", ["kendo.directives", "ngSanitize","ngRoute", "ngResource","ui.People",'ngFileUpload']);
var SpURL;
var projId;
var webURL;
var refreshTym;
var proLen;
var SpUserEmail;
var SpUserDisplay;
var SpCulture;
var SpWebAbsolute;
if (location.hostname == 'projectmadeeasy.sharepoint.com') {
	SpURL = _spPageContextInfo.siteAbsoluteUrl;
	projId = getParameterByName("projuid");
	webURL = _spPageContextInfo.webServerRelativeUrl;
	refreshTym = _spFormDigestRefreshInterval;
	proLen = $('input[title="Project Name"]').length;
	SpUserEmail=_spPageContextInfo.userEmail;
	SpUserDisplay=_spPageContextInfo.userDisplayName;
	SpCulture=_spPageContextInfo.currentCultureName;
	SpWebAbsolute=_spPageContextInfo.webAbsoluteUrl;
} else {
	SpURL = 'https://projectmadeeasy.sharepoint.com/sites/Development';
	projId = 'dabc99c5-1746-ed11-be1e-00155da45649';
	webURL = '/sites/Development';
	refreshTym = 1440000;
	proLen = 1;
	SpUserEmail='meghna@projectmadeeasy.com';
	SpUserDisplay='Meghna';
	SpCulture='en-US';
	SpWebAbsolute='https://projectmadeeasy.sharepoint.com/sites/Development';
}
KendoPApp.config(function($routeProvider) {
    
	$routeProvider
		.when('/Risks', {
			templateUrl: 'ProjectFiles/Risks.html',
			controller: "ProjectRiskController",
		})
		.when('/Issues', {
			templateUrl: 'ProjectFiles/Issues.html',
			controller:"ProjectIssuesController",
		})
		 .when('/LessonsLearned', {
			templateUrl: 'ProjectFiles/LessonsLearned.html',
			controller:"LessonsLearnedMainController",
		})
		.when('/Action', {
			templateUrl: 'ProjectFiles/Actions.html',
			controller:"ProjectActionController",
		})
		.when('/Decisions', {
			templateUrl: 'ProjectFiles/Decisions.html',
			controller:"ProjectDecisionsController",
		})
		.when('/Communication', {
			templateUrl: 'ProjectFiles/Communication.html',
			controller:"CommunicationController",
		})
		.when('/ProductM', {
			templateUrl: 'ProjectFiles/ProductManagement.html',
			controller:"ProductMController",
		})
		.when('/Stakeholders', {
			templateUrl: 'ProjectFiles/Stakeholders.html',
			controller:"StakeholdersController",
		})
		.when('/RequirementManagement', {
			templateUrl: 'ProjectFiles/RequirementManagement.html',
			controller:"RequirementManagementController",
		})
		.when('/Budget', {
			templateUrl: 'ProjectFiles/Budget.html',
			controller:"ProjectBudgetController",
		})
		.when('/Insight', {
			templateUrl: 'ProjectFiles/Insights.html',
			controller:"ProjectcollabInsightsController",
		})
		
		.when('/Assumption', {
			templateUrl: 'ProjectFiles/Assumptions.html',
			controller:"ProjectcollabAssumptionController",
		})
		.when('/ProjectChangeRequest', {
			templateUrl: 'ProjectFiles/ProjectChangeRequest.html',
			controller:"ProjectcollabProjectChangeRequestController",
		})
		.when('/StatusMain', {
			templateUrl: 'ProjectFiles/StatusMain.html',
			controller:"ProjectcollabStatusMainController",
		})	
		.when('/Benefit', {
			templateUrl: 'ProjectFiles/Benefit.html',
			controller:"BenefitController",
		})		
		.otherwise({
			redirectTo: "/Risks"
		});
});
KendoPApp.directive('ngFileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var model = $parse(attrs.ngFileModel);
            var isMultiple = attrs.multiple;
            var modelSetter = model.assign;
            element.bind('change', function () {
                var values = [];
                angular.forEach(element[0].files, function (item) {
                    var value = {
                       // File Name 
                        name: item.name,
                        //File Size 
                        size: item.size,
                        //File URL to view 
                        url: URL.createObjectURL(item),
                        // File Input Value 
                        _file: item
                    };
                    values.push(value);
                });
                scope.$apply(function () {
                    if (isMultiple) {
                        modelSetter(scope, values);
                    } else {
                        modelSetter(scope, values[0]);
                    }
                });
            });
        }
    };
}]);

KendoPApp.factory("baseSvc", ["$http", "$q",
	function ($http, $q) {
	var getRequest = function (baseUrl, query) {
			var deferred = $q.defer();
			$.ajax({
				url: query,
				type: "GET",
				headers: {
					"accept": "application/json;odata=verbose",
					"content-Type": "application/json;odata=verbose"
				},
				success: function (success) {
					deferred.resolve(success);
				},
				error: function (error) {
					deferred.reject(error);
				}
			});
			return deferred.promise;
		};
	var postRequest = function (postData, baseUrl) {
			var deferred = $q.defer();
			$.ajax({
				url: baseUrl,
				type: "POST",
				data: JSON.stringify(postData),
				//contentType: "application/json;charset=utf-8;odata=verbose",
				headers: {
					"Accept": "application/json;odata=verbose",
					"Content-Type": "application/json;odata=verbose",
					"X-RequestDigest": $("#__REQUESTDIGEST").val(),
					"X-HTTP-Method": "POST"
				},
				success: function (data, status, xhr) {
					deferred.resolve(data);
				},
				error: function (xhr, status, error) {
					deferred.reject(xhr);
				}
			});
			return deferred.promise;
		};
		var updateRequest = function (postData, baseUrl) {
			var deferred = $q.defer();
			$.ajax({
				url: baseUrl,
				method: "POST",
				data: JSON.stringify(postData),
				headers: {
					"accept": "application/json;odata=verbose",
					"content-type": "application/json;odata=verbose",
					"X-RequestDigest": $("#__REQUESTDIGEST").val(),
					"IF-MATCH": "*", //Overrite the changes in the sharepoint list item
					"X-HTTP-Method": "MERGE" // Specifies the update operation in sharepoint list
				},
				success: function (success) {
					deferred.resolve(success);
				},
				error: function (error) {
					deferred.reject(error);
				}
			});
			return deferred.promise;
		};
		
		var sendEmailCB = function (from, to,CC,BCC, body, subject) {
			//Get the relative url of the site
			var deferred = $q.defer();

			var siteurl = webURL;
			var urlTemplate = siteurl + "/_api/SP.Utilities.Utility.SendEmail";
			$.ajax({
				contentType: 'application/json',
				url: urlTemplate,
				type: "POST",
				data: JSON.stringify({
					'properties': {
						'__metadata': {
							'type': 'SP.Utilities.EmailProperties'
						},
						'From': from,
						'To': {
							'results': to,
						},
						'CC': {'results': CC,
						},
	                    'BCC': { 'results': BCC,
	                    },
						'Body': body,
						'Subject': subject
					}
				}),
				headers: {
					"Accept": "application/json;odata=verbose",
					"content-type": "application/json;odata=verbose",
					"X-RequestDigest": jQuery("#__REQUESTDIGEST").val()
				},
				success: function (data) {
					deferred.resolve(data);
				},
				error: function (err) {
					deferred.reject(xhr);


				}
			});
			return deferred.promise;

		}
		var deleteRequest = function (baseUrl) {
			var deferred = $q.defer();
			$.ajax({
				url: baseUrl, // _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('ManageSKU')/items('"+itemID+"')",				
				type: "DELETE",
				headers: {
					"accept": "application/json;odata=verbose",
					"X-RequestDigest": $("#__REQUESTDIGEST").val(),
					"If-Match": "*"
				},
				success: function (result) {
					deferred.resolve(result);
				},
				error: function (error) {
					deferred.reject(error);
				}
			});
			return deferred.promise;
		};
		var GetAttachmentFileBuffer = function (file) {
			var deferred = $.Deferred();
			var reader = new FileReader();

			reader.onload = function (e) {
				deferred.resolve(e.target.result);
			}
			reader.onerror = function (e) {
				deferred.reject(e.target.error);
			}
			// var blob = new Blob([file], {type: 'application/json'});
			//  reader.readAsText(blob);
			reader.readAsArrayBuffer(file);
			return deferred.promise();
		}

var getFileBuffer = function (buffer, ID, listname, file) {
			var deferred = $q.defer();

			$.ajax({
				url: SpWebAbsolute + "/_api/web/lists/getbytitle('" + listname + "')/items(" + ID + ")/AttachmentFiles/add(FileName='" + file.name + "')",
				method: 'POST',
				async: false,
				data: buffer,
				processData: false,
				headers: {
					"Accept": "application/json; odata=verbose",
					"content-type": "application/json; odata=verbose",
					"X-RequestDigest": document.getElementById("__REQUESTDIGEST").value

				},
				success: function (data, status, xhr) {
					deferred.resolve(data);
				},
				error: function (xhr, status, error) {
					deferred.reject(xhr);
				}
			});
			return deferred.promise;

		}

		var DeleteAttachment = function (ItemId, FileTitle, Listname) {
			var deferred = $q.defer();
		var Url = SpWebAbsolute + "/_api/web/lists/GetByTitle('" + Listname + "')/GetItemById(" + ItemId + ")/AttachmentFiles/getByFileName('" + FileTitle + "')  ";  
            $.ajax({  
                url: Url,  
                type: 'DELETE',  
                contentType: 'application/json;odata=verbose',  
                headers: {  
                    'X-RequestDigest': $('#__REQUESTDIGEST').val(),  
                    'X-HTTP-Method': 'DELETE',  
                    'Accept': 'application/json;odata=verbose'  
                },  
                success: function (data) {  
                    deferred.resolve(data);
                },  
                error: function (error) {  
                    	deferred.reject(error); 
                }  
            });  
		return deferred.promise;

		}
return {
			getRequest: getRequest,
			postRequest:postRequest,
			updateRequest:updateRequest,
			deleteRequest:deleteRequest,
			getFileBuffer:getFileBuffer,
			GetAttachmentFileBuffer:GetAttachmentFileBuffer,
			DeleteAttachment:DeleteAttachment,
			sendEmailCB:sendEmailCB,
			};
		}
]);
KendoPApp.factory("ProjectkFactoryService", ["baseSvc",
	function (baseService) {
	var AddNew = function (data, ListName) {
			var url = SpURL + "/_api/web/lists/getByTitle('" + ListName + "')/items";
			return baseService.postRequest(data, url);
		};
	var GetAllItems = function (ListName,url) {			
			return baseService.getRequest('', url);
		};
	var GetAllItemsLookup = function (ListName) {
				var url = SpURL + "/_api/web/lists/getByTitle('" + ListName + "')/items?$top=4998&$select=*&$orderby=Title";
				return baseService.getRequest('', url);
			};
	var Update = function (data, ListName, Id) {
			var url = SpURL + "/_api/web/lists/getByTitle('" + ListName + "')/GetItemById('" + Id + "')";
			return baseService.updateRequest(data, url);
		};
	var DeleteById = function (ListName, Id) {
			var url = SpURL + "/_api/web/lists/getByTitle('" + ListName + "')/items('" + Id + "')";
			return baseService.deleteRequest(url);		
		};

	return {
			GetAllItemsLookup: GetAllItemsLookup,
			AddNew:AddNew,
			Update:Update,
			GetAllItems:GetAllItems,
			DeleteById:DeleteById,
			};
		}
]);
KendoPApp.directive('toggleCheckbox', function () {
	return ({
		restrict: 'A',
		require: 'ngModel',
		link: function (scope, element, attributes, ngModelController) {
			element.on('change.toggle', function (event) {
				// note that ".toogle" is our namespace, used further down to remove the handler again
				var checked = element.prop('checked');
				ngModelController.$setViewValue(checked);
			});

			ngModelController.$render = function () {
				element.bootstrapToggle(ngModelController.$viewValue ? 'on' : 'off');
			};

			scope.$on('$destroy', function () {
				// clean up
				element.off('change.toggle');
				element.bootstrapToggle('destroy');
			});
			var initialValue = scope.$eval(attributes.ngModel);
			element.prop('checked', initialValue);
		}
	});
});
KendoPApp.controller('ProjectkController', ['$scope', "$http", "$q", "$location","$sce", 'baseSvc', 'ProjectkFactoryService',
function ($scope, $http, $q, $location, $sce, bSvc, PService) {
	
	$scope.CollaborationLookUPList = 'Collaboration: Lookups'
	$scope.editorOptions = {
			/* messages: {
				fontSizeInherit: "Font Size" "fontSize", 
			}, 
			tools: ["bold", "italic", "underline", "justifyLeft", "justifyCenter", "justifyRight", "insertUnorderedList", "insertOrderedList", "indent", "outdent", "createLink", "unlink", {
				name: "Undo",
				tooltip: "Undo"
			}] */
			tools: [""]
		};
	$scope.init = function(){	
			
			 $("#ReloadPageId").hide();
			 var n = 3600;
			var tm = setInterval(countDown,1000);

			function countDown(){
			   n--;
			   if(n == 0){
				  clearInterval(tm);
				//  window.location.reload();
			   }
			   var secondschk = n%60;
			   var miniteschk = Math.floor(n/60);
			   var minites = Math.floor(n/60);
			   var seconds = n%60;
			   if(secondschk <10){
				   seconds = "0"+secondschk;
			   }
			   if(miniteschk <10){
				   minites = "0"+miniteschk;
			   }
			   
			   //console.log(n);
			   if(n<3600)
			   {
				if(n<300)
				   {
					$('#timeoutcounter').css("background-color","Red");
					$('#timeoutcounter').css("color","white");						
				   }
					if(n< 299)
				   {
					UpdateFormDigest(webURL, refreshTym);				
				   }
				if(n<1){
					   $('#timeoutcounter').css("background-color","Red");
						$('#timeoutcounter').css("color","white");						
					   $('#timeoutcounter').text("The page has expired.Please click Reload button to continue." );
					    $('#ReloadPageId').show();
				   }else{
					   $('#timeoutcounter').text("Page will expire in " + minites +":"  + seconds + ". Please save all changes prior to timeout.\n Clicking Save will automatically refresh the page and expiration timing." );
					   
				   }
				
			   }
			   
			} 
		
			if(window.location.hash === "#!/Issues"){				
				$location.path('/Issues');
				$scope.ShowIssues();
			 }
			else if(window.location.hash === "#!/Risks"){				
				$location.path('/Risks');
				$scope.ShowRisks();
			 }
			 else if(window.location.hash === "#!/Action"){				
				$location.path('/Action');
				$scope.ShowAction();
			 }
			  else if(window.location.hash === "#!/Decisions"){				
				$location.path('/Decisions');
				$scope.ShowDecisions();
			 }
			  else if(window.location.hash === "#!/Budget"){				
				$location.path('/Budget');
				$scope.ShowBudget();
			 }
			  else if(window.location.hash === "#!/Insight"){				
				$location.path('/Insight');
				$scope.ShowInsight();
			 }
			  else if(window.location.hash === "#!/Assumption"){				
				$location.path('/Assumption');
				$scope.ShowAssumption();
			 }
			else if(window.location.hash === "#!/ProductM"){				
				$location.path('/ProductM');
				$scope.ShowProductM();
			 }
			 else if(window.location.hash === "#!/Communication"){				
				$location.path('/Communication');
				$scope.ShowCommunication();
			 }
			   else if(window.location.hash === "#!/ProjectChangeRequest"){				
				$location.path('/ProjectChangeRequest');
				 $scope.ShowProjectChangeRequest();
			 }
			  else if(window.location.hash === "#!/StatusMain"){				
				$location.path('/StatusMain');
				 $scope.ShowStatusMain();
			 }
			 else if(window.location.hash === "#!/LessonsLearned"){				
				$location.path('/LessonsLearned');
				$scope.ShowLessonsLearned();
			 }
			 
			  else if(window.location.hash === "#!/RequirementManagement"){				
				$location.path('/RequirementManagement');
				 $scope.ShowRequirementManagement();
			 }
			 
			   else if(window.location.hash === "#!/Stakeholders"){				
				$location.path('/Stakeholders');
				 $scope.ShowStakeholders();
			 }

			
			 $scope.RCategoryDDList = [];
			 $scope.RRiskTriggerDDList = [];
			 $scope.RiskStatusDDList = [];
			 $scope.RRiskProbabilityDDList = [];
			 $scope.RRiskImpactDDList = [];
			 $scope.RRiskActionDDList = [];	
			 $scope.getcollabLookups = [];
			 $scope.RIncludeonStatusReportDDList = [];
			 $scope.IssuePriorityDDList = [];	
			 $scope.IssueCategoryDDList = [];
			 $scope.IssueStatusDDList = [];

			 	$scope.ActionDDList = [];
				$scope.CategoryDDList = [];
				$scope.ImpactDDList = [];
				$scope.IncludeonStatusReportDDList = [];
				$scope.PriorityDDList = [];
				$scope.ProbabilityDDList = [];
				$scope.StatusDDList = [];
				$scope.TriggerDDList = [];

				$scope.ProjectPhaseDDList = [];
				$scope.InsightCategoryDDList = [];
				$scope.InsightTypeDDList = [];
				$scope.ChangeRequestStatusDDList = [];
				$scope.HealthDDList = [];
				$scope.RequirementManagementStatusDDList =[]
				$scope.RequirementManagementProgressDDList = [];
				

		
			 PService.GetAllItemsLookup($scope.CollaborationLookUPList).then(function (response) {
					$scope.getcollabLookups.push(response);
					angular.forEach(response.d.results, function (item, index) {
						switch (item.Select_x0020_Title) {

						case 'Priority':
							$scope.PriorityDDList.push(item.Title);
							break;
						case 'Insight Type':
							$scope.InsightTypeDDList.push(item.Title);
							break;
						case 'Insight Category':
							$scope.InsightCategoryDDList.push(item.Title);
							break;
						case 'Project Phase':
							$scope.ProjectPhaseDDList.push(item.Title);
							break;
						case 'Category':
							$scope.CategoryDDList.push(item.Title);
							break;
						case 'Item Status':
							$scope.StatusDDList.push(item.Title);
							break;
						case 'Issue Status':
							$scope.IssueStatusDDList.push(item.Title);
							break;
						case 'RequirementManagementStatus':
							$scope.RequirementManagementStatusDDList.push(item.Title);
							break;	
						case 'RequirementManagementProgress':
							$scope.RequirementManagementProgressDDList.push(item.Title);
							break;							
						case 'Risk Status':
							$scope.RiskStatusDDList.push(item.Title);
							break;
						case 'Trigger':
							$scope.TriggerDDList.push(item.Title);
							break;						
						case 'Probability':
							$scope.ProbabilityDDList.push(item.Title);
							break;
							case 'Impact':
							$scope.ImpactDDList.push(item.Title);
							break;					
						case 'Action':
							$scope.ActionDDList.push(item.Title);
							break;
						case 'Include on Status Report':
							$scope.IncludeonStatusReportDDList.push(item.Title);
							break;
						case 'Change Request Status':
							$scope.ChangeRequestStatusDDList.push(item.Title);
							break;
						case 'Health':
							$scope.HealthDDList.push(item.Title);
							break;
						}
					});

					
					
					 $scope.KIssueStatusDDList = { dataSource: $scope.IssueStatusDDList, }; 
					 $scope.KRiskStatusDDList = { dataSource: $scope.RiskStatusDDList, }; 
					 $scope.KCategoryDDList = { dataSource: $scope.CategoryDDList, }; 
					 $scope.KActionDDList = { dataSource: $scope.ActionDDList, }; 
					 $scope.KImpactDDList = { dataSource: $scope.ImpactDDList, }; 
					 $scope.KIncludeonStatusReportDDList = { dataSource: $scope.IncludeonStatusReportDDList, }; 
					 $scope.KPriorityDDList = { dataSource: $scope.PriorityDDList, }; 
					 $scope.KProbabilityDDList = { dataSource: $scope.ProbabilityDDList, }; 
					 $scope.KStatusDDList = { dataSource: $scope.StatusDDList, }; 
					 $scope.KTriggerDDList = { dataSource: $scope.TriggerDDList, }; 
					 $scope.KProjectPhaseDDList = { dataSource: $scope.ProjectPhaseDDList, }; 
					 $scope.KInsightCategoryDDList = { dataSource: $scope.InsightCategoryDDList, }; 
					 $scope.KInsightTypeDDList = { dataSource: $scope.InsightTypeDDList, }; 
				   	 $scope.KChangeRequestStatusDDList = { dataSource: $scope.ChangeRequestStatusDDList, }; 
  					 $scope.KHealthDDList = { dataSource: $scope.HealthDDList, }; 
					  $scope.KRequirementManagementStatusDDList = { dataSource: $scope.RequirementManagementStatusDDList, }; 
					  $scope.KRequirementManagementProgressDDList = { dataSource: $scope.RequirementManagementProgressDDList, }; 
					 
					 

					

			 },function (error) {                   
				console.error('Error:GetAllItemsLookup ' + error.result);
			});
				$scope.RisksList = [];
					$scope.IssuesList = [];
					$scope.ActionsListF = []
					$scope.AssumptionsListF = [];
					$scope.DecisionsListF = [];
					$scope.BudgetListF = [];
					$scope.InsightsListF = [];
					$scope.PCRListF = [];
					$scope.StatusListF = [];
		$scope.LessonLearnedF = []
		if (location.hostname == 'projectmadeeasy.sharepoint.com') { 
			var url = SpURL + "/_api/web/lists/getByTitle('Collaboration: Tool Tip')/items?$top=4998&$select=ID,Title,TabName,Description";
		} else {
			var url = "Tool Tip.json";
		}
				
				PService.GetAllItemsLookup('Collaboration: Tool Tip',url).then(function (response) {
						$scope.getFiledcollabsresponse = response.d.results;
						var num = 0;
						angular.forEach(response.d.results, function (item, index) {
							switch (item.TabName) {
								case 'Risks':
									$scope.RisksList.push(item);									
									break;
								case 'Issues':
									$scope.IssuesList.push(item);
									break;
								case 'Actions':
									$scope.ActionsListF.push(item);
									break;
								case 'Assumptions':
									$scope.AssumptionsListF.push(item);
									break;
								case 'Decisions':
									$scope.DecisionsListF.push(item);								
									break;
								case 'Budget':
									$scope.BudgetListF.push(item);									
									break;
								case 'Insights':
									$scope.InsightsListF.push(item);								
									break;
								case 'Project Change Requests':
									$scope.PCRListF.push(item);									
									break;								
								case 'Status':
									$scope.StatusListF.push(item);									
									break;
								}
						});
						console.log($scope.RisksList)
					},function (error) {                   
						console.error('Error:getFiledNames ' + error.result);
					});
				$scope.TrueProjectName = false;
					if(proLen == 0){
					
						$scope.TrueProjectName = true;
					}
					if (location.hostname == 'projectmadeeasy.sharepoint.com') {
					var url = SpURL + "/_api/web/lists/GetByTitle('Collaboration: Lessons Learned')/fields?$filter=EntityPropertyName eq 'Category' or EntityPropertyName eq 'PositiveorNegative' or EntityPropertyName eq 'Title'";}else{var url = 'Lessons Learned.json';}
					PService.GetAllItems('Collaboration: Lessons Learned', url).then(function (response) {	
						
						debugger
						angular.forEach(response.d.results, function (item, index) {
								switch (item.EntityPropertyName) {
									case 'Category':
										$scope.CategeryLessonsLearned = { dataSource:item.Choices.results}									
										break;
									case "PositiveorNegative":
										$scope.PositiveorNegativeLessonsLearned = { dataSource:item.Choices.results}									
										break;
									case "Title":
										$scope.LMaxLTitle =item.MaxLength;
										break;
									
									}
							});
							
							console.log($scope.CategeryLessonsLearned);
							console.log($scope.PositiveorNegativeLessonsLearned);
						},function (error) {                   
							console.error('Error:getChoices ' + error.result);
						});
					
					$scope.RoleDList = [];
					if (location.hostname == 'projectmadeeasy.sharepoint.com') {
					var url = SpURL + "/_api/web/lists/GetByTitle('Collaboration: Stakeholders')/fields?$filter=EntityPropertyName eq 'Role'";
	}else{var url='Stakeholders.json';}
					PService.GetAllItems('Collaboration: Stakeholders', url).then(function (response) {					
						angular.forEach(response.d.results, function (item, index) {
								switch (item.EntityPropertyName) {
									case 'Role':
										$scope.RoleDList = item.Choices.results.sort();									
										break;
									}
							});
							
						},function (error) {                   
							console.error('Error:getmmmmmmmmmmmmmChoices ' + error.result);
						});
						
						
						$scope.ParticipantsList = [];
						$scope.FrequencyList = [];
						$scope.MeetingTypeList = [];
						if (location.hostname == 'projectmadeeasy.sharepoint.com') {
					var url = SpURL + "/_api/web/lists/GetByTitle('Collaboration: Communication')/fields?$filter=EntityPropertyName eq 'Participants' or EntityPropertyName eq 'Frequency' or EntityPropertyName eq 'MeetingType'";} else {
			var url = "Communication.json";
		}
					PService.GetAllItems('Collaboration: Communication', url).then(function (response) {					
						angular.forEach(response.d.results, function (item, index) {
								switch (item.EntityPropertyName) {
									case 'Participants': 
										$scope.ParticipantsList = item.Choices.results.sort();									
										break;
									case 'Frequency':
										$scope.FrequencyList = item.Choices.results.sort();									
										break;
									case 'MeetingType':
										$scope.MeetingTypeList = item.Choices.results.sort();									
										break;
									}
							});
							
						},function (error) {                   
							console.error('Error:getmmmmmmmmmmmmmChoices ' + error.result);
						});


		
	}
	$scope.ShowIssues = function(){		
		$('ul.nav li.active').removeClass('active');
		$("a[name^=Issues]").closest('li').addClass('active').hover();
		
		//$scope.Test = 'Coming Soon'
		
	}

		$scope.ShowStakeholders = function(){		
		$('ul.nav li.active').removeClass('active');
		$("a[name^=Stakeholders]").closest('li').addClass('active').hover();	
					
	}	

$scope.ShowProductM = function(){		
		$('ul.nav li.active').removeClass('active');
		$("a[name^=ProductM]").closest('li').addClass('active').hover();	
					
	}		
	$scope.ShowCommunication = function(){		
		$('ul.nav li.active').removeClass('active');
		$("a[name^=Communication]").closest('li').addClass('active').hover();	
					
	}		

	$scope.ShowRisks = function(){		
		$('ul.nav li.active').removeClass('active');
		$("a[name^=Risks]").closest('li').addClass('active').hover();	
			
	}	
	$scope.ShowAction = function(){		
		$('ul.nav li.active').removeClass('active');
		$("a[name^=Action]").closest('li').addClass('active').hover();				
	}	

	$scope.ShowDecisions = function(){		
		$('ul.nav li.active').removeClass('active');
		$("a[name^=Decisions]").closest('li').addClass('active').hover();				
	}	

	$scope.ShowBudget = function(){		
		$('ul.nav li.active').removeClass('active');
		$("a[name^=Budget]").closest('li').addClass('active').hover();				
	}	
	$scope.ShowInsight = function(){		
		$('ul.nav li.active').removeClass('active');
		$("a[name^=Insight]").closest('li').addClass('active').hover();				
	}
	
	$scope.ShowAssumption = function(){		
		$('ul.nav li.active').removeClass('active');
		$("a[name^=Assumption]").closest('li').addClass('active').hover();				
	}

	$scope.ShowProjectChangeRequest = function(){		
		$('ul.nav li.active').removeClass('active');
		$("a[name^=ProjectChangeRequest]").closest('li').addClass('active').hover();				
	}	

	$scope.ShowStatusMain = function(){		
		$('ul.nav li.active').removeClass('active');
		$("a[name^=StatusMain]").closest('li').addClass('active').hover();				
	}	
	
	$scope.ShowRequirementManagement = function(){		
		$('ul.nav li.active').removeClass('active');
		$("a[name^=RequirementManagement]").closest('li').addClass('active').hover();				
	}	
	$scope.ShowLessonsLearned = function(){		
		$('ul.nav li.active').removeClass('active');
		$("a[name^=LessonsLearned]").closest('li').addClass('active').hover();				
	}
		

		
}]);

KendoPApp.controller('ProjectRiskController', ['$scope', "$http", "$q", "$location","$sce", 'baseSvc', 'ProjectkFactoryService', 'Upload', '$timeout',
function ($scope, $http, $q, $location, $sce, bSvc, PService, Upload, $timeout) {
	$scope.init = function(){
		
		if(window.location.hash === "#!/Risks"){				
			$location.path('/Risks');
			$scope.ShowRisks();
		 }
		 debugger
			 

		
	}

	/* --- Upload Document Files--*/
	$scope.uploadFiles = function (files, errFiles) {
			$scope.filesdata = [];
			$('#SaveCanInfoBtn').attr('disabled', true);
			$scope.files = files;
			$scope.AttchmentfileSel = false;
			$scope.errFiles = errFiles;
			angular.forEach(files, function (filedata) {
				//$scope.filesdata.push(filedata);
				$scope.filesdata.push({
					"Attachment": filedata
				});
				$scope.AttchmentfileSel = true;
				//$('#SaveCanInfoBtn').attr('disabled', false);
			});
			angular.forEach(files, function (file) {

				file.upload = Upload.upload({
					url: 'https://angular-file-upload-cors-srv.appspot.com/upload',
					data: {
						file: file
					}
				});

				file.upload.then(function (response) {
					$timeout(function () {
						file.result = response.data;
					});
				}, function (response) {
					if (response.status > 0)
						$scope.errorMsg = response.status + ': ' + response.data;
				}, function (evt) {
					file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
				});
			});
		}
		/*-----End Upload Documents---*/


	$scope.ConvertDateToMMDDYYYY = function (dDate) {
			
			if (dDate != undefined) {
				if (dDate != null) {
					
					var months = new Array(12);
						months[0] = "null";
						months[1] = "Jan";
						months[2] = "Feb";
						months[3] = "Mar";
						months[4] = "Apr";
						months[5] = "May";
						months[6] = "Jun";
						months[7] = "Jul";
						months[8] = "Aug";
						months[9] = "Sep";
						months[10] = "Oct";
						months[11] = "Nov";
						months[12] = "Dec";
					var SplitdDate = dDate.split('T')[0]
					var year = SplitdDate.split("-")[0]
					var Month;
					if(SplitdDate.split("-")[1] <10){						
						Month =SplitdDate.split("-")[1].slice(1, 2);
					}else{
					     Month= SplitdDate.split("-")[1]
					  }
						Month = months[Month]
					var day = SplitdDate.split("-")[2]
					
					var dateformate = day+"-"+Month+"-"+year
					
					return dateformate;//new Date(dDate).format("dd-MMM-yyyy");
				}
			}
		}

	$scope.ShowRisks = function(filterval){		
		$('ul.nav li.active').removeClass('active');
		$("a[name^=Risks]").closest('li').addClass('active').hover();
				var UID = projId;
		var url
		if (location.hostname == 'projectmadeeasy.sharepoint.com') {
				url = SpURL + "/_api/web/lists/getByTitle('Collaboration: Risks')/items?$top=4998&$select=*,BarriersAssignedTo/Name,BarriersAssignedTo/Title,BarriersAssignedTo/Id,AssignedTo/Name,AssignedTo/Title,AssignedTo/Id,RiskAssignedTo/Name,RiskAssignedTo/Title,RiskAssignedTo/Id,RiskOwner/Name,RiskOwner/Title,RiskOwner/Id,Attachments,AttachmentFiles&$expand=AttachmentFiles,BarriersAssignedTo/Id,AssignedTo/Id,RiskAssignedTo/Id,RiskOwner/Id&$filter=ProjectUID eq '" + UID + "'&$orderby=ID desc";
			}else{
				url = 'Risks.json';
			}
			PService.GetAllItems('Collaboration: Risks', url).then(function (response) {			
				$scope.getRisksRes1 = [];
				$scope.getRisksRes = [];
				if(filterval != null && filterval != undefined && filterval != ''){
					angular.forEach(response.d.results, function (item, index) {
						if(item.RiskExposureFormula ==  filterval){
							$scope.getRisksRes1.push(item)
						}
					});
				}else{
					angular.forEach(response.d.results, function (item, index) {						
							$scope.getRisksRes1.push(item)
					});
					
				}
				angular.forEach($scope.getRisksRes1, function (item, index) {
						$scope.getRisksRes.push(item)
						$scope.getRisksRes[index].BarriersDescription = $("<div>").html(item.Barriers).html();
						$scope.getRisksRes[index].ImpactDescription = $("<div>").html(item.ImpactDescription).html();
						$scope.getRisksRes[index].RiskContingencyPlan = $("<div>").html(item.RiskContingencyPlan).html();
						$scope.getRisksRes[index].RiskDescription = $("<div>").html(item.RiskDescription).html();
						$scope.getRisksRes[index].RiskDiscussion = $("<div>").html(item.RiskDiscussion).html();
						//$scope.getRisksRes[index].IncludeonStatusReports = item.IncludeonStatusReports != true ?'No':'Yes';
						$scope.getRisksRes[index].RiskMitigationPlan = $("<div>").html(item.RiskMitigationPlan).html();
						$scope.getRisksRes[index].RiskTriggerDescription = $("<div>").html(item.RiskTriggerDescription).html();
						$scope.getRisksRes[index].DateClosedC = (item.DateClosed != null) ? $scope.ConvertDateToMMDDYYYY(item.DateClosed) : '';
						$scope.getRisksRes[index].DateIdentifiedC = (item.DateIdentified != null) ? $scope.ConvertDateToMMDDYYYY(item.DateIdentified) : '';
						$scope.getRisksRes[index].Delete  = null;
						$scope.getRisksRes[index].Edit  = null;
					});
				$('#Risksgrid').empty();
				$scope.LoadKendoGridRisdk($scope.getRisksRes);
			 }, function (error) {                   
				console.error('Error: ' + error.result);
				$scope.LoadKendoGridRisdk();
			});
			
		
		}

		$scope.LoadKendoGridRisdk = function(RData){
				$("#Risksgrid").kendoGrid({
						toolbar: ["excel"],
						excel: {
							fileName: "Risks.xlsx"
						},
						dataSource: {
						data:RData,
						sort:[ {
							field: "RiskImpact",
								dir: "asc"
							},{
							field: "RiskProbability",
								dir: "asc"
							},{
							field: "ID",
								dir: "asc"
							},]
						  },
		
					    height: 360,
						scrollable: {
                            virtual: true
                        },
						sortable: true,

							
							filterable: {
									extra: true,
									operators: { 
										string: {   
											contains: "Contains",
											eq: "Is Equal To",
											neq: "Is not equal to",
											startswith: "Starts With",									
										},
									
									}
								},
							resizable: true,
							selectable: "cell",
							change: function (e) {
								var cell = this.select();
								var cellIndex = cell[0].cellIndex;
								var column = this.columns[cellIndex];
								var dataItem = this.dataItem(cell.closest("tr"));
								
								if (column.field == "Edit") {									
									$scope.EditRiskItemView(dataItem, column.title);
								}
								else if (column.title == "Title") {									
									$scope.EditRiskItemView(dataItem, column.title);
								}
								else if (column.field == "Delete") {											
											$scope.DeleteItem(dataItem);
									}
							},
					  columns: [ { 
						     field: "Edit",
							 filterable:false,
							 title:'.',
							 	headerTemplate:'<label style=" color:#f3f3f4 ;" class=""></label>',
							  template: "<a id='btnEdit' class='btnEdit' title='Click to View' ><span class='pointer' style='float: right; cursor: pointer;' title='Click to Edit'><span class='k-icon k-i-edit'></span></span></a>",							
							 width: 30							 
							 },{ field: "ID",width:60,title: "ID", filterable:false
							 ,/*template: function(dataItem) {
								  return "<span> R." + dataItem.ID + "</span>";
					  } */},
						{ field: "Title",width:200,title:'Title',
						template: function(dataItem) {
								  var values = '';
								  //if(dataItem.RiskOwnerId != null){
									//  values = "<span>" + dataItem.Title + "<a id='btnView' class='btnView' style='float: right; ' title='Click to View' ><img border='0'  alt='edit' src='/_layouts/15/images/edititem.gif?rev=47'></a>";
									  values = "<span class='textdecoration' style='color: #337ab7;  cursor: pointer;'>" + dataItem.Title + "</span>";
								//  }								  
								  return values;
								} 
						
						},/*{ 
							 title:'View',
							  template: "<a id='btnView' class='btnView' style='margin-left: 10px;' title='Click to View' ><img border='0' alt='edit' src='/_layouts/15/images/edititem.gif?rev=47'></a>",
							
							 width: 60
							 
							 },
							 { 
							 title:'Edit',
							  template: "<a id='btnEdit' class='btnEdit' title='Click to View' ><span class='pointer' style='float: right;' title='Click to Edit'><span class='k-icon k-i-edit'></span></span></a>",
							
							 width: 40
							 
							 },*/

						 { field: "RiskAssignedTo.Title",width:200,title: "Risk Assigned To",filterable: {
							multi: true,
							search: true
						},
							template: function(dataItem) {
								  var values = '';
								  if(dataItem.RiskAssignedToId != null){
									  values = "<span>" + dataItem.RiskAssignedTo.Title + "</span>";
								  }								  
								  return values;
								}
						 },
						 
						 { field: "RiskImpact",width:150,title: "Risk Impact",filterable: {
							multi: true,
							search: true
						}, },
						{ field: "RiskProbability",width:170,title: "Risk Probability", filterable: {
							multi: true,
							search: true
						},},
						{ field: "RiskCategory" ,width:150,title: "Risk Category",filterable: {
							multi: true,
							search: true
						},},
							{ field: "RiskStatus",width:130,title: "Risk Status",filterable: {
							multi: true,
							search: true
						}, },
						{ field: "RiskDiscussion",width:200,title: "Risk Discussion",
							template: function(dataItem) {
								  return "<span>" + htmlDecode(dataItem.RiskDiscussion) + "</span>";
								}	
						 },
						{ field: "RiskDescription",width:200,title: "Risk Description", 
						template: function(dataItem) {
								  return "<span>" + htmlDecode(dataItem.RiskDescription) + "</span>";
								}	
						}
						,{		field:'Delete',
								title: '.',
									headerTemplate:'<label style=" color:#f3f3f4 ;" class=""></label>',
								filterable: false,
								width: 35,
								template:'<span class="pointer" style="float: center; cursor: pointer;" title="Click to delete"><span class="k-icon k-i-trash	k-i-delete"></span></span>'
								
							},
						/*
						{ field: "RiskTriggerDescription",width:200, title: "Risk Trigger Description",
							template: function(dataItem) {
								  return "<span>" + htmlDecode(dataItem.RiskTriggerDescription) + "</span>";
								}
						
						},
						{ field: "RiskTrigger",width:150,title: "Risk Trigger",filterable: {
							multi: true,
							search: true
						}, },
					
						
						{ field: "RiskOwner",width:120,title: "Risk Owner",
							template: function(dataItem) {
								  var values = '';
								  if(dataItem.RiskOwnerId != null){
									  values = "<span>" + dataItem.RiskOwner.Title + "</span>";
								  }								  
								  return values;
								}
						 },
						{ field: "RiskMitigationPlan",width:200,title: "Risk Mitigation Plan",
						 template: function(dataItem) {
								  return "<span>" + htmlDecode(dataItem.RiskMitigationPlan) + "</span>";
								}
						
						 },
						
						{ field: "RiskDiscussion",width:200,title: "Risk Discussion",
							template: function(dataItem) {
								  return "<span>" + htmlDecode(dataItem.RiskDiscussion) + "</span>";
								}	
						 },
						{ field: "RiskDescription",width:200,title: "Risk Description", 
						template: function(dataItem) {
								  return "<span>" + htmlDecode(dataItem.RiskDescription) + "</span>";
								}	
						},
						{ field: "RiskContingencyPlan" ,width:200,title: "Risk Contingency Plan",
							template: function(dataItem) {
								  return "<span>" + htmlDecode(dataItem.RiskContingencyPlan) + "</span>";
								}	
						},
						
						
						{ field: "RiskAction",width:130,title: "Risk Action",filterable: {
							multi: true,
							search: true
						},
						 },
						{ field: "IncludeonStatusReports" ,width:230,title: "Include on Status Reports",	filterable: {
							multi: true,
							search: true
						},											
						},
						{ field: "ImpactDescription" ,width:200,title: "Impact Description",
						template: function(dataItem) {
								  return "<span>" + htmlDecode(dataItem.ImpactDescription) + "</span>";
								}
						},
					//	{ field: "IdentifiedBy" ,width:100,title: "Identified By",},
						{ field: "DateIdentifiedC",width:180,title: "Date Identified", },
						{ field: "DateClosedC",width:150,title: "Date Closed", },
						{ field: "Barriers",width:200,title: "Barriers Description",
						template: function(dataItem) {
								  return "<span>" + htmlDecode(dataItem.Barriers) + "</span>";
								}
						 },
						{ field: "BarriersAssignedTo",width:220,title: "Barriers Assigned To",
							template: function(dataItem) {
								  var values = '';
								  if(dataItem.BarriersAssignedToId != null){
									  values = "<span>" + dataItem.BarriersAssignedTo.Title + "</span>";
								  }								  
								  return values;
								}
						 },
						{ field: "AssignedTo",width:200,title: "Assigned To",
							template: function(dataItem) {
								  var values = '';
								  if(dataItem.AssignedToId != null){
									  values = "<span>" + dataItem.AssignedTo.Title + "</span>";
								  }								  
								  return values;
								}
						 },*/
					  ]
					});
					$('#Risksgrid').width($(window).width()-270);
					if(proLen == 0){
							var grid = $("#Risksgrid").data("kendoGrid");
							grid.hideColumn(10);
							//grid.hideColumn(0);
						}
						 var grid = $("#Risksgrid").data("kendoGrid");
								var exportFlag = false;
								grid.bind("excelExport", function (e) {
									if (!exportFlag) {
										//alert(1);
										e.sender.hideColumn(0);
										e.sender.hideColumn(10);
										e.preventDefault();
										exportFlag = true;
										var sheet = e.workbook.sheets[0];
										for (var i = 1; i < sheet.rows.length; i++) {
											var row = sheet.rows[i];
											for (var ci = 0; ci <= row.cells.length; ci++) {
												var cell = row.cells[ci];
												if (ci == 8 || ci == 9) {
													var htmlObject = document.createElement('div');
													htmlObject.innerHTML = cell.value;
													e.workbook.sheets[0].rows[i].cells[ci].value = htmlObject.innerText
												}
											}
										}
										setTimeout(function () {
											e.sender.saveAsExcel();
										});
									} else {
										//alert(2);
										e.sender.showColumn(0);
										e.sender.showColumn(10);
										exportFlag = false;
									}
								});
		}

		$scope.DeleteItem = function(data){
				var Chktrue = confirm("Are you sure you want to delete this entry?");
				if(Chktrue){
					PService.DeleteById('Collaboration: Risks', data.ID).then(function (response) {
							$scope.ShowRisks();
						//location.href = location.href.replace('#!','&#!');
						//window.location.reload();
					});
				}

		}
		$scope.to_trusted = function (html_code) {
			return $sce.trustAsHtml(html_code);
		}

		$scope.EditRisk = function(){
			$scope.ViewMode = false;	
			//	$('.k-button-icon').hide()	 
		}
		$scope.AddNewItemWindow = function () {	
			$scope.ischkRiskAlert = false;
		var valuefil = 1
		if (location.hostname == 'projectmadeeasy.sharepoint.com') {
			var url = SpURL + "/_api/web/lists/getByTitle('Collaboration: Lookups')/items?$top=4998&$select=*&$filter=Default eq '" + valuefil + "'&$orderby=ID desc";
		} else {
			var url = "Lookups.json";
		}
			PService.GetAllItems('Collaboration: Lookups', url).then(function (response) {			
				$scope.getDefaultValueLookup = [];
				//console.log(response.d.results)
				$scope.RiskStatusDefault =[];
					$scope.RiskProbabilityDefault =[];
						$scope.RiskCategoryDefault =[];
							$scope.RiskImpactDefault =[];
							$scope.RiskActionDefault = [];
							$scope.RiskTriggerDefault =[];
							$scope.RiskISRDefault = [];
				angular.forEach(response.d.results, function (item, index) {
					$scope.getDefaultValueLookup.push(item)
					if(item.Select_x0020_Title == 'Risk Status'){
						$scope.RiskStatusDefault.push(item.Title);
					}
					if(item.Select_x0020_Title == 'Probability'){
						$scope.RiskProbabilityDefault.push(item.Title);
					}
					if(item.Select_x0020_Title == 'Category'){
						$scope.RiskCategoryDefault.push(item.Title);
					}
					if(item.Select_x0020_Title == 'Impact'){
						$scope.RiskImpactDefault.push(item.Title);
					}
					if(item.Select_x0020_Title == 'Action'){
						$scope.RiskActionDefault.push(item.Title);
					}
					if(item.Select_x0020_Title == 'Action'){
						$scope.RiskActionDefault.push(item.Title);
					}
					if(item.Select_x0020_Title == 'Trigger'){
						$scope.RiskTriggerDefault.push(item.Title);
					}
					if(item.Select_x0020_Title == 'Include on Status Report'){
						$scope.RiskISRDefault.push(item.Title);
					}
				});
			 
			$scope.Item = {
					ID: null,
					Title: null,
					RiskTriggerDescription:'',
					RiskTrigger:  $scope.RiskTriggerDefault.length != 0 ?$scope.RiskTriggerDefault[0]:null,
					RiskStatus: $scope.RiskStatusDefault.length != 0 ?$scope.RiskStatusDefault[0]:null,
					RiskProbability: $scope.RiskProbabilityDefault.length != 0 ?$scope.RiskProbabilityDefault[0]:null,
					RiskOwner: null,
					RiskMitigationPlan: null,
					RiskImpact:$scope.RiskImpactDefault.length != 0 ?$scope.RiskImpactDefault[0]:null,
					RiskDiscussion:'',
					RiskDescription:'',
					RiskContingencyPlan:'',					
					RiskCategory:$scope.RiskCategoryDefault.length != 0 ?$scope.RiskCategoryDefault[0]:null,
					RiskAssignedTo: null,
					RiskAction:$scope.RiskActionDefault.length != 0 ?$scope.RiskActionDefault[0]:null,
					IncludeonStatusReports:"No",//$scope.RiskISRDefault.length != 0 ?$scope.RiskISRDefault[0]:null,
					ImpactDescription:'',
					IdentifiedBy: null,
					DateIdentified: null,
					DateClosed: null,
					Barriers: null,
					BarriersAssignedTo: null,
					AssignedTo: null,
					BarriersDescription:'',					

			}
				$('.btn').attr('disabled', false);
				$scope.ViewMode = false;	
				$scope.filesdata = []
				$('#file_input').val('')
			var dialogKeyWindow = $("#KWindowRisk").data("kendoWindow");
			dialogKeyWindow.open();
			dialogKeyWindow.center();

			}, function (error) {                   
				console.error('Error: ' + error.result);
			});
		}
		$scope.EditRiskItemView = function(data, ItemView){

			$scope.ischkRiskAlert = false;
			$scope.ViewMode = false;	
			if(ItemView == 'Title'){
			//	$('.k-button-icon').show()
				$scope.ViewMode = true;	
			}

			$scope.Item = {
					ID: data.ID,
					Title: data.Title,
					RiskTriggerDescription: data.RiskTriggerDescription,
					RiskTrigger: data.RiskTrigger,
					RiskStatus: data.RiskStatus,
					RiskProbability: data.RiskProbability,
					RiskOwner: data.RiskOwner,
					RiskMitigationPlan: data.RiskMitigationPlan,
					RiskImpact: data.RiskImpact,
					RiskDiscussion: data.RiskDiscussion,
					RiskDescription: data.RiskDescription,
					RiskContingencyPlan: data.RiskContingencyPlan,					
					RiskCategory: data.RiskCategory,
					RiskAssignedTo: data.RiskAssignedTo,
					RiskAction: data.RiskAction,
					IncludeonStatusReports:data.IncludeonStatusReports != 'No' ? true : false,
					ImpactDescription: data.ImpactDescription,
					IdentifiedBy: data.IdentifiedBy,
					DateIdentified: data.DateIdentified,
					DateClosed: data.DateClosed,
					Barriers: data.Barriers,
					BarriersAssignedTo: data.BarriersAssignedTo,
					AssignedTo: data.AssignedTo,
					BarriersDescription: data.BarriersDescription,		
					Attachment:data.AttachmentFiles,		

			}

			$scope.ItemAttachment = []
				if(data.AttachmentFiles.results != 0){
					$scope.ItemAttachment = data.AttachmentFiles.results
				}

			$scope.filesdata = []
			$('#file_input').val('')
				$('.btn').attr('disabled', false);
			var dialogKeyWindow = $("#KWindowRisk").data("kendoWindow");
			dialogKeyWindow.open();
			dialogKeyWindow.center();
		}
		$scope.SaveRsik = function () {	
				UpdateFormDigest(webURL, refreshTym);
				$('.btn').attr('disabled', true);
				var ID = $scope.Item.ID 
				var	Title= $scope.Item.Title 
				var	RiskTriggerDescription= $scope.Item.RiskTriggerDescription
				var	RiskTrigger= $scope.Item.RiskTrigger
				var	RiskStatus= $scope.Item.RiskStatus
				var	RiskProbability= $scope.Item.RiskProbability
				var	RiskOwner= $scope.Item.RiskOwner
				var	RiskMitigationPlan= $scope.Item.RiskMitigationPlan
				var	RiskImpact= $scope.Item.RiskImpact
				var	RiskDiscussion= $scope.Item.RiskDiscussion
				var	RiskDescription= $scope.Item.RiskDescription
				var	RiskContingencyPlan= $scope.Item.RiskContingencyPlan					
				var	RiskCategory = $scope.Item.RiskCategory
				var	RiskAssignedTo = $scope.Item.RiskAssignedTo
				var	RiskAction = $scope.Item.RiskAction
				var	IncludeonStatusReports = $scope.Item.IncludeonStatusReports != false ? 'Yes' : 'No';
				var	ImpactDescription = $scope.Item.ImpactDescription
				var	IdentifiedBy = $scope.Item.IdentifiedBy
				var	DateIdentified = $scope.Item.DateIdentified
				var	DateClosed = $scope.Item.DateClosed
				var	Barriers = $scope.Item.Barriers
				var	BarriersAssignedTo = $scope.Item.BarriersAssignedTo
				var	AssignedTo = $scope.Item.AssignedTo
				var	BarriersDescription = $scope.Item.BarriersDescription	
					$scope.ischkRiskAlert = false;
				if(Title == null || Title == ''){
						$('.btn').attr('disabled', false);
						$scope.ischkRiskAlert = true;
					return;
				}

				$scope.fileArray = [];
				$("#attachFilesHolder input:file").each(function () {
					if ($(this)[0].files[0]) {
						$scope.fileArray.push({
							"Attachment": $(this)[0].files[0]
						});
					}
				});
				var ProjectId =projId;
				var data = {
					__metadata: {
						'type': 'SP.Data.CollaborationRisksListItem'
					},
					Title: Title,
					RiskTriggerDescription: RiskTriggerDescription,
					RiskTrigger: RiskTrigger,
					RiskStatus: RiskStatus,
					RiskProbability: RiskProbability,
					RiskOwnerId: RiskOwner != null ? RiskOwner.Id :null,
					RiskMitigationPlan:RiskMitigationPlan,
					RiskImpact: RiskImpact,
					RiskDiscussion: RiskDiscussion,
					RiskDescription: RiskDescription,
					RiskContingencyPlan: RiskContingencyPlan,					
					RiskCategory: RiskCategory,
					RiskAssignedToId: RiskAssignedTo != null ? RiskAssignedTo.Id :null,
					RiskAction: RiskAction,
					IncludeonStatusReports:IncludeonStatusReports,
					ImpactDescription: ImpactDescription,
					IdentifiedBy: IdentifiedBy,
					DateIdentified: DateIdentified,
					DateClosed: DateClosed,
					//Barriers: Barriers,
					BarriersAssignedToId:  BarriersAssignedTo != null ? BarriersAssignedTo.Id :null,
				//	AssignedToId:  AssignedTo != null ? AssignedTo.Id :null,
					Barriers: BarriersDescription,
					ProjectUID:ProjectId,
					
				};

				if(ID == null){
					$scope.sendCandidateUpdatedmailNotification(data)
					PService.AddNew(data, 'Collaboration: Risks').then(function (response) {
							//$scope.ShowRisks()
					/*	var dialogKeyWindow = $("#KWindowRisk").data("kendoWindow");
							dialogKeyWindow.close();
							dialogKeyWindow.center();
						location.href = location.href;
									window.location.reload();
								$('.btn').attr('disabled', false); */
					var id = response.d.Id;
				var promise = $q.all({});
					if ($scope.fileArray.length != 0) {
						promise = promise.then(function () {
								return bSvc.GetAttachmentFileBuffer($scope.fileArray[0].Attachment);
							}).then(function (filebuffer) {
								return bSvc.getFileBuffer(filebuffer, id, 'Collaboration: Risks', $scope.fileArray[0].Attachment);
							});
					/*	angular.forEach($scope.filesdata, function (attachfile, indx) {
							promise = promise.then(function () {
								return bSvc.GetAttachmentFileBuffer($scope.filesdata[indx].Attachment);
							}).then(function (filebuffer) {
								return bSvc.getFileBuffer(filebuffer, id, 'Risks', $scope.filesdata[indx].Attachment);
							}); 
						});  */
						promise.then(function (responseAtch) {
							$scope.filesdata = [];
							$('#file_input').val('')
							$scope.ShowRisks();
							var dialogKeyWindow = $("#KWindowRisk").data("kendoWindow");
							dialogKeyWindow.close();
							dialogKeyWindow.center();
							//location.href = location.href.replace('#!','&#!');
						//	window.location.reload();
							$('.btn').attr('disabled', false);
					
					}, function (error) {
						console.error('Error: ' + error.result);
						$('.btn').attr('disabled', false);
					});

				} else {
					$scope.ShowRisks();
					var dialogKeyWindow = $("#KWindowRisk").data("kendoWindow");
						dialogKeyWindow.close();
						dialogKeyWindow.center();
						//location.href = location.href.replace('#!','&#!');
						//window.location.reload();
						$('.btn').attr('disabled', false);
				}

					}, function (error) {    
							$('.btn').attr('disabled', false);               
						console.error('Error:SaveRisk ' + error.result);
					});	
				}
				if(ID != null){
					PService.Update(data, 'Collaboration: Risks',ID).then(function (response) {
						//	$scope.ShowRisks()


						var promise = $q.all({});
					if ($scope.fileArray.length != 0) {

						promise = promise.then(function () {
								return bSvc.GetAttachmentFileBuffer($scope.fileArray[0].Attachment);
							}).then(function (filebuffer) {
								return bSvc.getFileBuffer(filebuffer, ID, 'Collaboration: Risks', $scope.fileArray[0].Attachment);
							});
						/*angular.forEach($scope.filesdata, function (attachfile, indx) {
							promise = promise.then(function () {
								return bSvc.GetAttachmentFileBuffer($scope.filesdata[indx].Attachment);
							}).then(function (filebuffer) {
								return bSvc.getFileBuffer(filebuffer, ID, 'Risks', $scope.filesdata[indx].Attachment);
							}); 
						}); */
						promise.then(function (responseAtch) {
							$scope.filesdata = [];
							$('#file_input').val('')
							$scope.ShowRisks();
							var dialogKeyWindow = $("#KWindowRisk").data("kendoWindow");
							dialogKeyWindow.close();
							dialogKeyWindow.center();
						//	location.href = location.href.replace('#!','&#!');
						//	window.location.reload();
							$('.btn').attr('disabled', false);
					
					}, function (error) {
						console.error('Error: ' + error.result);
						$('.btn').attr('disabled', false);
					});

				} else {
					$scope.ShowRisks();
					var dialogKeyWindow = $("#KWindowRisk").data("kendoWindow");
						dialogKeyWindow.close();
						dialogKeyWindow.center();
					//	location.href = location.href.replace('#!','&#!');
					//	window.location.reload();
						$('.btn').attr('disabled', false);
				}
						

					}, function (error) {    
							$('.btn').attr('disabled', false);               
						console.error('Error:SaveRisk ' + error.result);
					});	

				}		

		debugger

		}
		
		$scope.sendCandidateUpdatedmailNotification= function(data){
		 			var from = SpUserEmail;
					var to = [from,]
					var CC = [" "]
					var BCC = [];
					var body = "Hello Team,"
					
					body +=  "<div style='margin-top: 5px; width: 100%;padding: 3px;'>" +
						"<span>A New Risk has been Submitted against Risk Title# "+data.Title+"</span>" +
						"</div>"+
						 "<div style='margin-top: 5px; width: 100%;padding: 3px;'>" +
						 "<span> New Risk details.</span>" +
						"</div>"+
						"<div style='margin-top: 5px; width: 100%;padding: 3px; font-family: Calibri (Body);font-size: 10pt;'>" +
						"<table style='margin-top: 5px; width: 100%;padding: 3px; font-family: Calibri (Body);font-size: 10pt;'>" +
						"<tr style='color:gray;'>" +
						"<td style='vertical-align:top; height:10px; width:25%; border: none; border-bottom: solid #E8EAEC 1.0pt; background: #F8F8F9; padding: 1.5pt 6.0pt 3.75pt 3.75pt;'><span style='font-size: 11pt; color: black; font-family: Calibri (Body),sans-serif;'>Title</span></td>" +
						"<td style='vertical-align:top; height:10px; border: none; border-bottom: solid #E8EAEC 1.0pt; background: #F8F8F9; padding: 1.5pt 6.0pt 3.75pt 3.75pt;'><span style='font-size: 11pt; color: black; font-family: Calibri (Body),sans-serif;'>" + data.Title+ "</span></td>" +
						"</tr>" +
						"<tr style='color:gray;'>" +
						"<td style='vertical-align:top; height:10px; width:25%; border: none; border-bottom: solid #E8EAEC 1.0pt; background: #F8F8F9; padding: 1.5pt 6.0pt 3.75pt 3.75pt;'><span style='font-size: 11pt; color: black; font-family: Calibri (Body),sans-serif;'>Risk Status</span></td>" +
						"<td style='vertical-align:top; height:10px; border: none; border-bottom: solid #E8EAEC 1.0pt; background: #F8F8F9; padding: 1.5pt 6.0pt 3.75pt 3.75pt;'><span style='font-size: 11pt; color: black; font-family: Calibri (Body),sans-serif;'>" + data.RiskStatus+ "</span></td>" +
						"</tr>" +
						"<tr style='color:gray;'>" +
						"<td style='vertical-align:top; height:10px; width:25%; border: none; border-bottom: solid #E8EAEC 1.0pt; background: #F8F8F9; padding: 1.5pt 6.0pt 3.75pt 3.75pt;'><span style='font-size: 11pt; color: black; font-family: Calibri (Body),sans-serif;'>Risk Trigger</span></td>" +
						"<td style='vertical-align:top; height:10px; border: none; border-bottom: solid #E8EAEC 1.0pt; background: #F8F8F9; padding: 1.5pt 6.0pt 3.75pt 3.75pt;'><span style='font-size: 11pt; color: black; font-family: Calibri (Body),sans-serif;'>" + data.RiskTrigger+ "</span></td>" +
						"</tr>" +
						
						"<tr style='color:gray;'>" +
						"<td style='vertical-align:top; height:10px; width:25%; border: none; border-bottom: solid #E8EAEC 1.0pt; background: #F8F8F9; padding: 1.5pt 6.0pt 3.75pt 3.75pt;'><span style='font-size: 11pt; color: black; font-family: Calibri (Body),sans-serif;'>Risk Impact</span></td>" +
						"<td style='vertical-align:top; height:10px; border: none; border-bottom: solid #E8EAEC 1.0pt; background: #F8F8F9; padding: 1.5pt 6.0pt 3.75pt 3.75pt;'><span style='font-size: 11pt; color: black; font-family: Calibri (Body),sans-serif;'>" + data.RiskImpact+ "</span></td>" +
						"</tr>" +
						"<tr style='color:gray;'>" +
						"<td style='vertical-align:top; height:10px; width:25%; border: none; border-bottom: solid #E8EAEC 1.0pt; background: #F8F8F9; padding: 1.5pt 6.0pt 3.75pt 3.75pt;'><span style='font-size: 11pt; color: black; font-family: Calibri (Body),sans-serif;'>Risk Action</span></td>" +
						"<td style='vertical-align:top; height:10px; border: none; border-bottom: solid #E8EAEC 1.0pt; background: #F8F8F9; padding: 1.5pt 6.0pt 3.75pt 3.75pt;'><span style='font-size: 11pt; color: black; font-family: Calibri (Body),sans-serif;'>" + data.RiskAction+ "</span></td>" +
						"</tr>" +
						"<tr style='color:gray;'>" +
						"<td style='vertical-align:top; height:10px; width:25%; border: none; border-bottom: solid #E8EAEC 1.0pt; background: #F8F8F9; padding: 1.5pt 6.0pt 3.75pt 3.75pt;'><span style='font-size: 11pt; color: black; font-family: Calibri (Body),sans-serif;'>Date Identified</span></td>" +
						"<td style='vertical-align:top; height:10px; border: none; border-bottom: solid #E8EAEC 1.0pt; background: #F8F8F9; padding: 1.5pt 6.0pt 3.75pt 3.75pt;'><span style='font-size: 11pt; color: black; font-family: Calibri (Body),sans-serif;'>" + data.DateIdentified+ "</span></td>" +
						"</tr>" +
						"<tr style='color:gray;'>" +
						"<td style='vertical-align:top; height:10px; width:25%; border: none; border-bottom: solid #E8EAEC 1.0pt; background: #F8F8F9; padding: 1.5pt 6.0pt 3.75pt 3.75pt;'><span style='font-size: 11pt; color: black; font-family: Calibri (Body),sans-serif;'>Date Closed</span></td>" +
						"<td style='vertical-align:top; height:10px; border: none; border-bottom: solid #E8EAEC 1.0pt; background: #F8F8F9; padding: 1.5pt 6.0pt 3.75pt 3.75pt;'><span style='font-size: 11pt; color: black; font-family: Calibri (Body),sans-serif;'>" + data.DateClosed+ "</span></td>" +
						"</tr>" +																	
						"</table><br></div>";	
			
					body += "<div style='margin-top: 5px; width: 100%;padding: 3px; '>" +
						"<div style='margin-top: 5px; width: 100%;padding: 3px; '>Thanks & Regards,</div>" +
						"<div style='margin-top: 5px; width: 100%;padding: 3px;'> " + SpUserDisplay + "</div>" +
						"</div>";

					var subject = "Risk " + data.Title+ " details has been created By " + SpUserDisplay
					
					bSvc.sendEmailCB(from,to,CC ,BCC , body, subject).then(function (response) {
						console.log('Send mail Success')				
					}, function (error) {
					    console.log('failed')	
						console.error('Error: ' + error.result);
					});		
		
		}

		$scope.removeFileFromList = function(item, file, index){
				
			var  ItemId= item.ID;
			var FileTitle = file.FileName
			var Chktrue = confirm("Are you sure you want to delete this attachment?");
				if(Chktrue){
					bSvc.DeleteAttachment(ItemId,FileTitle,'Risks').then(function (response) {						
						$scope.ItemAttachment.splice(index, 1);
					});
				}
			
		}

		$scope.CloseRiskForm = function () {
			var Chktrue = confirm("Are you sure you want to close this window?");
			if(Chktrue){	
					$scope.ShowRisks();
					var dialogKeyWindow = $("#KWindowRisk").data("kendoWindow");
					dialogKeyWindow.close();
					dialogKeyWindow.center();
					//location.href = location.href.replace('#!','&#!');
					//	window.location.reload();
				}
		}
	
	
	
		
}]);


KendoPApp.controller('ProductMController', ['$scope', "$http", "$q", "$location","$sce", 'baseSvc', 'ProjectkFactoryService', 'Upload', '$timeout',
function ($scope, $http, $q, $location, $sce, bSvc, PService, Upload, $timeout) {
	$scope.init = function(){
		if(window.location.hash === "#!/ProductM"){				
			$location.path('/ProductM');	
				$scope.ShowProductM();
			
		}		
	}

	

	$scope.ConvertDateToMMDDYYYY = function (dDate) {
			
			if (dDate != undefined) {
				if (dDate != null) {
					
					var months = new Array(12);
						months[0] = "null";
						months[1] = "Jan";
						months[2] = "Feb";
						months[3] = "Mar";
						months[4] = "Apr";
						months[5] = "May";
						months[6] = "Jun";
						months[7] = "Jul";
						months[8] = "Aug";
						months[9] = "Sep";
						months[10] = "Oct";
						months[11] = "Nov";
						months[12] = "Dec";
					var SplitdDate = dDate.split('T')[0]
					var year = SplitdDate.split("-")[0]
					var Month;
					if(SplitdDate.split("-")[1] <10){						
						Month =SplitdDate.split("-")[1].slice(1, 2);
					}else{
					     Month= SplitdDate.split("-")[1]
					  }
						Month = months[Month]
					var day = SplitdDate.split("-")[2]
					
					var dateformate = day+"-"+Month+"-"+year
					
					return dateformate;//new Date(dDate).format("dd-MMM-yyyy");
				}
			}
		}

	$scope.ShowProductM = function(filterval){		
		$('ul.nav li.active').removeClass('active');
		$("a[name^=ProductM]").closest('li').addClass('active').hover();
				var UID = projId;
				if (location.hostname == 'projectmadeeasy.sharepoint.com') {
			var	url = SpURL + "/_api/web/lists/getByTitle('Collaboration: Product Management')/items?$top=4998&$select=*,Attachments,AttachmentFiles&$expand=AttachmentFiles&$filter=Title eq '" + UID + "'&$orderby=ID desc"; //
			} else {
			var url = "Product Management.json";
		}
			PService.GetAllItems('Collaboration: Product Management', url).then(function (response) {			
				$scope.getStakeholdersRes = [];	
				//$scope.getStakeholdersResmain = [];					
				angular.forEach(response.d.results, function (item, index) {
						$scope.getStakeholdersRes.push(item)
						$scope.getStakeholdersRes[index].ProductDeliveryDateC = (item.ProductDeliveryDate != null) ? $scope.ConvertDateToMMDDYYYY(item.ProductDeliveryDate) : '';
						$scope.getStakeholdersRes[index].Delete  = null;
						$scope.getStakeholdersRes[index].Edit  = null;
											
					});
				$('#PManagementMainGrid').empty();
				$scope.LoadKendoGridStakeholdersgridk($scope.getStakeholdersRes);
			 }, function (error) {       
				$scope.getStakeholdersRes = [];	
				$scope.LoadKendoGridStakeholdersgridk($scope.getStakeholdersRes);
				console.log(error)
			});
			
		
		}

		$scope.LoadKendoGridStakeholdersgridk = function(SData){
				$("#PManagementMainGrid").kendoGrid({						
						dataSource:SData,
					    height: 360,
						scrollable: {
                            virtual: true
                        },
						sortable: true,							
						filterable: {
								extra: true,
								operators: { 
									string: {   
										contains: "Contains",
										eq: "Is Equal To",
										neq: "Is not equal to",
										startswith: "Starts With",									
									},
								
								}
							},
							resizable: true,
							selectable: "cell",
							change: function (e) {
								var cell = this.select();
								var cellIndex = cell[0].cellIndex;
								var column = this.columns[cellIndex];
								var dataItem = this.dataItem(cell.closest("tr"));
								
								if (column.field == "Edit") {									
									$scope.EditRiskItemView(dataItem, column.title);
								}
								else if (column.title == "Role") {									
									$scope.EditRiskItemView(dataItem, column.title);
								}
								else if (column.field == "Delete") {											
											$scope.DeleteItem(dataItem);
									}
							},
					  columns: [{ field: "ProductID",width:120,title: "Product ID",  headerAttributes: { style: "white-space: normal"},filterable:false},
						{ field: "ProductTitle",width:200,title:'Product Title'	,filterable: {
							multi: true,
							search: true
						}},
						{ field: "ProductDescriptionProductDescription",width:250 ,title:'Product Description', headerAttributes: { style: "white-space: normal"},
							template: function(dataItem) {
								  return "<span>" + htmlDecode(dataItem.ProductDescription) + "</span>";
								}
						
						 },
						
						{ field: "ProductCategory",width:150,title:'Product Category', headerAttributes: { style: "white-space: normal"},filterable: {
							multi: true,
							search: true,
						}	},
						{ field: "Tradename",width:150,title:'Trade Name',filterable: {
							multi: true,
							search: true
						}	},
						{ field: "ProductVersion",width:130,title:'Version',filterable: {
							multi: true,
							search: true
						}	},
						 { field: "ProductDeliveryDateC",width:140,title: "Product Delivery Date",filterable:false,  headerAttributes: { style: "white-space: normal"},
						 template: function(dataItem) {
								  return dataItem.ProductDeliveryDateC;
								}
						},
						{	field:'Delete',
								title: '.',
									headerTemplate:'<label style=" color:#f3f3f4 ;" class=""></label>',
								filterable: false,
								width: 35,
								template:'<span class="pointer" style="float: center; cursor: pointer;" title="Click to delete"><span class="k-icon k-i-trash	k-i-delete"></span></span>'
								
							},
					  ]					
					
						
					});
					$('#PManagementMainGrid').width($(window).width()-270);
					if(proLen == 0){
							var grid = $("#PManagementMainGrid").data("kendoGrid");
						//	grid.hideColumn(10);
							//grid.hideColumn(0);
						}
						 var grid = $("#PManagementMainGrid").data("kendoGrid");
								var exportFlag = false;
								grid.bind("excelExport", function (e) {
									if (!exportFlag) {
										//alert(1);
										e.sender.hideColumn(0);
										//e.sender.hideColumn(10);
										e.preventDefault();
										exportFlag = true;
										setTimeout(function () {
											e.sender.saveAsExcel();
										});
									} else {
										//alert(2);
										e.sender.showColumn(0);
										//e.sender.showColumn(10);
										exportFlag = false;
									}
								});
		}

		$scope.DeleteItem = function(data){
				var Chktrue = confirm("Are you sure you want to delete this entry?");
				if(Chktrue){
					PService.DeleteById('Collaboration: Product Management', data.ID).then(function (response) {
							$scope.ShowProductM();
						//location.href = location.href.replace('#!','&#!');
						//window.location.reload();
					});
				}

		}
		$scope.to_trusted = function (html_code) {
			return $sce.trustAsHtml(html_code);
		}

$scope.dts = []
        function onChangeSec(e) {   

			var rows = e.sender.select();
            rows.each(function(e) {
                var grid = $("#PManagementMainGridPreFillWindow").data("kendoGrid");
                var dataItem = grid.dataItem(this);

                console.log(dataItem);
				$scope.dts.push(dataItem)
            })
			//var cell = this.select();
			//	var dataItem = this.dataItem(cell.closest("tr"));	
          //$scope.dts = this.selectedKeyNames()
        }
$scope.SaveLPDataBtn =function(){
	var dt = $scope.dts
	
	var ProjectId =projId;
	if($scope.dts.length != 0){
		var itemL = $scope.dts.length;
	angular.forEach($scope.dts, function (item, index) {
		var inx = index
				var data = {
					__metadata: {
						'type': 'SP.Data.CollaborationProductManagementListItem'
					},
					Title: ProjectId,				
				};
				
				if(item.ID != null){
					PService.Update(data, 'Collaboration: Product Management',item.ID).then(function (response) {
						if(itemL == (inx+1)){
						$scope.ShowProductM();
							var dialogKeyWindow = $("#PMwindowPreData").data("kendoWindow");
							dialogKeyWindow.close();
							dialogKeyWindow.center();
							$('.btn').attr('disabled', false);
						}

					}, function (error) {    
							$('.btn').attr('disabled', false);               
						console.error('Error:SaveSU ' + error.result);
					});	

				}else{
					if(itemL == (inx+1)){
						$scope.ShowProductM();
							var dialogKeyWindow = $("#PMwindowPreData").data("kendoWindow");
							dialogKeyWindow.close();
							dialogKeyWindow.center();
							$('.btn').attr('disabled', false);
						}
				}
				
	});
	}else{
		var dialogKeyWindow = $("#PMwindowPreData").data("kendoWindow");
							dialogKeyWindow.close();
							dialogKeyWindow.center();
							$('.btn').attr('disabled', false);
	}
	/*$("#PManagementMainGrid").empty()
	$scope.LoadKendoGridStakeholdersgridk(dt);
			var dialogKeyWindow = $("#PMwindowPreData").data("kendoWindow");
					dialogKeyWindow.close();
					dialogKeyWindow.center();*/
	
}



$scope.AddPMWindow = function(filterval){	
				var UID = null
				if (location.hostname == 'projectmadeeasy.sharepoint.com') {
			var	url = SpURL + "/_api/web/lists/getByTitle('Collaboration: Product Management')/items?$top=4998&$select=*,Attachments,AttachmentFiles&$expand=AttachmentFiles&$filter=Title eq null&$orderby=ID desc"; //Title eq '" + UID + "'
			} else {
			var url = "Product Management.json";
		}
			PService.GetAllItems('Collaboration: Product Management', url).then(function (response) {			
				//$scope.getStakeholdersRes = [];	
				$scope.getStakeholdersResmain = [];					
				angular.forEach(response.d.results, function (item, index) {
						$scope.getStakeholdersResmain.push(item)
						$scope.getStakeholdersResmain[index].ProductDeliveryDateC = (item.ProductDeliveryDate != null) ? $scope.ConvertDateToMMDDYYYY(item.ProductDeliveryDate) : '';
						$scope.getStakeholdersResmain[index].Delete  = null;
						$scope.getStakeholdersResmain[index].Edit  = null;
											
					});
				//$('#PManagementMainGrid').empty();
				$scope.AddPMWindowmain($scope.getStakeholdersResmain);
			 }, function (error) { 
				console.log(error)
			});
			
		
		}

$scope.AddPMWindowmain = function (data) {
	
		/*var d = $("#PManagementMainGrid").data("kendoGrid").dataSource._data
		var sds = []
		if(d.length == 0){
		$scope.getStakeholdersRes.filter(function (itema, idxa) {	
			sds.push(itema)
		});
		}else{
		
		
		$scope.getStakeholdersRes.filter(function (itema, idxa) {		
			d.filter(function (itemb, idxb) {
				if(itema.ID != itemb.ID){
					sds.push(itema)	
				}			 
			});
		});
		}*/
			$scope.dts = []
				$("#PManagementMainGridPreFillWindow").empty()
			$scope.EditWindow = false;		
			$scope.EditWindowrefill = false;			
			  $("#PManagementMainGridPreFillWindow").kendoGrid({
                        dataSource:data,                        
						  height: 300,
						//scrollable:true,
						scrollable: {
                            virtual: true
                        },
						sortable: true,							
						filterable: {
								extra: true,
								operators: { 
									string: {   
										contains: "Contains",
										eq: "Is Equal To",
										neq: "Is not equal to",
										startswith: "Starts With",									
									},
								
								}
							},
						resizable: true,
                         //change: onChangeLP,
						 change: onChangeSec,
						  filterMenuInit: function(e) {
							  if (e.field === "Category" || e.field === "ProductID" || e.field === "ProductTitle" || e.field === "ProductDescriptionProductDescription" || e.field === "ProductCategory"|| e.field === "Tradename"|| e.field === "ProductVersion"|| e.field === "ProductDeliveryDateC") {
								var filterMultiCheck = this.thead.find("[data-field=" + e.field + "]").data("kendoFilterMultiCheck")
								filterMultiCheck.container.empty();
								filterMultiCheck.checkSource.sort({field: e.field, dir: "asc"});
								filterMultiCheck.checkSource.data(filterMultiCheck.checkSource.view().toJSON());
								filterMultiCheck.createCheckBoxes();
							  }
							},
                         columns: [
                            {
								selectable: true,
								width: "50px",
								headerTemplate: ' '
							},
							{ field: "ProductID",width:120,title: "Product ID",  headerAttributes: { style: "white-space: normal"},filterable: {
							multi: true,
							search: true
						}},
						{ field: "ProductTitle",width:200,title:'Product Title',filterable: {
							multi: true,
							search: true
						}	},
						{ field: "ProductDescriptionProductDescription",width:250 ,title:'Product Description', headerAttributes: { style: "white-space: normal"},
							template: function(dataItem) {
								  return "<span>" + htmlDecode(dataItem.ProductDescription) + "</span>";
								},filterable: {
							multi: true,
							search: true
						}
						
						 },
						
						{ field: "ProductCategory",width:150,title:'Product Category', headerAttributes: { style: "white-space: normal"},filterable: {
							multi: true,
							search: true
						},	},
						{ field: "Tradename",width:150,title:'Trade Name'	,filterable: {
							multi: true,
							search: true
						}},
						{ field: "ProductVersion",width:130,title:'Version',filterable: {
							multi: true,
							search: true
						}	},
						 { field: "ProductDeliveryDateC",width:140,title: "Product Delivery Date",filterable:false,  headerAttributes: { style: "white-space: normal"},
						 template: function(dataItem) {
								  return dataItem.ProductDeliveryDateC;
								},filterable: {
							multi: true,
							search: true
						}
						},
							
						]
				
                    
                });
			//	$('#PManagementMainGridPreFillWindow').width($(window).width()-270);
					//var grid = $("#PManagementMainGridPreFillWindow").data("kendoGrid");
					//grid.tbody.on("click", ".k-checkbox", onClickLP);
					
					var dialogKeyWindow = $("#PMwindowPreData").data("kendoWindow");
					dialogKeyWindow.open();
					dialogKeyWindow.center();
					dialogKeyWindow.setOptions({width:'80%'});
					
			}
		$scope.EditRisk = function(){
			$scope.ViewMode = false;	
			//	$('.k-button-icon').hide()	
			
		}
		$scope.AddNewItemWindow = function () {	
			$scope.ischkRiskAlert = false;
		var valuefil = 1		
			
			$scope.Item = {
					ID: null,
					Title: null,
					AssignedTo: null,
				}
				$('.btn').attr('disabled', false);
				$scope.ViewMode = false;
			var dialogKeyWindow = $("#KWindowStakeholders").data("kendoWindow");
			dialogKeyWindow.open();
			dialogKeyWindow.center();

		}
		$scope.EditRiskItemView = function(data, ItemView){

			$scope.ischkRiskAlert = false;
			$scope.ViewMode = false;	
			if(ItemView == 'Role'){
			//	$('.k-button-icon').show()
				$scope.ViewMode = true;	
			}

			$scope.Item = {
					ID: data.ID,
					Title: data.Role,
					AssignedTo: data.Stakeholders,
			}

			
				$('.btn').attr('disabled', false);
			var dialogKeyWindow = $("#KWindowStakeholders").data("kendoWindow");
			dialogKeyWindow.open();
			dialogKeyWindow.center();
		}
		$scope.SaveRsik = function () {	
				UpdateFormDigest(webURL, refreshTym);
				$('.btn').attr('disabled', true);
				var ID = $scope.Item.ID 
				var	Role= $scope.Item.Title 
				var	AssignedTo = $scope.Item.AssignedTo
					$scope.ischkRiskAlert = false;
				if(Role == null || Role == ''){
						$('.btn').attr('disabled', false);
						$scope.ischkRiskAlert = true;
					return;
				}
				var ProjectId =projId;
				var data = {
					__metadata: {
						'type': 'SP.Data.CollaborationStakeholdersListItem'
					},
					Title: ProjectId,
					Role:Role,
					Stakeholders:{ "results": AssignedTo },//  AssignedTo != null ? AssignedTo.Id :null,					
				};

				if(ID == null){
					PService.AddNew(data, 'Collaboration: Stakeholders').then(function (response) {
						$scope.ShowStakeholders();
							var dialogKeyWindow = $("#KWindowStakeholders").data("kendoWindow");
							dialogKeyWindow.close();
							dialogKeyWindow.center();
							$('.btn').attr('disabled', false);
					
					
					
					}, function (error) {    
							$('.btn').attr('disabled', false);               
						console.error('Error:NEWSaveS ' + error.result);
					});	
				}
				if(ID != null){
					PService.Update(data, 'Collaboration: Stakeholders',ID).then(function (response) {
						$scope.ShowStakeholders();
							var dialogKeyWindow = $("#KWindowStakeholders").data("kendoWindow");
							dialogKeyWindow.close();
							dialogKeyWindow.center();
							$('.btn').attr('disabled', false);

					}, function (error) {    
							$('.btn').attr('disabled', false);               
						console.error('Error:SaveSU ' + error.result);
					});	

				}

		}

	

		$scope.CloseRiskForm = function () {
			var Chktrue = confirm("Are you sure you want to close this window?");
			if(Chktrue){	
					$scope.ShowRisks();
					var dialogKeyWindow = $("#PMwindowPreData").data("kendoWindow");
					dialogKeyWindow.close();
					dialogKeyWindow.center();
					//location.href = location.href.replace('#!','&#!');
					//	window.location.reload();
				}
		}
	
	
	
		
}]);


KendoPApp.controller('StakeholdersController', ['$scope', "$http", "$q", "$location","$sce", 'baseSvc', 'ProjectkFactoryService', 'Upload', '$timeout',
function ($scope, $http, $q, $location, $sce, bSvc, PService, Upload, $timeout) {
	$scope.init = function(){
		if(window.location.hash === "#!/Stakeholders"){				
			$location.path('/Stakeholders');	
				$scope.ShowStakeholders();
			
		}		
	}

	

	$scope.ConvertDateToMMDDYYYY = function (dDate) {
			
			if (dDate != undefined) {
				if (dDate != null) {
					
					var months = new Array(12);
						months[0] = "null";
						months[1] = "Jan";
						months[2] = "Feb";
						months[3] = "Mar";
						months[4] = "Apr";
						months[5] = "May";
						months[6] = "Jun";
						months[7] = "Jul";
						months[8] = "Aug";
						months[9] = "Sep";
						months[10] = "Oct";
						months[11] = "Nov";
						months[12] = "Dec";
					var SplitdDate = dDate.split('T')[0]
					var year = SplitdDate.split("-")[0]
					var Month;
					if(SplitdDate.split("-")[1] <10){						
						Month =SplitdDate.split("-")[1].slice(1, 2);
					}else{
					     Month= SplitdDate.split("-")[1]
					  }
						Month = months[Month]
					var day = SplitdDate.split("-")[2]
					
					var dateformate = day+"-"+Month+"-"+year
					
					return dateformate;//new Date(dDate).format("dd-MMM-yyyy");
				}
			}
		}

	$scope.ShowStakeholders = function(filterval){		
		$('ul.nav li.active').removeClass('active');
		$("a[name^=Stakeholders]").closest('li').addClass('active').hover();
				var UID = projId;
				if (location.hostname == 'projectmadeeasy.sharepoint.com') {
			var	url = SpURL + "/_api/web/lists/getByTitle('Collaboration: Stakeholders')/items?$top=4998&$select=*,Stakeholders/Name,Stakeholders/Title,Stakeholders/Id,Attachments,AttachmentFiles&$expand=AttachmentFiles,Stakeholders/Id&$filter=Title eq '" + UID + "'&$orderby=ID desc";} else {
			var url = "Stakeholders.json";
		}
			
			PService.GetAllItems('Collaboration: Stakeholders', url).then(function (response) {			
				$scope.getStakeholdersRes = [];				
				angular.forEach(response.d.results, function (item, index) {
						$scope.getStakeholdersRes.push(item)
						//$scope.getRisksRes[index].DateIdentifiedC = (item.DateIdentified != null) ? $scope.ConvertDateToMMDDYYYY(item.DateIdentified) : '';
						$scope.getStakeholdersRes[index].Delete  = null;
						$scope.getStakeholdersRes[index].Edit  = null;
					});
				$('#Stakeholdersgrid').empty();
				$scope.LoadKendoGridStakeholdersgridk($scope.getStakeholdersRes);
			 }, function (error) {       
				$scope.getStakeholdersRes = [];	
				$scope.LoadKendoGridStakeholdersgridk($scope.getStakeholdersRes);
				console.log(error)
			});
			
		
		}

		$scope.LoadKendoGridStakeholdersgridk = function(SData){
				$("#Stakeholdersgrid").kendoGrid({						
						dataSource:SData,
					    height: 360,
						scrollable: {
                            virtual: true
                        },
						sortable: true,							
						filterable: {
								extra: true,
								operators: { 
									string: {   
										contains: "Contains",
										eq: "Is Equal To",
										neq: "Is not equal to",
										startswith: "Starts With",									
									},
								
								}
							},
							resizable: true,
							selectable: "cell",
							change: function (e) {
								var cell = this.select();
								var cellIndex = cell[0].cellIndex;
								var column = this.columns[cellIndex];
								var dataItem = this.dataItem(cell.closest("tr"));
								
								if (column.field == "Edit") {									
									$scope.EditRiskItemView(dataItem, column.title);
								}
								else if (column.title == "Role") {									
									$scope.EditRiskItemView(dataItem, column.title);
								}
								else if (column.field == "Delete") {											
											$scope.DeleteItem(dataItem);
									}
							},
					  columns: [ { 
						     field: "Edit",
							 filterable:false,
							 title:'.',
							 	headerTemplate:'<label style=" color:#f3f3f4 ;" class=""></label>',
							  template: "<a id='btnEdit' class='btnEdit' title='Click to View' ><span class='pointer' style='float: right; cursor: pointer;' title='Click to Edit'><span class='k-icon k-i-edit'></span></span></a>",							
							 width: 30							 
							 },{ field: "ID",width:60,title: "ID", filterable:false},
						{ field: "Role",width:200,title:'Role',
						template: function(dataItem) {
								  var values = "<span class='textdecoration' style='color: #337ab7;  cursor: pointer;'>" + dataItem.Role + "</span>";
																  
								  return values;
								} 
						
						},

						 { field: "Stakeholders",width:200,title: "Stakeholders",filterable: {
							multi: true,
							search: true
						},
							template: function(dataItem) {
								  var values = '';
								  if(dataItem.Stakeholders.results != undefined){
									  
									  var titleLen = []
									  for (var i = 0; i < dataItem.Stakeholders.results.length; i++) {
											titleLen.push(dataItem.Stakeholders.results[i].Title);
										}
									  
									  values = "<span>" + titleLen.toString() + "</span>";
								  }								  
								  return values;
								}
						 }
						,{		field:'Delete',
								title: '.',
									headerTemplate:'<label style=" color:#f3f3f4 ;" class=""></label>',
								filterable: false,
								width: 35,
								template:'<span class="pointer" style="float: center; cursor: pointer;" title="Click to delete"><span class="k-icon k-i-trash	k-i-delete"></span></span>'
								
							},
					  ]					
					 
					});
					$('#Stakeholdersgrid').width($(window).width()-270);
					if(proLen == 0){
							var grid = $("#Stakeholdersgrid").data("kendoGrid");
						//	grid.hideColumn(10);
							//grid.hideColumn(0);
						}
						 var grid = $("#Stakeholdersgrid").data("kendoGrid");
								var exportFlag = false;
								grid.bind("excelExport", function (e) {
									if (!exportFlag) {
										//alert(1);
										e.sender.hideColumn(0);
										//e.sender.hideColumn(10);
										e.preventDefault();
										exportFlag = true;
										setTimeout(function () {
											e.sender.saveAsExcel();
										});
									} else {
										//alert(2);
										e.sender.showColumn(0);
										//e.sender.showColumn(10);
										exportFlag = false;
									}
								});
		}

		$scope.DeleteItem = function(data){
				var Chktrue = confirm("Are you sure you want to delete this entry?");
				if(Chktrue){
					PService.DeleteById('Collaboration: Stakeholders', data.ID).then(function (response) {
							$scope.ShowStakeholders();
						//location.href = location.href.replace('#!','&#!');
						//window.location.reload();
					});
				}

		}
		$scope.to_trusted = function (html_code) {
			return $sce.trustAsHtml(html_code);
		}

		$scope.EditRisk = function(){
			$scope.ViewMode = false;	
			//	$('.k-button-icon').hide()	 
		}
		$scope.AddNewItemWindow = function () {	
			$scope.ischkRiskAlert = false;
		var valuefil = 1		
			
			$scope.Item = {
					ID: null,
					Title: null,
					AssignedTo: null,
				}
				$('.btn').attr('disabled', false);
				$scope.ViewMode = false;
			var dialogKeyWindow = $("#KWindowStakeholders").data("kendoWindow");
			dialogKeyWindow.open();
			dialogKeyWindow.center();

		}
		$scope.EditRiskItemView = function(data, ItemView){

			$scope.ischkRiskAlert = false;
			$scope.ViewMode = false;	
			if(ItemView == 'Role'){
			//	$('.k-button-icon').show()
				$scope.ViewMode = true;	
			}
			var su = []
			
			$scope.Item = {
					ID: data.ID,
					Title: data.Role,
					AssignedTo:{results:[]} ,//data.Stakeholders.results,
			}
			if(data.Stakeholders.results != undefined){
				for (var i = 0; i < data.Stakeholders.results.length; i++) {
				
				$scope.Item.AssignedTo.results.push({
					Name:data.Stakeholders.results[i].Name,
					Id:data.Stakeholders.results[i].Id, 
					Title:data.Stakeholders.results[i].Title,
					})
				}
			}

			
				$('.btn').attr('disabled', false);
			var dialogKeyWindow = $("#KWindowStakeholders").data("kendoWindow");
			dialogKeyWindow.open();
			dialogKeyWindow.center();
		}
		$scope.SaveRsik = function () {	
				UpdateFormDigest(webURL, refreshTym);
				$('.btn').attr('disabled', true);
				var ID = $scope.Item.ID 
				var	Role= $scope.Item.Title 
				var	AssignedTo = $scope.Item.AssignedTo
					$scope.ischkRiskAlert = false;
				if(Role == null || Role == '' || AssignedTo == null || AssignedTo == ''){
						$('.btn').attr('disabled', false);
						$scope.ischkRiskAlert = true;
					return;
				}
				
						var ap = []
				for (var i = 0; i < AssignedTo.results.length; i++) {
					ap.push(AssignedTo.results[i].Id);
				}
				var ProjectId =projId;
				var data = {
					__metadata: {
						'type': 'SP.Data.CollaborationStakeholdersListItem'
					},
					Title: ProjectId,
					Role:Role,
					StakeholdersId:{ "results":ap },
					//"PeopleFieldId": { "results": ["4", "7"] }
					//StakeholdersId:  AssignedTo != null ? AssignedTo.Id :null,					
				};

				if(ID == null){
					PService.AddNew(data, 'Collaboration: Stakeholders').then(function (response) {
						$scope.ShowStakeholders();
							var dialogKeyWindow = $("#KWindowStakeholders").data("kendoWindow");
							dialogKeyWindow.close();
							dialogKeyWindow.center();
							$('.btn').attr('disabled', false);
					
					
					
					}, function (error) {    
							$('.btn').attr('disabled', false);               
						console.error('Error:NEWSaveS ' + error.result);
					});	
				}
				if(ID != null){
					PService.Update(data, 'Collaboration: Stakeholders',ID).then(function (response) {
						$scope.ShowStakeholders();
							var dialogKeyWindow = $("#KWindowStakeholders").data("kendoWindow");
							dialogKeyWindow.close();
							dialogKeyWindow.center();
							$('.btn').attr('disabled', false);

					}, function (error) {    
							$('.btn').attr('disabled', false);               
						console.error('Error:SaveSU ' + error.result);
					});	

				}

		}

	

		$scope.CloseRiskForm = function () {
			var Chktrue = confirm("Are you sure you want to close this window?");
			if(Chktrue){	
					$scope.ShowRisks();
					var dialogKeyWindow = $("#KWindowStakeholders").data("kendoWindow");
					dialogKeyWindow.close();
					dialogKeyWindow.center();
					//location.href = location.href.replace('#!','&#!');
					//	window.location.reload();
				}
		}
	
	
	
		
}]);


// LessonsLearned

KendoPApp.controller('LessonsLearnedMainController', ['$scope', "$http", "$q", "$location","$sce", 'baseSvc', 'ProjectkFactoryService',
function ($scope, $http, $q, $location, $sce, bSvc, PService) {
	$scope.init = function(){
		localStorage["kendo-grid-options"] = false;
		if(window.location.hash === "#!/LessonsLearned"){				
			$location.path('/LessonsLearned');
			$scope.ShowLessonsLearned();
		 }
	}
	
	$scope.ShowLessonsLearned = function(){
			//timecout()
			$scope.UnidueidNewVal = null
		    $('ul.nav li.active').removeClass('active');
		    $("a[name^=LessonsLearned]").closest('li').addClass('active').hover();
			var UID = projId;
			var data = []
			if (location.hostname == 'projectmadeeasy.sharepoint.com') {
			var url = SpURL + "/_api/web/lists/getByTitle('Collaboration: Lessons Learned')/items?$top=4998&$select=*,Created,Modified,Author/Id,Author/Name,Author/Title,Editor/Id,Editor/Name,Editor/Title,Attachments,AttachmentFiles&$expand=AttachmentFiles,Author/Id,Editor/Id&$filter=ProjectUID eq '" + UID + "'"; //&$orderby=ID desc
			} else {
			var url = "Lessons Learned.json";
		}
			PService.GetAllItems('Collaboration: Lessons Learned', url).then(function (response) {			
				$scope.getLessonsLearned = [];
				$scope.UniqIDCheck = false
				angular.forEach(response.d.results, function (item, index) {
					$scope.getLessonsLearned.push(item)		
					var ItemC = index
					
					if(ItemC < 9){
						ItemC = "0"+(index+1)
					}else{
						ItemC =  index+1
					}
					$scope.getLessonsLearned[index].IDL  = item.UniqueID0;
					$scope.getLessonsLearned[index].Title  = item.Title != null ?item.Title:'';// 'Status: ' +$scope.ConvertDateToMMDDYYYY(item.StatusDate) ;//StatusDate
					$scope.getLessonsLearned[index].CreatedC = (item.Created != null) ? $scope.ConvertDateToMMDDYYYY(item.Created) : '';
					$scope.getLessonsLearned[index].ModifiedC = (item.Modified != null) ? $scope.ConvertDateToMMDDYYYY(item.Modified) : '';
					$scope.getLessonsLearned[index].Delete  = null;
					$scope.getLessonsLearned[index].Edit  = null;
					$scope.getLessonsLearned[index].KeyLessonCopy  = item.KeyLesson != false?'Yes':"No";
					$scope.getLessonsLearned[index].WeekNumberIstrue  = false;					
					$scope.getLessonsLearned[index].Event  =  $("<div>").html(item.Event).html();
					$scope.getLessonsLearned[index].LessonLearned  =$("<div>").html(item.LessonLearned).html();
					$scope.getLessonsLearned[index].Recommendation  =  $("<div>").html(item.Recommendation).html();
					$scope.getLessonsLearned[index].EditorC = (item.EditorId!= null) ? item.Editor.Title:'';
					$scope.getLessonsLearned[index].AuthorC = (item.AuthorId != null) ?item.Author.Title:'';
					//console.log(ItemC+'C####'+ item.UniqueID0);
					$scope.UnidueidNewVal = item.UniqueID0;
						if(item.UniqueID0 == null){
							$scope.UniqIDCheck = true
							$scope.TitleLLU(item.ID,ItemC)
						}
				});
				if($scope.UniqIDCheck){				
					$scope.ShowLessonsLearned();
				}else{
					$('#LessonsLearnedMaingrid').empty();				
					$scope.LessonsLearnedForm($scope.getLessonsLearned);
				}
				
			 }, function (error) {                   
				console.error('Error: ' + error.result);
			}); 
			
			
		
	}
	
	$scope.TitleLLU = function(ID,Title){	
			 $.LoadingOverlay("show");
			var data = {
					__metadata: {
						'type': 'SP.Data.CollaborationLessonsLearnedListItem'
					},
					UniqueID0: Title.toString(),
			  }
		  if(ID != null){					
				PService.Update(data, 'Collaboration: Lessons Learned',ID).then(function (response) {
						$.LoadingOverlay("hide");
				}, function (error) {             
					$.LoadingOverlay("hide");
					console.error('Error:TitleLLU' + error.result);
				});	
			}			
	}
	
	$scope.AddNewItemWindow = function(){
			$('.btn').attr('disabled', false);
			$scope.ischkStatusMainAlert = false;
			$scope.Item = {
					ID: null,					
					Title: null,
					Recommendation: null,
					LessonLearned:null,
					Event: null,
					PositiveorNegative: null,
					Category: null,
					KeyLesson: false,
			 }
			  $scope.editviewdisble = false
			  $scope.viewcheckin = false
			    $scope.ViewMode = false;
			 $('.btn').attr('disabled', false);
			var heightmax ="70vh"
				var widthmax ="70vw"
			var dialogKeyWindow = $("#KWindowStatusMain").data("kendoWindow");
			dialogKeyWindow.open();
			dialogKeyWindow.center();
			dialogKeyWindow.setOptions({height:heightmax,width:widthmax});
			$('.k-content').animate({ scrollTop: 0 }, 'fast');
	}
	
	
$scope.EditLLMainItemView = function (data,ItemView) {
$scope.ischkStatusMainAlert = false;
 $scope.ViewMode = false;	
 $scope.editviewdisble = false
 $scope.viewcheckin = false
			if(ItemView == 'Title'){
			$scope.ViewMode = true;	
			$scope.viewcheckin = true
			if(proLen != 0){
				$scope.editviewdisble = true;
			}
			}
			
			
			$scope.Item = {
					ID: data.ID,					
					Title: data.Title,								
					Recommendation: data.Recommendation.replace( /(<([^>]+)>)/ig, ''),
					LessonLearned:data.LessonLearned.replace( /(<([^>]+)>)/ig, ''),
					Event: data.Event.replace( /(<([^>]+)>)/ig, ''),
					PositiveorNegative: data.PositiveorNegative,
					Category: data.Category,
					KeyLesson: data.KeyLesson,
					
			 }
			 var heightmax ="70vh"
				var widthmax ="70vw"
			var dialogKeyWindow = $("#KWindowStatusMain").data("kendoWindow");
			dialogKeyWindow.open();
			dialogKeyWindow.center();
			dialogKeyWindow.setOptions({height:heightmax,width:widthmax});
			$('.k-content').animate({ scrollTop: 0 }, 'fast');
	}
	
	
	$scope.SaveLLMain = function(){	 
	$('.btn').attr('disabled', true);
				var	ID =$scope.Item.ID;					
				var	Title=$scope.Item.Title;
				var	Recommendation=$scope.Item.Recommendation;
				var	LessonLearned=$scope.Item.LessonLearned;
				var	Event=$scope.Item.Event;
				
				var	PositiveorNegative=$scope.Item.PositiveorNegative;
				var	Category=$scope.Item.Category;
				var	KeyLesson=$scope.Item.KeyLesson;// != 'No' ? true:false;
				
			

				
				
				if(Title == null || Title == '' || PositiveorNegative == null || PositiveorNegative == '' || Category == null || Category == ''){
						$('.btn').attr('disabled', false);
						$scope.ischkStatusMainAlert = true;
					return;
				}				
				if(LessonLearned == null || LessonLearned == '' || Event == null || Event == ''){
						$('.btn').attr('disabled', false);
						$scope.ischkStatusMainAlert = true;
					return;
				}	

				$scope.ischkStatusMainAlert = false;
				
				var ProjectId =projId;				

				var grid = $("#LessonsLearnedMaingrid").data("kendoGrid");
				localStorage["kendo-grid-options"] =  kendo.stringify(grid.dataSource.filter());
				 	var data = {
							__metadata: {
								'type': 'SP.Data.CollaborationLessonsLearnedListItem'
							},
							Title:Title,					
							Recommendation: Recommendation,
							LessonLearned:LessonLearned,
							Event: Event,
							PositiveorNegative: PositiveorNegative,
							Category: Category,
							KeyLesson: KeyLesson,										
							ProjectUID:ProjectId,	
						};

				if(ID == null){
					//$scope.UnidueidNewVal = item.UniqueID0;
					var ItemC = $scope.UnidueidNewVal != null ? parseInt($scope.UnidueidNewVal):null;
					if(ItemC < 9){
						ItemC = "0"+(ItemC+1)
					}else{
						ItemC =  ItemC+1
					}
					 data["UniqueID0"]=ItemC != null ?ItemC.toString():null;
					PService.AddNew(data, 'Collaboration: Lessons Learned').then(function (response) {
								$scope.ShowLessonsLearned()
								$('.btn').attr('disabled', false);
									var dialogKeyWindow = $("#KWindowStatusMain").data("kendoWindow");
										dialogKeyWindow.close();
										dialogKeyWindow.center();
										

							}, function (error) {    
									$('.btn').attr('disabled', false);               
								console.error('Error:SaveStatusMain ' + error.result);
							});
				}
				if(ID != null){					
						PService.Update(data, 'Collaboration: Lessons Learned',ID).then(function (response) {
									$scope.ShowLessonsLearned()
									var dialogKeyWindow = $("#KWindowStatusMain").data("kendoWindow");
								dialogKeyWindow.close();
								dialogKeyWindow.center();
								$('.btn').attr('disabled', false);								

						}, function (error) {    
								$('.btn').attr('disabled', false);               
							console.error('Error:SaveStatusMain ' + error.result);
						});	

					}

		}
	
	// Comment : Delete Selected Item on the Table
	$scope.DeleteItem = function(data){
				var Chktrue = confirm("Are you sure you want to delete this entry?");
				var grid = $("#LessonsLearnedMaingrid").data("kendoGrid");
				localStorage["kendo-grid-options"] =  kendo.stringify(grid.dataSource.filter());
				if(Chktrue){
					PService.DeleteById('Collaboration: Lessons Learned', data.ID).then(function (response) {
						$scope.ShowStatusMaintrue = true;
						$scope.ShowLessonsLearned();
					//	location.href = location.href.replace('#!','?#!');
						//window.location.reload();
					});
				}

		}
		
$scope.ConvertToMMDDYYYY = function (dDate) {
			if (dDate != undefined) {
				if (dDate != null) {					
					
					//var SplitdDate = dDate.split('T')[0]					
					return new Date(dDate).format("dd-MMM-yyyy");
				}
			}
		}
		$scope.ConvertDateToMMDDYYYY = function (dDate) {
			
			if (dDate != undefined) {
				if (dDate != null) {
					
					var months = new Array(12);
						months[0] = "null";
						months[1] = "Jan";
						months[2] = "Feb";
						months[3] = "Mar";
						months[4] = "Apr";
						months[5] = "May";
						months[6] = "Jun";
						months[7] = "Jul";
						months[8] = "Aug";
						months[9] = "Sep";
						months[10] = "Oct";
						months[11] = "Nov";
						months[12] = "Dec";
					var SplitdDate = dDate.split('T')[0]
					var year = SplitdDate.split("-")[0]
					var Month;
					if(SplitdDate.split("-")[1] <10){						
						Month =SplitdDate.split("-")[1].slice(1, 2);
					}else{
					     Month= SplitdDate.split("-")[1]
					  }
						Month = months[Month]
					var day = SplitdDate.split("-")[2]
					
					var dateformate = day+"-"+Month+"-"+year
					
					return dateformate;//new Date(dDate).format("dd-MMM-yyyy");
				}
			}
		}
	
	$scope.CloseLLMainForm = function(){
			$('.btn').attr('disabled', false);
			if($scope.viewcheckin){
			var grid = $("#LessonsLearnedMaingrid").data("kendoGrid");
			localStorage["kendo-grid-options"] =  kendo.stringify(grid.dataSource.filter());
			var dialogKeyWindow = $("#KWindowStatusMain").data("kendoWindow");
			   dialogKeyWindow.close();
			   dialogKeyWindow.center();
			}else{
				var Chktrue = confirm("Are you sure you want to close this window?");
				if(Chktrue){
			var grid = $("#LessonsLearnedMaingrid").data("kendoGrid");
			localStorage["kendo-grid-options"] =  kendo.stringify(grid.dataSource.filter());
			var dialogKeyWindow = $("#KWindowStatusMain").data("kendoWindow");
			   dialogKeyWindow.close();
			   dialogKeyWindow.center();
				}
			}
	}
	
	
	$scope.ClosesaveMainForm = function(){
			$('.btn').attr('disabled', false);
			var Chktrue = confirm("Are you sure you want to close this window?");
				if(Chktrue){
			var grid = $("#LessonsLearnedMaingrid").data("kendoGrid");
			localStorage["kendo-grid-options"] =  kendo.stringify(grid.dataSource.filter());
			var dialogKeyWindow = $("#KWindowStatusMain").data("kendoWindow");
			   dialogKeyWindow.close();
			   dialogKeyWindow.center();
				}
	}
	
	
	
	
	$scope.LessonsLearnedForm = function(dataView){	
				$('.btnAllcoumns').css( "font-weight", "bold" );
				$('.btnSColums').css( "font-weight", "" );
				 var options = localStorage["kendo-grid-options"];
					var gridsourcs =[];
					if (options != 'false' && options != 'null'  && options != 'undefined') {
						var st =JSON.parse(options);
							gridsourcs = new kendo.data.DataSource({
								data:dataView,
								filter: st,
								sort:[ {
							field: "IDL",
								dir: "asc"
							}]
							});
						localStorage["kendo-grid-options"] = 'false';
					}else{
						gridsourcs = new kendo.data.DataSource({
							data:dataView,
							sort:[ {
							field: "IDL",
								dir: "asc"
							}]
						});
					}
					var Vheight = '55vh'
				$('#LessonsLearnedMaingrid').empty();
					$("#LessonsLearnedMaingrid").kendoGrid({
						toolbar: ["excel"],
						excel: {
							fileName: "LessonsLearned.xlsx"
						},
					  dataSource:gridsourcs,/* {
							data:$scope.getStatusMainRes,
							/*sort:[ {
							field: "ID",
								dir: "asc"
							}]*/
						//},
					   height: Vheight,
						scrollable: {
                            virtual: true
                        },
						sortable: true,

							
							filterable: {
									extra: false,
									operators: { 
										string: {   
											contains: "Contains",									
										},
									
									}
								},
							resizable: true,
							selectable: "cell",
							change: function (e) {
								var cell = this.select();
								var cellIndex = cell[0].cellIndex;
								var column = this.columns[cellIndex];
								var dataItem = this.dataItem(cell.closest("tr"));
								
							if (column.title == "Title") {									
									$scope.EditLLMainItemView(dataItem, column.title);
								}
							//if(dataItem.WeekNumberIstrue){
								if (column.field == "Edit") {									
									$scope.EditLLMainItemView(dataItem, column.title);
								}								
								else if (column.field == "Delete") {											
											$scope.DeleteItem(dataItem);
									}
								//}						
							},
				 filterMenuInit: function(e) {
							  if (e.field === "Category" || e.field === "PositiveorNegative" || e.field === "KeyLessonCopy" || e.field === "EditorC" || e.field === "AuthorC") {
								var filterMultiCheck = this.thead.find("[data-field=" + e.field + "]").data("kendoFilterMultiCheck")
								filterMultiCheck.container.empty();
								filterMultiCheck.checkSource.sort({field: e.field, dir: "asc"});
								filterMultiCheck.checkSource.data(filterMultiCheck.checkSource.view().toJSON());
								filterMultiCheck.createCheckBoxes();
							  }
							},
				
				columns: [
					{ 
							field: "Edit",
							filterable:false,
							 title:'.',
								headerTemplate:'<label style=" color:#f3f3f4 ;" class=""></label>',
							  template:function(dataItem) {
								   var values = '';
								  //if(dataItem.WeekNumberIstrue){
									values = "<a id='btnEdit' class='btnEdit' title='Click to View' ><span class='pointer' style='float: right; cursor: pointer;' title='Click to Edit'><span class='k-icon k-i-edit'></span></span></a>";
								  //}								  
								  return values;
							  },
							  
							 width: 30
							 
							 },
						{ field: "IDL",title:'ID',width:80,headerAttributes: {
								style: "white-space: normal"
							},filterable:false,},
						{ field: "Title",title:'Title',width:200,
							template: function(dataItem) {
								  var values = '';
								values = "<span class='textdecoration' style='color: #337ab7;  cursor: pointer;'>" + dataItem.Title + "</span>";
																								  
								  return values;
								}
						
						
						 },
						
					 { field: "Category" ,width:150,title:'Category',filterable: {
							multi: true,
							search: true
							},
							headerAttributes: {
								style: "white-space: normal"
							},
						},
						 { field: "PositiveorNegative" ,width:130,title:'Positive or Negative',filterable: {
							multi: true,
							search: true
							},
							headerAttributes: {
								style: "white-space: normal"
							},
						},
						
						
						{ field: "Event",width:300,title:'Event',
						headerAttributes: {
								style: "white-space: normal"
							},
							template: function(dataItem) {
								  return "<span>" + htmlDecode(dataItem.Event) + "</span>";
								}
						
						 },
						{ field: "LessonLearned",width:300,title:'Lesson Learned',
							template: function(dataItem) {
								  return "<span>" + htmlDecode(dataItem.LessonLearned) + "</span>";
								},headerAttributes: {
								style: "white-space: normal"
							},
						
						 },
						 { field: "Recommendation",width:300,title:'Recommendation',
							template: function(dataItem) {
								  return "<span>" + htmlDecode(dataItem.Recommendation) + "</span>";
								}
						
						 },
							
						 { field: "KeyLessonCopy",width:150,title: "Key Lesson",filterable: {
							multi: true,
							search: true
							}, },
						 { field: "ModifiedC",width:150,title: "Modified",filterable:false },
						{ field: "EditorC",width:200,title: "Modified By",filterable: {
							multi: true,
							search: true
							},
							/*template: function(dataItem) {
								  var values = '';
								  if(dataItem.EditorId != null){
									  values = "<span>" + dataItem.Editor.Title + "</span>";
								  }								  
								  return values;
								}*/
						 },
						{ field: "CreatedC",width:150,title: "Created",filterable:false },
						{ field: "AuthorC",width:200,title: "Created By",filterable: {
							multi: true,
							search: true
							},
						/*	template: function(dataItem) {
								  var values = '';
								  if(dataItem.AuthorId != null){
									  values = "<span>" + dataItem.Author.Title + "</span>";
								  }								  
								  return values;
								}*/
						 },	
						 {
								field: 'Delete',
								title:'.',
								filterable: false,
								width: 35,
									headerTemplate:'<label style=" color:#f3f3f4 ;" class=""></label>',
								template:function(dataItem) {
									var a = '';
									//if(dataItem.WeekNumberIstrue){
										a= '<span class="pointer" style="float: center; cursor: pointer;" title="Click to delete"><span class="k-icon k-i-trash	k-i-delete"></span></span>'
									//}
								return a;
								}
							},
						
					  ],
					   excelExport: function (e) {
							// e.preventDefault(); 
							var sheet = e.workbook.sheets[0];
							for (var i = 1; i < sheet.rows.length; i++) {
								var row = sheet.rows[i];
								for (var ci = 0; ci < row.cells.length; ci++) {
									var cell = row.cells[ci];
									if (ci == 11 || ci == 12 || ci == 13 || ci == 14 || 15) {
										if (cell.value) {
											//cell.value = $('<div>').html((cell.value)).text();
											//cell.value = cell.value.replace("<br />", "\n");
											cell.value = htmlDecodeWithLineBreaks(cell.value);
											cell.wrap = true;
										}
									}
								}
							}
					  }
					  
					});
					$('#LessonsLearnedMaingrid').width($(window).width()-270);
					if(proLen == 0){
							var grid = $("#LessonsLearnedMaingrid").data("kendoGrid");
							grid.hideColumn(13);
							//grid.hideColumn(0);
						}
						var grid = $("#LessonsLearnedMaingrid").data("kendoGrid");
								var exportFlag = false;
								grid.bind("excelExport", function (e) {
									if (!exportFlag) {
										//alert(1);
										e.sender.hideColumn(0);
										e.sender.hideColumn(13);
										e.preventDefault();
										exportFlag = true;
										setTimeout(function () {
											e.sender.saveAsExcel();
										});
									} else {
										//alert(2);
										e.sender.showColumn(0);
										e.sender.showColumn(13);
										exportFlag = false;
									}
								});
	}
	$scope.to_trusted = function (html_code) {
			return $sce.trustAsHtml(html_code);
		}
		
	$scope.EditLLMain = function(){
		 $scope.ViewMode = false;	
			$scope.editviewdisble = false
			$scope.viewcheckin = false
	}
	
}])

KendoPApp.controller('CommunicationController', ['$scope', "$http", "$q", "$location","$sce", 'baseSvc', 'ProjectkFactoryService', 'Upload', '$timeout',
function ($scope, $http, $q, $location, $sce, bSvc, PService, Upload, $timeout) {
	$scope.init = function(){
		if(window.location.hash === "#!/Communication"){				
			$location.path('/Communication');	
				$scope.ShowCommunication();
			
		}		
	}

	

	$scope.ConvertDateToMMDDYYYY = function (dDate) {
			
			if (dDate != undefined) {
				if (dDate != null) {
					
					var months = new Array(12);
						months[0] = "null";
						months[1] = "Jan";
						months[2] = "Feb";
						months[3] = "Mar";
						months[4] = "Apr";
						months[5] = "May";
						months[6] = "Jun";
						months[7] = "Jul";
						months[8] = "Aug";
						months[9] = "Sep";
						months[10] = "Oct";
						months[11] = "Nov";
						months[12] = "Dec";
					var SplitdDate = dDate.split('T')[0]
					var year = SplitdDate.split("-")[0]
					var Month;
					if(SplitdDate.split("-")[1] <10){						
						Month =SplitdDate.split("-")[1].slice(1, 2);
					}else{
					     Month= SplitdDate.split("-")[1]
					  }
						Month = months[Month]
					var day = SplitdDate.split("-")[2]
					
					var dateformate = day+"-"+Month+"-"+year
					
					return dateformate;//new Date(dDate).format("dd-MMM-yyyy");
				}
			}
		}

	$scope.ShowCommunication = function(filterval){		
		$('ul.nav li.active').removeClass('active');
		$("a[name^=Communication]").closest('li').addClass('active').hover();
				var UID = projId;
				if (location.hostname == 'projectmadeeasy.sharepoint.com') {
			var	url = SpURL + "/_api/web/lists/getByTitle('Collaboration: Communication')/items?$top=4998&$select=*,Stakeholders/Name,Stakeholders/Title,Stakeholders/Id,Attachments,AttachmentFiles&$expand=AttachmentFiles,Stakeholders/Id&$filter=ProjectUID eq '" + UID + "'&$orderby=ID desc";} else {
			var url = "Communication.json";
		}
			
			PService.GetAllItems('Collaboration: Communication', url).then(function (response) {			
				$scope.getStakeholdersRes = [];				
				angular.forEach(response.d.results, function (item, index) {
						$scope.getStakeholdersRes.push(item)
						//$scope.getRisksRes[index].DateIdentifiedC = (item.DateIdentified != null) ? $scope.ConvertDateToMMDDYYYY(item.DateIdentified) : '';
						$scope.getStakeholdersRes[index].Delete  = null;
						$scope.getStakeholdersRes[index].Edit  = null;
					});
						var UID = projId;
						if (location.hostname == 'projectmadeeasy.sharepoint.com') {
						var	url = SpURL + "/_api/web/lists/getByTitle('Collaboration: Stakeholders')/items?$top=4998&$select=*,Stakeholders/Name,Stakeholders/Title,Stakeholders/Id,Attachments,AttachmentFiles&$expand=AttachmentFiles,Stakeholders/Id&$filter=Title eq '" + UID + "'&$orderby=ID desc";
			} else {
			var url = "Stakeholders.json";
		}
					PService.GetAllItems('Collaboration: Stakeholders', url).then(function (response) {			
							$scope.getStakeholdersRes = [];	
							var Sdata = []							
							angular.forEach(response.d.results, function (item, index) {
									var titleLen = []
									  for (var i = 0; i < item.Stakeholders.results.length; i++) {
											titleLen.push(item.Stakeholders.results[i].Title);
										}
										$scope.getStakeholdersRes.push(item)
										Sdata.push(item.Role)
								});
							$scope.PTypeChoice = { dataSource:Sdata.sort()}	
								//console.log($scope.getStakeholdersRes)
						 }, function (error) {
						});
					
					 
				$('#CommunicationGrid').empty();
				$scope.LoadKendoGridStakeholdersgridk($scope.getStakeholdersRes);
			 }, function (error) {       
				$scope.getStakeholdersRes = [];	
				$scope.LoadKendoGridStakeholdersgridk($scope.getStakeholdersRes);
				console.log(error)
			});
			
		
		}

		$scope.LoadKendoGridStakeholdersgridk = function(SData){
				$("#CommunicationGrid").kendoGrid({						
						dataSource:SData,
					    height: 360,
						scrollable: {
                            virtual: true
                        },
						sortable: true,							
						filterable: {
								extra: true,
								operators: { 
									string: {   
										contains: "Contains",
										eq: "Is Equal To",
										neq: "Is not equal to",
										startswith: "Starts With",									
									},
								
								}
							},
							resizable: true,
							selectable: "cell",
							change: function (e) {
								var cell = this.select();
								var cellIndex = cell[0].cellIndex;
								var column = this.columns[cellIndex];
								var dataItem = this.dataItem(cell.closest("tr"));
								
								if (column.field == "Edit") {									
									$scope.EditRiskItemView(dataItem, column.title);
								}
								else if (column.field == "Participants") {									
									$scope.EditRiskItemView(dataItem, column.field);
								}
								else if (column.field == "Delete") {											
											$scope.DeleteItem(dataItem);
									}
							},
					  columns: [ { 
						     field: "Edit",
							 filterable:false,
							 title:'.',
							 	headerTemplate:'<label style=" color:#f3f3f4 ;" class=""></label>',
							  template: "<a id='btnEdit' class='btnEdit' title='Click to View' ><span class='pointer' style='float: right; cursor: pointer;' title='Click to Edit'><span class='k-icon k-i-edit'></span></span></a>",							
							 width: 30							 
							 },{ field: "ID",width:60,title: "ID", filterable:false},
							 { field: "Title",width:200,title:'Title',filterable: {
							multi: true,
							search: true
						}},
						{ field: "Participants",width:200,title:'Participants Type',
						template: function(dataItem) {
								  var values = "<span class='textdecoration' style='color: #337ab7;  cursor: pointer;'>" + dataItem.Participants + "</span>";
																  
								  return values;
								} 
						
						},
						/*{ field: "Participants",width:200,title:'Participants',
						template: function(dataItem) {
								  var values = "<span class='textdecoration' style='color: #337ab7;  cursor: pointer;'>" + dataItem.Participants + "</span>";
																  
								  return values;
								} 
						
						},*/
						{ field: "Stakeholders",width:300,title: "Participants",filterable: {
							multi: true,
							search: true
						},
							template: function(dataItem) {
								  var values = '';
								  if(dataItem.Stakeholders.results != undefined){
									  
									  var titleLen = []
									  for (var i = 0; i < dataItem.Stakeholders.results.length; i++) {
											titleLen.push(dataItem.Stakeholders.results[i].Title);
										}
									  
									  values = "<span>" + titleLen.toString() + "</span>";
								  }								  
								  return values;
								}
						 },
						 { field: "Frequency",width:200,title: "Frequency",filterable: {
							multi: true,
							search: true
						},
							
						 },
						 { field: "MeetingType",width:200,title: "Meeting Type",filterable: {
								multi: true,
								search: true
							},
							
						 },{
							field: "Purpose",
							title: "Purpose",
							width: 200,
							headerAttributes: {
								style: "white-space: normal"
							},
								template: function(dataItem) {
										  return "<span>" + htmlDecode(dataItem.Purpose) + "</span>";
										}
						},
						{		field:'Delete',
								title: '.',
									headerTemplate:'<label style=" color:#f3f3f4 ;" class=""></label>',
								filterable: false,
								width: 35,
								template:'<span class="pointer" style="float: center; cursor: pointer;" title="Click to delete"><span class="k-icon k-i-trash	k-i-delete"></span></span>'
								
							},
					  ]					
					 
					});
					$('#CommunicationGrid').width($(window).width()-270);
					if(proLen == 0){
							var grid = $("#CommunicationGrid").data("kendoGrid");
						//	grid.hideColumn(10);
							//grid.hideColumn(0);
						}
						 var grid = $("#CommunicationGrid").data("kendoGrid");
								var exportFlag = false;
								grid.bind("excelExport", function (e) {
									if (!exportFlag) {
										//alert(1);
										e.sender.hideColumn(0);
										//e.sender.hideColumn(10);
										e.preventDefault();
										exportFlag = true;
										setTimeout(function () {
											e.sender.saveAsExcel();
										});
									} else {
										//alert(2);
										e.sender.showColumn(0);
										//e.sender.showColumn(10);
										exportFlag = false;
									}
								});
		}

		$scope.DeleteItem = function(data){
				var Chktrue = confirm("Are you sure you want to delete this entry?");
				if(Chktrue){
					PService.DeleteById('Collaboration: Communication', data.ID).then(function (response) {
							$scope.ShowCommunication();
						//location.href = location.href.replace('#!','&#!');
						//window.location.reload();
					});
				}

		}
		$scope.to_trusted = function (html_code) {
			return $sce.trustAsHtml(html_code);
		}

		$scope.EditRisk = function(){
			$scope.ViewMode = false;	
			//	$('.k-button-icon').hide()	 
		}
		$scope.AddNewItemWindow = function () {	
			$scope.ischkRiskAlert = false;
		var valuefil = 1		
			
			$scope.Item = {
					ID: null,
					Title: null,
					Participants: null,
					Frequency: null,
					MeetingType: null,
					Purpose: null,
				}
				$('.btn').attr('disabled', false);
				$scope.ViewMode = false;
			var dialogKeyWindow = $("#KWindowCommunication").data("kendoWindow");
			dialogKeyWindow.open();
			dialogKeyWindow.center();

		}
		$scope.EditRiskItemView = function(data, ItemView){

			$scope.ischkRiskAlert = false;
			$scope.ViewMode = false;	
			if(ItemView == 'Participants'){
			//	$('.k-button-icon').show()
				$scope.ViewMode = true;	
			}
			
			
			var Participants = data.Participants.split(',')
			/*for (var i = 0; i < $scope.getStakeholdersRes.length; i++) {
				if(data.Participants == $scope.getStakeholdersRes[i].Role){
					Participants = $scope.getStakeholdersRes[i];
				}
			}*/
			

			$scope.Item = {
					ID: data.ID,
					Title:data.Title,
					//Role: data.Role,
					//AssignedTo: data.Stakeholders,
					Participants: Participants,
					ParticipantsC:  data.Participants,
					Frequency: data.Frequency,
					MeetingType: data.MeetingType,
					Purpose: data.Purpose,
			}

			
				$('.btn').attr('disabled', false);
			var dialogKeyWindow = $("#KWindowCommunication").data("kendoWindow");
			dialogKeyWindow.open();
			dialogKeyWindow.center();
		}
		$scope.SaveRsik = function () {	
				UpdateFormDigest(webURL, refreshTym);
				$('.btn').attr('disabled', true);
				var ID = $scope.Item.ID 
				var	Title= $scope.Item.Title 
				
				var	Frequency = $scope.Item.Frequency
				var	MeetingType = $scope.Item.MeetingType
				var	Purpose = $scope.Item.Purpose
					$scope.ischkRiskAlert = false;
				
				var	Participants = $scope.Item.Participants
				if(Participants == null || Participants == '' || Frequency == null || Frequency == '' || MeetingType == null || MeetingType == ''){
						$('.btn').attr('disabled', false);
						$scope.ischkRiskAlert = true;
					return;
				}
					var ap = []
				
				for (var j = 0; j < $scope.Item.Participants.length; j++) { //$scope.getStakeholdersRes.Stakeholders.results.length
					for (var i = 0; i < $scope.getStakeholdersRes.length; i++) {
						if($scope.Item.Participants[j] == $scope.getStakeholdersRes[i].Role){							
							for (var z = 0; z < $scope.getStakeholdersRes[i].Stakeholders.results.length; z++) {
									ap.push($scope.getStakeholdersRes[i].Stakeholders.results[z].Id);
							}
						}
					}
				}
				
				
				/*var	Participants = $scope.Item.Participants.toString();	
				if(Participants == null || Participants == '' || Frequency == null || Frequency == '' || MeetingType == null || MeetingType == ''){
						$('.btn').attr('disabled', false);
						$scope.ischkRiskAlert = true;
					return;
				}*/
				var ProjectId =projId;
				var data = {
					__metadata: {
						'type': 'SP.Data.CollaborationCommunicationListItem'
					},
					ProjectUID:ProjectId,
					Title: Title,
					Participants:Participants.toString(),
					Frequency:Frequency,
					MeetingType:MeetingType,
					Purpose:Purpose,
					StakeholdersId:{ "results":ap },
				};

				if(ID == null){
					PService.AddNew(data, 'Collaboration: Communication').then(function (response) {
						$scope.ShowCommunication();
							var dialogKeyWindow = $("#KWindowCommunication").data("kendoWindow");
							dialogKeyWindow.close();
							dialogKeyWindow.center();
							$('.btn').attr('disabled', false);
					
					
					
					}, function (error) {    
							$('.btn').attr('disabled', false);               
						console.error('Error:NEWSaveS ' + error.result);
					});	
				}
				if(ID != null){
					PService.Update(data, 'Collaboration: Communication',ID).then(function (response) {
						$scope.ShowCommunication();
							var dialogKeyWindow = $("#KWindowCommunication").data("kendoWindow");
							dialogKeyWindow.close();
							dialogKeyWindow.center();
							$('.btn').attr('disabled', false);

					}, function (error) {    
							$('.btn').attr('disabled', false);               
						console.error('Error:SaveSU ' + error.result);
					});	

				}

		}

	

		$scope.CloseRiskForm = function () {
			var Chktrue = confirm("Are you sure you want to close this window?");
			if(Chktrue){	
					$scope.ShowCommunication();
					var dialogKeyWindow = $("#KWindowCommunication").data("kendoWindow");
					dialogKeyWindow.close();
					dialogKeyWindow.center();
					//location.href = location.href.replace('#!','&#!');
					//	window.location.reload();
				}
		}
	
	
	
		
}]);

KendoPApp.controller('ProjectIssuesController', ['$scope', "$http", "$q", "$location","$sce", 'baseSvc', 'ProjectkFactoryService',
function ($scope, $http, $q, $location, $sce, bSvc, PService) {
	$scope.init = function(){		
		
		
		if(window.location.hash === "#!/Issues"){				
				$location.path('/Issues');
				$scope.ShowIssues();
			 }
			 

		
	}
	
	$scope.ShowIssues = function(){		
		$('ul.nav li.active').removeClass('active');
		$("a[name^=Issues]").closest('li').addClass('active').hover();
			var UID = projId;
			if (location.hostname == 'projectmadeeasy.sharepoint.com') {
			var url = SpURL + "/_api/web/lists/getByTitle('Collaboration: Issues')/items?$top=4998&$select=*,BarriersAssignedTo/Name,BarriersAssignedTo/Title,BarriersAssignedTo/Id,IssueAssignedTo/Name,IssueAssignedTo/Title,IssueAssignedTo/Id,IssueOwner/Name,IssueOwner/Title,IssueOwner/Id,Attachments,AttachmentFiles&$expand=AttachmentFiles,BarriersAssignedTo/Id,IssueAssignedTo/Id,IssueOwner/Id&$filter=ProjectUID eq '" + UID + "'&$orderby=ID desc";} else {
			var url = "Issues.json";
		}
			PService.GetAllItems('Collaboration: Issues', url).then(function (response) {			
				$scope.getIssuesRes = [];
				angular.forEach(response.d.results, function (item, index) {
					$scope.getIssuesRes.push(item)
					$scope.getIssuesRes[index].BarriersDescription = $("<div>").html(item.Barriers).html();
					$scope.getIssuesRes[index].IssueResolution = $("<div>").html(item.IssueResolution).html();
					$scope.getIssuesRes[index].IssueDiscussion = $("<div>").html(item.IssueDiscussion).html();
					$scope.getIssuesRes[index].IssueDescription = $("<div>").html(item.IssueDescription).html();
				//	$scope.getIssuesRes[index].IncludeonStatusReports = item.IncludeonStatusReports != true ?'No':'Yes';
					$scope.getIssuesRes[index].DateAssignedC = (item.DateAssigned != null) ? $scope.ConvertDateToMMDDYYYY(item.DateAssigned) : '';
					$scope.getIssuesRes[index].DateDueC = (item.DateDue != null) ? $scope.ConvertDateToMMDDYYYY(item.DateDue) : '';
						$scope.getIssuesRes[index].DateIdentifiedC = (item.DateIdentified != null) ? $scope.ConvertDateToMMDDYYYY(item.DateIdentified) : '';
					$scope.getIssuesRes[index].DateResolvedC = (item.DateResolved != null) ? $scope.ConvertDateToMMDDYYYY(item.DateResolved) : '';
						$scope.getIssuesRes[index].TaskDueDateC = (item.TaskDueDate != null) ? $scope.ConvertDateToMMDDYYYY(item.TaskDueDate) : '';
						$scope.getIssuesRes[index].Delete  = null;
					$scope.getIssuesRes[index].Edit  = null;
				});
				$('#Issuesgrid').empty();
				$scope.LoadKendoGridIssues($scope.getIssuesRes);
			 }, function (error) {                   
				console.error('Error: ' + error.result);
				$scope.LoadKendoGridRisdk();
			});

	}

	$scope.LoadKendoGridIssues = function(ResData){
		
			$("#Issuesgrid").kendoGrid({
						toolbar: ["excel"],
						excel: {
							fileName: "Issues.xlsx"
						},
					  dataSource: {
							data:ResData,
							sort:[ {
							field: "IssuePriority",
								dir: "asc"
							},{
							field: "ID",
								dir: "asc"
							},]
						},
					   height: 360,
						scrollable: {
                            virtual: true
                        },
						sortable: true,

							
							filterable: {
									extra: true,
									operators: { 
										string: {   
											contains: "Contains",
											eq: "Is Equal To",
											neq: "Is not equal to",
											startswith: "Starts With",									
										},
									
									}
								},
							resizable: true,
							selectable: "cell",
							change: function (e) {
								var cell = this.select();
								var cellIndex = cell[0].cellIndex;
								var column = this.columns[cellIndex];
								var dataItem = this.dataItem(cell.closest("tr"));

								if (column.field == "Edit") {									
									$scope.EditIssueItemView(dataItem, column.title);
								}
								else if (column.title == "Title") {									
									$scope.EditIssueItemView(dataItem, column.title);
								}								
								
								else if (column.field == "Delete") {											
											$scope.DeleteItem(dataItem);
									}
							},
				
				
				columns: [{ 
						     field: "Edit",
							 filterable:false,
							 excel:false,
							 title:'.',
							 	headerTemplate:'<label style=" color:#f3f3f4 ;" class=""></label>',
							  template: "<a id='btnEdit' class='btnEdit' title='Click to View' ><span class='pointer' style='float: right; cursor: pointer;' title='Click to Edit'><span class='k-icon k-i-edit'></span></span></a>",							
							 width: 30							 
							 },{ field: "ID",width:60,title:'ID',filterable:false,
						/*	template: function(dataItem) {
								  return "<span>I." + dataItem.ID + "</span>";
								}*/
						 },
						{ field: "Title",width:200 ,title:'Title',
							template: function(dataItem) {
								  var values = '';
								//	values = "<span>" + dataItem.Title + "<a id='btnView' class='btnView' style='float: right; ' title='Click to View' ><img border='0'  alt='edit' src='/_layouts/15/images/edititem.gif?rev=47'></a>";
 								 values = "<span class='textdecoration' style='color: #337ab7;  cursor: pointer;'>" + dataItem.Title + "</span>";						  
								  return values;
								}
						
						
						 },
						
						 { field: "IssueAssignedTo.Title",width:200,title:'Issue Assigned To',filterable: {
							multi: true,
							search: true
						},
							template: function(dataItem) {
								  var values = '';
								  if(dataItem.IssueAssignedToId != null){
									  values = "<span>" + dataItem.IssueAssignedTo.Title + "</span>";
								  }								  
								  return values;
								}
						 },
						 { field: "IssuePriority",width:160,title:'Issue Priority',filterable: {
							multi: true,
							search: true
						}, },
						 { field: "IssueCategory",width:160,title:'Issue Category',filterable: {
							multi: true,
							search: true
						}, },
						{ field: "IssueStatus" ,width:140,title:'Issue Status',filterable: {
							multi: true,
							search: true
						},},
						{ field: "IssueDiscussion",width:200,title:'Issue Discussion',
							template: function(dataItem) {
								  return "<span>" + htmlDecode(dataItem.IssueDiscussion) + "</span>";
								}
						 },
						{ field: "IssueDescription",width:200,title:'Issue Description',
							template: function(dataItem) {
								  return "<span>" + htmlDecode(dataItem.IssueDescription) + "</span>";
								}
						
						 },
						{		field:'Delete',
								title: '.',
									headerTemplate:'<label style=" color:#f3f3f4 ;" class=""></label>',
								filterable: false,
								width: 35,
								template:'<span class="pointer" style="float: center;" title="Click to delete"><span class="k-icon k-i-trash	k-i-delete"></span></span>'
								
							},
						/*
						{ field: "IssueResolution",width:200,title:'Issue Resolution',
							template: function(dataItem) {
								  return "<span>" + htmlDecode(dataItem.IssueResolution) + "</span>";
								}
						 },
						
						{ field: "IssueOwner",width:150,title:'Issue Owner',
							template: function(dataItem) {
								  var values = '';
								  if(dataItem.IssueOwnerId != null){
									  values = "<span>" + dataItem.IssueOwner.Title + "</span>";
								  }								  
								  return values;
								}
						 },
						{ field: "IssueDiscussion",width:200,title:'Issue Discussion',
							template: function(dataItem) {
								  return "<span>" + htmlDecode(dataItem.IssueDiscussion) + "</span>";
								}
						 },
						{ field: "IssueDescription",width:200,title:'Issue Description',
							template: function(dataItem) {
								  return "<span>" + htmlDecode(dataItem.IssueDescription) + "</span>";
								}
						
						 },
						
						{ field: "IncludeonStatusReports",width:220,title:'Include on Status Reports', filterable: {
							multi: true,
							search: true
						},},
						
					
					//	{ field: "IdentifiedBy" ,width:100,title:'Issues Title',},
						{ field: "TaskDueDateC" ,width:150,title:'Task Due Date',},
						{ field: "DateResolvedC",width:160,title:'Date Resolved', },
						{ field: "DateIdentifiedC",width:160,title:'Date Identified', },
						{ field: "DateDueC" ,width:120,title:'Date Due',},
						{ field: "DateAssignedC" ,width:150,title:'Date Assigned',},
						{ field: "Barriers" ,width:200,title:'Barriers Description',
							template: function(dataItem) {
								  return "<span>" + htmlDecode(dataItem.Barriers) + "</span>";
								}
						},
						{ field: "BarriersAssignedTo" ,width:180,title:'Barriers Assigned To',
							template: function(dataItem) {
								  var values = '';
								  if(dataItem.BarriersAssignedToId != null){
									  values = "<span>" + dataItem.BarriersAssignedTo.Title + "</span>";
								  }								  
								  return values;
								}
						}*/
					  ],
					  
					});
					$('#Issuesgrid').width($(window).width()-270);
					if(proLen == 0){
							var grid = $("#Issuesgrid").data("kendoGrid");
							grid.hideColumn(9);
							//grid.hideColumn(0);
						}

						   var grid = $("#Issuesgrid").data("kendoGrid");
								var exportFlag = false;
								grid.bind("excelExport", function (e) {
									if (!exportFlag) {
										//alert(1);
										e.sender.hideColumn(0);
										e.sender.hideColumn(9);
										e.preventDefault();
										exportFlag = true;
										setTimeout(function () {
											e.sender.saveAsExcel();
										});
									} else {
										//alert(2);
										e.sender.showColumn(0);
										e.sender.showColumn(9);
										exportFlag = false;
									}
								});
		
	}

	$scope.DeleteItem = function(data){
				var Chktrue = confirm("Are you sure you want to delete this entry?");
				if(Chktrue){
					PService.DeleteById('Collaboration: Issues', data.ID).then(function (response) {
						$scope.ShowIssues();
					//location.href = location.href.replace('#!','&#!');
					//	window.location.reload();
					});
				}

		}
	$scope.EditIssues= function(){
		 $scope.ViewMode = false;		 
	}
	
	$scope.to_trusted = function (html_code) {
			return $sce.trustAsHtml(html_code);
		}
	$scope.AddNewItemWindow = function () {
		$scope.ischkIssuesAlert = false;
		var valuefil = 1
		//var IssueStatusDefault =null;
		if (location.hostname == 'projectmadeeasy.sharepoint.com') {
			var url = SpURL + "/_api/web/lists/getByTitle('Collaboration: Lookups')/items?$top=4998&$select=*&$filter=Default eq '" + valuefil + "'&$orderby=ID desc";

} else {
			var url = "Lookups.json";
		}
			PService.GetAllItems('Collaboration: Lookups', url).then(function (response) {			
				$scope.getDefaultValueLookup = [];
			//	console.log(response.d.results)
				$scope.IssueStatusDefault = []
				$scope.IssuesISRDefault = []
				$scope.IssuesCategoryDefault = []
				$scope.IssuePriorityDefault = []
				angular.forEach(response.d.results, function (item, index) {
					$scope.getDefaultValueLookup.push(item)
					if(item.Select_x0020_Title == 'Issue Status'){
						$scope.IssueStatusDefault.push(item.Title);
					}
					if(item.Select_x0020_Title == 'Include on Status Report'){
						$scope.IssuesISRDefault.push(item.Title);
					}
					if(item.Select_x0020_Title == 'Category'){
						$scope.IssuesCategoryDefault.push(item.Title);
					}
					if(item.Select_x0020_Title == 'Priority'){
						$scope.IssuePriorityDefault.push(item.Title);
					}
				});
			 $scope.ViewMode = false;	
			$scope.Item = {
					ID: null,
					BarriersDescription:'',
					IdentifiedBy: null,
					IncludeonStatusReports: $scope.IssuesISRDefault.length != 0 ?$scope.IssuesISRDefault[0]:null,
					IssueDescription:'',
					IssueDiscussion:'',
					IssueResolution:'',
					BarriersAssignedTo: null,
					IssueAssignedTo: null,
					IssuePriority: $scope.IssuePriorityDefault.length != 0 ?$scope.IssuePriorityDefault[0]:null,
					IssueStatus:$scope.IssueStatusDefault.length != 0 ?$scope.IssueStatusDefault[0]:null,
					IssueCategory: $scope.IssuesCategoryDefault.length != 0 ?$scope.IssuesCategoryDefault[0]:null,
					IssueOwner: null,
					Title: null,
					DateAssigned: null,
					DateDue: null,
					DateIdentified: null,
					DateResolved: null,
					TaskDueDate: null,
			 }
			 $('.btn').attr('disabled', false);
			 $scope.filesdata = []
				$('#file_input').val('')
			var dialogKeyWindow = $("#KWindowIssues").data("kendoWindow");
			dialogKeyWindow.open();
			dialogKeyWindow.center();
			 }, function (error) {                   
				console.error('Error: ' + error.result);
			});
		}

		$scope.EditIssueItemView = function (data,ItemView) {
			$scope.ischkIssuesAlert = false;
			 $scope.ViewMode = false;	
			if(ItemView == 'Title'){
			$scope.ViewMode = true;	
			}	
			$scope.Item = {
					ID: data.ID,
					BarriersDescription: data.BarriersDescription,
					IdentifiedBy: data.IdentifiedBy,
					IncludeonStatusReports:data.IncludeonStatusReports,// == false ? 'No':'Yes',
					IssueDescription: data.IssueDescription,
					IssueDiscussion: data.IssueDiscussion,
					IssueResolution: data.IssueResolution,
					BarriersAssignedTo: data.BarriersAssignedTo,
					IssueAssignedTo: data.IssueAssignedTo,
					IssuePriority: data.IssuePriority,
					IssueStatus: data.IssueStatus,
					IssueCategory: data.IssueCategory,
					IssueOwner: data.IssueOwner,
					Title: data.Title,
					DateAssigned: data.DateAssigned,
					DateDue: data.DateDue,
					DateIdentified: data.DateIdentified,
					DateResolved: data.DateResolved,
					TaskDueDate: data.TaskDueDate,
					Attachment:data.AttachmentFiles,	
			 }
			 $('.btn').attr('disabled', false);
			 $scope.filesdata = []
				$('#file_input').val('')
			var dialogKeyWindow = $("#KWindowIssues").data("kendoWindow");
			dialogKeyWindow.open();
			dialogKeyWindow.center();
		}

		$scope.IsuesremoveFileFromList = function(item, file, index){
				
			var  ItemId= item.ID;
			var FileTitle = file.FileName
			var Chktrue = confirm("Are you sure you want to delete this attachment?");
				if(Chktrue){
					bSvc.DeleteAttachment(ItemId,FileTitle,'Issues').then(function (response) {						
						$scope.Item.Attachment.results.splice(index, 1);
					});
				}
			
		}

		$scope.SaveIssues = function(){

			

				var ID =$scope.Item.ID; 
				var	Title =$scope.Item.Title;
				var	BarriersDescription =$scope.Item.BarriersDescription;
				var	IdentifiedBy =$scope.Item.IdentifiedBy;
				var	IncludeonStatusReports =$scope.Item.IncludeonStatusReports;
				var	IssueDescription =$scope.Item.IssueDescription;
				var	IssueDiscussion =$scope.Item.IssueDiscussion;
				var	IssueResolution =$scope.Item.IssueResolution;
				var	BarriersAssignedTo =$scope.Item.BarriersAssignedTo;
				var	IssueAssignedTo =$scope.Item.IssueAssignedTo;
				var	IssuePriority =$scope.Item.IssuePriority;
				var	IssueStatus =$scope.Item.IssueStatus;
				var	IssueCategory =$scope.Item.IssueCategory;
				var	IssueOwner =$scope.Item.IssueOwner;				
				var	DateAssigned =$scope.Item.DateAssigned;
				var	DateDue =$scope.Item.DateDue;
				var	DateIdentified =$scope.Item.DateIdentified;
				var	DateResolved =$scope.Item.DateResolved;
				var	TaskDueDate =$scope.Item.TaskDueDate;
				$scope.ischkIssuesAlert = false;
				if(Title == null || Title == ''){
						$('.btn').attr('disabled', false);
						$scope.ischkIssuesAlert = true;
					return;
				}
				$scope.fileArray = [];
				$("#attachFilesHolder input:file").each(function () {
					if ($(this)[0].files[0]) {
						$scope.fileArray.push({
							"Attachment": $(this)[0].files[0]
						});
					}
				});
				var ProjectId =projId;

				var data = {
					__metadata: {
						'type': 'SP.Data.CollaborationIssuesListItem'
					},
					Title: Title,	
					IssueDescription:IssueDescription,
					IssueDiscussion:IssueDiscussion,
					IssueResolution:IssueResolution,
					BarriersAssignedToId:  BarriersAssignedTo != null ? BarriersAssignedTo.Id :null,					
					IssuePriority:IssuePriority,
					IssueStatus:IssueStatus,
					IssueCategory:IssueCategory,
					IssueOwnerId:  IssueOwner != null ? IssueOwner.Id :null,
					DateAssigned:DateAssigned,
					DateDue:DateDue,
					DateIdentified:DateIdentified,
					DateResolved:DateResolved,
					TaskDueDate	:TaskDueDate,	
					IdentifiedBy:IdentifiedBy,			
					IssueAssignedToId:  IssueAssignedTo != null ? IssueAssignedTo.Id :null,
					IncludeonStatusReports:IncludeonStatusReports,// != null ? (IncludeonStatusReports != "No" ? true :false) :false,
					Barriers: BarriersDescription,
					ProjectUID:ProjectId,
					
				};

					if(ID == null){
						
						PService.AddNew(data, 'Collaboration: Issues').then(function (response) {

							var id = response.d.Id;
				var promise = $q.all({});
					if ($scope.fileArray.length != 0) {
						promise = promise.then(function () {
								return bSvc.GetAttachmentFileBuffer($scope.fileArray[0].Attachment);
							}).then(function (filebuffer) {
								return bSvc.getFileBuffer(filebuffer, id, 'Collaboration: Issues', $scope.fileArray[0].Attachment);
							});				
						promise.then(function (responseAtch) {
							$scope.filesdata = [];
							$('#file_input').val('')
							$scope.ShowIssues()
							var dialogKeyWindow = $("#KWindowIssues").data("kendoWindow");
									dialogKeyWindow.close();
									dialogKeyWindow.center();
							//	location.href = location.href.replace('#!','&#!');
									//window.location.reload();
									 
									$('.btn').attr('disabled', false);
							}, function (error) {
								console.error('Error: ' + error.result);
								$('.btn').attr('disabled', false);
							});

							} else {
								$scope.ShowIssues()
								var dialogKeyWindow = $("#KWindowIssues").data("kendoWindow");
									dialogKeyWindow.close();
									dialogKeyWindow.center();
								//	location.href = location.href.replace('#!','&#!');
								//	window.location.reload();
									
									$('.btn').attr('disabled', false);
							}

							}, function (error) {    
									$('.btn').attr('disabled', false);               
								console.error('Error:SaveIssues ' + error.result);
							});		
						}

					if(ID != null){
						PService.Update(data, 'Collaboration: Issues',ID).then(function (response) {

						var promise = $q.all({});
					if ($scope.fileArray.length != 0) {

						promise = promise.then(function () {
								return bSvc.GetAttachmentFileBuffer($scope.fileArray[0].Attachment);
							}).then(function (filebuffer) {
								return bSvc.getFileBuffer(filebuffer, ID, 'Collaboration: Issues', $scope.fileArray[0].Attachment);
							});
						promise.then(function (responseAtch) {
							$scope.filesdata = [];
											$('#file_input').val('')
										$scope.ShowIssues()
											var dialogKeyWindow = $("#KWindowIssues").data("kendoWindow");
												dialogKeyWindow.close();
												dialogKeyWindow.center();
												//location.href = location.href.replace('#!','&#!');
												//window.location.reload();
													$('.btn').attr('disabled', false);
											}, function (error) {
										console.error('Error: ' + error.result);
										$('.btn').attr('disabled', false);
									});

								} else {
									$scope.ShowIssues()
									var dialogKeyWindow = $("#KWindowIssues").data("kendoWindow");
												dialogKeyWindow.close();
												dialogKeyWindow.center();
											//	location.href = location.href.replace('#!','&#!');
												//window.location.reload();
													$('.btn').attr('disabled', false);
								}

						}, function (error) {    
								$('.btn').attr('disabled', false);               
							console.error('Error:SaveIssues ' + error.result);
						});	

					}	
		}

		$scope.CloseIssuesForm = function(){
		    	var Chktrue = confirm("Are you sure you want to close this window?");
				if(Chktrue){
					$scope.ShowIssues()
					var dialogKeyWindow = $("#KWindowIssues").data("kendoWindow");
					dialogKeyWindow.close();
					dialogKeyWindow.center();
				}
		}
	
	
	$scope.ConvertDateToMMDDYYYY = function (dDate) {
			
			if (dDate != undefined) {
				if (dDate != null) {
					
					var months = new Array(12);
						months[0] = "null";
						months[1] = "Jan";
						months[2] = "Feb";
						months[3] = "Mar";
						months[4] = "Apr";
						months[5] = "May";
						months[6] = "Jun";
						months[7] = "Jul";
						months[8] = "Aug";
						months[9] = "Sep";
						months[10] = "Oct";
						months[11] = "Nov";
						months[12] = "Dec";
					var SplitdDate = dDate.split('T')[0]
					var year = SplitdDate.split("-")[0]
					var Month;
					if(SplitdDate.split("-")[1] <10){						
						Month =SplitdDate.split("-")[1].slice(1, 2);
					}else{
					     Month= SplitdDate.split("-")[1]
					  }
						Month = months[Month]
					var day = SplitdDate.split("-")[2]
					
					var dateformate = day+"-"+Month+"-"+year
					
					return dateformate;//new Date(dDate).format("dd-MMM-yyyy");
				}
			}
		}
		
}]);



KendoPApp.controller('ProjectActionController', ['$scope', "$http", "$q", "$location","$sce", 'baseSvc', 'ProjectkFactoryService',
function ($scope, $http, $q, $location, $sce, bSvc, PService) {
	$scope.init = function(){		
		
		
		if(window.location.hash === "#!/Action"){				
				$location.path('/Action');
				$scope.ShowAction();
			 }
			 

		
	}
	
	$scope.ShowAction = function(){		
		$('ul.nav li.active').removeClass('active');
		$("a[name^=Action]").closest('li').addClass('active').hover();
		var UID = projId;
		if (location.hostname == 'projectmadeeasy.sharepoint.com') {
			var url = SpURL + "/_api/web/lists/getByTitle('Collaboration: Actions')/items?$top=4998&$select=*,AssignedTo/Name,AssignedTo/Title,AssignedTo/Id,ResponsibleOwner/Name,ResponsibleOwner/Title,ResponsibleOwner/Id,Attachments,AttachmentFiles&$expand=AttachmentFiles,AssignedTo/Id,ResponsibleOwner/Id&$filter=ProjectUID eq '" + UID + "'&$orderby=ID desc";
		} else {
			var url = "Action.json";
		}
			
			PService.GetAllItems('Collaboration: Actions', url).then(function (response) {			
				$scope.getActionRes = [];
				angular.forEach(response.d.results, function (item, index) {
					$scope.getActionRes.push(item)
					$scope.getActionRes[index].LongDescription = $("<div>").html(item.LongDescription).html();
					$scope.getActionRes[index].ItemResolution = $("<div>").html(item.ItemResolution).html();
					$scope.getActionRes[index].DateClosedC = (item.DateClosed != null) ? $scope.ConvertDateToMMDDYYYY(item.DateClosed) : '';
					$scope.getActionRes[index].DateDueC = (item.DateDue != null) ? $scope.ConvertDateToMMDDYYYY(item.DateDue) : '';
					$scope.getActionRes[index].Delete  = null;
					$scope.getActionRes[index].Edit  = null;
				});
				$('#Actiongrid').empty();
				$scope.LoadKendoGridAction($scope.getActionRes);
			 }, function (error) {                   
				console.error('Error: ' + error.result);
				$scope.LoadKendoGridRisdk();
			}); 

	}

	$scope.LoadKendoGridAction = function (ResData) {

		
			$("#Actiongrid").kendoGrid({
						toolbar: ["excel"],
						excel: {
							fileName: "Action.xlsx"
						},
					  dataSource: {
							data:ResData,
							sort:[ {
							field: "ItemStatus",
								dir: "asc"
							},{
							field: "ItemPriority",
								dir: "asc"
							},]
						},
					   height: 360,
						scrollable: {
                            virtual: true
                        },
						sortable: true,

							
							filterable: {
									extra: true,
									operators: { 
										string: {   
											contains: "Contains",
											eq: "Is Equal To",
											neq: "Is not equal to",
											startswith: "Starts With",									
										},
									
									}
								},
							resizable: true,
							selectable: "cell",
							change: function (e) {
								var cell = this.select();
								var cellIndex = cell[0].cellIndex;
								var column = this.columns[cellIndex];
								var dataItem = this.dataItem(cell.closest("tr"));
								
								
								if (column.field == "Edit") {									
									$scope.EditActionItemView(dataItem, column.title);
								}
								else if (column.title == "Title") {									
									$scope.EditActionItemView(dataItem, column.title);
								}	
								else if (column.field == "Delete") {											
											$scope.DeleteItem(dataItem);
									}
							},
				
				
				columns: [
					 { 
						     field: "Edit",
							 filterable:false,
							 title:'.',
							 	headerTemplate:'<label style=" color:#f3f3f4 ;" class=""></label>',
							  template: "<a id='btnEdit' class='btnEdit' title='Click to View' ><span class='pointer' style='float: right; cursor: pointer;' title='Click to Edit'><span class='k-icon k-i-edit'></span></span></a>",							
							 width: 30							 
							 },
					{ field: "ID",width:60,title:'ID',filterable:false,
						 },
						{ field: "Title",width:200 ,title:'Title',
							template: function(dataItem) {
								  var values = '';
									//values = "<span>" + dataItem.Title + "<a id='btnView' class='btnView' style='float: right; ' title='Click to View' ><img border='0'  alt='edit' src='/_layouts/15/images/edititem.gif?rev=47'></a>";
								values = "<span class='textdecoration' style='color: #337ab7;  cursor: pointer;'>" + dataItem.Title + "</span>";				
															  
								  return values;
								}
						
						
						},/*{ 
							 title:'Edit',
							  template: "<a id='btnEdit' class='btnEdit' title='Click to View' ><span class='pointer' style='float: right;' title='Click to Edit'><span class='k-icon k-i-edit'></span></span></a>",
							
							 width: 50
							 
							 },*/
						 
						 	{ field: "ItemPriority",width:160,title:'Item Priority'
								,filterable: {
									multi: true,
									search: true
								},
						 },
						 { field: "DateDueC" ,width:120,title:'Date Due',},
						 	{ field: "AssignedTo.Title",title:'Assigned To',filterable: {
							multi: true,
							search: true
						},
							template: function(dataItem) {
								  var values = '';
								  if(dataItem.AssignedToId != null){
									  values = "<span>" + dataItem.AssignedTo.Title + "</span>";
								  }								  
								  return values;
								}
						 },
						 { field: "ResponsibleOwner.Title" ,title:'Responsible Owner',filterable: {
							multi: true,
							search: true
						},
							template: function(dataItem) {
								  var values = '';
								  if(dataItem.ResponsibleOwnerId != null){
									  values = "<span>" + dataItem.ResponsibleOwner.Title + "</span>";
								  }								  
								  return values;
								}
						},
						{ field: "ItemStatus" ,width:140,title:'Item Status',filterable: {
							multi: true,
							search: true
						},},{	field:'Delete',
								title: '.',
									headerTemplate:'<label style=" color:#f3f3f4 ;" class=""></label>',
								filterable: false,
								width: 35,
								template:'<span class="pointer" style="float: center;" title="Click to delete"><span class="k-icon k-i-trash	k-i-delete"></span></span>'
								
							},/*
						
						{ field: "ItemResolution",width:200,title:'Action Resolution',
							template: function(dataItem) {
								  return "<span>" + htmlDecode(dataItem.ItemResolution) + "</span>";
								}
						
						 },
					
					
					
					
						
						{ field: "DateClosedC" ,width:150,title:'Date Closed',},
						{ field: "LongDescription" ,width:200,title:'Long Description',
							template: function(dataItem) {
								  return "<span>" + htmlDecode(dataItem.LongDescription) + "</span>";
								}
						}, */
						
					  ],
					  
					});
					$('#Actiongrid').width($(window).width()-270);
					if(proLen == 0){
							var grid = $("#Actiongrid").data("kendoGrid");
							grid.hideColumn(8);
							//grid.hideColumn(0);
						}
						var grid = $("#Actiongrid").data("kendoGrid");
								var exportFlag = false;
								grid.bind("excelExport", function (e) {
									if (!exportFlag) {
										//alert(1);
										e.sender.hideColumn(0);
										e.sender.hideColumn(8);
										e.preventDefault();
										exportFlag = true;
										setTimeout(function () {
											e.sender.saveAsExcel();
										});
									} else {
										//alert(2);
										e.sender.showColumn(0);
										e.sender.showColumn(8);
										exportFlag = false;
									}
								});

	}
	$scope.DeleteItem = function(data){
				var Chktrue = confirm("Are you sure you want to delete this entry?");
				if(Chktrue){
					PService.DeleteById('Collaboration: Actions', data.ID).then(function (response) {
						$scope.ShowAction();
						//location.href = location.href.replace('#!','&#!');
						//window.location.reload();
					});
				}

		}
		$scope.EditAction = function(){
		 $scope.ViewMode = false;		 
	}
	
	$scope.to_trusted = function (html_code) {
			return $sce.trustAsHtml(html_code);
		}

	$scope.AddNewItemWindow = function () {
		$scope.ischkActionAlert = false;

		var valuefil = 1
		//var IssueStatusDefault =null;
		if (location.hostname == 'projectmadeeasy.sharepoint.com') {
			var url = SpURL + "/_api/web/lists/getByTitle('Collaboration: Lookups')/items?$top=4998&$select=*&$filter=Default eq '" + valuefil + "'&$orderby=ID desc";
		} else {
			var url = "Lookups.json";
		}
			PService.GetAllItems('Collaboration: Lookups', url).then(function (response) {			
				$scope.getDefaultValueLookup = [];
			
				$scope.ActionPriorityDefault = []
				$scope.ActionItemStatusDefault = [];
				angular.forEach(response.d.results, function (item, index) {
					$scope.getDefaultValueLookup.push(item)					
					if(item.Select_x0020_Title == 'Priority'){
						$scope.ActionPriorityDefault.push(item.Title);
					}					
					if(item.Select_x0020_Title == 'Item Status'){
						$scope.ActionItemStatusDefault.push(item.Title);
					}

				});
		 $scope.ViewMode = false;
			$scope.Item = {
					ID: null,
					LongDescription:'',
					ItemResolution: '',
					AssignedTo: null,
					DateClosed: null,
					DateDue: null,
					ItemPriority: $scope.ActionPriorityDefault.length != 0 ?$scope.ActionPriorityDefault[0]:null,
					ItemStatus: $scope.ActionItemStatusDefault.length != 0 ?$scope.ActionItemStatusDefault[0]:null,
					ResponsibleOwner: null,
					Title: null,
			 }
			 $('.btn').attr('disabled', false);
			 $scope.filesdata = []
				$('#file_input').val('')
			var dialogKeyWindow = $("#KWindowAction").data("kendoWindow");
			dialogKeyWindow.open();
			dialogKeyWindow.center();

			}, function (error) {                   
				console.error('Error: ' + error.result);
			});
		}

		$scope.EditActionItemView = function(data,ItemView){
			$scope.ischkActionAlert = false;
			  $scope.ViewMode = false;	
			if(ItemView == 'Title'){
			$scope.ViewMode = true;	
			}
			$scope.Item = {
					ID: data.ID,
					LongDescription:data.LongDescription,
					ItemResolution: data.ItemResolution,
					AssignedTo: data.AssignedTo,
					DateClosed: data.DateClosed,
					DateDue: data.DateDue,
					ItemPriority: data.ItemPriority,
					ItemStatus: data.ItemStatus,
					ResponsibleOwner: data.ResponsibleOwner,
					Title: data.Title,
					Attachment:data.AttachmentFiles,	
			 }
			 $('.btn').attr('disabled', false);
			 $scope.filesdata = []
				$('#file_input').val('')
			var dialogKeyWindow = $("#KWindowAction").data("kendoWindow");
			dialogKeyWindow.open();
			dialogKeyWindow.center();
		}
		$scope.ActionremoveFileFromList = function(item, file, index){
				
			var  ItemId= item.ID;
			var FileTitle = file.FileName
			var Chktrue = confirm("Are you sure you want to delete this attachment?");
				if(Chktrue){
					bSvc.DeleteAttachment(ItemId,FileTitle,'Actions').then(function (response) {						
						$scope.Item.Attachment.results.splice(index, 1);
					});
				}
			
		}

		$scope.SaveActions = function(){
			$('.btn').attr('disabled', true);
				var	ID=$scope.Item.ID;
				var	LongDescription=$scope.Item.LongDescription;
				var	ItemResolution=$scope.Item.ItemResolution;
				var	AssignedTo=$scope.Item.AssignedTo;
				var	DateClosed=$scope.Item.DateClosed;
				var	DateDue=$scope.Item.DateDue;
				var	ItemPriority=$scope.Item.ItemPriority;
				var	ItemStatus=$scope.Item.ItemStatus;
				var	ResponsibleOwner=$scope.Item.ResponsibleOwner;
				var	Title=$scope.Item.Title;
				$scope.ischkActionAlert = false;
				if(Title == null || Title == '' || ItemStatus == null ||ResponsibleOwner == null){
						$('.btn').attr('disabled', false);
						$scope.ischkActionAlert = true;
					return;
				}
				$scope.fileArray = [];
				$("#attachFilesHolder input:file").each(function () {
					if ($(this)[0].files[0]) {
						$scope.fileArray.push({
							"Attachment": $(this)[0].files[0]
						});
					}
				});
				var ProjectId =projId;

				var data = {
					__metadata: {
						'type': 'SP.Data.CollaborationActionsListItem'
					},
					Title: Title,	
					AssignedToId:  AssignedTo != null ? AssignedTo.Id :null,
					DateClosed:DateClosed,
					DateDue:DateDue,
					ItemPriority:ItemPriority,
					ItemResolution:ItemResolution,
					ItemStatus:ItemStatus,
					LongDescription:LongDescription,
					ProjectUID:ProjectId,
					ResponsibleOwnerId:  ResponsibleOwner != null ? ResponsibleOwner.Id :null,					
				};
				if(ID == null){
					PService.AddNew(data, 'Collaboration: Actions').then(function (response) {
							var id = response.d.Id;
				var promise = $q.all({});
					if ($scope.fileArray.length != 0) {
						promise = promise.then(function () {
								return bSvc.GetAttachmentFileBuffer($scope.fileArray[0].Attachment);
							}).then(function (filebuffer) {
								return bSvc.getFileBuffer(filebuffer, id, 'Collaboration: Actions', $scope.fileArray[0].Attachment);
							});					
						promise.then(function (responseAtch) {
											$scope.filesdata = [];
											$('#file_input').val('')
											$scope.ShowAction();
												var dialogKeyWindow = $("#KWindowAction").data("kendoWindow");
													dialogKeyWindow.close();
													dialogKeyWindow.center();
													//location.href = location.href.replace('#!','&#!');
													//window.location.reload();
													$('.btn').attr('disabled', false);
											
									
									}, function (error) {
										console.error('Error: ' + error.result);
										$('.btn').attr('disabled', false);
									});

								} else {
									$scope.ShowAction();
												var dialogKeyWindow = $("#KWindowAction").data("kendoWindow");
													dialogKeyWindow.close();
													dialogKeyWindow.center();
													//location.href = location.href.replace('#!','&#!');
													//window.location.reload();
													$('.btn').attr('disabled', false);
											}

							}, function (error) {    
									$('.btn').attr('disabled', false);               
								console.error('Error:SaveAction ' + error.result);
							});
				}
				if(ID != null){
						PService.Update(data, 'Collaboration: Actions',ID).then(function (response) {
						var promise = $q.all({});
								if ($scope.fileArray.length != 0) {

									promise = promise.then(function () {
											return bSvc.GetAttachmentFileBuffer($scope.fileArray[0].Attachment);
										}).then(function (filebuffer) {
											return bSvc.getFileBuffer(filebuffer, ID, 'Collaboration: Actions', $scope.fileArray[0].Attachment);
										});
									
									promise.then(function (responseAtch) {
										$scope.filesdata = [];
										$('#file_input').val('')
										$scope.ShowAction();
										var dialogKeyWindow = $("#KWindowAction").data("kendoWindow");
												dialogKeyWindow.close();
												dialogKeyWindow.center();
												//window.location.reload();
											//	location.href = location.href.replace('#!','&#!');
											//	window.location.reload();

													$('.btn').attr('disabled', false);
								
								}, function (error) {
									console.error('Error: ' + error.result);
									$('.btn').attr('disabled', false);
								});

							} 

							else{
								$scope.ShowAction();
							var dialogKeyWindow = $("#KWindowAction").data("kendoWindow");
								dialogKeyWindow.close();
								dialogKeyWindow.center();
								//window.location.reload();
								//location.href = location.href.replace('#!','&#!');
								// window.location.reload();

									$('.btn').attr('disabled', false);
							}

						}, function (error) {    
								$('.btn').attr('disabled', false);               
							console.error('Error:SaveAction ' + error.result);
						});	

					}
		}


		$scope.CloseActionForm = function(){
			var Chktrue = confirm("Are you sure you want to close this window?");
				if(Chktrue){
					$scope.ShowAction();
					var dialogKeyWindow = $("#KWindowAction").data("kendoWindow");
					dialogKeyWindow.close();
					dialogKeyWindow.center();
				}
		}
	
	$scope.ConvertDateToMMDDYYYY = function (dDate) {
			
			if (dDate != undefined) {
				if (dDate != null) {
					
					var months = new Array(12);
						months[0] = "null";
						months[1] = "Jan";
						months[2] = "Feb";
						months[3] = "Mar";
						months[4] = "Apr";
						months[5] = "May";
						months[6] = "Jun";
						months[7] = "Jul";
						months[8] = "Aug";
						months[9] = "Sep";
						months[10] = "Oct";
						months[11] = "Nov";
						months[12] = "Dec";
					var SplitdDate = dDate.split('T')[0]
					var year = SplitdDate.split("-")[0]
					var Month;
					if(SplitdDate.split("-")[1] <10){						
						Month =SplitdDate.split("-")[1].slice(1, 2);
					}else{
					     Month= SplitdDate.split("-")[1]
					  }
						Month = months[Month]
					var day = SplitdDate.split("-")[2]
					
					var dateformate = day+"-"+Month+"-"+year
					
					return dateformate;//new Date(dDate).format("dd-MMM-yyyy");
				}
			}
		}
	
		
}]);
KendoPApp.controller('ProjectDecisionsController', ['$scope', "$http", "$q", "$location","$sce", 'baseSvc', 'ProjectkFactoryService',
function ($scope, $http, $q, $location, $sce, bSvc, PService) {
	$scope.init = function(){		
		
		
		if(window.location.hash === "#!/Decisions"){				
				$location.path('/Decisions');
				$scope.ShowDecisions();
			 }
			 

		
	}
	
	$scope.ShowDecisions = function(){		
		$('ul.nav li.active').removeClass('active');
		$("a[name^=Decisions]").closest('li').addClass('active').hover();
			var UID = projId;
			if (location.hostname == 'projectmadeeasy.sharepoint.com') {
			var url = SpURL + "/_api/web/lists/getByTitle('Collaboration: Decisions')/items?$top=4998&$select=*,AssignedTo/Name,AssignedTo/Title,AssignedTo/Id,ResponsibleOwner/Name,ResponsibleOwner/Title,ResponsibleOwner/Id,Attachments,AttachmentFiles&$expand=AttachmentFiles,AssignedTo/Id,ResponsibleOwner/Id&$filter=ProjectUID eq '" + UID + "'&$orderby=ID desc";} else { var url = "Decisions.json"; }
			PService.GetAllItems('Collaboration: Decisions', url).then(function (response) {			
				$scope.getDecisionRes = [];
				angular.forEach(response.d.results, function (item, index) {
					$scope.getDecisionRes.push(item)
					$scope.getDecisionRes[index].LongDescription = $("<div>").html(item.LongDescription).html();
					$scope.getDecisionRes[index].DecisionResolution = $("<div>").html(item.DecisionResolution).html();
					$scope.getDecisionRes[index].DateClosedC = (item.DateClosed != null) ? $scope.ConvertDateToMMDDYYYY(item.DateClosed) : '';
					$scope.getDecisionRes[index].DateDueC = (item.DateDue != null) ? $scope.ConvertDateToMMDDYYYY(item.DateDue) : '';
					$scope.getDecisionRes[index].Delete  = null;
					$scope.getDecisionRes[index].Edit  = null;
				});
				$('#Decisionsgrid').empty();
				$scope.LoadKendoGridAction($scope.getDecisionRes);
			 }, function (error) {                   
				console.error('Error: ' + error.result);
			}); 

	}

	$scope.LoadKendoGridAction = function (ResData) {

		
			$("#Decisionsgrid").kendoGrid({
						toolbar: ["excel"],
						excel: {
							fileName: "Decisions.xlsx"
						},
					  dataSource: {
							data:ResData,
							sort:[ {
							field: "ItemStatus",
								dir: "asc"
							},{
							field: "ItemPriority",
								dir: "asc"
							},{
							field: "ID",
								dir: "asc"
							},]
						},
					   height: 360,
						scrollable: {
                            virtual: true
                        },
						sortable: true,

							
							filterable: {
									extra: true,
									operators: { 
										string: {   
											contains: "Contains",
											eq: "Is Equal To",
											neq: "Is not equal to",
											startswith: "Starts With",									
										},
									
									}
								},
							resizable: true,
							selectable: "cell",
							change: function (e) {
								var cell = this.select();
								var cellIndex = cell[0].cellIndex;
								var column = this.columns[cellIndex];
								var dataItem = this.dataItem(cell.closest("tr"));
								
								
								if (column.field == "Edit") {									
									$scope.EditDecistionItemView(dataItem, column.title);
								}
								else if (column.title == "Title") {									
									$scope.EditDecistionItemView(dataItem, column.title);
								}
								else if (column.field == "Delete") {											
											$scope.DeleteItem(dataItem);
									}
							},
				
				
				columns: [{ 
						     field: "Edit",
							 filterable:false,
							 title:'.',
							 	headerTemplate:'<label style=" color:#f3f3f4 ;" class=""></label>',
							  template: "<a id='btnEdit' class='btnEdit' title='Click to View' ><span class='pointer' style='float: right; cursor: pointer;' title='Click to Edit'><span class='k-icon k-i-edit'></span></span></a>",							
							 width: 30							 
							 },
					{ field: "ID",width:60,title:'ID',filterable:false,
						 },
						{ field: "Title",width:200 ,title:'Title',
							template: function(dataItem) {
								  var values = '';
							//	values = "<span>" + dataItem.Title + "<a id='btnView' class='btnView' style='float: right; ' title='Click to View' ><img border='0'  alt='edit' src='/_layouts/15/images/edititem.gif?rev=47'></a>";
 
 values = "<span class='textdecoration' style='color: #337ab7;  cursor: pointer;'>" + dataItem.Title + "</span>";
															  
								  return values;
								}
						
						
						 },
						/* { 
							 title:'Edit',
							  template: "<a id='btnEdit' class='btnEdit' title='Click to View' ><span class='pointer' style='float: right;' title='Click to Edit'><span class='k-icon k-i-edit'></span></span></a>",
							
							 width: 50
							 
						 },*/
						 { field: "DateDueC" ,width:130,title:'Date Due',},
						 { field: "DecisionAuthority" ,width:170,title:'Decision Authority',},/*

						 
						 
						{ field: "AssignedTo.Title",width:180,title:'Assigned To',filterable: {
									multi: true,
									search: true
								},
							template: function(dataItem) {
								  var values = '';
								  if(dataItem.AssignedToId != null){
									  values = "<span>" + dataItem.AssignedTo.Title + "</span>";
								  }								  
								  return values;
								}
						 }, */
						 { field: "ItemPriority",width:160,title:'Item Priority'
								,filterable: {
									multi: true,
									search: true
								},
						 },
						{ field: "ItemStatus" ,width:180,title:'Item Status',filterable: {
							multi: true,
							search: true
						},},
						{ field: "ResponsibleOwner.Title" ,title:'Responsible Owner',filterable: {
							multi: true,
							search: true
						},
							template: function(dataItem) {
								  var values = '';
								  if(dataItem.ResponsibleOwnerId != null){
									  values = "<span>" + dataItem.ResponsibleOwner.Title + "</span>";
								  }								  
								  return values;
								}
						},{
								field:'Delete',
								title: '.',
									headerTemplate:'<label style=" color:#f3f3f4 ;" class=""></label>',
								filterable: false,
								width: 35,
								template:'<span class="pointer" style="float: center;" title="Click to delete"><span class="k-icon k-i-trash	k-i-delete"></span></span>'
								
							},/*
						
						{ field: "DecisionResolution",width:200,title:'Decision Resolution',
							template: function(dataItem) {
								  return "<span>" + htmlDecode(dataItem.DecisionResolution) + "</span>";
								}
						
						 },
					
					
						
						 {field: "DecisionAuthority" ,width:200,title:'Decision Authority',},
						
						{ field: "DateClosedC" ,width:150,title:'Date Closed',},
						{ field: "LongDescription" ,width:200,title:'Long Description',
							template: function(dataItem) {
								  return "<span>" + htmlDecode(dataItem.LongDescription) + "</span>";
								}
						}, */
						
					  ],
					  
					});
					$('#Decisionsgrid').width($(window).width()-270);
					if(proLen == 0){
							var grid = $("#Decisionsgrid").data("kendoGrid");
							grid.hideColumn(8);
							//grid.hideColumn(0);
						}
						var grid = $("#Decisionsgrid").data("kendoGrid");
								var exportFlag = false;
								grid.bind("excelExport", function (e) {
									if (!exportFlag) {
										//alert(1);
										e.sender.hideColumn(0);
										e.sender.hideColumn(8);
										e.preventDefault();
										exportFlag = true;
										setTimeout(function () {
											e.sender.saveAsExcel();
										});
									} else {
										//alert(2);
										e.sender.showColumn(0);
										e.sender.showColumn(8);
										exportFlag = false;
									}
								});

	}

	$scope.DeleteItem = function(data){
				var Chktrue = confirm("Are you sure you want to delete this entry?");
				if(Chktrue){
					PService.DeleteById('Collaboration: Decisions', data.ID).then(function (response) {
						$scope.ShowDecisions();
						//location.href = location.href.replace('#!','&#!');
						//window.location.reload();
					});
				}

		}
		$scope.EditDecisions = function(){
		 $scope.ViewMode = false;		 
	}
	
	$scope.to_trusted = function (html_code) {
			return $sce.trustAsHtml(html_code);
		}
	$scope.AddNewItemWindow = function () {
		$scope.ischkDecisionsAlert = false;
		var valuefil = 1
		//var IssueStatusDefault =null;
		if (location.hostname == 'projectmadeeasy.sharepoint.com') {
			var url = SpURL + "/_api/web/lists/getByTitle('Collaboration: Lookups')/items?$top=4998&$select=*&$filter=Default eq '" + valuefil + "'&$orderby=ID desc";
		} else {
			var url = "Lookups.json";
		}
			PService.GetAllItems('Collaboration: Lookups', url).then(function (response) {			
				$scope.getDefaultValueLookup = [];
			
				$scope.DecisionsPriorityDefault = []
				$scope.DecisionsItemStatusDefault = [];
				angular.forEach(response.d.results, function (item, index) {
					$scope.getDefaultValueLookup.push(item)					
					if(item.Select_x0020_Title == 'Priority'){
						$scope.DecisionsPriorityDefault.push(item.Title);
					}					
					if(item.Select_x0020_Title == 'Item Status'){
						$scope.DecisionsItemStatusDefault.push(item.Title);
					}

				});
		 $scope.ViewMode = false;
			$scope.Item = {
					ID: null,
					LongDescription:'',
					ItemResolution: '',
					AssignedTo: null,
					DateClosed: null,
					DateDue: null,
					ItemPriority: $scope.DecisionsPriorityDefault.length != 0 ?$scope.DecisionsPriorityDefault[0]:null,
					ItemStatus: $scope.DecisionsItemStatusDefault.length != 0 ?$scope.DecisionsItemStatusDefault[0]:null,
					ResponsibleOwner: null,
					Title: null,
					DecisionAuthority:null,

			 }
			 $('.btn').attr('disabled', false);
			 $scope.filesdata = []
				$('#file_input').val('')
			var dialogKeyWindow = $("#KWindowDecisions").data("kendoWindow");
			dialogKeyWindow.open();
			dialogKeyWindow.center();
			}, function (error) {                   
				console.error('Error: ' + error.result);
			});
		}

	$scope.EditDecistionItemView = function(data,ItemView){
			$scope.ischkDecisionsAlert = false;
			 $scope.ViewMode = false;	
			if(ItemView == 'Title'){
			$scope.ViewMode = true;	
			}
			$scope.Item = {
					ID: data.ID,
					LongDescription:data.LongDescription,
					ItemResolution: data.DecisionResolution,
					AssignedTo: data.AssignedTo,
					DateClosed: data.DateClosed,
					DateDue: data.DateDue,
					ItemPriority: data.ItemPriority,
					ItemStatus: data.ItemStatus,
					ResponsibleOwner: data.ResponsibleOwner,
					Title: data.Title,
					DecisionAuthority:data.DecisionAuthority,
					Attachment:data.AttachmentFiles,
			 }
			 $('.btn').attr('disabled', false);
			  
			  $scope.filesdata = []
				$('#file_input').val('')
			var dialogKeyWindow = $("#KWindowDecisions").data("kendoWindow");
			dialogKeyWindow.open();
			dialogKeyWindow.center();
		}

	$scope.CloseDecisionsForm = function(){
		var Chktrue = confirm("Are you sure you want to close this window?");
		if(Chktrue){
				var dialogKeyWindow = $("#KWindowDecisions").data("kendoWindow");
				dialogKeyWindow.close();
				dialogKeyWindow.center();
			}
		}

		$scope.DecisionremoveFileFromList = function(item, file, index){
				
			var  ItemId= item.ID;
			var FileTitle = file.FileName
			var Chktrue = confirm("Are you sure you want to delete this attachment?");
				if(Chktrue){
					bSvc.DeleteAttachment(ItemId,FileTitle,'Decisions').then(function (response) {						
						$scope.Item.Attachment.results.splice(index, 1);
					});
				}
			
		}

		$scope.SaveDecisions = function(){
			$('.btn').attr('disabled', true);
				var	ID=$scope.Item.ID;
				var	LongDescription=$scope.Item.LongDescription;
				var	ItemResolution=$scope.Item.ItemResolution;
				var	AssignedTo=$scope.Item.AssignedTo;
				var	DateClosed=$scope.Item.DateClosed;
				var	DateDue=$scope.Item.DateDue;
				var	ItemPriority=$scope.Item.ItemPriority;
				var	ItemStatus=$scope.Item.ItemStatus;
				var	ResponsibleOwner=$scope.Item.ResponsibleOwner;
				var	Title=$scope.Item.Title;
				var DecisionAuthority = $scope.Item.DecisionAuthority;
				$scope.ischkDecisionsAlert = false;
				if(Title == null || Title == '' || ItemStatus == null || ResponsibleOwner == null){
						$('.btn').attr('disabled', false);
						$scope.ischkDecisionsAlert = true;
					return;
				}

				$scope.fileArray = [];
				$("#attachFilesHolder input:file").each(function () {
					if ($(this)[0].files[0]) {
						$scope.fileArray.push({
							"Attachment": $(this)[0].files[0]
						});
					}
				});
				var ProjectId =projId;

				var data = {
					__metadata: {
						'type': 'SP.Data.CollaborationDecisionsListItem'
					},
					Title: Title,	
					AssignedToId:  AssignedTo != null ? AssignedTo.Id :null,
					DateClosed:DateClosed,
					DateDue:DateDue,
					ItemPriority:ItemPriority,
					DecisionResolution:ItemResolution,
					ItemStatus:ItemStatus,
					LongDescription:LongDescription,
					ProjectUID:ProjectId,
					DecisionAuthority:DecisionAuthority,
					ResponsibleOwnerId:  ResponsibleOwner != null ? ResponsibleOwner.Id :null,					
				};
				if(ID == null){
					PService.AddNew(data, 'Collaboration: Decisions').then(function (response) {


							var id = response.d.Id;
							var promise = $q.all({});
								if ($scope.fileArray.length != 0) {
									promise = promise.then(function () {
											return bSvc.GetAttachmentFileBuffer($scope.fileArray[0].Attachment);
										}).then(function (filebuffer) {
											return bSvc.getFileBuffer(filebuffer, id, 'Collaboration: Decisions', $scope.fileArray[0].Attachment);
										});					
									promise.then(function (responseAtch) {
										$scope.filesdata = [];
										$('#file_input').val('')
										$scope.ShowDecisions();
										var dialogKeyWindow = $("#KWindowDecisions").data("kendoWindow");
									dialogKeyWindow.close();
									dialogKeyWindow.center();
									//location.href = location.href.replace('#!','&#!');
								//	window.location.reload();
									$('.btn').attr('disabled', false);
										
								
									}, function (error) {
										console.error('Error: ' + error.result);
										$('.btn').attr('disabled', false);
									});

								} else {
									$scope.ShowDecisions();
									var dialogKeyWindow = $("#KWindowDecisions").data("kendoWindow");
										dialogKeyWindow.close();
										dialogKeyWindow.center();
									//location.href = location.href.replace('#!','&#!');
										//window.location.reload();
										$('.btn').attr('disabled', false);
								}

							}, function (error) {    
									$('.btn').attr('disabled', false);               
								console.error('Error:SaveDEcisions ' + error.result);
							});
				}
				if(ID != null){
						PService.Update(data, 'Collaboration: Decisions',ID).then(function (response) {


							var promise = $q.all({});
							if ($scope.fileArray.length != 0) {

								promise = promise.then(function () {
										return bSvc.GetAttachmentFileBuffer($scope.fileArray[0].Attachment);
									}).then(function (filebuffer) {
										return bSvc.getFileBuffer(filebuffer, ID, 'Collaboration: Decisions', $scope.fileArray[0].Attachment);
									});
								
								promise.then(function (responseAtch) {
									$scope.filesdata = [];
									$('#file_input').val('')
									$scope.ShowDecisions();
									var dialogKeyWindow = $("#KWindowDecisions").data("kendoWindow");
									dialogKeyWindow.close();
									dialogKeyWindow.center();
									//window.location.reload();
									//location.href = location.href.replace('#!','&#!');
									//window.location.reload();

										$('.btn').attr('disabled', false);
							
							}, function (error) {
								console.error('Error: ' + error.result);
								$('.btn').attr('disabled', false);
							});

						} else {
							$scope.ShowDecisions();
							var dialogKeyWindow = $("#KWindowDecisions").data("kendoWindow");
								dialogKeyWindow.close();
								dialogKeyWindow.center();
								//window.location.reload();
							//	location.href = location.href.replace('#!','&#!');
								// window.location.reload();

									$('.btn').attr('disabled', false);
						}

						}, function (error) {    
								$('.btn').attr('disabled', false);               
							console.error('Error:SaveDEcisions ' + error.result);
						});	

					}
		}
	$scope.ConvertDateToMMDDYYYY = function (dDate) {
			
			if (dDate != undefined) {
				if (dDate != null) {
					
					var months = new Array(12);
						months[0] = "null";
						months[1] = "Jan";
						months[2] = "Feb";
						months[3] = "Mar";
						months[4] = "Apr";
						months[5] = "May";
						months[6] = "Jun";
						months[7] = "Jul";
						months[8] = "Aug";
						months[9] = "Sep";
						months[10] = "Oct";
						months[11] = "Nov";
						months[12] = "Dec";
					var SplitdDate = dDate.split('T')[0]
					var year = SplitdDate.split("-")[0]
					var Month;
					if(SplitdDate.split("-")[1] <10){						
						Month =SplitdDate.split("-")[1].slice(1, 2);
					}else{
					     Month= SplitdDate.split("-")[1]
					  }
						Month = months[Month]
					var day = SplitdDate.split("-")[2]
					
					var dateformate = day+"-"+Month+"-"+year
					
					return dateformate;//new Date(dDate).format("dd-MMM-yyyy");
				}
			}
		}

}]);

KendoPApp.controller('RequirementManagementController', ['$scope', "$http", "$q", "$location","$sce", 'baseSvc', 'ProjectkFactoryService',
function ($scope, $http, $q, $location, $sce, bSvc, PService) {
	$scope.init = function(){		
		
		
		if(window.location.hash === "#!/RequirementManagement"){				
				$location.path('/RequirementManagement');
				$scope.ShowRequirementManagement();
			 }
			 

		
	}
	
	$scope.ShowRequirementManagement = function(filterval){		
		$('ul.nav li.active').removeClass('active');
		$("a[name^=RequirementManagement]").closest('li').addClass('active').hover();
			var UID = projId;
			var url ;
			if (location.hostname == 'projectmadeeasy.sharepoint.com') {
			if(filterval != null && filterval != undefined && filterval != ''){
				url = SpURL + "/_api/web/lists/getByTitle('Collaboration: Requirement Management')/items?$top=4998&$select=*,Attachments,AttachmentFiles&$expand=AttachmentFiles&$filter=Progress eq '" + filterval + "'and ProjectUID eq '" + UID + "'&$orderby=ID desc";
			}else{
				url = SpURL + "/_api/web/lists/getByTitle('Collaboration: Requirement Management')/items?$top=4998&$select=*,Attachments,AttachmentFiles&$expand=AttachmentFiles&$filter=ProjectUID eq '" + UID + "'&$orderby=ID desc";
			}}else{
				url='Requirement Management.json';
			}
			PService.GetAllItems('Collaboration: Requirement Management', url).then(function (response) {			
				$scope.getRequirementManagementRes = [];
				angular.forEach(response.d.results, function (item, index) {
					$scope.getRequirementManagementRes.push(item)
					$scope.getRequirementManagementRes[index].Description = $("<div>").html(item.Description).html();
					$scope.getRequirementManagementRes[index].Delete  = null;
					$scope.getRequirementManagementRes[index].Edit  = null;
				});
				$('#RequirementManagementgrid').empty();
				$scope.LoadKendoGridAction($scope.getRequirementManagementRes);
			 }, function (error) {                   
				console.error('Error: ' + error.result);
			}); 

	}

	$scope.LoadKendoGridAction = function (ResData) {

		
		$("#RequirementManagementgrid").kendoGrid({
						toolbar: ["excel"],
						excel: {
							fileName: "RequirementManagement.xlsx"
						},
					  dataSource: {
							data:ResData,
							sort:[ {
							field: "Status",
								dir: "asc"
							},{
							field: "ID",
								dir: "asc"
							},]
						},
					   height: 360,
						scrollable: {
                            virtual: true
                        },
						sortable: true,

							
							filterable: {
									extra: true,
									operators: { 
										string: {   
											contains: "Contains",
											eq: "Is Equal To",
											neq: "Is not equal to",
											startswith: "Starts With",									
										},
									
									}
								},
							resizable: true,
							selectable: "cell",
							change: function (e) {
								var cell = this.select();
								var cellIndex = cell[0].cellIndex;
								var column = this.columns[cellIndex];
								var dataItem = this.dataItem(cell.closest("tr"));
								
								
								if (column.field == "Edit") {									
									$scope.EditDecistionItemView(dataItem, column.title);
								}
								else if (column.title == "Title") {									
									$scope.EditDecistionItemView(dataItem, column.title);
								}
								else if (column.field == "Delete") {											
											$scope.DeleteItem(dataItem);
									}
							},
				
				
				columns: [{ 
						     field: "Edit",
							 filterable:false,
							 title:'.',
							 	headerTemplate:'<label style=" color:#f3f3f4 ;" class=""></label>',
							  template: "<a id='btnEdit' class='btnEdit' title='Click to View' ><span class='pointer' style='float: right; cursor: pointer;' title='Click to Edit'><span class='k-icon k-i-edit'></span></span></a>",							
							 width: 30							 
							 },
					{ field: "ID",width:60,title:'ID',filterable:false,
					template: function (dataItem) {
								var ID = "RM."+dataItem.ID
								return "<span> " + ID + "</span>";
						}
						 },
						{ field: "Title",width:250 ,title:'Title',
							template: function(dataItem) {
								  var values = '';
							//	values = "<span>" + dataItem.Title + "<a id='btnView' class='btnView' style='float: right; ' title='Click to View' ><img border='0'  alt='edit' src='/_layouts/15/images/edititem.gif?rev=47'></a>";
 
									values = "<span class='textdecoration' style='color: #337ab7;  cursor: pointer;'>" + dataItem.Title + "</span>";
															  
								  return values;
								}
						
						
						 },
						{ field: "Status" ,width:180,title:'Status',filterable: {
							multi: true,
							search: true
						},template: function (dataItem) {
								return "<span>" + StatusColorDecode(dataItem) + "</span>";
						}
						},
						{ field: "Progress" ,width:180,title:'Progress',filterable: {
							multi: true,
							search: true
						},
						template: function (dataItem) {
								return "<span>" + ProgressColorDecode(dataItem) + "</span>";
						}
						
						},
						{ field: "Description",title:'Description',
							template: function(dataItem) {
								  return "<span>" + htmlDecode(dataItem.Description) + "</span>";
								}
						
						 },
						{
								field:'Delete',
								title: '.',
									headerTemplate:'<label style=" color:#f3f3f4 ;" class=""></label>',
								filterable: false,
								width: 35,
								template:'<span class="pointer" style="float: center;" title="Click to delete"><span class="k-icon k-i-trash	k-i-delete"></span></span>'
								
							},
						
					  ],
					  
					});
					$('#RequirementManagementgrid').width($(window).width()-270);
					if(proLen == 0){
							var grid = $("#RequirementManagementgrid").data("kendoGrid");
							grid.hideColumn(6);
						}
						var grid = $("#RequirementManagementgrid").data("kendoGrid");
								var exportFlag = false;
								grid.bind("excelExport", function (e) {
									if (!exportFlag) {
										//alert(1);
										e.sender.hideColumn(0);
										e.sender.hideColumn(6);
										e.preventDefault();
										exportFlag = true;
										setTimeout(function () {
											e.sender.saveAsExcel();
										});
									} else {
										//alert(2);
										e.sender.showColumn(0);
										e.sender.showColumn(6);
										exportFlag = false;
										if(proLen == 0){											
											grid.hideColumn(6);
										}
									}
								});

	}

	$scope.DeleteItem = function(data){
				var Chktrue = confirm("Are you sure you want to delete this entry?");
				if(Chktrue){
					PService.DeleteById('Collaboration: Decisions', data.ID).then(function (response) {
						$scope.ShowRequirementManagement();
						//location.href = location.href.replace('#!','&#!');
						//window.location.reload();
					});
				}

		}
		$scope.EditDecisions = function(){
		 $scope.ViewMode = false;		 
	}
	
	$scope.to_trusted = function (html_code) {
			return $sce.trustAsHtml(html_code);
		}
	$scope.AddNewItemWindow = function () {
		$scope.ischkDecisionsAlert = false;
		var valuefil = 1
		//var IssueStatusDefault =null;
		if (location.hostname == 'projectmadeeasy.sharepoint.com') {
			var url = SpURL + "/_api/web/lists/getByTitle('Collaboration: Lookups')/items?$top=4998&$select=*&$filter=Default eq '" + valuefil + "'&$orderby=ID desc";
		} else {
			var url = "Lookups.json";
		}
			PService.GetAllItems('Collaboration: Lookups', url).then(function (response) {			
				$scope.getDefaultValueLookup = [];
			
				$scope.RequirementManagementStatusDefault = []
				$scope.RequirementManagementProgressDefault = []
				angular.forEach(response.d.results, function (item, index) {
					$scope.getDefaultValueLookup.push(item)					
					if(item.Select_x0020_Title == 'RequirementManagementStatus'){
						$scope.RequirementManagementStatusDefault.push(item.Title);
					}
					if(item.Select_x0020_Title == 'RequirementManagementProgress'){
						$scope.RequirementManagementProgressDefault.push(item.Title);
					}
				});
		 $scope.ViewMode = false;
			$scope.Item = {
					ID: null,
					Description:'',
					Status: null,//$scope.RequirementManagementStatusDefault.length != 0 ?$scope.RequirementManagementStatusDefault[0]:null,
					Title: null,
					Progress: null,//$scope.RequirementManagementProgressDefault.length != 0 ?$scope.RequirementManagementProgressDefault[0]:null,
			 }
			 $('.btn').attr('disabled', false);
			 $('#tablinkfiled1').text('NA');
			$('#tablinkfiled2').text('NA');
			 $scope.filesdata = []
				$('#file_input').val('')
				
				var arraycolor =['tablinks1']
			 angular.forEach(arraycolor, function (item, index) {
				   var val = 'NA'
					  switch (index) {
							  case 0:
									val = $scope.Item.Status != null && $scope.Item.Status != '' ? $scope.Item.Status:'NA'
								break;							
					  }
				 
				for (i = 0; i < $('.'+item).length; i++) {
					  debugger
					 $('.'+item)[i].className = item+" "
					  switch (val) {
							  case 'Proposed':
								if(i == 0){
								
									$('.'+item)[i].className = item+" "+'Yellow'
								}
								break;
							case 'Approved':
								if(i == 1){
								   $('.'+item)[i].className = item+" "+'Green'	
								}							
								break;
							case 'Rejected':
								if(i == 2){
								$('.'+item)[i].className = item+" "+'Red'
								}
								break;
							case 'NA':
								if(i == 3){
									$('.'+item)[i].className = item+" "+'NA'	
								}
								break;
					  }				  
				  }
			 });
			 
			 
			 var arraycolor2 =['tablinks2']
			 angular.forEach(arraycolor2, function (item, index) {
				   var val = 'NA'
					  switch (index) {
							  case 0:
									val = $scope.Item.Progress != null && $scope.Item.Progress != '' ? $scope.Item.Progress:'NA'
								break;							
					  }
				 
				for (i = 0; i < $('.'+item).length; i++) {
					  debugger
					 $('.'+item)[i].className = item+" "
					  switch (val) {
							  case 'Deferred':
								if(i == 0){								
									$('.'+item)[i].className = item+" "+'Orange'
								}
								break;
							case 'Draft':
								if(i == 1){
								   $('.'+item)[i].className = item+" "+'Violet'	
								}							
								break;
							case 'Hold':
								if(i == 2){
								$('.'+item)[i].className = item+" "+'Tomato'
								}
								break;
							case 'Implemented':
								if(i == 3){
								$('.'+item)[i].className = item+" "+'lightBlue'
								}
								break;
							case 'In Progress':
								if(i == 4){
								$('.'+item)[i].className = item+" "+'Yellow'
								}
								break;
							case 'Verified':
								if(i == 5){
								$('.'+item)[i].className = item+" "+'MediumSeaGreen'
								}
								break;
							case 'NA':
								if(i == 6){
									$('.'+item)[i].className = item+" "+'NA'	
								}
								break;
					  }				  
				  }
			 });
			var dialogKeyWindow = $("#KWindowDecisions").data("kendoWindow");
			dialogKeyWindow.open();
			dialogKeyWindow.center();
			}, function (error) {                   
				console.error('Error: ' + error.result);
			});
		}

	$scope.EditDecistionItemView = function(data,ItemView){
			$scope.ischkDecisionsAlert = false;
			 $scope.ViewMode = false;	
			if(ItemView == 'Title'){
			$scope.ViewMode = true;	
			}
			$scope.Item = {
					ID: data.ID,
					Description:data.Description,
					Status:data.Status,
					Title: data.Title,
					Attachment:data.AttachmentFiles,
					Progress:data.Progress,
			 }
			 $('.btn').attr('disabled', false);
			  $('#tablinkfiled1').text($scope.Item.Status);
			$('#tablinkfiled2').text($scope.Item.Progress);
		    $scope.filesdata = []
			$('#file_input').val('')
			
			
			var arraycolor =['tablinks1']
			 angular.forEach(arraycolor, function (item, index) {
				   var val = 'NA'
					  switch (index) {
							  case 0:
									val = $scope.Item.Status != null && $scope.Item.Status != '' ? $scope.Item.Status:'NA'
								break;							
					  }
				 
				for (i = 0; i < $('.'+item).length; i++) {
					  debugger
					 $('.'+item)[i].className = item+" "
					  switch (val) {
							  case 'Proposed':
								if(i == 0){
								
									$('.'+item)[i].className = item+" "+'Yellow'
								}
								break;
							case 'Approved':
								if(i == 1){
								   $('.'+item)[i].className = item+" "+'Green'	
								}							
								break;
							case 'Rejected':
								if(i == 2){
								$('.'+item)[i].className = item+" "+'Red'
								}
								break;
							case 'NA':
								if(i == 3){
									$('.'+item)[i].className = item+" "+'NA'	
								}
								break;
					  }				  
				  }
			 });
			 
			 
			 var arraycolor2 =['tablinks2']
			 angular.forEach(arraycolor2, function (item, index) {
				   var val = 'NA'
					  switch (index) {
							  case 0:
									val = $scope.Item.Progress != null && $scope.Item.Progress != '' ? $scope.Item.Progress:'NA'
								break;							
					  }
				 
				for (i = 0; i < $('.'+item).length; i++) {
					  debugger
					 $('.'+item)[i].className = item+" "
					  switch (val) {
							  case 'Deferred':
								if(i == 0){								
									$('.'+item)[i].className = item+" "+'Orange'
								}
								break;
							case 'Draft':
								if(i == 1){
								   $('.'+item)[i].className = item+" "+'Violet'	
								}							
								break;
							case 'Hold':
								if(i == 2){
								$('.'+item)[i].className = item+" "+'Tomato'
								}
								break;
							case 'Implemented':
								if(i == 3){
								$('.'+item)[i].className = item+" "+'lightBlue'
								}
								break;
							case 'In Progress':
								if(i == 4){
								$('.'+item)[i].className = item+" "+'Yellow'
								}
								break;
							case 'Verified':
								if(i == 5){
								$('.'+item)[i].className = item+" "+'MediumSeaGreen'
								}
								break;
							case 'NA':
								if(i == 6){
									$('.'+item)[i].className = item+" "+'NA'	
								}
								break;
					  }				  
				  }
			 });
			
			var dialogKeyWindow = $("#KWindowDecisions").data("kendoWindow");
			dialogKeyWindow.open();
			dialogKeyWindow.center();
		}

	$scope.CloseDecisionsForm = function(){
		//var Chktrue = confirm("Are you sure you want to close this window?");
		//if(Chktrue){
				var dialogKeyWindow = $("#KWindowDecisions").data("kendoWindow");
				dialogKeyWindow.close();
				dialogKeyWindow.center();
		//	}
		}

		$scope.DecisionremoveFileFromList = function(item, file, index){
				
			var  ItemId= item.ID;
			var FileTitle = file.FileName
			var Chktrue = confirm("Are you sure you want to delete this attachment?");
				if(Chktrue){
					bSvc.DeleteAttachment(ItemId,FileTitle,'Requirement Management').then(function (response) {						
						$scope.Item.Attachment.results.splice(index, 1);
					});
				}
			
		}

		$scope.SaveDecisions = function(){
			$('.btn').attr('disabled', true);
				var	ID=$scope.Item.ID;
				var	Description=$scope.Item.Description;				
				var	Status=$('#tablinkfiled1').text();//$scope.Item.Status;
				var	Title=$scope.Item.Title;
				var Progress = $('#tablinkfiled2').text(); //$scope.Item.Progress;
				$scope.ischkDecisionsAlert = false;
				if(Title == null || Title == '' || Status == null || Status == '' || Progress == null || Progress == ''){
						$('.btn').attr('disabled', false);
						$scope.ischkDecisionsAlert = true;
					return;
				}

				$scope.fileArray = [];
				$("#attachFilesHolder input:file").each(function () {
					if ($(this)[0].files[0]) {
						$scope.fileArray.push({
							"Attachment": $(this)[0].files[0]
						});
					}
				});
				var ProjectId =projId;
				var ProjectName = null;
				if(proLen == 1){
					ProjectName = $('input[title="Project Name"]').val();
				}else{
					ProjectName = $('.ms-formlabel :contains("Name")').closest('td').next().text().trim()
				}
				var data = {
						__metadata: {
							'type': 'SP.Data.CollaborationRequirementManagementListItem'
						},
						Title: Title,
						Status:$('#tablinkfiled1').text() != 'NA' && $('#tablinkfiled1').text() != 'NA' ? $('#tablinkfiled1').text():null,//Status,
						Description:Description,
						ProjectUID:ProjectId,
						Progress:$('#tablinkfiled2').text() != 'NA' && $('#tablinkfiled2').text() != 'NA' ? $('#tablinkfiled2').text():null,//Progress,
						ProjectName:ProjectName
					};
				if(ID == null){
					
					PService.AddNew(data, 'Collaboration: Requirement Management').then(function (response) {


							var id = response.d.Id;
							var promise = $q.all({});
								if ($scope.fileArray.length != 0) {
									promise = promise.then(function () {
											return bSvc.GetAttachmentFileBuffer($scope.fileArray[0].Attachment);
										}).then(function (filebuffer) {
											return bSvc.getFileBuffer(filebuffer, id, 'Collaboration: Requirement Management', $scope.fileArray[0].Attachment);
										});					
									promise.then(function (responseAtch) {
										$scope.filesdata = [];
										$('#file_input').val('')
										$scope.ShowRequirementManagement();
										var dialogKeyWindow = $("#KWindowDecisions").data("kendoWindow");
									dialogKeyWindow.close();
									dialogKeyWindow.center();
									//location.href = location.href.replace('#!','&#!');
								//	window.location.reload();
									$('.btn').attr('disabled', false);
										
								
									}, function (error) {
										console.error('Error: ' + error.result);
										$('.btn').attr('disabled', false);
									});

								} else {
									$scope.ShowRequirementManagement();
									var dialogKeyWindow = $("#KWindowDecisions").data("kendoWindow");
										dialogKeyWindow.close();
										dialogKeyWindow.center();
									//location.href = location.href.replace('#!','&#!');
										//window.location.reload();
										$('.btn').attr('disabled', false);
								}

							}, function (error) {    
									$('.btn').attr('disabled', false);               
								console.error('Error:SaveDEcisions ' + error.result);
							});
				}
				if(ID != null){					
						PService.Update(data, 'Collaboration: Requirement Management',ID).then(function (response) {


							var promise = $q.all({});
							if ($scope.fileArray.length != 0) {

								promise = promise.then(function () {
										return bSvc.GetAttachmentFileBuffer($scope.fileArray[0].Attachment);
									}).then(function (filebuffer) {
										return bSvc.getFileBuffer(filebuffer, ID, 'Collaboration: Requirement Management', $scope.fileArray[0].Attachment);
									});
								
								promise.then(function (responseAtch) {
									$scope.filesdata = [];
									$('#file_input').val('')
									$scope.ShowRequirementManagement();
									var dialogKeyWindow = $("#KWindowDecisions").data("kendoWindow");
									dialogKeyWindow.close();
									dialogKeyWindow.center();
									//window.location.reload();
									//location.href = location.href.replace('#!','&#!');
									//window.location.reload();

										$('.btn').attr('disabled', false);
							
							}, function (error) {
								console.error('Error: ' + error.result);
								$('.btn').attr('disabled', false);
							});

						} else {
							$scope.ShowRequirementManagement();
							var dialogKeyWindow = $("#KWindowDecisions").data("kendoWindow");
								dialogKeyWindow.close();
								dialogKeyWindow.center();
								//window.location.reload();
							//	location.href = location.href.replace('#!','&#!');
								// window.location.reload();

									$('.btn').attr('disabled', false);
						}

						}, function (error) {    
								$('.btn').attr('disabled', false);               
							console.error('Error:SaveDEcisions ' + error.result);
						});	

					}
		}
	$scope.ConvertDateToMMDDYYYY = function (dDate) {
			
			if (dDate != undefined) {
				if (dDate != null) {
					
					var months = new Array(12);
						months[0] = "null";
						months[1] = "Jan";
						months[2] = "Feb";
						months[3] = "Mar";
						months[4] = "Apr";
						months[5] = "May";
						months[6] = "Jun";
						months[7] = "Jul";
						months[8] = "Aug";
						months[9] = "Sep";
						months[10] = "Oct";
						months[11] = "Nov";
						months[12] = "Dec";
					var SplitdDate = dDate.split('T')[0]
					var year = SplitdDate.split("-")[0]
					var Month;
					if(SplitdDate.split("-")[1] <10){						
						Month =SplitdDate.split("-")[1].slice(1, 2);
					}else{
					     Month= SplitdDate.split("-")[1]
					  }
						Month = months[Month]
					var day = SplitdDate.split("-")[2]
					
					var dateformate = day+"-"+Month+"-"+year
					
					return dateformate;//new Date(dDate).format("dd-MMM-yyyy");
				}
			}
		}

}]);
KendoPApp.controller('ProjectBudgetController', ['$scope', "$http", "$q", "$location","$sce", 'baseSvc', 'ProjectkFactoryService',
function ($scope, $http, $q, $location, $sce, bSvc, PService) {
	$scope.init = function(){
		
		
		if(window.location.hash === "#!/Budget"){				
				$location.path('/Budget');
		$scope.ShowBudget();
			 }
		}


	$scope.ShowBudget = function(){		
		$('ul.nav li.active').removeClass('active');
		$("a[name^=Budget]").closest('li').addClass('active').hover();
			var UID = projId;
			if (location.hostname == 'projectmadeeasy.sharepoint.com') {
			var url = SpURL + "/_api/web/lists/getByTitle('Collaboration: Budget')/items?$top=4998&$select=*,Attachments,AttachmentFiles&$expand=AttachmentFiles&$filter=ProjectUID eq '" + UID + "'&$orderby=ID desc";} else { var url = "Budget.json"; }
			PService.GetAllItems('Collaboration: Budget', url).then(function (response) {			
				$scope.getBudgetRes = [];
				angular.forEach(response.d.results, function (item, index) {
					$scope.getBudgetRes.push(item)					
					$scope.getBudgetRes[index].Delete  = null;
					$scope.getBudgetRes[index].Edit  = null;
				});
				
				$('#Budgetgrid').empty();
				$scope.LoadKendoGridAction($scope.getBudgetRes);
			 }, function (error) {                   
				console.error('Error: ' + error.result);
			}); 

	}

	$scope.LoadKendoGridAction = function (ResData) {

		
			$("#Budgetgrid").kendoGrid({
					toolbar: ["excel"],
						excel: {
							fileName: "Budget.xlsx"
						},
					  dataSource: {
							data:ResData,
							sort:[ {
							field: "ID",
								dir: "asc"
							}]
						},
					   height: 360,
						scrollable: {
                            virtual: true
                        },
						sortable: true,

							
							filterable: {
									extra: true,
									operators: { 
										string: {   
											contains: "Contains",
											eq: "Is Equal To",
											neq: "Is not equal to",
											startswith: "Starts With",									
										},
									
									}
								},
							resizable: true,
							selectable: "cell",
							change: function (e) {
								var cell = this.select();
								var cellIndex = cell[0].cellIndex;
								var column = this.columns[cellIndex];
								var dataItem = this.dataItem(cell.closest("tr"));
								
								
								if (column.field == "Edit") {									
									$scope.EditBudgetItemView(dataItem, column.title);
								}
								else if (column.title == "Title") {									
									$scope.EditBudgetItemView(dataItem, column.title);
								}
								else if (column.field == "Delete") {											
											$scope.DeleteItem(dataItem);
									}
							},
				
				
				columns: [ { 
						     field: "Edit",
							 filterable:false,
							 title:'.',
							 	headerTemplate:'<label style=" color:#f3f3f4 ;" class=""></label>',
							  template: "<a id='btnEdit' class='btnEdit' title='Click to View' ><span class='pointer' style='float: right; cursor: pointer;' title='Click to Edit'><span class='k-icon k-i-edit'></span></span></a>",							
							 width: 30							 
							 },
					{ field: "ID",width:60,title:'ID',filterable:false,
						 },
						{ field: "Title",width:200,title:'Title',
							template: function(dataItem) {
								  var values = '';
									// values = "<span>" + dataItem.Title + "<a id='btnView' class='btnView' style='float: right; ' title='Click to View' ><img border='0'  alt='edit' src='/_layouts/15/images/edititem.gif?rev=47'></a>";
									 values = "<span class='textdecoration' style='color: #337ab7;  cursor: pointer;'>" + dataItem.Title + "</span>";
									  return values;
								}
						},
						/* { 
							 title:'Edit',
							  template: "<a id='btnEdit' class='btnEdit' title='Click to View' ><span class='pointer' style='float: right;' title='Click to Edit'><span class='k-icon k-i-edit'></span></span></a>",
							
							 width: 50
							 
							 },*/
						
						{ field: "BaselineCost" ,title:'Baseline Cost',filterable: {
							multi: true,
							search: true
						},
						
							template: function(dataItem) {
								var value = ''
								if(dataItem.BaselineCost != null){
								  value =  "<span style='float: right;'>$" + AddCommas(dataItem.BaselineCost) + ".00</span>";
								}
								  return value;
								}	
						}, {field: "CurrentForecast" ,title:'Current Forecast',filterable: {
							multi: true,
							search: true
						},
						 
							template: function(dataItem) {
								var value = ''
								if(dataItem.CurrentForecast != null){
								  value =  "<span style='float: right;'>$" + AddCommas(dataItem.CurrentForecast) + ".00</span>";
								}

								  return value;
								}						 
						 }, {field: "ActualsToDate" ,title:'Actuals To Date',filterable: {
							multi: true,
							search: true
						},
						 
							template: function(dataItem) {
								var value = ''
								if(dataItem.ActualsToDate != null){
								  value =  "<span style='float: right;'>$" + AddCommas(dataItem.ActualsToDate) + ".00</span>";
								}

								  return value;
								}						 
						 },{
							 	field:'Delete',
								title: '.',
									headerTemplate:'<label style=" color:#f3f3f4 ;" class=""></label>',
								filterable: false,
								width: 35,
								template:'<span class="pointer" style="float: center;" title="Click to delete"><span class="k-icon k-i-trash	k-i-delete"></span></span>'
								
							},
					//	{ field: "StatusID" ,width:150,title:'Status',},						
					  ],
					  
					});
					$('#Budgetgrid').width($(window).width()-270);
					if(proLen == 0){
							var grid = $("#Budgetgrid").data("kendoGrid");
							grid.hideColumn(6);
							grid.hideColumn(0);
						}
						var grid = $("#Budgetgrid").data("kendoGrid");
								var exportFlag = false;
								grid.bind("excelExport", function (e) {
									if (!exportFlag) {
										//alert(1);
										e.sender.hideColumn(0);
										e.sender.hideColumn(6);
										e.preventDefault();
										exportFlag = true;
										setTimeout(function () {
											e.sender.saveAsExcel();
										});
									} else {
										//alert(2);
										e.sender.showColumn(0);
										e.sender.showColumn(6);
										exportFlag = false;
									}
								});

	}
	$scope.DeleteItem = function(data){
				var Chktrue = confirm("Are you sure you want to delete this entry?");
				if(Chktrue){
					PService.DeleteById('Collaboration: Budget', data.ID).then(function (response) {
						location.href = location.href.replace('#!','&#!');
						//window.location.reload();
					});
				}

		}
	$scope.AddNewItemWindow = function () {
		$scope.ischkBudgetAlert = false;
			$scope.Item = {
					ID: null,				
					ActualsToDate: null,
					BaselineCost: null,
					StatusID: null,
					Title: null,
					CurrentForecast:null,
			 }
			 $('.btn').attr('disabled', false);
			 $scope.filesdata = []
				$('#file_input').val('')
			  $scope.ViewMode = false;
			var dialogKeyWindow = $("#KWindowBudget").data("kendoWindow");
			dialogKeyWindow.open();
			dialogKeyWindow.center();
		}
		$scope.formatNumber = function(n) {
		// format number 1000000 to 1,234,567
		var num = n.toString();
		return num.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",")+".00"
		}
		$scope.EditBudgetItemView = function(data,ItemView){
			$scope.ischkBudgetAlert = false;
			  $scope.ViewMode = false;	
			if(ItemView == 'Title'){
			$scope.ViewMode = true;	
			}
			$scope.Item = {
					ID: data.ID,
					ActualsToDate:data.ActualsToDate != null?$scope.formatNumber(data.ActualsToDate):null,
					BaselineCost:data.BaselineCost != null?$scope.formatNumber(data.BaselineCost):null,
					StatusID: data.StatusID,
					Title: data.Title,
					CurrentForecast:data.CurrentForecast != null?$scope.formatNumber(data.CurrentForecast):null,
					Attachment:data.AttachmentFiles,
			 }
			/// $('#ActualsToDate').val(data.ActualsToDate)
			//  $('#BaselineCost').val(data.BaselineCost)
			 $('.btn').attr('disabled', false);
			 $scope.filesdata = []
				$('#file_input').val('')
			var dialogKeyWindow = $("#KWindowBudget").data("kendoWindow");
			dialogKeyWindow.open();
			dialogKeyWindow.center();
		}

		$scope.CloseBudgetForm = function(){
			var Chktrue = confirm("Are you sure you want to close this window?");
				if(Chktrue){
					$scope.ShowBudget();
					var dialogKeyWindow = $("#KWindowBudget").data("kendoWindow");
					dialogKeyWindow.close();
					dialogKeyWindow.center();
				}
		}

		$scope.EditBudget = function(){
			$scope.ViewMode = false;		 
		}
	$scope.to_trusted = function (html_code) {
			return $sce.trustAsHtml(html_code);
		}


$scope.SBudgetremoveFileFromList = function(item, file, index){				
			var  ItemId= item.ID;
			var FileTitle = file.FileName
			var Chktrue = confirm("Are you sure you want to delete this attachment?");
				if(Chktrue){
					bSvc.DeleteAttachment(ItemId,FileTitle,'Status: Budget').then(function (response) {						
						$scope.Item.Attachment.results.splice(index, 1);
					});
				}
			
		}
		$scope.SaveBudget = function(){
			$('.btn').attr('disabled', true);
				var	ID=$scope.Item.ID;
				var	ActualsToDate=$scope.Item.ActualsToDate;
				var	BaselineCost=$scope.Item.BaselineCost;
				var CurrentForecast =$scope.Item.CurrentForecast;
				var	StatusID=$scope.Item.StatusID;
				var Title = $scope.Item.Title;
				$scope.ischkBudgetAlert = false;
				if(Title == null || Title == ''){
						$('.btn').attr('disabled', false);
						$scope.ischkBudgetAlert = true;
					return;
				}

				$scope.fileArray = [];
				$("#attachFilesHolder input:file").each(function () {
					if ($(this)[0].files[0]) {
						$scope.fileArray.push({
							"Attachment": $(this)[0].files[0]
						});
					}
				});
				var ProjectId =projId;

				var data = {
					__metadata: {
						'type': 'SP.Data.CollaborationBudgetListItem'
					},
					Title: Title,	
					ActualsToDate:ActualsToDate,
					BaselineCost:BaselineCost,
					CurrentForecast:CurrentForecast,
				//	StatusID:StatusID,		
					ProjectUID:ProjectId,			
				};
				if(ID == null){
					PService.AddNew(data, 'Collaboration: Budget').then(function (response) {

							var id = response.d.Id;
				var promise = $q.all({});
					if ($scope.fileArray.length != 0) {
						promise = promise.then(function () {
											return bSvc.GetAttachmentFileBuffer($scope.fileArray[0].Attachment);
										}).then(function (filebuffer) {
											return bSvc.getFileBuffer(filebuffer, id, 'Collaboration: Budget', $scope.fileArray[0].Attachment);
										});					
									promise.then(function (responseAtch) {
										$scope.filesdata = [];
										$('#file_input').val('')
										$scope.ShowBudget();
										var dialogKeyWindow = $("#KWindowBudget").data("kendoWindow");
												dialogKeyWindow.close();
												dialogKeyWindow.center();
											//location.href = location.href.replace('#!','&#!');
											//	window.location.reload();
												$('.btn').attr('disabled', false);
										
								
								}, function (error) {
									console.error('Error: ' + error.result);
									$('.btn').attr('disabled', false);
								});

							} else {
								$scope.ShowBudget();
											var dialogKeyWindow = $("#KWindowBudget").data("kendoWindow");
												dialogKeyWindow.close();
												dialogKeyWindow.center();
										//	location.href = location.href.replace('#!','&#!');
												//window.location.reload();
												$('.btn').attr('disabled', false);
							}

							}, function (error) {    
									$('.btn').attr('disabled', false);               
								console.error('Error:SaveBudget ' + error.result);
							});
				}
				if(ID != null){
						PService.Update(data, 'Collaboration: Budget',ID).then(function (response) {

							var promise = $q.all({});
								if ($scope.fileArray.length != 0) {

									promise = promise.then(function () {
											return bSvc.GetAttachmentFileBuffer($scope.fileArray[0].Attachment);
										}).then(function (filebuffer) {
											return bSvc.getFileBuffer(filebuffer, ID, 'Collaboration: Budget', $scope.fileArray[0].Attachment);
										});
									
									promise.then(function (responseAtch) {
										$scope.filesdata = [];
										$('#file_input').val('')
										$scope.ShowBudget();
											var dialogKeyWindow = $("#KWindowBudget").data("kendoWindow");
											dialogKeyWindow.close();
											dialogKeyWindow.center();
										//	window.location.reload();
										//location.href = location.href.replace('#!','&#!');
										//window.location.reload();

												$('.btn').attr('disabled', false);
								
								}, function (error) {
									console.error('Error: ' + error.result);
									$('.btn').attr('disabled', false);
								});

							} else {
								$scope.ShowBudget();
										var dialogKeyWindow = $("#KWindowBudget").data("kendoWindow");
											dialogKeyWindow.close();
											dialogKeyWindow.center();
										//	window.location.reload();
									//location.href = location.href.replace('#!','&#!');
										//window.location.reload();

												$('.btn').attr('disabled', false);
							}

						}, function (error) {    
								$('.btn').attr('disabled', false);               
							console.error('Error:SaveBudget ' + error.result);
						});	

					}
		}

}]);

KendoPApp.controller('ProjectcollabInsightsController', ['$scope', "$http", "$q", "$location","$sce", 'baseSvc', 'ProjectkFactoryService',
function ($scope, $http, $q, $location, $sce, bSvc, PService) {
	$scope.init = function(){		
		
		if(window.location.hash === "#!/Insight"){				
				$location.path('/Insight');
				$scope.ShowInsight();
			 }
		}


	$scope.EditInsight = function(){
		 $scope.ViewMode = false;		 
	}

	$scope.to_trusted = function (html_code) {
			//console.log(html_code);
			return $sce.trustAsHtml(html_code);
		}

	$scope.AddNewItemWindow = function () {
		$scope.ischkInsightAlert = false;
		var valuefil = 1
		if (location.hostname == 'projectmadeeasy.sharepoint.com') {
			var url = SpURL + "/_api/web/lists/getByTitle('Collaboration: Lookups')/items?$top=4998&$select=*&$filter=Default eq '" + valuefil + "'&$orderby=ID desc";
		} else {
			var url = "Lookups.json";
		}
			PService.GetAllItems('Collaboration: Lookups', url).then(function (response) {			
				$scope.getDefaultValueLookup = [];
				//console.log(response.d.results)
				$scope.InsightTypeDefault =[];
					$scope.InsightCategoryDefault =[];
						$scope.ProjectPhaseDefault =[];
						
				angular.forEach(response.d.results, function (item, index) {
					$scope.getDefaultValueLookup.push(item)
					if(item.Select_x0020_Title == 'Insight Type'){
						$scope.InsightTypeDefault.push(item.Title);
					}
					if(item.Select_x0020_Title == 'Insight Category'){
						$scope.InsightCategoryDefault.push(item.Title);
					}
					if(item.Select_x0020_Title == 'Project Phase'){
						$scope.ProjectPhaseDefault.push(item.Title);
					}					
				});
				
				
			$scope.Item = {
					ID: null,					
					Title: null,
					ActualsToDate: null,
					BaselineCost: null,
					StatusID: null,
					DateIdentified: null,
					FutureAction: null,
					IdentifiedBy: null,
					InsightCategory: $scope.InsightCategoryDefault.length != 0 ?$scope.InsightCategoryDefault[0]:null,
					InsightDescription: null,
					InsightType: $scope.InsightTypeDefault.length != 0 ?$scope.InsightTypeDefault[0]:null,
					ProjectPhase: $scope.ProjectPhaseDefault.length != 0 ?$scope.ProjectPhaseDefault[0]:null,
					RootCause: null,
			 }
			  $scope.ViewMode = false;
			 $('.btn').attr('disabled', false);
			 $scope.filesdata = []
				$('#file_input').val('')
			var dialogKeyWindow = $("#KWindowInsight").data("kendoWindow");
			dialogKeyWindow.open();
			dialogKeyWindow.center();
			}, function (error) {                   
				console.error('Error: ' + error.result);
			});
				
		}

		$scope.EditInsightItemView = function(data,ItemView){
				$scope.ischkInsightAlert = false;
				 $scope.ViewMode = false;	
						if(ItemView == 'Title'){
						$scope.ViewMode = true;	
						}
			$scope.Item = {
					ID: data.ID,					
					Title: data.Title,
					ActualsToDate: data.ActualsToDate,
					BaselineCost: data.BaselineCost,
					StatusID: data.StatusID,
					DateIdentified: data.DateIdentified,
					FutureAction: data.FutureAction,
					IdentifiedBy: data.IdentifiedBy,
					InsightCategory: data.InsightCategory,
					InsightDescription: data.InsightDescription,
					InsightType: data.InsightType,
					ProjectPhase: data.ProjectPhase,
					RootCause: data.RootCause,
					Attachment:data.AttachmentFiles,
			 }
			 $('.btn').attr('disabled', false);
			// $scope.ViewMode = true;
			 $scope.filesdata = []
				$('#file_input').val('')
			var dialogKeyWindow = $("#KWindowInsight").data("kendoWindow");
			dialogKeyWindow.open();
			dialogKeyWindow.center();

		}

		$scope.CloseInsightForm = function () {
		 $('.btn').attr('disabled', false);
		 	var Chktrue = confirm("Are you sure you want to close this window?");
				if(Chktrue){
					var dialogKeyWindow = $("#KWindowInsight").data("kendoWindow");
					dialogKeyWindow.close();
					dialogKeyWindow.center();
				}
		}

			$scope.ShowInsight = function(){		
					$('ul.nav li.active').removeClass('active');
					$("a[name^=Insight]").closest('li').addClass('active').hover();
						var UID = projId;
						if (location.hostname == 'projectmadeeasy.sharepoint.com') {
						var url = SpURL + "/_api/web/lists/getByTitle('Collaboration: Insights')/items?$top=4998&$select=*,Attachments,AttachmentFiles&$expand=AttachmentFiles&$filter=ProjectUID eq '" + UID + "'&$orderby=ID desc";} else { var url = "Insights.json"; }
						PService.GetAllItems('Collaboration: Insights', url).then(function (response) {			
							$scope.getInsightRes = [];
							angular.forEach(response.d.results, function (item, index) {
								$scope.getInsightRes.push(item)
								$scope.getInsightRes[index].Delete  = null;
								$scope.getInsightRes[index].Edit  = null;
							});
							$('#InsightGrid').empty();
							$scope.LoadKendoGridAction($scope.getInsightRes);
						}, function (error) {                   
							console.error('Error: ' + error.result);
						}); 

				}	
				$scope.LoadKendoGridAction = function (ResData) {
				$("#InsightGrid").kendoGrid({
					toolbar: ["excel"],
						excel: {
							fileName: "Insights.xlsx"
						},
					  dataSource: {
							data:ResData,
							sort:[ {field: "InsightType",
								dir: "asc"
							},{
							field: "ProjectPhase",
								dir: "asc"
							},{
							field: "InsightCategory",
								dir: "asc"
							},{
							field: "ID",
								dir: "asc"
							},]
						},
					   height: 360,
						scrollable: {
                            virtual: true
                        },
						sortable: true,

							
							filterable: {
									extra: true,
									operators: { 
										string: {   
											contains: "Contains",
											eq: "Is Equal To",
											neq: "Is not equal to",
											startswith: "Starts With",									
										},
									
									}
								},
							resizable: true,
							selectable: "cell",
							change: function (e) {
								var cell = this.select();
								var cellIndex = cell[0].cellIndex;
								var column = this.columns[cellIndex];
								var dataItem = this.dataItem(cell.closest("tr"));
								
								
								if (column.field == "Edit") {									
									$scope.EditInsightItemView(dataItem, column.title);
								}
								else if (column.title == "Title") {									
									$scope.EditInsightItemView(dataItem, column.title);
								}
								else if (column.filed == 'Delete') {											
											$scope.DeleteItem(dataItem);
									}
							},
				
				
				columns: [
					 { 
						     field: "Edit",
							 filterable:false,
							 title:'.',
							 	headerTemplate:'<label style=" color:#f3f3f4 ;" class=""></label>',
							  template: "<a id='btnEdit' class='btnEdit' title='Click to View' ><span class='pointer' style='float: right; cursor: pointer;' title='Click to Edit'><span class='k-icon k-i-edit'></span></span></a>",							
							 width: 30							 
							 },
					{ field: "ID",width:60,title:'ID', filterable:false,
						 },
						{ field: "Title",width:200 ,title:'Title',
							template: function(dataItem) {
								  var values = '';
								//values = "<span>" + dataItem.Title + "<a id='btnView' class='btnView' style='float: right; ' title='Click to View' ><img border='0'  alt='edit' src='/_layouts/15/images/edititem.gif?rev=47'></a>";
 values = "<span class='textdecoration' style='color: #337ab7;  cursor: pointer;'>" + dataItem.Title + "</span>";
															  
								  return values;
								}
						
						
						},/*
						 { 
							 title:'Edit',
							  template: "<a id='btnEdit' class='btnEdit' title='Click to View' ><span class='pointer' style='float: right;' title='Click to Edit'><span class='k-icon k-i-edit'></span></span></a>",
							
							 width: 50
							 
							 },*/
						 {field: "ProjectPhase", title:'Project Phase',filterable: {
							multi: true,
							search: true
						}, },
						{ field: "InsightType" ,title:'Insight Type',filterable: {
							multi: true,
							search: true
						},	},
						{ field: "InsightCategory" ,title:'Insight Category',filterable: {
							multi: true,
							search: true
						},},
						{
								filed: 'Delete',
								title:'.',
									headerTemplate:'<label style=" color:#f3f3f4 ;" class=""></label>',
								filterable: false,
								width: 35,
								template:'<span class="pointer" style="float: center;" title="Click to delete"><span class="k-icon k-i-trash	k-i-delete"></span></span>'
								
							},						
					  ],
					  
					});
					$('#InsightGrid').width($(window).width()-270);
					if(proLen == 0){
							var grid = $("#InsightGrid").data("kendoGrid");
							grid.hideColumn(6);
						//	grid.hideColumn(0);
						}
						var grid = $("#InsightGrid").data("kendoGrid");
								var exportFlag = false;
								grid.bind("excelExport", function (e) {
									if (!exportFlag) {
										//alert(1);
										e.sender.hideColumn(0);
										e.sender.hideColumn(6);
										e.preventDefault();
										exportFlag = true;
										setTimeout(function () {
											e.sender.saveAsExcel();
										});
									} else {
										//alert(2);
										e.sender.showColumn(0);
										e.sender.showColumn(6);
										exportFlag = false;
									}
								});

				}

		$scope.DeleteItem = function(data){
				var Chktrue = confirm("Are you sure you want to delete this entry?");
				if(Chktrue){
					PService.DeleteById('Collaboration: Insights', data.ID).then(function (response) {
						$scope.ShowInsight();
						//location.href = location.href.replace('#!','&#!');
						//window.location.reload();
					});
				}

		}
		$scope.InsightsremoveFileFromList = function(item, file, index){
				
			var  ItemId= item.ID;
			var FileTitle = file.FileName
			var Chktrue = confirm("Are you sure you want to delete this attachment?");
				if(Chktrue){
					bSvc.DeleteAttachment(ItemId,FileTitle,'Collaboration: Insights').then(function (response) {						
						$scope.Item.Attachment.results.splice(index, 1);
					});
				}
			
		}


			$scope.SaveInsight = function(){
			$('.btn').attr('disabled', true);
				var	ID=$scope.Item.ID;			
				var	DateIdentified=$scope.Item.DateIdentified;
				var	FutureAction=$scope.Item.FutureAction;
				var	IdentifiedBy=$scope.Item.IdentifiedBy;
				var	InsightCategory=$scope.Item.InsightCategory;
				var	InsightDescription=$scope.Item.InsightDescription;
				var	InsightType=$scope.Item.InsightType;
				var	ProjectPhase=$scope.Item.ProjectPhase;
				var	RootCause=$scope.Item.RootCause;

				var Title = $scope.Item.Title;
				$scope.ischkInsightAlert = false;
				if(Title == null || Title == '' || InsightCategory == null || InsightType == null || ProjectPhase == null){
						$('.btn').attr('disabled', false);
						$scope.ischkInsightAlert = true;
					return;
				}

				
				$scope.fileArray = [];
				$("#attachFilesHolder input:file").each(function () {
					if ($(this)[0].files[0]) {
						$scope.fileArray.push({
							"Attachment": $(this)[0].files[0]
						});
					}
				});
				var ProjectId =projId;

				var data = {
					__metadata: {
						'type': 'SP.Data.CollaborationInsightsListItem'
					},
					Title: Title,					
					DateIdentified:DateIdentified,
					FutureAction:FutureAction,
					IdentifiedBy:IdentifiedBy,
					InsightCategory:InsightCategory,
					InsightDescription:InsightDescription,
					InsightType:InsightType,
					ProjectPhase:ProjectPhase,					
					RootCause:RootCause,		
					ProjectUID:ProjectId,			
				};
				if(ID == null){
					PService.AddNew(data, 'Collaboration: Insights').then(function (response) {

						var id = response.d.Id;
				var promise = $q.all({});
								if ($scope.fileArray.length != 0) {
									promise = promise.then(function () {
											return bSvc.GetAttachmentFileBuffer($scope.fileArray[0].Attachment);
										}).then(function (filebuffer) {
											return bSvc.getFileBuffer(filebuffer, id, 'Collaboration: Insights', $scope.fileArray[0].Attachment);
										});					
									promise.then(function (responseAtch) {
										$scope.filesdata = [];
										$('#file_input').val('')
										$scope.ShowInsight();
										var dialogKeyWindow = $("#KWindowInsight").data("kendoWindow");
												dialogKeyWindow.close();
												dialogKeyWindow.center();
											//location.href = location.href.replace('#!','&#!');
												//window.location.reload();
												$('.btn').attr('disabled', false);
										
								
								}, function (error) {
									console.error('Error: ' + error.result);
									$('.btn').attr('disabled', false);
								});

							} else {
								$scope.ShowInsight();
								var dialogKeyWindow = $("#KWindowInsight").data("kendoWindow");
									dialogKeyWindow.close();
									dialogKeyWindow.center();
							//	location.href = location.href.replace('#!','&#!');
									//window.location.reload();
									$('.btn').attr('disabled', false);
				}

							}, function (error) {    
									$('.btn').attr('disabled', false);               
								console.error('Error:SaveInsights ' + error.result);
							});
				}
				if(ID != null){
						PService.Update(data, 'Collaboration: Insights',ID).then(function (response) {

							var promise = $q.all({});
					if ($scope.fileArray.length != 0) {

						promise = promise.then(function () {
								return bSvc.GetAttachmentFileBuffer($scope.fileArray[0].Attachment);
							}).then(function (filebuffer) {
								return bSvc.getFileBuffer(filebuffer, ID, 'Collaboration: Insights', $scope.fileArray[0].Attachment);
							});
						
								promise.then(function (responseAtch) {
									$scope.filesdata = [];
									$('#file_input').val('')
									$scope.ShowInsight();
									var dialogKeyWindow = $("#KWindowInsight").data("kendoWindow");
										dialogKeyWindow.close();
										dialogKeyWindow.center();
									//	window.location.reload();
									//location.href = location.href.replace('#!','&#!');
									//window.location.reload();

											$('.btn').attr('disabled', false);
							
							}, function (error) {
								console.error('Error: ' + error.result);
								$('.btn').attr('disabled', false);
							});

						} else {
							$scope.ShowInsight();
							var dialogKeyWindow = $("#KWindowInsight").data("kendoWindow");
								dialogKeyWindow.close();
								dialogKeyWindow.center();
							//	window.location.reload();
							//location.href = location.href.replace('#!','&#!');
							// window.location.reload();

									$('.btn').attr('disabled', false);
				}

						}, function (error) {    
								$('.btn').attr('disabled', false);               
							console.error('Error:SaveInsights ' + error.result);
						});	

					}
		}

}]);

KendoPApp.controller('ProjectcollabAssumptionController', ['$scope', "$http", "$q", "$location","$sce", 'baseSvc', 'ProjectkFactoryService',
function ($scope, $http, $q, $location, $sce, bSvc, PService) {
	$scope.init = function(){
		
		if(window.location.hash === "#!/Assumption"){				
			$location.path('/Assumption');
			$scope.ShowAssumption();
		 }
	}


	$scope.EditAssumption = function(){
		 $scope.ViewMode = false;		 
	}

	$scope.to_trusted = function (html_code) {
			return $sce.trustAsHtml(html_code);
		}
	
	$scope.AddNewItemWindow = function () {
		$scope.ischkAssumptionAlert = false;
			var valuefil = 1	
if (location.hostname == 'projectmadeeasy.sharepoint.com') {		
	var url = SpURL + "/_api/web/lists/getByTitle('Collaboration: Lookups')/items?$top=4998&$select=*&$filter=Default eq '" + valuefil + "'&$orderby=ID desc";
} else {
	var url = "Lookups.json";
}
			PService.GetAllItems('Collaboration: Lookups', url).then(function (response) {			
				$scope.getDefaultValueLookup = [];
				$scope.ItemStatusDefault =[];
				angular.forEach(response.d.results, function (item, index) {
					$scope.getDefaultValueLookup.push(item)
					if(item.Select_x0020_Title == 'Item Status'){
						$scope.ItemStatusDefault.push(item.Title);
					}					
				});
			$scope.Item = {
					ID: null,					
					Title: null,
					AssignedTo: null,
					DateClosed: null,
					DateDue: null,
					ItemStatus: $scope.ItemStatusDefault.length != 0 ?$scope.ItemStatusDefault[0]:null,
					LongDescription: null,
					ResponsibleOwner: null,
					ValidationResolution: null,
			 }
			  $scope.ViewMode = false;
			 $('.btn').attr('disabled', false);
			 $scope.filesdata = []
				$('#file_input').val('')
			var dialogKeyWindow = $("#KWindowAssumption").data("kendoWindow");
			dialogKeyWindow.open();
			dialogKeyWindow.center();
				}, function (error) {                   
				console.error('Error: ' + error.result);
			});
		}

		$scope.EditAssumptionItemView = function (data,ItemView) {
		$scope.ischkAssumptionAlert = false;
		 $scope.ViewMode = false;	
			if(ItemView == 'Title'){
			$scope.ViewMode = true;	
			}
			$scope.Item = {
					ID: data.ID,					
					Title: data.Title,
					AssignedTo: data.AssignedTo,
					DateClosed: data.DateClosed,
					DateDue: data.DateDue,
					ItemStatus: data.ItemStatus,
					LongDescription: data.LongDescription,
					ResponsibleOwner: data.ResponsibleOwner,
					ValidationResolution: data.ValidationResolution,
					Attachment:data.AttachmentFiles,	
			 }
			//  $scope.ViewMode = true;
			 $('.btn').attr('disabled', false);
			 $scope.filesdata = []
				$('#file_input').val('')
			var dialogKeyWindow = $("#KWindowAssumption").data("kendoWindow");
			dialogKeyWindow.open();
			dialogKeyWindow.center();
		}

		$scope.ShowAssumption = function(){
			$('ul.nav li.active').removeClass('active');
		    $("a[name^=Assumption]").closest('li').addClass('active').hover();
			var UID = projId;
			if (location.hostname == 'projectmadeeasy.sharepoint.com') {
			var url = SpURL + "/_api/web/lists/getByTitle('Collaboration: Assumptions')/items?$top=4998&$select=*,AssignedTo/Name,AssignedTo/Title,AssignedTo/Id,ResponsibleOwner/Name,ResponsibleOwner/Title,ResponsibleOwner/Id,Attachments,AttachmentFiles&$expand=AttachmentFiles,AssignedTo/Id,ResponsibleOwner/Id&$filter=ProjectUID eq '" + UID + "'&$orderby=ID desc";} else { var url = "Assumptions.json"; }
			PService.GetAllItems('Collaboration: Assumptions', url).then(function (response) {			
				$scope.getAssumptionRes = [];
				angular.forEach(response.d.results, function (item, index) {
					$scope.getAssumptionRes.push(item)
					$scope.getAssumptionRes[index].LongDescription = $("<div>").html(item.LongDescription).html();
					$scope.getAssumptionRes[index].ValidationResolution = $("<div>").html(item.ValidationResolution).html();
					$scope.getAssumptionRes[index].DateClosedC = (item.DateClosed != null) ? $scope.ConvertDateToMMDDYYYY(item.DateClosed) : '';
					$scope.getAssumptionRes[index].DateDueC = (item.DateDue != null) ? $scope.ConvertDateToMMDDYYYY(item.DateDue) : '';
					$scope.getAssumptionRes[index].DateDueCG = item.DateDue;
					$scope.getAssumptionRes[index].Delete  = null;
					$scope.getAssumptionRes[index].Edit  = null;
				});
				$('#Assumptiongrid').empty();
				$scope.LoadKendoGridAction($scope.getAssumptionRes);
			 }, function (error) {                   
				console.error('Error: ' + error.result);
			}); 

	}

	$scope.LoadKendoGridAction = function (ResData) {

		
			$("#Assumptiongrid").kendoGrid({
						toolbar: ["excel"],
						excel: {
							fileName: "Assumption.xlsx"
						},
					  dataSource: {
							data:ResData,
							schema: {
									model: {
										fields: {
											DateDueCG: {
												type: "date"
											},
											
										}
									}
							},
							sort:[ {
							field: "ItemStatus",
								dir: "asc"
							},{field: "DateDueCG",
								dir: "asc"
							},{field: "ID",
								dir: "asc"
							}]
						},
					   height: 360,
						scrollable: {
                            virtual: true
                        },
						sortable: true,

							
							filterable: {
									extra: true,
									operators: { 
										string: {   
											contains: "Contains",
											eq: "Is Equal To",
											neq: "Is not equal to",
											startswith: "Starts With",									
										},
									
									}
								},
							resizable: true,
							selectable: "cell",
							change: function (e) {
								var cell = this.select();
								var cellIndex = cell[0].cellIndex;
								var column = this.columns[cellIndex];
								var dataItem = this.dataItem(cell.closest("tr"));
								
								
								if (column.field == "Edit") {									
									$scope.EditAssumptionItemView(dataItem, column.title);
								}
								else if (column.title == "Title") {									
									$scope.EditAssumptionItemView(dataItem, column.title);
								}
								else if (column.field == "Delete") {											
											$scope.DeleteItem(dataItem);
									}
							},
				
				
				columns: [ { 
						     field: "Edit",
							 filterable:false,
							 title:'.',
							 	headerTemplate:'<label style=" color:#f3f3f4 ;" class=""></label>',
							  template: "<a id='btnEdit' class='btnEdit' title='Click to View' ><span class='pointer' style='float: right; cursor: pointer;' title='Click to Edit'><span class='k-icon k-i-edit'></span></span></a>",							
							 width: 30							 
							 },
					{ field: "ID",width:60,title:'ID',filterable:false,
						 },
						{ field: "Title",width:200,title:'Title',
							template: function(dataItem) {
								  var values = '';
							//	values = "<span>" + dataItem.Title + "<a id='btnView' class='btnView' style='float: right; ' title='Click to View' ><img border='0'  alt='edit' src='/_layouts/15/images/edititem.gif?rev=47'></a>";
 
							 values = "<span class='textdecoration' style='color: #337ab7;  cursor: pointer;'>" + dataItem.Title + "</span>";								  
								  return values;
								}
						
						
						 },
						 { field: "DateDueCG" ,width:130,title:'Date Due',
						 	template: function(dataItem) {
								  var values = '';
								  if(dataItem.DateDueCG != null){
									  values = dataItem.DateDueC;
								  }								  
								  return values;
								}
						 },
						{ field: "AssignedTo.Title" ,title:'Assigned To',filterable: {
							multi: true,
							search: true
						},
							template: function(dataItem) {
								  var values = '';
								  if(dataItem.AssignedToId != null){
									  values = "<span>" + dataItem.AssignedTo.Title + "</span>";
								  }								  
								  return values;
								}
						},
						{ field: "ResponsibleOwner.Title" ,title:'Responsible Owner',filterable: {
							multi: true,
							search: true
						},
							template: function(dataItem) {
								  var values = '';
								  if(dataItem.ResponsibleOwnerId != null){
									  values = "<span>" + dataItem.ResponsibleOwner.Title + "</span>";
								  }								  
								  return values;
								}
						},{ field: "ItemStatus" ,width:180,title:'Item Status',filterable: {
							multi: true,
							search: true
						},},{
								field: 'Delete',
								title:'.',
									headerTemplate:'<label style=" color:#f3f3f4 ;" class=""></label>',
								filterable: false,
								width: 35,
								template:'<span class="pointer" style="float: center;" title="Click to delete"><span class="k-icon k-i-trash	k-i-delete"></span></span>'
								
							},
						
					  ],
					  
					});
					$('#Assumptiongrid').width($(window).width()-270);
					if(proLen == 0){
							var grid = $("#Assumptiongrid").data("kendoGrid");
							grid.hideColumn(7);
						//	grid.hideColumn(0);
						}
						var grid = $("#Assumptiongrid").data("kendoGrid");
								var exportFlag = false;
								grid.bind("excelExport", function (e) {
									if (!exportFlag) {
										//alert(1);
										e.sender.hideColumn(0);
										e.sender.hideColumn(7);
										e.preventDefault();
										exportFlag = true;
										setTimeout(function () {
											e.sender.saveAsExcel();
										});
									} else {
										//alert(2);
										e.sender.showColumn(0);
										e.sender.showColumn(7);
										exportFlag = false;
									}
								});
	}


		$scope.DeleteItem = function(data){
				var Chktrue = confirm("Are you sure you want to delete this entry?");
				if(Chktrue){
					PService.DeleteById('Collaboration: Assumptions', data.ID).then(function (response) {
						$scope.ShowAssumption()
						//location.href = location.href.replace('#!','&#!');
						//window.location.reload();
					});
				}

		}
		$scope.AssumptionremoveFileFromList = function(item, file, index){
				
			var  ItemId= item.ID;
			var FileTitle = file.FileName
			var Chktrue = confirm("Are you sure you want to delete this attachment?");
				if(Chktrue){
					bSvc.DeleteAttachment(ItemId,FileTitle,'Collaboration: Assumptions').then(function (response) {						
						$scope.Item.Attachment.results.splice(index, 1);
					});
				}
			
		}
		$scope.SaveAssumption = function(){
			$('.btn').attr('disabled', true);
				var	ID =$scope.Item.ID;					
				var	Title=$scope.Item.Title;	
				var	AssignedTo=$scope.Item.AssignedTo;	
				var	DateClosed=$scope.Item.DateClosed;	
				var	DateDue=$scope.Item.DateDue;	
				var	ItemStatus=$scope.Item.ItemStatus;	
				var	LongDescription=$scope.Item.LongDescription;	
				var	ResponsibleOwner=$scope.Item.ResponsibleOwner;	
				var	ValidationResolution=$scope.Item.ValidationResolution;

				$scope.ischkAssumptionAlert = false;
				if(Title == null || Title == '' || ItemStatus == null || ResponsibleOwner == null){
						$('.btn').attr('disabled', false);
						$scope.ischkAssumptionAlert = true;
					return;
				}

				$scope.fileArray = [];
				$("#attachFilesHolder input:file").each(function () {
					if ($(this)[0].files[0]) {
						$scope.fileArray.push({
							"Attachment": $(this)[0].files[0]
						});
					}
				});
				var ProjectId =projId;

				var data = {
					__metadata: {
						'type': 'SP.Data.CollaborationAssumptionsListItem'
					},
					Title: Title,
					ValidationResolution:ValidationResolution,
					ResponsibleOwnerId:ResponsibleOwner != null ? ResponsibleOwner.Id :null,	
					LongDescription:LongDescription,
					ItemStatus:ItemStatus,
					DateDue:DateDue,
					DateClosed:DateClosed,					
					AssignedToId:AssignedTo != null ? AssignedTo.Id :null,			
					ProjectUID:ProjectId,	
				};	
				if(ID == null){
					PService.AddNew(data, 'Collaboration: Assumptions').then(function (response) {

						var id = response.d.Id;
				var promise = $q.all({});
					if ($scope.fileArray.length != 0) {
						promise = promise.then(function () {
								return bSvc.GetAttachmentFileBuffer($scope.fileArray[0].Attachment);
							}).then(function (filebuffer) {
								return bSvc.getFileBuffer(filebuffer, id, 'Collaboration: Assumptions', $scope.fileArray[0].Attachment);
							});					
						promise.then(function (responseAtch) {
							$scope.filesdata = [];
							$('#file_input').val('')
							$scope.ShowAssumption()
							var dialogKeyWindow = $("#KWindowAssumption").data("kendoWindow");
									dialogKeyWindow.close();
									dialogKeyWindow.center();
								//location.href = location.href.replace('#!','&#!');
									//window.location.reload();
									$('.btn').attr('disabled', false);
							
					
					}, function (error) {
						console.error('Error: ' + error.result);
						$('.btn').attr('disabled', false);
					});

				} else {
								$scope.ShowAssumption()
								var dialogKeyWindow = $("#KWindowAssumption").data("kendoWindow");
									dialogKeyWindow.close();
									dialogKeyWindow.center();
							//	location.href = location.href.replace('#!','&#!');
									//window.location.reload();
									$('.btn').attr('disabled', false);
				}

							}, function (error) {    
									$('.btn').attr('disabled', false);               
								console.error('Error:SaveAssumption ' + error.result);
							});
				}
				if(ID != null){
						PService.Update(data, 'Collaboration: Assumptions',ID).then(function (response) {

							var promise = $q.all({});
					if ($scope.fileArray.length != 0) {

						promise = promise.then(function () {
								return bSvc.GetAttachmentFileBuffer($scope.fileArray[0].Attachment);
							}).then(function (filebuffer) {
								return bSvc.getFileBuffer(filebuffer, ID, 'Collaboration: Assumptions', $scope.fileArray[0].Attachment);
							});
						
						promise.then(function (responseAtch) {
							$scope.filesdata = [];
							$('#file_input').val('')
							$scope.ShowAssumption()
							var dialogKeyWindow = $("#KWindowAssumption").data("kendoWindow");
								dialogKeyWindow.close();
								dialogKeyWindow.center();
							//	window.location.reload();
							// location.href = location.href.replace('#!','&#!');
							// window.location.reload();

									$('.btn').attr('disabled', false);
					
					}, function (error) {
						console.error('Error: ' + error.result);
						$('.btn').attr('disabled', false);
					});

				} else {
							$scope.ShowAssumption()
							var dialogKeyWindow = $("#KWindowAssumption").data("kendoWindow");
								dialogKeyWindow.close();
								dialogKeyWindow.center();
							//	window.location.reload();
							//location.href = location.href.replace('#!','&#!');
							// window.location.reload();

									$('.btn').attr('disabled', false);
				}

						}, function (error) {    
								$('.btn').attr('disabled', false);               
							console.error('Error:SaveAssumption ' + error.result);
						});	

					}

		}
		$scope.ConvertDateToMMDDYYYY = function (dDate) {
			
			if (dDate != undefined) {
				if (dDate != null) {
					
					var months = new Array(12);
						months[0] = "null";
						months[1] = "Jan";
						months[2] = "Feb";
						months[3] = "Mar";
						months[4] = "Apr";
						months[5] = "May";
						months[6] = "Jun";
						months[7] = "Jul";
						months[8] = "Aug";
						months[9] = "Sep";
						months[10] = "Oct";
						months[11] = "Nov";
						months[12] = "Dec";
					var SplitdDate = dDate.split('T')[0]
					var year = SplitdDate.split("-")[0]
					var Month;
					if(SplitdDate.split("-")[1] <10){						
						Month =SplitdDate.split("-")[1].slice(1, 2);
					}else{
					     Month= SplitdDate.split("-")[1]
					  }
						Month = months[Month]
					var day = SplitdDate.split("-")[2]
					
					var dateformate = day+"-"+Month+"-"+year
					
					return dateformate;//new Date(dDate).format("dd-MMM-yyyy");
				}
			}
		}
		$scope.CloseAssumptionForm = function(){
			$('.btn').attr('disabled', false);
		 	var Chktrue = confirm("Are you sure you want to close this window?");
				if(Chktrue){
				    var dialogKeyWindow = $("#KWindowAssumption").data("kendoWindow");
						dialogKeyWindow.close();
						dialogKeyWindow.center();
				}
		}


}]);

KendoPApp.controller('ProjectcollabProjectChangeRequestController', ['$scope', "$http", "$q", "$location","$sce", 'baseSvc', 'ProjectkFactoryService',
function ($scope, $http, $q, $location, $sce, bSvc, PService) {
	$scope.init = function(){
		
		if(window.location.hash === "#!/ProjectChangeRequest"){				
			$location.path('/ProjectChangeRequest');
			$scope.ShowProjectChangeRequest();
		 }
	}


	
	$scope.EditProjectChangeRequest = function(){
		 $scope.ViewMode = false;		 
	}

	$scope.to_trusted = function (html_code) {
			return $sce.trustAsHtml(html_code);
		}

			
	$scope.AddNewItemWindow = function () {
		$scope.ischkProjectChangeRequestAlert = false;
		var valuefil = 1
		if (location.hostname == 'projectmadeeasy.sharepoint.com') {
			var url = SpURL + "/_api/web/lists/getByTitle('Collaboration: Lookups')/items?$top=4998&$select=*&$filter=Default eq '" + valuefil + "'&$orderby=ID desc";
		} else {
			var url = "Lookups.json";
		}
			PService.GetAllItems('Collaboration: Lookups', url).then(function (response) {			
				$scope.getDefaultValueLookup = [];
				$scope.ChangeRequestStatusDefault =[];					
				angular.forEach(response.d.results, function (item, index) {
					$scope.getDefaultValueLookup.push(item)
					if(item.Select_x0020_Title == 'Change Request Status'){
						$scope.ChangeRequestStatusDefault.push(item.Title);
					}
				});
			$scope.Item = {
					ID: null,					
					Title: null,
					BudgetImpact: null,
					AnticipatedScheduleImpact: null,
					ApprovedBy: null,
					AssignedTo: null,
					ChangeRequestPriority: null,
					ChangeRequestStatus: $scope.ChangeRequestStatusDefault.length != 0 ?$scope.ChangeRequestStatusDefault[0]:null,
					DateApproved: null,
					DateRequested: null,
					ImpactofNotApprovingChange: null,
					ImpactonDeliverables: null,
					ImpactonSchedule: null,
					ImpacttoVendor: null,
					ProjectChangeRequestDescription: null,
					ReasonforChange: null,
					ReasonRejectionDeferral: null,
					Requestor: null,
			 }
			  $scope.ViewMode = false;
			 $('.btn').attr('disabled', false);
			 $scope.filesdata = []
				$('#file_input').val('')
			var dialogKeyWindow = $("#KWindowProjectChangeRequest").data("kendoWindow");
			dialogKeyWindow.open();
			dialogKeyWindow.center();
			}, function (error) {                   
				console.error('Error: ' + error.result);
			});
		}

		$scope.EditProjectChangeRequestItemView = function (data,ItemView) {
		$scope.ischkProjectChangeRequestAlert = false;
		 $scope.ViewMode = false;	
			if(ItemView == 'Title'){
			$scope.ViewMode = true;	
			}
			$scope.Item = {
					ID: data.ID,					
					Title: data.Title,
					BudgetImpact: data.BudgetImpact,
					AnticipatedScheduleImpact: data.AnticipatedScheduleImpact,
					ApprovedBy: data.ApprovedBy,
					AssignedTo: data.AssignedTo,
					ChangeRequestPriority: data.ChangeRequestPriority,
					ChangeRequestStatus: data.ChangeRequestStatus,
					DateApproved: data.DateApproved,
					DateRequested: data.DateRequested,
					ImpactofNotApprovingChange: data.ImpactofNotApprovingChange,
					ImpactonDeliverables: data.ImpactonDeliverables,
					ImpactonSchedule: data.ImpactonSchedule,
					ImpacttoVendor: data.ImpacttoVendor,
					ProjectChangeRequestDescription: data.ProjectChangeRequestDescription,
					ReasonforChange: data.ReasonforChange,
					ReasonRejectionDeferral: data.ReasonRejectionDeferral,
					Requestor: data.Requestor,
					Attachment:data.AttachmentFiles,		
			 }
			 // $scope.ViewMode = true;
			 $('.btn').attr('disabled', false);
			 $scope.filesdata = []
				$('#file_input').val('')
			var dialogKeyWindow = $("#KWindowProjectChangeRequest").data("kendoWindow");
			dialogKeyWindow.open();
			dialogKeyWindow.center();
		}

		$scope.ShowProjectChangeRequest = function(filterval){
			$('ul.nav li.active').removeClass('active');
		    $("a[name^=ProjectChangeRequest]").closest('li').addClass('active').hover();
			var UID = projId;
			
			var url ;
			if (location.hostname == 'projectmadeeasy.sharepoint.com') {
			if(filterval != null && filterval != undefined && filterval != ''){
				//url = _spPageContextInfo.siteAbsoluteUrl + "/_api/web/lists/getByTitle('Risks')/items?$top=4998&$select=*,BarriersAssignedTo/Name,BarriersAssignedTo/Title,BarriersAssignedTo/Id,AssignedTo/Name,AssignedTo/Title,AssignedTo/Id,RiskAssignedTo/Name,RiskAssignedTo/Title,RiskAssignedTo/Id,RiskOwner/Name,RiskOwner/Title,RiskOwner/Id,Attachments,AttachmentFiles&$expand=AttachmentFiles,BarriersAssignedTo/Id,AssignedTo/Id,RiskAssignedTo/Id,RiskOwner/Id&$filter=RiskStatus eq '" + filterval + "'and ProjectUID eq '" + UID + "'&$orderby=ID desc";
				url = SpURL + "/_api/web/lists/getByTitle('Collaboration: Project Change Requests')/items?$top=4998&$select=*,AssignedTo/Name,AssignedTo/Title,AssignedTo/Id,ApprovedBy/Name,ApprovedBy/Title,ApprovedBy/Id,Attachments,AttachmentFiles&$expand=AttachmentFiles,AssignedTo/Id,ApprovedBy/Id&$filter=ChangeRequestStatus eq '" + filterval + "'and ProjectUID eq '" + UID + "'&$orderby=ID desc";
			}else{
				url = SpURL + "/_api/web/lists/getByTitle('Collaboration: Project Change Requests')/items?$top=4998&$select=*,AssignedTo/Name,AssignedTo/Title,AssignedTo/Id,ApprovedBy/Name,ApprovedBy/Title,ApprovedBy/Id,Attachments,AttachmentFiles&$expand=AttachmentFiles,AssignedTo/Id,ApprovedBy/Id&$filter=ProjectUID eq '" + UID + "'&$orderby=ID desc";
			}}else{
				url='Project Change Requests.json';
			}
			
			
			
			PService.GetAllItems('Collaboration: Assumptions', url).then(function (response) {			
				$scope.getProjectChangeRequestRes = [];
				angular.forEach(response.d.results, function (item, index) {
					$scope.getProjectChangeRequestRes.push(item)
					$scope.getProjectChangeRequestRes[index].ReasonRejectionDeferral = $("<div>").html(item.ReasonRejectionDeferral).html();
					$scope.getProjectChangeRequestRes[index].ImpactofNotApprovingChange = $("<div>").html(item.ImpactofNotApprovingChange).html();
					$scope.getProjectChangeRequestRes[index].DateRequestedC = (item.DateRequested != null) ? $scope.ConvertDateToMMDDYYYY(item.DateRequested) : '';
					$scope.getProjectChangeRequestRes[index].DateApprovedC = (item.DateApproved != null) ? $scope.ConvertDateToMMDDYYYY(item.DateApproved) : '';
					$scope.getProjectChangeRequestRes[index].Delete  = null;
					$scope.getProjectChangeRequestRes[index].Edit  = null;
				});
				$('#ProjectChangeRequestgrid').empty();
				$scope.LoadKendoGridAction($scope.getProjectChangeRequestRes);
			 }, function (error) {                   
				console.error('Error: ' + error.result);
			}); 

	}

	$scope.LoadKendoGridAction = function (ResData) {

		
			$("#ProjectChangeRequestgrid").kendoGrid({
						toolbar: ["excel"],
						excel: {
							fileName: "ProjectChangeRequest.xlsx"
						},
					  dataSource: {
							data:ResData,
							sort:[ {
							field: "ChangeRequestStatus",
								dir: "asc"
							},{
							field: "ChangeRequestPriority",
								dir: "asc"
							},{
							field: "ID",
								dir: "asc"
							}]
						},
					   height: 360,
						scrollable: {
                            virtual: true
                        },
						sortable: true,

							
							filterable: {
									extra: true,
									operators: { 
										string: {   
											contains: "Contains",
											eq: "Is Equal To",
											neq: "Is not equal to",
											startswith: "Starts With",									
										},
									
									}
								},
							resizable: true,
							selectable: "cell",
							change: function (e) {
								var cell = this.select();
								var cellIndex = cell[0].cellIndex;
								var column = this.columns[cellIndex];
								var dataItem = this.dataItem(cell.closest("tr"));
								
								
								if (column.field == "Edit") {									
									$scope.EditProjectChangeRequestItemView(dataItem, column.title);
								}
								else if (column.title == "Title") {									
									$scope.EditProjectChangeRequestItemView(dataItem, column.title);
								}
								else if (column.field == "Delete") {											
											$scope.DeleteItem(dataItem);
									}
							},
				
				
				columns: [ { 
						     field: "Edit",
							 filterable:false,
							 title:'.',
							 	headerTemplate:'<label style=" color:#f3f3f4 ;" class=""></label>',
							  template: "<a id='btnEdit' class='btnEdit' title='Click to View' ><span class='pointer' style='float: right; cursor: pointer;' title='Click to Edit'><span class='k-icon k-i-edit'></span></span></a>",							
							 width: 30							 
							 },
					{ field: "ID",width:60,title:'ID',filterable:false,
						 },
						{ field: "Title",width:200,title:'Title',
							template: function(dataItem) {
								  var values = '';
									// values = "<span>" + dataItem.Title + "<a id='btnView' class='btnView' style='float: right; ' title='Click to View' ><img border='0'  alt='edit' src='/_layouts/15/images/edititem.gif?rev=47'></a>";
				values = "<span class='textdecoration' style='color: #337ab7;  cursor: pointer;'>" + dataItem.Title + "</span>";
															  
								  return values;
								}
						
						
						 },

						 { field: "ChangeRequestStatus" ,width:220,title:'Change Request Status',filterable: {
							multi: true,
							search: true
						},},
						 { field: "ChangeRequestPriority" ,width:220,title:'Change Request Priority',},
						  { field: "BudgetImpact" ,width:220,title:'Anticipated Budget Impact',},
 						{ field: "AnticipatedScheduleImpact" ,width:250,title:'Anticipated Schedule Impact',},

						
						{ field: "AssignedTo.Title" ,width:180,title:'Assigned To',filterable: {
							multi: true,
							search: true
						},
							template: function(dataItem) {
								  var values = '';
								  if(dataItem.AssignedToId != null){
									  values = "<span>" + dataItem.AssignedTo.Title + "</span>";
								  }								  
								  return values;
								}
						},
							 { field: "DateRequestedC" ,width:160,title:'Date Requested',},
						  { field: "Requestor" ,width:130,title:'Requestor',},
						   { field: "DateApprovedC" ,width:160,title:'Date Approved',},
						  
						{ field: "ApprovedBy.Title" ,width:180,title:'Approved By',filterable: {
							multi: true,
							search: true
						},
							template: function(dataItem) {
								  var values = '';
								  if(dataItem.ApprovedById != null){
									  values = "<span>" + dataItem.ApprovedBy.Title + "</span>";
								  }								  
								  return values;
								}
						},{
								field:'Delete',
								title: '.',
								filterable: false,
								width: 35,
									headerTemplate:'<label style=" color:#f3f3f4 ;" class=""></label>',
								template:'<span class="pointer" style="float: center;" title="Click to delete"><span class="k-icon k-i-trash	k-i-delete"></span></span>'
								
							},
						
					  ],
					  
					});
					$('#ProjectChangeRequestgrid').width($(window).width()-270);
					if(proLen == 0){
							var grid = $("#ProjectChangeRequestgrid").data("kendoGrid");
							grid.hideColumn(12);
						//	grid.hideColumn(0);
						}
						var grid = $("#ProjectChangeRequestgrid").data("kendoGrid");
								var exportFlag = false;
								grid.bind("excelExport", function (e) {
									if (!exportFlag) {
										//alert(1);
										e.sender.hideColumn(0);
										e.sender.hideColumn(12);
										e.preventDefault();
										exportFlag = true;
										setTimeout(function () {
											e.sender.saveAsExcel();
										});
									} else {
										//alert(2);
										e.sender.showColumn(0);
										e.sender.showColumn(12);
										exportFlag = false;
									}
								});
	}


		$scope.DeleteItem = function(data){
				var Chktrue = confirm("Are you sure you want to delete this entry?");
				if(Chktrue){
					PService.DeleteById('Collaboration: Project Change Requests', data.ID).then(function (response) {
						//location.href = location.href.replace('#!','&#!');
						$scope.ShowProjectChangeRequest();
						//window.location.reload();
					});
				}

		}
		$scope.PCRremoveFileFromList = function(item, file, index){				
			var  ItemId= item.ID;
			var FileTitle = file.FileName
			var Chktrue = confirm("Are you sure you want to delete this attachment?");
				if(Chktrue){
					bSvc.DeleteAttachment(ItemId,FileTitle,'Collaboration: Project Change Requests').then(function (response) {						
						$scope.Item.Attachment.results.splice(index, 1);
					});
				}
			
		}

		$scope.SaveProjectChangeRequest = function(){
			$('.btn').attr('disabled', true);
				var	ID =$scope.Item.ID;					
				var	Title=$scope.Item.Title;
				var	BudgetImpact=$scope.Item.BudgetImpact;
				var	AnticipatedScheduleImpact=$scope.Item.AnticipatedScheduleImpact;
				var	ApprovedBy=$scope.Item.ApprovedBy;
				var	AssignedTo=$scope.Item.AssignedTo;
				var	ChangeRequestPriority=$scope.Item.ChangeRequestPriority;
				var	ChangeRequestStatus=$scope.Item.ChangeRequestStatus;
				var	DateApproved=$scope.Item.DateApproved;
				var	DateRequested=$scope.Item.DateRequested;
				var	ImpactofNotApprovingChange=$scope.Item.ImpactofNotApprovingChange;
				var	ImpactonDeliverables=$scope.Item.ImpactonDeliverables;
				var	ImpactonSchedule=$scope.Item.ImpactonSchedule;
				var	ImpacttoVendor=$scope.Item.ImpacttoVendor;
				var	ProjectChangeRequestDescription=$scope.Item.ProjectChangeRequestDescription;
				var	ReasonforChange=$scope.Item.ReasonforChange;
				var	ReasonRejectionDeferral=$scope.Item.ReasonRejectionDeferral;
				var	Requestor=$scope.Item.Requestor;

				$scope.ischkProjectChangeRequestAlert = false;
				if(Title == null || Title == '' || Requestor == null || Requestor == '' || ProjectChangeRequestDescription == null || ProjectChangeRequestDescription == '' || DateRequested == null || DateRequested == '' || ChangeRequestPriority == null || ChangeRequestPriority == '' || ChangeRequestStatus == null || ChangeRequestStatus == ''){
						$('.btn').attr('disabled', false);
						$scope.ischkProjectChangeRequestAlert = true;
					return;
				}
				$scope.fileArray = [];
				$("#attachFilesHolder input:file").each(function () {
					if ($(this)[0].files[0]) {
						$scope.fileArray.push({
							"Attachment": $(this)[0].files[0]
						});
					}
				});
				var ProjectId =projId;

				var data = {
					__metadata: {
						'type': 'SP.Data.CollaborationProjectChangeRequestsListItem'
					},
					Title: Title,
					BudgetImpact: BudgetImpact,
					AnticipatedScheduleImpact: AnticipatedScheduleImpact,
					ApprovedById:ApprovedBy != null ? ApprovedBy.Id :null,
					ChangeRequestPriority: ChangeRequestPriority,
					ChangeRequestStatus: ChangeRequestStatus,
					DateApproved: DateApproved,
					DateRequested: DateRequested,
					ImpactofNotApprovingChange: ImpactofNotApprovingChange,
					ImpactonDeliverables: ImpactonDeliverables,
					ImpactonSchedule: ImpactonSchedule,
					ImpacttoVendor: ImpacttoVendor,
					ProjectChangeRequestDescription: ProjectChangeRequestDescription,
					ReasonforChange: ReasonforChange,
					ReasonRejectionDeferral: ReasonRejectionDeferral,
					Requestor: Requestor,				
					AssignedToId:AssignedTo != null ? AssignedTo.Id :null,			
					ProjectUID:ProjectId,	
				};	
				if(ID == null){
					PService.AddNew(data, 'Collaboration: Project Change Requests').then(function (response) {
						var id = response.d.Id;
				var promise = $q.all({});
					if ($scope.fileArray.length != 0) {
						promise = promise.then(function () {
								return bSvc.GetAttachmentFileBuffer($scope.fileArray[0].Attachment);
							}).then(function (filebuffer) {
								return bSvc.getFileBuffer(filebuffer, id, 'Collaboration: Project Change Requests', $scope.fileArray[0].Attachment);
							});					
						promise.then(function (responseAtch) {
							$scope.filesdata = [];
							$('#file_input').val('')
							$scope.ShowProjectChangeRequest();
								var dialogKeyWindow = $("#KWindowProjectChangeRequest").data("kendoWindow");
									dialogKeyWindow.close();
									dialogKeyWindow.center();
								//location.href = location.href.replace('#!','&#!');
									//window.location.reload();
									$('.btn').attr('disabled', false);
							
					
					}, function (error) {
						console.error('Error: ' + error.result);
						$('.btn').attr('disabled', false);
					});

				} else {
					$scope.ShowProjectChangeRequest();
								var dialogKeyWindow = $("#KWindowProjectChangeRequest").data("kendoWindow");
									dialogKeyWindow.close();
									dialogKeyWindow.center();
								//location.href = location.href.replace('#!','&#!');
									//window.location.reload();
									$('.btn').attr('disabled', false);
					}

							}, function (error) {    
									$('.btn').attr('disabled', false);               
								console.error('Error:SaveProjectChangeRequest ' + error.result);
							});
				}
				if(ID != null){
						PService.Update(data, 'Collaboration: Project Change Requests',ID).then(function (response) {

						var promise = $q.all({});
					if ($scope.fileArray.length != 0) {

						promise = promise.then(function () {
								return bSvc.GetAttachmentFileBuffer($scope.fileArray[0].Attachment);
							}).then(function (filebuffer) {
								return bSvc.getFileBuffer(filebuffer, ID, 'Collaboration: Project Change Requests', $scope.fileArray[0].Attachment);
							});
						
									promise.then(function (responseAtch) {
										$scope.filesdata = [];
										$('#file_input').val('')
										$scope.ShowProjectChangeRequest();
										var dialogKeyWindow = $("#KWindowProjectChangeRequest").data("kendoWindow");
								dialogKeyWindow.close();
								dialogKeyWindow.center();
							//	window.location.reload();
							// location.href = location.href.replace('#!','&#!');
							 //window.location.reload();

									$('.btn').attr('disabled', false);
								
								}, function (error) {
									console.error('Error: ' + error.result);
									$('.btn').attr('disabled', false);
								});

							} else {
								$scope.ShowProjectChangeRequest();
							var dialogKeyWindow = $("#KWindowProjectChangeRequest").data("kendoWindow");
								dialogKeyWindow.close();
								dialogKeyWindow.center();
							//	window.location.reload();
							//location.href = location.href.replace('#!','&#!');
							// window.location.reload();

									$('.btn').attr('disabled', false);
						}

						}, function (error) {    
								$('.btn').attr('disabled', false);               
							console.error('Error:SaveProjectChangeRequest ' + error.result);
						});	

					}

		}
		$scope.ConvertDateToMMDDYYYY = function (dDate) {
			
			if (dDate != undefined) {
				if (dDate != null) {
					
					var months = new Array(12);
						months[0] = "null";
						months[1] = "Jan";
						months[2] = "Feb";
						months[3] = "Mar";
						months[4] = "Apr";
						months[5] = "May";
						months[6] = "Jun";
						months[7] = "Jul";
						months[8] = "Aug";
						months[9] = "Sep";
						months[10] = "Oct";
						months[11] = "Nov";
						months[12] = "Dec";
					var SplitdDate = dDate.split('T')[0]
					var year = SplitdDate.split("-")[0]
					var Month;
					if(SplitdDate.split("-")[1] <10){						
						Month =SplitdDate.split("-")[1].slice(1, 2);
					}else{
					     Month= SplitdDate.split("-")[1]
					  }
						Month = months[Month]
					var day = SplitdDate.split("-")[2]
					
					var dateformate = day+"-"+Month+"-"+year
					
					return dateformate;//new Date(dDate).format("dd-MMM-yyyy");
				}
			}
		}
		$scope.CloseProjectChangeRequestForm = function(){
			$('.btn').attr('disabled', false);
		 	var Chktrue = confirm("Are you sure you want to close this window?");
				if(Chktrue){
				    var dialogKeyWindow = $("#KWindowProjectChangeRequest").data("kendoWindow");
						dialogKeyWindow.close();
						dialogKeyWindow.center();
				}
		}


}]);

KendoPApp.controller('ProjectcollabStatusMainController', ['$scope', "$http", "$q", "$location","$sce", 'baseSvc', 'ProjectkFactoryService',
function ($scope, $http, $q, $location, $sce, bSvc, PService) {
	$scope.init = function(){
		
		if(window.location.hash === "#!/StatusMain"){				
			$location.path('/StatusMain');
			$scope.ShowStatusMain();
		 }
	}


	$scope.EditStatusMain = function(){
		 $scope.ViewMode = false;		 
	}

	

	$scope.to_trusted = function (html_code) {
			return $sce.trustAsHtml(html_code);
		}
	
	$scope.AddNewItemWindow = function () {
		$scope.ischkStatusMainAlert = false;

		var FV = $('.ms-formlabel :contains("Finish Variance")').closest('td').next().text().trim()
		var BD = $('.ms-formlabel :contains("Baseline Duration")').closest('td').next().text().trim()
		 var FVS = 0		
		 if(FV != ''){
				FVS = FV.split('d')[0]
		 }
		 var BDS = 0
		  if(BD != ''){	
			  BDS = BD.split('d')[0]    		 
		 }

			var BaselineDuration = BDS;
			var FinishVariance = FVS;
		//	var BaselineDuration = 1.5;
			var ScheduleHealth = null;

			//alert(BaselineDuration +'a'+ FinishVariance)
		
			 if(BaselineDuration == 0){
					ScheduleHealth = 'Grey';
			}
			else if((FinishVariance / BaselineDuration) > 0.20 || (FinishVariance / BaselineDuration) < -0.20){
				ScheduleHealth = 'Red';
			}
			else if((FinishVariance / BaselineDuration) > 0.10 || (FinishVariance / BaselineDuration) < -0.10){
				ScheduleHealth = 'Yellow';
			}
			else{
				ScheduleHealth = 'Green';
				}

			var BW = $('.ms-formlabel :contains("Baseline Work")').closest('td').next().text().trim()
			var WV = $('.ms-formlabel :contains("Work Variance")').closest('td').next().text().trim()

			var BWS = 0		
			if(BW != ''){
					BWS = BW.split('h')[0]
			}
			var WVS = 0
			if(WV != ''){	
				WVS = WV.split('h')[0]    		 
			}
			var BaselineWork = BWS;
			var	WorkVariance = WVS;
			var ResourceHealth = null;

			 if(BaselineWork == 0){
					ResourceHealth = 'Grey';
			}
			else if((WorkVariance / BaselineWork) > 0.15 || (WorkVariance / BaselineWork) < -0.15){
				ResourceHealth = 'Red';
			}
			else if((WorkVariance / BaselineWork) > 0.10 || (WorkVariance / BaselineWork) < -0.10){
				ResourceHealth = 'Yellow';
			}
			else{
				ResourceHealth = 'Green';
				}
			var OverallHealth = null;
				if(ResourceHealth == 'Red' || ScheduleHealth == 'Red'){
					OverallHealth = 'Red';
				}
				else if(ResourceHealth == 'Yellow' || ScheduleHealth == 'Yellow'){
					OverallHealth = 'Yellow';
				}
				else if(ResourceHealth == 'Green' || ScheduleHealth == 'Green'){
					OverallHealth = 'Green';
				}
				else if(ResourceHealth == 'Grey' || ScheduleHealth == 'Grey'){
					OverallHealth = 'Grey';
				}

			$scope.Item = {
					ID: null,					
					Title: null,
					ExecSummary: null,
					Outlook: null,
					Progress: null,
					StatusDate: null,
					SystemBudgetHealth: null,
					SystemOverallHealth: OverallHealth,
					SystemResourceHealth: ResourceHealth,
					SystemScheduleHealth: ScheduleHealth,
					UserBudgetHealth: null,
					UserOverallHealth: OverallHealth,
					UserResourceHealth: ResourceHealth,
					UserScheduleHealth: ScheduleHealth,
			 }
			  $scope.ViewMode = false;
			 $('.btn').attr('disabled', false);
			 $scope.filesdata = []
				$('#file_input').val('')
			var dialogKeyWindow = $("#KWindowStatusMain").data("kendoWindow");
			dialogKeyWindow.open();
			dialogKeyWindow.center();
		}

	$scope.EditStatusMainItemView = function (data,ItemView) {
		$scope.ischkStatusMainAlert = false;
		
		var FV = $('.ms-formlabel :contains("Finish Variance")').closest('td').next().text().trim()
		var BD = $('.ms-formlabel :contains("Baseline Duration")').closest('td').next().text().trim()
		 var FVS = 0		
		 if(FV != ''){
				FVS = FV.split('d')[0]
		 }
		 var BDS = 0
		  if(BD != ''){	
			  BDS = BD.split('d')[0]    		 
		 }

			var BaselineDuration = BDS;
			var FinishVariance = FVS;
		//	var BaselineDuration = 1.5;
			var ScheduleHealth = null;

			//alert(BaselineDuration +'a'+ FinishVariance)
		
			 if(BaselineDuration == 0){
					ScheduleHealth = 'Grey';
			}
			else if((FinishVariance / BaselineDuration) > 0.20 || (FinishVariance / BaselineDuration) < -0.20){
				ScheduleHealth = 'Red';
			}
			else if((FinishVariance / BaselineDuration) > 0.10 || (FinishVariance / BaselineDuration) < -0.10){
				ScheduleHealth = 'Yellow';
			}
			else{
				ScheduleHealth = 'Green';
				}

			var BW = $('.ms-formlabel :contains("Baseline Work")').closest('td').next().text().trim()
			var WV = $('.ms-formlabel :contains("Work Variance")').closest('td').next().text().trim()

			var BWS = 0		
			if(BW != ''){
					BWS = BW.split('h')[0]
			}
			var WVS = 0
			if(WV != ''){	
				WVS = WV.split('h')[0]    		 
			}
			var BaselineWork = BWS;
			var	WorkVariance = WVS;
			var ResourceHealth = null;

			 if(BaselineWork == 0){
					ResourceHealth = 'Grey';
			}
			else if((WorkVariance / BaselineWork) > 0.15 || (WorkVariance / BaselineWork) < -0.15){
				ResourceHealth = 'Red';
			}
			else if((WorkVariance / BaselineWork) > 0.10 || (WorkVariance / BaselineWork) < -0.10){
				ResourceHealth = 'Yellow';
			}
			else{
				ResourceHealth = 'Green';
				}
			var OverallHealth = null;
				if(ResourceHealth == 'Red' || ScheduleHealth == 'Red'){
					OverallHealth = 'Red';
				}
				else if(ResourceHealth == 'Yellow' || ScheduleHealth == 'Yellow'){
					OverallHealth = 'Yellow';
				}
				else if(ResourceHealth == 'Green' || ScheduleHealth == 'Green'){
					OverallHealth = 'Green';
				}
				else if(ResourceHealth == 'Grey' || ScheduleHealth == 'Grey'){
					OverallHealth = 'Grey';
				}
		 $scope.ViewMode = false;	
			if(ItemView == 'Title'){
			$scope.ViewMode = true;	
			}
			$scope.Item = {
					ID: data.ID,					
					Title: data.Title,
					ExecSummary: data.ExecSummary,
					Outlook: data.Outlook,
					Progress: data.Progress,
					StatusDate: data.StatusDate,
					SystemBudgetHealth: data.UserBudgetHealth,
					SystemOverallHealth: data.UserOverallHealth,
					SystemResourceHealth: data.UserResourceHealth,
					SystemScheduleHealth: data.UserScheduleHealth,
					UserBudgetHealth: null,
					UserOverallHealth: OverallHealth,
					UserResourceHealth: ResourceHealth,
					UserScheduleHealth: ScheduleHealth, 

				/*	SystemBudgetHealth: null,
					SystemOverallHealth: OverallHealth,
					SystemResourceHealth: ResourceHealth,
					SystemScheduleHealth: ScheduleHealth,
					UserBudgetHealth: data.UserBudgetHealth,
					UserOverallHealth: OverallHealth,
					UserResourceHealth: ResourceHealth,
					UserScheduleHealth: ScheduleHealth,*/


					Attachment:data.AttachmentFiles,
			 }
			//  $scope.ViewMode = true;
			 $('.btn').attr('disabled', false);
			 $scope.filesdata = []
				$('#file_input').val('')
			var dialogKeyWindow = $("#KWindowStatusMain").data("kendoWindow");
			dialogKeyWindow.open();
			dialogKeyWindow.center();
		}

		$scope.changeHealth = function(){

				var	BudgetHealth = $scope.Item.SystemBudgetHealth
				var	ResourceHealth = $scope.Item.SystemResourceHealth
				var	ScheduleHealth =$scope.Item.SystemScheduleHealth

				var OverallHealth = null;
				if(ResourceHealth == 'Red' || ScheduleHealth == 'Red' || BudgetHealth == 'Red'){
					OverallHealth = 'Red';
				}
				else if(ResourceHealth == 'Yellow' || ScheduleHealth == 'Yellow' || BudgetHealth == 'Yellow'){
					OverallHealth = 'Yellow';
				}
				else if(ResourceHealth == 'Green' || ScheduleHealth == 'Green' || BudgetHealth == 'Yellow'){
					OverallHealth = 'Green';
				}
				else if(ResourceHealth == 'Grey' || ScheduleHealth == 'Grey' || BudgetHealth == 'Grey'){
					OverallHealth = 'Grey';
				}

				$scope.Item.SystemOverallHealth = OverallHealth;
		}

	$scope.ShowStatusMain = function(){	 
		$('ul.nav li.active').removeClass('active');
		    $("a[name^=StatusMain]").closest('li').addClass('active').hover();
			var UID = projId;

			var today = new Date();
			var firstDayOfYear = new Date(today.getFullYear(), 0, 1);
			var pastDaysOfYear = (today - firstDayOfYear) / 86400000;
			var weeknumchk =  Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
			$scope.WeekNumberIstrue = false;
			//	alert(weeknumchk)
if (location.hostname == 'projectmadeeasy.sharepoint.com') {
			var url = SpURL + "/_api/web/lists/getByTitle('Collaboration: Status')/items?$top=4998&$select=*,Attachments,AttachmentFiles&$expand=AttachmentFiles&$filter=ProjectUID eq '" + UID + "'&$orderby=ID desc";} else { var url = "Status.json"; }
			PService.GetAllItems('Collaboration: Status', url).then(function (response) {			
				$scope.getStatusMainRes = [];
				angular.forEach(response.d.results, function (item, index) {
					$scope.getStatusMainRes.push(item)					
					$scope.getStatusMainRes[index].StatusDateC = (item.StatusDate != null) ? $scope.ConvertDateToMMDDYYYY(item.StatusDate) : '';
				//	$scope.getStatusMainRes[index].StatusDate =  (item.StatusDate != null) ? $scope.ConvertDateToMMDDYYYY(item.StatusDate) : '';
					$scope.getStatusMainRes[index].Title  = 'Status : ' +$scope.ConvertDateToMMDDYYYY(item.StatusDate) ;//StatusDate
					$scope.getStatusMainRes[index].Delete  = null;
					$scope.getStatusMainRes[index].Edit  = null;

					var today = new Date(item.Created);
					var firstDayOfYear = new Date(today.getFullYear(), 0, 1);
					var pastDaysOfYear = (today - firstDayOfYear) / 86400000;
					var weeknum =  Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
							if(weeknum == weeknumchk){
								$scope.WeekNumberIstrue = true;
							}
					
				});

				if($scope.getStatusMainRes.length != 0 ){
							$('input[title="System Budget Health"]').val($scope.getStatusMainRes[0].SystemBudgetHealth);
							$('input[title="System Overall Health"]').val($scope.getStatusMainRes[0].SystemOverallHealth);
							$('input[title="System Resource Health"]').val($scope.getStatusMainRes[0].SystemResourceHealth);
							$('input[title="System Schedule Health"]').val($scope.getStatusMainRes[0].SystemScheduleHealth);
							$('input[title="User Budget Health"]').val($scope.getStatusMainRes[0].UserBudgetHealth);
							$('input[title="User Overall Health"]').val($scope.getStatusMainRes[0].UserOverallHealth);
							$('input[title="User Resource Health"]').val($scope.getStatusMainRes[0].UserResourceHealth);
							$('input[title="User Schedule Health"]').val($scope.getStatusMainRes[0].UserScheduleHealth);
							$('input[title="System Overall Health"]').change(); 
				}
				else{
							
							$('input[title="User Budget Health"]').val('');
							$('input[title="User Overall Health"]').val('');
							$('input[title="User Resource Health"]').val('');
							$('input[title="User Schedule Health"]').val('');
							$('input[title="User Budget Health"]').change(); 
				}
				$('#StatusMaingrid').empty();
				$scope.LoadKendoGridAction($scope.getStatusMainRes);
			 }, function (error) {                   
				console.error('Error: ' + error.result);
			}); 

	}

	$scope.DeleteItem = function(data){
				var Chktrue = confirm("Are you sure you want to delete this entry?");
				if(Chktrue){
					PService.DeleteById('Collaboration: Status', data.ID).then(function (response) {
						$scope.ShowStatusMain();
						//location.href = location.href.replace('#!','&#!');
						//window.location.reload();
					});
				}

		}

	$scope.LoadKendoGridAction = function (ResData) {

		
			$("#StatusMaingrid").kendoGrid({
						toolbar: ["excel"],
						excel: {
							fileName: "StatusMain.xlsx"
						},
					  dataSource: {
							data:ResData,
							sort:[ {
							field: "ID",
								dir: "asc"
							}]
						},
					   height: 360,
						scrollable: {
                            virtual: true
                        },
						sortable: true,

							
							filterable: {
									extra: true,
									operators: { 
										string: {   
											contains: "Contains",
											eq: "Is Equal To",
											neq: "Is not equal to",
											startswith: "Starts With",									
										},
									
									}
								},
							resizable: true,
							selectable: "cell",
							change: function (e) {
								var cell = this.select();
								var cellIndex = cell[0].cellIndex;
								var column = this.columns[cellIndex];
								var dataItem = this.dataItem(cell.closest("tr"));
								
								
								if (column.field == "Edit") {									
									$scope.EditStatusMainItemView(dataItem, column.title);
								}
								else if (column.title == "Title") {									
									$scope.EditStatusMainItemView(dataItem, column.title);
								}
								else if (column.field == "Delete") {											
											$scope.DeleteItem(dataItem);
									}
							},
				
				
				columns: [{ 
							field: "Edit",
							filterable:false,
							 title:'.',
							 	headerTemplate:'<label style=" color:#f3f3f4 ;" class=""></label>',
							  template: "<a id='btnEdit' class='btnEdit' title='Click to View' ><span class='pointer' style='float: right; cursor: pointer;' title='Click to Edit'><span class='k-icon k-i-edit'></span></span></a>",
							
							 width: 30
							 
							 },
					{ field: "ID",width:60,title:'ID',filterable:false,
						 },
						{ field: "Title",width:200 ,title:'Title',
							template: function(dataItem) {
								  var values = '';
								//	 values = "<span>" + dataItem.Title + "<a id='btnView' class='btnView' style='float: right; ' title='Click to View' ><img border='0'  alt='edit' src='/_layouts/15/images/edititem.gif?rev=47'></a>"; 
									values = "<span class='textdecoration' style='color: #337ab7;  cursor: pointer;'>" + dataItem.Title + "</span>";
															  
								  return values;
								}
						
						
						 },

						 { field: "StatusDateC" ,width:160,title:'Status Date',},
						
						{ field: "SystemOverallHealth" ,width:220,title:'System Overall Health',filterable: {
							multi: true,
							search: true
						},},
							{ field: "SystemScheduleHealth" ,width:220,title:'System Schedule Health',filterable: {
							multi: true,
							search: true
						},},
						{ field: "SystemResourceHealth" ,width:220,title:'System Resource Health',filterable: {
							multi: true,
							search: true
						},},
						 { field: "SystemBudgetHealth" ,width:220,title:'System Budget Health',filterable: {
							multi: true,
							search: true
						},},
						
						{ field: "UserOverallHealth" ,width:220,title:'User Overall Health',filterable: {
							multi: true,
							search: true
						},},
						 { field: "UserScheduleHealth" ,width:220,title:'User Shedule Health',filterable: {
							multi: true,
							search: true
						},},
						{ field: "UserResourceHealth" ,width:220,title:'User Resource Health',filterable: {
							multi: true,
							search: true
						},},	
						{ field: "UserBudgetHealth" ,width:220,title:'User Budget Health',filterable: {
							multi: true,
							search: true
						},},
						{
								field: 'Delete',
								title:'.',
								filterable: false,
								width: 35,
									headerTemplate:'<label style=" color:#f3f3f4 ;" class=""></label>',
								template:'<span class="pointer" style="float: center; cursor: pointer;" title="Click to delete"><span class="k-icon k-i-trash	k-i-delete"></span></span>'
								
							},
						
					  ],
					  
					});
					$('#StatusMaingrid').width($(window).width()-270);
					//if(ProjNameistrue){
						if(proLen == 0){
							var grid = $("#StatusMaingrid").data("kendoGrid");
							grid.hideColumn(12);
							grid.hideColumn(0);
						}
						var grid = $("#StatusMaingrid").data("kendoGrid");
								var exportFlag = false;
								grid.bind("excelExport", function (e) {
									if (!exportFlag) {
										//alert(1);
										e.sender.hideColumn(0);
										e.sender.hideColumn(12);
										e.preventDefault();
										exportFlag = true;
										setTimeout(function () {
											e.sender.saveAsExcel();
										});
									} else {
										//alert(2);
										e.sender.showColumn(0);
										e.sender.showColumn(12);
										exportFlag = false;
									}
								});
	}

	$scope.SMainremoveFileFromList = function(item, file, index){
				
			var  ItemId= item.ID;
			var FileTitle = file.FileName
			var Chktrue = confirm("Are you sure you want to delete this attachment?");
				if(Chktrue){
					bSvc.DeleteAttachment(ItemId,FileTitle,'Status: Main').then(function (response) {						
						$scope.Item.Attachment.results.splice(index, 1);
					});
				}
			
		}

	$scope.SaveStatusMain = function(){	 
	$('.btn').attr('disabled', true);
				var	ID =$scope.Item.ID;					
				var	Title=$scope.Item.Title;
				var	ExecSummary=$scope.Item.ExecSummary;
				var	Outlook=$scope.Item.Outlook;
				var	Progress=$scope.Item.Progress;
				var	StatusDate=$scope.Item.StatusDate;
				var	SystemBudgetHealth=$scope.Item.SystemBudgetHealth;
				var	SystemOverallHealth=$scope.Item.SystemOverallHealth;
				var	SystemResourceHealth=$scope.Item.SystemResourceHealth;
				var	SystemScheduleHealth=$scope.Item.SystemScheduleHealth;
				var	UserBudgetHealth=$scope.Item.UserBudgetHealth;
				var	UserOverallHealth=$scope.Item.UserOverallHealth;
				var	UserResourceHealth=$scope.Item.UserResourceHealth;
				var	UserScheduleHealth=$scope.Item.UserScheduleHealth;

				var curr = new Date;
				var first = curr.getDate() - curr.getDay();
				var firstdayWeek = new Date(curr.setDate(first));//.toLocaleDateString()
				

				$scope.ischkStatusMainAlert = false;
				/*if(Title == null || Title == ''){
						$('.btn').attr('disabled', false);
						$scope.ischkStatusMainAlert = true;
					return;
				}*/

				$scope.fileArray = [];
				$("#attachFilesHolder input:file").each(function () {
					if ($(this)[0].files[0]) {
						$scope.fileArray.push({
							"Attachment": $(this)[0].files[0]
						});
					}
				});
				var ProjectId =projId;

				


				if(ID == null){
					var data = {
							__metadata: {
								'type': 'SP.Data.CollaborationStatusListItem'
							},
						//	Title: Title,
							ExecSummary: ExecSummary,
							Outlook: Outlook,
							Progress: Progress,
							StatusDate: firstdayWeek,
							SystemBudgetHealth: null,
							SystemOverallHealth: UserOverallHealth,
							SystemResourceHealth: UserResourceHealth,
							SystemScheduleHealth: UserScheduleHealth,					
							UserBudgetHealth: SystemBudgetHealth,
							UserOverallHealth: SystemOverallHealth,
							UserResourceHealth: SystemResourceHealth,
							UserScheduleHealth: SystemScheduleHealth,

						/*	UserBudgetHealth: UserBudgetHealth,
							UserOverallHealth: UserOverallHealth,
							UserResourceHealth: UserResourceHealth,
							UserScheduleHealth: UserScheduleHealth,

							SystemBudgetHealth: SystemBudgetHealth,
							SystemOverallHealth: SystemOverallHealth,
							SystemResourceHealth: SystemResourceHealth,
							SystemScheduleHealth: SystemScheduleHealth,	*/
					
						//	AssignedToId:AssignedTo != null ? AssignedTo.Id :null,			
							ProjectUID:ProjectId,	
						};	
					//data.StatusDate =firstdayWeek;
					//alert(firstdayWeek); 
					PService.AddNew(data, 'Collaboration: Status').then(function (response) {
						var id = response.d.Id;
				var promise = $q.all({});
					if ($scope.fileArray.length != 0) {
								promise = promise.then(function () {
										return bSvc.GetAttachmentFileBuffer($scope.fileArray[0].Attachment);
									}).then(function (filebuffer) {
										return bSvc.getFileBuffer(filebuffer, id, 'Collaboration: Status', $scope.fileArray[0].Attachment);
									});					
												promise.then(function (responseAtch) {
													$scope.filesdata = [];
													$('#file_input').val('')
													$scope.ShowStatusMain();
													var dialogKeyWindow = $("#KWindowStatusMain").data("kendoWindow");
													dialogKeyWindow.close();
													dialogKeyWindow.center();
												//location.href = location.href.replace('#!','&#!');
													//window.location.reload();
											
											}, function (error) {
												console.error('Error: ' + error.result);
												$('.btn').attr('disabled', false);
											});

										} else {
												$scope.ShowStatusMain();
												var dialogKeyWindow = $("#KWindowStatusMain").data("kendoWindow");
													dialogKeyWindow.close();
													dialogKeyWindow.center();
												//location.href = location.href.replace('#!','&#!');
												//	window.location.reload();
												//	$('.btn').attr('disabled', false);
									}

							}, function (error) {    
									$('.btn').attr('disabled', false);               
								console.error('Error:SaveStatusMain ' + error.result);
							});
				}
				if(ID != null){
					var data = {
						__metadata: {
							'type': 'SP.Data.CollaborationStatusListItem'
						},
					//	Title: Title,
						ExecSummary: ExecSummary,
						Outlook: Outlook,
						Progress: Progress,
							SystemBudgetHealth: null,
							SystemOverallHealth: UserOverallHealth,
							SystemResourceHealth: UserResourceHealth,
							SystemScheduleHealth: UserScheduleHealth,					
							UserBudgetHealth: SystemBudgetHealth,
							UserOverallHealth: SystemOverallHealth,
							UserResourceHealth: SystemResourceHealth,
							UserScheduleHealth: SystemScheduleHealth,
				
					//	AssignedToId:AssignedTo != null ? AssignedTo.Id :null,			
						ProjectUID:ProjectId,	
					};	
						PService.Update(data, 'Collaboration: Status',ID).then(function (response) {
									
						var promise = $q.all({});
					if ($scope.fileArray.length != 0) {

								promise = promise.then(function () {
										return bSvc.GetAttachmentFileBuffer($scope.fileArray[0].Attachment);
									}).then(function (filebuffer) {
										return bSvc.getFileBuffer(filebuffer, ID, 'Collaboration: Status', $scope.fileArray[0].Attachment);
									});
								
								promise.then(function (responseAtch) {
									$scope.filesdata = [];
									$('#file_input').val('')									
									$scope.ShowStatusMain();
									var dialogKeyWindow = $("#KWindowStatusMain").data("kendoWindow");
								dialogKeyWindow.close();
								dialogKeyWindow.center();
								$('.btn').attr('disabled', false);
							//	window.location.reload();
							//location.href = location.href.replace('#!','&#!');
							// window.location.reload();
							 

									
							
							}, function (error) {
								console.error('Error: ' + error.result);
								$('.btn').attr('disabled', false);
							});

						} else {
							$scope.ShowStatusMain();
							var dialogKeyWindow = $("#KWindowStatusMain").data("kendoWindow");
								dialogKeyWindow.close();
								dialogKeyWindow.center();
								$('.btn').attr('disabled', false);
							//	window.location.reload();
							//location.href = location.href.replace('#!','&#!');
							// window.location.reload();

									
						}

						}, function (error) {    
								$('.btn').attr('disabled', false);               
							console.error('Error:SaveStatusMain ' + error.result);
						});	

					}

		}
		$scope.ConvertDateToMMDDYYYY = function (dDate) {
			
			if (dDate != undefined) {
				if (dDate != null) {
					
					var months = new Array(12);
						months[0] = "null";
						months[1] = "Jan";
						months[2] = "Feb";
						months[3] = "Mar";
						months[4] = "Apr";
						months[5] = "May";
						months[6] = "Jun";
						months[7] = "Jul";
						months[8] = "Aug";
						months[9] = "Sep";
						months[10] = "Oct";
						months[11] = "Nov";
						months[12] = "Dec";
					var SplitdDate = dDate.split('T')[0]
					var year = SplitdDate.split("-")[0]
					var Month;
					if(SplitdDate.split("-")[1] <10){						
						Month =SplitdDate.split("-")[1].slice(1, 2);
					}else{
					     Month= SplitdDate.split("-")[1]
					  }
						Month = months[Month]
					var day = SplitdDate.split("-")[2]
					
					var dateformate = day+"-"+Month+"-"+year
					
					return dateformate;//new Date(dDate).format("dd-MMM-yyyy");
				}
			}
		}
		$scope.CloseStatusMainForm = function(){
			 $('.btn').attr('disabled', false);
			var Chktrue = confirm("Are you sure you want to close this window?");
				if(Chktrue){
					var dialogKeyWindow = $("#KWindowStatusMain").data("kendoWindow");
					dialogKeyWindow.close();
					dialogKeyWindow.center();	
				} 
	}
	
}]);




KendoPApp.controller('BenefitController', ['$scope', "$http", "$q", "$location","$sce", 'baseSvc', 'ProjectkFactoryService',
function ($scope, $http, $q, $location, $sce, bSvc, PService) {
	$scope.init = function(){		
		
		
		if(window.location.hash === "#!/Benefit"){				
				$location.path('/Benefit');
				$scope.ShowBenefit();
			 }
			 

		
	}
	
	$scope.ShowBenefit = function(filterval){		
		$('ul.nav li.active').removeClass('active');
		$("a[name^=Benefit]").closest('li').addClass('active').hover();
			var UID = projId;
			var url ;
			if (location.hostname == 'projectmadeeasy.sharepoint.com') {
			if(filterval != null && filterval != undefined && filterval != ''){
				url = SpURL + "/_api/web/lists/getByTitle('Collaboration: Benefits')/items?$top=4998&$select=*,Person/Name,Person/Title,Person/Id,Reviewer/Name,Reviewer/Title,Reviewer/Id,Attachments,AttachmentFiles&$expand=AttachmentFiles,Reviewer/Id,Person/Id&$filter=Status eq '" + filterval + "'and ProjectUID eq '" + UID + "'&$orderby=ID desc";
			}else{
				url = SpURL + "/_api/web/lists/getByTitle('Collaboration: Benefits')/items?$top=4998&$select=*,Person/Name,Person/Title,Person/Id,Reviewer/Name,Reviewer/Title,Reviewer/Id,Attachments,AttachmentFiles&$expand=AttachmentFiles,Reviewer/Id,Person/Id&$filter=ProjectUID eq '" + UID + "'&$orderby=ID desc";
			}}else{
				url='Benefits.json';
			}
			PService.GetAllItems('Collaboration: Benefits', url).then(function (response) {			
				$scope.getBenefitRes = [];
				angular.forEach(response.d.results, function (item, index) {
					$scope.getBenefitRes.push(item)
					$scope.getBenefitRes[index].Description = $("<div>").html(item.Description).html();
					$scope.getBenefitRes[index].ExpectedBenefitFromXtoYortargets = $("<div>").html(item.ExpectedBenefitFromXtoYortargets).html();
					$scope.getBenefitRes[index].Howwillitbemeasured = $("<div>").html(item.Howwillitbemeasured).html();
					$scope.getBenefitRes[index].WhenwillbenefitberealizedC = (item.Whenwillbenefitberealized != null) ? $scope.ConvertDateToMMDDYYYY(item.Whenwillbenefitberealized) : '';
						$scope.getBenefitRes[index].Weight = (item.Weight != null) ? item.Weight : '';
					$scope.getBenefitRes[index].Delete  = null;
					$scope.getBenefitRes[index].Edit  = null;
				});
				$('#Benefitgrid').empty();
				$scope.LoadKendoGridAction($scope.getBenefitRes);
			 }, function (error) {                   
				console.error('Error: ' + error.result);
			}); 

	}

	$scope.LoadKendoGridAction = function (ResData) {

		
		$("#Benefitgrid").kendoGrid({
						toolbar: ["excel"],
						excel: {
							fileName: "Benefit.xlsx"
						},
					  dataSource: {
							data:ResData,
							sort:[ {
							field: "Title",
								dir: "asc"
							},{
							field: "ID",
								dir: "asc"
							},]
						},
					   height: 360,
						scrollable: {
                            virtual: true
                        },
						sortable: true,

							
							filterable: {
									extra: true,
									operators: { 
										string: {   
											contains: "Contains",
											eq: "Is Equal To",
											neq: "Is not equal to",
											startswith: "Starts With",									
										},
									
									}
								},
							resizable: true,
							selectable: "cell",
							change: function (e) {
								var cell = this.select();
								var cellIndex = cell[0].cellIndex;
								var column = this.columns[cellIndex];
								var dataItem = this.dataItem(cell.closest("tr"));
								
								
								if (column.field == "Edit") {									
									$scope.EditDecistionItemView(dataItem, column.title);
								}
								else if (column.title == "Title") {									
									$scope.EditDecistionItemView(dataItem, column.title);
								}
								else if (column.field == "Delete") {											
											$scope.DeleteItem(dataItem);
									}
							},
				
				
				columns: [{ 
						     field: "Edit",
							 filterable:false,
							 title:'.',
							 	headerTemplate:'<label style=" color:#f3f3f4 ;" class=""></label>',
							  template: "<a id='btnEdit' class='btnEdit' title='Click to View' ><span class='pointer' style='float: right; cursor: pointer;' title='Click to Edit'><span class='k-icon k-i-edit'></span></span></a>",							
							 width: 30							 
							 },
					{ field: "ID",width:60,title:'ID',filterable:false,
					template: function (dataItem) {
								var ID = "B."+dataItem.ID
								return "<span> " + ID + "</span>";
						}
						 },
						{ field: "Title",width:150 ,title:'Title',
							template: function(dataItem) {
								  var values = '';
							//	values = "<span>" + dataItem.Title + "<a id='btnView' class='btnView' style='float: right; ' title='Click to View' ><img border='0'  alt='edit' src='/_layouts/15/images/edititem.gif?rev=47'></a>";
 
									values = "<span class='textdecoration' style='color: #337ab7;  cursor: pointer;'>" + dataItem.Title + "</span>";
															  
								  return values;
								}
						
						
						 },{ field: "Status",width:150,title:'Status', headerAttributes: { style: "white-space: normal"},
							 },
					
						
						{ field: "Description",width:250 ,title:'Metric Description',
							template: function(dataItem) {
								  return "<span>" + htmlDecode(dataItem.Description) + "</span>";
								}
						
						 },
						 { field: "WhenwillbenefitberealizedC",width:160,title: "When will benefit be realized",  headerAttributes: { style: "white-space: normal"},
						 template: function(dataItem) {
								  return dataItem.WhenwillbenefitberealizedC;
								}
								},
								 { field: "Weight",width:100,title: "Weight", 
						 template: function(dataItem) {
								  return dataItem.Weight;
								}
								},
								
									{ field: "Person.Title" ,width:180,title:'Person responsible for benefits attainment reporting', headerAttributes: { style: "white-space: normal"},filterable: {
							multi: true,
							search: true
						},
							template: function(dataItem) {
								  var values = '';
								  if(dataItem.PersonId != null){
									  values = "<span>" + dataItem.Person.Title + "</span>";
								  }								  
								  return values;
								}
						},
						
							{ field: "Reviewer.Title" ,width:180,title:'Reviewer', headerAttributes: { style: "white-space: normal"},filterable: {
							multi: true,
							search: true
						},
							template: function(dataItem) {
								  var values = '';
								  if(dataItem.ReviewerId != null){
									  values = "<span>" + dataItem.Reviewer.Title + "</span>";
								  }								  
								  return values;
								}
						},
						
						
						 { field: "ExpectedBenefitFromXtoYortargets",width:250,title:'Expected Benefit From X to Y or targets', headerAttributes: { style: "white-space: normal"},
							template: function(dataItem) {
								  return "<span>" + htmlDecode(dataItem.ExpectedBenefitFromXtoYortargets) + "</span>";
								}
						
						 },
						 { field: "Howwillitbemeasured",width:250,title:'How will it be measured', headerAttributes: { style: "white-space: normal"},
							template: function(dataItem) {
								  return "<span>" + htmlDecode(dataItem.Howwillitbemeasured) + "</span>";
								}
						
						 },
						 
						 
						 
						{
								field:'Delete',
								title: '.',
									headerTemplate:'<label style=" color:#f3f3f4 ;" class=""></label>',
								filterable: false,
								width: 35,
								template:'<span class="pointer" style="float: center;" title="Click to delete"><span class="k-icon k-i-trash	k-i-delete"></span></span>'
								
							},
						
					  ],
					  
					});
					$('#Benefitgrid').width($(window).width()-270);
					if(proLen == 0){
							var grid = $("#Benefitgrid").data("kendoGrid");
							grid.hideColumn(11);
						}
						var grid = $("#Benefitgrid").data("kendoGrid");
								var exportFlag = false;
								grid.bind("excelExport", function (e) {
									if (!exportFlag) {
										//alert(1);
										e.sender.hideColumn(0);
										e.sender.hideColumn(10);
										e.preventDefault();
										exportFlag = true;
										setTimeout(function () {
											e.sender.saveAsExcel();
										});
									} else {
										//alert(2);
										e.sender.showColumn(0);
										e.sender.showColumn(10);
										exportFlag = false;
										if(proLen == 0){											
											grid.hideColumn(10);
										}
									}
								});

	}

	$scope.DeleteItem = function(data){
				var Chktrue = confirm("Are you sure you want to delete this entry?");
				if(Chktrue){
					PService.DeleteById('Collaboration: Benefits', data.ID).then(function (response) {
						$scope.ShowBenefit();
						//location.href = location.href.replace('#!','&#!');
						//window.location.reload();
					});
				}

		}
		$scope.EditDecisions = function(){
		 $scope.ViewMode = false;		 
	}
	
	$scope.to_trusted = function (html_code) {
			return $sce.trustAsHtml(html_code);
		}
	$scope.AddNewItemWindow = function () {
		$scope.ischkDecisionsAlert = false;
		var valuefil = 1
		//var IssueStatusDefault =null;
		if (location.hostname == 'projectmadeeasy.sharepoint.com') {
			var url = SpURL + "/_api/web/lists/getByTitle('Collaboration: Lookups')/items?$top=4998&$select=*&$filter=Default eq '" + valuefil + "'&$orderby=ID desc";
} else { var url = "Lookups.json"; }
			PService.GetAllItems('Collaboration: Lookups', url).then(function (response) {			
				$scope.getDefaultValueLookup = [];
			
				$scope.RequirementManagementStatusDefault = []
				$scope.RequirementManagementProgressDefault = []
				angular.forEach(response.d.results, function (item, index) {
					$scope.getDefaultValueLookup.push(item)					
					if(item.Select_x0020_Title == 'RequirementManagementStatus'){
						$scope.RequirementManagementStatusDefault.push(item.Title);
					}
					if(item.Select_x0020_Title == 'RequirementManagementProgress'){
						$scope.RequirementManagementProgressDefault.push(item.Title);
					}
				});
		 $scope.ViewMode = false;
			$scope.Item = {
					ID: null,
					Description:'',
					Whenwillbenefitberealized:'',
					Weight:null,
						Person:null,
						Reviewer:null,
					ExpectedBenefitFromXtoYortargets:'',
					Howwillitbemeasured:'',
					
					//Status: null,//$scope.RequirementManagementStatusDefault.length != 0 ?$scope.RequirementManagementStatusDefault[0]:null,
					Title: null,
				//	Progress: null,//$scope.RequirementManagementProgressDefault.length != 0 ?$scope.RequirementManagementProgressDefault[0]:null,
			 }
			 $('.btn').attr('disabled', false);
			 //$('#tablinkfiled1').text('NA');
			$('#tablinkfiled2').text('NA');
			 $scope.filesdata = []
				$('#file_input').val('')
				
				var arraycolor =['tablinks1']
			 angular.forEach(arraycolor, function (item, index) {
				   var val = 'NA'
					  switch (index) {
							  case 0:
									val = $scope.Item.Status != null && $scope.Item.Status != '' ? $scope.Item.Status:'NA'
								break;							
					  }
				 
				for (i = 0; i < $('.'+item).length; i++) {
					  debugger
					 $('.'+item)[i].className = item+" "
					  switch (val) {
							  case 'Proposed':
								if(i == 0){
								
									$('.'+item)[i].className = item+" "+'Yellow'
								}
								break;
							case 'Approved':
								if(i == 1){
								   $('.'+item)[i].className = item+" "+'Green'	
								}							
								break;
							case 'Rejected':
								if(i == 2){
								$('.'+item)[i].className = item+" "+'Red'
								}
								break;
							case 'NA':
								if(i == 3){
									$('.'+item)[i].className = item+" "+'NA'	
								}
								break;
					  }				  
				  }
			 });
			 
			 
			 var arraycolor2 =['tablinks2']
			 angular.forEach(arraycolor2, function (item, index) {
				   var val = 'NA'
					  switch (index) {
							  case 0:
									val = $scope.Item.Status != null && $scope.Item.Status != '' ? $scope.Item.Status:'NA'
								break;							
					  }
				 
				for (i = 0; i < $('.'+item).length; i++) {
					  debugger
					 $('.'+item)[i].className = item+" "
					  switch (val) {
							  case 'Deferred':
								if(i == 0){								
									$('.'+item)[i].className = item+" "+'Orange'
								}
								break;
							case 'Draft':
								if(i == 1){
								   $('.'+item)[i].className = item+" "+'Violet'	
								}							
								break;
							case 'Hold':
								if(i == 2){
								$('.'+item)[i].className = item+" "+'Tomato'
								}
								break;
							case 'Implemented':
								if(i == 3){
								$('.'+item)[i].className = item+" "+'lightBlue'
								}
								break;
							case 'In Progress':
								if(i == 4){
								$('.'+item)[i].className = item+" "+'Yellow'
								}
								break;
							case 'Verified':
								if(i == 5){
								$('.'+item)[i].className = item+" "+'MediumSeaGreen'
								}
								break;
							case 'NA':
								if(i == 6){
									$('.'+item)[i].className = item+" "+'NA'	
								}
								break;
					  }				  
				  }
			 });
			var dialogKeyWindow = $("#KWindowDecisions").data("kendoWindow");
			dialogKeyWindow.open();
			dialogKeyWindow.center();
			}, function (error) {                   
				console.error('Error: ' + error.result);
			});
		}

	$scope.EditDecistionItemView = function(data,ItemView){
			$scope.ischkDecisionsAlert = false;
			 $scope.ViewMode = false;	
			if(ItemView == 'Title'){
			$scope.ViewMode = true;	
			}
			$scope.Item = {
					ID: data.ID,
					Description:data.Description,
					ExpectedBenefitFromXtoYortargets:data.ExpectedBenefitFromXtoYortargets,
					Weight:data.Weight,
					Person:data.Person,
					Reviewer:data.Reviewer,
					Howwillitbemeasured:data.Howwillitbemeasured,
					Title: data.Title,
					Attachment:data.AttachmentFiles,
					Whenwillbenefitberealized:data.Whenwillbenefitberealized,
					Status:data.Status,
			 }
			 $('.btn').attr('disabled', false);
			  //$('#tablinkfiled1').text($scope.Item.Status);
			$('#tablinkfiled2').text($scope.Item.Status);
		    $scope.filesdata = []
			$('#file_input').val('')
			
			
			var arraycolor =['tablinks1']
			 angular.forEach(arraycolor, function (item, index) {
				   var val = 'NA'
					  switch (index) {
							  case 0:
									val = $scope.Item.Status != null && $scope.Item.Status != '' ? $scope.Item.Status:'NA'
								break;							
					  }
				 
				for (i = 0; i < $('.'+item).length; i++) {
					  debugger
					 $('.'+item)[i].className = item+" "
					  switch (val) {
							  case 'Proposed':
								if(i == 0){
								
									$('.'+item)[i].className = item+" "+'Yellow'
								}
								break;
							case 'Approved':
								if(i == 1){
								   $('.'+item)[i].className = item+" "+'Green'	
								}							
								break;
							case 'Rejected':
								if(i == 2){
								$('.'+item)[i].className = item+" "+'Red'
								}
								break;
							case 'NA':
								if(i == 3){
									$('.'+item)[i].className = item+" "+'NA'	
								}
								break;
					  }				  
				  }
			 });
			 
			 
			 var arraycolor2 =['tablinks2']
			 angular.forEach(arraycolor2, function (item, index) {
				   var val = 'NA'
					  switch (index) {
							  case 0:
									val = $scope.Item.Status != null && $scope.Item.Status != '' ? $scope.Item.Status:'NA'
								break;							
					  }
				 
				for (i = 0; i < $('.'+item).length; i++) {
					  debugger
					 $('.'+item)[i].className = item+" "
					  switch (val) {
							  case 'Deferred':
								if(i == 0){								
									$('.'+item)[i].className = item+" "+'Orange'
								}
								break;
							case 'Draft':
								if(i == 1){
								   $('.'+item)[i].className = item+" "+'Violet'	
								}							
								break;
							case 'Hold':
								if(i == 2){
								$('.'+item)[i].className = item+" "+'Tomato'
								}
								break;
							case 'Implemented':
								if(i == 3){
								$('.'+item)[i].className = item+" "+'lightBlue'
								}
								break;
							case 'In Progress':
								if(i == 4){
								$('.'+item)[i].className = item+" "+'Yellow'
								}
								break;
							case 'Verified':
								if(i == 5){
								$('.'+item)[i].className = item+" "+'MediumSeaGreen'
								}
								break;
							case 'NA':
								if(i == 6){
									$('.'+item)[i].className = item+" "+'NA'	
								}
								break;
					  }				  
				  }
			 });
			
			var dialogKeyWindow = $("#KWindowDecisions").data("kendoWindow");
			dialogKeyWindow.open();
			dialogKeyWindow.center();
		}

	$scope.CloseDecisionsForm = function(){
		//var Chktrue = confirm("Are you sure you want to close this window?");
		//if(Chktrue){
				var dialogKeyWindow = $("#KWindowDecisions").data("kendoWindow");
				dialogKeyWindow.close();
				dialogKeyWindow.center();
		//	}
		}

		$scope.DecisionremoveFileFromList = function(item, file, index){
				
			var  ItemId= item.ID;
			var FileTitle = file.FileName
			var Chktrue = confirm("Are you sure you want to delete this attachment?");
				if(Chktrue){
					bSvc.DeleteAttachment(ItemId,FileTitle,'Benefits').then(function (response) {						
						$scope.Item.Attachment.results.splice(index, 1);
					});
				}
			
		}

		$scope.SaveDecisions = function(){
			$('.btn').attr('disabled', true);
				var	ID=$scope.Item.ID;
				var	Description=$scope.Item.Description;
				var	ExpectedBenefitFromXtoYortargets=$scope.Item.ExpectedBenefitFromXtoYortargets;
				var Weight=$scope.Item.Weight != '' ?$scope.Item.Weight:null;
				
				var Person=$scope.Item.Person;
				
				var Reviewer=$scope.Item.Reviewer;
				
				var	Howwillitbemeasured=$scope.Item.Howwillitbemeasured;
				var	Whenwillbenefitberealized=$scope.Item.Whenwillbenefitberealized;

				//var	Status=$('#tablinkfiled1').text();//$scope.Item.Status;
				var	Title=$scope.Item.Title;
				//var Progress = $('#tablinkfiled2').text(); //$scope.Item.Progress;
				$scope.ischkDecisionsAlert = false;
				if(Title == null || Title == '' ){
						$('.btn').attr('disabled', false);
						$scope.ischkDecisionsAlert = true;
					return;
				}

				$scope.fileArray = [];
				$("#attachFilesHolder input:file").each(function () {
					if ($(this)[0].files[0]) {
						$scope.fileArray.push({
							"Attachment": $(this)[0].files[0]
						});
					}
				});
				var ProjectId =projId;
				var ProjectName = null;
				if(proLen == 1){
					ProjectName = $('input[title="Project Name"]').val();
				}else{
					ProjectName = $('.ms-formlabel :contains("Name")').closest('td').next().text().trim()
				}
				var data = {
						__metadata: {
							'type': 'SP.Data.CollaborationBenefitsListItem'
						},
						Title: Title,
						//Status:$('#tablinkfiled1').text() != 'NA' && $('#tablinkfiled1').text() != 'NA' ? $('#tablinkfiled1').text():null,//Status,
						Description:Description,
						ExpectedBenefitFromXtoYortargets:ExpectedBenefitFromXtoYortargets,
						Weight:Weight,
						PersonId:Person != null ? Person.Id :null,	
						ReviewerId:Reviewer != null ? Reviewer.Id :null,	
						Howwillitbemeasured:Howwillitbemeasured,
						Whenwillbenefitberealized:Whenwillbenefitberealized != '' && Whenwillbenefitberealized != null ?Whenwillbenefitberealized:null,
						ProjectUID:ProjectId,
						Status:$('#tablinkfiled2').text() != 'NA' && $('#tablinkfiled2').text() != 'NA' ? $('#tablinkfiled2').text():null,//Progress,
						ProjectName:ProjectName
					};
				if(ID == null){
					
					PService.AddNew(data, 'Collaboration: Benefits').then(function (response) {


							var id = response.d.Id;
							var promise = $q.all({});
								if ($scope.fileArray.length != 0) {
									promise = promise.then(function () {
											return bSvc.GetAttachmentFileBuffer($scope.fileArray[0].Attachment);
										}).then(function (filebuffer) {
											return bSvc.getFileBuffer(filebuffer, id, 'Collaboration: Benefits', $scope.fileArray[0].Attachment);
										});					
									promise.then(function (responseAtch) {
										$scope.filesdata = [];
										$('#file_input').val('')
										$scope.ShowBenefit();
										var dialogKeyWindow = $("#KWindowDecisions").data("kendoWindow");
									dialogKeyWindow.close();
									dialogKeyWindow.center();
									//location.href = location.href.replace('#!','&#!');
								//	window.location.reload();
									$('.btn').attr('disabled', false);
										
								
									}, function (error) {
										console.error('Error: ' + error.result);
										$('.btn').attr('disabled', false);
									});

								} else {
									$scope.ShowBenefit();
									var dialogKeyWindow = $("#KWindowDecisions").data("kendoWindow");
										dialogKeyWindow.close();
										dialogKeyWindow.center();
									//location.href = location.href.replace('#!','&#!');
										//window.location.reload();
										$('.btn').attr('disabled', false);
								}

							}, function (error) {    
									$('.btn').attr('disabled', false);               
								console.error('Error:SaveDEcisions ' + error.result);
							});
				}
				if(ID != null){					
						PService.Update(data, 'Collaboration: Benefits',ID).then(function (response) {


							var promise = $q.all({});
							if ($scope.fileArray.length != 0) {

								promise = promise.then(function () {
										return bSvc.GetAttachmentFileBuffer($scope.fileArray[0].Attachment);
									}).then(function (filebuffer) {
										return bSvc.getFileBuffer(filebuffer, ID, 'Collaboration: Benefits', $scope.fileArray[0].Attachment);
									});
								
								promise.then(function (responseAtch) {
									$scope.filesdata = [];
									$('#file_input').val('')
									$scope.ShowBenefit();
									var dialogKeyWindow = $("#KWindowDecisions").data("kendoWindow");
									dialogKeyWindow.close();
									dialogKeyWindow.center();
									//window.location.reload();
									//location.href = location.href.replace('#!','&#!');
									//window.location.reload();

										$('.btn').attr('disabled', false);
							
							}, function (error) {
								console.error('Error: ' + error.result);
								$('.btn').attr('disabled', false);
							});

						} else {
							$scope.ShowBenefit();
							var dialogKeyWindow = $("#KWindowDecisions").data("kendoWindow");
								dialogKeyWindow.close();
								dialogKeyWindow.center();
								//window.location.reload();
							//	location.href = location.href.replace('#!','&#!');
								// window.location.reload();

									$('.btn').attr('disabled', false);
						}

						}, function (error) {    
								$('.btn').attr('disabled', false);               
							console.error('Error:SaveDEcisions ' + error.result);
						});	

					}
		}
	$scope.ConvertDateToMMDDYYYY = function (dDate) {
			
			if (dDate != undefined) {
				if (dDate != null) {
					
					var months = new Array(12);
						months[0] = "null";
						months[1] = "Jan";
						months[2] = "Feb";
						months[3] = "Mar";
						months[4] = "Apr";
						months[5] = "May";
						months[6] = "Jun";
						months[7] = "Jul";
						months[8] = "Aug";
						months[9] = "Sep";
						months[10] = "Oct";
						months[11] = "Nov";
						months[12] = "Dec";
					var SplitdDate = dDate.split('T')[0]
					var year = SplitdDate.split("-")[0]
					var Month;
					if(SplitdDate.split("-")[1] <10){						
						Month =SplitdDate.split("-")[1].slice(1, 2);
					}else{
					     Month= SplitdDate.split("-")[1]
					  }
						Month = months[Month]
					var day = SplitdDate.split("-")[2]
					
					var dateformate = day+"-"+Month+"-"+year
					
					return dateformate;//new Date(dDate).format("dd-MMM-yyyy");
				}
			}
		}

}]);














function htmlDecode(value) {
	if (value == null) {
		return '';
	} else {
		var newVal = value.replace(/&amp;/g, "&").replace(/&#34;/g, '"').replace(/&quot;/g, '"').replace(/&#35;/g, '#').replace(/&num;/g, '#').replace(/&#36;/g, '$').replace(/&dollar;/g, '$').replace(/&#37;/g, '%').replace(/&percnt;/g, '%').replace(/&#38;/g, '&').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&apos;/g, "'").replace(/&#40;/g, '(').replace(/&lpar;/g, '(').replace(/&#41;/g, ')').replace(/&rpar;/g, ')').replace(/&#42;/g, '*').replace(/&ast;/g, '*').replace(/&#43;/g, '+').replace(/&plus;/g, '+').replace(/&#44;/g, ',').replace(/&comma;/g, ',').replace(/&#45;/g, '-').replace(/&minus;/g, '-').replace(/&#46;/g, '.').replace(/&period;/g, '.').replace(/&#47;/g, '/').replace(/&sol;/g, '/').replace(/&#58;/g, ':').replace(/&colon;/g, ':').replace(/&#59;/g, ';').replace(/&semi;/g, ';').replace(/&#60;/g, '<').replace(/&lt;/g, '<').replace(/&#61;/g, '=').replace(/&equals;/g, '=').replace(/&#62;/g, '>').replace(/&gt;/g, '>').replace(/&#63;/g, '?').replace(/&quest;/g, '?').replace(/&#64;/g, '@').replace(/&commat;/g, '@').replace(/&#91;/g, '[').replace(/&lsqb;/g, '[').replace(/&#92;/g, '\\').replace(/&bsol;/g, '\\').replace(/&#93;/g, ']').replace(/&rsqb;/g, ']').replace(/&#94;/g, '^').replace(/&Hat;/g, '^').replace(/&#95;/g, '_').replace(/&lowbar;/g, '_').replace(/&#96;/g, '`').replace(/&grave;/g, '`').replace(/&#123;/g, '{').replace(/&lcub;/g, '{').replace(/&#124;/g, '|').replace(/&verbar;/g, '|').replace(/&#125;/g, '}').replace(/&rcub;/g, '}').replace(/&#126;/g, '~');
		return newVal;
	}
}

function getParameterByName(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search.toLowerCase());
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }

	function AddCommas(str) {
  var currentLan = SpCulture;  //  $('#PWALanguage').val();
var LanDecimal='';
var LanComma =''
var arrayset5  = ['de_DE','de-DE','ro_MD','ro-MD','bs','bs-Cyrl','bs_Cyrl','sr-Latn_ME','sr-Latn-ME','pt_BR','pt-BR','it_SM','it-SM','en_AT','en-AT','ms-Arab_BN','ms-Arab-BN','sg','de_LU','de-LU','sl','es_IC','es-IC','hr','az','ca','es_AR','es-AR','en_SI','en-SI','seh','ca_AD','ca-AD','nl','en_DK','en-DK','sl_SI','sl-SI','kea','de_AT','de-AT','mk_MK','mk-MK','da_DK','da-DK','en_ME','en-ME'];
var arrayset2  = ['uk-UA','pl_PL','pl-PL','fr_FR','fr-FR','br_FR','br-FR','pt_TL','pt-TL','fr_CA','fr-CA','br','shi-Tfng_M','shi-Tfng-M','ksf','nb_NO','nb-NO','bas','af_NA','af-NA','sk','en_PT','en-PT','tk_TM','tk-TM','tzm','br_FR','br-FR','pt_MZ','pt-MZ','sq','hu','et_EE','et-EE','nb','fr_MQ','fr-MQ','pt_AO','pt-AO','fr_BL','fr-BL','nn','kk','dua','fr_DZ','fr-DZ','ru_MD','ru-MD','cs'];
var arrayset3  = ['mfe','ses','wq','dje','khq'];
var arrayset4  = ['es-MX'];
var arrayset1  = ['en_US','en-US','en_IE','en-IE','en_CA','en-CA','mr','en_IE','en-IE','es_GT','es-GT','en_AS','en-AS','en_PR','en-PR','ms','mt','ha','en_BZ','en-BZ','or_IN','or-IN','he','zh_CN','zh-CN','mer','en_JM','en-JM','teo_KE','teo-KE','cy_GB','cy-GB','en_US','en-US','hi','si','ga_IE','ga-IE','en_CA','en-CA','ne_IN','ne-IN','en_AU','en-AU','teo','en_NG','en-NG','ee_GH','ee-GH'];
var arrayset6  = ['en_SE','en-SE','sv','sv_FI','sv-FI','sv_SE','sv-SE','sv_AX','sv-AX'];
var regexDecimal = new RegExp(',"g"');
var regexComma = new RegExp(',"g"');
if( arrayset1.indexOf(currentLan) != -1)
{
  LanDecimal ='.'
  LanComma=','
  regexDecimal = new RegExp(LanDecimal,"g");
  regexComma = new RegExp(LanComma,"g");
}
  if( arrayset2.indexOf(currentLan) != -1)
{
   //LanComma=' '
  LanComma= String.fromCharCode(160)
  LanDecimal =','
  regexComma = new RegExp(LanComma,"g");
  regexDecimal = new RegExp(LanDecimal,"g");
 }
if( arrayset3.indexOf(currentLan) != -1)
{
  LanComma=' '
  LanDecimal ='.'
  regexComma = new RegExp(LanComma,"g");
  regexDecimal = new RegExp(LanDecimal,"g");
 }
 if( arrayset4.indexOf(currentLan) != -1)  
 {
  LanDecimal ='.'
  LanComma=','
  regexDecimal = new RegExp(LanDecimal,"g");
  regexComma = new RegExp(LanComma,"g");
}
if( arrayset5.indexOf(currentLan) != -1) 
 {
  LanDecimal =','
  LanComma='.'
  regexDecimal = new RegExp(LanDecimal,"g");
  regexComma = new RegExp(LanComma,"g");
}
 if( arrayset6.indexOf(currentLan) != -1)
{
  LanComma=' '
  LanDecimal =':'
  regexComma = new RegExp(LanComma,"g");
  regexDecimal = new RegExp(LanDecimal,"g");
 }
        str = (str + "").toString();
        try {
            if (str.indexOf(')') != -1) {
                str = (str + "").replace('(', '').replace(')', '');
                str = "-" + str;
            }
            str = (str + "").replace('$', '').replace(LanComma, '').replace(LanComma, '').replace(LanComma, '').replace(LanComma, '').replace(LanComma, '').replace(LanComma, '').replace(LanComma, '').replace(LanComma, '').replace(LanDecimal, '.');
            var a = ""
            if (str == "-") {
                a = "-";
            } else {
                a = str;
            }
            // alert (a);
		a=parseFloat(Math.round(a *100)/100).toFixed(0);
        a= a.toString().replace(".", LanDecimal);
        return a.toString().replace(/\B(?=(\d{3})+(?!\d))/g, LanComma);
        } catch (err) {
			console.log(err);
        }
    }
	function ReloadPageFunction() {
		location.href = location.href.replace('#!','&#!');
			//window.location.reload();
			$("#ReloadPageId").hide();
		}
function isNumberKeyDesPoint(evt) {
	var charCode = (evt.which) ? evt.which : event.keyCode;
	//alert(charCode);
	if (charCode != 46 && charCode != 44 &&
		(charCode < 48 || charCode > 57))
		return false;

	return true;
}


function opencolor(evt, tName,namez,tablink) {
				//	alert(tName);
					  var i, tabcontent, tablinks;
					 /* tabcontent = document.getElementsByClassName("tabcontent");
					  for (i = 0; i < tabcontent.length; i++) {
						tabcontent[i].style.display = "none";
					  }*/
					  tablinks = document.getElementsByClassName(tablink);
					  for (i = 0; i < tablinks.length; i++) {
					//  alert(i);
						tablinks[i].className = tablinks[i].className.replace('NA', "");
						tablinks[i].className = tablinks[i].className.replace("Green", "");
						tablinks[i].className = tablinks[i].className.replace("Yellow", "");
						tablinks[i].className = tablinks[i].className.replace("Red", "");
					  }
					  if(tablink == 'tablinks1'){ $('#tablinkfiled1').text(tName);}
					  else if(tablink == 'tablinks2'){ $('#tablinkfiled2').text(tName);}
					  else if(tablink == 'tablinks3'){ $('#tablinkfiled3').text(tName);}
					 // else if(tablink == 'tablinks4'){ $('#tablinkfiled4').text(tName);}
					 // else if(tablink == 'tablinks5'){ $('#tablinkfiled5').text(tName);}
					  else if(tablink == 'tablinks6'){ $('#tablinkfiled6').text(tName);}
					 if(tablink != 'tablinks6'){
						if ($('#tablinkfiled1').text() == 'Red' || $('#tablinkfiled2').text() == 'Red' || $('#tablinkfiled3').text() == 'Red'|| $('#tablinkfiled4').text() == 'Red'|| $('#tablinkfiled5').text() == 'Red' ) {
							$('#tablinkfiled6').text('Red');
						} else if ($('#tablinkfiled1').text() == 'Yellow' || $('#tablinkfiled2').text() == 'Yellow' || $('#tablinkfiled3').text() == 'Yellow'|| $('#tablinkfiled4').text() == 'Yellow'|| $('#tablinkfiled5').text() == 'Yellow' ) {
							$('#tablinkfiled6').text('Yellow');
						}else if ($('#tablinkfiled1').text() == 'Green' || $('#tablinkfiled2').text() == 'Green' || $('#tablinkfiled3').text() == 'Green'|| $('#tablinkfiled4').text() == 'Green'|| $('#tablinkfiled5').text() == 'Green' ) {
							$('#tablinkfiled6').text('Green');
						} else {				
							$('#tablinkfiled6').text('NotSet');
						}	
						
							var tab6 = $('#tablinkfiled6').text()
							var item = 'tablinks6';
							for (i = 0; i < $('.'+item).length; i++) {
								  debugger
								 $('.'+item)[i].className = item+" "
								  switch (tab6) {
										  case 'NotSet':
											if(i == 0){
												$('.'+item)[i].className = item+" "+tab6	
											}
											break;
										case 'Green':
											if(i == 1){
											   $('.'+item)[i].className = item+" "+tab6	
											}							
											break;
										case 'Red':
											if(i == 2){
											$('.'+item)[i].className = item+" "+tab6
											}
											break;
										case 'Yellow':
											if(i == 3){
												$('.'+item)[i].className = item+" "+tab6	
											}
											break;
								  }				  
							  }
						}
					 
					  var cName= ''
					  if(tName == 'NA'){cName=" NA"}//+namez}
					  else if(tName == 'Approved'){cName=" Green"}
					  else if(tName == 'Proposed'){cName=" Yellow"}
					  else if(tName == 'Rejected'){cName=" Red"}
					  evt.currentTarget.className += cName;
				}
				
				
				
	function opencolorMulBtn(evt, tName,namez,tablink) {
				//	alert(tName);
					  var i, tabcontent, tablinks;
					 /* tabcontent = document.getElementsByClassName("tabcontent");
					  for (i = 0; i < tabcontent.length; i++) {
						tabcontent[i].style.display = "none";
					  }*/
					  tablinks = document.getElementsByClassName(tablink);
					  for (i = 0; i < tablinks.length; i++) {
					//  alert(i);
						tablinks[i].className = tablinks[i].className.replace('NA', "");
						tablinks[i].className = tablinks[i].className.replace("Orange", "");
						tablinks[i].className = tablinks[i].className.replace("Violet", "");
						tablinks[i].className = tablinks[i].className.replace("Tomato", "");
						tablinks[i].className = tablinks[i].className.replace("lightBlue", "");
						tablinks[i].className = tablinks[i].className.replace("Yellow", "");
						tablinks[i].className = tablinks[i].className.replace("MediumSeaGreen", "");
					  }
					  if(tablink == 'tablinks1'){ $('#tablinkfiled1').text(tName);}
					  else if(tablink == 'tablinks2'){ $('#tablinkfiled2').text(tName);}
					  else if(tablink == 'tablinks3'){ $('#tablinkfiled3').text(tName);}
					 // else if(tablink == 'tablinks4'){ $('#tablinkfiled4').text(tName);}
					 // else if(tablink == 'tablinks5'){ $('#tablinkfiled5').text(tName);}
					  else if(tablink == 'tablinks6'){ $('#tablinkfiled6').text(tName);}
					 if(tablink != 'tablinks6'){
						if ($('#tablinkfiled1').text() == 'Red' || $('#tablinkfiled2').text() == 'Red' || $('#tablinkfiled3').text() == 'Red'|| $('#tablinkfiled4').text() == 'Red'|| $('#tablinkfiled5').text() == 'Red' ) {
							$('#tablinkfiled6').text('Red');
						} else if ($('#tablinkfiled1').text() == 'Yellow' || $('#tablinkfiled2').text() == 'Yellow' || $('#tablinkfiled3').text() == 'Yellow'|| $('#tablinkfiled4').text() == 'Yellow'|| $('#tablinkfiled5').text() == 'Yellow' ) {
							$('#tablinkfiled6').text('Yellow');
						}else if ($('#tablinkfiled1').text() == 'Green' || $('#tablinkfiled2').text() == 'Green' || $('#tablinkfiled3').text() == 'Green'|| $('#tablinkfiled4').text() == 'Green'|| $('#tablinkfiled5').text() == 'Green' ) {
							$('#tablinkfiled6').text('Green');
						} else {				
							$('#tablinkfiled6').text('NotSet');
						}	
						
							var tab6 = $('#tablinkfiled6').text()
							var item = 'tablinks6';
							for (i = 0; i < $('.'+item).length; i++) {
								  debugger
								 $('.'+item)[i].className = item+" "
								  switch (tab6) {
										  case 'NotSet':
											if(i == 0){
												$('.'+item)[i].className = item+" "+tab6	
											}
											break;
										case 'Green':
											if(i == 1){
											   $('.'+item)[i].className = item+" "+tab6	
											}							
											break;
										case 'Red':
											if(i == 2){
											$('.'+item)[i].className = item+" "+tab6
											}
											break;
										case 'Yellow':
											if(i == 3){
												$('.'+item)[i].className = item+" "+tab6	
											}
											break;
								  }				  
							  }
						}					 
					  var cName= ''
					  if(tName == 'NA'){cName=" NA"}//+namez}
					  else if(tName == 'Deferred'){cName=" Orange"}
					  else if(tName == 'Draft'){cName=" Violet"}
					  else if(tName == 'Hold'){cName=" Tomato"}
					  else if(tName == 'Implemented'){cName=" lightBlue"}
					  else if(tName == 'In Progress'){cName=" Yellow"}
					  else if(tName == 'Verified'){cName=" MediumSeaGreen"}
					  evt.currentTarget.className += cName;
				}
				
function ProgressColorDecode(a) {
	var values = '';
	if (a.Progress == "Deferred") {		
			values = "<div style='color: white; background-color: Orange; text-align: center;'>" + a.Progress + "</div>";
	} else if (a.Progress == "Draft") {		
			values = "<div style='color: white; background-color: Violet; text-align: center;'>" + a.Progress + "</div>";
	}else if (a.Progress == "Hold") {		
			values = "<div style='color: white; background-color: Tomato; text-align: center;'>" + a.Progress + "</div>";
	}else if (a.Progress == "Implemented") {		
			values = "<div style='color: black; background-color: lightBlue; text-align: center;'>" + a.Progress + "</div>";
	}else if (a.Progress == "In Progress") {		
			values = "<div style='color: black; background-color: Yellow; text-align: center;'>" + a.Progress + "</div>";
	}else if (a.Progress == "Verified") {		
			values = "<div style='color: white; background-color: MediumSeaGreen; text-align: center;'>" + a.Progress + "</div>";
	}
	return values;
}

function StatusColorDecode(a) {
	var values = '';
	if (a.Status == "Proposed") {		
			values = "<div style='color: black; background-color: Yellow; text-align: center;'>" + a.Status + "</div>";
	} else if (a.Status == "Approved") {		
			values = "<div style='color: white; background-color: Green; text-align: center;'>" + a.Status + "</div>";
	}else if (a.Status == "Rejected") {		
			values = "<div style='color: white; background-color: Red; text-align: center;'>" + a.Status + "</div>";
	}
	return values;
}

var sscount =0;
var siteAbsoluteUrl = SpURL
$(document).bind('mousemove',function(e){
	console.log(sscount); 
	
	
	if(sscount==0)
	{
		//checking cache 12345678
		 if($('a[aria-describedby="Ribbon.Tabs.PDP.Home.Project.Edit_ToolTip"]').length==1){
		sscount=1;
	//	console.log(sscount); 
		$('a[aria-describedby="Ribbon.Tabs.PDP.Home.Project.Edit_ToolTip"]').bind("click", function(){
            $.LoadingOverlay("show");
			
			setTimeout(function () {window.location.href = siteAbsoluteUrl+"/Project%20Detail%20Pages/Collaboration.aspx?projuid="+getParameterByName('projuid'); return true;}, 3000);

			//siteAbsoluteUrl+"/Project%20Detail%20Pages/Proj-Status.aspx?ProjUid=7c97b0da-2da3-e911-b08f-00155d642d0a&ret=0#!/Risks
			 return true;
            //do stuff here...
          })
		  $.LoadingOverlay("hide");
		  
		
	}
	}
	
	
		  
});
	