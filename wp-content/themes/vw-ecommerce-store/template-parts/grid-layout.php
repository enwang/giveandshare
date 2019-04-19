<?php
/**
 * The template part for displaying grid post
 *
 * @package VW Ecommerce Store
 * @subpackage vw-ecommerce-store
 * @since VW Ecommerce Store 1.0
 */
?>

<div class="col-lg-4 col-md-4">
	<div id="post-<?php the_ID(); ?>" <?php post_class('inner-service'); ?>>
	    <div class="post-main-box">
	      	<div class="box-image">
	          	<?php 
		            if(has_post_thumbnail()) { 
		              the_post_thumbnail(); 
		            }
	          	?>
	        </div>
	        <h3 class="section-title"><?php the_title();?></h3>
	        <div class="new-text">
	        	<p><?php the_excerpt();?></p>
	        </div>
	        <div class="more-btn">
	        	<a href="<?php echo esc_url(get_permalink()); ?>"><?php esc_html_e( 'READ MORE', 'vw-ecommerce-store' ); ?></a>
	        </div>
	    </div>
	    <div class="clearfix"></div>
  	</div>
</div>