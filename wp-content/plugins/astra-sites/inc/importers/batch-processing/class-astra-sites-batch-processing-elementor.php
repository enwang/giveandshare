<?php
/**
 * Elementor Importer
 *
 * @package Astra Sites
 */

namespace Elementor\TemplateLibrary;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

// If plugin - 'Elementor' not exist then return.
if ( ! class_exists( '\Elementor\Plugin' ) ) {
	return;
}

use Elementor\Core\Base\Document;
use Elementor\DB;
use Elementor\Core\Settings\Page\Manager as PageSettingsManager;
use Elementor\Core\Settings\Manager as SettingsManager;
use Elementor\Core\Settings\Page\Model;
use Elementor\Editor;
use Elementor\Plugin;
use Elementor\Settings;
use Elementor\Utils;

/**
 * Elementor template library local source.
 *
 * Elementor template library local source handler class is responsible for
 * handling local Elementor templates saved by the user locally on his site.
 *
 * @since 1.2.13 Added compatibility for Elemetnor v2.5.0
 * @since 1.0.0
 */
class Astra_Sites_Batch_Processing_Elementor extends Source_Local {

	/**
	 * Import
	 *
	 * @since 1.0.14
	 * @return void
	 */
	public function import() {

		// \Astra_Sites_Image_Importer::log( '---- Processing WordPress Posts / Pages - for Elementor ----' );
		$post_types = get_option( 'elementor_cpt_support', array( 'page', 'post' ) );
		if ( empty( $post_types ) && ! is_array( $post_types ) ) {
			return;
		}

		$post_ids = \Astra_Sites_Batch_Processing::get_pages( $post_types );
		if ( empty( $post_ids ) && ! is_array( $post_ids ) ) {
			return;
		}

		foreach ( $post_ids as $post_id ) {
			$is_elementor_post = get_post_meta( $post_id, '_elementor_version', true );
			if ( $is_elementor_post ) {
				$this->import_single_post( $post_id );
			}
		}
	}
	/**
	 * Update post meta.
	 *
	 * @since 1.0.14
	 * @param  integer $post_id Post ID.
	 * @return void
	 */
	public function import_single_post( $post_id = 0 ) {

		// \Astra_Sites_Image_Importer::log( 'Post ID: ' . $post_id );
		if ( ! empty( $post_id ) ) {

			$hotlink_imported = get_post_meta( $post_id, '_astra_sites_hotlink_imported', true );

			if ( empty( $hotlink_imported ) ) {

				$data = get_post_meta( $post_id, '_elementor_data', true );

				if ( ! empty( $data ) ) {

					// Update WP form IDs.
					$ids_mapping = get_option( 'astra_sites_wpforms_ids_mapping', array() );
					if ( $ids_mapping ) {
						foreach ( $ids_mapping as $old_id => $new_id ) {
							$data = str_replace( '[wpforms id=\"' . $old_id, '[wpforms id=\"' . $new_id, $data );
						}
					}

					$data = add_magic_quotes( $data );
					$data = json_decode( $data, true );

					// Import the data.
					$data = $this->process_export_import_content( $data, 'on_import' );

					// Update processed meta.
					update_metadata( 'post', $post_id, '_elementor_data', $data );
					update_metadata( 'post', $post_id, '_astra_sites_hotlink_imported', true );

					// !important, Clear the cache after images import.
					Plugin::$instance->posts_css_manager->clear_cache();

				}
			}
		}
	}
}
