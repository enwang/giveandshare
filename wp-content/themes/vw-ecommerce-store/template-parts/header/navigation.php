<?php
/**
 * The template part for header
 *
 * @package VW Ecommerce Store 
 * @subpackage vw_ecommerce_store
 * @since VW Ecommerce Store 1.0
 */
?>

<div class="toggle"><a class="toggleMenu" href="#"><?php esc_html_e('Menu','vw-ecommerce-store'); ?></a></div>
<div class="container">
	<div id="header" class="menubar">
		<div class="row">
			<div class="<?php if( get_theme_mod( 'vw_ecommerce_store_header_search') != '') { ?>col-lg-11 col-md-11"<?php } else { ?>col-lg-12 col-md-12 <?php } ?>">
				<div class="nav">
					<?php wp_nav_menu( array('theme_location'  => 'primary') ); ?>
				</div>
			</div>
			<div class="col-lg-1 col-md-1 search-box">
		        <?php if( get_theme_mod( 'vw_ecommerce_store_header_search') != '') { ?>
		        	<span><i class="fas fa-search"></i></span>
		        <?php }?>
		    </div>
		</div>
		<div class="serach_outer">
	      	<div class="closepop"><i class="far fa-window-close"></i></div>
	      	<?php if(class_exists('woocommerce')){ ?>
		      	<div class="serach_inner">
		        	<?php get_product_search_form(); ?>
		      	</div>
	      	<?php }
	      	else { ?>
	      		<div class="serach_inner">
		        	<?php get_search_form(); ?>
		      	</div>
		    <?php } ?>
	    </div>
	</div>
</div>