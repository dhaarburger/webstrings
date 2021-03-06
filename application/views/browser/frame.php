
<div id="browser">
	<a id="hideMe"><span>Hide Bar</span></a>
	<div class="header">
		<a href="<?php echo site_url('browser'); ?>"><h1>WEBSTRINGS</h1></a>
	
			<?php echo '<h3>'.$user->f_name.' '.$user->l_name.'</h3>'; ?>
		
			<div class="toolbar">
				<div class="toolbar-item">
					<div class="toolbar-icon">
						<i class="icon icon-globe"></i>
						<div class="note-badge" <?php if($unread_notes < 1) echo 'style="display:none;"'; ?>><?php echo $unread_notes; ?></div>
					</div>
					<div class="toolbar-menu toolbar-notifications">
						<ul>
							<?php foreach($notes as $note): ?>
								<?php if($note): ?>
								<li <?php if($note->unread) echo 'class="unread"'; ?>><?php echo $note->body; ?></li>
								<?php endif; ?>
							<?php endforeach; ?>
							
							<li>
								<?php if(count($notes) > 0): ?>
									<a>View all</a>
								<?php else: ?>
									<p>No notifications</p>
								<?php endif; ?>
							</li>
						</ul>
					</div>
					<div class="notes-scroller"></div>
				</div>
					
				<div class="toolbar-item">
					<div class="toolbar-icon">
						<i class="icon icon-gear"></i>
					</div>
					<div class="toolbar-menu toolbar-settings">
						<ul>
							<li><a>Invite Friends</a></li>
							<hr />
							<li><a href="javascript:window.showModalDialog('<?php echo site_url('bookmarklet/index').'/'; ?>?url=' + location.href,'','dialogHeight:250px;dialogWidth:700px;center:yes;resizable:no;scroll:yes;')" onclick="alert('Drag to the bookmarks bar.'); return false;" style="cursor:move;">String It!</a></li>
							<hr />
							<li><a href="javascript:buildModal('<?php echo site_url('modals/settings'); ?>', 'modal-settings')">Settings</a></li>
							<hr />
							<li><a>About Us</a></li>
							<hr />
							<li><a href="<?php echo site_url('modals/log_out'); ?>/browser/index">Logout</a></li>
						</ul>
					</div>
				</div>
			</div>
			
			<a class="view-all-strings-link" href="javascript:closeString()">&laquo; View All Strings</a>
			
			<script type="text/javascript">
				
				Pusher.channel_auth_endpoint = '<?php echo site_url('browser/pusher_auth'); ?>';
				var pusher = new Pusher('e8910e066e06190cb4cd');
				var noteChannel = pusher.subscribe('private-<?php echo $user->id; ?>-notes');
				
				noteChannel.bind('newNote', function(data) {
					var content = "<li";
					if(data.unread)
						content += " class=\"unread\"";
					content += ">" + data.body + "</li>";
					
					if(notesScroll == null) {
						$(".toolbar-notifications ul").first().prepend(content);
					} else {
						notesScroll.getContentPane().find("ul").first().prepend(content);
						reinitialiseNoteScroller();
					}
					
					// add to badge
					var badge = $(".note-badge");
					badge.text(parseInt(badge.text()) + 1);
					if(badge.css("display") == "none")
						badge.show();
				});
				
			</script>
	</div>
	
	<div class="ribbon">
		<div>
			<?php $this->load->view('browser/'.$browser_ribbon_file); ?>
		</div>
	</div>
	
	<div id="browserList" data-filter="my_strings">
		
		<?php $this->load->view('browser/'.$browser_view_file); ?>
		
	</div>
	
</div>



<div id="content">
	<div class="nav-arrow nav-arrow-left"><a href="javascript:prevPage()"><i class="icon icon-arrow-left"></i></a></div>
	<iframe name="iframe" src="">Your browser does not support iframes.</iframe>
	<div class="nav-arrow nav-arrow-right"><a href="javascript:nextPage()"><i class="icon icon-arrow-right"></i></a></div>
</div>