function $_global_clientpeoplepicker() {
    if ("undefined" == typeof g_all_modules) g_all_modules = {};
    g_all_modules["clientpeoplepicker.js"] = {
        version: {
            rmj: 16,
            rmm: 0,
            rup: 6913,
            rpr: 1205
        }
    };
    typeof spWriteProfilerMark == "function" && spWriteProfilerMark("perfMarkBegin_clientpeoplepicker.js");
    SPClientPeoplePicker.UserQueryId = 0;
    SPClientPeoplePicker.UniqueUserIdx = 0;
    SPClientPeoplePicker.ShowUserPresence = true;
    SPClientPeoplePicker.SPClientPeoplePickerDict = {};
    SPClientPeoplePicker.UserQueryMaxTimeout = 25e3;
    SPClientPeoplePicker.MaximumLocalSuggestions = 5;
    SPClientPeoplePicker.ValueName = "Key";
    SPClientPeoplePicker.DisplayTextName = "DisplayText";
    SPClientPeoplePicker.SubDisplayTextName = "Title";
    SPClientPeoplePicker.DescriptionName = "Description";
    SPClientPeoplePicker.SIPAddressName = "SIPAddress";
    SPClientPeoplePicker.SuggestionsName = "MultipleMatches";
    SPClientPeoplePicker.UnvalidatedEmailAddressKey = "UNVALIDATED_EMAIL_ADDRESS";
    SPClientPeoplePicker.PrincipalTypeGuestUser = "GUEST_USER";
    SPClientPeoplePicker.ImageUrlProperty = "ImageUrl";
    SPClientPeoplePicker.KeyProperty = "AutoFillKey";
    SPClientPeoplePicker.DisplayTextProperty = "AutoFillDisplayText";
    SPClientPeoplePicker.SubDisplayTextProperty = "AutoFillSubDisplayText";
    SPClientPeoplePicker.TitleTextProperty = "AutoFillTitleText";
    SPClientPeoplePicker.DomainProperty = "DomainText";
    SPClientPeoplePicker.prototype = {
        TopLevelElementId: "",
        EditorElementId: "",
        AutoFillElementId: "",
        NotificationElementId: "",
        ResolvedListElementId: "",
        InitialHelpTextElementId: "",
        WaitImageId: "",
        HiddenInputId: "",
        AllowEmpty: true,
        ForceClaims: false,
        AutoFillEnabled: true,
        AllowMultipleUsers: false,
        OnValueChangedClientScript: null,
        OnUserResolvedClientScript: null,
        OnControlValidateClientScript: null,
        UrlZone: null,
        AllUrlZones: false,
        SharePointGroupID: 0,
        AllowEmailAddresses: false,
        AllowOnlyEmailAddresses: false,
        PPMRU: null,
        UseLocalSuggestionCache: true,
        CurrentQueryStr: "",
        LatestSearchQueryStr: "",
        InitialSuggestions: [],
        CurrentLocalSuggestions: [],
        CurrentLocalSuggestionsDict: {},
        VisibleSuggestions: 5,
        PrincipalAccountType: "",
        PrincipalAccountTypeEnum: 0,
        EnabledClaimProviders: "",
        SearchPrincipalSource: null,
        ResolvePrincipalSource: null,
        MaximumEntitySuggestions: 30,
        EditorWidthSet: false,
        QueryScriptInit: false,
        AutoFillControl: null,
        TotalUserCount: 0,
        UnresolvedUserCount: 0,
        UserQueryDict: {},
        ProcessedUserList: {},
        HasInputError: false,
        HasServerError: false,
        ShowUserPresence: true,
        InPlaceEditMode: false,
        TerminatingCharacter: ";",
        UnresolvedUserElmIdToReplace: "",
        HasNotifiedUser: false,
        WebApplicationID: "{00000000-0000-0000-0000-000000000000}",
        QuerySettings: null,
        SetInitialValue: function (b, d) {
            if (b == null || b.length == 0) return;
            var a = this,
				c;
            try {
                c = typeof SPClientAutoFill
            } catch (e) {
                c = "undefined"
            }
            EnsureScript("autofill.js", c, function () {
                a:;
                for (var f in b) {
                    var c = b[f];
                    if (c.IsResolved) a.AddProcessedUser(c, true);
                    else {
                        c[SPClientPeoplePicker.DisplayTextName] = c[SPClientPeoplePicker.ValueName];
                        var e = c[SPClientPeoplePicker.SuggestionsName];
                        c[SPClientPeoplePicker.SuggestionsName] = SPClientPeoplePicker.BuildAutoFillMenuItems(a, e);
                        a.AddUnresolvedUser(c, false)
                    }
                }
                d != null && a.ShowErrorMessage(d); a.EnsureAutoFillControl()
            })
        },
        AddUserKeys: function (c, d) {
            if (typeof d == "undefined") d = false;
            var a = this,
				b;
            try {
                b = typeof SP.ClientContext
            } catch (e) {
                b = "undefined"
            }
            EnsureScript("SP.js", b, function () {
                a:;
                if (c == null || c == "") return;
                var f = c.split(";"),
					g = f.length;
                if (d) {
                    if (g > 1) return;
                    var e = SPClientPeoplePicker.ParseUserKeyPaste(f[0]);
                    if (e == "") return;
                    var b;
                    try {
                        b = typeof SPClientAutoFill
                    } catch (h) {
                        b = "undefined"
                    }
                    EnsureScript("autofill.js", b, function () {
                        a:; a.EnsureAutoFillControl();
                        var c = document.getElementById(a.EditorElementId); c.value = e;
                        var b = a.AddPickerSearchQuery(e); a.ExecutePickerQuery([b], function (e, c) {
                            if (c == null || b != e) return;
                            var d = JSON.parse(c.m_value);
                            a.ShowAutoFill(SPClientPeoplePicker.BuildAutoFillMenuItems(a, d))
                        }, function () {
                            a:; a.SetServerError()
                        }, null)
                    })
                } else a.BatchAddUserKeysOperation(f, 0)
            })
        },
        BatchAddUserKeysOperation: function (b, a) {
            for (var g = b.length, d = this, e = 0; e < 10; e++) {
                if (a == g) {
                    setTimeout(function () {
                        a:; d.ResolveAllUsers(null)
                    }, 0);
                    return
                }
                var c = SPClientPeoplePicker.ParseUserKeyPaste(b[a]);
                if (c != "") {
                    var f = SPClientPeoplePicker.BuildUnresolvedEntity(c, c);
                    this.AddUnresolvedUser(f, false)
                }
                a++
            }
            setTimeout(function () {
                a:; d.BatchAddUserKeysOperation(b, a)
            }, 100)
        },
        ResolveAllUsers: function (j) {
            var a = this,
				k = document.getElementById(this.EditorElementId),
				d = document.getElementById(this.ResolvedListElementId);
            if (k == null || d == null) return;
            for (var g = [], e = {}, f = d.childNodes, l = f.length, c = 0; c < l; c++) {
                var m = f[c],
					h = m.id,
					b = this.ProcessedUserList[h];
                if (b != null && !b.ResolvedUser && b.Suggestions == null) {
                    var i = this.AddPickerResolveQuery(b.SID);
                    g.push(i);
                    e[i] = h
                }
            }
            this.ExecutePickerQuery(g, function (f, b) {
                if (b == null) return;
                a.ClearServerError();
                var c = e[f],
					d = a.ProcessedUserList[c];
                a.UpdateUnresolvedUser(b, d)
            }, function () {
                a:; a.SetServerError()
            }, j)
        },
        AddUnresolvedUserFromEditor: function (d) {
            var a = document.getElementById(this.EditorElementId);
            if (a == null) return;
            var b = a.value;
            if (b.length == 0) return;
            a.value = "";
            var c = SPClientPeoplePicker.BuildUnresolvedEntity(b, b);
            this.AddUnresolvedUser(c, d);
            a.size = 1;
            a.style.visibility != "" && a.focus()
        },
        AddUnresolvedUser: function (b, e) {
            var d = this.AddProcessedUser(b, false),
				a = this;
            if (e) {
                var f = b[SPClientPeoplePicker.ValueName],
					c = this.AddPickerResolveQuery(f);
                this.ExecutePickerQuery([c], function (f, b) {
                    if (b == null || c != f) return;
                    a.ClearServerError();
                    var e = a.ProcessedUserList[d];
                    a.UpdateUnresolvedUser(b, e)
                }, function () {
                    a:; a.SetServerError()
                }, null)
            }
        },
        UpdateUnresolvedUser: function (c, b) {
            if (c == null || b == null) return;
            var a = JSON.parse(c.m_value);
            if (Boolean(a.IsResolved)) {
                this.UnresolvedUserElmIdToReplace = b.UserContainerElementId;
                this.AddProcessedUser(a, true);
                this.AddResolvedUserToLocalCache(SPClientPeoplePicker.AugmentEntity(a), b.ResolveText)
            } else {
                b.UpdateSuggestions(a);
                this.OnControlResolvedUserChanged();
                this.OnControlValueChanged()
            }
        },
        AddPickerSearchQuery: function (e) {
            var c = SP.ClientContext.get_current(),
				b = String(SPClientPeoplePicker.UserQueryId++),
				a = this.GetPeoplePickerQueryParameters();
            a.set_queryString(e);
            a.set_principalSource(this.SearchPrincipalSource);
            var d = SP.UI.ApplicationPages.ClientPeoplePickerWebServiceInterface;
            this.UserQueryDict[b] = d.clientPeoplePickerSearchUser(c, a);
            return b
        },
        AddPickerResolveQuery: function (e) {
            var c = SP.ClientContext.get_current(),
				b = String(SPClientPeoplePicker.UserQueryId++),
				a = this.GetPeoplePickerQueryParameters();
            a.set_queryString(e);
            a.set_principalSource(this.ResolvePrincipalSource);
            var d = SP.UI.ApplicationPages.ClientPeoplePickerWebServiceInterface;
            this.UserQueryDict[b] = d.clientPeoplePickerResolveUser(c, a);
            return b
        },
        GetPeoplePickerQueryParameters: function () {
            a:;
            var a = new SP.UI.ApplicationPages.ClientPeoplePickerQueryParameters; a.set_required(!this.AllowEmpty); a.set_forceClaims(this.ForceClaims); a.set_allowMultipleEntities(this.AllowMultipleUsers); a.set_allowEmailAddresses(this.AllowEmailAddresses); a.set_allowOnlyEmailAddresses(this.AllowOnlyEmailAddresses); a.set_allUrlZones(this.AllUrlZones); a.set_enabledClaimProviders(this.EnabledClaimProviders); a.set_maximumEntitySuggestions(this.MaximumEntitySuggestions); a.set_sharePointGroupID(this.SharePointGroupID); a.set_webApplicationID(this.WebApplicationID); a.set_principalType(SPClientPeoplePicker.CreateSPPrincipalType(this.PrincipalAccountType)); a.set_urlZoneSpecified(this.UrlZone != null); a.set_urlZone(this.UrlZone != null ? this.UrlZone : 0); Boolean(this.QuerySettings) && a.set_querySettings(this.QuerySettings);
            return a
        },
        ExecutePickerQuery: function (c, f, e, b) {
            if (c == null || c.length == 0 || f == null || e == null) {
                b != null && b();
                return
            }
            this.AddLoadingSuggestionMenuOption();
            var a = this,
				h = SP.ClientContext.get_current();
            h.executeQueryAsync(function () {
                a:; d(f)
            }, function () {
                a:; d(e)
            });
            var g = false,
				i = setTimeout(function () {
				    a:; g = true; a.CloseAutoFill(); a.SetServerError(); a.ToggleWaitImageDisplay(false);
				    for (var c in a.UserQueryDict) delete a.UserQueryDict[c]; b != null && b()
				}, SPClientPeoplePicker.UserQueryMaxTimeout);

            function d(f) {
                clearTimeout(i);
                if (g) return;
                a.ToggleWaitImageDisplay(false);
                for (var h = c.length, e = 0; e < h; e++) {
                    var d = c[e];
                    f(d, a.UserQueryDict[d]);
                    delete a.UserQueryDict[d]
                }
                b != null && b()
            }
        },
        AddProcessedUser: function (b, c) {
            if (b == null) return "";
            var h = b[SPClientPeoplePicker.ValueName],
				f = String(SPClientPeoplePicker.UniqueUserIdx++),
				a = this.TopLevelElementId + "_" + h + "_ProcessedUser" + f,
				g = document.getElementById(this.ResolvedListElementId);
            if (this.UnresolvedUserElmIdToReplace == "") {
                this.TotalUserCount++;
                if (!c) this.UnresolvedUserCount++;
                var d = new SPClientPeoplePickerProcessedUser(b, a, c);
                //if(d.DisplayName.indexOf(' - ')>-1)
				//	d.DisplayName = d.DisplayName.substr(0, d.DisplayName.indexOf(' - '));				
				if(d.DisplayName != undefined ){
					var guid = d.DisplayName.slice(-36);
					var pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
					if(pattern.test(guid) === true)
						d.DisplayName = d.DisplayName.slice(0, -39);															
				}
                this.ProcessedUserList[a] = d;
                g.innerHTML += d.BuildUserHTML();
                d.UpdateUserMaxWidth()
            } else {
                var e = this.ProcessedUserList[this.UnresolvedUserElmIdToReplace];
                e != null && e.UpdateResolvedUser(b, a);
                delete this.ProcessedUserList[this.UnresolvedUserElmIdToReplace];
                this.ProcessedUserList[a] = e;
                this.UnresolvedUserCount--;
                this.UnresolvedUserElmIdToReplace = ""
            }
            SPClientPeoplePicker.ShowUserPresence && c && typeof ProcessImn != "undefined" && ProcessImn();
            this.OnControlResolvedUserChanged();
            this.OnControlValueChanged();
            return a
        },
        DeleteProcessedUser: function (a) {
            var e = null;
            if (a == null) {
                var c = document.getElementById(this.ResolvedListElementId);
                if (c != null) a = c.lastChild
            }
            if (a != null) {
                var b = a.id;
                a.parentNode.removeChild(a);
                var d = this.ProcessedUserList[b];
                if (d != null && !d.ResolvedUser) this.UnresolvedUserCount--;
                this.TotalUserCount--;
                delete this.ProcessedUserList[b];
                this.OnControlResolvedUserChanged();
                this.OnControlValueChanged()
            }
        },
        OnControlValueChanged: function () {
            a:; this.SaveAllUserKeysToHiddenInput();
            var a = document.getElementById(this.InitialHelpTextElementId);
            if (a != null) a.style.display = "none"; this.OnValueChangedClientScript != null && this.OnValueChangedClientScript(this.TopLevelElementId, this.GetAllUserInfo()); this.HasNotifiedUser = false
        },
        OnControlResolvedUserChanged: function () {
            a:; this.SaveResolvedUsersToVisibleInput(); this.SaveAllUserKeysToHiddenInput(); this.ValidateCurrentState(); this.OnUserResolvedClientScript != null && this.OnUserResolvedClientScript(this.TopLevelElementId, this.GetAllUserInfo())
        },
        EnsureAutoFillControl: function () {
            a:;
            if (this.AutoFillEnabled && this.AutoFillControl == null) {
                this.AutoFillControl = new SPClientAutoFill(this.EditorElementId, this.AutoFillElementId, SPClientPeoplePicker_CallbackPopulateAutoFillFromEditor);
                if (this.AutoFillControl != null) {
                    this.AutoFillControl.AutoFillMinTextLength = 3;
                    this.AutoFillControl.VisibleItemCount = this.VisibleSuggestions
                }
            }
        },
        ShowAutoFill: function (a) {
            if (a != null) {
                if (this.AutoFillControl != null) {
                    var d = SPClientPeoplePicker_CallbackOnAutoFillClose;
                    $.each(a,  function( index, item) {
						//if(item.AutoFillDisplayText != undefined && (item.AutoFillDisplayText).indexOf(' - ')>-1)
						//item.AutoFillDisplayText = item.AutoFillDisplayText.substr(0, item.AutoFillDisplayText.indexOf(' - '));
						if(item.AutoFillDisplayText != undefined ){
							var guid = item.AutoFillDisplayText.slice(-36);
							var pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
							if(pattern.test(guid) === true)
								item.AutoFillDisplayText = item.AutoFillDisplayText.slice(0, -39);															
						}
							
					})
                    this.AutoFillControl.PopulateAutoFill(a, d);
                    if (!this.HasNotifiedUser) {
                        var c = function (a) {
                            var d = false;
                            if (a != null)
                                for (var c = 0; c < a.length; c++) {
                                    var b = a[c];
                                    if (b != null && b.AutoFillKey != null && b.AutoFillKey != "") {
                                        d = true;
                                        break
                                    }
                                }
                            return d
                        },
							b = document.getElementById(this.NotificationElementId);
                        if (!IsNullOrUndefined(b) && c(a)) {
                            b.innerHTML = STSHtmlEncode(Strings.STS.L_SPClientPeoplePicker_SuggestionsAvailable_Text);
                            this.HasNotifiedUser = true
                        }
                    }
                    AddEvtHandler(document.body.parentNode, "onclick", SPClientPeoplePicker_BodyOnClickCloseAutoFill)
                }
            } else this.CloseAutoFill()
        },
        FocusAutoFill: function () {
            a:; this.AutoFillControl != null && this.AutoFillControl.FocusAutoFill()
        },
        CloseAutoFill: function () {
            a:; this.AutoFillControl != null && this.AutoFillControl.CloseAutoFill(null); RemoveEvtHandler(document.body.parentNode, "onclick", SPClientPeoplePicker_BodyOnClickCloseAutoFill)
        },
        IsAutoFillOpen: function () {
            a:;
            return this.AutoFillControl == null ? false : this.AutoFillControl.IsAutoFillOpen()
        },
        EnsureEditorWidth: function () {
            a:;
            var b = document.getElementById(this.EditorElementId);
            if (b != null) {
                var a = b.parentNode.clientWidth - 30;
                if (a <= 0) a = 20;
                if (!this.InPlaceEditMode) b.style.maxWidth = String(a) + "px"
            }
            this.EditorWidthSet = true
        },
        SetFocusOnEditorEnd: function () {
            a:;
            var a = document.getElementById(this.EditorElementId);
            if (a != null) {
                var b = a.value.length;
                if (a.createTextRange) {
                    var c = a.createTextRange();
                    c.collapse(true);
                    c.moveStart("character", b);
                    c.moveEnd("character", b);
                    c.select()
                } else if (a.setSelectionRange) {
                    a.focus();
                    a.setSelectionRange(b, b)
                }
            }
        },
        ToggleWaitImageDisplay: function (b) {
            var a = document.getElementById(this.WaitImageId);
            if (a != null) a.style.display = b ? "inline" : "none"
        },
        SaveAllUserKeysToHiddenInput: function () {
            a:;
            var a = document.getElementById(this.HiddenInputId);
            if (a != null) a.value = this.GetControlValueAsText()
        },
        SaveResolvedUsersToVisibleInput: function () {
            a:;
            var a = document.getElementById(this.EditorElementId); a != null && a.setAttribute("aria-label", this.GetResolvedUsersAsText())
        },
        GetCurrentEditorValue: function () {
            a:;
            var a = document.getElementById(this.EditorElementId);
            return a != null ? a.value : ""
        },
        GetAllUserInfo: function () {
            a:;
            var a = []; this.IterateEachProcessedUser(function (c, b) {
                if (b != null) {
                    a.push(b.UserInfo);
                    a[a.length - 1].Resolved = b.ResolvedUser
                }
            });
            return a
        },
        HasResolvedUnverifiedEmail: function () {
            a:;
            var a = false,
				b = this.GetAllUserInfo(); this.IterateEachProcessedUser(function (c, b) {
				    if (b != null && b.ResolvedAsUnverifiedEmail()) {
				        a = true;
				        return
				    }
				});
            return a
        },
        GetControlValueAsJSObject: function () {
            a:;
            var b = this.GetAllUserInfo(),
				a = this.GetCurrentEditorValue();
            if (a == "") return b;
            var c = SPClientPeoplePicker.BuildUnresolvedEntity(a, a); b.push(c);
            return b
        },
        GetAllUserKeys: function () {
            a:;
            var a = "",
				b = this; this.IterateEachProcessedUser(function (c, b) {
				    if (b != null) {
				        if (c != 0) a += ";";
				        a += b.SID
				    }
				});
            return a
        },
        GetControlValueAsText: function () {
            a:;
            var a = this.GetControlValueAsJSObject();
            for (var b in a) {
                if (typeof a[b].Claim != "undefined") delete a[b].Claim;
                if (typeof a[b].EntityDataElements != "undefined") delete a[b].EntityDataElements
            }
            return JSON.stringify(a)
        },
        GetResolvedUsersAsText: function () {
            a:;
            var b = this.GetControlValueAsJSObject(),
				a = "";
            for (var c in b) a += b[c].DisplayText + ", "; a = a.substring(0, a.length - 2);
            return a
        },
        IsEmpty: function () {
            a:;
            var a = this.GetCurrentEditorValue();
            return this.TotalUserCount == 0 && a == ""
        },
        IterateEachProcessedUser: function (d) {
            var b = document.getElementById(this.ResolvedListElementId);
            if (b == null || d == null) return;
            for (var c = b.childNodes, e = c.length, a = 0; a < e; a++) {
                var f = c[a],
					g = this.ProcessedUserList[f.id];
                d(a, g)
            }
        },
        HasResolvedUsers: function () {
            a:;
            return this.TotalUserCount - this.UnresolvedUserCount > 0
        },
        Validate: function () {
            a:;
            if (!this.AllowEmpty && this.IsEmpty()) {
                this.HasInputError = true;
                this.ShowErrorMessage(Strings.STS.L_SPClientRequiredValidatorError)
            } else this.ValidateCurrentState()
        },
        ValidateCurrentState: function () {
            a:;
            if (!this.AllowMultipleUsers && this.TotalUserCount > 1) {
                this.HasInputError = true;
                this.ShowErrorMessage(Strings.STS.L_SPClientPeoplePickerMultipleUserError)
            } else {
                var a = this.GetUnresolvedEntityErrorMessage();
                if (a != "") {
                    this.HasInputError = true;
                    this.ShowErrorMessage(a)
                } else {
                    this.HasInputError = false;
                    this.HasServerError = false;
                    this.ShowErrorMessage()
                }
            }
            this.OnControlValidate()
        },
        GetUnresolvedEntityErrorMessage: function () {
            a:;
            var a = ""; this.IterateEachProcessedUser(function (c, b) {
                if (b != null && !b.ResolvedUser && b.ErrorDescription != "")
                    if (a == "") a = b.ErrorDescription
            });
            return a
        },
        ShowErrorMessage: function (c) {
            var a = document.getElementById(this.TopLevelElementId);
            a != null && a.nextSibling != null && a.parentNode.removeChild(a.nextSibling);
            if (c != null && c != "") {
                var b = document.createElement("SPAN");
                b.className = "ms-formvalidation sp-peoplepicker-errorMsg";
                b.innerHTML = '<span role="alert">' + STSHtmlEncode(c) + "<br/></span>";
                a.parentNode.appendChild(b)
            }
        },
        ClearServerError: function () {
            a:; this.HasServerError = false; this.ValidateCurrentState()
        },
        SetServerError: function () {
            a:; this.HasServerError = true; this.ShowErrorMessage(Strings.STS.L_SPClientPeoplePickerServerTimeOutError); this.OnControlValidate()
        },
        OnControlValidate: function () {
            a:; this.OnControlValidateClientScript != null && this.OnControlValidateClientScript(this.TopLevelElementId, this.GetAllUserInfo())
        },
        SetEnabledState: function (c) {
            var a = document.getElementById(this.EditorElementId),
				b = document.getElementById(this.TopLevelElementId);
            if (a == null || b == null) return;
            if (c) {
                a.disabled = false;
                RemoveCssClassFromElement(b, this.InPlaceEditMode ? "sp-peoplepicker-topLevelDisabled-IPE" : "sp-peoplepicker-topLevelDisabled")
            } else {
                a.value = "";
                a.disabled = true;
                AddCssClassToElement(b, this.InPlaceEditMode ? "sp-peoplepicker-topLevelDisabled-IPE" : "sp-peoplepicker-topLevelDisabled")
            }
            this.SaveAllUserKeysToHiddenInput()
        },
        DisplayLocalSuggestions: function () {
            a:;
            var a = document.getElementById(this.EditorElementId);
            if (a == null) return; this.HasServerError && this.ClearServerError();
            var d = a.value; this.CompileLocalSuggestions(d);
            var b = this.CurrentLocalSuggestions.length;
            if (b > 0) {
                var c = this.CurrentLocalSuggestions.concat([]);
                this.ShowAutoFill(SPClientPeoplePicker.AddAutoFillMetaData(this, c, b))
            } else !this.PlanningGlobalSearch() && this.CloseAutoFill()
        },
        CompileLocalSuggestions: function (a) {
            if (a == this.CurrentQueryStr) return;
            this.CurrentLocalSuggestions = [];
            this.CurrentLocalSuggestionsDict = {};
            if (a == null || a == "") return;
            if (!this.ShouldUsePPMRU() && (this.InitialSuggestions == null || this.InitialSuggestions.length == 0)) return;
            this.CurrentQueryStr = a;
            this.LatestSearchQueryStr = "";
            var j = a.toLowerCase();
            if (this.ShouldUsePPMRU())
                for (var f = this.PPMRU.GetItems(a), i = f.length, d = 0; d < i; d++) {
                    var c = f[d],
						g = c.Key.toLowerCase();
                    if (this.CurrentLocalSuggestionsDict[g] == null) {
                        this.CurrentLocalSuggestions.push(c);
                        this.CurrentLocalSuggestionsDict[g] = c;
                        if (this.CurrentLocalSuggestions.length == SPClientPeoplePicker.MaximumLocalSuggestions) return
                    }
                }
            for (var h = this.InitialSuggestions.length, e = 0; e < h; e++) {
                var b = this.InitialSuggestions[e];
                if (SPClientPeoplePicker.TestLocalMatch(j, b)) {
                    this.CurrentLocalSuggestions.push(b);
                    this.CurrentLocalSuggestionsDict[b.Key.toLowerCase()] = b;
                    if (this.CurrentLocalSuggestions.length == SPClientPeoplePicker.MaximumLocalSuggestions) return
                }
            }
        },
        PlanningGlobalSearch: function () {
            a:;
            var a = document.getElementById(this.EditorElementId);
            return a != null && this.AutoFillControl != null && a.value.length >= this.AutoFillControl.AutoFillMinTextLength
        },
        AddLoadingSuggestionMenuOption: function () {
            a:;
            if (!this.ShowingLocalSuggestions() && !this.IsAutoFillOpen()) {
                this.ToggleWaitImageDisplay(true);
                return
            }
            var a = []; a.push(SPClientAutoFill.BuildAutoFillSeparatorMenuItem()); a.push(SPClientAutoFill.BuildAutoFillLoadingSuggestionsMenuItem()); this.ShowAutoFill(this.CurrentLocalSuggestions.concat(a))
        },
        ShowingLocalSuggestions: function () {
            a:;
            return this.IsAutoFillOpen() && this.CurrentLocalSuggestions.length > 0
        },
        ShouldUsePPMRU: function () {
            a:;
            return this.UseLocalSuggestionCache && this.UrlZone == null && this.SharePointGroupID <= 0 && this.WebApplicationID == "{00000000-0000-0000-0000-000000000000}" && (this.EnabledClaimProviders == "" || this.EnabledClaimProviders == null) && this.PrincipalAccountTypeEnum % 2 == 1 && this.ResolvePrincipalSource == 15
        },
        AddResolvedUserToLocalCache: function (a, b) {
            if (a != null && b != null && b != "") this.ShouldUsePPMRU() && SPClientPeoplePicker.IsUserEntity(a) && this.PPMRU.SetItem(b, a)
        }
    };
    SPClientPeoplePicker.TestLocalMatch = function (b, a) {
        if (b == null || b == "" || a == null) return false;
        var h = new URI(document.URL);
        if (a.DomainText != h.getAuthority()) return false;
        if (typeof a.LocalSearchTerm != "undefined") {
            var f = a.LocalSearchTerm;
            if (f != null && f.indexOf(b) == 0) return true
        }
        var c = a.Key,
			e = c.indexOf("\\");
        if (e != -1 && e != c.length - 1) c = c.substr(e + 1);
        var g = a.EntityData != null && a.EntityData.Email != null,
			d = g ? a.EntityData.Email : "";
        if (d.indexOf("@") != -1) d = d.substr(0, d.indexOf("@"));
        return c.toLowerCase().indexOf(b) == 0 || a.DisplayText.toLowerCase().indexOf(b) == 0 || d.toLowerCase().indexOf(b) == 0 ? true : false
    };
    SPClientPeoplePicker.PickerObjectFromSubElement = function (c) {
        var b = SPClientPeoplePicker.GetTopLevelControl(c);
        if (b == null) return null;
        var a = b.id;
        return typeof SPClientPeoplePicker.SPClientPeoplePickerDict[a] != "undefined" ? SPClientPeoplePicker.SPClientPeoplePickerDict[a] : null
    };
    SPClientPeoplePicker.GetTopLevelControl = function (b) {
        var a = b;
        while (a != null && a.nodeName.toLowerCase() != "body") {
            if (Boolean(a.getAttribute("SPClientPeoplePicker"))) return a;
            a = a.parentNode
        }
        return null
    };
    SPClientPeoplePicker.AugmentEntitySuggestions = function (a, c, i) {
        if (a == null || c == null || typeof c.length == "undefined") return [];
        for (var f = [], h = c.length, e = 0; e < h; e++) {
            var b = c[e],
				d, g = "";
            if (b[SPClientPeoplePicker.ValueName] != null) g = b[SPClientPeoplePicker.ValueName];
            if (i && (d = a.CurrentLocalSuggestionsDict[g.toLowerCase()]) != null) {
                b.IsResolved = d.IsResolved;
                SPClientPeoplePicker.UpdateAndAugmentEntity(d, b);
                a.ShouldUsePPMRU() && a.PPMRU != null && a.PPMRU.WriteCache();
                continue
            }
            f.push(SPClientPeoplePicker.AugmentEntity(b))
        }
        return f
    };
    SPClientPeoplePicker.AugmentEntity = function (a) {
        var f = "",
			h = "",
			g = "",
			e = "",
			c = "";
        if (a[SPClientPeoplePicker.ValueName] != null) f = a[SPClientPeoplePicker.ValueName];
        if (a[SPClientPeoplePicker.DisplayTextName] != null) h = a[SPClientPeoplePicker.DisplayTextName];
        if (a.EntityData != null && a.EntityData[SPClientPeoplePicker.SubDisplayTextName] != null) g = a.EntityData[SPClientPeoplePicker.SubDisplayTextName];
        if (a[SPClientPeoplePicker.DescriptionName] != null) c = a[SPClientPeoplePicker.DescriptionName];
        var i = a.EntityData != null && a.EntityData.Email != null,
			b = i ? a.EntityData.Email : "",
			d = a.ProviderDisplayName != null ? a.ProviderDisplayName : "";
        e = b != "" && d != "" ? b + "\n" + d : b + d;
        if (Boolean(c)) e += "\n" + c;
        a[SPClientPeoplePicker.KeyProperty] = f;
        if (Flighting.VariantConfiguration.IsExpFeatureClientEnabled(187)) a[SPClientPeoplePicker.ImageUrlProperty] = "/_layouts/15/userphoto.aspx?size=S&accountname=" + encodeURIComponent(!SP.ScriptUtility.isNullOrEmptyString(b) ? b : f);
        a[SPClientPeoplePicker.DisplayTextProperty] = h;
        a[SPClientPeoplePicker.SubDisplayTextProperty] = g;
        a[SPClientPeoplePicker.TitleTextProperty] = e;
        var j = new URI(document.URL);
        a[SPClientPeoplePicker.DomainProperty] = j.getAuthority();
        return a
    };
    SPClientPeoplePicker.UpdateAndAugmentEntity = function (d, c) {
        var a;
        for (var b in c)
            if (c.hasOwnProperty(b)) {
                a = c[b];
                if (a != null) d[b] = a
            }
        return SPClientPeoplePicker.AugmentEntity(d)
    };
    SPClientPeoplePicker.ParseUserKeyPaste = function (a) {
        if (a == null || a == "") return "";
        var b = a.indexOf("<"),
			d = a.indexOf("@", b),
			c = a.indexOf(">", d);
        return b != -1 && d != -1 && c != -1 ? a.substring(b + 1, c) : a
    };
    SPClientPeoplePicker.CreateSPPrincipalType = function (d) {
        if (d == null || d == "") return 0;
        var a = 0,
			b = d.split(",");
        for (var c in b) {
            if (b[c] == "User") a |= 1;
            if (b[c] == "DL") a |= 2;
            if (b[c] == "SecGroup") a |= 4;
            if (b[c] == "SPGroup") a |= 8
        }
        return a
    };
    SPClientPeoplePicker.IsUserEntity = function (a) {
        return a == null ? false : a.EntityType == "User" || a.EntityData != null && a.EntityData.PrincipalType == "User"
    };
    SPClientPeoplePicker.BuildAutoFillMenuItems = function (b, a) {
        a = SPClientPeoplePicker.AugmentEntitySuggestions(b, a, false);
        return SPClientPeoplePicker.AddAutoFillMetaData(b, a, a.length)
    };
    SPClientPeoplePicker.AddAutoFillMetaData = function (d, a, b) {
        if (b == 0) {
            a.push(SPClientAutoFill.BuildAutoFillSeparatorMenuItem());
            a.push(SPClientAutoFill.BuildAutoFillFooterMenuItem(Strings.STS.L_SPClientPeoplePickerNoResults))
        } else {
            a.push(SPClientAutoFill.BuildAutoFillSeparatorMenuItem());
            var c = GetLocalizedCountValue(Strings.STS.L_SPClientPeoplePicker_AutoFillFooter, Strings.STS.L_SPClientPeoplePicker_AutoFillFooterIntervals, b);
            a.push(SPClientAutoFill.BuildAutoFillFooterMenuItem(StBuildParam(c, b)))
        }
        return a
    };
    SPClientPeoplePicker.BuildUnresolvedEntity = function (b, c) {
        var a = {};
        a.ResolveText = b;
        a.IsResolved = false;
        a[SPClientPeoplePicker.ValueName] = a[SPClientPeoplePicker.KeyProperty] = b;
        a[SPClientPeoplePicker.DisplayTextName] = a[SPClientPeoplePicker.DisplayTextProperty] = c;
        return a
    };
    SPClientPeoplePicker.InitializeStandalonePeoplePicker = function (g, h, a) {
        var f = document.getElementById(g);
        if (f == null) return;
        a.ServerContainerId = g + "_TopSpan";
        var e, d, c, b = {};
        b.CurrentFieldValue = h;
        b.CurrentFieldSchema = a;
        b.FormContext = {
            updateControlValue: function () { },
            registerClientValidator: function () { },
            registerGetValueCallback: function () { },
            registerHasErrorCallback: function () { },
            registerValidationErrorCallback: function (b, a) {
                if (typeof a == "function") c = a
            },
            registerFocusCallback: function (b, a) {
                if (typeof a == "function") d = a
            },
            registerInitCallback: function (b, a) {
                if (typeof a == "function") e = a
            }
        };
        f.innerHTML = SPClientPeoplePickerCSRTemplate(b);
        e != null && e();
        a.SetFocus && d != null && d();
        a.ErrorMessage != null && a.ErrorMessage != "" && c != null && c({
            errorMessage: a.ErrorMessage
        })
    };
    SPClientPeoplePickerProcessedUser.prototype = {
        UserContainerElementId: "",
        DisplayElementId: "",
        PresenceElementId: "",
        DeleteUserElementId: "",
        SID: "",
        DisplayName: "",
        SIPAddress: "",
        UserInfo: null,
        ResolvedUser: true,
        Suggestions: null,
        ErrorDescription: "",
        ResolveText: "",
        UpdateResolvedUser: function (a, c) {
            var d = document.getElementById(this.UserContainerElementId),
				b = document.getElementById(this.DisplayElementId),
				f = document.getElementById(this.PresenceElementId),
				e = document.getElementById(this.DeleteUserElementId),
				i = a[SPClientPeoplePicker.ValueName],
				g = a[SPClientPeoplePicker.DisplayTextName],
				h = a.EntityData != null ? a.EntityData[SPClientPeoplePicker.SIPAddressName] : null;
            this.ResolvedUser = true;
            this.UserInfo = a;
            d.setAttribute("ResolvedUser", "true");
            this.Suggestions = null;
            this.ErrorDescription = "";
            this.SID = i != null ? i : "";
            d.setAttribute("SID", this.SID);
            this.DisplayName = g != null ? g : "";
            b.title = b.innerHTML = STSHtmlEncode(this.DisplayName);
            e.title = StBuildParam(Strings.STS.L_SPClientDeleteProcessedUserAltText, this.DisplayName);
            b.className = "ms-entity-resolved";
            this.UserContainerElementId = d.id = c;
            this.DisplayElementId = b.id = c + "_UserDisplay";
            this.PresenceElementId = f.id = c + "_PresenceContainer";
            this.DeleteUserElementId = e.id = c + "_DeleteUserLink";
            this.SIPAddress = h != null ? h : "";
            f.innerHTML = SPClientPeoplePickerProcessedUser.BuildUserPresenceHtml(this.PresenceElementId, this.SIPAddress, this.ResolvedUser)
        },
        UpdateSuggestions: function (b) {
            var a = b.MultipleMatches;
            if (a == null) a = [];
            var d = document.getElementById(this.UserContainerElementId),
				c = SPClientPeoplePicker.PickerObjectFromSubElement(d);
            this.Suggestions = SPClientPeoplePicker.BuildAutoFillMenuItems(c, a);
            if (b.Description != null) this.ErrorDescription = b.Description
        },
        BuildUserHTML: function () {
            a:;
            var a = [],
				c = SPClientPeoplePickerProcessedUser.BuildUserPresenceHtml(this.PresenceElementId, this.SIPAddress, this.ResolvedUser); a.push('<span data-sp-peoplePickerProcessedUser="true" id="'); a.push(STSHtmlEncode(this.UserContainerElementId)); a.push('" ResolvedUser="'); a.push(this.ResolvedUser ? "true" : "false"); a.push('" SID="'); a.push(STSHtmlEncode(this.SID)); a.push(this.ResolvedUser ? '" ' : '" aria-invalid="true" '); a.push('class="sp-peoplepicker-userSpan">'); a.push('<span class="sp-peoplepicker-userPresence" id="'); a.push(STSHtmlEncode(this.PresenceElementId)); a.push('">'); a.push(c); a.push("</span>"); a.push('<span class="'); a.push(this.ResolvedUser ? "ms-entity-resolved" : "ms-entity-unresolved"); a.push('" id="'); a.push(STSHtmlEncode(this.DisplayElementId)); a.push('" title="'); a.push(STSHtmlEncode(this.DisplayName)); a.push('">');
            if (!this.ResolvedUser) {
                a.push('<a href="#" data-sp-peoplePickerProcessedUserDisplay="true" class="sp-peoplepicker-userDisplayLink" ');
                a.push('onkeydown="return SPClientPeoplePickerProcessedUser.HandleResolveProcessedUserKey(event);">')
            }
            a.push(STSHtmlEncode(this.DisplayName)); !this.ResolvedUser && a.push("</a>"); a.push("</span>");
            var b = StBuildParam(Strings.STS.L_SPClientDeleteProcessedUserAltText, this.DisplayName);
            if (!(window.OffSwitch == null || OffSwitch.IsActive("853E9AAB-D61B-49BA-85BD-12860762DB64"))) {
                a.push('<a class="sp-peoplepicker-delImage" aria-label="');
                a.push(STSHtmlEncode(b));
                a.push('" title="');
                a.push(STSHtmlEncode(b));
                a.push('" id="');
                a.push(STSHtmlEncode(this.DeleteUserElementId));
                a.push('" onkeydown="SPClientPeoplePickerProcessedUser.HandleDeleteProcessedUserKey(event); return true;"');
                a.push(' href="#" onclick="SPClientPeoplePickerProcessedUser.DeleteProcessedUser(this.parentNode); return false;" >');
                a.push('<span aria-hidden="true">x</span></a>');
                a.push("</span>")
            } else {
                a.push('<a class="sp-peoplepicker-delImage" title="');
                a.push(STSHtmlEncode(b));
                a.push('" id="');
                a.push(STSHtmlEncode(this.DeleteUserElementId));
                a.push('" onkeydown="SPClientPeoplePickerProcessedUser.HandleDeleteProcessedUserKey(event); return true;"');
                a.push(' href="#" onclick="SPClientPeoplePickerProcessedUser.DeleteProcessedUser(this.parentNode); return false;" >');
                a.push("x</a>")
            }
            a.push("</span>");
            return a.join("")
        },
        UpdateUserMaxWidth: function () {
            a:;
            var a = document.getElementById(this.DisplayElementId);
            if (a != null) {
                var b = SPClientPeoplePicker.PickerObjectFromSubElement(a),
					c = document.getElementById(b.TopLevelElementId);
                if (!b.InPlaceEditMode) a.style.maxWidth = (c.clientWidth - 65).toString() + "px"
            }
        },
        ResolvedAsUnverifiedEmail: function () {
            a:;
            if (!this.ResolvedUser || this.UserInfo == null) return false;
            var a = this.UserInfo;
            return a.EntityData != null && a.EntityData.PrincipalType == SPClientPeoplePicker.UnvalidatedEmailAddressKey
        }
    };
    SPClientPeoplePickerProcessedUser.BuildUserPresenceHtml = function (f, b, d) {
        if (!SPClientPeoplePicker.ShowUserPresence) return "";
        if (!d || b == null || b == "") return "";
        var e = {
            ID: "0",
            Entity: [{
                id: "0",
                title: f,
                sip: b
            }]
        },
			c = {
			    Field: [{
			        Name: "Entity",
			        FieldType: "User",
			        PresenceOnly: "1",
			        InlineRender: "1",
			        Type: "User"
			    }],
			    EffectivePresenceEnabled: "1",
			    PresenceAlt: Strings.STS.L_UserFieldNoUserPresenceAlt
			},
			a = new ContextInfo;
        a.Templates = {};
        a.Templates.Fields = {};
        return spMgr.RenderFieldByName(a, "Entity", e, c)
    };
    SPClientPeoplePickerProcessedUser.GetUserContainerElement = function (b) {
        var a = b;
        while (a != null && a.nodeName.toLowerCase() != "body") {
            if (a.getAttribute("data-sp-peoplePickerProcessedUser") == "true") return a;
            a = a.parentNode
        }
        return null
    };
    SPClientPeoplePickerProcessedUser.HandleProcessedUserClick = function (e) {
        var b = SPClientPeoplePickerProcessedUser.GetUserContainerElement(e),
			a = SPClientPeoplePicker.PickerObjectFromSubElement(b);
        if (b != null && a != null) {
            var c = b.id,
				d = a.ProcessedUserList[c];
            if (d != null) {
                a.UnresolvedUserElmIdToReplace = c;
                a.ShowAutoFill(d.Suggestions);
                a.FocusAutoFill()
            }
        }
    };
    SPClientPeoplePickerProcessedUser.DeleteProcessedUser = function (b) {
        var a = SPClientPeoplePicker.PickerObjectFromSubElement(b);
        a.CloseAutoFill();
        a.DeleteProcessedUser(b);
        a.SetFocusOnEditorEnd()
    };
    SPClientPeoplePickerProcessedUser.HandleDeleteProcessedUserKey = function (a) {
        if (a == null) a = window.event;
        var b = GetEventKeyCode(a),
			c = GetEventSrcElement(a);
        (b == 8 || b == 46) && SPClientPeoplePickerProcessedUser.DeleteProcessedUser(c.parentNode)
    };
    SPClientPeoplePickerProcessedUser.HandleResolveProcessedUserKey = function (a) {
        if (a == null) a = window.event;
        var c = GetEventKeyCode(a),
			b = GetEventSrcElement(a);
        if (c == 13 && b != null) {
            SPClientPeoplePickerProcessedUser.HandleProcessedUserClick(b.parentNode);
            CancelEvent(a);
            return false
        }
        return true
    };
    SPClientPeoplePickerMRU.PPMRUVersion = 1;
    SPClientPeoplePickerMRU.MaxPPMRUItems = 200;
    SPClientPeoplePickerMRU.PPMRUDomLocalStoreKey = "ClientPeoplePickerMRU";
    SPClientPeoplePickerMRU.GetSPClientPeoplePickerMRU = function () {
        a:;
        if (g_SPClientPeoplePickerInstance == null) g_SPClientPeoplePickerInstance = new SPClientPeoplePickerMRU;
        return g_SPClientPeoplePickerInstance
    };
    SPClientPeoplePickerMRU.prototype = {
        isCacheAvailable: false,
        MRUDataDict: {},
        MRUData: null,
        GetItems: function (b) {
            if (b == null || b == "" || !this.isCacheAvailable) return [];
            for (var e = {}, g = [], i = b.toLowerCase(), f = this.MRUData.dataArray, h = f.length, c = 0; c < h; c++) {
                var a = f[c];
                if (SPClientPeoplePicker.TestLocalMatch(i, a)) {
                    var d = a.Key.toLowerCase();
                    if (!e[d]) {
                        g.push(a);
                        e[d] = true
                    }
                }
            }
            return g
        },
        SetItem: function (b, a) {
            if (b == null || b == "" || a == null || !this.isCacheAvailable) return;
            var c = b.toLowerCase(),
				d = a.Key.toLowerCase();
            if (this.MRUDataDict[d] != null) return;
            a.LocalSearchTerm = c;
            this.InsertCacheItem(a);
            this.WriteCache()
        },
        InsertCacheItem: function (a) {
            var c = this.MRUData.dataArray.length,
				b = this.MRUData.insertionIndex;
            if (c == SPClientPeoplePickerMRU.MaxPPMRUItems) {
                var d = this.MRUData.dataArray[b];
                delete this.MRUDataDict[d.Key.toLowerCase()];
                this.MRUData.dataArray[b] = a;
                this.MRUData.insertionIndex++;
                if (this.MRUData.insertionIndex >= SPClientPeoplePickerMRU.MaxPPMRUItems) this.MRUData.insertionIndex = 0
            } else c < SPClientPeoplePickerMRU.MaxPPMRUItems && this.MRUData.dataArray.push(a);
            this.MRUDataDict[a.Key.toLowerCase()] = a
        },
        ResetCache: function () {
            a:;
            if (!this.isCacheAvailable) return;
            var a = window.localStorage; a.removeItem(SPClientPeoplePickerMRU.PPMRUDomLocalStoreKey); this.MRUDataDict = {}; this.MRUData = new SPClientPeoplePickerMRUData
        },
        WriteCache: function () {
            a:;
            try {
                var a = JSON.stringify(this.MRUData),
					b = window.localStorage;
                b.setItem(SPClientPeoplePickerMRU.PPMRUDomLocalStoreKey, a)
            } catch (c) { }
        },
        EnsurePPMRUData: function () {
            a:;
            if (!window.localStorage) return false;
            if (this.MRUData != null) return true;
            var c = window.localStorage,
				a = c.getItem(SPClientPeoplePickerMRU.PPMRUDomLocalStoreKey);
            if (a == null || a == "") this.MRUData = new SPClientPeoplePickerMRUData;
            else {
                var b = JSON.parse(a);
                if (b.cacheVersion != SPClientPeoplePickerMRU.PPMRUVersion) {
                    this.MRUData = new SPClientPeoplePickerMRUData;
                    c.removeItem(SPClientPeoplePickerMRU.PPMRUDomLocalStoreKey)
                } else this.MRUData = b
            }
            return true
        },
        InitMRUDictionary: function () {
            a:;
            var a = {};
            if (!this.isCacheAvailable) return a;
            for (var d = this.MRUData.dataArray, e = d.length, b = 0; b < e; b++) {
                var c = d[b];
                a[c.Key.toLowerCase()] = c
            }
            return a
        }
    };
    SPClientPeoplePickerMRUData.prototype = {
        dataArray: [],
        insertionIndex: 0,
        cacheVersion: 0
    };
    typeof Sys != "undefined" && Sys != null && Sys.Application != null && Sys.Application.notifyScriptLoaded();
    typeof NotifyScriptLoadedAndExecuteWaitingJobs == "function" && NotifyScriptLoadedAndExecuteWaitingJobs("clientpeoplepicker.js");
    typeof spWriteProfilerMark == "function" && spWriteProfilerMark("perfMarkEnd_clientpeoplepicker.js")
}

