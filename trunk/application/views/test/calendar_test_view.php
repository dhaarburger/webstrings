<div id="header">
	<a href="<?php echo site_url('test'); ?>">&laquo; Table of Contents</a>
	
	<div id="loginResultCont">
		<?php if(isset($logged_in)): ?>
			Current user: <?php echo $cur_user->f_name.' '.$cur_user->l_name; ?>
		<?php endif; ?>
	</div>
</div>

<div class="content">
	<?php echo $cal; ?>
</div>

<style type="text/css">
	
	#header{
		width:100%;
		margin-bottom:15px;
		overflow: hidden;
		
		border-top: 1px solid #4490d0;
		border-bottom: 1px solid #4490d0;
		background-color: #d1ebfa;
	}
	
	#header a{
		display:block;
		padding: 8px;
		
		color: #959595;
		font-family: "OstrichSansBlack", Helvetica, Arial;
		text-decoration:none;
	}
	
</style>