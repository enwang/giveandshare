<?php
/**
 * VW Ecommerce Store Theme Customizer
 *
 * @package VW Ecommerce Store
 */

/**
 * Add postMessage support for site title and description for the Theme Customizer.
 *
 * @param WP_Customize_Manager $wp_customize Theme Customizer object.
 */
function vw_ecommerce_store_customize_register( $wp_customize ) {

	load_template( trailingslashit( get_template_directory() ) . 'inc/customize-homepage/class-customize-homepage.php' );

	//add home page setting pannel
	$wp_customize->add_panel( 'vw_ecommerce_store_panel_id', array(
	    'priority' => 10,
	    'capability' => 'edit_theme_options',
	    'theme_supports' => '',
	    'title' => __( 'VW Settings', 'vw-ecommerce-store' ),
	) );

	// Layout
	$wp_customize->add_section( 'vw_ecommerce_store_left_right', array(
    	'title'      => __( 'General Settings', 'vw-ecommerce-store' ),
		'panel' => 'vw_ecommerce_store_panel_id'
	) );

	$wp_customize->add_setting('vw_ecommerce_store_theme_options',array(
        'default' => __('Right Sidebar','vw-ecommerce-store'),
        'sanitize_callback' => 'vw_ecommerce_store_sanitize_choices'
	));
	$wp_customize->add_control('vw_ecommerce_store_theme_options',array(
        'type' => 'select',
        'label' => __('Post Sidebar Layout','vw-ecommerce-store'),
        'description' => __('Here you can change the sidebar layout for posts. ','vw-ecommerce-store'),
        'section' => 'vw_ecommerce_store_left_right',
        'choices' => array(
            'Left Sidebar' => __('Left Sidebar','vw-ecommerce-store'),
            'Right Sidebar' => __('Right Sidebar','vw-ecommerce-store'),
            'One Column' => __('One Column','vw-ecommerce-store'),
            'Three Columns' => __('Three Columns','vw-ecommerce-store'),
            'Four Columns' => __('Four Columns','vw-ecommerce-store'),
            'Grid Layout' => __('Grid Layout','vw-ecommerce-store')
        ),
	) );

	$wp_customize->add_setting('vw_ecommerce_store_page_layout',array(
        'default' => __('One Column','vw-ecommerce-store'),
        'sanitize_callback' => 'vw_ecommerce_store_sanitize_choices'
	));
	$wp_customize->add_control('vw_ecommerce_store_page_layout',array(
        'type' => 'select',
        'label' => __('Page Sidebar Layout','vw-ecommerce-store'),
        'description' => __('Here you can change the sidebar layout for pages. ','vw-ecommerce-store'),
        'section' => 'vw_ecommerce_store_left_right',
        'choices' => array(
            'Left Sidebar' => __('Left Sidebar','vw-ecommerce-store'),
            'Right Sidebar' => __('Right Sidebar','vw-ecommerce-store'),
            'One Column' => __('One Column','vw-ecommerce-store')
        ),
	) );

	//Topbar Discount
	$wp_customize->add_section( 'vw_ecommerce_store_top_discount', array(
    	'title'      => __( 'Topbar Discount Settings', 'vw-ecommerce-store' ),
		'panel' => 'vw_ecommerce_store_panel_id'
	) );

	$wp_customize->add_setting( 'vw_ecommerce_store_top_discount_box', array(
		'default'           => '',
		'sanitize_callback' => 'vw_ecommerce_store_sanitize_dropdown_pages'
	) );
	$wp_customize->add_control( 'vw_ecommerce_store_top_discount_box', array(
		'label'    => __( 'Select Discount Page', 'vw-ecommerce-store' ),
		'description' => __('Discount image size (1500 x 100)','vw-ecommerce-store'),
		'section'  => 'vw_ecommerce_store_top_discount',
		'type'     => 'dropdown-pages'
	) );

	//Topbar
	$wp_customize->add_section( 'vw_ecommerce_store_topbar', array(
    	'title'      => __( 'Topbar Settings', 'vw-ecommerce-store' ),
		'panel' => 'vw_ecommerce_store_panel_id'
	) );

	$wp_customize->add_setting('vw_ecommerce_store_location',array(
		'default'=> '',
		'sanitize_callback'	=> 'sanitize_text_field'
	));
	$wp_customize->add_control('vw_ecommerce_store_location',array(
		'label'	=> __('Add Location','vw-ecommerce-store'),
		'input_attrs' => array(
            'placeholder' => __( '828 N. Iqyreesrs Street Liocnss Park', 'vw-ecommerce-store' ),
        ),
		'section'=> 'vw_ecommerce_store_topbar',
		'type'=> 'text'
	));

	$wp_customize->add_setting('vw_ecommerce_store_order_tracking',array(
       'default' => 'false',
       'sanitize_callback'	=> 'sanitize_text_field'
    ));
    $wp_customize->add_control('vw_ecommerce_store_order_tracking',array(
       'type' => 'checkbox',
       'label' => __('Show / Hide Order Tracking','vw-ecommerce-store'),
       'section' => 'vw_ecommerce_store_topbar',
    ));

	$wp_customize->add_setting('vw_ecommerce_store_header_search',array(
       'default' => 'false',
       'sanitize_callback'	=> 'sanitize_text_field'
    ));
    $wp_customize->add_control('vw_ecommerce_store_header_search',array(
       'type' => 'checkbox',
       'label' => __('Show / Hide Search','vw-ecommerce-store'),
       'section' => 'vw_ecommerce_store_topbar',
    ));
    
	//Slider
	$wp_customize->add_section( 'vw_ecommerce_store_slidersettings' , array(
    	'title'      => __( 'Slider Settings', 'vw-ecommerce-store' ),
		'panel' => 'vw_ecommerce_store_panel_id'
	) );

	$wp_customize->add_setting('vw_ecommerce_store_slider_arrows',array(
       'default' => 'false',
       'sanitize_callback'	=> 'sanitize_text_field'
    ));
    $wp_customize->add_control('vw_ecommerce_store_slider_arrows',array(
       'type' => 'checkbox',
       'label' => __('Show / Hide slider','vw-ecommerce-store'),
       'section' => 'vw_ecommerce_store_slidersettings',
    ));

	for ( $count = 1; $count <= 4; $count++ ) {

		$wp_customize->add_setting( 'vw_ecommerce_store_slider_page' . $count, array(
			'default'           => '',
			'sanitize_callback' => 'vw_ecommerce_store_sanitize_dropdown_pages'
		) );
		$wp_customize->add_control( 'vw_ecommerce_store_slider_page' . $count, array(
			'label'    => __( 'Select Slider Page', 'vw-ecommerce-store' ),
			'description' => __('Slider image size (770 x 430)','vw-ecommerce-store'),
			'section'  => 'vw_ecommerce_store_slidersettings',
			'type'     => 'dropdown-pages'
		) );
	}

	//Sale Banner
	$wp_customize->add_section( 'vw_ecommerce_store_sale' , array(
    	'title'      => __( 'Sale Banner Settings', 'vw-ecommerce-store' ),
		'panel' => 'vw_ecommerce_store_panel_id'
	) );

	$wp_customize->add_setting('vw_ecommerce_store_sale_banner_hide',array(
       'default' => 'false',
       'sanitize_callback'	=> 'sanitize_text_field'
    ));
    $wp_customize->add_control('vw_ecommerce_store_sale_banner_hide',array(
       'type' => 'checkbox',
       'label' => __('Show / Hide Banner','vw-ecommerce-store'),
       'section' => 'vw_ecommerce_store_sale',
    ));

	for ( $count = 1; $count <= 2; $count++ ) {

		$wp_customize->add_setting( 'vw_ecommerce_store_sale_page' . $count, array(
			'default'           => '',
			'sanitize_callback' => 'vw_ecommerce_store_sanitize_dropdown_pages'
		) );
		$wp_customize->add_control( 'vw_ecommerce_store_sale_page' . $count, array(
			'label'    => __( 'Select Sale Banner Page', 'vw-ecommerce-store' ),
			'description' => __('Sale banner size (370 x 200)','vw-ecommerce-store'),
			'section'  => 'vw_ecommerce_store_sale',
			'type'     => 'dropdown-pages'
		) );
	}
    
	//Our Services section
	$wp_customize->add_section( 'vw_ecommerce_store_services_section' , array(
    	'title'      => __( 'Our Best Seller', 'vw-ecommerce-store' ),
		'priority'   => null,
		'panel' => 'vw_ecommerce_store_panel_id'
	) );

	$wp_customize->add_setting('vw_ecommerce_store_section_title',array(
		'default'=> '',
		'sanitize_callback'	=> 'sanitize_text_field'
	));
	$wp_customize->add_control('vw_ecommerce_store_section_title',array(
		'label'	=> __('Add Section Title','vw-ecommerce-store'),
		'input_attrs' => array(
            'placeholder' => __( 'OUR BEST SELLER', 'vw-ecommerce-store' ),
        ),
		'section'=> 'vw_ecommerce_store_services_section',
		'type'=> 'text'
	));

	$wp_customize->add_setting( 'vw_ecommerce_store_product_page' , array(
		'default'           => '',
		'sanitize_callback' => 'vw_ecommerce_store_sanitize_dropdown_pages'
	) );
	$wp_customize->add_control( 'vw_ecommerce_store_product_page' , array(
		'label'    => __( 'Select Product Page', 'vw-ecommerce-store' ),
		'description' => __('Product Image size (270 x 260)','vw-ecommerce-store'),
		'section'  => 'vw_ecommerce_store_services_section',		
		'type'     => 'dropdown-pages'
	) );

	//Content Craetion
	$wp_customize->add_section( 'vw_ecommerce_store_content_section' , array(
    	'title' => __( 'Customize Home Page Settings', 'vw-ecommerce-store' ),
		'priority' => null,
		'panel' => 'vw_ecommerce_store_panel_id'
	) );

	$wp_customize->add_setting('vw_ecommerce_store_content_creation_main_control', array(
		'sanitize_callback' => 'esc_html',
	) );

	$homepage= get_option( 'page_on_front' );

	$wp_customize->add_control(	new VW_Ecommerce_Store_Content_Creation( $wp_customize, 'vw_ecommerce_store_content_creation_main_control', array(
		'options' => array(
			esc_html__( 'First select static page in homepage setting for front page.Below given edit button is to customize Home Page. Just click on the edit option, add whatever elements you want to include in the homepage, save the changes and you are good to go.','vw-ecommerce-store' ),
		),
		'section' => 'vw_ecommerce_store_content_section',
		'button_url'  => admin_url( 'post.php?post='.$homepage.'&action=edit'),
		'button_text' => esc_html__( 'Edit', 'vw-ecommerce-store' ),
	) ) );

	//Footer Text
	$wp_customize->add_section('vw_ecommerce_store_footer',array(
		'title'	=> __('Footer Settings','vw-ecommerce-store'),
		'panel' => 'vw_ecommerce_store_panel_id',
	));	
	
	$wp_customize->add_setting('vw_ecommerce_store_footer_text',array(
		'default'=> '',
		'sanitize_callback'	=> 'sanitize_text_field'
	));	
	$wp_customize->add_control('vw_ecommerce_store_footer_text',array(
		'label'	=> __('Copyright Text','vw-ecommerce-store'),
		'input_attrs' => array(
            'placeholder' => __( 'Copyright 2019, .....', 'vw-ecommerce-store' ),
        ),
		'section'=> 'vw_ecommerce_store_footer',
		'type'=> 'text'
	));	
}