function ULSa9l() {
    var a = {};
    a.ULSTeamName = "Microsoft SharePoint Foundation";
    a.ULSFileName = "clientpeoplepicker.commentedjs";
    return a
}

function SPClientPeoplePicker(controlProps) {
    this.TopLevelElementId = controlProps.TopLevelElementId;
    this.EditorElementId = controlProps.EditorElementId;
    this.AutoFillElementId = controlProps.AutoFillElementId;
    this.NotificationElementId = controlProps.NotificationElementId;
    this.ResolvedListElementId = controlProps.ResolvedListElementId;
    this.InitialHelpTextElementId = controlProps.InitialHelpTextElementId;
    this.WaitImageId = controlProps.WaitImageId;
    this.HiddenInputId = controlProps.HiddenInputId;
    if (typeof controlProps.Required != "undefined") this.AllowEmpty = !Boolean(controlProps.Required);
    if (typeof controlProps.ForceClaims != "undefined") this.ForceClaims = Boolean(controlProps.ForceClaims);
    if (typeof controlProps.AutoFillEnabled != "undefined") this.AutoFillEnabled = Boolean(controlProps.AutoFillEnabled);
    if (typeof controlProps.AllowMultipleValues != "undefined") this.AllowMultipleUsers = Boolean(controlProps.AllowMultipleValues);
    if (typeof controlProps.AllowEmailAddresses != "undefined") this.AllowEmailAddresses = Boolean(controlProps.AllowEmailAddresses);
    if (typeof controlProps.AllowOnlyEmailAddresses != "undefined") this.AllowOnlyEmailAddresses = Boolean(controlProps.AllowOnlyEmailAddresses);
    if (typeof controlProps.AllUrlZones != "undefined") this.AllUrlZones = Boolean(controlProps.AllUrlZones);
    if (typeof controlProps.VisibleSuggestions != "undefined") this.VisibleSuggestions = Number(controlProps.VisibleSuggestions);
    if (typeof controlProps.UseLocalSuggestionCache != "undefined") this.UseLocalSuggestionCache = Boolean(controlProps.UseLocalSuggestionCache);
    if (typeof controlProps.InitialSuggestions != "undefined" && controlProps.InitialSuggestions != null) {
        this.InitialSuggestions = controlProps.InitialSuggestions;
        SPClientPeoplePicker.AugmentEntitySuggestions(this, this.InitialSuggestions, false)
    }
    if (typeof controlProps.UrlZone != "undefined") this.UrlZone = controlProps.UrlZone;
    if (typeof controlProps.WebApplicationID != "undefined") this.WebApplicationID = controlProps.WebApplicationID;
    if (typeof controlProps.SharePointGroupID != "undefined") this.SharePointGroupID = Number(controlProps.SharePointGroupID);
    if (typeof controlProps.PrincipalAccountType != "undefined") this.PrincipalAccountType = controlProps.PrincipalAccountType;
    if (typeof controlProps.EnabledClaimProviders != "undefined") this.EnabledClaimProviders = controlProps.EnabledClaimProviders;
    if (typeof controlProps.ResolvePrincipalSource != "undefined") this.ResolvePrincipalSource = controlProps.ResolvePrincipalSource;
    if (typeof controlProps.SearchPrincipalSource != "undefined") this.SearchPrincipalSource = controlProps.SearchPrincipalSource;
    if (typeof controlProps.MaximumEntitySuggestions != "undefined") this.MaximumEntitySuggestions = Number(controlProps.MaximumEntitySuggestions);
    if (typeof controlProps.InPlaceEditMode != "undefined") this.InPlaceEditMode = Boolean(controlProps.InPlaceEditMode);
    if (typeof controlProps.QuerySettings != "undefined") this.QuerySettings = controlProps.QuerySettings;
    this.PrincipalAccountTypeEnum = SPClientPeoplePicker.CreateSPPrincipalType(this.PrincipalAccountType);
    var fnUserCallback = controlProps.OnValueChangedClientScript;
    this.OnValueChangedClientScript = fnUserCallback != null ? eval(fnUserCallback) : null;
    var fnResolvedCallback = controlProps.OnUserResolvedClientScript;
    this.OnUserResolvedClientScript = fnResolvedCallback != null ? eval(fnResolvedCallback) : null;
    var fnControlValidateCallback = controlProps.OnControlValidateClientScript;
    this.OnControlValidateClientScript = fnControlValidateCallback != null ? eval(fnControlValidateCallback) : null;
    this.AutoFillControl = null;
    this.TotalUserCount = 0;
    this.UnresolvedUserCount = 0;
    this.UserQueryDict = {};
    this.ProcessedUserList = {};
    this.UnresolvedUserElmIdToReplace = "";
    this.HasNotifiedUser = false;
    if (typeof ClientCanHandleImn == "undefined" || !ClientCanHandleImn()) SPClientPeoplePicker.ShowUserPresence = false;
    var topLevelElement = document.getElementById(this.TopLevelElementId);
    if (topLevelElement != null) {
        topLevelElement.setAttribute("SPClientPeoplePicker", "true");
        if (!this.InPlaceEditMode && Boolean(controlProps.Width)) topLevelElement.style.width = controlProps.Width;
        if (controlProps.Width == "100%") topLevelElement.className += " ms-fullWidth";
        if (Boolean(controlProps.Rows) && Number(controlProps.Rows) != 0) topLevelElement.style.minHeight = String(Number(controlProps.Rows) * 16 - (this.InPlaceEditMode ? 2 : 0)) + "px"
    }
    var editorElement = document.getElementById(this.EditorElementId);
    editorElement != null && editorElement.setAttribute("data-sp-peoplePickerEditor", "true");
    if (this.ShouldUsePPMRU()) this.PPMRU = SPClientPeoplePickerMRU.GetSPClientPeoplePickerMRU();
    SPClientPeoplePicker.SPClientPeoplePickerDict[this.TopLevelElementId] = this
}

