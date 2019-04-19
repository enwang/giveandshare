<?php
/**
 * The template part for displaying post
 *
 * @package VW Ecommerce Store 
 * @subpackage vw_ecommerce_store
 * @since VW Ecommerce Store 1.0
 */
?>

<div id="post-<?php the_ID(); ?>" <?php post_class('inner-service'); ?>>
  <div class="post-main-box ">
    <div class="row m-0">
      <?php if(has_post_thumbnail()) {?>
        <div class="box-image col-lg-6 col-md-6">
          <?php the_post_thumbnail(); ?>
        </div>
      <?php } ?>
      <div class="new-text <?php if(has_post_thumbnail()) { ?>col-lg-6 col-md-6"<?php } else { ?>col-lg-12 col-md-12"<?php } ?>>
        <h3 class="section-title"><?php the_title();?></h3>
        <div class="post-info">
          <span class="entry-date"><?php echo esc_html( get_the_date() ); ?></span><span>|</span>
          <span class="entry-author"> <?php the_author(); ?></span>
          <hr>
        </div>
        <p><?php $excerpt = get_the_excerpt(); echo esc_html( vw_ecommerce_store_string_limit_words( $excerpt,20 ) ); ?></p>
        <div class="more-btn">
          <a href="<?php echo esc_url(get_permalink()); ?>"><?php esc_html_e( 'READ MORE', 'vw-ecommerce-store' ); ?></a>
        </div>
      </div>
    </div>
  </div>
</div>