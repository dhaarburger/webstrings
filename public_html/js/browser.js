/////////////////////////
//   Global Variables  //  
/////////////////////////


var notesScroll = null;

/////////////////////////
//   Document Loaded   //
/////////////////////////

$(document).ready(function() {
	
	$("#browserList").height($(window).height() - $(".header").outerHeight() -$(".ribbon").outerHeight());
	
	$("#hideMe").toggle(function() {
		$("#browser").animate({ 
			"margin-left": "-350px", 
			'boxShadowX': '0px', 
			'boxShadowY':'0px', 
			'boxShadowBlur': '0px'
		}, "slow");
		$("#pageContent").animate({
			"margin-left": "0px"
		}, "slow");
	}, function () {
		$("#browser").animate({ 
			"margin-left": "0px", 
			'boxShadowX': '5px', 
			'boxShadowY':'0px', 
			'boxShadowBlur': '15px'
		}, "slow");
		$("#pageContent").animate({
			"margin-left": "350px"
		}, "slow");
	});
	
	// styling
	
	$(".view-all-strings-link").hide();
	
	$(".string-info .arrow").each(function() {
		var boxH = $(this).parents(".string-info").first().height();
		var arrowH = 16;
		var margin = (boxH / 2) - arrowH;
		$(this).css("margin-top", margin);
	});
	
	$(".nav-arrow").hide();
	
	setActiveFilter("my_strings");
	
	//browserScroll = $("#browserList").jScrollPane();
	
	navigateByURL();
});

$(window).resize(function() {
	$("#browserList").height($(window).height() - $(".header").outerHeight() -$(".ribbon").outerHeight());
});

/////////////////////////
//    String Events    //
/////////////////////////

$(document).on("click", ".string-info", function() {
	var strCont = $(this).closest(".string-container");
	if(strCont.attr('id')){
		closeString();
	} else {
		openString(strCont.attr("data-id"));
	}
});

/////////////////////////
//     Page Events     //
/////////////////////////

// a page is selected
$(document).on("click", ".page-info:not(.page-delete)", function(e) {
	if($(event.target).parents(".page-delete").length < 1) {
		
		var pid = $(this).parents(".page-container").first().attr("data-id");
		
		$(".page-info").removeClass("active");
		$(this).addClass('active');
		
		// set the clicked page as the selected page
		$("#selectedPage").attr("id", "");
		$(this).parents(".page-container").first().attr("id", "selectedPage");
		
		// deal with comments
		$(".page-comments").slideUp();
		if( $(".ribbon-comments i").hasClass("active") ){
			refreshComments(pid);
		}
		
		// check if page is unread
		if($(this).siblings(".page-unread-marker").length > 0) {
			$(this).siblings(".page-unread-marker").remove();
			$.ajax({
				url: siteURL + 'browser/mark_page_read/' + pid
			});
			
			// update the string's unread pages tag
			var ribbon = $(this).parents(".string-container").find(".string-unread-tag").first();
			var ribbonSpan = ribbon.find("span").first();
			if(ribbonSpan.html() - 1 <= 0)
				ribbon.remove();
			else
				ribbonSpan.html(parseInt(ribbonSpan.html()) - 1);
		} 
	}
});

$(document).on("mouseenter", ".page-info", function(e) {
	$(".page-delete", this).show();
});

$(document).on("mouseleave", ".page-info", function(e) {
	$(".page-delete", this).hide();
});

$(document).on("click", ".page-delete", function(e) {
	e.preventDefault();
	var pageID = $(this).parents(".page-container").first().attr("data-id");
	$(this).parents(".page-container").slideUp('slow', function() {$(this).remove();});
	$.ajax({
		url: siteURL + 'browser/delete_page/' + pageID
	});
});



/////////////////////////
//   Toolbar Events    //
/////////////////////////

$(document).on("click", "html", function(){
	$(".toolbar-menu").hide();
	$(".notes-scroller").hide();
});