function SPClientPeoplePicker_CallbackPopulateAutoFillFromEditor(b) {
    if (b == null) return;
    var c = b.value,
		a = SPClientPeoplePicker.PickerObjectFromSubElement(b);
    if (a == null || a.LatestSearchQueryStr == c) return;
    a.LatestSearchQueryStr = c;
    var d = a.AddPickerSearchQuery(c);
    a.ExecutePickerQuery([d], function (j, h) {
        if (h == null || c != b.value || d != j) return;
        var g = JSON.parse(h.m_value);
        if (a.ShowingLocalSuggestions()) {
            var f = SPClientPeoplePicker.AugmentEntitySuggestions(a, g, true),
				i = a.CurrentLocalSuggestions.length + f.length,
				e = [];
            if (f.length != 0) {
                e.push(SPClientAutoFill.BuildAutoFillSeparatorMenuItem());
                e = e.concat(f)
            }
            e = a.CurrentLocalSuggestions.concat(e);
            e = SPClientPeoplePicker.AddAutoFillMetaData(a, e, i);
            a.ShowAutoFill(e)
        } else a.ShowAutoFill(SPClientPeoplePicker.BuildAutoFillMenuItems(a, g))
    }, function () {
        a:; a.SetServerError()
    }, null)
}

function SPClientPeoplePicker_CallbackOnAutoFillClose(e, b) {
    var c = document.getElementById(e),
		a = SPClientPeoplePicker.PickerObjectFromSubElement(c);
    if (a == null) return;
    if (b != null) {
        var d = c.value;
        if (a.UnresolvedUserElmIdToReplace != "") d = a.ProcessedUserList[a.UnresolvedUserElmIdToReplace].DisplayName;
        if (a.UnresolvedUserElmIdToReplace == "") c.value = "";
        b.IsResolved = true;
        a.AddProcessedUser(b, true);
        a.AddResolvedUserToLocalCache(b, d)
    }
    a.UnresolvedUserElmIdToReplace = "";
    a.SetFocusOnEditorEnd();
    a.CurrentQueryStr = "";
    a.LatestSearchQueryStr = "";
    a.CurrentLocalSuggestions = [];
    a.CurrentLocalSuggestionsDict = {}
}

