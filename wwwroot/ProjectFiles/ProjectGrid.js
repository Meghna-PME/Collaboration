<!DOCTYPE html>
<html lang="en">
<head> 
<meta http-equiv='cache-control' content='no-cache'>
<meta http-equiv='expires' content='0'>
<meta http-equiv='pragma' content='no-cache'>

  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
 <link rel="stylesheet" href="/sites/Development/Site%20Assets/Collaboration/ProjectFiles/3.4.0.bootstrap.min.css">
  <link rel="stylesheet" href="/sites/Development/Site%20Assets/Collaboration/ProjectFiles/URLs/2019.2.619.kendo.common.min.css"/>    
  <link rel="stylesheet" href="/sites/Development/Site%20Assets/Collaboration/ProjectFiles/URLs/2019.2.619.kendo.silver.min.css"/>
  <script src="/sites/Development/Site%20Assets/Collaboration/ProjectFiles/URLs/3.4.1.jquery.min.js"></script>
  
  <script src="/sites/Development/Site%20Assets/Collaboration/ProjectFiles/URLs/2019.2.619.angular.min.js"></script> 
  <script src="/sites/Development/Site%20Assets/Collaboration/ProjectFiles/URLs/2019.2.619.kendo.all.min.js"></script>
  <script type="text/javascript"  src="/sites/Development/Site%20Assets/Collaboration/LRURLs/ajax-libs-angularjs-1.2.0rc1-angular-route.min.js"></script>
   <script type="text/javascript"  src="/sites/Development/Site%20Assets/Collaboration/LRURLs/ajax-libs-angularjs-1.2.18-angular-sanitize.js"></script>
 <script type="text/javascript" src="/_layouts/15/1033/strings.js"></script>
<script type="text/javascript" src="/_layouts/15/clientforms.js"></script>
<script type="text/javascript" src="/_layouts/15/autofill.js"></script> 
<script type="text/javascript" src="/_layouts/15/sp.runtime.js"></script>
<script type="text/javascript" src="/_layouts/15/sp.js"></script>
  <script type="text/javascript" src="/sites/Development/Site%20Assets/Collaboration/ProjectFiles/URLs/PP/clientpeoplepicker.js"></script>
  <script type="text/javascript" src="/sites/Development/Site%20Assets/Collaboration/ProjectFiles/URLs/PP/config.peoplepicker.js"></script>
  <script type="text/javascript" src="/sites/Development/Site%20Assets/Collaboration/ProjectFiles/URLs/1.7.8.angular-resource.min.js"></script>
   <script type="text/javascript"  src="/sites/Development/Site%20Assets/Collaboration/ProjectFiles/URLs/2019.19.2.619.jszip.min.js"></script>
 <!-- <link rel="stylesheet" href="/sites/Development/Site%20Assets/Collaboration/ProjectFiles/kendo.custom.css"> -->
  <script type="text/javascript" src="/sites/Development/Site%20Assets/Collaboration/ProjectFiles/ProjectGridController.js"></script>
 <link rel="stylesheet" href="/sites/Development/Site%20Assets/Collaboration/ProjectFiles/CommonFile.css"> 
  <script src="/sites/Development/Site%20Assets/Collaboration/ProjectFiles/URLs/ng-file-upload-all.js"></script>
  <script src="/sites/Development/Site%20Assets/Collaboration/ProjectFiles/loadingoverlay.min.js"></script>
<script src="/sites/Development/Site%20Assets/Collaboration/ProjectFiles/bootstrap-toggle.min.js"></script>
 
     

