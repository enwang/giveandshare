/**
 * AJAX Request Queue
 *
 * - add()
 * - remove()
 * - run()
 * - stop()
 *
 * @since 1.0.0
 */
var AstraSitesAjaxQueue = (function() {

	var requests = [];

	return {

		/**
		 * Add AJAX request
		 *
		 * @since 1.0.0
		 */
		add:  function(opt) {
		    requests.push(opt);
		},

		/**
		 * Remove AJAX request
		 *
		 * @since 1.0.0
		 */
		remove:  function(opt) {
		    if( jQuery.inArray(opt, requests) > -1 )
		        requests.splice($.inArray(opt, requests), 1);
		},

		/**
		 * Run / Process AJAX request
		 *
		 * @since 1.0.0
		 */
		run: function() {
		    var self = this,
		        oriSuc;

		    if( requests.length ) {
		        oriSuc = requests[0].complete;

		        requests[0].complete = function() {
		             if( typeof(oriSuc) === 'function' ) oriSuc();
		             requests.shift();
		             self.run.apply(self, []);
		        };

		        jQuery.ajax(requests[0]);

		    } else {

		      self.tid = setTimeout(function() {
		         self.run.apply(self, []);
		      }, 1000);
		    }
		},

		/**
		 * Stop AJAX request
		 *
		 * @since 1.0.0
		 */
		stop:  function() {

		    requests = [];
		    clearTimeout(this.tid);
		}
	};

}());

