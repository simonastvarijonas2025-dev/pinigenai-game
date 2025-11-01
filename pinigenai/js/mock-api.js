// Simple API endpoint to serve game content
function serveGameContent() {
    const urlParams = new URLSearchParams(window.location.search);
    const isApiRequest = window.location.pathname.includes('gameadmin/getcontent.php');
    
    if (isApiRequest) {
        // This would be handled by our mock server instead
        return;
    }
}

// Mock the PHP endpoint functionality
function mockGetContentAPI() {
    // Override jQuery AJAX for the specific endpoint
    const originalAjax = $.ajax;
    
    $.ajax = function(options) {
        if (options.url && options.url.includes('gameadmin/getcontent.php')) {
            console.log('Intercepting API call:', options.url);
            
            // Extract language and game from URL
            const urlParts = options.url.split('?')[1];
            const params = new URLSearchParams(urlParts);
            const language = params.get('lan') || 'lt';  // Default to Lithuanian
            const game = params.get('game') || 'intro';
            
            console.log('Loading content for:', game, 'language:', language);
            
            // Load the appropriate JSON file
            const jsonUrl = `gameadmin/${game}.json`;
            
            return originalAjax({
                type: 'GET',
                url: jsonUrl,
                dataType: 'json',
                success: function(data) {
                    console.log('Subtitles loaded successfully:', data);
                    if (options.done) options.done(data);
                    if (options.success) options.success(data);
                },
                error: function(xhr, status, error) {
                    console.error('Error loading subtitles:', error);
                    if (options.error) options.error(xhr, status, error);
                    if (options.fail) options.fail(xhr, status, error);
                }
            });
        } else {
            // Use original AJAX for other requests
            return originalAjax.apply(this, arguments);
        }
    };
}

// Initialize the mock API when the page loads
$(document).ready(function() {
    mockGetContentAPI();
});