function SPClientPeoplePicker_OnClick(b) {
    if (b == null) b = window.event;
    var a = GetEventSrcElement(b);
    if (a == null) return false;
    if (a.getAttribute("data-sp-peoplePickerProcessedUserDisplay") != null) {
        SPClientPeoplePickerProcessedUser.HandleProcessedUserClick(a);
        CancelEvent(b)
    } else if (a.getAttribute("data-sp-peoplePickerEditor") == null) {
        var c = SPClientPeoplePicker.PickerObjectFromSubElement(a);
        c != null && c.SetFocusOnEditorEnd()
    }
    return true
}

function SPClientPeoplePicker_OnEditorBlur(b) {
    if (b == null) b = window.event;
    var e = GetEventSrcElement(b),
		a = SPClientPeoplePicker.PickerObjectFromSubElement(e);
    if (a == null) return false;
    var d = document.getElementById(a.TopLevelElementId);
    if (d == null) return false;
    RemoveCssClassFromElement(d, "sp-peoplepicker-topLevelFocus");
    var c = document.getElementById(a.InitialHelpTextElementId);
    if (c != null && a.IsEmpty()) c.style.display = "inline";
    return true
}

function SPClientPeoplePicker_OnEditorFocus(f) {
    if (f == null) f = window.event;
    var h = GetEventSrcElement(f),
		a = SPClientPeoplePicker.PickerObjectFromSubElement(h);
    if (a == null) return false;
    if (a.AutoFillEnabled && a.AutoFillControl == null) {
        var d;
        try {
            d = typeof SPClientAutoFill
        } catch (f) {
            d = "undefined"
        }
        EnsureScript("autofill.js", d, function () {
            a:; a.EnsureAutoFillControl()
        })
    }
    if (!a.QueryScriptInit) {
        var e;
        try {
            e = typeof SP.ClientContext
        } catch (f) {
            e = "undefined"
        }
        EnsureScript("SP.js", e, function () {
            a:; a.QueryScriptInit = true
        })
    } !a.EditorWidthSet && a.EnsureEditorWidth();
    var b = document.getElementById(a.TopLevelElementId);
    if (b != null) b.className += " sp-peoplepicker-topLevelFocus";
    var c = document.getElementById(a.WaitImageId);
    if (b != null && c != null) {
        c.style.top = "4px";
        if (fRightToLeft) c.style.right = (b.offsetWidth - 22).toString() + "px";
        else c.style.left = (b.offsetWidth - 22).toString() + "px"
    }
    var g = document.getElementById(a.InitialHelpTextElementId);
    if (g != null) g.style.display = "none";
    return true
}