$(document).on("click", ".toolbar-icon", function(event) {
	event.stopPropagation();
	var cur_menu = $(this).parent().find(".toolbar-menu").first();
	cur_menu.parent().siblings().find(".toolbar-menu").hide();
	cur_menu.parent().siblings().find(".notes-scroller").hide();
	cur_menu.toggle();
	cur_menu.siblings(".notes-scroller").toggle();
	reinitialiseNoteScroller();
	$(this).find(".note-badge").first().fadeOut("slow", function() {$(this).text("0");});
});

$(document).on("click", ".toolbar-menu", function(e) {
	e.stopPropagation();
});

/////////////////////////
// Notification Events //   
/////////////////////////

$(document).on("mouseenter", ".note-container", function(event) {
	//if($(this).parent().hasClass("unread")) $(this).parent().removeClass("unread");
	$(".note-actions-container", this).fadeIn("fast").css("display", "table");
});

$(document).on("mouseleave", ".note-container", function(event) {
	$(".note-actions-container", this).fadeOut("fast");
});

$(document).on("click", ".message-text a", function(e) {
	markNoteAsRead($(this).closest(".note-container"));
});

$(document).on("click", ".note-accept-invite", function(event) {
	var container = $(this).parents(".note-container").first();
	var nid = container.attr("data-id");
	$.ajax( {
        type: "POST",
        url: siteURL + "browser/accept_string_invite/" + nid,
        dataType: "html",
        success: function(data) {
        	container.parents("li").first().removeClass("unread");
        	container.replaceWith(data);
        },
        error: function(data) {
        	alert(data);
        }
    });
});

$(document).on("click", ".note-ignore-invite", function(event) {
	var container = $(this).parents(".note-container").first();
	var nid = container.attr("data-id");
	$.ajax( {
        type: "POST",
        url: siteURL + "browser/reject_string_invite/" + nid,
        dataType: "html",
        success: function(data) {
        	container.parents("li").first().removeClass("unread");
        	container.replaceWith(data);
        },
        error: function(data) {
        	alert(data);
        }
    });
});

/////////////////////////
//    Ribbon Events    //
/////////////////////////

$(document).on("click", ".ribbon-comments", function(event) {
	if($("#selectedPage").length < 1) return;
	var pid = $("#selectedPage").attr("data-id");
	if( !$("i", this).hasClass("active") ){
		refreshComments(pid);
	} else {
		$("#selectedPage .page-comments").slideUp("slow");
	}
	$("i", this).toggleClass("active");
});

/////////////////////////
//    Hotkey Events    //
/////////////////////////

$(document).on("keydown", function(e) {
	switch(e.which){
		case 37: //left
			if($("#selectedString").length > 0)
				prevPage();
			break;
		case 39: //right
			if($("#selectedString").length > 0)
				nextPage();
			break;
		default: return;
	}
	e.preventDefault();
});



/////////////////////////
//   Helper Functions  //
/////////////////////////

function navigateByURL(){
	var s = parseInt(urlParam('s'));
	if(s){
		var t = urlParam('t');
		if(t){
			switch(parseInt(t)){
				case 0:
					t = 'my_strings';
					break;
				case 1:
					t = 'shared_strings';
					break;
				default:
					t = '';
			}
			var p = parseInt(urlParam('p'));
			if(p){
				var c = parseInt(urlParam('c'));
				if(c){
					goToComment(s, t, p);
				} else {
					openString(s, t, function(){
						openPage(p);
					});
				}
			} else {
				openString(s, t);
			}
		}
	}
}

function markNoteAsRead(note){
	$(".toolbar-menu").hide();
	$(".notes-scroller").hide();
	var nid = note.attr("data-id");
	var noteli = note.closest("li");
	if(noteli.hasClass("unread")) {
		noteli.removeClass("unread");
		$.ajax({
	        url: siteURL + 'browser/mark_note_read/' + nid
	    });
   }
}