(function($){

	var AstraSSEImport = {
		complete: {
			posts: 0,
			media: 0,
			users: 0,
			comments: 0,
			terms: 0,
		},

		updateDelta: function (type, delta) {
			this.complete[ type ] += delta;

			var self = this;
			requestAnimationFrame(function () {
				self.render();
			});
		},
		updateProgress: function ( type, complete, total ) {
			var text = complete + '/' + total;

			if( 'undefined' !== type && 'undefined' !== text ) {
				total = parseInt( total, 10 );
				if ( 0 === total || isNaN( total ) ) {
					total = 1;
				}
				var percent = parseInt( complete, 10 ) / total;
				var progress     = Math.round( percent * 100 ) + '%';
				var progress_bar = percent * 100;

				if( progress_bar <= 100 ) {
					document.getElementById( 'astra-site-import-process' ).value          = progress_bar;
					$('.button-hero.astra-demo-import').text( astraSitesAdmin.log.importingXML + ' '+progress );
				}
			}
		},
		render: function () {
			var types = Object.keys( this.complete );
			var complete = 0;
			var total = 0;


			for (var i = types.length - 1; i >= 0; i--) {
				var type = types[i];
				this.updateProgress( type, this.complete[ type ], this.data.count[ type ] );

				complete += this.complete[ type ];
				total += this.data.count[ type ];
			}

			this.updateProgress( 'total', complete, total );
		}
	};

	AstraSitesAdmin = {

		reset_remaining_posts: 0,
		reset_remaining_wp_forms: 0,
		reset_remaining_terms: 0,
		reset_processed_posts: 0,
		reset_processed_wp_forms: 0,
		reset_processed_terms: 0,
		site_imported_data: null,

		backup_taken: false,

		current_site: [],
		current_screen: '',

		templateData: {},

		log_file        : '',
		customizer_data : '',
		wxr_url         : '',
		wpforms_url     : '',
		options_data    : '',
		widgets_data    : '',

		init: function()
		{
			this._resetPagedCount();
			this._bind();
		},

		/**
		 * Debugging.
		 * 
		 * @param  {mixed} data Mixed data.
		 */
		_log: function( data ) {
			
			if( astraSitesAdmin.debug ) {

				var date = new Date();
				var time = date.toLocaleTimeString();

				if (typeof data == 'object') { 
					console.log('%c ' + JSON.stringify( data ) + ' ' + time, 'background: #ededed; color: #444');
				} else {
					console.log('%c ' + data + ' ' + time, 'background: #ededed; color: #444');
				}


			}
		},

		/**
		 * Binds events for the Astra Sites.
		 *
		 * @since 1.0.0
		 * @access private
		 * @method _bind
		 */
		_bind: function()
		{
			$( document ).on( 'click'					 , '.astra-sites-reset-data .checkbox', AstraSitesAdmin._toggle_reset_notice );
			$( document ).on('change'                    , '#astra-sites-welcome-form-inline select', AstraSitesAdmin._change_page_builder);
			$( document ).on('click'                     , '.astra-sites-tooltip-icon', AstraSitesAdmin._toggle_tooltip);
			$( document ).on('click'                     , '.astra-sites-advanced-options-button', AstraSitesAdmin._toggle_advanced_options);

			$( document ).on('click'                     , '.astra-import-settings', AstraSitesAdmin._import_settings);
			$( document ).on('click'					 , '.devices button', AstraSitesAdmin._previewDevice);
			$( document ).on('click'                     , '.theme-browser .theme-screenshot, .theme-browser .more-details, .theme-browser .install-theme-preview', AstraSitesAdmin._preview);
			$( document ).on('click'                     , '.next-theme', AstraSitesAdmin._nextTheme);
			$( document ).on('click'                     , '.previous-theme', AstraSitesAdmin._previousTheme);
			$( document ).on('click'                     , '.collapse-sidebar', AstraSitesAdmin._collapse);
			$( document ).on('click'                     , '.astra-demo-import', AstraSitesAdmin._importDemo);
			
			$( document ).on('astra-sites-install-and-activate-required-plugins-done'       , AstraSitesAdmin._process_import );

			$( document ).on('click'                     , '.install-now', AstraSitesAdmin._installNow);
			$( document ).on('click'                     , '.close-full-overlay', AstraSitesAdmin._fullOverlay);
			$( document ).on('click'                     , '.activate-now', AstraSitesAdmin._activateNow);
			$( document ).on('wp-plugin-installing'      , AstraSitesAdmin._pluginInstalling);
			$( document ).on('wp-plugin-install-error'   , AstraSitesAdmin._installError);
			$( document ).on('wp-plugin-install-success' , AstraSitesAdmin._installSuccess);

			$( document ).on( 'astra-sites-import-set-site-data-done'   		, AstraSitesAdmin._resetData );
			$( document ).on( 'astra-sites-reset-data'							, AstraSitesAdmin._backup_before_rest_options );
			$( document ).on( 'astra-sites-backup-settings-before-reset-done'	, AstraSitesAdmin._reset_customizer_data );
			$( document ).on( 'astra-sites-reset-customizer-data-done'			, AstraSitesAdmin._reset_site_options );
			$( document ).on( 'astra-sites-reset-site-options-done'				, AstraSitesAdmin._reset_widgets_data );
			$( document ).on( 'astra-sites-reset-widgets-data-done'				, AstraSitesAdmin._reset_terms );
			$( document ).on( 'astra-sites-delete-terms-done'					, AstraSitesAdmin._reset_wp_forms );
			$( document ).on( 'astra-sites-delete-wp-forms-done'				, AstraSitesAdmin._reset_posts );

			$( document ).on('astra-sites-reset-data-done'       		   , AstraSitesAdmin._recheck_backup_options );
			$( document ).on('astra-sites-backup-settings-done'       	   , AstraSitesAdmin._importWPForms );
			$( document ).on('astra-sites-import-wpforms-done'       	   , AstraSitesAdmin._importCustomizerSettings );
			$( document ).on('astra-sites-import-customizer-settings-done' , AstraSitesAdmin._importXML );
			$( document ).on('astra-sites-import-xml-done'                 , AstraSitesAdmin._importSiteOptions );
			$( document ).on('astra-sites-import-options-done'             , AstraSitesAdmin._importWidgets );
			$( document ).on('astra-sites-import-widgets-done'             , AstraSitesAdmin._importEnd );

		},

		_change_page_builder: function() {
		    $(this).closest('form').submit();
		},

		_toggle_tooltip: function( event ) {
			event.preventDefault();
			var tip_id = $( this ).data('tip-id') || '';
			if( tip_id && $( '#' + tip_id ).length ) {
				$( '#' + tip_id ).toggle();
			}
		},

		_toggle_advanced_options: function( event ) {
			event.preventDefault();
			$('.astra-sites-advanced-options').toggle();
		},

		_resetData: function( event ) {
			event.preventDefault();

			if ( $( '.astra-sites-reset-data' ).find('.checkbox').is(':checked') ) {
				$(document).trigger( 'astra-sites-reset-data' );
			} else {
				$(document).trigger( 'astra-sites-reset-data-done' );
			}
		},

		_reset_customizer_data() {
			$.ajax({
				url  : astraSitesAdmin.ajaxurl,
				type : 'POST',
				data : {
					action : 'astra-sites-reset-customizer-data'
				},
				beforeSend: function() {
					AstraSitesAdmin._log( 'Reseting Customizer Data' );
					$('.button-hero.astra-demo-import').text( 'Reseting Customizer Data' );
				},
			})
			.fail(function( jqXHR ){
				AstraSitesAdmin._importFailMessage( jqXHR.status + ' ' + jqXHR.responseText + ' ' + jqXHR.statusText );
				AstraSitesAdmin._log( jqXHR.status + ' ' + jqXHR.responseText + ' ' + jqXHR.statusText );
		    })
			.done(function ( data ) {
				$(document).trigger( 'astra-sites-reset-customizer-data-done' );
			});
		},

		_reset_site_options: function() {
			// Site Options.
			$.ajax({
				url  : astraSitesAdmin.ajaxurl,
				type : 'POST',
				data : {
					action : 'astra-sites-reset-site-options'
				},
				beforeSend: function() {
					AstraSitesAdmin._log( 'Reseting Site Options' );
					$('.button-hero.astra-demo-import').text( 'Reseting Site Options' );
				},
			})
			.fail(function( jqXHR ){
				AstraSitesAdmin._importFailMessage( jqXHR.status + ' ' + jqXHR.responseText + ' ' + jqXHR.statusText );
				AstraSitesAdmin._log( jqXHR.status + ' ' + jqXHR.responseText + ' ' + jqXHR.statusText );
		    })
			.done(function ( data ) {


				$(document).trigger( 'astra-sites-reset-site-options-done' );
			});			
		},

		_reset_widgets_data: function() {
			// Widgets.
			$.ajax({
				url  : astraSitesAdmin.ajaxurl,
				type : 'POST',
				data : {
					action : 'astra-sites-reset-widgets-data'
				},
				beforeSend: function() {
					AstraSitesAdmin._log( 'Reseting Widgets' );
					$('.button-hero.astra-demo-import').text( 'Reseting Widgets' );
				},
			})
			.fail(function( jqXHR ){
				AstraSitesAdmin._importFailMessage( jqXHR.status + ' ' + jqXHR.responseText + ' ' + jqXHR.statusText );
				AstraSitesAdmin._log( jqXHR.status + ' ' + jqXHR.responseText + ' ' + jqXHR.statusText );
		    })
			.done(function ( data ) {
				AstraSitesAdmin._log( data );
				$(document).trigger( 'astra-sites-reset-widgets-data-done' );
			});
		},

		_reset_posts: function() {
			if( AstraSitesAdmin.site_imported_data['reset_posts'].length ) {

				AstraSitesAdmin.reset_remaining_posts = AstraSitesAdmin.site_imported_data['reset_posts'].length;

				// Delete all posts.
				// AstraSitesAjaxQueue.stop();
				// AstraSitesAjaxQueue.run();

				$.each( AstraSitesAdmin.site_imported_data['reset_posts'], function(index, post_id) {
					AstraSitesAjaxQueue.add({
						url: astraSitesAdmin.ajaxurl,
						type: 'POST',
						data: {
							action  : 'astra-sites-delete-posts',
							post_id : post_id,
						},
						success: function( result ){

							if( AstraSitesAdmin.reset_processed_posts < AstraSitesAdmin.site_imported_data['reset_posts'].length ) {
								AstraSitesAdmin.reset_processed_posts+=1;
							}
				
							$('.button-hero.astra-demo-import').text( 'Deleting Item ' + AstraSitesAdmin.reset_processed_posts + ' of ' + AstraSitesAdmin.site_imported_data['reset_posts'].length );
							AstraSitesAdmin.reset_remaining_posts-=1;
							if( 0 == AstraSitesAdmin.reset_remaining_posts ) {
								$(document).trigger( 'astra-sites-delete-posts-done' );
								$(document).trigger( 'astra-sites-reset-data-done' );
							}
						}
					});
				});
				AstraSitesAjaxQueue.run();

			} else {
				$(document).trigger( 'astra-sites-delete-posts-done' );
				$(document).trigger( 'astra-sites-reset-data-done' );
			}
		},

		_reset_wp_forms: function() {

			AstraSitesAdmin._log( AstraSitesAdmin.site_imported_data['reset_wp_forms'] );
			AstraSitesAdmin._log( AstraSitesAdmin.site_imported_data['reset_wp_forms'].length );

			if( AstraSitesAdmin.site_imported_data['reset_wp_forms'].length ) {
				AstraSitesAdmin.reset_remaining_wp_forms = AstraSitesAdmin.site_imported_data['reset_wp_forms'].length;

				$.each( AstraSitesAdmin.site_imported_data['reset_wp_forms'], function(index, post_id) {
					AstraSitesAdmin._log( 'WP Form ID: ' + post_id );
					AstraSitesAjaxQueue.add({
						url: astraSitesAdmin.ajaxurl,
						type: 'POST',
						data: {
							action  : 'astra-sites-delete-wp-forms',
							post_id : post_id,
						},
						success: function( result ){
							AstraSitesAdmin._log( 'WP Forms Results' );
							AstraSitesAdmin._log( result );
							if( AstraSitesAdmin.reset_processed_wp_forms < AstraSitesAdmin.site_imported_data['reset_wp_forms'].length ) {
								AstraSitesAdmin.reset_processed_wp_forms+=1;
							}

							$('.button-hero.astra-demo-import').text( 'Deleting Form ' + AstraSitesAdmin.reset_processed_wp_forms + ' of ' + AstraSitesAdmin.site_imported_data['reset_wp_forms'].length );
							AstraSitesAdmin.reset_remaining_wp_forms-=1;
							if( 0 == AstraSitesAdmin.reset_remaining_wp_forms ) {
								$(document).trigger( 'astra-sites-delete-wp-forms-done' );
							}
						}
					});
				});
				AstraSitesAjaxQueue.run();

			} else {
				$(document).trigger( 'astra-sites-delete-wp-forms-done' );
			}
		},

		
		_reset_terms: function() {

			AstraSitesAdmin._log( AstraSitesAdmin.site_imported_data['reset_terms'] );
			AstraSitesAdmin._log( AstraSitesAdmin.site_imported_data['reset_terms'].length );

			if( AstraSitesAdmin.site_imported_data['reset_terms'].length ) {
				AstraSitesAdmin.reset_remaining_terms = AstraSitesAdmin.site_imported_data['reset_terms'].length;

				$.each( AstraSitesAdmin.site_imported_data['reset_terms'], function(index, term_id) {
					AstraSitesAjaxQueue.add({
						url: astraSitesAdmin.ajaxurl,
						type: 'POST',
						data: {
							action  : 'astra-sites-delete-terms',
							term_id : term_id,
						},
						success: function( result ){
							if( AstraSitesAdmin.reset_processed_terms < AstraSitesAdmin.site_imported_data['reset_terms'].length ) {
								AstraSitesAdmin.reset_processed_terms+=1;
							}
							AstraSitesAdmin._log( result );
							$('.button-hero.astra-demo-import').text( 'Deleting Term ' + AstraSitesAdmin.reset_processed_terms + ' of ' + AstraSitesAdmin.site_imported_data['reset_terms'].length );
							AstraSitesAdmin.reset_remaining_terms-=1;
							AstraSitesAdmin._log( AstraSitesAdmin.reset_remaining_terms );
							if( 0 == AstraSitesAdmin.reset_remaining_terms ) {
								$(document).trigger( 'astra-sites-delete-terms-done' );
							}
						}
					});
				});
				AstraSitesAjaxQueue.run();

			} else {
				$(document).trigger( 'astra-sites-delete-terms-done' );
			}

		},

		_toggle_reset_notice: function() {
			if ( $( this ).is(':checked') ) {
				$('#astra-sites-tooltip-reset-data').show();
			} else {
				$('#astra-sites-tooltip-reset-data').hide();
			}
		},

		_backup_before_rest_options: function() {
			AstraSitesAdmin._backupOptions( 'astra-sites-backup-settings-before-reset-done' );
			AstraSitesAdmin.backup_taken = true;
		},

		_recheck_backup_options: function() {
			AstraSitesAdmin._backupOptions( 'astra-sites-backup-settings-done' );
			AstraSitesAdmin.backup_taken = true;
		},

		_backupOptions: function( trigger_name ) {
			$.ajax({
				url  : astraSitesAdmin.ajaxurl,
				type : 'POST',
				data : {
					action : 'astra-sites-backup-settings',
				},
				beforeSend: function() {
					AstraSitesAdmin._log( astraSitesAdmin.log.importWPForms );
					$('.button-hero.astra-demo-import').text( astraSitesAdmin.log.backupCustomizer );
				},
			})
			.fail(function( jqXHR ){
				AstraSitesAdmin._importFailMessage( jqXHR.status + ' ' + jqXHR.responseText );
				AstraSitesAdmin._log( jqXHR.status + ' ' + jqXHR.responseText );
		    })
			.done(function ( data ) {

				// 1. Pass - Import Customizer Options.
				AstraSitesAdmin._log( astraSitesAdmin.log.backupCustomizerSuccess );

				// Custom trigger.
				$(document).trigger( trigger_name );
			});
		},

		_import_settings: function( event ) {
			event.preventDefault();

			var btn = $(this);

			btn.addClass('updating-message');


			$.ajax({
				url  : astraSitesAdmin.ajaxurl,
				type : 'POST',
				dataType: 'json',
				data : {
					action          : 'astra-sites-import-customizer-settings',
					customizer_data : AstraSitesAdmin.current_site['astra-site-customizer-data'],
				},
				beforeSend: function() {
					AstraSitesAdmin._log( astraSitesAdmin.log.importCustomizer );
					$('.button-hero.astra-demo-import').text( astraSitesAdmin.log.importingCustomizer );
				},
			})
			.fail(function( jqXHR ){
				AstraSitesAdmin._importFailMessage( jqXHR.status + ' ' + jqXHR.responseText + ' ' + jqXHR.statusText );
				AstraSitesAdmin._log( jqXHR.status + ' ' + jqXHR.responseText + ' ' + jqXHR.statusText );
		    })
			.done(function ( customizer_data ) {

				btn.removeClass( 'updating-message' );

				// 1. Fail - Import Customizer Options.
				if( false === customizer_data.success ) {
					AstraSitesAdmin._importFailMessage( customizer_data.data );
					AstraSitesAdmin._log( customizer_data.data );
				} else {

					// 1. Pass - Import Customizer Options.
					AstraSitesAdmin._log( astraSitesAdmin.log.importCustomizerSuccess );

					$(document).trigger( 'astra-sites-import-customizer-settings-done' );
				}
			});
		},

		/**
		 * 5. Import Complete.
		 */
		_importEnd: function( event ) {

			$.ajax({
				url  : astraSitesAdmin.ajaxurl,
				type : 'POST',
				dataType: 'json',
				data : {
					action : 'astra-sites-import-end',
				},
				beforeSend: function() {
					$('.button-hero.astra-demo-import').text( astraSitesAdmin.log.importComplete );
				}
			})
			.fail(function( jqXHR ){
				AstraSitesAdmin._importFailMessage( jqXHR.status + ' ' + jqXHR.responseText + ' ' + jqXHR.statusText );
				AstraSitesAdmin._log( jqXHR.status + ' ' + jqXHR.responseText + ' ' + jqXHR.statusText );
		    })
			.done(function ( data ) {

				// 5. Fail - Import Complete.
				if( false === data.success ) {
					AstraSitesAdmin._importFailMessage( data.data );
					AstraSitesAdmin._log( data.data );
				} else {

					$('body').removeClass('importing-site');
					$('.previous-theme, .next-theme').removeClass('disabled');

					// 5. Pass - Import Complete.
					AstraSitesAdmin._importSuccessMessage();
					AstraSitesAdmin._log( astraSitesAdmin.log.success + ' ' + astraSitesAdmin.siteURL );
				}
			});
		},

		/**
		 * 4. Import Widgets.
		 */
		_importWidgets: function( event ) {
			if ( AstraSitesAdmin._is_process_widgets() ) {
				$.ajax({
					url  : astraSitesAdmin.ajaxurl,
					type : 'POST',
					dataType: 'json',
					data : {
						action       : 'astra-sites-import-widgets',
						widgets_data : AstraSitesAdmin.widgets_data,
					},
					beforeSend: function() {
						AstraSitesAdmin._log( astraSitesAdmin.log.importWidgets );
						$('.button-hero.astra-demo-import').text( astraSitesAdmin.log.importingWidgets );
					},
				})
				.fail(function( jqXHR ){
					AstraSitesAdmin._importFailMessage( jqXHR.status + ' ' + jqXHR.responseText );
					AstraSitesAdmin._log( jqXHR.status + ' ' + jqXHR.responseText );
			    })
				.done(function ( widgets_data ) {

					// 4. Fail - Import Widgets.
					if( false === widgets_data.success ) {
						AstraSitesAdmin._importFailMessage( widgets_data.data );
						AstraSitesAdmin._log( widgets_data.data );

					} else {
						
						// 4. Pass - Import Widgets.
						AstraSitesAdmin._log( astraSitesAdmin.log.importWidgetsSuccess );
						$(document).trigger( 'astra-sites-import-widgets-done' );					
					}
				});
			} else {
				$(document).trigger( 'astra-sites-import-widgets-done' );
			}
		},

		/**
		 * 3. Import Site Options.
		 */
		_importSiteOptions: function( event ) {

			if ( AstraSitesAdmin._is_process_xml() ) {
				$.ajax({
					url  : astraSitesAdmin.ajaxurl,
					type : 'POST',
					dataType: 'json',
					data : {
						action       : 'astra-sites-import-options',
						options_data : AstraSitesAdmin.options_data,
					},
					beforeSend: function() {
						AstraSitesAdmin._log( astraSitesAdmin.log.importOptions );
						$('.button-hero.astra-demo-import').text( astraSitesAdmin.log.importingOptions );
						$('.astra-demo-import .percent').html('');
					},
				})
				.fail(function( jqXHR ){
					AstraSitesAdmin._importFailMessage( jqXHR.status + ' ' + jqXHR.responseText );
					AstraSitesAdmin._log( jqXHR.status + ' ' + jqXHR.responseText );
			    })
				.done(function ( options_data ) {

					// 3. Fail - Import Site Options.
					if( false === options_data.success ) {
						AstraSitesAdmin._log( options_data );
						AstraSitesAdmin._importFailMessage( options_data.data );
						AstraSitesAdmin._log( options_data.data );

					} else {

						// 3. Pass - Import Site Options.
						AstraSitesAdmin._log( astraSitesAdmin.log.importOptionsSuccess );
						$(document).trigger( 'astra-sites-import-options-done' );
					}
				});
			} else {
				$(document).trigger( 'astra-sites-import-options-done' );				
			}
		},

		/**
		 * 2. Prepare XML Data.
		 */
		_importXML: function() {

			if ( AstraSitesAdmin._is_process_xml() ) {
				$.ajax({
					url  : astraSitesAdmin.ajaxurl,
					type : 'POST',
					dataType: 'json',
					data : {
						action  : 'astra-sites-import-prepare-xml',
						wxr_url : AstraSitesAdmin.current_site['astra-site-wxr-path'],
					},
					beforeSend: function() {
						$('#astra-site-import-process-wrap').show();
						AstraSitesAdmin._log( astraSitesAdmin.log.importXMLPrepare );
						$('.button-hero.astra-demo-import').text( astraSitesAdmin.log.importXMLPreparing );
					},
				})
				.fail(function( jqXHR ){
					AstraSitesAdmin._importFailMessage( jqXHR.status + ' ' + jqXHR.responseText );
					AstraSitesAdmin._log( jqXHR.status + ' ' + jqXHR.responseText );
			    })
				.done(function ( xml_data ) {


					// 2. Fail - Prepare XML Data.
					if( false === xml_data.success ) {
						AstraSitesAdmin._log( xml_data );
						var error_msg = xml_data.data.error || xml_data.data;
						AstraSitesAdmin._importFailMessage( error_msg );
						AstraSitesAdmin._log( error_msg );

					} else {

						// 2. Pass - Prepare XML Data.
						AstraSitesAdmin._log( astraSitesAdmin.log.importXMLPrepareSuccess );

						// Import XML though Event Source.
						AstraSSEImport.data = xml_data.data;
						AstraSSEImport.render();

						AstraSitesAdmin._log( astraSitesAdmin.log.importXML );
						$('.button-hero.astra-demo-import').text( astraSitesAdmin.log.importingXML );
						
						var evtSource = new EventSource( AstraSSEImport.data.url );
						evtSource.onmessage = function ( message ) {
							var data = JSON.parse( message.data );
							switch ( data.action ) {
								case 'updateDelta':
										AstraSSEImport.updateDelta( data.type, data.delta );
									break;

								case 'complete':
									evtSource.close();

									// 2. Pass - Import XML though "Source Event".
									AstraSitesAdmin._log( astraSitesAdmin.log.importXMLSuccess );
									AstraSitesAdmin._log( '----- SSE - XML import Complete -----' );

									document.getElementById( 'astra-site-import-process' ).value = 100;

									
									$('.button-hero.astra-demo-import').text( astraSitesAdmin.log.importingXML + ' (100%)' );

									$('#astra-site-import-process-wrap').hide();

									$(document).trigger( 'astra-sites-import-xml-done' );

									break;
							}
						};
						evtSource.addEventListener( 'log', function ( message ) {
							var data = JSON.parse( message.data );
							AstraSitesAdmin._log( data.level + ' ' + data.message );
						});
					}
				});
			} else {
				$(document).trigger( 'astra-sites-import-xml-done' );
			}

			
		},

		_is_process_xml: function() {
			if ( $( '.astra-sites-import-xml' ).find('.checkbox').is(':checked') ) {
				return true;
			}
			return false;
		},

		_is_process_customizer: function() {
			if ( $( '.astra-sites-import-customizer' ).find('.checkbox').is(':checked') ) {
				return true;
			}
			return false;
		},

		_is_process_widgets: function() {
			if ( $( '.astra-sites-import-widgets' ).find('.checkbox').is(':checked') ) {
				return true;
			}
			return false;
		},

		/**
		 * 1. Import WPForms Options.
		 */
		_importWPForms: function( event ) {
			if ( AstraSitesAdmin._is_process_customizer() ) {
				$.ajax({
					url  : astraSitesAdmin.ajaxurl,
					type : 'POST',
					dataType: 'json',
					data : {
						action      : 'astra-sites-import-wpforms',
						wpforms_url : AstraSitesAdmin.wpforms_url,
					},
					beforeSend: function() {
						AstraSitesAdmin._log( astraSitesAdmin.log.importWPForms );
						$('.button-hero.astra-demo-import').text( astraSitesAdmin.log.importingWPForms );
					},
				})
				.fail(function( jqXHR ){
					AstraSitesAdmin._importFailMessage( jqXHR.status + ' ' + jqXHR.responseText );
					AstraSitesAdmin._log( jqXHR.status + ' ' + jqXHR.responseText );
			    })
				.done(function ( forms ) {

					// 1. Fail - Import WPForms Options.
					if( false === forms.success ) {
						AstraSitesAdmin._importFailMessage( forms.data );
						AstraSitesAdmin._log( forms.data );
					} else {

						// 1. Pass - Import Customizer Options.
						AstraSitesAdmin._log( astraSitesAdmin.log.importWPFormsSuccess );

						$(document).trigger( 'astra-sites-import-wpforms-done' );
					}
				});
			} else {
				$(document).trigger( 'astra-sites-import-wpforms-done' );				
			}
		},

		/**
		 * 1. Import Customizer Options.
		 */
		_importCustomizerSettings: function( event ) {
			if ( AstraSitesAdmin._is_process_customizer() ) {
				$.ajax({
					url  : astraSitesAdmin.ajaxurl,
					type : 'POST',
					dataType: 'json',
					data : {
						action          : 'astra-sites-import-customizer-settings',
						customizer_data : AstraSitesAdmin.customizer_data,
					},
					beforeSend: function() {
						AstraSitesAdmin._log( astraSitesAdmin.log.importCustomizer );
						$('.button-hero.astra-demo-import').text( astraSitesAdmin.log.importingCustomizer );
					},
				})
				.fail(function( jqXHR ){
					AstraSitesAdmin._importFailMessage( jqXHR.status + ' ' + jqXHR.responseText );
					AstraSitesAdmin._log( jqXHR.status + ' ' + jqXHR.responseText );
			    })
				.done(function ( customizer_data ) {

					// 1. Fail - Import Customizer Options.
					if( false === customizer_data.success ) {
						AstraSitesAdmin._importFailMessage( customizer_data.data );
						AstraSitesAdmin._log( customizer_data.data );
					} else {

						// 1. Pass - Import Customizer Options.
						AstraSitesAdmin._log( astraSitesAdmin.log.importCustomizerSuccess );

						$(document).trigger( 'astra-sites-import-customizer-settings-done' );
					}
				});
			} else {
				$(document).trigger( 'astra-sites-import-customizer-settings-done' );
			}

		},

		/**
		 * Import Success Button.
		 * 
		 * @param  {string} data Error message.
		 */
		_importSuccessMessage: function() {

			$('.astra-demo-import').removeClass('updating-message installing')
				.removeAttr('data-import')
				.addClass('view-site')
				.removeClass('astra-demo-import')
				.text( astraSitesAdmin.strings.viewSite )
				.attr('target', '_blank')
				.append('<i class="dashicons dashicons-external"></i>')
				.attr('href', astraSitesAdmin.siteURL );
		},

		/**
		 * Preview Device
		 */
		_previewDevice: function( event ) {
			var device = $( event.currentTarget ).data( 'device' );

			$('.theme-install-overlay')
				.removeClass( 'preview-desktop preview-tablet preview-mobile' )
				.addClass( 'preview-' + device )
				.data( 'current-preview-device', device );

			AstraSitesAdmin._tooglePreviewDeviceButtons( device );
		},

		/**
		 * Toggle Preview Buttons
		 */
		_tooglePreviewDeviceButtons: function( newDevice ) {
			var $devices = $( '.wp-full-overlay-footer .devices' );

			$devices.find( 'button' )
				.removeClass( 'active' )
				.attr( 'aria-pressed', false );

			$devices.find( 'button.preview-' + newDevice )
				.addClass( 'active' )
				.attr( 'aria-pressed', true );
		},

		/**
		 * Import Error Button.
		 * 
		 * @param  {string} data Error message.
		 */
		_importFailMessage: function( message, from ) {

			$('.astra-demo-import')
				.addClass('go-pro button-primary')
				.removeClass('updating-message installing')
				.removeAttr('data-import')
				.attr('target', '_blank')
				.append('<i class="dashicons dashicons-external"></i>')
				.removeClass('astra-demo-import');

			// Add the doc link due to import log file not generated.
			if( 'undefined' === from ) {

				$('.wp-full-overlay-header .go-pro').text( astraSitesAdmin.strings.importFailedBtnSmall );
				$('.wp-full-overlay-footer .go-pro').text( astraSitesAdmin.strings.importFailedBtnLarge );
				$('.go-pro').attr('href', astraSitesAdmin.log.serverConfiguration );

			// Add the import log file link.
			} else {
				
				$('.wp-full-overlay-header .go-pro').text( astraSitesAdmin.strings.importFailBtn );
				$('.wp-full-overlay-footer .go-pro').text( astraSitesAdmin.strings.importFailBtnLarge )
				
				// Add the import log file link.
				if( 'undefined' !== AstraSitesAdmin.log_file_url ) {
					$('.go-pro').attr('href', AstraSitesAdmin.log_file_url );
				} else {
					$('.go-pro').attr('href', astraSitesAdmin.log.serverConfiguration );
				}
			}

			var output  = '<div class="astra-api-error notice notice-error notice-alt is-dismissible">';
				output += '	<p>'+message+'</p>';
				output += '	<button type="button" class="notice-dismiss">';
				output += '		<span class="screen-reader-text">'+commonL10n.dismiss+'</span>';
				output += '	</button>';
				output += '</div>';

			// Fail Notice.
			$('.install-theme-info').append( output );
			

			// !important to add trigger.
			// Which reinitialize the dismiss error message events.
			$(document).trigger('wp-updates-notice-added');
		},


		/**
		 * Install Now
		 */
		_installNow: function(event)
		{
			event.preventDefault();

			var $button 	= jQuery( event.target ),
				$document   = jQuery(document);

			if ( $button.hasClass( 'updating-message' ) || $button.hasClass( 'button-disabled' ) ) {
				return;
			}

			if ( wp.updates.shouldRequestFilesystemCredentials && ! wp.updates.ajaxLocked ) {
				wp.updates.requestFilesystemCredentials( event );

				$document.on( 'credential-modal-cancel', function() {
					var $message = $( '.install-now.updating-message' );

					$message
						.removeClass( 'updating-message' )
						.text( wp.updates.l10n.installNow );

					wp.a11y.speak( wp.updates.l10n.updateCancel, 'polite' );
				} );
			}

			AstraSitesAdmin._log( astraSitesAdmin.log.installingPlugin + ' ' + $button.data( 'slug' ) );

			wp.updates.installPlugin( {
				slug:    $button.data( 'slug' )
			} );
		},

		/**
		 * Install Success
		 */
		_installSuccess: function( event, response ) {

			event.preventDefault();

			AstraSitesAdmin._log( astraSitesAdmin.log.installed + ' ' + response.slug );

			var $siteOptions = $( '.wp-full-overlay-header').find('.astra-site-options').val();
			var $enabledExtensions = $( '.wp-full-overlay-header').find('.astra-enabled-extensions').val();

			// Transform the 'Install' button into an 'Activate' button.
			var $init = $( '.plugin-card-' + response.slug ).data('init');

			// Reset not installed plugins list.
			var pluginsList = astraSitesAdmin.requiredPlugins.notinstalled;
			astraSitesAdmin.requiredPlugins.notinstalled = AstraSitesAdmin._removePluginFromQueue( response.slug, pluginsList );

			// WordPress adds "Activate" button after waiting for 1000ms. So we will run our activation after that.
			setTimeout( function() {

				$.ajax({
					url: astraSitesAdmin.ajaxurl,
					type: 'POST',
					data: {
						'action'            : 'astra-required-plugin-activate',
						'init'              : $init,
						'options'           : $siteOptions,
						'enabledExtensions' : $enabledExtensions,
					},
				})
				.done(function (result) {

					if( result.success ) {

						var pluginsList = astraSitesAdmin.requiredPlugins.inactive;

						// Reset not installed plugins list.
						astraSitesAdmin.requiredPlugins.inactive = AstraSitesAdmin._removePluginFromQueue( response.slug, pluginsList );

						// Enable Demo Import Button
						AstraSitesAdmin._enable_demo_import_button();

					}
				});

			}, 1200 );

		},

		/**
		 * Plugin Installation Error.
		 */
		_installError: function( event, response ) {

			var $card = $( '.plugin-card-' + response.slug );

			AstraSitesAdmin._log( response.errorMessage + ' ' + response.slug );

			$card
				.removeClass( 'button-primary' )
				.addClass( 'disabled' )
				.html( wp.updates.l10n.installFailedShort );

			AstraSitesAdmin._importFailMessage( response.errorMessage );
		},

		/**
		 * Installing Plugin
		 */
		_pluginInstalling: function(event, args) {
			event.preventDefault();

			var $card = $( '.plugin-card-' + args.slug );

			AstraSitesAdmin._log( astraSitesAdmin.log.installingPlugin + ' ' + args.slug );

			$card.addClass('updating-message');

		},

		/**
		 * Render Demo Preview
		 */
		_activateNow: function( eventn ) {

			event.preventDefault();

			var $button = jQuery( event.target ),
				$init 	= $button.data( 'init' ),
				$slug 	= $button.data( 'slug' );

			if ( $button.hasClass( 'updating-message' ) || $button.hasClass( 'button-disabled' ) ) {
				return;
			}

			AstraSitesAdmin._log( astraSitesAdmin.log.activating + ' ' + $slug );

			$button.addClass('updating-message button-primary')
				.html( astraSitesAdmin.strings.btnActivating );

			var $siteOptions = jQuery( '.wp-full-overlay-header').find('.astra-site-options').val();
			var $enabledExtensions = jQuery( '.wp-full-overlay-header').find('.astra-enabled-extensions').val();

			$.ajax({
				url: astraSitesAdmin.ajaxurl,
				type: 'POST',
				data: {
					'action'            : 'astra-required-plugin-activate',
					'init'              : $init,
					'options'           : $siteOptions,
					'enabledExtensions' : $enabledExtensions,
				},
			})
			.done(function (result) {

				if( result.success ) {

					AstraSitesAdmin._log( astraSitesAdmin.log.activated + ' ' + $slug );

					var pluginsList = astraSitesAdmin.requiredPlugins.inactive;

					// Reset not installed plugins list.
					astraSitesAdmin.requiredPlugins.inactive = AstraSitesAdmin._removePluginFromQueue( $slug, pluginsList );

					$button.removeClass( 'button-primary install-now activate-now updating-message' )
						.attr('disabled', 'disabled')
						.addClass('disabled')
						.text( astraSitesAdmin.strings.btnActive );

					// Enable Demo Import Button
					AstraSitesAdmin._enable_demo_import_button();

				}

			})
			.fail(function () {
			});

		},

		/**
		 * Full Overlay
		 */
		_fullOverlay: function (event) {
			event.preventDefault();

			// Import process is started?
			// And Closing the window? Then showing the warning confirm message.
			if( $('body').hasClass('importing-site') && ! confirm( astraSitesAdmin.strings.warningBeforeCloseWindow ) ) {
				return;
			}

			$('body').removeClass('importing-site');
			$('.previous-theme, .next-theme').removeClass('disabled');
			$('.theme-install-overlay').css('display', 'none');
			$('.theme-install-overlay').remove();
			$('.theme-preview-on').removeClass('theme-preview-on');
			$('html').removeClass('astra-site-preview-on');
		},

		/**
		 * Bulk Plugin Active & Install
		 */
		_bulkPluginInstallActivate: function()
		{
			if( 0 === astraSitesAdmin.requiredPlugins.length ) {
				return;
			}

			var not_installed 	 = astraSitesAdmin.requiredPlugins.notinstalled || '';
			var activate_plugins = astraSitesAdmin.requiredPlugins.inactive || '';

			// First Install Bulk.
			if( not_installed.length > 0 ) {
				AstraSitesAdmin._installAllPlugins( not_installed );
			}

			// Second Activate Bulk.
			if( activate_plugins.length > 0 ) {
				AstraSitesAdmin._activateAllPlugins( activate_plugins );
			}

			if( activate_plugins.length <= 0 && not_installed.length <= 0 ) {
				AstraSitesAdmin._enable_demo_import_button();
			}

		},

		/**
		 * Activate All Plugins.
		 */
		_activateAllPlugins: function( activate_plugins ) {

			AstraSitesAdmin._log( astraSitesAdmin.log.bulkActivation );

			$.each( activate_plugins, function(index, single_plugin) {

				var $card    	 = $( '.plugin-card-' + single_plugin.slug ),
					$siteOptions = $( '.wp-full-overlay-header').find('.astra-site-options').val(),
					$enabledExtensions = $( '.wp-full-overlay-header').find('.astra-enabled-extensions').val();

				AstraSitesAjaxQueue.add({
					url: astraSitesAdmin.ajaxurl,
					type: 'POST',
					data: {
						'action'            : 'astra-required-plugin-activate',
						'init'              : single_plugin.init,
						'options'           : $siteOptions,
						'enabledExtensions' : $enabledExtensions,
					},
					success: function( result ){

						if( result.success ) {

							AstraSitesAdmin._log( astraSitesAdmin.log.activate + ' ' + single_plugin.slug );

							var pluginsList = astraSitesAdmin.requiredPlugins.inactive;

							// Reset not installed plugins list.
							astraSitesAdmin.requiredPlugins.inactive = AstraSitesAdmin._removePluginFromQueue( single_plugin.slug, pluginsList );

							// Enable Demo Import Button
							AstraSitesAdmin._enable_demo_import_button();
						} else {
							AstraSitesAdmin._log( astraSitesAdmin.log.activationError + ' - ' + single_plugin.slug );
						}
					}
				});
			});
			AstraSitesAjaxQueue.run();
		},

		/**
		 * Install All Plugins.
		 */
		_installAllPlugins: function( not_installed ) {

			AstraSitesAdmin._log( astraSitesAdmin.log.bulkInstall );
			
			$.each( not_installed, function(index, single_plugin) {

				var $card = $( '.plugin-card-' + single_plugin.slug );

				// Add each plugin activate request in Ajax queue.
				// @see wp-admin/js/updates.js
				wp.updates.queue.push( {
					action: 'install-plugin', // Required action.
					data:   {
						slug: single_plugin.slug
					}
				} );
			});

			// Required to set queue.
			wp.updates.queueChecker();
		},

		/**
		 * Fires when a nav item is clicked.
		 *
		 * @since 1.0
		 * @access private
		 * @method _importDemo
		 */
		_importDemo: function(event) {
			event.preventDefault();

			var disabled = $(this).attr('data-import');

			if ( typeof disabled !== 'undefined' && disabled === 'disabled' || $this.hasClass('disabled') ) {

				$('.astra-demo-import').addClass('updating-message installing')
					.text( wp.updates.l10n.installing );

				/**
				 * Process Bulk Plugin Install & Activate
				 */
				AstraSitesAdmin._bulkPluginInstallActivate();
			}
		},

		_process_import() {

			var $theme  = $('.astra-sites-preview').find('.wp-full-overlay-header'),
				apiURL  = $theme.data('demo-api') || '';

			$('body').addClass('importing-site');
			$('.previous-theme, .next-theme').addClass('disabled');

			// Remove all notices before import start.
			$('.install-theme-info > .notice').remove();

			$('.astra-demo-import').attr('data-import', 'disabled')
				.addClass('updating-message installing')
				.text( astraSitesAdmin.strings.importingDemo );
		
			// Site Import by API URL.
			if( apiURL ) {
				AstraSitesAdmin._importSite( apiURL );
			}

		},

		/**
		 * Start Import Process by API URL.
		 * 
		 * @param  {string} apiURL Site API URL.
		 */
		_importSite: function( apiURL ) {

			AstraSitesAdmin._log( astraSitesAdmin.log.api + ' : ' + apiURL );
			AstraSitesAdmin._log( astraSitesAdmin.log.importing );

			$('.button-hero.astra-demo-import').text( astraSitesAdmin.log.gettingData );

			// 1. Request Site Import
			$.ajax({
				url  : astraSitesAdmin.ajaxurl,
				type : 'POST',
				dataType: 'json',
				data : {
					'action'  : 'astra-sites-import-set-site-data',
					'api_url' : apiURL,
				},
			})
			.fail(function( jqXHR ){
				AstraSitesAdmin._importFailMessage( jqXHR.status + ' ' + jqXHR.responseText + ' ' + jqXHR.statusText );
				AstraSitesAdmin._log( jqXHR.status + ' ' + jqXHR.responseText + ' ' + jqXHR.statusText );
		    })
			.done(function ( demo_data ) {

				// 1. Fail - Request Site Import
				if( false === demo_data.success ) {

					AstraSitesAdmin._importFailMessage( demo_data.data );

				} else {

					// Set log file URL.
					if( 'log_file' in demo_data.data ){
						AstraSitesAdmin.log_file_url  = decodeURIComponent( demo_data.data.log_file ) || '';
					}

					// 1. Pass - Request Site Import
					AstraSitesAdmin._log( astraSitesAdmin.log.processingRequest );

					AstraSitesAdmin.customizer_data = JSON.stringify( demo_data.data['astra-site-customizer-data'] ) || '';
					AstraSitesAdmin.wxr_url         = encodeURI( demo_data.data['astra-site-wxr-path'] ) || '';
					AstraSitesAdmin.wpforms_url     = encodeURI( demo_data.data['astra-site-wpforms-path'] ) || '';
					AstraSitesAdmin.options_data    = JSON.stringify( demo_data.data['astra-site-options-data'] ) || '';
					AstraSitesAdmin.widgets_data    = JSON.stringify( demo_data.data['astra-site-widgets-data'] ) || '';

					$(document).trigger( 'astra-sites-import-set-site-data-done' );
				}
			
			});

		},

		/**
		 * Collapse Sidebar.
		 */
		_collapse: function() {
			event.preventDefault();

			overlay = jQuery('.wp-full-overlay');

			if (overlay.hasClass('expanded')) {
				overlay.removeClass('expanded');
				overlay.addClass('collapsed');
				return;
			}

			if (overlay.hasClass('collapsed')) {
				overlay.removeClass('collapsed');
				overlay.addClass('expanded');
				return;
			}
		},

		/**
		 * Previous Theme.
		 */
		_previousTheme: function (event) {
			event.preventDefault();

			currentDemo = jQuery('.theme-preview-on');
			currentDemo.removeClass('theme-preview-on');
			prevDemo = currentDemo.prev('.theme');
			prevDemo.addClass('theme-preview-on');

			var site_id = $(this).parents('.wp-full-overlay-header').data('demo-id') || '';

			if( AstraSitesAPI._stored_data ) {
				var site_data = AstraSitesAdmin._get_site_details( site_id );


				if( site_data ) {
					// Set current site details.
					AstraSitesAdmin.current_site = site_data;
				}
			}

			AstraSitesAdmin._renderDemoPreview(prevDemo);
		},

		/**
		 * Next Theme.
		 */
		_nextTheme: function (event) {
			event.preventDefault();
			currentDemo = jQuery('.theme-preview-on')
			currentDemo.removeClass('theme-preview-on');
			nextDemo = currentDemo.next('.theme');
			nextDemo.addClass('theme-preview-on');

			var site_id = $(this).parents('.wp-full-overlay-header').data('demo-id') || '';

			if( AstraSitesAPI._stored_data ) {
				var site_data = AstraSitesAdmin._get_site_details( site_id );



				if( site_data ) {
					// Set current site details.
					AstraSitesAdmin.current_site = site_data;
				}
			}

			AstraSitesAdmin._renderDemoPreview( nextDemo );
		},

		_set_current_screen: function( screen ) {
			AstraSitesAdmin.current_screen = screen;
			var old_screen = $('.astra-sites-preview').attr( 'screen' ) || '';


			if( old_screen ) {
				$('.astra-sites-preview').removeClass( 'screen-' + old_screen );
			}

			$('.astra-sites-preview').attr( 'screen', screen );
			$('.astra-sites-preview').addClass( 'screen-' + screen );
		},

		/**
		 * Individual Site Preview
		 *
		 * On click on image, more link & preview button.
		 */
		_preview: function( event ) {

			event.preventDefault();

			var site_id = $(this).parents('.site-single').data('demo-id') || '';

			if( AstraSitesAPI._stored_data ) {
				var site_data = AstraSitesAdmin._get_site_details( site_id );

				if( site_data ) {
					// Set current site details.
					AstraSitesAdmin.current_site = site_data;

					// Set current screen.
					AstraSitesAdmin._set_current_screen( 'get-started' );
				}
			}

			var self = $(this).parents('.theme');
			self.addClass('theme-preview-on');

			$('html').addClass('astra-site-preview-on');

			AstraSitesAdmin._renderDemoPreview( self );
		},

		_get_site_details: function( site_id ) {
			var all_sites = AstraSitesAPI._stored_data['astra-sites'] || [];

			if( ! all_sites ) {
				return false;
			}

			var single_site = all_sites.filter(function (site) { return site.id == site_id });
			if( ! single_site ) {
				return false;
			}

			if( ! $.isArray( single_site ) ) {
				return false;
			}

			return single_site[0];
		},

		/**
		 * Check Next Previous Buttons.
		 */
		_checkNextPrevButtons: function() {
			currentDemo = jQuery('.theme-preview-on');
			nextDemo = currentDemo.nextAll('.theme').length;
			prevDemo = currentDemo.prevAll('.theme').length;

			if (nextDemo == 0) {
				jQuery('.next-theme').addClass('disabled');
			} else if (nextDemo != 0) {
				jQuery('.next-theme').removeClass('disabled');
			}

			if (prevDemo == 0) {
				jQuery('.previous-theme').addClass('disabled');
			} else if (prevDemo != 0) {
				jQuery('.previous-theme').removeClass('disabled');
			}

			return;
		},

		/**
		 * Render Demo Preview
		 */
		_renderDemoPreview: function(anchor) {

			var demoId             	   = anchor.data('demo-id') || '',
				apiURL                 = anchor.data('demo-api') || '',
				demoType               = anchor.data('demo-type') || '',
				demoURL                = anchor.data('demo-url') || '',
				screenshot             = anchor.data('screenshot') || '',
				demo_name              = anchor.data('demo-name') || '',
				demo_slug              = anchor.data('demo-slug') || '',
				content                = anchor.data('content') || '',
				requiredPlugins        = anchor.data('required-plugins') || '',
				astraSiteOptions       = anchor.find('.astra-site-options').val() || '';
				astraEnabledExtensions = anchor.find('.astra-enabled-extensions').val() || '';

			AstraSitesAdmin._log( astraSitesAdmin.log.preview + ' "' + demo_name + '" URL : ' + demoURL );


			var template = wp.template('astra-site-preview');

			templateData = [{
				id                       : demoId,
				astra_demo_type          : demoType,
				astra_demo_url           : demoURL,
				demo_api                 : apiURL,
				screenshot               : screenshot,
				demo_name                : demo_name,
				slug                     : demo_slug,
				content                  : content,
				required_plugins         : JSON.stringify(requiredPlugins),
				astra_site_options       : astraSiteOptions,
				astra_enabled_extensions : astraEnabledExtensions,
			}];

			// return;

			// delete any earlier fullscreen preview before we render new one.
			$('.theme-install-overlay').remove();

			$('#astra-sites-menu-page').append(template(templateData[0]));
			$('.theme-install-overlay').css('display', 'block');
			AstraSitesAdmin._checkNextPrevButtons();

			var desc       = $('.theme-details');
			var descHeight = parseInt( desc.outerHeight() );
			var descBtn    = $('.theme-details-read-more');

			// Check is site imported recently and set flag.
			$.ajax({
				url  : astraSitesAdmin.ajaxurl,
				type : 'POST',
				data : {
					action : 'astra-sites-set-reset-data',
				},
			})
			.done(function ( response ) {
				AstraSitesAdmin._log( response );
				if( response.success ) {
					AstraSitesAdmin.site_imported_data = response.data;
				}
			});

			if( $.isArray( requiredPlugins ) ) {

				if( descHeight >= 55 ) {

					// Show button.
					descBtn.css( 'display', 'inline-block' );

					// Set height upto 3 line.
					desc.css( 'height', 57 );

					// Button Click.
					descBtn.click(function(event) {

						if( descBtn.hasClass('open') ) {
							desc.animate({ height: 57 },
								300, function() {
								descBtn.removeClass('open');
								descBtn.html( astraSitesAdmin.strings.DescExpand );
							});
						} else {
							desc.animate({ height: descHeight },
								300, function() {
								descBtn.addClass('open');
								descBtn.html( astraSitesAdmin.strings.DescCollapse );
							});
						}

					});
				}

				// or
				var $pluginsFilter  = $( '#plugin-filter' ),
					data 			= {
										action           : 'astra-required-plugins',
										_ajax_nonce      : astraSitesAdmin._ajax_nonce,
										required_plugins : requiredPlugins
									};

				// Add disabled class from import button.
				$('.astra-demo-import')
					.addClass('disabled not-click-able')
					.removeAttr('data-import');

				$('.required-plugins').addClass('loading').html('<span class="spinner is-active"></span>');

			 	// Required Required.
				$.ajax({
					url  : astraSitesAdmin.ajaxurl,
					type : 'POST',
					data : data,
				})
				.fail(function( jqXHR ){

					// Remove loader.
					$('.required-plugins').removeClass('loading').html('');

					AstraSitesAdmin._importFailMessage( jqXHR.status + ' ' + jqXHR.responseText, 'plugins' );
					AstraSitesAdmin._log( jqXHR.status + ' ' + jqXHR.responseText );
				})
				.done(function ( response ) {


					// Release disabled class from import button.
					$('.astra-demo-import')
						.removeClass('disabled not-click-able')
						.attr('data-import', 'disabled');

					// Remove loader.
					$('.required-plugins').removeClass('loading').html('');
					$('.required-plugins-list').html('');

					/**
					 * Count remaining plugins.
					 * @type number
					 */
					var remaining_plugins = 0;

					/**
					 * Not Installed
					 *
					 * List of not installed required plugins.
					 */
					if ( typeof response.data.notinstalled !== 'undefined' ) {

						// Add not have installed plugins count.
						remaining_plugins += parseInt( response.data.notinstalled.length );

						$( response.data.notinstalled ).each(function( index, plugin ) {
							$('.required-plugins-list').append('<li class="plugin-card plugin-card-'+plugin.slug+'" data-slug="'+plugin.slug+'" data-init="'+plugin.init+'">'+plugin.name+'</li>');
						});
					}

					/**
					 * Inactive
					 *
					 * List of not inactive required plugins.
					 */
					if ( typeof response.data.inactive !== 'undefined' ) {

						// Add inactive plugins count.
						remaining_plugins += parseInt( response.data.inactive.length );

						$( response.data.inactive ).each(function( index, plugin ) {
							$('.required-plugins-list').append('<li class="plugin-card plugin-card-'+plugin.slug+'" data-slug="'+plugin.slug+'" data-init="'+plugin.init+'">'+plugin.name+'</li>');
						});
					}

					/**
					 * Active
					 *
					 * List of not active required plugins.
					 */
					if ( typeof response.data.active !== 'undefined' ) {

						$( response.data.active ).each(function( index, plugin ) {
							$('.required-plugins-list').append('<li class="plugin-card plugin-card-'+plugin.slug+'" data-slug="'+plugin.slug+'" data-init="'+plugin.init+'">'+plugin.name+'</li>');
						});
					}

					/**
					 * Enable Demo Import Button
					 * @type number
					 */
					astraSitesAdmin.requiredPlugins = response.data;
				});

			} else {

				// Enable Demo Import Button
				AstraSitesAdmin._enable_demo_import_button( demoType );
				$('.astra-sites-advanced-options-wrap').remove();
			}

			return;
		},

		/**
		 * Enable Demo Import Button.
		 */
		_enable_demo_import_button: function( type ) {

			type = ( undefined !== type ) ? type : 'free';

			$('.install-theme-info .theme-details .site-description').remove();

			switch( type ) {

				case 'free':

							var notinstalled = astraSitesAdmin.requiredPlugins.notinstalled || 0;
							var inactive     = astraSitesAdmin.requiredPlugins.inactive || 0;

							if( notinstalled.length === inactive.length ) {

								// XML reader not available notice.
								if( astraSitesAdmin.XMLReaderDisabled ) {
									if( ! $('.install-theme-info .astra-sites-xml-notice').length ) {
										$('.install-theme-info').prepend( astraSitesAdmin.strings.warningXMLReader );
									}
									$('.astra-demo-import')
										.removeClass('installing updating-message')
										.addClass('disabled')
										.text( astraSitesAdmin.strings.importDemo );	
								} else {
									$(document).trigger( 'astra-sites-install-and-activate-required-plugins-done' );
								}
							}
					break;

				case 'upgrade':
							var demo_slug = $('.wp-full-overlay-header').attr('data-demo-slug');

							$('.astra-demo-import')
									.addClass('go-pro button-primary')
									.removeClass('astra-demo-import')
									.attr('target', '_blank')
									.attr('href', astraSitesAdmin.getUpgradeURL + demo_slug )
									.text( astraSitesAdmin.getUpgradeText )
									.append('<i class="dashicons dashicons-external"></i>');
					break;

				default:
							var demo_slug = $('.wp-full-overlay-header').attr('data-demo-slug');

							$('.astra-demo-import')
									.addClass('go-pro button-primary')
									.removeClass('astra-demo-import')
									.attr('target', '_blank')
									.attr('href', astraSitesAdmin.getProURL )
									.text( astraSitesAdmin.getProText )
									.append('<i class="dashicons dashicons-external"></i>');

							$('.wp-full-overlay-header').find('.go-pro').remove();

							if( false == astraSitesAdmin.isWhiteLabeled ) {
								if( astraSitesAdmin.isPro ) {
									$('.install-theme-info .theme-details').prepend( wp.template('astra-sites-pro-inactive-site-description') );
								} else {
									$('.install-theme-info .theme-details').prepend( wp.template('astra-sites-pro-site-description') );
								}
							}

					break;
			}

		},

		/**
		 * Update Page Count.
		 */
		_updatedPagedCount: function() {
			paged = parseInt(jQuery('body').attr('data-astra-demo-paged'));
			jQuery('body').attr('data-astra-demo-paged', paged + 1);
			window.setTimeout(function () {
				jQuery('body').data('scrolling', false);
			}, 800);
		},

		/**
		 * Reset Page Count.
		 */
		_resetPagedCount: function() {

			$('body').addClass('loading-content');
			$('body').attr('data-astra-demo-last-request', '1');
			$('body').attr('data-astra-demo-paged', '1');
			$('body').attr('data-astra-demo-search', '');
			$('body').attr('data-scrolling', false);

		},

		/**
		 * Remove plugin from the queue.
		 */
		_removePluginFromQueue: function( removeItem, pluginsList ) {
			return jQuery.grep(pluginsList, function( value ) {
				return value.slug != removeItem;
			});
		}

	};

	/**
	 * Initialize AstraSitesAdmin
	 */
	$(function(){
		AstraSitesAdmin.init();
	});

})(jQuery);