function SPClientPeoplePicker_OnEditorKeyDown(c) {
    if (c == null) c = window.event;
    var e = GetEventKeyCode(c),
		b = GetEventSrcElement(c),
		d = false,
		a = SPClientPeoplePicker.PickerObjectFromSubElement(b);
    if (a == null) return !d;
    if (c.ctrlKey && e == 75) {
        d = true;
        a.CloseAutoFill();
        a.AddUnresolvedUserFromEditor(false);
        a.ResolveAllUsers(null)
    } else if (e == 9) {
        var i = c.shiftKey;
        if (i || !a.IsAutoFillOpen()) {
            a.CloseAutoFill();
            a.AddUnresolvedUserFromEditor(true)
        }
    } else if (e == 27) a.CloseAutoFill();
    else if (e == 8) {
        var g = false;
        if (b.createTextRange != null && document.selection != null) {
            var f = document.selection.createRange().duplicate();
            if (f != null && f.text.length == 0) {
                var h = -1;
                f.moveEnd("character", b.value.length);
                if (f.text == "") h = b.value.length;
                else h = b.value.lastIndexOf(f.text);
                g = h == 0 ? true : false
            }
        } else if (b.selectionStart == 0 && b.selectionEnd == b.selectionStart) g = true;
        g && a.DeleteProcessedUser(null)
    } else if (e == 13) {
        if (a.IsAutoFillOpen() || !a.InPlaceEditMode) d = true
    } else b.size = Math.max(b.value.length + 1, 1);
    d && CancelEvent(c);
    return !d
}

