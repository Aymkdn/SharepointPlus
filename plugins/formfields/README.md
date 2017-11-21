Formfields
============

You have to include SharepointPlus and the plugin (make sure you use the last version of SharepointPlus):
````html
<script type="text/javascript" src="sharepointplus-xxx.min.js"></script>
<script type="text/javascript" src="sp-plugin.formfields.js"></script>
````

You can now use it as described into the documentation. Example:
````html
<script type="text/javascript">
$SP().formfields('Title').val("test");
</script>
````