add_action( 'customize_register', 'vw_ecommerce_store_customize_register' );

/**
 * Singleton class for handling the theme's customizer integration.
 *
 * @since  1.0.0
 * @access public
 */
final class VW_Ecommerce_Store_Customize {

	/**
	 * Returns the instance.
	 *
	 * @since  1.0.0
	 * @access public
	 * @return object
	 */
	public static function get_instance() {

		static $instance = null;

		if ( is_null( $instance ) ) {
			$instance = new self;
			$instance->setup_actions();
		}

		return $instance;
	}

	/**
	 * Constructor method.
	 *
	 * @since  1.0.0
	 * @access private
	 * @return void
	 */
	private function __construct() {}

	/**
	 * Sets up initial actions.
	 *
	 * @since  1.0.0
	 * @access private
	 * @return void
	 */
	private function setup_actions() {

		// Register panels, sections, settings, controls, and partials.
		add_action( 'customize_register', array( $this, 'sections' ) );

		// Register scripts and styles for the controls.
		add_action( 'customize_controls_enqueue_scripts', array( $this, 'enqueue_control_scripts' ), 0 );
	}

	/**
	 * Sets up the customizer sections.
	 *
	 * @since  1.0.0
	 * @access public
	 * @param  object  $manager
	 * @return void
	*/
	public function sections( $manager ) {

		// Load custom sections.
		load_template( trailingslashit( get_template_directory() ) . '/inc/section-pro.php' );

		// Register custom section types.
		$manager->register_section_type( 'VW_Ecommerce_Store_Customize_Section_Pro' );

		// Register sections.
		$manager->add_section(
			new VW_Ecommerce_Store_Customize_Section_Pro(
				$manager,
				'example_1',
				array(
					'priority'   => 9,
					'title'    => esc_html__( 'VW ECOMMERCE PRO', 'vw-ecommerce-store' ),
					'pro_text' => esc_html__( 'UPGRADE PRO', 'vw-ecommerce-store' ),
					'pro_url'  => esc_url('https://www.vwthemes.com/themes/wordpress-ecommerce-theme/'),
				)
			)
		);
	}

	/**
	 * Loads theme customizer CSS.
	 *
	 * @since  1.0.0
	 * @access public
	 * @return void
	 */
	public function enqueue_control_scripts() {

		wp_enqueue_script( 'vw-ecommerce-store-customize-controls', trailingslashit( get_template_directory_uri() ) . '/assets/js/customize-controls.js', array( 'customize-controls' ) );

		wp_enqueue_style( 'vw-ecommerce-store-customize-controls', trailingslashit( get_template_directory_uri() ) . '/assets/css/customize-controls.css' );
	}
}

// Doing this customizer thang!
VW_Ecommerce_Store_Customize::get_instance();