function loadPageInViewer(pageCont){
	var url = pageCont.find(".page-info a").first().attr("href");
	$("#content iframe").first().attr("src", url);
}

function nextPage() {
	var oldPage = $("#selectedPage");
	var nextPage = oldPage.next(".page-container");
	if(nextPage.length < 1)
		nextPage = oldPage.parent().find(".page-container").first();
	
	$("#selectedPage").attr('id', '');
	nextPage.attr("id", "selectedPage");
	$(".page-info").removeClass("active");
	$(".page-info", nextPage).addClass('active');
	
	loadPageInViewer(nextPage);
}

function prevPage() {
	var oldPage = $("#selectedPage");
	var nextPage = oldPage.prev(".page-container");
	if(nextPage.length < 1)
		nextPage = oldPage.parent().find(".page-container").last();
	
	$("#selectedPage").attr('id', '');
	nextPage.attr("id", "selectedPage");
	$(".page-info").removeClass("active");
	$(".page-info", nextPage).addClass('active');
	
	loadPageInViewer(nextPage);
}

function reinitialiseNoteScroller(){
	var scroller = $(".toolbar-notifications").siblings(".notes-scroller").first();
	scroller.html("");
	
	if(notesScroll == null) {
		var menu = $(".toolbar-notifications");
		menu.jScrollPane();
		notesScroll = menu.data('jsp');
	} else {
		notesScroll.reinitialise();
	}
	
	scroller.html($(".jspVerticalBar"));
}

function refreshComments(pid) {
	$("#selectedPage .page-comments").load(siteURL + "browser/comments_for_page/" + pid, function() {
		$(this).slideDown("slow");
	});	
	//browserScroll.reinitialise();
}

function refreshStrings(filter, cb) {
	$("#browserList").html("<div class=\"loader-gif\"><img src=\"" + baseURL + "public_html/images/loader.gif\" /></div>").load(siteURL + "browser/" + filter, function() {
		if(typeof(cb) != 'undefined')
			cb();
	});
	$(".string-filter").removeClass("active");
	$("#browserList").attr("data-filter", filter);
	setActiveFilter(filter);
	//browserScroll.reinitialise();
}

function refreshPages(string_id) {
	$("#selectedString .pages-content").html("<div class=\"loader-gif\"><img src=\"" + baseURL + "public_html/images/loader.gif\" /></div>").load(siteURL + "browser/pages_for/" + string_id);
	//browserScroll.reinitialise();
}

function addComment() {
    var form = $("#selectedPage .add-comment form").first();
    $.ajax( {
        type: "POST",
        url: form.attr('action'),
        data: form.serialize(),
        dataType: "html"
    });	form.find("input[type=text]").first().val('');
	//browserScroll.reinitialise();
    return false;
}


function openPage(pid, cb){
	$("#selectedString .page-container").each(function() {
		var page = $(this);
		if(page.attr("data-id") == pid) {
			
			$("#selectedPage").attr('id', '');
			page.attr("id", "selectedPage");
			$(".page-info").removeClass("active");
			$(".page-info", page).addClass('active');
			
			loadPageInViewer(page);
			
			if(typeof(cb) != 'undefined')
				cb();
		}
	});
}

function goToComment(sid, filter, pid){
	openString(sid, filter, function() {
		openPage(pid, function() {
			$(".ribbon-comments i").toggleClass("active");
			refreshComments(pid);
		});
	});
}

function setActiveFilter(filter){
	if(filter == "my_strings"){
		$(".icon-my-strings").addClass("active");
	} else if(filter == "shared_strings"){
		$(".icon-shared-strings").addClass("active");
	}
}

