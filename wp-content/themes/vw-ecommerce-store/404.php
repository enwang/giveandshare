<?php
/**
 * The template for displaying 404 pages (Not Found).
 *
 * @package VW Ecommerce Store
 */

get_header(); ?>

<div id="content-vw">
	<div class="container">
    	<h1><?php printf( '<strong>%s</strong> %s', esc_html__( '404','vw-ecommerce-store' ), esc_html__( 'Not Found', 'vw-ecommerce-store' ) ) ?></h1>
		<p class="text-404"><?php esc_html_e( 'Looks like you have taken a wrong turn&hellip', 'vw-ecommerce-store' ); ?></p>
		<p class="text-404"><?php esc_html_e( 'Dont worry&hellip it happens to the best of us.', 'vw-ecommerce-store' ); ?></p>
		<div class="more-btn">
        	<a href="<?php echo esc_url(get_permalink()); ?>"><?php esc_html_e( 'READ MORE', 'vw-ecommerce-store' ); ?></a>
        </div>
		<div class="clearfix"></div>
	</div>
</div>

<?php get_footer(); ?>