</head>
<body ng-app="KendoProjectApp">
	<div ng-controller="ProjectkController" ng-init='init()'>  	 
		<div class="container-fluid" style="    margin-top: 70px; margin-left: -14px;">  
        <div>
		  <label style="    margin-top: 12px;    margin-right: 9px;" id="timeoutcounter"></label><button id="ReloadPageId" style="font-size: 12px; display: none;" class="k-button save-button" onclick="ReloadPageFunction()">Reload</button> 
		</div>
		  <ul class="nav nav-tabs">
				<li class="active"><a  href="#!Risks" name="Risks" data-target="#!Risks"  data-toggle="tab" ng-click="ShowRisks()" >Risks</a></li>
			    <li><a href="#!Issues" data-target="#!Issues" name="Issues" data-toggle="tab" ng-click="ShowIssues()" >Issues</a></li>
				<li><a href="#!Action" data-target="#!Action" name="Action" data-toggle="tab" ng-click="ShowAction()" >Actions</a></li>
				 <li><a href="#!Assumption" data-target="#!Assumption" name="Assumption" data-toggle="tab" ng-click="ShowAssumption()" >Assumptions</a></li>
				 <li><a href="#!Decisions" data-target="#!Decisions" name="Decisions" data-toggle="tab" ng-click="ShowDecisions()" >Decisions</a></li>
				 <li><a href="#!Insight" data-target="#!Insight" name="Insight" data-toggle="tab" ng-click="ShowInsight()" >Insights</a></li>          
				 <li><a href="#!ProjectChangeRequest" data-target="#!ProjectChangeRequest" name="ProjectChangeRequest" data-toggle="tab" ng-click="ShowProjectChangeRequest()" >Project Change Requests</a></li>
			     <li><a href="#!Budget" data-target="#!Budget" name="Budget" data-toggle="tab" ng-click="ShowBudget()" >Budget</a></li>
                 <li><a href="#!StatusMain" data-target="#!StatusMain" name="StatusMain" data-toggle="tab" ng-click="ShowStatusMain()" >Status</a></li>
				 <li><a href="#!RequirementManagement" data-target="#!RequirementManagement" name="RequirementManagement" data-toggle="tab" ng-click="ShowRequirementManagement()" >Requirement Management</a></li>
				 <li><a href="#!Benefit" data-target="#!Benefit" name="Benefit" data-toggle="tab" ng-click="ShowBenefit()" >Benefits</a></li>
				  <li><a href="#!ProductM" data-target="#!ProductM" name="ProductM" data-toggle="tab" ng-click="ShowProductM()" >Product Management</a></li>
				   <li><a href="#!Stakeholders" data-target="#!Stakeholders" name="Stakeholders" data-toggle="tab" ng-click="ShowStakeholders()" >Stakeholders</a></li>
				   <li><a href="#!Communication" data-target="#!Communication" name="Communication" data-toggle="tab" ng-click="ShowCommunication()" >Communication</a></li>
				    <li><a href="#!LessonsLearned" data-target="#!LessonsLearned" name="LessonsLearned" data-toggle="tab" ng-click="ShowLessonsLearned()">Lessons Learned</a></li>
		 </ul>
		  <div ng-view></div>
		</div>
	</div>
</body>
<style>
#pageStatusBar{
	margin-top: 30px;
}
.ms-srch-sb>input {
    display: inline-block !important;
    border-style: none !important;
    outline-style: none !important;
    height: 18px !important;
    margin: 0px 0px 0px 5px !important;
    padding: 0px 1px 0px 0px !important;
    width: 200px !important;
    background-color: transparent !important;
}
.checkbox label .toggle,.checkbox-inline .toggle{margin-left:-20px;margin-right:5px}
.toggle{position:relative;overflow:hidden}
.toggle input[type=checkbox]{display:none}
.toggle-group{position:absolute;width:200%;top:0;bottom:0;left:0;transition:left .35s;-webkit-transition:left .35s;-moz-user-select:none;-webkit-user-select:none}
.toggle.off .toggle-group{left:-100%}
.toggle-on{position:absolute;top:0;bottom:0;left:0;right:50%;margin:0;border:0;border-radius:0}
.toggle-off{position:absolute;top:0;bottom:0;left:50%;right:0;margin:0;border:0;border-radius:0}
.toggle-handle{position:relative;margin:0 auto;padding-top:0;padding-bottom:0;height:100%;width:0;border-width:0 1px}
.toggle.btn{min-width:30px;min-height:21px}
.toggle-on.btn{padding-right:24px}
.toggle-off.btn{padding-left:24px}
.toggle.btn-lg{min-width:79px;min-height:45px}
.toggle-on.btn-lg{padding-right:31px}
.toggle-off.btn-lg{padding-left:31px}
.toggle-handle.btn-lg{width:40px}
.toggle.btn-sm{min-width:50px;min-height:30px}
.toggle-on.btn-sm{padding-right:20px}
.toggle-off.btn-sm{padding-left:20px}
.toggle.btn-xs{min-width:35px;min-height:22px}
.toggle-on.btn-xs{padding-right:12px}
.toggle-off.btn-xs{padding-left:12px}

</style>
</html>