function SPClientPeoplePicker_OnEditorKeyUp(b) {
    if (b == null) b = window.event;
    var d = GetEventKeyCode(b),
		a = GetEventSrcElement(b);
    if (a != null) a.size = Math.max(a.value.length, 1);
    var c = SPClientPeoplePicker.PickerObjectFromSubElement(a);
    if (c != null) {
        c.OnControlValueChanged();
        c.DisplayLocalSuggestions()
    }
}

function SPClientPeoplePicker_OnEditorKeyPress(a) {
    if (a == null) a = window.event;
    var d = GetEventKeyCode(a),
		c = GetEventSrcElement(a),
		b = SPClientPeoplePicker.PickerObjectFromSubElement(c);
    if (b == null) return true;
    if (d == 59 && !a.shiftKey) {
        b.CloseAutoFill();
        b.AddUnresolvedUserFromEditor(true);
        CancelEvent(a);
        return false
    }
    return true
}

function SPClientPeoplePicker_OnEditorCopy(a) {
    if (a == null) a = window.event;
    var c = GetEventSrcElement(a),
		b = SPClientPeoplePicker.PickerObjectFromSubElement(c);
    window.clipboardData.setData("Text", b.GetAllUserKeys())
}

function SPClientPeoplePicker_OnEditorPaste(b) {
    if (b == null) b = window.event;
    var a = GetEventSrcElement(b),
		c = SPClientPeoplePicker.PickerObjectFromSubElement(a);
    if (c == null) return false;
    setTimeout(function () {
        a:; c.AddUserKeys(a.value, false); a.value = ""
    }, 0);
    return true
}