function switchRibbon(type, string_id){
	if(type == 'main'){
		$(".view-all-strings-link").hide();
		var container = $(".ribbon div");
		container.animate( { "margin-left": "-400px" }, function() {
			container.load(siteURL + 'browser/ribbon_picker/view_strings',  function() {
				var filter = $("#browserList").attr("data-filter");
				setActiveFilter(filter);
				container.animate( { "margin-left": "0px" });
			});
		});
	}else if(type == 'string') {
		$(".view-all-strings-link").show();
		var container = $(".ribbon div");
		container.animate( { "margin-left": "-400px" }, function() {
			container.load(siteURL + "browser/ribbon_picker/view_pages", { 'string_id': string_id }, function() {
				container.animate( { "margin-left": "0px" });
			});
		});
	}
}

function openString(id, filter, cb){
	// check if string is already open
	if($("#selectedString").length > 0) {
		// check if the right string is open
		if($("#selectedString").attr("data-id") != id)
			// not the right string; switch strings
			switchString(id, filter);
		// it's the right string; trigger the callback
		if(typeof(cb) != 'undefined')
			cb();
	} else {
		// change to correct filter
		if($("#browserList").attr("data-filter") != filter && typeof(filter) != 'undefined'){
			refreshStrings(filter, function() {
				openString(id, filter, cb);
			});
		} else {
		// find and open the string
			$("#browserList .string-container").each(function() {
				if($(this).attr("data-id") == id) {
					var strCont = $(this);
				 	strCont.attr("id", "selectedString");
					
					// add active styling
					$(".string-info", strCont).addClass("active");
					
					// load pages content into hidden container
					$(".pages-content", strCont).hide().load(siteURL + 'browser/pages_for/' + id, function(){
						var firstPage = $(".pages-content", strCont).find(".page-container").first();
						loadPageInViewer(firstPage);
						$("#selectedPage").attr("id", "");
						firstPage.attr("id", "selectedPage");
						$(".page-info").removeClass("active");
						$(".page-info", firstPage).addClass('active');
						
						$(".nav-arrow").fadeIn();
					});
					
					// animate un-selected off-screen and move selected to top
					$.when($(".string-container").not(strCont).animate( {"left": "-400px"} , 250).slideUp()).then(function() {
						$(".pages-content", strCont).slideDown("slow", function() {
							if(typeof(cb) != 'undefined')
								cb();
						});
					});
					
					// change ribbon
					switchRibbon('string', id);
				}
			});
		}
	}
}

function closeString(){
	var strCont = $("#selectedString");
	if(strCont.length > 0){
		// move selected to original position and move un-selected back on-screen
		$(".pages-content", strCont).slideUp(250, function() {
			$(".string-container").not(strCont).slideDown().animate( {"left": "0px"} , 250);
			$(".nav-arrow").fadeOut();
		});
		
		// de-toggle and remove active styling
		$(".string-info", strCont).removeClass("active");
		strCont.removeAttr('id');
		
		// change ribbon
		switchRibbon('main', null);
	}
}

function switchString(id, filter){
	// change to correct filter
	if($("#browserList").attr("data-filter") != filter && typeof(filter) != 'undefined'){
		refreshStrings(filter, function() {
			openString(id);
		});
	} else {
		var oldString = $("#selectedString");
		$(".string-info", oldString).removeClass("active");
		oldString.removeAttr('id');
		$(".pages-content", oldString).slideUp(250, function() {
			oldString.animate( {"left": "-400px"} , 250).slideUp("fast", function(){
				$("#browserList .string-container").each(function() {
					if($(this).attr("data-id") == id) {
						var strCont = $(this);
					 	strCont.attr("id", "selectedString");
						
						// add active styling
						$(".string-info", strCont).addClass("active");
						
						// load pages content into hidden container
						$(".pages-content", strCont).hide().load(siteURL + 'browser/pages_for/' + id);
						
						// animate un-selected off-screen and move selected to top
						strCont.slideDown().animate( {"left": "0px"}, 250, function() {
							$(".pages-content", strCont).slideDown("slow");
						});
						
						// change ribbon
						switchRibbon('string', id);
					}
				});
			});
		});
	}
}

function urlParam(name){
	var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.href);
	if(results != null)
		return results[1] || 0;
	return 0;
}


