SharepointPlus Unit Tests
=========================

To run the qunit tests, you need:

  1. Create a Sharepoint list called `SharepointPlus`
  2. Create a group called `SharepointPlus` and add yourself into this group
  3. Make sure there is a field called `Title` and that is required
  4. Open the NewForm into a new window
  5. Edit the page to add a `"Media and Content" > "Content Editor"` webpart
  6. Edit the webpart HTML source
  7. Copy and adapt the code below:

    ```html
        <script src="/folder/to/jquery-x.xx.x.min.js"></script>
        <script src="/folder/to/sharepointplus-x.x.min.js"></script>
        <script>
        jQuery(document).ready(function() {
          var css = document.createElement('link');
          css.rel = "stylesheet";
          css.type = "text/css";
          css.href = "http://code.jquery.com/qunit/qunit-1.20.0.css";
          document.getElementsByTagName('head')[0].appendChild(css);
          $('body').prepend('<h1 id="qunit-header">QUnit example</h1><h2 id="qunit-banner"></h2><div id="qunit-testrunner-toolbar"></div><h2 id="qunit-userAgent"></h2><ol id="qunit-tests"></ol> <div id="qunit-fixture">test markup, will be hidden</div>');
          var script = document.createElement( 'script' );
          script.type = 'text/javascript';
          script.src = "http://code.jquery.com/qunit/qunit-1.20.0.js";
          $("body").append( script );
          script = document.createElement( 'script' );
          script.type = 'text/javascript';
          script.src = "/services/Educate/Toolbox/Documents/js/SharepointPlus/qunit/qunit-tests.js";
          $("body").append( script );
        });
        </script>
    ```

  8. Save the page
  9. Re-open `NewForm.aspx` and watch at the top of the page the different tests
