<?php
/**
 * Template Name: Custom Home Page
 */

get_header(); ?>

<?php do_action( 'vw_ecommerce_store_before_slider' ); ?>

<?php if( get_theme_mod( 'vw_ecommerce_store_slider_arrows') != '') { ?>

<section id="slider">
  <div class="container">
    <div class="row">
      <div class="<?php if( get_theme_mod( 'vw_ecommerce_store_sale_banner_hide') != '') { ?>col-lg-8 col-md-12"<?php } else { ?>col-lg-12 col-md-12 <?php } ?>">
        <div id="carouselExampleIndicators" class="carousel slide" data-ride="carousel"> 
          <?php $slider_pages = array();
            for ( $count = 1; $count <= 3; $count++ ) {
              $mod = intval( get_theme_mod( 'vw_ecommerce_store_slider_page' . $count ));
              if ( 'page-none-selected' != $mod ) {
                $slider_pages[] = $mod;
              }
            }
            if( !empty($slider_pages) ) :
              $args = array(
                'post_type' => 'page',
                'post__in' => $slider_pages,
                'orderby' => 'post__in'
              );
              $query = new WP_Query( $args );
              if ( $query->have_posts() ) :
                $i = 1;
          ?>
          <div class="carousel-inner" role="listbox">
            <?php while ( $query->have_posts() ) : $query->the_post(); ?>
              <div <?php if($i == 1){echo 'class="carousel-item active"';} else{ echo 'class="carousel-item"';}?>>
                <img src="<?php the_post_thumbnail_url('full'); ?>"/>
                <div class="carousel-caption">
                  <div class="inner_carousel">
                    <h2><?php the_title(); ?></h2>
                    <p><?php $excerpt = get_the_excerpt(); echo esc_html( vw_ecommerce_store_string_limit_words( $excerpt,15 ) ); ?></p>
                    <a href="<?php echo esc_url(get_permalink()); ?>"><?php esc_html_e( 'SHOP NOW', 'vw-ecommerce-store' ); ?></a>
                  </div>
                </div>
              </div>
            <?php $i++; endwhile; 
            wp_reset_postdata();?>
          </div>
          <?php else : ?>
              <div class="no-postfound"></div>
          <?php endif;
          endif;?>
          <a class="carousel-control-prev" href="#carouselExampleIndicators" role="button" data-slide="prev">
            <span class="carousel-control-prev-icon" aria-hidden="true"><i class="fas fa-chevron-left"></i></span>
          </a>
          <a class="carousel-control-next" href="#carouselExampleIndicators" role="button" data-slide="next">
            <span class="carousel-control-next-icon" aria-hidden="true"><i class="fas fa-chevron-right"></i></span>
          </a>
        </div>
      </div>
      <?php if( get_theme_mod( 'vw_ecommerce_store_sale_banner_hide') != '') { ?>
      <div class="col-lg-4 col-md-12">
        <div class="Sale-banner">
          <?php $sale_pages = array();
            for ( $count = 1; $count <= 2; $count++ ) {
              $mod = intval( get_theme_mod( 'vw_ecommerce_store_sale_page' . $count ));
              if ( 'page-none-selected' != $mod ) {
                $sale_pages[] = $mod;
              }
            }
            if( !empty($sale_pages) ) :
              $args = array(
                'post_type' => 'page',
                'post__in' => $sale_pages,
                'orderby' => 'post__in'
              );
              $query = new WP_Query( $args );
              if ( $query->have_posts() ) :
                $i = 1;
          ?>
          <div class="row">
            <?php while ( $query->have_posts() ) : $query->the_post(); ?>            
              <div class="col-lg-12 col-md-6">
                <div class="carousel-inner1" role="listbox">
                  <img src="<?php the_post_thumbnail_url('full'); ?>"/>
                  <div class="carousel-caption1">
                    <h3><?php the_title(); ?></h3>
                    <a href="<?php echo esc_url(get_permalink()); ?>"><?php esc_html_e( 'SHOP NOW', 'vw-ecommerce-store' ); ?></a>
                  </div>
                </div>
              </div>
            <?php $i++; endwhile; 
              wp_reset_postdata();?>
            <?php else : ?>
              <div class="no-postfound"></div>
            <?php endif;
            endif;?>
          </div>
        </div>
      </div>
      <?php }?>
    </div>
  </div>
  <div class="clearfix"></div>
</section>

<?php } ?>

<?php do_action( 'vw_ecommerce_store_after_slider' ); ?>

<section id="serv-section">
  <div class="container">
    <?php if( get_theme_mod( 'vw_ecommerce_store_section_title') != '' ) { ?>
      <h3><?php echo esc_html(get_theme_mod('vw_ecommerce_store_section_title','') ); ?></h3>
      <hr>
    <?php }?>
    <?php $product_pages = array();
      for ( $count = 0; $count <= 0; $count++ ) {
        $mod = absint( get_theme_mod( 'vw_ecommerce_store_product_page' ));
        if ( 'page-none-selected' != $mod ) {
          $product_pages[] = $mod;
        }
      }
      if( !empty($product_pages) ) :
        $args = array(
          'post_type' => 'page',
          'post__in' => $product_pages,
          'orderby' => 'post__in'
        );
        $query = new WP_Query( $args );
        if ( $query->have_posts() ) :
          $count = 0;
          while ( $query->have_posts() ) : $query->the_post(); ?>
            <?php the_content(); ?>
          <?php $count++; endwhile; ?>
        <?php else : ?>
            <div class="no-postfound"></div>
        <?php endif;
      endif;
      wp_reset_postdata();
    ?>
  </div>
</section>

<?php do_action( 'vw_ecommerce_store_after_product_section' ); ?>

<div id="content-vw">
  <div class="container">
    <?php while ( have_posts() ) : the_post(); ?>
      <?php the_content(); ?>
    <?php endwhile; // end of the loop. ?>
  </div>
</div>

<?php get_footer(); ?>