function SPClientPeoplePicker_BodyOnClickCloseAutoFill(d) {
    if (d == null) d = window.event;
    var c = GetEventSrcElement(d),
		g = document.getElementById(SPClientAutoFill.CurrentOpenAutoFillMenuOwnerID),
		a = SPClientPeoplePicker.PickerObjectFromSubElement(g);
    if (c.className.indexOf("ms-imn") != -1) return;
    if (a != null) {
        var b = null;
        if (c.className.indexOf("sp-peoplepicker-") != -1) b = SPClientPeoplePicker.PickerObjectFromSubElement(c);
        var f = b != null && a.TopLevelElementId == b.TopLevelElementId,
			e = a.UnresolvedUserElmIdToReplace == "";
        (!f || !e) && a.CloseAutoFill()
    }
}

function SPClientPeoplePickerProcessedUser(a, b, c) {
    this.UserContainerElementId = b;
    this.DisplayElementId = b + "_UserDisplay";
    this.DeleteUserElementId = b + "_DeleteUserLink";
    this.PresenceElementId = b + "_PresenceContainer";
    this.UserInfo = a;
    this.ResolvedUser = c;
    this.ResolveText = a.ResolveText;
    if (a.Description != null) this.ErrorDescription = a.Description;
    if (a[SPClientPeoplePicker.ValueName] != null) this.SID = a[SPClientPeoplePicker.ValueName];
    if (a[SPClientPeoplePicker.DisplayTextName] != null) this.DisplayName = a[SPClientPeoplePicker.DisplayTextName];
    if (a.EntityData != null && a.EntityData[SPClientPeoplePicker.SIPAddressName] != null) this.SIPAddress = a.EntityData[SPClientPeoplePicker.SIPAddressName];
    if (a[SPClientPeoplePicker.SuggestionsName] != null && a[SPClientPeoplePicker.SuggestionsName].length > 0) this.Suggestions = a[SPClientPeoplePicker.SuggestionsName]
}

function SPClientPeoplePickerMRU() {
    a:; this.isCacheAvailable = this.EnsurePPMRUData(); this.MRUDataDict = this.InitMRUDictionary()
}
var g_SPClientPeoplePickerInstance;

function SPClientPeoplePickerMRUData() {
    a:; this.dataArray = []; this.insertionIndex = 0; this.cacheVersion = SPClientPeoplePickerMRU.PPMRUVersion
}

$_global_clientpeoplepicker();